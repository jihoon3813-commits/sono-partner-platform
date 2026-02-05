import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 상품 조회
export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("products").collect();
    },
});

// 상품 데이터 초기화 (Seed)
export const seed = mutation({
    args: {
        products: v.array(
            v.object({
                brand: v.string(),
                model: v.string(),
                name: v.string(),
                tag: v.string(),
                image: v.string(),
            })
        ),
    },
    handler: async (ctx, args) => {
        // 기존 데이터 삭제 (선택 사항, 중복 방지 위해)
        const existing = await ctx.db.query("products").collect();
        for (const p of existing) {
            await ctx.db.delete(p._id);
        }

        // 새 데이터 추가
        for (const p of args.products) {
            await ctx.db.insert("products", p);
        }
    },
});
