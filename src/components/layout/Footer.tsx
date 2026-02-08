import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-20">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Info */}
                    <div className="md:col-span-4">
                        <div className="flex items-center mb-6">
                            <img
                                src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png?raw=true"
                                alt="SONO I'M READY"
                                className="h-7 w-auto object-contain grayscale opacity-80"
                            />
                        </div>
                        <div className="space-y-1.5 text-xs font-bold text-[#adb5bd]">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sono-dark text-base font-bold">(주)라이프앤조이 |</span>
                                <img
                                    src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA.png?raw=true"
                                    alt="소노아임레디 공식총판"
                                    className="h-5 w-auto object-contain"
                                />
                            </div>
                            <p>경기도 하남시 미사대로 510, 624호(아이에스비즈타워) <span className="mx-2 opacity-30">|</span> 사업자등록번호 : 388-86-02921</p>
                            <p>E-mail : lifenjoy0296@gmail.com <span className="mx-2 opacity-30">|</span> 개인정보보호책임자 : 이지건(lifenjoy0108@gmail.co.kr)</p>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-sono-dark mb-6">서비스</h4>
                        <ul className="space-y-4">
                            <li><Link href="/products/happy450" className="text-sm font-bold text-[#8b95a1] hover:text-sono-primary transition-colors">상품 안내</Link></li>
                            <li><Link href="/partner/apply" className="text-sm font-bold text-[#8b95a1] hover:text-sono-primary transition-colors">제휴 프로세스</Link></li>
                        </ul>
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-sono-dark mb-6">비즈니스</h4>
                        <ul className="space-y-4">
                            <li><Link href="/partner/apply" className="text-sm font-bold text-[#8b95a1] hover:text-sono-primary transition-colors">파트너 신청</Link></li>
                            <li><Link href="/partner-center" className="text-sm font-bold text-[#8b95a1] hover:text-sono-primary transition-colors">파트너 센터</Link></li>
                        </ul>
                    </div>
                    <div className="md:col-span-4">
                        <h4 className="font-bold text-sono-dark mb-6">고객지원</h4>
                        <div className="p-6 bg-[#f9fafb] rounded-[24px]">
                            <p className="text-xs font-bold text-[#8b95a1] mb-2">파트너 제휴 문의</p>
                            <p className="text-2xl font-bold text-sono-primary mb-1">1588-0883</p>
                            <p className="text-xs font-medium text-[#adb5bd]">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-gray-50">
                    <p className="text-xs font-bold text-[#adb5bd]">COPYRIGHT © SINCE 2025 LIFE&JOY CO., LTD. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-xs font-bold text-[#adb5bd] hover:text-[#6b7684]">개인정보처리방침</Link>
                        <Link href="/terms" className="text-xs font-bold text-[#adb5bd] hover:text-[#6b7684]">이용약관</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
