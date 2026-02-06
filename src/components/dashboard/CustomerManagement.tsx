import { useState, useEffect } from "react";
import { Application, Partner, ApplicationStatus } from "@/lib/types";
import CustomerDetailModal from "./CustomerDetailModal";

interface CustomerManagementProps {
    applications: Application[];
    onRefresh: () => void;
    partners?: Partner[];
    isWidget?: boolean;
    isAdmin?: boolean;
    initialStatusFilter?: string;
}

export default function CustomerManagement({ applications, onRefresh, partners = [], isWidget = false, isAdmin = false, initialStatusFilter = "all" }: CustomerManagementProps) {
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
            case '청약철회':
                return 'bg-pink-50 text-pink-600 border border-pink-100';
            case '해약완료':
                return 'bg-stone-50 text-stone-600 border border-stone-100';
            default:
                return 'bg-gray-50 text-gray-400 border border-gray-200';
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
    const [productFilter, setProductFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    useEffect(() => {
        if (initialStatusFilter) {
            setStatusFilter(initialStatusFilter);
        }
    }, [initialStatusFilter]);

    const statusOptions = ['전체', '접수', '상담중', '부재', '거부', '접수취소', '계약완료', '1회출금완료', '배송완료', '정산완료', '청약철회', '해약완료'];

    // 상품 종류 추출 (전체 고객 데이터 기반)
    const productOptions = ['전체', ...Array.from(new Set(applications.map(app => app.productType).filter(Boolean)))];

    const dateOptions = [
        { label: '전체', value: 'all' },
        { label: '당월', value: 'month' },
        { label: '3개월', value: '3months' },
        { label: '6개월', value: '6months' },
        { label: '1년', value: '1year' },
        { label: '기간선택', value: 'custom' },
    ];

    const getStartDate = (filter: string) => {
        const now = new Date();
        const d = new Date(now);
        switch (filter) {
            case 'month': d.setDate(1); break;
            case '3months': d.setMonth(now.getMonth() - 3); break;
            case '6months': d.setMonth(now.getMonth() - 6); break;
            case '1year': d.setFullYear(now.getFullYear() - 1); break;
            default: return null;
        }
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const filteredApplications = applications.filter(app => {
        // Search Term
        const searchMatch =
            app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.customerPhone.includes(searchTerm) ||
            app.partnerName.toLowerCase().includes(searchTerm.toLowerCase());

        if (!searchMatch) return false;

        // Status Filter
        if (statusFilter !== 'all' && statusFilter !== '전체' && app.status !== statusFilter) return false;

        // Product Filter
        if (productFilter !== 'all' && productFilter !== '전체' && app.productType !== productFilter) return false;

        // Date Filter
        if (dateFilter !== 'all') {
            const appDate = new Date(app.createdAt);
            if (dateFilter === 'custom') {
                if (customStartDate && new Date(customStartDate) > appDate) return false;
                // End date inclusive (until end of day)
                if (customEndDate) {
                    const end = new Date(customEndDate);
                    end.setHours(23, 59, 59, 999);
                    if (end < appDate) return false;
                }
            } else {
                const startDate = getStartDate(dateFilter);
                if (startDate && appDate < startDate) return false;
            }
        }

        return true;
    });

    const getPartnerLoginId = (partnerId: string) => {
        if (!partners || partners.length === 0) return partnerId;
        const p = partners.find(p => p.partnerId === partnerId);
        return p?.loginId || partnerId;
    };

    const displayApplications = isWidget ? filteredApplications.slice(0, 10) : filteredApplications;

    return (
        <div className={isWidget ? "" : "space-y-6"}>
            {isWidget ? (
                <div className="bg-white p-6 pb-0 rounded-t-2xl shadow-none space-y-2">
                    <h2 className="text-xl font-bold text-sono-dark">고객 상담 내역(최근 10건)</h2>
                    <p className="text-sm text-gray-500 whitespace-nowrap">고객 상태 변경 기준, 최근 10건 고객리스트입니다</p>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-sono-dark">고객 상담 내역</h2>
                                <p className="text-sm text-gray-500 mt-1 whitespace-nowrap">총 {filteredApplications.length}건의 신청 내역이 있습니다.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (filteredApplications.length === 0) {
                                        alert("다운로드할 데이터가 없습니다.");
                                        return;
                                    }

                                    const headers = [
                                        "No.", "신청번호", "신청일시", "파트너사", "시스템ID", "로그인ID", "고객명", "연락처",
                                        "상품명", "결합제품(가전)", "신청구좌", "주소", "우편번호", "생년월일",
                                        "성별", "이메일", "회원번호", "선호시간", "문의사항", "상태"
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
                                        app.status
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
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-sono-primary text-white rounded-xl text-xs font-bold hover:bg-sono-dark transition-all shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                엑셀 다운로드
                            </button>
                        </div>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="고객명, 연락처, 파트너사명 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sono-primary focus:border-transparent outline-none w-full"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
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

                        {/* Custom Date Input (Common) */}
                        {dateFilter === 'custom' && (
                            <div className="flex items-center gap-2 pt-2 md:pt-0">
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-sono-primary"
                                />
                                <span className="text-gray-400">~</span>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-sono-primary"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isWidget ? 'shadow-none' : ''}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">No.</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">일시</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">파트너사</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center min-w-[60px]">고객명</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">연락처</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">주소</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">상품명</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">결합제품명</th>
                                <th className="px-2 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-center">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {displayApplications.length > 0 ? (
                                displayApplications.map((app, index) => (
                                    <tr
                                        key={app.applicationNo}
                                        onClick={() => setSelectedApp(app)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-2 py-4 text-center text-xs text-gray-400 font-bold">
                                            {/* In widget (recent list), this numbering logic might need consistency. 
                                               If users want standard reversed index: */}
                                            {filteredApplications.length - index}
                                        </td>
                                        <td className="px-2 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(app.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-2 py-4 text-center whitespace-nowrap">
                                            <div className="text-sm font-bold text-sono-dark">{app.partnerName}</div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-[10px] text-sono-primary/60 font-mono">{app.partnerId}</div>
                                                {partners.length > 0 && <div className="text-[10px] text-gray-400 font-bold">{getPartnerLoginId(app.partnerId)}</div>}
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 text-center whitespace-nowrap min-w-[60px]">
                                            <div className="text-sm font-medium text-sono-dark">{app.customerName}</div>
                                        </td>
                                        <td className="px-2 py-4 text-xs text-center text-gray-500 whitespace-nowrap">
                                            {app.customerPhone}
                                        </td>
                                        <td className="px-2 py-4 text-xs text-center text-gray-500 max-w-[100px] truncate" title={`${app.customerAddress} ${app.customerZipcode}`}>
                                            {app.customerAddress}
                                        </td>
                                        <td className="px-2 py-4 text-xs font-bold text-center text-sono-primary whitespace-nowrap">
                                            {app.productType}
                                        </td>
                                        <td className="px-2 py-4 text-xs text-center text-gray-500 max-w-[200px] truncate" title={app.planType}>
                                            {app.planType}
                                        </td>
                                        <td className="px-2 py-4 text-center whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusStyles(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        신청 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedApp && (
                <CustomerDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={onRefresh}
                    isAdmin={isAdmin}
                    partnerLoginId={getPartnerLoginId(selectedApp.partnerId)}
                />
            )}
        </div>
    );
}
