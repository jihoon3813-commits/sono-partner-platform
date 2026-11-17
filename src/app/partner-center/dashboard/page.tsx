"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PartnerManagement from "@/components/dashboard/PartnerManagement";
import ProductManagement from "@/components/dashboard/ProductManagement";
import CustomerManagement from "@/components/dashboard/CustomerManagement";
import CustomerRegistrationModal from "@/components/dashboard/CustomerRegistrationModal";
import PartnerRequests from "@/components/dashboard/PartnerRequests";
import ResourceCenter from "@/components/dashboard/ResourceCenter";
import PartnerFormModal from "@/components/dashboard/PartnerFormModal";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import PromotionManagement from "@/components/dashboard/PromotionManagement";
import StatusManagement from "@/components/dashboard/StatusManagement";
import IndividualPageManagement from "@/components/dashboard/IndividualPageManagement";
import RetentionManagement2 from "@/components/dashboard/RetentionManagement2";
import RetentionManagementPostAug from "@/components/dashboard/RetentionManagementPostAug";
import TMManagement from "@/components/dashboard/TMManagement";
import AccountManagement from "@/components/dashboard/AccountManagement";
import ChannelMappingManagement from "@/components/dashboard/ChannelMappingManagement";
import DataResetManagement from "@/components/dashboard/DataResetManagement";
import { AdminIcon, AdminIconName } from "@/components/dashboard/AdminIcons";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PartnerRequest } from "@/lib/types";
import { getStatusBadgeProps } from "@/lib/statusUtils";
import { getKSTDateString } from "@/lib/dateUtils";
import { updateFaviconBadge, BASE_TITLE } from "@/lib/notificationBadge";

type Tab =
    | "overview"
    | "partners"
    | "products"
    | "promotions"
    | "customers"
    | "requests"
    | "library"
    | "stats"
    | "settings"
    | "retention"
    | "retention2"
    | "retentionPostAug"
    | "tms"
    | "reset";

const TAB_TITLES: Record<Tab, string> = {
    overview: "대시보드",
    customers: "고객 관리",
    partners: "파트너 관리",
    requests: "입점 신청",
    tms: "상담원 관리",
    retention: "유지율 관리",
    retention2: "연체 관리",
    retentionPostAug: "연체 관리 · 8월 이후 가입",
    products: "상품관리",
    promotions: "프로모션",
    stats: "통계",
    library: "자료실",
    settings: "환경설정",
    reset: "데이터 초기화",
};

