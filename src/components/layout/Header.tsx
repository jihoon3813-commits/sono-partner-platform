"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import InquiryModal from "@/components/InquiryModal";

interface HeaderProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    partnerLogo?: string;
}

export default function Header({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    partnerLogo = ""
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 파트너 모드일 때 로고 클릭 시 이동할 URL
    const logoHref = partnerMode && partnerUrl ? `/p/${partnerUrl}` : "/";

    // 상품 페이지 경로
    const happy450Href = partnerMode && partnerUrl ? `/p/${partnerUrl}/products/happy450` : "/products/happy450";
    const smartcareHref = partnerMode && partnerUrl ? `/p/${partnerUrl}/products/smartcare` : "/products/smartcare";

    const handleInquiryClick = () => {
        setIsMenuOpen(false);
        setIsModalOpen(true);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"} border-b ${scrolled ? "border-gray-100/50" : "border-transparent"}`}>
                <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
                    {/* 로고 */}
                    <Link href={logoHref} className="flex items-center group">
                        {partnerMode && partnerLogo ? (
                            <img
                                src={partnerLogo}
                                alt={partnerName || "Partner Logo"}
                                className="h-8 md:h-[34px] w-auto object-contain transition-all duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <img
                                src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94%20BI_3.png?raw=true"
                                alt="SONO I'M READY"
                                className={`h-7 md:h-[34px] w-auto object-contain transition-all duration-300 group-hover:scale-105 ${!scrolled ? "brightness-0 invert" : ""}`}
                            />
                        )}
                    </Link>

                    {/* 데스크탑 메뉴 */}
                    <nav className="hidden md:flex items-center gap-10 relative z-10">
                        {partnerMode ? (
                            <>
                                <Link href={happy450Href} className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>더 해피 450 ONE</Link>
                                <Link href={smartcareHref} className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>스마트케어</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/" className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>제휴 안내</Link>
                                <Link href="/products/happy450" className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>더 해피 450 ONE</Link>
                                <Link href="/products/smartcare" className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>스마트케어</Link>
                            </>
                        )}
                    </nav>

                    {/* 우측 버튼 */}
                    <div className="hidden md:flex items-center gap-3 relative z-10">
                        {partnerMode ? (
                            <button
                                onClick={handleInquiryClick}
                                className={`${scrolled ? "btn-primary" : "bg-white text-sono-primary hover:bg-gray-100"} px-8 py-2.5 !rounded-2xl text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer`}
                            >
                                가입신청
                            </button>
                        ) : (
                            <>
                                <Link href="/partner-center" target="_blank" className={`${scrolled ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold text-sm px-4 cursor-pointer`}>
                                    파트너센터
                                </Link>
                                <Link
                                    href="/partner/apply"
                                    className={`${scrolled ? "btn-primary" : "bg-white text-sono-primary hover:bg-gray-100"} px-8 py-2.5 !rounded-2xl text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer`}
                                >
                                    제휴신청
                                </Link>
                            </>
                        )}
                    </div>

                    {/* 모바일 메뉴 버튼 */}
                    <button
                        className="md:hidden p-2 rounded-xl transition-colors relative z-10"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className={`w-8 h-8 ${scrolled ? "text-sono-dark" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* 모바일 메뉴 레이어 */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-8 animate-fade-in">
                        <div className="flex flex-col gap-6 font-bold">
                            {partnerMode ? (
                                <>
                                    <Link href={happy450Href} className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>더 해피 450 ONE</Link>
                                    <Link href={smartcareHref} className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>스마트케어</Link>
                                    <button
                                        onClick={handleInquiryClick}
                                        className="btn-primary w-full py-4 text-lg mt-4"
                                    >
                                        가입신청
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>제휴 안내</Link>
                                    <Link href="/products/happy450" className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>더 해피 450 ONE</Link>
                                    <Link href="/products/smartcare" className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>스마트케어</Link>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <Link
                                            href="/partner-center"
                                            target="_blank"
                                            className="btn-outline text-center py-4"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            파트너센터
                                        </Link>
                                        <Link
                                            href="/partner/apply"
                                            className="btn-primary text-center py-4"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            제휴신청
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 상담 신청 모달 */}
            <InquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partnerName={partnerName}
                partnerId={partnerId}
                showProductSelect={true}
            />
        </>
    );
}
