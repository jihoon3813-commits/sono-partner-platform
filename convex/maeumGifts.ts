import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowKST } from "./utils";

const DEFAULT_LANDING_KEY = "maeum-ad";

function todayKSTHyphen(): string {
    return nowKST().slice(0, 10); // YYYY-MM-DD
}

function normalizeDateHyphen(raw?: string): string {
    const trimmed = (raw || "").trim();
    if (!trimmed) return "";
    if (/^\d{8}$/.test(trimmed)) {
        return `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`;
    }
    return trimmed.replace(/\./g, "-");
}

function isWithinDateRange(today: string, startDate?: string, endDate?: string): boolean {
    const start = normalizeDateHyphen(startDate);
    const end = normalizeDateHyphen(endDate);
    if (start && today < start) return false;
    if (end && today > end) return false;
    return true;
}

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const getEventConfig = query({
    args: { landingKey: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const key = args.landingKey || DEFAULT_LANDING_KEY;
        const config = await ctx.db
            .query("maeumGiftEventConfig")
            .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
            .first();

        if (!config) {
            return {
                landingKey: key,
                isEnabled: true,
                badgeText: "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중",
                title: "지금 마음든든 상담·가입 시 특별 사은품 증정!",
                subtitle: "기간 한정 특별 혜택, 원하는 사은품을 선택하고 상담을 신청해 보세요.",
                startDate: "",
                endDate: "",
                commonNotice:
                    "• 사은품은 정상 가입 및 초회 납입 완료 고객에 한해 증정됩니다.\n• 재고 소진 시 동급 사은품으로 대체될 수 있습니다.",
                slideIntervalMs: 1500,
                updatedAt: "",
            };
        }

        return {
            ...config,
            slideIntervalMs: config.slideIntervalMs ?? 1500,
        };
    },
});

export const saveEventConfig = mutation({
    args: {
        landingKey: v.optional(v.string()),
        isEnabled: v.boolean(),
        badgeText: v.optional(v.string()),
        title: v.string(),
        subtitle: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        commonNotice: v.optional(v.string()),
        slideIntervalMs: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const key = args.landingKey || DEFAULT_LANDING_KEY;
        const now = nowKST();
        const existing = await ctx.db
            .query("maeumGiftEventConfig")
            .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
            .first();

        const payload = {
            landingKey: key,
            isEnabled: args.isEnabled,
            badgeText: args.badgeText || "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중",
            title: args.title,
            subtitle: args.subtitle || "",
            startDate: args.startDate || "",
            endDate: args.endDate || "",
            commonNotice: args.commonNotice || "",
            slideIntervalMs:
                typeof args.slideIntervalMs === "number" && args.slideIntervalMs >= 300
                    ? args.slideIntervalMs
                    : 1500,
            updatedAt: now,
        };

        if (existing) {
            await ctx.db.patch(existing._id, payload);
            return existing._id;
        }
        return await ctx.db.insert("maeumGiftEventConfig", payload);
    },
});

const thumbnailItemValidator = v.object({
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
});

async function resolveGiftImages(ctx: any, g: any) {
    let resolvedThumbnailUrl = g.thumbnailUrl || "";
    let resolvedDetailImageUrl = g.detailImageUrl || "";

    if (g.thumbnailStorageId) {
        const url = await ctx.storage.getUrl(g.thumbnailStorageId);
        if (url) resolvedThumbnailUrl = url;
    }
    if (g.detailImageStorageId) {
        const url = await ctx.storage.getUrl(g.detailImageStorageId);
        if (url) resolvedDetailImageUrl = url;
    }

    const resolvedThumbnailUrls: string[] = [];
    if (Array.isArray(g.thumbnailImages) && g.thumbnailImages.length > 0) {
        for (const item of g.thumbnailImages) {
            if (item.storageId) {
                const url = await ctx.storage.getUrl(item.storageId);
                if (url) {
                    resolvedThumbnailUrls.push(url);
                    continue;
                }
            }
            if (item.url && item.url.trim()) {
                resolvedThumbnailUrls.push(item.url.trim());
            }
        }
    }

    if (resolvedThumbnailUrls.length === 0 && resolvedThumbnailUrl) {
        resolvedThumbnailUrls.push(resolvedThumbnailUrl);
    }

    return {
        ...g,
        resolvedThumbnailUrl: resolvedThumbnailUrls[0] || resolvedThumbnailUrl,
        resolvedThumbnailUrls,
        resolvedDetailImageUrl,
    };
}

export const listAdminGifts = query({
    args: { landingKey: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const key = args.landingKey || DEFAULT_LANDING_KEY;
        const gifts = await ctx.db
            .query("maeumGifts")
            .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
            .collect();

        const sorted = gifts.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return await Promise.all(sorted.map((g) => resolveGiftImages(ctx, g)));
    },
});

