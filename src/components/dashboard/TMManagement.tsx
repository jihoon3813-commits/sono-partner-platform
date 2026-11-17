"use client";

import { useState } from "react";
import { Partner } from "@/lib/types";
import TMFormModal from "./TMFormModal";
import { AdminIcon } from "./AdminIcons";

interface TMManagementProps {
    partners: Partner[];
    parentPartner: Partner;
    onRefresh: () => void;
}

export default function TMManagement({ partners, parentPartner, onRefresh }: TMManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTM, setSelectedTM] = useState<Partner | null>(null);

    const handleEdit = (tm: Partner) => {
        setSelectedTM(tm);
        setIsModalOpen(true);
    };

    const handleRegister = () => {
        setSelectedTM(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTM(null);
    };

    const handleSuccess = () => {
        handleModalClose();
        onRefresh();
    };

    // Filter sub-partners that are TMs under the current partner
    const tmAccounts = partners.filter(p => 
        p.parentPartnerId === parentPartner.partnerId && 
        p.role === "tm"
    );

    const filteredTMs = tmAccounts.filter(p =>
        (p.managerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.loginId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.managerPhone || "").replace(/-/g, "").includes(searchTerm.replace(/-/g, ""))
    );

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · TM AGENTS</div>
                    <h1>상담원 관리</h1>
                    <p>
                        소속 상담원 계정을 등록하고 관리합니다. 현재 총{" "}
                        <strong className="text-[#295e52]">{tmAccounts.length}명</strong>이 등록되어 있습니다.
                    </p>
                </div>
                <div className="adm-heading-buttons">
                    <button
                        type="button"
                        onClick={handleRegister}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="plus" />
                        <span>상담원 신규 등록</span>
                    </button>
                </div>
            </section>

            {/* 통합 상담원 패널 */}
            <section className="adm-panel overflow-hidden">
                <div className="adm-filter-bar">
                    <label className="adm-search-field">
                        <AdminIcon name="search" />
                        <input
                            type="text"
                            placeholder="상담원명, ID, 연락처 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </label>
                    <div className="adm-filter-end">
                        검색 결과 <strong className="text-[#295e52]">{filteredTMs.length}</strong>명
                    </div>
                </div>

                <div className="adm-table-scroll">
                    <table className="adm-table">
                        <thead>
                            <tr>
                                <th>상담원</th>
                                <th>로그인 ID</th>
                                <th>연락처 / 이메일</th>
                                <th>등록일자</th>
                                <th>상태</th>
                                <th className="text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTMs.length > 0 ? (
                                filteredTMs.map((tm) => (
                                    <tr
                                        key={tm.partnerId}
                                        className="adm-clickable-row"
                                        onClick={() => handleEdit(tm)}
                                    >
                                        <td>
                                            <div className="adm-person">
                                                <span className="adm-person-circle">
                                                    {(tm.managerName || "상").trim().charAt(0)}
                                                </span>
                                                <div>
                                                    <b>{tm.managerName}</b>
                                                    <small>소속 상담원 (TM)</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <div className="text-xs font-bold text-[#263d36] font-mono">
                                                {tm.loginId}
                                            </div>
                                            <div className="text-[10px] text-[#86918a] font-mono mt-0.5">
                                                {tm.partnerId}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <div className="text-xs font-semibold text-[#263d36] font-mono">
                                                {tm.managerPhone}
                                            </div>
                                            <div className="text-[11px] text-[#86918a] mt-0.5">
                                                {tm.managerEmail}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap text-xs text-[#6b7768] font-mono">
                                            {formatDate(tm.createdAt)}
                                        </td>
                                        <td className="whitespace-nowrap">
                                            <span
                                                className={`adm-pill ${
                                                    tm.status === "active" ? "green" : "red"
                                                }`}
                                            >
                                                {tm.status === "active" ? "정상" : "사용중지"}
                                            </span>
                                        </td>
                                        <td className="text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(tm);
                                                }}
                                                className="adm-btn small"
                                            >
                                                정보수정
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-16 text-center text-xs text-[#86918a]"
                                    >
                                        등록된 상담원 계정이 없거나 검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="adm-table-foot">
                    <span>
                        전체 <b>{tmAccounts.length}</b>명 중 <b>{filteredTMs.length}</b>명 표시
                    </span>
                </div>
            </section>

            {/* Modal */}
            {isModalOpen && (
                <TMFormModal
                    tm={selectedTM}
                    parentPartner={parentPartner}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
