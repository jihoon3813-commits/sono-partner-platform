import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nowKST, todayKSTStr } from "./utils";

const fieldValidator = v.object({
    id: v.string(),
    type: v.string(),
    fieldKey: v.string(),
    label: v.string(),
    placeholder: v.optional(v.string()),
    required: v.optional(v.boolean()),
    page: v.number(),
    xRatio: v.number(),
    yRatio: v.number(),
    widthRatio: v.number(),
    heightRatio: v.number(),
    fontSize: v.optional(v.number()),
    checkedValue: v.optional(v.string()),
    groupName: v.optional(v.string()),
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const getTemplates = query({
    args: {},
    handler: async (ctx) => {
        const templates = await ctx.db.query("maeumContractTemplates").order("desc").collect();
        return await Promise.all(
            templates.map(async (t) => ({
                ...t,
                pdfUrl: await ctx.storage.getUrl(t.storageId),
            }))
        );
    },
});

export const getActiveTemplate = query({
    args: {},
    handler: async (ctx) => {
        const active = await ctx.db
            .query("maeumContractTemplates")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .first();
        if (!active) return null;
        return {
            ...active,
            pdfUrl: await ctx.storage.getUrl(active.storageId),
        };
    },
});

export const saveTemplate = mutation({
    args: {
        name: v.string(),
        storageId: v.id("_storage"),
        fileName: v.string(),
        pageCount: v.number(),
        fields: v.array(fieldValidator),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const now = nowKST();
        const shouldActivate = args.isActive !== false;

        if (shouldActivate) {
            const existingActives = await ctx.db
                .query("maeumContractTemplates")
                .withIndex("by_isActive", (q) => q.eq("isActive", true))
                .collect();
            for (const item of existingActives) {
                await ctx.db.patch(item._id, { isActive: false });
            }
        }

        const id = await ctx.db.insert("maeumContractTemplates", {
            name: args.name,
            storageId: args.storageId,
            fileName: args.fileName,
            pageCount: args.pageCount,
            fields: args.fields,
            isActive: shouldActivate,
            createdAt: now,
            updatedAt: now,
        });
        return id;
    },
});

export const updateTemplateFields = mutation({
    args: {
        templateId: v.id("maeumContractTemplates"),
        name: v.optional(v.string()),
        fields: v.array(fieldValidator),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.templateId);
        if (!existing) throw new Error("양식을 찾을 수 없습니다.");

        await ctx.db.patch(args.templateId, {
            ...(args.name !== undefined ? { name: args.name } : {}),
            fields: args.fields,
            updatedAt: nowKST(),
        });
        return true;
    },
});

export const setActiveTemplate = mutation({
    args: {
        templateId: v.id("maeumContractTemplates"),
    },
    handler: async (ctx, args) => {
        const existingActives = await ctx.db
            .query("maeumContractTemplates")
            .withIndex("by_isActive", (q) => q.eq("isActive", true))
            .collect();
        for (const item of existingActives) {
            await ctx.db.patch(item._id, { isActive: false });
        }
        await ctx.db.patch(args.templateId, {
            isActive: true,
            updatedAt: nowKST(),
        });
        return true;
    },
});

export const deleteTemplate = mutation({
    args: {
        templateId: v.id("maeumContractTemplates"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.get(args.templateId);
        if (!existing) return false;
        try {
            await ctx.storage.delete(existing.storageId);
        } catch {
            // ignore storage delete error if already removed
        }
        await ctx.db.delete(args.templateId);
        return true;
    },
});

export const submitMaeumContract = mutation({
    args: {
        partnerId: v.string(),
        partnerName: v.string(),
        productType: v.string(), // '마음든든3' | '마음든든4' | '마음든든5'
        planType: v.optional(v.string()),
        customerName: v.string(),
        customerBirth: v.optional(v.string()),
        customerGender: v.optional(v.string()),
        customerPhone: v.string(),
        customerEmail: v.optional(v.string()),
        customerAddress: v.optional(v.string()),
        customerZipcode: v.optional(v.string()),
        inquiry: v.optional(v.string()),
        accessPath: v.optional(v.string()),
        contractTemplateId: v.optional(v.string()),
        contractData: v.any(),
        contractSignatureDataUrl: v.optional(v.string()),
        contractPdfStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const dateStr = todayKSTStr();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        const applicationNo = `MD-${dateStr}-${random}`;
        const now = nowKST();

        const id = await ctx.db.insert("applications", {
            applicationNo,
            partnerId: args.partnerId || "ADMIN",
            partnerName: args.partnerName || "본사 직접 신청",
            productType: args.productType,
            planType: args.planType || "1",
            customerName: args.customerName.trim(),
            customerBirth: (args.customerBirth || "").trim(),
            customerGender: args.customerGender || "-",
            customerPhone: args.customerPhone.trim(),
            customerEmail: args.customerEmail || "",
            customerAddress: args.customerAddress || "",
            customerZipcode: args.customerZipcode || "",
            inquiry: args.inquiry || "마음든든 전자계약 신청",
            accessPath: args.accessPath || "D",
            status: "접수대기",
            assignedTo: "",
            createdAt: now,
            updatedAt: now,
            contractTemplateId: args.contractTemplateId,
            contractData: args.contractData,
            contractSignatureDataUrl: args.contractSignatureDataUrl,
            contractPdfStorageId: args.contractPdfStorageId,
            contractSignedAt: now,
        });

        await ctx.db.insert("statusHistory", {
            historyId: `SH-${Date.now()}`,
            applicationNo,
            previousStatus: "-",
            newStatus: "접수대기",
            changedBy: "전자계약",
            changedAt: now,
            memo: "마음든든 전자계약 신청 완료",
        });

        return { id, applicationNo };
    },
});

export const getContractPdfMap = query({
    args: {},
    handler: async (ctx) => {
        const apps = await ctx.db.query("applications").collect();
        const result: Record<
            string,
            {
                pdfUrl: string | null;
                signedAt?: string;
                hasContractData: boolean;
                contractTemplateId?: string;
            }
        > = {};

        await Promise.all(
            apps.map(async (app) => {
                if (app.contractPdfStorageId || app.contractData) {
                    const pdfUrl = app.contractPdfStorageId
                        ? await ctx.storage.getUrl(app.contractPdfStorageId)
                        : null;
                    result[app.applicationNo] = {
                        pdfUrl,
                        signedAt: app.contractSignedAt,
                        hasContractData: Boolean(app.contractData),
                        contractTemplateId: app.contractTemplateId,
                    };
                }
            })
        );

        return result;
    },
});
