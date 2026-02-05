import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPendingPartnerRequests = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("partnerRequests")
            .withIndex("by_status", (q) => q.eq("status", "pending"))
            .collect();
    },
});

export const createPartnerRequest = mutation({
    args: {
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        companyAddress: v.optional(v.string()),
        companyPhone: v.optional(v.string()),
        managerName: v.string(),
        managerDepartment: v.optional(v.string()),
        managerPhone: v.string(),
        managerEmail: v.string(),
        // New Fields
        loginId: v.optional(v.string()),
        loginPassword: v.optional(v.string()),
        customUrl: v.optional(v.string()),

        shopType: v.string(),
        shopUrl: v.optional(v.string()),
        monthlyVisitors: v.optional(v.string()),
        memberCount: v.optional(v.string()),
        mainProducts: v.optional(v.string()),
        expectedMonthlySales: v.optional(v.string()),
        pointRate: v.optional(v.string()),
        additionalRequest: v.optional(v.string()),
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const requestId = `PR-${Date.now()}`;
        const createdAt = new Date().toISOString();

        await ctx.db.insert("partnerRequests", {
            ...args,
            requestId,
            status: "pending",
            createdAt,
        });
        return requestId;
    },
});

export const approvePartnerRequest = mutation({
    args: {
        requestId: v.string(),
        approvedBy: v.string(),
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        managerName: v.string(),
        managerPhone: v.string(),
        managerEmail: v.string(),
        shopUrl: v.optional(v.string()),
        shopType: v.string(),
        memberCount: v.optional(v.string()),
        customUrl: v.string(),
        logoUrl: v.optional(v.string()),
        logoText: v.optional(v.string()),
        landingTitle: v.optional(v.string()),
        pointInfo: v.string(),
        loginId: v.string(),
        loginPassword: v.string(),
        status: v.string(),
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("partnerRequests")
            .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
            .unique();

        if (!request) throw new Error("Request not found");

        // 1. 요청 상태 업데이트
        await ctx.db.patch(request._id, {
            status: "approved",
            reviewedBy: args.approvedBy,
            reviewedAt: new Date().toISOString(),
        });

        // 2. 파트너 생성
        const partnerId = `P-${Date.now()}`;
        await ctx.db.insert("partners", {
            partnerId,
            companyName: args.companyName,
            businessNumber: args.businessNumber,
            ceoName: args.ceoName,
            managerName: args.managerName,
            managerPhone: args.managerPhone,
            managerEmail: args.managerEmail,
            shopUrl: args.shopUrl || "",
            shopType: args.shopType,
            memberCount: args.memberCount || "0",
            customUrl: args.customUrl,
            logoUrl: args.logoUrl,
            logoText: args.logoText,
            landingTitle: args.landingTitle,
            pointInfo: args.pointInfo,
            brandColor: "#1e3a5f",
            loginId: args.loginId,
            loginPassword: args.loginPassword,
            status: args.status,
            parentPartnerId: args.parentPartnerId,
            parentPartnerName: args.parentPartnerName,
            createdAt: new Date().toISOString(),
            approvedAt: new Date().toISOString(),
            approvedBy: args.approvedBy,
        });

        return { partnerId };
    },
});

export const rejectPartnerRequest = mutation({
    args: {
        requestId: v.string(),
        rejectedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db
            .query("partnerRequests")
            .withIndex("by_requestId", (q) => q.eq("requestId", args.requestId))
            .unique();

        if (!request) return false;

        await ctx.db.patch(request._id, {
            status: "rejected",
            reviewedBy: args.rejectedBy,
            reviewedAt: new Date().toISOString(),
        });

        return true;
    },
});
