"use client";

import LectureViewer from "@/components/LectureViewer";
import { useState } from "react";

export default function Happy450LecturePage() {
    const [modalUrl, setModalUrl] = useState<string | null>(null);
    const [showPromoModal, setShowPromoModal] = useState(false);

    const slides = [
        {
            id: "title",
            content: (
                <div className="h-full bg-[#0d0d0d] relative flex items-center justify-center p-12 overflow-hidden text-white text-center">
                    <div className="absolute inset-0 opacity-40">
                        <img 
                            src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/ba129da43419b13c6e6fe3df92fc852b3f2e6abf/Generated%20Image%20January%2022%2C%202026%20-%205_16PM.jpeg" 
                            className="w-full h-full object-cover scale-110"
                            alt="Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent"></div>
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="inline-block bg-sono-primary text-white px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-2xl border border-white/10">STANDARD LIFE CARE</div>
                        <h1 className="text-7xl font-black tracking-tighter leading-[1] drop-shadow-2xl">
                            더 해피 450 ONE<br />
                            <span className="text-sono-gold text-4xl font-extrabold opacity-90 uppercase">Training Guide</span>
                        </h1>
                        <p className="text-xl text-white/60 font-bold max-w-2xl mx-auto leading-relaxed break-keep">
                            포인트 증정 + 레디캐시 + 납입금 100% 환급<br />
                            소노아임레디의 가장 완벽한 베이직 솔루션
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "benefits-grid",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <span className="badge-primary mb-3">CORE BENEFITS</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter leading-tight">3가지 핵심 혜택</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto px-4">
                        {[
                            { 
                                title: "BENEFIT 01", 
                                name: "제휴몰 포인트 증정", 
                                desc: "계약과 동시에 제휴 쇼핑몰에서 사용 가능한 포인트를 즉시 지급합니다.",
                                icon: "🎁"
                            },
                            { 
                                title: "BENEFIT 02", 
                                name: "제휴카드 파격 할인", 
                                desc: "첫 달 실적 없이도 1.2만원 할인, 최대 2.5만원까지 월 납입금 절감",
                                icon: "💳"
                            },
                            { 
                                title: "SPECIAL", 
                                name: "납입금 100% 환급", 
                                desc: "만기 납입 후 익월 해약 시, 낸 돈 그대로 100% 현금 환급 보장",
                                icon: "💰"
                            }
                        ].map((b, i) => (
                            <div key={i} className="bg-gray-50 p-10 rounded-[48px] flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl transition-all border border-gray-100">
                                <div className="text-6xl mb-8 group-hover:scale-110 transition-transform">{b.icon}</div>
                                <div className="text-sono-primary text-xs font-black tracking-widest mb-3">{b.title}</div>
                                <h3 className="text-2xl font-black text-sono-dark mb-6 break-keep">{b.name}</h3>
                                <p className="text-base text-gray-400 font-bold leading-relaxed break-keep">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "payment-plans-detail",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <span className="badge-primary mb-3">PAYMENT PLAN</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter">합리적인 월 납입 플랜</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-8 w-full max-w-[1200px] mx-auto px-4">
                        {[
                            { name: "실속형", unit: "1구좌", price: "18,000", card: "6,000" },
                            { name: "인기형", unit: "2구좌", price: "36,000", card: "24,000", popular: true },
                            { name: "베스트", unit: "3구좌", price: "54,000", card: "42,000" }
                        ].map((p, i) => (
                            <div key={i} className={`p-10 rounded-[56px] border-2 transition-all ${p.popular ? 'bg-sono-primary text-white border-sono-primary shadow-2xl scale-105 z-10' : 'bg-white border-gray-100 text-sono-dark'}`}>
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-black mb-2">{p.name}</h3>
                                    <p className={`text-xs font-bold ${p.popular ? 'text-white/60' : 'text-gray-400'}`}>더 해피 450 ONE {p.unit}</p>
                                </div>
                                <div className="text-center space-y-6">
                                    <div className="pb-6 border-b border-white/10">
                                        <p className="text-xs font-bold opacity-60 mb-2">기본 월 납입금</p>
                                        <div className="text-4xl font-black">{p.price}<span className="text-lg ml-0.5">원</span></div>
                                    </div>
                                    <div className="pt-4">
                                        <p className={`text-xs font-black mb-2 ${p.popular ? 'text-sono-gold' : 'text-sono-primary'}`}>제휴카드 할인 적용 시 (30만)</p>
                                        <div className={`text-3xl font-black ${p.popular ? 'text-white' : 'text-sono-primary'}`}>{p.card}<span className="text-lg ml-0.5">원</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-center text-[10px] text-gray-400 font-bold">※ 제휴카드 최대 2.5만원 할인 시 월 부담액은 더 낮아집니다.</p>
                </div>
            )
        },
        {
            id: "refund-logic-passbook-style",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="max-w-[1100px] mx-auto w-full space-y-12">
                        <div className="text-center space-y-4">
                            <span className="badge-primary">REFUND SYSTEM</span>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter leading-tight">
                                카드 고지서엔 <span className="text-red-500">0원</span>, <br />
                                환급 통장엔 <span className="text-sono-primary">원금 100%</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-12 relative">
                            {/* Decorative VS */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="w-20 h-20 bg-sono-dark text-white rounded-full flex items-center justify-center font-black text-2xl shadow-2xl border-8 border-white italic">VS</div>
                            </div>

                            {/* Left: Card Statement (Reality of Outflow) */}
                            <div className="bg-[#f2f4f6] rounded-[48px] p-10 border border-gray-200 space-y-8 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">💳</div>
                                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Card Statement</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold border-b border-gray-200 pb-4">
                                        <span className="text-gray-400">월 납입금</span>
                                        <span className="text-sono-dark">18,000원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold border-b border-gray-200 pb-4">
                                        <span className="text-gray-400">제휴카드 할인</span>
                                        <span className="text-red-500">-18,000원</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xl font-black text-sono-dark">최종 결제액</span>
                                        <span className="text-3xl font-black text-red-500">0원</span>
                                    </div>
                                </div>
                                <div className="bg-red-500/10 text-red-600 p-4 rounded-2xl text-center font-black text-sm">
                                    매달 나가는 돈은 하나도 없습니다!
                                </div>
                            </div>

                            {/* Right: Refund Passbook (Reality of Asset) */}
                            <div className="bg-sono-primary/5 rounded-[48px] p-10 border-4 border-sono-primary space-y-8 shadow-2xl shadow-sono-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 text-6xl">📈</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-sono-primary rounded-2xl flex items-center justify-center text-2xl shadow-sm text-white">💰</div>
                                    <h3 className="text-xl font-black text-sono-primary uppercase tracking-widest">Refund Passbook</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold border-b border-sono-primary/10 pb-4">
                                        <span className="text-gray-500">월 인정액</span>
                                        <span className="text-sono-dark">18,000원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg font-bold border-b border-sono-primary/10 pb-4">
                                        <span className="text-gray-500">인정 비율</span>
                                        <span className="text-sono-primary">100.0%</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xl font-black text-sono-dark">만기 환급금</span>
                                        <span className="text-3xl font-black text-sono-primary">4,500,000원</span>
                                    </div>
                                </div>
                                <div className="bg-sono-primary text-white p-4 rounded-2xl text-center font-black text-sm shadow-lg">
                                    할인 받은 돈까지 전부 돌려받습니다!
                                </div>
                            </div>
                        </div>

                        {/* Crucial Message */}
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-500 leading-relaxed break-keep">
                                "지출은 <span className="text-red-500">카드사</span>가 줄여주고, 저축은 <span className="text-sono-primary">소노</span>가 채워주는<br />
                                <span className="text-sono-dark font-black">대한민국 유일의 환급 솔루션</span>입니다."
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "affiliate-cards-detailed",
            content: (
                <div className="h-full bg-[#f8fafc] p-12 flex flex-col justify-center">
                    <div className="max-w-[1200px] mx-auto w-full space-y-10">
                        <div className="text-center space-y-3 relative">
                            <style>{`
                                @keyframes blink {
                                    0% { opacity: 1; transform: scale(1); }
                                    50% { opacity: 0.5; transform: scale(1.05); }
                                    100% { opacity: 1; transform: scale(1); }
                                }
                                .animate-blink {
                                    animation: blink 0.8s infinite;
                                }
                            `}</style>
                            <button 
                                onClick={() => setShowPromoModal(true)}
                                className="absolute -top-4 -right-4 animate-blink bg-red-600 text-white px-6 py-3 rounded-full text-2xl font-black shadow-[0_0_20px_rgba(220,38,38,0.5)] z-30 cursor-pointer hover:scale-110 transition-transform"
                            >
                                첫 달 실적이 없어도 할인!
                            </button>
                            <h2 className="text-5xl font-black text-sono-dark tracking-tighter">제휴카드 할인 혜택</h2>
                            <p className="text-xl text-gray-400 font-bold">제휴카드로 결제 시 매월 납입금 부담을 더 줄여드립니다.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            {[
                                {
                                    tag: "연회비 가장 저렴",
                                    tagColor: "bg-[#ff9f0a]",
                                    title: "소노아임레디 KB국민카드",
                                    discount: "최대 1.7만원",
                                    discountSuffix: "할인",
                                    highlightTitle: "전월 30만원 실적 시",
                                    highlightValue: "12,000원 할인",
                                    highlightSubTitle: "첫 달 실적 없어도",
                                    highlightSubValue: "12,000원 할인",
                                    rows: [
                                        { label: "전월 30만원 ↑", value: "12,000" },
                                        { label: "전월 70만원 ↑", value: "17,000" }
                                    ],
                                    fee: "국내외겸용 15,000원",
                                    phone: "1899-0077",
                                    img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597781/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2.png"
                                },
                                {
                                    tag: "빠른 신청(전용번호)",
                                    tagColor: "bg-[#ff453a]",
                                    title: "소노아임레디 플러스 하나카드",
                                    discount: "최대 1.9만원",
                                    discountSuffix: "할인",
                                    highlightTitle: "전월 30만원 실적 시",
                                    highlightValue: "12,000원 할인",
                                    highlightSubTitle: "첫 달 실적 없어도",
                                    highlightSubValue: "12,000원 할인",
                                    rows: [
                                        { label: "전월 30만원 ↑", value: "12,000" },
                                        { label: "전월 100만원 ↑", value: "19,000" }
                                    ],
                                    fee: "국내외겸용 20,000원",
                                    phone: "1800-0672",
                                    img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_%ED%94%8C%EB%9F%AC%EC%8A%A4_%ED%95%98%EB%82%98%EC%B9%B4%EB%93%9C_nyopom.png"
                                },
                                {
                                    tag: "최대 캐시백",
                                    tagColor: "bg-[#007aff]",
                                    title: "소노아임레디 상조엔로카",
                                    discount: "최대 2.5만원",
                                    discountSuffix: "캐시백",
                                    highlightTitle: "전월 30만원 실적 시",
                                    highlightValue: "13,000원 캐시백",
                                    highlightSubTitle: "첫 달 실적 없어도",
                                    highlightSubValue: "13,000원 캐시백",
                                    rows: [
                                        { label: "전월 30만원 ↑", value: "13,000" },
                                        { label: "전월 70만원 ↑", value: "16,000" },
                                        { label: "전월 150만원 ↑", value: "25,000" }
                                    ],
                                    fee: "국내외겸용 20,000원",
                                    phone: "1588-8100",
                                    img: "https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%83%81%EC%A1%B0%EC%97%94%EB%A1%9C%EC%B9%B4_%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94__%EC%B9%B4%EB%93%9C_zn324u.png"
                                }
                            ].map((card, i) => (
                                <div key={i} className="bg-white rounded-[48px] p-8 shadow-xl border border-white flex flex-col relative overflow-hidden group">
                                    <div className="flex flex-col items-center text-center space-y-6">
                                        <div className={`absolute top-6 px-4 py-1 rounded-full text-white text-[10px] font-black ${card.tagColor}`}>
                                            {card.tag}
                                        </div>
                                        <div className="h-28 mt-8">
                                            <img src={card.img} className="h-full object-contain drop-shadow-2xl" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-sono-dark tracking-tight">{card.title}</h3>
                                            <p className="text-2xl font-black text-[#ff9f0a]">
                                                <span className={`${i === 2 ? 'text-[#007aff]' : 'text-[#ff9f0a]'}`}>{card.discount}</span>
                                                <span className="text-lg ml-1 font-bold text-gray-400">{card.discountSuffix}</span>
                                            </p>
                                        </div>

                                        <div className="w-full bg-gray-50 rounded-3xl p-4 space-y-2">
                                            <div className="flex justify-between items-center text-[11px] font-bold">
                                                <span className="text-gray-400">{card.highlightTitle}</span>
                                                <span className="text-sono-dark">{card.highlightValue}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-black">
                                                <span className="text-[#ff453a]">{card.highlightSubTitle}</span>
                                                <span className="text-[#ff453a] underline decoration-2">{card.highlightSubValue}</span>
                                            </div>
                                        </div>

                                        <div className="w-full space-y-2 px-2">
                                            {card.rows.map((row, j) => (
                                                <div key={j} className="flex justify-between items-center text-[11px] font-bold border-b border-gray-50 pb-2">
                                                    <span className="text-gray-400">{row.label}</span>
                                                    <span className="text-sono-dark">{row.value}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center text-[10px] font-bold pt-2">
                                                <span className="text-gray-300">연회비</span>
                                                <span className="text-gray-400">{card.fee}</span>
                                            </div>
                                        </div>

                                        <div className="w-full pt-4">
                                            <button className="relative z-20 w-full bg-[#1c1c1e] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm shadow-lg hover:bg-black transition-colors">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                                {card.phone} 전화 신청
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[32px] p-8 shadow-xl flex flex-col items-center justify-center text-center border border-white">
                            <h4 className="text-xl font-black text-sono-dark mb-1">카드 발급 후 꼭 확인하세요!</h4>
                            <p className="text-sm font-bold text-gray-400">제휴카드를 발급받으신 후, 반드시 <span className="text-sono-primary underline">자동이체 결제 수단을 해당 카드로 변경</span>하셔야 혜택이 적용됩니다.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "funeral-service-combined",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="max-w-[1100px] mx-auto w-full space-y-10">
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
                                        { label: "현대식 상복", value: "검정 양복 / 개량 한복 각 5벌 (남녀 무관)", highlight: true },
                                        { label: "꽃장식", value: "헌화용 국화 30송이, 꽃바구니 2개 (제단 꽃장식 제외)", highlight: true, red: true }
                                    ]
                                },
                                {
                                    title: "차량지원",
                                    items: [
                                        { label: "이송차량", value: "관내 (시, 군내) 무료 제공", highlight: false },
                                        { label: "유족버스/리무진", value: "왕복 300km 제공 택 1 (초과시 별도)", highlight: true }
                                    ]
                                },
                                {
                                    title: "인력지원",
                                    items: [
                                        { label: "장례지도사", value: "국가공인 지도사 1명 (입관 및 행사 진행)", highlight: true },
                                        { label: "의전도우미", value: "전문 도우미 5명 (접객 및 빈소 관리)", highlight: true }
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
                                                            <span key={wi} className={word.includes('1명') || word.includes('5명') || word.includes('5벌') || word.includes('300km') ? 'text-2xl font-black mx-1 underline underline-offset-4' : ''}>
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
                <div className="h-full bg-white px-10 pb-10 pt-24 flex flex-col">
                    <div className="max-w-[1250px] mx-auto w-full flex-grow flex flex-col gap-10">
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
                <div className="h-full bg-white px-10 pb-10 pt-24 flex flex-col">
                    <div className="max-w-[1250px] mx-auto w-full flex-grow flex flex-col gap-10">
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
                            <div className="grid grid-cols-2 gap-6 pt-4">
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
                        <div className="bg-[#f8f9fb] rounded-[48px] p-10 flex-grow flex flex-col justify-center relative overflow-hidden">
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

                            <div className="space-y-1 mb-8">
                                <h3 className="text-3xl font-black text-sono-dark">소노아임레디몰</h3>
                                <p className="text-lg font-bold text-gray-400">소노아임레디 회원을 위한 특별 혜택이 가득한 쇼핑몰!</p>
                            </div>

                            <div className="grid grid-cols-2 gap-12 items-center">
                                <div className="relative">
                                    <img 
                                        src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg" 
                                        className="w-full rounded-3xl shadow-2xl border-4 border-white"
                                        alt="Mall Preview"
                                    />
                                </div>
                                <div className="space-y-8">
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
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-black text-sono-dark mb-3">레디캐시 안내</h4>
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
                <div className="h-full bg-[#191f28] text-white px-10 pb-10 pt-20 flex flex-col">
                    <div className="max-w-[1300px] mx-auto w-full flex-grow flex flex-col gap-6">
                        <div className="text-center space-y-1">
                            <span className="text-sono-gold font-black tracking-[0.3em] text-xs uppercase">VIP MEMBERSHIP</span>
                            <h2 className="text-5xl font-black tracking-tighter leading-tight">대명 소노그룹 멤버십</h2>
                            <p className="text-lg font-bold text-white/40">소노아임레디 회원님만을 위한 프리미엄 멤버십 혜택</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 flex-grow">
                            {/* Hotel & Resort Card */}
                            <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 flex flex-col gap-6 backdrop-blur-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sono-gold/20 rounded-xl flex items-center justify-center text-xl">🏨</div>
                                        <h3 className="text-3xl font-black tracking-tighter">호텔 & 리조트</h3>
                                    </div>
                                    <p className="text-sono-gold font-black text-lg">전국 17개 직영 리조트 객실 우대</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-grow">
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
                            <div className="bg-white/5 border border-white/10 rounded-[48px] p-8 flex flex-col gap-6 backdrop-blur-xl">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-sono-gold/20 rounded-xl flex items-center justify-center text-xl">🏊</div>
                                        <h3 className="text-3xl font-black tracking-tighter">레저 & 워터파크</h3>
                                    </div>
                                    <p className="text-sono-gold font-black text-lg">오션월드, 비발디파크 등 최대 35% 할인</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3 flex-grow">
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
                <div className="h-full bg-[#f8f9fb] px-10 pb-10 pt-20 flex flex-col">
                    <div className="max-w-[1250px] mx-auto w-full flex-grow flex flex-col gap-10">
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
                <div className="h-full bg-sono-primary flex items-center justify-center p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <img src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png" className="w-full h-full object-contain scale-150 rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-10">
                        <h2 className="text-6xl font-black tracking-tighter leading-tight">
                            미래를 위한 가장 현명한 준비
                        </h2>
                        <div className="inline-block bg-white text-sono-primary px-10 py-5 rounded-[24px] text-3xl font-black shadow-2xl">
                            더 해피 450 ONE
                        </div>
                        <div className="pt-10 border-t border-white/20">
                            <p className="text-lg font-bold opacity-70">자세한 상품 안내는 공식 안내문을 참조하세요.</p>
                            <p className="mt-4 text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Sono I'm Ready Sales Training Guide</p>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="h-screen w-screen overflow-hidden relative">
            <LectureViewer slides={slides} productType="happy450" />

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
