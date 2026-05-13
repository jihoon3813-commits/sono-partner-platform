"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState } from "react";
import InquiryModal from "@/components/InquiryModal";

interface Appliance {
    _id: string;
    brand: string;
    model: string;
    name: string;
    category: string;
    slotCount: number;
    monthlyPayment: number;
    cardDiscountPayment: number;
    image: string;
    isVisible: boolean;
    hasGift: boolean;
    promotionId?: string;
}

interface SmartCareContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    isPremiumMallMode?: boolean;
}

export default function SmartCareContent({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    isPremiumMallMode = false
}: SmartCareContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pickedAppliance, setPickedAppliance] = useState<Appliance | null>(null);

    const [selectedUnit, setSelectedUnit] = useState<string>("4");
    const [showAllOverlay, setShowAllOverlay] = useState(false);

    // Convex Query - Fetch and filter client-side for stability
    const productsData = useQuery(api.products.get);
    const promotionsData = useQuery(api.promotions.get);
    
    const allAppliances = ((productsData || []) as Appliance[]).filter(p => p.isVisible !== false);
    const activePromotions = (promotionsData || []).filter(p => p.isActive !== false);
    const isLoadingAppliances = productsData === undefined;
    const [expandedProductNames, setExpandedProductNames] = useState<Set<string>>(new Set());
    const categoriesOrder = ["에어컨", "냉장가전", "주방가전", "생활가전", "TV", "캠핑/레저", "가전패키지", "기타"];
    
    // Dynamic Slots based on available products - Ensure no undefined values
    const availableSlots = Array.from(new Set(allAppliances.map(a => a.slotCount || 4))).sort((a, b) => a - b);
    
    // Dynamic Categories based on current slot selection
    const availableCategories = Array.from(new Set(
        allAppliances
            .filter(a => selectedUnit === "" ? true : a.slotCount === Number(selectedUnit))
            .map(a => a.category)
    )).sort((a, b) => {
        if (!a) return 1;
        if (!b) return -1;
        const idxA = categoriesOrder.indexOf(a);
        const idxB = categoriesOrder.indexOf(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    const [selectedCategory, setSelectedCategory] = useState<string>("전체");

    // 페이지 내 버튼 문구 처리
    const ctaText = isPremiumMallMode 
        ? "프리미엄몰 접수 바로가기" 
        : (partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기");

    // 현재 구좌 및 카테고리에 맞는 가전 필터링
    const filteredAppliances = allAppliances.filter(item => {
        const matchesUnit = selectedUnit === "" ? true : item.slotCount === Number(selectedUnit);
        const matchesCategory = selectedCategory === "전체" ? true : item.category === selectedCategory;
        return matchesUnit && matchesCategory;
    });

    // 프로모션 상품 필터링 (프로모션 세션용)
    const promotionAppliances = allAppliances.filter(item => item.promotionId);

    // Helper to determine unit from tag (for compatibility if needed)
    const getUnitFromTag = (item: Appliance) => {
        return (item.slotCount || 4).toString();
    };

    const handleApplianceClick = (item: Appliance) => {
        setPickedAppliance(item);
        const unit = getUnitFromTag(item);
        if (unit && unit !== selectedUnit && selectedUnit !== "") {
            setSelectedUnit(unit);
        }
    };

    const handleApplyWithProduct = () => {
        if (pickedAppliance) {
            setSelectedUnit(getUnitFromTag(pickedAppliance));
            setIsModalOpen(true);
        }
    };

    // Use these for the new UI mapping
    const allWithNewFormat = allAppliances;
    const filteredWithNewFormat = filteredAppliances;

    // Helper for promotion types/colors
    const getPromotionStyle = (promotionId?: string) => {
        if (!promotionId) return null;
        const promo = activePromotions.find(p => p._id === promotionId);
        const title = promo?.title || "";
        
        // Priority 1: Check for explicit suffixes
        if (title.includes("(A)")) {
            return {
                name: "blue",
                border: "border-blue-500/40 hover:border-blue-500 hover:shadow-blue-500/10",
                badge: "bg-blue-600 text-white",
                benefit: "bg-blue-500 text-white border-blue-400 font-bold",
                glow: "49, 130, 246",
                tag: "bg-blue-600",
                text: "text-blue-600",
                bg: "bg-blue-50/50",
                button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
                borderFull: "border-blue-200"
            };
        }
        if (title.includes("(B)")) {
            return {
                name: "pink",
                border: "border-pink-500/40 hover:border-pink-500 hover:shadow-pink-500/10",
                badge: "bg-pink-600 text-white",
                benefit: "bg-pink-500 text-white border-pink-400 font-bold",
                glow: "236, 72, 153",
                tag: "bg-pink-600",
                text: "text-pink-600",
                bg: "bg-pink-50/50",
                button: "bg-pink-600 hover:bg-pink-700 shadow-pink-600/20",
                borderFull: "border-pink-200"
            };
        }
        if (title.includes("(C)")) {
            return {
                name: "orange",
                border: "border-orange-500/40 hover:border-orange-500 hover:shadow-orange-500/10",
                badge: "bg-orange-500 text-white",
                benefit: "bg-orange-400 text-white border-orange-300 font-bold",
                glow: "251, 146, 60",
                tag: "bg-orange-500",
                text: "text-orange-600",
                bg: "bg-orange-50/50",
                button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
                borderFull: "border-orange-200"
            };
        }
        if (title.includes("(D)")) {
            return {
                name: "emerald",
                border: "border-emerald-500/40 hover:border-emerald-500 hover:shadow-emerald-500/10",
                badge: "bg-emerald-600 text-white",
                benefit: "bg-emerald-500 text-white border-emerald-400 font-bold",
                glow: "16, 185, 129",
                tag: "bg-emerald-600",
                text: "text-emerald-600",
                bg: "bg-emerald-50/50",
                button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
                borderFull: "border-emerald-200"
            };
        }
        if (title.includes("(E)")) {
            return {
                name: "purple",
                border: "border-purple-500/40 hover:border-purple-500 hover:shadow-purple-500/10",
                badge: "bg-purple-600 text-white",
                benefit: "bg-purple-500 text-white border-purple-400 font-bold",
                glow: "139, 92, 246",
                tag: "bg-purple-600",
                text: "text-purple-600",
                bg: "bg-purple-50/50",
                button: "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20",
                borderFull: "border-purple-200"
            };
        }

        // Priority 2: Fallback to Brand Keywords
        if (title.includes("삼성")) {
            return {
                name: "blue",
                border: "border-blue-500/40 hover:border-blue-500 hover:shadow-blue-500/10",
                badge: "bg-blue-600 text-white",
                benefit: "bg-blue-500 text-white border-blue-400 font-bold",
                glow: "49, 130, 246",
                tag: "bg-blue-600",
                text: "text-blue-600",
                bg: "bg-blue-50/50",
                button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
                borderFull: "border-blue-200"
            };
        }
        if (title.includes("LG")) {
            return {
                name: "pink",
                border: "border-pink-500/40 hover:border-pink-500 hover:shadow-pink-500/10",
                badge: "bg-pink-600 text-white",
                benefit: "bg-pink-500 text-white border-pink-400 font-bold",
                glow: "236, 72, 153",
                tag: "bg-pink-600",
                text: "text-pink-600",
                bg: "bg-pink-50/50",
                button: "bg-pink-600 hover:bg-pink-700 shadow-pink-600/20",
                borderFull: "border-pink-200"
            };
        }

        // Priority 3: Default Gold
        return {
            name: "gold",
            border: "border-orange-500/40 hover:border-orange-500 hover:shadow-orange-500/10",
            badge: "bg-orange-500 text-white",
            benefit: "bg-orange-400 text-white border-orange-300 font-bold",
            glow: "251, 146, 60",
            tag: "bg-orange-500",
            text: "text-orange-600",
            bg: "bg-orange-50/50",
            button: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20",
            borderFull: "border-orange-200"
        };
    };

    return (
        <>
            {!isModalOpen && <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} productType="smartcare" isPremiumMallMode={isPremiumMallMode} />}
            <main className="pb-32"> {/* Add padding for fixed bottom bar */}
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[70vh] flex items-center bg-sono-dark overflow-hidden pt-12"
                >
                    <div className="absolute inset-0 z-0">
                        <img
                            src={"https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/Generated%20Image%20January%2022%2C%202026%20-%205_18PM.jpeg".replace(/ /g, '%20')}
                            alt="Premium Home"
                            className="w-full h-full object-cover"
                        />
                        {/* 오버레이: 1번 이미지(Happy450)와 동일한 그라데이션 느낌 구현 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-sono-dark/80 via-sono-dark/40 to-transparent z-0"></div>
                        <div className="absolute inset-0 bg-black/20 z-0"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 relative z-10 w-full">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div className="animate-fade-in">
                                <span className="inline-block bg-sono-primary text-white border border-white/20 mb-8 px-4 py-2 rounded-lg text-sm font-bold shadow-xl">PREMIUM HYBRID</span>
                                <h1 className="leading-[1.15] mb-8 tracking-tighter filter drop-shadow-2xl">
                                    <span className="block text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-md">스마트케어</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white mb-12 leading-relaxed max-w-2xl break-keep font-semibold drop-shadow-sm">
                                    최신가전 렌탈금 전액 지원으로,<br className="hidden md:block" />
                                    오늘의 생활은 편리하게, 미래의 안심까지!<br className="hidden md:block" />
                                    대한민국 No.1 토탈 라이프케어 서비스
                                </p>
                                <div className="flex flex-col sm:flex-row gap-5">
                                    {partnerMode ? (
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="bg-white text-sono-primary hover:bg-sono-gold hover:text-white px-10 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20 text-center"
                                        >
                                            {ctaText}
                                        </button>
                                    ) : (
                                        <Link href="/partner/apply" className="bg-white text-sono-primary hover:bg-sono-gold hover:text-white px-10 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20 text-center">
                                            {ctaText}
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            document.getElementById("appliance-section")?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                        className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 text-center"
                                    >
                                        가전 라인업 보기
                                    </button>
                                </div>

                                {/* 스마트한 선택 박스 - 이미지 1번의 '합리적 선택' 박스 스타일 구현 */}
                                <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <div className="inline-flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-[24px] shadow-xl max-w-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-white text-sono-primary flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
                                            ★
                                        </div>
                                        <div>
                                            <h3 className="text-white text-lg font-bold tracking-tight">스마트한 선택</h3>
                                            <p className="text-white/70 font-medium text-sm leading-tight break-keep mt-0.5">
                                                최신가전 렌탈금 전액 지원!! 지금은 편리하게, 미래는 든든하게
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3대 핵심 혜택 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
                            <div className="lg:col-span-1">
                                <span className="text-sono-primary font-black text-sm uppercase tracking-widest mb-4 block">WHY SMART CARE</span>
                                <h2 className="text-3xl md:text-5xl font-black text-sono-dark tracking-tighter leading-tight mb-8">
                                    스마트케어가<br />사랑받는 이유
                                </h2>
                                <p className="text-[#6b7684] text-lg font-medium leading-relaxed break-keep">
                                    단순한 상조를 넘어, 현재의 즐거움과 미래의 안심을 동시에 챙기는 합리적인 고객님들의 선택입니다.
                                </p>
                            </div>
                            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                                {[
                                    {
                                        title: "프리미엄 가전 렌탈금 전액 지원",
                                        desc: "삼성, LG 등 최고급 브랜드 가전의 렌탈료 전액을 지원받습니다.",
                                        icon: "⚡"
                                    },
                                    {
                                        title: "100% 안심 환급 시스템",
                                        desc: "만기 시 서비스를 이용하지 않으시면 납입금 전액을 돌려드립니다.(만기 납입 후 익월 해약 시)",
                                        icon: "💰"
                                    },
                                    {
                                        title: "하이브리드 전환 서비스",
                                        desc: "상조 외에도 웨딩, 여행, 어학연수 등 원하는 서비스로 전환 가능합니다.",
                                        icon: "🔄"
                                    },
                                    {
                                        title: "소노그룹 멤버십 혜택",
                                        desc: "가입 즉시 전국 소노호텔 & 리조트 객실 및 부대시설 우대 혜택을 누립니다.",
                                        icon: "⭐️"
                                    },
                                ].map((item, i) => (
                                    <div key={i} className="p-8 rounded-[32px] bg-[#f2f4f6] hover:bg-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="text-4xl mb-6">{item.icon}</div>
                                        <h3 className="text-xl font-bold text-sono-dark mb-4">{item.title}</h3>
                                        <p className="text-[#6b7684] font-medium leading-relaxed text-sm md:text-base">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 상품 구성 섹션 */}
                <section className="py-16 md:py-32 bg-[#191f28] text-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">다양한 라이프스타일에<br className="md:hidden" /> 맞춘 구성</h2>
                            <p className="text-white/50 text-lg md:text-xl font-medium">원하는 구좌 수를 선택하고<br className="md:hidden" /> 최신 가전을 골라보세요.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { name: "스마트케어330", unit: "2", price: "33,000", target: "1인 가구 / 소형 가전" },
                                { name: "스마트케어330", unit: "3", price: "49,500", target: "신혼 부부 / 중형 가전" },
                                { name: "스마트케어330", unit: "4", price: "66,000", target: "일반 가전 / 대형 가전", best: true },
                                { name: "스마트케어330", unit: "6", price: "99,000", target: "대가족 / 프리미엄 가전 패키지" },
                            ].map((plan, i) => (
                                <div key={i} className={`p-5 md:p-10 rounded-[32px] border transition-all ${plan.best ? "bg-sono-primary border-sono-primary shadow-2xl md:scale-105" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                    {plan.best && <span className="bg-white text-sono-primary text-[10px] font-black px-3 py-1 rounded-full mb-3 md:mb-6 inline-block">BEST CHOICE</span>}
                                    <h3 className="font-black mb-1 md:mb-2 tracking-tighter">
                                        <span className="text-sm md:text-base opacity-70 block mb-1">{plan.name}</span>
                                        <span className="text-2xl md:text-3xl">{plan.unit}구좌</span>
                                    </h3>
                                    <p className="text-white/50 text-sm font-bold mb-4 md:mb-8">{plan.target}</p>
                                    <div className="mb-6 md:mb-10">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        <span className="text-lg opacity-60 ml-1">원~</span>
                                    </div>
                                    <ul className="space-y-2 md:space-y-4 mb-2 md:mb-4 opacity-80 text-sm font-bold">
                                        <li className="flex items-center gap-2">✓ 가전 렌탈료 전액 지원 혜택</li>
                                        <li className="flex items-center gap-2">✓ 멤버십 즉시 이용</li>
                                        <li className="flex items-center gap-2">✓ 100% 만기 환급</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 가전 라인업 하이브리드 섹션 - 전면 수정 */}
                <section className="py-20 md:py-32 bg-[#f9fafb]" id="appliance-section">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-5 py-2">PREMIUM LINEUP</span>
                            <h2 className="section-title tracking-tight mb-6">스마트케어 가전 라인업</h2>
                            <p className="section-subtitle max-w-2xl mx-auto mb-16 text-gray-500 font-medium">
                                라이프 스타일에 딱 맞는 최신 가전을 선택해보세요.<br />
                                렌탈료 전액 지원으로 부담 없이 시작할 수 있습니다.
                            </p>

                        </div>

                        {/* 프로모션 섹션 - 필터 위로 이동 */}
                        {promotionAppliances.length > 0 && (
                            <div className="mb-20 animate-fade-in text-left">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="bg-sono-primary text-white p-2.5 rounded-2xl shadow-lg shadow-sono-primary/20">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-black text-sono-dark tracking-tight">이 달의 프로모션 안내</h3>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                    {promotionAppliances.map((item, index) => {
                                        const promotion = activePromotions.find(p => p._id === item.promotionId);
                                        const promoStyle = getPromotionStyle(item.promotionId);
                                        return (
                                            <div
                                                key={`promo-${item._id}`}
                                                className={`group bg-white rounded-[40px] overflow-hidden border-2 flex flex-col h-full relative transition-all duration-500 ${promoStyle?.border || 'border-sono-primary/20 hover:border-sono-primary hover:shadow-[0_20px_60px_rgba(46,78,162,0.15)]'} ${promoStyle ? promoStyle.borderFull : ''}`}
                                            >

                                                {/* Promotion Tag (Top Left) - With Neon Effect */}
                                                <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
                                                    <span 
                                                        className={`text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-neon-blink ${promoStyle?.tag || 'bg-sono-primary'}`}
                                                        style={{ '--neon-color': promoStyle?.glow } as React.CSSProperties}
                                                    >
                                                        <span className="animate-pulse">🔥</span> 프로모션
                                                    </span>
                                                </div>

                                                {/* Image Container */}
                                                <div className="aspect-square bg-[#f9fafb] p-4 md:p-10 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors duration-500">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" />
                                                    
                                                    {/* Promotion Gift Image (Bottom Right) */}
                                                    {promotion?.imageUrl && (
                                                        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-14 h-14 md:w-20 md:h-20 bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-white group-hover:scale-110 transition-transform duration-500 z-10 flex items-center justify-center">
                                                            <img src={promotion.imageUrl} alt="사은품" className="w-full h-full object-contain p-1" />
                                                            <div className="absolute top-0 right-0 bg-sono-primary text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">GIFT</div>
                                                        </div>
                                                    )}

                                                    {/* 프로모션 카드에도 구좌 표시 (우상단으로 이동) */}
                                                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                                                        <span className="bg-sono-dark/80 backdrop-blur-md text-white text-[8px] md:text-[9px] font-black px-2 py-1 md:px-2.5 md:py-1.5 rounded-full shadow-lg">
                                                            {item.slotCount}구좌
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 md:p-8 flex-grow flex flex-col bg-sono-primary/5">
                                                    <div className="mb-3 md:mb-4">
                                                        <h4 className={`font-black text-[9px] md:text-xs mb-1 ${promoStyle?.text || 'text-sono-primary'}`}>[{promotion?.title || "특별 혜택"}]</h4>
                                                        <h3 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedProductNames(prev => {
                                                                    const next = new Set(prev);
                                                                    if (next.has(item.name)) next.delete(item.name);
                                                                    else next.add(item.name);
                                                                    return next;
                                                                });
                                                            }}
                                                            className={`text-sono-dark font-black text-xs md:text-base leading-tight tracking-tighter cursor-pointer transition-all ${expandedProductNames.has(item.name) ? "line-clamp-none" : "line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]"}`}
                                                        >
                                                            {item.name}
                                                        </h3>
                                                        <p className={`font-bold text-[9px] md:text-xs mt-1 md:mt-2 truncate underline decoration-sono-primary/30 uppercase ${promoStyle?.text || 'text-gray-500'}`}>{promotion?.period}</p>
                                                    </div>
                                                    
                                                    {/* Benefit Box with Blinking Effect */}
                                                    <div className={`backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 border mb-4 md:mb-6 animate-benefit-blink ${promoStyle?.benefit || 'bg-sono-primary/5 text-sono-primary border-sono-primary/10'}`}>
                                                        <p className="text-[10px] md:text-[11px] font-black leading-relaxed break-keep line-clamp-2 text-center">
                                                            {promotion?.description || "지금 바로 상담 신청하고 혜택을 확인하세요."}
                                                        </p>
                                                    </div>

                                                    {/* 프로모션 카드에도 금액 표시 */}
                                                    <div className="mb-4 md:mb-6 space-y-2">
                                                        <div className="flex justify-between items-center px-1">
                                                            <span className="text-gray-400 font-bold text-[9px] md:text-[10px]">월 납입금</span>
                                                            <span className="text-sono-dark font-black text-xs md:text-sm">{item.monthlyPayment?.toLocaleString()}원</span>
                                                        </div>
                                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-2 md:p-3 rounded-xl border border-sono-primary/10 gap-0.5">
                                                            <span className="text-sono-primary font-black text-[9px] md:text-[10px] whitespace-nowrap">제휴카드 할인시</span>
                                                            <span className="text-sono-primary font-black text-sm md:text-base leading-none">{item.cardDiscountPayment?.toLocaleString()}원</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setPickedAppliance(item as any);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className={`w-full py-3 md:py-4 text-white rounded-xl md:rounded-2xl font-black text-[11px] md:text-sm transition-all shadow-lg ${promoStyle?.button || 'bg-sono-primary hover:bg-sono-dark shadow-sono-primary/20'}`}
                                                    >
                                                        혜택 신청
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 필터 시스템 */}
                        <div className="flex flex-col gap-4 md:gap-10">
                            {/* 1. 구좌수 필터 - 모달 슬라이드 적용 및 크기 축소 */}
                            <div className="flex flex-nowrap md:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                                <button
                                    onClick={() => { setSelectedUnit(""); setSelectedCategory("전체"); }}
                                    className={`px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-xs md:text-base transition-all duration-300 border whitespace-nowrap ${selectedUnit === ""
                                        ? "bg-sono-primary text-white border-sono-primary shadow-lg shadow-sono-primary/20"
                                        : "bg-white text-gray-400 border-gray-100"
                                        }`}
                                >
                                    전체 구좌
                                </button>
                                {availableSlots.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => { setSelectedUnit((val || 4).toString()); setSelectedCategory("전체"); }}
                                        className={`px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-xs md:text-base transition-all duration-300 border whitespace-nowrap ${selectedUnit === (val || 4).toString()
                                            ? "bg-sono-primary text-white border-sono-primary shadow-lg shadow-sono-primary/20"
                                            : "bg-white text-gray-400 border-gray-100"
                                            }`}
                                    >
                                        {val}구좌
                                    </button>
                                ))}
                            </div>

                            {/* 2. 카테고리 필터 - 여백 조정 및 크기 축소 */}
                            <div className="flex flex-nowrap md:justify-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                                {availableCategories.length > 0 && ["전체", ...availableCategories].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-full border text-xs md:text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                            ? "bg-sono-primary text-white border-sono-primary shadow-md"
                                            : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoadingAppliances ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-6">
                                <div className="animate-spin w-12 h-12 border-[5px] border-sono-primary border-t-transparent rounded-full"></div>
                                <p className="text-gray-400 font-bold animate-pulse">최신 가전 데이터를 불러오고 있습니다...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                {(selectedUnit === "" ? allWithNewFormat : filteredWithNewFormat).map((item, index) => {
                                    const promoStyle = getPromotionStyle(item.promotionId);
                                    const promotion = activePromotions.find(p => p._id === item.promotionId);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`group bg-white rounded-[40px] overflow-hidden border transition-all duration-500 flex flex-col h-full relative ${promoStyle?.border || 'border-gray-100 hover:border-sono-primary/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]'} ${promoStyle ? promoStyle.borderFull : ''}`}
                                        >
                                            {/* Promotion Tag (Top Left) - Neon Effect Applied */}
                                            {item.promotionId ? (
                                                <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
                                                    <span 
                                                        className={`text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-neon-blink ${promoStyle?.tag || 'bg-sono-primary'}`}
                                                        style={{ '--neon-color': promoStyle?.glow } as React.CSSProperties}
                                                    >
                                                        <span className="animate-pulse">🔥</span> 프로모션
                                                    </span>
                                                </div>
                                            ) : item.hasGift ? (
                                                <div className="absolute top-3 left-3 md:top-6 md:left-6 z-10">
                                                    <span className="bg-sono-gold text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                        <span className="animate-pulse">🎁</span> 사은품
                                                    </span>
                                                </div>
                                            ) : null}
                                            
                                            {/* Slot Tag */}
                                            <div className="absolute top-3 right-3 md:top-6 md:right-6 z-10">
                                                <span className="bg-sono-dark/80 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg">
                                                    {item.slotCount}구좌
                                                </span>
                                            </div>

                                            {/* Image Container */}
                                            <div className="aspect-square bg-[#f9fafb] p-4 md:p-10 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors duration-500">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                                />
                                                
                                                {/* Promotion Gift Image (Bottom Right) */}
                                                {promotion?.imageUrl && (
                                                    <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-white group-hover:scale-110 transition-transform duration-500 z-10 flex items-center justify-center">
                                                        <img src={promotion.imageUrl} alt="사은품" className="w-full h-full object-contain p-1" />
                                                        <div className="absolute top-0 right-0 bg-sono-primary text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">GIFT</div>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-4 md:p-8 flex-grow flex flex-col">
                                                <div className="mb-3 md:mb-4">
                                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest block mb-1 ${promoStyle?.text || 'text-sono-primary'}`}>{item.brand}</span>
                                                    <h3 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedProductNames(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(item.name)) next.delete(item.name);
                                                                else next.add(item.name);
                                                                return next;
                                                            });
                                                        }}
                                                        className={`text-sono-dark font-black text-xs md:text-base leading-tight tracking-tighter group-hover:text-sono-primary transition-all cursor-pointer ${expandedProductNames.has(item.name) ? "line-clamp-none" : "line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]"}`}
                                                    >
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-gray-400 font-bold text-[10px] md:text-xs mt-1 md:mt-2 uppercase truncate">{item.model}</p>
                                                </div>

                                                {/* Benefit Box for Main List - Blinking Effect */}
                                                {promotion && (
                                                    <div className={`mt-2 p-2.5 rounded-xl border animate-benefit-blink ${promoStyle?.benefit || 'bg-sono-primary/5 text-sono-primary border-sono-primary/10'}`}>
                                                        <p className="text-[9px] md:text-[10px] font-black leading-tight line-clamp-1">{promotion.description}</p>
                                                    </div>
                                                )}

                                                {/* Price Area - 모바일 2열 배치 대응 */}
                                                <div className="mt-auto pt-4 md:pt-6 border-t border-gray-50">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-400 font-bold text-[9px] md:text-xs">월 납입금</span>
                                                            <span className="text-sono-dark font-black text-xs md:text-lg">{item.monthlyPayment?.toLocaleString()}원</span>
                                                        </div>
                                                        <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${promoStyle?.bg || 'bg-sono-primary/5'}`}>
                                                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-0.5">
                                                                <span className={`font-black text-[9px] md:text-[11px] whitespace-nowrap ${promoStyle?.text || 'text-sono-primary'}`}>제휴카드 할인시</span>
                                                                <span className={`font-black text-sm md:text-xl leading-none ${promoStyle?.text || 'text-sono-primary'}`}>{item.cardDiscountPayment?.toLocaleString()}원</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setPickedAppliance(item as any);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className={`w-full mt-6 py-4 bg-gray-50 text-gray-400 group-hover:text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${promoStyle?.name === 'red' ? 'group-hover:bg-rose-600' : promoStyle?.name === 'blue' ? 'group-hover:bg-blue-600' : 'group-hover:bg-sono-dark'}`}
                                                >
                                                    가입 신청하기
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        </div>
                </section>

                {/* 전체 라인업 오버레이 (풀스크린) */}
                {showAllOverlay && (
                    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-fade-in-up">
                        {/* 상단 헤더 */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-10 px-6 py-4 md:py-6">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-black text-sono-dark tracking-tighter">전체 가전 라인업</h2>
                                <button
                                    onClick={() => setShowAllOverlay(false)}
                                    className="flex items-center gap-2 text-[#8b95a1] hover:text-sono-dark font-bold text-sm md:text-base border border-gray-200 px-4 py-2 rounded-xl transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    뒤로가기
                                </button>
                            </div>
                        </div>

                        {/* 본문 콘텐츠 */}
                        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 pb-40"> {/* pb-40 for fixed bar space */}
                            <div className="text-center mb-16">
                                <p className="text-sono-primary font-black text-sm uppercase tracking-widest mb-4">Product Catalog</p>
                                <h3 className="text-4xl md:text-5xl font-black text-sono-dark tracking-tighter leading-tight mb-10">
                                    원하시는 모든 가전을<br className="md:hidden" /> 한눈에 확인해보세요
                                </h3>

                                {/* 오버레이 전용 구좌 필터 버튼 */}
                                <div className="flex bg-[#f2f4f6] p-1.5 rounded-2xl shadow-inner border border-gray-100 inline-flex">
                                    {["전체", "2", "3", "4", "6"].map((u) => (
                                        <button
                                            key={u}
                                            onClick={() => setSelectedUnit(u === "전체" ? "" : u)}
                                            className={`px-4 md:px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${(u === "전체" && selectedUnit === "") || selectedUnit === u
                                                ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20"
                                                : "text-[#8b95a1] hover:text-sono-dark"
                                                }`}
                                        >
                                            {u}{u !== "전체" && "구좌"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-24">
                                {availableCategories.map((cat) => {
                                    const categoryItems = allAppliances.filter(a =>
                                        a.category === cat &&
                                        (selectedUnit === "" ? true : a.slotCount === Number(selectedUnit))
                                    );

                                    if (categoryItems.length === 0) return null;

                                    return (
                                        <div key={cat} className="animate-fade-in">
                                            <div className="flex items-center gap-4 mb-10">
                                                <h4 className="text-2xl md:text-3xl font-black text-sono-dark tracking-tight">{cat}</h4>
                                                <div className="h-0.5 flex-grow bg-gray-100 rounded-full"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                                                {categoryItems.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleApplianceClick(item)}
                                                        className={`group flex flex-col text-left transition-all duration-300 ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "scale-105" : ""}`}
                                                    >
                                                        <div className={`relative pt-[100%] rounded-[24px] overflow-hidden bg-[#f9fafb] border transition-all ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "border-sono-primary ring-4 ring-sono-primary/20 shadow-xl" : "border-gray-50 group-hover:border-sono-primary/30"}`}>
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-100">
                                                                {item.slotCount}구좌
                                                            </div>
                                                            {pickedAppliance?.name === item.name && pickedAppliance?.model === item.model && (
                                                                <div className="absolute inset-0 bg-sono-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                                                                    <div className="bg-sono-primary text-white rounded-full p-2 shadow-lg">
                                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-4 px-2">
                                                            <p className="text-[10px] font-bold text-[#8b95a1] mb-1 uppercase">{item.brand}</p>
                                                            <h5 className={`text-sm md:text-base font-extrabold leading-snug transition-colors mb-1 ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "text-sono-primary" : "text-sono-dark group-hover:text-sono-primary"}`}>{item.name}</h5>
                                                            <p className="text-[10px] md:text-sm font-bold text-[#6b7684] uppercase">{item.model}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fixed Bottom Bar for Selection */}
                {pickedAppliance && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 p-2 border border-gray-200">
                                    <img src={pickedAppliance.image} alt={pickedAppliance.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-sono-primary/10 text-sono-primary text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {pickedAppliance.slotCount}구좌
                                        </span>
                                        <span className="text-gray-400 text-xs font-bold uppercase truncate">{pickedAppliance.model}</span>
                                    </div>
                                    <h4 className="font-extrabold text-sono-dark truncate text-sm md:text-base">{pickedAppliance.name}</h4>
                                </div>
                            </div>
                            <div className="w-full md:w-auto flex gap-3">
                                <button
                                    onClick={() => setPickedAppliance(null)}
                                    className="px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors hidden md:block"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleApplyWithProduct}
                                    className="flex-1 md:flex-none md:min-w-[300px] bg-sono-primary text-white py-4 px-8 rounded-2xl font-black text-lg shadow-xl shadow-sono-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    선택한 상품으로 신청하기
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 상조 서비스 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">FUNERAL SERVICE</span>
                            <h2 className="section-title leading-tight">품격 있는 마지막 인사,<br className="md:hidden" /> 대명소노가 함께합니다</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                국가공인 장례지도사와 전문 도우미가 정성을 다해
                                고인의 명복을 빌며, 유가족의 슬픔을 함께 나누는 신뢰의 서비스를 약속드립니다.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 md:gap-10 mb-20 md:mb-32">
                            {[
                                {
                                    title: "정성을 다하는 서비스",
                                    desc: "고인을 위한 관과 수의를 정직하게 정성을 다합니다.",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/fileView%20(2).jpg?raw=true"
                                },
                                {
                                    title: "고객님을 위로하는 마음",
                                    desc: "전문 장례지도사가 모든 예법주관부터 행정업무까지 편리하게 지원합니다.",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/fileView%20(3).jpg?raw=true"
                                },
                                {
                                    title: "전문가의 따뜻한 손길",
                                    desc: "필요한 장의용품부터 고인 전용 차량까지 모두 제공합니다.",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/fileView%20(1).jpg?raw=true"
                                },
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col text-center group">
                                    <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden bg-gray-100 mb-6 md:mb-10 shadow-sm transition-all duration-500 hover:shadow-2xl">
                                        {item.img ? (
                                            <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#8b95a1] font-bold">이미지 준비중</div>
                                        )}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-sono-dark mb-3 md:mb-4 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">{item.title}</h3>
                                    <p className="text-[#6b7684] text-sm md:text-lg font-medium leading-relaxed break-keep px-4">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* 소노아임레디 상조 서비스만의 특별함 */}
                        <div className="max-w-4xl mx-auto animate-fade-in">
                            <div className="relative bg-[#dce9f5] py-4 rounded-sm mb-12 overflow-hidden shadow-sm">
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#1a3a63] -skew-x-[25deg] origin-top-right transform translate-x-6"></div>
                                <h3 className="text-[#1a3a63] text-lg md:text-2xl font-black text-center tracking-tight relative z-10">
                                    소노아임레디 상조 서비스만의 특별함
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-100 border-b border-gray-100">
                                {[
                                    {
                                        title: "처음부터 끝까지",
                                        desc: <>장례지도사는 1건의 장례가 끝날 때까지 책임지고 함께합니다.<br />24시간 긴급의전센터(1588-2227)를 운영하며 접수 시 전문 장례지도사가 2시간 이내 현장에 도착하여 도와드립니다.<br /><span className="text-[11px] text-[#8b95a1]">*도서 및 산간지역 제외, 상황에 따라 출동시간은 변동될 수 있음</span></>
                                    },
                                    {
                                        title: "전문가와 같이",
                                        desc: <>고객 만족도 99%*의 전문 장례지도사가 장례물품 준비부터 장례 진행, 행정 절차까지 유가족이 큰 어려움 없이 마무리할 수 있도록 곁에서 세심하게 관리해 드립니다.<br /><span className="text-[11px] text-[#8b95a1]">*2026년 기준</span></>
                                    },
                                    {
                                        title: "용품 보증 시스템",
                                        desc: <>규격용품보다 하위용품은 사용하지 않습니다. 소노아임레디만의 디자인 특허 고깔, 대마 100% 수의 등 빠짐없이 정직하게 준비해 드립니다.<br /><span className="text-[11px] text-[#8b95a1]">*고깔: 디자인등록증 제 30-1110105호/수의: 2024년 1월 fiti 직물테스트 기준 *1년 단위 주기 테스트 진행</span></>
                                    }
                                ].map((row, i) => (
                                    <div key={i} className="flex flex-col md:flex-row py-8 md:py-12 gap-4 md:gap-12">
                                        <div className="md:w-32 lg:w-40 flex-shrink-0">
                                            <h4 className="text-sono-dark text-lg md:text-xl font-black tracking-tighter leading-tight break-keep">{row.title}</h4>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sono-dark font-bold text-sm md:text-lg leading-relaxed md:leading-snug break-keep">{row.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 의전 서비스 상세 구성 */}
                <section className="py-16 md:py-24 bg-sono-light">
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-12 md:mb-16">
                            <span className="badge-gold mb-4">SERVICE DETAILS</span>
                            <h2 className="section-title">의전 서비스 상세 구성</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            {/* 고인용품 (입관/수시) */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    고인용품 (입관/수시)
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">관</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium">
                                            <p>오동나무 45mm (매장)</p>
                                            <p>오동나무 18mm/유골함 (화장)</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0">수의</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium">
                                            <p>대마 100% 기계직</p>
                                            <p className="text-[#8b95a1] font-bold text-xs">(꽃관보/도우미 대체 가능)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 입관용품 */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    입관용품
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">의류</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            도포, 원삼, 천금, 지금<br />(수의와 동일 제품)
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0">기타</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            명정, 관보, 베개, 습신 등<br />규격품 일체 제공
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 빈소 및 기타용품 */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    빈소 및 기타용품
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">빈소내 용품</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            향, 양초, 부의록, 위패 등<br />필요량 일체 제공
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0">대여/기타</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            향로, 촛대 (대여)<br />완장, 상장, 장갑 (제공)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 의전 및 제단 */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    의전 및 제단
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">현대식 상복</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            검정 양복 / 개량 한복<br />
                                            <span className="text-sono-primary font-bold">각 3벌 (남녀 무관)</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0">꽃장식</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            헌화용 국화 30송이, 꽃바구니 2개<br />
                                            <span className="text-red-500 font-bold">(제단 꽃장식 제외)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 차량지원 */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    차량지원
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">이송차량</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium">
                                            관내 (시, 군내) 무료 제공
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0 text-shadow-sm">유족버스/<br />리무진</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium leading-relaxed">
                                            왕복 200km 제공<br />
                                            <span className="text-sono-primary font-bold">택 1 (초과시 별도)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 인력지원 */}
                            <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                                <div className="bg-sono-dark text-white px-6 py-3 md:py-4 font-bold text-lg">
                                    인력지원
                                </div>
                                <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="font-bold text-sono-primary flex-shrink-0">장례지도사</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium">
                                            국가공인 지도사 <span className="font-bold text-sono-primary text-lg">1명</span>
                                            <p className="text-[#8b95a1] text-xs font-bold mt-1">(입관 및 행사 진행)</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start gap-4 border-t border-gray-50 pt-4 md:pt-6">
                                        <span className="font-bold text-sono-primary flex-shrink-0">의전도우미</span>
                                        <div className="text-right text-sm md:text-base text-sono-dark font-medium">
                                            전문 도우미 <span className="font-bold text-sono-primary text-lg">3명</span>
                                            <p className="text-[#8b95a1] text-xs font-bold mt-1">(접객 및 빈소 관리)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-2">
                            <p className="text-left md:text-center text-xs text-[#8b95a1] font-medium leading-relaxed">
                                ※ 상기 품목은 지역 및 장례식장 여건에 따라 동급의 타 제품으로 대체될 수 있습니다.
                            </p>
                            <p className="text-left md:text-center text-xs text-[#8b95a1] font-medium leading-relaxed">
                                ※ 고객의 요청에 의해 품목을 추가하실 경우 별도의 비용이 발생할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 하이브리드 전환 서비스 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">HYBRID SOLUTION</span>
                            <h2 className="section-title">상조를 넘어<br className="md:hidden" /> 라이프 스타일로 전환</h2>
                            <p className="section-subtitle max-w-3xl mx-auto">
                                상조가 아직 필요하지 않다면<br className="md:hidden" />
                                웨딩, 크루즈, 골프, 어학연수 등 다양한 라이프 케어 서비스로 전환하여 가치 있게 사용할 수 있습니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "웨딩",
                                    desc: "품격 있는 웨딩부티크 스튜디오, 드레스 등 토탈 케어",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product06.jpg"
                                },
                                {
                                    title: "크루즈",
                                    desc: "바다 위의 움직이는 호텔, 럭셔리 크루즈 여행",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product09.jpg"
                                },
                                {
                                    title: "해외여행",
                                    desc: "전 세계 어디든 원하는 곳으로 떠나는 프리미엄 패키지",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg"
                                },
                                {
                                    title: "골프",
                                    desc: "국내외 명문 골프장에서 즐기는 여유로운 라운딩",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product02.jpg"
                                },
                                {
                                    title: "교육/어학연수",
                                    desc: "자녀를 위한 해외 명문 학교 영어 캠프 및 연수 프로그램",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product04.jpg"
                                },
                                {
                                    title: "리빙",
                                    desc: "소노시즌 매트리스, 최신 가전, 휴대폰, 1:1 맞춤케어, 이사 컨시어지, 입주청소&정리수납, 키즈/침실/주방/거실 가구 패키지 등",
                                    img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg"
                                },
                                {
                                    title: "명품케어",
                                    desc: <>글로벌 명품 브랜드의 제품<br/>수선/매입/해외명품관 쇼핑</>,
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product10.jpg?raw=true"
                                },
                                {
                                    title: "쉼케어",
                                    desc: <>종합심리검사+해석상담<br/>장지 시설/안치 장소 및 시설 안내</>,
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product08.jpg?raw=true"
                                }
                            ].map((item, index) => (
                                <div key={index} className="group bg-white rounded-[24px] md:rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-row md:flex-col">
                                    <div className="relative w-24 sm:w-32 md:w-full h-auto md:h-64 overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-4 md:p-10 text-left md:text-center flex-1 flex flex-col justify-center">
                                        <h3 className="font-bold text-sono-dark text-lg md:text-2xl mb-1 md:mb-4 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">{item.title}</h3>
                                        <p className="text-[#8b95a1] text-xs md:text-base font-medium leading-relaxed break-keep">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 소노그룹 멤버십 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">MEMBERSHIP</span>
                            <h2 className="section-title leading-tight">가입과 동시에 누리는<br className="md:hidden" /> 대명 소노그룹 멤버십</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-10 max-w-5xl mx-auto">
                            <div className="card bg-sono-primary !p-6 md:!p-12 flex flex-row items-center md:items-start gap-5 md:gap-8 rounded-[32px] md:rounded-[40px] text-white text-left">
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                                    <svg className="w-7 h-7 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg md:text-2xl mb-1 md:mb-4 tracking-tight leading-tight">소노호텔 & 리조트 우대</h3>
                                    <p className="text-white/70 text-sm md:text-lg font-medium leading-tight md:leading-relaxed">전국 리조트 객실을 파트너사 전용 우대 가격으로 이용 가능합니다.</p>
                                </div>
                            </div>

                            <div className="card bg-sono-gold !p-6 md:!p-12 flex flex-row items-center md:items-start gap-5 md:gap-8 rounded-[32px] md:rounded-[40px] text-white text-left">
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                                    <svg className="w-7 h-7 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg md:text-2xl mb-1 md:mb-4 tracking-tight leading-tight">레저 시설 할인 혜택</h3>
                                    <p className="text-white/70 text-sm md:text-lg font-medium leading-tight md:leading-relaxed break-keep">워터파크(오션월드, 오션어드벤처, 오션플레이), 스키, 골프, 사우나 등 10~35%(최대 35%) 우대 혜택</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 소노아임레디몰 */}
                <section className="py-16 md:py-32 bg-[#fafbfc]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 border-b border-gray-200 pb-6 md:pb-8 gap-4">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-sono-dark mb-3 md:mb-4 tracking-tighter">소노아임레디몰</h2>
                                <p className="text-[#6b7684] text-sm md:text-xl font-bold">소노아임레디 회원을 위한 특별 혜택이 가득한 쇼핑몰!</p>
                            </div>
                            <a href="https://www.imreadymall.com/" target="_blank" rel="noopener noreferrer" className="text-[#8b95a1] font-bold text-sm md:text-lg hover:text-sono-primary transition-colors flex items-center gap-1 shrink-0">
                                소노아임레디몰 바로가기
                                <svg className="w-4 h-4 md:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </a>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                            <div className="flex-1 w-full animate-fade-in">
                                <img 
                                    src="https://github.com/jihoon3813-commits/img_sono/blob/main/computer_main.png?raw=true" 
                                    alt="소노아임레디몰 메인" 
                                    className="w-full h-auto drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
                                />
                            </div>
                            
                            <div className="flex-1 w-full space-y-6 md:space-y-10">
                                {[
                                    {
                                        title: "매일 기다려지는 특가 상품과 이벤트",
                                        desc: "타임딜, 릴레이딜부터 룰렛 이벤트! 매일 새로운 상품과 이벤트가 쏟아집니다!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    },
                                    {
                                        title: "초청 회원 가능",
                                        desc: "소중한 지인들과 함께 특가를 즐기고, 나에게는 포인트가 쌓이는 즐거움을 경험해보세요!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    },
                                    {
                                        title: "더욱 강력해진 적립&쿠폰 혜택",
                                        desc: <>만기까지 유지하신 고객님들께는 혜택을 더 드려요!<br className="hidden md:block" />특별 적립 & 쿠폰, 더 강력해진 혜택을 드립니다</>,
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    }
                                ].map((benefit, i) => (
                                    <div key={i} className="flex gap-6 md:gap-8 group border-b border-gray-100 pb-6 md:pb-10 last:border-none">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-sono-primary group-hover:bg-sono-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                                            <svg className="w-6 h-6 md:w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {benefit.icon}
                                            </svg>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h3 className="text-lg md:text-xl font-black text-sono-dark mb-2">{benefit.title}</h3>
                                            <p className="text-[#8b95a1] text-sm md:text-base font-bold leading-relaxed break-keep">{benefit.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 레디캐시 안내 */}
                <section className="py-16 md:py-24 bg-[#f1f5f9]">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
                        <h3 className="text-2xl md:text-3xl font-black text-sono-dark mb-8 tracking-tight">레디캐시 안내</h3>
                        <ul className="space-y-4 md:space-y-6">
                            {[
                                "레디캐시는 회원님이 가입한 상품의 해약환급금 내에서 당사가 정한 기준 금액에 한 해 1원당 1캐시로 전환하여 사용 가능합니다.",
                                "레디캐시는 납입한 상품 금액에서 사용한 레디캐시 금액만큼 차감되며 상품 이용(장례 또는 전환 서비스) 시, 사용한 레디캐시 금액만큼 추가 금액이 발생합니다.",
                                "레디캐시의 환불은 취소 완료일로부터 3영업일 이내 사용한 레디캐시 금액만큼 환불됩니다.",
                                "제휴 상황에 따라 일부 서비스는 변동될 수 있습니다. 자세한 내용은 공식 홈페이지 제휴 서비스 페이지를 참고하시기 바랍니다.",
                                "고객님께서 가입한 상품에 따라 레디캐시 발생 시점 및 금액은 상이할 수 있습니다."
                            ].map((text, i) => (
                                <li key={i} className="flex gap-4 text-sm md:text-lg text-[#4e5968] font-bold leading-relaxed">
                                    <span className="flex-shrink-0 mt-3 w-1.5 h-1.5 rounded-full bg-[#8b95a1]"></span>
                                    <p className="break-keep">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 중요 고지사항 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="section-title mb-4 md:mb-6">중요정보 고지사항</h2>
                            <p className="text-[#6b7684] text-sm md:text-base font-medium break-keep">
                                본 상품은 ㈜소노스테이션 상조 서비스 및 ㈜비에스온 렌탈 서비스 계약이 별도로 체결되는 상품입니다.<br className="hidden md:block" />
                                상조 서비스 중도 해약 시, 납입회차에 따른 해약환급금이 발생합니다. (가전 잔여 렌탈료 고객 부담)
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                            {/* 좌측 컬럼 */}
                            <div className="space-y-8 md:space-y-10">
                                <div className="card bg-white !p-8 md:!p-10">
                                    <h3 className="font-bold text-sono-primary text-lg md:text-xl mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                        환급기준 및 환급시기
                                    </h3>
                                    <ul className="space-y-4 text-[#4e5968] font-medium text-sm md:text-base">
                                        <li className="flex items-start gap-4">
                                            <span className="text-sono-primary mt-1">•</span>
                                            중도해약에 대한 환급 기준은 상조서비스 약관 규정에 의해 환급됩니다.
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <span className="text-sono-primary mt-1">•</span>
                                            환급금은 신청완료일로부터 3영업일 이내에 수령하실 수 있습니다.
                                        </li>
                                    </ul>
                                </div>

                                <div className="card bg-white !p-8 md:!p-10">
                                    <h3 className="font-bold text-sono-primary text-lg md:text-xl mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                        고객 불입금 관리방법
                                    </h3>
                                    <p className="text-[#4e5968] font-medium leading-relaxed text-sm md:text-base">
                                        [할부거래에 관한 법률] 제18조에 의거 선불식 할부거래업 등록하였으며, 동법 제27조에 따라 고객 불입금의 50%는 상조보증공제조합에 소비자피해보상을 위한 공제계약을 체결하고 있습니다.
                                    </p>
                                </div>
                            </div>

                            {/* 우측 컬럼 */}
                            <div className="space-y-8 md:space-y-10">
                                <div className="card bg-white !p-6 md:!p-10">
                                    <h3 className="font-bold text-sono-primary text-lg md:text-xl mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                        총 고객환급의무액 및 자산 현황
                                    </h3>
                                    <div className="bg-[#f9fafb] rounded-2xl overflow-hidden mb-4">
                                        <div className="grid grid-cols-2 divide-x divide-gray-100">
                                            <div className="px-4 py-4 md:px-6 md:py-6">
                                                <p className="text-[10px] md:text-xs font-bold text-sono-dark mb-2">총 고객환급의무액</p>
                                                <p className="font-bold text-sono-primary text-sm md:text-lg">1,129,868,124천원</p>
                                            </div>
                                            <div className="px-4 py-4 md:px-6 md:py-6 text-right md:text-left">
                                                <p className="text-[10px] md:text-xs font-bold text-sono-dark mb-2">상조 관련 자산</p>
                                                <p className="font-bold text-sono-primary text-sm md:text-lg">1,230,275,029천원</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-[#8b95a1] font-bold">(주)소노스테이션은 성지회계법인의 공인회계사를 통해 회계감사를 받고 있습니다.</p>
                                </div>

                                <div className="card bg-white !p-6 md:!p-10">
                                    <h3 className="font-bold text-sono-primary text-lg md:text-xl mb-6 flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                        소비자 유의사항
                                    </h3>
                                    <ul className="space-y-4 text-[#4e5968] font-medium text-xs md:text-sm">
                                        <li className="flex items-start gap-4">
                                            <span className="text-sono-primary mt-1">•</span>
                                            장의차량 운행 시 발생되는 도로공사 비용(통행료) 및 주차비 등은 고객 부담입니다.
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <span className="text-sono-primary mt-1">•</span>
                                            장례식장 임대료 및 접객용 음식료 등은 상품 구성에서 제외되어 있습니다.
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <span className="text-sono-primary mt-1">•</span>
                                            회비 납입 도중 행사 발생 시, 발인 전까지 잔여 회비를 일시납 하셔야 합니다.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-32 bg-sono-dark text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-sono-primary/10 to-transparent z-0"></div>
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-10 tracking-tighter leading-tight">
                            최고의 혜택을 담은<br className="md:hidden" /> 스마트케어 상품을<br />지금 바로 만나보세요.
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 mb-10 md:mb-12 font-medium">
                            본 상품은 소노 아임레디와 제휴한 제휴사 회원에게만 제공하는 혜택이 포함되어 있습니다.
                        </p>
                        {partnerMode ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn-primary text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 inline-block"
                            >
                                {ctaText}
                            </button>
                        ) : (
                            <Link href="/partner/apply" className="btn-primary text-lg md:text-xl px-10 md:px-12 py-4 md:py-5 inline-block">
                                {ctaText}
                            </Link>
                        )}
                    </div>
                </section>
            </main >
            {!isModalOpen && <Footer />
            }

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="smartcare"
                showProductSelect={false}
                initialAppliance={pickedAppliance
                    ? (pickedAppliance.model ? `${pickedAppliance.brand} ${pickedAppliance.name} (${pickedAppliance.model})` : `${pickedAppliance.brand} ${pickedAppliance.name}`)
                    : undefined}
                initialUnit={pickedAppliance ? (pickedAppliance.slotCount || 4).toString() : selectedUnit}
                isPremiumMallMode={isPremiumMallMode}
            />
        </>
    );
}
