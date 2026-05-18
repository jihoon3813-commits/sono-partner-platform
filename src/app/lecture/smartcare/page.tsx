"use client";

import React, { useState } from "react";
import LectureViewer from "@/components/LectureViewer";
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

const ApplianceGridSlide = ({ unit, monthly, total, service, appliances }: { unit: number, monthly: string, total: string, service: string, appliances: Appliance[] }) => (
    <div className="h-full bg-[#f8fafc] p-10 flex flex-col items-center">
        <div className="text-center mb-8 shrink-0">
            <span className="bg-[#3b82f6] text-white px-5 py-1.5 rounded-full text-sm font-black tracking-widest mb-4 inline-block">SMART CARE 330</span>
            <h2 className="text-5xl font-black text-sono-dark tracking-tighter mb-4">스마트케어 330 - {unit}구좌</h2>
            <p className="text-xl font-bold text-gray-500">
                월 {monthly}x200회, 총 {total} / 상조서비스 {service}
            </p>
        </div>
        <div className="w-full max-w-[1300px] overflow-y-auto pr-4 pb-10 flex-grow scrollbar-hide">
            <div className="grid grid-cols-4 gap-6">
                {appliances.map((app, idx) => (
                    <div key={idx} className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm flex flex-col h-[320px] hover:shadow-md transition-shadow">
                        <div className="h-40 w-full mb-4 flex items-center justify-center p-2 shrink-0">
                            {app.image ? (
                                <img src={app.image} alt={app.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <div className="w-full h-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">No Image</div>
                            )}
                        </div>
                        <div className="flex flex-col flex-grow">
                            <span className="text-xs font-black text-gray-400 mb-1 line-clamp-1">{app.brand}</span>
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug mb-2 flex-grow">{app.name}</h3>
                            <div className="bg-gray-50 rounded-lg p-2 shrink-0">
                                <p className="text-[10px] text-gray-500 mb-0.5">모델명</p>
                                <p className="text-[11px] font-bold text-gray-700 truncate">{app.model}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {appliances.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold">
                    등록된 {unit}구좌 상품이 없습니다.
                </div>
            )}
        </div>
    </div>
);
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
                <div className="h-full bg-[#191f28] text-white p-16 flex flex-col justify-center">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black tracking-tighter mb-4">다양한 라이프스타일에 맞춘 구성</h2>
                        <p className="text-white/50 text-xl font-medium">원하는 구좌 수를 선택하고 최신 가전을 골라보세요.</p>
                    </div>

                    <div className="grid grid-cols-4 gap-6 max-w-[1200px] mx-auto w-full px-4">
                        {[
                            { name: "스마트케어330", unit: "2", price: "33,000", target: "1인 가구 / 소형 가전" },
                            { name: "스마트케어330", unit: "3", price: "49,500", target: "신혼 부부 / 중형 가전" },
                            { name: "스마트케어330", unit: "4", price: "66,000", target: "일반 가전 / 대형 가전", best: true },
                            { name: "스마트케어330", unit: "6", price: "99,000", target: "대가족 / 프리미엄 가전 패키지" },
                        ].map((plan, i) => (
                            <div key={i} className={`p-8 rounded-[32px] border transition-all ${plan.best ? "bg-[#3b82f6] border-[#3b82f6] shadow-2xl scale-105 z-10" : "bg-[#202632] border-[#2d3442] hover:bg-[#2a303c] mt-4 mb-4"}`}>
                                {plan.best ? (
                                    <span className="bg-white text-[#3b82f6] text-[10px] font-black px-4 py-1.5 rounded-full mb-6 inline-block">BEST CHOICE</span>
                                ) : (
                                    <div className="h-[32px] mb-6 hidden md:block opacity-0"><span className="px-4 py-1.5 inline-block">SPACER</span></div>
                                )}
                                <h3 className="font-black mb-2 tracking-tighter">
                                    <span className="text-sm opacity-70 block mb-2">{plan.name}</span>
                                    <span className="text-4xl">{plan.unit}구좌</span>
                                </h3>
                                <p className="text-white/60 text-xs font-bold mb-10">{plan.target}</p>
                                <div className="mb-12">
                                    <span className="text-5xl font-black">{plan.price}</span>
                                    <span className="text-xl opacity-60 ml-1">원~</span>
                                </div>
                                <ul className="space-y-4 opacity-80 text-sm font-bold">
                                    <li className="flex items-center gap-2">✓ 가전 렌탈료 전액 지원 혜택</li>
                                    <li className="flex items-center gap-2">✓ 멤버십 즉시 이용</li>
                                    <li className="flex items-center gap-2">✓ 100% 만기 환급</li>
                                </ul>
                            </div>
                        ))}
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
                            img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%83%81%EC%A1%B0%EC%97%94%EB%A1%9C%EC%B9%B4_%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94__%EC%B9%B4%EB%93%9C_zn324u.png", // Using a placeholder that looks like Lotte card
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
                            img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom.png", // Using a placeholder that looks like Hana card
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
                            img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom.png",
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
                            img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%83%81%EC%A1%B0%EC%97%94%EB%A1%9C%EC%B9%B4_%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94__%EC%B9%B4%EB%93%9C_zn324u.png",
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
                            img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597781/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2.png",
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
            id: "smartcare-products-2",
            content: <ApplianceGridSlide unit={2} monthly="33,000원" total="660만원" service="2회" appliances={appliances2} />
        },
        {
            id: "smartcare-products-4",
            content: <ApplianceGridSlide unit={4} monthly="66,000원" total="1,320만원" service="4회" appliances={appliances4} />
        },
        {
            id: "smartcare-products-6",
            content: <ApplianceGridSlide unit={6} monthly="99,000원" total="1,980만원" service="6회" appliances={appliances6} />
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
                <div className="h-full bg-[#f2f4f6] p-10 flex flex-col justify-center">
                    <div className="max-w-[1250px] mx-auto w-full">
                        <div className="mb-8 text-center space-y-1">
                            <span className="text-xs font-black text-sono-gold uppercase tracking-widest">SERVICE DETAILS</span>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter">의전 서비스 상세 구성</h2>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                {
                                    title: "고인용품 (입관/수시)",
                                    items: [
                                        { label: "관", value: "오동나무 45mm (매장) / 오동나무 18mm/유골함 (화장)", highlight: false },
                                        { label: "수의", value: "대마 100% 기계식 (꽃관보/도우미 대체 가능)", highlight: false }
                                    ]
                                },
                                {
                                    title: "입관용품",
                                    items: [
                                        { label: "의류", value: "도포, 원삼, 천금, 지금 (수의와 동일 제품)", highlight: false },
                                        { label: "기타", value: "명정, 관보, 베개, 습신 등 규격품 일체 제공", highlight: false }
                                    ]
                                },
                                {
                                    title: "빈소 및 기타용품",
                                    items: [
                                        { label: "빈소내 용품", value: "향, 양초, 부의록, 위패 등 필요량 일체 제공", highlight: false },
                                        { label: "대여/기타", value: "향로, 촛대 (대여) / 완장, 상장, 장갑 (제공)", highlight: false }
                                    ]
                                },
                                {
                                    title: "의전 및 제단",
                                    items: [
                                        { label: "현대식 상복", value: "검정 양복 / 개량 한복 각 3벌 (남녀 무관)", highlight: true },
                                        { label: "꽃장식", value: "헌화용 국화 30송이, 꽃바구니 2개 (제단 꽃장식 제외)", highlight: true, red: true }
                                    ]
                                },
                                {
                                    title: "차량지원",
                                    items: [
                                        { label: "이송차량", value: "관내 (시, 군내) 무료 제공", highlight: false },
                                        { label: "유족버스/리무진", value: "왕복 200km 제공 택 1 (초과시 별도)", highlight: true }
                                    ]
                                },
                                {
                                    title: "인력지원",
                                    items: [
                                        { label: "장례지도사", value: "국가공인 지도사 1명 (입관 및 행사 진행)", highlight: true },
                                        { label: "의전도우미", value: "전문 도우미 3명 (접객 및 빈소 관리)", highlight: true }
                                    ]
                                }
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white rounded-[32px] overflow-hidden shadow-md flex flex-col border border-gray-100">
                                    <div className="bg-[#1a1a1a] p-4 px-8">
                                        <h3 className="text-white text-lg font-black">{card.title}</h3>
                                    </div>
                                    <div className="p-8 flex-grow space-y-6">
                                        {card.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-start gap-8">
                                                <span className="text-sono-primary text-sm font-black shrink-0 pt-0.5">{item.label}</span>
                                                <div className="text-right">
                                                    <p className={`text-[14px] font-bold leading-snug break-keep ${item.red ? 'text-red-500' : item.highlight ? 'text-[#007aff]' : 'text-sono-dark'}`}>
                                                        {item.value.split(' ').map((word, wi) => (
                                                            <span key={wi} className={word.includes('1명') || word.includes('3명') || word.includes('3벌') || word.includes('200km') ? 'text-2xl font-black mx-1 underline underline-offset-4' : ''}>
                                                                {word}{' '}
                                                            </span>
                                                        ))}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-center text-[10px] text-gray-400 font-bold italic">※ 상기 품목은 지역 및 장례식장 여건에 따라 동급의 타 제품으로 대체될 수 있습니다.</p>
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
                                        { icon: "🏷️", title: "매일 기다려지는 특가 상품과 이벤트", desc: "타임딜, 릴레이딜부터 룰렛 이벤트! 매일 새로운 상품과 이벤트가 쏟아집니다!" },
                                        { icon: "👥", title: "초청 회원 가능", desc: "소중한 지인들과 함께 특가를 즐기고, 나에게는 포인트가 쌓이는 즐거움을 경험해보세요!" },
                                        { icon: "💰", title: "더욱 강력해진 적립&쿠폰 혜택", desc: "만기까지 유지하신 고객님들께는 혜택을 더 드려요! 특별 적립 & 쿠폰, 더 강력해진 혜택을 드립니다." }
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
                                        "https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914664/sono-img-1_nf9jij.jpg",
                                        "https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914672/sono-img-2_wuo9ty.jpg",
                                        "https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914676/sono-img-3_jaq9py.jpg",
                                        "https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914677/sono-img-4_ujvpnt.jpg"
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
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="h-56 rounded-2xl overflow-hidden">
                                        <img src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914705/benefit_list_bg02_nqr8hr.jpg" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="Leisure 1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 h-56">
                                        <img src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914708/benefit_list_bg03_cehqc0.jpg" className="w-full h-full object-cover rounded-2xl hover:scale-110 transition-transform duration-500" alt="Leisure 2" />
                                        <img src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1778914714/benefit_list_bg04_ifzhw9.jpg" className="w-full h-full object-cover rounded-2xl hover:scale-110 transition-transform duration-500" alt="Leisure 3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex justify-center gap-4 pt-2">
                            <button 
                                onClick={() => setModalUrl("https://www.sonoimready.com/front/sc/membershipInfo?key=sonoresort")}
                                className="relative z-20 bg-sono-gold text-sono-dark px-10 py-4 rounded-full font-black text-lg shadow-2xl hover:bg-white hover:scale-105 transition-all flex items-center gap-3 group"
                            >
                                <span>멤버십 혜택 자세히 보기</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            <button 
                                onClick={() => setModalUrl("https://www.sonohotelsresorts.com/")}
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
                <div className="h-full bg-[#f8f9fb] p-10 flex flex-col justify-center">
                    <div className="max-w-[1250px] mx-auto w-full space-y-10">
                        <div className="text-center">
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter">중요정보 고지사항</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 flex-grow">
                            {/* Section 1 */}
                            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
                                    <h3 className="text-2xl font-black text-sono-dark">환급기준 및 환급시기</h3>
                                </div>
                                <div className="space-y-4 text-gray-500 font-bold text-lg leading-relaxed">
                                    <div className="flex gap-2">
                                        <span className="text-[#3b82f6] mt-1.5">•</span>
                                        <p className="break-keep">중도해약에 대한 환급 기준은 상조서비스 약관 규정에 의해 환급됩니다.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[#3b82f6] mt-1.5">•</span>
                                        <p className="break-keep">환급금은 신청완료일로부터 3영업일 이내에 수령하실 수 있습니다.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
                                    <h3 className="text-2xl font-black text-sono-dark">총 고객환급의무액 및 자산 현황</h3>
                                </div>
                                <div className="bg-[#f8f9fb] rounded-3xl p-6 mb-4 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-gray-400">총 고객환급의무액</p>
                                        <p className="text-xl font-black text-[#3b82f6]">1,129,868,124천원</p>
                                    </div>
                                    <div className="space-y-1 border-l border-gray-200 pl-6">
                                        <p className="text-xs font-black text-gray-400">상조 관련 자산</p>
                                        <p className="text-xl font-black text-[#3b82f6]">1,230,275,029천원</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-400 text-center">
                                    (주)소노스테이션은 성지회계법인의 공인회계사를 통해 회계감사를 받고 있습니다.
                                </p>
                            </div>

                            {/* Section 3 */}
                            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
                                    <h3 className="text-2xl font-black text-sono-dark">고객 불입금 관리방법</h3>
                                </div>
                                <p className="text-gray-500 font-bold text-lg leading-relaxed break-keep">
                                    [할부거래에 관한 법률] 제18조에 의거 선불식 할부거래업 등록하였으며, 동법 제27조에 따라 고객 불입금의 50%는 상조보증공제조합에 소비자피해보상을 위한 공제계약을 체결하고 있습니다.
                                </p>
                            </div>

                            {/* Section 4 */}
                            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-8 bg-[#3b82f6] rounded-full"></div>
                                    <h3 className="text-2xl font-black text-sono-dark">소비자 유의사항</h3>
                                </div>
                                <div className="space-y-4 text-gray-500 font-bold text-lg leading-relaxed">
                                    <div className="flex gap-2">
                                        <span className="text-[#3b82f6] mt-1.5">•</span>
                                        <p className="break-keep">장의차량 운행 시 발생되는 도로공사 비용(통행료) 및 주차비 등은 고객 부담입니다.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[#3b82f6] mt-1.5">•</span>
                                        <p className="break-keep">장례식장 임대료 및 접객용 음식료 등은 상품 구성에서 제외되어 있습니다.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-[#3b82f6] mt-1.5">•</span>
                                        <p className="break-keep">회비 납입 도중 행사 발생 시, 할인 전까지 잔여 회비를 일시납 하셔야 합니다.</p>
                                    </div>
                                </div>
                            </div>
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
                        <img src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_B.png" className="h-12 grayscale opacity-50" />
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
