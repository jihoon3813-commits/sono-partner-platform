"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import sampleProducts from "@/lib/seedData";
import { cleanProductName } from "@/lib/productUtils";

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
    careProductId?: Id<"careProducts"> | null;
}

interface CareProduct {
    _id: Id<"careProducts">;
    name: string;
    slotCount: number;
    target: string;
    monthlyPayment: number;
    cardDiscountPayment?: number;
    features: string[];
    syncUrl?: string;
    paymentCount?: string;
    defermentPeriod?: string;
    maturityCount?: string;
    order?: number;
    autoUpdate?: boolean;
    autoUpdateSchedule?: string;
    lastSyncedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

type SortField = "brand" | "category" | "model" | "name" | "monthlyPayment" | "order";
type SortDirection = "asc" | "desc";

interface SortRule {
    field: SortField;
    direction: SortDirection;
}

const DEFAULT_SORT_RULES: SortRule[] = [
    { field: "brand", direction: "asc" },
    { field: "category", direction: "asc" },
    { field: "model", direction: "asc" },
    { field: "name", direction: "asc" },
];

const SORT_FIELD_LABELS: Record<SortField, string> = {
    brand: "브랜드",
    category: "카테고리",
    model: "모델명",
    name: "제품명",
    monthlyPayment: "월납입금",
    order: "수동 등록순",
};

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
    const promotions = useQuery(api.promotions.get);

    // Care Products Queries & Mutations
    const careProducts = useQuery(api.careProducts.get);
    const upsertCareProduct = useMutation(api.careProducts.upsert);
    const removeCareProduct = useMutation(api.careProducts.remove);
    const updateCareOrder = useMutation(api.careProducts.updateOrder);
    const toggleCareAutoUpdate = useMutation(api.careProducts.toggleAutoUpdate);
    const syncProductsForPlan = useAction(api.products.syncProductsForPlan);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [sortRules, setSortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<Id<"products">>>(new Set());

    // Care Product states
    const [isCareModalOpen, setIsCareModalOpen] = useState(false);
    const [editingCareProduct, setEditingCareProduct] = useState<Partial<CareProduct> | null>(null);
    const [syncingPlanId, setSyncingPlanId] = useState<string | null>(null);

    // Product Drag & Drop Reordering states
    const reorderProducts = useMutation(api.products.reorderProducts);
    const [draggedProductId, setDraggedProductId] = useState<Id<"products"> | null>(null);
    const [dragOverProductId, setDragOverProductId] = useState<Id<"products"> | null>(null);

    const handleDragStart = (e: React.DragEvent, id: Id<"products">) => {
        setDraggedProductId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragOver = (e: React.DragEvent, id: Id<"products">) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverProductId !== id) {
            setDragOverProductId(id);
        }
    };

    const handleDragLeave = () => {
        setDragOverProductId(null);
    };

    const handleDrop = async (e: React.DragEvent, targetId: Id<"products">) => {
        e.preventDefault();
        setDragOverProductId(null);
        if (!draggedProductId || draggedProductId === targetId) return;

        const currentList = [...filteredProducts];
        const dragIndex = currentList.findIndex(p => p._id === draggedProductId);
        const targetIndex = currentList.findIndex(p => p._id === targetId);

        if (dragIndex === -1 || targetIndex === -1) return;

        const [movedItem] = currentList.splice(dragIndex, 1);
        currentList.splice(targetIndex, 0, movedItem);

        const orderedIds = currentList.map(p => p._id);
        setDraggedProductId(null);

        await reorderProducts({ orderedIds });
    };

