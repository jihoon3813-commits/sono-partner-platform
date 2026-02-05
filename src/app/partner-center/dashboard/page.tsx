"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerManagement from "@/components/dashboard/PartnerManagement";
import CustomerManagement from "@/components/dashboard/CustomerManagement";
import PartnerRequests from "@/components/dashboard/PartnerRequests";
import PartnerFormModal from "@/components/dashboard/PartnerFormModal";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PartnerRequest } from "@/lib/types";

type Tab = "overview" | "partners" | "customers" | "requests";

export default function PartnerDashboard() {
    const router = useRouter();
    const [partner, setPartner] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [copySuccess, setCopySuccess] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const [selectedOverviewStatus, setSelectedOverviewStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);

    // 세션 로드 (컴포넌트 마운트 시 한 번만 실행)
    useEffect(() => {
        const session = localStorage.getItem("partnerSession");
        if (!session) {
            router.push("/partner-center");
            return;
        }
        try {
            if (session === "undefined" || session === "null") {
                localStorage.removeItem("partnerSession");
                router.push("/partner-center");
                return;
            }
            const partnerInfo = JSON.parse(session);
            setPartner(partnerInfo);
            setBaseUrl(window.location.origin);
        } catch (e) {
            console.error("Session parse error:", e);
            localStorage.removeItem("partnerSession");
            router.push("/partner-center");
        }
    }, [router]);

    // Convex 실시간 데이터 쿼리 연결
    const realTimeData = useQuery(api.dashboard.getDashboardData,
        partner ? { partnerId: partner.partnerId } : "skip" as any
    );

    // 구버전 코드와 호환성을 위한 데이터 매핑 및 방어 코드
    const dashboardData = {
        isAdmin: realTimeData?.isAdmin || false,
        partners: realTimeData?.partners || [],
        customers: realTimeData?.customers || [],
        pendingRequests: realTimeData?.pendingRequests || []
    };

    const isLoading = !realTimeData || !partner;

    const fetchData = useCallback(() => {
        // useQuery를 사용하므로 더 이상 수동 fetch는 필요 없으나, 
        // 기존 버튼 이벤트를 위해 빈 함수로 둡니다.
        console.log("Data is automatically synced in real-time by Convex.");
    }, []);

    const handleCopyUrl = () => {
        if (!partner?.customUrl || partner.customUrl === "admin") return;
        const url = `${baseUrl}/p/${partner.customUrl}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleSelectRequest = (req: PartnerRequest) => {
        setSelectedRequest(req);
    };

    if (isLoading || !partner) {
        return <div className="p-20 text-center font-bold">데이터를 불러오는 중...</div>;
    }

    const isAdmin = dashboardData.isAdmin;

    // Calculate Status Counts (dashboardData.customers가 항상 배열임을 보장)
    const statusCounts = (dashboardData.customers || []).reduce((acc: Record<string, number>, curr: any) => {
        const status = curr.status || "접수";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusList = ['접수', '상담중', '부재', '거부', '접수취소', '계약완료', '1회출금완료', '배송완료', '정산완료', '청약철회', '해약완료'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case '접수': return 'text-blue-500';
            case '상담중': return 'text-amber-500';
            case '부재': return 'text-gray-400';
            case '거부': return 'text-red-500';
            case '접수취소': return 'text-rose-500';
            case '계약완료': return 'text-emerald-500';
            case '1회출금완료': return 'text-teal-500';
            case '배송완료': return 'text-indigo-500';
            case '정산완료': return 'text-purple-500';
            case '청약철회': return 'text-pink-500';
            case '해약완료': return 'text-stone-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f4f6]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 md:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                        <div className="flex justify-between w-full md:w-auto items-center">
                            <a href="/partner-center/dashboard" className="flex items-center gap-2">
                                <img
                                    src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94%20BI_1.png?raw=true"
                                    alt="SONO Logo"
                                    className="h-8 w-auto"
                                />
                                <span className="font-bold text-lg tracking-tight text-sono-dark">PARTNER</span>
                            </a>

                            {/* Mobile Actions (Refresh & Home & Logout) */}
                            <div className="flex items-center gap-2 md:hidden">
                                <button
                                    onClick={() => fetchData()}
                                    className="p-1.5 bg-sono-primary/10 text-sono-primary rounded-lg border border-sono-primary/20"
                                    title="새로고침"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <Link
                                    href="/"
                                    target="_blank"
                                    className="p-1.5 bg-gray-100 text-gray-500 rounded-lg border border-gray-200"
                                    title="홈페이지 바로가기"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </Link>
                                <button
                                    onClick={() => { localStorage.removeItem("partnerSession"); router.push("/partner-center"); }}
                                    className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>

                        <nav className="flex gap-1 bg-gray-50 p-1 rounded-xl w-full md:w-auto justify-center overflow-x-auto">
                            {[
                                { id: "overview", label: "대시보드" },
                                { id: "partners", label: "파트너 관리" },
                                { id: "customers", label: "고객 관리" },
                                ...(isAdmin ? [{ id: "requests", label: "입점 신청", count: dashboardData.pendingRequests.length }] : [])
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as Tab);
                                        fetchData();
                                    }}
                                    className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-white text-sono-primary shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                        }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && tab.count > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            홈페이지
                        </Link>
                        <button
                            onClick={() => fetchData()}
                            className="p-2.5 bg-sono-primary/10 text-sono-primary rounded-xl border border-sono-primary/20 hover:bg-sono-primary/20 transition-all"
                            title="새로고침"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400">안녕하세요</p>
                            <p className="text-sm font-black text-sono-dark">{partner.name} 님</p>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem("partnerSession");
                                router.push("/partner-center");
                            }}
                            className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-black hover:bg-gray-200 transition-all"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {/* URL Display (Visible on both PC and Mobile) */}
                {partner.customUrl && partner.customUrl !== "admin" && (
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Landing URL */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">내 파트너 페이지 랜딩 URL</span>
                                <span className="text-sm md:text-lg font-mono text-sono-primary truncate">
                                    {baseUrl.replace(/^https?:\/\//, "")}/p/{partner.customUrl}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={handleCopyUrl}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-sm font-bold px-6 py-3.5 rounded-2xl transition-all ${copySuccess
                                        ? "bg-green-500 text-white animate-bounce-short"
                                        : "bg-sono-primary/10 text-sono-primary hover:bg-sono-primary hover:text-white"
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    {copySuccess ? "주소 복사됨" : "랜딩 URL 복사"}
                                </button>
                                <a
                                    href={`/p/${partner.customUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm font-bold px-6 py-3.5 rounded-2xl bg-gray-100 text-gray-500 hover:bg-sono-dark hover:text-white transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    페이지 이동
                                </a>
                            </div>
                        </div>

                        {/* Inquiry URL */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">상담신청 전용 URL</span>
                                <span className="text-sm md:text-lg font-mono text-purple-600 truncate">
                                    {baseUrl.replace(/^https?:\/\//, "")}/p/{partner.customUrl}/inquiry
                                </span>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        const url = `${baseUrl}/p/${partner.customUrl}/inquiry`;
                                        navigator.clipboard.writeText(url).then(() => {
                                            alert("상담신청 URL이 복사되었습니다.");
                                        });
                                    }}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm font-bold px-6 py-3.5 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    URL 복사
                                </button>
                                <a
                                    href={`/p/${partner.customUrl}/inquiry`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm font-bold px-6 py-3.5 rounded-2xl bg-gray-100 text-gray-500 hover:bg-sono-dark hover:text-white transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    페이지 이동
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        {/* Status Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                            {statusList.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedOverviewStatus(status)}
                                    className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${selectedOverviewStatus === status
                                        ? "bg-sono-dark text-white ring-2 ring-sono-primary ring-offset-2 shadow-lg scale-105"
                                        : "bg-white hover:bg-gray-50 border border-gray-100 text-gray-400 hover:text-sono-dark hover:border-gray-200"
                                        }`}
                                >
                                    <span className="text-xs font-bold whitespace-nowrap">{status}</span>
                                    <span className={`text-xl font-black ${selectedOverviewStatus === status ? "text-sono-primary" : getStatusColor(status)}`}>
                                        {statusCounts[status] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Filtered Customer List */}
                        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <CustomerManagement
                                applications={dashboardData.customers as any}
                                onRefresh={() => fetchData()}
                                partners={dashboardData.partners as any}
                                isAdmin={isAdmin}
                                initialStatusFilter={selectedOverviewStatus}
                                isWidget={true}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "partners" && (
                    <PartnerManagement partners={dashboardData.partners as any} isAdmin={isAdmin} onRefresh={() => fetchData()} />
                )}

                {activeTab === "customers" && (
                    <CustomerManagement
                        applications={dashboardData.customers as any}
                        onRefresh={() => fetchData()}
                        partners={dashboardData.partners as any}
                        isAdmin={isAdmin}
                    />
                )}

                {activeTab === "requests" && isAdmin && (
                    <PartnerRequests
                        requests={dashboardData.pendingRequests as any}
                        onRefresh={() => fetchData()}
                        onSelectRequest={handleSelectRequest}
                    />
                )}

                {selectedRequest && (
                    <PartnerFormModal
                        partner={null}
                        initialData={{
                            companyName: selectedRequest.companyName,
                            businessNumber: selectedRequest.businessNumber,
                            ceoName: selectedRequest.ceoName,
                            managerName: selectedRequest.managerName,
                            managerPhone: selectedRequest.managerPhone,
                            managerEmail: selectedRequest.managerEmail,
                            shopType: selectedRequest.shopType,
                            shopUrl: selectedRequest.shopUrl,
                            memberCount: selectedRequest.memberCount,
                            parentPartnerId: selectedRequest.parentPartnerId,
                            parentPartnerName: selectedRequest.parentPartnerName,
                        }}
                        requestId={selectedRequest.requestId}
                        onClose={() => setSelectedRequest(null)}
                        onSuccess={() => {
                            setSelectedRequest(null);
                            fetchData();
                        }}
                        isAdmin={true}
                    />
                )}

                <div className="mt-12 text-center pb-12">
                    <a href="/partner-center/dashboard" className="text-gray-400 hover:text-sono-primary font-bold text-sm transition-all flex items-center justify-center gap-2">
                        메인 페이지로 이동
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
            </main>
        </div>
    );
}
