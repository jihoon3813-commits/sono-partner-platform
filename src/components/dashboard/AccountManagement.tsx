"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatPhoneNumber } from "@/lib/phoneUtils";
import { AdminIcon } from "./AdminIcons";

interface AccountManagementProps {
    partner: any;
    isAdmin: boolean;
    onRefresh?: () => void;
}

export default function AccountManagement({ partner, isAdmin, onRefresh }: AccountManagementProps) {
    const updatePartnerMut = useMutation(api.partners.updatePartner);
    const updateAdminMut = useMutation(api.admins.updateAdmin);

    // 개인정보 상태 (상담 대표번호는 미설정 시 등록된 담당자 핸드폰 번호로 기본 설정)
    const [infoData, setInfoData] = useState({
        companyName: partner?.companyName || partner?.name || "",
        ceoName: partner?.ceoName || "",
        managerName: partner?.managerName || partner?.name || "",
        managerPhone: formatPhoneNumber(partner?.managerPhone || ""),
        managerEmail: partner?.managerEmail || partner?.email || "",
        inquiryPhone: formatPhoneNumber(partner?.inquiryPhone || partner?.managerPhone || ""),
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
                managerPhone: formatPhoneNumber(partner.managerPhone || ""),
                managerEmail: partner.managerEmail || partner.email || "",
                inquiryPhone: formatPhoneNumber(partner.inquiryPhone || partner.managerPhone || ""),
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
                        inquiryPhone: infoData.inquiryPhone || infoData.managerPhone,
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
                            inquiryPhone: infoData.inquiryPhone || infoData.managerPhone,
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
        <div className="space-y-4">
            <div className="adm-section-note">
                <AdminIcon name="shield" />
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="adm-pill green">
                        {isAdmin ? "본사 관리자" : "파트너 계정"}
                    </span>
                    <span>
                        접속 계정 ID: <strong className="font-mono">{partner?.loginId || partner?.partnerId || "admin"}</strong> · 담당자 정보 및 비밀번호를 안전하게 관리합니다.
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. 개인정보 수정 패널 */}
                <section className="adm-panel flex flex-col justify-between overflow-hidden">
                    <div className="adm-panel-head">
                        <div>
                            <h3 className="adm-panel-title">개인정보 / 담당자 수정</h3>
                            <p className="adm-panel-sub">계정의 기본 정보 및 연락처를 변경합니다.</p>
                        </div>
                        <span className="adm-pill gray">기본 정보</span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                        {infoMsg.text && (
                            <div className={`adm-note-card text-xs font-bold mb-4 flex items-center gap-2 ${infoMsg.type === 'success' ? '!bg-[#edf2fa] !border-[#cfdcf0] text-[#163a6b]' : '!bg-[#fbeef0] !border-[#eccfd2] text-[#a33d46]'}`}>
                                <AdminIcon name={infoMsg.type === 'success' ? "check-circle" : "info"} />
                                <span>{infoMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleInfoSubmit} className="space-y-4">
                            <div className="adm-field-grid">
                                {!isAdmin && (
                                    <div className="adm-field">
                                        <label>회사 / 파트너명</label>
                                        <input
                                            type="text"
                                            value={infoData.companyName}
                                            onChange={(e) => setInfoData({ ...infoData, companyName: e.target.value })}
                                            className="adm-input"
                                            placeholder="회사명 입력"
                                        />
                                    </div>
                                )}

                                {!isAdmin && (
                                    <div className="adm-field">
                                        <label>대표자명</label>
                                        <input
                                            type="text"
                                            value={infoData.ceoName}
                                            onChange={(e) => setInfoData({ ...infoData, ceoName: e.target.value })}
                                            className="adm-input"
                                            placeholder="대표자명 입력"
                                        />
                                    </div>
                                )}

                                <div className="adm-field">
                                    <label>담당자 성함</label>
                                    <input
                                        type="text"
                                        value={infoData.managerName}
                                        onChange={(e) => setInfoData({ ...infoData, managerName: e.target.value })}
                                        className="adm-input"
                                        placeholder="담당자 이름 입력"
                                    />
                                </div>

                                <div className="adm-field">
                                    <label>담당자 연락처 (휴대폰)</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={infoData.managerPhone}
                                        onChange={(e) => setInfoData({ ...infoData, managerPhone: formatPhoneNumber(e.target.value) })}
                                        className="adm-input font-mono"
                                        placeholder="010-0000-0000"
                                    />
                                </div>

                                <div className="adm-field full">
                                    <label>담당자 이메일</label>
                                    <input
                                        type="email"
                                        value={infoData.managerEmail}
                                        onChange={(e) => setInfoData({ ...infoData, managerEmail: e.target.value })}
                                        className="adm-input"
                                        placeholder="email@domain.com"
                                    />
                                </div>

                                {!isAdmin && (
                                    <div className="adm-field full">
                                        <div className="flex items-center justify-between">
                                            <label>상담 대표번호 (하단 상담바 노출)</label>
                                            <span className="adm-pill green">랜딩페이지 연동</span>
                                        </div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={infoData.inquiryPhone}
                                            onChange={(e) => setInfoData({ ...infoData, inquiryPhone: formatPhoneNumber(e.target.value) })}
                                            className="adm-input font-mono"
                                            placeholder="예: 1588-9999 또는 010-0000-0000"
                                        />
                                        <p className="text-[11px] text-[#68778c] leading-relaxed mt-1">
                                            * 파트너 전용 랜딩페이지 하단 상담바에 노출되는 대표번호입니다. 미입력 시 등록된 담당자 연락처로 자동 노출됩니다.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingInfo}
                                    className="adm-btn primary"
                                >
                                    <AdminIcon name="check" />
                                    <span>{isSavingInfo ? "저장 중..." : "개인정보 저장"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* 2. 비밀번호 변경 패널 */}
                <section className="adm-panel flex flex-col justify-between overflow-hidden">
                    <div className="adm-panel-head">
                        <div>
                            <h3 className="adm-panel-title">비밀번호 변경</h3>
                            <p className="adm-panel-sub">비밀번호 확인 및 미리보기(보기/숨기기) 기능을 제공합니다.</p>
                        </div>
                        <span className="adm-pill orange">보안 설정</span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                        {pwMsg.text && (
                            <div className={`adm-note-card text-xs font-bold mb-4 flex items-center gap-2 ${pwMsg.type === 'success' ? '!bg-[#edf2fa] !border-[#cfdcf0] text-[#163a6b]' : '!bg-[#fbeef0] !border-[#eccfd2] text-[#a33d46]'}`}>
                                <AdminIcon name={pwMsg.type === 'success' ? "check-circle" : "info"} />
                                <span>{pwMsg.text}</span>
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="adm-field">
                                <label>신규 비밀번호</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="adm-input !pr-10"
                                        placeholder="신규 비밀번호 입력 (4자리 이상)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#788699] hover:text-[#162438] p-1"
                                        title={showNewPassword ? "비밀번호 숨기기" : "비밀번호 미리보기"}
                                    >
                                        <AdminIcon name="eye" />
                                    </button>
                                </div>
                            </div>

                            <div className="adm-field">
                                <label>신규 비밀번호 확인</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={`adm-input !pr-10 ${
                                            isPasswordMatch
                                                ? "!border-[#163a6b]"
                                                : isPasswordMismatch
                                                ? "!border-[#c8565d]"
                                                : ""
                                        }`}
                                        placeholder="신규 비밀번호 다시 입력"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#788699] hover:text-[#162438] p-1"
                                        title={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 미리보기"}
                                    >
                                        <AdminIcon name="eye" />
                                    </button>
                                </div>

                                {isPasswordMatch && (
                                    <p className="text-[11px] font-bold text-[#163a6b] mt-1 flex items-center gap-1">
                                        <AdminIcon name="check" className="!w-3.5 !h-3.5" />
                                        비밀번호가 일치합니다.
                                    </p>
                                )}
                                {isPasswordMismatch && (
                                    <p className="text-[11px] font-bold text-[#a33d46] mt-1 flex items-center gap-1">
                                        <AdminIcon name="close" className="!w-3.5 !h-3.5" />
                                        비밀번호가 일치하지 않습니다.
                                    </p>
                                )}
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingPw || !passwordData.newPassword || (passwordData.newPassword !== passwordData.confirmPassword)}
                                    className="adm-btn primary"
                                >
                                    <AdminIcon name="check" />
                                    <span>{isSavingPw ? "변경 중..." : "비밀번호 변경 완료"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
}
