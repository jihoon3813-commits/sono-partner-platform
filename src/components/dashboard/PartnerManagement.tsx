"use client";

import { useState } from "react";
import { Partner } from "@/lib/types";
import PartnerFormModal from "./PartnerFormModal";

interface PartnerManagementProps {
    partners: Partner[];
    onRefresh: () => void;
    isAdmin?: boolean;
}

// Tree view component for hierarchical display
function PartnerRow({
    partner,
    level = 0,
    childrenPartners,
    onEdit,
    allPartners,
    onEditChild
}: {
    partner: Partner;
    level?: number;
    childrenPartners: Partner[];
    onEdit: (p: Partner) => void;
    allPartners: Partner[];
    onEditChild: (p: Partner) => void;
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
                    <div className="text-xs text-gray-400 mt-1">{partner.shopType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-sono-dark">{partner.managerName}</div>
                    <div className="text-xs text-gray-400 mt-1">{partner.managerPhone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${partner.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                        }`}>
                        {partner.status === 'active' ? '정상' : '중지'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                        onClick={() => onEdit(partner)}
                        className="text-sono-primary hover:text-sono-primary/80 text-xs font-bold"
                    >
                        상세/수정
                    </button>
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
    onEditChild
}: {
    partner: Partner;
    level?: number;
    childrenPartners: Partner[];
    onEdit: (p: Partner) => void;
    allPartners: Partner[];
    onEditChild: (p: Partner) => void;
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
                                <div className="text-lg font-bold text-sono-dark flex items-center gap-2">
                                    {partner.companyName}
                                    {level === 0 && <span className="text-[10px] bg-sono-primary/10 text-sono-primary px-1.5 py-0.5 rounded">Master</span>}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                    <span>ID: {partner.loginId}</span>
                                    <span>•</span>
                                    <span>{partner.shopType}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${partner.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                            {partner.status === 'active' ? '정상' : '중지'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-5 bg-[#f9fafb] p-4 rounded-xl">
                        <div className="col-span-1">
                            <span className="text-xs text-[#8b95a1] block mb-1">담당자</span>
                            <span className="font-bold text-sono-dark">{partner.managerName}</span>
                        </div>
                        <div className="col-span-1">
                            <span className="text-xs text-[#8b95a1] block mb-1">연락처</span>
                            <span className="font-bold text-sono-dark">{partner.managerPhone}</span>
                        </div>
                        <div className="col-span-2 border-t border-gray-100 mt-1 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#8b95a1]">전용 URL</span>
                                <span className="font-mono text-xs text-sono-primary bg-sono-primary/5 px-2 py-1 rounded">/p/{partner.customUrl}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => onEdit(partner)}
                        className="w-full py-3 rounded-xl border border-gray-200 text-sono-dark font-bold text-sm hover:bg-[#f9fafb] hover:border-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        상세 정보 및 수정
                    </button>
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
                    />
                );
            })}
        </div>
    );
}

export default function PartnerManagement({ partners, onRefresh, isAdmin = false }: PartnerManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

    const handleEdit = (partner: Partner) => {
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    const handleRegister = () => {
        setSelectedPartner(null);
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

    // Filter partners first
    const filteredPartners = partners.filter(p =>
        (p.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.loginId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.partnerId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.managerName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Build hierarchy from filtered partners
    // 1. Find root partners (those whose parent is not in the list or is 'admin' or empty)
    //    BUT if we are filtering, we might only see a child. 
    //    The requirement is likely to show structure.
    //    If search term is active, just show flat list. If not, show hierarchy.

    const isSearching = searchTerm.length > 0;

    const rootPartners = isSearching
        ? filteredPartners
        : partners.filter(p => !p.parentPartnerId || p.parentPartnerId === 'admin' || p.parentPartnerId === '' || !partners.find(parent => parent.partnerId === p.parentPartnerId));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-sono-dark">파트너 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">총 {partners.length}개의 파트너가 있습니다.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="파트너사명, ID, 담당자 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sono-primary focus:border-transparent outline-none w-full md:w-64"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={handleRegister}
                            className="flex-1 md:flex-none bg-sono-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-sono-primary/90 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            파트너 신규 등록
                        </button>
                        <button
                            onClick={onRefresh}
                            className="p-2 text-gray-400 hover:text-sono-primary transition-colors bg-gray-50 rounded-xl md:bg-transparent"
                            title="새로고침"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">파트너 ID / 주소</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">파트너사 정보</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">담당자</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">상태</th>
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
                            />
                        );
                    })
                ) : (
                    <div className="py-20 text-center text-gray-400 font-medium bg-white rounded-2xl shadow-sm">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <PartnerFormModal
                    partner={selectedPartner}
                    onClose={handleModalClose}
                    onSuccess={handleSuccess}
                    isAdmin={isAdmin}
                />
            )}
        </div>
    );
}
