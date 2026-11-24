"use client";

import React, { useEffect, useState } from "react";
import "./maeum-econtract.css";

interface MaeumConsultDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialPlan?: "3" | "4" | "5";
    initialTarget?: "부모님" | "본인";
    partnerId?: string;
    partnerUrl?: string;
    partnerName?: string;
    partnerPhone?: string;
    productNamePrefix?: string;
    onOpenEcontract?: (plan: "3" | "4" | "5") => void;
}

const PLAN_OPTIONS: { key: "3" | "4" | "5"; label: string; price: number }[] = [
    { key: "3", label: "마음든든 3", price: 32000 },
    { key: "4", label: "마음든든 4", price: 43000 },
    { key: "5", label: "마음든든 5", price: 54000 },
];

const TIME_OPTIONS = [
    "상시 가능",
    "오전 (09~12시)",
    "오후 (12~18시)",
    "저녁 (18시 이후)",
];

function formatPhoneInput(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function MaeumConsultDrawer({
    isOpen,
    onClose,
    initialPlan = "4",
    initialTarget = "부모님",
    partnerId = "",
    partnerUrl = "",
    partnerName = "",
    partnerPhone = "",
    productNamePrefix = "마음든든",
    onOpenEcontract,
}: MaeumConsultDrawerProps) {
    const [target, setTarget] = useState<"부모님" | "본인">(initialTarget);
    const [plan, setPlan] = useState<"3" | "4" | "5">(initialPlan);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [preferredTime, setPreferredTime] = useState("상시 가능");
    const [inquiry, setInquiry] = useState("");
    const [privacyAgreed, setPrivacyAgreed] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [submittedNo, setSubmittedNo] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPlan(initialPlan);
            setTarget(initialTarget);
            setErrorMsg("");
        }
    }, [isOpen, initialPlan, initialTarget]);

    useEffect(() => {
        if (!isOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const selectedPlanInfo = PLAN_OPTIONS.find((p) => p.key === plan) || PLAN_OPTIONS[1];

    const handleClose = () => {
        if (submittedNo) {
            setSubmittedNo(null);
            setName("");
            setPhone("");
            setInquiry("");
        }
        setErrorMsg("");
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        const trimmedName = name.trim();
        const phoneDigits = phone.replace(/\D/g, "");

        if (!trimmedName) {
            setErrorMsg("성함을 입력해 주세요.");
            return;
        }
        if (phoneDigits.length < 10) {
            setErrorMsg("올바른 연락처를 입력해 주세요.");
            return;
        }
        if (!privacyAgreed) {
            setErrorMsg("개인정보 수집 및 이용에 동의해 주세요.");
            return;
        }

        setIsSubmitting(true);
        try {
            const effectivePartnerId =
                partnerId && !partnerId.startsWith("P-TEMP-")
                    ? partnerId
                    : partnerUrl || "ADMIN";

            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerId: effectivePartnerId,
                    partnerName: partnerName || "본사 직접 신청",
                    productType: `${productNamePrefix} ${plan}`,
                    planType: `${target} · 월 ${selectedPlanInfo.price.toLocaleString("ko-KR")}원`,
                    name: trimmedName,
                    phone,
                    preferredTime,
                    inquiry: inquiry.trim() || `${productNamePrefix} ${plan} 빠른 상담 신청 (${target})`,
                    accessPath: "H",
                }),
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "상담 신청 처리 중 오류가 발생했습니다.");
            }

            setSubmittedNo(result.data?.applicationNo || "접수완료");
        } catch (err) {
            setErrorMsg(
                err instanceof Error ? err.message : "상담 신청 중 오류가 발생했습니다. 다시 시도해 주세요."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="ec-drawer-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="마음든든 빠른 상담 신청"
            onClick={handleClose}
        >
            <aside className="ec-drawer" onClick={(e) => e.stopPropagation()}>
                {/* Topbar */}
                <div className="ec-topbar">
                    <div className="ec-brand">
                        <span className="ec-brand-mark">M</span>
                        <span>{productNamePrefix} 빠른 상담 신청</span>
                    </div>
                    <button type="button" className="ec-close-btn" onClick={handleClose}>
                        닫기 ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="ec-scroll">
                    <div className="mc-body">
                        <div className="mc-hero-card">
                            <div className="mc-hero-badge">1분 간편 접수 · 전문 상담원 안내</div>
                            <h2>내 가족에게 맞는 마음든든,<br />부담 없이 먼저 물어보세요.</h2>
                            <p>
                                준비 대상과 연락처만 남겨주시면, 2·5·1 잔금 보장 조건과
                                가입 가능 여부를 친절하게 안내해 드립니다.
                            </p>
                        </div>

                        {partnerName && (
                            <div className="mc-partner-strip">
                                <span>담당 파트너: <strong>{partnerName}</strong></span>
                                {partnerPhone && (
                                    <a href={`tel:${partnerPhone.replace(/\D/g, "")}`}>
                                        📞 {partnerPhone}
                                    </a>
                                )}
                            </div>
                        )}

                        {submittedNo ? (
                            <div className="mc-done" role="status">
                                <div className="mc-done-icon">✓</div>
                                <h3>빠른 상담 신청이 접수되었습니다.</h3>
                                <p>
                                    남겨주신 연락처로 전문 상담원이 순차적으로 연락드리겠습니다.
                                </p>
                                <div className="mc-done-summary">
                                    <div><strong>접수번호:</strong> {submittedNo}</div>
                                    <div><strong>신청상품:</strong> {productNamePrefix} {selectedPlanInfo.key} (월 {selectedPlanInfo.price.toLocaleString("ko-KR")}원)</div>
                                    <div><strong>준비대상:</strong> {target}</div>
                                    <div><strong>연락처:</strong> {phone}</div>
                                    <div><strong>희망시간:</strong> {preferredTime}</div>
                                </div>
                                <div className="mc-done-actions">
                                    {onOpenEcontract && (
                                        <button
                                            type="button"
                                            className="mc-secondary-btn"
                                            onClick={() => {
                                                handleClose();
                                                onOpenEcontract(plan);
                                            }}
                                        >
                                            바로 전자계약 진행하기 →
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="mc-submit-btn"
                                        onClick={handleClose}
                                    >
                                        확인
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form id="maeum-consult-form" className="mc-card" onSubmit={handleSubmit}>
                                <div className="mc-field">
                                    <span className="mc-label">누구를 위한 준비인가요?</span>
                                    <div className="mc-seg-grid">
                                        {(["부모님", "본인"] as const).map((item) => (
                                            <button
                                                key={item}
                                                type="button"
                                                className={`mc-seg-btn ${target === item ? "active" : ""}`}
                                                onClick={() => setTarget(item)}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mc-field">
                                    <span className="mc-label">관심 있는 상품</span>
                                    <div className="mc-plan-grid">
                                        {PLAN_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                className={`mc-plan-btn ${plan === opt.key ? "active" : ""}`}
                                                onClick={() => setPlan(opt.key)}
                                            >
                                                <strong>{productNamePrefix} {opt.key}</strong>
                                                <span>월 {opt.price.toLocaleString("ko-KR")}원</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mc-field">
                                    <label className="mc-label" htmlFor="mc-name">
                                        성함 <span className="mc-req">*</span>
                                    </label>
                                    <input
                                        id="mc-name"
                                        type="text"
                                        className="mc-input"
                                        placeholder="성함을 입력해 주세요"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mc-field">
                                    <label className="mc-label" htmlFor="mc-phone">
                                        연락처 <span className="mc-req">*</span>
                                    </label>
                                    <input
                                        id="mc-phone"
                                        type="tel"
                                        inputMode="numeric"
                                        className="mc-input"
                                        placeholder="010-0000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="mc-field">
                                    <span className="mc-label">희망 통화시간</span>
                                    <div className="mc-chip-grid">
                                        {TIME_OPTIONS.map((timeOpt) => (
                                            <button
                                                key={timeOpt}
                                                type="button"
                                                className={`mc-chip ${preferredTime === timeOpt ? "active" : ""}`}
                                                onClick={() => setPreferredTime(timeOpt)}
                                            >
                                                {timeOpt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mc-field">
                                    <label className="mc-label" htmlFor="mc-inquiry">
                                        문의사항 (선택)
                                    </label>
                                    <textarea
                                        id="mc-inquiry"
                                        className="mc-textarea"
                                        placeholder="궁금한 점이나 확인하고 싶은 조건을 간단히 적어주세요."
                                        value={inquiry}
                                        onChange={(e) => setInquiry(e.target.value)}
                                    />
                                </div>

                                <div className="mc-agree-box">
                                    <label className="mc-agree-label">
                                        <input
                                            type="checkbox"
                                            checked={privacyAgreed}
                                            onChange={(e) => setPrivacyAgreed(e.target.checked)}
                                        />
                                        <span>개인정보 수집 및 이용 동의 (필수)</span>
                                    </label>
                                    <p className="mc-agree-desc">
                                        수집항목: 성함, 연락처, 상담신청 내용 / 이용목적: 마음든든 상품 상담 및 가입 안내 / 보유기간: 상담 완료 후 관련 법령에 따라 보관 및 파기
                                    </p>
                                </div>

                                {errorMsg && <div className="mc-error" role="alert">{errorMsg}</div>}
                            </form>
                        )}
                    </div>
                </div>

                {/* Sticky Bottom Submit Bar */}
                {!submittedNo && (
                    <div className="mc-footbar">
                        <button
                            type="submit"
                            form="maeum-consult-form"
                            className="mc-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "접수 중..." : "빠른 상담 신청 완료하기 →"}
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
}
