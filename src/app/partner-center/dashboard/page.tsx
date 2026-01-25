"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerManagement from "@/components/dashboard/PartnerManagement";
import CustomerManagement from "@/components/dashboard/CustomerManagement";
import PartnerRequests from "@/components/dashboard/PartnerRequests";

type Tab = "overview" | "partners" | "customers" | "requests";

export default function PartnerDashboard() {
    const router = useRouter();
    const [partner, setPartner] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [copySuccess, setCopySuccess] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");
    const [dashboardData, setDashboardData] = useState({
        isAdmin: false,
        partners: [],
        customers: [],
        pendingRequests: []
    });
    const [selectedOverviewStatus, setSelectedOverviewStatus] = useState("all");

    const fetchData = useCallback(async (partnerId: string) => {
        try {
            const response = await fetch(`/api/partner-center/dashboard-data?partnerId=${partnerId}`);
            const data = await response.json();
            if (data.success) {
                setDashboardData({
                    isAdmin: data.isAdmin,
                    partners: data.partners || [],
                    customers: data.customers || [],
                    pendingRequests: data.pendingRequests || []
                });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        }
    }, []);

    useEffect(() => {
        const session = localStorage.getItem("partnerSession");
        if (!session) {
            router.push("/partner-center");
            return;
        }
        const partnerInfo = JSON.parse(session);
        setPartner(partnerInfo);
        setBaseUrl(window.location.origin);
        fetchData(partnerInfo.partnerId);
        setIsLoading(false);
    }, [router, fetchData]);

    const handleCopyUrl = () => {
        if (!partner?.customUrl || partner.customUrl === "admin") return;
        const url = `${baseUrl}/p/${partner.customUrl}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    if (isLoading || !partner) {
        return <div className="p-20 text-center font-bold">데이터를 불러오는 중...</div>;
    }

    const isAdmin = dashboardData.isAdmin;

    // Calculate Status Counts
    const statusCounts = dashboardData.customers.reduce((acc: Record<string, number>, curr: any) => {
        const status = curr.status || "접수";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusList = ['접수', '상담중', '부재', '거부', '접수취소', '계약완료', '1회출금완료', '배송완료', '정산완료'];

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

                            {/* Mobile Logout Button (Visible only on mobile) */}
                            <button
                                onClick={() => { localStorage.removeItem("partnerSession"); router.push("/partner-center"); }}
                                className="md:hidden bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap"
                            >
                                로그아웃
                            </button>
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
                                    onClick={() => setActiveTab(tab.id as Tab)}
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
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-green-700">정상 작동 중</span>
                        </div>
                        {partner.customUrl && partner.customUrl !== "admin" && (
                            <div className="flex items-center gap-2 bg-[#f9fafb] px-3 py-1.5 rounded-xl border border-gray-100 group">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">랜딩 URL</span>
                                <span className="text-xs font-mono text-gray-500 truncate max-w-[120px] lg:max-w-[200px]">
                                    {baseUrl.replace(/^https?:\/\//, "")}/p/{partner.customUrl}
                                </span>
                                <button
                                    onClick={handleCopyUrl}
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${copySuccess
                                        ? "bg-green-500 text-white animate-bounce-short"
                                        : "bg-gray-200 text-gray-600 hover:bg-sono-primary hover:text-white"
                                        }`}
                                >
                                    {copySuccess ? "복사완료!" : "주소복사"}
                                </button>
                            </div>
                        )}
                        <div className="w-px h-8 bg-gray-100 mx-1"></div>
                        <div className="text-right mr-2">
                            <div className="text-sm font-bold text-sono-dark">{partner.name}</div>
                            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{isAdmin ? "System Admin" : "Partner"}</div>
                        </div>
                        <button
                            onClick={() => { localStorage.removeItem("partnerSession"); router.push("/partner-center"); }}
                            className="bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-sono-dark px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
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
                                    <span className={`text-xl font-black ${selectedOverviewStatus === status ? "text-sono-primary" : "text-sono-dark"}`}>
                                        {statusCounts[status] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Filtered Customer List */}
                        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <CustomerManagement
                                applications={dashboardData.customers}
                                onRefresh={() => fetchData(partner.partnerId)}
                                partners={dashboardData.partners}
                                isAdmin={isAdmin}
                                initialStatusFilter={selectedOverviewStatus}
                                isWidget={true}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "partners" && (
                    <PartnerManagement partners={dashboardData.partners} isAdmin={isAdmin} onRefresh={() => fetchData(partner.partnerId)} />
                )}

                {activeTab === "customers" && (
                    <CustomerManagement
                        applications={dashboardData.customers}
                        onRefresh={() => fetchData(partner.partnerId)}
                        partners={dashboardData.partners}
                        isAdmin={isAdmin}
                    />
                )}

                {activeTab === "requests" && isAdmin && (
                    <PartnerRequests requests={dashboardData.pendingRequests} onRefresh={() => fetchData(partner.partnerId)} />
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