    const formatSimpleDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}.${month}.${day} ${hours}:${minutes}`;
        } catch {
            return dateStr;
        }
    };

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

    const updateSortRuleField = (index: number, field: SortField) => {
        setSortRules(prev => {
            const next = [...prev];
            next[index] = { ...next[index], field };
            return next;
        });
    };

    const updateSortRuleDirection = (index: number, direction: SortDirection) => {
        setSortRules(prev => {
            const next = [...prev];
            next[index] = { ...next[index], direction };
            return next;
        });
    };

    const resetSortRules = () => {
        setSortRules([
            { field: "brand", direction: "asc" },
            { field: "category", direction: "asc" },
            { field: "model", direction: "asc" },
            { field: "name", direction: "asc" },
        ]);
    };

    const compareProductsByRules = (a: Product, b: Product, rules: SortRule[]) => {
        // 1. 베스트 상품 최상단 고정 (베스트 설정 제품은 항상 맨 위)
        const aBest = !!a.isBest;
        const bBest = !!b.isBest;
        if (aBest && !bBest) return -1;
        if (!aBest && bBest) return 1;

        // 2. 베스트 상품끼리는 정렬 기준(브랜드/카테고리/모델/제품명)을 적용하지 않고, 사용자가 지정한 수동 위치(order) 고정 유지
        if (aBest && bBest) {
            if ((a.order ?? 0) !== (b.order ?? 0)) {
                return (a.order ?? 0) - (b.order ?? 0);
            }
            return (a.name || "").localeCompare(b.name || "", "ko");
        }

        // 3. 일반 상품들만 1순위 -> 2순위 -> 3순위 -> 4순위 정렬 순차 적용
        for (const rule of rules) {
            let cmp = 0;
            const dir = rule.direction === "asc" ? 1 : -1;

            switch (rule.field) {
                case "brand":
                    cmp = (a.brand || "").localeCompare(b.brand || "", "ko");
                    break;
                case "category":
                    cmp = (a.category || "").localeCompare(b.category || "", "ko");
                    break;
                case "model":
                    cmp = (a.model || "").localeCompare(b.model || "", "ko");
                    break;
                case "name":
                    cmp = (a.name || "").localeCompare(b.name || "", "ko");
                    break;
                case "monthlyPayment":
                    cmp = (a.monthlyPayment ?? 0) - (b.monthlyPayment ?? 0);
                    break;
                case "order":
                    cmp = (a.order ?? 0) - (b.order ?? 0);
                    break;
            }

            if (cmp !== 0) {
                return cmp * dir;
            }
        }

        return (a.name || "").localeCompare(b.name || "", "ko");
    };

    const filteredProducts = (products || [])
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 p.brand.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
            const matchesPlan = planFilter === "all" || 
                                p.careProductId === planFilter || 
                                (!p.careProductId && (p.slotCount || 4).toString() === planFilter);
            return matchesSearch && matchesCategory && matchesPlan;
        })
        .sort((a, b) => compareProductsByRules(a, b, sortRules));


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
                careProductId: editingProduct.careProductId,
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

    const handleToggleBest = async (e: React.MouseEvent, id: Id<"products">, currentIsBest: boolean) => {
        e.preventDefault();
        e.stopPropagation();

        const currentScrollY = window.scrollY || document.documentElement.scrollTop;

        try {
            await toggleBest({ id, isBest: !currentIsBest });
        } finally {
            const restoreScroll = () => {
                window.scrollTo({ top: currentScrollY, behavior: "instant" as ScrollBehavior });
            };
            restoreScroll();
            requestAnimationFrame(restoreScroll);
            setTimeout(restoreScroll, 50);
            setTimeout(restoreScroll, 150);
        }
    };

    const handleToggleVisibility = async (e: React.MouseEvent, id: Id<"products">, currentIsVisible: boolean) => {
        e.preventDefault();
        e.stopPropagation();

        const currentScrollY = window.scrollY || document.documentElement.scrollTop;

        try {
            await toggleVisibility({ id, isVisible: !currentIsVisible });
        } finally {
            const restoreScroll = () => {
                window.scrollTo({ top: currentScrollY, behavior: "instant" as ScrollBehavior });
            };
            restoreScroll();
            requestAnimationFrame(restoreScroll);
            setTimeout(restoreScroll, 50);
            setTimeout(restoreScroll, 150);
        }
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
                cardDiscountPayment: Number(editingCareProduct.cardDiscountPayment) || 0,
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
        const urls = (plan.syncUrl || "").split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
        if (urls.length === 0) {
            alert("동기화 URL이 등록되지 않은 상품입니다.");
            return;
        }
        const urlMessage = urls.length > 1
            ? `등록된 ${urls.length}개의 동기화 URL에서`
            : `동기화 URL에서`;

        if (confirm(`"${plan.name}" 상품의 ${urlMessage} 제품 데이터를 실시간 동기화하시겠습니까?\n(해당 구좌(${plan.slotCount}구좌)의 기존 제품 정보가 초기화 후 새로 동기화됩니다.)`)) {
            try {
                setSyncingPlanId(plan._id);
                await syncProductsForPlan({ planId: plan._id });
                alert(`"${plan.name}" 상품의 실시간 제품 동기화가 완료되었습니다.`);
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
            let currentOrder = product.order ?? (index + 1);
            let prevOrder = prev.order ?? index;
            if (currentOrder === prevOrder) {
                currentOrder = index + 1;
                prevOrder = index;
            }
            await updateOrder({ id: product._id, order: prevOrder });
            await updateOrder({ id: prev._id, order: currentOrder });
        } else if (direction === 'down' && index < filteredProducts.length - 1) {
            const next = filteredProducts[index + 1];
            let currentOrder = product.order ?? (index + 1);
            let nextOrder = next.order ?? (index + 2);
            if (currentOrder === nextOrder) {
                currentOrder = index + 1;
                nextOrder = index + 2;
            }
            await updateOrder({ id: product._id, order: nextOrder });
            await updateOrder({ id: next._id, order: nextOrder });
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

                    {/* 필터 & 다중 정렬 섹션 */}
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
                        <div className="flex flex-wrap gap-4 items-center">
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
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="bg-[#f9fafb] border-none rounded-xl py-3 px-4 text-sm font-bold text-gray-500 focus:ring-2 focus:ring-sono-primary"
                            >
                                <option value="all">전체 상품</option>
                                {(careProducts || []).map(cp => (
                                    <option key={cp._id} value={cp._id}>
                                        {cp.name} ({cp.slotCount}구좌)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 1순위~4순위 다중 우선순위 정렬 설정 박스 */}
                        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-sono-dark flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                        </svg>
                                        우선순위 다중 정렬 설정
                                    </span>
                                    <span className="bg-sono-gold/20 text-sono-dark text-[10px] font-black px-2 py-0.5 rounded-full border border-sono-gold/40">
                                        ★ 베스트 제품 최상단 수동 위치 고정 (다중 정렬 제외)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={resetSortRules}
                                    className="text-xs font-bold text-gray-500 hover:text-sono-primary underline transition-colors"
                                >
                                    기본 정렬로 초기화 (브랜드-카테고리-모델명-제품명)
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {([0, 1, 2, 3] as const).map((idx) => {
                                    const rule = sortRules[idx] || DEFAULT_SORT_RULES[idx];
                                    return (
                                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-xs flex items-center gap-2">
                                            <span className="text-xs font-black text-sono-primary shrink-0 whitespace-nowrap bg-sono-primary/10 px-2.5 py-1 rounded-md">
                                                {idx + 1}순위
                                            </span>
                                            <select
                                                value={rule.field}
                                                onChange={(e) => updateSortRuleField(idx, e.target.value as SortField)}
                                                className="bg-transparent text-xs font-bold text-sono-dark border-none focus:ring-0 p-0 flex-1 cursor-pointer"
                                            >
                                                {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map((fKey) => (
                                                    <option key={fKey} value={fKey}>
                                                        {SORT_FIELD_LABELS[fKey]}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => updateSortRuleDirection(idx, rule.direction === "asc" ? "desc" : "asc")}
                                                className={`text-xs font-black px-2.5 py-1 rounded-md border transition-all whitespace-nowrap flex items-center gap-1 ${
                                                    rule.direction === "asc"
                                                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                                        : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                                                }`}
                                                title={rule.direction === "asc" ? "오름차순 (가나다/작은순)" : "내림차순 (다나가/큰순)"}
                                            >
                                                {rule.direction === "asc" ? "▲ 오름" : "▼ 내림"}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 리스트 섹션 */}
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-3 py-4 w-10 text-center text-gray-400 text-xs">드래그</th>
                                        <th className="px-4 py-4 w-10 text-center">
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
                                    {filteredProducts.map((product) => {
                                        const isDragging = draggedProductId === product._id;
                                        const isDragOver = dragOverProductId === product._id;
                                        return (
                                            <tr
                                                key={product._id}
                                                draggable={product.isBest || sortRules[0]?.field === "order"}
                                                onDragStart={(e) => handleDragStart(e, product._id)}
                                                onDragOver={(e) => handleDragOver(e, product._id)}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, product._id)}
                                                className={`transition-all duration-150 ${
                                                    isDragging ? "opacity-30 bg-indigo-50/50" : ""
                                                } ${
                                                    isDragOver ? "bg-indigo-50 border-t-2 border-t-indigo-600 ring-2 ring-indigo-500/20" : "hover:bg-gray-50/50"
                                                }`}
                                            >
                                                {/* 드래그 핸들 */}
                                                <td className="px-3 py-4 text-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-indigo-600 transition-colors" title="드래그하여 순서 변경">
                                                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 7a2 2 0 11-4 0 2 2 0 014 0zM9 12a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0zM19 7a2 2 0 11-4 0 2 2 0 014 0zM19 12a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </td>
                                                <td className="px-4 py-4 text-center">
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
                                                    <span className="text-sm font-black text-sono-dark leading-tight">{cleanProductName(product.name, product.brand)}</span>
                                                    <span className="text-xs font-bold text-gray-400 mt-1 uppercase">{product.model}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block bg-sono-primary/10 text-sono-primary text-[11px] font-black px-2.5 py-1.5 rounded-lg border border-sono-primary/20 whitespace-nowrap">
                                                    {careProducts?.find(cp => cp._id === product.careProductId)?.name || 
                                                     careProducts?.find(cp => cp.slotCount === product.slotCount)?.name || 
                                                     `${product.slotCount}구좌`}
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
                                                    type="button"
                                                    onClick={(e) => handleToggleVisibility(e, product._id, product.isVisible ?? true)}
                                                    className={`w-12 h-6 rounded-full p-1 transition-all ${product.isVisible ? "bg-sono-primary" : "bg-gray-200"}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${product.isVisible ? "ml-6" : "ml-0"}`}></div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleToggleBest(e, product._id, product.isBest ?? false)}
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
                                                {product.isBest || sortRules[0]?.field === "order" ? (
                                                    <div className="flex justify-center gap-1">
                                                        <button 
                                                            onClick={() => handleMove(product, 'up')}
                                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                                            title="위로 이동"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMove(product, 'down')}
                                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-sono-primary transition-colors"
                                                            title="아래로 이동"
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
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className="px-6 py-20 text-center text-gray-400 font-bold">
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
                                    cardDiscountPayment: 0,
                                    features: ["", "", ""],
                                    syncUrl: "",
                                    paymentCount: "",
                                    defermentPeriod: "",
                                    maturityCount: "",
                                    autoUpdate: true,
                                    autoUpdateSchedule: "00:00"
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
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-44">상품명</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-20">구좌수</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-right w-28">월 납입금</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-48">자동 업데이트 설정</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-40">최근 동기화</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase w-48">동기화 URL</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-16">순서</th>
                                        <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase text-center w-44">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(careProducts || []).map((plan) => (
                                        <tr key={plan._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-black text-sono-dark text-sm truncate" title={plan.name}>
                                                <div className="flex flex-col">
                                                    <span>{plan.name}</span>
                                                    <span className="text-[11px] font-bold text-gray-400">{plan.target}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block bg-gray-100 text-gray-600 text-[11px] font-black px-2 py-1 rounded-md whitespace-nowrap">
                                                    {plan.slotCount}구좌
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex flex-col text-right">
                                                    <span className="font-black text-sono-dark text-sm">{plan.monthlyPayment.toLocaleString()}원</span>
                                                    {plan.cardDiscountPayment ? (
                                                        <span className="text-[11px] font-bold text-sono-primary">card -{plan.cardDiscountPayment.toLocaleString()}원</span>
                                                    ) : null}
                                                </div>
                                            </td>

                                            {/* 자동 업데이트 설정 컬럼 */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                const nextState = !(plan.autoUpdate ?? false);
                                                                await toggleCareAutoUpdate({
                                                                    id: plan._id,
                                                                    autoUpdate: nextState
                                                                });
                                                            }}
                                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                                plan.autoUpdate ? "bg-emerald-500" : "bg-gray-200"
                                                            }`}
                                                            title={plan.autoUpdate ? "자동 업데이트 사용 중 (클릭 시 끄기)" : "자동 업데이트 꺼짐 (클릭 시 켜기)"}
                                                        >
                                                            <span
                                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                                    plan.autoUpdate ? "translate-x-5" : "translate-x-0"
                                                                }`}
                                                            />
                                                        </button>
                                                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                                            plan.autoUpdate 
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                                                                : "bg-gray-100 text-gray-400"
                                                        }`}>
                                                            {plan.autoUpdate ? "자동 켜짐" : "꺼짐"}
                                                        </span>
                                                    </div>

                                                    {/* 주기 선택 및 분단위 직접 지정 */}
                                                    <div className="flex flex-col items-center gap-1.5 mt-1">
                                                        <select
                                                            value={["00:00", "12:00", "both"].includes(plan.autoUpdateSchedule || "") ? plan.autoUpdateSchedule : "custom"}
                                                            onChange={async (e) => {
                                                                const val = e.target.value;
                                                                if (val === "custom") {
                                                                    await toggleCareAutoUpdate({
                                                                        id: plan._id,
                                                                        autoUpdateSchedule: "09:00"
                                                                    });
                                                                } else {
                                                                    await toggleCareAutoUpdate({
                                                                        id: plan._id,
                                                                        autoUpdateSchedule: val
                                                                    });
                                                                }
                                                            }}
                                                            disabled={!plan.autoUpdate}
                                                            className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
                                                                plan.autoUpdate 
                                                                    ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300" 
                                                                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                                                            }`}
                                                        >
                                                            <option value="00:00">매일 00:00 (AM 0시)</option>
                                                            <option value="12:00">매일 12:00 (PM 12시)</option>
                                                            <option value="both">매일 0시 & 12시</option>
                                                            <option value="custom">⏱️ 분단위 직접설정</option>
                                                        </select>

                                                        {plan.autoUpdate && !["00:00", "12:00", "both"].includes(plan.autoUpdateSchedule || "") && (
                                                            <div className="flex items-center gap-1 bg-indigo-50/80 border border-indigo-200/90 px-2 py-1 rounded-lg shadow-2xs">
                                                                <span className="text-[10px] font-bold text-indigo-700">시간:</span>
                                                                <input
                                                                    type="time"
                                                                    value={plan.autoUpdateSchedule || "09:00"}
                                                                    onChange={async (e) => {
                                                                        if (e.target.value) {
                                                                            await toggleCareAutoUpdate({
                                                                                id: plan._id,
                                                                                autoUpdateSchedule: e.target.value
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="text-xs font-black text-indigo-900 bg-white border border-indigo-200 rounded px-1.5 py-0.5 font-mono focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                                                    title="분단위 시간 설정 (HH:mm)"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 최근 업데이트 간략날짜 컬럼 */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="flex flex-col items-center">
                                                    {plan.lastSyncedAt ? (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                                                                동기화 완료
                                                            </span>
                                                            <span className="text-xs font-mono font-bold text-gray-700">
                                                                {formatSimpleDate(plan.lastSyncedAt)}
                                                            </span>
                                                        </div>
                                                    ) : plan.updatedAt ? (
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                수정일
                                                            </span>
                                                            <span className="text-xs font-mono text-gray-500">
                                                                {formatSimpleDate(plan.updatedAt)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-300">미동기화</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const urls = (plan.syncUrl || "").split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
                                                    if (urls.length === 0) {
                                                        return <div className="text-xs font-mono text-gray-400">미등록</div>;
                                                    }
                                                    if (urls.length === 1) {
                                                        return (
                                                            <div className="text-xs font-mono text-sono-primary truncate max-w-[150px]" title={urls[0]}>
                                                                {urls[0]}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full w-fit">
                                                                {urls.length}개 URL 등록됨
                                                            </span>
                                                            <div className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]" title={urls.join("\n")}>
                                                                {urls[0]} 외 {urls.length - 1}개
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
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
                                            <td colSpan={10} className="px-6 py-20 text-center text-gray-400 font-bold">
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
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">연결 상품(플랜)</label>
                                    <select
                                        value={editingProduct.careProductId || ""}
                                        onChange={(e) => {
                                            const planId = e.target.value;
                                            const selectedPlan = careProducts?.find(cp => cp._id === planId);
                                            setEditingProduct({
                                                ...editingProduct,
                                                careProductId: planId ? planId as Id<"careProducts"> : null,
                                                slotCount: selectedPlan ? selectedPlan.slotCount : editingProduct.slotCount,
                                                monthlyPayment: selectedPlan ? selectedPlan.monthlyPayment : editingProduct.monthlyPayment,
                                                cardDiscountPayment: selectedPlan 
                                                    ? Math.max(0, selectedPlan.monthlyPayment - (selectedPlan.cardDiscountPayment || 0))
                                                    : editingProduct.cardDiscountPayment
                                            });
                                        }}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-sono-primary"
                                        required
                                    >
                                        <option value="">선택 안 함</option>
                                        {careProducts?.map(cp => (
                                            <option key={cp._id} value={cp._id}>
                                                {cp.name} ({cp.slotCount}구좌)
                                            </option>
                                        ))}
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
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-xs font-bold text-[#8b95a1] mb-2 block ml-1">제휴카드 할인금액 (원)</label>
                                    <input
                                        type="text"
                                        value={editingCareProduct.cardDiscountPayment ? editingCareProduct.cardDiscountPayment.toLocaleString() : ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, "");
                                            setEditingCareProduct({ ...editingCareProduct, cardDiscountPayment: val ? Number(val) : 0 });
                                        }}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary text-right"
                                        placeholder="예: 42,000"
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
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label className="text-xs font-bold text-[#8b95a1]">제품 동기화 URL (다중 등록 지원)</label>
                                        <span className="text-[11px] text-indigo-500 font-medium">엔터(줄바꿈) 또는 쉼표로 구분</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={editingCareProduct.syncUrl || ""}
                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, syncUrl: e.target.value })}
                                        className="w-full bg-[#f9fafb] border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary resize-y font-mono"
                                        placeholder={`https://domain.com/api/v2/models?code=008001\nhttps://domain.com/api/v2/models?code=008002`}
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1 ml-1 font-medium">
                                        * 여러 동기화 URL을 등록하면 해당 URL들의 제품 데이터가 자동으로 하나로 합쳐져 동기화됩니다.
                                    </p>
                                </div>

                                {/* 자동 동기화 업데이트 설정 */}
                                <div className="col-span-2 bg-indigo-50/40 p-5 rounded-[24px] border border-indigo-100/60 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-black text-indigo-950 flex items-center gap-2">
                                                <span>🔄 자동 동기화 업데이트 설정</span>
                                            </h4>
                                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                                                등록된 동기화 URL에서 지정된 시간(한국시각)마다 자동으로 최신 가전을 가져옵니다.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingCareProduct({ ...editingCareProduct, autoUpdate: !editingCareProduct.autoUpdate })}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                                    editingCareProduct.autoUpdate ? "bg-emerald-500" : "bg-gray-200"
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        editingCareProduct.autoUpdate ? "translate-x-5" : "translate-x-0"
                                                    }`}
                                                />
                                            </button>
                                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                                                editingCareProduct.autoUpdate ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                                            }`}>
                                                {editingCareProduct.autoUpdate ? "자동 켜짐" : "꺼짐"}
                                            </span>
                                        </div>
                                    </div>

                                    {editingCareProduct.autoUpdate && (
                                        <div className="pt-3 border-t border-indigo-100/80 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <label className="text-xs font-bold text-indigo-900">업데이트 주기 (한국시각 KST)</label>
                                                <select
                                                    value={["00:00", "12:00", "both"].includes(editingCareProduct.autoUpdateSchedule || "") ? editingCareProduct.autoUpdateSchedule : "custom"}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === "custom") {
                                                            setEditingCareProduct({ ...editingCareProduct, autoUpdateSchedule: "09:00" });
                                                        } else {
                                                            setEditingCareProduct({ ...editingCareProduct, autoUpdateSchedule: val });
                                                        }
                                                    }}
                                                    className="bg-white border border-indigo-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500"
                                                >
                                                    <option value="00:00">매일 00:00 (한국시각 AM 0시)</option>
                                                    <option value="12:00">매일 12:00 (한국시각 PM 12시)</option>
                                                    <option value="both">매일 00시 & 12시 (1일 2회)</option>
                                                    <option value="custom">⏱️ 사용자 지정 분단위 시간</option>
                                                </select>
                                            </div>

                                            {!["00:00", "12:00", "both"].includes(editingCareProduct.autoUpdateSchedule || "") && (
                                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-200">
                                                    <span className="text-xs font-bold text-gray-600">희망 시간 (분단위 선택):</span>
                                                    <input
                                                        type="time"
                                                        value={editingCareProduct.autoUpdateSchedule || "09:00"}
                                                        onChange={(e) => setEditingCareProduct({ ...editingCareProduct, autoUpdateSchedule: e.target.value })}
                                                        className="bg-indigo-50 border border-indigo-300 text-indigo-900 rounded-lg px-3 py-1.5 text-sm font-black font-mono focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-[11px] text-gray-400 font-medium">예: 09:30, 14:15, 23:45</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
        </div>
    );
}
