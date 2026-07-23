import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import * as XLSX from "xlsx";
import { Partner } from "@/lib/types";

// 날짜 포맷 표준화 (Excel 시리얼 번호 및 다양한 포맷 지원)
const normalizeDate = (val: string | number | undefined): string => {
    if (!val) return "";
    const strVal = String(val).trim();
    if (!strVal) return "";
    
    // 숫자만 남기기 (8자리 미만은 일반 숫자/일자이므로 날짜 변환 시도하지 않음)
    const clean = strVal.replace(/[^0-9]/g, '');
    if (clean.length < 8) {
        return strVal;
    }

    // Excel 시리얼 번호 형식 (예: 46106)
    const serial = parseFloat(strVal);
    if (!isNaN(serial) && serial > 30000 && serial < 60000) {
        const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
    }
    
    if (clean.length === 8) {
        return clean;
    }
    
    return strVal;
};

// 화면 표시용 날짜 포맷 (YYYYMMDD -> YYYY-MM-DD)
const formatDateForDisplay = (val: string | undefined): string => {
    if (!val) return "-";
    const strVal = String(val).trim();
    if (strVal.length === 8 && /^\d{8}$/.test(strVal)) {
        return `${strVal.substring(0, 4)}-${strVal.substring(4, 6)}-${strVal.substring(6, 8)}`;
    }
    return strVal;
};

// 화면 표시용 이체일자 포맷 (10 -> 10일, 25 -> 25일, 기존 20011001 복원 포함)
const formatTransferDateForDisplay = (val: string | number | undefined): string => {
    if (!val) return "-";
    let str = String(val).trim();
    if (!str || str === "-") return "-";

    str = str.replace(/\.0$/, '');

    // 이전 normalizeDate("10") 버그로 인해 "20011001"로 잘못 들어간 값 복원
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

    const numOnly = str.replace(/[^0-9]/g, '');
    if (numOnly.length >= 1 && numOnly.length <= 2) {
        return `${numOnly}일`;
    }

    return str.endsWith("일") ? str : `${str}일`;
};

// 환수여부 옵션 목록 (100% ~ 40%까지 5%씩 감축 + 선택없음)
const REFUND_OPTIONS = [
    "선택없음",
    "100%", "95%", "90%", "85%", "80%", "75%", "70%", "65%", "60%", "55%", "50%", "45%", "40%"
];

// 부활여부 옵션 목록 (부활완료/부활예정/취소/선택없음)
const REVIVAL_OPTIONS = [
    "선택없음",
    "부활완료", "부활예정", "취소"
];

interface RetentionManagement2Props {
    isAdmin?: boolean;
    partnerId?: string;
    partners?: Partner[];
}

