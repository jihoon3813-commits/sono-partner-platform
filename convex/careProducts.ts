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
        features: v.array(v.string()),
        syncUrl: v.optional(v.string()),
        paymentCount: v.optional(v.string()),
        defermentPeriod: v.optional(v.string()),
        maturityCount: v.optional(v.string()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        const now = new Date().toISOString();
        if (id) {
            await ctx.db.patch(id, { ...data, updatedAt: now });
            return id;
        } else {
            // 정렬 순서가 지정되지 않았을 때의 기본값 지정 (마지막 순서)
            let finalOrder = data.order;
            if (finalOrder === undefined) {
                const existing = await ctx.db.query("careProducts").collect();
                finalOrder = existing.length + 1;
            }
            return await ctx.db.insert("careProducts", {
                ...data,
                order: finalOrder,
                createdAt: now,
                updatedAt: now,
            });
        }
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
