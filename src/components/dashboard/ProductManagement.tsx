"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import sampleProducts from "@/lib/seedData";

interface Product {
    _id: Id<"products">;
    brand: string;
    model: string;
    name: string;
    category?: string;
    slotCount?: number;
    monthlyPayment?: number;
    cardDiscountPayment?: number;
    image: string;
    isVisible?: boolean;
    hasGift?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    promotionId?: Id<"promotions">;
}

export default function ProductManagement() {
    const products = useQuery(api.products.get);
    const upsertProduct = useMutation(api.products.upsert);
    const toggleVisibility = useMutation(api.products.toggleVisibility);
    const toggleGift = useMutation(api.products.toggleGift);
    const removeProduct = useMutation(api.products.remove);
    const syncFromBilligo = useAction(api.products.syncFromBilligo);
    const updateOrder = useMutation(api.products.updateOrder);
    const promotions = useQuery(api.promotions.get);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [slotFilter, setSlotFilter] = useState("all");
    const [isSyncing, setIsSyncing] = useState(false);

    const categories = ["에어컨", "냉장가전", "주방가전", "생활가전", "TV", "캠핑/레저", "가전패키지", "기타"];
    const slots = [1, 2, 3, 4, 6];

    const filteredProducts = (products || []).filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
        const matchesSlot = slotFilter === "all" || (p.slotCount || 4).toString() === slotFilter;
        return matchesSearch && matchesCategory && matchesSlot;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            await upsertProduct({
                id: editingProduct._id,
                brand: editingProduct.brand || "",
                model: editingProduct.model || "",
                name: editingProduct.name || "",
                category: editingProduct.category || "기타",
                slotCount: Number(editingProduct.slotCount) || 4,
                monthlyPayment: Number(editingProduct.monthlyPayment) || 0,
                cardDiscountPayment: Number(editingProduct.cardDiscountPayment) || 0,
                image: editingProduct.image || "",
                isVisible: editingProduct.isVisible ?? true,
                hasGift: editingProduct.hasGift ?? false,
                promotionId: editingProduct.promotionId,
            });
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: Id<"products">) => {
        if (confirm("정말로 삭제하시겠습니까?")) {
            await removeProduct({ id });
        }
    };

    const handleMove = async (product: Product, direction: 'up' | 'down') => {
        if (!products) return;
        const index = filteredProducts.findIndex(p => p._id === product._id);
        if (direction === 'up' && index > 0) {
            const prev = filteredProducts[index - 1];
            const currentOrder = product.order || 0;
            const prevOrder = prev.order || 0;
            await updateOrder({ id: product._id, order: prevOrder });
            await updateOrder({ id: prev._id, order: currentOrder });
        } else if (direction === 'down' && index < filteredProducts.length - 1) {
            const next = filteredProducts[index + 1];
            const currentOrder = product.order || 0;
            const nextOrder = next.order || 0;
            await updateOrder({ id: product._id, order: nextOrder });
            await updateOrder({ id: next._id, order: currentOrder });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tighter">제품 관리</h2>
                    <p className="text-gray-400 font-bold text-sm">
                        전체 <span className="text-sono-primary">{products?.length || 0}</span>개 제품 중 
                        <span className="text-sono-primary ml-1">{filteredProducts.length}</span>개가 검색되었습니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (confirm("빌리고 사이트와 제품 데이터를 실시간으로 동기화하시겠습니까?\n(기존에 수동으로 수정된 카테고리/사은품/노출 정보가 초기화 될 수 있습니다.)")) {
                                try {
                                    setIsSyncing(true);
                                    await syncFromBilligo();
                                    alert("실시간 동기화가 완료되었습니다.");
                                } catch (error) {
                                    console.error(error);
                                    alert("동기화 중 오류가 발생했습니다.");
                                } finally {
                                    setIsSyncing(false);
                                }
                            }
                        }}
                        disabled={isSyncing}
                        className={`bg-sono-gold text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-sono-dark'}`}
                    >
                        {isSyncing ? "동기화 중..." : "실시간 동기화"}
                    </button>
                    <button
                        onClick={() => {
                            setEditingProduct({
                                isVisible: true,
                                hasGift: false,
                                slotCount: 4,
                                category: "TV"
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-sono-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-sono-dark transition-all shadow-lg"
                    >
                        제품 개별 등록
                    </button>
                </div>
            </div>

            {/* 필터 섹션 */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        placeholder="제품명, 모델명, 브랜드 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#f9fafb] border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#f9fafb] border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-500 focus:ring-2 focus:ring-sono-primary"
                >
                    <option value="all">전체 카테고리</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select
                    value={slotFilter}
                    onChange={(e) => setSlotFilter(e.target.value)}
                    className="bg-[#f9fafb] border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-500 focus:ring-2 focus:ring-sono-primary"
                >
                    <option value="all">전체 구좌</option>
                    {slots.map(s => <option key={s} value={s}>{s}구좌</option>)}
                </select>
            </div>

            {/* 리스트 섹션 */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-20">이미지</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-32">브랜드/카테고리</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">제품정보</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">구좌수</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-right w-32">월 납입금</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-20">노출</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">프로모션</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">순서</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1">
                                            <img src={product.image} alt="" className="w-full h-full object-contain" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{product.brand}</span>
                                            <span className="text-sm font-bold text-sono-primary">{product.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-sono-dark leading-tight">{product.name}</span>
                                            <span className="text-xs font-bold text-gray-400 mt-1 uppercase">{product.model}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-black px-2 py-1 rounded-md">
                                            {product.slotCount}구좌
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col whitespace-nowrap">
                                            <span className="text-sm font-black text-sono-dark">{(product.monthlyPayment ?? 0).toLocaleString()}원</span>
                                            <span className="text-[10px] font-bold text-red-500">카드할인: {(product.cardDiscountPayment ?? 0).toLocaleString()}원</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-center">
                                        <button
                                            onClick={() => toggleVisibility({ id: product._id, isVisible: !product.isVisible })}
                                            className={`w-12 h-6 rounded-full p-1 transition-all ${product.isVisible ? "bg-sono-primary" : "bg-gray-200"}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full transition-all ${product.isVisible ? "ml-6" : "ml-0"}`}></div>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${product.promotionId ? "bg-sono-primary/10 border-sono-primary text-sono-primary" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                                            {product.promotionId ? "적용" : "미적용"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-1">
                                            <button 
                                                onClick={() => handleMove(product, 'up')}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                            </button>
                                            <button 
                                                onClick={() => handleMove(product, 'down')}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct({ ...product });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-bold">
                                        검색된 제품이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 등록/수정 모달 */}
            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-sono-dark px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black tracking-tight">{editingProduct._id ? "제품 정보 수정" : "새 제품 등록"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">브랜드</label>
                                    <input
                                        type="text"
                                        value={editingProduct.brand || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="예: 삼성, LG"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">카테고리</label>
                                    <select
                                        value={editingProduct.category || "TV"}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-sono-primary"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">제품명</label>
                                    <input
                                        type="text"
                                        value={editingProduct.name || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="전체 제품명을 입력하세요"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">모델명</label>
                                    <input
                                        type="text"
                                        value={editingProduct.model || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="모델번호를 입력하세요"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">구좌수</label>
                                    <select
                                        value={editingProduct.slotCount || 4}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, slotCount: Number(e.target.value) })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-sono-primary"
                                    >
                                        {slots.map(s => <option key={s} value={s}>{s}구좌</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">기본 월 납입금</label>
                                    <input
                                        type="number"
                                        value={editingProduct.monthlyPayment || 0}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, monthlyPayment: Number(e.target.value) })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">카드 할인시 월 납입금</label>
                                    <input
                                        type="number"
                                        value={editingProduct.cardDiscountPayment || 0}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, cardDiscountPayment: Number(e.target.value) })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">이미지 URL</label>
                                    <input
                                        type="text"
                                        value={editingProduct.image || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="https://..."
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">연결 프로모션 (선택)</label>
                                    <select
                                        value={editingProduct.promotionId || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, promotionId: e.target.value ? e.target.value as Id<"promotions"> : null })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-sono-primary"
                                    >
                                        <option value="">없음</option>
                                        {promotions?.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-4 rounded-2xl font-bold bg-sono-primary text-white hover:bg-sono-dark transition-all shadow-xl shadow-sono-primary/20"
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
