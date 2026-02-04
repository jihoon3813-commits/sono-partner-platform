import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllProducts = query({
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

export const addProduct = mutation({
    args: {
        brand: v.optional(v.string()),
        model: v.optional(v.string()),
        name: v.optional(v.string()),
        tag: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("products", {
            brand: args.brand,
            model: args.model,
            name: args.name,
            tag: args.tag,
            image: args.image,
        });
    },
});

export const deleteProduct = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
