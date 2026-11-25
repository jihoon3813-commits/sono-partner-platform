import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import * as XLSX from "xlsx";
import { Partner } from "@/lib/types";
import {
    findBestMatchingApplication,
    createApplicationBucketMap,
} from "@/lib/retentionMatcher";
import { AdminIcon } from "./AdminIcons";
import {
    parseRetentionExcelFile,
    uploadRetentionRecordsInChunks,
} from "@/lib/retentionExcelUtils";

const normalizeDate = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return "";
    const strVal = String(val).trim();
    if (!strVal || strVal === "-") return "";

    const serial = parseFloat(strVal);
    if (!isNaN(serial) && serial > 30000 && serial < 60000) {
        const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            return `${yyyy}${mm}${dd}`;
        }
    }

    const clean = strVal.replace(/[^0-9]/g, "");
    if (clean.length === 8) {
        return clean;
    }

    const parts = strVal.split(/[-./\s]+/);
    if (parts.length === 3) {
        let [y, m, d] = parts;
        if (y.length === 4 && m.length >= 1 && d.length >= 1) {
            m = m.padStart(2, "0");
            d = d.padStart(2, "0");
            if (m.length === 2 && d.length === 2) {
                return `${y}${m}${d}`;
            }
        }
    }

    return strVal;
};

const formatDateForDisplay = (val: string | number | undefined): string => {
    if (val === undefined || val === null) return "-";
    const strVal = String(val).trim();
    if (!strVal || strVal === "-") return "-";

    const normalized = normalizeDate(strVal);
    if (normalized.length === 8 && /^\d{8}$/.test(normalized)) {
        return `${normalized.substring(0, 4)}-${normalized.substring(
            4,
            6
        )}-${normalized.substring(6, 8)}`;
    }
    return strVal;
};

const isRecordModified = (r: any): boolean => {
    const isDelinquencyModified = Boolean(
        r.delinquencyResolveStatus && r.delinquencyResolveStatus !== "미해결"
    );
    const isRefundModified = Boolean(
        r.refundStatus && r.refundStatus !== "선택없음"
    );
    const isRevivalModified = Boolean(
        r.revivalStatus && r.revivalStatus !== "선택없음"
    );
    const hasTimestamp = Boolean(
        r.delinquencyResolveUpdatedAt || r.refundUpdatedAt || r.revivalUpdatedAt
    );
    return (
        isDelinquencyModified ||
        isRefundModified ||
        isRevivalModified ||
        hasTimestamp
    );
};

const formatTransferDateForDisplay = (val: string | number | undefined): string => {
    if (!val) return "-";
    let str = String(val).trim();
    if (!str || str === "-") return "-";

    str = str.replace(/\.0$/, "");

    if (/^2001\d{4}$/.test(str)) {
        const mm = parseInt(str.substring(4, 6), 10);
        const dd = parseInt(str.substring(6, 8), 10);
        if (mm === 10 && dd === 1) {
            str = "10";
        } else if (dd > 1) {
            str = String(dd);
        } else {
            str = String(mm);
        }
    }

    const numOnly = str.replace(/[^0-9]/g, "");
    if (numOnly.length >= 1 && numOnly.length <= 2) {
        return `${numOnly}일`;
    }

    return str.endsWith("일") ? str : `${str}일`;
};

const REFUND_OPTIONS = [
    "선택없음",
    "100%",
    "95%",
    "90%",
    "85%",
    "80%",
    "75%",
    "70%",
    "65%",
    "60%",
    "55%",
    "50%",
    "45%",
    "40%",
];

const REVIVAL_OPTIONS = ["선택없음", "부활완료", "부활예정", "취소"];

interface RetentionManagementPostAugProps {
    isAdmin?: boolean;
    partnerId?: string;
    partners?: Partner[];
}

