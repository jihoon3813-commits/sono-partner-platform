import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllApplications = query({
    handler: async (ctx) => {
        return await ctx.db.query("applications").order("desc").collect();
    },
});

export const getApplicationsByPartnerId = query({
    args: { partnerId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("applications")
            .withIndex("by_partnerId", (q) => q.eq("partnerId", args.partnerId))
            .order("desc")
            .collect();
    },
});

export const getApplicationByNo = query({
    args: { applicationNo: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();
    },
});

export const createApplication = mutation({
    args: {
        applicationNo: v.optional(v.string()), // 명시적으로 번호를 줄 경우 사용
        partnerId: v.string(),
        partnerName: v.string(),
        productType: v.string(),
        planType: v.optional(v.string()),
        products: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerBirth: v.optional(v.string()),
        customerGender: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerAddress: v.optional(v.string()),
        customerZipcode: v.optional(v.string()),
        partnerMemberId: v.optional(v.string()),
        preferredContactTime: v.optional(v.string()),
        inquiry: v.optional(v.string()),
        status: v.optional(v.string()),
        assignedTo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        console.log(`[Convex] createApplication called with: ${JSON.stringify(args)}`);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const generatedNo = `SA-${dateStr}-${random}`;
        const applicationNo = args.applicationNo || generatedNo;
        const now = new Date().toISOString();

        // Extract status and assignedTo from args or use defaults
        const { status, assignedTo, ...rest } = args;

        const id = await ctx.db.insert("applications", {
            ...rest,
            customerName: rest.customerName || "",
            customerBirth: rest.customerBirth || "",
            customerGender: rest.customerGender || "-",
            customerPhone: rest.customerPhone || "",
            customerAddress: rest.customerAddress || "",
            customerZipcode: rest.customerZipcode || "",
            applicationNo,
            status: status || "접수",
            assignedTo: assignedTo || "",
            createdAt: now,
            updatedAt: now,
        });

        return await ctx.db.get(id);
    },
});

export const updateApplicationStatus = mutation({
    args: {
        applicationNo: v.string(),
        newStatus: v.string(),
        changedBy: v.string(),
        memo: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();

        if (!app) return false;

        const previousStatus = app.status;
        const updates: any = {
            status: args.newStatus,
            updatedAt: new Date().toISOString(),
        };

        if (args.newStatus === "정상가입") updates.contractDate = new Date().toISOString();

        await ctx.db.patch(app._id, updates);

        // 로그 기록
        await ctx.db.insert("statusHistory", {
            historyId: `H-${Date.now()}`,
            applicationNo: args.applicationNo,
            previousStatus,
            newStatus: args.newStatus,
            changedBy: args.changedBy,
            changedAt: new Date().toISOString(),
            memo: args.memo,
        });

        return true;
    },
});


export const updateApplicationAssignee = mutation({
    args: {
        applicationNo: v.string(),
        assignedTo: v.string(),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();

        if (!app) return false;

        await ctx.db.patch(app._id, {
            assignedTo: args.assignedTo,
            updatedAt: new Date().toISOString(),
        });

        return true;
    },
});

export const updateApplicationDetails = mutation({
    args: {
        applicationNo: v.string(),
        updates: v.object({
            firstPaymentDate: v.optional(v.string()),
            registrationDate: v.optional(v.string()),
            paymentMethod: v.optional(v.string()),
            cancellationProcessing: v.optional(v.string()),
            withdrawalProcessing: v.optional(v.string()),
            remarks: v.optional(v.string()),
            status: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db
            .query("applications")
            .withIndex("by_applicationNo", (q) => q.eq("applicationNo", args.applicationNo))
            .unique();

        if (!app) return false;

        // Filter out undefined values to avoid Convex patch errors
        const patchData: any = {
            updatedAt: new Date().toISOString(),
        };

        Object.entries(args.updates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                patchData[key] = value;
            }
        });

        await ctx.db.patch(app._id, patchData);

        return true;
    },
});

