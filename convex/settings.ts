import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { nowKST } from "./utils";

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
                updatedAt: nowKST(),
            });
        } else {
            await ctx.db.insert("settings", {
                key: args.key,
                value: args.value,
                updatedAt: nowKST(),
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

// 가입요청 엑셀용 판매채널명 매핑 조회
export const getChannelMappings = query({
    args: {},
    handler: async (ctx) => {
        const setting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "lifejoy_channel_mappings"))
            .unique();

        if (!setting || !setting.value) {
            return [];
        }

        try {
            return JSON.parse(setting.value);
        } catch (e) {
            console.error("Failed to parse channel mappings:", e);
            return [];
        }
    },
});

// 가입요청 엑셀용 판매채널명 매핑 저장
export const saveChannelMappings = mutation({
    args: {
        mappings: v.array(
            v.object({
                partnerId: v.string(),
                partnerName: v.string(),
                excelChannelName: v.string(),
                memo: v.optional(v.string()),
                updatedAt: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "lifejoy_channel_mappings"))
            .unique();

        const jsonVal = JSON.stringify(args.mappings);

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: jsonVal,
                updatedAt: nowKST(),
            });
        } else {
            await ctx.db.insert("settings", {
                key: "lifejoy_channel_mappings",
                value: jsonVal,
                updatedAt: nowKST(),
            });
        }
    },
});
