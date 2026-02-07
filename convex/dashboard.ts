import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardData = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const partnerId = args.partnerId;
        console.log("[Dashboard Query] Received partnerId:", partnerId);

        const isAdmin = !partnerId || partnerId === "admin" || partnerId.startsWith("ADMIN");
        console.log("[Dashboard Query] isAdmin:", isAdmin);

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

        // 일반 파트너인 경우: partnerId 또는 loginId로 파트너 검색
        let myPartner = await ctx.db
            .query("partners")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", partnerId!))
            .unique();

        // partnerId로 못 찾으면 loginId로 시도
        if (!myPartner) {
            myPartner = await ctx.db
                .query("partners")
                .withIndex("by_loginId", (q) => q.eq("loginId", partnerId!))
                .unique();
        }

        console.log("[Dashboard Query] Found partner:", myPartner?.loginId || "NOT FOUND");

        if (!myPartner) return { isAdmin: false, partners: [], customers: [], pendingRequests: [] };

        // 본인 + 직계 하위 파트너 목록 가져오기 (인덱스 활용)
        // myPartner.partnerId를 사용해야 하위 파트너를 올바르게 찾을 수 있음
        const subPartners = await ctx.db
            .query("partners")
            .withIndex("by_parentPartnerId", (q) => q.eq("parentPartnerId", myPartner.partnerId))
            .collect();

        console.log("[Dashboard Query] Found subPartners count:", subPartners.length);

        const partnerList = [myPartner, ...subPartners];

        // partnerId 또는 loginId로 매칭 (기존 데이터와 새 데이터 모두 지원)
        const validSystemIds = partnerList.map(p => p.partnerId);
        const validLoginIds = partnerList.map(p => p.loginId).filter(Boolean);
        const allValidIds = [...validSystemIds, ...validLoginIds];

        console.log("[Dashboard Query] Valid IDs for filtering:", allValidIds);

        // 애플리케이션 필터링 (partnerId가 시스템ID 또는 loginId와 매칭되는 경우)
        const allApplications = await ctx.db.query("applications").order("desc").collect();
        const filteredApps = allApplications.filter(app => allValidIds.includes(app.partnerId));

        console.log("[Dashboard Query] Total apps:", allApplications.length, "Filtered apps:", filteredApps.length);

        return {
            isAdmin: false,
            partners: partnerList,
            customers: filteredApps,
            pendingRequests: []
        };
    },
});
