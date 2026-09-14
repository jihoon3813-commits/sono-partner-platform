"use client";

import { useState } from "react";
import { PartnerRequest } from "@/lib/types";

interface PartnerRequestsProps {
    requests: PartnerRequest[];
    allRequests?: PartnerRequest[];
    onRefresh: () => void;
    onSelectRequest?: (req: PartnerRequest) => void;
}

export default function PartnerRequests({ requests, allRequests, onRefresh, onSelectRequest }: PartnerRequestsProps) {
    const [filterTab, setFilterTab] = useState<"pending" | "hold" | "all">("pending");

    const sourceList = (allRequests && allRequests.length > 0) ? allRequests : requests;

    const pendingCount = sourceList.filter(r => r.status === "pending").length;
    const holdCount = sourceList.filter(r => r.status === "hold").length;
    const totalCount = sourceList.length;

    const filteredRequests = sourceList.filter(r => {
        if (filterTab === "pending") return r.status === "pending";
        if (filterTab === "hold") return r.status === "hold";
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200">대기</span>;
            case "hold":
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-200">보류</span>;
            case "approved":
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-200">승인완료</span>;
            case "rejected":
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-50 text-red-600 border border-red-200">반려</span>;
            default:
                return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200">{status || "-"}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-sono-dark">파트너 입점 신청</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        신청 대기 <strong className="text-sono-primary">{pendingCount}</strong>건 / 보류 <strong className="text-orange-600">{holdCount}</strong>건
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setFilterTab("pending")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                filterTab === "pending"
                                    ? "bg-white text-sono-primary shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            신청 대기
                            {pendingCount > 0 && (
                                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setFilterTab("hold")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                filterTab === "hold"
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            보류
                            {holdCount > 0 && (
                                <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.2 rounded-full">
                                    {holdCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setFilterTab("all")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                filterTab === "all"
                                    ? "bg-white text-sono-dark shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            전체 ({totalCount})
                        </button>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="p-2 text-gray-400 hover:text-sono-primary transition-colors"
                        title="새로고침"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">상태</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">신청일시</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">업체명</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">담당자</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">쇼핑몰 유형</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-sono-dark">{req.companyName}</div>
                                            <div className="text-xs text-gray-400 mt-1">{req.businessNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-sono-dark">{req.managerName}</div>
                                            <div className="text-xs text-gray-400 mt-1">{req.managerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">{req.shopType}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => onSelectRequest?.(req)}
                                                className="bg-sono-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-sm"
                                            >
                                                {req.status === 'approved' ? '상세보기' : '검토/승인'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        {filterTab === "pending" ? "새로운 신청 대기 내역이 없습니다." :
                                         filterTab === "hold" ? "보류된 신청 내역이 없습니다." :
                                         "신청 내역이 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