function parseRefDateString(app: any): string {
    let refDateStr = app?.registrationDate || app?.createdAt || "";
    if (!refDateStr && app?._creationTime) {
        const d = new Date(app._creationTime + 9 * 3600 * 1000);
        return d.toISOString().slice(0, 10);
    }
    if (app?.registrationDate && !String(app.registrationDate).includes("-")) {
        const serial = parseFloat(String(app.registrationDate));
        if (!isNaN(serial) && serial > 30000 && serial < 60000) {
            const d = new Date((serial - 25569) * 86400 * 1000);
            refDateStr = d.toISOString().slice(0, 10);
        }
    }
    if (refDateStr.includes("T")) {
        return refDateStr.slice(0, 10);
    }
    return String(refDateStr).split(" ")[0].replace(/\./g, "-").trim();
}

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

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
    const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
    const [customersInitialStatus, setCustomersInitialStatus] = useState<string>("all");

    const handleTabChange = (id: Tab, statusPreset?: string) => {
        if (statusPreset !== undefined) {
            setCustomersInitialStatus(statusPreset);
        } else if (id === "customers") {
            setCustomersInitialStatus("all");
        }
        setActiveTab(id);
        setMobileMenuOpen(false);
        setNotifOpen(false);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeDashboardTab", id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const [baseUrl, setBaseUrl] = useState("");
    const [copySuccessSmartCare, setCopySuccessSmartCare] = useState(false);
    const [copySuccessHappy450, setCopySuccessHappy450] = useState(false);
    const [copySuccessMaeum, setCopySuccessMaeum] = useState(false);
    const [copySuccessInquiry, setCopySuccessInquiry] = useState(false);
    const [selectedOverviewStatus, setSelectedOverviewStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);
    const [settingsSubTab, setSettingsSubTab] = useState<
        "status" | "individual" | "account" | "channel" | "reset"
    >("status");
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

    // 세션 로드
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

        let session = sessionStorage.getItem("partnerSession");
        if (!session) {
            session = localStorage.getItem("partnerSession");
        }

        if (!session || session === "undefined" || session === "null") {
            const isDev =
                typeof window !== "undefined" &&
                (window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1" ||
                    window.location.hostname.endsWith(".local"));

            if (isDev) {
                const devAdminSession = {
                    partnerId: "admin",
                    name: "총괄 관리자",
                    customUrl: "admin",
                    level: "admin",
                };
                const sessionStr = JSON.stringify(devAdminSession);
                localStorage.setItem("partnerSession", sessionStr);
                sessionStorage.setItem("partnerSession", sessionStr);
                setPartner(devAdminSession);
                setBaseUrl(window.location.origin);
                return;
            }

            sessionStorage.removeItem("partnerSession");
            localStorage.removeItem("partnerSession");
            router.push("/partner-center");
            return;
        }

        try {
            const partnerInfo = JSON.parse(session);
            setPartner(partnerInfo);

            if (
                partnerInfo.role === "admin" ||
                partnerInfo.level === "admin" ||
                partnerInfo.customUrl === "admin" ||
                partnerInfo.loginId === "admin"
            ) {
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

    // Escape 키로 모바일 메뉴 / 알림창 닫기
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setMobileMenuOpen(false);
                setNotifOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Convex 실시간 데이터 쿼리 연결
    const realTimeData = useQuery(
        api.dashboard.getDashboardData,
        partner ? { partnerId: partner.partnerId } : ("skip" as any)
    );

    const dashboardData = {
        isAdmin: realTimeData?.isAdmin || false,
        partners: realTimeData?.partners || [],
        customers: realTimeData?.customers || [],
        pendingRequests: realTimeData?.pendingRequests || [],
        allRequests: realTimeData?.allRequests || [],
    };

    const today = getKSTDateString();
    const newCustomerCount = (dashboardData.customers || []).filter((c: any) => {
        const isInitialStatus = c.status === "접수대기" || c.status === "접수";
        if (!isInitialStatus) return false;
        const regDate = getKSTDateString(c.registrationDate || c.createdAt || c._creationTime);
        return regDate === today;
    }).length;

    // 브라우저 탭 파비콘 및 탭 제목 알림 뱃지
    useEffect(() => {
        if (typeof window === "undefined") return;
        updateFaviconBadge(newCustomerCount);

        if (newCustomerCount <= 0) {
            document.title = BASE_TITLE;
            return;
        }

        const badgeTitle = `🔴 (${newCustomerCount}) ${BASE_TITLE}`;
        const alertTitle = `🔴 (${newCustomerCount}) 신규 고객 접수!`;

        let isAlert = false;
        let blinkInterval: NodeJS.Timeout | null = null;

        const updateTitle = () => {
            if (document.hidden) {
                document.title = isAlert ? alertTitle : badgeTitle;
                isAlert = !isAlert;
            } else {
                document.title = badgeTitle;
            }
        };

        updateTitle();
        blinkInterval = setInterval(updateTitle, 1500);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                document.title = badgeTitle;
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            if (blinkInterval) clearInterval(blinkInterval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.title = BASE_TITLE;
            updateFaviconBadge(0);
        };
    }, [newCustomerCount]);

    const currentPartner =
        dashboardData.partners.find(
            (p: any) =>
                (partner?.partnerId &&
                    (p.partnerId === partner.partnerId ||
                        p.loginId === partner.partnerId ||
                        p.customUrl === partner.partnerId)) ||
                (partner?.loginId &&
                    (p.loginId === partner.loginId ||
                        p.partnerId === partner.loginId ||
                        p.customUrl === partner.loginId)) ||
                (partner?.customUrl &&
                    (p.customUrl === partner.customUrl ||
                        p.partnerId === partner.customUrl ||
                        p.loginId === partner.customUrl))
        ) || partner;

    // 실시간 세션 데이터 동기화
    useEffect(() => {
        if (realTimeData?.partners && partner?.partnerId) {
            const found = dashboardData.partners.find(
                (p: any) =>
                    (partner?.partnerId &&
                        (p.partnerId === partner.partnerId ||
                            p.loginId === partner.partnerId ||
                            p.customUrl === partner.partnerId)) ||
                    (partner?.loginId &&
                        (p.loginId === partner.loginId ||
                            p.partnerId === partner.loginId ||
                            p.customUrl === partner.loginId)) ||
                    (partner?.customUrl &&
                        (p.customUrl === partner.customUrl ||
                            p.partnerId === partner.customUrl ||
                            p.loginId === partner.customUrl))
            );
            if (
                found &&
                (found.showLandingUrl !== partner.showLandingUrl ||
                    found.partnerGroup !== partner.partnerGroup ||
                    JSON.stringify(found.landingVisibility) !==
                        JSON.stringify(partner.landingVisibility))
            ) {
                const updated = {
                    ...partner,
                    showLandingUrl: found.showLandingUrl,
                    landingVisibility: found.landingVisibility,
                    partnerGroup: found.partnerGroup,
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

    const activePartnerObj = currentPartner || partner;
    const isLandingHidden =
        activePartnerObj?.showLandingUrl === false ||
        activePartnerObj?.showLandingUrl === "false";

    const landingVisibility = activePartnerObj?.landingVisibility;
    const isSmartCareVisible = !isLandingHidden && landingVisibility?.smartcare !== false;
    const isHappy450Visible = !isLandingHidden && landingVisibility?.happy450 !== false;
    const isMaeumVisible = !isLandingHidden && landingVisibility?.maeum === true;
    const hasAnyVisibleLanding = isSmartCareVisible || isHappy450Visible || isMaeumVisible;
    const isLandingUrlVisible = Boolean(realTimeData) && !isLandingHidden;

    const fetchData = useCallback(() => {
        setIsRefreshing(true);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeDashboardTab", activeTab);
            window.location.reload();
        }
    }, [activeTab]);

    const handleSelectRequest = (req: PartnerRequest) => {
        setSelectedRequest(req);
    };

    const handleLogout = () => {
        if (hqAdminSession && !isAdmin) {
            if (
                confirm(
                    "본사 어드민 계정으로 복귀하시겠습니까?\n('취소'를 누르시면 전체 로그아웃됩니다)"
                )
            ) {
                handleReturnToHqAdmin();
                return;
            }
        }
        sessionStorage.removeItem("partnerSession");
        localStorage.removeItem("partnerSession");
        localStorage.removeItem("hqAdminSession");
        router.push("/partner-center");
    };

    // Fetch dynamic statuses
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);
    const reorderStatuses = useMutation(api.applicationStatuses.reorderStatuses);
    const [optimisticOverviewStatuses, setOptimisticOverviewStatuses] = useState<string[] | null>(null);
    const [draggedOverviewStatus, setDraggedOverviewStatus] = useState<string | null>(null);
    const [dragOverOverviewStatus, setDragOverOverviewStatus] = useState<string | null>(null);

    useEffect(() => {
        if (dbStatuses) {
            setOptimisticOverviewStatuses(dbStatuses.map((s) => s.label));
        }
    }, [dbStatuses]);

    // 차트 데이터 (실시간 고객 데이터 기반 주간 7일 / 월간 6개월 집계)
    const chartSeries = useMemo(() => {
        const list = dashboardData.customers || [];
        const kstNow = new Date(
            new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000
        );
        const isCompleted = (s?: string) =>
            ["정상가입", "1회출금", "배송완료", "정산예정", "정산완료"].includes(s || "");

        if (chartPeriod === "week") {
            const labels: string[] = [];
            const keys: string[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(kstNow);
                d.setDate(kstNow.getDate() - i);
                const iso = d.toISOString().slice(0, 10);
                keys.push(iso);
                labels.push(`${iso.slice(5, 7)}.${iso.slice(8, 10)}`);
            }
            const totalCounts = keys.map(
                (k) => list.filter((c: any) => parseRefDateString(c) === k).length
            );
            const joinedCounts = keys.map(
                (k) =>
                    list.filter(
                        (c: any) => parseRefDateString(c) === k && isCompleted(c.status)
                    ).length
            );
            return { labels, totalCounts, joinedCounts };
        } else {
            const labels: string[] = [];
            const keys: string[] = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(kstNow.getFullYear(), kstNow.getMonth() - i, 1);
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                keys.push(ym);
                labels.push(`${d.getMonth() + 1}월`);
            }
            const totalCounts = keys.map(
                (k) =>
                    list.filter((c: any) => parseRefDateString(c).slice(0, 7) === k).length
            );
            const joinedCounts = keys.map(
                (k) =>
                    list.filter(
                        (c: any) =>
                            parseRefDateString(c).slice(0, 7) === k && isCompleted(c.status)
                    ).length
            );
            return { labels, totalCounts, joinedCounts };
        }
    }, [dashboardData.customers, chartPeriod]);

    if (!partner || !dashboardData) {
        return (
            <div className="min-h-screen bg-[#f5f6f3] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3.5">
                    <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#295e52] border-t-transparent" />
                    <p className="text-[#45554e] text-xs font-semibold">
                        워크스페이스 데이터를 불러오는 중...
                    </p>
                </div>
            </div>
        );
    }

    const isAdmin =
        dashboardData.isAdmin ||
        partner?.level === "admin" ||
        partner?.partnerId === "admin" ||
        partner?.customUrl === "admin" ||
        partner?.role === "admin";

    const isParentPartner =
        isAdmin ||
        (currentPartner &&
            currentPartner.role !== "tm" &&
            (!currentPartner.parentPartnerId ||
                currentPartner.parentPartnerId === "" ||
                currentPartner.parentPartnerId === "admin" ||
                (dashboardData.partners &&
                    dashboardData.partners.some(
                        (p: any) =>
                            p.partnerId !== currentPartner.partnerId &&
                            p.loginId !== currentPartner.loginId &&
                            ((p.parentPartnerId &&
                                (p.parentPartnerId === currentPartner.partnerId ||
                                    p.parentPartnerId === currentPartner.loginId)) ||
                                (p.parentPartnerName &&
                                    currentPartner.companyName &&
                                    p.parentPartnerName.trim() ===
                                        currentPartner.companyName.trim()))
                    ))));

    // 기간 필터링된 고객 목록
    const dateFilteredCustomers = (dashboardData.customers || []).filter((app) => {
        if (!app) return false;
        if (dateFilter === "all") return true;

        const kstNow = new Date(
            new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000
        );
        const todayStr = kstNow.toISOString().slice(0, 10);
        const thisMonth = kstNow.toISOString().slice(0, 7);
        const kstDatePart = parseRefDateString(app);

        if (dateFilter === "today") {
            return kstDatePart === todayStr;
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
        } else if (dateFilter === "custom") {
            if (customStartDate && kstDatePart < customStartDate) return false;
            if (customEndDate && kstDatePart > customEndDate) return false;
            return true;
        } else {
            const d = new Date(kstNow);
            if (dateFilter === "3months") d.setMonth(kstNow.getMonth() - 3);
            else if (dateFilter === "6months") d.setMonth(kstNow.getMonth() - 6);
            else if (dateFilter === "1year") d.setFullYear(kstNow.getFullYear() - 1);
            else return true;
            const startDateStr = d.toISOString().slice(0, 10);
            return kstDatePart >= startDateStr;
        }
    });

    const statusCounts = dateFilteredCustomers.reduce(
        (acc: Record<string, number>, curr: any) => {
            let status = curr.status || "접수";
            if (
                partner?.role === "tm" &&
                (status === "정산예정" || status === "정산완료")
            ) {
                status = "정상가입";
            }
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        },
        {}
    );

    const defaultStatusList = [
        "접수",
        "대기",
        "상담중",
        "부재",
        "보류",
        "불가",
        "거부",
        "접수취소",
        "녹취완료(출금확인중)",
        "정상가입",
        "1회출금",
        "청약철회",
        "해약",
        "정산완료",
    ];
    const rawStatusList = optimisticOverviewStatuses
        ? optimisticOverviewStatuses
        : dbStatuses
        ? dbStatuses.map((s) => s.label)
        : defaultStatusList;
    const statusList =
        partner?.role === "tm"
            ? rawStatusList.filter((s) => s !== "정산예정" && s !== "정산완료")
            : rawStatusList;

    const handleOverviewStatusDrop = async (targetLabel: string) => {
        if (!isAdmin || !draggedOverviewStatus || draggedOverviewStatus === targetLabel) {
            setDraggedOverviewStatus(null);
            setDragOverOverviewStatus(null);
            return;
        }

        const currentList = [...rawStatusList];
        const fromIdx = currentList.indexOf(draggedOverviewStatus);
        const toIdx = currentList.indexOf(targetLabel);
        if (fromIdx === -1 || toIdx === -1) {
            setDraggedOverviewStatus(null);
            setDragOverOverviewStatus(null);
            return;
        }

        const [moved] = currentList.splice(fromIdx, 1);
        currentList.splice(toIdx, 0, moved);

        setOptimisticOverviewStatuses(currentList);
        setDraggedOverviewStatus(null);
        setDragOverOverviewStatus(null);

        if (dbStatuses && dbStatuses.length > 0) {
            const updates = currentList
                .map((label, idx) => {
                    const doc = dbStatuses.find((s) => s.label === label);
                    return doc ? { id: doc._id, order: idx + 1 } : null;
                })
                .filter((u): u is { id: any; order: number } => u !== null);

            if (updates.length > 0) {
                try {
                    await reorderStatuses({ statuses: updates });
                } catch (err) {
                    console.error("Failed to reorder overview statuses:", err);
                }
            }
        }
    };

    // 핵심 지표 집계 (실제 필터 데이터 기준)
    const totalCount = dateFilteredCustomers.length;
    const waitingCount =
        (statusCounts["접수"] || 0) +
        (statusCounts["접수대기"] || 0) +
        (statusCounts["대기"] || 0);
    const inProgressCount =
        waitingCount +
        (statusCounts["상담중"] || 0) +
        (statusCounts["부재"] || 0) +
        (statusCounts["보류"] || 0);
    const recordingWaitCount = statusCounts["녹취완료(출금확인중)"] || 0;
    const completedCount =
        (statusCounts["정상가입"] || 0) +
        (statusCounts["1회출금"] || 0) +
        (statusCounts["배송완료"] || 0) +
        (statusCounts["정산예정"] || 0) +
        (statusCounts["정산완료"] || 0);
    const conversionRate =
        totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "0.0";

    const displayUserName = isAdmin
        ? partner?.name || "총괄관리자"
        : currentPartner?.companyName ||
          partner?.companyName ||
          partner?.name ||
          partner?.managerName ||
          partner?.loginId ||
          "파트너";

    const workspaceTitle = isAdmin
        ? "본사 총괄관리자"
        : currentPartner?.companyName ||
          partner?.companyName ||
          partner?.name ||
          partner?.loginId ||
          "파트너 워크스페이스";

    const workspaceSubtitle = isAdmin
        ? "소노아임레디 통합 어드민"
        : partner?.role === "tm"
        ? "상담원(TM) 워크스페이스"
        : isParentPartner
        ? "상위 파트너 워크스페이스"
        : "공식 파트너 워크스페이스";

    const avatarChar = isAdmin
        ? "관"
        : String(workspaceTitle).trim().charAt(0) || "파";

    const hasImpersonationBanner = Boolean(hqAdminSession && !isAdmin);
    const hasNotificationAlert =
        newCustomerCount > 0 || (isAdmin && dashboardData.pendingRequests.length > 0);

    // KST 날짜 표기
    const formattedTodayLabel = (() => {
        const d = new Date();
        return d.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        });
    })();

    // 사이드바 하단 외부 링크
    const primaryLandingHref = isAdmin
        ? "/"
        : isSmartCareVisible && partner?.customUrl
        ? `/${partner.customUrl}/smartcare`
        : isHappy450Visible && partner?.customUrl
        ? `/${partner.customUrl}/happy450`
        : isMaeumVisible && partner?.customUrl
        ? `/${partner.customUrl}/maeum`
        : "/";

    // SVG 라인 차트 좌표 생성
    const renderTrendChart = () => {
        const { labels, totalCounts, joinedCounts } = chartSeries;
        const count = labels.length;
        const maxVal = Math.max(5, ...totalCounts, ...joinedCounts);
        const startX = 44;
        const endX = 572;
        const stepX = count > 1 ? (endX - startX) / (count - 1) : 0;
        const baseY = 166;
        const chartHeight = 132;

        const toCoords = (vals: number[]) =>
            vals.map((v, i) => [
                Math.round(startX + i * stepX),
                Math.round(baseY - (v / maxVal) * chartHeight),
            ]);

        const toPath = (pts: number[][]) =>
            pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");

        const mainPts = toCoords(totalCounts);
        const subPts = toCoords(joinedCounts);
        const lastPt = mainPts[mainPts.length - 1] || [endX, baseY];
        const lastVal = totalCounts[totalCounts.length - 1] || 0;

        return (
            <svg
                className="adm-line-chart"
                viewBox="0 0 615 200"
                role="img"
                aria-label="상담 및 가입 추이 차트"
            >
                <defs>
                    <linearGradient id="admChartArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#a8c4a3" stopOpacity="0.25" />
                        <stop offset="1" stopColor="#a8c4a3" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((i) => {
                    const y = 34 + i * 44;
                    const tick = Math.round((maxVal * (3 - i)) / 3);
                    return (
                        <g key={i}>
                            <line className="grid" x1="42" y1={y} x2="582" y2={y} />
                            <text x="10" y={y + 4}>
                                {tick}
                            </text>
                        </g>
                    );
                })}
                {mainPts.length > 1 && (
                    <path
                        d={`${toPath(mainPts)} L${endX} ${baseY} L${startX} ${baseY} Z`}
                        fill="url(#admChartArea)"
                    />
                )}
                {subPts.length > 1 && (
                    <path className="chart-secondary" d={toPath(subPts)} />
                )}
                {mainPts.length > 1 && (
                    <path className="chart-main" d={toPath(mainPts)} />
                )}
                {mainPts.map((pt, idx) => (
                    <circle
                        key={idx}
                        cx={pt[0]}
                        cy={pt[1]}
                        r={idx === mainPts.length - 1 ? 4 : 2.5}
                        fill="#fff"
                        stroke="#295e52"
                        strokeWidth="2"
                    >
                        <title>{`${labels[idx]} 접수 ${totalCounts[idx]}건 · 가입 ${joinedCounts[idx]}건`}</title>
                    </circle>
                ))}
                <rect
                    x={lastPt[0] - 20}
                    y={Math.max(6, lastPt[1] - 30)}
                    width="40"
                    height="20"
                    rx="5"
                    fill="#295e52"
                />
                <text
                    x={lastPt[0]}
                    y={Math.max(20, lastPt[1] - 17)}
                    textAnchor="middle"
                    style={{ fill: "#fff", fontSize: "10px", fontWeight: 600 }}
                >
                    {lastVal}건
                </text>
                {labels.map((lb, idx) => (
                    <text
                        key={lb + idx}
                        x={Math.round(startX + idx * stepX)}
                        y="190"
                        textAnchor="middle"
                    >
                        {lb}
                    </text>
                ))}
            </svg>
        );
    };

    const SidebarNavButton = ({
        id,
        label,
        icon,
        count,
        isAlert = false,
        isSub = false,
    }: {
        id: Tab;
        label: string;
        icon?: AdminIconName;
        count?: number;
        isAlert?: boolean;
        isSub?: boolean;
    }) => (
        <button
            type="button"
            onClick={() => handleTabChange(id)}
            className={`adm-nav-link ${isSub ? "sub" : ""} ${
                activeTab === id ? "active" : ""
            }`}
            aria-current={activeTab === id ? "page" : undefined}
        >
            {icon && <AdminIcon name={icon} />}
            <span>{label}</span>
            {count !== undefined && count > 0 && (
                <span className={`adm-nav-count ${isAlert ? "alert" : ""}`}>
                    {count}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f5f6f3]">
            {/* 본사 어드민 파트너 대리 접속 배너 */}
            {hasImpersonationBanner && (
                <div className="h-10 bg-[#122e29] text-[#edf3ec] px-4 md:px-6 flex items-center justify-between text-xs font-semibold sticky top-0 z-50 border-b border-[#295e52]">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-[#b99a61] text-[#193f39] px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold shrink-0">
                            HQ ADMIN MODE
                        </span>
                        <span className="truncate text-[#d5e2db]">
                            본사 관리자 권한으로 대리 접속 중:{" "}
                            <strong className="text-[#f5f1e7]">{workspaceTitle}</strong>
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleReturnToHqAdmin}
                        className="bg-[#e4ecdd] hover:bg-white text-[#193f39] px-3 py-1 rounded-md text-[11px] font-bold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                        <span>본사 어드민 복귀</span>
                        <AdminIcon name="arrow-right" className="!w-3.5 !h-3.5" />
                    </button>
                </div>
            )}

            {/* 모바일 오버레이 */}
            <div
                className={`adm-mobile-shade ${mobileMenuOpen ? "open" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* 좌측 고정 딥그린 사이드바 */}
            <aside
                className={`adm-sidebar ${mobileMenuOpen ? "open" : ""} ${
                    hasImpersonationBanner ? "has-banner" : ""
                }`}
            >
                <button
                    type="button"
                    onClick={() => handleTabChange("overview")}
                    className="adm-brand text-left bg-transparent border-0 cursor-pointer"
                    aria-label="소노아임레디 파트너센터 홈"
                >
                    <span className="adm-brand-emblem">
                        S<span>•</span>
                    </span>
                    <span>
                        <small>SONO I&apos;M READY</small>
                        <strong>파트너센터</strong>
                    </span>
                </button>

                <div className="adm-workspace">
                    <span className="adm-workspace-icon">
                        <AdminIcon name="building" className="!w-4 !h-4" />
                    </span>
                    <div className="adm-workspace-info">
                        <b title={workspaceTitle}>{workspaceTitle}</b>
                        <small>{workspaceSubtitle}</small>
                    </div>
                </div>

                <nav className="adm-nav" aria-label="주 메뉴">
                    <div className="adm-nav-group">WORKSPACE</div>
                    <SidebarNavButton id="overview" label="대시보드" icon="grid" />

                    <div className="adm-nav-group">영업 관리</div>
                    <SidebarNavButton
                        id="customers"
                        label="고객 관리"
                        icon="users"
                        count={newCustomerCount}
                        isAlert={newCustomerCount > 0}
                    />
                    {isParentPartner && (
                        <SidebarNavButton
                            id="partners"
                            label="파트너 관리"
                            icon="network"
                            count={dashboardData.partners.length}
                        />
                    )}
                    {isAdmin && (
                        <SidebarNavButton
                            id="requests"
                            label="입점 신청"
                            icon="building"
                            count={dashboardData.pendingRequests.length}
                            isAlert={dashboardData.pendingRequests.length > 0}
                        />
                    )}
                    {!isAdmin && partner?.role !== "tm" && (
                        <SidebarNavButton id="tms" label="상담원 관리" icon="phone" />
                    )}
                    <SidebarNavButton id="retention2" label="연체 관리" icon="clock" />
                    <SidebarNavButton
                        id="retentionPostAug"
                        label="8월 이후 가입 고객"
                        isSub={true}
                    />

                    <div className="adm-nav-group">운영 관리</div>
                    {isAdmin && (
                        <>
                            <SidebarNavButton id="products" label="상품관리" icon="box" />
                            <SidebarNavButton id="promotions" label="프로모션" icon="gift" />
                            <SidebarNavButton id="stats" label="통계" icon="chart" />
                        </>
                    )}
                    <SidebarNavButton id="library" label="자료실" icon="folder" />
                </nav>

                <div className="adm-side-bottom">
                    {(isAdmin || (isLandingUrlVisible && hasAnyVisibleLanding)) && (
                        <Link
                            href={primaryLandingHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="adm-landing-link"
                        >
                            <AdminIcon name="external" />
                            <span>{isAdmin ? "공식 홈페이지" : "전용 상품 랜딩"}</span>
                            <AdminIcon name="arrow-up-right" />
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => handleTabChange("settings")}
                        className={`adm-nav-link !text-xs ${
                            activeTab === "settings" || activeTab === "reset" ? "active" : ""
                        }`}
                    >
                        <AdminIcon name="settings" />
                        <span>환경설정</span>
                    </button>

                    <div className="adm-side-profile">
                        <span className="adm-avatar">{avatarChar}</span>
                        <div className="adm-side-profile-text">
                            <strong title={displayUserName}>{displayUserName}</strong>
                            <small>
                                {isAdmin
                                    ? "Administrator"
                                    : partner?.role === "tm"
                                    ? "TM Agent"
                                    : "Partner"}
                            </small>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="p-1.5 rounded-lg text-[#9ab2a6] hover:text-white hover:bg-white/10 transition-colors"
                            title="로그아웃"
                        >
                            <AdminIcon name="logout" className="!w-4 !h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* 우측 메인 셸 */}
            <div className="adm-app-shell">
                {/* 상단 바 */}
                <header className="adm-topbar">
                    <div className="adm-breadcrumb">
                        <button
                            type="button"
                            className="adm-icon-btn adm-mobile-toggle"
                            aria-label="메뉴 열기"
                            onClick={() => setMobileMenuOpen((v) => !v)}
                        >
                            <AdminIcon name="menu" />
                        </button>
                        <button
                            type="button"
                            className="adm-breadcrumb-home"
                            onClick={() => handleTabChange("overview")}
                            title="대시보드 이동"
                        >
                            <AdminIcon name="home" />
                        </button>
                        <span className="adm-breadcrumb-divider">/</span>
                        <span className="text-[#263d36] font-bold">
                            {TAB_TITLES[activeTab] || "대시보드"}
                        </span>
                    </div>

                    <div className="adm-topbar-actions">
                        <span className="adm-role-badge">
                            <i />
                            {isAdmin ? "본사 통합 어드민" : workspaceTitle}
                        </span>

                        <button
                            type="button"
                            onClick={() => fetchData()}
                            disabled={isRefreshing}
                            className="adm-icon-btn"
                            title="새로고침"
                            aria-label="데이터 새로고침"
                        >
                            <AdminIcon
                                name="refresh"
                                className={isRefreshing ? "animate-spin text-[#295e52]" : ""}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                handleTabChange("customers");
                                setTimeout(() => {
                                    const el = document.getElementById("adminCustomerSearch");
                                    el?.focus();
                                }, 100);
                            }}
                            className="adm-icon-btn"
                            title="고객 빠른 검색"
                            aria-label="고객 검색"
                        >
                            <AdminIcon name="search" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setNotifOpen((v) => !v)}
                            className="adm-icon-btn"
                            title="알림 확인"
                            aria-label="알림 보기"
                        >
                            <AdminIcon name="bell" />
                            {hasNotificationAlert && <span className="adm-notif-dot" />}
                        </button>

                        <span className="adm-top-divider" />
                        <span className="adm-top-avatar">{avatarChar}</span>
                        <span className="adm-top-user">{displayUserName}님</span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="adm-btn small !min-h-[30px] !px-2.5 !py-1"
                        >
                            로그아웃
                        </button>
                    </div>
                </header>

                {/* 상단 알림 팝오버 */}
                {notifOpen && (
                    <div className="adm-notif-popover">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-[#263d36]">실시간 알림</h3>
                            <span className="adm-pill green">LIVE</span>
                        </div>
                        <div className="divide-y divide-[#edf0e8]">
                            <button
                                type="button"
                                onClick={() => handleTabChange("customers", "접수대기")}
                                className="adm-task-row"
                            >
                                <span className="adm-task-icon">
                                    <AdminIcon name="users" />
                                </span>
                                <span>
                                    <strong>당일 신규 고객 접수</strong>
                                    <small>접수 / 접수대기 상태 고객 확인</small>
                                </span>
                                <b>{newCustomerCount}</b>
                            </button>
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => handleTabChange("requests")}
                                    className="adm-task-row"
                                >
                                    <span className="adm-task-icon">
                                        <AdminIcon name="building" />
                                    </span>
                                    <span>
                                        <strong>파트너 입점 신청 대기</strong>
                                        <small>검토 및 승인이 필요한 신규 신청</small>
                                    </span>
                                    <b>{dashboardData.pendingRequests.length}</b>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleTabChange("customers", "녹취완료(출금확인중)")}
                                className="adm-task-row"
                            >
                                <span className="adm-task-icon">
                                    <AdminIcon name="mic" />
                                </span>
                                <span>
                                    <strong>녹취완료 · 출금확인 대기</strong>
                                    <small>후속 가입 확인 대상 고객</small>
                                </span>
                                <b>{recordingWaitCount}</b>
                            </button>
                        </div>
                    </div>
                )}

                {/* 메인 콘텐츠 영역 */}
                <main className="adm-main" tabIndex={-1}>
                    {activeTab === "overview" && (
                        <div>
                            {/* 상단 페이지 헤딩 */}
                            <section className="adm-page-heading">
                                <div>
                                    <div className="adm-eyebrow">
                                        {formattedTodayLabel} · 소노아임레디 파트너센터
                                    </div>
                                    <h1>좋은 하루예요, {displayUserName}님.</h1>
                                    <p>
                                        소노아임레디 전체 영업 현황과 고객 상담·가입 진행 상태를 한눈에 확인하세요.
                                    </p>
                                </div>
                                <div className="adm-heading-buttons">
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("reset")}
                                            className="adm-btn danger"
                                        >
                                            <AdminIcon name="trash" />
                                            <span>데이터 초기화</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setIsQuickRegisterOpen(true)}
                                        className="adm-btn primary"
                                    >
                                        <AdminIcon name="plus" />
                                        <span>고객 등록</span>
                                    </button>
                                </div>
                            </section>

                            {/* 기간 필터 바 */}
                            <div className="adm-panel p-3.5 sm:px-5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0 whitespace-nowrap">
                                    <span className="text-[11px] font-bold text-[#7d8879] mr-1.5 inline-flex items-center gap-1">
                                        <AdminIcon name="calendar" className="!w-3.5 !h-3.5" />
                                        조회 기간
                                    </span>
                                    {[
                                        { label: "전체", value: "all" },
                                        { label: "당일", value: "today" },
                                        { label: "전일", value: "yesterday" },
                                        { label: "당월", value: "month" },
                                        { label: "전월", value: "lastMonth" },
                                        { label: "3개월", value: "3months" },
                                        { label: "6개월", value: "6months" },
                                        { label: "1년", value: "1year" },
                                        { label: "기간선택", value: "custom" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setDateFilter(opt.value)}
                                            className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                                                dateFilter === opt.value
                                                    ? "bg-[#295e52] text-white font-bold"
                                                    : "bg-[#f5f6f3] text-[#5d6c61] hover:bg-[#e9eee5]"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}

                                    {dateFilter === "custom" && (
                                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                onClick={(e) => {
                                                    try {
                                                        e.currentTarget.showPicker?.();
                                                    } catch {}
                                                }}
                                                className="border border-[#dfe5d9] rounded-[7px] px-2.5 py-1 text-xs outline-none focus:border-[#295e52] bg-white font-semibold text-[#263d36] cursor-pointer"
                                            />
                                            <span className="text-[#86918a] text-xs">~</span>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                onClick={(e) => {
                                                    try {
                                                        e.currentTarget.showPicker?.();
                                                    } catch {}
                                                }}
                                                className="border border-[#dfe5d9] rounded-[7px] px-2.5 py-1 text-xs outline-none focus:border-[#295e52] bg-white font-semibold text-[#263d36] cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="text-[11px] text-[#86918a] font-medium shrink-0">
                                    선택 기간 기준 실시간 집계
                                </div>
                            </div>

                            {/* 핵심 지표 4개 카드 */}
                            <section className="adm-metrics-grid" aria-label="영업 핵심 지표">
                                <article className="adm-metric">
                                    <div className="adm-metric-head">
                                        <span>전체 상담 접수</span>
                                        <span className="adm-metric-icon">
                                            <AdminIcon name="users" />
                                        </span>
                                    </div>
                                    <div className="adm-metric-value">
                                        {totalCount.toLocaleString()}
                                        <span>건</span>
                                    </div>
                                    <div className="adm-metric-foot">
                                        <span className="adm-metric-trend">
                                            금일 신규 {newCustomerCount}건
                                        </span>
                                        <span>조회 기간 누적 접수</span>
                                    </div>
                                </article>

                                <article className="adm-metric">
                                    <div className="adm-metric-head">
                                        <span>상담 진행 · 대기</span>
                                        <span className="adm-metric-icon">
                                            <AdminIcon name="phone" />
                                        </span>
                                    </div>
                                    <div className="adm-metric-value">
                                        {inProgressCount.toLocaleString()}
                                        <span>건</span>
                                    </div>
                                    <div className="adm-metric-foot">
                                        <span className="adm-metric-trend warning">
                                            접수/대기 {waitingCount}건
                                        </span>
                                        <span>빠른 상담 연결 필요</span>
                                    </div>
                                </article>

                                <article className="adm-metric">
                                    <div className="adm-metric-head">
                                        <span>정상 가입 완료</span>
                                        <span className="adm-metric-icon">
                                            <AdminIcon name="shield" />
                                        </span>
                                    </div>
                                    <div className="adm-metric-value">
                                        {completedCount.toLocaleString()}
                                        <span>건</span>
                                    </div>
                                    <div className="adm-metric-foot">
                                        <span className="adm-metric-trend">
                                            녹취확인 {recordingWaitCount}건
                                        </span>
                                        <span>가입/출금/정산 포함</span>
                                    </div>
                                </article>

                                <article className="adm-metric">
                                    <div className="adm-metric-head">
                                        <span>상담 → 가입 전환율</span>
                                        <span className="adm-metric-icon">
                                            <AdminIcon name="trend" />
                                        </span>
                                    </div>
                                    <div className="adm-metric-value">
                                        {conversionRate}
                                        <span>%</span>
                                    </div>
                                    <div className="adm-metric-foot">
                                        <span className="adm-metric-trend">실시간 전환율</span>
                                        <span>정상가입 / 전체접수</span>
                                    </div>
                                </article>
                            </section>

                            {/* 중단: 추이 차트 + 오늘의 체크포인트 */}
                            <div className="adm-dashboard-middle">
                                <section className="adm-panel">
                                    <div className="adm-panel-top">
                                        <div>
                                            <h2>상담 · 가입 현황</h2>
                                            <p className="adm-panel-subtitle">
                                                접수된 전체 상담과 정상 가입 추이를 비교합니다.
                                            </p>
                                        </div>
                                        <div className="adm-segmented" aria-label="차트 조회 단위">
                                            <button
                                                type="button"
                                                onClick={() => setChartPeriod("week")}
                                                className={chartPeriod === "week" ? "active" : ""}
                                            >
                                                주간(7일)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setChartPeriod("month")}
                                                className={chartPeriod === "month" ? "active" : ""}
                                            >
                                                월간(6개월)
                                            </button>
                                        </div>
                                    </div>
                                    <div className="adm-chart-summary">
                                        <span className="adm-legend-item">
                                            <i className="adm-legend-dot" />
                                            상담 접수
                                        </span>
                                        <span className="adm-legend-item">
                                            <i className="adm-legend-dot sage" />
                                            정상 가입
                                        </span>
                                        <span style={{ marginLeft: "auto" }}>단위: 건</span>
                                    </div>
                                    <div className="adm-chart-wrap">{renderTrendChart()}</div>
                                </section>

                                <section className="adm-panel adm-task-panel">
                                    <div className="adm-task-title">
                                        <h2>오늘의 체크포인트</h2>
                                        <span className="adm-pill gray">TO DO</span>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("customers", "접수대기")}
                                            className="adm-task-row"
                                        >
                                            <span className="adm-task-icon">
                                                <AdminIcon name="phone" />
                                            </span>
                                            <span>
                                                <strong>첫 상담을 기다려요</strong>
                                                <small>신규 접수 · 상담 대기 고객</small>
                                            </span>
                                            <b>{waitingCount}</b>
                                            <AdminIcon name="chevron-right" className="!w-4 !h-4 text-[#a9b1a0]" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleTabChange("customers", "녹취완료(출금확인중)")
                                            }
                                            className="adm-task-row"
                                        >
                                            <span className="adm-task-icon">
                                                <AdminIcon name="mic" />
                                            </span>
                                            <span>
                                                <strong>가입 · 출금 확인 필요</strong>
                                                <small>녹취완료(출금확인중) 고객</small>
                                            </span>
                                            <b>{recordingWaitCount}</b>
                                            <AdminIcon name="chevron-right" className="!w-4 !h-4 text-[#a9b1a0]" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleTabChange("retention2")}
                                            className="adm-task-row"
                                        >
                                            <span className="adm-task-icon">
                                                <AdminIcon name="clock" />
                                            </span>
                                            <span>
                                                <strong>납입 · 연체 현황 확인</strong>
                                                <small>연체 관리 및 후속 안내</small>
                                            </span>
                                            <AdminIcon name="chevron-right" className="!w-4 !h-4 text-[#a9b1a0] ml-auto" />
                                        </button>

                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => handleTabChange("requests")}
                                                className="adm-task-row"
                                            >
                                                <span className="adm-task-icon">
                                                    <AdminIcon name="building" />
                                                </span>
                                                <span>
                                                    <strong>입점 신청 심사</strong>
                                                    <small>신규 파트너 신청 검토</small>
                                                </span>
                                                <b>{dashboardData.pendingRequests.length}</b>
                                                <AdminIcon name="chevron-right" className="!w-4 !h-4 text-[#a9b1a0]" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="adm-task-foot">
                                        <AdminIcon name="info" />
                                        <span>항목을 클릭하면 해당 관리 화면으로 이동합니다.</span>
                                    </div>
                                </section>
                            </div>

                            {/* 상품 랜딩 URL 카드 섹션 (본사 어드민 3종 / 파트너 전용 URL) */}
                            <div className="mb-6 space-y-4">
                                {isAdmin || partner?.customUrl === "admin" ? (
                                    <>
                                        <div className="flex items-center justify-between px-0.5">
                                            <div>
                                                <h2 className="text-base font-bold text-[#263d36] flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[#295e52] inline-block rounded-full" />
                                                    공식 상품 대표 랜딩 URL 바로가기
                                                </h2>
                                                <p className="text-xs text-[#86918a] mt-0.5">
                                                    고객 및 파트너사 안내 시 활용할 수 있는 소노아임레디 공식 상품별 대표 주소입니다.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* 스마트케어 */}
                                            <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <span className="adm-pill orange">BEST POPULAR</span>
                                                        <span className="adm-pill green">가전 결합 상품</span>
                                                    </div>
                                                    <div className="flex gap-3.5 items-start mb-4">
                                                        <img
                                                            src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785825079/2024112600085_0_vbmtin.jpg"
                                                            alt="스마트케어"
                                                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                        />
                                                        <div>
                                                            <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                스마트케어 (SmartCare)
                                                            </h3>
                                                            <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                삼성/LG 최신 가전 렌탈 지원금 전액 제공, 만기 100% 환급 결합 플랜
                                                            </p>
                                                            <p className="text-xs font-bold text-[#295e52] mt-1.5">
                                                                월 33,000원부터
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                        <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                            스마트케어 공식 대표 URL
                                                        </span>
                                                        <span className="font-semibold text-[#295e52] truncate block">
                                                            {baseUrl.replace(/^https?:\/\//, "")}/products/smartcare
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = `${baseUrl}/products/smartcare`;
                                                            navigator.clipboard.writeText(url).then(() => {
                                                                setCopySuccessSmartCare(true);
                                                                setTimeout(() => setCopySuccessSmartCare(false), 2000);
                                                            });
                                                        }}
                                                        className={`adm-btn ${copySuccessSmartCare ? "primary" : "sage"}`}
                                                    >
                                                        <AdminIcon name={copySuccessSmartCare ? "check" : "copy"} />
                                                        <span>{copySuccessSmartCare ? "복사 완료!" : "URL 복사"}</span>
                                                    </button>
                                                    <a
                                                        href="/products/smartcare"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="adm-btn primary"
                                                    >
                                                        <span>페이지 이동</span>
                                                        <AdminIcon name="external" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* 더 해피 450 ONE */}
                                            <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <span className="adm-pill orange">일반 상조 플랜</span>
                                                        <span className="adm-pill gray">인증 제휴 전용</span>
                                                    </div>
                                                    <div className="flex gap-3.5 items-start mb-4">
                                                        <img
                                                            src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png"
                                                            alt="더 해피 450 ONE"
                                                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                        />
                                                        <div>
                                                            <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                더 해피 450 ONE
                                                            </h3>
                                                            <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                기본 상조 서비스, 레디캐시, 만기 100% 전액 환급 스탠다드 플랜
                                                            </p>
                                                            <p className="text-xs font-bold text-[#9a7840] mt-1.5">
                                                                월 18,000원부터
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                        <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                            더 해피 450 공식 대표 URL
                                                        </span>
                                                        <span className="font-semibold text-[#263d36] truncate block">
                                                            {baseUrl.replace(/^https?:\/\//, "")}/products/happy450
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = `${baseUrl}/products/happy450`;
                                                            navigator.clipboard.writeText(url).then(() => {
                                                                setCopySuccessHappy450(true);
                                                                setTimeout(() => setCopySuccessHappy450(false), 2000);
                                                            });
                                                        }}
                                                        className={`adm-btn ${copySuccessHappy450 ? "primary" : "sage"}`}
                                                    >
                                                        <AdminIcon name={copySuccessHappy450 ? "check" : "copy"} />
                                                        <span>{copySuccessHappy450 ? "복사 완료!" : "URL 복사"}</span>
                                                    </button>
                                                    <a
                                                        href="/products/happy450"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="adm-btn primary"
                                                    >
                                                        <span>페이지 이동</span>
                                                        <AdminIcon name="external" />
                                                    </a>
                                                </div>
                                            </div>

                                            {/* 마음든든 */}
                                            <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-3">
                                                        <span className="adm-pill green">NEW 안심 플랜</span>
                                                        <span className="adm-pill teal">2·5·1 잔금 보장</span>
                                                    </div>
                                                    <div className="flex gap-3.5 items-start mb-4">
                                                        <img
                                                            src="/images/maeum/family-moment.png"
                                                            alt="마음든든"
                                                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                        />
                                                        <div>
                                                            <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                마음든든
                                                            </h3>
                                                            <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                2·5·1 구조 잔금 보장 혜택, 약정 의전서비스 및 소노 멤버십 제공
                                                            </p>
                                                            <p className="text-xs font-bold text-[#295e52] mt-1.5">
                                                                월 32,000원부터
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                        <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                            마음든든 공식 대표 URL
                                                        </span>
                                                        <span className="font-semibold text-[#295e52] truncate block">
                                                            {baseUrl.replace(/^https?:\/\//, "")}/products/maeum
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const url = `${baseUrl}/products/maeum`;
                                                            navigator.clipboard.writeText(url).then(() => {
                                                                setCopySuccessMaeum(true);
                                                                setTimeout(() => setCopySuccessMaeum(false), 2000);
                                                            });
                                                        }}
                                                        className={`adm-btn ${copySuccessMaeum ? "primary" : "sage"}`}
                                                    >
                                                        <AdminIcon name={copySuccessMaeum ? "check" : "copy"} />
                                                        <span>{copySuccessMaeum ? "복사 완료!" : "URL 복사"}</span>
                                                    </button>
                                                    <a
                                                        href="/products/maeum"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="adm-btn primary"
                                                    >
                                                        <span>페이지 이동</span>
                                                        <AdminIcon name="external" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : isLandingUrlVisible && partner?.customUrl ? (
                                    <>
                                        {hasAnyVisibleLanding && (
                                            <>
                                                <div className="flex items-center justify-between px-0.5">
                                                    <div>
                                                        <h2 className="text-base font-bold text-[#263d36] flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-[#295e52] inline-block rounded-full" />
                                                            파트너 전용 상품 연결 URL 관리
                                                        </h2>
                                                        <p className="text-xs text-[#86918a] mt-0.5">
                                                            고객에게 공유할 상품별 전용 주소와 상담 신청 링크를 복사해 활용하세요. (경로: /{partner.customUrl}/...)
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {isSmartCareVisible && (
                                                        <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                            <div>
                                                                <div className="flex items-center gap-1.5 mb-3">
                                                                    <span className="adm-pill orange">BEST POPULAR</span>
                                                                    <span className="adm-pill green">가전 결합 상품</span>
                                                                </div>
                                                                <div className="flex gap-3.5 items-start mb-4">
                                                                    <img
                                                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785825079/2024112600085_0_vbmtin.jpg"
                                                                        alt="스마트케어"
                                                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                                    />
                                                                    <div>
                                                                        <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                            스마트케어 (SmartCare)
                                                                        </h3>
                                                                        <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                            삼성/LG 최신 가전 렌탈 지원금 전액 제공, 만기 100% 환급 결합 플랜
                                                                        </p>
                                                                        <p className="text-xs font-bold text-[#295e52] mt-1.5">
                                                                            월 33,000원부터
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                                    <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                                        스마트케어 파트너 전용 URL
                                                                    </span>
                                                                    <span className="font-semibold text-[#295e52] truncate block">
                                                                        {baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/smartcare
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const url = `${baseUrl}/${partner.customUrl}/smartcare`;
                                                                        navigator.clipboard.writeText(url).then(() => {
                                                                            setCopySuccessSmartCare(true);
                                                                            setTimeout(() => setCopySuccessSmartCare(false), 2000);
                                                                        });
                                                                    }}
                                                                    className={`adm-btn ${copySuccessSmartCare ? "primary" : "sage"}`}
                                                                >
                                                                    <AdminIcon name={copySuccessSmartCare ? "check" : "copy"} />
                                                                    <span>{copySuccessSmartCare ? "복사 완료!" : "URL 복사"}</span>
                                                                </button>
                                                                <a
                                                                    href={`/${partner.customUrl}/smartcare`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="adm-btn primary"
                                                                >
                                                                    <span>페이지 이동</span>
                                                                    <AdminIcon name="external" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isHappy450Visible && (
                                                        <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                            <div>
                                                                <div className="flex items-center gap-1.5 mb-3">
                                                                    <span className="adm-pill orange">일반 상조 플랜</span>
                                                                    <span className="adm-pill gray">인증 제휴 전용</span>
                                                                </div>
                                                                <div className="flex gap-3.5 items-start mb-4">
                                                                    <img
                                                                        src="https://res.cloudinary.com/lyjyvy54/image/upload/v1785308928/ChatGPT_Image_2026%EB%85%84_7%EC%9B%94_29%EC%9D%BC_%EC%98%A4%ED%9B%84_03_38_13_1_1_mpokg4.png"
                                                                        alt="더 해피 450 ONE"
                                                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                                    />
                                                                    <div>
                                                                        <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                            더 해피 450 ONE
                                                                        </h3>
                                                                        <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                            기본 상조 서비스, 레디캐시, 만기 100% 전액 환급 스탠다드 플랜
                                                                        </p>
                                                                        <p className="text-xs font-bold text-[#9a7840] mt-1.5">
                                                                            월 18,000원부터
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                                    <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                                        더 해피 450 파트너 전용 URL
                                                                    </span>
                                                                    <span className="font-semibold text-[#263d36] truncate block">
                                                                        {baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/happy450
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const url = `${baseUrl}/${partner.customUrl}/happy450`;
                                                                        navigator.clipboard.writeText(url).then(() => {
                                                                            setCopySuccessHappy450(true);
                                                                            setTimeout(() => setCopySuccessHappy450(false), 2000);
                                                                        });
                                                                    }}
                                                                    className={`adm-btn ${copySuccessHappy450 ? "primary" : "sage"}`}
                                                                >
                                                                    <AdminIcon name={copySuccessHappy450 ? "check" : "copy"} />
                                                                    <span>{copySuccessHappy450 ? "복사 완료!" : "URL 복사"}</span>
                                                                </button>
                                                                <a
                                                                    href={`/${partner.customUrl}/happy450`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="adm-btn primary"
                                                                >
                                                                    <span>페이지 이동</span>
                                                                    <AdminIcon name="external" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isMaeumVisible && (
                                                        <div className="adm-panel p-5 flex flex-col justify-between hover:border-[#adc0ad] transition-all">
                                                            <div>
                                                                <div className="flex items-center gap-1.5 mb-3">
                                                                    <span className="adm-pill green">NEW 안심 플랜</span>
                                                                    <span className="adm-pill teal">2·5·1 잔금 보장</span>
                                                                </div>
                                                                <div className="flex gap-3.5 items-start mb-4">
                                                                    <img
                                                                        src="/images/maeum/family-moment.png"
                                                                        alt="마음든든"
                                                                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-[10px] shrink-0 border border-[#e6eae3]"
                                                                    />
                                                                    <div>
                                                                        <h3 className="text-base font-bold text-[#263d36] mb-1">
                                                                            마음든든
                                                                        </h3>
                                                                        <p className="text-xs text-[#7c877b] line-clamp-2 leading-relaxed">
                                                                            2·5·1 구조 잔금 보장 혜택, 약정 의전서비스 및 소노 멤버십 제공
                                                                        </p>
                                                                        <p className="text-xs font-bold text-[#295e52] mt-1.5">
                                                                            월 32,000원부터
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-[#f8f9f5] border border-[#e6eae3] p-2.5 rounded-[9px] mb-3.5 font-mono text-xs truncate">
                                                                    <span className="text-[#8e978a] font-sans block text-[10px] font-semibold mb-0.5">
                                                                        마음든든 파트너 전용 URL
                                                                    </span>
                                                                    <span className="font-semibold text-[#295e52] truncate block">
                                                                        {baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/maeum
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#edf0e7]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const url = `${baseUrl}/${partner.customUrl}/maeum`;
                                                                        navigator.clipboard.writeText(url).then(() => {
                                                                            setCopySuccessMaeum(true);
                                                                            setTimeout(() => setCopySuccessMaeum(false), 2000);
                                                                        });
                                                                    }}
                                                                    className={`adm-btn ${copySuccessMaeum ? "primary" : "sage"}`}
                                                                >
                                                                    <AdminIcon name={copySuccessMaeum ? "check" : "copy"} />
                                                                    <span>{copySuccessMaeum ? "복사 완료!" : "URL 복사"}</span>
                                                                </button>
                                                                <a
                                                                    href={`/${partner.customUrl}/maeum`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="adm-btn primary"
                                                                >
                                                                    <span>페이지 이동</span>
                                                                    <AdminIcon name="external" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* 상담신청 전용 URL 카드 */}
                                        <div className="bg-[#193f39] text-white rounded-[14px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#2d584e]">
                                            <div className="flex items-center gap-3.5 w-full md:w-auto min-w-0">
                                                <div className="w-11 h-11 rounded-[10px] bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                                                    <AdminIcon name="phone" className="text-[#d6e5cb]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="bg-[#e4ecdd]/20 text-[#dbe8cd] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5 inline-block">
                                                        INQUIRY ONLY
                                                    </span>
                                                    <h4 className="text-sm sm:text-base font-bold text-white">
                                                        상담 신청 전용 URL
                                                    </h4>
                                                    <p className="text-xs text-[#b8ccc2] font-mono mt-0.5 truncate">
                                                        {baseUrl.replace(/^https?:\/\//, "")}/{partner.customUrl}/inquiry
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const url = `${baseUrl}/${partner.customUrl}/inquiry`;
                                                        navigator.clipboard.writeText(url).then(() => {
                                                            setCopySuccessInquiry(true);
                                                            setTimeout(() => setCopySuccessInquiry(false), 2000);
                                                        });
                                                    }}
                                                    className="flex-1 md:flex-none adm-btn !bg-[#e4ecdd] !border-[#e4ecdd] !text-[#193f39] hover:!bg-white"
                                                >
                                                    <AdminIcon name={copySuccessInquiry ? "check" : "copy"} />
                                                    <span>
                                                        {copySuccessInquiry ? "복사 완료!" : "상담신청 URL 복사"}
                                                    </span>
                                                </button>
                                                <a
                                                    href={`/${partner.customUrl}/inquiry`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 md:flex-none adm-btn !bg-transparent !border-white/25 !text-white hover:!bg-white/10"
                                                >
                                                    <span>페이지 이동</span>
                                                    <AdminIcon name="external" />
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>

                            {/* 진행상태별 세부 집계 카드 그리드 */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3 px-0.5">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-[#263d36]">
                                            진행 상태별 고객 현황
                                        </h2>
                                        {isAdmin && (
                                            <span className="text-[11px] text-[#86918a] font-medium">
                                                · 드래그하여 상태 순서 변경 가능
                                            </span>
                                        )}
                                    </div>
                                    {selectedOverviewStatus !== "all" && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedOverviewStatus("all")}
                                            className="adm-btn small"
                                        >
                                            <span>필터 해제 ({selectedOverviewStatus})</span>
                                            <AdminIcon name="close" className="!w-3 !h-3" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                                    {statusList.map((status) => {
                                        const badge = getStatusBadgeProps(status, dbStatuses);
                                        const isSelected = selectedOverviewStatus === status;
                                        const isDraggable = isAdmin && Boolean(dbStatuses && dbStatuses.length > 0);
                                        const isDraggingThis = draggedOverviewStatus === status;
                                        const isDragOverThis =
                                            dragOverOverviewStatus === status && draggedOverviewStatus !== status;
                                        return (
                                            <div
                                                key={status}
                                                draggable={isDraggable}
                                                onDragStart={(e) => {
                                                    if (!isDraggable) return;
                                                    setDraggedOverviewStatus(status);
                                                    e.dataTransfer.effectAllowed = "move";
                                                    e.dataTransfer.setData("text/plain", status);
                                                }}
                                                onDragOver={(e) => {
                                                    if (!isDraggable || !draggedOverviewStatus || draggedOverviewStatus === status)
                                                        return;
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = "move";
                                                    if (dragOverOverviewStatus !== status) {
                                                        setDragOverOverviewStatus(status);
                                                    }
                                                }}
                                                onDragLeave={() => {
                                                    if (dragOverOverviewStatus === status) {
                                                        setDragOverOverviewStatus(null);
                                                    }
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    void handleOverviewStatusDrop(status);
                                                }}
                                                onDragEnd={() => {
                                                    setDraggedOverviewStatus(null);
                                                    setDragOverOverviewStatus(null);
                                                }}
                                                onClick={() =>
                                                    setSelectedOverviewStatus(
                                                        isSelected ? "all" : status
                                                    )
                                                }
                                                title={
                                                    isDraggable
                                                        ? `${status} · 클릭하여 필터링 / 드래그하여 위치 이동`
                                                        : status
                                                }
                                                className={`adm-panel p-3.5 cursor-pointer transition-all hover:border-[#9eb49e] ${
                                                    isSelected
                                                        ? "!border-[#295e52] ring-2 ring-[#295e52]/20 !bg-[#f6faf4]"
                                                        : ""
                                                } ${isDraggingThis ? "opacity-35" : ""} ${
                                                    isDragOverThis ? "!border-[#295e52] !bg-[#eef5eb]" : ""
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.className}`}
                                                        style={badge.style}
                                                    >
                                                        {status}
                                                    </span>
                                                    {isDraggable && (
                                                        <span className="text-[#b7c2b0] opacity-60">
                                                            <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
                                                                <circle cx="2" cy="2.5" r="1" />
                                                                <circle cx="6" cy="2.5" r="1" />
                                                                <circle cx="2" cy="6" r="1" />
                                                                <circle cx="6" cy="6" r="1" />
                                                                <circle cx="2" cy="9.5" r="1" />
                                                                <circle cx="6" cy="9.5" r="1" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-bold text-[#263d36] tracking-tight tabular-nums">
                                                        {statusCounts[status] || 0}
                                                    </span>
                                                    <span className="text-[#86918a] font-semibold text-[11px]">
                                                        건
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 대시보드 하단 최근/필터링 고객 목록 패널 */}
                            <section className="adm-panel p-5 md:p-6">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#edf0e7]">
                                    <div>
                                        <h2 className="text-base font-bold text-[#263d36]">
                                            {selectedOverviewStatus === "all"
                                                ? "전체 접수 고객 목록"
                                                : `'${selectedOverviewStatus}' 상태 고객 목록`}
                                        </h2>
                                        <p className="text-xs text-[#86918a] mt-0.5">
                                            고객 행을 클릭하면 우측 상세 패널에서 정보·상담이력·녹취를 확인하고 수정할 수 있습니다.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange("customers")}
                                        className="adm-btn small"
                                    >
                                        <span>고객 관리 전체화면</span>
                                        <AdminIcon name="arrow-right" />
                                    </button>
                                </div>

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
                            </section>
                        </div>
                    )}

                    {activeTab === "library" && <ResourceCenter isAdmin={isAdmin} />}

                    {activeTab === "partners" && (
                        <PartnerManagement
                            partners={dashboardData.partners as any}
                            isAdmin={isAdmin}
                            currentUser={currentPartner}
                            onRefresh={() => fetchData()}
                        />
                    )}

                    {activeTab === "products" && isAdmin && <ProductManagement />}

                    {activeTab === "promotions" && isAdmin && <PromotionManagement />}

                    {activeTab === "customers" && (
                        <CustomerManagement
                            applications={dashboardData.customers as any}
                            onRefresh={() => fetchData()}
                            partners={dashboardData.partners as any}
                            isAdmin={isAdmin}
                            initialStatusFilter={customersInitialStatus}
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
                            allRequests={dashboardData.allRequests as any}
                            onRefresh={() => fetchData()}
                            onSelectRequest={handleSelectRequest}
                        />
                    )}

                    {activeTab === "stats" && isAdmin && <AnalyticsDashboard />}

                    {activeTab === "settings" && (
                        <div>
                            <section className="adm-page-heading">
                                <div>
                                    <div className="adm-eyebrow">SONO I&apos;M READY · SETTINGS</div>
                                    <h1>환경설정</h1>
                                    <p>
                                        워크스페이스 진행 상태, 계정 보안 및 운영 연동 기준을 설정합니다.
                                    </p>
                                </div>
                            </section>

                            {isAdmin ? (
                                <div className="adm-settings-layout">
                                    <nav
                                        className="adm-panel adm-settings-nav"
                                        aria-label="설정 메뉴"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSettingsSubTab("status")}
                                            className={settingsSubTab === "status" ? "active" : ""}
                                        >
                                            <AdminIcon name="check-circle" />
                                            <span>진행상태 설정</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsSubTab("individual")}
                                            className={
                                                settingsSubTab === "individual" ? "active" : ""
                                            }
                                        >
                                            <AdminIcon name="external" />
                                            <span>개별페이지 관리</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsSubTab("account")}
                                            className={settingsSubTab === "account" ? "active" : ""}
                                        >
                                            <AdminIcon name="shield" />
                                            <span>계정 관리</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsSubTab("channel")}
                                            className={settingsSubTab === "channel" ? "active" : ""}
                                        >
                                            <AdminIcon name="file" />
                                            <span>판매채널(엑셀) 설정</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsSubTab("reset")}
                                            className={`danger ${
                                                settingsSubTab === "reset" ? "active" : ""
                                            }`}
                                        >
                                            <AdminIcon name="trash" />
                                            <span>데이터 초기화</span>
                                        </button>
                                    </nav>

                                    <div className="min-w-0">
                                        {settingsSubTab === "status" && <StatusManagement />}
                                        {settingsSubTab === "individual" && (
                                            <IndividualPageManagement />
                                        )}
                                        {settingsSubTab === "channel" && (
                                            <ChannelMappingManagement />
                                        )}
                                        {settingsSubTab === "reset" && <DataResetManagement />}
                                        {settingsSubTab === "account" && (
                                            <AccountManagement
                                                partner={currentPartner}
                                                isAdmin={true}
                                                onRefresh={() => fetchData()}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <AccountManagement
                                    partner={currentPartner}
                                    isAdmin={false}
                                    onRefresh={() => fetchData()}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === "reset" && <DataResetManagement />}

                    {activeTab === "retention2" && (
                        <RetentionManagement2
                            isAdmin={isAdmin}
                            partnerId={partner?.partnerId}
                            partners={dashboardData.partners as any}
                        />
                    )}

                    {activeTab === "retentionPostAug" && (
                        <RetentionManagementPostAug
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
                </main>

                <footer className="adm-footer">
                    <span>© 2026 SONO I&apos;M READY · Partner Center</span>
                    <span>소노아임레디 통합 영업관리 워크스페이스</span>
                    <span>SONO ADMIN SYSTEM</span>
                </footer>
            </div>

            {/* 대시보드 빠른 고객 등록 패널 */}
            {isQuickRegisterOpen && (
                <CustomerRegistrationModal
                    onClose={() => setIsQuickRegisterOpen(false)}
                    onSuccess={() => {
                        setIsQuickRegisterOpen(false);
                        fetchData();
                    }}
                    partner={currentPartner}
                    partners={dashboardData.partners as any}
                    isAdmin={isAdmin}
                />
            )}

            {/* 입점 신청 승인/검토 패널 */}
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
                        loginId: selectedRequest.loginId,
                        loginPassword: selectedRequest.loginPassword,
                        customUrl: selectedRequest.customUrl,
                        pointInfo: selectedRequest.pointRate,
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
        </div>
    );
}
