"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useMemo } from "react";
import {
    getKSTDateString,
    getKSTFirstDayOfMonth,
    getKSTLastMonthRange,
    getKSTMonthsAgoDateString,
} from "@/lib/dateUtils";
import { AdminIcon } from "./AdminIcons";

export default function AnalyticsDashboard() {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return getKSTDateString(d);
    });
    const [endDate, setEndDate] = useState(() => getKSTDateString());
    const [selectedPartner, setSelectedPartner] = useState("");
    const [activePreset, setActivePreset] = useState<string>("7days");

    // 선택한 일자 상세 분석 상태
    const [selectedDate, setSelectedDate] = useState<string>(() => getKSTDateString());
    const [detailTab, setDetailTab] = useState<"referrers" | "ips" | "logs">("referrers");
    const [searchLogQuery, setSearchLogQuery] = useState("");
    const [isSeeding, setIsSeeding] = useState(false);

    const stats = useQuery(api.analytics.getStatsSummary, {
        startDate,
        endDate,
        partnerId: selectedPartner || undefined,
    });

    const dailyDetails = useQuery(api.analytics.getDailyDetailLogs, {
        date: selectedDate,
        partnerId: selectedPartner || undefined,
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

    const filteredLogs = useMemo(() => {
        if (!dailyDetails?.logs) return [];
        if (!searchLogQuery.trim()) return dailyDetails.logs;
        const q = searchLogQuery.trim().toLowerCase();
        return dailyDetails.logs.filter(
            (log: any) =>
                (log.ip && log.ip.toLowerCase().includes(q)) ||
                (log.siteName && log.siteName.toLowerCase().includes(q)) ||
                (log.referrer && log.referrer.toLowerCase().includes(q)) ||
                (log.path && log.path.toLowerCase().includes(q)) ||
                (log.partnerName && log.partnerName.toLowerCase().includes(q)) ||
                (log.partnerId && log.partnerId.toLowerCase().includes(q))
        );
    }, [dailyDetails?.logs, searchLogQuery]);

    if (!stats) {
        return (
            <div className="adm-panel p-14 text-center text-xs font-semibold text-[#788699]">
                통계 데이터를 불러오는 중...
            </div>
        );
    }

    const maxDaily = Math.max(
        ...(stats.daily.map((d: any) => Math.max(d.pv, d.uv, d.apps)) || [1]),
        4
    );
    const maxPartnerPv = Math.max(...(stats.partner.map((p: any) => p.pv) || [1]), 1);
    const maxPathPv = Math.max(...((stats.paths || []).map((p: any) => p.pv) || [1]), 1);
    const overallConv =
        stats.totalUv > 0 ? (((stats.totalApps || 0) / stats.totalUv) * 100).toFixed(1) : "0.0";

    const getCategoryPillClass = (category?: string) => {
        switch (category) {
            case "naver":
                return "green";
            case "google":
                return "blue";
            case "kakao":
            case "daum":
                return "orange";
            case "social":
                return "red";
            case "campaign":
                return "teal";
            default:
                return "gray";
        }
    };

    return (
        <div className="space-y-5 pb-8">
            {/* 상단 페이지 헤딩 */}
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · STATISTICS</div>
                    <h1>통계</h1>
                    <p>
                        페이지 뷰(PV), 순 방문자(UV), 파트너별 유입 채널 및 일자별 접속 현황을 분석합니다.
                    </p>
                </div>
                <div className="adm-heading-buttons">
                    <span className="adm-pill green !py-1.5 !px-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#163a6b] animate-pulse" />
                        LIVE 실시간 집계
                    </span>
                    <button
                        type="button"
                        onClick={handleSeedData}
                        disabled={isSeeding}
                        className="adm-btn sage"
                        title="선택한 일자에 테스트용 샘플 유입/IP 데이터를 생성합니다."
                    >
                        <AdminIcon name="plus" />
                        <span>{isSeeding ? "생성 중..." : "테스트 유입데이터 생성"}</span>
                    </button>
                </div>
            </section>

            {/* 조회 기간 및 파트너 필터 바 */}
            <section className="adm-panel px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-bold text-[#475870] inline-flex items-center gap-1.5 mr-1">
                        <AdminIcon name="calendar" className="!w-4 !h-4 text-[#163a6b]" />
                        조회 기간 (KST)
                    </span>
                    <div className="adm-segmented">
                        {[
                            { label: "당일", range: "today" },
                            { label: "전일", range: "yesterday" },
                            { label: "최근 7일", range: "7days" },
                            { label: "당월", range: "thisMonth" },
                            { label: "전월", range: "lastMonth" },
                            { label: "3개월", range: "3months" },
                        ].map((btn) => (
                            <button
                                key={btn.range}
                                type="button"
                                className={activePreset === btn.range ? "active" : ""}
                                onClick={() => {
                                    const today = getKSTDateString();
                                    let start = today;
                                    let end = today;

                                    if (btn.range === "yesterday") {
                                        const d = new Date();
                                        d.setDate(d.getDate() - 1);
                                        start = getKSTDateString(d);
                                        end = getKSTDateString(d);
                                    } else if (btn.range === "7days") {
                                        const d = new Date();
                                        d.setDate(d.getDate() - 7);
                                        start = getKSTDateString(d);
                                        end = today;
                                    } else if (btn.range === "thisMonth") {
                                        start = getKSTFirstDayOfMonth();
                                        end = today;
                                    } else if (btn.range === "lastMonth") {
                                        const range = getKSTLastMonthRange();
                                        start = range.start;
                                        end = range.end;
                                    } else if (btn.range === "3months") {
                                        start = getKSTMonthsAgoDateString(3);
                                        end = today;
                                    }

                                    setActivePreset(btn.range);
                                    setStartDate(start);
                                    setEndDate(end);
                                    if (selectedDate < start || selectedDate > end) {
                                        setSelectedDate(end);
                                    }
                                }}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setActivePreset("custom");
                                setStartDate(e.target.value);
                            }}
                            onClick={(e) => {
                                try {
                                    e.currentTarget.showPicker?.();
                                } catch {}
                            }}
                            className="adm-input !min-h-[34px] !py-1 !px-2.5 text-xs font-semibold cursor-pointer"
                        />
                        <span className="text-[#788699] text-xs">~</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setActivePreset("custom");
                                setEndDate(e.target.value);
                            }}
                            onClick={(e) => {
                                try {
                                    e.currentTarget.showPicker?.();
                                } catch {}
                            }}
                            className="adm-input !min-h-[34px] !py-1 !px-2.5 text-xs font-semibold cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#6d786c] shrink-0">파트너 필터</span>
                    <select
                        value={selectedPartner}
                        onChange={(e) => setSelectedPartner(e.target.value)}
                        className="adm-select !min-h-[34px] min-w-[200px] font-semibold"
                    >
                        <option value="">전체 파트너 현황</option>
                        {partners?.map((p) => (
                            <option key={p.partnerId} value={p.partnerId}>
                                {p.companyName} ({p.partnerId})
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            {/* 핵심 지표 4개 카드 (sono-maeum-admin 표준) */}
            <section className="adm-metrics-grid" aria-label="통계 핵심 지표">
                <article className="adm-metric">
                    <div className="adm-metric-head">
                        <span>전체 페이지 뷰 (PV)</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="chart" />
                        </span>
                    </div>
                    <div className="adm-metric-value">
                        {stats.totalPv.toLocaleString()}
                        <span>건</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">사용자 활동량</span>
                        <span>조회 기간 누적 조회수</span>
                    </div>
                </article>

                <article className="adm-metric">
                    <div className="adm-metric-head">
                        <span>순 방문자 수 (UV)</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="users" />
                        </span>
                    </div>
                    <div className="adm-metric-value">
                        {stats.totalUv.toLocaleString()}
                        <span>명</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">순수 유입 규모</span>
                        <span>고유 방문자 집계</span>
                    </div>
                </article>

                <article className="adm-metric">
                    <div className="adm-metric-head">
                        <span>유입 사이트 종류</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="external" />
                        </span>
                    </div>
                    <div className="adm-metric-value">
                        {(stats.referrers?.length || 0).toLocaleString()}
                        <span>개</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend">유입 경로 다변화</span>
                        <span>감지된 유입 채널 수</span>
                    </div>
                </article>

                <article className="adm-metric">
                    <div className="adm-metric-head">
                        <span>상담 신청 건수 (APPLY)</span>
                        <span className="adm-metric-icon">
                            <AdminIcon name="check-circle" />
                        </span>
                    </div>
                    <div className="adm-metric-value">
                        {(stats.totalApps || 0).toLocaleString()}
                        <span>건</span>
                    </div>
                    <div className="adm-metric-foot">
                        <span className="adm-metric-trend warning">UV 대비 {overallConv}%</span>
                        <span>상담 접수 전환 성과</span>
                    </div>
                </article>
            </section>

            {/* 일별 성과 추이 차트 패널 */}
            <section className="adm-panel">
                <div className="adm-panel-top">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2>일별 성과 추이</h2>
                            <span className="adm-pill green">
                                날짜 클릭 시 하단 상세 분석 연동
                            </span>
                        </div>
                        <p className="adm-panel-subtitle">
                            특정 일자의 막대를 클릭하여 해당 일자의 유입 사이트와 접속 IP 상세를 확인하세요.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-xs font-semibold text-[#6d786c]">선택 일자</span>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="adm-select !min-h-[34px] font-bold text-[#163a6b]"
                        >
                            {stats.daily.map((d: any) => (
                                <option key={d.date} value={d.date}>
                                    {d.date} (PV {d.pv} · UV {d.uv} · 신청 {d.apps})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="adm-chart-summary">
                    <span className="adm-legend-item">
                        <i className="adm-legend-dot" style={{ background: "#163a6b" }} />
                        PV (페이지뷰)
                    </span>
                    <span className="adm-legend-item">
                        <i className="adm-legend-dot" style={{ background: "#80a389" }} />
                        UV (순방문자)
                    </span>
                    <span className="adm-legend-item">
                        <i className="adm-legend-dot" style={{ background: "#c59b57" }} />
                        APPLY (상담신청)
                    </span>
                    <span style={{ marginLeft: "auto" }}>단위: 건 / 명</span>
                </div>

                {stats.daily.length > 0 ? (
                    <div className="px-5 pt-4 pb-5">
                        <div className="relative border border-[#edf0e8] rounded-[11px] bg-[#f8fafd] px-4 pt-6 pb-3 overflow-x-auto">
                            {/* 배경 가이드 그리드 라인 */}
                            <div className="pointer-events-none absolute inset-x-4 top-6 h-[168px] flex flex-col justify-between">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-full border-b border-dashed border-[#e4e9df] flex items-center"
                                    >
                                        <span className="text-[9px] text-[#9ba596] -mt-3.5 pl-0.5 font-mono">
                                            {Math.round((maxDaily * (3 - i)) / 3)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="relative z-10 flex items-end gap-2.5 min-w-max pl-6">
                                {stats.daily.map((d: any) => {
                                    const isSelected = selectedDate === d.date;
                                    const pvH = Math.max(
                                        Math.round((d.pv / maxDaily) * 148),
                                        d.pv > 0 ? 6 : 2
                                    );
                                    const uvH = Math.max(
                                        Math.round((d.uv / maxDaily) * 148),
                                        d.uv > 0 ? 6 : 2
                                    );
                                    const appsH = Math.max(
                                        Math.round((d.apps / maxDaily) * 148),
                                        d.apps > 0 ? 6 : 2
                                    );

                                    return (
                                        <button
                                            key={d.date}
                                            type="button"
                                            onClick={() => setSelectedDate(d.date)}
                                            className={`group flex flex-col items-center w-[72px] sm:w-[82px] px-2 pt-2 pb-2 rounded-[10px] border transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-white border-[#163a6b] shadow-xs"
                                                    : "bg-transparent border-transparent hover:bg-white/80 hover:border-[#dce4f0]"
                                            }`}
                                        >
                                            <div className="w-full h-[168px] flex justify-center items-end gap-1.5 pb-1">
                                                {/* PV Bar */}
                                                <div className="flex flex-col items-center justify-end h-full">
                                                    {d.pv > 0 && (
                                                        <span className="text-[9px] font-bold text-[#163a6b] mb-1 tabular-nums">
                                                            {d.pv}
                                                        </span>
                                                    )}
                                                    <div
                                                        className="w-2.5 rounded-t-[3px] bg-[#163a6b] transition-all group-hover:opacity-90"
                                                        style={{ height: `${pvH}px` }}
                                                        title={`PV: ${d.pv}건`}
                                                    />
                                                </div>

                                                {/* UV Bar */}
                                                <div className="flex flex-col items-center justify-end h-full">
                                                    {d.uv > 0 && (
                                                        <span className="text-[9px] font-bold text-[#5c7f66] mb-1 tabular-nums">
                                                            {d.uv}
                                                        </span>
                                                    )}
                                                    <div
                                                        className="w-2.5 rounded-t-[3px] bg-[#80a389] transition-all group-hover:opacity-90"
                                                        style={{ height: `${uvH}px` }}
                                                        title={`UV: ${d.uv}명`}
                                                    />
                                                </div>

                                                {/* APPLY Bar */}
                                                <div className="flex flex-col items-center justify-end h-full">
                                                    {d.apps > 0 && (
                                                        <span className="text-[9px] font-bold text-[#a37834] mb-1 tabular-nums">
                                                            {d.apps}
                                                        </span>
                                                    )}
                                                    <div
                                                        className="w-2.5 rounded-t-[3px] bg-[#c59b57] transition-all group-hover:opacity-90"
                                                        style={{ height: `${appsH}px` }}
                                                        title={`APPLY: ${d.apps}건`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-full pt-2 mt-1 border-t border-[#eaeff7] flex flex-col items-center">
                                                <span
                                                    className={`text-[11px] font-bold tabular-nums ${
                                                        isSelected
                                                            ? "text-[#163a6b]"
                                                            : "text-[#3b495c]"
                                                    }`}
                                                >
                                                    {d.date.slice(5).replace("-", ".")}
                                                </span>
                                                <span
                                                    className={`mt-1 h-1 rounded-full transition-all ${
                                                        isSelected
                                                            ? "w-5 bg-[#163a6b]"
                                                            : "w-1 bg-transparent"
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-14 text-center text-xs text-[#788699]">
                        조회 기간 내 집계된 일별 데이터가 없습니다.
                    </div>
                )}
            </section>

            {/* 선택 일자 상세 유입 사이트 & IP 분석 패널 */}
            <section className="adm-panel">
                <div className="px-5 pt-5 pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#eaeff7]">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="adm-pill green !text-xs !px-2.5 !py-1 font-mono">
                                {selectedDate}
                            </span>
                            <h2 className="text-base font-bold text-[#162438]">
                                일자별 상세 유입 사이트 &amp; IP 분석
                            </h2>
                        </div>
                        <p className="text-xs text-[#788699] mt-1">
                            선택한 날짜({selectedDate})에 접속한 유입 출처(네이버, 구글, 카카오 등)와 방문자 IP 현황입니다.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="px-3 py-1.5 rounded-[8px] bg-[#f6f8fc] border border-[#e1e7f0] text-xs flex items-center gap-2">
                            <span className="text-[#788699] font-medium">일자 PV</span>
                            <strong className="text-[#162438] tabular-nums">
                                {dailyDetails?.totalPv.toLocaleString() || 0}건
                            </strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-[8px] bg-[#f6f8fc] border border-[#e1e7f0] text-xs flex items-center gap-2">
                            <span className="text-[#788699] font-medium">일자 UV</span>
                            <strong className="text-[#163a6b] tabular-nums">
                                {dailyDetails?.totalUv.toLocaleString() || 0}명
                            </strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-[8px] bg-[#f6f8fc] border border-[#e1e7f0] text-xs flex items-center gap-2">
                            <span className="text-[#788699] font-medium">접속 IP</span>
                            <strong className="text-[#163a6b] tabular-nums">
                                {dailyDetails?.totalUniqueIps.toLocaleString() || 0}개
                            </strong>
                        </div>
                    </div>
                </div>

                {/* 언더라인 탭 네비게이션 */}
                <div className="flex flex-wrap items-center justify-between border-b border-[#e1e7f0] pr-4">
                    <div className="adm-tabs !border-b-0">
                        <button
                            type="button"
                            onClick={() => setDetailTab("referrers")}
                            className={`adm-tab ${detailTab === "referrers" ? "active" : ""}`}
                        >
                            <span>유입 사이트 분석</span>
                            <span className="adm-tab-count">
                                {dailyDetails?.referrers?.length || 0}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDetailTab("ips")}
                            className={`adm-tab ${detailTab === "ips" ? "active" : ""}`}
                        >
                            <span>IP별 접속 현황</span>
                            <span className="adm-tab-count">
                                {dailyDetails?.ips?.length || 0}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDetailTab("logs")}
                            className={`adm-tab ${detailTab === "logs" ? "active" : ""}`}
                        >
                            <span>상세 접속 로그</span>
                            <span className="adm-tab-count">
                                {dailyDetails?.logs?.length || 0}
                            </span>
                        </button>
                    </div>

                    {detailTab === "logs" && (
                        <label className="adm-search-field my-2">
                            <AdminIcon name="search" />
                            <input
                                type="text"
                                value={searchLogQuery}
                                onChange={(e) => setSearchLogQuery(e.target.value)}
                                placeholder="IP, 사이트, 파트너 검색..."
                            />
                        </label>
                    )}
                </div>

                {/* Tab 1: Referrer Sites */}
                {detailTab === "referrers" && (
                    <div>
                        {dailyDetails?.referrers && dailyDetails.referrers.length > 0 ? (
                            <div className="adm-table-scroll">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th className="w-14 text-center">순위</th>
                                            <th>유입 사이트 (Referrer)</th>
                                            <th>도메인 / 상세 URL</th>
                                            <th className="text-right">PV (조회수)</th>
                                            <th className="text-right">UV (방문자)</th>
                                            <th className="w-44 text-right">점유율</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyDetails.referrers.map((ref: any, idx: number) => (
                                            <tr key={ref.domain + idx}>
                                                <td className="text-center font-mono text-xs text-[#788699]">
                                                    #{idx + 1}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`adm-pill ${getCategoryPillClass(
                                                            ref.category
                                                        )}`}
                                                    >
                                                        {ref.siteName}
                                                    </span>
                                                </td>
                                                <td className="font-mono text-xs text-[#5a6b82] max-w-xs truncate">
                                                    {ref.rawUrls && ref.rawUrls.length > 0 ? (
                                                        <a
                                                            href={ref.rawUrls[0]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline hover:text-[#163a6b] truncate block"
                                                            title={ref.rawUrls[0]}
                                                        >
                                                            {ref.rawUrls[0]}
                                                        </a>
                                                    ) : ref.domain === "direct" ? (
                                                        <span className="font-sans text-[#788699]">
                                                            직접 접속 / 문자 / 북마크
                                                        </span>
                                                    ) : ref.domain === "kakaotalk" ? (
                                                        <span className="font-sans text-[#9a7538] font-medium">
                                                            카카오톡 채팅방 / 채널 링크
                                                        </span>
                                                    ) : (
                                                        ref.domain
                                                    )}
                                                </td>
                                                <td className="text-right font-bold text-[#162438] tabular-nums">
                                                    {ref.pv.toLocaleString()}건
                                                </td>
                                                <td className="text-right font-bold text-[#163a6b] tabular-nums">
                                                    {ref.uv.toLocaleString()}명
                                                </td>
                                                <td>
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <span className="text-xs font-semibold text-[#3b495c] tabular-nums w-10 text-right">
                                                            {ref.percentage}%
                                                        </span>
                                                        <div className="adm-bar-track w-24">
                                                            <span
                                                                style={{
                                                                    width: `${Math.max(
                                                                        ref.percentage,
                                                                        4
                                                                    )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center text-xs text-[#788699]">
                                [{selectedDate}] 일자에 기록된 유입 사이트 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: IP Addresses */}
                {detailTab === "ips" && (
                    <div>
                        {dailyDetails?.ips && dailyDetails.ips.length > 0 ? (
                            <div className="adm-table-scroll">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th className="w-14 text-center">순위</th>
                                            <th>IP 주소</th>
                                            <th>주요 접속 경로</th>
                                            <th className="text-right">접속 건수 (PV)</th>
                                            <th className="text-right">식별 UV</th>
                                            <th className="text-right">최종 접속 시각</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyDetails.ips.map((ipItem: any, idx: number) => (
                                            <tr key={ipItem.ip + idx}>
                                                <td className="text-center font-mono text-xs text-[#788699]">
                                                    #{idx + 1}
                                                </td>
                                                <td className="font-mono font-semibold text-[#162438]">
                                                    <span className="adm-pill blue font-mono">
                                                        {ipItem.ip}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="adm-pill gray font-mono">
                                                        {ipItem.lastPath}
                                                    </span>
                                                </td>
                                                <td className="text-right font-bold text-[#162438] tabular-nums">
                                                    {ipItem.pv.toLocaleString()}건
                                                </td>
                                                <td className="text-right font-bold text-[#163a6b] tabular-nums">
                                                    {ipItem.uv.toLocaleString()}명
                                                </td>
                                                <td className="text-right font-mono text-xs text-[#788699]">
                                                    {ipItem.lastTime
                                                        ? new Date(
                                                              ipItem.lastTime
                                                          ).toLocaleTimeString("ko-KR", {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              second: "2-digit",
                                                              hour12: false,
                                                          })
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center text-xs text-[#788699]">
                                [{selectedDate}] 일자에 기록된 IP 주소 데이터가 없습니다.
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Detailed Access Logs */}
                {detailTab === "logs" && (
                    <div>
                        {filteredLogs && filteredLogs.length > 0 ? (
                            <div className="adm-table-scroll max-h-[460px] overflow-y-auto">
                                <table className="adm-table">
                                    <thead className="sticky top-0 z-10">
                                        <tr>
                                            <th>접속 시각</th>
                                            <th>파트너</th>
                                            <th>유입 사이트</th>
                                            <th>IP 주소</th>
                                            <th>접속 경로</th>
                                            <th>디바이스 / 브라우저</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log: any) => (
                                            <tr key={log._id}>
                                                <td className="font-mono text-xs text-[#5a6b82]">
                                                    {log.createdAt
                                                        ? new Date(
                                                              log.createdAt
                                                          ).toLocaleTimeString("ko-KR", {
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                              second: "2-digit",
                                                              hour12: false,
                                                          })
                                                        : "-"}
                                                </td>
                                                <td className="font-semibold text-[#162438]">
                                                    {log.partnerName}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`adm-pill ${getCategoryPillClass(
                                                            log.category
                                                        )}`}
                                                    >
                                                        {log.siteName || "직접 유입"}
                                                    </span>
                                                </td>
                                                <td className="font-mono font-semibold text-[#163a6b]">
                                                    {log.ip || "미수집"}
                                                </td>
                                                <td className="font-mono text-xs text-[#5a6b82]">
                                                    {log.path}
                                                </td>
                                                <td
                                                    className="text-xs text-[#788699] max-w-xs truncate"
                                                    title={log.userAgent}
                                                >
                                                    {log.userAgent || "Standard Browser"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center text-xs text-[#788699]">
                                검색 조건에 해당하는 접속 로그가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* 하단 2열 요약: 주요 페이지 유입 경로 & 파트너별 성과 비교 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 주요 페이지 유입 경로 */}
                <section className="adm-panel flex flex-col">
                    <div className="adm-panel-top pb-4 border-b border-[#eaeff7]">
                        <div>
                            <h2>주요 페이지 유입 경로</h2>
                            <p className="adm-panel-subtitle">
                                방문자가 가장 많이 조회한 랜딩 및 신청 페이지 순위
                            </p>
                        </div>
                    </div>
                    {stats.paths && stats.paths.length > 0 ? (
                        <div className="adm-table-scroll">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th className="w-12 text-center">#</th>
                                        <th>페이지 경로</th>
                                        <th>구분</th>
                                        <th className="text-right">PV</th>
                                        <th className="text-right">UV</th>
                                        <th className="w-28">비중</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.paths.slice(0, 8).map((p: any, idx: number) => (
                                        <tr key={p.path}>
                                            <td className="text-center font-mono text-xs text-[#788699]">
                                                {idx + 1}
                                            </td>
                                            <td className="font-mono text-xs font-semibold text-[#162438] max-w-[180px] truncate">
                                                {p.path}
                                            </td>
                                            <td>
                                                <span className="adm-pill gray">
                                                    {p.path.includes("/inquiry")
                                                        ? "상담신청"
                                                        : p.path === "/"
                                                        ? "메인/랜딩"
                                                        : "상품페이지"}
                                                </span>
                                            </td>
                                            <td className="text-right font-bold text-[#162438] tabular-nums">
                                                {p.pv.toLocaleString()}
                                            </td>
                                            <td className="text-right font-semibold text-[#163a6b] tabular-nums">
                                                {p.uv.toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="adm-bar-track w-20">
                                                    <span
                                                        style={{
                                                            width: `${Math.max(
                                                                Math.round((p.pv / maxPathPv) * 100),
                                                                5
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-[#788699]">
                            집계된 페이지 유입 데이터가 없습니다.
                        </div>
                    )}
                </section>

                {/* 파트너별 성과 비교 */}
                <section className="adm-panel flex flex-col">
                    <div className="adm-panel-top pb-4 border-b border-[#eaeff7]">
                        <div>
                            <h2>파트너별 성과 비교</h2>
                            <p className="adm-panel-subtitle">
                                파트너별 방문자(UV), 상담 신청(APPLY) 및 전환율 현황
                            </p>
                        </div>
                    </div>
                    {stats.partner.length > 0 ? (
                        <div className="adm-table-scroll">
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th className="w-12 text-center">#</th>
                                        <th>파트너</th>
                                        <th className="text-right">PV / UV</th>
                                        <th className="text-right">상담신청</th>
                                        <th className="text-right">전환율</th>
                                        <th className="w-28">활동 비중</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.partner.map((p: any, idx: number) => {
                                        const pInfo = partners?.find(
                                            (pt: any) => pt.partnerId === p.partnerId
                                        );
                                        const conversion =
                                            p.uv > 0
                                                ? ((p.apps / p.uv) * 100).toFixed(1)
                                                : "0.0";
                                        return (
                                            <tr key={p.partnerId}>
                                                <td className="text-center font-mono text-xs text-[#788699]">
                                                    {idx + 1}
                                                </td>
                                                <td className="font-bold text-[#162438]">
                                                    {pInfo?.companyName || p.partnerId}
                                                </td>
                                                <td className="text-right tabular-nums text-xs">
                                                    <strong className="text-[#162438]">
                                                        {p.pv.toLocaleString()}
                                                    </strong>{" "}
                                                    <span className="text-[#788699]">
                                                        / {p.uv.toLocaleString()}명
                                                    </span>
                                                </td>
                                                <td className="text-right font-bold text-[#163a6b] tabular-nums">
                                                    {p.apps.toLocaleString()}건
                                                </td>
                                                <td className="text-right">
                                                    <span className="adm-pill green tabular-nums">
                                                        {conversion}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="adm-bar-track w-20">
                                                        <span
                                                            style={{
                                                                width: `${Math.max(
                                                                    Math.round(
                                                                        (p.pv / maxPartnerPv) * 100
                                                                    ),
                                                                    5
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-[#788699]">
                            집계된 파트너 성과 데이터가 없습니다.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
