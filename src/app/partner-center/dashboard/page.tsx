"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerManagement from "@/components/dashboard/PartnerManagement";
import ProductManagement from "@/components/dashboard/ProductManagement";
import CustomerManagement from "@/components/dashboard/CustomerManagement";
import PartnerRequests from "@/components/dashboard/PartnerRequests";
import ResourceCenter from "@/components/dashboard/ResourceCenter";
import PartnerFormModal from "@/components/dashboard/PartnerFormModal";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import PromotionManagement from "@/components/dashboard/PromotionManagement";
import StatusManagement from "@/components/dashboard/StatusManagement";
import RetentionManagement from "@/components/dashboard/RetentionManagement";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PartnerRequest } from "@/lib/types";
import { Footer } from "@/components/layout";


type Tab = "overview" | "partners" | "products" | "promotions" | "customers" | "requests" | "library" | "stats" | "settings" | "retention";

export default function PartnerDashboard() {
    const router = useRouter();
    const [partner, setPartner] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [baseUrl, setBaseUrl] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectedOverviewStatus, setSelectedOverviewStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);

    // 네비게이션 헬퍼 컴포넌트
    const NavButton = ({ id, label, icon, count }: { id: string; label: string; icon: string; count?: number }) => (
        <button
            onClick={() => {
                setActiveTab(id as Tab);
                fetchData();
            }}
            className={`px-3 py-2 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === id
                ? "bg-white text-sono-primary shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                }`}
        >
            <svg className={`w-3.5 h-3.5 ${activeTab === id ? "text-sono-primary" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={icon} />
            </svg>
            {label}
            {count !== undefined && count > 0 && (
                <span className="bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {count}
                </span>
            )}
        </button>
    );

    // 세션 로드 (컴포넌트 마운트 시 한 번만 실행)
    useEffect(() => {
        // sessionStorage 우선 확인 (관리자 바로가기 등 탭 격리 세션)
        let session = sessionStorage.getItem("partnerSession");
        
        // sessionStorage에 없으면 localStorage 확인
        if (!session) {
            session = localStorage.getItem("partnerSession");
        }

        if (!session) {
            router.push("/partner-center");
            return;
        }
        try {
            if (session === "undefined" || session === "null") {
                sessionStorage.removeItem("partnerSession");
                localStorage.removeItem("partnerSession");
                router.push("/partner-center");
                return;
            }
            const partnerInfo = JSON.parse(session);
            setPartner(partnerInfo);
            setBaseUrl(window.location.origin);
        } catch (e) {
            console.error("Session parse error:", e);
            sessionStorage.removeItem("partnerSession");
            localStorage.removeItem("partnerSession");
            router.push("/partner-center");
        }
    }, [router]);

    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const currentPartner = dashboardData.partners.find((p: any) => p.partnerId === partner?.partnerId) || partner;

    const isLoading = !realTimeData || !partner || isRefreshing;

    const fetchData = useCallback(() => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
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

    // Fetch dynamic statuses for overview
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);

    // Only show the initial loading screen when we have NO data at all
    if (!partner || !dashboardData) {
        return (
            <div className="min-h-screen bg-[#f2f4f6] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-sono-primary border-t-transparent"></div>
                    <p className="text-gray-500 font-bold">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const isAdmin = dashboardData.isAdmin;

    // Calculate Status Counts (dashboardData.customers가 항상 배열임을 보장)
    const statusCounts = (dashboardData.customers || []).reduce((acc: Record<string, number>, curr: any) => {
        const status = curr.status || "접수";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const defaultStatusList = ['접수', '대기', '상담중', '부재', '보류', '불가', '거부', '접수취소', '녹취완료(출금확인중)', '정상가입', '1회출금', '청약철회', '해약', '정산완료'];
    const statusList = dbStatuses ? dbStatuses.map(s => s.label) : defaultStatusList;

    const getStatusColor = (status: string) => {
        switch (status) {
            case '접수': return 'text-blue-500';
            case '대기': return 'text-slate-500';
            case '상담중': return 'text-amber-500';
            case '부재': return 'text-gray-400';
            case '보류': return 'text-orange-500';
            case '불가': return 'text-red-500';
            case '거부': return 'text-red-500';
            case '접수취소': return 'text-rose-500';
            case '녹취완료(출금확인중)': return 'text-cyan-500';
            case '정상가입': return 'text-emerald-500';
            case '1회출금': return 'text-teal-500';
            case '청약철회': return 'text-pink-500';
            case '해약': return 'text-stone-500';
            case '정산완료': return 'text-amber-500';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#f2f4f6]">
            {/* Header */}
            <header className="relative z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
                {isAdmin ? (
                    /* HQ Admin Header: 2-Row Centered Layout */
                    <div className="max-w-7xl mx-auto space-y-4">
                        {/* Top Row: Utilities + Logo + User */}
                        <div className="flex items-center justify-between">
                            <div className="w-[100px] md:w-[240px]">
                                <button
                                    onClick={() => fetchData()}
                                    className="p-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 hover:bg-sono-primary/10 hover:text-sono-primary transition-all"
                                    title="새로고침"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 flex justify-center">
                                <a href="/partner-center/dashboard" className="flex items-center gap-1.5 group">
                                    <img
                                        src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png"
                                        alt="SONO Logo"
                                        className="h-5 md:h-7 w-auto brightness-0 transition-transform group-hover:scale-105"
                                    />
                                    <div className="h-3 w-px bg-gray-200 mx-1 md:mx-2"></div>
                                    <span className="font-black text-sm md:text-lg tracking-tighter text-sono-dark uppercase">HQ ADMIN</span>
                                </a>
                            </div>

                            <div className="flex items-center justify-end gap-2 w-[100px] md:w-[240px]">
                                <span className="hidden md:inline text-xs font-black text-sono-dark whitespace-nowrap">{partner.name}님</span>
                                <button
                                    onClick={() => { 
                                        sessionStorage.removeItem("partnerSession");
                                        localStorage.removeItem("partnerSession"); 
                                        router.push("/partner-center"); 
                                    }}
                                    className="bg-gray-100 text-gray-500 px-2 py-1.5 md:px-3 rounded-lg text-[10px] font-black hover:bg-red-50 hover:text-red-500 transition-all whitespace-nowrap"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>

                        {/* Bottom Row: Centered Menu Bar (Width fits content) */}
                        <div className="flex justify-center">
                            <div className="overflow-x-auto no-scrollbar max-w-full">
                                <nav className="inline-flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30">
                                    <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    <NavButton id="partners" label="파트너 관리" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <NavButton id="requests" label="입점 신청" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" count={dashboardData.pendingRequests.length} />
                                    <NavButton id="products" label="제품" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    <NavButton id="promotions" label="프로모션" icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    <NavButton id="retention" label="유지율" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    <NavButton id="stats" label="통계" icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    <NavButton id="settings" label="환경설정" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </nav>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Partner Header: Compact Side-by-Side Layout */
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                        {/* Logo Left */}
                        <div className="flex items-center gap-6 shrink-0">
                            <a href="/partner-center/dashboard" className="flex items-center gap-1.5 group">
                                <img
                                    src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png"
                                    alt="SONO Logo"
                                    className="h-5 md:h-6 w-auto brightness-0 transition-transform group-hover:scale-105"
                                />
                                <div className="h-3 w-px bg-gray-200 mx-1 md:mx-2"></div>
                                <span className="font-black text-sm md:text-base tracking-tighter text-sono-dark">DASHBOARD</span>
                            </a>

                            {/* Menu Bar Alongside (Desktop) */}
                            <nav className="hidden lg:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30">
                                <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                <NavButton id="retention" label="유지율 관리" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </nav>
                        </div>

                        {/* Right Utilities + Mobile Menu Toggle */}
                        <div className="flex items-center gap-2 md:gap-4 ml-auto">
                            {/* Mobile Menu Bar (visible only on small screens) */}
                            <nav className="lg:hidden flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30 overflow-x-auto no-scrollbar max-w-[200px] md:max-w-md">
                                <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                <NavButton id="retention" label="유지율 관리" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </nav>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchData()}
                                    className="p-1.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 hover:bg-sono-primary/10 hover:text-sono-primary transition-all hidden sm:block"
                                    title="새로고침"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                                <span className="hidden xl:inline text-xs font-black text-sono-dark whitespace-nowrap">{partner.name}님</span>
                                <button
                                    onClick={() => { 
                                        sessionStorage.removeItem("partnerSession");
                                        localStorage.removeItem("partnerSession"); 
                                        router.push("/partner-center"); 
                                    }}
                                    className="bg-gray-100 text-gray-500 px-2 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-50 hover:text-red-500 transition-all whitespace-nowrap"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {/* URL Display - Only visible on Dashboard (overview) tab */}
                {activeTab === "overview" && partner.customUrl && partner.customUrl !== "admin" && (
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Landing URL */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex-1 flex flex-col gap-1 w-full overflow-hidden">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {currentPartner.partnerGroup === "결합 상품 판매" ? "결합상품 페이지 랜딩 URL" : "내 파트너 페이지 랜딩 URL"}
                                </span>
                                <span className="text-sm md:text-lg font-mono text-sono-primary truncate">
                                    {baseUrl.replace(/^https?:\/\//, "")}/p/{partner.customUrl}{currentPartner.partnerGroup === "결합 상품 판매" ? "/products/smartcare" : ""}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        const url = `${baseUrl}/p/${partner.customUrl}${currentPartner.partnerGroup === "결합 상품 판매" ? "/products/smartcare" : ""}`;
                                        navigator.clipboard.writeText(url).then(() => {
                                            setCopySuccess(true);
                                            setTimeout(() => setCopySuccess(false), 2000);
                                        });
                                    }}
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
                                    href={`/p/${partner.customUrl}${currentPartner.partnerGroup === "결합 상품 판매" ? "/products/smartcare" : ""}`}
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
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {currentPartner.partnerGroup === "결합 상품 판매" ? "결합상품 상담전용 URL" : "상담신청 전용 URL"}
                                </span>
                                <span className="text-sm md:text-lg font-mono text-purple-600 truncate">
                                    {baseUrl.replace(/^https?:\/\//, "")}/p/{partner.customUrl}{currentPartner.partnerGroup === "결합 상품 판매" ? "/inquiry?product=smartcare" : "/inquiry"}
                                </span>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => {
                                        const url = `${baseUrl}/p/${partner.customUrl}${currentPartner.partnerGroup === "결합 상품 판매" ? "/inquiry?product=smartcare" : "/inquiry"}`;
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
                                    href={`/p/${partner.customUrl}${currentPartner.partnerGroup === "결합 상품 판매" ? "/inquiry?product=smartcare" : "/inquiry"}`}
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
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 animate-slide-up">
                            {/* Status Stats */}
                            {statusList.map((status) => (
                                <div
                                    key={status}
                                    onClick={() => setSelectedOverviewStatus(status)}
                                    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all cursor-pointer hover:shadow-md hover:-translate-y-1 ${selectedOverviewStatus === status ? "ring-2 ring-sono-primary ring-offset-2" : ""}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 ${getStatusColor(status).replace('text-', 'bg-').replace('-500', '-50')} ${getStatusColor(status)}`}>
                                            {status}
                                        </span>
                                        <div className="p-1.5 bg-gray-50 rounded-lg">
                                            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-sono-dark tracking-tighter">
                                            {statusCounts[status] || 0}
                                        </span>
                                        <span className="text-gray-400 font-bold text-[10px]">건</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filtered Customer List Widget */}
                        <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
                            <CustomerManagement
                                applications={dashboardData.customers as any}
                                onRefresh={() => fetchData()}
                                partners={dashboardData.partners as any}
                                isAdmin={isAdmin}
                                initialStatusFilter={selectedOverviewStatus}
                                isWidget={true}
                                currentUser={partner}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "library" && (
                    <ResourceCenter isAdmin={isAdmin} />
                )}

                {activeTab === "partners" && (
                    <PartnerManagement partners={dashboardData.partners as any} isAdmin={isAdmin} onRefresh={() => fetchData()} />
                )}

                {activeTab === "products" && isAdmin && (
                    <ProductManagement />
                )}

                {activeTab === "promotions" && isAdmin && (
                    <PromotionManagement />
                )}

                {activeTab === "customers" && (
                    <CustomerManagement
                        applications={dashboardData.customers as any}
                        onRefresh={() => fetchData()}
                        partners={dashboardData.partners as any}
                        isAdmin={isAdmin}
                        currentUser={partner}
                    />
                )}

                {activeTab === "requests" && isAdmin && (
                    <PartnerRequests
                        requests={dashboardData.pendingRequests as any}
                        onRefresh={() => fetchData()}
                        onSelectRequest={handleSelectRequest}
                    />
                )}

                {activeTab === "stats" && isAdmin && (
                    <AnalyticsDashboard />
                )}

                {activeTab === "settings" && isAdmin && (
                    <StatusManagement />
                )}

                {activeTab === "retention" && (
                    <RetentionManagement 
                        isAdmin={isAdmin} 
                        partnerId={partner?.partnerId} 
                        partners={dashboardData.partners as any} 
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
                            // Mall Info (Added)
                            loginId: selectedRequest.loginId,
                            loginPassword: selectedRequest.loginPassword,
                            customUrl: selectedRequest.customUrl,
                            // Plan Info
                            pointInfo: selectedRequest.pointRate, // Map pointRate to pointInfo (if needed, based on typical usage)

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
            <Footer />
        </div>

    );
}
