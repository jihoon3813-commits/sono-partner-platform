import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const partnerId = args.partnerId;
        const isAdmin = !partnerId || partnerId === "admin" || partnerId.startsWith("ADMIN");

        if (isAdmin) {
            const partners = await ctx.db.query("partners").collect();
            const applications = await ctx.db.query("applications").order("desc").collect();
            const pendingRequests = await ctx.db.query("partnerRequests")
                .withIndex("by_status", q => q.eq("status", "pending"))
                .collect();

            return {
                isAdmin,
                partners,
                customers: applications,
                pendingRequests
            };
        }

        // 일반 파트너인 경우: 인덱스를 사용하여 최적화된 쿼리 실행
        const myPartner = await ctx.db
            .query("partners")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId!))
            .unique();

        if (!myPartner) return { isAdmin: false, partners: [], customers: [], pendingRequests: [] };

        // 본인 + 직계 하위 파트너 목록 가져오기 (인덱스 활용)
        const subPartners = await ctx.db
            .query("partners")
            .withIndex("by_parentPartnerId", (q) => q.eq("parentPartnerId", partnerId))
            .collect();

        const partnerList = [myPartner, ...subPartners];
        const validIds = partnerList.map(p => p.partnerId);

        // 애플리케이션 필터링 (많은 수의 파트너가 아니라면 이 방식이 빠름)
        // 만약 하위 파트너가 수백 명이라면 개별 쿼리 후 병합하는 것이 좋음
        const allApplications = await ctx.db.query("applications").order("desc").collect();
        const filteredApps = allApplications.filter(app => validIds.includes(app.partnerId));

        return {
            isAdmin: false,
            partners: partnerList,
            customers: filteredApps,
            pendingRequests: []
        };
    },
});
