import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { nowKST, todayKSTStr } from "./utils";

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
        const dateStr = todayKSTStr();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const generatedNo = `SA-${dateStr}-${random}`;
        const applicationNo = args.applicationNo || generatedNo;
        const now = nowKST();

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

        // 텔레그램 알림 전송
        const customerInfo = rest.customerName || "미입력";
        const phoneInfo = rest.customerPhone || "미입력";
        const productInfo = rest.productType || "미입력";
        const partnerInfo = rest.partnerName || "미입력";
        const message = `🔔 <b>신규 고객 등록</b>\n\n` +
            `👤 고객명: ${customerInfo}\n` +
            `📱 연락처: ${phoneInfo}\n` +
            `📦 상품: ${productInfo}\n` +
            `🏢 파트너: ${partnerInfo}\n` +
            `📋 접수번호: ${applicationNo}\n` +
            `🕐 시간: ${now}`;
        await ctx.scheduler.runAfter(0, internal.telegram.sendTelegramNotification, { message });

        return await ctx.db.get(id);
    },
});

export const updateApplicationStatus = mutation({
    args: {
        applicationNo: v.string(),
        newStatus: v.string(),
        changedBy: v.string(),
        memo: v.optional(v.string()),
        statusUpdatedAt: v.optional(v.string()),
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
            updatedAt: nowKST(),
        };
        if (args.statusUpdatedAt) updates.statusUpdatedAt = args.statusUpdatedAt;

        if (args.newStatus === "정상가입") updates.contractDate = nowKST();

        await ctx.db.patch(app._id, updates);

        // 로그 기록
        await ctx.db.insert("statusHistory", {
            historyId: `H-${Date.now()}`,
            applicationNo: args.applicationNo,
            previousStatus,
            newStatus: args.newStatus,
            changedBy: args.changedBy,
            changedAt: nowKST(),
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
            updatedAt: nowKST(),
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
            customerName: v.optional(v.string()),
            customerPhone: v.optional(v.string()),
            customerBirth: v.optional(v.string()),
            customerGender: v.optional(v.string()),
            customerAddress: v.optional(v.string()),
            customerZipcode: v.optional(v.string()),
            productType: v.optional(v.string()),
            products: v.optional(v.string()),
            planType: v.optional(v.string()),
            inquiry: v.optional(v.string()),
            preferredContactTime: v.optional(v.string()),
            partnerMemberId: v.optional(v.string()),
            statusUpdatedAt: v.optional(v.string()),
            partnerName: v.optional(v.string()),
            assignedTo: v.optional(v.string()),
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
            updatedAt: nowKST(),
        };

        Object.entries(args.updates).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                patchData[key] = value;
                // If status is updated, also update statusUpdatedAt
                if (key === 'status') {
                    patchData.statusUpdatedAt = nowKST();
                }
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
        const now = nowKST();
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

        // 디스코드 알림 전송
        if (count > 0) {
            const customerList = args.applications
                .slice(0, 5)
                .map(a => `  • ${a.customerName || "미입력"} (${a.customerPhone || "미입력"})`)
                .join("\\n");
            const moreText = count > 5 ? `\\n  ... 외 ${count - 5}명` : "";
            const partnerInfo = args.applications[0]?.partnerName || "미입력";
            const message = `📋 **고객 직접 등록 (${count}명)**\\n\\n` +
                `🏢 파트너: ${partnerInfo}\\n` +
                `👥 등록 고객:\\n${customerList}${moreText}\\n` +
                `🕐 시간: ${now}`;
            await ctx.scheduler.runAfter(0, internal.telegram.sendTelegramNotification, { message });
        }

        return count;
    },
});

