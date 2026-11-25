"use client";

import { useState, useEffect } from "react";
import { Partner } from "@/lib/types";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface PartnerFormModalProps {
    partner?: Partner | null;
    initialData?: Partial<Partner>;
    requestId?: string;
    onClose: () => void;
    onSuccess: () => void;
    isAdmin?: boolean;
    mode?: "default" | "maeum";
}

export default function PartnerFormModal({
    partner,
    initialData,
    requestId,
    onClose,
    onSuccess,
    isAdmin = false,
    mode = "default",
}: PartnerFormModalProps) {
    const isEdit = !!partner;
    const [isLoading, setIsLoading] = useState(false);

    const careProducts = useQuery(api.careProducts.get);
    const allPartners = useQuery(api.partners.getAllPartners);

    const subPartnerCount =
        allPartners?.filter(
            (p) =>
                (partner?.partnerId && p.parentPartnerId === partner.partnerId) ||
                (partner?.loginId && p.parentPartnerId === partner.loginId)
        ).length || 0;

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<
        {
            partnerId: string;
            companyName: string;
            ceoName: string;
            sonoAuthCode?: string;
        }[]
    >([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        businessNumber: "",
        ceoName: "",
        managerName: "",
        managerPhone: "",
        managerEmail: "",
        inquiryPhone: "",
        shopUrl: "",
        shopType: "회원제 쇼핑몰",
        memberCount: "",
        partnerGroup: "전체 상품 판매",
        showLandingUrl: true,
        landingVisibility: {
            smartcare: mode !== "maeum",
            happy450: mode !== "maeum",
            maeum: mode === "maeum",
        },
        customUrl: "",
        logoUrl: "",
        logoText: "",
        landingTitle: "",
        pointInfo: "",
        loginId: "",
        loginPassword: "",
        status: "active" as "active" | "inactive" | "pending",
        parentPartnerId: "",
        parentPartnerName: "",
        role: "master" as "master" | "tm",
        sonoAuthCode: "",
        affiliation: "",
        employeeNumber: "",
        departmentName: "",
    });

    useEffect(() => {
        if (partner) {
            setFormData({
                companyName: partner.companyName || "",
                businessNumber: partner.businessNumber || "",
                ceoName: partner.ceoName || "",
                managerName: partner.managerName || "",
                managerPhone: formatPhoneNumber(partner.managerPhone || ""),
                managerEmail: partner.managerEmail || "",
                inquiryPhone: formatPhoneNumber(
                    partner.inquiryPhone || partner.managerPhone || ""
                ),
                shopUrl: partner.shopUrl || "",
                shopType: partner.shopType || "회원제 쇼핑몰",
                memberCount: partner.memberCount || "",
                partnerGroup: partner.partnerGroup || "전체 상품 판매",
                showLandingUrl:
                    partner.showLandingUrl !== undefined
                        ? partner.showLandingUrl
                        : true,
                landingVisibility: {
                    smartcare:
                        partner.landingVisibility?.smartcare !== undefined
                            ? partner.landingVisibility.smartcare
                            : partner.showLandingUrl !== false,
                    happy450:
                        partner.landingVisibility?.happy450 !== undefined
                            ? partner.landingVisibility.happy450
                            : partner.showLandingUrl !== false,
                    maeum:
                        partner.landingVisibility?.maeum !== undefined
                            ? partner.landingVisibility.maeum
                            : false,
                },
                customUrl: partner.customUrl || "",
                logoUrl: partner.logoUrl || "",
                logoText: partner.logoText || "",
                landingTitle: partner.landingTitle || "",
                pointInfo: partner.pointInfo || "",
                loginId: partner.loginId || "",
                loginPassword: partner.loginPassword || "",
                status: partner.status || "active",
                parentPartnerId: partner.parentPartnerId || "",
                parentPartnerName: partner.parentPartnerName || "",
                role: (partner.role || "master") as "master" | "tm",
                sonoAuthCode: partner.sonoAuthCode || "",
                affiliation: partner.affiliation || "",
                employeeNumber: partner.employeeNumber || "",
                departmentName: partner.departmentName || "",
            });
        } else if (initialData) {
            setFormData((prev) => ({
                ...prev,
                ...initialData,
                showLandingUrl:
                    initialData.showLandingUrl !== undefined
                        ? initialData.showLandingUrl
                        : true,
                landingVisibility: {
                    smartcare:
                        initialData.landingVisibility?.smartcare !== undefined
                            ? initialData.landingVisibility.smartcare
                            : initialData.showLandingUrl !== false,
                    happy450:
                        initialData.landingVisibility?.happy450 !== undefined
                            ? initialData.landingVisibility.happy450
                            : initialData.showLandingUrl !== false,
                    maeum:
                        initialData.landingVisibility?.maeum !== undefined
                            ? initialData.landingVisibility.maeum
                            : false,
                },
                status: "active",
                role: (initialData.role || "master") as "master" | "tm",
                sonoAuthCode: initialData.sonoAuthCode || "",
                affiliation: initialData.affiliation || "",
                employeeNumber: initialData.employeeNumber || "",
                departmentName: initialData.departmentName || "",
            }));
        }
    }, [partner, initialData]);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(
                `/api/partners/search?q=${encodeURIComponent(val)}`
            );
            const data = await res.json();
            if (data.success) {
                const results = isEdit
                    ? data.results.filter(
                          (p: any) => p.partnerId !== partner.partnerId
                      )
                    : data.results;
                setSearchResults(results);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectParent = (p: {
        partnerId: string;
        companyName: string;
        sonoAuthCode?: string;
    }) => {
        const parentRecord = allPartners?.find(
            (item) => item.partnerId === p.partnerId || item.loginId === p.partnerId
        );
        const parentCode = parentRecord?.sonoAuthCode || p.sonoAuthCode || "";

        setFormData((prev) => ({
            ...prev,
            parentPartnerId: p.partnerId,
            parentPartnerName: p.companyName,
            sonoAuthCode: parentCode || prev.sonoAuthCode,
        }));
        setSearchTerm("");
        setSearchResults([]);
    };

    useEffect(() => {
        if (formData.parentPartnerId && !formData.sonoAuthCode && allPartners) {
            const parent = allPartners.find(
                (item) =>
                    item.partnerId === formData.parentPartnerId ||
                    item.loginId === formData.parentPartnerId
            );
            if (parent?.sonoAuthCode) {
                setFormData((prev) => ({
                    ...prev,
                    sonoAuthCode: parent.sonoAuthCode || "",
                }));
            }
        }
    }, [formData.parentPartnerId, allPartners]);

    const clearParent = () => {
        setFormData((prev) => ({
            ...prev,
            parentPartnerId: "",
            parentPartnerName: "",
        }));
        setSearchTerm("");
    };

    const formatPhone = (val: string) => formatPhoneNumber(val);

    const handleToggleLanding = (key: "smartcare" | "happy450" | "maeum") => {
        setFormData((prev) => {
            const currentLv = prev.landingVisibility || {
                smartcare: true,
                happy450: true,
                maeum: true,
            };
            const nextLv = {
                ...currentLv,
                [key]: !currentLv[key],
            };
            const hasAny = !!(nextLv.smartcare || nextLv.happy450 || nextLv.maeum);
            return {
                ...prev,
                landingVisibility: nextLv,
                showLandingUrl: hasAny,
            };
        });
    };

    const handleSetAllLandings = (visible: boolean) => {
        setFormData((prev) => ({
            ...prev,
            showLandingUrl: visible,
            landingVisibility: {
                smartcare: visible,
                happy450: visible,
                maeum: visible,
            },
        }));
    };

    const handleDelete = async () => {
        if (
            !partner ||
            !confirm("정말 이 파트너를 삭제하시겠습니까? 복구할 수 없습니다.")
        )
            return;
        setIsLoading(true);
        try {
            const res = await fetch(
                `/api/admin/partners?id=${partner.partnerId}`,
                { method: "DELETE" }
            );
            const data = await res.json();
            if (data.success) {
                alert("삭제되었습니다.");
                onSuccess();
            } else {
                alert(data.message || "삭제 실패");
            }
        } catch (e) {
            console.error(e);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleHold = async () => {
        if (!requestId) return;
        if (!confirm("해당 입점신청을 보류 처리하시겠습니까?")) return;
        setIsLoading(true);

        try {
            const response = await fetch("/api/admin/partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "hold",
                    requestId: requestId,
                    approvedBy: "admin",
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert("보류 처리되었습니다.");
                onSuccess();
            } else {
                alert(data.message || "오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const method = isEdit ? "PUT" : "POST";
            const submitData = { ...formData };

            if (!isAdmin && isEdit && partner) {
                submitData.showLandingUrl =
                    partner.showLandingUrl !== undefined
                        ? partner.showLandingUrl
                        : true;
                submitData.landingVisibility = {
                    smartcare:
                        partner.landingVisibility?.smartcare !== undefined
                            ? partner.landingVisibility.smartcare
                            : true,
                    happy450:
                        partner.landingVisibility?.happy450 !== undefined
                            ? partner.landingVisibility.happy450
                            : true,
                    maeum:
                        partner.landingVisibility?.maeum !== undefined
                            ? partner.landingVisibility.maeum
                            : false,
                };
            }

            let body;

            if (isEdit) {
                body = { partnerId: partner.partnerId, ...submitData };
            } else if (requestId) {
                body = {
                    action: "approve",
                    requestId: requestId,
                    approvedBy: "admin",
                    partnerData: submitData,
                };
            } else {
                body = { action: "register", partnerData: submitData };
            }

            const response = await fetch("/api/admin/partners", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (data.success) {
                alert(
                    isEdit
                        ? "수정되었습니다."
                        : requestId
                        ? "승인 처리되었습니다."
                        : "등록되었습니다."
                );
                onSuccess();
            } else {
                alert(data.message || "오류가 발생했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const lv = formData.landingVisibility || {
        smartcare: true,
        happy450: true,
        maeum: true,
    };
    const visibleCount =
        (lv.smartcare ? 1 : 0) + (lv.happy450 ? 1 : 0) + (lv.maeum ? 1 : 0);
    const landingOptions = [
        {
            key: "smartcare" as const,
            name: "스마트케어",
            badge: "가전 결합",
            price: "월 33,000원~",
            path: formData.customUrl
                ? `/${formData.customUrl}/smartcare`
                : "/products/smartcare",
            isVisible: !!lv.smartcare,
        },
        {
            key: "happy450" as const,
            name: "더 해피 450 ONE",
            badge: "일반 상조",
            price: "월 18,000원~",
            path: formData.customUrl
                ? `/${formData.customUrl}/happy450`
                : "/products/happy450",
            isVisible: !!lv.happy450,
        },
        {
            key: "maeum" as const,
            name: "마음든든",
            badge: "2·5·1 보장",
            price: "월 32,000원~",
            path: formData.customUrl
                ? `/${formData.customUrl}/maeum`
                : "/products/maeum",
            isVisible: !!lv.maeum,
        },
    ];

    return (
        <AdminDrawer
            title={
                isEdit
                    ? "파트너 정보 수정"
                    : requestId
                    ? "입점 신청 검토 및 승인"
                    : "파트너 신규 등록"
            }
            subtitle={
                isEdit
                    ? `${formData.companyName} (${
                          formData.loginId || partner?.partnerId || ""
                      })`
                    : "파트너 기본 정보, 권한 및 노출 상품을 설정합니다."
            }
            maxWidth="660px"
            zIndex={70}
            onClose={onClose}
            headerRight={
                isEdit && isAdmin && formData.loginId ? (
                    <a
                        href={`/partner-center?id=${formData.loginId}&k=${
                            process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ||
                            "sono_admin_master_pass_2026"
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn small sage"
                    >
                        <span>파트너 어드민</span>
                        <AdminIcon name="external" />
                    </a>
                ) : undefined
            }
            footer={
                <>
                    {isEdit && isAdmin && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="adm-btn danger mr-auto"
                        >
                            <AdminIcon name="trash" />
                            <span>삭제</span>
                        </button>
                    )}
                    {!isEdit && requestId && (
                        <button
                            type="button"
                            onClick={handleHold}
                            disabled={isLoading}
                            className="adm-btn mr-auto"
                        >
                            보류 처리
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="adm-btn">
                        취소
                    </button>
                    <button
                        type="submit"
                        form="partner-form-drawer"
                        disabled={isLoading}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="check" />
                        <span>
                            {isLoading
                                ? "처리 중..."
                                : isEdit
                                ? "정보 수정 완료"
                                : requestId
                                ? "승인 처리"
                                : "파트너 등록 완료"}
                        </span>
                    </button>
                </>
            }
        >
            <form id="partner-form-drawer" onSubmit={handleSubmit}>
                {/* 1. 기본 정보 */}
                <h3 className="adm-section-label !mt-0">
                    <span>기본 정보</span>
                </h3>
                <div className="adm-field-grid">
                    <label className="adm-field">
                        <span>업체명 *</span>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    companyName: e.target.value,
                                })
                            }
                            className="adm-input w-full font-semibold"
                            placeholder="㈜소노컴퍼니"
                        />
                    </label>
                    <label className="adm-field">
                        <span>사업자번호</span>
                        <input
                            type="text"
                            value={formData.businessNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    businessNumber: e.target.value,
                                })
                            }
                            className="adm-input w-full tabular-nums"
                            placeholder="000-00-00000"
                        />
                    </label>
                </div>

                {/* 2. 상위 파트너 설정 */}
                <h3 className="adm-section-label">
                    <span>상위 파트너 소속</span>
                    <span className="text-[11px] font-normal text-[#788699]">
                        미선택 시 최상위(Master) 파트너로 지정
                    </span>
                </h3>
                <div className="adm-note-card">
                    {formData.parentPartnerId ? (
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <span className="adm-pill teal mb-1">상위 파트너</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <strong className="text-sm font-bold text-[#162438]">
                                        {formData.parentPartnerName}
                                    </strong>
                                    <span className="text-xs font-mono text-[#788699]">
                                        ({formData.parentPartnerId})
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={clearParent}
                                className="adm-btn small danger"
                            >
                                해제 / 변경
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <label className="adm-search-field w-full">
                                <AdminIcon name="search" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="상위 파트너사명 또는 ID 검색..."
                                    className="!w-full"
                                />
                                {isSearching && (
                                    <span className="w-4 h-4 border-2 border-[#163a6b] border-t-transparent rounded-full animate-spin shrink-0" />
                                )}
                            </label>

                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#dce4f0] rounded-[9px] shadow-lg overflow-hidden z-20 max-h-48 overflow-y-auto">
                                    {searchResults.map((p) => (
                                        <button
                                            key={p.partnerId}
                                            type="button"
                                            onClick={() => selectParent(p)}
                                            className="w-full text-left px-3.5 py-2.5 hover:bg-[#f4f6fa] border-b border-[#eaeff7] last:border-none flex justify-between items-center cursor-pointer bg-white"
                                        >
                                            <div>
                                                <div className="font-bold text-[#162438] text-xs">
                                                    {p.companyName}
                                                </div>
                                                <div className="text-[11px] text-[#788699] font-mono">
                                                    {p.partnerId} · {p.ceoName}
                                                </div>
                                            </div>
                                            <span className="adm-pill green">선택</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 3. 담당자 및 상담 번호 */}
                <h3 className="adm-section-label">
                    <span>담당자 · 상담 대표번호</span>
                </h3>
                <div className="adm-field-grid">
                    <label className="adm-field">
                        <span>담당자 성함 *</span>
                        <input
                            type="text"
                            required
                            value={formData.managerName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    managerName: e.target.value,
                                })
                            }
                            className="adm-input w-full"
                        />
                    </label>
                    <label className="adm-field">
                        <span>담당자 연락처 *</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={formData.managerPhone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    managerPhone: formatPhone(e.target.value),
                                })
                            }
                            className="adm-input w-full tabular-nums"
                            placeholder="010-0000-0000"
                        />
                    </label>
                    <div className="adm-field full">
                        <div className="flex items-center justify-between">
                            <span>상담 대표번호 (전용 랜딩 하단 상담바 연동)</span>
                            <span className="adm-pill green !py-0.5">랜딩페이지 연동</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.inquiryPhone}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    inquiryPhone: formatPhone(e.target.value),
                                })
                            }
                            className="adm-input w-full tabular-nums"
                            placeholder="미입력 시 담당자 연락처 자동 적용 (예: 1588-9999, 010-0000-0000)"
                        />
                        <small>
                            모바일 랜딩 하단에서 원클릭 전화·문자 상담으로 연결됩니다.
                        </small>
                    </div>
                </div>

                {/* 4. 서비스 · 랜딩 커스텀 설정 */}
                <h3 className="adm-section-label">
                    <span>전용 랜딩 · 브랜드 설정</span>
                </h3>
                <div className="adm-field-grid">
                    <div className="adm-field">
                        <span>커스텀 URL 경로 *</span>
                        <div className="flex gap-1.5">
                            <div className="relative flex-1 flex items-center">
                                <span className="absolute left-3 text-xs text-[#788699] font-mono">
                                    /p/
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={formData.customUrl}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            customUrl: e.target.value,
                                        })
                                    }
                                    className="adm-input w-full !pl-9 font-mono"
                                    placeholder="company"
                                />
                            </div>
                            {formData.customUrl && (
                                <a
                                    href={`/p/${formData.customUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="adm-btn sage !px-2.5"
                                    title="전용 랜딩 열기"
                                >
                                    <AdminIcon name="external" />
                                </a>
                            )}
                        </div>
                    </div>

                    <label className="adm-field">
                        <span>포인트 · 혜택 문구</span>
                        <input
                            type="text"
                            value={formData.pointInfo}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    pointInfo: e.target.value,
                                })
                            }
                            className="adm-input w-full"
                            placeholder="예: 45만 포인트 즉시 지급"
                        />
                    </label>

                    <label className="adm-field">
                        <span>랜딩 타이틀 표기 업체명</span>
                        <input
                            type="text"
                            value={formData.landingTitle}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    landingTitle: e.target.value,
                                })
                            }
                            className="adm-input w-full"
                            placeholder="공백 시 기본 업체명 표시"
                        />
                    </label>

                    <label className="adm-field">
                        <span>로고 텍스트 (대체 표기)</span>
                        <input
                            type="text"
                            value={formData.logoText}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    logoText: e.target.value,
                                })
                            }
                            className="adm-input w-full"
                            placeholder="로고 이미지 없을 때 표시할 텍스트"
                        />
                    </label>

                    <label className="adm-field full">
                        <span>로고 이미지 URL</span>
                        <input
                            type="text"
                            value={formData.logoUrl}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    logoUrl: e.target.value,
                                })
                            }
                            className="adm-input w-full font-mono"
                            placeholder="https://..."
                        />
                    </label>
                </div>

                {/* 5. 판매상품 설정 */}
                <h3 className="adm-section-label">
                    <span>판매 허용 상품 설정</span>
                    {isAdmin && (
                        <div className="inline-flex gap-1.5">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        partnerGroup: "전체 상품 판매",
                                    })
                                }
                                className={`adm-btn small !py-1 !px-2 !min-h-[25px] ${
                                    formData.partnerGroup === "전체 상품 판매"
                                        ? "primary"
                                        : ""
                                }`}
                            >
                                전체 허용
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        partnerGroup: "결합 상품 판매",
                                    })
                                }
                                className={`adm-btn small !py-1 !px-2 !min-h-[25px] ${
                                    formData.partnerGroup === "결합 상품 판매"
                                        ? "primary"
                                        : ""
                                }`}
                            >
                                결합상품만
                            </button>
                        </div>
                    )}
                </h3>
                <div className="adm-note-card space-y-2 max-h-56 overflow-y-auto">
                    {careProducts && careProducts.length > 0 ? (
                        careProducts.map((p) => {
                            const isAll =
                                formData.partnerGroup === "전체 상품 판매" ||
                                !formData.partnerGroup;
                            const isCombOnly =
                                formData.partnerGroup === "결합 상품 판매";

                            const isSelected = isAll
                                ? true
                                : isCombOnly
                                ? p.productType !== "standard"
                                : formData.partnerGroup.includes(p.name);

                            const toggleProduct = () => {
                                if (!isAdmin) return;
                                let currentSelectedNames: string[] = [];

                                if (isAll) {
                                    currentSelectedNames = careProducts.map(
                                        (cp) => cp.name
                                    );
                                } else if (isCombOnly) {
                                    currentSelectedNames = careProducts
                                        .filter(
                                            (cp) => cp.productType !== "standard"
                                        )
                                        .map((cp) => cp.name);
                                } else {
                                    currentSelectedNames = formData.partnerGroup
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean);
                                }

                                if (isSelected) {
                                    currentSelectedNames =
                                        currentSelectedNames.filter(
                                            (name) => name !== p.name
                                        );
                                } else {
                                    currentSelectedNames.push(p.name);
                                }

                                if (
                                    currentSelectedNames.length ===
                                    careProducts.length
                                ) {
                                    setFormData({
                                        ...formData,
                                        partnerGroup: "전체 상품 판매",
                                    });
                                } else if (currentSelectedNames.length === 0) {
                                    setFormData({
                                        ...formData,
                                        partnerGroup: "선택 상품 없음",
                                    });
                                } else {
                                    setFormData({
                                        ...formData,
                                        partnerGroup:
                                            currentSelectedNames.join(", "),
                                    });
                                }
                            };

                            return (
                                <div
                                    key={p._id}
                                    onClick={toggleProduct}
                                    className={`flex items-center justify-between p-2.5 rounded-[8px] border transition-all cursor-pointer ${
                                        isSelected
                                            ? "bg-white border-[#b7cbb5]"
                                            : "bg-[#f2f4ee] border-transparent opacity-65"
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <input
                                            type="checkbox"
                                            disabled={!isAdmin}
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className="w-3.5 h-3.5 cursor-pointer"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <strong className="text-xs text-[#162438]">
                                                    {p.name}
                                                </strong>
                                                <span
                                                    className={`adm-pill !py-0.5 !px-1.5 !text-[9.5px] ${
                                                        p.productType === "standard"
                                                            ? "orange"
                                                            : "blue"
                                                    }`}
                                                >
                                                    {p.productType === "standard"
                                                        ? "일반상품"
                                                        : "결합상품"}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-[#788699] mt-0.5">
                                                {p.slotCount}구좌 · 월{" "}
                                                {(
                                                    p.monthlyPayment || 0
                                                ).toLocaleString()}
                                                원
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`adm-pill ${
                                            isSelected ? "green" : "gray"
                                        }`}
                                    >
                                        {isSelected ? "판매 허용" : "미선택"}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-xs text-center text-[#788699] py-4">
                            등록된 상품이 없습니다.
                        </div>
                    )}
                </div>

                {/* 6. 공식 상품 대표 연결 URL 노출 설정 (어드민 전용) */}
                {isAdmin && (
                    <>
                        <h3 className="adm-section-label">
                            <span>대시보드 공식 상품 URL 카드 노출</span>
                            <div className="inline-flex gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => handleSetAllLandings(true)}
                                    className={`adm-btn small !py-1 !px-2 !min-h-[25px] ${
                                        visibleCount === 3 ? "primary" : ""
                                    }`}
                                >
                                    전체 노출
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSetAllLandings(false)}
                                    className={`adm-btn small !py-1 !px-2 !min-h-[25px] ${
                                        visibleCount === 0 ? "danger" : ""
                                    }`}
                                >
                                    전체 숨김
                                </button>
                            </div>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {landingOptions.map((item) => (
                                <div
                                    key={item.key}
                                    onClick={() => handleToggleLanding(item.key)}
                                    className={`p-3 rounded-[9px] border transition-all cursor-pointer flex flex-col justify-between ${
                                        item.isVisible
                                            ? "bg-white border-[#163a6b]"
                                            : "bg-[#f4f6f1] border-[#e1e7f0] opacity-65"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="adm-pill gray !text-[9.5px]">
                                                {item.badge}
                                            </span>
                                            <span
                                                className={`adm-pill !text-[9.5px] ${
                                                    item.isVisible ? "green" : "gray"
                                                }`}
                                            >
                                                {item.isVisible ? "노출중" : "숨김"}
                                            </span>
                                        </div>
                                        <strong className="text-xs text-[#162438] block">
                                            {item.name}
                                        </strong>
                                        <small className="text-[10.5px] font-mono text-[#788699] block truncate mt-0.5">
                                            {item.path}
                                        </small>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-[#eaeff7] flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-[#163a6b]">
                                            {item.price}
                                        </span>
                                        <span className="text-[10.5px] font-semibold text-[#475870]">
                                            {item.isVisible ? "✓ 선택됨" : "클릭하여 켜기"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 7. 소노접수 연동 설정 */}
                <h3 className="adm-section-label">
                    <span>소노접수 연동 설정 (THEHAPPYONE)</span>
                    <span className="adm-pill teal">자동 접수 API</span>
                </h3>
                <div className="adm-note-card space-y-2">
                    <div className="adm-field">
                        <div className="flex items-center justify-between">
                            <span>소노접수 웹 인증코드 (authCd)</span>
                            <span className="text-[11px] text-[#163a6b] font-mono">
                                기본값: BIZI0011
                            </span>
                        </div>
                        <input
                            type="text"
                            value={formData.sonoAuthCode}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sonoAuthCode: e.target.value,
                                })
                            }
                            className="adm-input w-full font-mono font-bold"
                            placeholder="예: BIZI0011 (미입력 시 기본값 또는 상위 파트너 설정값 상속)"
                        />
                        <small>
                            상위 파트너에 인증코드를 설정해두면 산하 하위 파트너 고객 접수 시에도 자동 상속됩니다.
                            {subPartnerCount > 0
                                ? ` (현재 산하 하위 파트너 ${subPartnerCount}개 등록됨)`
                                : ""}
                        </small>
                    </div>
                </div>

                {/* 8. 계정 및 권한 설정 */}
                <h3 className="adm-section-label">
                    <span>마음든든 파트너 정보 (전자계약서 반영)</span>
                </h3>
                <div className="adm-field-grid">
                    <label className="adm-field">
                        <span>소속</span>
                        <input
                            type="text"
                            value={formData.affiliation}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    affiliation: e.target.value,
                                })
                            }
                            className="adm-input"
                            placeholder="예: 소노영업본부"
                        />
                    </label>
                    <label className="adm-field">
                        <span>사원번호</span>
                        <input
                            type="text"
                            value={formData.employeeNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    employeeNumber: e.target.value,
                                })
                            }
                            className="adm-input font-mono"
                            placeholder="예: EMP-001"
                        />
                    </label>
                    <label className="adm-field">
                        <span>부서(팀)명</span>
                        <input
                            type="text"
                            value={formData.departmentName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    departmentName: e.target.value,
                                })
                            }
                            className="adm-input"
                            placeholder="예: 영업1팀"
                        />
                    </label>
                </div>

                {/* 8. 계정 및 권한 설정 */}
                <h3 className="adm-section-label">
                    <span>계정 · 권한 설정</span>
                </h3>
                <div className="adm-field-grid">
                    <label className="adm-field">
                        <span>로그인 ID *</span>
                        <input
                            type="text"
                            required
                            value={formData.loginId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    loginId: e.target.value,
                                })
                            }
                            className="adm-input w-full font-mono font-semibold"
                        />
                    </label>
                    <label className="adm-field">
                        <span>로그인 비밀번호 {isEdit ? "" : "*"}</span>
                        <input
                            type="password"
                            required={!isEdit}
                            value={formData.loginPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    loginPassword: e.target.value,
                                })
                            }
                            className="adm-input w-full"
                            placeholder={isEdit ? "변경 시에만 입력" : "비밀번호 입력"}
                        />
                    </label>
                    <label className="adm-field">
                        <span>계정 상태</span>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value as any,
                                })
                            }
                            className="adm-select w-full"
                        >
                            <option value="active">정상 운영 (Active)</option>
                            <option value="inactive">사용 중지 (Inactive)</option>
                        </select>
                    </label>
                    <label className="adm-field">
                        <span>권한 등급 (Role)</span>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value as any,
                                })
                            }
                            className="adm-select w-full"
                        >
                            <option value="master">마스터 파트너 (Master)</option>
                            <option value="tm">TM 상담원 (TM)</option>
                        </select>
                    </label>
                </div>
            </form>
        </AdminDrawer>
    );
}
