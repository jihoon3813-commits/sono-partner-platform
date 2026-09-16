"use client";

import React from "react";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-sono-light flex flex-col">
            <Header productType="smartcare" forceWhiteBg={true} />

            <main className="flex-grow pt-28 pb-20">
                <div className="max-w-[900px] mx-auto px-6">
                    {/* Header Title */}
                    <div className="text-center mb-12 animate-fade-in">
                        <span className="badge-primary mb-4 px-5 py-2 !rounded-none">TERMS OF SERVICE</span>
                        <h1 className="text-3xl md:text-4xl font-black text-sono-dark tracking-tight mb-4">
                            서비스 이용약관
                        </h1>
                        <p className="text-gray-500 font-bold max-w-2xl mx-auto break-keep text-sm md:text-base leading-relaxed">
                            주식회사 라이프앤조이(이하 &apos;회사&apos;)가 운영하는 소노 파트너 플랫폼 서비스 이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정합니다.
                        </p>
                    </div>

                    {/* Content Box */}
                    <div className="bg-white p-8 md:p-12 border border-gray-100 shadow-sm space-y-10 text-[#333d4b] text-sm md:text-base leading-relaxed break-keep">
                        
                        {/* 제1조 (목적) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제1조</span> (목적)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                본 약관은 주식회사 라이프앤조이(이하 &apos;회사&apos;)가 제공하는 소노아임레디 제휴 파트너 플랫폼 및 관련 제반 서비스(이하 &apos;서비스&apos;)의 이용과 관련하여 회사와 이용자(고객 및 파트너) 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                            </p>
                        </section>

                        {/* 제2조 (용어의 정의) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제2조</span> (용어의 정의)
                            </h2>
                            <ul className="list-disc pl-5 space-y-1.5 text-gray-700 font-medium">
                                <li><strong>&apos;플랫폼&apos;</strong>이란 회사가 소노아임레디(㈜소노스테이션)의 상품 정보 안내, 상담 접수, 파트너 관리 등을 위해 제공하는 웹사이트 및 시스템을 의미합니다.</li>
                                <li><strong>&apos;이용자&apos;</strong>란 본 플랫폼에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 이용하는 고객 및 파트너를 의미합니다.</li>
                                <li><strong>&apos;고객&apos;</strong>이란 플랫폼을 통해 소노아임레디 제휴 상품의 정보를 확인하고 상담 및 가입 신청을 접수하는 개인 또는 법인을 말합니다.</li>
                                <li><strong>&apos;파트너&apos;</strong>란 회사와 제휴를 맺고 고유 링크 또는 홍보 채널을 통해 상품 홍보 및 상담 연계를 진행하는 제휴사 또는 개인사업자를 말합니다.</li>
                            </ul>
                        </section>

                        {/* 제3조 (약관의 효력 및 변경) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제3조</span> (약관의 효력 및 변경)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                ① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.<br />
                                ② 회사는 약관의 규제에 관한 법률, 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.<br />
                                ③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 적용일 전일까지 공지합니다.
                            </p>
                        </section>

                        {/* 제4조 (서비스의 제공 및 변경) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제4조</span> (서비스의 제공 및 내용)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                회사가 제공하는 서비스는 다음과 같습니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                <li>소노아임레디 상조 및 제휴 결합 상품(스마트케어, 더해피450 ONE 등)의 상세 정보 및 중요 고시사항 안내</li>
                                <li>상품 가입 희망 고객을 위한 간편 상담 접수 및 전문 상담원(해피콜) 연결 중개</li>
                                <li>제휴 파트너 전용 페이지 발급 및 실적/정산 대시보드 제공</li>
                                <li>기타 회사가 정하는 업무 및 부가 서비스</li>
                            </ul>
                        </section>

                        {/* 제5조 (상담 신청 및 계약 체결) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제5조</span> (상담 접수 및 상품 계약 체결)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                ① 본 플랫폼에서 진행되는 상담 신청은 상품 정보 안내 및 상담 연계를 위한 사전 접수 단계입니다.<br />
                                ② 최종 상조 서비스 계약 체결 및 납입금 결제는 ㈜소노스테이션의 전문 상담원과의 해피콜 유선 상담 또는 별도 전자계약 시스템을 통해 정식으로 체결됩니다.<br />
                                ③ 고객은 계약 체결 전 계약서, 약관 및 중요정보 고시사항을 충분히 확인할 책임이 있습니다.
                            </p>
                        </section>

                        {/* 제6조 (회사의 의무) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제6조</span> (회사의 의무)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                ① 회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다합니다.<br />
                                ② 회사는 이용자의 개인정보를 안전하게 보호하기 위하여 개인정보처리방침을 수립·준수하며 보안 시스템을 철저히 운영합니다.
                            </p>
                        </section>

                        {/* 제7조 (이용자의 의무) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제7조</span> (이용자의 의무)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                이용자는 다음 각 호의 행위를 하여서는 안 됩니다.
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                <li>신청 또는 변경 시 타인의 정보(성명, 연락처 등)를 허위로 입력하거나 도용하는 행위</li>
                                <li>회사의 플랫폼에 게시된 정보를 무단으로 복제, 변조, 유통하거나 상업적으로 이용하는 행위</li>
                                <li>회사의 업무를 방해하거나 시스템에 위해를 가하는 컴퓨터 바이러스 등을 유포하는 행위</li>
                                <li>기타 관계 법령 및 공서양속에 위반되는 행위</li>
                            </ul>
                        </section>

                        {/* 제8조 (면책 조항) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제8조</span> (면책 조항)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                ① 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 회사의 서비스 제공에 관한 책임이 면제됩니다.<br />
                                ② 이용자가 잘못 입력한 연락처나 정보로 인해 발생하는 불이익에 대해 회사는 책임을 지지 않습니다.<br />
                                ③ 본 서비스는 제휴 상품의 중개 및 상담 접수를 대행하며, ㈜소노스테이션의 본사 정책 변경이나 최종 계약 불성립에 대하여 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
                            </p>
                        </section>

                        {/* 제9조 (분쟁의 해결 및 관할 법원) */}
                        <section className="space-y-3">
                            <h2 className="text-lg md:text-xl font-black text-sono-dark pb-2 border-b border-gray-100 flex items-center gap-2">
                                <span className="text-sono-primary">제9조</span> (분쟁의 해결 및 관할법원)
                            </h2>
                            <p className="text-gray-600 font-medium">
                                서비스 이용과 관련하여 회사와 이용자 사이에 분쟁이 발생할 경우 상호 성실히 협의하여 원만히 해결하도록 노력하며, 소송이 제기될 경우 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.
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
                                href="/privacy"
                                className="px-8 py-3 bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                개인정보처리방침 보기
                            </Link>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
