"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

export default function PromotionManagement() {
    const promotions = useQuery(api.promotions.get);
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
        <div>
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · CAMPAIGN</div>
                    <h1>프로모션</h1>
                    <p>제품 및 파트너 영업을 위한 이벤트·프로모션 혜택을 관리합니다.</p>
                </div>
                <div className="adm-heading-buttons">
                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="plus" />
                        <span>새 프로모션 추가</span>
                    </button>
                </div>
            </section>

            {!promotions ? (
                <div className="adm-panel p-14 text-center text-xs text-[#788699]">
                    프로모션 목록을 불러오는 중...
                </div>
            ) : promotions.length === 0 ? (
                <div className="adm-panel p-16 text-center">
                    <AdminIcon name="gift" className="mx-auto mb-3 !w-8 !h-8 text-[#8da4c4]" />
                    <strong className="block text-sm text-[#162438] mb-1">등록된 프로모션이 없습니다</strong>
                    <p className="text-xs text-[#788699]">우측 상단 버튼을 눌러 새로운 프로모션을 등록하세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {promotions.map((p, idx) => (
                        <article
                            key={p._id}
                            className="adm-panel flex flex-col overflow-hidden hover:border-[#9cb2cf] transition-all"
                        >
                            {p.imageUrl ? (
                                <img
                                    src={p.imageUrl}
                                    alt={p.title}
                                    className="w-full h-40 object-cover border-b border-[#e1e7f0]"
                                />
                            ) : (
                                <div
                                    className={`h-36 p-6 flex flex-col justify-center relative overflow-hidden ${
                                        idx % 3 === 1
                                            ? "bg-[#0c2340] text-[#f2f0dc]"
                                            : idx % 3 === 2
                                            ? "bg-[#eee8d7] text-[#5e5a3f]"
                                            : "bg-[#e3ebf7] text-[#162438]"
                                    }`}
                                >
                                    <small className="text-[9px] tracking-[1.8px] uppercase opacity-75 mb-2 font-semibold">
                                        SONO PROMOTION
                                    </small>
                                    <strong className="text-lg leading-snug line-clamp-2 font-bold">
                                        {p.title}
                                    </strong>
                                </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-2.5">
                                    <span className={`adm-pill ${p.isActive ? "green" : "gray"}`}>
                                        {p.isActive ? "운영중 (활성)" : "비활성"}
                                    </span>
                                    <span className="text-[11px] text-[#788699] font-medium">
                                        {p.period}
                                    </span>
                                </div>
                                <h3 className="font-bold text-base text-[#162438] mb-1.5">
                                    {p.title}
                                </h3>
                                <p className="text-xs text-[#7d887b] line-clamp-2 leading-relaxed mb-5 flex-1">
                                    {p.description || "등록된 혜택 설명이 없습니다."}
                                </p>
                                <div className="pt-3.5 border-t border-[#edf0e5] flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal(p)}
                                        className="flex-1 adm-btn small sage"
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(p._id)}
                                        className="flex-1 adm-btn small danger"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <AdminDrawer
                    title={editingPromotion ? "프로모션 수정" : "새 프로모션 등록"}
                    subtitle="프로모션 기간과 혜택 안내 정보를 설정합니다."
                    maxWidth="540px"
                    zIndex={70}
                    onClose={() => setIsModalOpen(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="adm-btn"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                form="promotion-form-drawer"
                                className="adm-btn primary"
                            >
                                <AdminIcon name="check" />
                                <span>저장하기</span>
                            </button>
                        </>
                    }
                >
                    <form id="promotion-form-drawer" onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#475870] mb-1.5">
                                프로모션 제목
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#f7f9fc] border border-[#dce4f0] rounded-[9px] px-3.5 py-2.5 text-sm focus:bg-white focus:border-[#163a6b] outline-none"
                                required
                                placeholder="예: 네이버포인트 즉시지급 이벤트"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#475870] mb-1.5">
                                진행 기간
                            </label>
                            <input
                                type="text"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                className="w-full bg-[#f7f9fc] border border-[#dce4f0] rounded-[9px] px-3.5 py-2.5 text-sm focus:bg-white focus:border-[#163a6b] outline-none"
                                required
                                placeholder="예: 2026.11.01 ~ 2026.11.30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#475870] mb-1.5">
                                혜택 안내 (텍스트)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[#f7f9fc] border border-[#dce4f0] rounded-[9px] px-3.5 py-2.5 text-sm focus:bg-white focus:border-[#163a6b] outline-none h-28"
                                placeholder="프로모션 혜택에 대해 설명해주세요."
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#475870] mb-1.5">
                                    혜택 이미지 URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full bg-[#f7f9fc] border border-[#dce4f0] rounded-[9px] px-3.5 py-2.5 text-sm focus:bg-white focus:border-[#163a6b] outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#475870] mb-1.5">
                                    외부 링크 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={formData.externalUrl}
                                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                    className="w-full bg-[#f7f9fc] border border-[#dce4f0] rounded-[9px] px-3.5 py-2.5 text-sm focus:bg-white focus:border-[#163a6b] outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 pt-2 bg-[#f6f8fc] p-3.5 rounded-[10px] border border-[#e1e7f0]">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-4 h-4 rounded cursor-pointer"
                            />
                            <label htmlFor="isActive" className="text-xs font-bold text-[#162438] cursor-pointer">
                                활성 상태로 노출
                            </label>
                        </div>
                    </form>
                </AdminDrawer>
            )}
        </div>
    );
}
