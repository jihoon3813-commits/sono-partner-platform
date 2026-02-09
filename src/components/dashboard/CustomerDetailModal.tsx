"use client";

import { useState } from "react";
import { Application, ApplicationStatus } from "@/lib/types";

interface CustomerDetailModalProps {
    application: Application;
    onClose: () => void;
    onUpdate: () => void;
    isAdmin?: boolean;
    partnerLoginId?: string;
}

export default function CustomerDetailModal({ application, onClose, onUpdate, isAdmin = false, partnerLoginId }: CustomerDetailModalProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case '접수':
                return 'bg-blue-50 text-blue-600 border border-blue-100';
            case '대기':
                return 'bg-slate-50 text-slate-600 border border-slate-100';
            case '상담중':
                return 'bg-amber-50 text-amber-600 border border-amber-100';
            case '부재':
                return 'bg-gray-50 text-gray-500 border border-gray-100';
            case '보류':
                return 'bg-orange-50 text-orange-600 border border-orange-100';
            case '거부':
                return 'bg-red-50 text-red-600 border border-red-100';
            case '접수취소':
                return 'bg-rose-50 text-rose-600 border border-rose-100';
            case '정상가입':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case '1회출금':
                return 'bg-teal-50 text-teal-600 border border-teal-100';
            case '청약철회':
                return 'bg-pink-50 text-pink-600 border border-pink-100';
            case '해약':
                return 'bg-stone-50 text-stone-600 border border-stone-100';
            default:
                return 'bg-gray-50 text-gray-400 border border-gray-200';
        }
    };

    const formatDate = (val: string | undefined | number) => {
        if (!val || val === "-") return "";

        // Excel serial handling
        const serial = typeof val === 'number' ? val : parseFloat(String(val));
        if (!isNaN(serial) && serial > 30000 && serial < 60000) {
            const date = new Date((serial - 25569) * 86400 * 1000);
            return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\. /g, '-').replace('.', '');
        }

        try {
            const d = new Date(String(val));
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\. /g, '-').replace('.', '');
        } catch {
            return String(val);
        }
    };

    // 상품 유형 한글 표시
    const getProductTypeLabel = (productType: string) => {
        const type = productType?.toLowerCase() || "";
        if (type === "happy450" || type.includes("해피") || type.includes("happy")) {
            return "더 해피 450 ONE";
        }
        if (type === "smartcare" || type.includes("스마트") || type.includes("smart")) {
            return "스마트케어";
        }
        return productType || "-";
    };

    const [status, setStatus] = useState<ApplicationStatus>(application.status);
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 신규 추가 필드 상태 (초기화 시 날짜 형식 변환 적용)
    const [firstPaymentDate, setFirstPaymentDate] = useState(formatDate(application.firstPaymentDate));
    const [registrationDate, setRegistrationDate] = useState(formatDate(application.registrationDate));
    const [paymentMethod, setPaymentMethod] = useState(application.paymentMethod || "");
    const [cancellationProcessing, setCancellationProcessing] = useState(formatDate(application.cancellationProcessing));
    const [withdrawalProcessing, setWithdrawalProcessing] = useState(formatDate(application.withdrawalProcessing));
    const [remarks, setRemarks] = useState(application.remarks || "");
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    const handleStatusChange = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/applications/${application.applicationNo}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, memo }),
            });

            const data = await response.json();
            if (data.success) {
                alert("상태가 변경되었습니다.");
                onUpdate();
                onClose();
            } else {
                alert(data.message || "오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 통신 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDetails = async () => {
        setIsSavingDetails(true);
        try {
            const response = await fetch(`/api/applications/${application.applicationNo}/details`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstPaymentDate,
                    registrationDate,
                    paymentMethod,
                    cancellationProcessing,
                    withdrawalProcessing,
                    remarks
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert("결제/상담 정보가 저장되었습니다.");
                onUpdate();
            } else {
                alert(data.message || "오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버 통신 오류가 발생했습니다.");
        } finally {
            setIsSavingDetails(false);
        }
    };

    const statusOptions: ApplicationStatus[] = [
        '접수', '대기', '상담중', '부재', '보류', '거부', '접수취소', '정상가입', '1회출금', '청약철회', '해약'
    ];

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[24px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-sono-dark">상담 상세 내역</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-sono-dark">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    {/* Status Update Section - Only visible to Admins */}
                    {/* Status Update/View Section */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">진행 상태 {isAdmin ? '변경' : ''}</label>
                        {isAdmin ? (
                            <div className="flex gap-2">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                                    className="flex-1 bg-white border border-gray-200 text-sono-dark text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sono-primary outline-none font-bold"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleStatusChange}
                                    disabled={isLoading || status === application.status}
                                    className="bg-sono-dark text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "..." : "변경"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusStyles(application.status)}`}>
                                    {application.status}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 결제/상담 정보 (New Section) */}
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-sono-primary">결제/상담 정보</h3>
                            {isAdmin && (
                                <button
                                    onClick={handleSaveDetails}
                                    disabled={isSavingDetails}
                                    className="text-xs font-bold bg-sono-primary text-white px-2 py-1 rounded-lg hover:bg-sono-secondary disabled:opacity-50"
                                >
                                    {isSavingDetails ? "저장 중..." : "정보 저장"}
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {isAdmin ? (
                                <>
                                    <InputRow label="초회납입일" value={firstPaymentDate} onChange={setFirstPaymentDate} placeholder="YYYY-MM-DD" />
                                    <InputRow label="신규등록일" value={registrationDate} onChange={setRegistrationDate} placeholder="YYYY-MM-DD" />
                                    <InputRow label="납입방법" value={paymentMethod} onChange={setPaymentMethod} placeholder="ex) 신용카드, 계좌이체" />
                                    <InputRow label="해약처리" value={cancellationProcessing} onChange={setCancellationProcessing} />
                                    <InputRow label="청약철회" value={withdrawalProcessing} onChange={setWithdrawalProcessing} />
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-xs font-bold text-gray-400">비고(사유)</span>
                                        <textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sono-primary outline-none min-h-[80px]"
                                            placeholder="사유 등을 입력하세요"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <InfoRow label="초회납입일" value={formatDate(application.firstPaymentDate) || '-'} />
                                    <InfoRow label="신규등록일" value={formatDate(application.registrationDate) || '-'} />
                                    <InfoRow label="납입방법" value={application.paymentMethod || '-'} />
                                    <InfoRow label="해약처리" value={formatDate(application.cancellationProcessing) || '-'} />
                                    <InfoRow label="청약철회" value={formatDate(application.withdrawalProcessing) || '-'} />
                                    <InfoRow label="비고(사유)" value={application.remarks || '-'} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">고객 정보</h3>
                        <div className="space-y-3">
                            <InfoRow label="고객명" value={application.customerName} />
                            <InfoRow label="연락처" value={application.customerPhone} />
                            <InfoRow label="생년월일" value={application.customerBirth} />
                            <InfoRow label="성별" value={application.customerGender} />
                            <InfoRow label="주소" value={`${application.customerAddress} ${application.customerZipcode}`} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">신청 상품 정보</h3>
                        <div className="space-y-3">
                            <InfoRow label="상품 유형" value={getProductTypeLabel(application.productType)} />
                            <InfoRow label="가전제품" value={application.products || '-'} />
                            <InfoRow label="플랜" value={application.planType ? (application.planType.includes("구좌") ? application.planType : `${application.planType}구좌`) : '-'} />
                            <InfoRow label="문의사항" value={application.inquiry || '-'} />
                            <InfoRow label="선호 시간" value={application.preferredContactTime || '-'} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">파트너 정보</h3>
                        <div className="space-y-3">
                            <InfoRow label="파트너사" value={application.partnerName} />
                            <InfoRow label="파트너 ID" value={partnerLoginId || application.partnerId} />
                            <InfoRow label="회원번호" value={application.partnerMemberId || '-'} />
                            <InfoRow label="신청일시" value={formatDate(application.registrationDate || application.createdAt) || '-'} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex text-sm">
            <span className="w-24 text-gray-400 font-medium shrink-0">{label}</span>
            <span className="text-sono-dark font-medium break-all">{value}</span>
        </div>
    );
}

function InputRow({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-24 text-gray-400 font-medium shrink-0">{label}</span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none"
            />
        </div>
    );
}

