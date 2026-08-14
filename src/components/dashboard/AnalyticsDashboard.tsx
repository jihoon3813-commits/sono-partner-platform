"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import { 
    getKSTDateString, 
    getKSTFirstDayOfMonth, 
    getKSTLastMonthRange, 
    getKSTMonthsAgoDateString 
} from "@/lib/dateUtils";

export default function AnalyticsDashboard() {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const d = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        return getKSTDateString(d);
    });
    const [endDate, setEndDate] = useState(() => getKSTDateString());
    const [selectedPartner, setSelectedPartner] = useState("");
    
    // 선택한 일자 상세 분석 상태
    const [selectedDate, setSelectedDate] = useState<string>(() => getKSTDateString());
    const [detailTab, setDetailTab] = useState<"referrers" | "ips" | "logs">("referrers");
    const [searchLogQuery, setSearchLogQuery] = useState("");
    const [isSeeding, setIsSeeding] = useState(false);

    const stats = useQuery(api.analytics.getStatsSummary, {
        startDate,
        endDate,
        partnerId: selectedPartner || undefined
    });

    const dailyDetails = useQuery(api.analytics.getDailyDetailLogs, {
        date: selectedDate,
        partnerId: selectedPartner || undefined
    });

    const partners = useQuery(api.partners.getAllPartners);
    const seedSample = useMutation(api.analytics.seedSampleAnalytics);

    const handleSeedData = async () => {
        try {
            setIsSeeding(true);
            await seedSample({ date: selectedDate || getKSTDateString() });
            alert(`[${selectedDate}] 선택 일자에 샘플 유입/IP 데이터 15건이 생성되었습니다.`);
        } catch (err) {
            console.error(err);
            alert("샘플 데이터 생성 중 오류가 발생했습니다.");
        } finally {
            setIsSeeding(false);
        }
    };

    // Filter logs in selected date
    const filteredLogs = useMemo(() => {
        if (!dailyDetails?.logs) return [];
        if (!searchLogQuery.trim()) return dailyDetails.logs;
        const q = searchLogQuery.trim().toLowerCase();
        return dailyDetails.logs.filter((log: any) => 
            (log.ip && log.ip.toLowerCase().includes(q)) ||
            (log.siteName && log.siteName.toLowerCase().includes(q)) ||
            (log.referrer && log.referrer.toLowerCase().includes(q)) ||
            (log.path && log.path.toLowerCase().includes(q)) ||
            (log.partnerName && log.partnerName.toLowerCase().includes(q)) ||
            (log.partnerId && log.partnerId.toLowerCase().includes(q))
        );
    }, [dailyDetails?.logs, searchLogQuery]);

    if (!stats) return <div className="p-10 text-center font-bold text-gray-400">통계 데이터를 불러오는 중...</div>;

    const maxDaily = Math.max(...(stats.daily.map((d: any) => Math.max(d.pv, d.uv, d.apps)) || [1]), 1);
    const maxPartnerPv = Math.max(...(stats.partner.map((p: any) => p.pv) || [1]), 1);

    return (
        <div className="space-y-8 animate-slide-up pb-20">
            {/* Filters */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1 ml-1">기간 설정 (대한민국 표준시 KST 기준)</label>
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
                                    const today = getKSTDateString();
                                    let start = today;
                                    let end = today;
                                    
                                    if (btn.range === 'yesterday') {
                                        const d = new Date();
                                        d.setDate(d.getDate() - 1);
                                        start = getKSTDateString(d);
                                        end = getKSTDateString(d);
                                    } else if (btn.range === 'thisMonth') {
                                        start = getKSTFirstDayOfMonth();
                                        end = today;
                                    } else if (btn.range === 'lastMonth') {
                                        const range = getKSTLastMonthRange();
                                        start = range.start;
                                        end = range.end;
                                    } else if (btn.range === '3months') {
                                        start = getKSTMonthsAgoDateString(3);
                                        end = today;
                                    }
                                    
                                    setStartDate(start);
                                    setEndDate(end);
                                    if (selectedDate < start || selectedDate > end) {
                                        setSelectedDate(end);
                                    }
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

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-xs font-bold text-emerald-600">LIVE</p>
                    </div>
                    <button
                        onClick={handleSeedData}
                        disabled={isSeeding}
                        className="px-3 py-1.5 bg-sono-primary/10 hover:bg-sono-primary/20 text-sono-primary rounded-xl text-[10px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                        title="선택한 일자에 테스트용 샘플 유입/IP 데이터를 생성합니다."
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        {isSeeding ? "생성중..." : "테스트 유입데이터 생성"}
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-20 h-20 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 mb-1">전체 페이지 뷰 (PV)</p>
                    <h3 className="text-3xl font-black text-sono-dark tracking-tighter">{stats.totalPv.toLocaleString()} <span className="text-sm font-bold text-gray-300 ml-0.5">건</span></h3>
                    <div className="mt-3 flex items-center gap-1.5 text-blue-600 text-[10px] font-bold bg-blue-50 w-fit px-2 py-0.5 rounded-lg">
                        사용자 활동량
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-20 h-20 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 mb-1">순 방문자 수 (UV)</p>
                    <h3 className="text-3xl font-black text-indigo-600 tracking-tighter">{stats.totalUv.toLocaleString()} <span className="text-sm font-bold text-gray-300 ml-0.5">명</span></h3>
                    <div className="mt-3 flex items-center gap-1.5 text-indigo-600 text-[10px] font-bold bg-indigo-50 w-fit px-2 py-0.5 rounded-lg">
                        순수 유입 규모
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-20 h-20 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 mb-1">유입 사이트 종류</p>
                    <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.referrers?.length || 0} <span className="text-sm font-bold text-gray-300 ml-0.5">개</span></h3>
                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold bg-emerald-50 w-fit px-2 py-0.5 rounded-lg">
                        유입 경로 다변화
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg className="w-20 h-20 text-orange-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 mb-1">상담 신청 건수 (APPLY)</p>
                    <h3 className="text-3xl font-black text-orange-600 tracking-tighter">{stats.totalApps?.toLocaleString() || 0} <span className="text-sm font-bold text-gray-300 ml-0.5">건</span></h3>
                    <div className="mt-3 flex items-center gap-1.5 text-orange-600 text-[10px] font-bold bg-orange-50 w-fit px-2 py-0.5 rounded-lg">
                        전환 성과
                    </div>
                </div>
            </div>

            {/* Daily Chart with Date Selector */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg text-sono-dark tracking-tighter">일별 성과 추이</h4>
                            <span className="text-[10px] font-black text-sono-primary bg-sono-primary/10 px-2 py-0.5 rounded-full">
                                💡 날짜를 클릭하면 유입 사이트와 IP를 확인할 수 있습니다
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mt-1">특정 날짜의 막대를 클릭하여 해당 일자의 유입 사이트와 접속 IP 상세를 분석하세요.</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">선택된 일자:</span>
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-sono-primary/10 border-none rounded-xl px-3 py-1.5 text-xs font-black text-sono-primary cursor-pointer focus:ring-2 focus:ring-sono-primary"
                            >
                                {stats.daily.map((d: any) => (
                                    <option key={d.date} value={d.date}>
                                        {d.date} (PV: {d.pv} / UV: {d.uv})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> <span className="text-[11px] font-bold text-gray-500">PV</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> <span className="text-[11px] font-bold text-gray-500">UV</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> <span className="text-[11px] font-bold text-gray-500">APPLY</span></div>
                        </div>
                    </div>
                </div>

                {stats.daily.length > 0 ? (
                    <div className="h-80 flex items-stretch gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-thin">
                        {stats.daily.map((d: any) => {
                            const isSelected = selectedDate === d.date;
                            return (
                                <button
                                    key={d.date}
                                    onClick={() => setSelectedDate(d.date)}
                                    className={`flex-shrink-0 w-[72px] md:w-[92px] flex flex-col items-center group h-full p-1.5 rounded-2xl transition-all ${
                                        isSelected 
                                            ? "bg-sono-primary/10 ring-2 ring-sono-primary shadow-sm scale-105" 
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="w-full flex justify-center items-end gap-[4px] flex-1 pb-2 h-full relative">
                                        <div className="absolute inset-x-0 bottom-2 h-px bg-gray-100"></div>
                                        
                                        {/* PV Column */}
                                        <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                            <div 
                                                className={`w-2.5 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm ${isSelected ? 'bg-blue-600' : 'bg-blue-500'}`}
                                                style={{ height: `${Math.max((d.pv / maxDaily) * 80, d.pv > 0 ? 4 : 0)}%` }}
                                                title={`PV: ${d.pv}`}
                                            ></div>
                                        </div>
                                        {/* UV Column */}
                                        <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                            <div 
                                                className={`w-2.5 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm ${isSelected ? 'bg-indigo-600' : 'bg-indigo-400'}`}
                                                style={{ height: `${Math.max((d.uv / maxDaily) * 80, d.uv > 0 ? 4 : 0)}%` }}
                                                title={`UV: ${d.uv}`}
                                            ></div>
                                        </div>
                                        {/* Apps Column */}
                                        <div className="flex flex-col items-center justify-end h-full gap-1 z-10">
                                            <div 
                                                className={`w-2.5 rounded-t-[4px] transition-all group-hover:brightness-110 shadow-sm ${isSelected ? 'bg-orange-600' : 'bg-orange-500'}`}
                                                style={{ height: `${Math.max((d.apps / maxDaily) * 80, d.apps > 0 ? 4 : 0)}%` }}
                                                title={`Apply: ${d.apps}`}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center mt-1">
                                        <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-sono-primary scale-110 font-extrabold' : 'text-sono-dark'}`}>
                                            {d.date.substring(8)}일
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-400">{d.date.substring(5, 7)}월</span>
                                        {isSelected && (
                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sono-primary"></span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 font-bold">데이터가 없습니다.</div>
                )}
            </div>

            {/* Selected Date Detailed Analysis Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border-2 border-sono-primary/20 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-sono-primary text-white text-xs font-black rounded-xl">
                                {selectedDate}
                            </span>
                            <h4 className="font-extrabold text-xl text-sono-dark tracking-tighter">
                                일자별 상세 유입 사이트 & IP 분석
                            </h4>
                        </div>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            선택한 날짜({selectedDate})에 접속한 유입 출처(네이버, 구글, 블로그 등)와 방문자 IP 주소 현황입니다.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="grid grid-cols-3 gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 text-center w-full lg:w-auto">
                            <div className="px-3 py-1">
                                <p className="text-[9px] font-bold text-gray-400">일자 PV</p>
                                <p className="text-sm font-black text-blue-600">{dailyDetails?.totalPv.toLocaleString() || 0}건</p>
                            </div>
                            <div className="px-3 py-1 border-x border-gray-200">
                                <p className="text-[9px] font-bold text-gray-400">일자 UV</p>
                                <p className="text-sm font-black text-indigo-600">{dailyDetails?.totalUv.toLocaleString() || 0}명</p>
                            </div>
                            <div className="px-3 py-1">
                                <p className="text-[9px] font-bold text-gray-400">접속 IP 수</p>
                                <p className="text-sm font-black text-emerald-600">{dailyDetails?.totalUniqueIps.toLocaleString() || 0}개</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                        <button
                            onClick={() => setDetailTab("referrers")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                detailTab === "referrers"
                                    ? "bg-white text-sono-dark shadow-sm font-black"
                                    : "text-gray-500 hover:text-sono-dark"
                            }`}
                        >
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                            🌐 유입 사이트 분석 ({dailyDetails?.referrers?.length || 0})
                        </button>
                        <button
                            onClick={() => setDetailTab("ips")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                detailTab === "ips"
                                    ? "bg-white text-sono-dark shadow-sm font-black"
                                    : "text-gray-500 hover:text-sono-dark"
                            }`}
                        >
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
                            🖥️ IP별 접속 현황 ({dailyDetails?.ips?.length || 0})
                        </button>
                        <button
                            onClick={() => setDetailTab("logs")}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                detailTab === "logs"
                                    ? "bg-white text-sono-dark shadow-sm font-black"
                                    : "text-gray-500 hover:text-sono-dark"
                            }`}
                        >
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            📋 상세 접속 로그 ({dailyDetails?.logs?.length || 0})
                        </button>
                    </div>

                    {detailTab === "logs" && (
                        <div className="w-full sm:w-64 relative">
                            <input
                                type="text"
                                value={searchLogQuery}
                                onChange={(e) => setSearchLogQuery(e.target.value)}
                                placeholder="IP, 사이트, 파트너 검색..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-sono-primary transition-all"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                    )}
                </div>

                {/* Tab 1: Referrer Sites */}
                {detailTab === "referrers" && (
                    <div className="space-y-3">
                        {dailyDetails?.referrers && dailyDetails.referrers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[11px]">
                                            <th className="py-3 px-4 w-12 text-center">순위</th>
                                            <th className="py-3 px-4">유입 사이트 (Referrer)</th>
                                            <th className="py-3 px-4">도메인 / 상세 URL</th>
                                            <th className="py-3 px-4 text-right">PV (조회수)</th>
                                            <th className="py-3 px-4 text-right">UV (방문자)</th>
                                            <th className="py-3 px-4 w-40 text-right">점유율</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {dailyDetails.referrers.map((ref: any, idx: number) => {
                                            let categoryBadgeClass = "bg-gray-100 text-gray-600";
                                            if (ref.category === "naver") categoryBadgeClass = "bg-emerald-50 text-emerald-700 font-black border border-emerald-200";
                                            if (ref.category === "google") categoryBadgeClass = "bg-blue-50 text-blue-700 font-black border border-blue-200";
                                            if (ref.category === "daum") categoryBadgeClass = "bg-yellow-50 text-yellow-800 font-black border border-yellow-200";
                                            if (ref.category === "social") categoryBadgeClass = "bg-pink-50 text-pink-700 font-black border border-pink-200";
                                            if (ref.category === "direct") categoryBadgeClass = "bg-gray-100 text-gray-700 font-bold";

                                            return (
                                                <tr key={ref.domain + idx} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3.5 px-4 text-center font-black text-gray-300">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-extrabold text-sono-dark">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${categoryBadgeClass}`}>
                                                                {ref.siteName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px] max-w-xs truncate">
                                                        {ref.rawUrls && ref.rawUrls.length > 0 ? (
                                                            <a href={ref.rawUrls[0]} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-sono-primary truncate block" title={ref.rawUrls[0]}>
                                                                {ref.rawUrls[0]}
                                                            </a>
                                                        ) : (
                                                            ref.domain
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-black text-sono-dark">
                                                        {ref.pv.toLocaleString()} 건
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-black text-indigo-600">
                                                        {ref.uv.toLocaleString()} 명
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-[11px] font-bold text-gray-600">{ref.percentage}%</span>
                                                            <div className="w-20 bg-gray-100 h-2 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="bg-emerald-500 h-full rounded-full transition-all"
                                                                    style={{ width: `${Math.max(ref.percentage, 3)}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-gray-400 font-bold bg-gray-50/50 rounded-2xl">
                                [{selectedDate}] 일자에 기록된 유입 사이트 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: IP Addresses */}
                {detailTab === "ips" && (
                    <div className="space-y-3">
                        {dailyDetails?.ips && dailyDetails.ips.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[11px]">
                                            <th className="py-3 px-4 w-12 text-center">순위</th>
                                            <th className="py-3 px-4">IP 주소</th>
                                            <th className="py-3 px-4">주요 접속 경로</th>
                                            <th className="py-3 px-4 text-right">접속 건수 (PV)</th>
                                            <th className="py-3 px-4 text-right">식별 UV</th>
                                            <th className="py-3 px-4 text-right">최종 접속 시각</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {dailyDetails.ips.map((ipItem: any, idx: number) => (
                                            <tr key={ipItem.ip + idx} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3.5 px-4 text-center font-black text-gray-300">
                                                    #{idx + 1}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-sono-dark">
                                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-100">
                                                        {ipItem.ip}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-600 font-medium">
                                                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                                                        {ipItem.lastPath}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-black text-blue-600">
                                                    {ipItem.pv.toLocaleString()} 건
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-black text-indigo-600">
                                                    {ipItem.uv.toLocaleString()} 명
                                                </td>
                                                <td className="py-3.5 px-4 text-right text-gray-400 font-mono text-[11px]">
                                                    {ipItem.lastTime ? new Date(ipItem.lastTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-gray-400 font-bold bg-gray-50/50 rounded-2xl">
                                [{selectedDate}] 일자에 기록된 IP 주소 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Detailed Access Logs */}
                {detailTab === "logs" && (
                    <div className="space-y-3">
                        {filteredLogs && filteredLogs.length > 0 ? (
                            <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
                                <table className="w-full text-left text-xs border-collapse sticky-header">
                                    <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                                        <tr className="border-b border-gray-200 text-gray-400 font-bold text-[11px]">
                                            <th className="py-3 px-4">접속 시각</th>
                                            <th className="py-3 px-4">파트너</th>
                                            <th className="py-3 px-4">유입 사이트</th>
                                            <th className="py-3 px-4">IP 주소</th>
                                            <th className="py-3 px-4">접속 경로</th>
                                            <th className="py-3 px-4">디바이스 / 브라우저</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredLogs.map((log: any) => (
                                            <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "-"}
                                                </td>
                                                <td className="py-3 px-4 font-bold text-sono-dark whitespace-nowrap">
                                                    {log.partnerName}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        {log.siteName || "직접 유입"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                                                    {log.ip || "미수집"}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                                                    {log.path}
                                                </td>
                                                <td className="py-3 px-4 text-gray-400 text-[10px] max-w-xs truncate" title={log.userAgent}>
                                                    {log.userAgent || "Standard Browser"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-16 text-center text-gray-400 font-bold bg-gray-50/50 rounded-2xl">
                                검색 조건에 해당하는 접속 로그가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Macro Breakdown: Page, Partner, Top Referrers, Top IPs */}
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
