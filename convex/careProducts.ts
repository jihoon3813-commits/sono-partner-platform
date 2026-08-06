import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 스마트케어 상품(플랜) 조회
export const get = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("careProducts").collect();
        // order(오름차순) 기준 정렬, 없으면 slotCount 오름차순 정렬
        return all.sort((a, b) => {
            if ((a.order ?? 0) !== (b.order ?? 0)) {
                return (a.order ?? 0) - (b.order ?? 0);
            }
            return (a.slotCount ?? 0) - (b.slotCount ?? 0);
        });
    },
});

// 단일 상품 조회
export const getById = query({
    args: { id: v.id("careProducts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// 상품 추가 또는 업데이트
export const upsert = mutation({
    args: {
        id: v.optional(v.id("careProducts")),
        name: v.string(),
        slotCount: v.number(),
        target: v.string(),
        monthlyPayment: v.number(),
        cardDiscountPayment: v.optional(v.number()),
        features: v.array(v.string()),
        syncUrl: v.optional(v.string()),
        paymentCount: v.optional(v.string()),
        defermentPeriod: v.optional(v.string()),
        maturityCount: v.optional(v.string()),
        order: v.optional(v.number()),
        autoUpdate: v.optional(v.boolean()),
        autoUpdateSchedule: v.optional(v.string()),
        lastSyncedAt: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        const now = new Date().toISOString();
        let careProductId = id;

        if (id) {
            await ctx.db.patch(id, { ...data, updatedAt: now });
        } else {
            // 정렬 순서가 지정되지 않았을 때의 기본값 지정 (마지막 순서)
            let finalOrder = data.order;
            if (finalOrder === undefined) {
                const existing = await ctx.db.query("careProducts").collect();
                finalOrder = existing.length + 1;
            }
            careProductId = await ctx.db.insert("careProducts", {
                ...data,
                order: finalOrder,
                autoUpdate: data.autoUpdate ?? false,
                autoUpdateSchedule: data.autoUpdateSchedule ?? "00:00",
                createdAt: now,
                updatedAt: now,
            });
        }

        // 연동된 제품들의 제휴카드 할인 가격 자동 업데이트
        if (careProductId) {
            const discountAmount = data.cardDiscountPayment || 0;
            // 1) careProductId가 일치하는 제품들 조회
            const matchedProducts = await ctx.db
                .query("products")
                .withIndex("by_careProductId", (q) => q.eq("careProductId", careProductId))
                .collect();

            for (const p of matchedProducts) {
                const newDiscountPayment = Math.max(0, (p.monthlyPayment || data.monthlyPayment) - discountAmount);
                await ctx.db.patch(p._id, {
                    monthlyPayment: p.monthlyPayment || data.monthlyPayment,
                    cardDiscountPayment: newDiscountPayment,
                    updatedAt: now,
                });
            }

            // 2) 혹시 careProductId는 없으나 slotCount가 일치하는 기존 제품들도 함께 업데이트 지원 (하위 호환성)
            const allProducts = await ctx.db.query("products").collect();
            const slotMatchedProducts = allProducts.filter(p => !p.careProductId && p.slotCount === data.slotCount);
            for (const p of slotMatchedProducts) {
                const newDiscountPayment = Math.max(0, (p.monthlyPayment || data.monthlyPayment) - discountAmount);
                await ctx.db.patch(p._id, {
                    careProductId: careProductId, // 자동으로 careProductId 매핑 처리
                    monthlyPayment: p.monthlyPayment || data.monthlyPayment,
                    cardDiscountPayment: newDiscountPayment,
                    updatedAt: now,
                });
            }
        }

        return careProductId;
    },
});

// 상품 삭제
export const remove = mutation({
    args: { id: v.id("careProducts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// 정렬 순서 업데이트
export const updateOrder = mutation({
    args: {
        id: v.id("careProducts"),
        order: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            order: args.order,
            updatedAt: new Date().toISOString(),
        });
    },
});

// 자동 업데이트 설정 토글 및 주기 변경
export const toggleAutoUpdate = mutation({
    args: {
        id: v.id("careProducts"),
        autoUpdate: v.optional(v.boolean()),
        autoUpdateSchedule: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) throw new Error("상품을 찾을 수 없습니다.");
        
        const now = new Date().toISOString();
        const patchData: any = { updatedAt: now };

        if (args.autoUpdate !== undefined) {
            patchData.autoUpdate = args.autoUpdate;
        }
        if (args.autoUpdateSchedule !== undefined) {
            patchData.autoUpdateSchedule = args.autoUpdateSchedule;
        }

        await ctx.db.patch(args.id, patchData);
    },
});
