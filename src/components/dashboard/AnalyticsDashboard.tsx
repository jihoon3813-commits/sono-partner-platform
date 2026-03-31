"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function AnalyticsDashboard() {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [selectedPartner, setSelectedPartner] = useState("");

    const stats = useQuery(api.analytics.getStatsSummary, {
        startDate,
        endDate,
        partnerId: selectedPartner || undefined
    });

    const partners = useQuery(api.partners.getAllPartners);

    if (!stats) return <div className="p-10 text-center font-bold text-gray-400">통계 데이터를 불러오는 중...</div>;

    const maxDailyPv = Math.max(...(stats.daily.map((d: any) => Math.max(d.pv, d.uv)) || [1]), 1);
    const maxPartnerPv = Math.max(...(stats.partner.map((p: any) => p.pv) || [1]), 1);

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Filters */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">시작일</label>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">종료일</label>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">파트너사 필터</label>
                    <select 
                        value={selectedPartner}
                        onChange={(e) => setSelectedPartner(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary"
                    >
                        <option value="">전체 파트너</option>
                        {partners?.map(p => (
                            <option key={p.partnerId} value={p.partnerId}>{p.companyName} ({p.partnerId})</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 text-right">
                    <p className="text-[11px] font-bold text-gray-400">데이터 업데이트</p>
                    <p className="text-xs font-bold text-sono-primary">실시간 자동 갱신</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">전체 페이지 뷰 (PV)</p>
                    <h3 className="text-4xl font-black text-sono-dark tracking-tighter">{stats.totalPv.toLocaleString()} <span className="text-lg font-bold text-gray-300 ml-1">건</span></h3>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 mb-1">전체 방문자 수 (UV)</p>
                    <h3 className="text-4xl font-black text-sono-primary tracking-tighter">{stats.totalUv.toLocaleString()} <span className="text-lg font-bold text-gray-300 ml-1">명</span></h3>
                </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="font-bold text-sono-dark">일별 추이 (PV/UV)</h4>
                    <div className="flex gap-4 text-[11px] font-bold">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sono-primary"></span> PV</div>
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200"></span> UV</div>
                    </div>
                </div>
                {stats.daily.length > 0 ? (
                    <div className="h-64 flex items-stretch gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-thin">
                        <div className="flex-1"></div> {/* Left spacer */}
                        {stats.daily.map((d: any) => (
                            <div key={d.date} className="flex-shrink-0 w-16 md:w-20 flex flex-col items-center group relative h-full">
                                <div className="w-full flex justify-center items-end gap-[4px] flex-1 pb-2">
                                    {/* PV Container */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-black text-sono-primary">{d.pv}</span>
                                        <div 
                                            className="w-3 bg-sono-primary rounded-t-sm transition-all group-hover:brightness-110"
                                            style={{ height: `${Math.max((d.pv / maxDailyPv) * 70, d.pv > 0 ? 4 : 0)}%` }}
                                        ></div>
                                    </div>
                                    {/* UV Container */}
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[9px] font-black text-gray-400">{d.uv}</span>
                                        <div 
                                            className="w-3 bg-gray-200 rounded-t-sm transition-all group-hover:bg-gray-300"
                                            style={{ height: `${Math.max((d.uv / maxDailyPv) * 70, d.uv > 0 ? 4 : 0)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 pb-1 flex-shrink-0">{d.date.substring(5)}</span>
                            </div>
                        ))}
                        <div className="flex-1"></div> {/* Right spacer */}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 font-bold">데이터가 없습니다.</div>
                )}
            </div>

            {/* Page Breakdown */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <h4 className="font-bold text-sono-dark mb-8">인기 페이지 (페이지별 PV)</h4>
                <div className="space-y-4">
                    {stats.paths && stats.paths.length > 0 ? (
                        stats.paths.slice(0, 10).map((p: any, idx: number) => (
                            <div key={p.path} className="flex items-center gap-4 group">
                                <span className="w-6 text-xs font-bold text-gray-300">{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-sono-dark truncate uppercase tracking-tight">{p.path}</p>
                                    <p className="text-[10px] font-bold text-gray-400">
                                        {p.path.includes('/inquiry') ? '상담신청 페이지' : p.path === '/' ? '메인/랜딩' : '기타 페이지'}
                                    </p>
                                </div>
                                <div className="flex gap-8">
                                    <div className="flex flex-col items-end w-16">
                                        <p className="text-sm font-black text-sono-dark">{p.pv.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400">PV</p>
                                    </div>
                                    <div className="flex flex-col items-end w-16">
                                        <p className="text-sm font-black text-sono-primary">{p.uv.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400">UV</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-gray-400 font-bold">인기 페이지 데이터가 없습니다.</div>
                    )}
                </div>
            </div>

            {/* Partner Breakdown */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h4 className="font-bold text-sono-dark">파트너 사이트별 성과</h4>
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[11px] font-bold leading-tight">
                        ※ 전체 PV는 필터링된 모든 페이지뷰의 합이며,<br/>
                        전체 UV는 사이트 전체에서의 중복 방문자를 제외한 순수 방문자 수입니다.
                    </div>
                </div>
                <div className="space-y-4">
                    {stats.partner.length > 0 ? (
                        stats.partner.map((p: any, idx: number) => {
                            const pInfo = partners?.find((pt: any) => pt.partnerId === p.partnerId);
                            return (
                                <div key={p.partnerId} className="flex items-center gap-4 group">
                                    <span className="w-6 text-xs font-bold text-gray-300">{idx + 1}</span>
                                    <div className="w-32 md:w-48">
                                        <p className="text-sm font-bold text-sono-dark truncate">{pInfo?.companyName || p.partnerId}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{p.partnerId}</p>
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-sono-primary/60 group-hover:bg-sono-primary transition-all duration-500 rounded-full"
                                            style={{ width: `${(p.pv / maxPartnerPv) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex flex-col items-end w-20">
                                        <p className="text-sm font-black text-sono-dark">{p.pv.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400">PV</p>
                                    </div>
                                    <div className="flex flex-col items-end w-20">
                                        <p className="text-sm font-black text-sono-primary">{p.uv.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400">UV</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center text-gray-400 font-bold">집계된 파트너 데이터가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
