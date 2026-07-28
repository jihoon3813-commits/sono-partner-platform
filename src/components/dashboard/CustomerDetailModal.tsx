"use client";

import { useState, useEffect, useRef } from "react";
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
    currentUserRole?: string;
}

export default function CustomerDetailModal({ application, onClose, onUpdate, isAdmin = false, partnerLoginId, currentUserRole = "master" }: CustomerDetailModalProps) {
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);
    const statusHistory = useQuery(api.applications.getStatusHistory, { applicationNo: application.applicationNo });


    const getStatusStyles = (status: string) => {
        return getDynamicStatusStyles(status, dbStatuses);
    };

    const getDisplayStatus = (statusVal: string) => {
        if (currentUserRole === 'tm' && (statusVal === '정산예정' || statusVal === '정산완료')) {
            return '정상가입';
        }
        return statusVal || "접수대기";
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

    const formatHistoryDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
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
    const [detailAddress, setDetailAddress] = useState(""); // 상세주소 분리

    // 신청 상품 정보
    const [productType, setProductType] = useState(application.productType || "happy450");
    const [products, setProducts] = useState(application.products || "");
    const [planType, setPlanType] = useState(application.planType || "1구좌");
    const [inquiry, setInquiry] = useState(application.inquiry || "");
    const [preferredContactTime, setPreferredContactTime] = useState(application.preferredContactTime || "");

    const [isSavingDetails, setIsSavingDetails] = useState(false);

    // 주소 검색 스크립트 로드
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleAddressSearch = () => {
        // @ts-ignore
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                let addr = data.roadAddress;
                let extraAddr = '';

                if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                    extraAddr += data.bname;
                }
                if (data.buildingName !== '' && data.apartment === 'Y') {
                    extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                }
                if (extraAddr !== '') {
                    extraAddr = ' (' + extraAddr + ')';
                }

                setCustomerAddress(addr + extraAddr);
                setDetailAddress(""); // 주소 검색 시 상세주소 초기화
            },
        }).open();
    };

    const handleSaveAll = async () => {
        setIsLoading(true);
        try {
            // 상세주소가 있으면 기본 주소 뒤에 붙여서 저장
            const fullAddress = detailAddress.trim() 
                ? `${customerAddress.trim()} ${detailAddress.trim()}` 
                : customerAddress.trim();

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
                    customerAddress: fullAddress,
                    customerZipcode: "", // 우편번호 삭제
                    productType,
                    products,
                    planType,
                    inquiry,
                    preferredContactTime,
                    changedBy: isAdmin ? "admin" : (partnerLoginId || "unknown"),
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
    
    // Filter statuses based on isAdmin and isPartnerVisible flag
    const rawStatusOptions = dbStatuses 
        ? dbStatuses
            .filter(s => isAdmin || s.isPartnerVisible)
            .map(s => s.label) 
        : defaultStatusOptions;

    const statusOptions = currentUserRole === 'tm'
        ? rawStatusOptions.filter(opt => opt !== '정산예정' && opt !== '정산완료')
        : rawStatusOptions;

    const isRestrictedStatus = currentUserRole === 'tm' && (application.status === '정산예정' || application.status === '정산완료');
    const canPartnerEditStatus = !isAdmin && statusOptions.length > 0 && !isRestrictedStatus;

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
                        <label className="text-xs font-bold text-gray-500 mb-2 block">진행 상태 {(isAdmin || canPartnerEditStatus) ? '변경' : ''}</label>
                        {(isAdmin || canPartnerEditStatus) ? (
                            <div className="space-y-3">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                                    className="w-full bg-white border border-gray-200 text-sono-dark text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sono-primary outline-none font-bold"
                                >
                                    {/* 현재 상태가 목록에 없더라도 표시될 수 있게 함 (이미 설정된 상태가 파트너 비노출인 경우 등) */}
                                    {!statusOptions.includes(status) && (
                                        <option value={status}>{getDisplayStatus(status)} (변경불가)</option>
                                    )}
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
                                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getStatusStyles(getDisplayStatus(application.status))}`}>
                                    {getDisplayStatus(application.status)}
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
                                    <InputRow label="신규등록일" value={registrationDate} onChange={setRegistrationDate} type="date" />
                                    <InputRow label="초회납입일" value={firstPaymentDate} onChange={setFirstPaymentDate} type="date" />
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-gray-400 font-medium shrink-0">납입방법</span>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                        >
                                            <option value="">선택하세요</option>
                                            <option value="신용카드">신용카드</option>
                                            <option value="계좌이체">계좌이체</option>
                                        </select>
                                    </div>
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
                                    <InfoRow label="신규등록일" value={formatDate(application.registrationDate) || '-'} />
                                    <InfoRow label="초회납입일" value={formatDate(application.firstPaymentDate) || '-'} />
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
                            {/* Customer Info - Now editable by both Admin and Partners */}
                            <InputRow label="고객명" value={customerName} onChange={setCustomerName} showCopy />
                            <InputRow label="연락처" value={customerPhone} onChange={setCustomerPhone} placeholder="010-0000-0000" showCopy showCopyNoHyphen />
                            <InputRow label="생년월일" value={customerBirth} onChange={setCustomerBirth} placeholder="YYMMDD" />
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-24 text-gray-400 font-medium shrink-0">성별</span>
                                <select
                                    value={customerGender}
                                    onChange={(e) => setCustomerGender(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                >
                                    <option value="-">미지정</option>
                                    <option value="남성">남성</option>
                                    <option value="여성">여성</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-24 text-gray-400 font-medium shrink-0">주소</span>
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={customerAddress}
                                            readOnly
                                            placeholder="주소 검색을 이용하세요"
                                            className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 outline-none h-[34px]"
                                        />
                                        <button
                                            onClick={handleAddressSearch}
                                            className="px-3 py-1.5 bg-sono-primary text-white text-[11px] font-bold rounded-lg hover:bg-sono-secondary transition-colors shrink-0"
                                        >
                                            주소 검색
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-24 text-gray-400 font-medium shrink-0">상세주소</span>
                                    <input
                                        type="text"
                                        value={detailAddress}
                                        onChange={(e) => setDetailAddress(e.target.value)}
                                        placeholder="상세주소를 입력하세요"
                                        className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">신청 상품 정보</h3>
                        <div className="space-y-3">
                            {/* Application Product Info - Now editable by both Admin and Partners */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-24 text-gray-400 font-medium shrink-0">상품 유형</span>
                                <select
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value as any)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                >
                                    <option value="happy450">더 해피 450 ONE</option>
                                    <option value="smartcare">스마트케어</option>
                                </select>
                            </div>
                            <InputRow label="가전제품" value={products} onChange={setProducts} />
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-24 text-gray-400 font-medium shrink-0">구좌</span>
                                <select
                                    value={planType}
                                    onChange={(e) => setPlanType(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                >
                                    {!["1구좌", "2구좌", "3구좌"].includes(planType) && planType && (
                                        <option value={planType}>{planType}</option>
                                    )}
                                    <option value="1구좌">1구좌</option>
                                    <option value="2구좌">2구좌</option>
                                    <option value="3구좌">3구좌</option>
                                </select>
                            </div>
                            <InputRow label="문의사항" value={inquiry} onChange={setInquiry} />
                            <div className="flex items-center gap-2 text-sm">
                                <span className="w-24 text-gray-400 font-medium shrink-0">선호 시간</span>
                                <select
                                    value={preferredContactTime}
                                    onChange={(e) => setPreferredContactTime(e.target.value)}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px]"
                                >
                                    <option value="">선택하세요</option>
                                    {preferredContactTime && !["10:00~11:00", "11:00~12:00", "14:00~15:00", "15:00~16:00", "16:00~17:00", "17:00~18:00", "10시~11시", "11시~12시", "14시~15시", "15시~16시", "16시~17시", "17시~18시"].includes(preferredContactTime) && (
                                        <option value={preferredContactTime}>{preferredContactTime}</option>
                                    )}
                                    <option value="10:00~11:00">10:00~11:00</option>
                                    <option value="11:00~12:00">11:00~12:00</option>
                                    <option value="14:00~15:00">14:00~15:00</option>
                                    <option value="15:00~16:00">15:00~16:00</option>
                                    <option value="16:00~17:00">16:00~17:00</option>
                                    <option value="17:00~18:00">17:00~18:00</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">파트너 정보</h3>
                        <div className="space-y-3">
                            <InfoRow label="파트너사" value={application.partnerName} />
                            <InfoRow label="파트너 ID" value={partnerLoginId || application.partnerId} />
                            <InfoRow label="접속경로" value={application.accessPath === 'H' ? '홈페이지 (H)' : '직접등록 (D)'} />
                            <InfoRow label="회원번호" value={application.partnerMemberId || '-'} />
                            <InfoRow label="신청일시" value={formatDate(application.registrationDate || application.createdAt) || '-'} />
                        </div>
                    </div>

                    {/* Status History Section */}
                    <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-sm font-bold text-sono-primary mb-3">상태 변경 이력</h3>
                        <div className="space-y-4">
                            {statusHistory === undefined ? (
                                <div className="text-xs text-gray-400 py-2">이력을 불러오는 중...</div>
                            ) : statusHistory.length === 0 ? (
                                <div className="text-xs text-gray-400 py-2">변경 이력이 없습니다.</div>
                            ) : (
                                <div className="relative pl-4 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                    {statusHistory.map((history: any, idx: number) => (
                                        <div key={history.historyId} className="relative">
                                            <div className="absolute -left-[9px] top-1.5 w-3 h-3 rounded-full bg-gray-200 border-2 border-white" />
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getDynamicStatusStyles(getDisplayStatus(history.newStatus), dbStatuses)}`}>
                                                        {getDisplayStatus(history.newStatus)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {formatHistoryDate(history.changedAt)}
                                                    </span>
                                                </div>
                                                {history.memo && (
                                                    <p className="text-xs text-sono-dark mt-1 font-medium bg-white p-2 rounded-lg border border-gray-100/50">
                                                        {history.memo}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex justify-end">
                                                    <span className="text-[9px] text-gray-400">작업자: {history.changedBy}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* Sticky Bottom Save Bar - Always visible if anything is editable */}
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
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("복사되었습니다.");
        } catch (err) {
            console.error("복사에 실패했습니다.", err);
        }
    };

    const handleDateClick = () => {
        if (type === 'date' && inputRef.current) {
            try {
                inputRef.current.showPicker?.();
            } catch (err) {
                // browser fallback
            }
        }
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <span 
                className={`w-24 text-gray-400 font-medium shrink-0 ${type === 'date' ? 'cursor-pointer hover:text-sono-primary transition-colors' : ''}`}
                onClick={handleDateClick}
            >
                {label}
            </span>
            <div className="flex-1 flex gap-1.5 items-center">
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onClick={handleDateClick}
                    placeholder={placeholder}
                    className={`flex-1 bg-gray-50 border border-gray-200 text-sono-dark text-sm rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-sono-primary outline-none h-[34px] ${type === 'date' ? 'cursor-pointer' : ''}`}
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

