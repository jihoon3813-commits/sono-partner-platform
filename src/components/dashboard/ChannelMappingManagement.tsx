"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Partner } from "@/lib/types";
import { AdminIcon } from "./AdminIcons";

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
        <div className="space-y-4">
            {/* 상단 안내 및 저장 액션 패널 */}
            <section className="adm-panel overflow-hidden">
                <div className="adm-panel-head">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="adm-pill green">가입요청 엑셀 업데이트 연동</span>
                        </div>
                        <h2 className="adm-panel-title">판매채널(엑셀 표기명) 매핑 설정</h2>
                        <p className="adm-panel-sub">
                            신규 고객이 등록될 때 해당 파트너가 가입요청 엑셀의 [판매채널] 컬럼(D열)에 어떤 명칭(예: 라이프앤조이_직영)으로 기재될지 기준을 설정합니다.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleAutoFillAll}
                            className="adm-btn"
                        >
                            기본 추천값 자동채우기
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveToDb}
                            disabled={isSaving}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="check" />
                            <span>{isSaving ? "저장 중..." : "설정 저장하기"}</span>
                        </button>
                    </div>
                </div>

                {/* 신규 매핑 등록 폼 */}
                <div className="p-5 bg-[#fbfcf9] border-b border-[#eaeff7]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#162438]">
                            새 판매채널 매핑 추가 / 수정
                        </span>
                        <span className="text-[11px] text-[#788699]">
                            등록된 파트너를 선택하면 추천 엑셀 표기명이 자동으로 채워집니다.
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-4 adm-field">
                            <label>등록된 판매채널 (파트너) 선택 *</label>
                            <select
                                value={selectedPartnerId}
                                onChange={(e) => handlePartnerSelect(e.target.value)}
                                className="adm-select"
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

                        <div className="sm:col-span-4 adm-field">
                            <label>엑셀 표기 판매채널명 (D열) *</label>
                            <input
                                type="text"
                                value={inputChannelName}
                                onChange={(e) => setInputChannelName(e.target.value)}
                                placeholder="예: 라이프앤조이_직영"
                                className="adm-input"
                            />
                        </div>

                        <div className="sm:col-span-3 adm-field">
                            <label>메모 / 설명 (선택)</label>
                            <input
                                type="text"
                                value={inputMemo}
                                onChange={(e) => setInputMemo(e.target.value)}
                                placeholder="예: 본사 직영 채널"
                                className="adm-input"
                            />
                        </div>

                        <div className="sm:col-span-1 flex items-end">
                            <button
                                type="button"
                                onClick={handleAddMapping}
                                className="adm-btn primary w-full !h-[38px]"
                            >
                                적용
                            </button>
                        </div>
                    </div>
                </div>

                {/* 필터 바 */}
                <div className="adm-filter-bar">
                    <label className="adm-search-field">
                        <AdminIcon name="search" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="파트너명, 채널명 검색..."
                        />
                    </label>
                    <div className="adm-filter-end">
                        설정된 판매채널 매핑 <strong className="text-[#163a6b]">{mappings.length}</strong>건
                    </div>
                </div>

                {/* 매핑 목록 테이블 */}
                <div className="adm-table-scroll">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">NO.</th>
                                <th className="w-48">판매채널 (파트너사명)</th>
                                <th className="w-36">파트너 ID / URL</th>
                                <th>엑셀 표기 판매채널명 (D열)</th>
                                <th>메모</th>
                                <th className="w-24 text-center">수정일</th>
                                <th className="w-20 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMappings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-14 text-center text-xs text-[#788699]">
                                        {mappings.length === 0 ? (
                                            <div className="space-y-2.5">
                                                <p className="font-bold text-[#162438]">아직 등록된 판매채널 매핑이 없습니다.</p>
                                                <p className="text-xs text-[#788699]">상단의 &apos;기본 추천값 자동채우기&apos;를 누르시면 플랫폼에 등록된 파트너들의 채널명이 자동으로 채워집니다.</p>
                                                <button
                                                    type="button"
                                                    onClick={handleAutoFillAll}
                                                    className="adm-btn sage"
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
                                    <tr key={m.partnerId}>
                                        <td className="text-center text-[#788699] font-mono text-xs">
                                            {idx + 1}
                                        </td>
                                        <td className="font-bold text-[#162438]">
                                            {m.partnerName}
                                        </td>
                                        <td className="font-mono text-xs text-[#5a6b82]">
                                            {m.partnerId}
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={m.excelChannelName}
                                                onChange={(e) =>
                                                    handleInlineChange(m.partnerId, "excelChannelName", e.target.value)
                                                }
                                                className="adm-input !h-8 !py-1 max-w-xs"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={m.memo || ""}
                                                onChange={(e) =>
                                                    handleInlineChange(m.partnerId, "memo", e.target.value)
                                                }
                                                placeholder="비고"
                                                className="adm-input !h-8 !py-1 max-w-xs"
                                            />
                                        </td>
                                        <td className="text-center text-[#788699] font-mono text-[11px]">
                                            {m.updatedAt || "-"}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteMapping(m.partnerId)}
                                                className="adm-btn small danger !px-2"
                                                title="삭제"
                                            >
                                                <AdminIcon name="trash" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {mappings.length > 0 && (
                    <div className="adm-table-foot">
                        <span>* 입력창에서 수정한 뒤 <b>[설정 저장하기]</b>를 눌러야 최종 저장됩니다.</span>
                        <button
                            type="button"
                            onClick={handleSaveToDb}
                            disabled={isSaving}
                            className="adm-btn small primary"
                        >
                            <AdminIcon name="check" />
                            <span>{isSaving ? "저장 중..." : "설정 저장하기"}</span>
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
