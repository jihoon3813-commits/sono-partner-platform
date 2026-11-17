"use client";

import { useState, useEffect } from "react";
import { Partner } from "@/lib/types";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

interface TMFormModalProps {
    tm?: Partner | null;
    parentPartner: Partner;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TMFormModal({ tm, parentPartner, onClose, onSuccess }: TMFormModalProps) {
    const isEdit = !!tm;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        loginId: "",
        loginPassword: "",
        managerName: "",
        managerPhone: "",
        managerEmail: "",
        status: "active" as "active" | "inactive"
    });

    useEffect(() => {
        if (tm) {
            setFormData({
                loginId: tm.loginId || "",
                loginPassword: "", // empty for edit (only change if entered)
                managerName: tm.managerName || "",
                managerPhone: tm.managerPhone || "",
                managerEmail: tm.managerEmail || "",
                status: (tm.status as "active" | "inactive") || "active"
            });
        }
    }, [tm]);

    const formatPhone = (val: string) => {
        const nums = val.replace(/[^0-9]/g, "");
        if (nums.length <= 3) return nums;
        if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        if (nums.length <= 11) return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
        return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === "managerPhone") {
            finalValue = formatPhone(value);
        } else if (name === "loginId") {
            // Allow alphanumeric only
            finalValue = value.replace(/[^a-zA-Z0-9]/g, "");
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isEdit) {
                // Update Existing TM Account
                const payload: any = {
                    partnerId: tm.partnerId,
                    managerName: formData.managerName,
                    managerPhone: formData.managerPhone,
                    managerEmail: formData.managerEmail,
                    companyName: `${parentPartner.companyName} (TM: ${formData.managerName})`,
                    status: formData.status
                };

                if (formData.loginPassword.trim()) {
                    payload.loginPassword = formData.loginPassword.trim();
                }

                const res = await fetch("/api/admin/partners", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.message || "상담원 정보 수정 중 오류가 발생했습니다.");
                }

                alert("상담원 정보가 수정되었습니다.");
            } else {
                // Create New TM Account
                // Clean the parent's customUrl to make a safe unique URL segment
                const cleanParentUrl = parentPartner.customUrl.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
                const uniqueCustomUrl = `tm-${cleanParentUrl}-${formData.loginId.toLowerCase()}`;

                const partnerData = {
                    companyName: `${parentPartner.companyName} (TM: ${formData.managerName})`,
                    businessNumber: parentPartner.businessNumber || "",
                    ceoName: parentPartner.ceoName || "",
                    managerName: formData.managerName,
                    managerPhone: formData.managerPhone,
                    managerEmail: formData.managerEmail,
                    shopUrl: parentPartner.shopUrl || "",
                    shopType: parentPartner.shopType || "회원제 쇼핑몰",
                    memberCount: parentPartner.memberCount || "",
                    customUrl: uniqueCustomUrl,
                    logoUrl: parentPartner.logoUrl || "",
                    logoText: parentPartner.logoText || "",
                    landingTitle: parentPartner.landingTitle || "",
                    pointInfo: parentPartner.pointInfo || "",
                    brandColor: parentPartner.brandColor || "#1e3a5f",
                    loginId: formData.loginId,
                    loginPassword: formData.loginPassword,
                    partnerGroup: parentPartner.partnerGroup || "전체 상품 판매",
                    showLandingUrl: parentPartner.showLandingUrl !== undefined ? parentPartner.showLandingUrl : true,
                    landingVisibility: parentPartner.landingVisibility,
                    status: formData.status,
                    parentPartnerId: parentPartner.partnerId,
                    parentPartnerName: parentPartner.companyName,
                    role: "tm",
                    approvedBy: parentPartner.loginId
                };

                const res = await fetch("/api/admin/partners", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "register",
                        partnerData
                    })
                });

                const data = await res.json();
                if (!data.success) {
                    throw new Error(data.message || "상담원 등록 중 오류가 발생했습니다.");
                }

                alert("상담원이 성공적으로 등록되었습니다.");
            }

            onSuccess();
        } catch (error: any) {
            console.error("Submit error:", error);
            alert(error.message || "처리 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminDrawer
            title={isEdit ? "상담원 정보 수정" : "신규 상담원 등록"}
            subtitle={`${parentPartner.companyName} 소속 상담원 계정`}
            maxWidth="520px"
            zIndex={70}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className="adm-btn">
                        취소
                    </button>
                    <button
                        type="submit"
                        form="tm-form-drawer"
                        disabled={isLoading}
                        className="adm-btn primary"
                    >
                        {isLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <AdminIcon name="check" />
                                <span>{isEdit ? "수정하기" : "등록하기"}</span>
                            </>
                        )}
                    </button>
                </>
            }
        >
            <form id="tm-form-drawer" onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-[#f4f7ef] rounded-[11px] p-4 border border-[#dce6d5] text-xs text-[#3b5242] space-y-1">
                    <p className="font-bold text-[#295e52] text-sm mb-1.5">상위 파트너 정보 상속</p>
                    <p>• <b>회사명</b>: {parentPartner.companyName}</p>
                    <p>• <b>대표자명</b>: {parentPartner.ceoName}</p>
                    <p>• <b>사업자번호</b>: {parentPartner.businessNumber}</p>
                    <p className="text-[10px] text-[#7c8c7b] pt-1">* 회사 정보 및 마케팅 설정은 상위 파트너와 동일하게 유지됩니다.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">
                            로그인 ID {!isEdit && <span className="text-[#295e52]">*</span>}
                        </label>
                        <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            disabled={isEdit}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none disabled:bg-gray-100 disabled:text-gray-400 font-semibold"
                            required
                            placeholder="영문, 숫자만 사용 가능"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">
                            비밀번호 {!isEdit && <span className="text-[#295e52]">*</span>}
                        </label>
                        <input
                            type="password"
                            name="loginPassword"
                            value={formData.loginPassword}
                            onChange={handleChange}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none font-semibold"
                            required={!isEdit}
                            placeholder={isEdit ? "변경시에만 입력하세요" : "비밀번호를 입력하세요"}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">
                            상담원명 (이름) <span className="text-[#295e52]">*</span>
                        </label>
                        <input
                            type="text"
                            name="managerName"
                            value={formData.managerName}
                            onChange={handleChange}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none font-semibold"
                            required
                            placeholder="상담원 실명을 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">
                            연락처 (휴대폰) <span className="text-[#295e52]">*</span>
                        </label>
                        <input
                            type="tel"
                            name="managerPhone"
                            value={formData.managerPhone}
                            onChange={handleChange}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none font-semibold"
                            required
                            placeholder="010-0000-0000"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">
                            이메일 <span className="text-[#295e52]">*</span>
                        </label>
                        <input
                            type="email"
                            name="managerEmail"
                            value={formData.managerEmail}
                            onChange={handleChange}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none font-semibold"
                            required
                            placeholder="email@company.com"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#5d6e5c] mb-1.5 block">계정 상태</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full bg-[#f9faf7] border border-[#dfe5d9] text-[#263d36] text-sm rounded-[9px] px-3.5 py-2.5 focus:border-[#295e52] focus:bg-white outline-none font-semibold"
                        >
                            <option value="active">정상 사용</option>
                            <option value="inactive">사용 중지</option>
                        </select>
                    </div>
                </div>
            </form>
        </AdminDrawer>
    );
}
