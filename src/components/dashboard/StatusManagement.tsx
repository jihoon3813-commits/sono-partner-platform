"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { STATUS_COLORS } from "@/lib/statusUtils";
import { AdminIcon } from "./AdminIcons";

// 기본 프리셋 색상 (HEX 매핑 포함)
const PRESET_HEX_COLORS = [
    { name: "파랑", hex: "#3b82f6", class: "text-blue-500" },
    { name: "슬레이트", hex: "#64748b", class: "text-slate-500" },
    { name: "호박색", hex: "#f59e0b", class: "text-amber-500" },
    { name: "회색", hex: "#94a3b8", class: "text-gray-400" },
    { name: "주황", hex: "#f97316", class: "text-orange-500" },
    { name: "빨강", hex: "#ef4444", class: "text-red-500" },
    { name: "장미색", hex: "#f43f5e", class: "text-rose-500" },
    { name: "청록", hex: "#06b6d4", class: "text-cyan-500" },
    { name: "에메랄드", hex: "#10b981", class: "text-emerald-500" },
    { name: "민트", hex: "#14b8a6", class: "text-teal-500" },
    { name: "분홍", hex: "#ec4899", class: "text-pink-500" },
    { name: "석재색", hex: "#78716c", class: "text-stone-500" },
    { name: "보라", hex: "#9333ea", class: "text-purple-600" },
    { name: "남색", hex: "#6366f1", class: "text-indigo-500" },
];

