import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nowKST } from "./utils";

// 유지율 데이터 업로드
export const uploadRetentionRecords = mutation({
    args: {
        records: v.array(v.object({
            certNo: v.string(),
            memberNo: v.string(),
            joinDate: v.string(),
            customerName: v.string(),
            birth: v.string(),
            phone: v.string(),
            productName: v.string(),
            joinStatus: v.string(),
            b2bCompany: v.string(),
            paymentStatus: v.string(),
            modelName: v.optional(v.string()),
            transferDate: v.optional(v.string()),
            paymentMethod: v.string(),
            cancelStatus: v.optional(v.string()),
            approvalStatus: v.string(),
            b2bId: v.optional(v.string()),
            idNo: v.string(),
            discountCount: v.number(),
            actualPaymentCount: v.number(),
        }))
    },
    handler: async (ctx, args) => {
        const now = nowKST();
        
        // 기존 데이터 삭제 (새로고침 방식)
        const existing = await ctx.db.query("retentionRecords").collect();
        for (const record of existing) {
            await ctx.db.delete(record._id);
        }

        // 새 데이터 삽입
        for (const record of args.records) {
            await ctx.db.insert("retentionRecords", {
                ...record,
                uploadedAt: now,
            });
        }
        return { count: args.records.length };
    }
});

// 유지율 데이터 조회 (Admin 또는 파트너 필터링)
export const getRetentionRecords = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const records = await ctx.db.query("retentionRecords").order("desc").collect();
        
        if (!args.partnerId || args.partnerId === "admin") {
            return records;
        }

        // 파트너 매핑 정보 가져오기
        const mapping = await ctx.db
            .query("partnerRetentionMappings")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId!))
            .unique();

        if (!mapping || !mapping.idNos.length) {
            return [];
        }

        // 매핑된 ID_NO에 해당하는 데이터만 필터링
        return records.filter(r => mapping.idNos.includes(r.idNo));
    }
});

// 파트너 매핑 정보 조회
export const getPartnerMappings = query({
    handler: async (ctx) => {
        return await ctx.db.query("partnerRetentionMappings").collect();
    }
});

// 파트너 매핑 업데이트
export const updatePartnerMapping = mutation({
    args: {
        partnerId: v.string(),
        idNos: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("partnerRetentionMappings")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                idNos: args.idNos,
                updatedAt: nowKST(),
            });
        } else {
            await ctx.db.insert("partnerRetentionMappings", {
                partnerId: args.partnerId,
                idNos: args.idNos,
                updatedAt: nowKST(),
            });
        }
    }
});

// 대시보드 통계 조회
export const getRetentionStats = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // 데이터 필터링 (getRetentionRecords 로직 재사용)
        const records = await ctx.db.query("retentionRecords").collect();
        let filtered = records;

        if (args.partnerId && args.partnerId !== "admin") {
            const mapping = await ctx.db
                .query("partnerRetentionMappings")
                .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId!))
                .unique();
            if (mapping) {
                filtered = records.filter(r => mapping.idNos.includes(r.idNo));
            } else {
                filtered = [];
            }
        }

        // 통계 계산
        const stats = {
            total: filtered.length,
            normalPayment: filtered.filter(r => 
                !r.joinStatus.includes("해약") && 
                !r.joinStatus.includes("철회") && 
                (r.paymentStatus.includes("정상") || r.paymentStatus === "" || r.paymentStatus === "정상납입")
            ).length,
            delinquent: filtered.filter(r => 
                !r.joinStatus.includes("해약") && 
                !r.joinStatus.includes("철회") && 
                r.paymentStatus.includes("연체")
            ).length,
            delinquentCounts: {} as Record<string, number>,
            cancelCount: filtered.filter(r => 
                r.joinStatus.includes("해약") || 
                r.joinStatus.includes("철회") ||
                (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-")
            ).length,
            cardCount: filtered.filter(r => r.paymentMethod.includes("카드")).length,
            cmsCount: filtered.filter(r => r.paymentMethod.toUpperCase().includes("CMS") || r.paymentMethod.includes("이체")).length,
        };

        // 연체 회차별 카운트
        filtered.forEach(r => {
            if (r.paymentStatus.includes("연체")) {
                stats.delinquentCounts[r.paymentStatus] = (stats.delinquentCounts[r.paymentStatus] || 0) + 1;
            }
        });

        return stats;
    }
});

// 가용한 모든 ID_NO 목록 조회 (매핑용)
export const getAllAvailableIdNos = query({
    handler: async (ctx) => {
        const records = await ctx.db.query("retentionRecords").collect();
        const idNos = new Set(records.map(r => r.idNo));
        return Array.from(idNos).sort();
    }
});

// 유지율 관리 메모 추가
export const addRetentionMemo = mutation({
    args: {
        customerKey: v.string(),
        content: v.string(),
        createdBy: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("retentionMemos", {
            customerKey: args.customerKey,
            content: args.content,
            createdBy: args.createdBy,
            createdAt: nowKST(),
        });
    }
});

// 유지율 관리 메모 조회
export const getRetentionMemos = query({
    args: { customerKey: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("retentionMemos")
            .withIndex("by_customerKey", (q) => q.eq("customerKey", args.customerKey))
            .order("desc")
            .collect();
    }
});
