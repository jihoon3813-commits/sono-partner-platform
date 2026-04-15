"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function StatusManagement() {
    const statuses = useQuery(api.applicationStatuses.getAllStatuses);
    const createStatus = useMutation(api.applicationStatuses.createStatus);
    const updateStatus = useMutation(api.applicationStatuses.updateStatus);
    const deleteStatus = useMutation(api.applicationStatuses.deleteStatus);
    const seedStatuses = useMutation(api.applicationStatuses.seedStatuses);

    const [isAdding, setIsAdding] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleAdd = async () => {
        if (!newLabel.trim()) return;
        setIsSaving(true);
        try {
            const maxOrder = statuses?.reduce((max, s) => Math.max(max, s.order), 0) || 0;
            await createStatus({
                label: newLabel,
                order: maxOrder + 1,
                isActive: true,
                isSystem: false,
            });
            setNewLabel("");
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

    const handleDelete = async (id: Id<"applicationStatuses">, isSystem?: boolean) => {
        if (isSystem) {
            alert("시스템 기본 상태는 삭제할 수 없습니다.");
            return;
        }
        if (confirm("정말로 이 상태를 삭제하시겠습니까? (이미 해당 상태를 사용 중인 데이터가 있을 수 있습니다)")) {
            try {
                await deleteStatus({ id });
            } catch (err) {
                alert("상태 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleSeed = async () => {
        if (confirm("기본 상태값들을 생성하시겠습니까?")) {
            await seedStatuses();
        }
    };

    if (statuses === undefined) return <div className="p-10 text-center">불러오는 중...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tighter">진행상태 설정</h2>
                    <p className="text-sm text-gray-400 mt-1 font-medium">고객 관리에서 사용되는 진행상태 항목을 편집할 수 있습니다.</p>
                </div>
                {statuses.length === 0 ? (
                    <button
                        onClick={handleSeed}
                        className="px-6 py-2.5 bg-sono-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-sono-primary/20 hover:scale-105 transition-all"
                    >
                        기본값 시딩
                    </button>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sono-dark text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:scale-105 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        상태 추가
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#f9fafb] border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider w-[80px]">순서</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">상태 명칭</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[120px]">시스템 기본값</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[120px]">활성 여부</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[100px]">작업</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isAdding && (
                            <tr className="bg-sono-primary/5">
                                <td className="px-6 py-4">-</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        placeholder="상태 명칭 입력"
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sono-primary outline-none"
                                        autoFocus
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-gray-400 text-xs">아니오</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sono-primary text-xs font-bold">활성</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
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
                        {statuses.map((status) => (
                            <tr key={status._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-400">{status.order}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.isActive ? 'bg-sono-primary/10 text-sono-primary' : 'bg-gray-100 text-gray-400'}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {status.isSystem ? (
                                        <span className="bg-sono-dark/5 text-sono-dark text-[10px] font-bold px-2 py-0.5 rounded-full">System</span>
                                    ) : (
                                        <span className="text-gray-300 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(status._id, status.isActive)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${status.isActive ? 'bg-sono-primary' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {!status.isSystem && (
                                            <button
                                                onClick={() => handleDelete(status._id, status.isSystem)}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="삭제"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {statuses.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium whitespace-pre-wrap">
                                    설정된 진행상태가 없습니다.\n관리자 시스템 초기화를 위해 '기본값 시딩' 버튼을 눌러주세요.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
