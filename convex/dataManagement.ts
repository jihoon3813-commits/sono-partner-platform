import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// 실시간 테이블별 데이터 건수 조회
export const getTableCounts = query({
    args: {},
    handler: async (ctx) => {
        const [
            applications,
            statusHistory,
            retentionRecords,
            retentionRecords2,
            retentionRecords3,
            retentionMemos,
            retentionMemos2,
            analytics,
            customers,
            partners,
            partnerRequests,
            partnerRetentionMappings,
            partnerRetentionMappings2,
            admins,
        ] = await Promise.all([
            ctx.db.query("applications").collect(),
            ctx.db.query("statusHistory").collect(),
            ctx.db.query("retentionRecords").collect(),
            ctx.db.query("retentionRecords2").collect(),
            ctx.db.query("retentionRecords3").collect(),
            ctx.db.query("retentionMemos").collect(),
            ctx.db.query("retentionMemos2").collect(),
            ctx.db.query("analytics").collect(),
            ctx.db.query("customers").collect(),
            ctx.db.query("partners").collect(),
            ctx.db.query("partnerRequests").collect(),
            ctx.db.query("partnerRetentionMappings").collect(),
            ctx.db.query("partnerRetentionMappings2").collect(),
            ctx.db.query("admins").collect(),
        ]);

        return {
            applications: applications.length,
            statusHistory: statusHistory.length,
            retentionRecords: retentionRecords.length,
            retentionRecords2: retentionRecords2.length,
            retentionRecords3: retentionRecords3.length,
            retentionMemos: retentionMemos.length,
            retentionMemos2: retentionMemos2.length,
            analytics: analytics.length,
            customers: customers.length,
            partners: partners.length,
            partnerRequests: partnerRequests.length,
            partnerRetentionMappings: partnerRetentionMappings.length,
            partnerRetentionMappings2: partnerRetentionMappings2.length,
            admins: admins.length, // 절대 삭제되지 않는 관리자 계정 수
        };
    },
});

// 데이터 초기화 실행 (최대 1000개 단위 배치 처리로 안전성 확보)
// scope: 'customers_and_retention' (고객/유지율 데이터만) | 'all_except_admin' (파트너 포함 전체, 관리자 제외)
export const purgeData = mutation({
    args: {
        scope: v.string(), // 'customers_and_retention' | 'all_except_admin'
    },
    handler: async (ctx, args) => {
        let deletedCount = 0;
        const BATCH_SIZE = 1500;

        // 1. 기본 고객 및 유지율 관련 테이블 (항상 초기화 대상)
        const primaryTables: Array<
            | "applications"
            | "statusHistory"
            | "retentionRecords"
            | "retentionRecords2"
            | "retentionRecords3"
            | "retentionMemos"
            | "retentionMemos2"
            | "analytics"
            | "customers"
        > = [
            "applications",
            "statusHistory",
            "retentionRecords",
            "retentionRecords2",
            "retentionRecords3",
            "retentionMemos",
            "retentionMemos2",
            "analytics",
            "customers",
        ];

        // 2. 파트너 관련 테이블 (all_except_admin일 때만 포함)
        const partnerTables: Array<
            | "partners"
            | "partnerRequests"
            | "partnerApplications"
            | "partnerRetentionMappings"
            | "partnerRetentionMappings2"
        > = [
            "partners",
            "partnerRequests",
            "partnerApplications",
            "partnerRetentionMappings",
            "partnerRetentionMappings2",
        ];

        const targetTables = args.scope === "all_except_admin" 
            ? [...primaryTables, ...partnerTables]
            : primaryTables;

        // 테이블별로 순차 삭제 진행
        for (const tableName of targetTables) {
            // 절대 admins는 건드리지 않음 (하드코딩 방어)
            if ((tableName as string) === "admins") {
                continue;
            }

            const records = await ctx.db.query(tableName as any).take(BATCH_SIZE);
            for (const record of records) {
                await ctx.db.delete(record._id);
                deletedCount++;
            }
        }

        return {
            success: true,
            deletedCount,
            scope: args.scope,
            timestamp: new Date().toISOString(),
        };
    },
});
