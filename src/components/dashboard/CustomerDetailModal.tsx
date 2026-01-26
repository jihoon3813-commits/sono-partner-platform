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
            case '상담중':
                return 'bg-amber-50 text-amber-600 border border-amber-100';
            case '부재':
                return 'bg-gray-50 text-gray-500 border border-gray-100';
            case '거부':
                return 'bg-red-50 text-red-600 border border-red-100';
            case '접수취소':
                return 'bg-rose-50 text-rose-600 border border-rose-100';
            case '계약완료':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case '1회출금완료':
                return 'bg-teal-50 text-teal-600 border border-teal-100';
            case '배송완료':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
            case '정산완료':
                return 'bg-purple-50 text-purple-600 border border-purple-100';
            default:
                return 'bg-gray-50 text-gray-400 border border-gray-200';
        }
    };

    const [status, setStatus] = useState<ApplicationStatus>(application.status);
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

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

    const statusOptions: ApplicationStatus[] = [
        '접수', '상담중', '부재', '거부', '접수취소', '계약완료', '1회출금완료', '배송완료', '정산완료'
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

                    {/* Customer Info */}
                    <div>
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
                            <InfoRow label="상품 유형" value={application.productType} />
                            <InfoRow label="플랜" value={application.planType} />
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
                            <InfoRow label="신청일시" value={new Date(application.createdAt).toLocaleString()} />
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
