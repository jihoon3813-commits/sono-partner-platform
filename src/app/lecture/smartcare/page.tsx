"use client";

import React, { useState } from "react";
import LectureViewer from "@/components/LectureViewer";
import ImportantNotice from "@/components/common/ImportantNotice";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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

const ApplianceGridSlide = ({ unit, monthly, total, service, appliances }: { unit: number, monthly: string, total: string, service: string, appliances: Appliance[] }) => {
    // 6 columns x 3 rows = 18 items per chunk/page
    const ITEMS_PER_PAGE = 18;
    const chunks = [];
    if (appliances.length === 0) {
        chunks.push([]);
    } else {
        for (let i = 0; i < appliances.length; i += ITEMS_PER_PAGE) {
            chunks.push(appliances.slice(i, i + ITEMS_PER_PAGE));
        }
    }

    return (
        <div className="w-full h-full overflow-y-auto scrollbar-hide bg-[#f8fafc] flex flex-col">
            {chunks.map((chunk, chunkIdx) => (
                <div key={chunkIdx} className="w-full min-h-full shrink-0 p-8 flex flex-col items-center bg-[#f8fafc] pdf-export-page relative">
                    <div className="text-center mb-6 shrink-0">
                        <span className="bg-[#3b82f6] text-white px-5 py-1.5 rounded-full text-sm font-black tracking-widest mb-3 inline-block">
                            SMART CARE 330 {chunks.length > 1 ? `(${chunkIdx + 1}/${chunks.length})` : ''}
                        </span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter mb-3">스마트케어 330 - {unit}구좌</h2>
                        <p className="text-lg font-bold text-gray-500">
                            월 {monthly}x200회, 총 {total} / 상조서비스 {service}
                        </p>
                    </div>
                    <div className="w-full max-w-[1300px] flex-grow flex flex-col justify-center">
                        <div className="grid grid-cols-6 gap-3">
                            {chunk.map((app, idx) => (
                                <div key={idx} className="bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm flex flex-col h-[230px] hover:shadow-md transition-shadow">
                                    <div className="h-24 w-full mb-3 flex items-center justify-center p-1 shrink-0">
                                        {app.image ? (
                                            <img src={app.image} alt={app.name} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 text-xs font-bold">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="text-[10px] font-black text-gray-400 mb-1 line-clamp-1">{app.brand}</span>
                                        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug mb-1.5 flex-grow">{app.name}</h3>
                                        <div className="bg-gray-50 rounded-md p-1.5 shrink-0 mt-auto">
                                            <p className="text-[9px] text-gray-500 mb-0.5">모델명</p>
                                            <p className="text-[10px] font-bold text-gray-700 truncate">{app.model}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {chunk.length === 0 && (
                            <div className="text-center py-20 text-gray-400 font-bold">
                                등록된 {unit}구좌 상품이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const fallbackAppliances = [
    { brand: "LG전자", name: "LG 오브제컬렉션 워시타워 (세탁기 25kg + 건조기 21kg)", model: "W20GEE", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096655/fileView_2_xwfg3z.jpg" },
    { brand: "삼성전자", name: "삼성 비스포크 냉장고 4도어 (875L)", model: "RF85B9111AP", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096744/fileView_3_k2et3b.jpg" },
    { brand: "LG전자", name: "LG 트롬 오브제컬렉션 스타일러", model: "SC5GMR80H", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096759/fileView_1_hlf0pp.jpg" },
    { brand: "삼성전자", name: "삼성 Neo QLED 4K TV (75인치)", model: "KQ75QNB85AFXKR", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097134/photo_best02_product01_n3u0hk.jpg" },
    { brand: "LG전자", name: "LG 스탠바이미 Go (27인치)", model: "27LX5QKNA", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097148/photo_best02_product02_cwq9zm.jpg" },
    { brand: "삼성전자", name: "삼성 비스포크 제트 봇 AI 로봇청소기", model: "VR50B9563AE", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097278/photo_best02_product04_btsohx.jpg" },
    { brand: "LG전자", name: "LG 디오스 오브제컬렉션 식기세척기", model: "DUBJ4EL", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097295/photo_best02_product07_lkcnml.jpg" },
    { brand: "삼성전자", name: "삼성 무풍에어컨 갤러리 (2in1)", model: "AF17B7934GZN", image: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097313/photo_best02_product10_xkyzcb.jpg" }
];

const ApplianceShortcutSlide = ({ allAppliances }: { allAppliances: Appliance[] }) => {
    const displayList = allAppliances && allAppliances.filter(p => p.image).length >= 4
        ? allAppliances.filter(p => p.image).slice(0, 8)
        : fallbackAppliances;

    return (
        <div className="w-full h-full bg-[#0f172a] text-white p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
            <div className="text-center mb-8 shrink-0">
                <span className="bg-[#3b82f6] text-white px-5 py-1.5 rounded-full text-xs font-black tracking-widest mb-3 inline-block uppercase">
                    Premium Hybrid Plan
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">
                    스마트케어 최신 프리미엄 가전 라인업
                </h2>
                <p className="text-white/50 text-base md:text-lg font-medium max-w-3xl mx-auto break-keep">
                    삼성전자, LG전자 등 국내 최고의 프리미엄 가전을 렌탈료 부담 없이 자유롭게 매칭해 드립니다. 아래의 대표 제품 외에 더욱 다양한 최신 스마트케어 가전을 확인해보세요.
                </p>
            </div>

            <div className="w-full max-w-[1300px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 shrink">
                {displayList.map((app, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-[24px] p-4 flex flex-col h-[180px] hover:bg-white/10 hover:border-white/20 transition-all duration-300 relative group overflow-hidden shadow-lg backdrop-blur-sm">
                        <div className="h-20 w-full mb-3 flex items-center justify-center p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                            <img src={app.image} alt={app.name} className="max-h-full max-w-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col flex-grow text-left">
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider mb-0.5">{app.brand}</span>
                            <h3 className="text-xs font-black text-white line-clamp-2 leading-snug mb-1">{app.name}</h3>
                            <p className="text-[9px] text-white/40 mt-auto truncate">모델명: {app.model}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-2 shrink-0">
                <button 
                    onClick={() => window.open("https://sono-partners.com/neora/smartcare", "_blank")}
                    className="relative z-20 bg-gradient-to-r from-blue-500 to-[#3b82f6] text-white px-12 py-5 rounded-[24px] font-black text-lg shadow-[0_0_35px_rgba(59,130,246,0.3)] hover:scale-[1.03] hover:from-blue-600 hover:to-blue-500 transition-all flex items-center gap-3 mx-auto group border border-blue-400/20"
                >
                    <span>실시간 가전제품 리스트 & 스펙 보러가기</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>
    );
};

export default function SmartCareLecturePage() {
    const [modalUrl, setModalUrl] = useState<string | null>(null);
    const [showPromoModal, setShowPromoModal] = useState<boolean>(false);

    const productsData = useQuery(api.products.get);
    const allAppliances = ((productsData || []) as Appliance[]).filter(p => p.isVisible !== false);

    const appliances2 = allAppliances.filter(p => p.slotCount === 2);
    const appliances4 = allAppliances.filter(p => p.slotCount === 4);
    const appliances6 = allAppliances.filter(p => p.slotCount === 6);

    const slides = [
        {
            id: "title",
            content: (
                <div className="h-full relative flex items-center p-16 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={"https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/Generated%20Image%20January%2022%2C%202026%20-%205_18PM.jpeg".replace(/ /g, '%20')}
                            className="w-full h-full object-cover"
                            alt="SmartCare Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-sono-dark/80 via-sono-dark/40 to-transparent z-0"></div>
                        <div className="absolute inset-0 bg-black/20 z-0"></div>
                    </div>

                    <div className="relative z-10 w-full pl-8">
                        <div className="animate-fade-in">
                            <span className="inline-block bg-[#3b82f6] text-white mb-6 px-4 py-1.5 rounded-md text-sm font-bold shadow-lg">PREMIUM HYBRID</span>
                            <h1 className="leading-[1.15] mb-6 tracking-tighter filter drop-shadow-2xl">
                                <span className="block text-6xl md:text-[80px] font-black text-white drop-shadow-md">스마트케어</span>
                            </h1>
                            <p className="text-2xl text-white mb-12 leading-[1.6] max-w-2xl break-keep font-semibold drop-shadow-sm">
                                최신가전 렌탈금 전액 지원으로,<br />
                                오늘의 생활은 편리하게, 미래의 안심까지!<br />
                                대한민국 No.1 토탈 라이프케어 서비스
                            </p>

                            {/* 스마트한 선택 박스 */}
                            <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                <div className="inline-flex items-center gap-5 bg-black/40 backdrop-blur-md border border-white/10 p-5 pr-12 rounded-[24px] shadow-2xl">
                                    <div className="w-14 h-14 rounded-full bg-white text-[#3b82f6] flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0">
                                        ★
                                    </div>
                                    <div>
                                        <h3 className="text-white text-lg font-bold tracking-tight mb-1">스마트한 선택</h3>
                                        <p className="text-gray-300 font-medium text-sm leading-snug break-keep">
                                            최신가전 렌탈금 전액 지원!! 지금은 편리하게,<br />미래는 든든하게
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "why-smart-care",
            content: (
                <div className="h-full bg-white p-16 flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-12 items-center max-w-[1200px] mx-auto w-full">
                        <div className="col-span-1">
                            <span className="text-[#3b82f6] font-black text-sm uppercase tracking-widest mb-4 block">WHY SMART CARE</span>
                            <h2 className="text-4xl md:text-5xl font-black text-sono-dark tracking-tighter leading-tight mb-8">
                                스마트케어가<br />사랑받는 이유
                            </h2>
                            <p className="text-[#6b7684] text-lg font-medium leading-relaxed break-keep">
                                단순한 상조를 넘어, 현재의 즐거움과 미래의 안심을 동시에 챙기는 합리적인 고객님들의 선택입니다.
                            </p>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-6">
                            {[
                                {
                                    title: "프리미엄 가전 렌탈금 전액 지원",
                                    desc: "삼성, LG 등 최고급 브랜드 가전의 렌탈료 전액을 지원받습니다.",
                                    icon: "⚡"
                                },
                                {
                                    title: "100% 안심 환급 시스템",
                                    desc: "만기 시 서비스를 이용하지 않으시면 납입금 전액을 돌려드립니다.(만기 후 익월 해약 시)",
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
                                <div key={i} className="p-8 rounded-[32px] bg-[#f8fafc] border border-gray-100 shadow-sm">
                                    <div className="text-4xl mb-6">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-sono-dark mb-4">{item.title}</h3>
                                    <p className="text-[#6b7684] font-medium leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "plan-options",
            content: (
                <div className="h-full bg-[#0b0f19] text-white p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                    <div className="text-center mb-8 shrink-0">
                        <h2 className="text-5xl font-black tracking-tighter mb-2">다양한 라이프스타일에 맞춘 구성</h2>
                        <p className="text-white/50 text-xl font-medium">원하는 구좌 수를 선택하고 최신 가전을 골라보세요.</p>
                    </div>

                    <div className="flex flex-col gap-6 max-w-[1250px] mx-auto w-full px-4 shrink">
                        {/* Row 1: 3 cards */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { name: "스마트케어 4더블", tagBg: "bg-[#ff6b00]", unit: "2", price: "55,200", target: "1인 가구 / 소형 가전", best: false },
                                { name: "스마트케어 5", tagBg: "bg-[#3b82f6]", unit: "1", price: "33,000", target: "1인 가구 / 소형 가전", best: false },
                                { name: "스마트케어 5더블", tagBg: "bg-[#3b82f6]", unit: "2", price: "66,000", target: "신혼 부부 / 중형 가전", best: true },
                            ].map((plan, i) => (
                                <div key={i} className={`w-full sm:w-[340px] p-6 rounded-[32px] border-2 transition-all bg-[#131924] ${plan.best ? "border-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.35)] scale-105 z-10" : "border-[#202632] hover:border-white/10"}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`${plan.tagBg} text-white text-[11px] font-black px-3 py-1 rounded-md inline-block`}>
                                            {plan.name}
                                        </span>
                                        {plan.best && (
                                            <span className="bg-[#3b82f6] text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-0.5 shadow-lg shadow-blue-500/20">
                                                ★ BEST
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black mb-1 text-left">
                                        <span className="text-3xl text-white font-black">{plan.unit}</span>
                                        <span className="text-xl text-white/90 ml-0.5 font-bold">구좌</span>
                                    </h3>
                                    <p className="text-white/60 text-xs font-bold mb-6 text-left">{plan.target}</p>
                                    <div className="mb-6 text-left">
                                        <span className="text-4xl font-black text-white">{plan.price}</span>
                                        <span className="text-lg opacity-60 ml-1">원~</span>
                                    </div>

                                    {/* 납입 구조 Table */}
                                    <div className="border-y border-white/10 py-4 my-6 text-xs space-y-3 opacity-90 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/50 font-bold">납입회차</span>
                                            <span className="font-black text-white/90">1~180회</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/50 font-bold">거치기간</span>
                                            <span className="font-black text-white/90">181~200회</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#3b82f6] font-black">
                                            <span>만기회차</span>
                                            <span>200회</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 text-xs font-bold text-left">
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 가전 렌탈료 전액 지원 혜택
                                        </li>
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 멤버십 즉시 이용
                                        </li>
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 100% 만기 환급
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: 2 cards */}
                        <div className="flex flex-wrap justify-center gap-6">
                            {[
                                { name: "스마트케어 5트리플", tagBg: "bg-[#3b82f6]", unit: "3", price: "99,000", target: "일반 가전 / 대형 가전", best: false },
                                { name: "스마트케어 5쿼드", tagBg: "bg-[#3b82f6]", unit: "4", price: "132,000", target: "대가족 / 프리미엄 가전 패키지", best: true }
                            ].map((plan, i) => (
                                <div key={i} className={`w-full sm:w-[340px] p-6 rounded-[32px] border-2 transition-all bg-[#131924] ${plan.best ? "border-[#3b82f6] shadow-[0_0_25px_rgba(59,130,246,0.35)] scale-105 z-10" : "border-[#202632] hover:border-white/10"}`}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className={`${plan.tagBg} text-white text-[11px] font-black px-3 py-1 rounded-md inline-block`}>
                                            {plan.name}
                                        </span>
                                        {plan.best && (
                                            <span className="bg-[#3b82f6] text-white text-[9px] font-black px-3 py-1 rounded-full flex items-center gap-0.5 shadow-lg shadow-blue-500/20">
                                                ★ BEST
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black mb-1 text-left">
                                        <span className="text-3xl text-white font-black">{plan.unit}</span>
                                        <span className="text-xl text-white/90 ml-0.5 font-bold">구좌</span>
                                    </h3>
                                    <p className="text-white/60 text-xs font-bold mb-6 text-left">{plan.target}</p>
                                    <div className="mb-6 text-left">
                                        <span className="text-4xl font-black text-white">{plan.price}</span>
                                        <span className="text-lg opacity-60 ml-1">원~</span>
                                    </div>

                                    {/* 납입 구조 Table */}
                                    <div className="border-y border-white/10 py-4 my-6 text-xs space-y-3 opacity-90 text-left">
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/50 font-bold">납입회차</span>
                                            <span className="font-black text-white/90">1~180회</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-white/50 font-bold">거치기간</span>
                                            <span className="font-black text-white/90">181~200회</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[#3b82f6] font-black">
                                            <span>만기회차</span>
                                            <span>200회</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-3 text-xs font-bold text-left">
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 가전 렌탈료 전액 지원 혜택
                                        </li>
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 멤버십 즉시 이용
                                        </li>
                                        <li className="flex items-center gap-2 text-white/90">
                                            <span className="text-[#3b82f6] font-black">✓</span> 100% 만기 환급
                                        </li>
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "bs-rental-card-benefits",
            content: (
                <div className="h-full bg-[#fdf289] p-8 flex flex-col justify-center gap-6 relative z-0">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                        <span className="text-[180px] font-black text-gray-800 tracking-tighter">1668-1709</span>
                    </div>
                    <div className="text-center relative z-10 mb-2">
                        <span className="bg-red-600 text-white px-8 py-2.5 rounded-full text-2xl font-black shadow-md border-2 border-white">
                            1~60회 가전렌탈료 대상 청구 할인
                        </span>
                    </div>
                    {[
                        {
                            name: "[롯데] LOCA X BS렌탈 롯데카드",
                            img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782102356/e338c84c-b065-425f-9db6-229f792a8bf5.png", // Using a placeholder that looks like Lotte card
                            benefit: "카드 발급 월 기준 전월실적 무관 2회차까지 월 10,000원 캐시백",
                            fee: "국내/국외 전용 동일 20,000원",
                            apply: "콜센터 - 1588 - 8100",
                            tableHeaderType: "캐시백 금액",
                            discountType: "캐시백",
                            rows: [
                                { amount: "30만원 이상", value: "10,000원", total: "2,000,000원 캐시백" },
                                { amount: "70만원 이상", value: "15,000원", total: "3,000,000원 캐시백" },
                                { amount: "150만원 이상", value: "25,000원", total: "5,000,000원 캐시백" }
                            ]
                        },
                        {
                            name: "[하나] BS렌탈 플러스 하나카드",
                            img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782102346/f73500a9-516b-4c01-94fb-32f2b1cfd628.png", // Using a placeholder that looks like Hana card
                            benefit: "카드 발급 월 기준 전월실적 무관 2회차까지 월 13,000원 할인",
                            fee: "국내/국외 전용 동일 15,000원[VISA]",
                            apply: "콜센터 - 1800 - 1111",
                            tableHeaderType: "청구 할인금액",
                            discountType: "할인",
                            rows: [
                                { amount: "30만원 이상", value: "13,000원", total: "2,600,000원 할인" },
                                { amount: "120만원 이상", value: "23,000원", total: "4,600,000원 할인" }
                            ]
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-white rounded-[24px] p-6 shadow-lg max-w-[1100px] mx-auto w-full flex items-center gap-8 relative z-10">
                            {/* Left Side: Card Image */}
                            <div className="w-[180px] flex flex-col items-center justify-center shrink-0 border-r border-gray-100 pr-4">
                                <img src={card.img} alt={card.name} className="w-full object-contain" />
                            </div>
                            
                            {/* Right Side: Text Details */}
                            <div className="flex-grow space-y-3">
                                <h3 className="text-2xl font-black text-[#2e3b5e] tracking-tighter mb-3">{card.name}</h3>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">혜택</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.benefit}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">연회비</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.fee}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">발급신청</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.apply}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center mt-0.5">청구할인</span>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800 mb-1 text-sm">납입 기간 내내 청구할인 혜택</p>
                                            <table className="w-full text-center border-collapse border-2 border-[#2e3b5e] bg-white">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b-2 border-[#2e3b5e]">
                                                        <th className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[12px] text-gray-800">전월 사용금액</th>
                                                        <th className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[12px] text-gray-800">{card.tableHeaderType}</th>
                                                        <th className="py-1 px-2 font-black text-[12px] text-gray-800">만기회차[200회] 기준 총 {card.discountType}금액</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {card.rows.map((row, j) => (
                                                        <tr key={j} className="border-b border-gray-300 last:border-b-0">
                                                            <td className="py-1 px-2 border-r-2 border-[#2e3b5e] font-bold text-[13px] text-gray-700">{row.amount}</td>
                                                            <td className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[13px] text-[#2e3b5e]">{row.value}</td>
                                                            <td className="py-1 px-2 font-bold text-[13px] text-gray-700">{row.total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center mt-4 space-y-1 relative z-10">
                        <p className="text-red-600 font-black text-lg">2개의 가전상품 가입 시 상품 당 1개의 제휴카드 등록 가능!</p>
                        <p className="text-gray-900 font-bold text-base">A가전은 하나 제휴카드로, B가전은 롯데 제휴카드 결제 지정 시 매달 <span className="text-red-600 font-black">최대 44,000원</span> 청구할인 가능</p>
                    </div>
                </div>
            )
        },
        {
            id: "sono-ready-card-benefits",
            content: (
                <div className="h-full bg-[#ffc107] p-8 flex flex-col justify-center gap-6 overflow-y-auto relative">
                    <div className="text-center relative z-10 mb-2 mt-4">
                        <span className="bg-[#2e3b5e] text-white px-8 py-2.5 rounded-full text-2xl font-black shadow-md border-2 border-white">
                            61~200회 상조회비 대상 청구 할인
                        </span>
                    </div>
                    {[
                        {
                            name: "[하나] 소노아임레디 플러스 하나카드",
                            img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097508/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom_delgx0.png",
                            benefit: "카드 발급 월 기준 전월실적 무관 2회차까지 월 12,000원 할인",
                            fee: "국내/국외 전용 동일 20,000원 [VISA]",
                            apply: "콜센터 - 1800-0672 | 카드신청URL 접속 QR코드",
                            tableHeaderType: "청구 할인금액",
                            discountType: "할인",
                            rows: [
                                { amount: "30만원 이상", value: "12,000원", total: "2,400,000원 할인" },
                                { amount: "100만원 이상", value: "19,000원", total: "3,800,000원 할인" }
                            ]
                        },
                        {
                            name: "[롯데] 소노아임레디 [상조엔로카] 롯데카드",
                            img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097527/%EC%83%81%EC%A1%B0%EC%97%94%EB%A1%9C%EC%B9%B4_%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94__%EC%B9%B4%EB%93%9C_zn324u_ih9agw.png",
                            benefit: "카드 발급 월 기준 전월실적 무관 2회차까지 월 15,000원 캐시백",
                            fee: "국내/국외 전용 동일 20,000원",
                            apply: "콜센터 - 1588-8100 | 카드신청URL 접속 QR코드",
                            tableHeaderType: "캐시백 금액",
                            discountType: "캐시백",
                            rows: [
                                { amount: "30만원 이상", value: "13,000원", total: "2,600,000원 캐시백" },
                                { amount: "70만원 이상", value: "16,000원", total: "3,200,000원 캐시백" },
                                { amount: "150만원 이상", value: "25,000원", total: "5,000,000원 캐시백" }
                            ]
                        },
                        {
                            name: "[국민] 소노아임레디 KB 국민카드",
                            img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097491/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2_zql90f.png",
                            benefit: "카드 발급 월 기준 전월실적 무관 2회차까지 월 12,000원 할인",
                            fee: "국내/국외 전용 동일 15,000원",
                            apply: "콜센터 - 1899-0077 | 카드신청URL 접속 QR코드",
                            tableHeaderType: "청구 할인금액",
                            discountType: "할인",
                            rows: [
                                { amount: "30만원 이상", value: "12,000원", total: "2,400,000원 할인" },
                                { amount: "70만원 이상", value: "17,000원", total: "3,400,000원 할인" }
                            ]
                        }
                    ].map((card, i) => (
                        <div key={i} className="bg-white rounded-[24px] p-6 shadow-lg max-w-[1100px] mx-auto w-full flex items-center gap-8 relative z-10">
                            {/* Left Side: Card Image & QR */}
                            <div className="w-1/4 flex flex-col items-center justify-center shrink-0 border-r border-gray-100 pr-4">
                                <img src={card.img} alt={card.name} className="h-20 object-contain mb-4" />
                                <div className="w-16 h-16 mb-2">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=sono-${i}`} className="w-full h-full opacity-80" alt="QR" />
                                </div>
                                <p className="text-[11px] font-black text-gray-800">발급 URL QR코드</p>
                            </div>
                            
                            {/* Right Side: Text Details */}
                            <div className="flex-grow space-y-3">
                                <h3 className="text-2xl font-black text-[#2e3b5e] tracking-tighter mb-3">{card.name}</h3>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">혜택</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.benefit}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">연회비</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.fee}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center">발급신청</span>
                                        <span className="font-bold text-gray-800 text-sm">{card.apply}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="bg-[#2e3b5e] text-white px-2 py-0.5 text-xs font-black rounded-sm shrink-0 w-16 text-center mt-0.5">청구할인</span>
                                        <div className="flex-grow">
                                            <p className="font-bold text-gray-800 mb-1 text-sm">납입 기간 내내 청구할인 혜택</p>
                                            <table className="w-full text-center border-collapse border-2 border-[#2e3b5e]">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b-2 border-[#2e3b5e]">
                                                        <th className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[12px] text-gray-800">전월 사용금액</th>
                                                        <th className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[12px] text-gray-800">{card.tableHeaderType}</th>
                                                        <th className="py-1 px-2 font-black text-[12px] text-gray-800">만기회차[200회] 기준 총 {card.discountType}금액</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {card.rows.map((row, j) => (
                                                        <tr key={j} className="border-b border-gray-300 last:border-b-0">
                                                            <td className="py-1 px-2 border-r-2 border-[#2e3b5e] font-bold text-[13px] text-gray-700">{row.amount}</td>
                                                            <td className="py-1 px-2 border-r-2 border-[#2e3b5e] font-black text-[13px] text-[#2e3b5e]">{row.value}</td>
                                                            <td className="py-1 px-2 font-bold text-[13px] text-gray-700">{row.total}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "smartcare-products-shortcut",
            content: <ApplianceShortcutSlide allAppliances={allAppliances} />
        },
        {
            id: "funeral-service-combined",
            content: (
                <div className="h-full bg-white p-10 flex flex-col justify-center">
                    <div className="max-w-[1250px] mx-auto w-full space-y-8">
                        {/* Header Section (from Image 2) */}
                        <div className="text-center space-y-4 mb-4">
                            <div className="inline-block bg-[#eef2ff] text-[#3b82f6] px-5 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase">FUNERAL SERVICE</div>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter leading-tight">
                                품격 있는 마지막 인사, 대명소노가 함께합니다
                            </h2>
                            <p className="text-lg text-gray-400 font-bold max-w-3xl mx-auto leading-relaxed break-keep">
                                국가공인 장례지도사와 전문 도우미가 정성을 다해 고인의 명복을 빌며, <br />
                                유가족의 슬픔을 함께 나누는 신뢰의 서비스를 약속드립니다.
                            </p>
                        </div>

                        {/* Top: Service Intro Cards */}
                        <div className="grid grid-cols-3 gap-6">
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
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center space-y-3">
                                    <div className="aspect-[16/10] w-full rounded-[32px] overflow-hidden shadow-lg border border-gray-100">
                                        <img src={item.img} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-sono-dark">{item.title}</h3>
                                        <p className="text-[11px] font-bold text-gray-400 leading-relaxed break-keep">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom: Specialness rows */}
                        <div className="space-y-6">
                            <div className="bg-[#f0f4f8] rounded-xl p-3 text-center relative overflow-hidden">
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-sono-dark -skew-x-[20deg] translate-x-4"></div>
                                <h3 className="text-lg font-black text-sono-dark tracking-tighter relative z-10">소노아임레디 상조 서비스만의 특별함</h3>
                            </div>

                            <div className="space-y-4 px-4">
                                {[
                                    {
                                        title: "처음부터 끝까지",
                                        desc: "장례지도사는 1건의 장례가 끝날 때까지 책임지고 함께합니다. 24시간 긴급의전센터(1588-2227)를 운영하며 접수 시 전문 장례지도사가 2시간 이내 현장에 도착하여 도와드립니다.",
                                        note: "*도서 및 산간지역 제외, 상황에 따라 출동시간은 변동될 수 있음"
                                    },
                                    {
                                        title: "전문가와 같이",
                                        desc: "고객 만족도 99%*의 전문 장례지도사가 장례물품 준비부터 장례 진행, 행정 절차까지 유가족이 큰 어려움 없이 마무리할 수 있도록 관리해 드립니다.",
                                        note: "*2026년 기준"
                                    },
                                    {
                                        title: "용품 보증 시스템",
                                        desc: "규격용품보다 하위용품은 사용하지 않습니다. 소노아임레디만의 디자인 특허 고깔, 대마 100% 수의 등 빠짐없이 정직하게 준비해 드립니다.",
                                        note: "*특허 고깔: 제 30-1110105호 / 대마 100% 수의: 2024년 1월 fiti 테스트 기준"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-10 border-t border-gray-50 pt-4 first:border-0 first:pt-0">
                                        <div className="w-40 shrink-0">
                                            <h4 className="text-base font-black text-sono-dark">{item.title}</h4>
                                        </div>
                                        <div className="flex-grow space-y-1">
                                            <p className="text-[13px] font-bold text-gray-500 leading-snug break-keep">{item.desc}</p>
                                            <p className="text-[9px] text-gray-300 font-bold italic">{item.note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "funeral-service-details",
            content: (
                <div className="h-full bg-[#f2f4f6] p-10 flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-[1250px] mx-auto w-full py-8">
                        <div className="mb-8 text-center space-y-1">
                            <span className="text-xs font-black text-sono-gold uppercase tracking-widest">SERVICE DETAILS</span>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter">의전 서비스 상세 구성</h2>
                        </div>
                        
                        <div className="overflow-x-auto rounded-[32px] border border-gray-100 bg-white shadow-xl">
                            <table className="w-full text-center border-collapse text-sm text-sono-dark min-w-[900px]">
                                <thead>
                                    <tr className="bg-sono-dark text-white text-base">
                                        <th className="py-5 px-6 font-bold border border-gray-200/50 bg-[#191f28]" colSpan={3}>구분</th>
                                        <th className="w-[30%] py-5 px-6 font-black border border-gray-200/50 bg-sono-primary text-white text-lg">스마트케어 4</th>
                                        <th className="w-[30%] py-5 px-6 font-black border border-gray-200/50 bg-sono-secondary text-white text-lg">스마트케어 5</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    {/* 고인용품 및 수시용품 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={9}>
                                            고인용품<br />및<br />수시용품
                                        </td>
                                        <td className="py-5 px-4 font-bold border-r border-gray-100 text-sono-primary bg-white" rowSpan={3}>관</td>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">매장시</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            오동나무 45mm
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">화장시</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            오동나무 18mm, 유골함
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">횡관시</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            오동나무 18mm, 횡대
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="py-5 px-4 font-bold border-r border-gray-100 text-sono-primary bg-white" rowSpan={2}>수의</td>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">수의</td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            마혼방 (대마, 아마, 저마), 기계직
                                        </td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            대마 100%, 기계직
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">수의 준비고객</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            꽃관보 또는 장례의전 도우미 1명 (택1)
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="py-5 px-4 font-bold border-r border-gray-100 text-sono-primary bg-white" rowSpan={4}>
                                            입관 및<br />수시용품
                                        </td>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">
                                            도포, 원삼, 천금, 지금
                                        </td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            수의 제품과 동일제품 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">명정</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            규격품 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">관보</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            규격품 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">
                                            베개, 습신, 수시포, 한지 등
                                        </td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            규격품 제공
                                        </td>
                                    </tr>

                                    {/* 빈소 및 기타용품 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={3}>
                                            빈소 및<br />기타용품
                                        </td>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>
                                            빈소용품 (향, 양초, 부의록, 축문, 위패)
                                        </td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            일체 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>
                                            대여용품 (향로, 촛대, 잔대)
                                        </td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            일체 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>
                                            기타용품 (완장, 상장, 운구장갑)
                                        </td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            필요량 일체 제공
                                        </td>
                                    </tr>

                                    {/* 의전용품 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={4}>
                                            의전용품
                                        </td>
                                        <td className="py-5 px-4 font-bold border-r border-gray-100 text-sono-primary bg-white" rowSpan={2}>현대식 상복</td>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">남성</td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            제공 <span className="underline underline-offset-4 font-black text-base">(5벌)</span>
                                        </td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            제공 <span className="underline underline-offset-4 font-black text-base">(10벌)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">여성</td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            제공 <span className="underline underline-offset-4 font-black text-base">(5벌)</span>
                                        </td>
                                        <td className="py-4 px-4 text-[#007aff] font-bold bg-white">
                                            직계제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 font-bold border-r border-gray-100 text-sono-primary bg-white" rowSpan={2}>전통식 상복</td>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">남성</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            직계 제공
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 px-4 border-r border-gray-100 bg-white text-gray-600">여성</td>
                                        <td className="py-4 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            필요량 제공
                                        </td>
                                    </tr>

                                    {/* 제단장식 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={4}>
                                            제단장식<br />(꽃장식)
                                        </td>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>생화꽃 액자</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>제공</td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>생화꽃 제단장식</td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            25만원 상당
                                        </td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            35만원 상당
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>헌화용 국화</td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            30송이
                                        </td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            50송이
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>꽃바구니</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>꽃바구니 2개</td>
                                    </tr>

                                    {/* 차량지원 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={3}>
                                            차량지원
                                        </td>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>운구이송차량</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            관내(시,군내) 제공 (요청 시)
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>고인전용 리무진</td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            왕복 200KM <span className="text-xs text-gray-400 block font-normal mt-1">(초과시 2,000원 / KM)</span>
                                        </td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            왕복 300KM <span className="text-xs text-gray-400 block font-normal mt-1">(초과시 2,000원 / KM)</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>유족전용 버스</td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            왕복 200KM <span className="text-xs text-gray-400 block font-normal mt-1">(초과시 2,000원 / KM)</span>
                                        </td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            왕복 300KM <span className="text-xs text-gray-400 block font-normal mt-1">(초과시 2,000원 / KM)</span>
                                        </td>
                                    </tr>

                                    {/* 인력지원 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={2}>
                                            인력지원
                                        </td>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>장례지도사</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>
                                            장례진행 1명, 입관지원 1명
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>장례의전 도우미</td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            4명 <span className="text-xs text-gray-400 font-normal block mt-1">(인당 10시간)</span>
                                        </td>
                                        <td className="py-5 px-4 text-[#007aff] font-bold bg-white">
                                            5명 <span className="text-xs text-gray-400 font-normal block mt-1">(인당 10시간)</span>
                                        </td>
                                    </tr>

                                    {/* 편의서비스 */}
                                    <tr>
                                        <td className="py-5 px-4 font-black bg-gray-50 border-r border-gray-100 text-sono-dark" rowSpan={2}>
                                            편의서비스
                                        </td>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>일회용 식기세트</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>150인분</td>
                                    </tr>
                                    <tr>
                                        <td className="py-5 px-4 text-left font-bold border-r border-gray-100 bg-white" colSpan={2}>편의용품</td>
                                        <td className="py-5 px-4 text-sono-dark font-semibold bg-white" colSpan={2}>(남/녀 6인세트) 1개</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-left">
                            <h4 className="text-sm font-black text-sono-dark mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-sono-primary rounded-full"></span>
                                안내사항
                            </h4>
                            <ul className="space-y-2 text-xs text-gray-500 font-semibold list-none pl-1 leading-relaxed">
                                <li className="flex items-start gap-1.5">
                                    <span className="text-sono-primary mt-0.5">•</span>
                                    <span>위 구성은 소노아임레디 표준 서비스 기준이며, 가입하신 상품 회차 및 계약 조건에 따라 일부 차이가 있을 수 있습니다.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="text-sono-primary mt-0.5">•</span>
                                    <span>장례식장 시설 이용료, 식대, 제물비, 화장/묘지 관련 비용은 서비스에 포함되지 않습니다.</span>
                                </li>
                            </ul>
                        </div>

                        {/* 24시간 긴급 장례 접수 안내 배너 */}
                        <div className="mt-8 max-w-4xl mx-auto bg-gradient-to-r from-[#2c0d12] via-[#0f172a] to-[#0f172a] border border-red-500/15 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden text-left">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex-grow">
                                <div className="inline-flex items-center gap-1.5 bg-red-600/10 text-red-400 border border-red-500/20 text-[10px] sm:text-xs font-black px-3 py-1 rounded-full mb-3">
                                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>24시간 365일 연중무휴 긴급 상황실</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2 tracking-tight break-keep">
                                    갑작스러운 임종 시 <span className="text-[#ff4d4f]">24시간 긴급 장례 접수</span>
                                </h3>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-4 break-keep max-w-xl">
                                    당황하지 마시고 바로 전화 주십시오. 국가공인 장례지도사가 즉시 현장으로 출동하여 수의, 관, 차량 및 식장 수급을 진정성 있게 케어합니다.
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-300">
                                    <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                                        <span className="text-red-400">🛡️</span> 전국 소노 전문 장례식장 연계 우대
                                    </span>
                                    <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
                                        <span className="text-red-400">👥</span> 지도사 2인 & 의전도우미 4인 밀착 케어
                                    </span>
                                </div>
                            </div>

                            <div className="w-full lg:w-64 shrink-0 bg-white/5 border border-white/10 rounded-xl p-4 text-center shadow-inner flex flex-col justify-center">
                                <div className="text-white/60 text-[10px] font-bold tracking-wide mb-1">24시간 긴급 장례 접수 전용</div>
                                <a href="tel:1588-2227" className="text-2xl font-black text-white hover:text-red-400 transition-colors tracking-widest block mb-3">1588-2227</a>
                                <a href="tel:1588-2227" className="flex items-center justify-center gap-2 bg-[#ff4d4f] hover:bg-[#e03f41] text-white font-black text-xs py-2.5 px-4 rounded-lg transition-all shadow-md">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2a1 1 0 00.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
                                    </svg>
                                    <span>지금 긴급 출동 요청</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },

        {
            id: "hybrid-conversion-combined",
            content: (
                <div className="h-full bg-white p-10 flex flex-col justify-center">
                    <div className="max-w-[1250px] mx-auto w-full space-y-10">
                        {/* Top Section */}
                        <div className="space-y-5 text-center">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-sono-dark tracking-tighter leading-tight">소노아임레디 상품 가입 후 언제든지, 자유롭게 쓰세요</h2>
                                <p className="text-sm font-bold text-gray-400">레디캐시 상세 사용 내역은 이용하신 플랫폼에서 확인 가능합니다.</p>
                            </div>

                            {/* High-Impact Value Proposition Box */}
                            <div className="bg-[#f8f9fb] rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-4 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-sono-dark leading-tight tracking-tighter">
                                        소노아임레디 <span className="text-[#3e538d]">상품 금액의 전액 또는 일부를</span><br />
                                        언제든지 다른 서비스로 바꿔 쓸 수 있는 전환(하이브리드) 서비스
                                    </h3>
                                    <p className="text-base font-bold text-gray-500 leading-tight">
                                        서비스 이용은 주계약(가입 시 결정한 서비스)과 상관없이 원하는 시점에 언제든지 바꿔서 사용 가능합니다.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Grid Section */}
                        <div className="space-y-4 flex-grow">
                            <div className="flex items-center gap-1 text-sono-dark font-black text-lg">전환(하이브리드) 서비스 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></div>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { title: "여행", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EC%97%AC%ED%96%89" },
                                    { title: "크루즈", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product09.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88" },
                                    { title: "골프", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product02.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EA%B3%A8%ED%94%84" },
                                    { title: "교육/어학연수", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product04.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EA%B5%90%EC%9C%A1/%EC%96%B4%ED%95%99%EC%97%B0%EC%88%98" },
                                    { title: "웨딩", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product06.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EC%9B%A8%EB%94%A9" },
                                    { title: "리빙", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EB%A6%AC%EB%B9%99" },
                                    { title: "명품케어", img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product10.jpg?raw=true", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EB%AA%85%ED%92%88%EC%BC%80%EC%96%B4" },
                                    { title: "쉼케어", img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product08.jpg?raw=true", url: "https://www.sonoimready.com/front/sc/chgServList?prdctCd=%EC%89%BC%EC%BC%80%EC%96%B4" }
                                ].map((h, i) => (
                                    <div 
                                        key={i} 
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col shadow-md hover:shadow-lg transition-all h-full cursor-pointer relative z-20"
                                        onClick={() => setModalUrl(h.url)}
                                    >
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={h.img} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-4 px-5 flex items-center justify-between">
                                            <span className="text-sm font-black text-sono-dark">{h.title}</span>
                                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "ready-cash-and-mall",
            content: (
                <div className="h-full bg-white p-10 flex flex-col justify-center">
                    <div className="max-w-[1250px] mx-auto w-full space-y-8">
                        {/* Top Title Section */}
                        <div className="space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-sono-dark tracking-tighter leading-tight">
                                    소노아임레디 상품금액의 <span className="text-[#3e538d]">일부를 만기 전에 사용할 수 있는</span> 레디캐시
                                </h2>
                                <p className="text-base font-bold text-gray-400">
                                    '레디캐시'란 상품 납입 금액 중 일부를 소노아임레디가 운영하는 서비스에 이용 가능한 결제 수단입니다.<br />
                                    <span className="text-[#3e538d]">(가입 상품의 해약환급금*80% 사용가능)</span>
                                </p>
                            </div>

                            {/* Ready Cash Info Cards */}
                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-16 bg-[#f8f9fb] rounded-2xl flex items-center justify-center text-3xl">🏪</div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-400 mb-1">레디캐시 사용처</p>
                                        <h3 className="text-xl font-black text-sono-dark">실생활에 유용한 제휴처에서 사용</h3>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                                    <div className="w-16 h-16 bg-[#f8f9fb] rounded-2xl flex items-center justify-center text-3xl">📈</div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-400 mb-1">레디캐시 산정비율</p>
                                        <h3 className="text-xl font-black text-sono-dark">가입한 상품 해약 환급금의 80%</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sono I'm Ready Mall Section */}
                        <div className="bg-[#f8f9fb] rounded-[48px] p-8 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-8 right-12">
                                <a 
                                    href="https://www.imreadymall.com/login?moveURL=%2F" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="relative z-20 flex items-center gap-1.5 text-gray-400 font-black text-sm hover:text-sono-primary transition-colors cursor-pointer group"
                                >
                                    <span className="group-hover:underline">자세히 보기</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                </a>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-3xl font-black text-sono-dark">소노아임레디몰</h3>
                                <p className="text-lg font-bold text-gray-400">소노아임레디 회원을 위한 특별 혜택이 가득한 쇼핑몰!</p>
                            </div>

                            <div className="grid grid-cols-2 gap-10 items-center">
                                <div className="relative">
                                    <img 
                                        src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg" 
                                        className="w-full rounded-3xl shadow-2xl border-4 border-white"
                                        alt="Mall Preview"
                                    />
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { icon: "🏷️", title: "매일 기다려지는 특가 상품과 이벤트", desc: "타임딜, 릴레이딜부터 룰렛 이벤트까지! 매일 새로운 상품과 이벤트가 쏟아집니다." },
                                        { icon: "👥", title: "신규 가입자 5,000원 쿠폰을!", desc: "신규 가입 고객에게만 제공되는 혜택을 받아보세요. 필요한 상품을 더 합리적인 가격으로 경험해 보세요!" },
                                        { icon: "👛", title: "레디캐쉬로 연결되는 합리적인 소비", desc: "소노아임레디몰에서 레디캐쉬를 활용해 보세요! 구매 부담은 줄이고, 풍부한 혜택을 받아보세요!" }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-sono-dark">{item.title}</h4>
                                                <p className="text-sm font-bold text-gray-400 leading-snug break-keep">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Ready Cash Policy Notes */}
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-black text-sono-dark mb-2">레디캐시 안내</h4>
                                <div className="grid grid-cols-1 gap-1 px-2 text-[10px] font-bold text-gray-400 leading-snug">
                                    <p>• 레디캐시는 회원님이 가입한 상품의 해약환급금 내에서 당사가 정한 기준 금액에 한 해 1원당 1캐시로 전환하여 사용 가능합니다.</p>
                                    <p>• 레디캐시는 납입한 상품 금액에서 사용한 레디캐시 금액만큼 차감되며 상품 이용(장례 또는 전환 서비스) 시, 사용한 레디캐시 금액만큼 추가 금액이 발생합니다.</p>
                                    <p>• 레디캐시의 환불은 취소 완료일로부터 3영업일 이내 사용한 레디캐시 금액만큼 환불됩니다.</p>
                                    <p>• 제휴 상황에 따라 일부 서비스는 변동될 수 있습니다. 자세한 내용은 공식 홈페이지 제휴 서비스 페이지를 참고하시기 바랍니다.</p>
                                    <p>• 고객님께서 가입한 상품에 따라 레디캐시 발생 시점 및 금액은 상이할 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "membership-benefits",
            content: (
                <div className="h-full bg-[#191f28] text-white p-10 flex flex-col justify-center">
                    <div className="max-w-[1300px] mx-auto w-full space-y-6">
                        <div className="text-center space-y-1">
                            <span className="text-sono-gold font-black tracking-[0.3em] text-xs uppercase">VIP MEMBERSHIP</span>
                            <h2 className="text-5xl font-black tracking-tighter leading-tight">대명 소노그룹 멤버십</h2>
                            <p className="text-lg font-bold text-white/40">소노아임레디 회원님만을 위한 프리미엄 멤버십 혜택</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Hotel & Resort Card */}
                            <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 flex flex-col gap-4 backdrop-blur-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sono-gold/20 rounded-xl flex items-center justify-center text-xl">🏨</div>
                                        <h3 className="text-3xl font-black tracking-tighter">호텔 & 리조트</h3>
                                    </div>
                                    <p className="text-sono-gold font-black text-lg">전국 17개 직영 리조트 객실 우대</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100408/b8c95695-4612-4ee8-b614-01894c3f08e8.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100530/d5160f49-4fe1-41bd-9ef8-871fa8d472b0.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100600/a8924d28-257c-44df-9257-abf7b62b6cc0.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100622/4616f1d3-7eba-4742-bd43-c34a880e68c4.png"
                                    ].map((img, idx) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden h-56">
                                            <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt={`Resort ${idx}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Leisure & Waterpark Card */}
                            <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 flex flex-col gap-4 backdrop-blur-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sono-gold/20 rounded-xl flex items-center justify-center text-xl">🏊</div>
                                        <h3 className="text-3xl font-black tracking-tighter">레저 & 워터파크</h3>
                                    </div>
                                    <p className="text-sono-gold font-black text-lg">오션월드, 비발디파크 등 최대 35% 할인</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100675/17d4cfae-4596-447e-af22-34c188ca326a.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100679/43f9dbaa-c130-42bc-8a9f-78f34788b3a2.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782100683/7d658bc1-8908-4570-bcbb-0fb7e2f0ad50.png",
                                        "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782101030/c1e90898-b402-4d79-a3a3-93d3ff17ac4f.png"
                                    ].map((img, idx) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden h-56">
                                            <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt={`Leisure ${idx}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex justify-center gap-4 pt-2">
                            <button 
                                onClick={() => window.open("https://www.sonoimready.com/front/sc/membershipInfo?key=sonoresort", "_blank")}
                                className="relative z-20 bg-sono-gold text-sono-dark px-10 py-4 rounded-full font-black text-lg shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center gap-3 group"
                            >
                                <span>멤버십 혜택 자세히 보기</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <button 
                                onClick={() => window.open("https://www.sonohotelsresorts.com/", "_blank")}
                                className="relative z-20 bg-white/10 border border-white/20 text-white px-10 py-4 rounded-full font-black text-lg shadow-2xl hover:bg-white hover:text-sono-dark hover:scale-105 transition-all flex items-center gap-3 group"
                            >
                                <span>소노 호텔&리조트 바로가기</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6l6 6-6 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "disclosure-info",
            content: (
                <div className="h-full bg-[#f8f9fb] p-6 md:p-10 flex flex-col justify-center overflow-y-auto">
                    <ImportantNotice className="py-4 bg-transparent border-none" />
                </div>
            )
        },
        {
            id: "comparison-happy-vs-smart",
            content: (
                <div className="h-full bg-gray-50 p-10 flex flex-col justify-center items-center relative">
                    <div className="max-w-[1250px] w-full relative z-10">
                        <div className="text-center mb-10">
                            <span className="bg-[#2e3b5e] text-white px-5 py-1.5 rounded-full text-sm font-black tracking-widest mb-4 inline-block">PRODUCT COMPARISON</span>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter mb-4">
                                더해피450 <span className="text-gray-300 mx-2">vs</span> 스마트케어
                            </h2>
                            <p className="text-lg font-bold text-gray-500">고객님의 라이프스타일과 니즈에 맞는 최적의 상품을 제안해 드립니다.</p>
                        </div>
                        
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="bg-[#2e3b5e] text-white">
                                        <th className="py-5 px-6 font-black text-xl w-1/5 border-r border-white/20">구분</th>
                                        <th className="py-5 px-6 font-black text-2xl w-2/5 border-r border-white/20">더해피 450 ONE</th>
                                        <th className="py-5 px-6 font-black text-2xl w-2/5 bg-[#3b82f6]">스마트케어 330</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { title: "납입 구조", happy: "월 18,000원 × 250회\n(총 450만원 / 1구좌)", smart: "월 33,000원 × 200회\n(총 660만원 / 1구좌)", highlight: false },
                                        { title: "가입 단위", happy: "1 ~ 3구좌 선택 가능", smart: "1 ~ 4구좌 선택 가능", highlight: false },
                                        { title: "핵심 혜택", happy: "소노호텔앤리조트 멤버십 제공\n(객실/부대시설 특별 할인가)", smart: "최신 프리미엄 가전제품\n렌탈 비용 전액 지원", highlight: true },
                                        { title: "라이프 서비스", happy: "고품격 상조 및 전환 서비스\n(크루즈/골프/여행 등 자유 전환)", smart: "고품격 상조 및 전환 서비스\n(크루즈/골프/여행 등 자유 전환)", highlight: false },
                                        { title: "만기 혜택", happy: "만기 시 100% 전액 환급\n(서비스 미이용 시)", smart: "만기 시 100% 전액 환급\n(서비스 미이용 시)", highlight: false },
                                        { title: "제휴카드 할인", happy: "소노아임레디 제휴카드\n(상조회비 청구할인)", smart: "가전렌탈료 + 상조회비\n2가지 제휴카드 동시 혜택", highlight: true }
                                    ].map((row, idx) => (
                                        <tr key={idx} className={`border-b border-gray-200 last:border-0 ${row.highlight ? 'bg-blue-50/40' : ''}`}>
                                            <td className="py-6 px-6 font-black text-gray-600 bg-gray-50 border-r border-gray-200">{row.title}</td>
                                            <td className="py-6 px-6 font-bold text-gray-800 border-r border-gray-200 whitespace-pre-line leading-relaxed">{row.happy}</td>
                                            <td className={`py-6 px-6 font-black whitespace-pre-line leading-relaxed ${row.highlight ? 'text-[#3b82f6] text-xl' : 'text-gray-900 text-lg'}`}>{row.smart}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "closing",
            content: (
                <div className="h-full bg-white flex flex-col items-center justify-center p-16 text-center">
                    <div className="mb-12">
                        <img src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1782103566/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_BI_3_hoptu9.png" className="h-14 w-auto object-contain" />
                    </div>
                    <h2 className="text-6xl font-black text-sono-dark tracking-tighter mb-8">
                        가장 스마트한 선택,<br />
                        <span className="text-sono-primary">SMART CARE</span>
                    </h2>
                    <p className="text-xl text-gray-400 font-bold max-w-xl mx-auto leading-relaxed break-keep">
                        대명소노의 품격과 전문성을 바탕으로<br />
                        고객님의 미래를 함께 설계합니다.
                    </p>
                    <div className="mt-16 pt-12 border-t border-gray-100 w-full max-w-md">
                        <p className="text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase">Sono I'm Ready Sales Training Material</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="h-screen w-screen overflow-hidden relative">
            <LectureViewer slides={slides} productType="smartcare" />

            {/* WebView Modal */}
            {modalUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md">
                    <div className="w-full h-full bg-white rounded-3xl overflow-hidden relative flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="h-14 bg-white border-b flex items-center justify-between px-6">
                            <span className="text-sono-dark font-black tracking-tighter">소노아임레디 전환 서비스 상세</span>
                            <button 
                                onClick={() => setModalUrl(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-sono-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Iframe Content */}
                        <div className="flex-grow bg-gray-50">
                            <iframe 
                                src={modalUrl} 
                                className="w-full h-full border-none"
                                title="Sono Service Detail"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Promotion Modal */}
            {showPromoModal && (
                <div 
                    className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl"
                    onClick={() => setShowPromoModal(false)}
                >
                    <div 
                        className="max-w-[800px] w-full bg-[#2a2a2a] rounded-[48px] p-12 border border-white/10 shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-sono-gold"></div>
                        
                        <div className="flex items-center gap-10">
                            {/* Card Icon */}
                            <div className="w-32 h-32 bg-yellow-400 rounded-[32px] flex items-center justify-center text-6xl shadow-2xl">
                                <svg className="w-20 h-20 text-sono-dark" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                                    <circle cx="7" cy="15" r="1" />
                                    <circle cx="10" cy="15" r="1" />
                                </svg>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-4xl font-black text-white tracking-tighter">
                                        제휴카드 <span className="text-yellow-400">파격 할인 혜택</span>
                                    </h3>
                                    <div className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">HOT</div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-2xl font-bold text-gray-300">
                                        발급 후 자동이체 시 첫 달
                                    </p>
                                    <p className="text-4xl font-black text-white underline decoration-yellow-400 decoration-4 underline-offset-8">
                                        무조건 <span className="text-yellow-400">12,000원</span> 할인!!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowPromoModal(false)}
                            className="absolute top-8 right-8 w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