export default function StatusManagement() {
    const statuses = useQuery(api.applicationStatuses.getAllStatuses);
    const createStatus = useMutation(api.applicationStatuses.createStatus);
    const updateStatus = useMutation(api.applicationStatuses.updateStatus);
    const deleteStatus = useMutation(api.applicationStatuses.deleteStatus);
    const reorderStatuses = useMutation(api.applicationStatuses.reorderStatuses);
    const seedStatuses = useMutation(api.applicationStatuses.seedStatuses);

    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#3b82f6");
    const [newIsPartnerVisible, setNewIsPartnerVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // 새 항목 추가
    const handleAdd = async () => {
        if (!newLabel.trim()) return;
        setIsSaving(true);
        try {
            const maxOrder = statuses?.reduce((max, s) => Math.max(max, s.order), 0) || 0;
            await createStatus({
                label: newLabel,
                color: newColor,
                order: maxOrder + 1,
                isActive: true,
                isSystem: false,
                isPartnerVisible: newIsPartnerVisible,
            });
            setNewLabel("");
            setNewColor("#3b82f6");
            setNewIsPartnerVisible(false);
            setIsAdding(false);
        } catch (err) {
            alert("상태 추가 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (id: Id<"applicationStatuses">, isActive: boolean) => {
        try {
            await updateStatus({ id, isActive: !isActive });
        } catch (err) {
            alert("상태 변경 중 오류가 발생했습니다.");
        }
    };

    const handleTogglePartnerVisible = async (id: Id<"applicationStatuses">, isPartnerVisible: boolean) => {
        try {
            await updateStatus({ id, isPartnerVisible: !isPartnerVisible });
        } catch (err) {
            alert("파트너 권한 변경 중 오류가 발생했습니다.");
        }
    };

    const handleUpdateColor = async (id: Id<"applicationStatuses">, color: string) => {
        try {
            await updateStatus({ id, color });
        } catch (err) {
            alert("색상 변경 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: Id<"applicationStatuses">) => {
        if (confirm("정말로 이 상태를 삭제하시겠습니까? (이미 해당 상태를 사용 중인 데이터가 있을 수 있습니다)")) {
            try {
                await deleteStatus({ id });
            } catch (err) {
                alert("상태 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (!statuses) return;
        const newStatuses = [...statuses];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newStatuses.length) return;

        const currentItem = newStatuses[index];
        const targetItem = newStatuses[targetIndex];

        const updates = [
            { id: currentItem._id, order: targetItem.order },
            { id: targetItem._id, order: currentItem.order }
        ];

        try {
            await reorderStatuses({ statuses: updates });
        } catch (err) {
            alert("순서 변경 중 오류가 발생했습니다.");
        }
    };

    const handleRowDrop = async (targetIndex: number) => {
        if (!statuses || draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...statuses];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        setDraggedIndex(null);
        setDragOverIndex(null);

        const updates = reordered.map((item, idx) => ({
            id: item._id,
            order: idx + 1,
        }));

        try {
            await reorderStatuses({ statuses: updates });
        } catch (err) {
            alert("순서 변경 중 오류가 발생했습니다.");
        }
    };

    const handleSeed = async () => {
        if (confirm("기본 상태값들을 생성하시겠습니까?")) {
            await seedStatuses();
        }
    };

    // 뱃지 스타일 렌더링 헬퍼
    const renderBadge = (label: string, colorStr?: string, isActive: boolean = true) => {
        if (!isActive) {
            return (
                <span className="adm-pill gray opacity-60">
                    {label}
                </span>
            );
        }

        if (colorStr && colorStr.startsWith('#')) {
            return (
                <span
                    className="adm-pill border transition-all"
                    style={{
                        backgroundColor: `${colorStr}16`,
                        color: colorStr,
                        borderColor: `${colorStr}35`
                    }}
                >
                    {label}
                </span>
            );
        }

        const found = STATUS_COLORS.find(c => c.color === colorStr) || STATUS_COLORS[1];
        return (
            <span className={`adm-pill border ${found.bg} ${found.color} ${found.border}`}>
                {label}
            </span>
        );
    };

    // 현재 색상값을 HEX 포맷으로 변환하는 헬퍼
    const getHexFromColorStr = (colorStr?: string) => {
        if (!colorStr) return "#3b82f6";
        if (colorStr.startsWith("#")) return colorStr;
        const found = PRESET_HEX_COLORS.find(p => p.class === colorStr);
        return found ? found.hex : "#3b82f6";
    };

    if (statuses === undefined) return <div className="adm-panel p-14 text-center text-xs text-[#788699] font-semibold">불러오는 중...</div>;

    return (
        <div className="space-y-4">
            <section className="adm-panel overflow-hidden">
                <div className="adm-panel-head">
                    <div>
                        <h2 className="adm-panel-title">진행상태 설정</h2>
                        <p className="adm-panel-sub">
                            고객 관리에서 사용되는 진행상태 항목의 명칭, 색상표(Color Picker), 노출 여부 및 순서를 편집합니다.
                        </p>
                    </div>
                    {statuses.length === 0 ? (
                        <button
                            type="button"
                            onClick={handleSeed}
                            className="adm-btn primary"
                        >
                            기본값 시딩
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="plus" />
                            <span>신규 상태 추가</span>
                        </button>
                    )}
                </div>

                <div className="adm-table-scroll">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th className="w-[72px]">순서</th>
                                <th>상태 명칭 &amp; 미리보기</th>
                                <th className="text-center w-[240px]">색상표 및 팔레트</th>
                                <th className="text-center w-[80px]">활성 여부</th>
                                <th className="text-center w-[88px]">파트너 노출</th>
                                <th className="text-right w-[68px]">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* 신규 상태 추가 행 */}
                            {isAdding && (
                                <tr className="bg-[#f1f4fa]">
                                    <td className="text-xs font-bold text-[#788699]">-</td>
                                    <td>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <input
                                                type="text"
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                placeholder="상태 명칭 입력"
                                                className="adm-input !w-44"
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-[#788699] font-bold uppercase">PREVIEW</span>
                                                {renderBadge(newLabel || "미리보기", newColor, true)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* 팔레트 프리셋 */}
                                            <div className="flex flex-wrap justify-center gap-1 max-w-[130px]">
                                                {PRESET_HEX_COLORS.map((p) => (
                                                    <button
                                                        key={p.name}
                                                        type="button"
                                                        onClick={() => setNewColor(p.hex)}
                                                        className={`w-4 h-4 rounded-full border transition-all ${newColor === p.hex ? 'border-[#162438] scale-125 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.name}
                                                    />
                                                ))}
                                            </div>
                                            {/* 색상표 (Native Color Picker + HEX) */}
                                            <div className="flex items-center gap-1 bg-white border border-[#dce4f0] rounded-[7px] px-1.5 py-1">
                                                <input
                                                    type="color"
                                                    value={getHexFromColorStr(newColor)}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                                                    title="직접 색상 선택 (색상표)"
                                                />
                                                <input
                                                    type="text"
                                                    value={newColor}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="w-16 text-[11px] font-mono font-bold text-[#162438] bg-transparent border-0 outline-none uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <span className="adm-pill green">활성</span>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setNewIsPartnerVisible(!newIsPartnerVisible)}
                                            className={`adm-switch ${newIsPartnerVisible ? 'checked' : ''}`}
                                            aria-label="파트너 노출 여부"
                                        >
                                            <span />
                                        </button>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleAdd}
                                                disabled={isSaving}
                                                className="adm-btn small primary"
                                            >
                                                저장
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAdding(false)}
                                                className="adm-btn small"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* 기존 상태 목록 */}
                            {statuses.map((status, index) => (
                                <tr
                                    key={status._id}
                                    draggable
                                    onDragStart={(e) => {
                                        setDraggedIndex(index);
                                        e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        if (draggedIndex !== null && draggedIndex !== index) {
                                            setDragOverIndex(index);
                                        }
                                    }}
                                    onDragLeave={() => {
                                        if (dragOverIndex === index) setDragOverIndex(null);
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        void handleRowDrop(index);
                                    }}
                                    onDragEnd={() => {
                                        setDraggedIndex(null);
                                        setDragOverIndex(null);
                                    }}
                                    className={`group transition-colors ${
                                        draggedIndex === index ? "opacity-35" : ""
                                    } ${dragOverIndex === index ? "!bg-[#edf2fa]" : ""}`}
                                >
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="cursor-grab active:cursor-grabbing text-[#b7c2b0] hover:text-[#163a6b] p-0.5"
                                                title="드래그하여 순서 변경"
                                            >
                                                <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
                                                    <circle cx="2" cy="2.5" r="1" />
                                                    <circle cx="6" cy="2.5" r="1" />
                                                    <circle cx="2" cy="6" r="1" />
                                                    <circle cx="6" cy="6" r="1" />
                                                    <circle cx="2" cy="9.5" r="1" />
                                                    <circle cx="6" cy="9.5" r="1" />
                                                </svg>
                                            </span>
                                            <span className="text-xs font-bold text-[#788699] w-4 font-mono">{status.order}</span>
                                            <div className="flex flex-col">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMove(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-0.5 text-[#8da4c4] hover:text-[#163a6b] disabled:opacity-20"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMove(index, 'down')}
                                                    disabled={index === statuses.length - 1}
                                                    className="p-0.5 text-[#8da4c4] hover:text-[#163a6b] disabled:opacity-20"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2.5">
                                            {renderBadge(status.label, status.color, status.isActive)}
                                            {status.isSystem && (
                                                <span className="text-[10px] font-bold text-[#788699] uppercase tracking-wider">Default</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* 팔레트 프리셋 스왓치 */}
                                            <div className="flex flex-wrap justify-center gap-1 max-w-[130px]">
                                                {PRESET_HEX_COLORS.map((p) => (
                                                    <button
                                                        key={p.name}
                                                        type="button"
                                                        onClick={() => handleUpdateColor(status._id, p.hex)}
                                                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                                                            (status.color === p.hex || status.color === p.class)
                                                                ? 'border-[#162438] scale-125 shadow-sm'
                                                                : 'border-transparent opacity-40 hover:opacity-100'
                                                        }`}
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.name}
                                                    />
                                                ))}
                                            </div>

                                            {/* 색상표 (Custom Color Picker Input) */}
                                            <div className="flex items-center gap-1 bg-white border border-[#dce4f0] rounded-[7px] px-1.5 py-1 hover:border-[#163a6b] transition-colors">
                                                <input
                                                    type="color"
                                                    value={getHexFromColorStr(status.color)}
                                                    onChange={(e) => handleUpdateColor(status._id, e.target.value)}
                                                    className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                                                    title="색상표 선택"
                                                />
                                                <input
                                                    type="text"
                                                    value={status.color || ""}
                                                    onChange={(e) => handleUpdateColor(status._id, e.target.value)}
                                                    className="w-16 text-[10px] font-mono font-bold text-[#162438] bg-transparent border-0 outline-none uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(status._id, status.isActive)}
                                            className={`adm-switch ${status.isActive ? 'checked' : ''}`}
                                            aria-label={`${status.label} 활성 여부`}
                                        >
                                            <span />
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleTogglePartnerVisible(status._id, !!status.isPartnerVisible)}
                                            className={`adm-switch ${status.isPartnerVisible ? 'checked' : ''}`}
                                            aria-label={`${status.label} 파트너 노출 여부`}
                                        >
                                            <span />
                                        </button>
                                    </td>
                                    <td className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(status._id)}
                                            className="adm-btn small danger !px-2 opacity-60 group-hover:opacity-100"
                                            title="삭제"
                                        >
                                            <AdminIcon name="trash" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {statuses.length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-xs text-[#788699] whitespace-pre-wrap">
                                        설정된 진행상태가 없습니다.{"\n"}관리자 시스템 초기화를 위해 &apos;기본값 시딩&apos; 버튼을 눌러주세요.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
