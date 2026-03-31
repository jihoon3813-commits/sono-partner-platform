import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 페이지뷰/방문 기록
export const recordHit = mutation({
    args: {
        partnerId: v.string(),
        path: v.string(),
        visitorId: v.string(),
        userAgent: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = new Date();
        const date = now.toISOString().split("T")[0]; // YYYY-MM-DD

        await ctx.db.insert("analytics", {
            partnerId: args.partnerId,
            date: date,
            path: args.path,
            visitorId: args.visitorId,
            userAgent: args.userAgent,
            createdAt: now.toISOString(),
        });
    },
});

// 통계 데이터 조회 (관리자용)
export const getStatsSummary = query({
    args: {
        startDate: v.optional(v.string()), // YYYY-MM-DD
        endDate: v.optional(v.string()),   // YYYY-MM-DD
        partnerId: v.optional(v.string()), // 특정 파트너 필터
    },
    handler: async (ctx, args) => {
        // 1. 데이터 수집 및 전처리를 위한 맵 구성
        const allPartners = await ctx.db.query("partners").collect();
        const idMap: Record<string, string> = {};
        allPartners.forEach(p => {
            const pid = p.partnerId.trim();
            idMap[pid.toLowerCase()] = pid;
            if (p.customUrl) {
                idMap[p.customUrl.trim().toLowerCase()] = pid;
            }
        });

        // 2. 데이터 수집 (지수 사용 최적화)
        const rawLogs = await (args.startDate 
            ? ctx.db.query("analytics").withIndex("by_date", (q) => q.gte("date", args.startDate!))
            : ctx.db.query("analytics")
        ).collect();

        // 3. 필터링 및 집계
        const dailyStats: Record<string, { pv: number, uv: Set<string> }> = {};
        const partnerStats: Record<string, { pv: number, uv: Set<string> }> = {};
        const pathStats: Record<string, { pv: number, uv: Set<string> }> = {};
        let totalPv = 0;
        const totalUvSet = new Set<string>();

        // 시작일/종료일 기준 모든 날짜 초기화 (데이터가 없어도 차트에 표시되도록)
        if (args.startDate && args.endDate) {
            let curr = new Date(args.startDate);
            const end = new Date(args.endDate);
            // 무한 루프 방지 및 최대 31일 제한 (안전장치)
            let count = 0;
            while (curr <= end && count < 60) {
                const dStr = curr.toISOString().split("T")[0];
                dailyStats[dStr] = { pv: 0, uv: new Set() };
                curr.setDate(curr.getDate() + 1);
                count++;
            }
        }

        rawLogs.forEach(log => {
            // 날짜 범위 확인 (endDate 필터링)
            if (args.endDate && log.date > args.endDate) return;

            // 파트너 ID 정규화
            const logId = log.partnerId.trim().toLowerCase();
            const normalizedPid = idMap[logId] || log.partnerId.trim();
            
            // 파트너 필터 확인
            if (args.partnerId && normalizedPid !== args.partnerId) return;

            totalPv++;
            totalUvSet.add(log.visitorId);

            // 일별 통계
            if (!dailyStats[log.date]) dailyStats[log.date] = { pv: 0, uv: new Set() };
            dailyStats[log.date].pv++;
            dailyStats[log.date].uv.add(log.visitorId);

            // 파트너별 통계
            if (!partnerStats[normalizedPid]) partnerStats[normalizedPid] = { pv: 0, uv: new Set() };
            partnerStats[normalizedPid].pv++;
            partnerStats[normalizedPid].uv.add(log.visitorId);

            // 페이지별 통계
            const path = log.path || "/";
            if (!pathStats[path]) pathStats[path] = { pv: 0, uv: new Set() };
            pathStats[path].pv++;
            pathStats[path].uv.add(log.visitorId);
        });

        // 3. 결과 포맷팅
        const daily = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            pv: stats.pv,
            uv: stats.uv.size
        })).sort((a, b) => a.date.localeCompare(b.date));

        const partner = Object.entries(partnerStats).map(([pid, stats]) => ({
            partnerId: pid,
            pv: stats.pv,
            uv: stats.uv.size
        })).sort((a, b) => b.pv - a.pv);

        const paths = Object.entries(pathStats).map(([path, stats]) => ({
            path,
            pv: stats.pv,
            uv: stats.uv.size
        })).sort((a, b) => b.pv - a.pv);

        return {
            totalPv,
            totalUv: totalUvSet.size,
            daily,
            partner,
            paths
        };
    },
});
