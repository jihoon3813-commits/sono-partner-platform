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
    isBest?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    promotionId?: Id<"promotions"> | null;
}

interface CareProduct {
    _id: Id<"careProducts">;
    name: string;
    slotCount: number;
    target: string;
    monthlyPayment: number;
    features: string[];
    syncUrl?: string;
    paymentCount?: string;
    defermentPeriod?: string;
    maturityCount?: string;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function ProductManagement() {
    const [subTab, setSubTab] = useState<"products" | "care">("products");

    // Products Queries & Mutations
    const products = useQuery(api.products.get);
    const upsertProduct = useMutation(api.products.upsert);
    const toggleVisibility = useMutation(api.products.toggleVisibility);
    const toggleGift = useMutation(api.products.toggleGift);
    const toggleBest = useMutation(api.products.toggleBest);
    const removeProduct = useMutation(api.products.remove);
    const removeProducts = useMutation(api.products.removeMany);
    const syncFromBilligo = useAction(api.products.syncFromBilligo);
    const updateOrder = useMutation(api.products.updateOrder);
    const bulkUpdateCardDiscount = useMutation(api.products.bulkUpdateCardDiscount);
    const promotions = useQuery(api.promotions.get);

    // Care Products Queries & Mutations
    const careProducts = useQuery(api.careProducts.get);
    const upsertCareProduct = useMutation(api.careProducts.upsert);
    const removeCareProduct = useMutation(api.careProducts.remove);
    const updateCareOrder = useMutation(api.careProducts.updateOrder);
    const syncProductsForPlan = useAction(api.products.syncProductsForPlan);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [slotFilter, setSlotFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"order" | "priceAsc" | "priceDesc">("order");
    const [isSyncing, setIsSyncing] = useState(false);
    const [bulkDiscounts, setBulkDiscounts] = useState<Record<number, number>>({
        1: 0, 2: 0, 3: 0, 4: 0, 6: 0
    });
    const [selectedIds, setSelectedIds] = useState<Set<Id<"products">>>(new Set());

    // Care Product states
    const [isCareModalOpen, setIsCareModalOpen] = useState(false);
    const [editingCareProduct, setEditingCareProduct] = useState<Partial<CareProduct> | null>(null);
    const [syncingPlanId, setSyncingPlanId] = useState<string | null>(null);

    const categories = products
        ? (Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]).sort((a, b) => {
            const order = ["TV/디지털", "냉장가전", "주방가전", "생활가전", "에어컨/에어케어", "세탁가전", "건강/뷰티", "가구/침대", "기타가전"];
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA === -1 && idxB === -1) return a.localeCompare(b);
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        })
        : ["TV/디지털", "냉장가전", "주방가전", "생활가전", "에어컨/에어케어", "세탁가전", "건강/뷰티", "가구/침대", "기타가전"];
    const slots = [1, 2, 3, 4, 6];

