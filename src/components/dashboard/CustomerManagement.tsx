import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application, Partner, ApplicationStatus } from "@/lib/types";
import CustomerDetailModal from "./CustomerDetailModal";
import CustomerRegistrationModal from "./CustomerRegistrationModal";
import BulkUploadModal from "./BulkUploadModal";
import { getStatusStyles as getDynamicStatusStyles } from "@/lib/statusUtils";

interface CustomerManagementProps {
    applications: Application[];
    onRefresh: () => void;
    partners?: Partner[];
    isWidget?: boolean;
    isAdmin?: boolean;
    initialStatusFilter?: string;
    currentUser?: Partner | null;
    // Added props for state lifting
    dateFilter?: string;
    setDateFilter?: (val: string) => void;
    customStartDate?: string;
    setCustomStartDate?: (val: string) => void;
    customEndDate?: string;
    setCustomEndDate?: (val: string) => void;
}

export default function CustomerManagement({ 
    applications, 
    onRefresh, 
    partners = [], 
    isWidget = false, 
    isAdmin = false, 
    initialStatusFilter = "all", 
    currentUser = null,
    dateFilter: liftedDateFilter,
    setDateFilter: liftedSetDateFilter,
    customStartDate: liftedCustomStartDate,
    setCustomStartDate: liftedSetCustomStartDate,
    customEndDate: liftedCustomEndDate,
    setCustomEndDate: liftedSetCustomEndDate
}: CustomerManagementProps) {
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);

    const getStatusStyles = (status: string) => {
        return getDynamicStatusStyles(status, dbStatuses);
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

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showStatusHelp, setShowStatusHelp] = useState(false);
    const [checkingApp, setCheckingApp] = useState<Application | null>(null);
    const confirmDuplicate = useMutation(api.applications.confirmDuplicate);
    const confirmAdditional = useMutation(api.applications.confirmAdditional);

    const deleteApplications = useMutation(api.applications.deleteApplications);
    const fixGenderData = useMutation(api.applications.fixGenderData);
    const updateMultipleApplicationStatuses = useMutation(api.applications.updateMultipleApplicationStatuses);

    const [bulkStatus, setBulkStatus] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
    const [productFilter, setProductFilter] = useState<string>("all");
    const [partnersFilter, setPartnersFilter] = useState<string>("all");
    // Filters (Internal state fallback if not provided as props)
    const [_internalDateFilter, _setInternalDateFilter] = useState<string>("all");
    const [_internalCustomStartDate, _setInternalCustomStartDate] = useState("");
    const [_internalCustomEndDate, _setInternalCustomEndDate] = useState("");

    const dateFilter = liftedDateFilter || _internalDateFilter;
    const setDateFilter = liftedSetDateFilter || _setInternalDateFilter;
    const customStartDate = liftedCustomStartDate || _internalCustomStartDate;
    const setCustomStartDate = liftedSetCustomStartDate || _setInternalCustomStartDate;
    const customEndDate = liftedCustomEndDate || _internalCustomEndDate;
    const setCustomEndDate = liftedSetCustomEndDate || _setInternalCustomEndDate;

    // Sorting
    const [sortBy, setSortBy] = useState<"updatedAt" | "createdAtAsc" | "createdAtDesc">("updatedAt");

    // Pagination
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (initialStatusFilter) {
            setStatusFilter(initialStatusFilter);
        }
    }, [initialStatusFilter]);

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, productFilter, partnersFilter, dateFilter, customStartDate, customEndDate, itemsPerPage, sortBy]);

    // Fetch dynamic statuses

    
    // Default fallback statuses
    const defaultStatuses = ['접수대기', '접수완료', '부재', '보류', '불가', '거부', '접수취소', '녹취완료(출금확인중)', '정상가입', '배송완료', '청약철회', '해약', '정산완료'];
    
    // Combine dynamic and default statuses (ensure unique)
    const rawAvailableStatuses = dbStatuses 
        ? dbStatuses.map(s => s.label) 
        : defaultStatuses;
    
    const availableStatuses = currentUser?.role === 'tm'
        ? rawAvailableStatuses.filter(s => s !== "정산예정" && s !== "정산완료")
        : rawAvailableStatuses;

    const statusOptions = ['전체', ...availableStatuses];

    // 상품 종류 추출 (전체 고객 데이터 기반)
    const productOptions = ['전체', ...Array.from(new Set(applications.map(app => getProductTypeLabel(app.productType)).filter(Boolean)))];

    const dateOptions = [
        { label: '전체', value: 'all' },
        { label: '당일', value: 'today' },
        { label: '전일', value: 'yesterday' },
        { label: '당월', value: 'month' },
        { label: '전월', value: 'lastMonth' },
        { label: '3개월', value: '3months' },
        { label: '6개월', value: '6months' },
        { label: '1년', value: '1year' },
        { label: '기간선택', value: 'custom' },
    ];

    // KST 기준 오늘 및 이번 달 계산
    const kstNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000);
    const today = kstNow.toISOString().slice(0, 10);
    const thisMonth = kstNow.toISOString().slice(0, 7);

    const getStartDateStr = (filter: string) => {
        const d = new Date(kstNow);
        switch (filter) {
            case '3months': d.setMonth(kstNow.getMonth() - 3); break;
            case '6months': d.setMonth(kstNow.getMonth() - 6); break;
            case '1year': d.setFullYear(kstNow.getFullYear() - 1); break;
            default: return "";
        }
        return d.toISOString().slice(0, 10);
    };

    // 1. Initial filtered applications based on search, date, and basic criteria
    const initialFiltered = (applications || []).filter(app => {
        if (!app) return false;

        // Search Match (Defensive)
        const name = (app.customerName || "").toLowerCase();
        const cleanName = name.replace(/\s+/g, "");
        const phone = (app.customerPhone || "");
        const cleanPhone = phone.replace(/\s+/g, "");
        const pName = (app.partnerName || "").toLowerCase();
        const pId = (app.partnerId || "").toLowerCase();
        const sTerm = (searchTerm || "").toLowerCase().trim();
        const cleanSTerm = sTerm.replace(/\s+/g, "");
        
        // Wildcard search support (e.g., 김*훈)
        let nameMatch = cleanName.includes(cleanSTerm);
        if (cleanSTerm.includes('*') && cleanSTerm.length >= 2) {
            const parts = cleanSTerm.split('*');
            if (parts.length === 2) {
                const start = parts[0];
                const end = parts[1];
                nameMatch = cleanName.startsWith(start) && cleanName.endsWith(end);
            }
        }

        const searchMatch = nameMatch || cleanPhone.includes(cleanSTerm) || pName.includes(sTerm) || pId.includes(sTerm);
        if (!searchMatch) return false;

        // Date Filter
        if (dateFilter && dateFilter !== "all") {
            // 기준 날짜: 가입일(registrationDate)이 있으면 우선 사용, 없으면 신청일(createdAt) 사용
            let refDateStr = app.registrationDate || app.createdAt || "";
            
            // Excel 시리얼 번호 등 비표준 형식 처리 (formatDate 헬퍼와 유사한 로직)
            if (app.registrationDate && !app.registrationDate.includes('-')) {
                const serial = parseFloat(String(app.registrationDate));
                if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                    const d = new Date((serial - 25569) * 86400 * 1000);
                    refDateStr = d.toISOString().slice(0, 10);
                }
            }

            // KST 날짜 부분 추출 (YYYY-MM-DD)
            const kstDatePart = refDateStr.includes('T') 
                ? refDateStr.slice(0, 10) 
                : refDateStr.split(' ')[0].replace(/\./g, '-').trim();

            if (dateFilter === "today") {
                if (kstDatePart !== today) return false;
            } else if (dateFilter === "yesterday") {
                const d = new Date(kstNow);
                d.setDate(d.getDate() - 1);
                const yesterday = d.toISOString().slice(0, 10);
                if (kstDatePart !== yesterday) return false;
            } else if (dateFilter === "month") {
                if (kstDatePart.slice(0, 7) !== thisMonth) return false;
            } else if (dateFilter === "lastMonth") {
                const d = new Date(kstNow);
                d.setMonth(d.getMonth() - 1);
                const lastMonth = d.toISOString().slice(0, 7);
                if (kstDatePart.slice(0, 7) !== lastMonth) return false;
            } else if (dateFilter === 'custom') {
                // 기간 선택 시에도 표시되는 날짜(기준일)를 기준으로 비교
                if (customStartDate && kstDatePart < customStartDate) return false;
                if (customEndDate && kstDatePart > customEndDate) return false;
            } else {
                const startDateStr = getStartDateStr(dateFilter);
                if (startDateStr && kstDatePart < startDateStr) return false;
            }
        }

        // Admin's Partner Filter (Robust comparison)
        if (isAdmin && partnersFilter !== "all") {
            const selectedPartner = partners.find(p => p.partnerId === partnersFilter);
            if (selectedPartner) {
                const appPartnerId = String(app.partnerId || "").trim();
                const appPartnerName = String(app.partnerName || "").trim();
                
                const matchesId = appPartnerId === selectedPartner.partnerId;
                const matchesLoginId = appPartnerId === selectedPartner.loginId;
                const matchesName = appPartnerName === selectedPartner.companyName;
                
                if (!matchesId && !matchesLoginId && !matchesName) return false;
            } else {
                // Fallback for ID only if partner not found in list (shouldn't happen)
                if (String(app.partnerId || "").trim() !== String(partnersFilter).trim()) return false;
            }
        }

        return true;
    });

    // 2. Status & Product Filter
    const filteredApplications = initialFiltered.filter(app => {
        // Status Filter
        const appStatus = app.status || "접수대기";
        const displayStatus = (currentUser?.role === 'tm' && (appStatus === '정산예정' || appStatus === '정산완료'))
            ? '정상가입'
            : appStatus;
        const statusMatch = statusFilter === "all" || displayStatus === statusFilter;
        if (!statusMatch) return false;

        // Product Filter
        const appProductLabel = getProductTypeLabel(app.productType);
        const productMatch = productFilter === "all" || appProductLabel === productFilter;

        return productMatch;
    });

    const getDisplayStatus = (status: string) => {
        if (currentUser?.role === 'tm' && (status === '정산예정' || status === '정산완료')) {
            return '정상가입';
        }
        return status || "접수대기";
    };

    const formatDate = (val: string | undefined | number) => {
        if (!val) return "-";

        // Excel serial handling
        const serial = typeof val === 'number' ? val : parseFloat(String(val));
        if (!isNaN(serial) && serial > 30000 && serial < 60000) {
            const date = new Date((serial - 25569) * 86400 * 1000);
            return date.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
                .replace(/\. /g, '-').replace('.', '');
        }

        try {
            const d = new Date(String(val));
            if (isNaN(d.getTime())) return String(val);
            return d.toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })
                .replace(/\. /g, '-').replace('.', '');
        } catch {
            return String(val);
        }
    };

    const getPartnerLoginId = (partnerId: string, partnerName?: string) => {
        if (!partners || partners.length === 0) return partnerId;

        let p = partners.find(p => p.partnerId === partnerId);
        if (!p && partnerName) {
            p = partners.find(p => p.companyName === partnerName);
        }
        return p?.loginId || partnerId;
    };

    // 3. Sorting logic
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        if (sortBy === "updatedAt") {
            const timeA = new Date(a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
        } else if (sortBy === "createdAtDesc") {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
        } else if (sortBy === "createdAtAsc") {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeA - timeB;
        }
        return 0;
    });

    // Calculate pagination
    const totalPages = Math.ceil(sortedApplications.length / itemsPerPage);
    const paginatedApplications = sortedApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const displayApplications = isWidget ? sortedApplications.slice(0, 10) : paginatedApplications;

    return (
        <div className={isWidget ? "" : "space-y-6"}>
            {isWidget ? (
                <div className="bg-white p-6 pb-0 rounded-t-2xl shadow-none space-y-2">
                    <h2 className="text-xl font-bold text-sono-dark">고객 상담 내역(최근 10건)</h2>
                    <p className="text-sm text-gray-500 whitespace-nowrap">고객 상태 변경 기준, 최근 10건 고객리스트입니다</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    {/* Header Row: Title & Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-2xl font-black text-sono-dark tracking-tighter">고객 상담 내역</h2>
                            <p className="text-sm text-gray-400 mt-1.5 font-medium">총 <span className="text-sono-primary font-bold">{filteredApplications.length}</span>건의 신청 내역이 있습니다.</p>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar whitespace-nowrap py-1">
                            <button
                                onClick={() => setIsRegistrationModalOpen(true)}
                                className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-sono-dark text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-black transition-all shadow-md active:scale-95 text-center whitespace-nowrap shrink-0"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>고객 직접 등록</span>
                            </button>
                            
                            {isAdmin && selectedAppIds.length > 0 && (
                                <>
                                    <button
                                        onClick={async () => {
                                            if (confirm(`선택한 ${selectedAppIds.length}건을 삭제하시겠습니까?`)) {
                                                setIsDeleting(true);
                                                try {
                                                    await deleteApplications({ applicationNos: selectedAppIds });
                                                    setSelectedAppIds([]);
                                                    onRefresh();
                                                    alert("삭제되었습니다.");
                                                } catch (err) {
                                                    console.error("Delete failed", err);
                                                    alert("삭제 중 오류가 발생했습니다.");
                                                } finally {
                                                    setIsDeleting(false);
                                                }
                                            }
                                        }}
                                        disabled={isDeleting}
                                        className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-100 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>선택 삭제 ({selectedAppIds.length})</span>
                                    </button>

                                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-1 rounded-xl shadow-sm shrink-0 whitespace-nowrap">
                                        <select
                                            value={bulkStatus}
                                            onChange={(e) => setBulkStatus(e.target.value)}
                                            className="bg-white border border-gray-200 text-sono-dark text-xs rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none font-bold shadow-sm"
                                        >
                                            <option value="" disabled>변경할 상태 선택</option>
                                            {availableStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={async () => {
                                                if (!bulkStatus) {
                                                    alert("변경할 상태를 선택해 주세요.");
                                                    return;
                                                }
                                                if (confirm(`선택한 ${selectedAppIds.length}건의 상태를 '${bulkStatus}'(으)로 일괄 변경하시겠습니까?`)) {
                                                    setIsUpdatingStatus(true);
                                                    try {
                                                        const count = await updateMultipleApplicationStatuses({
                                                            applicationNos: selectedAppIds,
                                                            newStatus: bulkStatus,
                                                            changedBy: "admin",
                                                            memo: "본사 어드민 상태 일괄 변경"
                                                        });
                                                        setSelectedAppIds([]);
                                                        setBulkStatus("");
                                                        onRefresh();
                                                        alert(`${count}건의 고객 상태가 변경되었습니다.`);
                                                    } catch (err) {
                                                        console.error("Bulk status update failed", err);
                                                        alert("상태 변경 중 오류가 발생했습니다.");
                                                    } finally {
                                                        setIsUpdatingStatus(false);
                                                    }
                                                }
                                            }}
                                            disabled={isUpdatingStatus || !bulkStatus}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isUpdatingStatus ? (
                                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                                            ) : (
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                </svg>
                                            )}
                                            <span>상태 일괄 변경</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={() => setIsBulkUploadModalOpen(true)}
                                    className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>본사 엑셀 업로드</span>
                                </button>
                            )}

                            {isAdmin && (
                                <button
                                    onClick={async () => {
                                        const mode = confirm("기존 데이터를 표준화(남/여 -> 남성/여성)하시겠습니까?\n\n'취소'를 누르면 기존 모든 성별 데이터를 '미지정(-)'으로 초기화할 수 있는 옵션이 나타납니다.");
                                        if (mode) {
                                            const res = await fixGenderData({ resetToUnspecified: false });
                                            alert(`${res.updated}건의 데이터가 표준화되었습니다.`);
                                        } else {
                                            if (confirm("모든 기존 성별 데이터를 '미지정(-)'으로 초기화하시겠습니까?\n(잘못 입력된 '남성' 데이터를 정리할 때 사용합니다)")) {
                                                const res = await fixGenderData({ resetToUnspecified: true });
                                                alert(`${res.updated}건의 데이터가 초기화되었습니다.`);
                                            }
                                        }
                                        onRefresh();
                                    }}
                                    className="flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-xs sm:text-sm font-bold hover:bg-amber-100 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>성별 데이터 보정</span>
                                </button>
                            )}

                            <button
                                onClick={async () => {
                                    if (!filteredApplications || filteredApplications.length === 0) {
                                        alert("다운로드할 데이터가 없습니다.");
                                        return;
                                    }
                                    if (isDownloading) return;

                                    setIsDownloading(true);
                                    try {
                                        // Give UI time to show loading state
                                        await new Promise(resolve => setTimeout(resolve, 100));

                                        const headers = [
                                            "No.", "신청번호", "신청일시", "파트너사", "시스템ID", "로그인ID", "고객명", "연락처",
                                            "상품명", "결합제품(가전)", "신청구좌", "주소", "우편번호", "생년월일",
                                            "성별", "이메일", "회원번호", "선호시간", "문의사항", "상태",
                                            "초회납입일", "신규등록일", "납입방법", "해약처리", "청약철회", "비고(사유)"
                                        ];

                                        const rows = filteredApplications.map((app, index) => [
                                            filteredApplications.length - index,
                                            app.applicationNo,
                                            new Date(app.createdAt).toLocaleString(),
                                            app.partnerName,
                                            app.partnerId,
                                            getPartnerLoginId(app.partnerId),
                                            app.customerName,
                                            app.customerPhone,
                                            app.productType,
                                            app.products || "-",
                                            app.planType,
                                            app.customerAddress,
                                            app.customerZipcode,
                                            app.customerBirth || "-",
                                            app.customerGender || "-",
                                            app.customerEmail || "-",
                                            app.partnerMemberId || "-",
                                            app.preferredContactTime || "-",
                                            app.inquiry?.replace(/\n/g, " ") || "-",
                                            getDisplayStatus(app.status),
                                            app.firstPaymentDate || "-",
                                            app.registrationDate || "-",
                                            app.paymentMethod || "-",
                                            app.cancellationProcessing || "-",
                                            app.withdrawalProcessing || "-",
                                            app.remarks?.replace(/\n/g, " ") || "-"
                                        ]);

                                        const csvContent = [
                                            headers.join(","),
                                            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
                                        ].join("\n");

                                        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
                                        const link = document.createElement("a");
                                        const url = URL.createObjectURL(blob);
                                        link.setAttribute("href", url);
                                        link.setAttribute("download", `고객상담내역_${new Date().toISOString().slice(0, 10)}.csv`);
                                        link.style.visibility = "hidden";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Excel download error:", error);
                                        alert("다운로드 중 오류가 발생했습니다.");
                                    } finally {
                                        setIsDownloading(false);
                                    }
                                }}
                                disabled={isDownloading}
                                className={`flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-sono-primary/10 text-sono-primary border border-sono-primary/20 rounded-xl text-xs sm:text-sm font-bold hover:bg-sono-primary/20 transition-all active:scale-95 text-center whitespace-nowrap shrink-0 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isDownloading ? (
                                    <div className="w-4 h-4 border-2 border-sono-primary/30 border-t-sono-primary rounded-full animate-spin shrink-0" />
                                ) : (
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                )}
                                <span>{isDownloading ? '준비 중...' : '엑셀 다운로드'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar: Search & Selects */}
                    <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <div className="relative flex-1 w-full">
                            <input
                                type="text"
                                placeholder="고객명, 연락처, 파트너사명 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-sono-primary focus:border-transparent outline-none w-full shadow-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
                            {isAdmin && partners.length > 0 && (
                                <select
                                    value={partnersFilter}
                                    onChange={(e) => setPartnersFilter(e.target.value)}
                                    className="col-span-2 sm:flex-none bg-white border border-gray-200 text-sono-dark text-sm rounded-2xl px-4 py-3 focus:ring-2 focus:ring-sono-primary outline-none font-bold shadow-sm sm:min-w-[150px]"
                                >
                                    <option value="all">모든 파트너사</option>
                                    {partners.map(p => (
                                        <option key={p.partnerId} value={p.partnerId}>{p.companyName}</option>
                                    ))}
                                </select>
                            )}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white border border-gray-200 text-sono-dark text-sm rounded-2xl px-3 py-3 focus:ring-2 focus:ring-sono-primary outline-none font-bold shadow-sm"
                            >
                                <option value="updatedAt">최근수정기준</option>
                                <option value="createdAtDesc">등록일시(내림차순)</option>
                                <option value="createdAtAsc">등록일시(오름차순)</option>
                            </select>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="bg-white border border-gray-200 text-sono-dark text-sm rounded-2xl px-3 py-3 focus:ring-2 focus:ring-sono-primary outline-none font-bold shadow-sm"
                            >
                                <option value={20}>20개 보기</option>
                                <option value={50}>50개 보기</option>
                                <option value={100}>100개 보기</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Desktop Filters */}
                        <div className="hidden md:block space-y-4">
                            <div className="flex flex-wrap gap-2 items-center border-b border-gray-100 pb-4">
                                <span className="text-xs font-bold text-gray-400 mr-2">기간</span>
                                {dateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDateFilter(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dateFilter === opt.value
                                            ? "bg-sono-dark text-white"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                                
                                {dateFilter === 'custom' && (
                                    <div className="flex items-center gap-2 ml-2 animate-slide-right">
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-sono-primary bg-white font-bold cursor-pointer"
                                        />
                                        <span className="text-gray-400 text-xs">~</span>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-sono-primary bg-white font-bold cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 items-center border-b border-gray-100 pb-4">
                                <span className="text-xs font-bold text-gray-400 mr-2">상품</span>
                                {productOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setProductFilter(opt === '전체' ? 'all' : opt)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${((productFilter === 'all' && opt === '전체') || productFilter === opt)
                                            ? "bg-indigo-600 text-white"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2 items-center overflow-x-auto pb-2">
                                <span className="text-xs font-bold text-gray-400 mr-2 flex-shrink-0">상태</span>
                                {statusOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setStatusFilter(opt === '전체' ? 'all' : opt)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${(statusFilter === 'all' && opt === '전체') || statusFilter === opt
                                            ? "bg-sono-primary/10 text-sono-primary border border-sono-primary/20"
                                            : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        <div className="md:hidden grid grid-cols-3 gap-2 pb-4 border-b border-gray-100">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 mb-1 block">기간</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-sono-dark text-[11px] rounded-xl px-2 py-2 outline-none font-bold"
                                >
                                    {dateOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 mb-1 block">상품</label>
                                <select
                                    value={productFilter === 'all' ? '전체' : productFilter}
                                    onChange={(e) => setProductFilter(e.target.value === '전체' ? 'all' : e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-sono-dark text-[11px] rounded-xl px-2 py-2 outline-none font-bold"
                                >
                                    {productOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 mb-1 block">상태</label>
                                <select
                                    value={statusFilter === 'all' ? '전체' : statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value === '전체' ? 'all' : e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-sono-dark text-[11px] rounded-xl px-2 py-2 outline-none font-bold"
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Custom Date Input (Mobile Only - kept separate for layout) */}
                        {dateFilter === 'custom' && (
                            <div className="flex md:hidden items-center gap-2 pt-2">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-sono-primary cursor-pointer"
                                />
                                <span className="text-gray-400">~</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-sono-primary cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isWidget && (
                <div className="flex items-center gap-2 px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-indigo-700">
                        가입센터 발신번호 안내 : <span className="text-lg tracking-tight ml-1">1833-8434</span>
                    </span>
                    <span className="text-xs text-indigo-400 font-medium ml-2">고객님께 안내 시 활용해 주세요.</span>
                </div>
            )}

            <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isWidget ? 'shadow-none' : ''}`}>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                {isAdmin && (
                                    <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[40px]">
                                        <input
                                            type="checkbox"
                                            checked={displayApplications.length > 0 && selectedAppIds.length === displayApplications.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAppIds(displayApplications.map(app => app.applicationNo));
                                                } else {
                                                    setSelectedAppIds([]);
                                                }
                                            }}
                                            className="rounded border-gray-300 text-sono-primary focus:ring-sono-primary"
                                        />
                                    </th>
                                )}
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[50px]">경로</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">No.</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center w-[120px]">일시</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">파트너사</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center min-w-[60px]">고객명</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">연락처</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">상품명</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">구좌</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">결합제품</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        상태
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowStatusHelp(true);
                                            }}
                                            className="text-gray-400 hover:text-sono-primary transition-colors flex items-center"
                                            title="상태 용어 설명"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayApplications.length > 0 ? (
                                displayApplications.map((app, index) => {
                                    // 24시간 이내 업데이트 여부 확인 (상태값 변경 기준)
                                    const isUpdated = (() => {
                                        if (!app.statusUpdatedAt) return false;
                                        try {
                                            const updatedAt = new Date(app.statusUpdatedAt).getTime();
                                            const now = new Date().getTime();
                                            return (now - updatedAt) < 24 * 60 * 60 * 1000;
                                        } catch {
                                            return false;
                                        }
                                    })();
                                    return (
                                        <tr
                                            key={app.applicationNo}
                                            onClick={() => setSelectedApp(app)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {isAdmin && (
                                                <td className="px-2 py-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                                                    {isUpdated && (
                                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.5)]" title="업데이트됨" />
                                                    )}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAppIds.includes(app.applicationNo)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedAppIds(prev => [...prev, app.applicationNo]);
                                                            } else {
                                                                setSelectedAppIds(prev => prev.filter(id => id !== app.applicationNo));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-sono-primary focus:ring-sono-primary"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-2 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                                                    app.accessPath === 'H' 
                                                    ? "bg-blue-100 text-blue-600 border border-blue-200" 
                                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                                }`} title={app.accessPath === 'H' ? "홈페이지" : "직접등록"}>
                                                    {app.accessPath || 'D'}
                                                </span>
                                            </td>
                                            <td className={`px-2 py-4 text-center text-xs text-gray-400 font-bold relative ${!isAdmin ? 'pl-4' : ''}`}>
                                                {!isAdmin && isUpdated && (
                                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_4px_rgba(239,68,68,0.5)]" title="업데이트됨" />
                                                )}
                                                {sortedApplications.length - ((currentPage - 1) * itemsPerPage + index)}
                                            </td>
                                            <td className="px-2 py-4 text-xs text-gray-500 text-center whitespace-nowrap">
                                                {app.registrationDate ? formatDate(app.registrationDate) : new Date(app.createdAt).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-2 py-4 text-center whitespace-nowrap">
                                                <div className="text-sm font-bold text-sono-dark">{app.partnerName}</div>
                                                {partners.length > 0 && <div className="text-[10px] text-gray-400 font-bold">{getPartnerLoginId(app.partnerId, app.partnerName)}</div>}
                                            </td>
                                            <td className="px-2 py-4 text-center whitespace-nowrap min-w-[80px]">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="text-sm font-bold text-sono-dark">{app.customerName}</div>
                                                    {app.hasDuplicate && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCheckingApp(app);
                                                            }}
                                                            className={`text-[10px] px-2 py-0.5 rounded-md transition-all font-black shadow-sm border ${
                                                                app.duplicateConfirmed 
                                                                ? (app.isAdditionalRegistration 
                                                                    ? "bg-blue-50 text-blue-600 border-blue-100" 
                                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                                                : "bg-red-50 text-red-600 border-red-100 animate-pulse"
                                                            }`}
                                                        >
                                                            {app.duplicateConfirmed 
                                                                ? (app.isAdditionalRegistration ? "추가 접수" : "중복 확인 완료")
                                                                : "중복 접수"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 text-xs text-center text-gray-500 whitespace-nowrap">
                                                {app.customerPhone}
                                            </td>
                                            <td className="px-2 py-4 text-xs font-bold text-center text-sono-primary whitespace-nowrap">
                                                {getProductTypeLabel(app.productType)}
                                            </td>
                                            <td className="px-2 py-4 text-xs text-center text-gray-600 font-bold whitespace-nowrap">
                                                {app.planType ? (app.planType.includes("구좌") ? app.planType : `${app.planType}구좌`) : "-"}
                                            </td>
                                            <td className="px-2 py-4 text-xs text-center text-gray-500 max-w-[200px] truncate" title={app.products}>
                                                {((app.productType || "").toLowerCase().includes("smart") || (app.productType || "").includes("스마트")) ? (app.products || "-") : "-"}
                                            </td>
                                            <td className="px-2 py-4 text-center whitespace-nowrap">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(getDisplayStatus(app.status))}`}>
                                                    {getDisplayStatus(app.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 10 : 9} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        신청 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {!isWidget && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-4">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-sono-primary disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-sono-primary disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex gap-1 mx-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                        ? "bg-sono-primary text-white shadow-md shadow-sono-primary/20"
                                        : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-sono-primary disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-sono-primary disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {selectedApp && (
                <CustomerDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={onRefresh}
                    isAdmin={isAdmin}
                    partnerLoginId={getPartnerLoginId(selectedApp.partnerId, selectedApp.partnerName)}
                    currentUserRole={currentUser?.role || 'master'}
                />
            )}

            {isRegistrationModalOpen && (
                <CustomerRegistrationModal
                    onClose={() => setIsRegistrationModalOpen(false)}
                    onSuccess={() => {
                        setIsRegistrationModalOpen(false);
                        onRefresh();
                    }}
                    partner={currentUser || null}
                    partners={partners}
                    isAdmin={isAdmin}
                />
            )}

            {isBulkUploadModalOpen && (
                <BulkUploadModal
                    onClose={() => setIsBulkUploadModalOpen(false)}
                    onSuccess={() => {
                        onRefresh();
                    }}
                />
            )}

            {/* 상태 용어 설명 모달 */}
            {showStatusHelp && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowStatusHelp(false)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-sono-dark text-sm">상태 용어 설명</h3>
                            <button onClick={() => setShowStatusHelp(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    <span className="text-xs font-bold text-slate-600">접수대기</span>
                                </div>
                                <p className="text-[11px] text-gray-500 pl-3.5 leading-relaxed">영업자가 등록한 상태</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-blue-600">접수완료</span>
                                </div>
                                <p className="text-[11px] text-gray-500 pl-3.5 leading-relaxed">소노 콜센터에 해피콜 요청한 상태</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                    <span className="text-xs font-bold text-cyan-600">녹취완료(출금확인중)</span>
                                </div>
                                <p className="text-[11px] text-gray-500 pl-3.5 leading-relaxed">계약 녹취(해피콜)는 완료됐으나 1회차 출금확인이 안된 상태(신용카드는 실시간 확인 가능, CMS는 2~3일 소요)</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-emerald-600">정상가입</span>
                                </div>
                                <p className="text-[11px] text-gray-500 pl-3.5 leading-relaxed">1회출금 후 정상 계약 유지 상태</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setShowStatusHelp(false)}
                                className="text-[11px] font-bold text-gray-400 hover:text-sono-dark px-3 py-1 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 중복 확인 모달 */}
            {checkingApp && (
                <DuplicateCheckModal 
                    app={checkingApp} 
                    onClose={() => setCheckingApp(null)} 
                    onConfirm={async (appNo, type) => {
                        try {
                            if (type === 'additional') {
                                await confirmAdditional({ applicationNo: appNo });
                            } else {
                                await confirmDuplicate({ applicationNo: appNo });
                            }
                            setCheckingApp(null);
                            onRefresh();
                        } catch (err) {
                            console.error("Confirm failed", err);
                            alert("확인 처리 중 오류가 발생했습니다.");
                        }
                    }}
                />
            )}
        </div>
    );
}

// 중복 확인 모달 컴포넌트
function DuplicateCheckModal({ app, onClose, onConfirm }: { app: Application, onClose: () => void, onConfirm: (appNo: string, type: 'confirmed' | 'additional') => void }) {
    const duplicates = useQuery(api.applications.checkDuplicateCustomer, {
        customerName: app.customerName || "",
        customerPhone: app.customerPhone || "",
        excludeApplicationNo: app.applicationNo
    });

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-sono-dark tracking-tight">중복 가입 확인</h3>
                        <p className="text-xs text-gray-400 font-bold mt-0.5">{app.customerName}님 / {app.customerPhone}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-sono-dark transition-colors bg-white rounded-xl shadow-sm border border-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {duplicates === undefined ? (
                        <div className="flex flex-col items-center py-10 gap-3">
                            <div className="w-8 h-8 border-4 border-sono-primary/20 border-t-sono-primary rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500 font-bold italic">데이터 조회 중...</p>
                        </div>
                    ) : duplicates.length === 0 ? (
                        <div className="flex flex-col items-center py-10 gap-4">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-black text-emerald-600 tracking-tight">중복 없음</p>
                                <p className="text-sm text-gray-400 font-bold mt-1">해당 고객으로 등록된 다른 내역이 없습니다.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                                <div className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-red-600 tracking-tight">중복 내역 발견</p>
                                    <p className="text-xs text-red-400 font-bold mt-0.5">이미 등록된 {duplicates.length}건의 내역이 있습니다.</p>
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                                {duplicates.map((dup: any) => (
                                    <div key={dup.applicationNo} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-sono-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-sm font-black text-sono-dark group-hover:text-sono-primary transition-colors">{dup.partnerName}</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-500 rounded-md">
                                                {dup.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-1 mt-3">
                                            <div className="text-[11px] text-gray-400 font-bold">신청번호</div>
                                            <div className="text-[11px] text-sono-dark font-bold text-right">{dup.applicationNo}</div>
                                            <div className="text-[11px] text-gray-400 font-bold">등록일시</div>
                                            <div className="text-[11px] text-sono-dark font-bold text-right">{new Date(dup.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                                            {dup.productType && (
                                                <>
                                                    <div className="text-[11px] text-gray-400 font-bold">상품명</div>
                                                    <div className="text-[11px] text-sono-dark font-bold text-right truncate">{dup.productType}</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 mt-8">
                        {!app.duplicateConfirmed && (
                            <>
                                <button 
                                    onClick={() => onConfirm(app.applicationNo, 'confirmed')} 
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                                >
                                    중복 확인
                                </button>
                                <button 
                                    onClick={() => onConfirm(app.applicationNo, 'additional')} 
                                    className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                                >
                                    추가 접수
                                </button>
                            </>
                        )}
                        <button 
                            onClick={onClose} 
                            className={`py-4 bg-sono-dark text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg active:scale-95 ${app.duplicateConfirmed ? 'w-full' : 'flex-1 bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none'}`}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
