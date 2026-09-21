"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application } from "@/lib/types";

interface SonoRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application;
    onSuccess: () => void;
}

// 기본 통화 날짜 및 시간 계산
function getDefaultCallDateTime(preferredTime?: string) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (9 * 60 * 60000));

    const currentHour = kst.getHours();
    let targetDate = new Date(kst);
    if (currentHour >= 17) {
        targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // 주말 처리
    const day = targetDate.getDay();
    if (day === 6) {
        targetDate.setDate(targetDate.getDate() + 2);
    } else if (day === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const callDate = `${yyyy}-${mm}-${dd}`;

    const validTimes = [
        "10:00 ~ 11:00",
        "11:00 ~ 12:00",
        "14:00 ~ 15:00",
        "15:00 ~ 16:00",
        "16:00 ~ 17:00",
        "17:00 ~ 18:00"
    ];

    let callTime = "10:00 ~ 11:00";
    if (preferredTime) {
        const matched = validTimes.find(t => preferredTime.includes(t.substring(0, 5)) || preferredTime.includes(t.substring(8, 13)));
        if (matched) {
            callTime = matched;
        } else if (preferredTime.includes("오후") || preferredTime.includes("14") || preferredTime.includes("15")) {
            callTime = "14:00 ~ 15:00";
        } else if (preferredTime.includes("16") || preferredTime.includes("17")) {
            callTime = "16:00 ~ 17:00";
        }
    }

    return { callDate, callTime };
}

export default function SonoRegisterModal({
    isOpen,
    onClose,
    application,
    onSuccess,
}: SonoRegisterModalProps) {
    const partnersData = useQuery(api.partners.getAllPartners);
    const [authCode, setAuthCode] = useState("BIZI0011");
    const [partnerBadgeText, setPartnerBadgeText] = useState("");
    const [orderQty, setOrderQty] = useState("1");
    const [callDate, setCallDate] = useState("");
    const [callTime, setCallTime] = useState("10:00 ~ 11:00");
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resultBanner, setResultBanner] = useState<{ type: 'success' | 'duplicate' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (isOpen && application) {
            const { callDate: defDate, callTime: defTime } = getDefaultCallDateTime(application.preferredContactTime);
            setCallDate(defDate);
            setCallTime(defTime);

            // 구좌 수 초기화
            if (application.planType) {
                if (application.planType.includes("2")) setOrderQty("2");
                else if (application.planType.includes("3")) setOrderQty("3");
                else setOrderQty("1");
            } else {
                setOrderQty("1");
            }

            // 메모 초기화: 비고란에는 기본값을 넣지 않음 (사용자 요청)
            setMemo("");

            setResultBanner(null);

            // 파트너 목록에서 유효 인증코드 계산
            if (partnersData && partnersData.length > 0) {
                const targetId = String(application.partnerId || '').trim().toLowerCase();
                const targetName = String(application.partnerName || '').trim().toLowerCase();

                const matchedPartner = partnersData.find(p => 
                    (p.partnerId && p.partnerId.toLowerCase() === targetId) ||
                    (p.loginId && p.loginId.toLowerCase() === targetId) ||
                    (p.customUrl && p.customUrl.toLowerCase() === targetId) ||
                    (targetName && p.companyName && p.companyName.toLowerCase() === targetName) ||
                    (targetId && p.companyName && p.companyName.toLowerCase() === targetId)
                );

                let resolvedCode = "";
                let inheritedFrom = "";
                let curr = matchedPartner;
                const visited = new Set<string>();

                while (curr && !visited.has(curr.partnerId)) {
                    visited.add(curr.partnerId);
                    if (curr.sonoAuthCode && curr.sonoAuthCode.trim() !== '') {
                        resolvedCode = curr.sonoAuthCode.trim();
                        if (curr !== matchedPartner) {
                            inheritedFrom = curr.companyName || curr.partnerId;
                        }
                        break;
                    }
                    if (curr.parentPartnerId && curr.parentPartnerId.trim() !== '') {
                        const parentId = curr.parentPartnerId.trim().toLowerCase();
                        curr = partnersData.find(p =>
                            (p.partnerId && p.partnerId.toLowerCase() === parentId) ||
                            (p.loginId && p.loginId.toLowerCase() === parentId) ||
                            (p.customUrl && p.customUrl.toLowerCase() === parentId) ||
                            (p.companyName && p.companyName.toLowerCase() === parentId)
                        );
                    } else {
                        break;
                    }
                }

                const pName = matchedPartner ? `${matchedPartner.companyName} (${matchedPartner.loginId})` : (application.partnerName || application.partnerId);
                setPartnerBadgeText(inheritedFrom ? `${pName} [상위: ${inheritedFrom} 상속]` : pName);
                setAuthCode(resolvedCode || "BIZI0011");
            } else {
                setPartnerBadgeText(application.partnerName || application.partnerId || "");
                // API fallback
                (async () => {
                    try {
                        const res = await fetch(`/api/partners/${application.partnerId}`);
                        const data = await res.json();
                        if (data?.data?.sonoAuthCode) {
                            setAuthCode(data.data.sonoAuthCode);
                        }
                    } catch {
                        // 기본값 BIZI0011 유지
                    }
                })();
            }
        }
    }, [isOpen, application, partnersData]);

    if (!isOpen || !application) return null;

    const handleSubmit = async () => {
        setIsLoading(true);
        setResultBanner(null);

        try {
            const res = await fetch("/api/sono/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationNo: application.applicationNo,
                    authCode: authCode.trim(),
                    orderQty,
                    callDate,
                    callTime,
                    memo: memo.trim()
                })
            });

            const data = await res.json();

            if (data.status === 'SUCCESS') {
                setResultBanner({
                    type: 'success',
                    message: `✅ ${data.message} (인증코드: ${data.authCodeUsed || authCode}${data.agentNm ? ` / 소속: ${data.agentNm}` : ''})`
                });
                onSuccess();
            } else if (data.status === 'DUPLICATE') {
                setResultBanner({
                    type: 'duplicate',
                    message: `🟡 ${data.message}`
                });
                onSuccess();
            } else {
                setResultBanner({
                    type: 'error',
                    message: `❌ 접수 실패: ${data.message || '알 수 없는 오류'}`
                });
            }
        } catch (err: any) {
            setResultBanner({
                type: 'error',
                message: `⚠️ 통신 중 오류가 발생했습니다: ${err.message || String(err)}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                            SO
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-black text-sono-dark">소노아임레디 웹 접수 확인</h2>
                            <p className="text-xs text-gray-400 font-medium">direct.sonoimready.com/THEHAPPYONE/write 전송</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 모달 본문 */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {/* 결과 배너 (성공/실패 시 표시) */}
                    {resultBanner && (
                        <div className={`p-4 rounded-2xl border text-sm font-bold animate-in fade-in duration-150 ${
                            resultBanner.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : resultBanner.type === 'duplicate'
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                            <p className="leading-relaxed whitespace-pre-line">{resultBanner.message}</p>
                        </div>
                    )}

                    {/* 안내 문구 */}
                    <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 text-xs text-indigo-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                            <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>소노아임레디 상담 접수 페이지로 자동 전송됩니다.</span>
                        </div>
                        <p className="text-gray-500 pl-5.5">
                            전송할 고객 정보 및 통화 요청 시간을 확인하신 후 하단의 최종 접수 버튼을 클릭하세요.
                        </p>
                    </div>

                    {/* 섹션 1: 판매사(대리점) 인증 정보 */}
                    <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                            <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">1. 판매사 정보 (본인확인)</h3>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                ✓ 소노 인증 계정
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">판매사원 성명</span>
                                <span className="font-black text-sono-dark">김지훈</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">판매자 연락처</span>
                                <span className="font-black text-sono-dark">01043223813</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 block mb-0.5">생년월일</span>
                                <span className="font-black text-sono-dark">19811115</span>
                            </div>
                        </div>
                    </div>

                    {/* 섹션 2: 웹 접수 인증코드 (authCd) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700">
                                2. 소노접수 인증코드 (authCd)
                            </label>
                            <span className="text-[11px] text-indigo-600 font-bold truncate max-w-[320px]" title={partnerBadgeText}>
                                파트너: {partnerBadgeText || application.partnerName || application.partnerId}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
                            placeholder="예: BIZI0011"
                        />
                    </div>

                    {/* 섹션 3: 고객 및 접수 정보 확인 */}
                    <div className="space-y-3 pt-1">
                        <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                            3. 전송할 고객 정보 및 통화 요청 설정
                        </h3>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 block">고객명</span>
                                <span className="text-sm font-black text-sono-dark block">{application.customerName}</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 block">고객 연락처</span>
                                <span className="text-sm font-black text-indigo-700 block">{application.customerPhone}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 block">상품명 (고정)</span>
                                <span className="font-bold text-gray-800">더해피 450 ONE_R1</span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 block">가입 방법</span>
                                <span className="font-bold text-gray-800">전자계약</span>
                            </div>
                        </div>

                        {/* 구좌 수 선택 */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 block">구좌 수</label>
                            <div className="grid grid-cols-3 gap-2">
                                {["1", "2", "3"].map((qty) => (
                                    <button
                                        key={qty}
                                        type="button"
                                        onClick={() => setOrderQty(qty)}
                                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            orderQty === qty
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        {qty}구좌
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 통화 요청 일시 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 block">통화 요청 날짜</label>
                                <input
                                    type="date"
                                    value={callDate}
                                    onChange={(e) => setCallDate(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-sono-dark focus:ring-2 focus:ring-indigo-500 outline-none h-[38px] cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-600 block">통화 요청 시간</label>
                                <select
                                    value={callTime}
                                    onChange={(e) => setCallTime(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-sono-dark focus:ring-2 focus:ring-indigo-500 outline-none h-[38px] cursor-pointer"
                                >
                                    <option value="10:00 ~ 11:00">10:00 ~ 11:00</option>
                                    <option value="11:00 ~ 12:00">11:00 ~ 12:00</option>
                                    <option value="14:00 ~ 15:00">14:00 ~ 15:00</option>
                                    <option value="15:00 ~ 16:00">15:00 ~ 16:00</option>
                                    <option value="16:00 ~ 17:00">16:00 ~ 17:00</option>
                                    <option value="17:00 ~ 18:00">17:00 ~ 18:00</option>
                                </select>
                            </div>
                        </div>

                        {/* 특이사항 / 비고 */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold text-gray-600">특이사항 (비고)</label>
                                <span className="text-[10px] text-gray-400">{memo.length}/240</span>
                            </div>
                            <textarea
                                value={memo}
                                onChange={(e) => setMemo(e.target.value.substring(0, 240))}
                                placeholder="특이사항 기재"
                                rows={2}
                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-sono-dark focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 모달 푸터 */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2.5 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 text-xs sm:text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                                <span>소노아임레디로 전송 중...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>소노아임레디로 최종 접수</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