export const getPublicGiftEvent = query({
    args: { landingKey: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const key = args.landingKey || DEFAULT_LANDING_KEY;
        const today = todayKSTHyphen();

        const config = await ctx.db
            .query("maeumGiftEventConfig")
            .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
            .first();

        if (config && !config.isEnabled) {
            return {
                isEventActive: false,
                config,
                gifts: [],
            };
        }

        if (config && !isWithinDateRange(today, config.startDate, config.endDate)) {
            return {
                isEventActive: false,
                config,
                gifts: [],
            };
        }

        const gifts = await ctx.db
            .query("maeumGifts")
            .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
            .collect();

        const activeGifts = gifts
            .filter(
                (g) =>
                    g.isActive &&
                    isWithinDateRange(today, g.startDate, g.endDate)
            )
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const resolvedGifts = await Promise.all(
            activeGifts.map((g) => resolveGiftImages(ctx, g))
        );

        const resolvedConfig = config
            ? {
                  ...config,
                  slideIntervalMs: config.slideIntervalMs ?? 1500,
              }
            : {
                  landingKey: key,
                  isEnabled: true,
                  badgeText: "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중",
                  title: "지금 마음든든 상담·가입 시 특별 사은품 증정!",
                  subtitle: "기간 한정 특별 혜택, 원하는 사은품을 선택하고 상담을 신청해 보세요.",
                  startDate: "",
                  endDate: "",
                  commonNotice:
                      "• 사은품은 정상 가입 및 초회 납입 완료 고객에 한해 증정됩니다.\n• 재고 소진 시 동급 사은품으로 대체될 수 있습니다.",
                  slideIntervalMs: 1500,
                  updatedAt: "",
              };

        return {
            isEventActive: resolvedGifts.length > 0,
            config: resolvedConfig,
            gifts: resolvedGifts,
        };
    },
});

export const createGift = mutation({
    args: {
        landingKey: v.optional(v.string()),
        name: v.string(),
        thumbnailUrl: v.string(),
        thumbnailStorageId: v.optional(v.id("_storage")),
        thumbnailImages: v.optional(v.array(thumbnailItemValidator)),
        detailImageUrl: v.optional(v.string()),
        detailImageStorageId: v.optional(v.id("_storage")),
        notice: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        isActive: v.boolean(),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const key = args.landingKey || DEFAULT_LANDING_KEY;
        const now = nowKST();
        let nextOrder = args.order;
        if (nextOrder === undefined) {
            const existing = await ctx.db
                .query("maeumGifts")
                .withIndex("by_landingKey", (q) => q.eq("landingKey", key))
                .collect();
            nextOrder =
                existing.length > 0
                    ? Math.max(...existing.map((g) => g.order ?? 0)) + 1
                    : 0;
        }

        const firstThumb = args.thumbnailImages?.[0];

        return await ctx.db.insert("maeumGifts", {
            landingKey: key,
            name: args.name.trim(),
            thumbnailUrl: args.thumbnailUrl.trim() || firstThumb?.url?.trim() || "",
            thumbnailStorageId: args.thumbnailStorageId ?? firstThumb?.storageId,
            thumbnailImages: args.thumbnailImages,
            detailImageUrl: args.detailImageUrl?.trim() || "",
            detailImageStorageId: args.detailImageStorageId,
            notice: args.notice?.trim() || "",
            startDate: args.startDate?.trim() || "",
            endDate: args.endDate?.trim() || "",
            isActive: args.isActive,
            order: nextOrder,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateGift = mutation({
    args: {
        id: v.id("maeumGifts"),
        name: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        thumbnailStorageId: v.optional(v.union(v.id("_storage"), v.null())),
        thumbnailImages: v.optional(v.array(thumbnailItemValidator)),
        detailImageUrl: v.optional(v.string()),
        detailImageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
        notice: v.optional(v.string()),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, thumbnailStorageId, detailImageStorageId, ...rest } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("사은품을 찾을 수 없습니다.");

        const patchData: Record<string, any> = {
            ...rest,
            updatedAt: nowKST(),
        };

        if (thumbnailStorageId !== undefined) {
            const stillInList = args.thumbnailImages?.some(
                (item) => item.storageId === existing.thumbnailStorageId
            );
            if (
                existing.thumbnailStorageId &&
                existing.thumbnailStorageId !== thumbnailStorageId &&
                !stillInList
            ) {
                try {
                    await ctx.storage.delete(existing.thumbnailStorageId);
                } catch {}
            }
            patchData.thumbnailStorageId =
                thumbnailStorageId === null ? undefined : thumbnailStorageId;
        }

        if (detailImageStorageId !== undefined) {
            if (
                existing.detailImageStorageId &&
                existing.detailImageStorageId !== detailImageStorageId
            ) {
                try {
                    await ctx.storage.delete(existing.detailImageStorageId);
                } catch {}
            }
            patchData.detailImageStorageId =
                detailImageStorageId === null ? undefined : detailImageStorageId;
        }

        await ctx.db.patch(id, patchData);
    },
});

export const deleteGift = mutation({
    args: { id: v.id("maeumGifts") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.id);
        if (!existing) return;
        if (existing.thumbnailStorageId) {
            try {
                await ctx.storage.delete(existing.thumbnailStorageId);
            } catch {}
        }
        if (Array.isArray(existing.thumbnailImages)) {
            for (const item of existing.thumbnailImages) {
                if (item.storageId && item.storageId !== existing.thumbnailStorageId) {
                    try {
                        await ctx.storage.delete(item.storageId);
                    } catch {}
                }
            }
        }
        if (existing.detailImageStorageId) {
            try {
                await ctx.storage.delete(existing.detailImageStorageId);
            } catch {}
        }
        await ctx.db.delete(args.id);
    },
});
