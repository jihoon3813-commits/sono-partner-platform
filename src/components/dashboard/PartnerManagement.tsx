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
}

function getLandingBadge(p: Partner) {
    const isHidden = p.showLandingUrl === false || (p as any).showLandingUrl === 'false';
    const lv = p.landingVisibility;

    const smartcare = !isHidden && (lv?.smartcare !== false);
    const happy450 = !isHidden && (lv?.happy450 !== false);
    const maeum = !isHidden && (lv?.maeum === true);

    const count = (smartcare ? 1 : 0) + (happy450 ? 1 : 0) + (maeum ? 1 : 0);

    if (count === 0) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200" title="공식 상품 대표 URL 미노출">
                URL 미노출
            </span>
        );
    }

    if (count === 3) {
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200" title="공식 상품 대표 URL 3종 전체 노출">
                URL 전체노출
            </span>
        );
    }

    const visibleItems = [];
    if (smartcare) visibleItems.push("스마트케어");
    if (happy450) visibleItems.push("더 해피 450");
    if (maeum) visibleItems.push("마음든든");

    return (
        <span 
            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" 
            title={`노출: ${visibleItems.join(', ')}`}
        >
            URL 부분({count}/3)
        </span>
    );
}

// Tree view component for hierarchical display
function PartnerRow({
    partner,
    level = 0,
    childrenPartners,
    onEdit,
    allPartners,
    onEditChild,
    isAdmin = false
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
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                        {hasChildren && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500"
                            >
                                {isExpanded ? (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </button>
                        )}
                        {!hasChildren && <div className="w-5" />} {/* Spacer for indentation alignment */}

                        <div>
                            {/* Display Login ID as the main ID */}
                            <div className="text-sm font-bold text-sono-dark flex items-center gap-2">
                                {partner.loginId}
                                {level === 0 && <span className="text-[10px] bg-sono-primary/10 text-sono-primary px-1.5 py-0.5 rounded">Master</span>}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">/p/{partner.customUrl}</div>
                            <div className="text-[10px] text-sono-primary/60 font-mono mt-0.5">{partner.partnerId}</div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-sono-dark">{partner.companyName}</div>
                    <div className="text-xs text-gray-400 mt-1">{partner.shopType} • {partner.partnerGroup || '전체 상품 판매'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-sono-dark">{partner.managerName}</div>
                    <div className="text-xs text-gray-400 mt-1">{partner.managerPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${partner.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                            {partner.status === 'active' ? '정상' : '중지'}
                        </span>
                        {getLandingBadge(partner)}
                    </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                        onClick={() => onEdit(partner)}
                        className="text-sono-primary hover:text-sono-primary/80 text-xs font-bold"
                    >
                        상세/수정
                    </button>
                    {isAdmin && partner.loginId && (
                        <a
                            href={`/partner-center?id=${partner.loginId}&k=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'sono_admin_master_pass_2026'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-800 text-xs font-bold"
                        >
                            어드민
                        </a>
                    )}
                </td>
            </tr>

            {/* Render children recursively */}
            {isExpanded && childrenPartners.map(child => {
                // Find children of this child (grand-children of current partner)
                const grandChildren = allPartners.filter(p => p.parentPartnerId === child.partnerId);
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

function MobilePartnerRow({
    partner,
    level = 0,
    childrenPartners,
    onEdit,
    allPartners,
    onEditChild,
    isAdmin = false
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
        <div className="mb-3">
            <div
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${level > 0 ? 'ml-4 border-l-4 border-l-sono-primary/20' : ''}`}
            >
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            {hasChildren && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 text-gray-500"
                                >
                                    {isExpanded ? (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    )}
                                </button>
                            )}
                            <div>
                                <div className="font-bold text-sono-dark text-base flex items-center gap-2">
                                    {partner.companyName}
                                    {level === 0 && <span className="text-[10px] bg-sono-primary/10 text-sono-primary px-2 py-0.5 rounded font-black">Master</span>}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">{partner.shopType} • {partner.partnerGroup || '전체 상품 판매'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${partner.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                {partner.status === 'active' ? '정상' : '중지'}
                            </span>
                            {getLandingBadge(partner)}
                        </div>
                    </div>

                    <div className="space-y-2 bg-[#f9fafb] p-3.5 rounded-xl mb-4 text-xs border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-400">아이디</span>
                            <span className="font-bold text-sono-dark">{partner.loginId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">고유 ID</span>
                            <span className="font-mono text-gray-500 text-[11px]">{partner.partnerId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">담당자</span>
                            <span className="font-medium text-sono-dark">{partner.managerName} ({partner.managerPhone})</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">전용 URL</span>
                            <span className="font-mono text-xs text-sono-primary bg-sono-primary/5 px-2 py-1 rounded">/p/{partner.customUrl}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(partner)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sono-dark font-bold text-xs hover:bg-[#f9fafb] transition-all flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            상세/수정
                        </button>
                        {isAdmin && partner.loginId && (
                            <a
                                href={`/partner-center?id=${partner.loginId}&k=${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY || 'sono_admin_master_pass_2026'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <span>어드민 접속</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {isExpanded && childrenPartners.map(child => {
                const grandChildren = allPartners.filter(p => p.parentPartnerId === child.partnerId);
                return (
                    <MobilePartnerRow
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
        </div>
    );
}

export default function PartnerManagement({ partners, onRefresh, isAdmin = false, currentUser }: PartnerManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrgId, setSelectedOrgId] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [initialFormData, setInitialFormData] = useState<Partial<Partner> | null>(null);

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
        p => !p.parentPartnerId || p.parentPartnerId === 'admin' || p.parentPartnerId === '' || !partners.find(parent => parent.partnerId === p.parentPartnerId)
    );

    const activeCount = partners.filter(p => p.status === "active").length;
    const activeRatio = partners.length > 0 ? Math.round((activeCount / partners.length) * 100) : 0;

    // Filter partners first
    const filteredPartners = partners.filter(p =>
        (p.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.loginId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.partnerId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.managerName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSearching = searchTerm.length > 0;

    const rootPartners = (isSearching ? filteredPartners : allRootPartners).filter(p => {
        if (selectedOrgId === "all") return true;
        if (p.partnerId === selectedOrgId) return true;
        return p.parentPartnerId === selectedOrgId;
    });

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · PARTNERS</div>
                    <h1>파트너 관리</h1>
                    <p>함께 성장하는 파트너 조직과 전용 랜딩·계정 상태를 관리하세요.</p>
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
                        <span className="adm-metric-icon"><AdminIcon name="network" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{partners.length}<span>개사</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">등록 조직</span><span>하위 파트너 포함</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>정상 운영중</span>
                        <span className="adm-metric-icon"><AdminIcon name="check-circle" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{activeCount}<span>개사</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">{activeRatio}%</span><span>활성 운영 비율</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>상위(마스터) 조직</span>
                        <span className="adm-metric-icon"><AdminIcon name="building" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{allRootPartners.length}<span>개사</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">최상위 그룹</span><span>본사 직속 파트너</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>하위 파트너 · TM</span>
                        <span className="adm-metric-icon"><AdminIcon name="users" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{Math.max(0, partners.length - allRootPartners.length)}<span>계정</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">산하 조직</span><span>하위 제휴 및 상담원</span></div>
                </article>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-5 items-start">
                {/* 좌측 파트너 조직 트리 선택 패널 (PC) */}
                <section className="hidden lg:block adm-panel p-4">
                    <h2 className="text-sm font-bold text-[#263d36] mb-3 px-2">파트너 조직</h2>
                    <div className="space-y-1 max-h-[480px] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => setSelectedOrgId("all")}
                            className={`w-full flex items-center gap-2 text-xs px-2.5 py-2.5 rounded-[7px] transition-colors cursor-pointer ${
                                selectedOrgId === "all"
                                    ? "bg-[#edf3e8] text-[#295e52] font-bold"
                                    : "text-[#6d7c6b] hover:bg-[#f6f8f3]"
                            }`}
                        >
                            <AdminIcon name="network" className="!w-4 !h-4" />
                            <span className="truncate">전체 조직</span>
                            <b className="ml-auto text-[10px] text-[#86918a]">{partners.length}</b>
                        </button>
                        {allRootPartners.map((rp) => {
                            const subCount = partners.filter(c => c.parentPartnerId === rp.partnerId).length;
                            return (
                                <button
                                    key={rp.partnerId}
                                    type="button"
                                    onClick={() => setSelectedOrgId(rp.partnerId)}
                                    className={`w-full flex items-center gap-2 text-xs px-2.5 py-2 rounded-[7px] transition-colors cursor-pointer ${
                                        selectedOrgId === rp.partnerId
                                            ? "bg-[#edf3e8] text-[#295e52] font-bold"
                                            : "text-[#6d7c6b] hover:bg-[#f6f8f3]"
                                    }`}
                                >
                                    <AdminIcon name="building" className="!w-3.5 !h-3.5 shrink-0" />
                                    <span className="truncate">{rp.companyName}</span>
                                    {subCount > 0 && (
                                        <b className="ml-auto text-[10px] text-[#86918a]">+{subCount}</b>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className="space-y-4 min-w-0">
                    {/* 검색 필터 바 */}
                    <div className="adm-panel px-5 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <label className="flex items-center gap-2.5 border border-[#dfe5d9] rounded-[8px] px-3 py-2 bg-[#f9faf7] focus-within:bg-white focus-within:border-[#295e52] sm:w-80">
                            <AdminIcon name="search" className="!w-4 !h-4 text-[#8e9988]" />
                            <input
                                type="text"
                                placeholder="파트너사명, ID, 담당자 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 outline-none bg-transparent text-xs text-[#263d36] w-full"
                            />
                        </label>
                        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-[#86918a]">
                            {selectedOrgId !== "all" && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedOrgId("all")}
                                    className="adm-btn small"
                                >
                                    조직 필터 초기화
                                </button>
                            )}
                            <span>전체 <strong className="text-[#295e52]">{partners.length}</strong>개사</span>
                        </div>
                    </div>

                    <div className="hidden md:block adm-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">파트너 ID / 주소</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">파트너사 정보</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">담당자</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">상태 / 공식 URL</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rootPartners.length > 0 ? (
                                rootPartners.map((p) => {
                                    // If searching, we show flat list, no children logic here effectively (or we could show children if we wanted but flat is better for search)
                                    // If not searching, find direct children
                                    const children = isSearching ? [] : partners.filter(child => child.parentPartnerId === p.partnerId);

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
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="md:hidden space-y-4">
                {rootPartners.length > 0 ? (
                    rootPartners.map((p) => {
                        const children = isSearching ? [] : partners.filter(child => child.parentPartnerId === p.partnerId);
                        return (
                            <MobilePartnerRow
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
                    <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-2xl shadow-sm">
                        검색 결과가 없습니다.
                    </div>
                )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <PartnerFormModal
                    partner={selectedPartner}
                    initialData={initialFormData || undefined}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}
