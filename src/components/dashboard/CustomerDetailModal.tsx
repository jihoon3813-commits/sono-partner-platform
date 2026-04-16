"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { getStatusStyles as getDynamicStatusStyles } from "@/lib/statusUtils";

interface CustomerDetailModalProps {
    application: Application;
    onClose: () => void;
    onUpdate: () => void;
    isAdmin?: boolean;
    partnerLoginId?: string;
}

export default function CustomerDetailModal({ application, onClose, onUpdate, isAdmin = false, partnerLoginId }: CustomerDetailModalProps) {
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);

    const getStatusStyles = (status: string) => {
        return getDynamicStatusStyles(status, dbStatuses);
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

    // 결제/상담 정보
    const [firstPaymentDate, setFirstPaymentDate] = useState(formatDate(application.firstPaymentDate));
    const [registrationDate, setRegistrationDate] = useState(formatDate(application.registrationDate));
    const [paymentMethod, setPaymentMethod] = useState(application.paymentMethod || "");
    const [cancellationProcessing, setCancellationProcessing] = useState(formatDate(application.cancellationProcessing));
    const [withdrawalProcessing, setWithdrawalProcessing] = useState(formatDate(application.withdrawalProcessing));
    const [remarks, setRemarks] = useState(application.remarks || "");

    // 고객 정보
    const [customerName, setCustomerName] = useState(application.customerName || "");
    const [customerPhone, setCustomerPhone] = useState(application.customerPhone || "");
    const [customerBirth, setCustomerBirth] = useState(application.customerBirth || "");
    const [customerGender, setCustomerGender] = useState(application.customerGender || "");
    const [customerAddress, setCustomerAddress] = useState(application.customerAddress || "");
    const [customerZipcode, setCustomerZipcode] = useState(application.customerZipcode || "");

    // 신청 상품 정보
    const [productType, setProductType] = useState(application.productType || "happy450");
    const [products, setProducts] = useState(application.products || "");
    const [planType, setPlanType] = useState(application.planType || "");
    const [inquiry, setInquiry] = useState(application.inquiry || "");
    const [preferredContactTime, setPreferredContactTime] = useState(application.preferredContactTime || "");

    const [isSavingDetails, setIsSavingDetails] = useState(false);

    const handleSaveAll = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/applications/${application.applicationNo}/details`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    memo,
                    firstPaymentDate,
                    registrationDate,
                    paymentMethod,
                    cancellationProcessing,
                    withdrawalProcessing,
                    remarks,
                    customerName,
                    customerPhone,
                    customerBirth,
                    customerGender,
                    customerAddress,
                    customerZipcode,
                    productType,
                    products,
                    planType,
                    inquiry,
                    preferredContactTime,
                    changedBy: partnerLoginId || "admin",
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert("수정사항이 저장되었습니다.");
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



    const defaultStatusOptions: string[] = [
        '접수대기', '접수완료', '부재', '보류', '불가', '거부', '접수취소', '녹취완료(출금확인중)', '정상가입', '배송완료', '청약철회', '해약', '정산완료'
    ];
    const statusOptions = dbStatuses ? dbStatuses.map(s => s.label) : defaultStatusOptions;

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

                <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
                    {/* Status Update/View Section */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">진행 상태 {isAdmin ? '변경' : ''}</label>
                        {isAdmin ? (
                            <div className="space-y-3">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                                    className="w-full bg-white border border-gray-200 text-sono-dark text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sono-primary outline-none font-bold"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="상태 변경 메모 (선택 사항)"
                                    className="w-full bg-white border border-gray-200 text-sono-dark text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sono-primary outline-none min-h-[60px]"
                                />
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
                        </div>
                        <div className="space-y-3">
                            {isAdmin ? (
                                <>
                                    <InputRow label="초회납입일" value={firstPaymentDate} onChange={setFirstPaymentDate} type="date" />
                                    <InputRow label="신규등록일" value={registrationDate} onChange={setRegistrationDate} type="date" />
                                    <InputRow label="납입방법" value={paymentMethod} onChange={setPaymentMethod} placeholder="ex) 신용카드, 계좌이체" />
                                    <InputRow label="해약처리" value={cancellationProcessing} onChange={setCancellationProcessing} type="date" />
                                    <InputRow label="청약철회" value={withdrawalProcessing} onChange={setWithdrawalProcessing} type="date" />
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
                            {isAdmin ? (
                                <>
                                    <InputRow label="고객명" value={customerName} onChange={setCustomerName} showCopy />
                                    <InputRow label="연락처" value={customerPhone} onChange={setCustomerPhone} placeholder="010-0000-0000" showCopy showCopyNoHyphen />
                                    <InputRow label="생년월일" value={customerBirth} onChange={setCustomerBirth} placeholder="YYMMDD" />
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-gray-400 font-medium shrink-0">성별</span>
                                        <select
                                            value={customerGender}
                                            onChange={(e) => setCustomerGender(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none"
                                        >
                                            <option value="남성">남성</option>
                                            <option value="여성">여성</option>
                                        </select>
                                    </div>
                                    <InputRow label="우편번호" value={customerZipcode} onChange={setCustomerZipcode} />
                                    <InputRow label="주소" value={customerAddress} onChange={setCustomerAddress} />
                                </>
                            ) : (
                                <>
                                    <InfoRow label="고객명" value={application.customerName} showCopy />
                                    <InfoRow label="연락처" value={application.customerPhone} showCopy showCopyNoHyphen />
                                    <InfoRow label="생년월일" value={application.customerBirth} />
                                    <InfoRow label="성별" value={application.customerGender} />
                                    <InfoRow label="주소" value={`${application.customerAddress} ${application.customerZipcode}`} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">신청 상품 정보</h3>
                        <div className="space-y-3">
                            {isAdmin ? (
                                <>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-gray-400 font-medium shrink-0">상품 유형</span>
                                        <select
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value as any)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none"
                                        >
                                            <option value="happy450">더 해피 450 ONE</option>
                                            <option value="smartcare">스마트케어</option>
                                        </select>
                                    </div>
                                    <InputRow label="가전제품" value={products} onChange={setProducts} />
                                    <InputRow label="플랜" value={planType} onChange={setPlanType} />
                                    <InputRow label="문의사항" value={inquiry} onChange={setInquiry} />
                                    <InputRow label="선호 시간" value={preferredContactTime} onChange={setPreferredContactTime} />
                                </>
                            ) : (
                                <>
                                    <InfoRow label="상품 유형" value={getProductTypeLabel(application.productType)} />
                                    <InfoRow label="가전제품" value={application.products || '-'} />
                                    <InfoRow label="플랜" value={application.planType ? (application.planType.includes("구좌") ? application.planType : `${application.planType}구좌`) : '-'} />
                                    <InfoRow label="문의사항" value={application.inquiry || '-'} />
                                    <InfoRow label="선호 시간" value={application.preferredContactTime || '-'} />
                                </>
                            )}
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

                {/* Sticky Bottom Save Bar */}
                {isAdmin && (
                    <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 rounded-b-[24px]">
                        <button
                            onClick={handleSaveAll}
                            disabled={isLoading}
                            className="w-full bg-sono-primary text-white text-base font-bold py-3.5 rounded-2xl shadow-lg shadow-sono-primary/20 hover:bg-sono-secondary transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>처리 중...</span>
                                </>
                            ) : (
                                "수정사항 저장하기"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
}

function InfoRow({ label, value, showCopy, showCopyNoHyphen }: { label: string, value: string, showCopy?: boolean, showCopyNoHyphen?: boolean }) {
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("복사되었습니다.");
        } catch (err) {
            console.error("복사에 실패했습니다.", err);
        }
    };

    return (
        <div className="flex text-sm items-start md:items-center py-0.5">
            <span className="w-24 text-gray-400 font-medium shrink-0 pt-1 md:pt-0">{label}</span>
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
                <span className="text-sono-dark font-medium break-all">{value}</span>
                <div className="flex gap-1">
                    {showCopy && (
                        <button 
                            onClick={() => handleCopy(value)} 
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors border border-gray-200"
                            title={label === '연락처' ? "전체 복사" : "복사"}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    )}
                    {showCopyNoHyphen && (
                        <button 
                            onClick={() => handleCopy(value.replace(/-/g, ''))} 
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"
                            title="숫자만 복사"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[9px] font-bold text-sono-primary tracking-tighter">123</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputRow({ label, value, onChange, placeholder, type = "text", showCopy, showCopyNoHyphen }: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder?: string, 
    type?: string,
    showCopy?: boolean,
    showCopyNoHyphen?: boolean
}) {
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("복사되었습니다.");
        } catch (err) {
            console.error("복사에 실패했습니다.", err);
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="w-24 text-gray-400 font-medium shrink-0">{label}</span>
            <div className="flex-1 flex gap-1.5 items-center">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                />
                <div className="flex gap-1 shrink-0">
                    {showCopy && (
                        <button 
                            type="button"
                            onClick={() => handleCopy(value)}
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors border border-gray-200"
                            title={label === '연락처' ? "전체 복사" : "복사"}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    )}
                    {showCopyNoHyphen && (
                        <button 
                            type="button"
                            onClick={() => handleCopy(value.replace(/-/g, ''))}
                            className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"
                            title="숫자만 복사"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[9px] font-bold text-sono-primary tracking-tighter">123</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

