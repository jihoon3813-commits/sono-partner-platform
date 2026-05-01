"use client";

import { useState, useMemo, useEffect } from "react";
import { faqData } from "@/data/faqData";

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeLargeCat, setActiveLargeCat] = useState<string>("");
    const [activeMediumCat, setActiveMediumCat] = useState<string>("전체");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Initialize activeLargeCat
    useEffect(() => {
        if (faqData.length > 0 && !activeLargeCat) {
            setActiveLargeCat(faqData[0].largeCategory);
        }
    }, [activeLargeCat]);

    const largeCategories = useMemo(() => {
        return Array.from(new Set(faqData.map(item => item.largeCategory))).filter(Boolean);
    }, []);

    const mediumCategories = useMemo(() => {
        const categories = faqData
            .filter(item => item.largeCategory === activeLargeCat)
            .map(item => item.mediumCategory)
            .filter(Boolean);
        const unique = Array.from(new Set(categories));
        return unique.length > 0 ? ["전체", ...unique] : ["전체"];
    }, [activeLargeCat]);

    const filteredData = useMemo(() => {
        return faqData.filter(item => {
            const matchesSearch = searchQuery === "" || 
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (searchQuery !== "") return matchesSearch;

            const matchesLarge = item.largeCategory === activeLargeCat;
            const matchesMedium = activeMediumCat === "전체" || item.mediumCategory === activeMediumCat;
            
            return matchesLarge && matchesMedium;
        });
    }, [searchQuery, activeLargeCat, activeMediumCat]);

    if (!isOpen) return null;

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
            <div 
                className="absolute inset-0 bg-sono-dark/60 backdrop-blur-sm animate-fade-in" 
                onClick={onClose}
            />
            
            <div className="relative w-full max-w-5xl bg-white rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[800px] animate-slide-up">
                
                {/* 사이드바 (대분류) - 데스크탑 */}
                <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-100 p-8">
                    <h2 className="text-xl font-black text-sono-dark mb-8">FAQ 카테고리</h2>
                    <div className="space-y-2 overflow-y-auto no-scrollbar pb-10">
                        {largeCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveLargeCat(cat);
                                    setActiveMediumCat("전체");
                                    setSearchQuery("");
                                    setOpenIndex(null);
                                }}
                                className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                                    activeLargeCat === cat && searchQuery === ""
                                    ? "bg-white text-sono-primary shadow-sm ring-1 ring-gray-100" 
                                    : "text-[#8b95a1] hover:text-sono-dark hover:bg-white/50"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 메인 콘텐츠 영역 */}
                <div className="flex-grow flex flex-col min-w-0 bg-white overflow-hidden">
                    {/* 상단 검색 및 헤더 */}
                    <div className="p-6 md:p-8 border-b border-gray-100 shrink-0">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-sono-dark tracking-tight">자주하는 질문</h2>
                                <p className="text-[#8b95a1] font-bold text-[11px] md:text-sm mt-1">궁금하신 내용을 검색하거나 카테고리를 선택해 보세요.</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 text-[#8b95a1] flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* 검색바 */}
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="질문이나 답변 키워드를 입력하세요"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl md:rounded-2xl px-6 py-3.5 md:py-4 pl-12 md:pl-14 text-sm md:text-base text-sono-dark font-bold placeholder:text-[#8b95a1] focus:ring-2 focus:ring-sono-primary transition-all"
                            />
                            <svg className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#8b95a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* 대분류 스크롤 (모바일 전용) */}
                    <div className="md:hidden flex overflow-x-auto no-scrollbar bg-gray-50 px-4 py-3 border-b border-gray-100 shrink-0">
                        {largeCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveLargeCat(cat);
                                    setActiveMediumCat("전체");
                                    setSearchQuery("");
                                    setOpenIndex(null);
                                }}
                                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-black mr-2 transition-all ${
                                    activeLargeCat === cat && searchQuery === ""
                                    ? "bg-sono-primary text-white shadow-md shadow-sono-primary/20" 
                                    : "bg-white text-[#8b95a1] border border-gray-100"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* 중분류 탭 */}
                    {searchQuery === "" && mediumCategories.length > 1 && (
                        <div className="flex overflow-x-auto no-scrollbar px-6 md:px-8 py-3 md:py-4 gap-2 border-b border-gray-50 shrink-0">
                            {mediumCategories.map((mCat) => (
                                <button
                                    key={mCat}
                                    onClick={() => {
                                        setActiveMediumCat(mCat);
                                        setOpenIndex(null);
                                    }}
                                    className={`whitespace-nowrap px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all ${
                                        activeMediumCat === mCat
                                        ? "bg-sono-dark text-white shadow-md shadow-sono-dark/20" 
                                        : "bg-white text-[#8b95a1] border border-gray-100 hover:border-sono-primary/30"
                                    }`}
                                >
                                    {mCat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* 리스트 영역 */}
                    <div className="flex-grow overflow-y-auto p-4 md:p-10 pt-4 no-scrollbar">
                        <div className="space-y-3 md:space-y-4">
                            {filteredData.length > 0 ? (
                                filteredData.map((item, idx) => {
                                    const isOpen = openIndex === idx;
                                    return (
                                        <div 
                                            key={idx}
                                            className={`group border rounded-xl md:rounded-2xl transition-all duration-300 ${
                                                isOpen ? "border-sono-primary bg-sono-primary/[0.02] shadow-sm" : "border-gray-100 hover:border-gray-200"
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleAccordion(idx)}
                                                className="w-full flex items-center justify-between p-4 md:p-6 text-left"
                                            >
                                                <div className="flex items-start gap-3 md:gap-4">
                                                    <span className={`text-base md:text-lg font-black mt-0.5 ${isOpen ? "text-sono-primary" : "text-[#8b95a1]"}`}>Q.</span>
                                                    <div className="flex flex-col gap-0.5 md:gap-1">
                                                        <span className="text-[9px] md:text-[10px] font-black text-sono-primary/60 uppercase tracking-wider">
                                                            {item.largeCategory} {item.mediumCategory && `· ${item.mediumCategory}`}
                                                        </span>
                                                        <span className={`text-sm md:text-base font-bold leading-snug break-keep ${isOpen ? "text-sono-dark" : "text-[#4e5968] group-hover:text-sono-dark"}`}>
                                                            {item.question}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`shrink-0 ml-2 md:ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-sono-primary" : "text-[#8b95a1]"}`}>
                                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </button>
                                            
                                            {isOpen && (
                                                <div className="px-4 md:px-6 pb-5 md:pb-6 animate-fade-in">
                                                    <div className="flex items-start gap-3 md:gap-4 pt-4 border-t border-sono-primary/10">
                                                        <span className="text-base md:text-lg font-black text-sono-gold mt-0.5">A.</span>
                                                        <div className="text-xs md:text-sm text-[#6b7684] font-medium leading-relaxed break-keep whitespace-pre-wrap">
                                                            {item.answer}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-16 md:py-20 text-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 md:w-8 md:h-8 text-[#8b95a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-[#8b95a1] font-bold text-sm md:text-base">검색 결과가 없습니다.</p>
                                    <p className="text-[#8b95a1] text-[10px] md:text-xs mt-1">다른 검색어를 입력해 보세요.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 푸터 (하단 고정) */}
                    <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                        <p className="text-[#8b95a1] text-[11px] md:text-[13px] font-bold">
                            찾으시는 내용이 없으신가요? 
                            <span className="text-sono-primary ml-2">고객센터(1588-8511)</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
