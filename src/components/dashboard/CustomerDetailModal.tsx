"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application, ApplicationStatus } from "@/lib/types";
import { getStatusBadgeProps } from "@/lib/statusUtils";
import { formatDateTime } from "@/lib/dateUtils";
import RecordingModal from "./RecordingModal";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";
import {
    downloadFileWithCustomName,
    generateRecordingDownloadFileName,
    formatBytes,
} from "@/lib/downloadUtils";

interface CustomerDetailModalProps {
    application: Application;
    onClose: () => void;
    onUpdate: () => void;
    isAdmin?: boolean;
    partnerLoginId?: string;
    currentUserRole?: string;
    mode?: "default" | "maeum";
}

const MAEUM_PRODUCT_OPTIONS = [
    "마음든든3",
    "마음든든4",
    "마음든든5",
    "마음든든(광고) 3",
    "마음든든(광고) 4",
    "마음든든(광고) 5",
];

function normalizeInitialProductType(raw?: string): string {
    if (!raw) return "happy450";
    const trimmed = raw.trim();
    if (/^마음든든\s*[345]$/.test(trimmed)) {
        return trimmed.replace(/\s+/g, "");
    }
    if (/^마음든든\(광고\)\s*[345]$/.test(trimmed)) {
        return trimmed.replace(/^마음든든\(광고\)\s*([345])$/, "마음든든(광고) $1");
    }
    return raw;
}

