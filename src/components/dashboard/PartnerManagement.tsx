"use client";

import { useState } from "react";
import { Partner } from "@/lib/types";
import PartnerFormModal from "./PartnerFormModal";
import { AdminIcon } from "./AdminIcons";

interface PartnerManagementProps {
    partners: Partner[];
    onRefresh: () => void;
    isAdmin?: boolean;
    currentUser?: Partner | null;
    mode?: "default" | "maeum";
}

function getLandingBadge(p: Partner) {
    const isHidden = p.showLandingUrl === false || (p as any).showLandingUrl === "false";
    const lv = p.landingVisibility;

    const smartcare = !isHidden && lv?.smartcare !== false;
    const happy450 = !isHidden && lv?.happy450 !== false;
    const maeum = !isHidden && lv?.maeum === true;

    const count = (smartcare ? 1 : 0) + (happy450 ? 1 : 0) + (maeum ? 1 : 0);

    if (count === 0) {
        return (
            <span className="adm-pill red" title="공식 상품 대표 URL 미노출">
                URL 미노출
            </span>
        );
    }

    if (count === 3) {
        return (
            <span className="adm-pill blue" title="공식 상품 대표 URL 3종 전체 노출">
                URL 전체노출
            </span>
        );
    }

    const visibleItems = [];
    if (smartcare) visibleItems.push("스마트케어");
    if (happy450) visibleItems.push("더 해피 450");
    if (maeum) visibleItems.push("마음든든");

    return (
        <span className="adm-pill orange" title={`노출: ${visibleItems.join(", ")}`}>
            URL 부분({count}/3)
        </span>
    );
}

