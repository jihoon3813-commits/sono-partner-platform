"use client";

import { useState, useEffect } from "react";
import { Partner } from "@/lib/types";

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

    // Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ partnerId: string, companyName: string, ceoName: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        businessNumber: "",
        ceoName: "",
        managerName: "",
        managerPhone: "",
        managerEmail: "",
        shopUrl: "",
        shopType: "회원제 쇼핑몰",
        memberCount: "",
        customUrl: "",
        logoUrl: "",
        logoText: "",
        landingTitle: "",
        pointInfo: "",
        loginId: "",
        loginPassword: "",
        status: "active" as "active" | "inactive" | "pending",
        parentPartnerId: "",
        parentPartnerName: ""
    });

    useEffect(() => {
        if (partner) {
            setFormData({
                companyName: partner.companyName || "",
                businessNumber: partner.businessNumber || "",
                ceoName: partner.ceoName || "",
                managerName: partner.managerName || "",
                managerPhone: partner.managerPhone || "",
                managerEmail: partner.managerEmail || "",
                shopUrl: partner.shopUrl || "",
                shopType: partner.shopType || "회원제 쇼핑몰",
                memberCount: partner.memberCount || "",
                customUrl: partner.customUrl || "",
                logoUrl: partner.logoUrl || "",
                logoText: partner.logoText || "",
                landingTitle: partner.landingTitle || "",
                pointInfo: partner.pointInfo || "",
                loginId: partner.loginId || "",
                loginPassword: partner.loginPassword || "",
                status: partner.status || "active",
                parentPartnerId: partner.parentPartnerId || "",
                parentPartnerName: partner.parentPartnerName || ""
            });
        } else if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                status: "active"
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

    const selectParent = (p: { partnerId: string, companyName: string }) => {
        setFormData(prev => ({
            ...prev,
            parentPartnerId: p.partnerId,
            parentPartnerName: p.companyName
        }));
        setSearchTerm("");
        setSearchResults([]);
        setIsSearching(false); // Ensure search state is reset
    };

    const clearParent = () => {
        setFormData(prev => ({
            ...prev,
            parentPartnerId: "",
            parentPartnerName: ""
        }));
        setSearchTerm("");
    };

    const formatPhone = (val: string) => {
        const nums = val.replace(/[^0-9]/g, "");
        if (nums.length <= 3) return nums;
        if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        if (nums.length <= 11) return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
        return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const method = isEdit ? "PUT" : "POST";
            let body;

            if (isEdit) {
                body = { partnerId: partner.partnerId, ...formData };
            } else if (requestId) {
                // Approval Mode
                body = {
                    action: "approve",
                    requestId: requestId,
                    approvedBy: "admin", // In a real app, get from session
                    partnerData: formData
                };
            } else {
                // Register Mode
                body = { action: "register", partnerData: formData };
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl no-scrollbar">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-sono-dark">
                        {isEdit ? "파트너 정보 수정" : "파트너 신규 등록"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-sono-dark transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">기본 정보</h3>
                        <div className="grid grid-cols-2 gap-6">
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
                        <div className="bg-gray-50 rounded-2xl p-6">
                            {formData.parentPartnerId ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-sono-primary mb-1 uppercase tracking-wider">상위 파트너</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-sono-dark">{formData.parentPartnerName}</span>
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
                        <div className="grid grid-cols-2 gap-6">
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
                        </div>
                    </div>

                    {/* Service Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">서비스 설정</h3>
                        <div className="grid grid-cols-2 gap-6">
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
                                            className="flex items-center justify-center w-12 bg-sono-primary/10 text-sono-primary rounded-2xl hover:bg-sono-primary hover:text-white transition-all"
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

                        {/* Landing Page Customization */}
                        <div className="grid grid-cols-2 gap-6 pt-2">
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
                            <div className="space-y-2 col-span-2">
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

                    {/* Account Info Section */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-sono-dark border-l-4 border-sono-primary pl-3">계정 정보</h3>
                        <div className="grid grid-cols-2 gap-6">
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
                    </div>

                    <div className="pt-6 flex gap-4">
                        {isEdit && isAdmin && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="bg-red-50 text-red-500 font-bold px-6 py-4 rounded-2xl hover:bg-red-100 transition-all"
                            >
                                삭제
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] bg-sono-primary text-white font-bold py-4 rounded-2xl hover:bg-sono-primary/90 transition-all shadow-xl shadow-sono-primary/20 disabled:opacity-50"
                        >
                            {isLoading ? "처리 중..." : isEdit ? "정보 수정 완료" : "파트너 등록 완료"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
