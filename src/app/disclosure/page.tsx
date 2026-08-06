"use client";

import React, { useState } from "react";
import { Header, Footer } from "@/components/layout";

type TabType = "info" | "care4" | "care5" | "happy450";

export default function DisclosurePage() {
    const [activeTab, setActiveTab] = useState<TabType>("info");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
            <Header productType="smartcare" forceWhiteBg={true} />

            {/* Main Content Area */}
            <main className="flex-grow pt-28 pb-20">
                <div className="max-w-[1000px] mx-auto px-6">
                    {/* Header Title */}
                    <div className="text-center mb-12 animate-fade-in">
                        <span className="badge-primary mb-4 px-5 py-2 !rounded-none">PUBLIC DISCLOSURE</span>
                        <h1 className="text-3xl md:text-4xl font-black text-sono-dark tracking-tight mb-4">
                            중요정보 고시사항 및 해약환급금표
                        </h1>
                        <p className="text-gray-500 font-bold max-w-2xl mx-auto break-keep text-sm md:text-base leading-relaxed">
                            할부거래법에 따른 소노아임레디 스마트케어 상품의 중요고시사항 및 해약환급금 기준 테이블입니다. 이미지 클릭 시 확대해서 보실 수 있습니다.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-none border border-gray-100 p-2 shadow-sm flex flex-col md:flex-row gap-1 mb-8 animate-fade-in">
                        {(Object.keys(images) as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 rounded-none text-sm md:text-base font-black transition-all ${
                                    activeTab === tab
                                        ? "bg-blue-800 text-white shadow-lg shadow-blue-800/10 scale-[1.01]"
                                        : "text-gray-400 hover:text-sono-dark hover:bg-gray-50"
                                }`}
                            >
                                {images[tab].title}
                            </button>
                        ))}
                    </div>

                    {/* Image Viewer Container */}
                    <div className="bg-white rounded-none border border-gray-100 p-6 md:p-10 shadow-xl flex flex-col items-center animate-fade-in relative group">
                        {/* Action buttons */}
                        <div className="w-full flex justify-between items-center mb-6">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {images[activeTab].title}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsLightboxOpen(true)}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-none text-xs font-black transition-all flex items-center gap-1.5"
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
                                    className="px-4 py-2 bg-sono-primary/5 hover:bg-sono-primary/10 text-sono-primary rounded-none text-xs font-black transition-all flex items-center gap-1.5"
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
                            className="w-full border border-gray-100 rounded-none overflow-hidden cursor-zoom-in relative group max-h-[800px] flex justify-center bg-gray-50/50"
                        >
                            <img
                                src={images[activeTab].url}
                                alt={images[activeTab].title}
                                className="max-w-full h-auto object-contain transition-all duration-500 group-hover:scale-[1.01]"
                            />
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-sono-dark/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="bg-white/95 backdrop-blur-sm px-5 py-3 rounded-none shadow-xl flex items-center gap-2 text-sono-dark font-black text-sm">
                                    <svg className="w-5 h-5 text-sono-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                    </svg>
                                    클릭하여 확대보기
                                </div>
                            </div>
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
                        className="w-full h-[calc(100%-80px)] mt-16 overflow-auto p-4 cursor-zoom-out flex justify-center items-start"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[activeTab].url}
                            alt={images[activeTab].title}
                            className="min-w-[800px] md:min-w-[1400px] max-w-[1600px] w-full h-auto object-contain rounded-none shadow-2xl"
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
