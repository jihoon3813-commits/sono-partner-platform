"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
    partnerMode?: boolean;
    productType?: 'happy450' | 'smartcare';
}

export default function Footer({ partnerMode = false, productType }: FooterProps) {
    const pathname = usePathname();

    // 본사 어드민(/admin) 및 파트너 어드민(/partner-center) 관련 모든 페이지에서는 푸터 안 보이게 처리
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/partner-center")) {
        return null;
    }

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-slate-600">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                
                {/* Upper Footer: Brand Info & Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
                    
                    {/* Brand Info (5 cols) */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-900 font-extrabold text-lg tracking-tight">(주)라이프앤조이</span>
                            <span className="text-slate-300">|</span>
                            <img
                                src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781097378/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90_BI_%EA%B0%80%EB%A1%9CA_dohxox.png"
                                alt="소노아임레디 공식총판"
                                className="h-6 w-auto object-contain"
                            />
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed space-y-1.5 pt-1">
                            <p>경기도 하남시 미사대로 510, 624호(아이에스비즈타워) <span className="mx-1.5 text-slate-300">|</span> 사업자등록번호 : 388-86-02921</p>
                            <p>E-mail : lifenjoy0296@gmail.com <span className="mx-1.5 text-slate-300">|</span> 개인정보보호책임자 : 이지건(lifenjoy0108@gmail.co.kr)</p>
                        </div>
                    </div>

                    {/* Navigation 1: 서비스 (2 cols) */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-slate-900 text-sm mb-4">서비스</h4>
                        <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                            <li><Link href="/products/happy450" className="hover:text-sono-primary transition-colors">상품 안내</Link></li>
                            <li><Link href="/partner/apply" className="hover:text-sono-primary transition-colors">제휴 프로세스</Link></li>
                        </ul>
                    </div>

                    {/* Navigation 2: 비즈니스 (2 cols) */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-slate-900 text-sm mb-4">비즈니스</h4>
                        <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                            <li><Link href="/partner/apply" className="hover:text-sono-primary transition-colors">파트너 신청</Link></li>
                            <li><Link href="/partner-center" className="hover:text-sono-primary transition-colors">파트너 센터</Link></li>
                            <li>
                                <Link 
                                    href="/disclosure" 
                                    className="hover:text-sono-primary transition-colors inline-flex items-center gap-1"
                                >
                                    <span>중요 고시 & 환급금표</span>
                                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CS Box: 고객지원 (3 cols) */}
                    <div className="md:col-span-3">
                        {!partnerMode && (
                            <div className="p-5 bg-slate-50 border border-slate-100 rounded-none">
                                <p className="text-[11px] font-bold text-slate-500 mb-1">파트너 제휴 문의</p>
                                <p className="text-2xl font-black text-sono-primary tracking-tight mb-1">1588-0883</p>
                                <p className="text-[11px] text-slate-400 font-normal">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Notice Box: 필수 안내사항 */}
                <div className="py-8 border-b border-slate-100 text-[11px] text-slate-400 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-600 mb-1.5">[필수 안내사항]</p>
                    <p>① 본 상품은 상조 상품이며, 계약체결 시 계약서 및 가입 녹취 내용 미인지에 따른 손실은 계약자 등에게 귀속됩니다.</p>
                    <p>② 가입 상품에 따라 혜택 및 서비스 보장 종류 등 차등이 있을 수 있습니다.</p>
                    <p>③ 본 광고는 비즈이노의 심의기준을 준수하였으며, 유효기간은 심의일로부터 1년입니다. (내용 변경 없을 시, 자동 연장)</p>
                    <p className="pt-0.5 text-slate-500 font-medium">※ 광고 심의번호: 202603-라이프앤조이-001</p>
                </div>

                {/* Bottom Footer: Copyright & Legal Links */}
                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <p className="font-normal">COPYRIGHT © SINCE 2025 LIFE&JOY CO., LTD. ALL RIGHTS RESERVED.</p>
                    <div className="flex items-center gap-6">
                        {productType === 'happy450' && (
                            <Link href="/lecture/happy450" target="_blank" rel="noopener noreferrer" className="font-bold text-sono-primary hover:underline">강의안 바로가기</Link>
                        )}
                        {productType === 'smartcare' && (
                            <Link href="/lecture/smartcare" target="_blank" rel="noopener noreferrer" className="font-bold text-sono-primary hover:underline">강의안 바로가기</Link>
                        )}
                        <Link href="/privacy" className="hover:text-slate-600 font-medium transition-colors">개인정보처리방침</Link>
                        <span className="text-slate-200">|</span>
                        <Link href="/terms" className="hover:text-slate-600 font-medium transition-colors">이용약관</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
