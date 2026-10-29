"use client";

import { useState, useEffect } from "react";
import { Partner } from "@/lib/types";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface PartnerFormModalProps {
    partner?: Partner | null;
    initialData?: Partial<Partner>;
    requestId?: string;
    onClose: () => void;
    onSuccess: () => void;
    isAdmin?: boolean;
}

export default function PartnerFormModal({ partner, initialData, requestId, onClose, onSuccess, isAdmin = false }: PartnerFormModalProps) {
    const isEdit = !!partner;
    const [isLoading, setIsLoading] = useState(false);

    // careProducts query for 판매상품 설정
    const careProducts = useQuery(api.careProducts.get);
    const allPartners = useQuery(api.partners.getAllPartners);

    // 하위 파트너 수 계산
    const subPartnerCount = allPartners?.filter(p => 
        (partner?.partnerId && p.parentPartnerId === partner.partnerId) ||
        (partner?.loginId && p.parentPartnerId === partner.loginId)
    ).length || 0;

    // Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ partnerId: string, companyName: string, ceoName: string, sonoAuthCode?: string }[]>([]);
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
            smartcare: true,
            happy450: true,
            maeum: false,
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
        sonoAuthCode: ""
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
                inquiryPhone: formatPhoneNumber(partner.inquiryPhone || partner.managerPhone || ""),
                shopUrl: partner.shopUrl || "",
                shopType: partner.shopType || "회원제 쇼핑몰",
                memberCount: partner.memberCount || "",
                partnerGroup: partner.partnerGroup || "전체 상품 판매",
                showLandingUrl: partner.showLandingUrl !== undefined ? partner.showLandingUrl : true,
                landingVisibility: {
                    smartcare: partner.landingVisibility?.smartcare !== undefined 
                        ? partner.landingVisibility.smartcare 
                        : (partner.showLandingUrl !== false),
                    happy450: partner.landingVisibility?.happy450 !== undefined 
                        ? partner.landingVisibility.happy450 
                        : (partner.showLandingUrl !== false),
                    maeum: partner.landingVisibility?.maeum !== undefined 
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
                sonoAuthCode: partner.sonoAuthCode || ""
            });
        } else if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                showLandingUrl: initialData.showLandingUrl !== undefined ? initialData.showLandingUrl : true,
                landingVisibility: {
                    smartcare: initialData.landingVisibility?.smartcare !== undefined 
                        ? initialData.landingVisibility.smartcare 
                        : (initialData.showLandingUrl !== false),
                    happy450: initialData.landingVisibility?.happy450 !== undefined 
                        ? initialData.landingVisibility.happy450 
                        : (initialData.showLandingUrl !== false),
                    maeum: initialData.landingVisibility?.maeum !== undefined 
                        ? initialData.landingVisibility.maeum 
                        : false,
                },
                status: "active",
                role: (initialData.role || "master") as "master" | "tm",
                sonoAuthCode: initialData.sonoAuthCode || ""
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
            const res = await fetch(`/api/partners/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success) {
                const results = isEdit
                    ? data.results.filter((p: any) => p.partnerId !== partner.partnerId)
                    : data.results;
                setSearchResults(results);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectParent = (p: { partnerId: string, companyName: string, sonoAuthCode?: string }) => {
        const parentRecord = allPartners?.find(item => item.partnerId === p.partnerId || item.loginId === p.partnerId);
        const parentCode = parentRecord?.sonoAuthCode || p.sonoAuthCode || "";

        setFormData(prev => ({
            ...prev,
            parentPartnerId: p.partnerId,
            parentPartnerName: p.companyName,
            sonoAuthCode: parentCode || prev.sonoAuthCode
        }));
        setSearchTerm("");
        setSearchResults([]);
    };

    // 상위 파트너가 설정되어 있는데 인증코드가 비어있다면 상위 파트너의 인증코드 자동 상속
    useEffect(() => {
        if (formData.parentPartnerId && !formData.sonoAuthCode && allPartners) {
            const parent = allPartners.find(item => item.partnerId === formData.parentPartnerId || item.loginId === formData.parentPartnerId);
            if (parent?.sonoAuthCode) {
                setFormData(prev => ({
                    ...prev,
                    sonoAuthCode: parent.sonoAuthCode || ""
                }));
            }
        }
    }, [formData.parentPartnerId, allPartners]);

    const clearParent = () => {
        setFormData(prev => ({
            ...prev,
            parentPartnerId: "",
            parentPartnerName: ""
        }));
        setSearchTerm("");
    };

    const formatPhone = (val: string) => formatPhoneNumber(val);

    const handleToggleLanding = (key: 'smartcare' | 'happy450' | 'maeum') => {
        setFormData(prev => {
            const currentLv = prev.landingVisibility || { smartcare: true, happy450: true, maeum: true };
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
        setFormData(prev => ({
            ...prev,
            showLandingUrl: visible,
            landingVisibility: {
                smartcare: visible,
                happy450: visible,
                maeum: visible,
            }
        }));
    };

    const handleDelete = async () => {
        if (!partner || !confirm("정말 이 파트너를 삭제하시겠습니까? 복구할 수 없습니다.")) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/partners?id=${partner.partnerId}`, { method: "DELETE" });
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
                    approvedBy: "admin"
                })
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

            // 상위 파트너는 하위 파트너의 공식 상품 대표 연결 URL 노출 설정을 변경할 수 없음 (총괄 관리자만 가능)
            if (!isAdmin && isEdit && partner) {
                submitData.showLandingUrl = partner.showLandingUrl !== undefined ? partner.showLandingUrl : true;
                submitData.landingVisibility = {
                    smartcare: partner.landingVisibility?.smartcare !== undefined ? partner.landingVisibility.smartcare : true,
                    happy450: partner.landingVisibility?.happy450 !== undefined ? partner.landingVisibility.happy450 : true,
                    maeum: partner.landingVisibility?.maeum !== undefined ? partner.landingVisibility.maeum : false,
                };
            }

            let body;

            if (isEdit) {
                body = { partnerId: partner.partnerId, ...submitData };
            } else if (requestId) {
                // Approval Mode
                body = {
                    action: "approve",
                    requestId: requestId,
                    approvedBy: "admin", // In a real app, get from session
                    partnerData: submitData
                };
            } else {
                // Register Mode
                body = { action: "register", partnerData: submitData };
            }

            const response = await fetch("/api/admin/partners", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (data.success) {
                alert(isEdit ? "수정되었습니다." : requestId ? "승인 처리되었습니다." : "등록되었습니다.");
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

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6">
            <div className="bg-white rounded-[24px] md:rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-10 shadow-2xl no-scrollbar">
                <div className="flex justify-between items-center mb-6 sm:mb-10">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-sono-dark">
                            {isEdit ? "파트너 정보 수정" : "파트너 신규 등록"}
                        </h2>
                        {isEdit && isAdmin && formData.loginId && (
                            <a
                                href={`/partner-center?id=${formData.loginId}&k=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'sono_admin_master_pass_2026'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
                            >
                                <span>파트너 어드민 바로가기</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-sono-dark transition-colors">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">기본 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">업체명</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="㈜소노컴퍼니"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">사업자번호</label>
                                <input
                                    type="text"
                                    value={formData.businessNumber}
                                    onChange={(e) => setFormData({ ...formData, businessNumber: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="000-00-00000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parent Partner Search Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">상위 파트너 정보</h3>
                        <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                            {formData.parentPartnerId ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-sono-primary mb-1 uppercase tracking-wider">상위 파트너</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-base sm:text-lg font-bold text-sono-dark">{formData.parentPartnerName}</span>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-mono">{formData.parentPartnerId}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearParent}
                                        className="text-red-500 hover:text-red-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-red-100 shadow-sm"
                                    >
                                        변경/삭제
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-400 ml-1 mb-2 block">상위 파트너 검색 (미선택 시 최상위 파트너로 설정)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary focus:border-transparent outline-none"
                                            placeholder="파트너사명 또는 ID 입력"
                                        />
                                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        {isSearching && (
                                            <div className="absolute right-3 top-3.5">
                                                <div className="animate-spin w-5 h-5 border-2 border-sono-primary border-t-transparent rounded-full"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Search Results Dropdown */}
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 max-h-48 overflow-y-auto">
                                            {searchResults.map((p) => (
                                                <button
                                                    key={p.partnerId}
                                                    type="button"
                                                    onClick={() => selectParent(p)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none flex justify-between items-center group"
                                                >
                                                    <div>
                                                        <div className="font-bold text-sono-dark text-sm group-hover:text-sono-primary">{p.companyName}</div>
                                                        <div className="text-xs text-gray-400">{p.partnerId} | {p.ceoName}</div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-300 group-hover:text-sono-primary">선택</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manager Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">담당자 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">담당자 성함</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.managerName}
                                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">담당자 연락처</label>
                                <input
                                    type="text" // using text to allow hyphens, but inputMode numeric
                                    inputMode="numeric"
                                    required
                                    value={formData.managerPhone}
                                    onChange={(e) => setFormData({ ...formData, managerPhone: formatPhone(e.target.value) })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="010-0000-0000"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 ml-1">상담 대표번호 (랜딩페이지 하단 상담바 노출)</label>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        랜딩페이지 연동
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData.inquiryPhone}
                                    onChange={(e) => setFormData({ ...formData, inquiryPhone: formatPhone(e.target.value) })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="미입력 시 담당자 연락처로 자동 노출 (예: 1588-9999, 010-0000-0000)"
                                />
                                <p className="text-[11px] text-gray-400 ml-1">
                                    * 미입력 시 담당자 연락처가 노출됩니다. 1588-9999 등 4자리 전국대표번호 및 휴대폰 번호 모두 자동 하이픈이 적용되며, 모바일에서 원클릭 전화걸기/문자보내기가 연동됩니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">서비스 설정</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">커스텀 URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-3 text-gray-400 text-sm">/p/</span>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customUrl}
                                            onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                                            className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                            placeholder="company"
                                        />
                                    </div>
                                    {formData.customUrl && (
                                        <a
                                            href={`/p/${formData.customUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-12 bg-sono-primary/10 text-sono-primary rounded-2xl hover:bg-sono-primary hover:text-white transition-all shrink-0"
                                            title="페이지 바로가기"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">포인트 지급 정보</label>
                                <input
                                    type="text"
                                    value={formData.pointInfo}
                                    onChange={(e) => setFormData({ ...formData, pointInfo: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="45만 포인트 즉시 지급"
                                />
                            </div>
                        </div>

                        {/* 판매상품 설정 (Product Selection) */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 ml-1">판매상품 설정</label>
                                    <p className="text-[11px] text-gray-400 ml-1">
                                        * 해당 파트너사에서 판매 등록/노출 허용할 상품을 선택하세요.
                                    </p>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, partnerGroup: "전체 상품 판매" })}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                                formData.partnerGroup === "전체 상품 판매"
                                                    ? "bg-sono-primary text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            전체 선택
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, partnerGroup: "결합 상품 판매" })}
                                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                                formData.partnerGroup === "결합 상품 판매"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            결합상품만
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Registered Products Checkbox Grid */}
                            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-2.5 max-h-64 overflow-y-auto">
                                {careProducts && careProducts.length > 0 ? (
                                    careProducts.map((p) => {
                                        const isAll = formData.partnerGroup === "전체 상품 판매" || !formData.partnerGroup;
                                        const isCombOnly = formData.partnerGroup === "결합 상품 판매";
                                        
                                        const isSelected = isAll 
                                            ? true 
                                            : isCombOnly 
                                                ? p.productType !== "standard"
                                                : formData.partnerGroup.includes(p.name);

                                        const toggleProduct = () => {
                                            if (!isAdmin) return;
                                            let currentSelectedNames: string[] = [];

                                            if (isAll) {
                                                currentSelectedNames = careProducts.map(cp => cp.name);
                                            } else if (isCombOnly) {
                                                currentSelectedNames = careProducts.filter(cp => cp.productType !== "standard").map(cp => cp.name);
                                            } else {
                                                currentSelectedNames = formData.partnerGroup.split(",").map(s => s.trim()).filter(Boolean);
                                            }

                                            if (isSelected) {
                                                currentSelectedNames = currentSelectedNames.filter(name => name !== p.name);
                                            } else {
                                                currentSelectedNames.push(p.name);
                                            }

                                            if (currentSelectedNames.length === careProducts.length) {
                                                setFormData({ ...formData, partnerGroup: "전체 상품 판매" });
                                            } else if (currentSelectedNames.length === 0) {
                                                setFormData({ ...formData, partnerGroup: "선택 상품 없음" });
                                            } else {
                                                setFormData({ ...formData, partnerGroup: currentSelectedNames.join(", ") });
                                            }
                                        };

                                        return (
                                            <div
                                                key={p._id}
                                                onClick={toggleProduct}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-white border-sono-primary/40 shadow-xs"
                                                        : "bg-gray-100/50 border-transparent opacity-60 hover:opacity-80"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        disabled={!isAdmin}
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 text-sono-primary rounded border-gray-300 focus:ring-sono-primary cursor-pointer"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black text-sm text-sono-dark">{p.name}</span>
                                                            {p.productType === "standard" ? (
                                                                <span className="text-[10px] font-black bg-purple-50 text-purple-600 border border-purple-200/80 px-2 py-0.5 rounded">
                                                                    일반상품
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200/80 px-2 py-0.5 rounded">
                                                                    결합상품
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                                                            {p.slotCount}구좌 | 월 {(p.monthlyPayment || 0).toLocaleString()}원 {p.target ? `| ${p.target}` : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-black px-2 py-1 rounded-md ${
                                                    isSelected ? "bg-sono-primary/10 text-sono-primary" : "bg-gray-200 text-gray-400"
                                                }`}>
                                                    {isSelected ? "판매 설정됨" : "미선택"}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-xs text-center text-gray-400 py-4 font-bold">
                                        등록된 상품이 없습니다. [상품관리] 탭에서 상품을 먼저 등록하세요.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 공식 상품 대표 연결 URL 노출 설정 (총괄 관리자 전용) */}
                        {isAdmin && (() => {
                            const lv = formData.landingVisibility || { smartcare: true, happy450: true, maeum: true };
                            const visibleCount = (lv.smartcare ? 1 : 0) + (lv.happy450 ? 1 : 0) + (lv.maeum ? 1 : 0);
                            const landingOptions = [
                                {
                                    key: 'smartcare' as const,
                                    name: '스마트케어',
                                    engName: 'SmartCare',
                                    badge: '가전 결합 상품',
                                    badgeColor: 'bg-sono-primary text-white',
                                    price: '월 33,000원부터',
                                    path: formData.customUrl ? `/${formData.customUrl}/smartcare` : '/products/smartcare',
                                    desc: '삼성/LG 최신 가전 렌탈 지원금 전액 제공 결합 상품',
                                    isVisible: !!lv.smartcare,
                                },
                                {
                                    key: 'happy450' as const,
                                    name: '더 해피 450 ONE',
                                    engName: 'Happy450',
                                    badge: '일반 상조 플랜',
                                    badgeColor: 'bg-slate-800 text-white',
                                    price: '월 18,000원부터',
                                    path: formData.customUrl ? `/${formData.customUrl}/happy450` : '/products/happy450',
                                    desc: '기본 상조 서비스 및 만기 100% 전액 환급 스탠다드 플랜',
                                    isVisible: !!lv.happy450,
                                },
                                {
                                    key: 'maeum' as const,
                                    name: '마음든든',
                                    engName: 'Maeum 251',
                                    badge: '2·5·1 잔금 보장',
                                    badgeColor: 'bg-[#173b3b] text-white',
                                    price: '월 32,000원부터',
                                    path: formData.customUrl ? `/${formData.customUrl}/maeum` : '/products/maeum',
                                    desc: '2·5·1 구조 잔금 보장 및 약정 의전서비스 안심 플랜',
                                    isVisible: !!lv.maeum,
                                },
                            ];

                            const visibleNames = landingOptions.filter(o => o.isVisible).map(o => o.name).join(', ');

                            return (
                                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sono-primary"></span>
                                                <label className="text-sm font-bold text-slate-800">
                                                    공식 상품 대표 연결 URL 노출 설정
                                                </label>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                                    visibleCount === 3
                                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                        : visibleCount === 0
                                                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                                                        : "bg-blue-100 text-blue-800 border border-blue-200"
                                                }`}>
                                                    {visibleCount === 3 ? "전체 노출 (3개)" : visibleCount === 0 ? "전체 미노출" : `부분 노출 (${visibleCount}/3개)`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                해당 파트너 대시보드 메인 화면에 노출할 공식 상품 대표 연결 URL 카드를 각 랜딩별로 선택합니다.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllLandings(true)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    visibleCount === 3
                                                        ? "bg-sono-primary text-white shadow-xs"
                                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                ✓ 전체 노출
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSetAllLandings(false)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    visibleCount === 0
                                                        ? "bg-rose-600 text-white shadow-xs"
                                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                ✕ 전체 미노출
                                            </button>
                                        </div>
                                    </div>

                                    {/* 랜딩별 개별 노출 카드 3종 그리드 */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {landingOptions.map((item) => (
                                            <div
                                                key={item.key}
                                                onClick={() => handleToggleLanding(item.key)}
                                                className={`relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                                                    item.isVisible
                                                        ? "bg-white border-sono-primary/60 shadow-xs ring-1 ring-sono-primary/20"
                                                        : "bg-slate-100/70 border-slate-200 opacity-60 hover:opacity-85"
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                                                            {item.badge}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                            item.isVisible
                                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                                : "bg-slate-200 text-slate-600"
                                                        }`}>
                                                            {item.isVisible ? "노출 중" : "미노출"}
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-sm text-slate-900 mb-0.5">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-mono truncate mb-2">
                                                        {item.path}
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                        {item.desc}
                                                    </p>
                                                </div>

                                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-sono-primary">
                                                        {item.price}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleLanding(item.key);
                                                        }}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                            item.isVisible
                                                                ? "bg-sono-primary text-white"
                                                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                        }`}
                                                    >
                                                        {item.isVisible ? "✓ 노출" : "✕ 미노출"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 실시간 피드백 안내 메시지 */}
                                    {visibleCount === 0 ? (
                                        <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2">
                                            <svg className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            <span>
                                                <strong>[전체 미노출 설정됨]</strong> 모든 공식 대표 URL 카드가 숨겨집니다. 파트너 대시보드 메인에서 대표 상품 카드 박스 영역 전체가 표시되지 않습니다.
                                            </span>
                                        </div>
                                    ) : visibleCount < 3 ? (
                                        <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
                                            <svg className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>
                                                <strong>[부분 노출 설정됨]</strong> 선택된 <strong>${visibleCount}개 랜딩(${visibleNames})</strong>만 파트너 대시보드 메인에 노출됩니다.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
                                            <svg className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>
                                                <strong>[전체 노출 설정됨]</strong> 3개 모든 공식 상품 대표 연결 URL(스마트케어, 더 해피 450, 마음든든) 카드가 대시보드 메인에 정상 노출됩니다.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* Landing Page Customization */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">랜딩 타이틀용 업체명 (회원님을 위한... 앞에 표시)</label>
                                <input
                                    type="text"
                                    value={formData.landingTitle}
                                    onChange={(e) => setFormData({ ...formData, landingTitle: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="㈜베스트원서브"
                                />
                                <p className="text-[10px] text-gray-400 ml-1 mt-1">* 공백 시 파트너 등록 업체명이 표시됩니다.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">로고 이미지 URL (왼쪽 로고)</label>
                                <input
                                    type="text"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">로고 텍스트 (이미지 URL이 없을 때 표시)</label>
                                <input
                                    type="text"
                                    value={formData.logoText}
                                    onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder="파트너사명을 텍스트로 보이고 싶을 때 입력"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sono Imready Setting Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-l-4 border-indigo-500 pl-3">
                            <h3 className="text-lg font-bold text-sono-dark">소노접수 연동 설정 (THEHAPPYONE)</h3>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                자동 접수 API 연동
                            </span>
                        </div>
                        <div className="bg-indigo-50/40 rounded-2xl p-4 sm:p-5 border border-indigo-100/80 space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-700 ml-1">
                                        소노접수 웹 인증코드 (authCd)
                                    </label>
                                    <span className="text-[11px] text-indigo-600 font-semibold">
                                        기본값: BIZI0011
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={formData.sonoAuthCode}
                                    onChange={(e) => setFormData({ ...formData, sonoAuthCode: e.target.value })}
                                    className="w-full bg-white border border-indigo-200/70 rounded-xl py-3 px-4 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="예: BIZI0011 (미입력 시 기본 BIZI0011 또는 상위 파트너 설정값 적용)"
                                />
                                <div className="text-[11px] text-gray-500 space-y-1 ml-1 pt-1">
                                    <p>
                                        * 고객 신규 접수 시 <strong>소노아임레디 웹 접수(direct.sonoimready.com/THEHAPPYONE/write)</strong>로 자동 전송될 때 사용할 인증코드입니다.
                                    </p>
                                    <p>
                                        * 상위 파트너(예: bestoneserve1)에 인증코드를 입력해 두면, <strong>소속 하위 파트너의 고객 접수 시에도 해당 코드가 자동 상속</strong>되어 적용됩니다.
                                    </p>
                                    {subPartnerCount > 0 && (
                                        <p className="text-indigo-700 font-bold bg-indigo-100/70 p-2 rounded-lg border border-indigo-200">
                                            ℹ️ 현재 이 파트너의 하위 파트너({subPartnerCount}개)가 등록되어 있으며, 정보 수정 완료 시 하위 파트너들의 인증코드에도 본 코드가 자동으로 일괄 반영됩니다.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">계정 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">로그인 ID</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.loginId}
                                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">로그인 비밀번호</label>
                                <input
                                    type="password"
                                    required={!isEdit}
                                    value={formData.loginPassword}
                                    onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                    placeholder={isEdit ? "변경시에만 입력" : ""}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">파트너 상태</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                >
                                    <option value="active">정상 (Active)</option>
                                    <option value="inactive">중지 (Inactive)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 ml-1">권한 등급 (Role)</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-sono-primary"
                                >
                                    <option value="master">마스터 파트너 (Master)</option>
                                    <option value="tm">TM 상담원 (TM)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3 sm:gap-4">
                        {isEdit && isAdmin && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-50 text-red-500 font-bold px-5 sm:px-6 py-4 rounded-2xl hover:bg-red-100 transition-all whitespace-nowrap"
                            >
                                삭제
                            </button>
                        )}
                        {!isEdit && requestId && (
                            <button
                                type="button"
                                onClick={handleHold}
                                disabled={isLoading}
                                className="bg-amber-500 text-white font-bold px-5 sm:px-6 py-4 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 whitespace-nowrap"
                            >
                                보류
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all whitespace-nowrap"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] bg-sono-primary text-white font-bold py-4 rounded-2xl hover:bg-sono-primary/90 transition-all shadow-xl shadow-sono-primary/20 disabled:opacity-50 whitespace-nowrap"
                        >
                            {isLoading ? "처리 중..." : isEdit ? "정보 수정 완료" : requestId ? "승인 처리" : "파트너 등록 완료"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
