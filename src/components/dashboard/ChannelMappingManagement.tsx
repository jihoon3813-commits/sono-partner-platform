"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Partner } from "@/lib/types";

interface ChannelMappingItem {
    partnerId: string;
    partnerName: string;
    excelChannelName: string;
    memo?: string;
    updatedAt?: string;
}

export default function ChannelMappingManagement() {
    const rawPartners = useQuery(api.partners.getAllPartners);
    const channelSetting = useQuery(api.settings.getSetting, { key: "lifejoy_channel_mappings" });
    const updateSetting = useMutation(api.settings.updateSetting);

    const [mappings, setMappings] = useState<ChannelMappingItem[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState("");
    const [inputChannelName, setInputChannelName] = useState("");
    const [inputMemo, setInputMemo] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // DB 데이터 로드 시 로컬 상태 동기화
    useEffect(() => {
        if (channelSetting && channelSetting.value) {
            try {
                const parsed = JSON.parse(channelSetting.value);
                if (Array.isArray(parsed)) {
                    setMappings(parsed);
                }
            } catch (e) {
                console.error("Failed to parse channel mappings:", e);
            }
        }
    }, [channelSetting]);

    // 파트너 목록 정제
    const partners: any[] = rawPartners || [];

    // 파트너 ID로 파트너 정보 찾기
    const findPartner = (pId: string) => {
        return partners.find(p => p.partnerId === pId || p.customUrl === pId || p.loginId === pId);
    };

    // 기본 추천 매핑명 생성 함수
    const getSuggestedName = (p: any) => {
        const id = (p.partnerId || "").toLowerCase();
        const customUrl = (p.customUrl || "").toLowerCase();
        const name = p.companyName || "";

        if (id === "dlwodyd007" || customUrl === "dlwodyd007" || name.includes("직영") || name.includes("이재용")) {
            return "라이프앤조이_직영";
        }
        if (id === "neora" || customUrl === "neora" || customUrl === "premiummall" || name.includes("베스트원") || name.includes("프리미엄") || name.includes("니오라")) {
            return "라이프앤조이_프리미엄몰";
        }
        if (id === "deaee" || customUrl === "deaee" || name.includes("딜애")) {
            return "라이프앤조이_딜애";
        }
        if (id === "lifenjoy" || customUrl === "lifenjoy") {
            return "라이프앤조이_본사";
        }
        return `라이프앤조이_${name.replace(/\s+/g, "")}`;
    };

    // 새 매핑 추가
    const handleAddMapping = () => {
        if (!selectedPartnerId) {
            alert("판매채널(파트너)을 선택해주세요.");
            return;
        }
        if (!inputChannelName.trim()) {
            alert("엑셀에 표기할 판매채널명을 입력해주세요.");
            return;
        }

        const partner = findPartner(selectedPartnerId);
        const partnerName = partner ? partner.companyName : selectedPartnerId;

        const existingIdx = mappings.findIndex(m => m.partnerId === selectedPartnerId);
        const newItem: ChannelMappingItem = {
            partnerId: selectedPartnerId,
            partnerName,
            excelChannelName: inputChannelName.trim(),
            memo: inputMemo.trim(),
            updatedAt: new Date().toISOString().slice(0, 10),
        };

        let updatedList: ChannelMappingItem[];
        if (existingIdx >= 0) {
            updatedList = [...mappings];
            updatedList[existingIdx] = newItem;
        } else {
            updatedList = [newItem, ...mappings];
        }

        setMappings(updatedList);
        setSelectedPartnerId("");
        setInputChannelName("");
        setInputMemo("");
    };

    // 파트너 선택 시 추천값 자동 입력
    const handlePartnerSelect = (pId: string) => {
        setSelectedPartnerId(pId);
        if (!pId) {
            setInputChannelName("");
            return;
        }
        const partner = findPartner(pId);
        if (partner) {
            const existing = mappings.find(m => m.partnerId === pId);
            if (existing) {
                setInputChannelName(existing.excelChannelName);
                setInputMemo(existing.memo || "");
            } else {
                setInputChannelName(getSuggestedName(partner));
                setInputMemo("");
            }
        }
    };

    // 인라인 채널명 수정
    const handleInlineChange = (partnerId: string, field: "excelChannelName" | "memo", value: string) => {
        setMappings(prev =>
            prev.map(m => (m.partnerId === partnerId ? { ...m, [field]: value } : m))
        );
    };

    // 매핑 삭제
    const handleDeleteMapping = (partnerId: string) => {
        if (confirm("해당 판매채널의 매핑 설정을 삭제하시겠습니까?")) {
            setMappings(prev => prev.filter(m => m.partnerId !== partnerId));
        }
    };

    // 전체 파트너 자동 채우기 프리셋
    const handleAutoFillAll = () => {
        if (!confirm("등록된 모든 파트너에 대해 기본 추천 채널명을 일괄 적용하시겠습니까?\n(기존 설정된 내용은 덮어쓰여집니다)")) {
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const newMappings: ChannelMappingItem[] = partners.map(p => {
            return {
                partnerId: p.partnerId || p.customUrl,
                partnerName: p.companyName,
                excelChannelName: getSuggestedName(p),
                memo: `자동 생성 (${p.customUrl})`,
                updatedAt: today,
            };
        });

        setMappings(newMappings);
    };

    // DB에 전체 저장
    const handleSaveToDb = async () => {
        setIsSaving(true);
        try {
            await updateSetting({
                key: "lifejoy_channel_mappings",
                value: JSON.stringify(mappings),
            });
            alert("판매채널 매핑 설정이 성공적으로 저장되었습니다!\n이제 가입요청 엑셀 업데이트 시 설정된 채널명이 자동으로 적용됩니다.");
        } catch (err: any) {
            console.error("Failed to save mappings:", err);
            alert(`저장 중 오류가 발생했습니다: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // 검색 필터링
    const filteredMappings = mappings.filter(m => {
        const term = searchTerm.toLowerCase();
        return (
            m.partnerName.toLowerCase().includes(term) ||
            m.partnerId.toLowerCase().includes(term) ||
            m.excelChannelName.toLowerCase().includes(term) ||
            (m.memo || "").toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* 상단 안내 배너 */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-7 text-white shadow-xl shadow-emerald-700/10">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>가입요청 엑셀 업데이트 연동</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">판매채널(엑셀 표기명) 매핑 설정</h2>
                        <p className="text-emerald-100 text-sm mt-2 max-w-2xl font-medium leading-relaxed">
                            신규 고객이 등록될 때, 해당 파트너(판매채널)가 가입요청 엑셀의 <strong>[판매채널] 컬럼(D열)</strong>에 어떤 명칭(예: <code className="bg-white/20 px-1.5 py-0.5 rounded font-bold">라이프앤조이_직영</code>, <code className="bg-white/20 px-1.5 py-0.5 rounded font-bold">라이프앤조이_프리미엄몰</code>)으로 기재될지 기준을 설정합니다.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAutoFillAll}
                            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold transition-all border border-white/20 whitespace-nowrap"
                        >
                            기본 추천값 자동채우기
                        </button>
                        <button
                            onClick={handleSaveToDb}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-lg shadow-black/10 active:scale-95 transition-all whitespace-nowrap"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    저장 중...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    설정 저장하기
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 신규 매핑 등록 폼 */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-sono-dark flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        새 판매채널 매핑 추가 / 수정
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">
                        등록된 파트너를 선택하면 추천 엑셀 표기명이 자동으로 채워집니다.
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* 파트너 선택 */}
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            등록된 판매채널 (파트너) 선택 *
                        </label>
                        <select
                            value={selectedPartnerId}
                            onChange={(e) => handlePartnerSelect(e.target.value)}
                            className="w-full text-xs font-bold px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="">-- 판매채널을 선택하세요 --</option>
                            {partners.map(p => {
                                const isMapped = mappings.some(m => m.partnerId === p.partnerId || m.partnerId === p.customUrl);
                                return (
                                    <option key={p.partnerId} value={p.partnerId || p.customUrl}>
                                        {p.companyName} ({p.customUrl || p.loginId}) {isMapped ? "✓" : ""}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* 엑셀 표기명 입력 */}
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            엑셀 표기 판매채널명 (D열) *
                        </label>
                        <input
                            type="text"
                            value={inputChannelName}
                            onChange={(e) => setInputChannelName(e.target.value)}
                            placeholder="예: 라이프앤조이_직영"
                            className="w-full text-xs font-bold px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    {/* 비고/메모 */}
                    <div className="sm:col-span-3">
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">
                            메모 / 설명 (선택)
                        </label>
                        <input
                            type="text"
                            value={inputMemo}
                            onChange={(e) => setInputMemo(e.target.value)}
                            placeholder="예: 본사 직영 채널"
                            className="w-full text-xs font-bold px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    {/* 추가 버튼 */}
                    <div className="sm:col-span-1 flex items-end">
                        <button
                            type="button"
                            onClick={handleAddMapping}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                            적용
                        </button>
                    </div>
                </div>
            </div>

            {/* 매핑 목록 테이블 */}
            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-black text-sono-dark">
                            설정된 판매채널 매핑 목록 ({mappings.length}건)
                        </h3>
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
                            실시간 연동
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="파트너명, 채널명 검색..."
                            className="text-xs px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-48 font-medium"
                        />
                    </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold">
                            <tr>
                                <th className="p-3.5 w-16 text-center">NO.</th>
                                <th className="p-3.5 w-48">판매채널 (파트너사명)</th>
                                <th className="p-3.5 w-36">파트너 ID / URL</th>
                                <th className="p-3.5">엑셀 표기 판매채널명 (D열)</th>
                                <th className="p-3.5">메모</th>
                                <th className="p-3.5 w-24 text-center">수정일</th>
                                <th className="p-3.5 w-20 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMappings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-400">
                                        {mappings.length === 0 ? (
                                            <div className="space-y-3">
                                                <p className="font-bold text-gray-600">아직 등록된 판매채널 매핑이 없습니다.</p>
                                                <p className="text-xs text-gray-400">상단의 '기본 추천값 자동채우기'를 누르시면 플랫폼에 등록된 파트너들의 채널명이 자동으로 채워집니다.</p>
                                                <button
                                                    onClick={handleAutoFillAll}
                                                    className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
                                                >
                                                    기본 추천값으로 시작하기
                                                </button>
                                            </div>
                                        ) : (
                                            "검색 결과가 없습니다."
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredMappings.map((m, idx) => (
                                    <tr key={m.partnerId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="p-3.5 text-center text-gray-400 font-mono">
                                            {idx + 1}
                                        </td>
                                        <td className="p-3.5 font-bold text-gray-800">
                                            {m.partnerName}
                                        </td>
                                        <td className="p-3.5 font-mono text-gray-500">
                                            {m.partnerId}
                                        </td>
                                        <td className="p-3.5">
                                            <input
                                                type="text"
                                                value={m.excelChannelName}
                                                onChange={(e) =>
                                                    handleInlineChange(m.partnerId, "excelChannelName", e.target.value)
                                                }
                                                className="w-full max-w-xs px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                                            />
                                        </td>
                                        <td className="p-3.5">
                                            <input
                                                type="text"
                                                value={m.memo || ""}
                                                onChange={(e) =>
                                                    handleInlineChange(m.partnerId, "memo", e.target.value)
                                                }
                                                placeholder="비고"
                                                className="w-full max-w-xs px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                                            />
                                        </td>
                                        <td className="p-3.5 text-center text-gray-400 font-mono text-[11px]">
                                            {m.updatedAt || "-"}
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <button
                                                onClick={() => handleDeleteMapping(m.partnerId)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="삭제"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 하단 저장 버튼 바 */}
                {mappings.length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            * 입력창에서 수정한 뒤 <strong>[설정 저장하기]</strong>를 눌러야 최종 저장됩니다.
                        </p>
                        <button
                            onClick={handleSaveToDb}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                            {isSaving ? "저장 중..." : "설정 저장하기"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
