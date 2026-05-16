"use client";

import LectureViewer from "@/components/LectureViewer";

export default function SmartCareLecturePage() {
    const slides = [
        {
            id: "title",
            content: (
                <div className="h-full bg-sono-dark relative flex items-center justify-center p-12 overflow-hidden text-white text-center">
                    <div className="absolute inset-0 opacity-30">
                        <img 
                            src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/p_best02_product07_01.jpg" 
                            className="w-full h-full object-cover scale-105"
                            alt="SmartCare Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-sono-dark via-sono-dark/80 to-transparent"></div>
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="inline-block bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase border border-white/20">PREMIUM HYBRID CARE</div>
                        <h1 className="text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
                            SMART CARE<br />
                            <span className="text-sono-primary text-4xl font-extrabold uppercase">Lecture Deck</span>
                        </h1>
                        <p className="text-xl text-white/50 font-bold max-w-2xl mx-auto leading-relaxed break-keep">
                            스마트한 가입, 완벽한 케어<br />
                            소노아임레디의 프리미엄 하이브리드 솔루션
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "card-benefits-tiers",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <span className="badge-primary mb-3">CARD DISCOUNT</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter">제휴카드 할인 및 혜택 구간</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-10 w-full max-w-[1200px] mx-auto px-4">
                        <div className="bg-gray-50 p-10 rounded-[56px] border border-gray-100 shadow-xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-12 bg-white rounded-xl shadow-md p-2 flex items-center justify-center">
                                    <img src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597781/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94_KB%EC%B9%B4%EB%93%9C_ffyvb2.png" className="h-full object-contain" />
                                </div>
                                <h3 className="text-2xl font-black text-sono-dark">KB국민 소노아임레디</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex justify-between font-bold text-base">
                                    <span className="text-gray-400">30만원 이상</span>
                                    <span className="text-sono-primary text-xl">12,000원 할인</span>
                                </li>
                                <li className="flex justify-between font-bold text-base">
                                    <span className="text-gray-400">70만원 이상</span>
                                    <span className="text-sono-primary text-xl">17,000원 할인</span>
                                </li>
                                <li className="bg-sono-primary/10 p-4 rounded-2xl text-xs font-black text-sono-primary text-center mt-6">
                                    첫 달 실적 관계없이 1.2만원 즉시 할인
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-10 rounded-[56px] border border-gray-100 shadow-xl">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-20 h-12 bg-white rounded-xl shadow-md p-2 flex items-center justify-center">
                                    <img src="https://res.cloudinary.com/dx7l09wwu/image/upload/v1777597782/%EC%83%81%EC%A1%B0%EC%97%94%EB%A1%9C%EC%B9%B4_%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94__%EC%B9%B4%EB%93%9C_zn324u.png" className="h-full object-contain" />
                                </div>
                                <h3 className="text-2xl font-black text-sono-dark">상조엔로카 (롯데)</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex justify-between font-bold text-base">
                                    <span className="text-gray-400">30만원 이상</span>
                                    <span className="text-sono-primary text-xl">13,000원 할인</span>
                                </li>
                                <li className="flex justify-between font-bold text-base">
                                    <span className="text-gray-400">70만원 이상</span>
                                    <span className="text-sono-primary text-xl">16,000원 할인</span>
                                </li>
                                <li className="flex justify-between font-bold text-base">
                                    <span className="text-gray-400">150만원 이상</span>
                                    <span className="text-sono-primary text-xl">25,000원 할인</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "funeral-service-all",
            content: (
                <div className="h-full bg-white p-10 flex flex-col justify-center">
                    <div className="mb-6 text-center">
                        <span className="badge-primary mb-2">FUNERAL SERVICE</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter">의전 서비스 구성 상세 (품목/인력/차량)</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-[1200px] mx-auto px-4">
                        <div className="bg-[#f8fafc] p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-sono-primary mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-sono-primary rounded-full"></span>
                                고인 용품
                            </h3>
                            <ul className="space-y-3 font-bold">
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">관 (오동나무)</span>
                                    <span className="text-sono-dark">45mm(매장) / 18mm(화장)</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">수의 (대마 100%)</span>
                                    <span className="text-sono-dark">기계직 1호 (꽃관보 대체)</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">화장 전용</span>
                                    <span className="text-sono-dark">유골함 별도 제공</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#f8fafc] p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-sono-primary mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-sono-primary rounded-full"></span>
                                전문 인력 및 소모품
                            </h3>
                            <ul className="space-y-3 font-bold">
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">장례지도사 (1명)</span>
                                    <span className="text-sono-dark">전 과정 책임 진행</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">의전도우미 (5명)</span>
                                    <span className="text-sono-dark">접객 및 빈소 관리</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">현대식 상복</span>
                                    <span className="text-sono-dark">5벌 제공 (남녀 무관)</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#f8fafc] p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-sono-primary mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-sono-primary rounded-full"></span>
                                빈소 및 기타 용품
                            </h3>
                            <ul className="space-y-3 font-bold">
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">입관 용품</span>
                                    <span className="text-sono-dark">도포, 원삼, 천금 등 일체</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">빈소 용품</span>
                                    <span className="text-sono-dark">향, 양초, 부의록, 위패 등</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">기타 대여</span>
                                    <span className="text-sono-dark">향로, 촛대 등 대여</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#f8fafc] p-6 rounded-[32px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-sono-primary mb-4 flex items-center gap-2">
                                <span className="w-1 h-4 bg-sono-primary rounded-full"></span>
                                차량 지원
                            </h3>
                            <ul className="space-y-3 font-bold">
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">이송 차량</span>
                                    <span className="text-sono-dark">관내 (시/군내) 무료</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">리무진/버스</span>
                                    <span className="text-sono-dark">왕복 300km (택 1)</span>
                                </li>
                                <li className="flex justify-between text-[12px]">
                                    <span className="text-gray-400">거리 초과</span>
                                    <span className="text-sono-dark">300km 초과 시 별도 청구</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "consumer-cautions",
            content: (
                <div className="h-full bg-white p-12 flex flex-col justify-center">
                    <div className="mb-8 text-center">
                        <span className="badge-primary mb-3">CAUTIONS</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter">소비자 유의사항 및 제외항목</h2>
                    </div>
                    <div className="w-full max-w-[1200px] mx-auto px-4 grid grid-cols-2 gap-10">
                        <div className="bg-red-50 p-8 rounded-[40px] border border-red-100">
                            <h3 className="text-lg font-black text-red-600 mb-4">서비스 제외 항목</h3>
                            <ul className="space-y-3">
                                {[
                                    "장례식장 임대료",
                                    "접객용 음식 및 음료 비용",
                                    "제단 꽃장식 (기본 헌화 외)",
                                    "매장 시 포크레인 등 중장비"
                                ].map((txt, i) => (
                                    <li key={i} className="text-sm font-bold text-red-800 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                        {txt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                            <h3 className="text-lg font-black text-sono-dark mb-4">고객 부담 비용</h3>
                            <ul className="space-y-3">
                                {[
                                    "장의차량 유료도로 통행료",
                                    "장례식장 주차비 및 회송비",
                                    "화장장 및 묘지 관련 비용",
                                    "납입 도중 행사 시 잔여회비 일시납"
                                ].map((txt, i) => (
                                    <li key={i} className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        {txt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "hybrid-conversion-list",
            content: (
                <div className="h-full bg-[#f8fafc] p-12 flex flex-col justify-center">
                    <div className="mb-10 text-center">
                        <span className="badge-primary mb-3">HYBRID SERVICE</span>
                        <h2 className="text-4xl font-black text-sono-dark tracking-tighter">필요한 순간, 원하는 서비스로 전환</h2>
                    </div>
                    <div className="grid grid-cols-4 gap-6 w-full max-w-[1200px] mx-auto px-4">
                        {[
                            { t: "웨딩", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product06.jpg" },
                            { t: "크루즈", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product09.jpg" },
                            { t: "해외여행", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product01.jpg" },
                            { t: "골프", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product02.jpg" },
                            { t: "어학연수", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product04.jpg" },
                            { t: "리빙/가전", img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/photo_best02_product07.jpg" },
                            { t: "명품케어", img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product10.jpg?raw=true" },
                            { t: "쉼케어", img: "https://github.com/jihoon3813-commits/img_sono/blob/main/photo_best02_product08.jpg?raw=true" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
                                <div className="h-24 overflow-hidden">
                                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="p-3 text-center font-black text-sono-dark text-sm">{item.t}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            id: "membership-summary",
            content: (
                <div className="h-full bg-sono-dark text-white p-12 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sono-primary/20 blur-[120px] rounded-full"></div>
                    <div className="relative z-10 text-center space-y-12">
                        <div className="space-y-4">
                            <span className="text-sono-primary font-black tracking-widest text-xs uppercase">Premium Value</span>
                            <h2 className="text-5xl font-black tracking-tighter">소노그룹 멤버십 혜택</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-8 max-w-[1200px] mx-auto w-full px-4">
                            <div className="p-8 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="text-4xl mb-6">🏨</div>
                                <h3 className="text-xl font-black mb-2">호텔 & 리조트</h3>
                                <p className="text-white/40 text-sm font-bold">전국 17개 지점 파트너 우대가 적용</p>
                            </div>
                            <div className="p-8 rounded-[48px] bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="text-4xl mb-6">⛷️</div>
                                <h3 className="text-xl font-black mb-2">레저 & 스포츠</h3>
                                <p className="text-white/40 text-sm font-bold">오션월드, 스키장 등 최대 35% 할인</p>
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

    return <LectureViewer slides={slides} productType="smartcare" />;
}
