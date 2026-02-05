"use client";

import { PartnerRequest } from "@/lib/types";

interface PartnerRequestsProps {
    requests: PartnerRequest[];
    onRefresh: () => void;
    onSelectRequest?: (req: PartnerRequest) => void;
}

export default function PartnerRequests({ requests, onRefresh, onSelectRequest }: PartnerRequestsProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-sono-dark">파트너 입점 신청</h2>
                    <p className="text-sm text-gray-500 mt-1">총 {requests.length}건의 신규 신청이 있습니다.</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="p-2 text-gray-400 hover:text-sono-primary transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#f9fafb] border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">신청일시</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">업체명</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">담당자</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider">쇼핑몰 유형</th>
                                <th className="px-6 py-4 text-xs font-bold text-[#8b95a1] uppercase tracking-wider text-right">상태</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <tr key={req.requestId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">
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
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onSelectRequest?.(req)}
                                                className="bg-sono-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all"
                                            >
                                                검토/승인
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        새로운 신청 내역이 없습니다.
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
