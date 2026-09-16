"use client";

import React from "react";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-sono-light flex flex-col">
            <Header productType="smartcare" forceWhiteBg={true} />

            <main className="flex-grow pt-28 pb-20">
                <div className="max-w-[900px] mx-auto px-6">
                    {/* Header Title */}
                    <div className="text-center mb-12 animate-fade-in">
                        <span className="badge-primary mb-4 px-5 py-2 !rounded-none">PRIVACY POLICY</span>
                        <h1 className="text-3xl md:text-4xl font-black text-sono-dark tracking-tight mb-4">
                            개인정보처리방침
                        </h1>
                        <p className="text-gray-500 font-bold max-w-2xl mx-auto break-keep text-sm md:text-base leading-relaxed">
                            주식회사 라이프앤조이(이하 &apos;회사&apos;)는 이용자의 소중한 개인정보를 보호하고 관련 법령을 준수하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
                        </p>
                    </div>

                    {/* Content Box */}
                    <div className="bg-white p-8 md:p-12 border border-gray-100 shadow-sm space-y-10 text-[#333d4b] text-sm md:text-base leading-relaxed break-keep">
                        
                        {/* 1. 개인정보의 수집 및 이용 목적 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">01.</span> 개인정보의 수집 및 이용 목적
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사는 다음의 목적을 위하여 최소한의 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 관련 법률에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                <li><strong>소노아임레디 제휴 상품 가입 상담 및 접수 안내:</strong> 고객 본인 확인, 상담 신청 접수, 해피콜 및 전문 상담원 유선 안내, 제휴 혜택 제공</li>
                                <li><strong>파트너 제휴 신청 및 관리:</strong> 제휴 파트너 승인 심사, 파트너 관리자 계정 부여 및 정산/실적 관리</li>
                                <li><strong>고객 문의 대응 및 민원 처리:</strong> 사실 확인을 위한 연락·통지, 처리 결과 통보</li>
                            </ul>
                        </section>

                        {/* 2. 수집하는 개인정보 항목 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">02.</span> 수집하는 개인정보의 항목 및 수집 방법
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-gray-200 text-xs md:text-sm">
                                    <thead className="bg-gray-50 text-sono-dark font-bold">
                                        <tr>
                                            <th className="p-3 border border-gray-200">구분</th>
                                            <th className="p-3 border border-gray-200">수집 항목</th>
                                            <th className="p-3 border border-gray-200">수집 목적</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 font-medium text-gray-600">
                                        <tr>
                                            <td className="p-3 border border-gray-200 bg-gray-50/50 font-bold">상품 간편 상담 신청</td>
                                            <td className="p-3 border border-gray-200">성명, 휴대폰번호(연락처), 희망 가입 상품</td>
                                            <td className="p-3 border border-gray-200">전문 상담원 안내 및 가입 상담 진행</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border border-gray-200 bg-gray-50/50 font-bold">제휴 파트너 신청</td>
                                            <td className="p-3 border border-gray-200">회사명(상호), 대표자명, 담당자명, 연락처, 이메일, 사업자등록번호</td>
                                            <td className="p-3 border border-gray-200">파트너십 심사 및 계약 체결, 계정 발급</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 border border-gray-200 bg-gray-50/50 font-bold">서비스 이용 과정 자동 생성</td>
                                            <td className="p-3 border border-gray-200">접속 IP 정보, 쿠키, 방문 일시, 브라우저 종류, 유입 경로(Referrer)</td>
                                            <td className="p-3 border border-gray-200">부정 이용 방지, 통계 분석 및 서비스 품질 개선</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 3. 개인정보의 보유 및 이용 기간 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">03.</span> 개인정보의 보유 및 이용 기간
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                <li><strong>상품 가입 상담 신청 정보:</strong> 동의일로부터 상담 완료 후 최대 30일 또는 목적 달성 시 즉시 파기 (단, 관계 법령에 따라 보존 의무가 있는 경우 해당 법령 기준 준수)</li>
                                <li><strong>제휴 파트너 정보:</strong> 제휴 계약 종료 및 정산 완료 시까지</li>
                                <li><strong>전자상거래 등에서의 소비자보호에 관한 법률 등 관계 법령:</strong>
                                    <ul className="list-[circle] pl-5 mt-1 space-y-0.5 text-xs md:text-sm text-gray-600">
                                        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                                        <li>표시/광고에 관한 기록: 6개월</li>
                                        <li>웹사이트 방문 기록(통신비밀보호법): 3개월</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        {/* 4. 개인정보의 제3자 제공 및 위탁 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">04.</span> 개인정보의 제3자 제공 및 처리위탁
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사는 원활한 상담 진행 및 가입 처리를 위하여 다음과 같이 개인정보 취급 업무를 위탁 또는 제휴사에 제공하고 있습니다.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse border border-gray-200 text-xs md:text-sm">
                                    <thead className="bg-gray-50 text-sono-dark font-bold">
                                        <tr>
                                            <th className="p-3 border border-gray-200">제공/위탁받는 자</th>
                                            <th className="p-3 border border-gray-200">이용 목적</th>
                                            <th className="p-3 border border-gray-200">제공 항목</th>
                                            <th className="p-3 border border-gray-200">보유 기간</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 font-medium text-gray-600">
                                        <tr>
                                            <td className="p-3 border border-gray-200 font-bold">㈜소노스테이션 (소노아임레디)</td>
                                            <td className="p-3 border border-gray-200">상조 및 제휴 결합 상품 가입 심사, 해피콜 상담, 계약 체결</td>
                                            <td className="p-3 border border-gray-200">성명, 연락처, 상담 희망 상품</td>
                                            <td className="p-3 border border-gray-200">가입 상담 완료 및 관련 법령에 따른 보존기간까지</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* 5. 정보주체의 권리 및 행사방법 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">05.</span> 정보주체 및 법정대리인의 권리와 행사방법
                            </h2>
                            <p className="text-gray-600 font-medium">
                                이용자는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다. 권리 행사는 회사 대표번호 또는 이메일을 통하여 요청하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
                            </p>
                        </section>

                        {/* 6. 개인정보의 파기절차 및 방법 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">06.</span> 개인정보의 파기절차 및 파기방법
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                <li><strong>전자적 파일 형태:</strong> 기록을 재생할 수 없는 기술적 방법을 사용하여 안전하게 영구 삭제</li>
                                <li><strong>출력물 등 종이 문서:</strong> 분쇄기로 분쇄하거나 소각하여 파기</li>
                            </ul>
                        </section>

                        {/* 7. 개인정보 보호책임자 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">07.</span> 개인정보 보호책임자 및 담당 부서
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                            </p>
                            <div className="bg-gray-50 p-5 rounded-none border border-gray-200 text-xs md:text-sm space-y-2">
                                <p><strong>상호명:</strong> 주식회사 라이프앤조이</p>
                                <p><strong>개인정보 보호책임자:</strong> 이지건</p>
                                <p><strong>연락처:</strong> 02-2088-2965</p>
                                <p><strong>이메일:</strong> lifenjoy0108@gmail.co.kr (대표: lifenjoy0296@gmail.com)</p>
                                <p><strong>주소:</strong> 경기도 성남시 분당구 판교역로 192번길 16, 8층 806호 (삼평동, 판교타워)</p>
                            </div>
                        </section>

                        {/* 8. 고지의 의무 */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">08.</span> 개인정보처리방침의 변경
                            </h2>
                            <p className="text-gray-600 font-medium">
                                본 개인정보처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 웹사이트 공지사항을 통하여 지체 없이 고지할 것입니다.
                            </p>
                        </section>

                        {/* Buttons */}
                        <div className="pt-6 border-t border-gray-100 flex justify-center gap-4">
                            <Link
                                href="/"
                                className="px-8 py-3 bg-sono-dark text-white font-bold text-sm hover:bg-slate-800 transition-all"
                            >
                                메인으로 돌아가기
                            </Link>
                            <Link
                                href="/terms"
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                이용약관 보기
                            </Link>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
