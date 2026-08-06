"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

import { STATUS_COLORS } from "@/lib/statusUtils";

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

    const handleSeed = async () => {
        if (confirm("기본 상태값들을 생성하시겠습니까?")) {
            await seedStatuses();
        }
    };

    // 뱃지 스타일 렌더링 헬퍼
    const renderBadge = (label: string, colorStr?: string, isActive: boolean = true) => {
        if (!isActive) {
            return (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200">
                    {label}
                </span>
            );
        }

        if (colorStr && colorStr.startsWith('#')) {
            return (
                <span
                    className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                    style={{
                        backgroundColor: `${colorStr}18`,
                        color: colorStr,
                        borderColor: `${colorStr}40`
                    }}
                >
                    {label}
                </span>
            );
        }

        const found = STATUS_COLORS.find(c => c.color === colorStr) || STATUS_COLORS[1];
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${found.bg} ${found.color} ${found.border}`}>
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

    if (statuses === undefined) return <div className="p-10 text-center text-gray-400 font-bold">불러오는 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tight">진행상태 설정</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        고객 관리에서 사용되는 진행상태 항목의 명칭, 색상표(Color Picker), 노출 여부 및 순서를 편집할 수 있습니다.
                    </p>
                </div>
                {statuses.length === 0 ? (
                    <button
                        onClick={handleSeed}
                        className="px-6 py-3 bg-sono-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-sono-primary/20 hover:scale-105 transition-all"
                    >
                        기본값 시딩
                    </button>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-sono-dark text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/10 hover:scale-105 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        신규 상태 추가
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[80px]">순서</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">상태 명칭 & 미리보기</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[240px]">색상표 및 팔레트</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[100px]">활성 여부</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-[100px]">파트너 노출</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right px-8 w-[100px]">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* 신규 상태 추가 행 */}
                            {isAdding && (
                                <tr className="bg-sono-primary/5">
                                    <td className="px-6 py-4 text-xs font-bold text-gray-400">-</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={newLabel}
                                                onChange={(e) => setNewLabel(e.target.value)}
                                                placeholder="상태 명칭 입력"
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-sono-primary outline-none"
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">PREVIEW</span>
                                                {renderBadge(newLabel || "미리보기", newColor, true)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {/* 팔레트 프리셋 */}
                                            <div className="flex flex-wrap justify-center gap-1 max-w-[130px]">
                                                {PRESET_HEX_COLORS.map((p) => (
                                                    <button
                                                        key={p.name}
                                                        type="button"
                                                        onClick={() => setNewColor(p.hex)}
                                                        className={`w-4 h-4 rounded-full border transition-all ${newColor === p.hex ? 'border-sono-dark scale-125 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.name}
                                                    />
                                                ))}
                                            </div>
                                            {/* 색상표 (Native Color Picker + HEX) */}
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                                <input
                                                    type="color"
                                                    value={getHexFromColorStr(newColor)}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                                                    title="직접 색상 선택 (색상표)"
                                                />
                                                <input
                                                    type="text"
                                                    value={newColor}
                                                    onChange={(e) => setNewColor(e.target.value)}
                                                    className="w-16 text-[11px] font-mono font-bold text-gray-700 bg-transparent border-0 outline-none uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sono-primary text-xs font-bold">활성</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setNewIsPartnerVisible(!newIsPartnerVisible)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${newIsPartnerVisible ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${newIsPartnerVisible ? 'translate-x-5' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right px-8">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={handleAdd}
                                                disabled={isSaving}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="저장"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setIsAdding(false)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="취소"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* 기존 상태 목록 */}
                            {statuses.map((status, index) => (
                                <tr key={status._id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400 w-4">{status.order}</span>
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => handleMove(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-0.5 text-gray-300 hover:text-sono-primary disabled:opacity-20"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleMove(index, 'down')}
                                                    disabled={index === statuses.length - 1}
                                                    className="p-0.5 text-gray-300 hover:text-sono-primary disabled:opacity-20"
                                                >
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {renderBadge(status.label, status.color, status.isActive)}
                                            {status.isSystem && (
                                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-wider">Default</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
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
                                                                ? 'border-sono-dark scale-125 shadow-sm'
                                                                : 'border-transparent opacity-40 hover:opacity-100'
                                                        }`}
                                                        style={{ backgroundColor: p.hex }}
                                                        title={p.name}
                                                    />
                                                ))}
                                            </div>

                                            {/* 색상표 (Custom Color Picker Input) */}
                                            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm hover:border-sono-primary/40 transition-colors">
                                                <input
                                                    type="color"
                                                    value={getHexFromColorStr(status.color)}
                                                    onChange={(e) => handleUpdateColor(status._id, e.target.value)}
                                                    className="w-5 h-5 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                                                    title="색상표 선택"
                                                />
                                                <input
                                                    type="text"
                                                    value={status.color || ""}
                                                    onChange={(e) => handleUpdateColor(status._id, e.target.value)}
                                                    className="w-16 text-[10px] font-mono font-bold text-gray-700 bg-transparent border-0 outline-none uppercase"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(status._id, status.isActive)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${status.isActive ? 'bg-sono-primary' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleTogglePartnerVisible(status._id, !!status.isPartnerVisible)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${status.isPartnerVisible ? 'bg-indigo-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status.isPartnerVisible ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right px-8">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDelete(status._id)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="삭제"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {statuses.length === 0 && !isAdding && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium whitespace-pre-wrap">
                                        설정된 진행상태가 없습니다.{"\n"}관리자 시스템 초기화를 위해 '기본값 시딩' 버튼을 눌러주세요.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