function PartnerRow({
    partner,
    level = 0,
    childrenPartners,
    onEdit,
    allPartners,
    onEditChild,
    isAdmin = false,
}: {
    partner: Partner;
    level?: number;
    childrenPartners: Partner[];
    onEdit: (p: Partner) => void;
    allPartners: Partner[];
    onEditChild: (p: Partner) => void;
    isAdmin?: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = childrenPartners.length > 0;

    return (
        <>
            <tr
                onClick={() => onEdit(partner)}
                className="adm-clickable-row"
            >
                <td>
                    <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${level * 22}px` }}
                    >
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="w-5 h-5 grid place-items-center rounded-[5px] hover:bg-[#edf2e7] text-[#5a6b82]"
                                aria-label={isExpanded ? "하위 접기" : "하위 펼치기"}
                            >
                                <AdminIcon
                                    name={isExpanded ? "chevron-down" : "chevron-right"}
                                    className="!w-3.5 !h-3.5"
                                />
                            </button>
                        ) : (
                            <span className="w-5 shrink-0 text-center text-[#b8c4b1] text-xs">
                                {level > 0 ? "└" : ""}
                            </span>
                        )}

                        <div className="adm-person">
                            <span className={`adm-person-circle ${level > 0 ? "alt" : ""}`}>
                                {(partner.companyName || partner.loginId || "P").charAt(0)}
                            </span>
                            <span>
                                <strong className="flex items-center gap-1.5">
                                    {partner.companyName}
                                    {level === 0 && (
                                        <span className="adm-pill teal !py-0.5 !px-1.5 !text-[9.5px]">
                                            Master
                                        </span>
                                    )}
                                    {partner.role === "tm" && (
                                        <span className="adm-pill gray !py-0.5 !px-1.5 !text-[9.5px]">
                                            TM
                                        </span>
                                    )}
                                </strong>
                                <small className="font-mono">
                                    {partner.loginId} · /p/{partner.customUrl}
                                </small>
                            </span>
                        </div>
                    </div>
                </td>
                <td>
                    <div className="text-xs font-semibold text-[#162438]">
                        {partner.shopType || "제휴 파트너"}
                    </div>
                    <div className="text-[11px] text-[#788699] mt-0.5 truncate max-w-[200px]">
                        {partner.partnerGroup || "전체 상품 판매"}
                    </div>
                </td>
                <td>
                    <div className="text-xs font-semibold text-[#162438]">
                        {partner.managerName || "-"}
                    </div>
                    <div className="text-[11px] text-[#788699] mt-0.5 tabular-nums">
                        {partner.managerPhone || "-"}
                    </div>
                    {(partner.affiliation || partner.employeeNumber || partner.departmentName) && (
                        <div className="text-[10.5px] text-[#163a6b] mt-0.5 font-medium">
                            {[partner.affiliation, partner.departmentName, partner.employeeNumber]
                                .filter(Boolean)
                                .join(" · ")}
                        </div>
                    )}
                </td>
                <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                            className={`adm-pill ${
                                partner.status === "active" ? "green" : "gray"
                            }`}
                        >
                            {partner.status === "active" ? "정상 운영" : "중지"}
                        </span>
                        {getLandingBadge(partner)}
                    </div>
                </td>
                <td
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                            type="button"
                            onClick={() => onEdit(partner)}
                            className="adm-btn small"
                        >
                            <span>상세 · 수정</span>
                            <AdminIcon name="chevron-right" className="!w-3.5 !h-3.5" />
                        </button>
                        {isAdmin && partner.loginId && (
                            <a
                                href={`/partner-center?id=${partner.loginId}&k=${
                                    process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ||
                                    "sono_admin_master_pass_2026"
                                }`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="adm-btn small sage"
                            >
                                <span>어드민</span>
                                <AdminIcon name="external" className="!w-3.5 !h-3.5" />
                            </a>
                        )}
                    </div>
                </td>
            </tr>

            {isExpanded &&
                childrenPartners.map((child) => {
                    const grandChildren = allPartners.filter(
                        (p) => p.parentPartnerId === child.partnerId
                    );
                    return (
                        <PartnerRow
                            key={child.partnerId}
                            partner={child}
                            level={level + 1}
                            childrenPartners={grandChildren}
                            onEdit={onEditChild}
                            allPartners={allPartners}
                            onEditChild={onEditChild}
                            isAdmin={isAdmin}
                        />
                    );
                })}
        </>
    );
}

export default function PartnerManagement({
    partners: rawPartners,
    onRefresh,
    isAdmin = false,
    mode = "default",
}: PartnerManagementProps) {
    const partners =
        mode === "maeum"
            ? rawPartners.filter((p) => p.landingVisibility?.maeum === true)
            : rawPartners;
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [initialFormData, setInitialFormData] = useState<Partial<Partner> | null>(
        null
    );

    const handleEdit = (partner: Partner) => {
        setSelectedPartner(partner);
        setInitialFormData(null);
        setIsModalOpen(true);
    };

    const handleRegister = () => {
        if (!isAdmin) return;
        setSelectedPartner(null);
        setInitialFormData(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedPartner(null);
    };

    const handleSuccess = () => {
        handleModalClose();
        onRefresh();
    };

    const allRootPartners = partners.filter(
        (p) =>
            !p.parentPartnerId ||
            p.parentPartnerId === "admin" ||
            p.parentPartnerId === "" ||
            !partners.find((parent) => parent.partnerId === p.parentPartnerId)
    );

    const activeCount = partners.filter((p) => p.status === "active").length;
    const activeRatio =
        partners.length > 0 ? Math.round((activeCount / partners.length) * 100) : 0;

    const filteredPartners = partners.filter(
        (p) =>
            (p.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.loginId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.partnerId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.managerName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSearching = searchTerm.length > 0;

    const rootPartners = (isSearching ? filteredPartners : allRootPartners).filter(
        (p) => {
            if (selectedOrgId === "all") return true;
            if (p.partnerId === selectedOrgId) return true;
            return p.parentPartnerId === selectedOrgId;
        }
    );

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">
                        {mode === "maeum" ? "MAEUM · PARTNERS" : "SONO I'M READY · PARTNERS"}
                    </div>
                    <h1>{mode === "maeum" ? "파트너 관리 (마음든든)" : "파트너 관리"}</h1>
                    <p>
                        {mode === "maeum"
                            ? "마음든든 상품 파트너의 소속·사원번호·부서명 및 전용 랜딩을 관리하세요."
                            : "함께 성장하는 파트너 조직과 전용 랜딩·계정 상태를 관리하세요."}
                    </p>
                </div>
                <div className="adm-heading-buttons">
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="adm-btn"
                        title="새로고침"
                    >
                        <AdminIcon name="refresh" />
                        <span>새로고침</span>
                    </button>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleRegister}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="plus" />
                            <span>파트너 신규 등록</span>
                        </button>
                    )}
                </div>
            </section>

            {/* 파트너 지표 요약 */}
            <div className="adm-metrics-grid">
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>전체 파트너</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="network" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {partners.length}
                        <span>개사</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">등록 조직</span>
                        <span>하위 파트너 포함</span>
                    </div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>정상 운영중</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="check-circle" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {activeCount}
                        <span>개사</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">{activeRatio}%</span>
                        <span>활성 운영 비율</span>
                    </div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>상위(마스터) 조직</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="building" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {allRootPartners.length}
                        <span>개사</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">최상위 그룹</span>
                        <span>본사 직속 파트너</span>
                    </div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>하위 파트너 · TM</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="users" />
                        </span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">
                        {Math.max(0, partners.length - allRootPartners.length)}
                        <span>계정</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">산하 조직</span>
                        <span>하위 제휴 및 상담원</span>
                    </div>
                </article>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-5 items-start">
                {/* 좌측 파트너 조직 트리 선택 패널 */}
                <section className="adm-panel p-4">
                    <h2 className="text-sm font-bold text-[#162438] mb-3 px-2">
                        파트너 조직도
                    </h2>
                    <div className="space-y-1 max-h-[520px] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedOrgId("all")}
                            className={`w-full flex items-center gap-2 text-xs px-2.5 py-2.5 rounded-[7px] transition-colors cursor-pointer border-0 ${
                                selectedOrgId === "all"
                                    ? "bg-[#edf3e8] text-[#163a6b] font-bold"
                                    : "bg-transparent text-[#6d7c6b] hover:bg-[#f4f6fa]"
                            }`}
                        >
                            <AdminIcon name="network" className="!w-4 !h-4" />
                            <span className="truncate">전체 조직</span>
                            <b className="ml-auto text-[10px] text-[#788699]">
                                {partners.length}
                            </b>
                        </button>
                        {allRootPartners.map((rp) => {
                            const subCount = partners.filter(
                                (c) => c.parentPartnerId === rp.partnerId
                            ).length;
                            return (
                                <button
                                    key={rp.partnerId}
                                    type="button"
                                    onClick={() => setSelectedOrgId(rp.partnerId)}
                                    className={`w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-[7px] transition-colors cursor-pointer border-0 ${
                                        selectedOrgId === rp.partnerId
                                            ? "bg-[#edf3e8] text-[#163a6b] font-bold"
                                            : "bg-transparent text-[#6d7c6b] hover:bg-[#f4f6fa]"
                                    }`}
                                >
                                    <AdminIcon
                                        name="building"
                                        className="!w-3.5 !h-3.5 shrink-0"
                                    />
                                    <span className="truncate">{rp.companyName}</span>
                                    {subCount > 0 && (
                                        <b className="ml-auto text-[10px] text-[#788699]">
                                            +{subCount}
                                        </b>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-[10.5px] text-[#788699] mt-4 px-2 leading-relaxed border-t border-[#eaeff7] pt-3">
                        조직을 선택하면 해당 파트너 및 산하 파트너 목록을 필터링합니다.
                    </p>
                </section>

                {/* 우측 통합 파트너 목록 패널 */}
                <section className="adm-panel min-w-0">
                    <div className="adm-filter-bar">
                        <label className="adm-search-field">
                            <AdminIcon name="search" />
                            <input
                                type="text"
                                placeholder="파트너사명, 로그인 ID, 담당자 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </label>

                        {selectedOrgId !== "all" && (
                            <button
                                type="button"
                                onClick={() => setSelectedOrgId("all")}
                                className="adm-btn small"
                            >
                                <AdminIcon name="refresh" />
                                <span>조직 필터 해제</span>
                            </button>
                        )}

                        <div className="adm-filter-end">
                            <span>
                                전체{" "}
                                <strong className="text-[#163a6b]">
                                    {partners.length}
                                </strong>
                                개사
                            </span>
                        </div>
                    </div>

                    <div className="adm-table-scroll">
                        <table className="adm-table">
                            <thead>
                                <tr>
                                    <th>파트너사 · 계정 정보</th>
                                    <th>업종 · 판매 상품군</th>
                                    <th>담당자</th>
                                    <th>운영 상태 · 공식 URL</th>
                                    <th className="text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rootPartners.length > 0 ? (
                                    rootPartners.map((p) => {
                                        const children = isSearching
                                            ? []
                                            : partners.filter(
                                                  (child) =>
                                                      child.parentPartnerId ===
                                                      p.partnerId
                                              );

                                        return (
                                            <PartnerRow
                                                key={p.partnerId}
                                                partner={p}
                                                childrenPartners={children}
                                                onEdit={handleEdit}
                                                allPartners={partners}
                                                onEditChild={handleEdit}
                                                isAdmin={isAdmin}
                                            />
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-16 text-center text-xs text-[#788699]"
                                        >
                                            검색 조건에 맞는 파트너가 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="adm-table-foot">
                        <span>파트너 행을 클릭하면 상세 정보 및 노출 설정을 편집할 수 있습니다.</span>
                        <span>표시 그룹 {rootPartners.length}개</span>
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <PartnerFormModal
                    partner={selectedPartner}
                    initialData={initialFormData || undefined}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                    isAdmin={isAdmin}
                    mode={mode}
                />
            )}
        </div>
    );
}