export default function CustomerDetailModal({
    application,
    onClose,
    onUpdate,
    isAdmin = false,
    partnerLoginId,
    currentUserRole = "master",
    mode = "default",
}: CustomerDetailModalProps) {
    const updateDetails = useMutation(api.applications.updateApplicationDetails);
    const dbStatuses = useQuery(api.applicationStatuses.getStatuses);
    const statusHistory = useQuery(api.applications.getStatusHistory, {
        applicationNo: application.applicationNo,
    });
    const recordings = useQuery(api.recordings.getRecordingsByApplication, {
        applicationNo: application.applicationNo,
    });
    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [drawerTab, setDrawerTab] = useState<"info" | "history" | "files">("info");

    const careProductsData = useQuery(api.careProducts.get);
    const productsData = useQuery(api.products.get);
    const partnersData = useQuery(api.partners.getAllPartners);

    const [selectedPartnerId, setSelectedPartnerId] = useState(
        application.partnerId || ""
    );
    const [selectedPartnerName, setSelectedPartnerName] = useState(
        application.partnerName || ""
    );
    const [accessPath, setAccessPath] = useState(application.accessPath || "H");
    const [partnerMemberId, setPartnerMemberId] = useState(
        application.partnerMemberId || ""
    );

    const customerPartner = useMemo(() => {
        if (!partnersData) return null;
        return partnersData.find(
            (p) =>
                p.partnerId === selectedPartnerId ||
                p.companyName === selectedPartnerName ||
                p.loginId === partnerLoginId
        );
    }, [partnersData, selectedPartnerId, selectedPartnerName, partnerLoginId]);

    const parentPartner = useMemo(() => {
        if (!customerPartner || !partnersData) return null;
        const parentId = customerPartner.parentPartnerId?.trim();
        const parentName = customerPartner.parentPartnerName?.trim();
        if (!parentId && !parentName) return null;
        if (parentId === "admin" || parentId === "") return null;
        const parent = partnersData.find(
            (p) =>
                (parentId &&
                    (p.partnerId === parentId ||
                        p.loginId?.toLowerCase() === parentId.toLowerCase() ||
                        p.customUrl?.toLowerCase() === parentId.toLowerCase())) ||
                (parentName && p.companyName?.trim() === parentName)
        );
        return {
            name: parent?.companyName || parentName || parentId,
            loginId:
                parent?.loginId ||
                (parentId && parentId !== parentName ? parentId : ""),
        };
    }, [customerPartner, partnersData]);

    const allowedCareProducts = useMemo(() => {
        if (!careProductsData || careProductsData.length === 0) return [];
        const pGroup = customerPartner?.partnerGroup || "전체 상품 판매";

        if (pGroup === "전체 상품 판매" || !pGroup.trim()) {
            return careProductsData;
        }
        if (pGroup === "결합 상품 판매") {
            return careProductsData.filter(
                (cp) => cp.productType === "combination" || cp.name.includes("스마트")
            );
        }
        const selectedNames = pGroup
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);

        return careProductsData.filter((item) => {
            return selectedNames.some((name: string) => {
                if (item.name === name) return true;
                if (name === "더해피450" || name === "더 해피 450 ONE") {
                    return (
                        item.name === "더해피450 ONE" || item.name === "더 해피 450 ONE"
                    );
                }
                if (name === "스마트케어4" || name === "스마트케어 4") {
                    return item.name.includes("4더블") || item.name === "스마트케어4";
                }
                if (name === "스마트케어5" || name === "스마트케어 5") {
                    return (
                        item.name === "스마트케어 5" ||
                        item.name.includes("5더블") ||
                        item.name.includes("트리플") ||
                        item.name.includes("쿼드")
                    );
                }
                return false;
            });
        });
    }, [careProductsData, customerPartner]);

    const getStatusBadge = (status: string) => {
        return getStatusBadgeProps(status, dbStatuses);
    };

    const getDisplayStatus = (statusVal: string) => {
        if (
            currentUserRole === "tm" &&
            (statusVal === "정산예정" || statusVal === "정산완료")
        ) {
            return "정상가입";
        }
        return statusVal || "접수대기";
    };

    const formatDate = (val: string | undefined | number) => {
        if (!val || val === "-") return "";

        const serial = typeof val === "number" ? val : parseFloat(String(val));
        if (!isNaN(serial) && serial > 30000 && serial < 60000) {
            const date = new Date((serial - 25569) * 86400 * 1000);
            return date
                .toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .replace(/\. /g, "-")
                .replace(".", "");
        }

        try {
            const d = new Date(String(val));
            if (isNaN(d.getTime())) return String(val);
            return d
                .toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .replace(/\. /g, "-")
                .replace(".", "");
        } catch {
            return String(val);
        }
    };

    const getProductTypeLabel = (productType: string) => {
        const type = productType?.toLowerCase() || "";
        if (type === "happy450" || type.includes("해피") || type.includes("happy")) {
            return "더 해피 450 ONE";
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

    const formatHistoryDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const [status, setStatus] = useState<ApplicationStatus>(application.status);
    const [memo, setMemo] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // 결제/상담 정보
    const [firstPaymentDate, setFirstPaymentDate] = useState(
        formatDate(application.firstPaymentDate)
    );
    const [registrationDate, setRegistrationDate] = useState(
        formatDate(application.registrationDate)
    );
    const [paymentMethod, setPaymentMethod] = useState(
        application.paymentMethod || ""
    );
    const [cancellationProcessing, setCancellationProcessing] = useState(
        formatDate(application.cancellationProcessing)
    );
    const [withdrawalProcessing, setWithdrawalProcessing] = useState(
        formatDate(application.withdrawalProcessing)
    );
    const [remarks, setRemarks] = useState(application.remarks || "");

    // 고객 정보
    const [customerName, setCustomerName] = useState(application.customerName || "");
    const [customerPhone, setCustomerPhone] = useState(
        application.customerPhone || ""
    );
    const [customerBirth, setCustomerBirth] = useState(
        application.customerBirth || ""
    );
    const [customerGender, setCustomerGender] = useState(
        application.customerGender || ""
    );
    const [customerAddress, setCustomerAddress] = useState(
        application.customerAddress || ""
    );
    const [detailAddress, setDetailAddress] = useState("");

    // 신청 상품 정보
    const [productType, setProductType] = useState<string>(
        normalizeInitialProductType(application.productType)
    );
    const [products, setProducts] = useState(application.products || "");
    const rawPlanType = application.planType || "1구좌";
    const initialPlanType = rawPlanType.includes("구좌")
        ? rawPlanType
        : /^\d+$/.test(rawPlanType.trim())
        ? `${rawPlanType.trim()}구좌`
        : rawPlanType;
    const [planType, setPlanType] = useState(initialPlanType);
    const [inquiry, setInquiry] = useState(application.inquiry || "");
    const [preferredContactTime, setPreferredContactTime] = useState(
        application.preferredContactTime || ""
    );

    const currentCareProduct = useMemo(() => {
        if (!careProductsData) return null;
        return careProductsData.find(
            (cp) =>
                cp.name === productType ||
                (productType && productType.includes(cp.name))
        );
    }, [careProductsData, productType]);

    const availableAppliances = useMemo(() => {
        if (!productsData) return [];
        const visible = productsData.filter((p) => p.isVisible !== false);
        if (!currentCareProduct || currentCareProduct.productType === "standard") {
            return visible;
        }
        const matched = visible.filter(
            (p) => p.careProductId === currentCareProduct._id
        );
        if (matched.length > 0) return matched;
        return visible.filter(
            (p) => (p.slotCount || 4) === currentCareProduct.slotCount
        );
    }, [productsData, currentCareProduct]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleAddressSearch = () => {
        // @ts-ignore
        new window.daum.Postcode({
            oncomplete: function (data: any) {
                let addr = data.roadAddress;
                let extraAddr = "";

                if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
                    extraAddr += data.bname;
                }
                if (data.buildingName !== "" && data.apartment === "Y") {
                    extraAddr +=
                        extraAddr !== ""
                            ? ", " + data.buildingName
                            : data.buildingName;
                }
                if (extraAddr !== "") {
                    extraAddr = " (" + extraAddr + ")";
                }

                setCustomerAddress(addr + extraAddr);
                setDetailAddress("");
            },
        }).open();
    };

    const handleCopy = async (text: string) => {
        if (!text) {
            alert("복사할 내용이 없습니다.");
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            alert("복사되었습니다.");
        } catch (err) {
            console.error("복사에 실패했습니다.", err);
        }
    };

    const handleSaveAll = async () => {
        setIsLoading(true);
        try {
            const fullAddress = detailAddress.trim()
                ? `${customerAddress.trim()} ${detailAddress.trim()}`
                : customerAddress.trim();

            await updateDetails({
                applicationNo: application.applicationNo,
                updates: {
                    status,
                    memo,
                    firstPaymentDate,
                    registrationDate,
                    paymentMethod,
                    cancellationProcessing,
                    withdrawalProcessing,
                    remarks,
                    customerName,
                    customerPhone,
                    customerBirth,
                    customerGender,
                    customerAddress: fullAddress,
                    customerZipcode: "",
                    productType,
                    products,
                    planType,
                    inquiry,
                    preferredContactTime,
                    partnerId: selectedPartnerId,
                    partnerName: selectedPartnerName,
                    accessPath,
                    partnerMemberId,
                },
                changedBy: isAdmin ? "admin" : partnerLoginId || "unknown",
            });

            alert("수정사항이 저장되었습니다.");
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const defaultStatusOptions: string[] = [
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

    const rawStatusOptions = dbStatuses
        ? dbStatuses
              .filter((s) => isAdmin || s.isPartnerVisible)
              .map((s) => s.label)
        : defaultStatusOptions;

    const statusOptions =
        currentUserRole === "tm"
            ? rawStatusOptions.filter(
                  (opt) => opt !== "정산예정" && opt !== "정산완료"
              )
            : rawStatusOptions;

    const isRestrictedStatus =
        currentUserRole === "tm" &&
        (application.status === "정산예정" || application.status === "정산완료");
    const canPartnerEditStatus =
        !isAdmin && statusOptions.length > 0 && !isRestrictedStatus;

    const currentDisplayStatus = getDisplayStatus(status || application.status);
    const headerStatusBadge = getStatusBadge(currentDisplayStatus);
    const isStep2Done = !["접수대기", "접수", "대기"].includes(currentDisplayStatus);
    const isStep3Done = [
        "녹취완료(출금확인중)",
        "정상가입",
        "1회출금",
        "배송완료",
        "정산예정",
        "정산완료",
    ].includes(currentDisplayStatus);
    const isStep4Done = [
        "정상가입",
        "1회출금",
        "배송완료",
        "정산예정",
        "정산완료",
    ].includes(currentDisplayStatus);

    return (
        <>
            <AdminDrawer
                title="고객 상세"
                subtitle={`${application.applicationNo} · 접수 ${
                    formatDateTime(
                        application.createdAt,
                        (application as any)._creationTime
                    ) || "-"
                }`}
                maxWidth="610px"
                zIndex={65}
                onClose={onClose}
                tabs={[
                    { id: "info", label: "고객 · 상담 정보" },
                    {
                        id: "history",
                        label: "상담 이력",
                        badge: statusHistory?.length || 0,
                    },
                    {
                        id: "files",
                        label: "녹취 · 관리",
                        badge: recordings?.length || 0,
                    },
                ]}
                activeTab={drawerTab}
                onTabChange={(id) => setDrawerTab(id as any)}
                footerCaption="변경 사항 입력 후 우측 저장 버튼을 눌러 반영하세요."
                footer={
                    <>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="adm-btn"
                        >
                            닫기
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveAll}
                            disabled={isLoading}
                            className="adm-btn primary"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>저장 중...</span>
                                </>
                            ) : (
                                <>
                                    <AdminIcon name="check" />
                                    <span>수정사항 저장하기</span>
                                </>
                            )}
                        </button>
                    </>
                }
            >
                {/* 상단 고객 프로필 요약 */}
                <div className="flex items-center gap-3.5 mb-4">
                    <span className="w-11 h-11 rounded-full bg-[#eaf0e4] text-[#295e52] font-bold text-base grid place-items-center shrink-0">
                        {(customerName || application.customerName || "고").charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <strong className="text-base font-bold text-[#263d36] block truncate">
                            {customerName || application.customerName}
                        </strong>
                        <small className="text-xs text-[#86918a] block mt-0.5 truncate">
                            {customerPhone || application.customerPhone} ·{" "}
                            {getProductTypeLabel(productType)} ({planType})
                        </small>
                    </div>
                    <span
                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold shrink-0 ${headerStatusBadge.className}`}
                        style={headerStatusBadge.style}
                    >
                        {currentDisplayStatus}
                    </span>
                </div>

                {/* 단계 진행 플로우 바 */}
                <div className="adm-flow-mini mb-5">
                    <span className="done">
                        <AdminIcon name="check-circle" />
                        상담 접수
                    </span>
                    <span className={isStep2Done ? "done" : ""}>
                        <AdminIcon name="phone" />
                        상담 진행
                    </span>
                    <span className={isStep3Done ? "done" : ""}>
                        <AdminIcon name="mic" />
                        녹취 확인
                    </span>
                    <span className={isStep4Done ? "done" : ""}>
                        <AdminIcon name="shield" />
                        정상 가입
                    </span>
                </div>

                {drawerTab === "info" && (
                    <div>
                        {/* 1. 진행 상태 관리 카드 */}
                        <div className="adm-note-card mb-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[#295e52]">
                                    진행 상태 {isAdmin || canPartnerEditStatus ? "변경" : ""}
                                </span>
                                <span className="text-[11px] text-[#86918a]">
                                    상태 변경 시 상담 이력에 자동 기록됩니다
                                </span>
                            </div>

                            {isAdmin || canPartnerEditStatus ? (
                                <div className="space-y-2.5">
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value as ApplicationStatus)
                                        }
                                        className="adm-select w-full font-bold"
                                    >
                                        {!statusOptions.includes(status) && (
                                            <option value={status}>
                                                {getDisplayStatus(status)} (변경불가)
                                            </option>
                                        )}
                                        {statusOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                    <textarea
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        placeholder="상태 변경 메모 또는 상담 내용 요약 입력 (선택 사항)"
                                        className="adm-textarea w-full !min-h-[60px]"
                                    />
                                </div>
                            ) : (
                                <div className="pt-1">
                                    <span
                                        className={`px-2.5 py-1 rounded-[6px] text-xs font-bold ${headerStatusBadge.className}`}
                                        style={headerStatusBadge.style}
                                    >
                                        {getDisplayStatus(application.status)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 2. 고객 기본 정보 (2열 그리드) */}
                        <h3 className="adm-section-label">
                            <span>고객 기본 정보</span>
                            <span className="text-[11px] font-normal text-[#86918a]">
                                복사 버튼으로 연락처·성명을 빠르게 복사하세요
                            </span>
                        </h3>
                        <div className="adm-field-grid">
                            <div className="adm-field">
                                <div className="flex items-center justify-between">
                                    <span>고객명</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(customerName)}
                                        className="text-[10.5px] text-[#295e52] hover:underline inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
                                        title="고객명 복사"
                                    >
                                        <AdminIcon name="copy" className="!w-3 !h-3" />
                                        <span>복사</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="adm-input w-full font-semibold"
                                />
                            </div>

                            <div className="adm-field">
                                <div className="flex items-center justify-between">
                                    <span>연락처</span>
                                    <div className="inline-flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(customerPhone)}
                                            className="text-[10.5px] text-[#295e52] hover:underline inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
                                            title="연락처 전체 복사"
                                        >
                                            <AdminIcon name="copy" className="!w-3 !h-3" />
                                            <span>복사</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCopy(customerPhone.replace(/-/g, ""))
                                            }
                                            className="text-[10.5px] text-[#45554e] hover:text-[#295e52] hover:underline inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
                                            title="숫자만 복사"
                                        >
                                            <span>숫자만</span>
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                    className="adm-input w-full font-semibold tabular-nums"
                                />
                            </div>

                            <label className="adm-field">
                                <span>생년월일</span>
                                <input
                                    type="text"
                                    value={customerBirth}
                                    onChange={(e) => setCustomerBirth(e.target.value)}
                                    placeholder="YYMMDD"
                                    className="adm-input w-full tabular-nums"
                                />
                            </label>

                            <label className="adm-field">
                                <span>성별</span>
                                <select
                                    value={customerGender}
                                    onChange={(e) => setCustomerGender(e.target.value)}
                                    className="adm-select w-full"
                                >
                                    <option value="-">미지정</option>
                                    <option value="남성">남성</option>
                                    <option value="여성">여성</option>
                                </select>
                            </label>

                            <div className="adm-field full">
                                <span>기본 주소</span>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customerAddress}
                                        readOnly
                                        onClick={handleAddressSearch}
                                        placeholder="우측 주소 검색 버튼을 클릭하세요"
                                        className="adm-input flex-1 cursor-pointer"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddressSearch}
                                        className="adm-btn sage shrink-0"
                                    >
                                        <AdminIcon name="search" />
                                        <span>주소 검색</span>
                                    </button>
                                </div>
                            </div>

                            <label className="adm-field full">
                                <span>상세 주소</span>
                                <input
                                    type="text"
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    placeholder="추가 상세주소를 입력하세요 (저장 시 기본 주소에 병합)"
                                    className="adm-input w-full"
                                />
                            </label>
                        </div>

                        {/* 3. 신청 상품 · 상담 희망 정보 */}
                        <h3 className="adm-section-label">
                            <span>신청 상품 · 상담 정보</span>
                        </h3>
                        <div className="adm-field-grid">
                            <label className="adm-field">
                                <span>상품 유형</span>
                                <select
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                    className="adm-select w-full font-bold text-[#295e52]"
                                >
                                    {mode === "maeum" ? (
                                        <>
                                            {productType &&
                                                !MAEUM_PRODUCT_OPTIONS.includes(productType) && (
                                                    <option value={productType}>
                                                        {getProductTypeLabel(productType)}
                                                    </option>
                                                )}
                                            {MAEUM_PRODUCT_OPTIONS.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {productType &&
                                                !allowedCareProducts.some(
                                                    (cp) => cp.name === productType
                                                ) && (
                                                    <option value={productType}>
                                                        {getProductTypeLabel(productType)}
                                                    </option>
                                                )}
                                            {allowedCareProducts.map((cp) => (
                                                <option key={cp._id} value={cp.name}>
                                                    {cp.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </label>

                            <label className="adm-field">
                                <span>가입 구좌</span>
                                <select
                                    value={planType}
                                    onChange={(e) => setPlanType(e.target.value)}
                                    className="adm-select w-full font-semibold"
                                >
                                    {planType &&
                                        ![
                                            "1구좌",
                                            "2구좌",
                                            "3구좌",
                                            "4구좌",
                                            "1",
                                            "2",
                                            "3",
                                            "4",
                                        ].includes(planType) && (
                                            <option value={planType}>{planType}</option>
                                        )}
                                    {currentCareProduct?.productType === "standard" ? (
                                        <>
                                            <option value="1구좌">1구좌</option>
                                            <option value="2구좌">2구좌</option>
                                            <option value="3구좌">3구좌</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="1구좌">1구좌</option>
                                            <option value="2구좌">2구좌</option>
                                            <option value="3구좌">3구좌</option>
                                            <option value="4구좌">4구좌</option>
                                        </>
                                    )}
                                </select>
                            </label>

                            <div className="adm-field full">
                                <div className="flex items-center justify-between">
                                    <span>결합 가전제품</span>
                                    {products && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(products)}
                                            className="text-[10.5px] text-[#295e52] hover:underline inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer"
                                        >
                                            <AdminIcon name="copy" className="!w-3 !h-3" />
                                            <span>제품명 복사</span>
                                        </button>
                                    )}
                                </div>
                                {currentCareProduct?.productType === "combination" ||
                                (productType && productType.startsWith("스마트")) ? (
                                    <select
                                        value={products}
                                        onChange={(e) => setProducts(e.target.value)}
                                        className="adm-select w-full"
                                    >
                                        <option value="">
                                            -- 가전제품 선택 ({availableAppliances.length}
                                            개) --
                                        </option>
                                        {products &&
                                            !availableAppliances.some(
                                                (p) =>
                                                    `${
                                                        p.brand ? `[${p.brand}] ` : ""
                                                    }${p.name}` === products ||
                                                    p.name === products
                                            ) && (
                                                <option value={products}>
                                                    {products}
                                                </option>
                                            )}
                                        {availableAppliances.map((p) => {
                                            const label = `${
                                                p.brand ? `[${p.brand}] ` : ""
                                            }${p.name}${p.model ? ` (${p.model})` : ""}`;
                                            return (
                                                <option key={p._id} value={label}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={products}
                                        onChange={(e) => setProducts(e.target.value)}
                                        placeholder="결합 가전제품명 입력 (해당 시)"
                                        className="adm-input w-full"
                                    />
                                )}
                            </div>

                            <label className="adm-field">
                                <span>선호 통화시간</span>
                                <select
                                    value={preferredContactTime}
                                    onChange={(e) =>
                                        setPreferredContactTime(e.target.value)
                                    }
                                    className="adm-select w-full"
                                >
                                    <option value="">선택하세요</option>
                                    {preferredContactTime &&
                                        ![
                                            "10:00~11:00",
                                            "11:00~12:00",
                                            "14:00~15:00",
                                            "15:00~16:00",
                                            "16:00~17:00",
                                            "17:00~18:00",
                                        ].includes(preferredContactTime) && (
                                            <option value={preferredContactTime}>
                                                {preferredContactTime}
                                            </option>
                                        )}
                                    <option value="10:00~11:00">10:00~11:00</option>
                                    <option value="11:00~12:00">11:00~12:00</option>
                                    <option value="14:00~15:00">14:00~15:00</option>
                                    <option value="15:00~16:00">15:00~16:00</option>
                                    <option value="16:00~17:00">16:00~17:00</option>
                                    <option value="17:00~18:00">17:00~18:00</option>
                                </select>
                            </label>

                            <label className="adm-field">
                                <span>고객 문의사항</span>
                                <input
                                    type="text"
                                    value={inquiry}
                                    onChange={(e) => setInquiry(e.target.value)}
                                    placeholder="문의사항 메모"
                                    className="adm-input w-full"
                                />
                            </label>
                        </div>

                        {/* 4. 결제 · 계약 처리 정보 */}
                        <h3 className="adm-section-label">
                            <span>결제 · 계약 처리 정보</span>
                        </h3>
                        {isAdmin ? (
                            <div className="adm-field-grid">
                                <label className="adm-field">
                                    <span>신규등록일</span>
                                    <input
                                        type="date"
                                        value={registrationDate}
                                        onChange={(e) =>
                                            setRegistrationDate(e.target.value)
                                        }
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input w-full cursor-pointer"
                                    />
                                </label>

                                <label className="adm-field">
                                    <span>초회납입일</span>
                                    <input
                                        type="date"
                                        value={firstPaymentDate}
                                        onChange={(e) =>
                                            setFirstPaymentDate(e.target.value)
                                        }
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input w-full cursor-pointer"
                                    />
                                </label>

                                <label className="adm-field">
                                    <span>납입방법</span>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="adm-select w-full"
                                    >
                                        <option value="">선택하세요</option>
                                        <option value="신용카드">신용카드</option>
                                        <option value="계좌이체">계좌이체</option>
                                    </select>
                                </label>

                                <label className="adm-field">
                                    <span>해약처리일</span>
                                    <input
                                        type="date"
                                        value={cancellationProcessing}
                                        onChange={(e) =>
                                            setCancellationProcessing(e.target.value)
                                        }
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input w-full cursor-pointer"
                                    />
                                </label>

                                <label className="adm-field">
                                    <span>청약철회일</span>
                                    <input
                                        type="date"
                                        value={withdrawalProcessing}
                                        onChange={(e) =>
                                            setWithdrawalProcessing(e.target.value)
                                        }
                                        onClick={(e) => {
                                            try {
                                                e.currentTarget.showPicker?.();
                                            } catch {}
                                        }}
                                        className="adm-input w-full cursor-pointer"
                                    />
                                </label>

                                <label className="adm-field">
                                    <span>회원번호</span>
                                    <input
                                        type="text"
                                        value={partnerMemberId}
                                        onChange={(e) =>
                                            setPartnerMemberId(e.target.value)
                                        }
                                        placeholder="회원번호 입력"
                                        className="adm-input w-full"
                                    />
                                </label>

                                <label className="adm-field full">
                                    <span>비고 (사유)</span>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="계약 특이사항 또는 해약·철회 사유 등을 입력하세요"
                                        className="adm-textarea w-full !min-h-[68px]"
                                    />
                                </label>
                            </div>
                        ) : (
                            <dl className="adm-details-list">
                                <div>
                                    <dt>신규등록일</dt>
                                    <dd>{formatDate(application.registrationDate) || "-"}</dd>
                                </div>
                                <div>
                                    <dt>초회납입일</dt>
                                    <dd>{formatDate(application.firstPaymentDate) || "-"}</dd>
                                </div>
                                <div>
                                    <dt>납입방법</dt>
                                    <dd>{application.paymentMethod || "-"}</dd>
                                </div>
                                <div>
                                    <dt>해약 / 청약철회</dt>
                                    <dd>
                                        {formatDate(application.cancellationProcessing) ||
                                            formatDate(application.withdrawalProcessing) ||
                                            "-"}
                                    </dd>
                                </div>
                                <div className="col-span-2">
                                    <dt>비고 (사유)</dt>
                                    <dd>{application.remarks || "-"}</dd>
                                </div>
                            </dl>
                        )}

                        {/* 5. 파트너 · 유입 정보 */}
                        <h3 className="adm-section-label">
                            <span>파트너 · 유입 정보</span>
                        </h3>
                        {isAdmin ? (
                            <div className="space-y-3">
                                <div className="adm-field-grid">
                                    <label className="adm-field">
                                        <span>담당 파트너사</span>
                                        <select
                                            value={selectedPartnerId}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedPartnerId(val);
                                                const found = partnersData?.find(
                                                    (p) => p.partnerId === val
                                                );
                                                if (found) {
                                                    setSelectedPartnerName(
                                                        found.companyName
                                                    );
                                                } else {
                                                    setSelectedPartnerName(val);
                                                }
                                            }}
                                            className="adm-select w-full font-semibold"
                                        >
                                            {!partnersData?.some(
                                                (p) => p.partnerId === selectedPartnerId
                                            ) &&
                                                selectedPartnerId && (
                                                    <option value={selectedPartnerId}>
                                                        {selectedPartnerName ||
                                                            selectedPartnerId}
                                                    </option>
                                                )}
                                            {partnersData?.map((p) => (
                                                <option
                                                    key={p._id || p.partnerId}
                                                    value={p.partnerId}
                                                >
                                                    {p.companyName}{" "}
                                                    {p.loginId ? `(${p.loginId})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="adm-field">
                                        <span>접속 경로</span>
                                        <select
                                            value={accessPath}
                                            onChange={(e) => setAccessPath(e.target.value)}
                                            className="adm-select w-full"
                                        >
                                            <option value="H">홈페이지 유입 (H)</option>
                                            <option value="D">직접 등록 (D)</option>
                                        </select>
                                    </label>
                                </div>

                                <dl className="adm-details-list">
                                    <div>
                                        <dt>상위 파트너</dt>
                                        <dd>
                                            {parentPartner
                                                ? `${parentPartner.name}${
                                                      parentPartner.loginId
                                                          ? ` (${parentPartner.loginId})`
                                                          : ""
                                                  }`
                                                : "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>파트너 ID</dt>
                                        <dd className="font-mono">
                                            {customerPartner?.loginId ||
                                                selectedPartnerId ||
                                                "-"}
                                        </dd>
                                    </div>
                                    <div className="col-span-2">
                                        <dt>최초 신청일시</dt>
                                        <dd className="tabular-nums">
                                            {formatDateTime(
                                                application.createdAt,
                                                (application as any)._creationTime
                                            ) || "-"}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        ) : (
                            <dl className="adm-details-list">
                                <div>
                                    <dt>상위 파트너</dt>
                                    <dd>
                                        {parentPartner
                                            ? `${parentPartner.name}${
                                                  parentPartner.loginId
                                                      ? ` (${parentPartner.loginId})`
                                                      : ""
                                              }`
                                            : "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>담당 파트너사</dt>
                                    <dd>{application.partnerName}</dd>
                                </div>
                                <div>
                                    <dt>파트너 ID</dt>
                                    <dd className="font-mono">
                                        {partnerLoginId || application.partnerId}
                                    </dd>
                                </div>
                                <div>
                                    <dt>접속 경로</dt>
                                    <dd>
                                        {application.accessPath === "H"
                                            ? "홈페이지 (H)"
                                            : "직접등록 (D)"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>회원번호</dt>
                                    <dd>{application.partnerMemberId || "-"}</dd>
                                </div>
                                <div>
                                    <dt>신청일시</dt>
                                    <dd className="tabular-nums">
                                        {formatDateTime(
                                            application.createdAt,
                                            (application as any)._creationTime
                                        ) || "-"}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </div>
                )}

                {/* 상담 녹취 음성파일 탭 */}
                {drawerTab === "files" && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-1.5">
                                <AdminIcon name="mic" className="text-[#295e52]" />
                                <h3 className="text-sm font-bold text-[#295e52]">
                                    상담 녹취 음성파일 ({recordings?.length || 0}건)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRecordingModalOpen(true)}
                                className="adm-btn small primary"
                            >
                                <AdminIcon name="upload" />
                                <span>
                                    {recordings && recordings.length > 0
                                        ? "추가 / STT 관리"
                                        : "녹취 등록"}
                                </span>
                            </button>
                        </div>

                        {recordings === undefined ? (
                            <div className="text-xs text-[#86918a] py-6 text-center">
                                녹취 목록 확인 중...
                            </div>
                        ) : recordings.length === 0 ? (
                            <button
                                type="button"
                                onClick={() => setIsRecordingModalOpen(true)}
                                className="w-full border border-dashed border-[#cbd8c0] rounded-[11px] p-8 text-center text-[#7d8d73] hover:bg-[#f8faf5] transition-colors cursor-pointer"
                            >
                                <AdminIcon
                                    name="upload"
                                    className="mx-auto mb-2 !w-6 !h-6 text-[#7d8d73]"
                                />
                                <strong className="text-xs font-bold block text-[#263d36]">
                                    등록된 상담 녹취 파일이 없습니다
                                </strong>
                                <span className="text-[11px] text-[#86918a] block mt-1">
                                    클릭하여 음성파일(MP3, M4A, WAV) 업로드 및 STT 변환을 진행하세요.
                                </span>
                            </button>
                        ) : (
                            <div className="space-y-2.5">
                                {recordings.map((rec) => {
                                    const customFileName =
                                        generateRecordingDownloadFileName({
                                            uploadedAt: rec.uploadedAt,
                                            parentPartnerName: parentPartner?.name,
                                            partnerName: application.partnerName,
                                            customerName: application.customerName,
                                            customerPhone: application.customerPhone,
                                            duration: rec.duration,
                                            originalFileName: rec.fileName,
                                        });

                                    return (
                                        <div
                                            key={rec._id}
                                            className="adm-note-card space-y-2"
                                        >
                                            <div className="flex items-center justify-between text-xs gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <span
                                                        className="font-bold text-[#263d36] truncate max-w-[240px]"
                                                        title={customFileName}
                                                    >
                                                        {customFileName}
                                                    </span>
                                                    <span className="adm-pill gray !py-0.5 !px-1.5 !text-[10px]">
                                                        {formatBytes(rec.fileSize)}
                                                    </span>
                                                    {rec.duration && (
                                                        <span className="adm-pill green !py-0.5 !px-1.5 !text-[10px]">
                                                            {Math.floor(
                                                                rec.duration / 60
                                                            )}
                                                            분{" "}
                                                            {Math.floor(
                                                                rec.duration % 60
                                                            )}
                                                            초
                                                        </span>
                                                    )}
                                                </div>
                                                {rec.url && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            downloadFileWithCustomName(
                                                                rec.url!,
                                                                customFileName
                                                            )
                                                        }
                                                        className="adm-btn small !py-1 !px-2 !min-h-[26px]"
                                                        title={`다운로드: ${customFileName}`}
                                                    >
                                                        <AdminIcon name="download" />
                                                        <span>다운로드</span>
                                                    </button>
                                                )}
                                            </div>
                                            {rec.memo && (
                                                <p className="text-[11px] text-[#45554e] bg-white p-2 rounded-[7px] border border-[#e6eae3]">
                                                    {rec.memo}
                                                </p>
                                            )}
                                            {rec.url && (
                                                <audio
                                                    controls
                                                    preload="metadata"
                                                    src={rec.url}
                                                    className="w-full h-8"
                                                >
                                                    오디오 재생 미지원
                                                </audio>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 상태 변경 이력 탭 */}
                {drawerTab === "history" && (
                    <div>
                        <h3 className="adm-section-label !mt-0">
                            <span>상담 · 상태 변경 타임라인</span>
                        </h3>
                        <div className="space-y-3.5">
                            {statusHistory === undefined ? (
                                <div className="text-xs text-[#86918a] py-4">
                                    이력을 불러오는 중...
                                </div>
                            ) : statusHistory.length === 0 ? (
                                <div className="adm-note-card text-center py-6 text-xs text-[#86918a]">
                                    기록된 상태 변경 이력이 없습니다.
                                </div>
                            ) : (
                                <div className="relative pl-4 space-y-3.5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#dce3d6]">
                                    {statusHistory.map((history: any) => {
                                        const badge = getStatusBadge(
                                            getDisplayStatus(history.newStatus)
                                        );
                                        return (
                                            <div
                                                key={history.historyId}
                                                className="relative pl-2"
                                            >
                                                <div className="absolute -left-[15px] top-2 w-2.5 h-2.5 rounded-full bg-[#295e52] border-2 border-white" />
                                                <div className="adm-note-card">
                                                    <div className="flex justify-between items-center mb-1.5">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold ${badge.className}`}
                                                            style={badge.style}
                                                        >
                                                            {getDisplayStatus(
                                                                history.newStatus
                                                            )}
                                                        </span>
                                                        <span className="text-[10.5px] text-[#86918a] tabular-nums">
                                                            {formatHistoryDate(
                                                                history.changedAt
                                                            )}
                                                        </span>
                                                    </div>
                                                    {history.memo && (
                                                        <p className="text-xs text-[#263d36] mt-1.5 font-medium bg-white p-2.5 rounded-[7px] border border-[#e6eae3]">
                                                            {history.memo}
                                                        </p>
                                                    )}
                                                    <div className="mt-1.5 flex justify-end">
                                                        <span className="text-[10px] text-[#86918a]">
                                                            처리자: {history.changedBy}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminDrawer>

            {isRecordingModalOpen && (
                <RecordingModal
                    application={application}
                    parentPartnerName={parentPartner?.name}
                    onClose={() => setIsRecordingModalOpen(false)}
                    currentUserName={
                        isAdmin ? "총괄관리자" : partnerLoginId || "파트너"
                    }
                    isAdmin={isAdmin}
                />
            )}
        </>
    );
}
