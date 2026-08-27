"use client";

import React from "react";

interface AffiliateCardBenefitProps {
    planName?: string;
    slotCount?: number;
    monthlyPayment?: number;
    className?: string;
    compact?: boolean;
}

export default function AffiliateCardBenefit({
    planName,
    slotCount = 2,
    monthlyPayment,
    className = "",
    compact = false,
}: AffiliateCardBenefitProps) {
    // 구좌수 및 월 납입금 계산
    let currentMonthly = monthlyPayment;
    let currentName = planName;

    if (!currentMonthly) {
        if (slotCount === 1) currentMonthly = 33000;
        else if (slotCount === 2) currentMonthly = 66000;
        else if (slotCount === 3) currentMonthly = 99000;
        else if (slotCount === 4) currentMonthly = 132000;
        else if (slotCount === 6) currentMonthly = 198000;
        else currentMonthly = slotCount * 33000;
    }

    if (!currentName) {
        if (slotCount === 1) currentName = "스마트케어 5";
        else if (slotCount === 2) {
            currentName = currentMonthly === 55200 ? "스마트케어 4더블" : "스마트케어 5더블";
        } else if (slotCount === 3) currentName = "스마트케어 5트리플";
        else if (slotCount === 4) currentName = "스마트케어 5쿼드";
        else currentName = `스마트케어 ${slotCount}구좌`;
    }

    // 총 납입금 계산 (4더블 특수 케이스: 1~179회 55,200원 + 180회 79,200원 = 9,960,000원)
    const isSmartCare4Double = currentName?.includes("4더블") || currentMonthly === 55200;
    const totalPayment = isSmartCare4Double ? 9960000 : currentMonthly * 180;
    
    // 제휴카드 할인: 월 최대 2.3만원 할인 (렌탈료 할인 60회 = 1,380,000원 할인)
    const totalDiscount = 23000 * 60; // 1,380,000원
    const discountedTotal = Math.max(0, totalPayment - totalDiscount);
    const refundAmount = totalPayment;

    return (
        <div className={`w-full space-y-3 sm:space-y-4 ${className}`}>
            {/* 1. 가격구성 테이블 */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                                <th className="py-2.5 sm:py-3.5 px-2 sm:px-4 border-r border-slate-200 font-bold" rowSpan={2}>
                                    상품명
                                </th>
                                <th className="py-1.5 px-2 border-r border-slate-200 font-bold" colSpan={2}>
                                    만기 회차
                                </th>
                                <th className="py-2.5 sm:py-3.5 px-2 sm:px-4 border-r border-slate-200 font-bold" rowSpan={2}>
                                    월 납입금
                                </th>
                                <th className="py-2.5 sm:py-3.5 px-2 sm:px-4 font-bold" rowSpan={2}>
                                    총 납입금
                                </th>
                            </tr>
                            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 text-[10px] sm:text-xs">
                                <th className="py-1 px-2 border-r border-slate-200 font-medium">총납입</th>
                                <th className="py-1 px-2 border-r border-slate-200 font-medium">가입유지</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                            <tr>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 border-r border-slate-200 text-xs sm:text-sm font-black text-slate-900">
                                    {currentName}
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-3 border-r border-slate-200 font-black text-slate-900 text-xs sm:text-sm">
                                    180회
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-3 border-r border-slate-200 text-slate-500 text-xs sm:text-sm">
                                    20회
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 border-r border-slate-200 text-xs sm:text-sm font-black text-slate-900">
                                    {isSmartCare4Double ? (
                                        <span>55,200원×179회<br/><span className="text-[10px] text-slate-500 font-normal">(180회 79,200원)</span></span>
                                    ) : (
                                        `${currentMonthly.toLocaleString()}원×180회`
                                    )}
                                </td>
                                <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-black text-slate-900">
                                    {totalPayment.toLocaleString()}원
                                </td>
                            </tr>
                            <tr className="bg-blue-50/40">
                                <td className="py-3 sm:py-3.5 px-2 sm:px-4 border-r border-slate-200 text-xs sm:text-sm font-black text-blue-600">
                                    제휴카드 할인 시
                                </td>
                                <td className="py-3 sm:py-3.5 px-2 sm:px-3 border-r border-slate-200 text-xs sm:text-sm font-black text-blue-600">
                                    180회
                                </td>
                                <td className="py-3 sm:py-3.5 px-2 sm:px-3 border-r border-slate-200 text-xs sm:text-sm text-slate-500">
                                    20회
                                </td>
                                <td className="py-3 sm:py-3.5 px-2 sm:px-4 border-r border-slate-200 text-xs sm:text-sm font-black text-blue-600">
                                    <div>
                                        <span>{Math.max(0, currentMonthly - 23000).toLocaleString()}원</span>
                                        <span className="block text-[10px] text-blue-500 font-normal">(1~60회 할인적용)</span>
                                    </div>
                                </td>
                                <td className="py-3 sm:py-3.5 px-2 sm:px-4 text-xs sm:text-sm font-black text-blue-600">
                                    {discountedTotal.toLocaleString()}원
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="py-1.5 px-4 bg-white text-right border-t border-slate-100">
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                        * 전월 실적 120만원 기준 (월 최대 2.3만원 × 60회 할인 적용 시)
                    </span>
                </div>
            </div>

            {/* 2. 만기 환급금 혜택 배너 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 shadow-xs text-center sm:text-left">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 shrink-0">
                        만기 환급금 혜택
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                        {refundAmount.toLocaleString()}원
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span>만기 후 익월 해약 시 100% 전액 환급</span>
                </div>
            </div>

            {/* 3. 제휴카드 신청 안내 카드 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                {/* 좌측 카드 이미지 */}
                <div className="flex items-center justify-center shrink-0 w-24 sm:w-28">
                    <img 
                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1787790972/11755_1_oaddqn.png" 
                        alt="BS렌탈 플러스 하나카드" 
                        className="w-full h-auto object-contain drop-shadow-sm"
                    />
                </div>

                {/* 중앙 텍스트 안내 */}
                <div className="flex-1 text-center sm:text-left space-y-1">
                    <h5 className="text-sm sm:text-base font-black text-slate-900">
                        BS렌탈 플러스 하나카드
                    </h5>
                    <p className="text-xs sm:text-sm font-bold text-blue-600">
                        최대 월 2.3만원 할인
                    </p>
                    <div className="text-[10px] sm:text-xs text-slate-500 space-y-0.5 pt-0.5">
                        <p>실적 30만원 이상 시 13,000원 할인</p>
                        <p>실적 120만원 이상 시 23,000원 할인</p>
                    </div>
                </div>

                {/* 우측 신청 버튼 */}
                <div className="shrink-0 w-full sm:w-auto">
                    <a
                        href="https://m.hanacard.co.kr/MKCDCM1000M.web?CD_PD_SEQ=11811"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block sm:inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-[#0c2340] hover:bg-[#1a365d] text-white font-bold text-xs sm:text-sm rounded-full shadow transition-all hover:scale-[1.02] active:scale-95 text-center cursor-pointer"
                    >
                        신청하기
                    </a>
                </div>
            </div>
        </div>
    );
}
