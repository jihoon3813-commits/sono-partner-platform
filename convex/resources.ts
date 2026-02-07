import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const listResources = query({
    args: { type: v.optional(v.string()) },
    handler: async (ctx, args) => {
        let resources;
        if (args.type) {
            resources = await ctx.db
                .query("resources")
                .withIndex("by_type", (q) => q.eq("type", args.type as string))
                .order("desc")
                .collect();
        } else {
            resources = await ctx.db.query("resources").order("desc").collect();
        }

        // Storage ID가 있는 경우 실제 URL로 변환
        return await Promise.all(resources.map(async (res) => {
            let directFileUrl = res.fileUrl;
            let directThumbnailUrl = res.thumbnailUrl;

            if (res.storageId) {
                const url = await ctx.storage.getUrl(res.storageId);
                if (url) directFileUrl = url;
            }

            if (res.thumbnailStorageId) {
                const url = await ctx.storage.getUrl(res.thumbnailStorageId);
                if (url) directThumbnailUrl = url;
            }

            return {
                ...res,
                directFileUrl,
                directThumbnailUrl
            };
        }));
    },
});

// 자료 등록
export const createResource = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        type: v.string(),
        fileUrl: v.string(),
        storageId: v.optional(v.id("_storage")),
        thumbnailUrl: v.optional(v.string()),
        thumbnailStorageId: v.optional(v.id("_storage")),
        isExternalUrl: v.boolean(),
        updatedBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("resources", {
            ...args,
            createdAt: new Date().toISOString(),
        });
    },
});

// 자료 삭제
export const deleteResource = mutation({
    args: { id: v.id("resources") },
    handler: async (ctx, args) => {
        const resource = await ctx.db.get(args.id);
        if (!resource) return;

        // Storage 파일도 삭제 시도 (선택 사항)
        if (resource.storageId) {
            await ctx.storage.delete(resource.storageId);
        }
        if (resource.thumbnailStorageId) {
            await ctx.storage.delete(resource.thumbnailStorageId);
        }

        await ctx.db.delete(args.id);
    },
});

// 파일 업로드를 위한 Storage URL 생성
export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
