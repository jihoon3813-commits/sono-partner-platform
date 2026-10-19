import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nowKST } from "./utils";

/**
 * Convex 스토리지에 직접 업로드할 임시 URL 생성
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * 업로드된 녹취 파일 정보를 DB에 저장
 */
export const saveRecording = mutation({
    args: {
        applicationNo: v.string(),
        storageId: v.id("_storage"),
        fileName: v.string(),
        fileSize: v.number(),
        fileType: v.string(),
        duration: v.optional(v.number()),
        uploadedBy: v.optional(v.string()),
        memo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const recordingId = await ctx.db.insert("recordings", {
            applicationNo: args.applicationNo,
            storageId: args.storageId,
            fileName: args.fileName,
            fileSize: args.fileSize,
            fileType: args.fileType,
            duration: args.duration,
            uploadedAt: nowKST(),
            uploadedBy: args.uploadedBy || "관리자",
            memo: args.memo?.trim() || undefined,
        });

        return recordingId;
    },
});

/**
 * 특정 고객 신청 건의 녹취 파일 목록 조회 (스트리밍 및 재생 가능한 URL 포함)
 */
export const getRecordingsByApplication = query({
    args: {
        applicationNo: v.string(),
    },
    handler: async (ctx, args) => {
        const records = await ctx.db
            .query("recordings")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .order("desc")
            .collect();

        // 각 파일에 대한 다운로드/재생 URL 부여
        const withUrls = await Promise.all(
            records.map(async (rec) => {
                const url = await ctx.storage.getUrl(rec.storageId);
                return {
                    ...rec,
                    url,
                };
            })
        );

        return withUrls;
    },
});

/**
 * 녹취 파일 삭제 (Storage 파일 + DB 레코드 모두 삭제)
 */
export const deleteRecording = mutation({
    args: {
        recordingId: v.id("recordings"),
    },
    handler: async (ctx, args) => {
        const recording = await ctx.db.get(args.recordingId);
        if (!recording) {
            throw new Error("해당 녹취 파일 정보를 찾을 수 없습니다.");
        }

        // 1. Storage에서 실제 파일 삭제
        if (recording.storageId) {
            try {
                await ctx.storage.delete(recording.storageId);
            } catch (err) {
                console.error("Storage delete error:", err);
            }
        }

        // 2. DB 레코드 삭제
        await ctx.db.delete(args.recordingId);

        return { success: true };
    },
});

/**
 * 고객 목록에서 각 applicationNo별 녹취 파일 개수를 조회
 */
export const getRecordingCounts = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("recordings").collect();
        const counts: Record<string, number> = {};
        for (const item of all) {
            if (item.applicationNo) {
                counts[item.applicationNo] = (counts[item.applicationNo] || 0) + 1;
            }
        }
        return counts;
    },
});

/**
 * 고객 목록에서 각 applicationNo별 녹취 파일 통계(개수 및 총 파일용량) 조회
 */
export const getRecordingStats = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("recordings").collect();
        const stats: Record<string, { count: number; totalSize: number }> = {};
        for (const item of all) {
            if (item.applicationNo) {
                if (!stats[item.applicationNo]) {
                    stats[item.applicationNo] = { count: 0, totalSize: 0 };
                }
                stats[item.applicationNo].count += 1;
                stats[item.applicationNo].totalSize += (item.fileSize || 0);
            }
        }
        return stats;
    },
});

