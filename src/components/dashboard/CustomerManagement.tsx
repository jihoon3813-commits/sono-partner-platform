import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Application, Partner } from "@/lib/types";
import { RecentSmsCell, LatestSmsSummary } from "./RecentSmsCell";
import {
    syncCustomersToGoogleContacts,
    getCachedGoogleContactPhones,
    normalizeKoreanPhone,
} from "@/utils/googleContacts";
import { DEFAULT_SMS_TEMPLATES, SmsTemplate } from "@/constants/smsTemplates";
import CustomerDetailModal from "./CustomerDetailModal";
import CustomerRegistrationModal from "./CustomerRegistrationModal";
import BulkUploadModal from "./BulkUploadModal";
import LifeJoyExportModal from "./LifeJoyExportModal";
import SonoRegisterModal from "./SonoRegisterModal";
import RecordingModal from "./RecordingModal";
import { AdminIcon } from "./AdminIcons";
import { getStatusBadgeProps } from "@/lib/statusUtils";
import {
    getKSTDateString,
    getKSTMonthsAgoDateString,
    getKSTLastMonthRange,
    formatDateTime,
} from "@/lib/dateUtils";
import { formatBytes } from "@/lib/downloadUtils";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { generateFilledContractPdf, triggerPdfDownload, ContractFieldDef } from "@/lib/maeumPdf";