export const deleteApplications = mutation({
    args: { applicationNos: v.array(v.string()) },
    handler: async (ctx, args) => {
        let count = 0;
        for (const appNo of args.applicationNos) {
            const app = await ctx.db
                .query("applications")
                .withIndex("by_applicationNo", (q) => q.eq("applicationNo", appNo))
                .unique();
            if (app) {
                await ctx.db.delete(app._id);
                count++;
            }
        }
        return count;
    }
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
        const now = nowKST();
        let created = 0;
        let updated = 0;

        const syncSessionId = Math.random().toString(36).slice(2, 7);
        const toCharCodes = (s: string) => Array.from(s).map(c => c.charCodeAt(0).toString(16)).join(',');
        console.log(`[Sync ${syncSessionId}] Starting sync for ${args.applications.length} rows`);
        const normalizeCompare = (v: any) => {
            if (v === undefined || v === null) return "";
            return String(v)
                .trim()
                .replace(/[\u200b-\u200f\ufeff\u00a0]/g, "")
                .normalize("NFC");
        };

        const formatDate = (val: any): string => {
            if (val === undefined || val === null || val === "") return "";
            const serial = Number(val);
            if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                const date = new Date((serial - 25569) * 86400 * 1000);
                return date.toISOString().slice(0, 10);
            }
            const dateStr = String(val).trim();
            if (dateStr.includes('.') || dateStr.includes('-')) {
                const parts = dateStr.split(/[.-]/);
                if (parts.length === 3) {
                    const y = parts[0].trim();
                    const m = parts[1].trim().padStart(2, '0');
                    const d = parts[2].trim().padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }
            }
            return dateStr;
        };

        const partners = await ctx.db.query("partners").collect();
        const partnerMap = new Map(partners.map(p => [normalizeCompare(p.companyName), p.partnerId]));

        const isAdvancedStatus = (s: string) => s !== "" && s !== "접수";

        // 1. Deduplicate/Merge incoming records by key [Name|Phone|Partner]
        const mergedApplications = new Map<string, any>();
        for (const data of args.applications) {
            const customerName = normalizeCompare(data.customerName);
            const partnerName = normalizeCompare(data.partnerName);
            let rawPhone = (data.customerPhone || "").replace(/[^0-9]/g, "");
            let formattedPhone = rawPhone;
            // Standardize phone
            if (rawPhone.length === 11) {
                formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3, 7)}-${rawPhone.slice(7)}`;
            } else if (rawPhone.length === 10) {
                if (rawPhone.startsWith('02')) {
                    formattedPhone = `${rawPhone.slice(0, 2)}-${rawPhone.slice(2, 6)}-${rawPhone.slice(6)}`;
                } else {
                    formattedPhone = `${rawPhone.slice(0, 3)}-${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}`;
                }
            }

            const key = `${customerName}|${formattedPhone}|${partnerName}`;
            console.log(`[Sync ${syncSessionId}] Batch item key: ${key}`);
            const existingInBatch = mergedApplications.get(key);

            if (!existingInBatch) {
                mergedApplications.set(key, { ...data, customerName, partnerName, customerPhone: formattedPhone });
            } else {
                for (const k of Object.keys(data)) {
                    const newVal = normalizeCompare((data as any)[k]);
                    const currentVal = normalizeCompare((existingInBatch as any)[k]);

                    if (newVal !== "") {
                        // Special status priority: don't let "" or "접수" overwrite an advanced status
                        if (k === "status") {
                            if (isAdvancedStatus(newVal) || !isAdvancedStatus(currentVal)) {
                                (existingInBatch as any)[k] = (data as any)[k];
                            }
                        } else {
                            (existingInBatch as any)[k] = (data as any)[k];
                        }
                    }
                }
            }
        }

        const updatedNamesSet = new Set<string>();
        console.log(`[Sync ${syncSessionId}] Merged into ${mergedApplications.size} unique keys`);

        for (const [key, data] of mergedApplications.entries()) {
            const customerName = data.customerName;
            const partnerName = data.partnerName;
            const formattedPhone = data.customerPhone;

            const finalProductType = (data.productType === "happy450" || data.productType === "해피450")
                ? "더 해피 450 ONE"
                : data.productType;

            const formattedFirstPaymentDate = formatDate(data.firstPaymentDate);
            const formattedRegistrationDate = formatDate(data.registrationDate);

            // Find existing using Index
            let existing = await ctx.db
                .query("applications")
                .withIndex("by_customer_sync", (q) =>
                    q.eq("customerName", customerName)
                        .eq("customerPhone", formattedPhone)
                        .eq("partnerName", partnerName)
                )
                .first();

            if (!existing) {
                const unformattedPhone = formattedPhone.replace(/[^0-9]/g, "");
                existing = await ctx.db
                    .query("applications")
                    .withIndex("by_customer_sync", (q) =>
                        q.eq("customerName", customerName)
                            .eq("customerPhone", unformattedPhone)
                            .eq("partnerName", partnerName)
                    )
                    .first();
            }

            const partnerId = partnerMap.get(partnerName) || "unknown";

            // Prepare base data
            const { registrationDate: _ignore, ...otherData } = data;
            const baseData: any = {
                ...otherData,
                customerName,
                partnerName,
                customerPhone: formattedPhone,
                productType: finalProductType,
                partnerId,
            };

            const dateFields = [
                "contractDate", "deliveryDate", "settlementDate", "settlement_date",
                "cancellationProcessing", "withdrawalProcessing", "customerBirth"
            ];
            for (const field of dateFields) {
                if (baseData[field] !== undefined) {
                    baseData[field] = formatDate(baseData[field]);
                }
            }
            baseData.firstPaymentDate = formattedFirstPaymentDate;

            if (existing) {
                const updates: any = {};
                let hasChanges = false;

                for (const fKey of Object.keys(baseData)) {
                    if (fKey === "updatedAt" || fKey === "createdAt") continue;

                    const newVal = normalizeCompare(baseData[fKey]);
                    const oldVal = normalizeCompare((existing as any)[fKey]);

                    // Skip update if newVal is empty and oldVal is not (preserve DB data)
                    if (newVal === "" && oldVal !== "") continue;

                    // Specific Protection for Status Downgrade
                    if (fKey === "status") {
                        if (isAdvancedStatus(oldVal) && !isAdvancedStatus(newVal)) {
                            console.log(`[Sync ${syncSessionId}] Status downgrade protected for ${customerName}: [${oldVal}] stays, [${newVal}] ignored`);
                            continue;
                        }
                    }

                    // Skip update if both normalized values are identical
                    if (newVal === oldVal) continue;

                    // If we have a change, store the normalized version to prevent floating invisibles
                    console.log(`[Sync ${syncSessionId}] ${customerName}.${fKey} DIFF: [${oldVal}](codes:${toCharCodes(oldVal)}) -> [${newVal}](codes:${toCharCodes(newVal)})`);
                    updates[fKey] = (fKey === "productType" || fKey === "status") ? baseData[fKey] : newVal;
                    hasChanges = true;
                }

                const existingRegDate = formatDate(existing.registrationDate);
                if (!existingRegDate && formattedRegistrationDate) {
                    updates.registrationDate = formattedRegistrationDate;
                    hasChanges = true;
                }

                if (hasChanges) {
                    const changeDetails = Object.keys(updates)
                        .filter(k => k !== 'updatedAt')
                        .slice(0, 3)
                        .map(k => {
                            const oldV = normalizeCompare((existing as any)[k]);
                            const newV = normalizeCompare(updates[k]);
                            return `${k}:${oldV}→${newV}`;
                        });
                    const reasonStr = changeDetails.join(', ');
                    updates.updatedAt = now;
                    await ctx.db.patch(existing._id, updates);
                    updated++;
                    updatedNamesSet.add(`${customerName} [${reasonStr}]`);
                }
            } else {
                // Create
                const dateStr = now.slice(0, 10).replace(/-/g, '');
                const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                const applicationNo = `SA-${dateStr}-${random}`;

                await ctx.db.insert("applications", {
                    ...baseData,
                    status: baseData.status || "접수",
                    registrationDate: formattedRegistrationDate,
                    applicationNo,
                    createdAt: data.createdAt || now,
                    updatedAt: now,
                });
                created++;
            }
        }
        return { created, updated, updatedNames: Array.from(updatedNamesSet) };
    },
});

export const fixLegacyData = mutation({
    handler: async (ctx) => {
        const apps = await ctx.db.query("applications").collect();
        let fixedCount = 0;
        let deletedCount = 0;


        const clean = (s: string | undefined) => (s || "")
            .trim()
            .replace(/[\u200b-\u200f\ufeff\u00a0]/g, "")
            .normalize("NFC");

        const formatPhone = (str: string) => {
            if (!str) return "";
            const cleaned = str.replace(/[^0-9]/g, "");
            if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
            if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            return str;
        };

        const formatDate = (val: string | undefined): string => {
            if (!val) return "";
            const serial = Number(val);
            if (!isNaN(serial) && serial > 30000 && serial < 60000) {
                const date = new Date((serial - 25569) * 86400 * 1000);
                return date.toISOString().slice(0, 10);
            }
            if (typeof val === 'string' && val.includes('.')) {
                const parts = val.split('.');
                if (parts.length === 3) return `${parts[0]}-${parts[1].trim().padStart(2, '0')}-${parts[2].trim().padStart(2, '0')}`;
            }
            return val;
        };

        // Group by Key
        const groups = new Map<string, any[]>();
        for (const app of apps) {
            const key = `${clean(app.customerName)}|${formatPhone(app.customerPhone || "")}|${clean(app.partnerName)}`;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(app);
        }

        for (const [key, members] of groups.entries()) {
            // Sort by registrationDate then creationTime (Earliest first)
            members.sort((a, b) => {
                const dateA = formatDate(a.registrationDate) || "9999-99-99";
                const dateB = formatDate(b.registrationDate) || "9999-99-99";
                if (dateA !== dateB) return dateA.localeCompare(dateB);
                return a._creationTime - b._creationTime;
            });

            const master = members[0];
            const duplicates = members.slice(1);

            // 1. Normalize Master
            let needsUpdate = false;
            const updates: any = {};

            const newName = clean(master.customerName);
            if (newName !== master.customerName) { updates.customerName = newName; needsUpdate = true; }

            const newPartner = clean(master.partnerName);
            if (newPartner !== master.partnerName) { updates.partnerName = newPartner; needsUpdate = true; }

            const newPhone = formatPhone(master.customerPhone);
            if (newPhone !== master.customerPhone) { updates.customerPhone = newPhone; needsUpdate = true; }

            const newRegDate = formatDate(master.registrationDate);
            if (newRegDate !== master.registrationDate) { updates.registrationDate = newRegDate; needsUpdate = true; }

            const newPayDate = formatDate(master.firstPaymentDate);
            if (newPayDate !== master.firstPaymentDate) { updates.firstPaymentDate = newPayDate; needsUpdate = true; }

            // Normalize additional date fields
            const dateFields = [
                "contractDate", "deliveryDate", "settlementDate", "settlement_date",
                "cancellationProcessing", "withdrawalProcessing", "customerBirth"
            ];
            for (const field of dateFields) {
                const currentVal = (master as any)[field];
                const normalized = formatDate(currentVal);
                if (normalized !== String(currentVal || "").trim()) {
                    updates[field] = normalized;
                    needsUpdate = true;
                }
            }

            if (master.productType === "happy450" || master.productType === "해피450") {
                updates.productType = "더 해피 450 ONE";
                needsUpdate = true;
            }

            if (needsUpdate) {
                await ctx.db.patch(master._id, updates);
                fixedCount++;
            }

            // 2. Delete Duplicates
            for (const dup of duplicates) {
                await ctx.db.delete(dup._id);
                deletedCount++;
            }
        }

        return { fixedCount, deletedCount };
    }
});
