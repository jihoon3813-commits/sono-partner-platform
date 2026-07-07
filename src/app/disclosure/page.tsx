"use client";

import React, { useState } from "react";
import { Header, Footer } from "@/components/layout";

type TabType = "info" | "care4" | "care5" | "happy450";

type MenuCategoryType = "hybrid" | "membership" | "mall";

interface MenuItem {
    title: string;
    desc: React.ReactNode;
    img: string;
}

const menuData: Record<MenuCategoryType, { title: string; items: MenuItem[] }> = {
    hybrid: {
        title: "전환(하이브리드) 서비스",
        items: [
            {
                title: "웨딩",
                desc: "품격 있는 웨딩부티크 스튜디오, 드레스 등 토탈 케어",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096899/photo_best02_product06_mwr7lz.jpg"
            },
            {
                title: "크루즈",
                desc: "바다 위의 움직이는 호텔, 럭셔리 크루즈 여행",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096921/photo_best02_product09_a7ho9v.jpg"
            },
            {
                title: "해외여행",
                desc: "전 세계 어디든 원하는 곳으로 떠나는 프리미엄 패키지",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097134/photo_best02_product01_n3u0hk.jpg"
            },
            {
                title: "골프",
                desc: "국내외 명문 골프장에서 즐기는 여유로운 라운딩",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097148/photo_best02_product02_cwq9zm.jpg"
            },
            {
                title: "교육/어학연수",
                desc: "자녀를 위한 해외 명문 학교 영어 캠프 및 연수 프로그램",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097278/photo_best02_product04_btsohx.jpg"
            },
            {
                title: "리빙",
                desc: "소노시즌 매트리스, 최신 가전, 휴대폰, 이사, 입주청소 등",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097295/photo_best02_product07_lkcnml.jpg"
            },
            {
                title: "명품케어",
                desc: <>글로벌 명품 브랜드 제품<br/>수선/매입/해외명품관 쇼핑</>,
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097313/photo_best02_product10_xkyzcb.jpg"
            },
            {
                title: "쉼케어",
                desc: <>종합심리검사+해석상담 및<br/>장지 시설/안치 장소 안내</>,
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097325/photo_best02_product08_xyqjwk.jpg"
            }
        ]
    },
    membership: {
        title: "대명소노그룹 멤버십",
        items: [
            {
                title: "소노호텔 & 리조트 우대",
                desc: "전국 소노호텔&리조트 객실 우대 가격 이용 (비수기 주중 무기명 우대 요금)",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096482/Generated_Image_January_22_2026_-_5_18PM_gnubfx.jpg"
            },
            {
                title: "레저 시설 할인 혜택",
                desc: "오션월드, 스키월드, 골프, 사우나 등 최대 35% 할인 우대",
                img: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/ba129da43419b13c6e6fe3df92fc852b3f2e6abf/Generated%20Image%20January%2022%2C%202026%20-%203_23PM.jpeg"
            }
        ]
    },
    mall: {
        title: "소노아임레디몰",
        items: [
            {
                title: "매일 기다려지는 특가 상품과 이벤트",
                desc: "타임딜, 릴레이딜부터 룰렛 이벤트까지! 매일 새로운 상품과 이벤트가 쏟아집니다.",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097341/computer_main_bvy4u9.png"
            },
            {
                title: "신규 가입자 5,000원 쿠폰",
                desc: "신규 가입 고객에게만 제공되는 웰컴 할인 혜택으로 필요한 상품을 더 합리적으로 구입하세요.",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097295/photo_best02_product07_lkcnml.jpg"
            },
            {
                title: "레디캐쉬 연계 소비",
                desc: "소노아임레디몰에서 가입한 상품의 레디캐쉬를 활용하여 해약 전에도 쇼핑을 즐겨보세요.",
                img: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097325/photo_best02_product08_xyqjwk.jpg"
            }
        ]
    }
};

