import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nowKST } from "./utils";

export const getAdminByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("admins")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

export const validateAdminCredentials = mutation({
    args: {
        loginId: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.loginId))
            .first();

        // ID로 못 찾으면 이메일로 시도
        let targetAdmin = admin;
        if (!targetAdmin) {
            targetAdmin = await ctx.db
                .query("admins")
                .withIndex("by_email", (q) => q.eq("email", args.loginId))
                .first();
        }

        if (!targetAdmin) return { valid: false };
        if (targetAdmin.password !== args.password) return { valid: false };

        // 마지막 로그인 업데이트
        await ctx.db.patch(targetAdmin._id, {
            lastLogin: nowKST()
        });

        return {
            valid: true,
            role: targetAdmin.role || 'admin',
            adminId: targetAdmin.adminId || 'admin',
            adminName: targetAdmin.adminName || '관리자'
        };
    },
});

export const createAdmin = mutation({
    args: {
        adminId: v.string(),
        email: v.string(),
        password: v.string(),
        adminName: v.string(),
        role: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("admins").withIndex("by_adminId", q => q.eq("adminId", args.adminId)).first();
        if (existing) return;

        await ctx.db.insert("admins", {
            adminId: args.adminId,
            email: args.email,
            password: args.password,
            adminName: args.adminName,
            role: args.role,
        });
    }
});

export const updateAdmin = mutation({
    args: {
        adminId: v.string(),
        updates: v.any(),
    },
    handler: async (ctx, args) => {
        let admin = await ctx.db
            .query("admins")
            .withIndex("by_adminId", (q) => q.eq("adminId", args.adminId))
            .first();

        if (!admin) {
            admin = await ctx.db
                .query("admins")
                .withIndex("by_email", (q) => q.eq("email", args.adminId))
                .first();
        }

        if (!admin) {
            // If admin table is empty/not seeded yet, create master admin record
            const newId = await ctx.db.insert("admins", {
                adminId: args.adminId || "admin",
                email: args.updates.email || "admin@sono.com",
                password: args.updates.password || "admin1234",
                adminName: args.updates.adminName || "본사 관리자",
                role: "admin",
            });
            await ctx.db.patch(newId, args.updates);
            return true;
        }

        await ctx.db.patch(admin._id, args.updates);
        return true;
    }
});

