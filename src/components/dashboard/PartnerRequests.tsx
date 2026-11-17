"use client";

import { useState } from "react";
import { PartnerRequest } from "@/lib/types";
import { AdminIcon } from "./AdminIcons";

interface PartnerRequestsProps {
    requests: PartnerRequest[];
    allRequests?: PartnerRequest[];
    onRefresh: () => void;
    onSelectRequest?: (req: PartnerRequest) => void;
}

export default function PartnerRequests({
    requests,
    allRequests,
    onRefresh,
    onSelectRequest,
}: PartnerRequestsProps) {
    const [filterTab, setFilterTab] = useState<"pending" | "hold" | "all">("pending");

    const sourceList = allRequests && allRequests.length > 0 ? allRequests : requests;

    const pendingCount = sourceList.filter((r) => r.status === "pending").length;
    const holdCount = sourceList.filter((r) => r.status === "hold").length;
    const approvedCount = sourceList.filter((r) => r.status === "approved").length;
    const totalCount = sourceList.length;

    const filteredRequests = sourceList.filter((r) => {
        if (filterTab === "pending") return r.status === "pending";
        if (filterTab === "hold") return r.status === "hold";
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="adm-pill orange">심사대기</span>;
            case "hold":
                return <span className="adm-pill gray">보류</span>;
            case "approved":
                return <span className="adm-pill green">승인완료</span>;
            case "rejected":
                return <span className="adm-pill red">반려</span>;
            default:
                return <span className="adm-pill gray">{status || "-"}</span>;
        }
    };

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · APPLICATIONS</div>
                    <h1>입점 신청</h1>
                    <p>신규 파트너의 입점 신청 내역과 심사 진행 상태를 확인하고 승인합니다.</p>
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
                </div>
            </section>

            <div className="adm-metrics-grid">
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>전체 신청</span>
                        <span className="adm-metric-icon"><AdminIcon name="building" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{totalCount}<span>건</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">누적 접수</span><span>전체 입점 신청</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>심사 대기</span>
                        <span className="adm-metric-icon"><AdminIcon name="clock" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{pendingCount}<span>건</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend warning">검토 필요</span><span>신규 신청 건</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>보류</span>
                        <span className="adm-metric-icon"><AdminIcon name="file" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{holdCount}<span>건</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">확인 필요</span><span>보완/재검토</span></div>
                </article>
                <article className="adm-metric !py-4">
                    <div className="adm-metric-head">
                        <span>승인 완료</span>
                        <span className="adm-metric-icon"><AdminIcon name="check-circle" /></span>
                    </div>
                    <div className="adm-metric-value !text-[26px] !my-2">{approvedCount}<span>건</span></div>
                    <div className="adm-metric-foot"><span className="adm-metric-trend">심사 완료</span><span>파트너 전환 완료</span></div>
                </article>
            </div>

            <section className="adm-panel overflow-hidden">
                <div className="px-6 py-4 border-b border-[#edf0e7] flex flex-wrap items-center justify-between gap-3">
                    <div className="adm-segmented">
                        <button
                            type="button"
                            onClick={() => setFilterTab("pending")}
                            className={filterTab === "pending" ? "active" : ""}
                        >
                            신청 대기 ({pendingCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab("hold")}
                            className={filterTab === "hold" ? "active" : ""}
                        >
                            보류 ({holdCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterTab("all")}
                            className={filterTab === "all" ? "active" : ""}
                        >
                            전체 ({totalCount})
                        </button>
                    </div>
                    <span className="text-xs text-[#86918a]">신청일 최신순</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="px-6 py-3.5 text-xs">상태</th>
                                <th className="px-6 py-3.5 text-xs">신청일시</th>
                                <th className="px-6 py-3.5 text-xs">업체명 / 사업자번호</th>
                                <th className="px-6 py-3.5 text-xs">담당자</th>
                                <th className="px-6 py-3.5 text-xs">유형</th>
                                <th className="px-6 py-3.5 text-xs text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eef1e8]">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req.requestId} className="transition-colors">
                                        <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                                        <td className="px-6 py-4 text-xs text-[#6b7768] whitespace-nowrap">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-[#263d36]">
                                                {req.companyName}
                                            </div>
                                            <div className="text-xs text-[#86918a] mt-0.5">
                                                {req.businessNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[#263d36]">
                                                {req.managerName}
                                            </div>
                                            <div className="text-xs text-[#86918a] mt-0.5">
                                                {req.managerPhone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-[#6b7768]">{req.shopType}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => onSelectRequest?.(req)}
                                                className="adm-btn small primary"
                                            >
                                                <span>
                                                    {req.status === "approved" ? "상세보기" : "검토 · 승인"}
                                                </span>
                                                <AdminIcon name="chevron-right" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-16 text-center text-xs text-[#86918a]"
                                    >
                                        {filterTab === "pending"
                                            ? "새로운 신청 대기 내역이 없습니다."
                                            : filterTab === "hold"
                                            ? "보류된 신청 내역이 없습니다."
                                            : "신청 내역이 없습니다."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
