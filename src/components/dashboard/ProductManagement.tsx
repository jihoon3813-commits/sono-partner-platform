"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import sampleProducts from "@/lib/seedData";
import { cleanProductName } from "@/lib/productUtils";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

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
    productType?: "combination" | "standard" | string;
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
    const [subTab, setSubTab] = useState<"products" | "care">("care");

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

    // System Settings Queries & Mutations
    const sortRulesSetting = useQuery(api.settings.getSetting, { key: "product_sort_rules" });
    const updateSetting = useMutation(api.settings.updateSetting);

    // Care Products Queries & Mutations
    const careProducts = useQuery(api.careProducts.get);
    const upsertCareProduct = useMutation(api.careProducts.upsert);
    const removeCareProduct = useMutation(api.careProducts.remove);
    const updateCareOrder = useMutation(api.careProducts.updateOrder);
    const toggleCareAutoUpdate = useMutation(api.careProducts.toggleAutoUpdate);
    const seedDefaultCareProducts = useMutation(api.careProducts.seedDefaultCareProducts);
    const syncProductsForPlan = useAction(api.products.syncProductsForPlan);

    useEffect(() => {
        if (careProducts !== undefined) {
            const hasHappy450 = careProducts.some(p => p.name.includes("더해피450") || p.name.includes("더 해피"));
            if (!hasHappy450) {
                seedDefaultCareProducts().catch(() => {
                    upsertCareProduct({
                        name: "더해피450 ONE",
                        productType: "standard",
                        slotCount: 1,
                        target: "일반 상조 및 8가지 라이프케어 전환",
                        monthlyPayment: 22500,
                        cardDiscountPayment: 10000,
                        features: ["만기 200회 납입 시 100% 환급 보장", "여행·크루즈·골프 등 8가지 라이프케어 전환", "소노 멤버십 & GC 헬스케어 특별 혜택"],
                        paymentCount: "1~150회",
                        defermentPeriod: "151~200회",
                        maturityCount: "200회",
                        order: 1,
                        autoUpdate: false,
                    }).catch(console.error);
                });
            }
        }
    }, [careProducts, seedDefaultCareProducts, upsertCareProduct]);

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

    // Care Product Drag & Drop Reordering states
    const reorderCareProducts = useMutation(api.careProducts.reorderCareProducts);
    const [draggedCareProductId, setDraggedCareProductId] = useState<Id<"careProducts"> | null>(null);
    const [dragOverCareProductId, setDragOverCareProductId] = useState<Id<"careProducts"> | null>(null);

    const sortedCareProducts = useMemo(() => {
        return [...(careProducts || [])].sort((a, b) => (a.order || 99) - (b.order || 99));
    }, [careProducts]);

    const handleCareDragStart = (e: React.DragEvent, id: Id<"careProducts">) => {
        setDraggedCareProductId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", id);
    };

    const handleCareDragOver = (e: React.DragEvent, id: Id<"careProducts">) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverCareProductId !== id) {
            setDragOverCareProductId(id);
        }
    };

    const handleCareDragLeave = () => {
        setDragOverCareProductId(null);
    };

    const handleCareDrop = async (e: React.DragEvent, targetId: Id<"careProducts">) => {
        e.preventDefault();
        setDragOverCareProductId(null);
        if (!draggedCareProductId || draggedCareProductId === targetId || !careProducts) return;

        const currentList = [...sortedCareProducts];
        const dragIndex = currentList.findIndex(p => p._id === draggedCareProductId);
        const targetIndex = currentList.findIndex(p => p._id === targetId);

        if (dragIndex === -1 || targetIndex === -1) return;

        const [movedItem] = currentList.splice(dragIndex, 1);
        currentList.splice(targetIndex, 0, movedItem);

        const orderedIds = currentList.map(p => p._id);
        setDraggedCareProductId(null);

        await reorderCareProducts({ orderedIds });
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

    useEffect(() => {
        if (sortRulesSetting?.value) {
            try {
                const parsed = JSON.parse(sortRulesSetting.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSortRules(parsed);
                }
            } catch (e) {
                console.error("Failed to parse saved sort rules", e);
            }
        }
    }, [sortRulesSetting]);

    const saveSortRules = (newRules: SortRule[]) => {
        setSortRules(newRules);
        updateSetting({
            key: "product_sort_rules",
            value: JSON.stringify(newRules),
        });
    };

    const updateSortRuleField = (index: number, field: SortField) => {
        const next = [...sortRules];
        next[index] = { ...next[index], field };
        saveSortRules(next);
    };

    const updateSortRuleDirection = (index: number, direction: SortDirection) => {
        const next = [...sortRules];
        next[index] = { ...next[index], direction };
        saveSortRules(next);
    };

    const resetSortRules = () => {
        const defaultRules: SortRule[] = [
            { field: "brand", direction: "asc" },
            { field: "category", direction: "asc" },
            { field: "model", direction: "asc" },
            { field: "name", direction: "asc" },
        ];
        saveSortRules(defaultRules);
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
                productType: editingCareProduct.productType || "combination",
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
        <div className="space-y-4">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · PRODUCTS</div>
                    <h1>상품관리</h1>
                    <p>
                        소노아임레디 상조·결합 상품 플랜과 연동 가전제품 구성을 관리합니다.
                    </p>
                </div>
                <div className="adm-heading-buttons">
                    <div className="adm-segmented">
                        <button
                            type="button"
                            onClick={() => setSubTab("care")}
                            className={subTab === "care" ? "active" : ""}
                        >
                            상품(플랜) 관리 ({careProducts?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab("products")}
                            className={subTab === "products" ? "active" : ""}
                        >
                            결합제품 관리 ({products?.length || 0})
                        </button>
                    </div>

                    {subTab === "care" ? (
                        <button
                            type="button"
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
                                    autoUpdateSchedule: "00:00",
                                });
                                setIsCareModalOpen(true);
                            }}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="plus" />
                            <span>새 상품 등록</span>
                        </button>
                    ) : (
                        <>
                            {selectedIds.size > 0 && (
                                <button
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="adm-btn danger"
                                >
                                    <AdminIcon name="trash" />
                                    <span>선택 삭제 ({selectedIds.size})</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingProduct({
                                        isVisible: true,
                                        hasGift: false,
                                        slotCount: 4,
                                        category: "TV/디지털",
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="adm-btn primary"
                            >
                                <AdminIcon name="plus" />
                                <span>제품 개별 등록</span>
                            </button>
                        </>
                    )}
                </div>
            </section>

            {subTab === "products" ? (
                <section className="adm-panel">
                    {/* 필터 바 */}
                    <div className="adm-filter-bar">
                        <label className="adm-search-field">
                            <AdminIcon name="search" />
                            <input
                                type="text"
                                placeholder="제품명, 모델명, 브랜드 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </label>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="adm-select"
                        >
                            <option value="all">전체 카테고리</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="adm-select"
                        >
                            <option value="all">전체 연결 상품</option>
                            {(careProducts || []).map((cp) => (
                                <option key={cp._id} value={cp._id}>
                                    {cp.name} ({cp.slotCount}구좌)
                                </option>
                            ))}
                        </select>

                        <div className="adm-filter-end">
                            <span>
                                전체 {products?.length || 0}개 중{" "}
                                <strong className="text-[#295e52]">
                                    {filteredProducts.length}
                                </strong>
                                개 표시
                            </span>
                        </div>
                    </div>

                    {/* 1순위~4순위 다중 우선순위 정렬 바 */}
                    <div className="px-5 py-3.5 bg-[#fafbf8] border-b border-[#edf0e7] space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#263d36]">
                                    우선순위 다중 정렬 기준
                                </span>
                                <span className="adm-pill orange">
                                    ★ 베스트 지정 제품은 최상단 수동 위치 고정
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={resetSortRules}
                                className="text-xs font-semibold text-[#6b7768] hover:text-[#295e52] underline cursor-pointer bg-transparent border-0"
                            >
                                기본 정렬로 초기화 (브랜드-카테고리-모델명-제품명)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {([0, 1, 2, 3] as const).map((idx) => {
                                const rule =
                                    sortRules[idx] || DEFAULT_SORT_RULES[idx];
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white px-2.5 py-1.5 rounded-[8px] border border-[#dfe5d9] flex items-center gap-2"
                                    >
                                        <span className="adm-pill green !py-0.5 !px-2">
                                            {idx + 1}순위
                                        </span>
                                        <select
                                            value={rule.field}
                                            onChange={(e) =>
                                                updateSortRuleField(
                                                    idx,
                                                    e.target.value as SortField
                                                )
                                            }
                                            className="bg-transparent text-xs font-bold text-[#263d36] border-0 outline-none flex-1 cursor-pointer"
                                        >
                                            {(
                                                Object.keys(
                                                    SORT_FIELD_LABELS
                                                ) as SortField[]
                                            ).map((fKey) => (
                                                <option key={fKey} value={fKey}>
                                                    {SORT_FIELD_LABELS[fKey]}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateSortRuleDirection(
                                                    idx,
                                                    rule.direction === "asc"
                                                        ? "desc"
                                                        : "asc"
                                                )
                                            }
                                            className="adm-btn small !py-0.5 !px-2 !min-h-[24px]"
                                        >
                                            {rule.direction === "asc"
                                                ? "▲ 오름"
                                                : "▼ 내림"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 결합제품 테이블 */}
                    <div className="adm-table-scroll">
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th className="w-10 text-center">이동</th>
                                    <th className="w-10 text-center">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredProducts.length > 0 &&
                                                filteredProducts.every((p) =>
                                                    selectedIds.has(p._id)
                                                )
                                            }
                                            onChange={handleSelectAll}
                                            className="w-3.5 h-3.5 cursor-pointer"
                                        />
                                    </th>
                                    <th className="w-16">이미지</th>
                                    <th>브랜드 · 카테고리</th>
                                    <th>제품명 · 모델명</th>
                                    <th className="text-center">연결 상품</th>
                                    <th className="text-right">월 납입금</th>
                                    <th className="text-center">노출</th>
                                    <th className="text-center">베스트</th>
                                    <th className="text-center">프로모션</th>
                                    <th className="text-center">순서</th>
                                    <th className="text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const isDragging =
                                        draggedProductId === product._id;
                                    const isDragOver =
                                        dragOverProductId === product._id;
                                    return (
                                        <tr
                                            key={product._id}
                                            draggable={true}
                                            onDragStart={(e) =>
                                                handleDragStart(e, product._id)
                                            }
                                            onDragOver={(e) =>
                                                handleDragOver(e, product._id)
                                            }
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) =>
                                                handleDrop(e, product._id)
                                            }
                                            className={`transition-all ${
                                                isDragging ? "opacity-40" : ""
                                            } ${
                                                isDragOver
                                                    ? "bg-[#eef3e8]"
                                                    : ""
                                            }`}
                                        >
                                            <td
                                                className="text-center cursor-grab active:cursor-grabbing text-[#9ba596] hover:text-[#295e52]"
                                                title="드래그하여 순서 변경"
                                            >
                                                ⋮⋮
                                            </td>
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(
                                                        product._id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectProduct(
                                                            product._id
                                                        )
                                                    }
                                                    className="w-3.5 h-3.5 cursor-pointer"
                                                />
                                            </td>
                                            <td>
                                                <div className="w-11 h-11 rounded-[7px] bg-[#f8f9f5] border border-[#e6eae3] p-1">
                                                    <img
                                                        src={product.image}
                                                        alt=""
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="adm-pill gray">
                                                        {product.brand}
                                                    </span>
                                                    <span className="text-xs font-bold text-[#295e52]">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-xs font-bold text-[#263d36]">
                                                    {cleanProductName(
                                                        product.name,
                                                        product.brand
                                                    )}
                                                </div>
                                                <div className="text-[11px] font-mono text-[#86918a] mt-0.5">
                                                    {product.model}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="adm-pill green">
                                                    {careProducts?.find(
                                                        (cp) =>
                                                            cp._id ===
                                                            product.careProductId
                                                    )?.name ||
                                                        careProducts?.find(
                                                            (cp) =>
                                                                cp.slotCount ===
                                                                product.slotCount
                                                        )?.name ||
                                                        `${product.slotCount}구좌`}
                                                </span>
                                            </td>
                                            <td className="text-right tabular-nums">
                                                <div className="text-xs font-bold text-[#263d36]">
                                                    {(
                                                        product.monthlyPayment ??
                                                        0
                                                    ).toLocaleString()}
                                                    원
                                                </div>
                                                <div className="text-[10.5px] text-[#ad6654] font-semibold">
                                                    카드할인:{" "}
                                                    {(
                                                        product.cardDiscountPayment ??
                                                        0
                                                    ).toLocaleString()}
                                                    원
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleToggleVisibility(
                                                            e,
                                                            product._id,
                                                            product.isVisible ??
                                                                true
                                                        )
                                                    }
                                                    className={`adm-switch ${
                                                        product.isVisible !==
                                                        false
                                                            ? "checked"
                                                            : ""
                                                    }`}
                                                >
                                                    <span />
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleToggleBest(
                                                            e,
                                                            product._id,
                                                            product.isBest ??
                                                                false
                                                        )
                                                    }
                                                    className={`adm-switch ${
                                                        product.isBest
                                                            ? "checked !bg-[#b99a61]"
                                                            : ""
                                                    }`}
                                                >
                                                    <span />
                                                </button>
                                            </td>
                                            <td className="text-center">
                                                <span
                                                    className={`adm-pill ${
                                                        product.promotionId
                                                            ? "green"
                                                            : "gray"
                                                    }`}
                                                >
                                                    {product.promotionId
                                                        ? "적용"
                                                        : "미적용"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="inline-flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMove(
                                                                product,
                                                                "up"
                                                            )
                                                        }
                                                        className="adm-btn small !px-1.5 !py-0.5 !min-h-[24px]"
                                                        title="위로 이동"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMove(
                                                                product,
                                                                "down"
                                                            )
                                                        }
                                                        className="adm-btn small !px-1.5 !py-0.5 !min-h-[24px]"
                                                        title="아래로 이동"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="inline-flex gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingProduct({
                                                                ...product,
                                                            });
                                                            setIsModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="adm-btn small"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                product._id
                                                            )
                                                        }
                                                        className="adm-btn small danger"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={12}
                                            className="py-16 text-center text-xs text-[#86918a]"
                                        >
                                            검색된 결합제품이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <section className="adm-panel">
                    <div className="adm-filter-bar">
                        <span className="text-xs font-semibold text-[#45554e]">
                            등록된 상조·결합 상품 플랜{" "}
                            <strong className="text-[#295e52]">
                                {careProducts?.length || 0}
                            </strong>
                            개 · 좌측 핸들을 드래그하여 노출 순서를 조정할 수 있습니다.
                        </span>
                    </div>

                    <div className="adm-table-scroll">
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th className="w-10 text-center">이동</th>
                                    <th>상품(플랜)명 · 대상</th>
                                    <th className="text-center">구분</th>
                                    <th className="text-center">구좌수</th>
                                    <th className="text-right">월 납입금</th>
                                    <th className="text-center">자동 업데이트 설정</th>
                                    <th className="text-center">최근 동기화</th>
                                    <th>동기화 URL</th>
                                    <th className="text-center">순서</th>
                                    <th className="text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCareProducts.map((plan) => {
                                    const isDragging =
                                        draggedCareProductId === plan._id;
                                    const isDragOver =
                                        dragOverCareProductId === plan._id;
                                    const urls = (plan.syncUrl || "")
                                        .split(/[\n,]+/)
                                        .map((u) => u.trim())
                                        .filter(Boolean);

                                    return (
                                        <tr
                                            key={plan._id}
                                            draggable={true}
                                            onDragStart={(e) =>
                                                handleCareDragStart(e, plan._id)
                                            }
                                            onDragOver={(e) =>
                                                handleCareDragOver(e, plan._id)
                                            }
                                            onDragLeave={handleCareDragLeave}
                                            onDrop={(e) =>
                                                handleCareDrop(e, plan._id)
                                            }
                                            className={`transition-all ${
                                                isDragging ? "opacity-40" : ""
                                            } ${
                                                isDragOver
                                                    ? "bg-[#eef3e8]"
                                                    : ""
                                            }`}
                                        >
                                            <td
                                                className="text-center cursor-grab active:cursor-grabbing text-[#9ba596] hover:text-[#295e52]"
                                                title="드래그하여 순서 변경"
                                            >
                                                ⋮⋮
                                            </td>
                                            <td>
                                                <div className="text-xs font-bold text-[#263d36]">
                                                    {plan.name}
                                                </div>
                                                <div className="text-[11px] text-[#86918a] mt-0.5">
                                                    {plan.target || "-"}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span
                                                    className={`adm-pill ${
                                                        plan.productType ===
                                                        "standard"
                                                            ? "orange"
                                                            : "blue"
                                                    }`}
                                                >
                                                    {plan.productType ===
                                                    "standard"
                                                        ? "일반상품"
                                                        : "결합상품"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="adm-pill gray">
                                                    {plan.productType ===
                                                    "standard"
                                                        ? "1, 2, 3구좌"
                                                        : `${plan.slotCount}구좌`}
                                                </span>
                                            </td>
                                            <td className="text-right tabular-nums">
                                                <div className="text-xs font-bold text-[#263d36]">
                                                    {plan.monthlyPayment.toLocaleString()}
                                                    원
                                                </div>
                                                {plan.cardDiscountPayment ? (
                                                    <div className="text-[10.5px] font-semibold text-[#295e52]">
                                                        카드 -
                                                        {plan.cardDiscountPayment.toLocaleString()}
                                                        원
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="text-center">
                                                <div className="inline-flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                const nextState =
                                                                    !(
                                                                        plan.autoUpdate ??
                                                                        false
                                                                    );
                                                                await toggleCareAutoUpdate(
                                                                    {
                                                                        id: plan._id,
                                                                        autoUpdate:
                                                                            nextState,
                                                                    }
                                                                );
                                                            }}
                                                            className={`adm-switch ${
                                                                plan.autoUpdate
                                                                    ? "checked"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span />
                                                        </button>
                                                        <span
                                                            className={`adm-pill ${
                                                                plan.autoUpdate
                                                                    ? "green"
                                                                    : "gray"
                                                            }`}
                                                        >
                                                            {plan.autoUpdate
                                                                ? "자동 켜짐"
                                                                : "꺼짐"}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <select
                                                            value={
                                                                [
                                                                    "00:00",
                                                                    "12:00",
                                                                    "both",
                                                                ].includes(
                                                                    plan.autoUpdateSchedule ||
                                                                        ""
                                                                )
                                                                    ? plan.autoUpdateSchedule
                                                                    : "custom"
                                                            }
                                                            onChange={async (
                                                                e
                                                            ) => {
                                                                const val =
                                                                    e.target
                                                                        .value;
                                                                await toggleCareAutoUpdate(
                                                                    {
                                                                        id: plan._id,
                                                                        autoUpdateSchedule:
                                                                            val ===
                                                                            "custom"
                                                                                ? "09:00"
                                                                                : val,
                                                                    }
                                                                );
                                                            }}
                                                            disabled={
                                                                !plan.autoUpdate
                                                            }
                                                            className="adm-select !min-h-[26px] !py-0.5 !px-2 !text-[11px]"
                                                        >
                                                            <option value="00:00">
                                                                매일 00:00
                                                            </option>
                                                            <option value="12:00">
                                                                매일 12:00
                                                            </option>
                                                            <option value="both">
                                                                매일 0시 &amp; 12시
                                                            </option>
                                                            <option value="custom">
                                                                직접설정
                                                            </option>
                                                        </select>

                                                        {plan.autoUpdate &&
                                                            ![
                                                                "00:00",
                                                                "12:00",
                                                                "both",
                                                            ].includes(
                                                                plan.autoUpdateSchedule ||
                                                                    ""
                                                            ) && (
                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        plan.autoUpdateSchedule ||
                                                                        "09:00"
                                                                    }
                                                                    onChange={async (
                                                                        e
                                                                    ) => {
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) {
                                                                            await toggleCareAutoUpdate(
                                                                                {
                                                                                    id: plan._id,
                                                                                    autoUpdateSchedule:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="adm-input !min-h-[26px] !py-0.5 !px-1.5 !text-[11px] font-mono"
                                                                />
                                                            )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {plan.lastSyncedAt ? (
                                                    <div className="inline-flex flex-col items-center gap-0.5">
                                                        <span className="adm-pill teal">
                                                            동기화됨
                                                        </span>
                                                        <span className="text-[11px] font-mono text-[#6b7768]">
                                                            {formatSimpleDate(
                                                                plan.lastSyncedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : plan.updatedAt ? (
                                                    <div className="inline-flex flex-col items-center gap-0.5">
                                                        <span className="adm-pill gray">
                                                            수정일
                                                        </span>
                                                        <span className="text-[11px] font-mono text-[#86918a]">
                                                            {formatSimpleDate(
                                                                plan.updatedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#a3ad99]">
                                                        미동기화
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {urls.length === 0 ? (
                                                    <span className="text-xs text-[#a3ad99]">
                                                        미등록
                                                    </span>
                                                ) : urls.length === 1 ? (
                                                    <div
                                                        className="text-xs font-mono text-[#295e52] truncate max-w-[160px]"
                                                        title={urls[0]}
                                                    >
                                                        {urls[0]}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="adm-pill green">
                                                            {urls.length}개 URL
                                                        </span>
                                                        <div
                                                            className="text-[10.5px] font-mono text-[#86918a] truncate max-w-[150px] mt-0.5"
                                                            title={urls.join(
                                                                "\n"
                                                            )}
                                                        >
                                                            {urls[0]} 외{" "}
                                                            {urls.length - 1}개
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="inline-flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCareMove(
                                                                plan,
                                                                "up"
                                                            )
                                                        }
                                                        className="adm-btn small !px-1.5 !py-0.5 !min-h-[24px]"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCareMove(
                                                                plan,
                                                                "down"
                                                            )
                                                        }
                                                        className="adm-btn small !px-1.5 !py-0.5 !min-h-[24px]"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCareSync(plan)
                                                        }
                                                        disabled={
                                                            syncingPlanId ===
                                                            plan._id
                                                        }
                                                        className="adm-btn small sage"
                                                    >
                                                        <AdminIcon name="refresh" />
                                                        <span>
                                                            {syncingPlanId ===
                                                            plan._id
                                                                ? "동기화중"
                                                                : "동기화"}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingCareProduct(
                                                                {
                                                                    ...plan,
                                                                    features:
                                                                        plan.features &&
                                                                        plan
                                                                            .features
                                                                            .length >=
                                                                            3
                                                                            ? plan.features
                                                                            : [
                                                                                  ...(plan.features ||
                                                                                      []),
                                                                                  "",
                                                                                  "",
                                                                                  "",
                                                                              ].slice(
                                                                                  0,
                                                                                  3
                                                                              ),
                                                                }
                                                            );
                                                            setIsCareModalOpen(
                                                                true
                                                            );
                                                        }}
                                                        className="adm-btn small"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCareDelete(
                                                                plan._id
                                                            )
                                                        }
                                                        className="adm-btn small danger"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!careProducts ||
                                    careProducts.length === 0) && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="py-16 text-center text-xs text-[#86918a]"
                                        >
                                            등록된 상품 플랜 정보가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* 가전제품 등록/수정 드로어 */}
            {isModalOpen && editingProduct && (
                <AdminDrawer
                    title={editingProduct._id ? "제품 정보 수정" : "새 제품 등록"}
                    subtitle="결합 가전제품 브랜드, 모델명 및 연결 상품을 설정합니다."
                    maxWidth="620px"
                    zIndex={80}
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
                                form="product-edit-drawer"
                                className="adm-btn primary"
                            >
                                <AdminIcon name="check" />
                                <span>저장하기</span>
                            </button>
                        </>
                    }
                >
                    <form id="product-edit-drawer" onSubmit={handleSave}>
                        <h3 className="adm-section-label !mt-0">
                            <span>제품 기본 정보</span>
                        </h3>
                        <div className="adm-field-grid">
                            <label className="adm-field">
                                <span>브랜드 *</span>
                                <input
                                    type="text"
                                    value={editingProduct.brand || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            brand: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full"
                                    placeholder="예: 삼성, LG"
                                    required
                                />
                            </label>
                            <label className="adm-field">
                                <span>카테고리 *</span>
                                <select
                                    value={editingProduct.category || "TV/디지털"}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            category: e.target.value,
                                        })
                                    }
                                    className="adm-select w-full"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="adm-field full">
                                <span>제품명 *</span>
                                <input
                                    type="text"
                                    value={editingProduct.name || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            name: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full font-semibold"
                                    placeholder="전체 제품명을 입력하세요"
                                    required
                                />
                            </label>
                            <label className="adm-field">
                                <span>모델명 *</span>
                                <input
                                    type="text"
                                    value={editingProduct.model || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            model: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full font-mono"
                                    placeholder="모델번호 입력"
                                    required
                                />
                            </label>
                            <label className="adm-field">
                                <span>연결 상품(플랜) *</span>
                                <select
                                    value={editingProduct.careProductId || ""}
                                    onChange={(e) => {
                                        const planId = e.target.value;
                                        const selectedPlan = careProducts?.find(
                                            (cp) => cp._id === planId
                                        );
                                        setEditingProduct({
                                            ...editingProduct,
                                            careProductId: planId
                                                ? (planId as Id<"careProducts">)
                                                : null,
                                            slotCount: selectedPlan
                                                ? selectedPlan.slotCount
                                                : editingProduct.slotCount,
                                            monthlyPayment: selectedPlan
                                                ? selectedPlan.monthlyPayment
                                                : editingProduct.monthlyPayment,
                                            cardDiscountPayment: selectedPlan
                                                ? Math.max(
                                                      0,
                                                      selectedPlan.monthlyPayment -
                                                          (selectedPlan.cardDiscountPayment ||
                                                              0)
                                                  )
                                                : editingProduct.cardDiscountPayment,
                                        });
                                    }}
                                    className="adm-select w-full font-semibold"
                                    required
                                >
                                    <option value="">선택 안 함</option>
                                    {careProducts?.map((cp) => (
                                        <option key={cp._id} value={cp._id}>
                                            {cp.name} ({cp.slotCount}구좌)
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="adm-field">
                                <span>기본 월 납입금 (원) *</span>
                                <input
                                    type="number"
                                    value={editingProduct.monthlyPayment || 0}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            monthlyPayment: Number(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    className="adm-input w-full tabular-nums"
                                    required
                                />
                            </label>
                            <label className="adm-field">
                                <span>카드 할인시 월 납입금 (원) *</span>
                                <input
                                    type="number"
                                    value={editingProduct.cardDiscountPayment || 0}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            cardDiscountPayment: Number(
                                                e.target.value
                                            ),
                                        })
                                    }
                                    className="adm-input w-full tabular-nums"
                                    required
                                />
                            </label>
                            <label className="adm-field full">
                                <span>이미지 URL *</span>
                                <input
                                    type="text"
                                    value={editingProduct.image || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            image: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full font-mono"
                                    placeholder="https://..."
                                    required
                                />
                            </label>
                            <label className="adm-field full">
                                <span>연결 프로모션 (선택)</span>
                                <select
                                    value={editingProduct.promotionId || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            promotionId: e.target.value
                                                ? (e.target
                                                      .value as Id<"promotions">)
                                                : null,
                                        })
                                    }
                                    className="adm-select w-full"
                                >
                                    <option value="">없음</option>
                                    {promotions?.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="adm-note-card mt-5 flex flex-wrap gap-6">
                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#263d36]">
                                <input
                                    type="checkbox"
                                    checked={editingProduct.isVisible !== false}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            isVisible: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span>랜딩 페이지 노출</span>
                            </label>
                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#263d36]">
                                <input
                                    type="checkbox"
                                    checked={!!editingProduct.isBest}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            isBest: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span>베스트 상품 지정 (최상단 고정)</span>
                            </label>
                        </div>
                    </form>
                </AdminDrawer>
            )}

            {/* 상품(플랜) 등록/수정 드로어 */}
            {isCareModalOpen && editingCareProduct && (
                <AdminDrawer
                    title={editingCareProduct._id ? "상품 정보 수정" : "새 상품 등록"}
                    subtitle="상조·결합 상품 플랜 조건 및 자동 동기화를 설정합니다."
                    maxWidth="640px"
                    zIndex={80}
                    onClose={() => setIsCareModalOpen(false)}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setIsCareModalOpen(false)}
                                className="adm-btn"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                form="care-product-edit-drawer"
                                className="adm-btn primary"
                            >
                                <AdminIcon name="check" />
                                <span>저장하기</span>
                            </button>
                        </>
                    }
                >
                    <form id="care-product-edit-drawer" onSubmit={handleCareSave}>
                        <h3 className="adm-section-label !mt-0">
                            <span>상품 구분 및 기본 조건</span>
                        </h3>
                        <div className="adm-field-grid">
                            <div className="adm-field full">
                                <span>상품 구분 *</span>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingCareProduct({
                                                ...editingCareProduct,
                                                productType: "combination",
                                            })
                                        }
                                        className={`adm-btn ${
                                            editingCareProduct.productType !==
                                            "standard"
                                                ? "primary"
                                                : ""
                                        }`}
                                    >
                                        결합상품 (가전 연동)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditingCareProduct({
                                                ...editingCareProduct,
                                                productType: "standard",
                                            })
                                        }
                                        className={`adm-btn ${
                                            editingCareProduct.productType ===
                                            "standard"
                                                ? "primary"
                                                : ""
                                        }`}
                                    >
                                        일반상품 (상조/전환 단독)
                                    </button>
                                </div>
                            </div>

                            <label className="adm-field">
                                <span>상품명 *</span>
                                <input
                                    type="text"
                                    value={editingCareProduct.name || ""}
                                    onChange={(e) =>
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            name: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full font-semibold"
                                    placeholder="예: 스마트케어 4더블"
                                    required
                                />
                            </label>

                            <label className="adm-field">
                                <span>구좌수</span>
                                {editingCareProduct.productType === "standard" ? (
                                    <input
                                        type="text"
                                        value="1, 2, 3구좌 (신청 시 선택)"
                                        disabled
                                        className="adm-input w-full"
                                    />
                                ) : (
                                    <select
                                        value={editingCareProduct.slotCount || 4}
                                        onChange={(e) =>
                                            setEditingCareProduct({
                                                ...editingCareProduct,
                                                slotCount: Number(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        className="adm-select w-full"
                                    >
                                        {slots.map((s) => (
                                            <option key={s} value={s}>
                                                {s}구좌
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </label>

                            <label className="adm-field full">
                                <span>대상 설명 *</span>
                                <input
                                    type="text"
                                    value={editingCareProduct.target || ""}
                                    onChange={(e) =>
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            target: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full"
                                    placeholder="예: 일반 가전 / 대형 가전"
                                    required
                                />
                            </label>

                            <label className="adm-field">
                                <span>기본 월 납입금 (원) *</span>
                                <input
                                    type="text"
                                    value={
                                        editingCareProduct.monthlyPayment
                                            ? editingCareProduct.monthlyPayment.toLocaleString()
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            monthlyPayment: val
                                                ? Number(val)
                                                : 0,
                                        });
                                    }}
                                    className="adm-input w-full text-right tabular-nums"
                                    placeholder="예: 66,000"
                                    required
                                />
                            </label>

                            <label className="adm-field">
                                <span>제휴카드 할인금액 (원)</span>
                                <input
                                    type="text"
                                    value={
                                        editingCareProduct.cardDiscountPayment
                                            ? editingCareProduct.cardDiscountPayment.toLocaleString()
                                            : ""
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                        );
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            cardDiscountPayment: val
                                                ? Number(val)
                                                : 0,
                                        });
                                    }}
                                    className="adm-input w-full text-right tabular-nums"
                                    placeholder="예: 13,000"
                                />
                            </label>
                        </div>

                        <h3 className="adm-section-label">
                            <span>회차 구성 및 특장점</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <label className="adm-field">
                                <span>납입회차</span>
                                <input
                                    type="text"
                                    value={editingCareProduct.paymentCount || ""}
                                    onChange={(e) =>
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            paymentCount: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full"
                                    placeholder="예: 1~150회"
                                />
                            </label>
                            <label className="adm-field">
                                <span>거치기간</span>
                                <input
                                    type="text"
                                    value={
                                        editingCareProduct.defermentPeriod || ""
                                    }
                                    onChange={(e) =>
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            defermentPeriod: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full"
                                    placeholder="예: 151~180회"
                                />
                            </label>
                            <label className="adm-field">
                                <span>만기회차</span>
                                <input
                                    type="text"
                                    value={
                                        editingCareProduct.maturityCount || ""
                                    }
                                    onChange={(e) =>
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            maturityCount: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full"
                                    placeholder="예: 180회"
                                />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-[#5c6b5b] block">
                                핵심 특장점 3가지 *
                            </span>
                            {[0, 1, 2].map((idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={
                                        (editingCareProduct.features || [])[
                                            idx
                                        ] || ""
                                    }
                                    onChange={(e) => {
                                        const newFeatures = [
                                            ...(editingCareProduct.features || [
                                                "",
                                                "",
                                                "",
                                            ]),
                                        ];
                                        newFeatures[idx] = e.target.value;
                                        setEditingCareProduct({
                                            ...editingCareProduct,
                                            features: newFeatures,
                                        });
                                    }}
                                    className="adm-input w-full"
                                    placeholder={`특장점 ${idx + 1}`}
                                    required
                                />
                            ))}
                        </div>

                        {editingCareProduct.productType !== "standard" && (
                            <>
                                <h3 className="adm-section-label">
                                    <span>가전 데이터 동기화 설정</span>
                                    <span className="text-[11px] font-normal text-[#86918a]">
                                        줄바꿈 또는 쉼표로 다중 URL 입력 가능
                                    </span>
                                </h3>
                                <div className="space-y-3">
                                    <textarea
                                        rows={3}
                                        value={editingCareProduct.syncUrl || ""}
                                        onChange={(e) =>
                                            setEditingCareProduct({
                                                ...editingCareProduct,
                                                syncUrl: e.target.value,
                                            })
                                        }
                                        className="adm-textarea w-full font-mono text-xs"
                                        placeholder={`https://domain.com/api/v2/models?code=008001`}
                                    />

                                    <div className="adm-note-card space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <strong className="text-xs font-bold text-[#263d36] block">
                                                    자동 동기화 스케줄
                                                </strong>
                                                <small className="text-[11px] text-[#86918a]">
                                                    지정된 시각(KST)마다 최신 가전 목록을 자동 갱신합니다.
                                                </small>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingCareProduct({
                                                            ...editingCareProduct,
                                                            autoUpdate:
                                                                !editingCareProduct.autoUpdate,
                                                        })
                                                    }
                                                    className={`adm-switch ${
                                                        editingCareProduct.autoUpdate
                                                            ? "checked"
                                                            : ""
                                                    }`}
                                                >
                                                    <span />
                                                </button>
                                                <span
                                                    className={`adm-pill ${
                                                        editingCareProduct.autoUpdate
                                                            ? "green"
                                                            : "gray"
                                                    }`}
                                                >
                                                    {editingCareProduct.autoUpdate
                                                        ? "자동 켜짐"
                                                        : "꺼짐"}
                                                </span>
                                            </div>
                                        </div>

                                        {editingCareProduct.autoUpdate && (
                                            <div className="pt-2.5 border-t border-[#e6eae3] flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-xs font-semibold text-[#45554e]">
                                                    업데이트 주기 (KST)
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={
                                                            [
                                                                "00:00",
                                                                "12:00",
                                                                "both",
                                                            ].includes(
                                                                editingCareProduct.autoUpdateSchedule ||
                                                                    ""
                                                            )
                                                                ? editingCareProduct.autoUpdateSchedule
                                                                : "custom"
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            setEditingCareProduct(
                                                                {
                                                                    ...editingCareProduct,
                                                                    autoUpdateSchedule:
                                                                        val ===
                                                                        "custom"
                                                                            ? "09:00"
                                                                            : val,
                                                                }
                                                            );
                                                        }}
                                                        className="adm-select !min-h-[32px]"
                                                    >
                                                        <option value="00:00">
                                                            매일 00:00 (AM 0시)
                                                        </option>
                                                        <option value="12:00">
                                                            매일 12:00 (PM 12시)
                                                        </option>
                                                        <option value="both">
                                                            매일 00시 &amp; 12시
                                                        </option>
                                                        <option value="custom">
                                                            사용자 지정 시간
                                                        </option>
                                                    </select>

                                                    {![
                                                        "00:00",
                                                        "12:00",
                                                        "both",
                                                    ].includes(
                                                        editingCareProduct.autoUpdateSchedule ||
                                                            ""
                                                    ) && (
                                                        <input
                                                            type="time"
                                                            value={
                                                                editingCareProduct.autoUpdateSchedule ||
                                                                "09:00"
                                                            }
                                                            onChange={(e) =>
                                                                setEditingCareProduct(
                                                                    {
                                                                        ...editingCareProduct,
                                                                        autoUpdateSchedule:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            className="adm-input !min-h-[32px] font-mono"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </AdminDrawer>
            )}
        </div>
    );
}
