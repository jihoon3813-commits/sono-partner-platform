"use client";

import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState } from "react";
import InquiryModal from "@/components/InquiryModal";

interface Happy450ContentProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    isPremiumMallMode?: boolean;
}

export default function Happy450Content({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    isPremiumMallMode = false
}: Happy450ContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // 파트너 페이지에서는 제휴신청 대신 가입신청으로 표시됨 (Header에서 처리)
    // 페이지 내 버튼 문구 처리
    const ctaText = isPremiumMallMode 
        ? "프리미엄몰 접수 바로가기" 
        : (partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기");

    return (
        <>
            {!isModalOpen && <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} productType="happy450" isPremiumMallMode={isPremiumMallMode} />}
            <main>
                {/* 히어로 섹션 */}
                <section
                    className="relative min-h-[70vh] flex items-center bg-sono-dark overflow-hidden pt-12"
                    style={{
                        backgroundImage: 'url("https://raw.githubusercontent.com/jihoon3813-commits/img_sono/ba129da43419b13c6e6fe3df92fc852b3f2e6abf/Generated%20Image%20January%2022%2C%202026%20-%205_16PM.jpeg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 텍스트 가독성을 위한 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sono-dark/80 via-sono-dark/40 to-transparent z-0"></div>
                    <div className="absolute inset-0 bg-black/20 z-0"></div>

                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 relative z-10 w-full">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="animate-fade-in">
                                <span className="inline-block bg-sono-primary text-white border border-white/20 mb-8 px-4 py-2 rounded-lg text-sm font-bold shadow-xl">일반상조</span>
                                <h1 className="leading-[1.15] mb-8 tracking-tighter filter drop-shadow-2xl">
                                    <span className="block text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-md">더 해피 450 ONE</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white mb-12 leading-relaxed max-w-2xl break-keep font-semibold drop-shadow-sm">
                                    제휴몰 포인트 증정<span className="md:hidden"><br /></span><span className="hidden md:inline"> + </span>레디캐시 + 납입금 100% 환급<br />
                                    소노아임레디의 기본 상조 서비스
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
                                </div>

                                {/* 합리적 선택 박스 - 버튼 아래로 배치 */}
                                <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <div className="relative group inline-flex flex-col gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-[32px] shadow-2xl max-w-lg animate-neon-blink overflow-hidden">
                                        {/* 내부 빛나는 효과 */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-flash-smooth"></div>
                                        
                                        <div className="flex items-start gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-sono-gold text-sono-dark flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0 animate-bounce-short">
                                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-sono-gold text-lg md:text-xl font-black tracking-tight mb-2 flex items-center gap-2">
                                                    제휴카드 파격 할인 혜택
                                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">HOT</span>
                                                </h3>
                                                <p className="text-white font-black text-[16px] md:text-[18px] leading-snug break-keep">
                                                    발급 후 자동이체 시 첫 달 <span className="text-sono-gold underline underline-offset-4 decoration-2">무조건 12,000원 할인!!</span>
                                                </p>
                                                <div className="mt-4 flex items-center justify-between gap-4">
                                                    <p className="text-white/60 font-bold text-[11px] md:text-xs break-keep">
                                                        자세한 내용은 제휴카드 안내에서 확인하세요.
                                                    </p>
                                                    <a href="#affiliate-card" className="shrink-0 bg-white/20 hover:bg-white text-white hover:text-sono-primary px-3 py-1.5 rounded-full text-[11px] font-black transition-all border border-white/30 flex items-center gap-1">
                                                        바로가기
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 배경 그라데이션 디테일 */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none"></div>
                </section>

                {/* 3가지 핵심 혜택 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">BENEFITS</span>
                            <h2 className="section-title">3가지 핵심 혜택</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10">
                            {[
                                {
                                    title: "BENEFIT 01",
                                    name: "제휴몰 포인트 증정",
                                    desc: "계약과 동시에 제휴 쇼핑몰에서 사용 가능한 포인트를 지급받습니다.",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                },
                                {
                                    title: "BENEFIT 02",
                                    name: "제휴카드 파격 할인",
                                    desc: "제휴카드를 발급받고 자동이체 신청 시, 첫달은 실적 없이도 12,000원 할인받을 수 있습니다.",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                                },
                                {
                                    title: "SPECIAL",
                                    name: "납입금 100% 환급",
                                    desc: "만기 납입 후 익월 해약 시",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                },
                            ].map((benefit, index) => (
                                <div key={index} className="card bg-white !p-5 md:!p-12 group flex flex-col md:items-center md:text-center">
                                    <div className="flex items-center gap-4 md:flex-col md:gap-0 mb-4 md:mb-8">
                                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[28px] bg-sono-primary/10 text-sono-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <svg className="w-7 md:w-10 h-7 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {benefit.icon}
                                            </svg>
                                        </div>
                                        <div className="text-left md:text-center">
                                            <div className="text-sono-primary text-xs md:text-sm font-bold md:mb-2 uppercase tracking-wider">{benefit.title}</div>
                                            <h3 className="text-lg md:text-2xl font-bold text-sono-dark tracking-tight leading-tight">{benefit.name}</h3>
                                        </div>
                                    </div>
                                    <p className="text-[#6b7684] text-sm md:text-base font-medium leading-relaxed text-left md:text-center">{benefit.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 납입 플랜 */}
                <section className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">PLAN</span>
                            <h2 className="section-title">합리적인 월 납입 플랜</h2>
                            <p className="section-subtitle">부담 없는 납입금으로<br className="md:hidden" /> 미래의 상조 서비스를 준비하세요.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-10 max-w-5xl mx-auto">
                            {[
                                { name: "실속형", units: "더 해피450 ONE 1구좌", price: "18,000", desc: "가장 기본적인 상조 서비스" },
                                { name: "인기형", units: "더 해피450 ONE 2구좌", price: "36,000", desc: "더 풍성한 서비스 구성", popular: true },
                                { name: "베스트", units: "더 해피450 ONE 3구좌", price: "54,000", desc: "프리미엄 서비스 구성" },
                            ].map((plan, index) => (
                                <div key={index} className={`card relative !p-5 md:!p-12 flex flex-col h-full transition-all ${plan.popular ? 'ring-2 ring-sono-primary shadow-xl shadow-sono-primary/10 md:scale-105 z-10' : 'bg-[#f9fafb] border-none'}`}>
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                            <span className="bg-sono-primary text-white text-xs font-bold px-4 py-1.5 rounded-full">MOST POPULAR</span>
                                        </div>
                                    )}
                                    <div className="text-center mb-4 md:mb-10">
                                        <h3 className="text-xl md:text-2xl font-bold text-sono-dark mb-1 md:mb-2">{plan.name}</h3>
                                        <span className="text-[#8b95a1] font-bold text-sm">{plan.units}</span>
                                        <div className="my-3 md:my-8">
                                            <span className="text-3xl md:text-4xl font-bold text-sono-primary tracking-tight">{plan.price}</span>
                                            <span className="text-[#6b7684] font-bold ml-1 text-sm md:text-base">원/월</span>
                                        </div>

                                        {/* 제휴카드 할인 가격 안내 */}
                                        <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center bg-[#f8fafc] rounded-xl px-4 py-3 group/price hover:bg-sono-primary/5 transition-colors">
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-sono-primary leading-none mb-1.5">제휴카드 할인</p>
                                                    <p className="text-[10px] font-bold text-[#8b95a1] leading-none">30만원 실적 시</p>
                                                </div>
                                                <div className="text-right flex items-baseline gap-0.5">
                                                    <span className="text-lg md:text-xl font-black text-sono-primary whitespace-nowrap">
                                                        {Math.max(0, Number(plan.price.replace(/,/g, '')) - 12000).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs font-bold text-[#8b95a1] whitespace-nowrap">원</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-[#f8fafc] rounded-xl px-4 py-3 group/price hover:bg-amber-50/50 transition-colors">
                                                <div className="text-left">
                                                    <p className="text-[11px] font-black text-[#f59e0b] leading-none mb-1.5">제휴카드 최대할인</p>
                                                    <p className="text-[10px] font-bold text-[#8b95a1] leading-none">150만원 실적 시</p>
                                                </div>
                                                <div className="text-right flex items-baseline gap-0.5">
                                                    <span className="text-lg md:text-xl font-black text-[#f59e0b] whitespace-nowrap">
                                                        {Math.max(0, Number(plan.price.replace(/,/g, '')) - 25000).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] md:text-xs font-bold text-[#8b95a1] whitespace-nowrap">원</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[#6b7684] text-center font-medium mb-4 md:mb-10 flex-grow text-sm md:text-base">{plan.desc}</p>
                                    <ul className="space-y-2 md:space-y-4 text-sm font-bold mb-2 md:mb-4">
                                        {[
                                            "제휴몰 포인트 지급",
                                            "레디캐시 전환",
                                            "소노그룹 멤버십",
                                            "납입금 100% 환급"
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-center gap-3 text-[#4e5968]">
                                                <svg className="w-5 h-5 text-[#00d084]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 max-w-5xl mx-auto">
                            <div className="bg-[#e8f3ff] border border-sono-primary/20 rounded-[32px] p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-lg shadow-sono-primary/5">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-white text-sono-primary flex items-center justify-center flex-shrink-0 shadow-sm animate-bounce-short">
                                    <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div className="text-center md:text-left">
                                    <h4 className="text-lg md:text-xl font-black text-sono-dark mb-2 tracking-tight">
                                        할인 받아도 <span className="text-sono-primary underline underline-offset-4 decoration-2">환급은 100% 그대로!</span>
                                    </h4>
                                    <p className="text-[#4e5968] font-bold text-sm md:text-lg leading-relaxed break-keep">
                                        제휴카드로 할인을 받았다고 하더라도 <span className="text-sono-dark font-black">만기환급금은 가입 금액 그대로 인정</span>해 드립니다.
                                    </p>
                                    <p className="text-sono-primary/60 font-bold text-xs md:text-base mt-2">
                                        (예: 월 18,000원 회비를 제휴카드를 통해 전액 할인 받았어도, 만기 시 18,000원 납입으로 인정)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-12 text-center space-y-1 md:space-y-2">
                            <p className="text-[#8b95a1] font-bold text-xs md:text-sm italic">
                                *100% 환급 조건 : 만기 납입 후 익월 해약 시*
                            </p>
                            <p className="text-[#8b95a1] font-bold text-xs md:text-sm italic">
                                *레디캐시 사용 조건 : 가입 상품의 해약환급금 80% 사용 가능*
                            </p>
                        </div>
                    </div>
                </section>

                {/* 제휴카드 혜택 */}
                <section id="affiliate-card" className="py-16 md:py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="relative p-6 md:p-12 lg:p-20 rounded-[40px] md:rounded-[64px] border-[3px] border-sono-primary/30 bg-[#f8fafc] shadow-[0_0_30px_rgba(49,130,246,0.1)] hover:shadow-[0_0_50px_rgba(49,130,246,0.2)] hover:border-sono-primary/50 transition-all duration-500">
                            <div className="text-center mb-16 md:mb-24">
                                <span className="bg-sono-primary/10 text-sono-primary text-xs font-bold px-4 py-2 rounded-lg mb-6 inline-block uppercase tracking-wider">AFFILIATE CARD</span>
                                <h2 className="section-title leading-tight">제휴카드 할인 혜택</h2>
                                <p className="section-subtitle">제휴카드로 결제 시 매월 납입금 부담을 더 줄여드립니다.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-16 max-w-5xl mx-auto">
                                {/* 카드 1: KB국민카드 */}
                                <div className="relative bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f59e0b] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10">연회비 가장 저렴</div>
                                    <div className="aspect-[1.58/1] bg-gray-50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097491/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2_zql90f.png" 
                                            alt="소노아임레디 KB국민카드"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="mb-8 text-center md:text-left">
                                        <h3 className="text-[16px] sm:text-xl md:text-2xl font-black text-sono-dark mb-2 tracking-tighter whitespace-nowrap">소노아임레디 KB국민카드</h3>
                                        <p className="text-[#f59e0b] font-bold text-lg whitespace-nowrap">최대 <span className="text-2xl md:text-3xl">1.7만원</span> 할인</p>
                                    </div>
                                    <div className="space-y-4 mb-8 flex-grow">
                                        <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[#8b95a1] font-bold text-[11px] md:text-xs shrink-0">전월 30만원 실적 시</span>
                                                <span className="text-sono-dark font-black text-xs md:text-sm">12,000원 할인</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[#f59e0b]">
                                                <span className="font-bold text-[11px] md:text-xs shrink-0">첫 달 실적 없어도</span>
                                                <span className="font-black text-xs md:text-sm underline underline-offset-4 decoration-2">12,000원 할인</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 px-1">
                                            <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                <span className="text-[#8b95a1]">전월 30만원 ↑</span>
                                                <span className="text-sono-dark">12,000원</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                <span className="text-[#8b95a1]">전월 70만원 ↑</span>
                                                <span className="text-sono-dark">17,000원</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-4">
                                            <span className="text-[#8b95a1] font-bold text-xs">연회비</span>
                                            <span className="text-xs font-bold text-sono-dark text-right">국내외겸용 15,000원</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 mt-auto">
                                        <a href="tel:1899-0077" className="flex items-center justify-center gap-2 bg-sono-dark text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/5 text-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                            1899-0077 전화 신청
                                        </a>
                                        <a href="https://card.kbcard.com/CRD/DVIEW/HCAMCXPRICAC0076?cooperationcode=04342&mainCC=a&solicitorcode=7030201000" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-sono-dark border-2 border-sono-dark/10 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all text-sm">
                                            온라인 신청
                                        </a>
                                    </div>
                                </div>

                                {/* 카드 2: 하나카드 */}
                                <div className="relative bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap z-10">빠른 신청(전용번호)</div>
                                    <div className="aspect-[1.58/1] bg-gray-50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                                        <img 
                                            src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097508/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom_delgx0.png" 
                                            alt="소노아임레디 플러스 하나카드"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="mb-8 text-center md:text-left">
                                        <h3 className="text-[15px] sm:text-xl md:text-2xl font-black text-sono-dark mb-2 tracking-tighter whitespace-nowrap">소노아임레디 플러스 하나카드</h3>
                                        <p className="text-red-500 font-bold text-lg whitespace-nowrap">최대 <span className="text-2xl md:text-3xl">1.9만원</span> 할인</p>
                                    </div>
                                    <div className="space-y-4 mb-8 flex-grow">
                                        <div className="bg-red-50/50 rounded-2xl p-5 border border-red-50">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[#8b95a1] font-bold text-[11px] md:text-xs shrink-0">전월 30만원 실적 시</span>
                                                <span className="text-sono-dark font-black text-xs md:text-sm">12,000원 할인</span>
                                            </div>
                                            <div className="flex justify-between items-center text-red-500">
                                                <span className="font-bold text-[11px] md:text-xs shrink-0">첫 달 실적 없어도</span>
                                                <span className="font-black text-xs md:text-sm underline underline-offset-4 decoration-2">12,000원 할인</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 px-1">
                                            <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                <span className="text-[#8b95a1]">전월 30만원 ↑</span>
                                                <span className="text-sono-dark">12,000원</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] md:text-xs font-bold">
                                                <span className="text-[#8b95a1]">전월 100만원 ↑</span>
                                                <span className="text-sono-dark">19,000원</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-4">
                                            <span className="text-[#8b95a1] font-bold text-xs">연회비</span>
                                            <span className="text-xs font-bold text-sono-dark text-right">국내외겸용 20,000원</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 mt-auto">
                                        <a href="tel:1800-0672" className="flex items-center justify-center gap-2 bg-sono-dark text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/5 text-sm">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.587 4.587l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                            1800-0672 전화 신청
                                        </a>
                                        <a href="https://m.hanacard.co.kr/MPACMM101M.web?CD_PD_SEQ=13910" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-white text-sono-dark border-2 border-sono-dark/10 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all text-sm">
                                            온라인 신청
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full">
                                <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-200 shadow-xl shadow-sono-dark/5">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="text-left">
                                            <h4 className="text-lg md:text-xl font-black text-sono-dark mb-2 tracking-tight">카드 발급 후 꼭 확인하세요!</h4>
                                            <p className="text-[#6b7684] text-sm md:text-base font-bold leading-relaxed break-keep">제휴카드를 발급받으신 후, 반드시 <span className="text-sono-primary underline underline-offset-4">자동이체 결제 수단을 해당 카드로 변경</span>하셔야 혜택이 적용됩니다.</p>
                                        </div>
                                        <button 
                                            onClick={() => setIsTransferModalOpen(true)}
                                            className="w-full md:w-auto shrink-0 bg-sono-primary text-white font-bold px-8 py-4 md:py-5 rounded-2xl hover:bg-sono-dark transition-all shadow-xl shadow-sono-primary/20 flex items-center justify-center gap-2 text-base md:text-lg"
                                        >
                                            자동이체 변경 안내
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-10 space-y-3">
                                    <p className="text-[11px] md:text-xs text-[#8b95a1] font-bold leading-relaxed">※ 전월 실적 제외 항목 : 장/단기 카드대출, 무이자할부, 아파트관리비, 국세/지방세/관세, 수수료, 이자, 연회비 등</p>
                                    <p className="text-[11px] md:text-xs text-[#8b95a1] font-bold leading-relaxed">※ 제휴카드 관련 문의는 해당 카드사 고객센터로 문의하세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
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
                                            <span className="text-sono-primary font-bold">각 5벌 (남녀 무관)</span>
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
                                            왕복 300km 제공<br />
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
                                            전문 도우미 <span className="font-bold text-sono-primary text-lg">5명</span>
                                            <p className="text-[#8b95a1] text-xs font-bold mt-1">(접객 및 빈소 관리)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-2">
                            <p className="text-left md:text-center text-xs text-[#8b95a1] font-medium">
                                ※ 상기 품목은 지역 및 장례식장 여건에 따라 동급의 타 제품으로 대체될 수 있습니다.
                            </p>
                            <p className="text-left md:text-center text-xs text-[#8b95a1] font-medium">
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
                                        desc: "타임딜, 릴레이딜부터 룰렛 이벤트까지! 매일 새로운 상품과 이벤트가 쏟아집니다.",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20h3.586a1 1 0 00.707-.293l12-12a1 1 0 000-1.414l-4.586-4.586a1 1 0 00-1.414 0l-12 12a1 1 0 00-.293.707V18a2 2 0 002 2z" />
                                    },
                                    {
                                        title: "신규 가입자 5,000원 쿠폰을!",
                                        desc: "신규 가입 고객에게만 제공되는 혜택을 받아보세요. 필요한 상품을 더 합리적인 가격으로 경험해 보세요!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    },
                                    {
                                        title: "레디캐쉬로 연결되는 합리적인 소비",
                                        desc: "소노아임레디몰에서 레디캐쉬를 활용해 보세요! 구매 부담은 줄이고, 풍부한 혜택을 받아보세요!",
                                        icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" />
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
                            더 해피 450 ONE으로<br />어디에서도 볼 수 없는<br className="md:hidden" /> 혜택을 받아가세요
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
            {!isModalOpen && <Footer partnerMode={partnerMode} productType="happy450" />}

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="happy450"
                showProductSelect={false}
                isPremiumMallMode={isPremiumMallMode}
            />

            {/* 자동이체 변경 안내 모달 */}
            {isTransferModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsTransferModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="p-8 md:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-sono-dark tracking-tighter">자동이체 변경 안내</h3>
                                <button onClick={() => setIsTransferModalOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-sono-dark transition-colors">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="bg-sono-primary/5 p-6 rounded-2xl border border-sono-primary/10">
                                    <p className="text-sono-primary font-bold leading-relaxed break-keep text-sm md:text-base">
                                        카드 발급 후 반드시 아래 방법 중 하나를 선택하여 <span className="underline underline-offset-4 decoration-2">결제수단을 해당 제휴카드로 변경</span>하셔야 할인 혜택이 적용됩니다.
                                    </p>
                                </div>
                                
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <h4 className="font-black text-sono-dark text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                            방법 01. 고객센터 전화 신청
                                        </h4>
                                        <div className="ml-3.5">
                                            <p className="text-[#6b7684] text-sm md:text-base font-bold leading-relaxed break-keep">
                                                대명소노아임레디 고객센터 <a href="tel:1588-8511" className="text-sono-dark border-b-2 border-sono-dark/20 hover:border-sono-primary transition-all font-black text-lg">1588-8511</a> 연결 후 상담원을 통해 결제 카드 변경을 요청하세요.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-black text-sono-dark text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                            방법 02. 공식 홈페이지 직접 변경
                                        </h4>
                                        <div className="ml-3.5 space-y-4">
                                            <p className="text-[#6b7684] text-sm md:text-base font-bold leading-relaxed break-keep">
                                                로그인 {'>'} My아임레디 {'>'} 결제수단 관리 {'>'} <span className="text-sono-primary font-black underline underline-offset-4">결제수단 변경</span> 버튼을 선택하세요.
                                            </p>
                                            <div className="flex flex-wrap gap-3">
                                                <a href="https://www.sonoimready.com/front/login/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all border border-gray-200">
                                                    마이페이지 바로가기
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                <div className="relative group overflow-hidden rounded-2xl border border-gray-100 shadow-lg shadow-black/5">
                                                    <img 
                                                        src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777600896/3a2f1b82-5795-46a8-a6da-3414acf21b40.png" 
                                                        alt="결제수단 변경 메뉴 선택" 
                                                        className="w-full h-auto"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-sono-primary text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg">STEP 1</div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-sono-dark/80 backdrop-blur-sm text-white p-3 text-xs font-bold text-center">결제수단 변경 메뉴를 선택하세요</div>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-2xl border border-gray-100 shadow-lg shadow-black/5">
                                                    <img 
                                                        src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777600902/2da2ae4d-0810-4e6c-b830-55b6f3c1378e.png" 
                                                        alt="카드 정보 입력" 
                                                        className="w-full h-auto"
                                                    />
                                                    <div className="absolute top-2 left-2 bg-sono-primary text-white text-[10px] px-2 py-1 rounded-md font-bold shadow-lg">STEP 2</div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-sono-dark/80 backdrop-blur-sm text-white p-3 text-xs font-bold text-center">새로운 결제 수단 정보를 입력하세요</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-black text-sono-dark text-lg flex items-center gap-2 tracking-tight">
                                            <span className="w-1.5 h-6 bg-sono-primary rounded-full"></span>
                                            방법 03. 공식 카카오채널 상담
                                        </h4>
                                        <div className="ml-3.5">
                                            <p className="text-[#6b7684] text-sm md:text-base font-bold leading-relaxed break-keep">
                                                소노아임레디 공식 카카오채널 채팅 상담을 통해 간편하게 변경 요청을 하실 수 있습니다. <span className="text-[#8b95a1] block mt-1 text-xs md:text-sm font-medium">(가입자 본인 카카오톡에서 채널 확인 가능)</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsTransferModalOpen(false)}
                                className="w-full bg-sono-dark text-white font-black py-5 rounded-2xl mt-12 hover:bg-black transition-all shadow-xl shadow-black/10 text-lg"
                            >
                                확인하였습니다
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