export default function RetentionManagement2({ isAdmin = false, partnerId, partners = [] }: RetentionManagement2Props) {
    const rawRecords = useQuery(api.retention2.getRetentionRecords, { partnerId: isAdmin ? "admin" : partnerId });
    const allApplications = useQuery(api.applications.getAllApplications);
    
    const uploadRecords = useMutation(api.retention2.uploadRetentionRecords);
    const updateRetentionStatus = useMutation(api.retention2.updateRetentionStatus);

    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({});

    const handleStatusUpdate = async (id: any, field: "delinquencyResolveStatus" | "refundStatus" | "revivalStatus", value: string) => {
        const key = `${id}_${field}`;
        setUpdatingMap(prev => ({ ...prev, [key]: true }));
        try {
            await updateRetentionStatus({ id, [field]: value });
        } catch (err) {
            console.error(err);
            alert("상태 변경 중 오류가 발생했습니다.");
        } finally {
            setUpdatingMap(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
    };
    const [searchTerm, setSearchTerm] = useState("");
    const [periodFilter, setPeriodFilter] = useState<string>("cumulative"); // cumulative, current, previous, year

    // 신규 필터 및 정렬 상태
    const [sortField, setSortField] = useState<"default" | "joinDate" | "customerName">("default");
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

    // 본인 및 하위 파트너 회사명 목록 (상위 파트너 권한 지원)
    const allowedCompanyNames = useMemo(() => {
        if (isAdmin || !partnerId || !partners || partners.length === 0) return null;

        const currentP = partners.find((p: any) => p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId);
        if (!currentP) return null;

        const allowed = new Set<string>();
        if (currentP.companyName) {
            allowed.add(currentP.companyName.trim());
        }

        const findSubPartners = (parent: any) => {
            const pId = parent.partnerId;
            const pLogin = parent.loginId;
            const pComp = parent.companyName?.trim();

            const subs = partners.filter((p: any) => {
                if (!p) return false;
                const matchParentId = (pId && p.parentPartnerId === pId) || (pLogin && p.parentPartnerId === pLogin);
                const matchParentName = pComp && p.parentPartnerName && p.parentPartnerName.trim() === pComp;
                return matchParentId || matchParentName;
            });

            subs.forEach((sub: any) => {
                if (sub.companyName) {
                    const comp = sub.companyName.trim();
                    if (!allowed.has(comp)) {
                        allowed.add(comp);
                        findSubPartners(sub);
                    }
                }
            });
        };

        findSubPartners(currentP);
        return Array.from(allowed);
    }, [isAdmin, partnerId, partners]);

    // 가장 오래된 신청건 순으로 정렬된 신청 데이터
    const sortedApplications = useMemo(() => {
        if (!allApplications) return [];
        return [...allApplications].sort((a: any, b: any) => {
            const timeA = a._creationTime || a.createdAt || a.appliedAt || 0;
            const timeB = b._creationTime || b.createdAt || b.appliedAt || 0;
            return timeA - timeB;
        });
    }, [allApplications]);

    // 고객 매핑 맵 계산 (마스킹된 이름/휴대전화 -> 실명, 풀 전화번호, 등록일이 가장 오래된 파트너사명)
    const customerMap = useMemo(() => {
        const map = new Map<string, { fullName: string; fullPhone: string; partnerName: string }>();
        if (!sortedApplications) return map;

        for (const app of sortedApplications) {
            if (!app.customerName || !app.customerPhone) continue;

            const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');
            const appName = app.customerName.trim();
            const key = `${appName}_${appPhoneDigits}`;

            if (map.has(key)) continue; // 가장 오래된 신청건 우선 등록 유지

            let partnerName = app.partnerName || "";
            if (!partnerName && app.partnerId) {
                const pObj = partners.find((p: any) => p.partnerId === app.partnerId || p.loginId === app.partnerId);
                if (pObj) partnerName = pObj.companyName;
            }

            // 고유 식별 키 저장
            map.set(key, {
                fullName: appName,
                fullPhone: app.customerPhone,
                partnerName: partnerName || "-",
            });
        }
        return map;
    }, [sortedApplications, partners]);

    // 레코드별 매핑 함수 (가장 오래된 신청건의 파트너사 우선 매핑)
    const getMappedInfo = (maskedName: string, maskedPhone: string) => {
        const cleanPhoneDigits = maskedPhone.replace(/[^0-9]/g, '');
        const cleanName = maskedName.trim();

        if (!sortedApplications || sortedApplications.length === 0) {
            return { fullName: cleanName, fullPhone: maskedPhone, partnerName: "-" };
        }

        const last4 = cleanPhoneDigits.length >= 4 ? cleanPhoneDigits.slice(-4) : "";
        const first3 = cleanPhoneDigits.length >= 3 ? cleanPhoneDigits.slice(0, 3) : "";

        for (const app of sortedApplications) {
            if (!app.customerName || !app.customerPhone) continue;

            const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');
            const appName = app.customerName.trim();

            // 전화번호 일치 확인 (마스킹 포함)
            let phoneMatch = false;
            if (maskedPhone.includes('*') || cleanPhoneDigits.length < 10) {
                phoneMatch = appPhoneDigits.startsWith(first3) && appPhoneDigits.endsWith(last4);
            } else {
                phoneMatch = (appPhoneDigits === cleanPhoneDigits);
            }

            if (!phoneMatch) continue;

            // 이름 일치 확인
            let nameMatch = false;
            if (cleanName.includes('*')) {
                if (cleanName.length === appName.length) {
                    const firstChar = cleanName[0];
                    const lastChar = cleanName[cleanName.length - 1];
                    if (appName.startsWith(firstChar) && appName.endsWith(lastChar)) {
                        nameMatch = true;
                    }
                }
            } else {
                nameMatch = (appName === cleanName);
            }

            if (nameMatch) {
                let partnerName = app.partnerName || "";
                if (!partnerName && app.partnerId) {
                    const pObj = partners.find((p: any) => p.partnerId === app.partnerId || p.loginId === app.partnerId);
                    if (pObj) partnerName = pObj.companyName;
                }
                return {
                    fullName: appName,
                    fullPhone: app.customerPhone,
                    partnerName: partnerName || "-",
                };
            }
        }

        return { fullName: cleanName, fullPhone: maskedPhone, partnerName: "-" };
    };

    const records = useMemo(() => {
        if (!rawRecords) return undefined;
        return rawRecords.map((r: any) => {
            const joinStatus = r.joinStatus || "";
            const paymentStatus = (joinStatus.includes("해약") || joinStatus === "해약") ? "해약처리" : r.paymentStatus;
            return {
                ...r,
                paymentStatus,
                joinDate: normalizeDate(r.joinDate)
            };
        });
    }, [rawRecords]);

    // 엑셀 업로드 처리 (첨부 1번 20개 열 양식 기준)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 헤더(Line 1) 제외 데이터 파싱
            const rows = json.slice(1).filter((row: any) => row && row.length > 0);

            const formattedRecords = rows.map((row: any) => {
                const joinStatus = String(row[7] || "");
                let paymentStatus = String(row[6] || "");
                if (joinStatus.includes("해약") || joinStatus === "해약") {
                    paymentStatus = "해약처리";
                }
                return {
                    memberNo: String(row[0] || ""),           // Col A: 회원번호
                    uniqueNo: String(row[1] || ""),           // Col B: 고유번호
                    customerName: String(row[2] || ""),       // Col C: 고객명 (마스킹)
                    birth: String(row[3] || ""),              // Col D: 생년월일 (마스킹)
                    phone: String(row[4] || ""),              // Col E: 휴대전화 (마스킹)
                    productName: String(row[5] || ""),        // Col F: 가입상품
                    paymentStatus: paymentStatus,             // Col G: 납입상태
                    joinStatus: joinStatus,                   // Col H: 가입상태
                    joinDate: normalizeDate(row[8]),          // Col I: 가입일자
                    transferDate: String(row[9] ?? "").trim().replace(/\.0$/, '').replace(/[^0-9]/g, ''), // Col J: 이체일자 (일자 숫자)
                    paymentMethod: String(row[10] || ""),     // Col K: 납입방법
                    cancelStatus: String(row[11] || ""),      // Col L: 해약처리
                    cancelDate: String(row[12] || ""),        // Col M: 해약처리일
                    approvalStatus: String(row[13] || ""),    // Col N: 승인상태
                    b2bCompany: String(row[14] || ""),        // Col O: B2B회사명
                    idNo: String(row[15] || ""),              // Col P: ID NO
                    discountCount: Number(row[16] || 0),     // Col Q: 특별할인회차
                    actualPaymentCount: Number(row[17] || 0), // Col R: 실납입회차
                    subCompany: String(row[18] || ""),        // Col S: 소속(업체명)
                    transferorName: String(row[19] || ""),    // Col T: 전해자명
                };
            });

            await uploadRecords({ records: formattedRecords });
            alert("유지율2 데이터가 성공적으로 업로드되었습니다.");
        } catch (error) {
            console.error(error);
            alert("업로드 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    // 가입일자(YYYYMMDD)를 기반으로 기간 필터링
    const periodFilteredRecords = useMemo(() => {
        if (!records) return [];
        const kstNow = new Date(new Date().getTime() + (new Date().getTimezoneOffset() + 540) * 60000);
        const formatYM = (d: Date) => d.getFullYear().toString() + (d.getMonth() + 1).toString().padStart(2, '0');
        const formatYMD = (d: Date) => formatYM(d) + d.getDate().toString().padStart(2, '0');

        const currentYearMonth = formatYM(kstNow);
        const todayYMD = formatYMD(kstNow);

        const yesterday = new Date(kstNow);
        yesterday.setDate(kstNow.getDate() - 1);
        const yesterdayYMD = formatYMD(yesterday);

        const prevDate = new Date(kstNow.getFullYear(), kstNow.getMonth() - 1, 1);
        const prevYearMonth = formatYM(prevDate);

        return records.filter((r: any) => {
            // 가입상태가 '대기'인 고객 제외
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
            return true; // cumulative
        });
    }, [records, periodFilter]);

    // 통계 재계산
    const displayStats = useMemo(() => {
        const filtered = periodFilteredRecords;

        const getUniqueCount = (data: typeof filtered) => {
            const keys = new Set(data.map((r: any) => `${r.customerName}_${r.birth}_${r.phone}`));
            return keys.size;
        };

        const normalRecords = filtered.filter((r: any) => {
            const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
            if (isCancel) return false;
            const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
            if (isDelinquent) return false;
            return true;
        });

        const delinquentRecords = filtered.filter((r: any) => {
            const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
            if (isCancel) return false;
            return r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
        });

        const cancelRecords = filtered.filter((r: any) =>
            r.joinStatus.includes("해약") ||
            r.joinStatus.includes("철회") ||
            (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-")
        );

        const stats = {
            total: { count: filtered.length, unique: getUniqueCount(filtered) },
            normalPayment: { count: normalRecords.length, unique: getUniqueCount(normalRecords) },
            delinquent: { count: delinquentRecords.length, unique: getUniqueCount(delinquentRecords) },
            cancel: { count: cancelRecords.length, unique: getUniqueCount(cancelRecords) },
            delinquentCounts: {} as Record<string, { count: number, unique: number }>,
            cardCount: filtered.filter((r: any) => r.paymentMethod.includes("카드")).length,
            cmsCount: filtered.filter((r: any) => r.paymentMethod.toUpperCase().includes("CMS") || r.paymentMethod.includes("이체")).length,
        };

        filtered.forEach((r: any) => {
            const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");
            if (!isCancel && (r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납"))) {
                const status = r.paymentStatus || "미납";
                if (!stats.delinquentCounts[status]) {
                    stats.delinquentCounts[status] = { count: 0, unique: 0 };
                }
                stats.delinquentCounts[status].count++;
            }
        });

        Object.keys(stats.delinquentCounts).forEach(status => {
            const statusRecords = filtered.filter((r: any) => (r.paymentStatus || "미납") === status);
            stats.delinquentCounts[status].unique = getUniqueCount(statusRecords);
        });

        return stats;
    }, [periodFilteredRecords]);

    // 납입상태 정렬 순위 계산
    // 1. 연체회차 높은순 -> 낮은순 (13회연체 = 9987, 12회연체 = 9988 ...)
    // 2. 당월미납 (20000)
    // 3. 정상납입 (30000)
    // 4. 해약처리 (40000)
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

    // 필터 옵션 추출 (모든 항목 동적 옵션)
    const filterOptions = useMemo(() => {
        if (!records) return { products: [], partners: [], statuses: [], paymentStatuses: [], methods: [], cancelStatuses: [], paymentCounts: [] };

        const mapped = records.map((r: any) => {
            const info = getMappedInfo(r.customerName, r.phone);
            return { ...r, partnerName: info.partnerName };
        });

        const products = Array.from(new Set(mapped.map((r: any) => r.productName))).filter(Boolean).sort();
        const partnersList = Array.from(new Set(mapped.map((r: any) => r.partnerName))).filter((p: any) => p && p !== "-").sort();
        const statuses = Array.from(new Set(mapped.map((r: any) => r.joinStatus))).filter(Boolean).sort();
        const paymentStatuses = Array.from(new Set(mapped.map((r: any) => r.paymentStatus))).filter(Boolean).sort((a: string, b: string) => getPaymentRank(a) - getPaymentRank(b));
        const methods = Array.from(new Set(mapped.map((r: any) => r.paymentMethod))).filter(Boolean).sort();
        const cancelStatuses = Array.from(new Set(mapped.map((r: any) => r.cancelStatus))).filter((c: any) => c && c !== "-").sort();
        const paymentCounts = Array.from(new Set(mapped.map((r: any) => Number(r.actualPaymentCount)))).filter((n: any) => !isNaN(n)).sort((a: number, b: number) => a - b);

        return { products, partners: partnersList, statuses, paymentStatuses, methods, cancelStatuses, paymentCounts };
    }, [records, getMappedInfo]);

    // 검색 및 상세 필터링 + 정렬 (고객 실명/풀번호/파트너사 매핑 포함)
    const filteredRecords = useMemo(() => {
        let result = periodFilteredRecords.map((r: any) => {
            const mapped = getMappedInfo(r.customerName, r.phone);
            return {
                ...r,
                displayCustomerName: mapped.fullName,
                displayPhone: mapped.fullPhone,
                partnerName: mapped.partnerName,
            };
        }).filter((r: any) => {
            // 검색어 필터
            const matchesSearch = searchTerm === "" ||
                r.displayCustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.displayPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.idNo.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // 추가 필터링
            if (productFilter && r.productName !== productFilter) return false;
            if (partnerFilter && r.partnerName !== partnerFilter) return false;
            if (statusFilter && r.joinStatus !== statusFilter) return false;
            if (paymentStatusFilter && r.paymentStatus !== paymentStatusFilter) return false;
            if (methodFilter && r.paymentMethod !== methodFilter) return false;
            if (cancelFilter && (r.cancelStatus || "-") !== cancelFilter) return false;
            if (paymentCountFilter !== "" && String(r.actualPaymentCount) !== String(paymentCountFilter)) return false;
            if (refundFilter && (r.refundStatus || "선택없음") !== refundFilter) return false;
            if (revivalFilter && (r.revivalStatus || "선택없음") !== revivalFilter) return false;
            if (delinquencyFilter) {
                const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                if (!isDelinquent) return false;
                const resolveStatus = r.delinquencyResolveStatus || "미해결";
                if (resolveStatus !== delinquencyFilter) return false;
            }

            // 파트너 전용 필터 (HQ Admin이 아닌 경우 본인 파트너 고객만 표출)
            if (!isAdmin && partnerId) {
                const currentP = partners.find((p: any) => p.partnerId === partnerId || p.loginId === partnerId);
                const targetCompName = currentP?.companyName?.trim();
                if (targetCompName) {
                    const rPartner = r.partnerName.trim();
                    if (rPartner === "-" || (rPartner !== targetCompName && !rPartner.includes(targetCompName) && !targetCompName.includes(rPartner))) {
                        return false;
                    }
                }
            }

            // 대시보드 토글 필터
            if (activeStatFilter !== "all") {
                const isCancel = r.joinStatus.includes("해약") || r.joinStatus.includes("철회") || (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-");

                if (activeStatFilter === "normal") {
                    const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                    if (isCancel || isDelinquent) return false;
                } else if (activeStatFilter === "delinquent") {
                    const isDelinquent = r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납");
                    if (isCancel || !isDelinquent) return false;
                } else if (activeStatFilter === "cancel") {
                    if (!isCancel) return false;
                } else if (activeStatFilter.startsWith("delinquent:")) {
                    const targetStatus = activeStatFilter.replace("delinquent:", "");
                    if (r.paymentStatus !== targetStatus && (targetStatus !== "미납" || r.paymentStatus !== "")) return false;
                }
            }

            return true;
        });

        // 정렬 적용
        return result.sort((a: any, b: any) => {
            // 헤더 클릭 / 드롭다운에 의한 개별 필드 정렬
            if (sortField === "customerName") {
                const nameA = a.displayCustomerName || a.customerName || "";
                const nameB = b.displayCustomerName || b.customerName || "";
                const cmp = nameA.localeCompare(nameB, "ko-KR");
                if (cmp !== 0) return sortOrder === "asc" ? cmp : -cmp;

                const dateA = a.joinDate.replace(/[^0-9]/g, '');
                const dateB = b.joinDate.replace(/[^0-9]/g, '');
                return dateA.localeCompare(dateB);
            }

            if (sortField === "joinDate") {
                const dateA = a.joinDate.replace(/[^0-9]/g, '');
                const dateB = b.joinDate.replace(/[^0-9]/g, '');
                const cmp = dateA.localeCompare(dateB);
                if (cmp !== 0) return sortOrder === "asc" ? cmp : -cmp;

                const rankA = getPaymentRank(a.paymentStatus);
                const rankB = getPaymentRank(b.paymentStatus);
                if (rankA !== rankB) return rankA - rankB;

                const nameA = a.displayCustomerName || a.customerName || "";
                const nameB = b.displayCustomerName || b.customerName || "";
                return nameA.localeCompare(nameB, "ko-KR");
            }

            // 기본 정렬 (사용자 지정 3단계 정렬):
            // 1순위: 납입상태 (연체회차 높은순 -> 낮은순 -> 당월미납 -> 정상납입 -> 해약처리)
            const rankA = getPaymentRank(a.paymentStatus);
            const rankB = getPaymentRank(b.paymentStatus);
            if (rankA !== rankB) return rankA - rankB;

            // 2순위: 가입일자 오래된날 -> 최신일
            const dateA = a.joinDate.replace(/[^0-9]/g, '');
            const dateB = b.joinDate.replace(/[^0-9]/g, '');
            const dateCmp = dateA.localeCompare(dateB);
            if (dateCmp !== 0) return dateCmp;

            // 3순위: 고객명 가나다순
            const nameA = a.displayCustomerName || a.customerName || "";
            const nameB = b.displayCustomerName || b.customerName || "";
            return nameA.localeCompare(nameB, "ko-KR");
        });
    }, [periodFilteredRecords, searchTerm, productFilter, partnerFilter, statusFilter, paymentStatusFilter, methodFilter, cancelFilter, paymentCountFilter, refundFilter, revivalFilter, delinquencyFilter, sortField, sortOrder, activeStatFilter, allApplications, partners]);

    // 중복 고객 그룹화 데이터 생성
    const groupedData = useMemo(() => {
        const counts: Record<string, number> = {};
        filteredRecords.forEach((r: any) => {
            const key = `${r.displayCustomerName}_${r.birth}_${r.displayPhone}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        // 색상 구분을 위한 시퀀스 생성
        const groupColors: Record<string, string> = {};
        let colorIdx = 0;
        const colorList = ["bg-blue-50/50", "bg-emerald-50/50", "bg-purple-50/50", "bg-amber-50/50", "bg-rose-50/50"];

        Object.keys(counts).forEach(key => {
            if (counts[key] > 1) {
                groupColors[key] = colorList[colorIdx % colorList.length];
                colorIdx++;
            }
        });

        return { counts, groupColors };
    }, [filteredRecords]);

    // 엑셀 다운로드
    const handleDownloadExcel = async () => {
        if (filteredRecords.length === 0) {
            alert("다운로드할 데이터가 없습니다.");
            return;
        }
        if (isDownloading) return;

        setIsDownloading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataToExport = filteredRecords.map((r: any) => ({
                "가입일자": formatDateForDisplay(r.joinDate),
                "파트너사명": r.partnerName,
                "고객명": r.displayCustomerName,
                "생년월일": r.birth,
                "휴대전화": r.displayPhone,
                "가입상품": r.productName,
                "가입상태": r.joinStatus,
                "납입상태": r.paymentStatus,
                "연체해결": (r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납")) ? (r.delinquencyResolveStatus || "미해결") : "-",
                "납입방법": r.paymentMethod,
                "해약처리": r.cancelStatus,
                "실납입회차": r.actualPaymentCount,
                "이체일자": r.transferDate || "-",
                "환수여부": r.refundStatus || "선택없음",
                "부활여부": r.revivalStatus || "선택없음",
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "연체관리현황");

            const wscols = [
                { wch: 12 }, // 가입일자
                { wch: 15 }, // 파트너사명
                { wch: 12 }, // 고객명
                { wch: 12 }, // 생년월일
                { wch: 15 }, // 휴대전화
                { wch: 20 }, // 가입상품
                { wch: 10 }, // 가입상태
                { wch: 10 }, // 납입상태
                { wch: 10 }, // 연체해결
                { wch: 10 }, // 납입방법
                { wch: 12 }, // 해약처리
                { wch: 10 }, // 실납입회차
                { wch: 12 }, // 이체일자
                { wch: 10 }, // 환수여부
                { wch: 10 }, // 부활여부
            ];
            worksheet['!cols'] = wscols;

            XLSX.writeFile(workbook, `유지율2현황_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error("Excel download error:", error);
            alert("다운로드 중 오류가 발생했습니다.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!records) return <div className="p-8 text-center font-bold">데이터를 불러오는 중...</div>;

    return (
        <div className="space-y-6">
            {/* 상단 헤더 & 업로드 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tighter">연체 관리</h2>
                    <p className="text-gray-400 text-sm font-bold mt-1">고객의 납입, 유지, 환수 및 부활 현황을 관리합니다.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isAdmin && (
                        <label className={`cursor-pointer px-6 py-3 bg-sono-primary text-white rounded-2xl font-black text-sm hover:bg-sono-dark transition-all shadow-lg active:scale-95 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading ? '업로드 중...' : '엑셀 업로드'}
                            <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                        </label>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* 데이터 테이블 */}
                <div className="w-full">
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-50 flex flex-col gap-4 bg-white">
                            {/* Row 1: 검색어 + 기간 필터 바 + 엑셀 다운로드 */}
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md w-full">
                                    <input
                                        type="text"
                                        placeholder="파트너사명, 고객명, 회원번호 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-sono-primary/20 transition-all font-bold"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        {[
                                            { id: "today", label: "당일" },
                                            { id: "yesterday", label: "전일" },
                                            { id: "current", label: "당월" },
                                            { id: "previous", label: "전월" },
                                            { id: "3months", label: "3개월" },
                                            { id: "year", label: "1년" },
                                            { id: "cumulative", label: "누적" },
                                        ].map((p: any) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPeriodFilter(p.id)}
                                                className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all ${periodFilter === p.id
                                                        ? "bg-white text-sono-primary shadow-sm"
                                                        : "text-gray-400 hover:text-gray-600"
                                                    }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleDownloadExcel}
                                        disabled={isDownloading}
                                        className={`flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-lg active:scale-95 shrink-0 ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
                                    >
                                        {isDownloading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        )}
                                        {isDownloading ? '준비 중...' : '엑셀 다운로드'}
                                    </button>
                                </div>
                            </div>

                            {/* Row 2: 전체 드롭다운 필터 (좌측) + 엑셀 업데이트 (우측) */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* 1. 가입상품 필터 */}
                                    <select
                                        value={productFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProductFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">가입상품 전체</option>
                                        {filterOptions.products.map((p: any) => <option key={p} value={p}>{p}</option>)}
                                    </select>

                                    {/* 2. 파트너사명 (본사어드민 또는 하위 파트너가 있는 상위 파트너만) */}
                                    {(isAdmin || (allowedCompanyNames && allowedCompanyNames.length > 1)) && (
                                        <select
                                            value={partnerFilter}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPartnerFilter(e.target.value)}
                                            className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                        >
                                            <option value="">파트너사 전체</option>
                                            {filterOptions.partners.map((p: string) => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    )}

                                    {/* 3. 가입상태 필터 */}
                                    <select
                                        value={statusFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">가입상태 전체</option>
                                        {filterOptions.statuses.map((s: any) => <option key={s} value={s}>{s}</option>)}
                                    </select>

                                    {/* 4. 납입상태 필터 */}
                                    <select
                                        value={paymentStatusFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentStatusFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">납입상태 전체</option>
                                        {filterOptions.paymentStatuses.map((p: any) => <option key={p} value={p}>{p}</option>)}
                                    </select>

                                    {/* 5. 납입방법 필터 */}
                                    <select
                                        value={methodFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMethodFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">납입방법 전체</option>
                                        {filterOptions.methods.map((m: any) => <option key={m} value={m}>{m}</option>)}
                                    </select>

                                    {/* 6. 연체해결 필터 */}
                                    <select
                                        value={delinquencyFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDelinquencyFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">연체해결 전체</option>
                                        <option value="미해결">미해결</option>
                                        <option value="해결함">해결함</option>
                                    </select>

                                    {/* 7. 해약처리 필터 */}
                                    <select
                                        value={cancelFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCancelFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">해약처리 전체</option>
                                        {filterOptions.cancelStatuses.map((c: any) => <option key={c} value={c}>{c}</option>)}
                                    </select>

                                    {/* 8. 실납입회차 필터 */}
                                    <select
                                        value={paymentCountFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentCountFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">실납입회차 전체</option>
                                        {filterOptions.paymentCounts.map((cnt: any) => <option key={cnt} value={cnt}>{cnt}회</option>)}
                                    </select>

                                    {/* 8. 환수여부 필터 */}
                                    <select
                                        value={refundFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRefundFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">환수여부 전체</option>
                                        {REFUND_OPTIONS.map((r: string) => <option key={r} value={r}>{r}</option>)}
                                    </select>

                                    {/* 9. 부활여부 필터 */}
                                    <select
                                        value={revivalFilter}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRevivalFilter(e.target.value)}
                                        className="bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-sono-primary/20 outline-none"
                                    >
                                        <option value="">부활여부 전체</option>
                                        {REVIVAL_OPTIONS.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                    </select>

                                    {(productFilter || partnerFilter || statusFilter || paymentStatusFilter || methodFilter || cancelFilter || paymentCountFilter || refundFilter || revivalFilter || delinquencyFilter || activeStatFilter !== "all") && (
                                        <button
                                            onClick={() => {
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
                                            }}
                                            className="text-[10px] font-bold text-sono-primary hover:underline px-1"
                                        >
                                            필터 초기화
                                        </button>
                                    )}
                                </div>

                                {/* 엑셀 업데이트 날짜 표시 (필터 라인 우측) */}
                                {records && records.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 ml-auto">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">엑셀 업데이트</span>
                                        <span className="text-[11px] font-bold text-gray-600">
                                            {records[0].uploadedAt?.substring(0, 10) || "-"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full border border-gray-100 rounded-2xl">
                            <table className="min-w-full border-separate border-spacing-0 whitespace-nowrap">
                                <thead className="sticky top-0 z-50 bg-gray-100 shadow-md">
                                    <tr className="bg-gray-100">
                                        <th
                                            className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors"
                                            onClick={() => {
                                                if (sortField === "joinDate") {
                                                    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                                } else {
                                                    setSortField("joinDate");
                                                    setSortOrder("asc");
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                가입일자
                                                {sortField === "joinDate" ? (
                                                    sortOrder === "asc" ? (
                                                        <svg className="w-3 h-3 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                    )
                                                ) : (
                                                    <svg className="w-3 h-3 text-gray-400 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">파트너사명</th>
                                        <th
                                            className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors"
                                            onClick={() => {
                                                if (sortField === "customerName") {
                                                    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                                                } else {
                                                    setSortField("customerName");
                                                    setSortOrder("asc");
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                고객명
                                                {sortField === "customerName" ? (
                                                    sortOrder === "asc" ? (
                                                        <svg className="w-3 h-3 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                                                    ) : (
                                                        <svg className="w-3 h-3 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                                    )
                                                ) : (
                                                    <svg className="w-3 h-3 text-gray-400 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                                                )}
                                            </div>
                                        </th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">생년월일</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">휴대전화</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">가입상품</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">가입상태</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">납입상태</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">연체해결</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">납입방법</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">해약처리</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">실납입회차</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">이체일자</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">환수 여부</th>
                                        <th className="sticky top-0 z-50 bg-gray-100 px-3 py-3.5 text-[10px] font-black text-gray-600 text-center uppercase tracking-tighter border-b border-gray-200 shadow-sm">부활 여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={15} className="px-4 py-20 text-center text-gray-400 font-bold italic">조회된 데이터가 없습니다.</td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((r: any, i: number) => {
                                            const customerKey = `${r.displayCustomerName}_${r.birth}_${r.displayPhone}`;
                                            const groupBg = groupedData.groupColors[customerKey] || "";
                                            const groupCount = groupedData.counts[customerKey];
                                            const isDuplicate = groupCount > 1;

                                            let isFirstInGroup = false;
                                            let isLastInGroup = false;

                                            if (isDuplicate) {
                                                const prevRecord = i > 0 ? filteredRecords[i - 1] : null;
                                                const prevKey = prevRecord ? `${prevRecord.displayCustomerName}_${prevRecord.birth}_${prevRecord.displayPhone}` : null;
                                                isFirstInGroup = prevKey !== customerKey;

                                                const nextRecord = i < filteredRecords.length - 1 ? filteredRecords[i + 1] : null;
                                                const nextKey = nextRecord ? `${nextRecord.displayCustomerName}_${nextRecord.birth}_${nextRecord.displayPhone}` : null;
                                                isLastInGroup = nextKey !== customerKey;
                                            }

                                            return (
                                                <tr key={r._id || i} className={`hover:bg-gray-100/80 transition-colors group ${groupBg}`}>
                                                    <td className="px-3 py-4 text-[11px] text-gray-500 text-center border-b border-gray-50 relative">
                                                        <div className="flex items-center justify-center gap-1">
                                                            {isDuplicate && (
                                                                <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center">
                                                                    <div className={`w-[2px] bg-sono-primary/40 h-full relative
                                                                    ${isFirstInGroup ? "mt-4 h-[calc(100%-1rem)] rounded-t-full" : ""}
                                                                    ${isLastInGroup ? "mb-4 h-[calc(100%-1rem)] rounded-b-full" : ""}
                                                                `}>
                                                                        {isFirstInGroup && <div className="absolute top-0 left-0 w-2 h-[2px] bg-sono-primary/40"></div>}
                                                                        {isLastInGroup && <div className="absolute bottom-0 left-0 w-2 h-[2px] bg-sono-primary/40"></div>}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <span className={isDuplicate ? "ml-4" : ""}>{r.joinDate}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-xs font-bold text-sono-primary text-center border-b border-gray-50">{r.partnerName}</td>
                                                    <td className="px-3 py-4 text-sm font-black text-sono-dark text-center border-b border-gray-50">{r.displayCustomerName}</td>
                                                    <td className="px-3 py-4 text-[11px] text-gray-400 text-center border-b border-gray-50">{r.birth}</td>
                                                    <td className="px-3 py-4 text-[11px] font-medium text-gray-600 text-center border-b border-gray-50">{r.displayPhone}</td>
                                                    <td className="px-3 py-4 text-[11px] font-bold text-gray-700 text-center border-b border-gray-50">{r.productName}</td>
                                                    <td className="px-3 py-2.5 text-center border-b border-gray-50 align-middle">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm ${r.joinStatus.includes("정상")
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                : r.joinStatus.includes("해약") || r.joinStatus.includes("철회")
                                                                    ? "bg-gray-100 text-gray-500 border border-gray-200"
                                                                    : "bg-blue-50 text-blue-600 border border-blue-100"
                                                            }`}>
                                                            {r.joinStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center border-b border-gray-50 align-middle">
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black shadow-sm ${r.paymentStatus.includes("정상")
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                                : r.paymentStatus.includes("연체")
                                                                    ? "bg-red-50 text-red-600 border border-red-100"
                                                                    : r.paymentStatus.includes("해약")
                                                                        ? "bg-gray-100 text-gray-500 border border-gray-200"
                                                                        : "bg-gray-50 text-gray-500 border border-gray-200"
                                                            }`}>
                                                            {r.paymentStatus || "-"}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center border-b border-gray-50 align-middle">
                                                        <div className="flex flex-col items-center justify-center">
                                                            {r.paymentStatus.includes("연체") || r.paymentStatus.includes("미납") ? (
                                                                updatingMap[`${r._id}_delinquencyResolveStatus`] ? (
                                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-bold">
                                                                        <div className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
                                                                        <span>처리중</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <select
                                                                            value={r.delinquencyResolveStatus || "미해결"}
                                                                            onChange={(e) => handleStatusUpdate(r._id, "delinquencyResolveStatus", e.target.value)}
                                                                            className={`text-xs font-bold px-2 py-1 rounded-xl border outline-none cursor-pointer transition-all ${
                                                                                (r.delinquencyResolveStatus || "미해결") === "해결함"
                                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-black shadow-sm"
                                                                                    : "bg-amber-50 text-amber-700 border-amber-200 font-black shadow-sm"
                                                                            }`}
                                                                        >
                                                                            <option value="미해결">미해결</option>
                                                                            <option value="해결함">해결함</option>
                                                                        </select>
                                                                        {r.delinquencyResolveUpdatedAt && (
                                                                            <span className="text-[9px] font-bold text-gray-400 mt-0.5 leading-none">{r.delinquencyResolveUpdatedAt}</span>
                                                                        )}
                                                                    </>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-gray-400 font-bold">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-[11px] font-bold text-gray-500 text-center border-b border-gray-50 align-middle">{r.paymentMethod}</td>
                                                    <td className="px-3 py-2.5 text-[11px] text-red-400 text-center border-b border-gray-50 align-middle">{r.cancelStatus}</td>
                                                    <td className="px-3 py-2.5 text-xs font-black text-sono-dark text-center border-b border-gray-50 align-middle">{r.actualPaymentCount}회</td>
                                                    <td className="px-3 py-2.5 text-[11px] font-bold text-gray-600 text-center border-b border-gray-50 align-middle">{formatTransferDateForDisplay(r.transferDate)}</td>
                                                    <td className="px-3 py-2.5 text-center border-b border-gray-50 align-middle">
                                                        <div className="flex flex-col items-center justify-center">
                                                            {updatingMap[`${r._id}_refundStatus`] ? (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-xl border border-purple-200 text-xs font-bold">
                                                                    <div className="w-3.5 h-3.5 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                                                                    <span>처리중</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        value={r.refundStatus || "선택없음"}
                                                                        onChange={(e) => handleStatusUpdate(r._id, "refundStatus", e.target.value)}
                                                                        className={`text-xs font-bold px-2 py-1 rounded-xl border outline-none cursor-pointer transition-all ${
                                                                            r.refundStatus && r.refundStatus !== "선택없음"
                                                                                ? "bg-purple-50 text-purple-700 border-purple-200 font-black shadow-sm"
                                                                                : "bg-gray-50 text-gray-400 border-gray-200"
                                                                        }`}
                                                                    >
                                                                        {REFUND_OPTIONS.map((opt) => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                    {r.refundUpdatedAt && (
                                                                        <span className="text-[9px] font-bold text-gray-400 mt-0.5 leading-none">{r.refundUpdatedAt}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center border-b border-gray-50 align-middle">
                                                        <div className="flex flex-col items-center justify-center">
                                                            {updatingMap[`${r._id}_revivalStatus`] ? (
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 text-xs font-bold">
                                                                    <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                                                                    <span>처리중</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        value={r.revivalStatus || "선택없음"}
                                                                        onChange={(e) => handleStatusUpdate(r._id, "revivalStatus", e.target.value)}
                                                                        className={`text-xs font-bold px-2 py-1 rounded-xl border outline-none cursor-pointer transition-all ${
                                                                            r.revivalStatus === "부활완료"
                                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-black shadow-sm"
                                                                                : r.revivalStatus === "부활예정"
                                                                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-black shadow-sm"
                                                                                    : r.revivalStatus === "취소"
                                                                                        ? "bg-rose-50 text-rose-700 border-rose-200 font-black shadow-sm"
                                                                                        : "bg-gray-50 text-gray-400 border-gray-200"
                                                                        }`}
                                                                    >
                                                                        {REVIVAL_OPTIONS.map((opt) => (
                                                                            <option key={opt} value={opt}>{opt}</option>
                                                                        ))}
                                                                    </select>
                                                                    {r.revivalUpdatedAt && (
                                                                        <span className="text-[9px] font-bold text-gray-400 mt-0.5 leading-none">{r.revivalUpdatedAt}</span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
