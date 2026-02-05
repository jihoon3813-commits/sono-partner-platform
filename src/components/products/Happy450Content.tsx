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
}

export default function Happy450Content({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = ""
}: Happy450ContentProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 파트너 페이지에서는 제휴신청 대신 가입신청으로 표시됨 (Header에서 처리)
    // 페이지 내 버튼 문구 처리
    const ctaText = partnerMode ? "가입 신청하기" : "제휴 파트너 신청하기";

    return (
        <>
            {!isModalOpen && <Header partnerMode={partnerMode} partnerUrl={partnerUrl} partnerName={partnerName} partnerId={partnerId} />}
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
                                    <div className="inline-flex items-center gap-5 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-[24px] shadow-xl max-w-sm">
                                        <div className="w-12 h-12 rounded-2xl bg-white text-sono-primary flex items-center justify-center font-bold text-2xl shadow-lg flex-shrink-0">
                                            ♥
                                        </div>
                                        <div>
                                            <h3 className="text-white text-lg font-bold tracking-tight">합리적 선택</h3>
                                            <p className="text-white/70 font-medium text-sm leading-tight break-keep mt-0.5">
                                                군더더기 없는 혜택으로 핵심 가치에 집중했습니다.
                                            </p>
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
                                    name: "레디캐시 적립",
                                    desc: "납입금의 일부를 레디캐시로 적립하여 쇼핑에 즉시 사용할 수 있습니다.",
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
                                },
                                {
                                    title: "SPECIAL",
                                    name: "납입금 100% 환급",
                                    desc: "만기 시 서비스를 이용하지 않으면 납입금 전액(100%)을 환급받습니다.",
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
                                { name: "실속형", units: "1구좌", price: "18,000", desc: "가장 기본적인 상조 서비스" },
                                { name: "인기형", units: "2구좌", price: "36,000", desc: "더 풍성한 서비스 구성", popular: true },
                                { name: "베스트", units: "3구좌", price: "54,000", desc: "프리미엄 서비스 구성" },
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
                                    </div>
                                    <p className="text-[#6b7684] text-center font-medium mb-4 md:mb-10 flex-grow text-sm md:text-base">{plan.desc}</p>
                                    <ul className="space-y-2 md:space-y-4 text-sm font-bold mb-2 md:mb-4">
                                        {[
                                            "제휴몰 포인트 지급",
                                            "레디캐시 적립",
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
                    </div>
                </section>

                {/* 상조 서비스 */}
                <section className="py-16 md:py-32 bg-[#f9fafb]">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                        <div className="text-center mb-16 md:mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">FUNERAL SERVICE</span>
                            <h2 className="section-title leading-tight">품격 있는 마지막 인사,<br className="md:hidden" /> 대명소노가 함께합니다</h2>
                            <p className="section-subtitle max-w-2xl mx-auto">
                                국가공인 장례지도사와 전문 도우미가 정성을 다해
                                고인의 명복을 빌며, 유가족의 슬픔을 함께 나누는 신뢰의 서비스를 약속드립니다.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
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
                                <div key={index} className="group bg-white rounded-[24px] md:rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100 flex flex-col md:block">
                                    <div className="flex md:block">
                                        <div className="relative w-32 md:w-full h-32 md:h-56 overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.img}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </div>
                                        <div className="p-4 md:p-10 text-left md:text-center flex flex-col justify-center">
                                            <h3 className="text-base md:text-2xl font-bold text-sono-dark mb-1 md:mb-4 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">{item.title}</h3>
                                            <p className="text-[#6b7684] text-xs md:text-base font-medium leading-relaxed break-keep">{item.desc}</p>
                                        </div>
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

                {/* 포인트/레디캐시 활용 안내 섹션 */}
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
            {!isModalOpen && <Footer />}

            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                productType="더 해피 450 ONE"
            />
        </>
    );
}
