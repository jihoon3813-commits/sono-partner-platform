import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getSetting = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();
    },
});

export const updateSetting = mutation({
    args: { key: v.string(), value: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                updatedAt: new Date().toISOString(),
            });
        } else {
            await ctx.db.insert("settings", {
                key: args.key,
                value: args.value,
                updatedAt: new Date().toISOString(),
            });
        }
    },
});

export const getTemplateUrl = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const setting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .unique();

        if (!setting || !setting.value) return null;

        // URL 형식인 경우 그대로 반환
        if (setting.value.startsWith("http://") || setting.value.startsWith("https://")) {
            return setting.value;
        }

        // Storage ID인 경우 URL로 변환 시도
        try {
            const storageId = setting.value as Id<"_storage">;
            const url = await ctx.storage.getUrl(storageId);
            return url;
        } catch (e) {
            // 유효하지 않은 Storage ID인 경우 null 반환
            console.error("Invalid storage ID:", setting.value);
            return null;
        }
    },
});
