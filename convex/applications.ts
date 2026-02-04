import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllApplications = query({
    handler: async (ctx) => {
        return await ctx.db.query("applications").order("desc").collect();
    },
});

export const getApplicationsByPartnerId = query({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("applications")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .order("desc")
            .collect();
    },
});

export const getApplicationByNo = query({
    args: { applicationNo: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();
    },
});

export const createApplication = mutation({
    args: {
        partnerId: v.string(),
        partnerName: v.string(),
        productType: v.string(),
        planType: v.optional(v.string()),
        products: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerBirth: v.optional(v.string()),
        customerGender: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerAddress: v.optional(v.string()),
        customerZipcode: v.optional(v.string()),
        partnerMemberId: v.optional(v.string()),
        preferredContactTime: v.optional(v.string()),
        inquiry: v.optional(v.string()),
        status: v.optional(v.string()),
        assignedTo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log(`[Convex] createApplication called with: ${JSON.stringify(args)}`);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const applicationNo = `SA-${dateStr}-${random}`;
        const now = new Date().toISOString();

        // Extract status and assignedTo from args or use defaults
        const { status, assignedTo, ...rest } = args;

        const id = await ctx.db.insert("applications", {
            ...rest,
            customerName: rest.customerName || "",
            customerBirth: rest.customerBirth || "",
            customerGender: rest.customerGender || "-",
            customerPhone: rest.customerPhone || "",
            customerAddress: rest.customerAddress || "",
            customerZipcode: rest.customerZipcode || "",
            applicationNo,
            status: status || "접수",
            assignedTo: assignedTo || "",
            createdAt: now,
            updatedAt: now,
        });

        return await ctx.db.get(id);
    },
});

export const updateApplicationStatus = mutation({
    args: {
        applicationNo: v.string(),
        newStatus: v.string(),
        changedBy: v.string(),
        memo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();

        if (!app) return false;

        const previousStatus = app.status;
        const updates: any = {
            status: args.newStatus,
            updatedAt: new Date().toISOString(),
        };

        if (args.newStatus === "계약완료") updates.contractDate = new Date().toISOString();
        if (args.newStatus === "배송완료") updates.deliveryDate = new Date().toISOString();
        if (args.newStatus === "정산완료") updates.settlementDate = new Date().toISOString();

        await ctx.db.patch(app._id, updates);

        // 로그 기록
        await ctx.db.insert("statusHistory", {
            historyId: `H-${Date.now()}`,
            applicationNo: args.applicationNo,
            previousStatus,
            newStatus: args.newStatus,
            changedBy: args.changedBy,
            changedAt: new Date().toISOString(),
            memo: args.memo,
        });

        return true;
    },
});

export const updateApplicationAssignee = mutation({
    args: {
        applicationNo: v.string(),
        assignedTo: v.string(),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();

        if (!app) return false;

        await ctx.db.patch(app._id, {
            assignedTo: args.assignedTo,
            updatedAt: new Date().toISOString(),
        });

        return true;
    },
});