interface CustomerManagementProps {
    applications: Application[];
    onRefresh: () => void;
    partners?: Partner[];
    isWidget?: boolean;
    isAdmin?: boolean;
    initialStatusFilter?: string;
    currentUser?: Partner | null;
    dateFilter?: string;
    setDateFilter?: (val: string) => void;
    customStartDate?: string;
    setCustomStartDate?: (val: string) => void;
    customEndDate?: string;
    setCustomEndDate?: (val: string) => void;
    mode?: "default" | "maeum";
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
    setCustomEndDate: liftedSetCustomEndDate,
    mode = "default",
}: CustomerManagementProps) {
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);
    const reorderStatuses = useMutation(api.applicationStatuses.reorderStatuses);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const [optimisticStatuses, setOptimisticStatuses] = useState<string[] | null>(null);
    const [draggedStatus, setDraggedStatus] = useState<string | null>(null);
    const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

    useEffect(() => {
        if (dbStatuses) {
            setOptimisticStatuses(dbStatuses.map((s) => s.label));
        }
    }, [dbStatuses]);

    const getStatusBadge = (status: string) => {
        return getStatusBadgeProps(status, dbStatuses);
    };

    const getProductTypeLabel = (productType: string) => {
        const type = productType?.toLowerCase() || "";
        if (type === "happy450" || type.includes("해피") || type.includes("happy")) {
            return "더 해피 450 ONE";
        }
        if (type.includes("스마트케어(광고)")) {
            return productType;
        }
        if (
            type.includes("스마트케어4") ||
            type.includes("smartcare4") ||
            type.includes("smart4")
        ) {
            return "스마트케어4";
        }
        if (
            type.includes("스마트케어5") ||
            type.includes("smartcare5") ||
            type.includes("smart5")
        ) {
            return "스마트케어5";
        }
        if (type === "smartcare" || type.includes("스마트") || type.includes("smart")) {
            return "스마트케어";
        }
        if (type === "maeum" || type.includes("마음든든")) {
            return type.includes("마음든든") ? productType : "마음든든";
        }
        return productType || "-";
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [isLifeJoyExportModalOpen, setIsLifeJoyExportModalOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showStatusHelp, setShowStatusHelp] = useState(false);
    const [checkingApp, setCheckingApp] = useState<Application | null>(null);
    const confirmDuplicate = useMutation(api.applications.confirmDuplicate);
    const confirmAdditional = useMutation(api.applications.confirmAdditional);

    const deleteApplications = useMutation(api.applications.deleteApplications);
    const updateMultipleApplicationStatuses = useMutation(
        api.applications.updateMultipleApplicationStatuses
    );

    // 문자(SMS) & 구글 주소록 (총괄어드민 전용)
    const smsSettingsData = useQuery(api.sms.getSmsSettings, isAdmin ? {} : "skip");
    const unreadSmsCounts = (useQuery(api.sms.getUnreadInboundCounts, isAdmin ? {} : "skip") ??
        {}) as Record<string, number>;
    const latestSmsMap = (useQuery(api.sms.getLatestSmsByApplication, isAdmin ? {} : "skip") ??
        {}) as Record<string, LatestSmsSummary>;
    const markGoogleContactsSynced = useMutation(api.sms.markGoogleContactsSynced);
    const sendBulkSmsAction = useAction(api.sms.sendBulkSms);

    const [unreadSmsOnly, setUnreadSmsOnly] = useState(false);
    const [isSyncingGoogleContacts, setIsSyncingGoogleContacts] = useState(false);
    const [googleContactsProgress, setGoogleContactsProgress] = useState("");
    const [isBulkSmsModalOpen, setIsBulkSmsModalOpen] = useState(false);
    const [bulkSmsTitle, setBulkSmsTitle] = useState("[소노아임레디] 안내");
    const [bulkSmsMessage, setBulkSmsMessage] = useState(DEFAULT_SMS_TEMPLATES[0].content);
    const [isSendingBulkSms, setIsSendingBulkSms] = useState(false);

    const totalUnreadSms = useMemo(
        () =>
            isAdmin
                ? Object.values(unreadSmsCounts).reduce((sum, n) => sum + (n || 0), 0)
                : 0,
        [isAdmin, unreadSmsCounts]
    );

    const cachedContactPhones = useMemo(
        () => (isAdmin ? getCachedGoogleContactPhones() : new Set<string>()),
        [isAdmin, isSyncingGoogleContacts]
    );

    const smsTemplates: SmsTemplate[] =
        Array.isArray(smsSettingsData?.templates) && smsSettingsData.templates.length > 0
            ? smsSettingsData.templates
            : DEFAULT_SMS_TEMPLATES;

    const [bulkStatus, setBulkStatus] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // 소노아임레디(THEHAPPYONE) 등록 상태 관리
    const [isBulkRegisteringSono, setIsBulkRegisteringSono] = useState(false);
    const [sonoTargetApp, setSonoTargetApp] = useState<Application | null>(null);
    const [isSonoModalOpen, setIsSonoModalOpen] = useState(false);

    // 녹취 파일 관리 상태
    const recordingStats = useQuery(api.recordings.getRecordingStats) || {};
    const [recordingTargetApp, setRecordingTargetApp] = useState<Application | null>(null);
    const contractPdfMap = useQuery(api.maeumContracts.getContractPdfMap, mode === "maeum" ? {} : "skip") || {};
    const activeMaeumTemplate = useQuery(api.maeumContracts.getActiveTemplate, mode === "maeum" ? {} : "skip");

    const handleDownloadContractPdf = async (app: Application) => {
        const info = contractPdfMap[app.applicationNo];
        if (info?.pdfUrl) {
            const a = document.createElement("a");
            a.href = info.pdfUrl;
            a.download = `마음든든_전자계약서_${app.customerName || "고객"}_${app.applicationNo}.pdf`;
            a.target = "_blank";
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }
        if (app.contractData && activeMaeumTemplate?.pdfUrl) {
            try {
                const bytes = await generateFilledContractPdf({
                    templatePdfUrl: activeMaeumTemplate.pdfUrl,
                    fields: (activeMaeumTemplate.fields || []) as ContractFieldDef[],
                    contractData: app.contractData,
                    signatureDataUrl: app.contractSignatureDataUrl,
                });
                triggerPdfDownload(
                    bytes,
                    `마음든든_전자계약서_${app.customerName || "고객"}_${app.applicationNo}.pdf`
                );
            } catch (err: any) {
                alert("PDF 생성 중 오류가 발생했습니다: " + (err?.message || ""));
            }
        }
    };

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
    const [productFilter, setProductFilter] = useState<string>("all");
    const [partnersFilter, setPartnersFilter] = useState<string>("all");
    const [_internalDateFilter, _setInternalDateFilter] = useState<string>("all");
    const [_internalCustomStartDate, _setInternalCustomStartDate] = useState("");
    const [_internalCustomEndDate, _setInternalCustomEndDate] = useState("");

    const dateFilter = liftedDateFilter || _internalDateFilter;
    const setDateFilter = liftedSetDateFilter || _setInternalDateFilter;
    const customStartDate = liftedCustomStartDate || _internalCustomStartDate;
    const setCustomStartDate = liftedSetCustomStartDate || _setInternalCustomStartDate;
    const customEndDate = liftedCustomEndDate || _internalCustomEndDate;
    const setCustomEndDate = liftedSetCustomEndDate || _setInternalCustomEndDate;

    // Sorting & Pagination
    const [sortBy, setSortBy] = useState<"updatedAt" | "createdAtAsc" | "createdAtDesc">(
        "updatedAt"
    );
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (initialStatusFilter) {
            setStatusFilter(initialStatusFilter);
        }
    }, [initialStatusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        statusFilter,
        productFilter,
        partnersFilter,
        dateFilter,
        customStartDate,
        customEndDate,
        itemsPerPage,
        sortBy,
    ]);

    const defaultStatuses = [
        "접수대기",
        "접수완료",
        "부재",
        "보류",
        "불가",
        "거부",
        "접수취소",
        "녹취완료(출금확인중)",
        "정상가입",
        "배송완료",
        "청약철회",
        "해약",
        "정산완료",
    ];

    const rawAvailableStatuses = optimisticStatuses
        ? optimisticStatuses
        : dbStatuses
        ? dbStatuses.map((s) => s.label)
        : defaultStatuses;

    const availableStatuses =
        currentUser?.role === "tm"
            ? rawAvailableStatuses.filter((s) => s !== "정산예정" && s !== "정산완료")
            : rawAvailableStatuses;

    const statusOptions = ["전체", ...availableStatuses];

    const handleStatusDrop = async (targetLabel: string) => {
        if (!isAdmin || !draggedStatus || draggedStatus === targetLabel || targetLabel === "전체") {
            setDraggedStatus(null);
            setDragOverStatus(null);
            return;
        }

        const currentList = [...rawAvailableStatuses];
        const fromIdx = currentList.indexOf(draggedStatus);
        const toIdx = currentList.indexOf(targetLabel);
        if (fromIdx === -1 || toIdx === -1) {
            setDraggedStatus(null);
            setDragOverStatus(null);
            return;
        }

        const [moved] = currentList.splice(fromIdx, 1);
        currentList.splice(toIdx, 0, moved);

        setOptimisticStatuses(currentList);
        setDraggedStatus(null);
        setDragOverStatus(null);

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
                    console.error("Failed to reorder statuses:", err);
                }
            }
        }
    };

    const productOptions = [
        "전체",
        ...Array.from(
            new Set(
                applications
                    .map((app) => getProductTypeLabel(app.productType))
                    .filter(Boolean)
            )
        ),
    ];

    const dateOptions = [
        { label: "전체", value: "all" },
        { label: "당일", value: "today" },
        { label: "전일", value: "yesterday" },
        { label: "당월", value: "month" },
        { label: "전월", value: "lastMonth" },
        { label: "3개월", value: "3months" },
        { label: "6개월", value: "6months" },
        { label: "1년", value: "1year" },
        { label: "기간선택", value: "custom" },
    ];

    const today = getKSTDateString();
    const thisMonth = today.slice(0, 7);

    const getStartDateStr = (filter: string) => {
        if (filter === "3months") return getKSTMonthsAgoDateString(3);
        if (filter === "6months") return getKSTMonthsAgoDateString(6);
        if (filter === "1year") return getKSTMonthsAgoDateString(12);
        return "";
    };

    const getPartnerLoginId = (partnerId: string, partnerName?: string) => {
        if (!partners || partners.length === 0) return partnerId;
        let p = partners.find(
            (p) => p.partnerId === partnerId || p.loginId === partnerId
        );
        if (!p && partnerName) {
            p = partners.find((p) => p.companyName === partnerName);
        }
        return p?.loginId || partnerId;
    };

    const getParentPartnerInfo = (partnerId: string, partnerName?: string) => {
        if (!partners || partners.length === 0) return null;
        let p = partners.find(
            (item) => item.partnerId === partnerId || item.loginId === partnerId
        );
        if (!p && partnerName) {
            p = partners.find((item) => item.companyName === partnerName);
        }
        if (!p) return null;

        const parentId = p.parentPartnerId?.trim();
        const parentName = p.parentPartnerName?.trim();

        if (!parentId && !parentName) return null;
        if (parentId === "admin" || parentId === "") return null;

        const parent = partners.find(
            (item) =>
                (parentId &&
                    (item.partnerId === parentId ||
                        item.loginId?.toLowerCase() === parentId.toLowerCase() ||
                        item.customUrl?.toLowerCase() === parentId.toLowerCase())) ||
                (parentName && item.companyName?.trim() === parentName)
        );

        const resolvedName = parent?.companyName || parentName || parentId;
        const resolvedLoginId =
            parent?.loginId ||
            (parentId && parentId !== parentName && parentId !== resolvedName
                ? parentId
                : "");

        return {
            name: resolvedName,
            loginId: resolvedLoginId,
        };
    };

    const getDisplayStatus = (status: string) => {
        if (
            currentUser?.role === "tm" &&
            (status === "정산예정" || status === "정산완료")
        ) {
            return "정상가입";
        }
        return status || "접수대기";
    };

    // 1. Initial filtered applications (search, date, partner)
    const initialFiltered = (applications || []).filter((app) => {
        if (!app) return false;
        const isMaeumApp =
            (app.productType || "").toLowerCase().includes("maeum") ||
            (app.productType || "").includes("마음든든");
        if (mode === "maeum" && !isMaeumApp) return false;
        if (mode !== "maeum" && isMaeumApp) return false;

        const name = (app.customerName || "").toLowerCase();
        const cleanName = name.replace(/\s+/g, "");
        const phone = app.customerPhone || "";
        const cleanPhone = phone.replace(/\s+/g, "");
        const pName = (app.partnerName || "").toLowerCase();
        const pId = (app.partnerId || "").toLowerCase();
        const sTerm = (searchTerm || "").toLowerCase().trim();
        const cleanSTerm = sTerm.replace(/\s+/g, "");

        let nameMatch = cleanName.includes(cleanSTerm);
        if (cleanSTerm.includes("*") && cleanSTerm.length >= 2) {
            const parts = cleanSTerm.split("*");
            if (parts.length === 2) {
                const start = parts[0];
                const end = parts[1];
                nameMatch = cleanName.startsWith(start) && cleanName.endsWith(end);
            }
        }

        const parentInfo = getParentPartnerInfo(app.partnerId, app.partnerName);
        const parentName = (parentInfo?.name || "").toLowerCase();
        const parentLogin = (parentInfo?.loginId || "").toLowerCase();

        const searchMatch =
            nameMatch ||
            cleanPhone.includes(cleanSTerm) ||
            pName.includes(sTerm) ||
            pId.includes(sTerm) ||
            (parentInfo && (parentName.includes(sTerm) || parentLogin.includes(sTerm)));
        if (!searchMatch) return false;

        if (dateFilter && dateFilter !== "all") {
            let refDateStr = app.registrationDate || app.createdAt || "";
            if (app.registrationDate && !app.registrationDate.includes("-")) {
                const serial = parseFloat(String(app.registrationDate));
                if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                    const d = new Date((serial - 25569) * 86400 * 1000);
                    refDateStr = getKSTDateString(d);
                }
            }
            const kstDatePart = getKSTDateString(refDateStr);

            if (dateFilter === "today") {
                if (kstDatePart !== today) return false;
            } else if (dateFilter === "yesterday") {
                const yesterday = getKSTDateString(new Date(Date.now() - 86400000));
                if (kstDatePart !== yesterday) return false;
            } else if (dateFilter === "month") {
                if (kstDatePart.slice(0, 7) !== thisMonth) return false;
            } else if (dateFilter === "lastMonth") {
                const lastMonthRange = getKSTLastMonthRange();
                if (
                    kstDatePart < lastMonthRange.start ||
                    kstDatePart > lastMonthRange.end
                )
                    return false;
            } else if (dateFilter === "custom") {
                if (customStartDate && kstDatePart < customStartDate) return false;
                if (customEndDate && kstDatePart > customEndDate) return false;
            } else {
                const startDateStr = getStartDateStr(dateFilter);
                if (startDateStr && kstDatePart < startDateStr) return false;
            }
        }

        if (isAdmin && partnersFilter !== "all") {
            const selectedPartner = partners.find((p) => p.partnerId === partnersFilter);
            if (selectedPartner) {
                const appPartnerId = String(app.partnerId || "").trim();
                const appPartnerName = String(app.partnerName || "").trim();

                const matchesId = appPartnerId === selectedPartner.partnerId;
                const matchesLoginId = appPartnerId === selectedPartner.loginId;
                const matchesName = appPartnerName === selectedPartner.companyName;

                if (!matchesId && !matchesLoginId && !matchesName) return false;
            } else {
                if (String(app.partnerId || "").trim() !== String(partnersFilter).trim())
                    return false;
            }
        }

        return true;
    });

    // Status tab counts (based on current search/date/partner/product filter)
    const statusTabCounts = useMemo(() => {
        const counts: Record<string, number> = { all: 0 };
        initialFiltered.forEach((app) => {
            const appProductLabel = getProductTypeLabel(app.productType);
            if (productFilter !== "all" && appProductLabel !== productFilter) return;
            counts.all = (counts.all || 0) + 1;
            const st = getDisplayStatus(app.status || "접수대기");
            counts[st] = (counts[st] || 0) + 1;
        });
        return counts;
    }, [initialFiltered, productFilter, currentUser?.role]);

    // 2. Status & Product Filter
    const filteredApplications = initialFiltered.filter((app) => {
        if (isAdmin && unreadSmsOnly) {
            const unread = app._id ? unreadSmsCounts[String(app._id)] || 0 : 0;
            if (unread === 0) return false;
        }
        const displayStatus = getDisplayStatus(app.status || "접수대기");
        const statusMatch = statusFilter === "all" || displayStatus === statusFilter;
        if (!statusMatch) return false;

        const appProductLabel = getProductTypeLabel(app.productType);
        const productMatch =
            productFilter === "all" || appProductLabel === productFilter;

        return productMatch;
    });

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

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedApplications.length / itemsPerPage));
    const paginatedApplications = sortedApplications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const displayApplications = isWidget
        ? sortedApplications.slice(0, 10)
        : paginatedApplications;

    const handleBulkRegisterSono = async () => {
        if (selectedAppIds.length === 0) return;
        if (
            !confirm(
                `선택한 ${selectedAppIds.length}명의 고객을 소노아임레디로 일괄 접수하시겠습니까?`
            )
        ) {
            return;
        }

        setIsBulkRegisteringSono(true);
        let successCount = 0;
        let duplicateCount = 0;
        let failCount = 0;

        try {
            for (const appNo of selectedAppIds) {
                try {
                    const res = await fetch("/api/sono/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ applicationNo: appNo }),
                    });
                    const data = await res.json();
                    if (data.status === "SUCCESS") successCount++;
                    else if (data.status === "DUPLICATE") duplicateCount++;
                    else failCount++;
                } catch {
                    failCount++;
                }
            }

            alert(
                `[소노아임레디 일괄 접수 완료]\n- 신규 성공: ${successCount}건\n- 당일 기접수: ${duplicateCount}건\n- 실패: ${failCount}건`
            );
            setSelectedAppIds([]);
            onRefresh();
        } catch (err: any) {
            alert(`일괄 처리 중 오류 발생: ${err.message || String(err)}`);
        } finally {
            setIsBulkRegisteringSono(false);
        }
    };

    const handleExcelDownload = async () => {
        if (selectedAppIds.length === 0) {
            alert(
                "다운로드할 고객을 선택해 주세요.\n(목록 좌측의 체크박스를 선택하거나 최상단 체크박스로 전체 선택할 수 있습니다.)"
            );
            return;
        }

        if (isDownloading) return;

        setIsDownloading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 50));

            const targetApps = sortedApplications.filter((app) =>
                selectedAppIds.includes(app.applicationNo)
            );
            const targetNos = new Set(targetApps.map((a) => a.applicationNo));
            applications.forEach((app) => {
                if (
                    selectedAppIds.includes(app.applicationNo) &&
                    !targetNos.has(app.applicationNo)
                ) {
                    targetApps.push(app);
                }
            });

            if (targetApps.length === 0) {
                alert("선택된 고객 데이터가 없습니다.");
                return;
            }

            const exportRows = targetApps.map((app, index) => {
                const parentInfo = getParentPartnerInfo(app.partnerId, app.partnerName);
                const parentDisplay = parentInfo
                    ? `${parentInfo.name}${
                          parentInfo.loginId ? ` (${parentInfo.loginId})` : ""
                      }`
                    : "-";
                const accessPathLabel = app.accessPath === "H" ? "홈페이지" : "직접등록";
                const rawPlan = app.planType || "-";
                const planDisplay =
                    rawPlan !== "-" && !rawPlan.includes("구좌")
                        ? `${rawPlan}구좌`
                        : rawPlan;

                return {
                    no: targetApps.length - index,
                    accessPath: accessPathLabel,
                    applicationNo: app.applicationNo || "-",
                    createdAt: formatDateTime(app.createdAt, (app as any)._creationTime),
                    parentPartner: parentDisplay,
                    partnerName: app.partnerName || "-",
                    partnerId: app.partnerId || "-",
                    partnerLoginId:
                        getPartnerLoginId(app.partnerId, app.partnerName) || "-",
                    customerName: app.customerName || "-",
                    customerPhone: formatPhoneNumber(app.customerPhone) || "-",
                    productName: getProductTypeLabel(app.productType),
                    combinedProduct:
                        mode === "maeum"
                            ? app.selectedGift || "-"
                            : app.products || app.selectedGift || "-",
                    planType: planDisplay,
                    address: app.customerAddress || "-",
                    zipcode: app.customerZipcode || "-",
                    birth: app.customerBirth || "-",
                    gender: app.customerGender || "-",
                    email: app.customerEmail || "-",
                    memberId: app.partnerMemberId || "-",
                    preferredTime: app.preferredContactTime || "-",
                    inquiry: app.inquiry?.trim() || "-",
                    status: getDisplayStatus(app.status),
                    firstPaymentDate: app.firstPaymentDate || "-",
                    registrationDate: app.registrationDate || "-",
                    paymentMethod: app.paymentMethod || "-",
                    cancellationProcessing: app.cancellationProcessing || "-",
                    withdrawalProcessing: app.withdrawalProcessing || "-",
                    remarks: app.remarks?.trim() || "-",
                };
            });

            const response = await fetch("/api/excel/export-customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rows: exportRows,
                    exportDate: new Date().toLocaleString("ko-KR", {
                        timeZone: "Asia/Seoul",
                    }),
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(
                    errData.error || "엑셀 파일 생성 중 오류가 발생했습니다."
                );
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);

            const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
            link.setAttribute(
                "download",
                `고객상담내역_${yyyymmdd}_${targetApps.length}건.xlsx`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error("Excel download error:", error);
            alert(`다운로드 중 오류가 발생했습니다: ${error.message || error}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const hasActiveFilter =
        searchTerm !== "" ||
        statusFilter !== "all" ||
        productFilter !== "all" ||
        partnersFilter !== "all" ||
        dateFilter !== "all";

    const resetAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setProductFilter("all");
        setPartnersFilter("all");
        setDateFilter("all");
        setCustomStartDate("");
        setCustomEndDate("");
    };

    const renderTable = () => (
        <div className="adm-table-scroll">
            <table className="adm-table">
                <thead>
                    <tr>
                        <th className="w-[42px] text-center">
                            <input
                                type="checkbox"
                                checked={
                                    displayApplications.length > 0 &&
                                    displayApplications.every((app) =>
                                        selectedAppIds.includes(app.applicationNo)
                                    )
                                }
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        const currentNos = displayApplications.map(
                                            (app) => app.applicationNo
                                        );
                                        setSelectedAppIds((prev) =>
                                            Array.from(new Set([...prev, ...currentNos]))
                                        );
                                    } else {
                                        const currentNos = new Set(
                                            displayApplications.map(
                                                (app) => app.applicationNo
                                            )
                                        );
                                        setSelectedAppIds((prev) =>
                                            prev.filter((id) => !currentNos.has(id))
                                        );
                                    }
                                }}
                                className="w-3.5 h-3.5 cursor-pointer"
                                aria-label="전체 선택"
                            />
                        </th>
                        <th className="text-center w-[54px]">경로</th>
                        <th className="text-center w-[56px]">No.</th>
                        <th className="w-[125px]">접수 일시</th>
                        <th>상위 파트너</th>
                        <th>담당 파트너</th>
                        <th>고객 정보</th>
                        <th>가입 상품</th>
                        <th className="text-center">구좌</th>
                        <th>{mode === "maeum" ? "사은품" : "결합제품"}</th>
                        <th className="text-center">
                            <span className="inline-flex items-center gap-1">
                                진행 상태
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStatusHelp(true);
                                    }}
                                    className="text-[#94a08f] hover:text-[#163a6b] transition-colors inline-grid place-items-center"
                                    title="상태 용어 설명"
                                >
                                    <AdminIcon name="info" className="!w-3.5 !h-3.5" />
                                </button>
                            </span>
                        </th>
                        <th className="text-center">녹취</th>
                        {isAdmin && <th className="w-[190px]">최근 문자</th>}
                        {isAdmin && <th className="text-center">소노 접수</th>}
                    </tr>
                </thead>
                <tbody>
                    {displayApplications.length > 0 ? (
                        displayApplications.map((app, index) => {
                            const isUpdated = (() => {
                                if (!app.statusUpdatedAt) return false;
                                try {
                                    const updatedAt = new Date(
                                        app.statusUpdatedAt
                                    ).getTime();
                                    const now = new Date().getTime();
                                    return now - updatedAt < 24 * 60 * 60 * 1000;
                                } catch {
                                    return false;
                                }
                            })();

                            const parentInfo = getParentPartnerInfo(
                                app.partnerId,
                                app.partnerName
                            );
                            const badge = getStatusBadge(getDisplayStatus(app.status));
                            const stat = recordingStats[app.applicationNo];
                            const recCount = stat ? stat.count : 0;
                            const recSizeText =
                                stat && stat.totalSize > 0
                                    ? formatBytes(stat.totalSize)
                                    : "";

                            return (
                                <tr
                                    key={app.applicationNo}
                                    onClick={() => setSelectedApp(app)}
                                    className="adm-clickable-row"
                                >
                                    <td
                                        className="text-center relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isUpdated && (
                                            <span
                                                className="
                                                absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#c96453] rounded-full"
                                                title="최근 24시간 이내 상태 변경됨"
                                            />
                                        )}
                                        <input
                                            type="checkbox"
                                            checked={selectedAppIds.includes(
                                                app.applicationNo
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedAppIds((prev) => [
                                                        ...prev,
                                                        app.applicationNo,
                                                    ]);
                                                } else {
                                                    setSelectedAppIds((prev) =>
                                                        prev.filter(
                                                            (id) =>
                                                                id !== app.applicationNo
                                                        )
                                                    );
                                                }
                                            }}
                                            className="w-3.5 h-3.5 cursor-pointer"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`adm-pill ${
                                                app.accessPath === "H" ? "blue" : "gray"
                                            }`}
                                            title={
                                                app.accessPath === "H"
                                                    ? "홈페이지 유입"
                                                    : "직접 등록"
                                            }
                                        >
                                            {app.accessPath || "D"}
                                        </span>
                                    </td>
                                    <td className="text-center text-xs text-[#788699] font-mono tabular-nums">
                                        {sortedApplications.length -
                                            ((currentPage - 1) * itemsPerPage + index)}
                                    </td>
                                    <td className="text-xs text-[#5a6b82] tabular-nums">
                                        {formatDateTime(
                                            app.createdAt,
                                            (app as any)._creationTime
                                        )}
                                    </td>
                                    <td>
                                        {parentInfo ? (
                                            <div>
                                                <div className="text-xs font-bold text-[#162438]">
                                                    {parentInfo.name}
                                                </div>
                                                {parentInfo.loginId && (
                                                    <div className="text-[10px] text-[#788699] font-mono">
                                                        {parentInfo.loginId}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-[#8b9cb3]">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="text-xs font-bold text-[#162438]">
                                            {app.partnerName}
                                        </div>
                                        {partners.length > 0 && (
                                            <div className="text-[10px] text-[#788699] font-mono">
                                                {getPartnerLoginId(
                                                    app.partnerId,
                                                    app.partnerName
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div className="adm-person">
                                                <span
                                                    className={`adm-person-circle ${
                                                        index % 2 === 1 ? "alt" : ""
                                                    }`}
                                                >
                                                    {(app.customerName || "고").charAt(0)}
                                                </span>
                                                <span>
                                                    <strong>{app.customerName}</strong>
                                                    <small className="tabular-nums">
                                                        {app.customerPhone}
                                                    </small>
                                                </span>
                                            </div>
                                            {app.hasDuplicate && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCheckingApp(app);
                                                    }}
                                                    className={`adm-pill cursor-pointer border ${
                                                        app.duplicateConfirmed
                                                            ? app.isAdditionalRegistration
                                                                ? "blue border-[#cde0ee]"
                                                                : "green border-[#d4e1f4]"
                                                            : "red border-[#ead5cf] animate-pulse"
                                                    }`}
                                                >
                                                    {app.duplicateConfirmed
                                                        ? app.isAdditionalRegistration
                                                            ? "추가접수"
                                                            : "중복확인"
                                                        : "중복접수"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="font-bold text-[#163a6b] text-xs">
                                        {getProductTypeLabel(app.productType)}
                                    </td>
                                    <td className="text-center text-xs font-semibold text-[#3b495c]">
                                        {app.planType
                                            ? app.planType.includes("구좌")
                                                ? app.planType
                                                : `${app.planType}구좌`
                                            : "-"}
                                    </td>
                                    <td
                                        className="text-xs text-[#5a6b82] max-w-[180px] truncate"
                                        title={mode === "maeum" ? app.selectedGift : app.products || app.selectedGift}
                                    >
                                        {mode === "maeum" ? (
                                            app.selectedGift ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef6e7] text-[#8a5318] border border-[#f2dec0] font-semibold text-[11px]">
                                                    🎁 {app.selectedGift}
                                                </span>
                                            ) : (
                                                "-"
                                            )
                                        ) : (app.productType || "")
                                              .toLowerCase()
                                              .includes("smart") ||
                                          (app.productType || "").includes("스마트") ? (
                                            app.products || "-"
                                        ) : app.selectedGift ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef6e7] text-[#8a5318] border border-[#f2dec0] font-semibold text-[11px]">
                                                🎁 {app.selectedGift}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <span
                                            className={`px-2.5 py-1 rounded-[5px] text-[10.5px] font-bold inline-block ${badge.className}`}
                                            style={badge.style}
                                        >
                                            {getDisplayStatus(app.status)}
                                        </span>
                                    </td>
                                    <td
                                        className="text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="inline-flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setRecordingTargetApp(app);
                                                }}
                                                className={`adm-btn small !py-1 !px-2 !min-h-[27px] ${
                                                    recCount > 0 ? "sage" : ""
                                                }`}
                                                title={
                                                    recCount > 0
                                                        ? `녹취 파일 ${recCount}건 (${recSizeText}) - 클릭하여 듣기/관리`
                                                        : "녹취 음성파일 업로드"
                                                }
                                            >
                                                <AdminIcon
                                                    name="mic"
                                                    className="!w-3.5 !h-3.5"
                                                />
                                                <span>
                                                    {recCount > 0 ? `${recCount}건` : "등록"}
                                                </span>
                                                {recCount > 0 && recSizeText && (
                                                    <span className="text-[9.5px] opacity-80 font-mono">
                                                        ({recSizeText})
                                                    </span>
                                                )}
                                            </button>
                                            {mode === "maeum" &&
                                                (contractPdfMap[app.applicationNo]?.pdfUrl ||
                                                    contractPdfMap[app.applicationNo]?.hasContractData) && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadContractPdf(app);
                                                        }}
                                                        className="adm-btn small primary !py-1 !px-2 !min-h-[27px]"
                                                        title="전자계약서 PDF 다운로드"
                                                    >
                                                        <AdminIcon
                                                            name="download"
                                                            className="!w-3.5 !h-3.5"
                                                        />
                                                        <span>PDF</span>
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <RecentSmsCell
                                                latestSms={
                                                    app._id
                                                        ? latestSmsMap[String(app._id)]
                                                        : undefined
                                                }
                                                unreadCount={
                                                    app._id
                                                        ? unreadSmsCounts[String(app._id)] || 0
                                                        : 0
                                                }
                                            />
                                        </td>
                                    )}
                                    {isAdmin && (
                                        <td
                                            className="text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="inline-flex items-center justify-center gap-1.5">
                                                {app.sonoRegisterStatus === "SUCCESS" && (
                                                    <span
                                                        className="adm-pill green"
                                                        title={
                                                            app.sonoRegisterMessage ||
                                                            "접수 완료"
                                                        }
                                                    >
                                                        완료
                                                    </span>
                                                )}
                                                {app.sonoRegisterStatus ===
                                                    "DUPLICATE" && (
                                                    <span
                                                        className="adm-pill orange"
                                                        title={
                                                            app.sonoRegisterMessage ||
                                                            "당일 기접수"
                                                        }
                                                    >
                                                        기접수
                                                    </span>
                                                )}
                                                {app.sonoRegisterStatus === "FAILED" && (
                                                    <span
                                                        className="adm-pill red"
                                                        title={
                                                            app.sonoRegisterMessage ||
                                                            "전송 실패"
                                                        }
                                                    >
                                                        실패
                                                    </span>
                                                )}
                                                {!app.sonoRegisterStatus && (
                                                    <span className="adm-pill gray">
                                                        미접수
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSonoTargetApp(app);
                                                        setIsSonoModalOpen(true);
                                                    }}
                                                    className="adm-btn small !py-1 !px-2 !min-h-[26px]"
                                                    title="소노아임레디(THEHAPPYONE) 접수 확인 및 등록"
                                                >
                                                    {app.sonoRegisterStatus
                                                        ? "재전송"
                                                        : "접수"}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={isAdmin ? 14 : 12}
                                className="py-16 text-center text-xs text-[#788699]"
                            >
                                검색 조건에 해당하는 고객 내역이 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={isWidget ? "" : "space-y-4"}>
            {!isWidget && (
                <>
                    {/* 상단 페이지 헤딩 & 주요 액션 버튼 */}
                    <section className="adm-page-heading">
                        <div>
                            <div className="adm-eyebrow">
                                {mode === "maeum"
                                    ? "MAEUM · CUSTOMERS"
                                    : "SONO I'M READY · CUSTOMERS"}
                            </div>
                            <h1>{mode === "maeum" ? "고객 관리 (마음든든)" : "고객 관리"}</h1>
                            <p>
                                상담 접수부터 녹취·본사 접수·정상 가입까지 전체 고객 여정을 한눈에 관리하세요. (검색 결과{" "}
                                <strong className="text-[#163a6b]">
                                    {filteredApplications.length.toLocaleString()}
                                </strong>
                                명)
                            </p>
                        </div>

                        <div className="adm-heading-buttons">
                            <button
                                type="button"
                                onClick={handleExcelDownload}
                                disabled={isDownloading}
                                className={`adm-btn ${
                                    selectedAppIds.length > 0 ? "sage" : ""
                                }`}
                                title={
                                    selectedAppIds.length > 0
                                        ? `선택한 ${selectedAppIds.length}명의 고객 내역을 엑셀로 다운로드합니다.`
                                        : "체크박스로 선택한 고객을 엑셀로 다운로드합니다."
                                }
                            >
                                <AdminIcon name="download" />
                                <span>
                                    {isDownloading
                                        ? "준비 중..."
                                        : selectedAppIds.length > 0
                                        ? `선택 엑셀 다운로드 (${selectedAppIds.length})`
                                        : "엑셀 다운로드"}
                                </span>
                            </button>

                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsBulkUploadModalOpen(true)}
                                    className="adm-btn"
                                >
                                    <AdminIcon name="upload" />
                                    <span>본사 엑셀 업로드</span>
                                </button>
                            )}

                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setIsLifeJoyExportModalOpen(true)}
                                    className="adm-btn sage"
                                    title="hoon 폴더의 가입요청 엑셀 파일에 신규 고객을 자동 추가하고 다운로드합니다."
                                >
                                    <AdminIcon name="file" />
                                    <span>가입요청 엑셀 업데이트</span>
                                </button>
                            )}

                            {isAdmin && (
                                <button
                                    type="button"
                                    disabled={isSyncingGoogleContacts}
                                    onClick={async () => {
                                        const clientId =
                                            smsSettingsData?.googleContacts?.clientId || "";
                                        if (!clientId) {
                                            alert(
                                                "Google OAuth 클라이언트 ID가 설정되지 않았습니다.\n환경설정 > 문자(SMS) 관리 > [구글 주소록 자동등록]에서 클라이언트 ID를 먼저 저장해주세요."
                                            );
                                            return;
                                        }
                                        const targets =
                                            selectedAppIds.length > 0
                                                ? applications.filter((a) =>
                                                      selectedAppIds.includes(a.applicationNo)
                                                  )
                                                : sortedApplications;
                                        const unsynced = targets.filter((a) => {
                                            const norm = normalizeKoreanPhone(
                                                a.customerPhone || ""
                                            );
                                            return (
                                                norm.length >= 9 &&
                                                !a.googleContactsSyncedAt &&
                                                !cachedContactPhones.has(norm)
                                            );
                                        });
                                        const listToSync = unsynced.length > 0 ? unsynced : targets;
                                        if (listToSync.length === 0) {
                                            alert("구글 주소록에 등록할 고객이 없습니다.");
                                            return;
                                        }
                                        if (
                                            !confirm(
                                                `${listToSync.length}명의 고객을 구글 주소록에 등록하시겠습니까?\n(이미 등록된 전화번호는 자동으로 건너뜁니다)`
                                            )
                                        ) {
                                            return;
                                        }
                                        setIsSyncingGoogleContacts(true);
                                        setGoogleContactsProgress("준비 중...");
                                        try {
                                            const res = await syncCustomersToGoogleContacts(
                                                listToSync.map((a) => ({
                                                    _id: a._id,
                                                    customerName: a.customerName,
                                                    customerPhone: a.customerPhone,
                                                    productType: a.productType,
                                                    products: a.products,
                                                    selectedGift: a.selectedGift,
                                                    status: a.status,
                                                })),
                                                clientId,
                                                {
                                                    onProgress: (msg) =>
                                                        setGoogleContactsProgress(msg),
                                                }
                                            );
                                            if (res.syncedCustomerIds.length > 0) {
                                                await markGoogleContactsSynced({
                                                    applicationIds:
                                                        res.syncedCustomerIds as Id<"applications">[],
                                                });
                                            }
                                            alert(
                                                `구글 주소록 등록 완료!\n• 신규 등록: ${res.createdCount}명\n• 기존 중복 건너뜀: ${res.skippedDuplicateCount}명` +
                                                    (res.failedCount > 0
                                                        ? `\n• 실패: ${res.failedCount}명`
                                                        : "")
                                            );
                                        } catch (err: any) {
                                            alert(
                                                `구글 주소록 등록 실패: ${err?.message || "알 수 없는 오류"}`
                                            );
                                        } finally {
                                            setIsSyncingGoogleContacts(false);
                                            setGoogleContactsProgress("");
                                        }
                                    }}
                                    className="adm-btn"
                                    title="고객 연락처를 구글 주소록에 일괄 등록합니다 (회사폰 자동 동기화)"
                                >
                                    <AdminIcon name="phone" />
                                    <span>
                                        {isSyncingGoogleContacts
                                            ? googleContactsProgress || "주소록 등록 중..."
                                            : selectedAppIds.length > 0
                                              ? `주소록 등록 (${selectedAppIds.length})`
                                              : "구글 주소록 등록"}
                                    </span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsRegistrationModalOpen(true)}
                                className="adm-btn primary"
                            >
                                <AdminIcon name="plus" />
                                <span>고객 직접 등록</span>
                            </button>
                        </div>
                    </section>

                    {/* 다중 선택 시 노출되는 컨텍스트 액션 바 */}
                    {selectedAppIds.length > 0 && (
                        <div className="adm-bulk-bar">
                            <div className="flex items-center gap-3">
                                <span className="adm-pill green !bg-[#163a6b] !text-white">
                                    {selectedAppIds.length}명 선택됨
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedAppIds([])}
                                    className="text-xs text-[#b8ccc2] hover:text-white underline cursor-pointer bg-transparent border-0"
                                >
                                    선택 해제
                                </button>
                            </div>

                            {isAdmin && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-[8px] border border-white/15">
                                        <select
                                            value={bulkStatus}
                                            onChange={(e) => setBulkStatus(e.target.value)}
                                            className="bg-white text-[#162438] text-xs font-semibold rounded-[6px] px-2.5 py-1 border-0 outline-none"
                                        >
                                            <option value="" disabled>
                                                변경할 상태 선택
                                            </option>
                                            {availableStatuses.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!bulkStatus) {
                                                    alert("변경할 상태를 선택해 주세요.");
                                                    return;
                                                }
                                                if (
                                                    confirm(
                                                        `선택한 ${selectedAppIds.length}건의 상태를 '${bulkStatus}'(으)로 일괄 변경하시겠습니까?`
                                                    )
                                                ) {
                                                    setIsUpdatingStatus(true);
                                                    try {
                                                        const count =
                                                            await updateMultipleApplicationStatuses(
                                                                {
                                                                    applicationNos:
                                                                        selectedAppIds,
                                                                    newStatus: bulkStatus,
                                                                    changedBy: "admin",
                                                                    memo: "본사 어드민 상태 일괄 변경",
                                                                }
                                                            );
                                                        setSelectedAppIds([]);
                                                        setBulkStatus("");
                                                        onRefresh();
                                                        alert(
                                                            `${count}건의 고객 상태가 변경되었습니다.`
                                                        );
                                                    } catch (err) {
                                                        console.error(
                                                            "Bulk status update failed",
                                                            err
                                                        );
                                                        alert(
                                                            "상태 변경 중 오류가 발생했습니다."
                                                        );
                                                    } finally {
                                                        setIsUpdatingStatus(false);
                                                    }
                                                }
                                            }}
                                            disabled={isUpdatingStatus || !bulkStatus}
                                            className="adm-btn small primary !min-h-[28px]"
                                        >
                                            <AdminIcon name="check" />
                                            <span>
                                                {isUpdatingStatus
                                                    ? "변경 중..."
                                                    : "상태 일괄 변경"}
                                            </span>
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsBulkSmsModalOpen(true)}
                                        className="adm-btn small !bg-[#e6f4ea] !border-[#cce8d5] !text-[#137333]"
                                    >
                                        <AdminIcon name="phone" />
                                        <span>문자 일괄 발송 ({selectedAppIds.length})</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleBulkRegisterSono}
                                        disabled={isBulkRegisteringSono}
                                        className="adm-btn small !bg-[#dce7f7] !border-[#dce7f7] !text-[#0c2340]"
                                    >
                                        <AdminIcon name="external" />
                                        <span>
                                            {isBulkRegisteringSono
                                                ? "접수 중..."
                                                : `소노 일괄 접수 (${selectedAppIds.length})`}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (
                                                confirm(
                                                    `선택한 ${selectedAppIds.length}건을 삭제하시겠습니까?`
                                                )
                                            ) {
                                                setIsDeleting(true);
                                                try {
                                                    await deleteApplications({
                                                        applicationNos: selectedAppIds,
                                                    });
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
                                        className="adm-btn small danger"
                                    >
                                        <AdminIcon name="trash" />
                                        <span>선택 삭제 ({selectedAppIds.length})</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 통합 고객 관리 패널 (상단 상태 탭 + 필터 바 + 테이블 + 페이지네이션) */}
                    <section className="adm-panel">
                        {/* 1. 상단 언더라인 상태 탭 (총괄 어드민 드래그앤드롭 순서 변경 지원) */}
                        <div
                            ref={tabsContainerRef}
                            className="adm-tabs"
                            aria-label="고객 상태 필터"
                            onDragOver={(e) => {
                                if (!isAdmin || !draggedStatus || !tabsContainerRef.current) return;
                                e.preventDefault();
                                const rect = tabsContainerRef.current.getBoundingClientRect();
                                const edgeZone = 64;
                                if (e.clientX - rect.left < edgeZone) {
                                    tabsContainerRef.current.scrollLeft -= 12;
                                } else if (rect.right - e.clientX < edgeZone) {
                                    tabsContainerRef.current.scrollLeft += 12;
                                }
                            }}
                        >
                            {statusOptions.map((opt) => {
                                const val = opt === "전체" ? "all" : opt;
                                const isActive = statusFilter === val;
                                const isDraggable =
                                    isAdmin &&
                                    opt !== "전체" &&
                                    Boolean(dbStatuses && dbStatuses.length > 0);
                                const isDraggingThis = draggedStatus === opt;
                                const isDragOverThis =
                                    dragOverStatus === opt && draggedStatus !== opt && opt !== "전체";
                                const count =
                                    opt === "전체"
                                        ? statusTabCounts.all || 0
                                        : statusTabCounts[opt] || 0;
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        draggable={isDraggable}
                                        onDragStart={(e) => {
                                            if (!isDraggable) return;
                                            setDraggedStatus(opt);
                                            e.dataTransfer.effectAllowed = "move";
                                            e.dataTransfer.setData("text/plain", opt);
                                        }}
                                        onDragOver={(e) => {
                                            if (!isDraggable || !draggedStatus || draggedStatus === opt)
                                                return;
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                            if (dragOverStatus !== opt) {
                                                setDragOverStatus(opt);
                                            }
                                        }}
                                        onDragLeave={() => {
                                            if (dragOverStatus === opt) {
                                                setDragOverStatus(null);
                                            }
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            void handleStatusDrop(opt);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedStatus(null);
                                            setDragOverStatus(null);
                                        }}
                                        onClick={() => setStatusFilter(val)}
                                        title={
                                            isDraggable
                                                ? `${opt} · 드래그하여 상태 분류 위치 이동`
                                                : opt
                                        }
                                        className={`adm-tab ${isActive ? "active" : ""} ${
                                            isDraggingThis ? "dragging" : ""
                                        } ${isDragOverThis ? "drag-over" : ""}`}
                                    >
                                        {isDraggable && (
                                            <span className="adm-tab-grip" aria-hidden="true">
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
                                        <span>{opt}</span>
                                        <span className="adm-tab-count">{count}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* 2. 컴팩트 필터 바 */}
                        <div className="adm-filter-bar">
                            <label className="adm-search-field">
                                <AdminIcon name="search" />
                                <input
                                    id="adminCustomerSearch"
                                    type="text"
                                    placeholder="고객명, 연락처, 파트너사, 상위파트너 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </label>

                            {/* 기간 세그먼트 */}
                            <div className="adm-segmented overflow-x-auto max-w-full">
                                {dateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setDateFilter(opt.value)}
                                        className={
                                            dateFilter === opt.value ? "active" : ""
                                        }
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {dateFilter === "custom" && (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) =>
                                            setCustomStartDate(e.target.value)
                                        }
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input !min-h-[34px] !py-1 !px-2.5 text-xs cursor-pointer"
                                    />
                                    <span className="text-[#788699] text-xs">~</span>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input !min-h-[34px] !py-1 !px-2.5 text-xs cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* 상품 선택 */}
                            <select
                                value={productFilter === "all" ? "전체" : productFilter}
                                onChange={(e) =>
                                    setProductFilter(
                                        e.target.value === "전체" ? "all" : e.target.value
                                    )
                                }
                                className="adm-select"
                                aria-label="상품 필터"
                            >
                                {productOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt === "전체" ? "전체 상품" : opt}
                                    </option>
                                ))}
                            </select>

                            {/* 파트너 선택 (어드민) */}
                            {isAdmin && partners.length > 0 && (
                                <select
                                    value={partnersFilter}
                                    onChange={(e) => setPartnersFilter(e.target.value)}
                                    className="adm-select"
                                    aria-label="파트너사 필터"
                                >
                                    <option value="all">전체 파트너사</option>
                                    {partners.map((p) => (
                                        <option key={p.partnerId} value={p.partnerId}>
                                            {p.companyName}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* 정렬 기준 */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="adm-select"
                                aria-label="정렬 기준"
                            >
                                <option value="updatedAt">최근수정순</option>
                                <option value="createdAtDesc">등록일 최신순</option>
                                <option value="createdAtAsc">등록일 오래된순</option>
                            </select>

                            {/* 표시 개수 */}
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="adm-select"
                                aria-label="페이지당 표시 개수"
                            >
                                <option value={20}>20개씩</option>
                                <option value={50}>50개씩</option>
                                <option value={100}>100개씩</option>
                            </select>

                            {hasActiveFilter && (
                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    className="adm-btn small"
                                >
                                    <AdminIcon name="refresh" />
                                    <span>초기화</span>
                                </button>
                            )}

                            <div className="adm-filter-end flex items-center gap-2">
                                {isAdmin && totalUnreadSms > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setUnreadSmsOnly((prev) => !prev)}
                                        className={`adm-btn small ${
                                            unreadSmsOnly ? "primary" : "!bg-[#faeae5] !border-[#ead5cf] !text-[#a85042]"
                                        }`}
                                    >
                                        <span>미확인 답장 ({totalUnreadSms})</span>
                                    </button>
                                )}
                                <span className="adm-pill green !py-1 !px-2.5">
                                    <AdminIcon name="phone" className="!w-3 !h-3" />
                                    <span>상담 발신번호 010-2666-0883</span>
                                </span>
                            </div>
                        </div>

                        {/* 3. 고객 목록 테이블 */}
                        {renderTable()}

                        {/* 4. 하단 통합 요약 및 페이지네이션 */}
                        <div className="adm-table-foot">
                            <span>
                                검색 결과{" "}
                                <strong className="text-[#163a6b]">
                                    {sortedApplications.length.toLocaleString()}
                                </strong>
                                명 중{" "}
                                {sortedApplications.length > 0
                                    ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(
                                          currentPage * itemsPerPage,
                                          sortedApplications.length
                                      )}`
                                    : "0"}{" "}
                                표시 · 선택{" "}
                                <strong className="text-[#162438]">
                                    {selectedAppIds.length}
                                </strong>
                                명
                            </span>

                            {totalPages > 1 && (
                                <div className="adm-pagination">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        aria-label="첫 페이지"
                                    >
                                        «
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(1, prev - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        aria-label="이전 페이지"
                                    >
                                        ‹
                                    </button>
                                    {Array.from(
                                        { length: Math.min(5, totalPages) },
                                        (_, i) => {
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
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage(pageNum)
                                                    }
                                                    className={
                                                        currentPage === pageNum
                                                            ? "active"
                                                            : ""
                                                    }
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        }
                                    )}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(totalPages, prev + 1)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        aria-label="다음 페이지"
                                    >
                                        ›
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        aria-label="마지막 페이지"
                                    >
                                        »
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}

            {isWidget && renderTable()}

            {selectedApp && (
                <CustomerDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={onRefresh}
                    isAdmin={isAdmin}
                    partnerLoginId={getPartnerLoginId(
                        selectedApp.partnerId,
                        selectedApp.partnerName
                    )}
                    currentUserRole={currentUser?.role || "master"}
                    mode={mode}
                />
            )}

            {isAdmin && isSonoModalOpen && sonoTargetApp && (
                <SonoRegisterModal
                    isOpen={isSonoModalOpen}
                    onClose={() => {
                        setIsSonoModalOpen(false);
                        setSonoTargetApp(null);
                    }}
                    application={sonoTargetApp}
                    onSuccess={onRefresh}
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
                    mode={mode}
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

            {isLifeJoyExportModalOpen && (
                <LifeJoyExportModal
                    isOpen={isLifeJoyExportModalOpen}
                    onClose={() => setIsLifeJoyExportModalOpen(false)}
                    applications={applications}
                    onSuccess={onRefresh}
                />
            )}

            {recordingTargetApp && (
                <RecordingModal
                    application={recordingTargetApp}
                    parentPartnerName={
                        getParentPartnerInfo(
                            recordingTargetApp.partnerId,
                            recordingTargetApp.partnerName
                        )?.name
                    }
                    onClose={() => setRecordingTargetApp(null)}
                    currentUserName={
                        currentUser?.managerName ||
                        currentUser?.companyName ||
                        (isAdmin ? "총괄관리자" : "관리자")
                    }
                    isAdmin={isAdmin}
                />
            )}

            {/* 일괄 문자 발송 모달 (총괄어드민 전용) */}
            {isAdmin && isBulkSmsModalOpen && (
                <div
                    className="fixed inset-0 bg-[#19312b]/35 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4"
                    onClick={() => !isSendingBulkSms && setIsBulkSmsModalOpen(false)}
                >
                    <div
                        className="adm-panel w-full max-w-lg shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-[#eaeff7] flex justify-between items-center bg-[#f6f8fc]">
                            <div>
                                <h3 className="font-bold text-[#162438] text-sm">
                                    선택 고객 일괄 문자 발송 ({selectedAppIds.length}명)
                                </h3>
                                <p className="text-[11px] text-[#788292] mt-0.5">
                                    {"{고객명}"}, {"{상품명}"}, {"{사은품}"}, {"{구좌}"} 치환자가 고객별로 자동 적용됩니다.
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={isSendingBulkSms}
                                onClick={() => setIsBulkSmsModalOpen(false)}
                                className="adm-icon-btn"
                            >
                                <AdminIcon name="close" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex flex-wrap gap-1.5">
                                {smsTemplates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => setBulkSmsMessage(tpl.content)}
                                        className="adm-btn small"
                                    >
                                        {tpl.title}
                                    </button>
                                ))}
                            </div>

                            <div className="adm-field">
                                <label>문자 제목 (LMS)</label>
                                <input
                                    type="text"
                                    value={bulkSmsTitle}
                                    onChange={(e) => setBulkSmsTitle(e.target.value)}
                                    className="adm-input"
                                    placeholder="[소노아임레디] 안내"
                                />
                            </div>

                            <div className="adm-field">
                                <div className="flex items-center justify-between mb-1">
                                    <label>발송 본문</label>
                                    <span className="text-[11px] text-[#788292]">
                                        {bulkSmsMessage.length}자 (LMS)
                                    </span>
                                </div>
                                <textarea
                                    rows={7}
                                    value={bulkSmsMessage}
                                    onChange={(e) => setBulkSmsMessage(e.target.value)}
                                    className="adm-textarea w-full"
                                    placeholder="발송할 문자 내용을 입력하세요..."
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-[#eaeff7]">
                                <button
                                    type="button"
                                    disabled={isSendingBulkSms}
                                    onClick={() => setIsBulkSmsModalOpen(false)}
                                    className="adm-btn"
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    disabled={isSendingBulkSms || !bulkSmsMessage.trim()}
                                    onClick={async () => {
                                        const targets = applications.filter(
                                            (a) =>
                                                selectedAppIds.includes(a.applicationNo) &&
                                                a._id &&
                                                a.customerPhone
                                        );
                                        if (targets.length === 0) {
                                            alert("발송 가능한 연락처가 있는 고객이 없습니다.");
                                            return;
                                        }
                                        if (
                                            !confirm(
                                                `선택한 ${targets.length}명의 고객에게 일괄 문자를 발송하시겠습니까?`
                                            )
                                        ) {
                                            return;
                                        }
                                        setIsSendingBulkSms(true);
                                        try {
                                            const res = await sendBulkSmsAction({
                                                recipients: targets.map((t) => ({
                                                    applicationId: t._id as Id<"applications">,
                                                    applicationNo: t.applicationNo,
                                                    customerName: t.customerName || "고객",
                                                    customerPhone: t.customerPhone || "",
                                                    productType: t.productType,
                                                    products: t.products,
                                                    selectedGift: t.selectedGift,
                                                    planType: t.planType,
                                                })),
                                                title: bulkSmsTitle.trim() || "[소노아임레디] 안내",
                                                messageTemplate: bulkSmsMessage,
                                                senderName: "총괄관리자(일괄)",
                                            });
                                            alert(
                                                `일괄 문자 발송 완료!\n• 대상: ${res.total}명\n• 성공(대기열): ${res.successCount}명` +
                                                    (res.failCount > 0
                                                        ? `\n• 실패: ${res.failCount}명`
                                                        : "")
                                            );
                                            setIsBulkSmsModalOpen(false);
                                        } catch (err: any) {
                                            alert(
                                                err?.message || "일괄 문자 발송 중 오류가 발생했습니다."
                                            );
                                        } finally {
                                            setIsSendingBulkSms(false);
                                        }
                                    }}
                                    className="adm-btn primary"
                                >
                                    <span>
                                        {isSendingBulkSms
                                            ? "발송 중..."
                                            : `${selectedAppIds.length}명에게 발송`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 상태 용어 설명 모달 */}
            {showStatusHelp && (
                <div
                    className="fixed inset-0 bg-[#19312b]/35 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4"
                    onClick={() => setShowStatusHelp(false)}
                >
                    <div
                        className="adm-panel w-full max-w-sm shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-[#eaeff7] flex justify-between items-center bg-[#f6f8fc]">
                            <h3 className="font-bold text-[#162438] text-sm">
                                진행 상태 용어 안내
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowStatusHelp(false)}
                                className="adm-icon-btn"
                            >
                                <AdminIcon name="close" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3.5 text-xs">
                            <div>
                                <span className="adm-pill gray mb-1">접수대기</span>
                                <p className="text-[#475870] leading-relaxed">
                                    영업자 또는 랜딩을 통해 신규 상담이 등록된 상태입니다.
                                </p>
                            </div>
                            <div>
                                <span className="adm-pill blue mb-1">접수완료</span>
                                <p className="text-[#475870] leading-relaxed">
                                    소노 콜센터에 해피콜 및 상담을 요청한 상태입니다.
                                </p>
                            </div>
                            <div>
                                <span className="adm-pill teal mb-1">
                                    녹취완료(출금확인중)
                                </span>
                                <p className="text-[#475870] leading-relaxed">
                                    계약 녹취(해피콜)는 완료되었으나 1회차 출금 확인 대기 상태입니다. (신용카드 실시간, CMS 2~3일 소요)
                                </p>
                            </div>
                            <div>
                                <span className="adm-pill green mb-1">정상가입</span>
                                <p className="text-[#475870] leading-relaxed">
                                    1회차 출금 완료 후 정상 계약이 유지 중인 상태입니다.
                                </p>
                            </div>
                        </div>
                        <div className="px-5 py-3 bg-[#f8fafd] border-t border-[#eaeff7] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowStatusHelp(false)}
                                className="adm-btn small"
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
                            if (type === "additional") {
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

function DuplicateCheckModal({
    app,
    onClose,
    onConfirm,
}: {
    app: Application;
    onClose: () => void;
    onConfirm: (appNo: string, type: "confirmed" | "additional") => void;
}) {
    const duplicates = useQuery(api.applications.checkDuplicateCustomer, {
        customerName: (app.customerName || "").trim(),
        customerPhone: (app.customerPhone || "").trim(),
        excludeApplicationNo: app.applicationNo,
    });

    return (
        <div
            className="fixed inset-0 bg-[#19312b]/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="adm-panel w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-[#eaeff7] bg-[#f6f8fc] flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-[#162438]">
                            중복 가입 내역 확인
                        </h3>
                        <p className="text-xs text-[#788699] mt-0.5">
                            {(app.customerName || "").trim()}님 · {app.customerPhone}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="adm-icon-btn">
                        <AdminIcon name="close" />
                    </button>
                </div>

                <div className="p-5">
                    {duplicates === undefined ? (
                        <div className="py-10 text-center text-xs text-[#788699]">
                            중복 데이터를 조회하는 중...
                        </div>
                    ) : duplicates.length === 0 ? (
                        <div className="py-8 text-center space-y-2">
                            <span className="adm-pill green">중복 없음</span>
                            <p className="text-xs text-[#5a6b82]">
                                해당 고객 정보로 등록된 다른 접수 내역이 없습니다.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="adm-section-note !my-0">
                                <AdminIcon name="info" />
                                <span>
                                    동일한 고객명·연락처로 등록된 내역이{" "}
                                    <strong className="text-[#163a6b]">
                                        {duplicates.length}건
                                    </strong>{" "}
                                    발견되었습니다.
                                </span>
                            </div>

                            <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1">
                                {duplicates.map((dup: any) => (
                                    <div
                                        key={dup.applicationNo}
                                        className="adm-note-card space-y-1.5"
                                    >
                                        <div className="flex justify-between items-center">
                                            <strong className="text-xs text-[#162438]">
                                                {dup.partnerName}
                                            </strong>
                                            <span className="adm-pill gray">
                                                {dup.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-1 text-[11px] pt-1 border-t border-[#e1e7f0]">
                                            <span className="text-[#788699]">신청번호</span>
                                            <span className="text-right font-mono text-[#162438]">
                                                {dup.applicationNo}
                                            </span>
                                            <span className="text-[#788699]">등록일시</span>
                                            <span className="text-right text-[#162438]">
                                                {formatDateTime(
                                                    dup.createdAt,
                                                    dup._creationTime
                                                )}
                                            </span>
                                            {dup.productType && (
                                                <>
                                                    <span className="text-[#788699]">
                                                        상품명
                                                    </span>
                                                    <span className="text-right font-semibold text-[#163a6b] truncate">
                                                        {dup.productType}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mt-5 pt-4 border-t border-[#eaeff7] justify-end">
                        {!app.duplicateConfirmed && (
                            <>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onConfirm(app.applicationNo, "confirmed")
                                    }
                                    className="adm-btn primary"
                                >
                                    <AdminIcon name="check" />
                                    <span>중복 확인 완료</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onConfirm(app.applicationNo, "additional")
                                    }
                                    className="adm-btn sage"
                                >
                                    <span>추가 접수 인정</span>
                                </button>
                            </>
                        )}
                        <button type="button" onClick={onClose} className="adm-btn">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
