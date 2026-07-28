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

    const maxDaily = Math.max(...(stats.daily.map((d: any) => Math.max(d.pv, d.uv, d.apps)) || [1]), 1);
    const maxPartnerPv = Math.max(...(stats.partner.map((p: any) => p.pv) || [1]), 1);

    return (
        <div className="space-y-8 animate-slide-up pb-20">
            {/* Filters */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">기간 설정</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {[
                                { label: "당일", range: "today" },
                                { label: "전일", range: "yesterday" },
                                { label: "당월", range: "thisMonth" },
                                { label: "전월", range: "lastMonth" },
                                { label: "3개월", range: "3months" },
                            ].map((btn) => (
                                <button
                                    key={btn.range}
                                    onClick={() => {
                                        const now = new Date();
                                        const kstNow = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
                                        const format = (d: Date) => d.toISOString().split('T')[0];
                                        
                                        let start = format(kstNow);
                                        let end = format(kstNow);
                                        
                                        if (btn.range === 'yesterday') {
                                            const d = new Date(kstNow);
                                            d.setDate(d.getDate() - 1);
                                            start = format(d);
                                            end = format(d);
                                        } else if (btn.range === 'thisMonth') {
                                            const d = new Date(kstNow.getFullYear(), kstNow.getMonth(), 1, 12);
                                            start = format(d);
                                        } else if (btn.range === 'lastMonth') {
                                            const s = new Date(kstNow.getFullYear(), kstNow.getMonth() - 1, 1, 12);
                                            const e = new Date(kstNow.getFullYear(), kstNow.getMonth(), 0, 12);
                                            start = format(s);
                                            end = format(e);
                                        } else if (btn.range === '3months') {
                                            const d = new Date(kstNow);
                                            d.setMonth(d.getMonth() - 3);
                                            start = format(d);
                                        }
                                        
                                        setStartDate(start);
                                        setEndDate(end);
                                    }}
                                    className="px-2.5 py-1.5 bg-white border border-gray-100 hover:border-sono-primary hover:text-sono-primary text-gray-400 rounded-xl text-[10px] font-black transition-all shadow-sm active:scale-95"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary transition-all cursor-pointer"
                            />
                            <span className="text-gray-300">~</span>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                onClick={(e) => { try { e.currentTarget.showPicker?.(); } catch (err) {} }}
                                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary transition-all cursor-pointer"
                            />
                        </div>
                    </div>
                <div className="w-full md:w-64">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">파트너사 필터</label>
                    <select 
                        value={selectedPartner}
                        onChange={(e) => setSelectedPartner(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-sono-dark focus:ring-2 focus:ring-sono-primary appearance-none cursor-pointer"
                    >
                        <option value="">전체 파트너 현황</option>
                        {partners?.map(p => (
                            <option key={p.partnerId} value={p.partnerId}>{p.companyName} ({p.partnerId})</option>
                        ))}
                    </select>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-[11px] font-bold text-gray-400">실시간 데이터</p>
                    <div className="flex items-center justify-end gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-xs font-bold text-emerald-600">LIVE</p>
                    </div>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-1">전체 페이지 뷰 (PV)</p>
                    <h3 className="text-4xl font-black text-sono-dark tracking-tighter">{stats.totalPv.toLocaleString()} <span className="text-lg font-bold text-gray-300 ml-1">건</span></h3>
                    <div className="mt-4 flex items-center gap-2 text-blue-600 text-[10px] font-bold bg-blue-50 w-fit px-2 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        사용자 활동량
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-1">순 방문자 수 (UV)</p>
                    <h3 className="text-4xl font-black text-indigo-600 tracking-tighter">{stats.totalUv.toLocaleString()} <span className="text-lg font-bold text-gray-300 ml-1">명</span></h3>
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 text-[10px] font-bold bg-indigo-50 w-fit px-2 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        순수 유입 규모
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-24 h-24 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mb-1">상담 신청 건수 (APPLY)</p>
                    <h3 className="text-4xl font-black text-orange-600 tracking-tighter">{stats.totalApps?.toLocaleString() || 0} <span className="text-lg font-bold text-gray-300 ml-1">건</span></h3>
                    <div className="mt-4 flex items-center gap-2 text-orange-600 text-[10px] font-bold bg-orange-50 w-fit px-2 py-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        전환 성과
                    </div>
                </div>
            </div>

            {/* Daily Chart */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h4 className="font-bold text-lg text-sono-dark tracking-tighter">일별 성과 추이</h4>
                        <p className="text-xs text-gray-400 font-medium">유입 대비 신청 전환율을 날짜별로 확인하세요.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20"></span> <span className="text-[11px] font-bold text-gray-500">PV</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/20"></span> <span className="text-[11px] font-bold text-gray-500">UV</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/20"></span> <span className="text-[11px] font-bold text-gray-500">APPLY</span></div>
                    </div>
                </div>
                {stats.daily.length > 0 ? (
                    <div className="h-80 flex items-stretch gap-1 md:gap-3 overflow-x-auto pb-4 scrollbar-thin">
                        {stats.daily.map((d: any) => (
                            <div key={d.date} className="flex-shrink-0 w-[70px] md:w-[90px] flex flex-col items-center group h-full">
                                <div className="w-full flex justify-center items-end gap-[4px] flex-1 pb-3 h-full relative">
                                    {/* Grid line */}
                                    <div className="absolute inset-x-0 bottom-3 h-px bg-gray-50"></div>
                                    
                                    {/* PV Column */}
                                    <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                        <div 
                                            className="w-2.5 bg-blue-500 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm"
                                            style={{ height: `${Math.max((d.pv / maxDaily) * 80, d.pv > 0 ? 3 : 0)}%` }}
                                            title={`PV: ${d.pv}`}
                                        ></div>
                                    </div>
                                    {/* UV Column */}
                                    <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                        <div 
                                            className="w-2.5 bg-indigo-400 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm"
                                            style={{ height: `${Math.max((d.uv / maxDaily) * 80, d.uv > 0 ? 3 : 0)}%` }}
                                            title={`UV: ${d.uv}`}
                                        ></div>
                                    </div>
                                    {/* Apps Column */}
                                    <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                        <div 
                                            className="w-2.5 bg-orange-500 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm"
                                            style={{ height: `${Math.max((d.apps / maxDaily) * 80, d.apps > 0 ? 3 : 0)}%` }}
                                            title={`Apply: ${d.apps}`}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-black text-sono-dark uppercase">{d.date.substring(8)}일</span>
                                    <span className="text-[8px] font-bold text-gray-300">{d.date.substring(5, 7)}월</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 font-bold">데이터가 없습니다.</div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Page Breakdown */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col">
                    <h4 className="font-bold text-sono-dark mb-8 flex items-center gap-2">
                        <svg className="w-5 h-5 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        주요 페이지 유입 경로
                    </h4>
                    <div className="flex-1 space-y-4">
                        {stats.paths && stats.paths.length > 0 ? (
                            stats.paths.slice(0, 8).map((p: any, idx: number) => (
                                <div key={p.path} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                                    <span className="w-6 text-xs font-black text-gray-200">{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-sono-dark truncate uppercase tracking-tight">{p.path}</p>
                                        <p className="text-[9px] font-bold text-gray-400">
                                            {p.path.includes('/inquiry') ? '상담신청 페이지' : p.path === '/' ? '메인/랜딩' : '기타 페이지'}
                                        </p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-black text-sono-dark">{p.pv.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-gray-400">PV</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-indigo-600">{p.uv.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-gray-400">UV</p>
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
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="font-bold text-sono-dark flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            파트너별 성과 비교
                        </h4>
                    </div>
                    <div className="flex-1 space-y-5">
                        {stats.partner.length > 0 ? (
                            stats.partner.map((p: any, idx: number) => {
                                const pInfo = partners?.find((pt: any) => pt.partnerId === p.partnerId);
                                const conversion = p.uv > 0 ? ((p.apps / p.uv) * 100).toFixed(1) : "0.0";
                                return (
                                    <div key={p.partnerId} className="group">
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-gray-300">#{idx + 1}</span>
                                                <p className="text-xs font-black text-sono-dark truncate max-w-[120px]">{pInfo?.companyName || p.partnerId}</p>
                                            </div>
                                            <div className="flex gap-4">
                                                <span className="text-[10px] font-bold text-gray-400">UV <span className="text-sono-dark">{p.uv.toLocaleString()}</span></span>
                                                <span className="text-[10px] font-bold text-gray-400">APPLY <span className="text-orange-600">{p.apps.toLocaleString()}</span></span>
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-md">{conversion}%</span>
                                            </div>
                                        </div>
                                        <div className="relative h-2 bg-gray-50 rounded-full overflow-hidden">
                                            <div 
                                                className="absolute inset-y-0 left-0 bg-sono-primary/60 group-hover:bg-sono-primary transition-all duration-700 rounded-full"
                                                style={{ width: `${(p.pv / maxPartnerPv) * 100}%` }}
                                            ></div>
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
        </div>
    );
}
