"use client";

import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState, useEffect } from "react";
import InquiryModal from "@/components/InquiryModal";

interface Appliance {
    brand: string;
    model: string;
    name: string;
    tag: string;
    image: string;
}

interface SmartCareContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
}

export default function SmartCareContent({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = ""
}: SmartCareContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allAppliances, setAllAppliances] = useState<Appliance[]>([]);
    const [pickedAppliance, setPickedAppliance] = useState<Appliance | null>(null);

    const [selectedUnit, setSelectedUnit] = useState<string>("4");
    const [showAllOverlay, setShowAllOverlay] = useState(false);
    const [isLoadingAppliances, setIsLoadingAppliances] = useState(true);

    const GAS_URL = "https://script.google.com/macros/s/AKfycbwQkuIm7ERScHFZMUrn4bqw81hhr3oE2Zw9MNGXmkldCTGh16Ho5-WdzVXwZHJC8b_b/exec";

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch(`${GAS_URL}?action=getProducts`);
                const data = await response.json();
                setAllAppliances(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoadingAppliances(false);
            }
        }
        fetchProducts();
    }, []);

    // 페이지 내 버튼 문구 처리
    const ctaText = partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기";

    // 현재 구좌에 맞는 가전 필터링 (최대 12개)
    // tag 컬럼에 '4구좌'와 같이 포함되어 있는지 확인
    const filteredAppliances = allAppliances
        .filter(item => selectedUnit === "" ? true : (item.tag && item.tag.includes(`${selectedUnit}구좌`)))
        .slice(0, 12);

    // 전체 가전 카테고리별 분류 (tag에서 구좌 정보 외의 첫 번째 단어를 카테고리로 가정하거나, 유연하게 처리)
    const categories = Array.from(new Set(allAppliances.map(a => {
        if (!a.tag) return "기타";
        // tag가 "TV, 4구좌, BEST" 형태라고 가정할 때 첫 번째가 카테고리
        return a.tag.split(',')[0].trim();
    })));

    // Helper to determine unit from tag
    const getUnitFromTag = (tag: string) => {
        if (!tag) return "4";
        const match = tag.match(/(\d+)구좌/);
        return match ? match[1] : "4";
    };

    const handleApplianceClick = (item: Appliance) => {
        setPickedAppliance(item);
        // Automatically select the unit corresponding to the product
        const unit = getUnitFromTag(item.tag);
        if (unit && unit !== selectedUnit && selectedUnit !== "") {
            setSelectedUnit(unit);
        }
    };

    const handleApplyWithProduct = () => {
        if (pickedAppliance) {
            setSelectedUnit(getUnitFromTag(pickedAppliance.tag));
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} />
            <main className="pb-32"> {/* Add padding for fixed bottom bar */}
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[70vh] flex items-center bg-sono-dark overflow-hidden pt-12"
                >
                    <div className="absolute inset-0 z-0">
                        <img
                            src={"https://github.com/jihoon3813-commits/img_sono/blob/main/Generated%20Image%20January%2022%2C%202026%20-%205_18PM.jpeg?raw=true".replace(/ /g, '%20')}
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
                                    가전은 즉시 받고,<br className="md:hidden" /> 납입금은 미래의 상조로 준비하는,<br />
                                    대한민국 No.1 하이브리드 라이프 솔루션
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
                                                필요한 가전을 먼저 받고 상조는 나중에 준비하세요.
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
                                        title: "프리미엄 가전 즉시 지원",
                                        desc: "삼성, LG 등 최고급 브랜드 가전을 별도 비용 없이 즉시 지원받습니다.",
                                        icon: "⚡"
                                    },
                                    {
                                        title: "100% 안심 환급 시스템",
                                        desc: "만기 시 서비스를 이용하지 않으시면 납입금 전액을 그대로 돌려드립니다.",
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
                                { unit: "2", price: "33,000", target: "1인 가구 / 소형 가전" },
                                { unit: "3", price: "49,500", target: "신혼 부부 / 중형 가전" },
                                { unit: "4", price: "66,000", target: "일반 가전 / 대형 가전", best: true },
                                { unit: "6", price: "99,000", target: "대가족 / 프리미엄 가전 패키지" },
                            ].map((plan, i) => (
                                <div key={i} className={`p-5 md:p-10 rounded-[32px] border transition-all ${plan.best ? "bg-sono-primary border-sono-primary shadow-2xl md:scale-105" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                                    {plan.best && <span className="bg-white text-sono-primary text-[10px] font-black px-3 py-1 rounded-full mb-3 md:mb-6 inline-block">BEST CHOICE</span>}
                                    <h3 className="text-2xl font-black mb-1 md:mb-2">{plan.unit}구좌</h3>
                                    <p className="text-white/50 text-sm font-bold mb-4 md:mb-8">{plan.target}</p>
                                    <div className="mb-6 md:mb-10">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        <span className="text-lg opacity-60 ml-1">원~</span>
                                    </div>
                                    <ul className="space-y-2 md:space-y-4 mb-2 md:mb-4 opacity-80 text-sm font-bold">
                                        <li className="flex items-center gap-2">✓ 가전 지원 혜택</li>
                                        <li className="flex items-center gap-2">✓ 멤버십 즉시 이용</li>
                                        <li className="flex items-center gap-2">✓ 100% 만기 환급</li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* 가전 라인업 하이브리드 섹션 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]" id="appliance-section">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">LINEUP</span>
                            <h2 className="section-title">스마트케어 가전 라인업</h2>
                            <p className="section-subtitle max-w-2xl mx-auto mb-12">
                                TV, 세탁기, 냉장고부터 최신 IT 기기까지<br />
                                라이프 스타일에 딱 맞는 가전을 선택해보세요.
                            </p>

                            {/* 구좌 필터 버튼 */}
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
                                {[
                                    { label: "전체", val: "" },
                                    { label: "2구좌", val: "2" },
                                    { label: "3구좌", val: "3" },
                                    { label: "4구좌", val: "4" },
                                    { label: "6구좌", val: "6" },
                                ].map((u) => (
                                    <button
                                        key={u.val}
                                        onClick={() => setSelectedUnit(u.val)}
                                        className={`px-6 md:px-8 py-3.5 rounded-2xl font-bold text-sm md:text-base transition-all ${selectedUnit === u.val
                                            ? "bg-sono-primary text-white shadow-xl shadow-sono-primary/20 scale-105"
                                            : "bg-white text-[#8b95a1] hover:text-sono-dark border border-gray-100 shadow-sm"
                                            }`}
                                    >
                                        {u.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoadingAppliances ? (
                            <div className="py-20 flex justify-center">
                                <div className="animate-spin w-10 h-10 border-4 border-sono-primary border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {(selectedUnit === "" ? allAppliances.slice(0, 12) : filteredAppliances).map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleApplianceClick(item)}
                                            className={`group relative bg-white rounded-[32px] overflow-hidden border transition-all duration-500 flex flex-col h-full text-left ${pickedAppliance?.name === item.name && pickedAppliance?.model === item.model ? "border-sono-primary ring-4 ring-sono-primary/20 shadow-2xl scale-[1.02] z-10" : "border-gray-50 hover:border-sono-primary/30 hover:shadow-2xl"}`}
                                        >
                                            <div className="relative pt-[100%] overflow-hidden bg-[#f9fafb] w-full">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {item.tag.includes("BEST") && (
                                                    <div className="absolute top-4 left-4 bg-sono-gold text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">BEST</div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-sono-dark/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                                                    {item.tag.split(',').find(t => t.includes('구좌'))?.trim() || "상세문의"}
                                                </div>
                                                {pickedAppliance?.name === item.name && pickedAppliance?.model === item.model && (
                                                    <div className="absolute inset-0 bg-sono-primary/10 flex items-center justify-center backdrop-blur-[1px]">
                                                        <div className="bg-sono-primary text-white rounded-full p-3 shadow-xl transform scale-100 transition-transform">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 md:p-8 flex-grow flex flex-col justify-center w-full">
                                                <p className="text-[#8b95a1] font-bold text-[10px] md:text-xs mb-1.5 uppercase tracking-wider">{item.brand}</p>
                                                <h3 className="text-sono-dark font-extrabold text-base md:text-xl tracking-tighter leading-tight group-hover:text-sono-primary transition-colors mb-1.5 break-keep">{item.name}</h3>
                                                <p className="text-[#6b7684] font-bold text-xs md:text-sm uppercase">{item.model}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-16 md:mt-24 text-center">
                                    <button
                                        onClick={() => setShowAllOverlay(true)}
                                        className="inline-flex items-center gap-3 bg-white text-sono-dark border border-gray-200 hover:bg-gray-50 px-12 py-5 rounded-2xl font-bold text-xl transition-all shadow-sm active:scale-95"
                                    >
                                        전체 라인업 보기
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </button>
                                </div>
                            </>
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
                                {categories.map((cat) => {
                                    const categoryItems = allAppliances.filter(a =>
                                        a.tag.split(',')[0].trim() === cat &&
                                        (selectedUnit === "" ? true : a.tag.includes(`${selectedUnit}구좌`))
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
                                                                {item.tag.split(',').find(t => t.includes('구좌'))?.trim() || "정보"}
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
                                            {getUnitFromTag(pickedAppliance.tag)}구좌
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

                        <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                            {[
                                {
                                    title: "국가공인 장례지도사",
                                    desc: "입관 시 2명 투입 및 24시간 상시대기",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/funeral_ready_list01_08.jpg?raw=true"
                                },
                                {
                                    title: "프리미엄 장의 차량",
                                    desc: "최신형 리무진 및 대형 버스 즉시 투입",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/funeral_ready_list01_09.jpg?raw=true"
                                },
                                {
                                    title: "철저한 사후 관리",
                                    desc: "행사 후 품질 심사 및 피드백 상시 지원",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/funeral_ready_list01_10.jpg?raw=true"
                                },
                            ].map((item, index) => (
                                <div key={index} className="group bg-[#f9fafb] rounded-[24px] md:rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100 flex flex-row md:flex-col">
                                    <div className="relative w-28 sm:w-36 md:w-full h-auto md:h-56 overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    </div>
                                    <div className="p-4 md:p-10 text-left md:text-center flex-1 flex flex-col justify-center">
                                        <h3 className="text-lg md:text-2xl font-bold text-sono-dark mb-1 md:mb-4 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">{item.title}</h3>
                                        <p className="text-[#6b7684] text-xs md:text-base font-medium leading-relaxed break-keep">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
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
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product06.jpg?raw=true"
                                },
                                {
                                    title: "크루즈",
                                    desc: "바다 위의 움직이는 호텔, 럭셔리 크루즈 여행",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product09.jpg?raw=true"
                                },
                                {
                                    title: "해외여행",
                                    desc: "전 세계 어디든 원하는 곳으로 떠나는 프리미엄 패키지",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product01.jpg?raw=true"
                                },
                                {
                                    title: "골프",
                                    desc: "국내외 명문 골프장에서 즐기는 여유로운 라운딩",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product02.jpg?raw=true"
                                },
                                {
                                    title: "어학연수",
                                    desc: "자녀를 위한 해외 명문 학교 영어 캠프 및 연수 프로그램",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product04.jpg?raw=true"
                                },
                                {
                                    title: "라이프케어",
                                    desc: "소노시즌 매트리스, 최신 가전, 휴대폰 등 생활 전반 지원",
                                    img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product07.jpg?raw=true"
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
                                    <p className="text-white/70 text-sm md:text-lg font-medium leading-tight md:leading-relaxed">오션월드, 스키장, 골프장 등 모든 레저 시설 할인권을 제공합니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 포인트/레디캐시 활용 안내 섹션 - 멤버십 아래로 이동 */}
                <section className="py-16 md:py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
                            <div className="relative animate-fade-in order-2 md:order-1">
                                <div className="absolute -inset-10 bg-sono-primary/5 rounded-full blur-3xl"></div>
                                <img
                                    src="https://github.com/jihoon3813-commits/img_sono/blob/0ece40f4f520058678cf3548f6c075396274b894/photo_main_giftcard_app%20(1).png?raw=true"
                                    alt="소노아임레디 모바일 앱 및 기프트카드"
                                    className="relative z-10 w-full max-w-[500px] mx-auto drop-shadow-2xl rounded-[40px]"
                                />
                            </div>
                            <div className="animate-fade-in order-1 md:order-2 text-center md:text-left">
                                <span className="badge-primary mb-6 px-4 py-2 inline-block">MOBILE EXPERIENCE</span>
                                <h2 className="section-title mb-8">모바일로 더 스마트한<br />포인트 혜택</h2>
                                <div className="space-y-10 md:space-y-8">
                                    <div className="flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-sono-primary/10 text-sono-primary flex items-center justify-center flex-shrink-0 font-bold text-xl">01</div>
                                        <div>
                                            <h4 className="font-bold text-sono-dark text-xl mb-2 tracking-tight">실시간 포인트 확인 및 사용</h4>
                                            <p className="text-[#6b7684] font-medium leading-relaxed">적립된 제휴몰 포인트와 레디캐시를 모바일에서 실시간으로 확인하고, 소노아임레디몰에서 즉시 현금처럼 사용할 수 있습니다.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-sono-gold/10 text-sono-gold flex items-center justify-center flex-shrink-0 font-bold text-xl">02</div>
                                        <div>
                                            <h4 className="font-bold text-sono-dark text-xl mb-2 tracking-tight">다양한 모바일 기프트 상품</h4>
                                            <p className="text-[#6b7684] font-medium leading-relaxed">전환 서비스를 통해 일상의 즐거움을 더하는 모바일 상품권 및 기프트 카드로 교환하여 언제 어디서나 편리하게 이용하세요.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center md:flex-row md:items-start gap-4 md:gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-sono-success/10 text-sono-success flex items-center justify-center flex-shrink-0 font-bold text-xl">03</div>
                                        <div>
                                            <h4 className="font-bold text-sono-dark text-xl mb-2 tracking-tight">내 손안의 라이프 솔루션</h4>
                                            <p className="text-[#6b7684] font-medium leading-relaxed">복잡한 절차 없이 앱 하나로 가전 배송 조회부터 멤버십 혜택 예약까지, 모든 라이프 서비스를 스마트하게 관리할 수 있습니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 중요 고지사항 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <h2 className="section-title">중요정보 고지사항</h2>
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
                                                <p className="font-bold text-sono-primary text-sm md:text-lg">1,068,990,831천원</p>
                                            </div>
                                            <div className="px-4 py-4 md:px-6 md:py-6 text-right md:text-left">
                                                <p className="text-[10px] md:text-xs font-bold text-sono-dark mb-2">상조 관련 자산</p>
                                                <p className="font-bold text-sono-primary text-sm md:text-lg">1,221,786,713천원</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-[#8b95a1] font-bold">* 2024년 12월말 기준, 공인회계사 회계감사를 완료하였습니다.</p>
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
            </main>
            <Footer />

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="스마트케어"
                initialAppliance={pickedAppliance
                    ? (pickedAppliance.model ? `${pickedAppliance.brand} ${pickedAppliance.name} (${pickedAppliance.model})` : `${pickedAppliance.brand} ${pickedAppliance.name}`)
                    : undefined}
                initialUnit={pickedAppliance ? getUnitFromTag(pickedAppliance.tag) : selectedUnit}
            />
        </>
    );
}