export default function RetentionManagementPostAug({
    isAdmin = false,
    partnerId,
    partners = [],
}: RetentionManagementPostAugProps) {
    const rawRecords = useQuery(api.retention3.getRetentionRecords, {
        partnerId: isAdmin ? "admin" : partnerId,
    });
    const allApplications = useQuery(api.applications.getAllApplications);

    const clearRecordsBatch = useMutation(api.retention3.clearRetentionRecordsBatch);
    const uploadRecords = useMutation(api.retention3.uploadRetentionRecords);
    const updateRetentionStatus = useMutation(
        api.retention3.updateRetentionStatus
    );

    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});

    const handleStatusUpdate = async (
        id: any,
        field: "delinquencyResolveStatus" | "refundStatus" | "revivalStatus",
        value: string
    ) => {
        const key = `${id}_${field}`;
        setUpdatingMap((prev) => ({ ...prev, [key]: true }));
        try {
            await updateRetentionStatus({ id, [field]: value });
        } catch (err) {
            console.error(err);
            alert("상태 변경 중 오류가 발생했습니다.");
        } finally {
            setUpdatingMap((prev) => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [periodFilter, setPeriodFilter] = useState<string>("cumulative");
    const [sortField, setSortField] = useState<
        "default" | "joinDate" | "customerName"
    >("default");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [productFilter, setProductFilter] = useState("");
    const [partnerFilter, setPartnerFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
    const [delinquencyFilter, setDelinquencyFilter] = useState("");
    const [cancelFilter, setCancelFilter] = useState("");
    const [paymentCountFilter, setPaymentCountFilter] = useState("");
    const [methodFilter, setMethodFilter] = useState("");
    const [refundFilter, setRefundFilter] = useState("");
    const [revivalFilter, setRevivalFilter] = useState("");
    const [activeStatFilter, setActiveStatFilter] = useState<string>("all");

    const allowedCompanyNames = useMemo(() => {
        if (isAdmin || !partnerId || !partners || partners.length === 0)
            return null;

        const currentP = partners.find(
            (p: any) =>
                p.partnerId === partnerId ||
                p.loginId === partnerId ||
                p.customUrl === partnerId
        );
        if (!currentP) return null;

        const allowed = new Set<string>();
        if (currentP.companyName) {
            const comp = currentP.companyName.trim();
            allowed.add(comp);
            const clean = comp.replace(/\(주\)/g, "").trim();
            if (clean) allowed.add(clean);
        }

        const findSubPartners = (parent: any) => {
            const pId = parent.partnerId;
            const pLogin = parent.loginId;
            const pComp = parent.companyName?.trim();
            const pCleanComp = pComp ? pComp.replace(/\(주\)/g, "").trim() : "";

            const subs = partners.filter((p: any) => {
                if (!p) return false;
                const matchParentId =
                    (pId && p.parentPartnerId === pId) ||
                    (pLogin && p.parentPartnerId === pLogin);
                const subParentName = p.parentPartnerName
                    ? p.parentPartnerName.trim()
                    : "";
                const subCleanName = subParentName.replace(/\(주\)/g, "").trim();

                const matchParentName =
                    (pComp &&
                        subParentName &&
                        (subParentName === pComp ||
                            subParentName.includes(pComp) ||
                            pComp.includes(subParentName))) ||
                    (pCleanComp &&
                        subCleanName &&
                        (subCleanName === pCleanComp ||
                            subCleanName.includes(pCleanComp) ||
                            pCleanComp.includes(subCleanName)));

                return matchParentId || matchParentName;
            });

            subs.forEach((sub: any) => {
                if (sub.companyName) {
                    const comp = sub.companyName.trim();
                    if (!allowed.has(comp)) {
                        allowed.add(comp);
                        const cleanSub = comp.replace(/\(주\)/g, "").trim();
                        if (cleanSub) allowed.add(cleanSub);
                        findSubPartners(sub);
                    }
                }
            });
        };

        findSubPartners(currentP);
        return Array.from(allowed);
    }, [isAdmin, partnerId, partners]);

    const sortedApplications = useMemo(() => {
        if (!allApplications) return [];
        return [...allApplications].sort((a: any, b: any) => {
            const timeA = a._creationTime || a.createdAt || a.appliedAt || 0;
            const timeB = b._creationTime || b.createdAt || b.appliedAt || 0;
            return timeA - timeB;
        });
    }, [allApplications]);

    const applicationsBucketMap = useMemo(() => {
        return createApplicationBucketMap(sortedApplications);
    }, [sortedApplications]);

    const getMappedInfo = useCallback(
        (maskedName: string, maskedPhone: string, r?: any) => {
            const cleanName = (maskedName || "").trim();
            const rawPhone = (maskedPhone || "").trim();

            if (
                !sortedApplications ||
                sortedApplications.length === 0 ||
                !cleanName
            ) {
                return {
                    fullName: cleanName,
                    fullPhone: rawPhone,
                    birth: r?.birth || "",
                    partnerName: "-",
                    partnerId: "",
                    matched: false,
                };
            }

            const recordObj = r
                ? { ...r, customerName: cleanName, phone: rawPhone }
                : { customerName: cleanName, phone: rawPhone };
            const bestApp = findBestMatchingApplication(
                recordObj,
                sortedApplications,
                applicationsBucketMap
            );

            if (bestApp) {
                let partnerName = bestApp.partnerName || "";
                if (!partnerName && bestApp.partnerId) {
                    const pObj = partners.find(
                        (p: any) =>
                            p.partnerId === bestApp.partnerId ||
                            p.loginId === bestApp.partnerId ||
                            p.customUrl === bestApp.partnerId
                    );
                    if (pObj) partnerName = pObj.companyName;
                }
                return {
                    fullName: bestApp.customerName || cleanName,
                    fullPhone: bestApp.customerPhone || rawPhone,
                    birth: bestApp.customerBirth || r?.birth || "",
                    partnerName: partnerName || "-",
                    partnerId: bestApp.partnerId || "",
                    matched: true,
                };
            }

            return {
                fullName: cleanName,
                fullPhone: rawPhone,
                birth: r?.birth || "",
                partnerName: "-",
                partnerId: "",
                matched: false,
            };
        },
        [sortedApplications, applicationsBucketMap, partners]
    );

    const records = useMemo(() => {
        if (!rawRecords) return undefined;
        return rawRecords.map((r: any) => {
            const joinStatus = r.joinStatus || "";
            const paymentStatus =
                joinStatus.includes("해약") || joinStatus === "해약"
                    ? "해약처리"
                    : r.paymentStatus;
            return {
                ...r,
                paymentStatus,
                joinDate: normalizeDate(r.joinDate),
            };
        });
    }, [rawRecords]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formattedRecords = await parseRetentionExcelFile(file, normalizeDate);
            await uploadRetentionRecordsInChunks(
                formattedRecords,
                clearRecordsBatch,
                uploadRecords
            );
            alert("연체 관리(8월 이후 가입) 데이터가 성공적으로 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : String(error);
            alert(`업로드 중 오류가 발생했습니다.\n(${message})`);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    const periodFilteredRecords = useMemo(() => {
        if (!records) return [];
        const kstNow = new Date(
            new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000
        );
        const formatYM = (d: Date) =>
            d.getFullYear().toString() +
            (d.getMonth() + 1).toString().padStart(2, "0");
        const formatYMD = (d: Date) =>
            formatYM(d) + d.getDate().toString().padStart(2, "0");

        const currentYearMonth = formatYM(kstNow);
        const todayYMD = formatYMD(kstNow);

        const yesterday = new Date(kstNow);
        yesterday.setDate(kstNow.getDate() - 1);
        const yesterdayYMD = formatYMD(yesterday);

        const prevDate = new Date(kstNow.getFullYear(), kstNow.getMonth() - 1, 1);
        const prevYearMonth = formatYM(prevDate);

        return records.filter((r: any) => {
            const joinSt = (r.joinStatus || "").trim();
            if (joinSt === "대기" || joinSt.includes("대기")) return false;

            const joinYM = r.joinDate.substring(0, 6);
            const joinYMD = r.joinDate.substring(0, 8);

            if (periodFilter === "today") return joinYMD === todayYMD;
            if (periodFilter === "yesterday") return joinYMD === yesterdayYMD;
            if (periodFilter === "current") return joinYM === currentYearMonth;
            if (periodFilter === "previous") return joinYM === prevYearMonth;
            if (periodFilter === "3months") {
                const d = new Date(kstNow);
                d.setMonth(kstNow.getMonth() - 3);
                return joinYM >= formatYM(d);
            }
            if (periodFilter === "year") {
                const oneYearAgo = new Date(kstNow);
                oneYearAgo.setFullYear(kstNow.getFullYear() - 1);
                return joinYM >= formatYM(oneYearAgo);
            }
            return true;
        });
    }, [records, periodFilter]);

    const displayStats = useMemo(() => {
        const filtered = periodFilteredRecords;

        const getUniqueCount = (data: typeof filtered) => {
            const keys = new Set(
                data.map((r: any) => {
                    const m = getMappedInfo(r.customerName, r.phone, r);
                    return `${m.fullName}_${m.fullPhone}`;
                })
            );
            return keys.size;
        };

        const normalRecords = filtered.filter((r: any) => {
            const isCancel =
                r.joinStatus.includes("해약") ||
                r.joinStatus.includes("철회") ||
                (r.cancelStatus &&
                    r.cancelStatus !== "" &&
                    r.cancelStatus !== "-");
            if (isCancel) return false;
            const isDelinquent =
                r.paymentStatus.includes("연체") ||
                r.paymentStatus.includes("미납");
            if (isDelinquent) return false;
            return true;
        });

        const delinquentRecords = filtered.filter((r: any) => {
            const isCancel =
                r.joinStatus.includes("해약") ||
                r.joinStatus.includes("철회") ||
                (r.cancelStatus &&
                    r.cancelStatus !== "" &&
                    r.cancelStatus !== "-");
            if (isCancel) return false;
            return (
                r.paymentStatus.includes("연체") ||
                r.paymentStatus.includes("미납")
            );
        });

        const cancelRecords = filtered.filter(
            (r: any) =>
                r.joinStatus.includes("해약") ||
                r.joinStatus.includes("철회") ||
                (r.cancelStatus &&
                    r.cancelStatus !== "" &&
                    r.cancelStatus !== "-")
        );

        return {
            total: { count: filtered.length, unique: getUniqueCount(filtered) },
            normalPayment: {
                count: normalRecords.length,
                unique: getUniqueCount(normalRecords),
            },
            delinquent: {
                count: delinquentRecords.length,
                unique: getUniqueCount(delinquentRecords),
            },
            cancel: {
                count: cancelRecords.length,
                unique: getUniqueCount(cancelRecords),
            },
            cardCount: filtered.filter((r: any) =>
                r.paymentMethod.includes("카드")
            ).length,
            cmsCount: filtered.filter(
                (r: any) =>
                    r.paymentMethod.toUpperCase().includes("CMS") ||
                    r.paymentMethod.includes("이체")
            ).length,
        };
    }, [periodFilteredRecords, getMappedInfo]);

    const getPaymentRank = (status: string) => {
        if (!status) return 50000;
        const clean = status.trim();
        if (clean.includes("연체")) {
            const match = clean.match(/(\d+)/);
            const count = match ? parseInt(match[1], 10) : 0;
            return 10000 - count;
        }
        if (clean.includes("미납") || clean.includes("당월미납")) {
            return 20000;
        }
        if (clean.includes("정상")) {
            return 30000;
        }
        if (clean.includes("해약")) {
            return 40000;
        }
        return 50000;
    };

    const isAllowedPartnerName = (candidate: string) => {
        if (!candidate || candidate === "-") return false;
        if (isAdmin) return true;
        if (!allowedCompanyNames || allowedCompanyNames.length === 0)
            return true;

        const cleanCandidate = candidate
            .replace(/\(주\)/g, "")
            .replace(/\s+/g, "")
            .trim();
        return allowedCompanyNames.some((allowed: string) => {
            const cleanAllowed = allowed
                .replace(/\(주\)/g, "")
                .replace(/\s+/g, "")
                .trim();
            return (
                candidate === allowed ||
                cleanCandidate === cleanAllowed ||
                cleanCandidate.includes(cleanAllowed) ||
                cleanAllowed.includes(cleanCandidate)
            );
        });
    };

    const getDisplayPartnerName = useCallback(
        (r: any, mapped?: any) => {
            const m = mapped || getMappedInfo(r.customerName, r.phone, r);

            if (
                m.matched &&
                m.partnerName &&
                m.partnerName !== "-" &&
                m.partnerName !== "라이프앤조이" &&
                isAllowedPartnerName(m.partnerName)
            ) {
                return m.partnerName;
            }

            if (
                r.partnerName &&
                r.partnerName !== "-" &&
                r.partnerName !== "라이프앤조이" &&
                isAllowedPartnerName(r.partnerName)
            ) {
                return r.partnerName;
            }

            const sub = (r.subCompany || "").trim();
            if (sub && sub !== "-" && sub !== "소속없음" && sub !== "본사") {
                const found = partners.find(
                    (p: any) =>
                        p.companyName?.trim() === sub ||
                        p.companyName?.replace(/\(주\)/g, "").trim() ===
                            sub.replace(/\(주\)/g, "").trim() ||
                        p.loginId === sub ||
                        p.partnerId === sub
                );
                if (found && isAllowedPartnerName(found.companyName))
                    return found.companyName;
                if (isAllowedPartnerName(sub)) return sub;
            }

            const idNo = (r.idNo || "").trim();
            if (idNo && idNo !== "-") {
                const found = partners.find(
                    (p: any) => p.loginId === idNo || p.partnerId === idNo
                );
                if (found && isAllowedPartnerName(found.companyName))
                    return found.companyName;
            }

            const b2b = (r.b2bCompany || "").trim();
            if (b2b && b2b !== "-") {
                const found = partners.find(
                    (p: any) =>
                        p.companyName?.trim() === b2b ||
                        p.companyName?.replace(/\(주\)/g, "").trim() ===
                            b2b.replace(/\(주\)/g, "").trim()
                );
                if (found && isAllowedPartnerName(found.companyName))
                    return found.companyName;
            }

            if (
                m.matched &&
                m.partnerName &&
                m.partnerName !== "-" &&
                isAllowedPartnerName(m.partnerName)
            ) {
                return m.partnerName;
            }

            if (
                r.partnerName &&
                r.partnerName !== "-" &&
                isAllowedPartnerName(r.partnerName)
            ) {
                return r.partnerName;
            }

            return "라이프앤조이";
        },
        [getMappedInfo, isAllowedPartnerName, partners]
    );

    const filterOptions = useMemo(() => {
        if (!records)
            return {
                products: [],
                partners: [],
                statuses: [],
                paymentStatuses: [],
                methods: [],
                cancelStatuses: [],
                paymentCounts: [],
            };

        const mapped = records.map((r: any) => {
            const pName = getDisplayPartnerName(r);
            return { ...r, partnerName: pName };
        });

        const products = Array.from(
            new Set(mapped.map((r: any) => r.productName))
        )
            .filter(Boolean)
            .sort();
        const partnersList = Array.from(
            new Set(mapped.map((r: any) => r.partnerName))
        )
            .filter((p: any) => p && p !== "-")
            .sort();
        const statuses = Array.from(
            new Set(mapped.map((r: any) => r.joinStatus))
        )
            .filter(Boolean)
            .sort();
        const paymentStatuses = Array.from(
            new Set(mapped.map((r: any) => r.paymentStatus))
        )
            .filter(Boolean)
            .sort(
                (a: string, b: string) => getPaymentRank(a) - getPaymentRank(b)
            );
        const methods = Array.from(
            new Set(mapped.map((r: any) => r.paymentMethod))
        )
            .filter(Boolean)
            .sort();
        const cancelStatuses = Array.from(
            new Set(mapped.map((r: any) => r.cancelStatus))
        )
            .filter((c: any) => c && c !== "-")
            .sort();
        const paymentCounts = Array.from(
            new Set(mapped.map((r: any) => Number(r.actualPaymentCount)))
        )
            .filter((n: any) => !isNaN(n))
            .sort((a: number, b: number) => a - b);

        return {
            products,
            partners: partnersList,
            statuses,
            paymentStatuses,
            methods,
            cancelStatuses,
            paymentCounts,
        };
    }, [records, getDisplayPartnerName]);

    const filteredRecords = useMemo(() => {
        let result = periodFilteredRecords
            .map((r: any) => {
                const mapped = getMappedInfo(r.customerName, r.phone, r);
                const pName = getDisplayPartnerName(r, mapped);
                return {
                    ...r,
                    displayCustomerName: mapped.fullName,
                    displayPhone: mapped.fullPhone,
                    displayBirth: mapped.birth || r.birth || "",
                    partnerName: pName,
                };
            })
            .filter((r: any) => {
                const matchesSearch =
                    searchTerm === "" ||
                    r.displayCustomerName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.customerName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.displayPhone
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.partnerName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.memberNo
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    r.idNo.toLowerCase().includes(searchTerm.toLowerCase());

                if (!matchesSearch) return false;

                if (productFilter && r.productName !== productFilter)
                    return false;
                if (partnerFilter && r.partnerName !== partnerFilter)
                    return false;
                if (statusFilter && r.joinStatus !== statusFilter) return false;
                if (
                    paymentStatusFilter &&
                    r.paymentStatus !== paymentStatusFilter
                )
                    return false;
                if (methodFilter && r.paymentMethod !== methodFilter)
                    return false;
                if (cancelFilter && (r.cancelStatus || "-") !== cancelFilter)
                    return false;
                if (
                    paymentCountFilter !== "" &&
                    String(r.actualPaymentCount) !== String(paymentCountFilter)
                )
                    return false;
                if (
                    refundFilter &&
                    (r.refundStatus || "선택없음") !== refundFilter
                )
                    return false;
                if (
                    revivalFilter &&
                    (r.revivalStatus || "선택없음") !== revivalFilter
                )
                    return false;
                if (delinquencyFilter) {
                    const isDelinquent =
                        r.paymentStatus.includes("연체") ||
                        r.paymentStatus.includes("미납");
                    if (!isDelinquent) return false;
                    const resolveStatus =
                        r.delinquencyResolveStatus || "미해결";
                    if (resolveStatus !== delinquencyFilter) return false;
                }

                if (activeStatFilter !== "all") {
                    const isCancel =
                        r.joinStatus.includes("해약") ||
                        r.joinStatus.includes("철회") ||
                        (r.cancelStatus &&
                            r.cancelStatus !== "" &&
                            r.cancelStatus !== "-");

                    if (activeStatFilter === "normal") {
                        const isDelinquent =
                            r.paymentStatus.includes("연체") ||
                            r.paymentStatus.includes("미납");
                        if (isCancel || isDelinquent) return false;
                    } else if (activeStatFilter === "delinquent") {
                        const isDelinquent =
                            r.paymentStatus.includes("연체") ||
                            r.paymentStatus.includes("미납");
                        if (isCancel || !isDelinquent) return false;
                    } else if (activeStatFilter === "cancel") {
                        if (!isCancel) return false;
                    }
                }

                return true;
            });

        const groupsMap = new Map<string, any[]>();
        const groupKeysInOrder: string[] = [];

        result.forEach((r: any) => {
            const key = `${r.displayCustomerName}_${
                r.displayBirth || r.birth || ""
            }_${r.displayPhone}`;
            if (!groupsMap.has(key)) {
                groupsMap.set(key, []);
                groupKeysInOrder.push(key);
            }
            groupsMap.get(key)!.push(r);
        });

        const compareRecords = (a: any, b: any) => {
            if (sortField === "customerName") {
                const nameA = a.displayCustomerName || a.customerName || "";
                const nameB = b.displayCustomerName || b.customerName || "";
                const cmp = nameA.localeCompare(nameB, "ko-KR");
                if (cmp !== 0) return sortOrder === "asc" ? cmp : -cmp;

                const dateA = a.joinDate.replace(/[^0-9]/g, "");
                const dateB = b.joinDate.replace(/[^0-9]/g, "");
                return dateA.localeCompare(dateB);
            }

            if (sortField === "joinDate") {
                const dateA = a.joinDate.replace(/[^0-9]/g, "");
                const dateB = b.joinDate.replace(/[^0-9]/g, "");
                const cmp = dateA.localeCompare(dateB);
                if (cmp !== 0) return sortOrder === "asc" ? cmp : -cmp;

                const rankA = getPaymentRank(a.paymentStatus);
                const rankB = getPaymentRank(b.paymentStatus);
                if (rankA !== rankB) return rankA - rankB;

                const nameA = a.displayCustomerName || a.customerName || "";
                const nameB = b.displayCustomerName || b.customerName || "";
                return nameA.localeCompare(nameB, "ko-KR");
            }

            const rankA = getPaymentRank(a.paymentStatus);
            const rankB = getPaymentRank(b.paymentStatus);
            if (rankA !== rankB) return rankA - rankB;

            const dateA = a.joinDate.replace(/[^0-9]/g, "");
            const dateB = b.joinDate.replace(/[^0-9]/g, "");
            const dateCmp = dateA.localeCompare(dateB);
            if (dateCmp !== 0) return dateCmp;

            const nameA = a.displayCustomerName || a.customerName || "";
            const nameB = b.displayCustomerName || b.customerName || "";
            return nameA.localeCompare(nameB, "ko-KR");
        };

        const customerGroups = groupKeysInOrder.map((key) => {
            const recs = groupsMap.get(key)!;
            recs.sort((a, b) => {
                const dateA = a.joinDate.replace(/[^0-9]/g, "");
                const dateB = b.joinDate.replace(/[^0-9]/g, "");
                return dateA.localeCompare(dateB);
            });

            const isModified = recs.some((r) => isRecordModified(r));

            let latestUpdatedAt = "";
            recs.forEach((r) => {
                const times = [
                    r.delinquencyResolveUpdatedAt,
                    r.refundUpdatedAt,
                    r.revivalUpdatedAt,
                ].filter(Boolean);
                times.forEach((t) => {
                    if (t && t > latestUpdatedAt) latestUpdatedAt = t;
                });
            });

            return {
                key,
                records: recs,
                isModified,
                latestUpdatedAt,
            };
        });

        customerGroups.sort((gA, gB) => {
            if (gA.isModified && !gB.isModified) return -1;
            if (!gA.isModified && gB.isModified) return 1;

            if (gA.isModified && gB.isModified) {
                if (
                    gA.latestUpdatedAt &&
                    gB.latestUpdatedAt &&
                    gA.latestUpdatedAt !== gB.latestUpdatedAt
                ) {
                    return gB.latestUpdatedAt.localeCompare(gA.latestUpdatedAt);
                }
            }

            return compareRecords(gA.records[0], gB.records[0]);
        });

        const sortedRecords: any[] = [];
        customerGroups.forEach((g) => {
            g.records.forEach((r) => {
                sortedRecords.push({
                    ...r,
                    isCustomerModified: g.isModified,
                });
            });
        });

        return sortedRecords;
    }, [
        periodFilteredRecords,
        searchTerm,
        productFilter,
        partnerFilter,
        statusFilter,
        paymentStatusFilter,
        methodFilter,
        cancelFilter,
        paymentCountFilter,
        refundFilter,
        revivalFilter,
        delinquencyFilter,
        sortField,
        sortOrder,
        activeStatFilter,
        allApplications,
        partners,
        allowedCompanyNames,
        isAdmin,
        partnerId,
    ]);

    const groupedData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredRecords.forEach((r: any) => {
            const key = `${r.displayCustomerName}_${
                r.displayBirth || r.birth || ""
            }_${r.displayPhone}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        const groupColors: Record<string, string> = {};
        let colorIdx = 0;
        const colorList = ["bg-[#f8fafd]", "bg-white"];

        filteredRecords.forEach((r: any) => {
            const key = `${r.displayCustomerName}_${
                r.displayBirth || r.birth || ""
            }_${r.displayPhone}`;
            if (!groupColors[key]) {
                groupColors[key] = colorList[colorIdx % colorList.length];
                colorIdx++;
            }
        });

        return { counts, groupColors };
    }, [filteredRecords]);

    const filteredUniqueCount = useMemo(() => {
        const keys = new Set(
            filteredRecords.map(
                (r: any) =>
                    `${r.displayCustomerName}_${
                        r.displayBirth || r.birth || ""
                    }_${r.displayPhone}`
            )
        );
        return keys.size;
    }, [filteredRecords]);

    const handleDownloadExcel = async () => {
        if (filteredRecords.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }
        if (isDownloading) return;

        setIsDownloading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 100));

            const dataToExport = filteredRecords.map((r: any) => ({
                가입일자: formatDateForDisplay(r.joinDate),
                파트너사명: r.partnerName,
                고객명: r.displayCustomerName,
                생년월일: r.displayBirth || r.birth || "-",
                휴대전화: r.displayPhone,
                가입상품: r.productName,
                가입상태: r.joinStatus,
                납입상태: r.paymentStatus,
                연체해결:
                    r.paymentStatus.includes("연체") ||
                    r.paymentStatus.includes("미납")
                        ? r.delinquencyResolveStatus || "미해결"
                        : "-",
                납입방법: r.paymentMethod,
                해약처리: r.cancelStatus,
                실납입회차: r.actualPaymentCount,
                이체일자: r.transferDate || "-",
                환수여부: r.refundStatus || "선택없음",
                부활여부: r.revivalStatus || "선택없음",
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "연체관리(8월이후가입)"
            );

            worksheet["!cols"] = [
                { wch: 12 },
                { wch: 15 },
                { wch: 12 },
                { wch: 12 },
                { wch: 15 },
                { wch: 20 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 10 },
                { wch: 12 },
                { wch: 10 },
                { wch: 12 },
                { wch: 10 },
                { wch: 10 },
            ];

            XLSX.writeFile(
                workbook,
                `연체관리(8월이후가입)_${
                    new Date().toISOString().split("T")[0]
                }.xlsx`
            );
        } catch (error) {
            console.error("Excel download error:", error);
            alert("다운로드 중 오류가 발생했습니다.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!records) {
        return (
            <div className="adm-panel p-14 text-center text-xs font-semibold text-[#788699]">
                데이터를 불러오는 중...
            </div>
        );
    }

    const hasSubFilter = Boolean(
        productFilter ||
            partnerFilter ||
            statusFilter ||
            paymentStatusFilter ||
            methodFilter ||
            cancelFilter ||
            paymentCountFilter ||
            refundFilter ||
            revivalFilter ||
            delinquencyFilter ||
            activeStatFilter !== "all" ||
            searchTerm
    );

    const resetAllFilters = () => {
        setSearchTerm("");
        setProductFilter("");
        setPartnerFilter("");
        setStatusFilter("");
        setPaymentStatusFilter("");
        setMethodFilter("");
        setCancelFilter("");
        setPaymentCountFilter("");
        setRefundFilter("");
        setRevivalFilter("");
        setDelinquencyFilter("");
        setSortField("default");
        setSortOrder("asc");
        setActiveStatFilter("all");
    };

    return (
        <div className="space-y-4">
            {/* 상단 페이지 헤딩 */}
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">
                        SONO I&apos;M READY · RETENTION (POST-AUG)
                    </div>
                    <h1>연체 관리 · 8월 이후 가입</h1>
                    <p>
                        8월 이후 신규 가입 고객의 납입 회차·연체 해결·환수 및 부활 진행 상태를 관리합니다. (조회 고객{" "}
                        <strong className="text-[#163a6b]">
                            {filteredUniqueCount.toLocaleString()}
                        </strong>
                        명 / {filteredRecords.length.toLocaleString()}건)
                    </p>
                </div>

                <div className="adm-heading-buttons">
                    <button
                        type="button"
                        onClick={handleDownloadExcel}
                        disabled={isDownloading}
                        className="adm-btn"
                    >
                        <AdminIcon name="download" />
                        <span>{isDownloading ? "준비 중..." : "엑셀 다운로드"}</span>
                    </button>

                    {isAdmin && (
                        <label
                            className={`adm-btn primary ${
                                isUploading ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                            <AdminIcon name="upload" />
                            <span>
                                {isUploading ? "업로드 중..." : "납입 내역 업로드"}
                            </span>
                            <input
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </section>

            {/* 핵심 지표 4개 카드 */}
            <div className="adm-metrics-grid">
                <article
                    onClick={() => setActiveStatFilter("all")}
                    className={`adm-metric !py-4 cursor-pointer ${
                        activeStatFilter === "all"
                            ? "!border-[#163a6b] ring-2 ring-[#163a6b]/15"
                            : ""
                    }`}
                >
                    <div className="adm-metric-head">
                        <span>확인 대상 고객</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="users" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {displayStats.total.unique.toLocaleString()}
                        <span>
                            명 ({displayStats.total.count.toLocaleString()}건)
                        </span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">8월 이후 가입</span>
                        <span>
                            카드 {displayStats.cardCount} · CMS {displayStats.cmsCount}
                        </span>
                    </div>
                </article>

                <article
                    onClick={() => setActiveStatFilter("normal")}
                    className={`adm-metric !py-4 cursor-pointer ${
                        activeStatFilter === "normal"
                            ? "!border-[#163a6b] ring-2 ring-[#163a6b]/15"
                            : ""
                    }`}
                >
                    <div className="adm-metric-head">
                        <span>정상 납입</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="check-circle" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {displayStats.normalPayment.unique.toLocaleString()}
                        <span>
                            명 ({displayStats.normalPayment.count.toLocaleString()}건)
                        </span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">납입 확인</span>
                        <span>정상 유지 계약</span>
                    </div>
                </article>

                <article
                    onClick={() => setActiveStatFilter("delinquent")}
                    className={`adm-metric !py-4 cursor-pointer ${
                        activeStatFilter === "delinquent"
                            ? "!border-[#163a6b] ring-2 ring-[#163a6b]/15"
                            : ""
                    }`}
                >
                    <div className="adm-metric-head">
                        <span>연체 확인 필요</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="clock" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {displayStats.delinquent.unique.toLocaleString()}
                        <span>
                            명 ({displayStats.delinquent.count.toLocaleString()}건)
                        </span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend warning">후속 상담</span>
                        <span>연체 · 당월미납 포함</span>
                    </div>
                </article>

                <article
                    onClick={() => setActiveStatFilter("cancel")}
                    className={`adm-metric !py-4 cursor-pointer ${
                        activeStatFilter === "cancel"
                            ? "!border-[#163a6b] ring-2 ring-[#163a6b]/15"
                            : ""
                    }`}
                >
                    <div className="adm-metric-head">
                        <span>해약 · 철회</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="file" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {displayStats.cancel.unique.toLocaleString()}
                        <span>
                            명 ({displayStats.cancel.count.toLocaleString()}건)
                        </span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">계약 종료</span>
                        <span>해약 및 청약철회</span>
                    </div>
                </article>
            </div>

            {/* 안내 노트 바 */}
            <div className="adm-section-note !my-0">
                <AdminIcon name="info" />
                <span>
                    <strong>&quot;당월미납&quot;은 연체가 아닙니다.</strong> 단, 고객별 이체일자가 지난 날짜 기준 &quot;당월미납&quot;은 당월연체에 해당합니다.
                </span>
            </div>

            {/* 통합 연체 관리 패널 */}
            <section className="adm-panel">
                <div className="adm-tabs">
                    {[
                        {
                            id: "all",
                            label: "전체 고객",
                            count: displayStats.total.count,
                        },
                        {
                            id: "delinquent",
                            label: "연체 · 미납 확인 필요",
                            count: displayStats.delinquent.count,
                        },
                        {
                            id: "normal",
                            label: "정상 납입",
                            count: displayStats.normalPayment.count,
                        },
                        {
                            id: "cancel",
                            label: "해약 · 철회",
                            count: displayStats.cancel.count,
                        },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveStatFilter(t.id)}
                            className={`adm-tab ${
                                activeStatFilter === t.id ? "active" : ""
                            }`}
                        >
                            <span>{t.label}</span>
                            <span className="adm-tab-count">{t.count}</span>
                        </button>
                    ))}
                </div>

                <div className="adm-filter-bar">
                    <label className="adm-search-field">
                        <AdminIcon name="search" />
                        <input
                            type="text"
                            placeholder="파트너사명, 고객명, 연락처, 회원번호 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>

                    <div className="adm-segmented">
                        {[
                            { id: "cumulative", label: "누적 전체" },
                            { id: "today", label: "당일" },
                            { id: "yesterday", label: "전일" },
                            { id: "current", label: "당월" },
                            { id: "previous", label: "전월" },
                            { id: "3months", label: "3개월" },
                            { id: "year", label: "1년" },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPeriodFilter(p.id)}
                                className={periodFilter === p.id ? "active" : ""}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">가입상품 전체</option>
                        {filterOptions.products.map((p: any) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    {(isAdmin ||
                        (allowedCompanyNames &&
                            allowedCompanyNames.length > 1)) && (
                        <select
                            value={partnerFilter}
                            onChange={(e) => setPartnerFilter(e.target.value)}
                            className="adm-select"
                        >
                            <option value="">파트너사 전체</option>
                            {filterOptions.partners.map((p: string) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">가입상태 전체</option>
                        {filterOptions.statuses.map((s: any) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>

                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">납입상태 전체</option>
                        {filterOptions.paymentStatuses.map((p: any) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    <select
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">납입방법 전체</option>
                        {filterOptions.methods.map((m: any) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>

                    <select
                        value={delinquencyFilter}
                        onChange={(e) => setDelinquencyFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">연체해결 전체</option>
                        <option value="미해결">미해결</option>
                        <option value="해결함">해결함</option>
                    </select>

                    <select
                        value={cancelFilter}
                        onChange={(e) => setCancelFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">해약처리 전체</option>
                        {filterOptions.cancelStatuses.map((c: any) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>

                    <select
                        value={paymentCountFilter}
                        onChange={(e) => setPaymentCountFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">실납입회차 전체</option>
                        {filterOptions.paymentCounts.map((cnt: any) => (
                            <option key={cnt} value={cnt}>
                                {cnt}회
                            </option>
                        ))}
                    </select>

                    <select
                        value={refundFilter}
                        onChange={(e) => setRefundFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">환수여부 전체</option>
                        {REFUND_OPTIONS.map((r: string) => (
                            <option key={r} value={r}>
                                {r}
                            </option>
                        ))}
                    </select>

                    <select
                        value={revivalFilter}
                        onChange={(e) => setRevivalFilter(e.target.value)}
                        className="adm-select"
                    >
                        <option value="">부활여부 전체</option>
                        {REVIVAL_OPTIONS.map((v: string) => (
                            <option key={v} value={v}>
                                {v}
                            </option>
                        ))}
                    </select>

                    {hasSubFilter && (
                        <button
                            type="button"
                            onClick={resetAllFilters}
                            className="adm-btn small"
                        >
                            <AdminIcon name="refresh" />
                            <span>필터 초기화</span>
                        </button>
                    )}

                    <div className="adm-filter-end">
                        <span>
                            조회 고객{" "}
                            <strong className="text-[#163a6b]">
                                {filteredUniqueCount.toLocaleString()}
                            </strong>
                            명 ({filteredRecords.length.toLocaleString()}건)
                        </span>
                    </div>
                </div>

                {/* 데이터 테이블 */}
                <div className="adm-table-scroll max-h-[680px] overflow-y-auto">
                    <table className="adm-table">
                        <thead className="sticky top-0 z-20">
                            <tr>
                                <th
                                    className="cursor-pointer hover:text-[#163a6b]"
                                    onClick={() => {
                                        if (sortField === "joinDate") {
                                            setSortOrder((prev) =>
                                                prev === "asc" ? "desc" : "asc"
                                            );
                                        } else {
                                            setSortField("joinDate");
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    가입일자{" "}
                                    {sortField === "joinDate"
                                        ? sortOrder === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "↕"}
                                </th>
                                <th>파트너사</th>
                                <th
                                    className="cursor-pointer hover:text-[#163a6b]"
                                    onClick={() => {
                                        if (sortField === "customerName") {
                                            setSortOrder((prev) =>
                                                prev === "asc" ? "desc" : "asc"
                                            );
                                        } else {
                                            setSortField("customerName");
                                            setSortOrder("asc");
                                        }
                                    }}
                                >
                                    고객명{" "}
                                    {sortField === "customerName"
                                        ? sortOrder === "asc"
                                            ? "▲"
                                            : "▼"
                                        : "↕"}
                                </th>
                                <th>생년월일</th>
                                <th>휴대전화</th>
                                <th>가입상품</th>
                                <th className="text-center">가입상태</th>
                                <th className="text-center">납입상태</th>
                                <th className="text-center">연체해결</th>
                                <th className="text-center">납입방법</th>
                                <th className="text-center">해약처리</th>
                                <th className="text-center">실납입회차</th>
                                <th className="text-center">이체일자</th>
                                <th className="text-center">환수 여부</th>
                                <th className="text-center">부활 여부</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={15}
                                        className="py-16 text-center text-xs text-[#788699]"
                                    >
                                        조회된 데이터가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((r: any, i: number) => {
                                    const customerKey = `${
                                        r.displayCustomerName
                                    }_${r.displayBirth || r.birth || ""}_${
                                        r.displayPhone
                                    }`;
                                    const groupBg =
                                        groupedData.groupColors[customerKey] ||
                                        "";
                                    const groupCount =
                                        groupedData.counts[customerKey];
                                    const isDuplicate = groupCount > 1;

                                    let isFirstInGroup = false;
                                    let isLastInGroup = false;

                                    if (isDuplicate) {
                                        const prevRecord =
                                            i > 0
                                                ? filteredRecords[i - 1]
                                                : null;
                                        const prevKey = prevRecord
                                            ? `${
                                                  prevRecord.displayCustomerName
                                              }_${
                                                  prevRecord.displayBirth ||
                                                  prevRecord.birth ||
                                                  ""
                                              }_${prevRecord.displayPhone}`
                                            : null;
                                        isFirstInGroup = prevKey !== customerKey;

                                        const nextRecord =
                                            i < filteredRecords.length - 1
                                                ? filteredRecords[i + 1]
                                                : null;
                                        const nextKey = nextRecord
                                            ? `${
                                                  nextRecord.displayCustomerName
                                              }_${
                                                  nextRecord.displayBirth ||
                                                  nextRecord.birth ||
                                                  ""
                                              }_${nextRecord.displayPhone}`
                                            : null;
                                        isLastInGroup = nextKey !== customerKey;
                                    }

                                    return (
                                        <tr
                                            key={r._id || i}
                                            className={groupBg}
                                        >
                                            <td className="relative tabular-nums text-xs text-[#5a6b82]">
                                                {isDuplicate && (
                                                    <div className="absolute left-1 top-0 bottom-0 w-3 flex items-center justify-center">
                                                        <div
                                                            className={`w-[2px] bg-[#163a6b]/40 h-full relative ${
                                                                isFirstInGroup
                                                                    ? "mt-3 h-[calc(100%-0.75rem)]"
                                                                    : ""
                                                            } ${
                                                                isLastInGroup
                                                                    ? "mb-3 h-[calc(100%-0.75rem)]"
                                                                    : ""
                                                            }`}
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    {r.isCustomerModified && (
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full bg-[#c96453] shrink-0"
                                                            title="수정된 고객"
                                                        />
                                                    )}
                                                    <span>
                                                        {formatDateForDisplay(
                                                            r.joinDate
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="font-bold text-[#163a6b] text-xs">
                                                {r.partnerName}
                                            </td>
                                            <td>
                                                <div className="adm-person">
                                                    <span className="adm-person-circle">
                                                        {(
                                                            r.displayCustomerName ||
                                                            "고"
                                                        ).charAt(0)}
                                                    </span>
                                                    <strong>
                                                        {r.displayCustomerName}
                                                    </strong>
                                                </div>
                                            </td>
                                            <td className="text-xs text-[#788699] tabular-nums">
                                                {r.displayBirth ||
                                                    r.birth ||
                                                    "-"}
                                            </td>
                                            <td className="text-xs text-[#3b495c] tabular-nums">
                                                {r.displayPhone}
                                            </td>
                                            <td className="text-xs font-semibold text-[#162438]">
                                                {r.productName}
                                            </td>
                                            <td className="text-center">
                                                <span
                                                    className={`adm-pill ${
                                                        r.joinStatus.includes(
                                                            "정상"
                                                        )
                                                            ? "green"
                                                            : r.joinStatus.includes(
                                                                  "해약"
                                                              ) ||
                                                              r.joinStatus.includes(
                                                                  "철회"
                                                              )
                                                            ? "gray"
                                                            : "blue"
                                                    }`}
                                                >
                                                    {r.joinStatus}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span
                                                    className={`adm-pill ${
                                                        r.paymentStatus.includes(
                                                            "정상"
                                                        )
                                                            ? "green"
                                                            : r.paymentStatus.includes(
                                                                  "연체"
                                                              )
                                                            ? "red"
                                                            : r.paymentStatus.includes(
                                                                  "미납"
                                                              )
                                                            ? "orange"
                                                            : "gray"
                                                    }`}
                                                >
                                                    {r.paymentStatus || "-"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {r.paymentStatus.includes(
                                                    "연체"
                                                ) ||
                                                r.paymentStatus.includes(
                                                    "미납"
                                                ) ? (
                                                    updatingMap[
                                                        `${r._id}_delinquencyResolveStatus`
                                                    ] ? (
                                                        <span className="adm-pill orange">
                                                            처리중...
                                                        </span>
                                                    ) : (
                                                        <div className="inline-flex flex-col items-center">
                                                            <select
                                                                value={
                                                                    r.delinquencyResolveStatus ||
                                                                    "미해결"
                                                                }
                                                                onChange={(e) =>
                                                                    handleStatusUpdate(
                                                                        r._id,
                                                                        "delinquencyResolveStatus",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className={`adm-select !min-h-[28px] !py-0.5 !px-2 !text-[11px] font-bold ${
                                                                    (r.delinquencyResolveStatus ||
                                                                        "미해결") ===
                                                                    "해결함"
                                                                        ? "!bg-[#e8effa] !text-[#163a6b] !border-[#d4e1f4]"
                                                                        : "!bg-[#faf0df] !text-[#9e7029] !border-[#ead7b7]"
                                                                }`}
                                                            >
                                                                <option value="미해결">
                                                                    미해결
                                                                </option>
                                                                <option value="해결함">
                                                                    해결함
                                                                </option>
                                                            </select>
                                                            {r.delinquencyResolveUpdatedAt && (
                                                                <span className="text-[9px] text-[#788699] mt-0.5 tabular-nums">
                                                                    {
                                                                        r.delinquencyResolveUpdatedAt
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-[#8b9cb3]">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-center text-xs text-[#5a6b82]">
                                                {r.paymentMethod}
                                            </td>
                                            <td className="text-center text-xs text-[#ad6654]">
                                                {r.cancelStatus || "-"}
                                            </td>
                                            <td className="text-center font-bold text-[#162438] tabular-nums">
                                                {r.actualPaymentCount}회
                                            </td>
                                            <td className="text-center text-xs text-[#5a6b82] tabular-nums">
                                                {formatTransferDateForDisplay(
                                                    r.transferDate
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {updatingMap[
                                                    `${r._id}_refundStatus`
                                                ] ? (
                                                    <span className="adm-pill gray">
                                                        처리중...
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex flex-col items-center">
                                                        <select
                                                            value={
                                                                r.refundStatus ||
                                                                "선택없음"
                                                            }
                                                            onChange={(e) =>
                                                                handleStatusUpdate(
                                                                    r._id,
                                                                    "refundStatus",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className={`adm-select !min-h-[28px] !py-0.5 !px-2 !text-[11px] font-semibold ${
                                                                r.refundStatus &&
                                                                r.refundStatus !==
                                                                    "선택없음"
                                                                    ? "!bg-[#e4ecf8] !text-[#163a6b] !border-[#c2dad0] font-bold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {REFUND_OPTIONS.map(
                                                                (opt) => (
                                                                    <option
                                                                        key={
                                                                            opt
                                                                        }
                                                                        value={
                                                                            opt
                                                                        }
                                                                    >
                                                                        {opt}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {r.refundUpdatedAt && (
                                                            <span className="text-[9px] text-[#788699] mt-0.5 tabular-nums">
                                                                {
                                                                    r.refundUpdatedAt
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {updatingMap[
                                                    `${r._id}_revivalStatus`
                                                ] ? (
                                                    <span className="adm-pill gray">
                                                        처리중...
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex flex-col items-center">
                                                        <select
                                                            value={
                                                                r.revivalStatus ||
                                                                "선택없음"
                                                            }
                                                            onChange={(e) =>
                                                                handleStatusUpdate(
                                                                    r._id,
                                                                    "revivalStatus",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className={`adm-select !min-h-[28px] !py-0.5 !px-2 !text-[11px] font-semibold ${
                                                                r.revivalStatus ===
                                                                "부활완료"
                                                                    ? "!bg-[#e8effa] !text-[#163a6b] !border-[#d4e1f4] font-bold"
                                                                    : r.revivalStatus ===
                                                                      "부활예정"
                                                                    ? "!bg-[#eaf1f7] !text-[#446b88] !border-[#c6d8e8] font-bold"
                                                                    : r.revivalStatus ===
                                                                      "취소"
                                                                    ? "!bg-[#faeae5] !text-[#ad6654] !border-[#ead5cf] font-bold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {REVIVAL_OPTIONS.map(
                                                                (opt) => (
                                                                    <option
                                                                        key={
                                                                            opt
                                                                        }
                                                                        value={
                                                                            opt
                                                                        }
                                                                    >
                                                                        {opt}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {r.revivalUpdatedAt && (
                                                            <span className="text-[9px] text-[#788699] mt-0.5 tabular-nums">
                                                                {
                                                                    r.revivalUpdatedAt
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="adm-table-foot">
                    <span>
                        동일 고객의 다구좌 가입 건은 좌측 세로선으로 묶여 표시되며, 상태 변경 건은 상단에 우선 배치됩니다.
                    </span>
                    <span>
                        총 {filteredUniqueCount.toLocaleString()}명 ·{" "}
                        {filteredRecords.length.toLocaleString()}건
                    </span>
                </div>
            </section>
        </div>
    );
}
