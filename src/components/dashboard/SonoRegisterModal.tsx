"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application } from "@/lib/types";
import { getDefaultCallDateTime } from "@/lib/callTimeUtils";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

interface SonoRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: Application;
    onSuccess: () => void;
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
    const [allowDuplicate, setAllowDuplicate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resultBanner, setResultBanner] = useState<{ type: 'success' | 'duplicate' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (isOpen && application) {
            const { callDate: defDate, callTime: defTime } = getDefaultCallDateTime(application.preferredContactTime);
            setCallDate(defDate);
            setCallTime(defTime);

            // 당일 기접수 고객인 경우 기본으로 재접수 허용 플래그 설정
            setAllowDuplicate(application.sonoRegisterStatus === 'DUPLICATE' || application.sonoRegisterStatus === 'SUCCESS');

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
                    memo: memo.trim(),
                    allowDuplicate
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
        <AdminDrawer
            title="소노아임레디 웹 접수 확인"
            subtitle="direct.sonoimready.com/THEHAPPYONE/write 전송"
            maxWidth="580px"
            zIndex={75}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="adm-btn"
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="adm-btn primary"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                                <span>소노아임레디로 전송 중...</span>
                            </>
                        ) : (
                            <>
                                <AdminIcon name="check" />
                                <span>소노아임레디로 최종 접수</span>
                            </>
                        )}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                    {/* 결과 배너 (성공/실패 시 표시) */}
                    {resultBanner && (
                        <div className={`adm-note-card text-xs font-bold ${
                            resultBanner.type === 'success'
                                ? '!bg-[#edf2fa] !border-[#cfdcf0] text-[#163a6b]'
                                : resultBanner.type === 'duplicate'
                                ? '!bg-[#f7f1e2] !border-[#e8d9b8] text-[#9a7840]'
                                : '!bg-[#fbeef0] !border-[#eccfd2] text-[#a33d46]'
                        }`}>
                            <p className="leading-relaxed whitespace-pre-line">{resultBanner.message}</p>
                        </div>
                    )}

                    {/* 안내 문구 */}
                    <div className="adm-section-note !mb-0">
                        <AdminIcon name="info" />
                        <span>
                            <strong>소노아임레디 상담 접수 자동 전송:</strong> 전송할 고객 정보 및 통화 요청 시간을 확인하신 후 하단의 최종 접수 버튼을 클릭하세요.
                        </span>
                    </div>

                    {/* 섹션 1: 판매사(대리점) 인증 정보 */}
                    <div className="adm-section-label">1. 판매사 정보 (소노 인증 계정)</div>
                    <div className="adm-details-list">
                        <div className="adm-detail-item">
                            <span>판매사원 성명</span>
                            <strong>김지훈</strong>
                        </div>
                        <div className="adm-detail-item">
                            <span>판매자 연락처</span>
                            <strong className="font-mono">01043223813</strong>
                        </div>
                        <div className="adm-detail-item">
                            <span>생년월일</span>
                            <strong className="font-mono">19811115</strong>
                        </div>
                    </div>

                    {/* 섹션 2: 웹 접수 인증코드 (authCd) */}
                    <div className="adm-field">
                        <div className="flex items-center justify-between">
                            <label>2. 소노접수 인증코드 (authCd)</label>
                            <span className="text-[11px] text-[#163a6b] font-bold truncate max-w-[300px]" title={partnerBadgeText}>
                                파트너: {partnerBadgeText || application.partnerName || application.partnerId}
                            </span>
                        </div>
                        <input
                            type="text"
                            value={authCode}
                            onChange={(e) => setAuthCode(e.target.value)}
                            className="adm-input font-mono font-bold"
                            placeholder="예: BIZI0011"
                        />
                    </div>

                    {/* 섹션 3: 고객 및 접수 정보 확인 */}
                    <div className="adm-section-label">3. 전송할 고객 정보 및 통화 요청 설정</div>
                    <div className="adm-details-list">
                        <div className="adm-detail-item">
                            <span>고객명</span>
                            <strong>{application.customerName}</strong>
                        </div>
                        <div className="adm-detail-item">
                            <span>고객 연락처</span>
                            <strong className="font-mono text-[#163a6b]">{application.customerPhone}</strong>
                        </div>
                        <div className="adm-detail-item">
                            <span>상품명 (고정)</span>
                            <strong>더해피 450 ONE_R1</strong>
                        </div>
                        <div className="adm-detail-item">
                            <span>가입 방법</span>
                            <strong>전자계약</strong>
                        </div>
                    </div>

                    <div className="adm-field-grid">
                        <div className="adm-field full">
                            <label>구좌 수</label>
                            <div className="adm-segmented w-full grid grid-cols-3">
                                {["1", "2", "3"].map((qty) => (
                                    <button
                                        key={qty}
                                        type="button"
                                        onClick={() => setOrderQty(qty)}
                                        className={`justify-center ${orderQty === qty ? "active" : ""}`}
                                    >
                                        {qty}구좌
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="adm-field">
                            <label>통화 요청 날짜</label>
                            <input
                                type="date"
                                value={callDate}
                                onChange={(e) => setCallDate(e.target.value)}
                                className="adm-input font-mono"
                            />
                        </div>

                        <div className="adm-field">
                            <label>통화 요청 시간</label>
                            <select
                                value={callTime}
                                onChange={(e) => setCallTime(e.target.value)}
                                className="adm-select"
                            >
                                <option value="10:00 ~ 11:00">10:00 ~ 11:00</option>
                                <option value="11:00 ~ 12:00">11:00 ~ 12:00</option>
                                <option value="14:00 ~ 15:00">14:00 ~ 15:00</option>
                                <option value="15:00 ~ 16:00">15:00 ~ 16:00</option>
                                <option value="16:00 ~ 17:00">16:00 ~ 17:00</option>
                                <option value="17:00 ~ 18:00">17:00 ~ 18:00</option>
                            </select>
                        </div>

                        <div className="adm-field full">
                            <div className="flex justify-between">
                                <label>특이사항 (비고)</label>
                                <span className="text-[10px] text-[#788699] font-mono">{memo.length}/240</span>
                            </div>
                            <textarea
                                value={memo}
                                onChange={(e) => setMemo(e.target.value.substring(0, 240))}
                                placeholder="특이사항 기재"
                                rows={2}
                                className="adm-textarea !min-h-[68px]"
                            />
                        </div>
                    </div>

                    {/* 당일 재접수/중복 체크 해제 옵션 */}
                    <div className="adm-note-card flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-[#162438]">
                            <input
                                type="checkbox"
                                checked={allowDuplicate}
                                onChange={(e) => setAllowDuplicate(e.target.checked)}
                                className="w-4 h-4 rounded cursor-pointer accent-[#163a6b]"
                            />
                            <span>당일 재접수 허용 (소노 전산 중복 체크 해제)</span>
                        </label>
                        {allowDuplicate && (
                            <span className="adm-pill orange">
                                기접수 건 덮어쓰기 전송
                            </span>
                        )}
                    </div>
            </div>
        </AdminDrawer>
    );
}
