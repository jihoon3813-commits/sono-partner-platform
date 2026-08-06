import React from "react";

interface ImportantNoticeProps {
    className?: string;
}

export default function ImportantNotice({ className = "" }: ImportantNoticeProps) {
    return (
        <section className={`py-16 md:py-24 bg-[#f8fafc] border-t border-slate-200/60 ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Title */}
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                        중요정보 고지사항
                    </h2>
                </div>

                {/* 2x2 Grid Panels (Attachment 1 Style - Sharp Rectangular Panels) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Panel 1: 환급기준 및 환급시기 */}
                    <div className="bg-[#f0f4f9] border border-slate-200/70 p-6 sm:p-8 rounded-none flex flex-col justify-between shadow-xs">
                        <div>
                            <h3 className="text-[#2563eb] text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#2563eb] text-xs">■</span>
                                <span>환급기준 및 환급시기</span>
                            </h3>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 font-bold shrink-0">.</span>
                                    <span>중도해약에 대한 환급 기준은 상조서비스 약관 규정에 의해 공정하게 환급됩니다.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 font-bold shrink-0">.</span>
                                    <span>환급금은 해약 신청서 완료일로부터 3영업일 이내에 수령하실 수 있습니다.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Panel 2: 총 고객환급의무액 및 자산 현황 */}
                    <div className="bg-[#f0f4f9] border border-slate-200/70 p-6 sm:p-8 rounded-none flex flex-col justify-between shadow-xs">
                        <div>
                            <h3 className="text-[#2563eb] text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#2563eb] text-xs">■</span>
                                <span>총 고객환급의무액 및 자산 현황</span>
                            </h3>

                            {/* Inner White Stat Box */}
                            <div className="bg-white border border-slate-200/80 rounded-none p-4 sm:p-5 shadow-xs mb-3">
                                <div className="grid grid-cols-2 divide-x divide-slate-100">
                                    <div className="pr-3 sm:pr-4">
                                        <p className="text-[11px] sm:text-xs font-bold text-slate-500 mb-1">총 고객환급의무액</p>
                                        <p className="text-sm sm:text-lg font-black text-[#2563eb] tracking-tight">1,129,868,124천원</p>
                                    </div>
                                    <div className="pl-3 sm:pl-4">
                                        <p className="text-[11px] sm:text-xs font-bold text-slate-500 mb-1">상조 관련 자산</p>
                                        <p className="text-sm sm:text-lg font-black text-[#2563eb] tracking-tight">1,230,275,029천원</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-normal">
                                (주)소소스테이션은 성지회계법인의 공인회계사를 통해 외부 회계감사를 받고 있습니다.
                            </p>
                        </div>
                    </div>

                    {/* Panel 3: 고객 불입금 관리방법 */}
                    <div className="bg-[#f0f4f9] border border-slate-200/70 p-6 sm:p-8 rounded-none flex flex-col justify-between shadow-xs">
                        <div>
                            <h3 className="text-[#2563eb] text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#2563eb] text-xs">■</span>
                                <span>고객 불입금 관리방법</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                [할부거래에 관한 법률] 제18조에 의거 선불식 할부거래업 등록을 완료하였으며, 동법 제27조에 따라 고객 불입금의 50%는 상조보증공제조합과의 소비자피해보상 공제계약을 통해 안전하게 보관됩니다.
                            </p>
                        </div>
                    </div>

                    {/* Panel 4: 소비자 유의사항 */}
                    <div className="bg-[#f0f4f9] border border-slate-200/70 p-6 sm:p-8 rounded-none flex flex-col justify-between shadow-xs">
                        <div>
                            <h3 className="text-[#2563eb] text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#2563eb] text-xs">■</span>
                                <span>소비자 유의사항</span>
                            </h3>
                            <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 font-bold shrink-0">.</span>
                                    <span>장의차량 운행 시 발생되는 도로 통행료 및 주차비 등은 고객 부담입니다.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 font-bold shrink-0">.</span>
                                    <span>장례식장 임대료 및 접객용 음식료 등은 상품 기본 구성에서 제외됩니다.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-slate-400 font-bold shrink-0">.</span>
                                    <span>회비 납입 도중 행사 발생 시, 할인 전까지 잔여 회비를 일시납 하셔야 합니다.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
