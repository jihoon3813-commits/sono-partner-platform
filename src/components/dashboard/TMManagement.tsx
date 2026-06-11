"use client";

import { useState } from "react";
import { Partner } from "@/lib/types";
import TMFormModal from "./TMFormModal";

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
        <div className="space-y-6">
            {/* Upper Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-sono-dark">상담원 계정 관리</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        전체 <b>{tmAccounts.length}명</b>의 상담원 계정이 등록되어 있습니다.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="상담원명, ID, 연락처 검색"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-sono-primary focus:border-transparent outline-none font-bold"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    {/* Register button */}
                    <button
                        onClick={handleRegister}
                        className="bg-sono-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-sono-secondary transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-sono-primary/10"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        상담원 신규 등록
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">로그인 ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상담원 실명</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">연락처 / 이메일</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">등록일자</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTMs.length > 0 ? (
                                filteredTMs.map((tm) => (
                                    <tr key={tm.partnerId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-sono-dark font-mono">{tm.loginId}</div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{tm.partnerId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-sono-dark">{tm.managerName}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-sono-dark">{tm.managerPhone}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">{tm.managerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-sono-dark font-medium">{formatDate(tm.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                tm.status === 'active' 
                                                    ? 'bg-green-50 text-green-600 border border-green-100' 
                                                    : 'bg-red-50 text-red-500 border border-red-100'
                                            }`}>
                                                {tm.status === 'active' ? '정상' : '사용중지'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleEdit(tm)}
                                                className="text-sono-primary hover:text-sono-secondary text-xs font-bold transition-colors"
                                            >
                                                정보수정
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        등록된 상담원 계정이 없거나 검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
                {filteredTMs.length > 0 ? (
                    filteredTMs.map((tm) => (
                        <div key={tm.partnerId} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-base font-bold text-sono-dark">{tm.managerName}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {tm.loginId}</div>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    tm.status === 'active' 
                                        ? 'bg-green-50 text-green-600 border border-green-100' 
                                        : 'bg-red-50 text-red-500 border border-red-100'
                                }`}>
                                    {tm.status === 'active' ? '정상' : '사용중지'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100/50">
                                <div>
                                    <span className="text-gray-400 block mb-0.5">연락처</span>
                                    <span className="font-bold text-sono-dark">{tm.managerPhone}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block mb-0.5">이메일</span>
                                    <span className="font-bold text-sono-dark break-all">{tm.managerEmail}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <span>등록일: {formatDate(tm.createdAt)}</span>
                                <button
                                    onClick={() => handleEdit(tm)}
                                    className="text-sono-primary hover:text-sono-secondary font-bold text-xs"
                                >
                                    정보수정
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center text-gray-400 font-medium bg-white rounded-2xl border border-gray-100 shadow-sm">
                        등록된 상담원 계정이 없거나 검색 결과가 없습니다.
                    </div>
                )}
            </div>

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