    const filteredProducts = (products || [])
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 p.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
            const matchesSlot = slotFilter === "all" || (p.slotCount || 4).toString() === slotFilter;
            return matchesSearch && matchesCategory && matchesSlot;
        })
        .sort((a, b) => {
            if (sortBy === "priceAsc") {
                return (a.monthlyPayment ?? 0) - (b.monthlyPayment ?? 0);
            }
            if (sortBy === "priceDesc") {
                return (b.monthlyPayment ?? 0) - (a.monthlyPayment ?? 0);
            }
            if ((a.order ?? 0) !== (b.order ?? 0)) {
                return (a.order ?? 0) - (b.order ?? 0);
            }
            return a.name.localeCompare(b.name);
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
                category: editingProduct.category || "기타가전",
                slotCount: Number(editingProduct.slotCount) || 4,
                monthlyPayment: Number(editingProduct.monthlyPayment) || 0,
                cardDiscountPayment: Number(editingProduct.cardDiscountPayment) || 0,
                image: editingProduct.image || "",
                isVisible: editingProduct.isVisible ?? true,
                hasGift: editingProduct.hasGift ?? false,
                isBest: editingProduct.isBest ?? false,
                promotionId: editingProduct.promotionId,
            });
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleBulkSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updates = Object.entries(bulkDiscounts).map(([slotCount, amount]) => ({
                slotCount: Number(slotCount),
                cardDiscountPayment: amount
            }));
            await bulkUpdateCardDiscount({ updates });
            setIsBulkModalOpen(false);
            alert("구좌별 제휴카드 금액이 일괄 변경되었습니다.");
        } catch (error) {
            console.error(error);
            alert("일괄 변경 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: Id<"products">) => {
        if (confirm("정말로 삭제하시겠습니까?")) {
            await removeProduct({ id });
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) {
            alert("삭제할 제품을 선택해주세요.");
            return;
        }
        if (confirm(`선택한 ${selectedIds.size}개 제품을 정말로 삭제하시겠습니까?`)) {
            try {
                await removeProducts({ ids: Array.from(selectedIds) });
                setSelectedIds(new Set());
                alert("선택한 제품이 삭제되었습니다.");
            } catch (error) {
                console.error(error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleSelectAll = () => {
        const allFilteredIds = filteredProducts.map(p => p._id);
        const isAllSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p._id));
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (isAllSelected) {
                allFilteredIds.forEach(id => next.delete(id));
            } else {
                allFilteredIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    const handleSelectProduct = (id: Id<"products">) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleCareSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCareProduct) return;

        try {
            await upsertCareProduct({
                id: editingCareProduct._id,
                name: editingCareProduct.name || "",
                slotCount: Number(editingCareProduct.slotCount) || 4,
                target: editingCareProduct.target || "",
                monthlyPayment: Number(editingCareProduct.monthlyPayment) || 0,
                features: editingCareProduct.features || ["", "", ""],
                syncUrl: editingCareProduct.syncUrl || "",
                paymentCount: editingCareProduct.paymentCount || "",
                defermentPeriod: editingCareProduct.defermentPeriod || "",
                maturityCount: editingCareProduct.maturityCount || "",
            });
            setIsCareModalOpen(false);
            setEditingCareProduct(null);
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleCareDelete = async (id: Id<"careProducts">) => {
        if (confirm("정말로 삭제하시겠습니까?")) {
            await removeCareProduct({ id });
        }
    };

    const handleCareSync = async (plan: CareProduct) => {
        if (!plan.syncUrl) {
            alert("동기화 URL이 등록되지 않은 상품입니다.");
            return;
        }
        if (confirm(`"${plan.name}" 상품의 동기화 URL에서 제품 데이터를 실시간 동기화하시겠습니까?\n(해당 구좌(${plan.slotCount}구좌)의 기존 제품 정보가 초기화 됩니다.)`)) {
            try {
                setSyncingPlanId(plan._id);
                await syncProductsForPlan({ planId: plan._id });
                alert("실시간 제품 동기화가 완료되었습니다.");
            } catch (error: any) {
                console.error(error);
                alert(`동기화 중 오류가 발생했습니다: ${error.message || error}`);
            } finally {
                setSyncingPlanId(null);
            }
        }
    };

    const handleCareMove = async (plan: CareProduct, direction: 'up' | 'down') => {
        if (!careProducts) return;
        const index = careProducts.findIndex(p => p._id === plan._id);
        if (direction === 'up' && index > 0) {
            const prev = careProducts[index - 1];
            const currentOrder = plan.order || 0;
            const prevOrder = prev.order || 0;
            await updateCareOrder({ id: plan._id, order: prevOrder });
            await updateCareOrder({ id: prev._id, order: currentOrder });
        } else if (direction === 'down' && index < careProducts.length - 1) {
            const next = careProducts[index + 1];
            const currentOrder = plan.order || 0;
            const nextOrder = next.order || 0;
            await updateCareOrder({ id: plan._id, order: nextOrder });
            await updateCareOrder({ id: next._id, order: currentOrder });
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
            {/* 탭 네비게이션 */}
            <div className="flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/30 w-fit mb-6">
                <button
                    onClick={() => setSubTab("products")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                        subTab === "products"
                            ? "bg-white text-sono-primary shadow-sm border border-gray-100"
                            : "text-gray-400 hover:text-sono-dark"
                    }`}
                >
                    가전제품 관리
                </button>
                <button
                    onClick={() => setSubTab("care")}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                        subTab === "care"
                            ? "bg-white text-sono-primary shadow-sm border border-gray-100"
                            : "text-gray-400 hover:text-sono-dark"
                    }`}
                >
                    상품(플랜) 정보 관리
                </button>
            </div>

            {subTab === "products" ? (
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
                            {selectedIds.size > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-red-50 border border-red-500 text-red-500 font-bold px-6 py-3 rounded-2xl hover:bg-red-100 transition-all shadow-lg flex items-center gap-1.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    선택 삭제 ({selectedIds.size})
                                </button>
                            )}
                            <button
                                onClick={() => setIsBulkModalOpen(true)}
                                className="bg-white border border-sono-primary text-sono-primary font-bold px-6 py-3 rounded-2xl hover:bg-sono-primary/10 transition-all shadow-lg"
                            >
                                제휴카드 일괄 설정
                            </button>
                            <button
                                onClick={() => {
                                    setEditingProduct({
                                        isVisible: true,
                                        hasGift: false,
                                        slotCount: 4,
                                        category: "TV/디지털"
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
                            <option value="all">전체 상품</option>
                            {(careProducts || []).map(cp => (
                                <option key={cp._id} value={cp.slotCount.toString()}>
                                    {cp.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-[#f9fafb] border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-500 focus:ring-2 focus:ring-sono-primary"
                        >
                            <option value="order">기본 정렬 순서</option>
                            <option value="priceAsc">월납입금 낮은순</option>
                            <option value="priceDesc">월납입금 높은순</option>
                        </select>
                    </div>

                    {/* 리스트 섹션 */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 w-12 text-center">
                                            <input
                                                type="checkbox"
                                                checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedIds.has(p._id))}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-sono-primary focus:ring-sono-primary cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-20">이미지</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-32">브랜드/카테고리</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase">제품정보</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-40">상품명</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-right w-32">월 납입금</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-20">노출</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-20">베스트</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">프로모션</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">순서</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredProducts.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(product._id)}
                                                    onChange={() => handleSelectProduct(product._id)}
                                                    className="w-4 h-4 rounded border-gray-300 text-sono-primary focus:ring-sono-primary cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 p-1">
                                                    <img src={product.image} alt="" className="w-full h-full object-contain" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">[{product.brand}]</span>
                                                    <span className="text-sm font-bold text-sono-primary">{product.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-sono-dark leading-tight">{product.name}</span>
                                                    <span className="text-xs font-bold text-gray-400 mt-1 uppercase">{product.model}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block bg-sono-primary/10 text-sono-primary text-[11px] font-black px-2.5 py-1.5 rounded-lg border border-sono-primary/20 whitespace-nowrap">
                                                    {careProducts?.find(cp => cp.slotCount === product.slotCount)?.name || `${product.slotCount}구좌`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col whitespace-nowrap">
                                                    <span className="text-sm font-black text-sono-dark">{(product.monthlyPayment ?? 0).toLocaleString()}원</span>
                                                    <span className="text-[10px] font-bold text-red-500">카드할인: {(product.cardDiscountPayment ?? 0).toLocaleString()}원</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleVisibility({ id: product._id, isVisible: !product.isVisible })}
                                                    className={`w-12 h-6 rounded-full p-1 transition-all ${product.isVisible ? "bg-sono-primary" : "bg-gray-200"}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${product.isVisible ? "ml-6" : "ml-0"}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => toggleBest({ id: product._id, isBest: !product.isBest })}
                                                    className={`w-12 h-6 rounded-full p-1 transition-all ${product.isBest ? "bg-sono-gold" : "bg-gray-200"}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${product.isBest ? "ml-6" : "ml-0"}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${product.promotionId ? "bg-sono-primary/10 border-sono-primary text-sono-primary" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                                                    {product.promotionId ? "적용" : "미적용"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {sortBy === "order" ? (
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
                                                ) : (
                                                    <span className="text-gray-300 text-xs font-bold">-</span>
                                                )}
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
                                            <td colSpan={11} className="px-6 py-20 text-center text-gray-400 font-bold">
                                                검색된 제품이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-sono-dark tracking-tighter">상품(플랜) 정보 관리</h2>
                            <p className="text-gray-400 font-bold text-sm">
                                전체 <span className="text-sono-primary">{careProducts?.length || 0}</span>개의 상품이 등록되어 있습니다.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingCareProduct({
                                    name: "",
                                    slotCount: 4,
                                    target: "",
                                    monthlyPayment: 0,
                                    features: ["", "", ""],
                                    syncUrl: "",
                                    paymentCount: "",
                                    defermentPeriod: "",
                                    maturityCount: ""
                                });
                                setIsCareModalOpen(true);
                            }}
                            className="bg-sono-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-sono-dark transition-all shadow-lg"
                        >
                            새 상품 등록
                        </button>
                    </div>

                    {/* 상품 목록 테이블 */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1200px] table-fixed">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-48">상품명</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-24">구좌수</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-44">대상</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-40">납입 정보</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-right w-32">월 납입금</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-64">특장점 3개</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-60">동기화 URL</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-20">순서</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-48">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(careProducts || []).map((plan) => (
                                        <tr key={plan._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-sono-dark text-sm truncate" title={plan.name}>{plan.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-black px-2 py-1 rounded-md whitespace-nowrap">
                                                    {plan.slotCount}구좌
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-bold text-xs truncate" title={plan.target}>{plan.target}</td>
                                            <td className="px-6 py-4 text-gray-500 font-bold text-xs whitespace-nowrap">
                                                <div className="flex flex-col gap-0.5 text-xs text-gray-500 font-bold">
                                                    <span>납입: {plan.paymentCount || "-"}</span>
                                                    <span>거치: {plan.defermentPeriod || "-"}</span>
                                                    <span>만기: {plan.maturityCount || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-sono-dark text-sm whitespace-nowrap">
                                                {plan.monthlyPayment.toLocaleString()}원
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5 text-xs text-gray-500 font-medium">
                                                    {(plan.features || []).map((feat, idx) => (
                                                        <span key={idx} className="truncate block" title={feat}>• {feat || "-"}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-mono text-sono-primary truncate" title={plan.syncUrl}>
                                                    {plan.syncUrl || "미등록"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button
                                                        onClick={() => handleCareMove(plan, 'up')}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCareMove(plan, 'down')}
                                                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center items-center gap-2 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleCareSync(plan)}
                                                        disabled={syncingPlanId === plan._id}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                                            syncingPlanId === plan._id
                                                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                : "bg-sono-gold/10 border-sono-gold/20 text-sono-gold hover:bg-sono-gold hover:text-white"
                                                        }`}
                                                    >
                                                        {syncingPlanId === plan._id ? "동기화 중..." : "동기화"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingCareProduct({
                                                                ...plan,
                                                                features: plan.features && plan.features.length >= 3 ? plan.features : [...(plan.features || []), "", "", ""].slice(0, 3)
                                                            });
                                                            setIsCareModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="수정"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCareDelete(plan._id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="삭제"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!careProducts || careProducts.length === 0) && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-bold">
                                                등록된 상품 정보가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 가전제품 등록/수정 모달 */}
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
                                        value={editingProduct.category || "TV/디지털"}
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
                                <div className="col-span-2 flex gap-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingProduct.isVisible !== false}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, isVisible: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-sono-primary focus:ring-sono-primary cursor-pointer"
                                        />
                                        <span className="text-sm font-black text-sono-dark">사용자 페이지 노출</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editingProduct.isBest}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, isBest: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-sono-gold focus:ring-sono-gold cursor-pointer"
                                        />
                                        <span className="text-sm font-black text-sono-dark">베스트 상품 지정</span>
                                    </label>
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

            {/* 상품(플랜) 등록/수정 모달 */}
            {isCareModalOpen && editingCareProduct && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-sono-dark px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black tracking-tight">{editingCareProduct._id ? "상품 정보 수정" : "새 상품 등록"}</h3>
                            <button onClick={() => setIsCareModalOpen(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleCareSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">상품명</label>
                                    <input
                                        type="text"
                                        value={editingCareProduct.name || ""}
                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, name: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="예: 스마트케어 4더블"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">구좌수</label>
                                    <select
                                        value={editingCareProduct.slotCount || 4}
                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, slotCount: Number(e.target.value) })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-sono-primary"
                                    >
                                        {slots.map(s => <option key={s} value={s}>{s}구좌</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">대상</label>
                                    <input
                                        type="text"
                                        value={editingCareProduct.target || ""}
                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, target: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="예: 일반 가전 / 대형 가전"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">기본 월 납입금 (원)</label>
                                    <input
                                        type="text"
                                        value={editingCareProduct.monthlyPayment ? editingCareProduct.monthlyPayment.toLocaleString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, "");
                                            setEditingCareProduct({ ...editingCareProduct, monthlyPayment: val ? Number(val) : 0 });
                                        }}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary text-right"
                                        placeholder="예: 66,000"
                                        required
                                    />
                                </div>
                                <div className="col-span-2 grid grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-[20px] border border-gray-100">
                                    <div>
                                        <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">납입회차</label>
                                        <input
                                            type="text"
                                            value={editingCareProduct.paymentCount || ""}
                                            onChange={(e) => setEditingCareProduct({ ...editingCareProduct, paymentCount: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                            placeholder="예: 1~150회"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">거치기간</label>
                                        <input
                                            type="text"
                                            value={editingCareProduct.defermentPeriod || ""}
                                            onChange={(e) => setEditingCareProduct({ ...editingCareProduct, defermentPeriod: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                            placeholder="예: 151~180회"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">만기회차</label>
                                        <input
                                            type="text"
                                            value={editingCareProduct.maturityCount || ""}
                                            onChange={(e) => setEditingCareProduct({ ...editingCareProduct, maturityCount: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                            placeholder="예: 180회"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">특장점 3개</label>
                                    <div className="space-y-2">
                                        {[0, 1, 2].map((idx) => (
                                            <input
                                                key={idx}
                                                type="text"
                                                value={(editingCareProduct.features || [])[idx] || ""}
                                                onChange={(e) => {
                                                    const newFeatures = [...(editingCareProduct.features || ["", "", ""])];
                                                    newFeatures[idx] = e.target.value;
                                                    setEditingCareProduct({ ...editingCareProduct, features: newFeatures });
                                                }}
                                                className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                                placeholder={`특장점 ${idx + 1}`}
                                                required
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">제품 동기화 URL</label>
                                    <input
                                        type="text"
                                        value={editingCareProduct.syncUrl || ""}
                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, syncUrl: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-10">
                                <button
                                    type="button"
                                    onClick={() => setIsCareModalOpen(false)}
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

            {/* 제휴카드 일괄 설정 모달 */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="bg-sono-dark px-8 py-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-black tracking-tight">구좌별 제휴카드 금액 일괄 설정</h3>
                            <button onClick={() => setIsBulkModalOpen(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-8 pb-4">
                            <p className="text-sm font-bold text-gray-500 mb-6 bg-sono-primary/5 p-4 rounded-xl border border-sono-primary/10">
                                💡 여기에 설정된 금액은 동일한 구좌를 가진 <b>모든 제품</b>의 제휴카드 할인시 납입금으로 즉시 일괄 적용됩니다.
                            </p>
                        </div>
                        <form onSubmit={handleBulkSave} className="px-8 pb-8 space-y-4">
                            {slots.map(slot => (
                                <div key={slot} className="flex items-center justify-between p-4 bg-[#f9fafb] rounded-2xl">
                                    <label className="text-sm font-black text-sono-dark min-w-[80px]">{slot}구좌</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={bulkDiscounts[slot] || 0}
                                            onChange={(e) => setBulkDiscounts(prev => ({ ...prev, [slot]: Number(e.target.value) }))}
                                            className="w-40 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-right focus:ring-2 focus:ring-sono-primary"
                                        />
                                        <span className="text-sm font-bold text-gray-500">원</span>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(false)}
                                    className="px-6 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3.5 rounded-2xl font-bold bg-sono-primary text-white hover:bg-sono-dark transition-all shadow-xl shadow-sono-primary/20"
                                >
                                    일괄 변경하기
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
