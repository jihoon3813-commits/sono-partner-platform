"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application } from "@/lib/types";

interface LifeJoyExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    applications: Application[];
    onSuccess?: () => void;
}

interface ExistingCustomer {
    name: string;
    phone: string;
    sheet: string;
    no: number;
}

interface ChannelMappingItem {
    partnerId: string;
    partnerName: string;
    excelChannelName: string;
    memo?: string;
}

export default function LifeJoyExportModal({
    isOpen,
    onClose,
    applications,
    onSuccess,
}: LifeJoyExportModalProps) {
    const channelSetting = useQuery(api.settings.getSetting, { key: "lifejoy_channel_mappings" });
    const dbMappings: ChannelMappingItem[] = (() => {
        if (channelSetting && channelSetting.value) {
            try {
                const parsed = JSON.parse(channelSetting.value);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    })();

    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [latestFileName, setLatestFileName] = useState("");
    const [outputFileName, setOutputFileName] = useState("");
    const [sellerName, setSellerName] = useState("김지훈");
    const [existingList, setExistingList] = useState<ExistingCustomer[]>([]);
    
    // 선택된 application No 목록
    const [selectedAppNos, setSelectedAppNos] = useState<string[]>([]);
    // 고객별 채널 오버라이드
    const [customChannels, setCustomChannels] = useState<{ [appNo: string]: string }>({});

    // 채널 자동 판별 헬퍼 (환경설정 매핑 최우선 반영)
    const getDefaultChannel = (app: Application) => {
        const partnerId = String(app.partnerId || "").trim();
        const partnerName = String(app.partnerName || "").trim();

        // 1. 환경설정(DB)에 저장된 매핑 규칙 확인
        if (dbMappings && Array.isArray(dbMappings)) {
            const matched = dbMappings.find((m: ChannelMappingItem) => {
                if (!m) return false;
                const mId = String(m.partnerId || "").trim().toLowerCase();
                const mName = String(m.partnerName || "").trim().toLowerCase();
                const pId = partnerId.toLowerCase();
                const pName = partnerName.toLowerCase();

                return (
                    (mId && (mId === pId || pId.includes(mId))) ||
                    (mName && (mName === pName || pName.includes(mName)))
                );
            });

            if (matched && matched.excelChannelName) {
                return matched.excelChannelName;
            }
        }

        // 2. 기본 내장 Fallback 규칙
        const lowerId = partnerId.toLowerCase();
        if (lowerId === "dlwodyd007" || partnerName.includes("직영") || partnerName.includes("이재용")) {
            return "라이프앤조이_직영";
        }
        if (lowerId === "neora" || partnerName.includes("베스트원") || partnerName.includes("프리미엄") || partnerName.includes("니오라")) {
            return "라이프앤조이_프리미엄몰";
        }
        if (lowerId === "deaee" || partnerName.includes("딜애")) {
            return "라이프앤조이_딜애";
        }
        if (partnerName) {
            return `라이프앤조이_${partnerName.replace(/\s+/g, "")}`;
        }
        return "라이프앤조이_직영";
    };

    // 상품 종류에 따른 대상 시트 판정 (더해피 450 -> 450시트, 스마트케어 -> 결합시트)
    const getSheetType = (app: Application): "450" | "combined" => {
        const prodType = String(app.productType || "").toLowerCase().trim();
        if (
            prodType.includes("smart") || 
            prodType.includes("스마트") || 
            prodType.includes("결합")
        ) {
            return "combined";
        }
        if (
            prodType.includes("450") || 
            prodType.includes("해피") || 
            prodType.includes("happy")
        ) {
            return "450";
        }
        if (app.products && String(app.products).trim() !== "") {
            return "combined";
        }
        return "450";
    };

    // 과거 등록 고객 판정: 2026년 8월 31일 이전 및 레거시 데이터는 모두 '반영완료'로 처리
    // (2026년 9월 1일 이후 및 앞으로 등록되는 신규 고객만 미등록 대조 대상)
    const isPastRegisteredCustomer = (app: Application) => {
        // 등록일(registrationDate) 또는 생성일(createdAt) 추출
        const rawDate = String(app.registrationDate || app.createdAt || "").trim();

        // 날짜 없으면 과거 레거시 데이터로 간주
        if (!rawDate) return true;

        // 한글('월', '일')이 들어있거나 하이픈('-')이 없는 비정형 날짜(예: '9월18일', '11월 13일' 등)는 과거 데이터
        if (rawDate.includes("월") || rawDate.includes("일") || !rawDate.includes("-")) {
            return true;
        }

        // YYYY-MM-DD 정규식 매칭
        const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (!match) {
            return true; // 정규식 불일치 시 안전하게 과거 데이터로 처리
        }

        const yyyy = match[1];
        const mm = match[2];
        const dd = match[3];
        const ymd = `${yyyy}-${mm}-${dd}`;
        
        // 09월 리스트는 26년 기준: 2024년, 2025년 및 2026년 8월 이전은 모두 반영완료로 처리
        // 오직 2026년 9월 1일 이후 등록 고객만 신규 미반영 대조 대상
        if (yyyy < "2026") return true;
        return ymd < "2026-09-01";
    };

    // 이미 등록된 고객인지 확인 (과거 등록 고객은 모두 반영완료로 처리)
    const isAlreadyInExcel = (app: Application) => {
        // 1. 과거 등록 고객은 미반영 없고 모두 반영으로 처리
        if (isPastRegisteredCustomer(app)) {
            return true;
        }

        // 2. 최신 2개 및 앞으로 등록하는 신규 고객만 엑셀 대조
        const cleanPhone = String(app.customerPhone || "").replace(/[^\d]/g, "");
        const key = `${String(app.customerName || "").trim()}_${cleanPhone}`;
        return existingList.some(c => `${c.name}_${c.phone}` === key);
    };

    // 모달 열릴 때 최신 엑셀 정보 로드
    useEffect(() => {
        if (!isOpen) return;

        async function fetchInfo() {
            setIsLoadingInfo(true);
            try {
                const res = await fetch("/api/admin/excel/export-lifejoy");
                const data = await res.json();
                if (data.success) {
                    setLatestFileName(data.latestFileName || "");
                    setOutputFileName(data.suggestedFileName || "");
                    setExistingList(data.existingCustomers || []);

                    // 이미 엑셀에 없는 신규 고객들을 자동 선택
                    const existingSet = new Set(
                        (data.existingCustomers || []).map((c: ExistingCustomer) => `${c.name}_${c.phone}`)
                    );

                    const newAppNos: string[] = [];
                    const channelMap: { [appNo: string]: string } = {};

                    applications.forEach(app => {
                        const cleanPhone = String(app.customerPhone || "").replace(/[^\d]/g, "");
                        const key = `${String(app.customerName || "").trim()}_${cleanPhone}`;
                        channelMap[app.applicationNo] = getDefaultChannel(app);

                        // 과거 고객은 제외, 최신 미반영 고객만 자동 선택
                        if (!isPastRegisteredCustomer(app) && !existingSet.has(key)) {
                            newAppNos.push(app.applicationNo);
                        }
                    });

                    setSelectedAppNos(newAppNos);
                    setCustomChannels(channelMap);
                }
            } catch (err) {
                console.error("Failed to load excel info:", err);
            } finally {
                setIsLoadingInfo(false);
            }
        }

        fetchInfo();
    }, [isOpen, applications, channelSetting]);

    if (!isOpen) return null;

    // 체크박스 토글
    const handleToggleSelect = (appNo: string) => {
        if (selectedAppNos.includes(appNo)) {
            setSelectedAppNos(selectedAppNos.filter(no => no !== appNo));
        } else {
            setSelectedAppNos([...selectedAppNos, appNo]);
        }
    };

    // 전체 선택 / 해제
    const handleToggleAll = () => {
        if (selectedAppNos.length === applications.length) {
            setSelectedAppNos([]);
        } else {
            setSelectedAppNos(applications.map(a => a.applicationNo));
        }
    };

    // 미반영 신규 고객만 전체 선택
    const handleSelectOnlyNew = () => {
        const newAppNos = applications
            .filter(app => !isAlreadyInExcel(app))
            .map(app => app.applicationNo);
        setSelectedAppNos(newAppNos);
    };

    // 다운로드 실행
    const handleExport = async () => {
        if (selectedAppNos.length === 0) {
            alert("추가할 고객을 1명 이상 선택해주세요.");
            return;
        }

        setIsExporting(true);
        try {
            const selectedApps = applications
                .filter(app => selectedAppNos.includes(app.applicationNo))
                .map(app => ({
                    ...app,
                    channel: customChannels[app.applicationNo] || getDefaultChannel(app),
                    seller: sellerName,
                }));

            const response = await fetch("/api/admin/excel/export-lifejoy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customers: selectedApps,
                    sellerName,
                    outputFileName,
                    saveToServer: true,
                    channelMappings: dbMappings || [],
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || "엑셀 생성 실패");
            }

            const addedCount = response.headers.get("X-Added-Count") || String(selectedApps.length);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = outputFileName || "라이프앤조이_가입요청.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);

            alert(`총 ${addedCount}건의 신규 고객 데이터가 엑셀에 성공적으로 추가되었으며, 파일이 다운로드되었습니다!\n(서버 hoon 폴더에도 안전하게 보관되었습니다)`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Export error:", err);
            alert(`오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    // 미반영 신규 고객이 테이블 위쪽에 오도록 정렬
    const sortedApplications = [...applications].sort((a, b) => {
        const aAlready = isAlreadyInExcel(a);
        const bAlready = isAlreadyInExcel(b);
        if (aAlready !== bAlready) {
            return aAlready ? 1 : -1;
        }
        return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    const newCustomerCount = applications.filter(a => !isAlreadyInExcel(a)).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                {/* 헤더 */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-7 py-6 text-white flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                                라이프앤조이 전용
                            </span>
                            <h2 className="text-xl font-bold tracking-tight">가입요청 엑셀 자동 업데이트 & 다운로드</h2>
                        </div>
                        <p className="text-emerald-100 text-xs mt-1.5 font-medium">
                            원본 엑셀 양식의 서식·폰트·테두리를 100% 보존하며 신규 등록 고객을 이어서 자동 추가합니다.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isLoadingInfo ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-bold text-gray-700">hoon 폴더의 엑셀 파일 분석 중...</p>
                        <p className="text-xs text-gray-400 mt-1">기존 입력된 고객과 새로운 고객을 대조하고 있습니다.</p>
                    </div>
                ) : (
                    <div className="p-7 space-y-6">
                        {/* 1. 파일 및 기본 정보 설정 박스 */}
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-4">
                            <div className="flex items-center justify-between text-xs pb-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-500">기존 기준 엑셀 파일:</span>
                                    <span className="font-mono bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-800 font-bold">
                                        {latestFileName || "hoon/라이프앤조이_더해피one_가입요청_260911_1.xlsx"}
                                    </span>
                                </div>
                                <div className="text-emerald-600 font-bold flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    미반영 신규 고객: {newCustomerCount}명 감지됨
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                        새로 생성/저장될 엑셀 파일명
                                    </label>
                                    <input
                                        type="text"
                                        value={outputFileName}
                                        onChange={(e) => setOutputFileName(e.target.value)}
                                        className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="라이프앤조이_더해피one_가입요청_YYMMDD_1.xlsx"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                        판매자명 (E열 기본 입력값)
                                    </label>
                                    <input
                                        type="text"
                                        value={sellerName}
                                        onChange={(e) => setSellerName(e.target.value)}
                                        className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="김지훈"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. 추가할 고객 선택 테이블 */}
                        <div>
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-gray-800">
                                        추가할 고객 선택 ({selectedAppNos.length}명 선택됨)
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                        (체크된 고객이 기존 엑셀 시트의 마지막 번호 뒤에 이어서 삽입됩니다)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectOnlyNew}
                                        className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                    >
                                        신규 건만 선택
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleToggleAll}
                                        className="text-[11px] font-bold px-2.5 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        전체 선택/해제
                                    </button>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead className="bg-gray-100 sticky top-0 z-10 border-b border-gray-200 text-gray-600 font-bold">
                                        <tr>
                                            <th className="p-3 w-10 text-center">선택</th>
                                            <th className="p-3 w-20 text-center">구분</th>
                                            <th className="p-3">고객명</th>
                                            <th className="p-3">연락처</th>
                                            <th className="p-3">상품명 / 구좌</th>
                                            <th className="p-3">신청일</th>
                                            <th className="p-3">판매채널</th>
                                            <th className="p-3">희망시간</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applications.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-gray-400">
                                                    등록된 고객 데이터가 없습니다.
                                                </td>
                                            </tr>
                                        ) : (
                                            sortedApplications.map((app) => {
                                                const already = isAlreadyInExcel(app);
                                                const isSelected = selectedAppNos.includes(app.applicationNo);
                                                const currentChannel = customChannels[app.applicationNo] || getDefaultChannel(app);

                                                return (
                                                    <tr
                                                        key={app.applicationNo}
                                                        className={`hover:bg-gray-50/80 transition-colors ${already ? "bg-gray-50/50" : ""}`}
                                                    >
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleSelect(app.applicationNo)}
                                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {already ? (
                                                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                                                    엑셀반영됨
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded animate-pulse">
                                                                    신규미반영
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 font-bold text-gray-800">
                                                            {app.customerName}
                                                        </td>
                                                        <td className="p-3 font-mono text-gray-600">
                                                            {app.customerPhone}
                                                        </td>
                                                         <td className="p-3">
                                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                                <span className="font-semibold text-gray-800">
                                                                    {app.productType || "더 해피 450 ONE"}
                                                                </span>
                                                                {getSheetType(app) === "combined" ? (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded border border-purple-200">
                                                                        결합(스마트케어)
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                                                        더해피450
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500">
                                                                {app.planType || "1구좌"}
                                                                {app.products ? ` (${app.products})` : ""}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-gray-500 font-mono text-[11px]">
                                                            {app.createdAt ? app.createdAt.slice(0, 10) : "-"}
                                                        </td>
                                                        <td className="p-3">
                                                            <input
                                                                type="text"
                                                                value={currentChannel}
                                                                onChange={(e) =>
                                                                    setCustomChannels({
                                                                        ...customChannels,
                                                                        [app.applicationNo]: e.target.value,
                                                                    })
                                                                }
                                                                className="px-2 py-1 text-xs border border-gray-200 rounded-lg w-36 font-medium focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-gray-500 text-[11px]">
                                                            {app.preferredContactTime || "무관"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 안내 문구 */}
                        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="space-y-1">
                                <p className="font-bold">가입요청 엑셀 업데이트 & 시트 안내</p>
                                <p className="text-emerald-800/80 leading-relaxed">
                                    • <strong>26년 09월 기준 적용</strong>: 24년/25년 및 26년 8월 이전 과거 데이터는 모두 반영완료 처리되어, <strong>26년 9월 이후 신규 미등록 고객(최신 2건) 및 향후 등록 고객만</strong> 자동 감지됩니다.
                                    <br />
                                    • <strong>B열 상태(요청중) 열 제외</strong>: 상태값 없이 고객 정보가 양식에 맞추어 정확하게 기재되며, B열을 삭제하더라도 각 항목 열이 자동 매핑됩니다.
                                    <br />
                                    • <strong>상품별 자동 시트 분기</strong>: <strong>더해피 450</strong> 상품은 <strong>'MM월 리스트_450'</strong> 시트, <strong>스마트케어</strong> 상품은 <strong>'MM월 리스트_결합'</strong> 시트로 분기되어 자동 입력됩니다.
                                    <br />
                                    • <strong>월 자동 전환</strong>: 10월 등 월이 바뀌면 엑셀 파일 내에 해당 월 시트(예: <strong>'10월 리스트_450'</strong>, <strong>'10월 리스트_결합'</strong>)가 자동으로 생성되어 1번부터 차례대로 반영됩니다.
                                    <br />
                                    • 기존 데이터는 그대로 유지되며, 나눔고딕 10pt 테두리 서식과 함께 이어서 삽입됩니다.
                                    <br />
                                    • 다운로드 후 개발폴더 <code className="font-bold bg-white/80 px-1 py-0.5 rounded text-emerald-900">hoon/</code> 폴더에도 최신 파일이 자동 보관됩니다.
                                </p>
                            </div>
                        </div>

                        {/* 하단 액션 버튼 */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isExporting}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
                            >
                                닫기
                            </button>
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={isExporting || selectedAppNos.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>엑셀 업데이트 및 다운로드 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>선택한 {selectedAppNos.length}명 엑셀 업데이트 & 다운로드</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
