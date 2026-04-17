import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 모든 활성 상태 조회 (프론트엔드 일반 조회용)
export const getStatuses = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("applicationStatuses")
            .withIndex("by_order")
            .filter((q) => q.eq(q.field("isActive"), true))
            .collect();
    },
});

// 파트너(지사/대리점) 노출용 상태 조회
export const getPartnerStatuses = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("applicationStatuses")
            .withIndex("by_order")
            .filter((q) => 
                q.and(
                    q.eq(q.field("isActive"), true),
                    q.eq(q.field("isPartnerVisible"), true)
                )
            )
            .collect();
    },
});

// 모든 상태 조회 (관리자 설정 페이지용)
export const getAllStatuses = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("applicationStatuses")
            .withIndex("by_order")
            .collect();
    },
});

// 상태 생성
export const createStatus = mutation({
    args: {
        label: v.string(),
        color: v.optional(v.string()),
        order: v.number(),
        isActive: v.boolean(),
        isSystem: v.optional(v.boolean()),
        isPartnerVisible: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("applicationStatuses", {
            ...args,
            isSystem: args.isSystem ?? false,
        });
        return id;
    },
});

// 상태 수정
export const updateStatus = mutation({
    args: {
        id: v.id("applicationStatuses"),
        label: v.optional(v.string()),
        color: v.optional(v.string()),
        order: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        isPartnerVisible: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return true;
    },
});

// 상태 삭제
export const deleteStatus = mutation({
    args: { id: v.id("applicationStatuses") },
    handler: async (ctx, args) => {
        // Remove isSystem check as requested by user
        await ctx.db.delete(args.id);
        return true;
    },
});

// 상태 순서 업데이트
export const reorderStatuses = mutation({
    args: {
        statuses: v.array(
            v.object({
                id: v.id("applicationStatuses"),
                order: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        for (const s of args.statuses) {
            await ctx.db.patch(s.id, { order: s.order });
        }
        return true;
    },
});


// 초기 데이터 시딩 (기존 하드코딩된 값들)
export const seedStatuses = mutation({
    handler: async (ctx) => {
        const existing = await ctx.db.query("applicationStatuses").collect();
        if (existing.length > 0) return "Already seeded";

        const initialStatuses = [
            { label: '접수대기', order: 1, isActive: true, isSystem: true },
            { label: '접수완료', order: 2, isActive: true, isSystem: true },
            { label: '부재', order: 3, isActive: true, isSystem: true },
            { label: '보류', order: 4, isActive: true, isSystem: true },
            { label: '불가', order: 5, isActive: true, isSystem: true },
            { label: '거부', order: 6, isActive: true, isSystem: true },
            { label: '접수취소', order: 7, isActive: true, isSystem: true },
            { label: '녹취완료(출금확인중)', order: 8, isActive: true, isSystem: true },
            { label: '정상가입', order: 9, isActive: true, isSystem: true },
            { label: '배송완료', order: 10, isActive: true, isSystem: true },
            { label: '청약철회', order: 11, isActive: true, isSystem: true },
            { label: '해약', order: 12, isActive: true, isSystem: true },
            { label: '정산완료', order: 13, isActive: true, isSystem: true },
        ];

        for (const status of initialStatuses) {
            await ctx.db.insert("applicationStatuses", status);
        }
        return "Success";
    },
});
