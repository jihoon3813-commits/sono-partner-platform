"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface AccountManagementProps {
    partner: any;
    isAdmin: boolean;
    onRefresh?: () => void;
}

export default function AccountManagement({ partner, isAdmin, onRefresh }: AccountManagementProps) {
    const updatePartnerMut = useMutation(api.partners.updatePartner);
    const updateAdminMut = useMutation(api.admins.updateAdmin);

    // 개인정보 상태
    const [infoData, setInfoData] = useState({
        companyName: partner?.companyName || partner?.name || "",
        ceoName: partner?.ceoName || "",
        managerName: partner?.managerName || partner?.name || "",
        managerPhone: partner?.managerPhone || "",
        managerEmail: partner?.managerEmail || partner?.email || "",
    });

    // 비밀번호 상태
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // 비밀번호 미리보기 (Show/Hide Password) 토글 상태
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 알림 메시지 상태
    const [infoMsg, setInfoMsg] = useState({ type: "", text: "" });
    const [pwMsg, setPwMsg] = useState({ type: "", text: "" });

    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isSavingPw, setIsSavingPw] = useState(false);

    useEffect(() => {
        if (partner) {
            setInfoData({
                companyName: partner.companyName || partner.name || "",
                ceoName: partner.ceoName || "",
                managerName: partner.managerName || partner.name || "",
                managerPhone: partner.managerPhone || "",
                managerEmail: partner.managerEmail || partner.email || "",
            });
        }
    }, [partner]);

    // 개인정보 수정 처리
    const handleInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfoMsg({ type: "", text: "" });
        setIsSavingInfo(true);

        try {
            if (isAdmin) {
                await updateAdminMut({
                    adminId: partner?.loginId || partner?.partnerId || "admin",
                    updates: {
                        adminName: infoData.managerName,
                        email: infoData.managerEmail,
                    }
                });
            } else {
                const partnerIdToUpdate = partner?.partnerId || partner?.loginId;
                if (!partnerIdToUpdate) {
                    throw new Error("파트너 식별자를 찾을 수 없습니다.");
                }
                await updatePartnerMut({
                    partnerId: partnerIdToUpdate,
                    updates: {
                        companyName: infoData.companyName,
                        ceoName: infoData.ceoName,
                        managerName: infoData.managerName,
                        managerPhone: infoData.managerPhone,
                        managerEmail: infoData.managerEmail,
                    }
                });
            }

            // 세션 정보 업데이트
            if (typeof window !== "undefined") {
                const currentSessionStr = sessionStorage.getItem("partnerSession") || localStorage.getItem("partnerSession");
                if (currentSessionStr) {
                    try {
                        const currentSession = JSON.parse(currentSessionStr);
                        const updatedSession = {
                            ...currentSession,
                            name: infoData.companyName || infoData.managerName,
                            managerName: infoData.managerName,
                            managerPhone: infoData.managerPhone,
                            managerEmail: infoData.managerEmail,
                            ceoName: infoData.ceoName,
                        };
                        if (sessionStorage.getItem("partnerSession")) {
                            sessionStorage.setItem("partnerSession", JSON.stringify(updatedSession));
                        }
                        if (localStorage.getItem("partnerSession")) {
                            localStorage.setItem("partnerSession", JSON.stringify(updatedSession));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            setInfoMsg({ type: "success", text: "개인정보가 성공적으로 수정되었습니다." });
            if (onRefresh) onRefresh();
        } catch (err: any) {
            setInfoMsg({ type: "error", text: err.message || "개인정보 수정 중 오류가 발생했습니다." });
        } finally {
            setIsSavingInfo(false);
        }
    };

    // 비밀번호 변경 처리
    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMsg({ type: "", text: "" });

        if (!passwordData.newPassword) {
            setPwMsg({ type: "error", text: "신규 비밀번호를 입력해주세요." });
            return;
        }

        if (passwordData.newPassword.length < 4) {
            setPwMsg({ type: "error", text: "비밀번호는 최소 4자리 이상이어야 합니다." });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwMsg({ type: "error", text: "신규 비밀번호와 비밀번호 확인이 일치하지 않습니다." });
            return;
        }

        setIsSavingPw(true);

        try {
            if (isAdmin) {
                await updateAdminMut({
                    adminId: partner?.loginId || partner?.partnerId || "admin",
                    updates: {
                        password: passwordData.newPassword,
                    }
                });
            } else {
                const partnerIdToUpdate = partner?.partnerId || partner?.loginId;
                if (!partnerIdToUpdate) {
                    throw new Error("파트너 식별자를 찾을 수 없습니다.");
                }
                await updatePartnerMut({
                    partnerId: partnerIdToUpdate,
                    updates: {
                        loginPassword: passwordData.newPassword,
                    }
                });
            }

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setPwMsg({ type: "success", text: "비밀번호가 성공적으로 변경되었습니다." });
        } catch (err: any) {
            setPwMsg({ type: "error", text: err.message || "비밀번호 변경 중 오류가 발생했습니다." });
        } finally {
            setIsSavingPw(false);
        }
    };

    const isPasswordMatch = passwordData.newPassword && passwordData.confirmPassword && (passwordData.newPassword === passwordData.confirmPassword);
    const isPasswordMismatch = passwordData.confirmPassword && (passwordData.newPassword !== passwordData.confirmPassword);

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header Title */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sono-primary/10 text-sono-primary">
                            {isAdmin ? "본사 관리자" : "파트너 계정"}
                        </span>
                        <span className="text-xs font-bold text-gray-400">ID: {partner?.loginId || partner?.partnerId || "admin"}</span>
                    </div>
                    <h2 className="text-2xl font-black text-sono-dark tracking-tight">계정 및 보안 관리</h2>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                        계정 정보 및 담당자 연락처 수정, 비밀번호 안전 변경을 관리할 수 있습니다.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* 1. 개인정보 수정 카드 */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-sono-dark">개인정보 / 담당자 수정</h3>
                                <p className="text-xs text-gray-400">계정의 기본 정보 및 연락처를 변경합니다.</p>
                            </div>
                        </div>

                        {infoMsg.text && (
                            <div className={`p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 ${infoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {infoMsg.type === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {infoMsg.text}
                            </div>
                        )}

                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            {!isAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">회사 / 파트너명</label>
                                    <input
                                        type="text"
                                        value={infoData.companyName}
                                        onChange={(e) => setInfoData({ ...infoData, companyName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                        placeholder="회사명 입력"
                                    />
                                </div>
                            )}

                            {!isAdmin && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1.5">대표자명</label>
                                    <input
                                        type="text"
                                        value={infoData.ceoName}
                                        onChange={(e) => setInfoData({ ...infoData, ceoName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                        placeholder="대표자명 입력"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">담당자 성함</label>
                                <input
                                    type="text"
                                    value={infoData.managerName}
                                    onChange={(e) => setInfoData({ ...infoData, managerName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                    placeholder="담당자 이름 입력"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">담당자 연락처</label>
                                <input
                                    type="text"
                                    value={infoData.managerPhone}
                                    onChange={(e) => setInfoData({ ...infoData, managerPhone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                    placeholder="010-0000-0000"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">담당자 이메일</label>
                                <input
                                    type="email"
                                    value={infoData.managerEmail}
                                    onChange={(e) => setInfoData({ ...infoData, managerEmail: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                    placeholder="email@domain.com"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSavingInfo}
                                    className="w-full py-3.5 px-6 bg-sono-dark hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSavingInfo ? "저장 중..." : "개인정보 저장"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* 2. 비밀번호 변경 카드 (확인 기능 & 미리보기 기능 포함) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-sono-dark">비밀번호 변경</h3>
                                <p className="text-xs text-gray-400">비밀번호 확인 및 미리보기(보기/숨기기) 기능 제공</p>
                            </div>
                        </div>

                        {pwMsg.text && (
                            <div className={`p-4 rounded-2xl text-xs font-bold mb-6 flex items-center gap-2 ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {pwMsg.type === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {pwMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* 신규 비밀번호 */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">신규 비밀번호</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-medium focus:bg-white focus:border-sono-primary focus:ring-2 focus:ring-sono-primary/20 outline-none transition-all"
                                        placeholder="신규 비밀번호 입력 (4자리 이상)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sono-dark p-1.5 rounded-lg transition-colors"
                                        title={showNewPassword ? "비밀번호 숨기기" : "비밀번호 미리보기"}
                                    >
                                        {showNewPassword ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 비밀번호 확인 (확인 기능) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">신규 비밀번호 확인</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={`w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-50 border text-sm font-medium focus:bg-white focus:ring-2 outline-none transition-all ${
                                            isPasswordMatch
                                                ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                                                : isPasswordMismatch
                                                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                                                : "border-gray-200 focus:border-sono-primary focus:ring-sono-primary/20"
                                        }`}
                                        placeholder="신규 비밀번호 다시 입력"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sono-dark p-1.5 rounded-lg transition-colors"
                                        title={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 미리보기"}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.04 9.04 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* 비밀번호 일치 / 불일치 안내 */}
                                {isPasswordMatch && (
                                    <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                        비밀번호가 일치합니다.
                                    </p>
                                )}
                                {isPasswordMismatch && (
                                    <p className="text-[11px] font-bold text-rose-500 mt-1.5 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        비밀번호가 일치하지 않습니다.
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSavingPw || !passwordData.newPassword || (passwordData.newPassword !== passwordData.confirmPassword)}
                                    className="w-full py-3.5 px-6 bg-sono-primary hover:bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sono-primary/20 transition-all active:scale-[0.99] disabled:opacity-50"
                                >
                                    {isSavingPw ? "변경 중..." : "비밀번호 변경 완료"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
