"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application } from "@/lib/types";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

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
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [latestFileName, setLatestFileName] = useState("");
    const [outputFileName, setOutputFileName] = useState("");
    const [sellerName, setSellerName] = useState("김지훈");
    const [existingList, setExistingList] = useState<ExistingCustomer[]>([]);
    
    // 선택된 application No 목록
    const [selectedAppNos, setSelectedAppNos] = useState<string[]>([]);
    // 고객별 채널 오버라이드
    const [customChannels, setCustomChannels] = useState<{ [appNo: string]: string }>({});
    // 상태 필터: 기본 '접수대기' 건만 보기
    const [statusFilter, setStatusFilter] = useState<"pending" | "all">("pending");

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

    // 이미 등록된 고객인지 확인 (접수대기가 아니거나 과거 등록 고객은 모두 반영완료로 처리)
    const isAlreadyInExcel = (app: Application) => {
        // 0. 접수대기 상태가 아닌 고객은 엑셀 추가 대상이 아니므로 모두 반영완료 처리
        if (app.status !== "접수대기") {
            return true;
        }

        // 1. 과거 등록 고객은 미반영 없고 모두 반영으로 처리
        if (isPastRegisteredCustomer(app)) {
            return true;
        }

        // 2. 26년 9월 이후 및 앞으로 등록하는 접수대기 신규 고객만 엑셀 대조
        const cleanPhone = String(app.customerPhone || "").replace(/[^\d]/g, "");
        const key = `${String(app.customerName || "").trim()}_${cleanPhone}`;
        return existingList.some(c => `${c.name}_${c.phone}` === key);
    };

    // 모달 열릴 때 최신 엑셀 정보 로드
    const fetchInfo = useCallback(async () => {
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

                    // 접수대기 상태이면서 26년 9월 이후 미반영 고객만 자동 선택
                    if (app.status === "접수대기" && !isPastRegisteredCustomer(app) && !existingSet.has(key)) {
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
    }, [applications, dbMappings]);

    useEffect(() => {
        if (isOpen) {
            fetchInfo();
        }
    }, [isOpen, fetchInfo]);

    // 수정한 엑셀 파일 업로드/교체 핸들러
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".xlsx")) {
            alert(".xlsx 확장자의 엑셀 파일만 업로드할 수 있습니다.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/excel/export-lifejoy", {
                method: "PUT",
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                alert(`기준 엑셀 파일이 성공적으로 갱신되었습니다!\n파일명: ${data.fileName}`);
                await fetchInfo();
            } else {
                alert(`업로드 실패: ${data.error || "알 수 없는 오류"}`);
            }
        } catch (err: any) {
            alert(`업로드 중 오류 발생: ${err.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // 임시 캐시 파일 초기화 (Git 원본 기준 복원)
    const handleResetCache = async () => {
        if (!confirm("임시 생성된 엑셀 캐시를 정리하고 원본 엑셀 파일 기준으로 초기화하시겠습니까?")) {
            return;
        }

        try {
            const res = await fetch("/api/admin/excel/export-lifejoy", { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                alert("임시 캐시가 정리되었습니다. 원본 기준 엑셀로 다시 불러옵니다.");
                await fetchInfo();
            }
        } catch (err: any) {
            alert(`초기화 실패: ${err.message}`);
        }
    };

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
        const currentList = statusFilter === "pending"
            ? applications.filter(a => a.status === "접수대기")
            : applications;
        if (selectedAppNos.length === currentList.length) {
            setSelectedAppNos([]);
        } else {
            setSelectedAppNos(currentList.map(a => a.applicationNo));
        }
    };

    // 미반영 신규 고객만 전체 선택 (접수대기 건 기준)
    const handleSelectOnlyNew = () => {
        const newAppNos = applications
            .filter(app => app.status === "접수대기" && !isAlreadyInExcel(app))
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

    // 상태 필터에 따른 목록 (기본: '접수대기'만)
    const filteredApplications = applications.filter(app => {
        if (statusFilter === "pending") {
            return app.status === "접수대기";
        }
        return true;
    });

    // 미반영 신규 고객이 테이블 위쪽에 오도록 정렬
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        const aAlready = isAlreadyInExcel(a);
        const bAlready = isAlreadyInExcel(b);
        if (aAlready !== bAlready) {
            return aAlready ? 1 : -1;
        }
        return (b.createdAt || "").localeCompare(a.createdAt || "");
    });

    // 접수대기 상태이면서 엑셀 미반영인 신규 고객 수 계산
    const newCustomerCount = applications.filter(a => a.status === "접수대기" && !isAlreadyInExcel(a)).length;

    return (
        <AdminDrawer
            title="가입요청 엑셀 자동 업데이트 & 다운로드"
            subtitle="원본 엑셀 양식의 서식·폰트·테두리를 보존하며 신규 등록 고객을 이어서 자동 추가합니다."
            headerRight={<span className="adm-pill green">라이프앤조이 전용</span>}
            maxWidth="980px"
            zIndex={70}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isExporting}
                        className="adm-btn"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isExporting || isLoadingInfo || selectedAppNos.length === 0}
                        className="adm-btn primary"
                    >
                        {isExporting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>엑셀 업데이트 및 다운로드 중...</span>
                            </>
                        ) : (
                            <>
                                <AdminIcon name="download" />
                                <span>선택한 {selectedAppNos.length}명 엑셀 업데이트 &amp; 다운로드</span>
                            </>
                        )}
                    </button>
                </>
            }
        >
                {isLoadingInfo ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="w-9 h-9 border-[3px] border-[#295e52] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="font-bold text-[#263d36]">hoon 폴더의 엑셀 파일 분석 중...</p>
                        <p className="text-xs text-[#86918a] mt-1">기존 입력된 고객과 새로운 고객을 대조하고 있습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* 1. 파일 및 기본 정보 설정 박스 */}
                        <div className="adm-note-card space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs pb-3 border-b border-[#e6eae3]">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-[#6f7c6c]">기존 기준 엑셀 파일:</span>
                                    <span className="font-mono bg-white px-2.5 py-1 rounded-[6px] border border-[#dfe5d9] text-[#263d36] font-bold">
                                        {latestFileName || "hoon/라이프앤조이_더해피one_가입요청_260911_1.xlsx"}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".xlsx"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        disabled={isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="adm-btn small"
                                        title="다운로드 후 직접 수정한 엑셀 파일을 업로드하여 기준 파일로 설정합니다."
                                    >
                                        <AdminIcon name="upload" />
                                        <span>{isUploading ? "업로드 중..." : "수정 엑셀 업로드(교체)"}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetCache}
                                        className="adm-btn small danger"
                                        title="임시 캐시를 비우고 원본 파일로 초기화합니다."
                                    >
                                        초기화
                                    </button>
                                </div>
                                <span className="adm-pill green">
                                    접수대기 신규 고객: {newCustomerCount}명 감지됨
                                </span>
                            </div>

                            {/* 저장 위치 및 파일 수정 안내 */}
                            <div className="adm-section-note !mb-0">
                                <AdminIcon name="info" />
                                <div>
                                    <strong>저장 위치 및 수정 안내: </strong>
                                    <span>
                                        다운로드된 파일은 내 PC의 <strong>[다운로드(Downloads)]</strong> 폴더에 저장됩니다. 다운로드 후 엑셀에서 데이터를 직접 수정(행 삭제/수정 등)하셨다면 위의 <strong>[수정 엑셀 업로드(교체)]</strong> 버튼으로 올려주시면 다음 번에도 그 수정한 파일을 기준으로 이어서 작성됩니다.
                                    </span>
                                </div>
                            </div>

                            <div className="adm-field-grid">
                                <div className="adm-field">
                                    <label>새로 생성/저장될 엑셀 파일명</label>
                                    <input
                                        type="text"
                                        value={outputFileName}
                                        onChange={(e) => setOutputFileName(e.target.value)}
                                        className="adm-input !bg-white"
                                        placeholder="라이프앤조이_더해피one_가입요청_YYMMDD_1.xlsx"
                                    />
                                </div>
                                <div className="adm-field">
                                    <label>판매자명 (E열 기본 입력값)</label>
                                    <input
                                        type="text"
                                        value={sellerName}
                                        onChange={(e) => setSellerName(e.target.value)}
                                        className="adm-input !bg-white"
                                        placeholder="김지훈"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. 추가할 고객 선택 테이블 */}
                        <div className="adm-panel overflow-hidden">
                            <div className="adm-filter-bar justify-between">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs font-bold text-[#263d36]">
                                        추가할 고객 선택 (<strong className="text-[#295e52]">{selectedAppNos.length}</strong>명 선택됨)
                                    </span>
                                    <div className="adm-segmented">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("pending")}
                                            className={statusFilter === "pending" ? "active" : ""}
                                        >
                                            접수대기만 ({applications.filter(a => a.status === "접수대기").length}건)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter("all")}
                                            className={statusFilter === "all" ? "active" : ""}
                                        >
                                            전체 보기 ({applications.length}건)
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={handleSelectOnlyNew}
                                        className="adm-btn small sage"
                                    >
                                        신규 건만 선택
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleToggleAll}
                                        className="adm-btn small"
                                    >
                                        전체 선택/해제
                                    </button>
                                </div>
                            </div>

                            <div className="adm-table-scroll max-h-72 overflow-y-auto">
                                <table className="adm-table">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 text-center">선택</th>
                                            <th className="w-20 text-center">구분</th>
                                            <th className="w-20 text-center">상태</th>
                                            <th>고객명</th>
                                            <th>연락처</th>
                                            <th>상품명 / 구좌</th>
                                            <th>신청일</th>
                                            <th>판매채널</th>
                                            <th>희망시간</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApplications.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="py-10 text-center text-xs text-[#86918a]">
                                                    선택한 조건의 고객 데이터가 없습니다.
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
                                                        className={already ? "opacity-75" : ""}
                                                    >
                                                        <td className="text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleSelect(app.applicationNo)}
                                                                className="w-4 h-4 rounded cursor-pointer accent-[#295e52]"
                                                            />
                                                        </td>
                                                        <td className="text-center">
                                                            {already ? (
                                                                <span className="adm-pill gray">엑셀반영됨</span>
                                                            ) : (
                                                                <span className="adm-pill green">신규미반영</span>
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            <span
                                                                className={`adm-pill ${
                                                                    app.status === "접수대기" ? "orange" : "gray"
                                                                }`}
                                                            >
                                                                {app.status || "미지정"}
                                                            </span>
                                                        </td>
                                                        <td className="font-bold text-[#263d36]">
                                                            {app.customerName}
                                                        </td>
                                                        <td className="font-mono text-xs text-[#6b7768]">
                                                            {app.customerPhone}
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                                <span className="font-semibold text-xs text-[#263d36]">
                                                                    {app.productType || "더 해피 450 ONE"}
                                                                </span>
                                                                {getSheetType(app) === "combined" ? (
                                                                    <span className="adm-pill teal">결합(스마트케어)</span>
                                                                ) : (
                                                                    <span className="adm-pill green">더해피450</span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-[#86918a]">
                                                                {app.planType || "1구좌"}
                                                                {app.products ? ` (${app.products})` : ""}
                                                            </div>
                                                        </td>
                                                        <td className="text-[#86918a] font-mono text-[11px]">
                                                            {app.createdAt ? app.createdAt.slice(0, 10) : "-"}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={currentChannel}
                                                                onChange={(e) =>
                                                                    setCustomChannels({
                                                                        ...customChannels,
                                                                        [app.applicationNo]: e.target.value,
                                                                    })
                                                                }
                                                                className="adm-input !h-8 !py-1 !w-36"
                                                            />
                                                        </td>
                                                        <td className="text-[#86918a] text-[11px]">
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
                        <div className="adm-section-note !items-start">
                            <AdminIcon name="info" className="mt-0.5" />
                            <div className="space-y-1 text-xs">
                                <p className="font-bold text-[#263d36]">가입요청 엑셀 업데이트 &amp; 시트 안내</p>
                                <p className="text-[#5a6659] leading-relaxed">
                                    • <strong>26년 09월 기준 적용</strong>: 24년/25년 및 26년 8월 이전 과거 데이터는 모두 반영완료 처리되어, <strong>26년 9월 이후 신규 미등록 고객 및 향후 등록 고객만</strong> 자동 감지됩니다.
                                    <br />
                                    • <strong>상품별 자동 시트 분기</strong>: <strong>더해피 450</strong> 상품은 <strong>&apos;MM월 리스트_450&apos;</strong> 시트, <strong>스마트케어</strong> 상품은 <strong>&apos;MM월 리스트_결합&apos;</strong> 시트로 분기되어 자동 입력됩니다.
                                    <br />
                                    • 기존 데이터는 그대로 유지되며, 나눔고딕 10pt 테두리 서식과 함께 이어서 삽입됩니다.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
        </AdminDrawer>
    );
}
