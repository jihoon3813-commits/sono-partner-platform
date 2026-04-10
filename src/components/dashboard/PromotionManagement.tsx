"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

export default function PromotionManagement() {
    const promotions = useQuery(api.promotions.get, {});
    const createPromotion = useMutation(api.promotions.create);
    const updatePromotion = useMutation(api.promotions.update);
    const removePromotion = useMutation(api.promotions.remove);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        period: "",
        description: "",
        imageUrl: "",
        externalUrl: "",
        isActive: true,
    });

    const handleOpenModal = (promotion?: any) => {
        if (promotion) {
            setEditingPromotion(promotion);
            setFormData({
                title: promotion.title,
                period: promotion.period,
                description: promotion.description || "",
                imageUrl: promotion.imageUrl || "",
                externalUrl: promotion.externalUrl || "",
                isActive: promotion.isActive,
            });
        } else {
            setEditingPromotion(null);
            setFormData({
                title: "",
                period: "",
                description: "",
                imageUrl: "",
                externalUrl: "",
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPromotion) {
                await updatePromotion({
                    id: editingPromotion._id,
                    ...formData,
                });
                alert("프로모션이 수정되었습니다.");
            } else {
                await createPromotion(formData);
                alert("프로모션이 생성되었습니다.");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: Id<"promotions">) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            await removePromotion({ id });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">프로모션 관리</h2>
                    <p className="text-gray-500">제품별 이벤트를 관리합니다.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    새 프로모션 추가
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions?.map((p) => (
                    <div key={p._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        {p.imageUrl && (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover border-b" />
                        )}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {p.isActive ? "활성" : "비활성"}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1"><strong>기간:</strong> {p.period}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(p)}
                                    className="flex-1 text-sm bg-gray-50 text-indigo-600 border border-indigo-200 py-2 rounded-lg hover:bg-indigo-50"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(p._id)}
                                    className="flex-1 text-sm bg-gray-50 text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-50"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative">
                        <div className="p-6 border-b flex justify-between items-center bg-indigo-50 rounded-t-2xl">
                            <h3 className="text-xl font-bold text-indigo-900">
                                {editingPromotion ? "프로모션 수정" : "새 프로모션 생성"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">프로모션 제목</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    placeholder="예: 4월 네이버포인트 즉시지급 이벤트"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">진행 기간</label>
                                <input
                                    type="text"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                    placeholder="예: 2026.04.01 ~ 2026.04.30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">혜택 안내 (텍스트)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                                    placeholder="프로모션 혜택에 대해 설명해주세요."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">혜택 이미지 URL</label>
                                    <input
                                        type="text"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">외부 링크 (선택)</label>
                                    <input
                                        type="text"
                                        value={formData.externalUrl}
                                        onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">활성 상태로 노출</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border rounded-xl font-bold bg-white hover:bg-gray-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                                >
                                    저장하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
