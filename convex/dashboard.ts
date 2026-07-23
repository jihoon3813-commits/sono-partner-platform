import { query } from "./_generated/server";
import { v } from "convex/values";
import { attachDuplicateFlags } from "./applications";

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
                customers: attachDuplicateFlags(applications, applications),
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

        // TM 계정인 경우, 상위 파트너를 기준으로 데이터를 조회
        let targetParentPartner = myPartner;
        if (myPartner.role === 'tm' && myPartner.parentPartnerId) {
            const parent = await ctx.db
                .query("partners")
                .withIndex("by_partnerId", (q) => q.eq("partnerId", myPartner.parentPartnerId!))
                .unique();
            if (parent) {
                targetParentPartner = parent;
            }
        }

        // 전체 파트너 목록 가져오기
        const allPartners = await ctx.db.query("partners").collect();

        // targetParentPartner 및 모든 하위 파트너 재귀 수집 (partnerId, loginId, companyName 매칭)
        const partnerMap = new Map<string, any>();
        partnerMap.set(targetParentPartner._id, targetParentPartner);

        const collectSubs = (parent: any) => {
            const pId = parent.partnerId;
            const pLogin = parent.loginId;
            const pComp = parent.companyName?.trim();
            const pCleanComp = pComp ? pComp.replace(/\(주\)/g, '').trim() : "";

            const subs = allPartners.filter((p: any) => {
                if (!p || partnerMap.has(p._id)) return false;
                const matchId = (pId && p.parentPartnerId === pId) || (pLogin && p.parentPartnerId === pLogin);
                const subParentName = p.parentPartnerName ? p.parentPartnerName.trim() : "";
                const subCleanName = subParentName.replace(/\(주\)/g, '').trim();

                const matchName = (pComp && subParentName && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) ||
                                        (pCleanComp && subCleanName && (subCleanName === pCleanComp || subCleanName.includes(pCleanComp) || pCleanComp.includes(subCleanName)));

                return matchId || matchName;
            });

            subs.forEach((sub: any) => {
                partnerMap.set(sub._id, sub);
                collectSubs(sub);
            });
        };

        collectSubs(targetParentPartner);
        if (!partnerMap.has(myPartner._id)) {
            partnerMap.set(myPartner._id, myPartner);
        }

        const partnerList = Array.from(partnerMap.values());
        console.log("[Dashboard Query] Found partnerList count:", partnerList.length);

        // partnerId 또는 loginId, 회사명 매칭 리스트 생성
        const validSystemIds = partnerList.map(p => p.partnerId).filter(Boolean);
        const validLoginIds = partnerList.map(p => p.loginId).filter(Boolean);
        const validCompanyNames = partnerList.map(p => p.companyName?.trim()).filter(Boolean);
        const allValidIds = new Set([...validSystemIds, ...validLoginIds]);

        console.log("[Dashboard Query] Valid IDs for filtering:", Array.from(allValidIds));

        // 애플리케이션 필터링 (partnerId가 시스템ID 또는 loginId, 파트너사명과 매칭되는 경우)
        const allApplications = await ctx.db.query("applications").order("desc").collect();
        const filteredApps = allApplications.filter(app => {
            if (app.partnerId && allValidIds.has(app.partnerId)) return true;
            if (app.partnerName) {
                const appComp = app.partnerName.trim();
                for (const comp of validCompanyNames) {
                    if (appComp === comp || appComp.includes(comp) || comp.includes(appComp)) {
                        return true;
                    }
                }
            }
            return false;
        });

        console.log("[Dashboard Query] Total apps:", allApplications.length, "Filtered apps:", filteredApps.length);

        return {
            isAdmin: false,
            partners: partnerList,
            customers: attachDuplicateFlags(filteredApps, allApplications),
            pendingRequests: []
        };
    },
});