export default function DisclosurePage() {
    const [activeTab, setActiveTab] = useState<TabType>("info");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeMenuCategory, setActiveMenuCategory] = useState<MenuCategoryType>("hybrid");

    const images: Record<TabType, { url: string; title: string }> = {
        info: {
            url: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782719911/%EB%A6%AC%EB%89%B4%EC%96%BC_%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%BC%80%EC%96%B4_%EC%A4%91%EC%9A%94%EC%A0%95%EB%B3%B4_%EA%B3%A0%EC%8B%9C%EC%82%AC%ED%95%AD_%EB%B0%8F_%ED%99%98%EA%B8%89%EA%B8%88_%EC%88%98%EC%A0%95%EB%B3%B8__20260623_v7tjz5.jpg",
            title: "중요정보 고시사항"
        },
        care4: {
            url: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782719913/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%BC%80%EC%96%B4_4_%ED%95%B4%EC%95%BD%ED%99%98%EA%B8%89%EA%B8%88_kkktpk.jpg",
            title: "스마트케어 4 해약환급금표"
        },
        care5: {
            url: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1782719912/%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%BC%80%EC%96%B4_5_%ED%95%B4%EC%95%BD%ED%99%98%EA%B8%89%EA%B8%88_afo2dx.jpg",
            title: "스마트케어 5 해약환급금표"
        },
        happy450: {
            url: "https://res.cloudinary.com/dfkntvpmv/image/upload/v1783404917/KakaoTalk_20260707_151457960_mnzyz9.png",
            title: "일반상조(더해피 450one)"
        }
    };

    return (
        <div className="min-h-screen bg-sono-light flex flex-col">
            <Header productType="smartcare" />

            {/* Main Content Area */}
            <main className="flex-grow pt-28 pb-20">
                <div className="max-w-[1000px] mx-auto px-6">
                    {/* Header Title */}
                    <div className="text-center mb-12 animate-fade-in">
                        <span className="badge-primary mb-4 px-5 py-2">PUBLIC DISCLOSURE</span>
                        <h1 className="text-3xl md:text-4xl font-black text-sono-dark tracking-tight mb-4">
                            중요정보 고시사항 및 해약환급금표
                        </h1>
                        <p className="text-gray-500 font-bold max-w-2xl mx-auto break-keep text-sm md:text-base leading-relaxed">
                            할부거래법에 따른 소노아임레디 스마트케어 상품의 중요고시사항 및 해약환급금 기준 테이블입니다. 이미지 클릭 시 확대해서 보실 수 있습니다.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-[24px] border border-gray-100 p-2 shadow-sm flex flex-col md:flex-row gap-1 mb-8 animate-fade-in">
                        {(Object.keys(images) as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 rounded-[18px] text-sm md:text-base font-black transition-all ${
                                    activeTab === tab
                                        ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/10 scale-[1.01]"
                                        : "text-gray-400 hover:text-sono-dark hover:bg-gray-50"
                                }`}
                            >
                                {images[tab].title}
                            </button>
                        ))}
                    </div>

                    {/* Image Viewer Container */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-10 shadow-xl flex flex-col items-center animate-fade-in relative group mb-12">
                        {/* Action buttons */}
                        <div className="w-full flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {images[activeTab].title}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                    크게보기
                                </button>
                                <a
                                    href={images[activeTab].url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-sono-primary/5 hover:bg-sono-primary/10 text-sono-primary rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    원본 창으로
                                </a>
                            </div>
                        </div>

                        {/* Interactive Image Frame */}
                        <div 
                            onClick={() => setIsLightboxOpen(true)}
                            className="w-full border border-gray-100 rounded-2xl overflow-hidden cursor-zoom-in relative group max-h-[800px] flex justify-center bg-gray-50/50"
                        >
                            <img
                                src={images[activeTab].url}
                                alt={images[activeTab].title}
                                className="max-w-full h-auto object-contain transition-all duration-500 group-hover:scale-[1.01]"
                            />
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-sono-dark/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sono-dark font-black text-sm">
                                    <svg className="w-5 h-5 text-sono-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                    클릭하여 확대보기
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 서비스 메뉴 섹션 */}
                    <div className="mt-20 md:mt-32 border-t border-gray-100 pt-16 animate-fade-in">
                        <div className="text-center mb-12">
                            <span className="badge-primary mb-4 px-5 py-2">SERVICES</span>
                            <h2 className="text-3xl md:text-4xl font-black text-sono-dark tracking-tight mb-4">
                                소노아임레디 회원 특별 서비스
                            </h2>
                            <p className="text-gray-500 font-bold max-w-2xl mx-auto break-keep text-sm md:text-base leading-relaxed">
                                가입과 동시에 누릴 수 있는 전환(하이브리드) 서비스와 멤버십, 전용몰 쇼핑까지 차원이 다른 혜택을 확인해 보세요.
                            </p>
                        </div>

                        {/* 서비스 카테고리 탭 네비게이션 */}
                        <div className="flex bg-[#f2f4f6] rounded-[24px] p-2 gap-1 mb-10 max-w-[700px] mx-auto">
                            {(Object.keys(menuData) as MenuCategoryType[]).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveMenuCategory(category)}
                                    className={`flex-1 py-3 px-4 rounded-[18px] text-sm md:text-base font-black transition-all ${
                                        activeMenuCategory === category
                                            ? "bg-white text-sono-primary shadow-md scale-[1.01]"
                                            : "text-gray-500 hover:text-sono-dark hover:bg-white/50"
                                    }`}
                                >
                                    {menuData[category].title}
                                </button>
                            ))}
                        </div>

                        {/* 카테고리별 아이템 리스트 그리드 */}
                        <div className={`grid gap-6 md:gap-8 justify-center ${
                            activeMenuCategory === "membership"
                                ? "grid-cols-1 md:grid-cols-2 max-w-[800px] mx-auto"
                                : activeMenuCategory === "mall"
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[1000px] mx-auto"
                                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                        }`}>
                            {menuData[activeMenuCategory].items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="group bg-white rounded-[24px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-row sm:flex-col shadow-sm"
                                >
                                    <div className="relative w-24 sm:w-full h-auto sm:h-48 md:h-56 overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-4 sm:p-6 md:p-8 text-left sm:text-center flex-1 flex flex-col justify-center">
                                        <h3 className="font-black text-sono-dark text-base sm:text-lg md:text-xl mb-1 sm:mb-3 tracking-tight group-hover:text-sono-primary transition-colors leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-[#8b95a1] text-xs sm:text-sm font-bold leading-relaxed break-keep">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Lightbox / Modal Modal Overlay */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-[9999] bg-sono-dark/95 backdrop-blur-md flex flex-col justify-center items-center p-4 md:p-8 animate-fade-in"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    {/* Header within Lightbox */}
                    <div className="absolute top-4 left-6 right-6 flex justify-between items-center text-white z-10">
                        <span className="font-black text-base md:text-lg">{images[activeTab].title}</span>
                        <button 
                            onClick={() => setIsLightboxOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Zoomable Image Container */}
                    <div 
                        className="max-w-full max-h-full overflow-auto flex justify-center items-start p-4 cursor-zoom-out"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[activeTab].url}
                            alt={images[activeTab].title}
                            className="max-h-[90vh] w-auto object-contain rounded-lg shadow-2xl"
                            onClick={() => setIsLightboxOpen(false)}
                        />
                    </div>

                    {/* Bottom Help Text */}
                    <p className="absolute bottom-4 text-xs text-white/50 font-bold">
                        여백을 클릭하거나 우측 상단 닫기 단추를 누르면 돌아갑니다.
                    </p>
                </div>
            )}

            <Footer productType="smartcare" />
        </div>
    );
}