export const createApplications = mutation({
    args: {
        applications: v.array(v.object({
            partnerId: v.string(),
            partnerName: v.string(),
            productType: v.string(),
            planType: v.optional(v.string()),
            products: v.optional(v.string()),
            customerName: v.optional(v.string()),
            customerBirth: v.optional(v.string()),
            customerGender: v.optional(v.string()),
            customerPhone: v.optional(v.string()),
            customerEmail: v.optional(v.string()),
            customerAddress: v.optional(v.string()),
            customerZipcode: v.optional(v.string()),
            partnerMemberId: v.optional(v.string()),
            preferredContactTime: v.optional(v.string()),
            inquiry: v.optional(v.string()),
            status: v.optional(v.string()),
            assignedTo: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        const dateStr = now.slice(0, 10).replace(/-/g, '');
        let count = 0;

        for (const appData of args.applications) {
            const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            const applicationNo = `SA-${dateStr}-${random}`;

            const { status, assignedTo, ...rest } = appData;

            await ctx.db.insert("applications", {
                ...rest,
                customerName: rest.customerName || "",
                customerBirth: rest.customerBirth || "",
                customerGender: rest.customerGender || "-",
                customerPhone: rest.customerPhone || "",
                customerAddress: rest.customerAddress || "",
                customerZipcode: rest.customerZipcode || "",
                applicationNo,
                status: status || "접수",
                assignedTo: assignedTo || "",
                createdAt: now,
                updatedAt: now,
            });
            count++;
        }
        return count;
    },
});

export const bulkSyncApplications = mutation({
    args: {
        applications: v.array(v.object({
            partnerName: v.string(),
            customerName: v.string(),
            customerPhone: v.string(),
            productType: v.string(),
            planType: v.optional(v.string()), // 구좌
            firstPaymentDate: v.optional(v.string()),
            registrationDate: v.optional(v.string()),
            paymentMethod: v.optional(v.string()),
            cancellationProcessing: v.optional(v.string()),
            withdrawalProcessing: v.optional(v.string()),
            status: v.string(), // 상담결과
            remarks: v.optional(v.string()), // 사유
            createdAt: v.optional(v.string()), // 신청일 (YYYY-MM-DD or similar)
        })),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        let created = 0;
        let updated = 0;

        // Fetch all partners for mapping names to IDs
        const partners = await ctx.db.query("partners").collect();
        const partnerMap = new Map(partners.map(p => [p.companyName, p.partnerId]));

        const updatedNames: string[] = [];

        for (const data of args.applications) {
            // Server-side enforcement of data format

            // 1. Phone Formatting
            let formattedPhone = data.customerPhone.replace(/[^0-9]/g, "");
            if (formattedPhone.length === 11) {
                formattedPhone = `${formattedPhone.slice(0, 3)}-${formattedPhone.slice(3, 7)}-${formattedPhone.slice(7)}`;
            } else if (formattedPhone.length === 10) {
                if (formattedPhone.startsWith('02')) {
                    formattedPhone = `${formattedPhone.slice(0, 2)}-${formattedPhone.slice(2, 6)}-${formattedPhone.slice(6)}`;
                } else {
                    formattedPhone = `${formattedPhone.slice(0, 3)}-${formattedPhone.slice(3, 6)}-${formattedPhone.slice(6)}`;
                }
            }

            // 2. Product Name Enforcement
            const finalProductType = (data.productType === "happy450" || data.productType === "해피450")
                ? "더 해피 450 ONE"
                : data.productType;

            // 3. Date Formatting (Excel Serial to YYYY-MM-DD)
            const formatDate = (val: string | undefined): string => {
                if (!val) return "";
                const serial = Number(val);
                if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                    const date = new Date((serial - 25569) * 86400 * 1000);
                    return date.toISOString().slice(0, 10);
                }
                return val;
            };

            const formattedFirstPaymentDate = formatDate(data.firstPaymentDate);
            const formattedRegistrationDate = formatDate(data.registrationDate);

            // Find existing using Index
            // Try 1: Strict Match (New Standard) - MATCH WITHOUT Date
            let existing = await ctx.db
                .query("applications")
                .withIndex("by_customer_sync", (q) =>
                    q.eq("customerName", data.customerName)
                        .eq("customerPhone", formattedPhone)
                        .eq("partnerName", data.partnerName)
                )
                .first();

            // Try 2: Legacy Match (If DB has old unformatted data)
            if (!existing) {
                // Common case: DB has unformatted phone ("01012345678")
                const unformattedPhone = data.customerPhone.replace(/[^0-9]/g, ""); // "01012341234"

                // Try with Unformatted Phone
                existing = await ctx.db
                    .query("applications")
                    .withIndex("by_customer_sync", (q) =>
                        q.eq("customerName", data.customerName)
                            .eq("customerPhone", unformattedPhone)
                            .eq("partnerName", data.partnerName)
                    )
                    .first();
            }

            const partnerId = partnerMap.get(data.partnerName) || "unknown";

            // Prepare base data (exclude registrationDate to handle it conditionally)
            // We strip 'registrationDate' from 'data' to avoid accidental overwrite
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { registrationDate: _ignore, ...otherData } = data;

            const baseData = {
                ...otherData,
                customerPhone: formattedPhone,
                productType: finalProductType,
                firstPaymentDate: formattedFirstPaymentDate,
                partnerId,
                updatedAt: now,
            };

            if (existing) {
                // Update
                const updatePayload: any = { ...baseData };

                // Only update registrationDate if existing record DOES NOT have it
                // Logic: "Once registered, it should remain as is"
                if (!existing.registrationDate && formattedRegistrationDate) {
                    updatePayload.registrationDate = formattedRegistrationDate;
                }

                await ctx.db.patch(existing._id, updatePayload);
                updated++;
                updatedNames.push(data.customerName);
            } else {
                // Create
                const dateStr = now.slice(0, 10).replace(/-/g, '');
                const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                const applicationNo = `SA-${dateStr}-${random}`;

                await ctx.db.insert("applications", {
                    ...baseData,
                    registrationDate: formattedRegistrationDate, // Always set for new records
                    applicationNo,
                    createdAt: data.createdAt || now,
                });
                created++;
            }
        }
        return { created, updated, updatedNames };
    },
});

export const fixLegacyData = mutation({
    handler: async (ctx) => {
        const apps = await ctx.db.query("applications").collect();
        let count = 0;

        const formatDate = (val: string | undefined): string => {
            if (!val) return "";
            const serial = Number(val);
            if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                const date = new Date((serial - 25569) * 86400 * 1000);
                return date.toISOString().slice(0, 10);
            }
            return val;
        };

        const formatPhone = (str: string) => {
            if (!str) return "";
            if (str.includes("-")) return str; // Already formatted
            const cleaned = str.replace(/[^0-9]/g, "");
            if (cleaned.length === 11) {
                return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
            }
            if (cleaned.length === 10) {
                if (cleaned.startsWith('02')) {
                    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
                }
                return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            }
            return cleaned;
        };

        for (const app of apps) {
            let needsUpdate = false;
            const updates: any = {};

            // Fix Product Name
            if (app.productType === "happy450" || app.productType === "해피450") {
                updates.productType = "더 해피 450 ONE";
                needsUpdate = true;
            }

            // Fix Dates
            const newRegDate = formatDate(app.registrationDate);
            if (newRegDate !== app.registrationDate) {
                updates.registrationDate = newRegDate;
                needsUpdate = true;
            }

            const newPayDate = formatDate(app.firstPaymentDate);
            if (newPayDate !== app.firstPaymentDate) {
                updates.firstPaymentDate = newPayDate;
                needsUpdate = true;
            }

            // Fix Phone
            const newPhone = formatPhone(app.customerPhone || "");
            if (app.customerPhone && newPhone !== app.customerPhone) {
                updates.customerPhone = newPhone;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await ctx.db.patch(app._id, updates);
                count++;
            }
        }
        return count;
    }
});
