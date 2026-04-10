import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const promotions = await ctx.db.query("promotions").collect();
        return promotions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
});

export const getById = query({
    args: { id: v.id("promotions") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        period: v.string(),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        externalUrl: v.optional(v.string()),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("promotions", {
            ...args,
            createdAt: new Date().toISOString(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("promotions"),
        title: v.optional(v.string()),
        period: v.optional(v.string()),
        description: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        externalUrl: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...rest } = args;
        await ctx.db.patch(id, rest);
    },
});

export const remove = mutation({
    args: { id: v.id("promotions") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
