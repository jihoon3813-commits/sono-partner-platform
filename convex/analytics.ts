import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 대한민국 표준시(KST, Asia/Seoul, UTC+9) YYYY-MM-DD 날짜 추출 헬퍼
function getKSTDateStr(dateInput?: Date | string | number): string {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return String(dateInput).substring(0, 10);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
}

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
        const kstDate = getKSTDateStr(now); // 대한민국 표준시 기준 YYYY-MM-DD

        let partnerId = (args.partnerId || "main").trim();

        // customUrl이 전달되었을 경우 정규 partnerId로 변환
        if (partnerId !== "main") {
            const partner = await ctx.db
                .query("partners")
                .withIndex("by_customUrl", (q) => q.eq("customUrl", partnerId))
                .first();
            if (partner) {
                partnerId = partner.partnerId;
            }
        }

        await ctx.db.insert("analytics", {
            partnerId: partnerId,
            date: kstDate,
            path: args.path,
            visitorId: args.visitorId,
            userAgent: args.userAgent,
            createdAt: now.toISOString(),
        });
    },
});

// 통계 데이터 조회 (관리자용 - 한국시간 KST 적용)
export const getStatsSummary = query({
    args: {
        startDate: v.optional(v.string()), // YYYY-MM-DD (KST)
        endDate: v.optional(v.string()),   // YYYY-MM-DD (KST)
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
        const applicationStats: Record<string, number> = {}; // daily app count (KST)
        const partnerAppStats: Record<string, number> = {}; // partner total app count
        let totalPv = 0;
        let totalApps = 0;
        const totalUvSet = new Set<string>();

        // 시작일/종료일 기준 모든 날짜 KST 기준 연속 초기화
        if (args.startDate && args.endDate) {
            const startParts = args.startDate.split("-").map(Number);
            const endParts = args.endDate.split("-").map(Number);
            
            let curr = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
            const end = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
            
            let count = 0;
            while (curr <= end && count < 60) {
                const year = curr.getUTCFullYear();
                const month = String(curr.getUTCMonth() + 1).padStart(2, "0");
                const day = String(curr.getUTCDate()).padStart(2, "0");
                const dStr = `${year}-${month}-${day}`;
                
                dailyStats[dStr] = { pv: 0, uv: new Set() };
                curr.setUTCDate(curr.getUTCDate() + 1);
                count++;
            }
        }

        rawLogs.forEach(log => {
            // log.date (KST 저장분) 또는 log.createdAt KST 변환
            const logKstDate = log.date && log.date.length === 10 ? log.date : getKSTDateStr(log.createdAt);

            // 날짜 범위 확인 (endDate 필터링 - KST 기준)
            if (args.endDate && logKstDate > args.endDate) return;
            if (args.startDate && logKstDate < args.startDate) return;

            // 파트너 ID 정규화
            const logId = log.partnerId.trim().toLowerCase();
            const normalizedPid = idMap[logId] || log.partnerId.trim();
            
            // 파트너 필터 확인
            if (args.partnerId && normalizedPid !== args.partnerId) return;

            totalPv++;
            totalUvSet.add(log.visitorId);

            // 일별 통계 (KST 기준)
            if (!dailyStats[logKstDate]) dailyStats[logKstDate] = { pv: 0, uv: new Set() };
            dailyStats[logKstDate].pv++;
            dailyStats[logKstDate].uv.add(log.visitorId);

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

        // 4. 신청 통계 수집 (대한민국 표준시 KST 변환 기준)
        const allApps = await ctx.db.query("applications").collect();
        allApps.forEach(app => {
            // app.createdAt을 KST (Asia/Seoul) YYYY-MM-DD로 변환
            const appDateKST = getKSTDateStr(app.createdAt || app.registrationDate);

            if (args.startDate && appDateKST < args.startDate) return;
            if (args.endDate && appDateKST > args.endDate) return;
            
            // 파트너 필터 확인
            const appPartnerId = app.partnerId ? app.partnerId.trim() : "";
            if (args.partnerId && appPartnerId !== args.partnerId) return;

            totalApps++;
            applicationStats[appDateKST] = (applicationStats[appDateKST] || 0) + 1;
            if (appPartnerId) {
                partnerAppStats[appPartnerId] = (partnerAppStats[appPartnerId] || 0) + 1;
            }
        });

        // 5. 결과 포맷팅
        const daily = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            pv: stats.pv,
            uv: stats.uv.size,
            apps: applicationStats[date] || 0
        })).sort((a, b) => a.date.localeCompare(b.date));

        const partner = Object.entries(partnerStats).map(([pid, stats]) => ({
            partnerId: pid,
            pv: stats.pv,
            uv: stats.uv.size,
            apps: partnerAppStats[pid] || 0
        })).sort((a, b) => b.pv - a.pv);

        const paths = Object.entries(pathStats).map(([path, stats]) => ({
            path,
            pv: stats.pv,
            uv: stats.uv.size
        })).sort((a, b) => b.pv - a.pv);

        return {
            totalPv,
            totalUv: totalUvSet.size,
            totalApps,
            daily,
            partner,
            paths
        };
    },
});
