"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import InquiryModal from "@/components/InquiryModal";
import FAQModal from "@/components/FAQModal";

interface HeaderProps {
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    partnerLogo?: string;
    productType?: string;
    isPremiumMallMode?: boolean;
    forceWhiteBg?: boolean;
}

export default function Header({
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    partnerLogo = "",
    productType = "",
    isPremiumMallMode = false,
    forceWhiteBg = false
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 파트너 모드일 때 로고 클릭 시 해당 상품 페이지로 이동 (본사 페이지는 기존 대로 "/" 유지)
    let logoHref = "/";
    if (partnerMode && partnerUrl) {
        if (productType === "happy450") {
            logoHref = `/${partnerUrl}/happy450`;
        } else if (productType === "smartcare") {
            logoHref = `/${partnerUrl}/smartcare`;
        } else {
            logoHref = `/${partnerUrl}/smartcare`;
        }
    }

    // 파트너 상품 메뉴 페이지 경로 (/p/ 가 제거된 파트너 URL 체계)
    const happy450Href = partnerMode && partnerUrl ? `/${partnerUrl}/happy450` : "/products/happy450";
    const smartcareHref = partnerMode && partnerUrl ? `/${partnerUrl}/smartcare` : "/products/smartcare";

    const handleRestrictedProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        alert("일반 상품은 인증 제휴사 전용 상품입니다.(별도문의)");
    };

    const handleInquiryClick = () => {
        setIsMenuOpen(false);
        setIsModalOpen(true);
    };

    const handleFaqClick = () => {
        setIsMenuOpen(false);
        setIsFaqModalOpen(true);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${(scrolled || forceWhiteBg) ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"} border-b ${(scrolled || forceWhiteBg) ? "border-gray-100/50" : "border-transparent"}`}>
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
                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781096692/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90_BI_%EA%B0%80%EB%A1%9CA_ouqjzl.png"
                                alt="SONO I'M READY"
                                className={`h-7 md:h-[34px] w-auto object-contain transition-all duration-300 group-hover:scale-105 ${(scrolled || forceWhiteBg) ? "brightness-0" : "brightness-0 invert"}`}
                            />
                        )}
                    </Link>

                    {/* 데스크탑 메뉴 */}
                    <nav className="hidden md:flex items-center gap-10 relative z-10">
                        {partnerMode ? (
                            <>
                                <Link href={happy450Href} className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>더 해피 450 ONE</Link>
                                <Link href={smartcareHref} className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>스마트케어</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/" className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>제휴 안내</Link>
                                <Link href="/products/happy450" onClick={handleRestrictedProductClick} className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>더 해피 450 ONE</Link>
                                <Link href="/products/smartcare" className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold transition-colors cursor-pointer`}>스마트케어</Link>
                            </>
                        )}
                    </nav>

                    {/* 우측 버튼 */}
                    <div className="hidden md:flex items-center gap-3 relative z-10">
                        {/* 자주하는질문 버튼 */}
                        <button
                            onClick={handleFaqClick}
                            className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80"} font-bold text-sm px-4 transition-colors cursor-pointer`}
                        >
                            자주하는질문
                        </button>

                        {partnerMode ? (
                            <button
                                onClick={handleInquiryClick}
                                className={`${(scrolled || forceWhiteBg) ? "bg-sono-dark text-white hover:bg-slate-800" : "bg-white text-sono-dark hover:bg-gray-100"} px-8 py-2.5 !rounded-none text-sm font-black transition-all duration-200 shadow-sm cursor-pointer`}
                            >
                                {isPremiumMallMode ? "프리미엄몰 접수" : "가입신청"}
                            </button>
                        ) : (
                            <>
                                <Link href="/partner-center" target="_blank" className={`${(scrolled || forceWhiteBg) ? "text-[#4e5968] hover:text-sono-primary" : "text-white hover:text-white/80 text-shadow-sm"} font-bold text-sm px-4 cursor-pointer`}>
                                    파트너센터
                                </Link>
                                <Link
                                    href="/partner/apply"
                                    className={`${(scrolled || forceWhiteBg) ? "bg-sono-dark text-white hover:bg-slate-800" : "bg-white text-sono-dark hover:bg-gray-100"} px-8 py-2.5 !rounded-none text-sm font-black transition-all duration-200 shadow-sm cursor-pointer`}
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
                        <svg className={`w-8 h-8 ${(scrolled || forceWhiteBg) ? "text-sono-dark" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <button
                                onClick={handleFaqClick}
                                className="text-xl text-sono-dark text-left"
                            >
                                자주하는질문
                            </button>
                            {partnerMode ? (
                                <>
                                    <Link href={happy450Href} onClick={() => setIsMenuOpen(false)} className="text-xl text-sono-dark text-left" >더 해피 450 ONE</Link>
                                    <Link href={smartcareHref} className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>스마트케어</Link>
                                    <button
                                        onClick={handleInquiryClick}
                                        className="btn-primary w-full py-4 text-lg mt-4 !rounded-none"
                                    >
                                        {isPremiumMallMode ? "프리미엄몰 접수" : "가입신청"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>제휴 안내</Link>
                                    <Link href="/products/happy450" className="text-xl text-sono-dark text-left" onClick={(e) => { setIsMenuOpen(false); handleRestrictedProductClick(e); }}>더 해피 450 ONE</Link>
                                    <Link href="/products/smartcare" className="text-xl text-sono-dark" onClick={() => setIsMenuOpen(false)}>스마트케어</Link>
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <Link
                                            href="/partner-center"
                                            target="_blank"
                                            className="btn-outline text-center py-4 !rounded-none"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            파트너센터
                                        </Link>
                                        <Link
                                            href="/partner/apply"
                                            className="btn-primary text-center py-4 !rounded-none"
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
                productType={productType}
                showProductSelect={!productType}
                isPremiumMallMode={isPremiumMallMode}
            />

            {/* FAQ 모달 */}
            <FAQModal
                isOpen={isFaqModalOpen}
                onClose={() => setIsFaqModalOpen(false)}
            />
        </>
    );
}
