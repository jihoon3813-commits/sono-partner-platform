import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowKST } from "./utils";
// Force sync after npm install convex

export const getAllPartners = query({
    handler: async (ctx) => {
        return await ctx.db.query("partners").collect();
    },
});

export const getPartnerById = query({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("partners")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .unique();
    },
});

export const getPartnerByLoginId = query({
    args: { loginId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("partners")
            .withIndex("by_loginId", (q) => q.eq("loginId", args.loginId))
            .unique();
    },
});

export const getPartnerByCustomUrl = query({
    args: { customUrl: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("partners")
            .withIndex("by_customUrl", (q) => q.eq("customUrl", args.customUrl))
            .unique();
    },
});

export const searchPartners = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        if (!args.query) return [];
        const partners = await ctx.db.query("partners").collect();
        return partners.filter(p =>
            p.companyName.toLowerCase().includes(args.query.toLowerCase()) ||
            p.ceoName.toLowerCase().includes(args.query.toLowerCase())
        );
    }
});

export const createPartner = mutation({
    args: {
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        managerName: v.string(),
        managerPhone: v.string(),
        managerEmail: v.string(),
        shopType: v.string(),
        memberCount: v.string(),
        customUrl: v.string(),
        pointInfo: v.string(),
        brandColor: v.string(),
        loginId: v.string(),
        loginPassword: v.string(),
        status: v.string(),
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
        logoUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const partnerId = `P-${Date.now()}`;
        const createdAt = nowKST();

        const id = await ctx.db.insert("partners", {
            ...args,
            partnerId,
            createdAt,
        });
        return partnerId;
    },
});

export const validatePartnerCredentials = mutation({
    args: {
        loginId: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`[Convex Auth] Checking Login: ${args.loginId}`);
        const partner = await ctx.db
            .query("partners")
            .withIndex("by_loginId", (q) => q.eq("loginId", args.loginId))
            .unique();

        if (!partner) {
            console.log(`[Convex Auth] Partner NOT FOUND for: ${args.loginId}`);
            return { valid: false };
        }

        console.log(`[Convex Auth] Partner Found. Checking password...`);
        // Trim compare just in case
        const dbPw = String(partner.loginPassword).trim();
        const inputPw = String(args.password).trim();

        if (dbPw !== inputPw) {
            console.log(`[Convex Auth] Password MISMATCH for: ${args.loginId}. DB: [${dbPw}], Input: [${inputPw}]`);
            return { valid: false };
        }

        if (partner.status !== 'active') {
            console.log(`[Convex Auth] Partner NOT ACTIVE: ${partner.status}`);
            return { valid: false };
        }

        console.log(`[Convex Auth] Login SUCCESS for: ${args.loginId}`);
        return {
            valid: true,
            partner
        };
    },
});

export const updatePartner = mutation({
    args: {
        partnerId: v.string(),
        updates: v.any(),
    },
    handler: async (ctx, args) => {
        const partner = await ctx.db
            .query("partners")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .unique();
        if (!partner) return false;
        await ctx.db.patch(partner._id, args.updates);
        return true;
    }
});

export const deletePartner = mutation({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        const partner = await ctx.db
            .query("partners")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .unique();
        if (!partner) return false;
        await ctx.db.delete(partner._id);
        return true;
    }
});
