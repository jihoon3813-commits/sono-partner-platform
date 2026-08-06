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
import IndividualPageManagement from "@/components/dashboard/IndividualPageManagement";
import RetentionManagement from "@/components/dashboard/RetentionManagement";
import RetentionManagement2 from "@/components/dashboard/RetentionManagement2";
import TMManagement from "@/components/dashboard/TMManagement";
import AccountManagement from "@/components/dashboard/AccountManagement";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PartnerRequest } from "@/lib/types";
import { Footer } from "@/components/layout";


type Tab = "overview" | "partners" | "products" | "promotions" | "customers" | "requests" | "library" | "stats" | "settings" | "retention" | "retention2" | "tms";

export default function PartnerDashboard() {
    const router = useRouter();
    const [partner, setPartner] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem("activeDashboardTab");
            if (saved) return saved as Tab;
        }
        return "overview";
    });

    const handleTabChange = (id: Tab) => {
        setActiveTab(id);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeDashboardTab", id);
        }
    };

    const [baseUrl, setBaseUrl] = useState("");
    const [copySuccessSmartCare, setCopySuccessSmartCare] = useState(false);
    const [copySuccessHappy450, setCopySuccessHappy450] = useState(false);
    const [copySuccessInquiry, setCopySuccessInquiry] = useState(false);
    const [selectedOverviewStatus, setSelectedOverviewStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);
    const [settingsSubTab, setSettingsSubTab] = useState<"status" | "individual" | "account">("status");
    const [hqAdminSession, setHqAdminSession] = useState<any>(null);

    // Filter States (Lifted from CustomerManagement)
    const [dateFilter, setDateFilter] = useState("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const handleReturnToHqAdmin = () => {
        if (typeof window !== "undefined") {
            const savedHq = localStorage.getItem("hqAdminSession");
            if (savedHq) {
                sessionStorage.setItem("partnerSession", savedHq);
                localStorage.setItem("partnerSession", savedHq);
                setPartner(JSON.parse(savedHq));
                window.location.href = "/partner-center/dashboard";
            }
        }
    };

    // 네비게이션 헬퍼 컴포넌트
    const NavButton = ({ id, label, icon, count }: { id: string; label: string; icon: string; count?: number }) => (
        <button
            onClick={() => handleTabChange(id as Tab)}
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
        if (typeof window !== "undefined") {
            const savedHq = localStorage.getItem("hqAdminSession");
            if (savedHq) {
                try {
                    setHqAdminSession(JSON.parse(savedHq));
                } catch (e) {
                    console.error(e);
                }
            }
        }

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

            // 본사 어드민 로그인일 경우 hqAdminSession 보존
            if (partnerInfo.role === 'admin' || partnerInfo.level === 'admin' || partnerInfo.customUrl === 'admin' || partnerInfo.loginId === 'admin') {
                localStorage.setItem("hqAdminSession", JSON.stringify(partnerInfo));
                setHqAdminSession(partnerInfo);
            }

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

    const currentPartner = dashboardData.partners.find((p: any) => 
        (partner?.partnerId && (p.partnerId === partner.partnerId || p.loginId === partner.partnerId || p.customUrl === partner.partnerId)) ||
        (partner?.loginId && (p.loginId === partner.loginId || p.partnerId === partner.loginId || p.customUrl === partner.loginId)) ||
        (partner?.customUrl && (p.customUrl === partner.customUrl || p.partnerId === partner.customUrl || p.loginId === partner.customUrl))
    ) || partner;

    const isLoading = !realTimeData || !partner;

    // 실시간 데이터 수신 시 세션 데이터(showLandingUrl, partnerGroup 등) 최신화하여 초기 로딩 플리커(깜빡임) 방지
    useEffect(() => {
        if (realTimeData?.partners && partner?.partnerId) {
            const found = dashboardData.partners.find((p: any) => 
                (partner?.partnerId && (p.partnerId === partner.partnerId || p.loginId === partner.partnerId || p.customUrl === partner.partnerId)) ||
                (partner?.loginId && (p.loginId === partner.loginId || p.partnerId === partner.loginId || p.customUrl === partner.loginId)) ||
                (partner?.customUrl && (p.customUrl === partner.customUrl || p.partnerId === partner.customUrl || p.loginId === partner.customUrl))
            );
            if (found && (found.showLandingUrl !== partner.showLandingUrl || found.partnerGroup !== partner.partnerGroup)) {
                const updated = {
                    ...partner,
                    showLandingUrl: found.showLandingUrl,
                    partnerGroup: found.partnerGroup
                };
                setPartner(updated);
                if (typeof window !== "undefined") {
                    if (sessionStorage.getItem("partnerSession")) {
                        sessionStorage.setItem("partnerSession", JSON.stringify(updated));
                    }
                    if (localStorage.getItem("partnerSession")) {
                        localStorage.setItem("partnerSession", JSON.stringify(updated));
                    }
                }
            }
        }
    }, [realTimeData, partner]);

    const isLandingHidden = 
        currentPartner?.showLandingUrl === false || 
        currentPartner?.showLandingUrl === "false" || 
        partner?.showLandingUrl === false || 
        partner?.showLandingUrl === "false";

    const isLandingUrlVisible = Boolean(realTimeData) && !isLandingHidden;

    const fetchData = useCallback(() => {
        setIsRefreshing(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeDashboardTab", activeTab);
            window.location.reload();
        }
    }, [activeTab]);

    const handleCopyUrl = () => {
        if (!partner?.customUrl || partner.customUrl === "admin") return;
        const url = `${baseUrl}/${partner.customUrl}/smartcare`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccessSmartCare(true);
            setTimeout(() => setCopySuccessSmartCare(false), 2000);
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

    const isParentPartner = isAdmin || (
        currentPartner &&
        currentPartner.role !== 'tm' &&
        (
            !currentPartner.parentPartnerId ||
            currentPartner.parentPartnerId === '' ||
            currentPartner.parentPartnerId === 'admin' ||
            (dashboardData.partners && dashboardData.partners.some((p: any) =>
                p.partnerId !== currentPartner.partnerId &&
                p.loginId !== currentPartner.loginId &&
                (
                    (p.parentPartnerId && (p.parentPartnerId === currentPartner.partnerId || p.parentPartnerId === currentPartner.loginId)) ||
                    (p.parentPartnerName && currentPartner.companyName && p.parentPartnerName.trim() === currentPartner.companyName.trim())
                )
            ))
        )
    );

    // Calculate Date Filtered Customers for Status Counts
    const dateFilteredCustomers = (dashboardData.customers || []).filter(app => {
        if (!app) return false;
        if (dateFilter === "all") return true;

        const kstNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000);
        const today = kstNow.toISOString().slice(0, 10);
        const thisMonth = kstNow.toISOString().slice(0, 7);

        // 기준 날짜: 가입일(registrationDate)이 있으면 우선 사용, 없으면 신청일(createdAt) 사용
        let refDateStr = app.registrationDate || app.createdAt || "";
        
        if (app.registrationDate && !app.registrationDate.includes('-')) {
            const serial = parseFloat(String(app.registrationDate));
            if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                const d = new Date((serial - 25569) * 86400 * 1000);
                refDateStr = d.toISOString().slice(0, 10);
            }
        }

        const kstDatePart = refDateStr.includes('T') 
            ? refDateStr.slice(0, 10) 
            : refDateStr.split(' ')[0].replace(/\./g, '-').trim();

        if (dateFilter === "today") {
            return kstDatePart === today;
        } else if (dateFilter === "yesterday") {
            const d = new Date(kstNow);
            d.setDate(d.getDate() - 1);
            return kstDatePart === d.toISOString().slice(0, 10);
        } else if (dateFilter === "month") {
            return kstDatePart.slice(0, 7) === thisMonth;
        } else if (dateFilter === "lastMonth") {
            const d = new Date(kstNow);
            d.setMonth(d.getMonth() - 1);
            const lastMonth = d.toISOString().slice(0, 7);
            return kstDatePart.slice(0, 7) === lastMonth;
        } else if (dateFilter === 'custom') {
            if (customStartDate && kstDatePart < customStartDate) return false;
            if (customEndDate && kstDatePart > customEndDate) return false;
            return true;
        } else {
            const getStartDateStr = (filter: string) => {
                const d = new Date(kstNow);
                if (filter === '3months') d.setMonth(kstNow.getMonth() - 3);
                else if (filter === '6months') d.setMonth(kstNow.getMonth() - 6);
                else if (filter === '1year') d.setFullYear(kstNow.getFullYear() - 1);
                else return "";
                return d.toISOString().slice(0, 10);
            };
            const startDateStr = getStartDateStr(dateFilter);
            return !startDateStr || kstDatePart >= startDateStr;
        }
    });

    // Calculate Status Counts based on DATE FILTERED data
    const statusCounts = dateFilteredCustomers.reduce((acc: Record<string, number>, curr: any) => {
        let status = curr.status || "접수";
        if (partner?.role === 'tm' && (status === "정산예정" || status === "정산완료")) {
            status = "정상가입";
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const defaultStatusList = ['접수', '대기', '상담중', '부재', '보류', '불가', '거부', '접수취소', '녹취완료(출금확인중)', '정상가입', '1회출금', '청약철회', '해약', '정산완료'];
    const rawStatusList = dbStatuses ? dbStatuses.map(s => s.label) : defaultStatusList;
    const statusList = partner?.role === 'tm'
        ? rawStatusList.filter(s => s !== "정산예정" && s !== "정산완료")
        : rawStatusList;

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
            {/* 본사 어드민 파트너 접속 상태 배너 */}
            {hqAdminSession && !isAdmin && (
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold relative z-50">
                    <div className="flex items-center gap-2 max-w-4xl">
                        <span className="bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-black shrink-0">
                            HQ ADMIN IMPERSONATION
                        </span>
                        <span className="truncate">
                            🛡️ 본사 관리자 권한으로 접속 중입니다. (현재 파트너: <strong className="text-amber-400">{partner?.companyName || partner?.name || partner?.loginId}</strong>)
                        </span>
                    </div>
                    <button
                        onClick={handleReturnToHqAdmin}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg text-xs font-black transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0" />
                        </svg>
                        본사 어드민 복귀
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="relative z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
                {isAdmin ? (
                    /* HQ Admin Header: 2-Row Centered Layout for PC & Mobile */
                    <div className="max-w-7xl mx-auto space-y-3">
                        {/* Top Row: Refresh (Left) + Centered Logo/Title (Center) + Utilities (Right) */}
                        <div className="flex items-center justify-between">
                            {/* Left: Refresh Button */}
                            <div className="w-[60px] md:w-[340px] flex items-center justify-start">
                                <button
                                    onClick={() => fetchData()}
                                    disabled={isRefreshing}
                                    className="px-2.5 py-1.5 bg-white text-gray-600 rounded-xl border border-gray-200 hover:bg-sono-primary/10 hover:border-sono-primary hover:text-sono-primary transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                                    title="새로고침"
                                >
                                    <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sono-primary" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="hidden sm:inline">새로고침</span>
                                </button>
                            </div>

                            {/* Center: Logo */}
                            <div className="flex-1 flex justify-center">
                                <a href="/partner-center/dashboard" className="flex items-center gap-1.5 shrink-0 group">
                                    <img
                                        src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png"
                                        alt="SONO Logo"
                                        className="h-5 md:h-6 w-auto brightness-0 transition-transform group-hover:scale-105"
                                    />
                                </a>
                            </div>

                            {/* Right: Homepage link + User name + Logout */}
                            <div className="w-[60px] md:w-[340px] flex items-center justify-end gap-1.5 md:gap-2 shrink-0">
                                <Link
                                    href="/"
                                    target="_blank"
                                    className="bg-sono-primary/10 text-sono-primary px-2 py-1.5 md:px-3 rounded-lg text-[10px] font-black hover:bg-sono-primary hover:text-white transition-all whitespace-nowrap flex items-center gap-1"
                                    title="홈페이지 바로가기"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="hidden sm:inline">홈페이지 바로가기</span>
                                </Link>
                                {partner?.name && (
                                    <span className="hidden sm:inline text-xs font-black text-sono-dark whitespace-nowrap">{partner.name}님</span>
                                )}
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

                        {/* Bottom Row: Centered Menu Bar (Row 2 on PC & Mobile) */}
                        <div className="flex justify-center pt-2 border-t border-gray-100/80">
                            <div className="overflow-x-auto no-scrollbar max-w-full">
                                <nav className="inline-flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30 whitespace-nowrap min-w-max">
                                    <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    <NavButton id="partners" label="파트너 관리" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <NavButton id="requests" label="입점 신청" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" count={dashboardData.pendingRequests.length} />
                                    <NavButton id="products" label="제품" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    <NavButton id="promotions" label="프로모션" icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    <NavButton id="retention2" label="연체 관리" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    <NavButton id="stats" label="통계" icon="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    <NavButton id="settings" label="환경설정" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </nav>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Partner Header: Centered & Responsive Layout */
                    <div className="max-w-7xl mx-auto space-y-3 md:space-y-0">
                        {/* Top Row: Logo (Left) & Utilities (Right) */}
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                            {/* Logo Left */}
                            <a href="/partner-center/dashboard" className="flex items-center gap-1.5 shrink-0 group">
                                <img
                                    src="https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA_W.png"
                                    alt="SONO Logo"
                                    className="h-5 md:h-6 w-auto brightness-0 transition-transform group-hover:scale-105"
                                />
                            </a>

                            {/* Menu Bar Center (Desktop/Tablet) */}
                            <div className="hidden md:flex flex-1 justify-center min-w-0 px-2 overflow-x-auto no-scrollbar">
                                <nav className="inline-flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30 whitespace-nowrap shrink-0">
                                    <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    {isParentPartner && (
                                        <NavButton id="partners" label="파트너 관리" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    )}
                                    <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    <NavButton id="retention2" label="연체 관리" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    {partner?.role !== 'tm' && (
                                        <NavButton id="tms" label="상담원 관리" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                                    )}
                                    <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    <NavButton id="settings" label="환경설정" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </nav>
                            </div>

                            {/* Right Utilities */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => fetchData()}
                                    disabled={isRefreshing}
                                    className="px-2.5 py-1.5 bg-white text-gray-600 rounded-xl border border-gray-200 hover:bg-sono-primary/10 hover:border-sono-primary hover:text-sono-primary transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                                    title="새로고침"
                                >
                                    <svg className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sono-primary" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="hidden sm:inline">새로고침</span>
                                </button>
                                <div className="h-4 w-px bg-gray-200 hidden sm:block"></div>
                                {(partner?.companyName || partner?.name || partner?.managerName) && (
                                    <span className="hidden sm:inline text-xs font-black text-sono-dark whitespace-nowrap">
                                        {partner?.companyName || partner?.name || partner?.managerName}님
                                    </span>
                                )}
                                <button
                                    onClick={() => { 
                                        if (hqAdminSession && !isAdmin) {
                                            if (confirm("본사 어드민 계정으로 복귀하시겠습니까?\n('취소'를 누르시면 전체 로그아웃됩니다)")) {
                                                handleReturnToHqAdmin();
                                                return;
                                            }
                                        }
                                        sessionStorage.removeItem("partnerSession");
                                        localStorage.removeItem("partnerSession"); 
                                        localStorage.removeItem("hqAdminSession");
                                        router.push("/partner-center"); 
                                    }}
                                    className="bg-gray-100 text-gray-500 px-2 py-1.5 rounded-lg text-[10px] font-black hover:bg-red-50 hover:text-red-500 transition-all whitespace-nowrap"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </div>

                        {/* Mobile Menu Bar (Row 2 below logo/title on small screens < md) */}
                        <div className="md:hidden pt-1.5 border-t border-gray-100/80 overflow-x-auto no-scrollbar max-w-full">
                            <nav className="inline-flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl border border-gray-200/30 whitespace-nowrap min-w-max">
                                <NavButton id="overview" label="대시보드" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                {isParentPartner && (
                                    <NavButton id="partners" label="파트너 관리" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                )}
                                <NavButton id="customers" label="고객 관리" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                <NavButton id="retention2" label="연체 관리" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                {partner?.role !== 'tm' && (
                                    <NavButton id="tms" label="상담원 관리" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a2 2 0 11-4 0 2 2 0 014 0z" />
                                )}
                                <NavButton id="library" label="자료실" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                <NavButton id="settings" label="환경설정" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </nav>
                        </div>
                    </div>
                )}
            </header>

            <main className={`${activeTab === 'retention2' ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto p-4 md:p-8`}>
                {/* URL Display - Visible on Dashboard (overview) tab for BOTH HQ Admin and Partners */}
                {activeTab === "overview" && (
                    <div className="mb-8 space-y-4">
                        {isAdmin || partner?.customUrl === "admin" ? (
                            <>
                                {/* Section Header (HQ Admin) */}
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 bg-sono-primary inline-block rounded-full"></span>
                                            공식 상품 대표 랜딩 연결 URL 바로가기
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            고객 및 파트너사 문의 시 안내할 수 있는 소노 공식 대표 상품별 연결 URL입니다.
                                        </p>
                                    </div>
                                </div>

                                {/* 1. 상품 2종 공식 대표 URL 카드 박스 (2 Columns Grid) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Product Card 1: 스마트케어 (SmartCare) */}
                                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-sono-primary/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-sono-gold text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                                                        BEST POPULAR
                                                    </span>
                                                    <span className="bg-sono-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        가전 결합 상품
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3.5 items-start mb-4">
                                                <img 
                                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785825079/2024112600085_0_vbmtin.jpg" 
                                                    alt="스마트케어" 
                                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shrink-0 border border-slate-100 shadow-sm"
                                                />
                                                <div>
                                                    <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">스마트케어 (SmartCare)</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        삼성/LG 최신 가전 렌탈 지원금 전액 제공, 만기 100% 전액 환급 베스트셀러 결합 상품
                                                    </p>
                                                    <p className="text-xs font-bold text-sono-primary mt-1.5">월 33,000원부터</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl mb-4 font-mono text-xs text-slate-700 truncate">
                                                <span className="text-slate-400 font-sans block text-[10px] font-bold uppercase mb-0.5">스마트케어 공식 대표 URL</span>
                                                <span className="font-bold text-sono-primary truncate block">{baseUrl.replace(/^https?:\/\//, "")}/products/smartcare</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    const url = `${baseUrl}/products/smartcare`;
                                                    navigator.clipboard.writeText(url).then(() => {
                                                        setCopySuccessSmartCare(true);
                                                        setTimeout(() => setCopySuccessSmartCare(false), 2000);
                                                    });
                                                }}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                                    copySuccessSmartCare 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "bg-sono-primary/10 text-sono-primary hover:bg-sono-primary hover:text-white"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span>{copySuccessSmartCare ? "복사 완료!" : "URL 복사"}</span>
                                            </button>
                                            <a
                                                href="/products/smartcare"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-sono-primary text-xs font-bold transition-all shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>페이지 이동</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Product Card 2: 더 해피 450 ONE (Happy450) */}
                                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-400 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        일반 상조 플랜
                                                    </span>
                                                    <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        인증 제휴 전용
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3.5 items-start mb-4">
                                                <img 
                                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png" 
                                                    alt="더 해피 450 ONE" 
                                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shrink-0 border border-slate-100 shadow-sm"
                                                />
                                                <div>
                                                    <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">더 해피 450 ONE</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        기본 상조 서비스, 레디캐시, 만기 100% 전액 환급 스탠다드 상조 전용 플랜
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-700 mt-1.5">월 18,000원부터</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl mb-4 font-mono text-xs text-slate-700 truncate">
                                                <span className="text-slate-400 font-sans block text-[10px] font-bold uppercase mb-0.5">더 해피 450 공식 대표 URL</span>
                                                <span className="font-bold text-slate-800 truncate block">{baseUrl.replace(/^https?:\/\//, "")}/products/happy450</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    const url = `${baseUrl}/products/happy450`;
                                                    navigator.clipboard.writeText(url).then(() => {
                                                        setCopySuccessHappy450(true);
                                                        setTimeout(() => setCopySuccessHappy450(false), 2000);
                                                    });
                                                }}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                                    copySuccessHappy450 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span>{copySuccessHappy450 ? "복사 완료!" : "URL 복사"}</span>
                                            </button>
                                            <a
                                                href="/products/happy450"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white text-xs font-bold transition-all shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>페이지 이동</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : isLandingUrlVisible && partner?.customUrl ? (
                            <>
                                {/* Section Header (Partner) */}
                                <div className="flex items-center justify-between px-1">
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            <span className="w-2 h-2 bg-sono-primary inline-block rounded-full"></span>
                                            파트너 전용 상품 연결 URL 관리
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            고객에게 공유할 상품별 직접 연결 URL 및 상담 전용 주소를 복사하여 홍보에 활용하세요. (URL 경로: /{partner.customUrl}/...)
                                        </p>
                                    </div>
                                </div>

                                {/* 1. 상품 2종 파트너 전용 URL 카드 박스 (2 Columns Grid - Admin Theme) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Product Card 1: 스마트케어 (SmartCare) */}
                                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-sono-primary/40 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-sono-gold text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                                                        BEST POPULAR
                                                    </span>
                                                    <span className="bg-sono-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        가전 결합 상품
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3.5 items-start mb-4">
                                                <img 
                                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785825079/2024112600085_0_vbmtin.jpg" 
                                                    alt="스마트케어" 
                                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shrink-0 border border-slate-100 shadow-sm"
                                                />
                                                <div>
                                                    <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">스마트케어 (SmartCare)</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        삼성/LG 최신 가전 렌탈 지원금 전액 제공, 만기 100% 전액 환급 베스트셀러 결합 상품
                                                    </p>
                                                    <p className="text-xs font-bold text-sono-primary mt-1.5">월 33,000원부터</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl mb-4 font-mono text-xs text-slate-700 truncate">
                                                <span className="text-slate-400 font-sans block text-[10px] font-bold uppercase mb-0.5">스마트케어 파트너 전용 URL</span>
                                                <span className="font-bold text-sono-primary truncate block">{baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/smartcare</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    const url = `${baseUrl}/${partner.customUrl}/smartcare`;
                                                    navigator.clipboard.writeText(url).then(() => {
                                                        setCopySuccessSmartCare(true);
                                                        setTimeout(() => setCopySuccessSmartCare(false), 2000);
                                                    });
                                                }}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                                    copySuccessSmartCare 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "bg-sono-primary/10 text-sono-primary hover:bg-sono-primary hover:text-white"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span>{copySuccessSmartCare ? "복사 완료!" : "URL 복사"}</span>
                                            </button>
                                            <a
                                                href={`/${partner.customUrl}/smartcare`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-sono-primary text-xs font-bold transition-all shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>페이지 이동</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Product Card 2: 더 해피 450 ONE (Happy450) */}
                                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-400 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        일반 상조 플랜
                                                    </span>
                                                    <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                                                        인증 제휴 전용
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3.5 items-start mb-4">
                                                <img 
                                                    src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png" 
                                                    alt="더 해피 450 ONE" 
                                                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl shrink-0 border border-slate-100 shadow-sm"
                                                />
                                                <div>
                                                    <h4 className="text-base md:text-lg font-black text-slate-900 mb-1">더 해피 450 ONE</h4>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        기본 상조 서비스, 레디캐시, 만기 100% 전액 환급 스탠다드 상조 전용 플랜
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-700 mt-1.5">월 18,000원부터</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-2xl mb-4 font-mono text-xs text-slate-700 truncate">
                                                <span className="text-slate-400 font-sans block text-[10px] font-bold uppercase mb-0.5">더 해피 450 파트너 전용 URL</span>
                                                <span className="font-bold text-slate-800 truncate block">{baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/happy450</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => {
                                                    const url = `${baseUrl}/${partner.customUrl}/happy450`;
                                                    navigator.clipboard.writeText(url).then(() => {
                                                        setCopySuccessHappy450(true);
                                                        setTimeout(() => setCopySuccessHappy450(false), 2000);
                                                    });
                                                }}
                                                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                                    copySuccessHappy450 
                                                    ? "bg-emerald-500 text-white" 
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white"
                                                }`}
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                                </svg>
                                                <span>{copySuccessHappy450 ? "복사 완료!" : "URL 복사"}</span>
                                            </button>
                                            <a
                                                href={`/${partner.customUrl}/happy450`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white text-xs font-bold transition-all shadow-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>페이지 이동</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. 상담신청 전용 URL 독립 카드 박스 (Full Width Card Box) */}
                                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-900/60 mt-4">
                                    <div className="flex items-center gap-3.5 w-full md:w-auto">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-400/30">
                                            <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <div className="overflow-hidden">
                                            <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-0.5 inline-block">
                                                INQUIRY ONLY
                                            </span>
                                            <h4 className="text-base font-black text-white">상담 신청 전용 URL</h4>
                                            <p className="text-xs text-indigo-200 font-mono mt-0.5 truncate">
                                                {baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/inquiry
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                                        <button
                                            onClick={() => {
                                                const url = `${baseUrl}/${partner.customUrl}/inquiry`;
                                                navigator.clipboard.writeText(url).then(() => {
                                                    setCopySuccessInquiry(true);
                                                    setTimeout(() => setCopySuccessInquiry(false), 2000);
                                                });
                                            }}
                                            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-2xl text-xs font-bold transition-all ${
                                                copySuccessInquiry
                                                ? "bg-emerald-500 text-white"
                                                : "bg-white text-slate-900 hover:bg-indigo-100"
                                            }`}
                                        >
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            <span>{copySuccessInquiry ? "복사 완료!" : "상담신청 URL 복사"}</span>
                                        </button>
                                        <a
                                            href={`/${partner.customUrl}/inquiry`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-2xl bg-indigo-950 text-white hover:bg-black text-xs font-bold transition-all border border-indigo-700/60 shadow-sm"
                                        >
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            <span>페이지 이동</span>
                                        </a>
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0 whitespace-nowrap">
                                {[
                                    { label: '전체', value: 'all' },
                                    { label: '당일', value: 'today' },
                                    { label: '전일', value: 'yesterday' },
                                    { label: '당월', value: 'month' },
                                    { label: '전월', value: 'lastMonth' },
                                    { label: '3개월', value: '3months' },
                                    { label: '6개월', value: '6months' },
                                    { label: '1년', value: '1year' },
                                    { label: '기간선택', value: 'custom' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDateFilter(opt.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${dateFilter === opt.value
                                            ? "bg-sono-dark text-white"
                                            : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 shadow-sm"
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}

                                {dateFilter === 'custom' && (
                                    <div className="flex items-center gap-2 ml-2 animate-slide-right shrink-0">
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
                            <div className="text-[10px] text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 whitespace-nowrap shrink-0">
                                * 선택한 기간의 고객 현황입니다.
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 animate-slide-up">
                            {/* Status Stats */}
                            {statusList.map((status) => (
                                <div
                                    key={status}
                                    onClick={() => setSelectedOverviewStatus(status)}
                                    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all cursor-pointer hover:shadow-md hover:-translate-y-1 ${selectedOverviewStatus === status ? "ring-2 ring-sono-primary ring-offset-2 bg-sono-primary/[0.02]" : ""}`}
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
                                dateFilter={dateFilter}
                                setDateFilter={setDateFilter}
                                customStartDate={customStartDate}
                                setCustomStartDate={setCustomStartDate}
                                customEndDate={customEndDate}
                                setCustomEndDate={setCustomEndDate}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "library" && (
                    <ResourceCenter isAdmin={isAdmin} />
                )}

                {activeTab === "partners" && (
                    <PartnerManagement partners={dashboardData.partners as any} isAdmin={isAdmin} currentUser={currentPartner} onRefresh={() => fetchData()} />
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
                        dateFilter={dateFilter}
                        setDateFilter={setDateFilter}
                        customStartDate={customStartDate}
                        setCustomStartDate={setCustomStartDate}
                        customEndDate={customEndDate}
                        setCustomEndDate={setCustomEndDate}
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

                {activeTab === "settings" && (
                    <div className="space-y-8">
                        {isAdmin ? (
                            <>
                                {/* Sub Navigation */}
                                <div className="flex flex-wrap items-center gap-1 bg-white/50 p-1.5 rounded-2xl border border-gray-100 w-fit mb-4">
                                    <button
                                        onClick={() => setSettingsSubTab("status")}
                                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                                            settingsSubTab === "status"
                                                ? "bg-white text-sono-primary shadow-sm border border-gray-100"
                                                : "text-gray-400 hover:text-sono-dark"
                                        }`}
                                    >
                                        진행상태 설정
                                    </button>
                                    <button
                                        onClick={() => setSettingsSubTab("individual")}
                                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                                            settingsSubTab === "individual"
                                                ? "bg-white text-sono-primary shadow-sm border border-gray-100"
                                                : "text-gray-400 hover:text-sono-dark"
                                        }`}
                                    >
                                        개별페이지 관리
                                    </button>
                                    <button
                                        onClick={() => setSettingsSubTab("account")}
                                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
                                            settingsSubTab === "account"
                                                ? "bg-white text-sono-primary shadow-sm border border-gray-100"
                                                : "text-gray-400 hover:text-sono-dark"
                                        }`}
                                    >
                                        계정 관리
                                    </button>
                                </div>

                                {settingsSubTab === "status" && <StatusManagement />}
                                {settingsSubTab === "individual" && <IndividualPageManagement />}
                                {settingsSubTab === "account" && (
                                    <AccountManagement
                                        partner={currentPartner}
                                        isAdmin={true}
                                        onRefresh={() => fetchData()}
                                    />
                                )}
                            </>
                        ) : (
                            <AccountManagement
                                partner={currentPartner}
                                isAdmin={false}
                                onRefresh={() => fetchData()}
                            />
                        )}
                    </div>
                )}

                {activeTab === "retention2" && (
                    <RetentionManagement2 
                        isAdmin={isAdmin} 
                        partnerId={partner?.partnerId} 
                        partners={dashboardData.partners as any} 
                    />
                )}

                {activeTab === "tms" && currentPartner && (
                    <TMManagement
                        partners={dashboardData.partners as any}
                        parentPartner={currentPartner}
                        onRefresh={() => fetchData()}
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
        </div>

    );
}
