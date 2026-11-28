import { v } from "convex/values";
import { action, internalAction, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export interface SmsConfig {
    provider?: "aligo" | "phone_bridge";
    apiKey?: string;
    userId?: string;
    sender?: string;
    bridgeSecret?: string;
    bridgeLastSeenAt?: number;
    bridgeDeviceName?: string;
    bridgeAppVersion?: string;
    autoFallbackAligo?: boolean;
    fallbackDelaySeconds?: number;
    autoSendOnApply?: boolean;
    autoApplyTitle?: string;
    autoApplyMessage?: string;
    econtractRequestTitle?: string;
    econtractRequestMessage?: string;
    autoSendOnEcontractComplete?: boolean;
    econtractCompleteTitle?: string;
    econtractCompleteMessage?: string;
}

export interface SmsTemplate {
    id: string;
    title: string;
    content: string;
}

export const DEFAULT_AUTO_APPLY_TITLE = "[소노아임레디] 상담 접수 완료 안내";

export const DEFAULT_AUTO_APPLY_MESSAGE = `[소노아임레디] {고객명}님, 상담 신청이 정상적으로 접수 완료되었습니다.

■ 신청 상품: {상품명}
■ 사은품 내역: {사은품}

잠시 후 전담 상담사가 [010-2666-0883] 번호로 상담 안내 전화를 드릴 예정입니다.
원활한 안내를 위해 010-2666-0883 전화를 꼭 받아주시기 바랍니다.

감사합니다.`;

export const DEFAULT_ECONTRACT_REQUEST_TITLE = "[소노아임레디] 마음든든 전자계약 서명 안내";

export const DEFAULT_ECONTRACT_REQUEST_MESSAGE = `[소노아임레디] {고객명}님, {상품명} 전자계약 서명 안내드립니다.

아래 링크를 눌러 모바일에서 간편하게 전자계약 서명을 진행해 주세요.
▶ 전자계약 바로가기: {계약링크}

※ 전자계약 완료 후 당일 혹은 익일에 [1644-8399] 번호로 가입 해피콜 안내 전화가 나갈 예정입니다.
1644-8399 전화를 꼭 받아주셔야 최종 계약이 완료됩니다.

감사합니다.`;

export const DEFAULT_ECONTRACT_COMPLETE_TITLE = "[소노아임레디] 마음든든 전자계약 완료 안내";

export const DEFAULT_ECONTRACT_COMPLETE_MESSAGE = `[소노아임레디] {고객명}님, {상품명} 전자계약 서명이 정상적으로 완료되었습니다.

■ 접수번호: {접수번호}

전자계약 완료 후 당일 혹은 익일에 [1644-8399] 번호로 가입 해피콜 안내 전화가 나갈 예정입니다.
1644-8399 전화를 꼭 받아주셔야 최종 계약이 완료되오니 수신 부탁드립니다.

감사합니다.`;

export const DEFAULT_SMS_TEMPLATES: SmsTemplate[] = [
    {
        id: "apply_confirm",
        title: "① 접수 완료 · 010-2666-0883 전화 안내",
        content: `[소노아임레디] {고객명}님, 상담 신청이 정상적으로 접수 완료되었습니다.

■ 신청 상품: {상품명}
■ 사은품 내역: {사은품}

잠시 후 전담 상담사가 [010-2666-0883] 번호로 상담 안내 전화를 드릴 예정입니다.
원활한 상담 진행을 위해 010-2666-0883 전화를 꼭 받아주시기 바랍니다.

문의사항이 있으시면 언제든 이 번호로 답장 주세요!`,
    },
    {
        id: "product_guide",
        title: "② 상품 · 결합 혜택 상세 안내",
        content: `[소노아임레디] {고객명}님, 신청하신 {상품명} 안내드립니다.

■ 신청 상품: {상품명} ({구좌})
■ 사은품 혜택: {사은품}

담당 상담사가 010-2666-0883 번호로 연락드려 월 납입금, 제휴카드 할인 및 사은품 지급 일정을 자세히 안내해 드리겠습니다.

편하신 통화 시간이 있으시면 답장으로 남겨주세요!`,
    },
    {
        id: "missed_call",
        title: "③ 부재중 · 재통화 요청 안내",
        content: `[소노아임레디] {고객명}님, 안녕하세요.

신청하신 {상품명} 상담 안내를 위해 [010-2666-0883]으로 연락드렸으나 부재중이셔서 문자 남깁니다.

■ 사은품 내역: {사은품}

010-2666-0883 번호로 다시 전화드리거나, 통화 가능하신 시간대를 답장으로 남겨주시면 맞춰서 연락드리겠습니다.

감사합니다.`,
    },
    {
        id: "gift_notice",
        title: "④ 사은품 증정 · 가입 진행 안내",
        content: `[소노아임레디] {고객명}님, 가입 진행 및 사은품 안내드립니다.

■ 진행 상품: {상품명}
■ 선택 사은품: {사은품}

정상 가입 및 초회 납입 확인 후 안내드린 일정에 맞춰 사은품이 발송됩니다.
궁금하신 점은 010-2666-0883 또는 본 문자로 문의 부탁드립니다.`,
    },
    {
        id: "contract_guide",
        title: "⑤ 녹취 · 전자서명 완료 안내",
        content: `[소노아임레디] {고객명}님, {상품명} 가입 접수가 정상 진행 중입니다.

추가 확인이나 서류 안내가 필요할 경우 010-2666-0883 번호로 연락드릴 예정이오니 전화 수신 부탁드립니다.

항상 최선을 다하는 소노아임레디가 되겠습니다. 감사합니다.`,
    },
];

export function normalizeKoreanPhone(raw: string): string {
    const digits = (raw || "").replace(/[^0-9]/g, "");
    if (digits.startsWith("82") && digits.length >= 11) {
        return `0${digits.slice(2)}`;
    }
    return digits;
}

export function formatKoreanPhone(raw: string): string {
    const trimmed = (raw || "").trim();
    if (!trimmed) return "";
    const digits = normalizeKoreanPhone(trimmed);
    if (!digits) return trimmed;

    if (digits.startsWith("02")) {
        if (digits.length === 9) {
            return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
        }
        if (digits.length === 10) {
            return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
    }
    if (digits.length === 11) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 8) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return trimmed;
}

export function isMaeumProductType(productType?: string): boolean {
    const raw = (productType || "").trim();
    const lower = raw.toLowerCase();
    return lower.includes("maeum") || raw.includes("마음든든");
}

export function formatProductDisplayName(productType?: string, products?: string): string {
    const raw = (productType || "").trim();
    const lower = raw.toLowerCase();
    let label = raw || "소노아임레디 상조";
    if (lower === "happy450" || lower.includes("해피") || lower.includes("happy")) {
        label = "더 해피 450 ONE";
    } else if (lower.includes("스마트케어(광고)")) {
        label = raw;
    } else if (lower.includes("스마트케어4") || lower.includes("smartcare4") || lower.includes("smart4")) {
        label = "스마트케어 4";
    } else if (lower.includes("스마트케어5") || lower.includes("smartcare5") || lower.includes("smart5")) {
        label = "스마트케어 5";
    } else if (lower === "smartcare" || lower.includes("스마트") || lower.includes("smart")) {
        label = "스마트케어";
    } else if (lower === "maeum" || lower.includes("마음든든")) {
        label = raw.includes("마음든든") ? raw : "마음든든";
    }

    const trimmedProducts = (products || "").trim();
    if (trimmedProducts && trimmedProducts !== "-" && !label.includes(trimmedProducts)) {
        return `${label} (${trimmedProducts})`;
    }
    return label;
}

async function getSmsConfigFromDb(ctx: any): Promise<SmsConfig> {
    const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q: any) => q.eq("key", "sms_config"))
        .unique();
    if (!setting?.value) return {};
    try {
        return JSON.parse(setting.value) as SmsConfig;
    } catch {
        return {};
    }
}

async function saveSmsConfigToDb(ctx: any, config: SmsConfig): Promise<void> {
    const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q: any) => q.eq("key", "sms_config"))
        .unique();
    const now = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();
    const value = JSON.stringify(config);
    if (existing) {
        await ctx.db.patch(existing._id, { value, updatedAt: now });
    } else {
        await ctx.db.insert("settings", { key: "sms_config", value, updatedAt: now });
    }
}

function hasAligoCredentials(smsConfig: SmsConfig): boolean {
    return Boolean(
        smsConfig &&
            typeof smsConfig.apiKey === "string" &&
            smsConfig.apiKey.trim() &&
            typeof smsConfig.userId === "string" &&
            smsConfig.userId.trim() &&
            typeof smsConfig.sender === "string" &&
            normalizeKoreanPhone(smsConfig.sender).length >= 8
    );
}

function isAligoAutoFallbackEnabled(smsConfig: SmsConfig): boolean {
    return hasAligoCredentials(smsConfig) && smsConfig?.autoFallbackAligo !== false;
}

async function sendViaAligoApi(params: {
    apiKey: string;
    userId: string;
    sender: string;
    receiver: string;
    message: string;
    title?: string;
    msgType?: "SMS" | "LMS";
    testMode?: boolean;
}): Promise<{ ok: boolean; errorMessage?: string; raw?: any }> {
    const senderDigits = normalizeKoreanPhone(params.sender);
    const receiverDigits = normalizeKoreanPhone(params.receiver);

    const formData = new URLSearchParams();
    formData.append("key", params.apiKey.trim());
    formData.append("user_id", params.userId.trim());
    formData.append("sender", senderDigits);
    formData.append("receiver", receiverDigits);
    formData.append("msg", params.message);
    formData.append("msg_type", params.msgType || "LMS");
    if (params.title && (params.msgType || "LMS") === "LMS") {
        formData.append("title", params.title);
    }
    if (params.testMode) {
        formData.append("testmode_yn", "Y");
    }

    const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
    });

    const result = await response.json();
    if (String(result?.result_code) === "1") {
        return { ok: true, raw: result };
    }
    return {
        ok: false,
        errorMessage: `알리고 발송 실패: ${result?.message || "알 수 없는 오류"}`,
        raw: result,
    };
}

function isHyowonSmsText(text: string): boolean {
    const trimmed = (text || "").trim();
    return (
        trimmed.startsWith("[효원") ||
        trimmed.includes("[효원") ||
        trimmed.includes("효원상조") ||
        trimmed.includes("효원라이프")
    );
}

async function findMatchingApplication(ctx: any, normalizedPhone: string) {
    const allApps = await ctx.db.query("applications").order("desc").collect();
    const matchingApps = allApps.filter(
        (app: any) => normalizeKoreanPhone(app.customerPhone || "") === normalizedPhone
    );
    if (matchingApps.length === 0) return undefined;
    if (matchingApps.length === 1) return matchingApps[0];

    // 동일 번호로 여러 접수 건이 있는 경우, 가장 최근에 문자를 발송한 접수 건에 답장을 연결
    const matchingById = new Map<string, any>();
    for (const app of matchingApps) {
        matchingById.set(String(app._id), app);
    }

    const recentPhoneLogs = await ctx.db
        .query("sms_logs")
        .withIndex("by_customerPhone_and_createdAt", (q: any) =>
            q.eq("customerPhone", normalizedPhone)
        )
        .order("desc")
        .take(30);

    for (const log of recentPhoneLogs) {
        if (log.direction !== "outbound") continue;
        if (log.status === "실패") continue;
        if (log.applicationId && matchingById.has(String(log.applicationId))) {
            return matchingById.get(String(log.applicationId));
        }
    }

    return matchingApps[0];
}

// ==========================================
// Settings Queries & Mutations
// ==========================================

export const getSmsSettings = query({
    args: {},
    handler: async (ctx) => {
        const smsConfig = await getSmsConfigFromDb(ctx);

        const tplSetting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "sms_templates"))
            .unique();
        let templates: SmsTemplate[] = DEFAULT_SMS_TEMPLATES;
        if (tplSetting?.value) {
            try {
                const parsed = JSON.parse(tplSetting.value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    templates = parsed;
                }
            } catch {
                templates = DEFAULT_SMS_TEMPLATES;
            }
        }

        const googleSetting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "google_contacts_config"))
            .unique();
        let googleContacts: { clientId: string; targetEmail?: string } = {
            clientId: "",
            targetEmail: "jihoon3813@livon.care",
        };
        if (googleSetting?.value) {
            try {
                const parsed = JSON.parse(googleSetting.value);
                googleContacts = {
                    clientId: parsed?.clientId || "",
                    targetEmail: parsed?.targetEmail ?? "jihoon3813@livon.care",
                };
            } catch {
                googleContacts = { clientId: "", targetEmail: "jihoon3813@livon.care" };
            }
        }

        return {
            sms: smsConfig,
            templates,
            googleContacts,
        };
    },
});

export const saveSmsSettings = mutation({
    args: {
        sms: v.optional(v.any()),
        templates: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    title: v.string(),
                    content: v.string(),
                })
            )
        ),
        googleContacts: v.optional(
            v.object({
                clientId: v.string(),
                targetEmail: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString();

        if (args.sms !== undefined) {
            const existing = await getSmsConfigFromDb(ctx);
            const merged: SmsConfig = {
                ...existing,
                ...args.sms,
            };
            await saveSmsConfigToDb(ctx, merged);
        }

        if (args.templates !== undefined) {
            const existingTpl = await ctx.db
                .query("settings")
                .withIndex("by_key", (q) => q.eq("key", "sms_templates"))
                .unique();
            const val = JSON.stringify(args.templates);
            if (existingTpl) {
                await ctx.db.patch(existingTpl._id, { value: val, updatedAt: now });
            } else {
                await ctx.db.insert("settings", {
                    key: "sms_templates",
                    value: val,
                    updatedAt: now,
                });
            }
        }

        if (args.googleContacts !== undefined) {
            const existingGoogle = await ctx.db
                .query("settings")
                .withIndex("by_key", (q) => q.eq("key", "google_contacts_config"))
                .unique();
            const val = JSON.stringify(args.googleContacts);
            if (existingGoogle) {
                await ctx.db.patch(existingGoogle._id, { value: val, updatedAt: now });
            } else {
                await ctx.db.insert("settings", {
                    key: "google_contacts_config",
                    value: val,
                    updatedAt: now,
                });
            }
        }

        return { ok: true };
    },
});

// ==========================================
// Internal Logging & Outbox Queue
// ==========================================

export const logSms = internalMutation({
    args: {
        applicationId: v.optional(v.id("applications")),
        applicationNo: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerPhone: v.string(),
        smsType: v.string(),
        title: v.optional(v.string()),
        message: v.string(),
        status: v.string(),
        errorMessage: v.optional(v.string()),
        senderName: v.optional(v.string()),
        direction: v.optional(v.union(v.literal("outbound"), v.literal("inbound"))),
        isRead: v.optional(v.boolean()),
        receiverNumber: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const normalizedPhone = normalizeKoreanPhone(args.customerPhone) || args.customerPhone;
        return await ctx.db.insert("sms_logs", {
            ...args,
            customerPhone: normalizedPhone,
            direction: args.direction ?? "outbound",
            createdAt: Date.now(),
        });
    },
});

export const enqueuePhoneOutbox = internalMutation({
    args: {
        applicationId: v.optional(v.id("applications")),
        applicationNo: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerPhone: v.string(),
        smsType: v.string(),
        title: v.optional(v.string()),
        message: v.string(),
        senderName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const normalizedPhone = normalizeKoreanPhone(args.customerPhone);
        if (!normalizedPhone || normalizedPhone.length < 9) {
            throw new Error("유효한 수신자 전화번호가 아닙니다.");
        }

        const smsLogId = await ctx.db.insert("sms_logs", {
            applicationId: args.applicationId,
            applicationNo: args.applicationNo,
            customerName: args.customerName,
            customerPhone: normalizedPhone,
            smsType: args.smsType,
            title: args.title,
            message: args.message,
            status: "발송대기",
            senderName: args.senderName ? `${args.senderName} (회사폰)` : "회사폰",
            direction: "outbound",
            createdAt: now,
        });

        const outboxId = await ctx.db.insert("sms_outbox", {
            smsLogId,
            applicationId: args.applicationId,
            receiverPhone: normalizedPhone,
            title: args.title,
            message: args.message,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        // 회사폰 절전·방전·네트워크 지연 시 멈추지 않도록 알리고 자동 백업 발송 스케줄링
        const smsConfig = await getSmsConfigFromDb(ctx);
        if (isAligoAutoFallbackEnabled(smsConfig)) {
            const lastSeenAt = smsConfig?.bridgeLastSeenAt || 0;
            const isBridgeOnline = lastSeenAt > 0 && now - lastSeenAt < 35_000;
            const configuredSec = Math.max(
                10,
                Math.min(120, Number(smsConfig?.fallbackDelaySeconds) || 25)
            );
            const delayMs = isBridgeOnline ? configuredSec * 1000 : 6_000;
            await ctx.scheduler.runAfter(delayMs, internal.sms.processOutboxFallback, {
                outboxId,
            });
        }

        return { outboxId, smsLogId };
    },
});

export const pollBridgeOutbox = internalMutation({
    args: {
        secret: v.string(),
        deviceName: v.optional(v.string()),
        appVersion: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const smsConfig = await getSmsConfigFromDb(ctx);
        const expectedSecret = smsConfig?.bridgeSecret || process.env.SMS_WEBHOOK_SECRET || "";

        if (!expectedSecret || args.secret !== expectedSecret) {
            return { ok: false, error: "연동 보안키가 일치하지 않습니다.", jobs: [] as any[] };
        }

        const now = Date.now();
        if (
            now - (smsConfig.bridgeLastSeenAt || 0) > 15_000 ||
            (args.deviceName && args.deviceName !== smsConfig.bridgeDeviceName) ||
            (args.appVersion && args.appVersion !== smsConfig.bridgeAppVersion)
        ) {
            await saveSmsConfigToDb(ctx, {
                ...smsConfig,
                bridgeLastSeenAt: now,
                bridgeDeviceName: args.deviceName || smsConfig.bridgeDeviceName,
                bridgeAppVersion: args.appVersion || smsConfig.bridgeAppVersion,
            });
        }

        // 90초 이상 멈춘 작업은 pending으로 자동 복구
        const stuckProcessing = await ctx.db
            .query("sms_outbox")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "processing"))
            .take(20);
        for (const item of stuckProcessing) {
            if (now - item.updatedAt > 90_000) {
                await ctx.db.patch(item._id, { status: "pending", updatedAt: now });
            }
        }

        const stuckFallback = await ctx.db
            .query("sms_outbox")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "fallback_sending"))
            .take(20);
        for (const item of stuckFallback) {
            if (now - item.updatedAt > 90_000) {
                await ctx.db.patch(item._id, { status: "pending", updatedAt: now });
            }
        }

        const pendingItems = await ctx.db
            .query("sms_outbox")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
            .order("asc")
            .take(10);

        const jobs = [];
        for (const item of pendingItems) {
            await ctx.db.patch(item._id, { status: "processing", updatedAt: now });
            jobs.push({
                outboxId: String(item._id),
                receiverPhone: item.receiverPhone,
                title: item.title || "",
                message: item.message,
            });
        }

        const since = now - 7 * 24 * 60 * 60 * 1000;
        const recentOutboundLogs = await ctx.db
            .query("sms_logs")
            .withIndex("by_createdAt", (q) => q.gte("createdAt", since))
            .order("desc")
            .take(300);

        const latestByPhone = new Map<string, number>();
        for (const log of recentOutboundLogs) {
            if (log.direction === "inbound") continue;
            if (log.status === "실패") continue;
            if (log.smsType === "휴대폰발신") continue;
            const norm = normalizeKoreanPhone(log.customerPhone || "");
            if (norm.length < 9) continue;
            if (!latestByPhone.has(norm)) {
                latestByPhone.set(norm, log.createdAt);
            }
        }
        const recentOutbounds = Array.from(latestByPhone.entries()).map(([phone, sentAt]) => ({
            phone,
            sentAt,
        }));

        return { ok: true, jobs, serverNow: now, recentOutbounds };
    },
});

export const ackBridgeOutbox = internalMutation({
    args: {
        secret: v.string(),
        outboxId: v.id("sms_outbox"),
        success: v.boolean(),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const smsConfig = await getSmsConfigFromDb(ctx);
        const expectedSecret = smsConfig?.bridgeSecret || process.env.SMS_WEBHOOK_SECRET || "";

        if (!expectedSecret || args.secret !== expectedSecret) {
            return { ok: false, error: "연동 보안키가 일치하지 않습니다." };
        }

        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox) {
            return { ok: false, error: "발송 대기 항목을 찾을 수 없습니다." };
        }

        if (outbox.status === "sent") {
            return { ok: true, alreadySent: true };
        }

        const now = Date.now();
        if (!args.success && isAligoAutoFallbackEnabled(smsConfig)) {
            await ctx.db.patch(args.outboxId, {
                status: "pending",
                errorMessage: args.errorMessage || "휴대폰 발송 실패 — 클라우드 자동백업 전환 중",
                updatedAt: now,
            });
            await ctx.scheduler.runAfter(0, internal.sms.processOutboxFallback, {
                outboxId: args.outboxId,
                force: true,
            });
            return { ok: true, fallbackScheduled: true };
        }

        await ctx.db.patch(args.outboxId, {
            status: args.success ? "sent" : "failed",
            errorMessage: args.success ? undefined : args.errorMessage || "휴대폰 발송 실패",
            updatedAt: now,
        });

        if (outbox.smsLogId) {
            const logDoc = await ctx.db.get(outbox.smsLogId);
            if (logDoc) {
                await ctx.db.patch(outbox.smsLogId, {
                    status: args.success ? "성공" : "실패",
                    errorMessage: args.success ? undefined : args.errorMessage || "휴대폰 발송 실패",
                });
            }
        }

        return { ok: true };
    },
});

export const claimOutboxForFallback = internalMutation({
    args: {
        outboxId: v.id("sms_outbox"),
        force: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox || outbox.status === "sent") {
            return { action: "noop" as const };
        }

        const smsConfig = await getSmsConfigFromDb(ctx);
        if (!hasAligoCredentials(smsConfig)) {
            return { action: "noop" as const };
        }
        if (!args.force && !isAligoAutoFallbackEnabled(smsConfig)) {
            return { action: "noop" as const };
        }

        const now = Date.now();
        if (!args.force && outbox.status === "processing" && now - outbox.updatedAt < 55_000) {
            await ctx.scheduler.runAfter(35_000, internal.sms.processOutboxFallback, {
                outboxId: args.outboxId,
            });
            return { action: "rescheduled" as const };
        }

        if (!args.force && outbox.status === "fallback_sending" && now - outbox.updatedAt < 60_000) {
            return { action: "noop" as const };
        }

        await ctx.db.patch(args.outboxId, {
            status: "fallback_sending",
            updatedAt: now,
        });

        return {
            action: "send" as const,
            receiverPhone: outbox.receiverPhone,
            title: outbox.title || "[소노아임레디] 안내",
            message: outbox.message,
            apiKey: String(smsConfig.apiKey),
            userId: String(smsConfig.userId),
            sender: String(smsConfig.sender),
        };
    },
});

export const completeOutboxFallback = internalMutation({
    args: {
        outboxId: v.id("sms_outbox"),
        success: v.boolean(),
        errorMessage: v.optional(v.string()),
        markFailedOnError: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox || outbox.status === "sent") {
            return null;
        }

        const now = Date.now();
        if (args.success) {
            await ctx.db.patch(args.outboxId, {
                status: "sent",
                errorMessage: undefined,
                updatedAt: now,
            });

            if (outbox.smsLogId) {
                const logDoc = await ctx.db.get(outbox.smsLogId);
                if (logDoc) {
                    const prevSender = logDoc.senderName || "자동발송";
                    const nextSender = prevSender.includes("(회사폰)")
                        ? prevSender.replace("(회사폰)", "(알리고 자동백업)")
                        : prevSender.includes("자동백업")
                          ? prevSender
                          : `${prevSender} (알리고 자동백업)`;
                    await ctx.db.patch(outbox.smsLogId, {
                        status: "성공",
                        errorMessage: undefined,
                        senderName: nextSender,
                    });
                }
            }
            return null;
        }

        const nextStatus = args.markFailedOnError ? "failed" : "pending";
        await ctx.db.patch(args.outboxId, {
            status: nextStatus,
            errorMessage: args.errorMessage,
            updatedAt: now,
        });

        if (outbox.smsLogId) {
            const logDoc = await ctx.db.get(outbox.smsLogId);
            if (logDoc) {
                await ctx.db.patch(outbox.smsLogId, {
                    ...(args.markFailedOnError ? { status: "실패" } : {}),
                    errorMessage: args.errorMessage,
                });
            }
        }
        return null;
    },
});

export const processOutboxFallback = internalAction({
    args: {
        outboxId: v.id("sms_outbox"),
        force: v.optional(v.boolean()),
        markFailedOnError: v.optional(v.boolean()),
    },
    handler: async (
        ctx,
        args
    ): Promise<{ ok: boolean; skipped?: string; errorMessage?: string }> => {
        const claimed = await ctx.runMutation(internal.sms.claimOutboxForFallback, {
            outboxId: args.outboxId,
            force: args.force,
        });

        if (claimed.action !== "send") {
            return { ok: true, skipped: claimed.action };
        }

        try {
            const sendRes = await sendViaAligoApi({
                apiKey: claimed.apiKey,
                userId: claimed.userId,
                sender: claimed.sender,
                receiver: claimed.receiverPhone,
                title: claimed.title,
                message: claimed.message,
                msgType: "LMS",
            });

            await ctx.runMutation(internal.sms.completeOutboxFallback, {
                outboxId: args.outboxId,
                success: sendRes.ok,
                errorMessage: sendRes.errorMessage,
                markFailedOnError: args.markFailedOnError,
            });

            return { ok: sendRes.ok, errorMessage: sendRes.errorMessage };
        } catch (err: any) {
            const errMsg = `클라우드 백업 발송 오류: ${err?.message || "알 수 없는 오류"}`;
            await ctx.runMutation(internal.sms.completeOutboxFallback, {
                outboxId: args.outboxId,
                success: false,
                errorMessage: errMsg,
                markFailedOnError: args.markFailedOnError,
            });
            return { ok: false, errorMessage: errMsg };
        }
    },
});

export const sweepStuckOutbox = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const smsConfig = await getSmsConfigFromDb(ctx);
        const fallbackEnabled = isAligoAutoFallbackEnabled(smsConfig);

        const stuckProcessing = await ctx.db
            .query("sms_outbox")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "processing"))
            .take(20);
        for (const item of stuckProcessing) {
            if (now - item.updatedAt > 70_000) {
                await ctx.db.patch(item._id, { status: "pending", updatedAt: now });
            }
        }

        const stuckFallback = await ctx.db
            .query("sms_outbox")
            .withIndex("by_status_and_createdAt", (q) => q.eq("status", "fallback_sending"))
            .take(20);
        for (const item of stuckFallback) {
            if (now - item.updatedAt > 90_000) {
                await ctx.db.patch(item._id, { status: "pending", updatedAt: now });
            }
        }

        if (fallbackEnabled) {
            const pendingItems = await ctx.db
                .query("sms_outbox")
                .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
                .order("asc")
                .take(15);

            let scheduled = 0;
            for (const item of pendingItems) {
                if (now - item.createdAt > 25_000) {
                    await ctx.scheduler.runAfter(0, internal.sms.processOutboxFallback, {
                        outboxId: item._id,
                    });
                    scheduled += 1;
                }
            }
            return { swept: scheduled };
        }

        return { swept: 0 };
    },
});

export const getSmsRetryTarget = internalMutation({
    args: {
        smsLogId: v.id("sms_logs"),
    },
    handler: async (ctx, args) => {
        const logDoc = await ctx.db.get(args.smsLogId);
        if (!logDoc) {
            throw new Error("문자 내역을 찾을 수 없습니다.");
        }
        if (logDoc.status === "성공") {
            return { alreadySent: true as const };
        }

        const outbox = await ctx.db
            .query("sms_outbox")
            .withIndex("by_smsLogId", (q) => q.eq("smsLogId", args.smsLogId))
            .first();

        const smsConfig = await getSmsConfigFromDb(ctx);
        const now = Date.now();

        if (hasAligoCredentials(smsConfig)) {
            if (outbox && outbox.status !== "sent") {
                await ctx.db.patch(outbox._id, {
                    status: "fallback_sending",
                    updatedAt: now,
                });
            }
            return {
                alreadySent: false as const,
                mode: "aligo" as const,
                outboxId: outbox?._id,
                receiverPhone: logDoc.customerPhone,
                title: logDoc.title || "[소노아임레디] 안내",
                message: logDoc.message,
                apiKey: String(smsConfig.apiKey),
                userId: String(smsConfig.userId),
                sender: String(smsConfig.sender),
            };
        }

        if (outbox) {
            await ctx.db.patch(outbox._id, {
                status: "pending",
                errorMessage: undefined,
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("sms_outbox", {
                smsLogId: logDoc._id,
                applicationId: logDoc.applicationId,
                receiverPhone: normalizeKoreanPhone(logDoc.customerPhone),
                title: logDoc.title,
                message: logDoc.message,
                status: "pending",
                createdAt: now,
                updatedAt: now,
            });
        }
        await ctx.db.patch(logDoc._id, {
            status: "발송대기",
            errorMessage: undefined,
        });
        return {
            alreadySent: false as const,
            mode: "phone_requeued" as const,
        };
    },
});

export const finalizeManualAligoRetry = internalMutation({
    args: {
        smsLogId: v.id("sms_logs"),
        outboxId: v.optional(v.id("sms_outbox")),
        success: v.boolean(),
        errorMessage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        if (args.outboxId) {
            const outbox = await ctx.db.get(args.outboxId);
            if (outbox) {
                await ctx.db.patch(args.outboxId, {
                    status: args.success ? "sent" : "pending",
                    errorMessage: args.success ? undefined : args.errorMessage,
                    updatedAt: now,
                });
            }
        }
        const logDoc = await ctx.db.get(args.smsLogId);
        if (logDoc) {
            const prevSender = logDoc.senderName || "관리자";
            const nextSender = args.success
                ? prevSender.includes("(회사폰)")
                    ? prevSender.replace("(회사폰)", "(알리고 즉시발송)")
                    : `${prevSender} (알리고 즉시발송)`
                : prevSender;
            await ctx.db.patch(args.smsLogId, {
                status: args.success ? "성공" : "실패",
                errorMessage: args.success ? undefined : args.errorMessage,
                senderName: nextSender,
            });
        }
        return null;
    },
});

export const retrySmsLog = action({
    args: {
        smsLogId: v.id("sms_logs"),
    },
    handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
        const target = await ctx.runMutation(internal.sms.getSmsRetryTarget, {
            smsLogId: args.smsLogId,
        });

        if (target.alreadySent) {
            return { success: true, message: "이미 발송 완료된 문자입니다." };
        }

        if (target.mode === "phone_requeued") {
            return {
                success: true,
                message: "회사폰 대기열 맨 앞으로 다시 요청했습니다. 회사폰 앱 연결 상태를 확인해주세요.",
            };
        }

        const sendRes = await sendViaAligoApi({
            apiKey: target.apiKey,
            userId: target.userId,
            sender: target.sender,
            receiver: target.receiverPhone,
            title: target.title,
            message: target.message,
            msgType: "LMS",
        });

        await ctx.runMutation(internal.sms.finalizeManualAligoRetry, {
            smsLogId: args.smsLogId,
            outboxId: target.outboxId,
            success: sendRes.ok,
            errorMessage: sendRes.errorMessage,
        });

        if (!sendRes.ok) {
            throw new Error(sendRes.errorMessage || "재발송에 실패했습니다.");
        }

        return {
            success: true,
            message: "알리고 클라우드를 통해 즉시 발송 완료되었습니다!",
        };
    },
});

// ==========================================
// Two-way Phone Bridge Sync & Inbound Webhook
// ==========================================

export const syncBridgeMessages = internalMutation({
    args: {
        secret: v.string(),
        deviceName: v.optional(v.string()),
        messages: v.array(
            v.object({
                direction: v.union(v.literal("inbound"), v.literal("outbound")),
                phone: v.string(),
                message: v.string(),
                timestamp: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const smsConfig = await getSmsConfigFromDb(ctx);
        const expectedSecret = smsConfig?.bridgeSecret || process.env.SMS_WEBHOOK_SECRET || "";

        if (!expectedSecret || args.secret !== expectedSecret) {
            return { ok: false, error: "연동 보안키가 일치하지 않습니다.", synced: 0 };
        }

        const now = Date.now();
        if (now - (smsConfig.bridgeLastSeenAt || 0) > 15_000) {
            await saveSmsConfigToDb(ctx, {
                ...smsConfig,
                bridgeLastSeenAt: now,
                bridgeDeviceName: args.deviceName || smsConfig.bridgeDeviceName,
            });
        }

        let syncedCount = 0;

        for (const item of args.messages) {
            const normalizedPhone = normalizeKoreanPhone(item.phone);
            const trimmedMessage = (item.message || "").trim();
            if (!normalizedPhone || normalizedPhone.length < 9 || !trimmedMessage) {
                continue;
            }

            // 등록된 고객과 매칭되는 문자만 기록 (개인 문자/스팸 차단)
            const matchedApp = await findMatchingApplication(ctx, normalizedPhone);
            if (!matchedApp) {
                continue;
            }

            const msgTime =
                typeof item.timestamp === "number" && item.timestamp > 0
                    ? Math.min(now, Math.max(now - 7 * 24 * 60 * 60 * 1000, item.timestamp))
                    : now;

            if (item.direction === "inbound") {
                const recentLogs = await ctx.db
                    .query("sms_logs")
                    .withIndex("by_customerPhone_and_createdAt", (q) =>
                        q
                            .eq("customerPhone", normalizedPhone)
                            .gte("createdAt", Math.min(now, msgTime) - 90_000)
                    )
                    .collect();

                const isDup = recentLogs.some(
                    (l) => l.direction === "inbound" && l.message.trim() === trimmedMessage
                );
                if (isDup) continue;

                await ctx.db.insert("sms_logs", {
                    applicationId: matchedApp._id,
                    applicationNo: matchedApp.applicationNo,
                    customerName: matchedApp.customerName,
                    customerPhone: normalizedPhone,
                    smsType: "고객답장",
                    message: trimmedMessage,
                    status: "수신",
                    direction: "inbound",
                    isRead: false,
                    createdAt: msgTime,
                });

                const productDisplay = formatProductDisplayName(
                    matchedApp.productType,
                    matchedApp.products
                );
                const notifMsg =
                    `💬 **고객 문자 답장이 도착했습니다!**\n\n` +
                    `👤 고객명: ${matchedApp.customerName || "미등록"}\n` +
                    `📞 발신번호: ${formatKoreanPhone(normalizedPhone)}\n` +
                    `📦 신청상품: ${productDisplay}\n` +
                    `💬 답장내용:\n${trimmedMessage}`;
                await ctx.scheduler.runAfter(0, internal.telegram.sendTelegramNotification, {
                    message: notifMsg,
                });
                syncedCount += 1;
            } else {
                // 타사(효원상조) 브릿지 앱이 같은 폰에서 발신한 문자는 소노 내역으로 중복 기록하지 않음
                if (isHyowonSmsText(trimmedMessage)) continue;

                const recentLogs = await ctx.db
                    .query("sms_logs")
                    .withIndex("by_customerPhone_and_createdAt", (q) =>
                        q
                            .eq("customerPhone", normalizedPhone)
                            .gte("createdAt", Math.min(now, msgTime) - 900_000)
                    )
                    .collect();

                const isDup = recentLogs.some((l) => {
                    if (l.direction === "inbound") return false;
                    const existing = l.message.trim();
                    return (
                        existing === trimmedMessage ||
                        (trimmedMessage.length >= 10 && existing.includes(trimmedMessage))
                    );
                });
                if (isDup) continue;

                await ctx.db.insert("sms_logs", {
                    applicationId: matchedApp._id,
                    applicationNo: matchedApp.applicationNo,
                    customerName: matchedApp.customerName,
                    customerPhone: normalizedPhone,
                    smsType: "휴대폰발신",
                    message: trimmedMessage,
                    status: "성공",
                    senderName: "회사폰 직접발송",
                    direction: "outbound",
                    createdAt: msgTime,
                });
                syncedCount += 1;
            }
        }

        return { ok: true, synced: syncedCount };
    },
});

export const recordInboundSms = internalMutation({
    args: {
        senderPhone: v.string(),
        receiverNumber: v.optional(v.string()),
        message: v.string(),
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const normalizedPhone = normalizeKoreanPhone(args.senderPhone);
        const trimmedMessage = args.message.trim();
        if (!normalizedPhone || !trimmedMessage) {
            return { ok: false, reason: "missing_phone_or_message" };
        }

        const now = Date.now();
        const recentLogs = await ctx.db
            .query("sms_logs")
            .withIndex("by_customerPhone_and_createdAt", (q) =>
                q.eq("customerPhone", normalizedPhone).gte("createdAt", now - 60_000)
            )
            .collect();
        if (recentLogs.some((l) => l.direction === "inbound" && l.message.trim() === trimmedMessage)) {
            return { ok: true, skippedDuplicate: true };
        }

        const matchedApp = await findMatchingApplication(ctx, normalizedPhone);

        await ctx.db.insert("sms_logs", {
            applicationId: matchedApp?._id,
            applicationNo: matchedApp?.applicationNo,
            customerName: matchedApp?.customerName,
            customerPhone: normalizedPhone,
            smsType: "고객답장",
            title: args.title,
            message: trimmedMessage,
            status: "수신",
            direction: "inbound",
            isRead: false,
            receiverNumber: args.receiverNumber,
            createdAt: now,
        });

        const productDisplay = matchedApp
            ? formatProductDisplayName(matchedApp.productType, matchedApp.products)
            : "-";
        const notifMsg =
            `${matchedApp ? "💬 **고객 문자 답장이 도착했습니다!**" : "💬 **미등록 번호에서 문자 답장이 도착했습니다**"}\n\n` +
            `👤 고객명: ${matchedApp?.customerName || "미등록 고객"}\n` +
            `📞 발신번호: ${formatKoreanPhone(normalizedPhone)}\n` +
            `📦 신청상품: ${productDisplay}\n` +
            `💬 답장내용:\n${trimmedMessage}`;
        await ctx.scheduler.runAfter(0, internal.telegram.sendTelegramNotification, {
            message: notifMsg,
        });

        return {
            ok: true,
            applicationId: matchedApp?._id ?? null,
            applicationNo: matchedApp?.applicationNo ?? null,
            customerName: matchedApp?.customerName ?? null,
        };
    },
});

// ==========================================
// Queries & Mutations for Admin UI
// ==========================================

export const listByApplication = query({
    args: {
        applicationId: v.id("applications"),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db.get(args.applicationId);
        const byApp = await ctx.db
            .query("sms_logs")
            .withIndex("by_applicationId_and_createdAt", (q) =>
                q.eq("applicationId", args.applicationId)
            )
            .order("desc")
            .take(100);

        const normPhone = normalizeKoreanPhone(app?.customerPhone || "");
        if (normPhone.length < 9) return byApp;

        const byPhone = await ctx.db
            .query("sms_logs")
            .withIndex("by_customerPhone_and_createdAt", (q) =>
                q.eq("customerPhone", normPhone)
            )
            .order("desc")
            .take(100);

        const merged = new Map<string, any>();
        for (const item of byApp) {
            merged.set(String(item._id), item);
        }
        for (const item of byPhone) {
            if (!item.applicationId || String(item.applicationId) === String(args.applicationId)) {
                merged.set(String(item._id), item);
            }
        }
        return Array.from(merged.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 100);
    },
});

export const listRecentLogs = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = Math.min(300, Math.max(20, args.limit ?? 120));
        return await ctx.db
            .query("sms_logs")
            .withIndex("by_createdAt")
            .order("desc")
            .take(limit);
    },
});

export const getUnreadInboundCounts = query({
    args: {},
    handler: async (ctx) => {
        const unreadLogs = await ctx.db
            .query("sms_logs")
            .withIndex("by_direction_and_isRead", (q) =>
                q.eq("direction", "inbound").eq("isRead", false)
            )
            .collect();

        const counts: Record<string, number> = {};
        for (const log of unreadLogs) {
            if (log.applicationId) {
                const key = String(log.applicationId);
                counts[key] = (counts[key] || 0) + 1;
            }
        }
        return counts;
    },
});

export const getLatestSmsByApplication = query({
    args: {},
    handler: async (ctx) => {
        const recentLogs = await ctx.db
            .query("sms_logs")
            .withIndex("by_createdAt")
            .order("desc")
            .take(1500);

        const latest: Record<
            string,
            {
                message: string;
                direction: "outbound" | "inbound";
                smsType: string;
                status: string;
                isRead?: boolean;
                createdAt: number;
            }
        > = {};

        for (const log of recentLogs) {
            if (!log.applicationId) continue;
            const key = String(log.applicationId);
            if (latest[key]) continue;
            latest[key] = {
                message: log.message,
                direction: log.direction ?? "outbound",
                smsType: log.smsType,
                status: log.status,
                isRead: log.isRead,
                createdAt: log.createdAt,
            };
        }

        return latest;
    },
});

export const markInboundRead = mutation({
    args: {
        applicationId: v.id("applications"),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db.get(args.applicationId);
        const byApp = await ctx.db
            .query("sms_logs")
            .withIndex("by_applicationId_and_createdAt", (q) =>
                q.eq("applicationId", args.applicationId)
            )
            .collect();

        const normPhone = normalizeKoreanPhone(app?.customerPhone || "");
        const byPhone =
            normPhone.length >= 9
                ? await ctx.db
                      .query("sms_logs")
                      .withIndex("by_customerPhone_and_createdAt", (q) =>
                          q.eq("customerPhone", normPhone)
                      )
                      .collect()
                : [];

        const seen = new Set<string>();
        let updated = 0;
        for (const log of [...byApp, ...byPhone]) {
            if (
                log.applicationId &&
                String(log.applicationId) !== String(args.applicationId)
            ) {
                continue;
            }
            const key = String(log._id);
            if (seen.has(key)) continue;
            seen.add(key);
            if (log.direction === "inbound" && log.isRead !== true) {
                await ctx.db.patch(log._id, { isRead: true });
                updated += 1;
            }
        }
        return { updated };
    },
});

export const markGoogleContactsSynced = mutation({
    args: {
        applicationIds: v.array(v.id("applications")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let updated = 0;
        for (const id of args.applicationIds) {
            const doc = await ctx.db.get(id);
            if (doc) {
                await ctx.db.patch(id, { googleContactsSyncedAt: now });
                updated += 1;
            }
        }
        return { updated };
    },
});

// ==========================================
// Actions: Test, Remain Count, Custom/Bulk Send, Auto Apply Send
// ==========================================

export const getSmsConfigInternal = query({
    args: {},
    handler: async (ctx) => {
        return await getSmsConfigFromDb(ctx);
    },
});

export const sendTestSms = action({
    args: {
        phone: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
        const smsConfig = await ctx.runQuery(
            // @ts-ignore
            (await import("./_generated/api")).api.sms.getSmsConfigInternal,
            {}
        );
        const provider = smsConfig?.provider || "phone_bridge";

        if (provider === "phone_bridge") {
            if (!smsConfig?.bridgeSecret) {
                return {
                    success: false,
                    message: "회사폰 연동 보안키를 먼저 설정 후 저장해주세요.",
                };
            }
            await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                customerPhone: args.phone,
                smsType: "테스트",
                title: "[소노아임레디] 연동 테스트",
                message: "[소노아임레디] 회사폰 문자 연동 테스트 메시지입니다.",
                senderName: "테스트",
            });
            return {
                success: true,
                message:
                    "회사폰으로 실제 테스트 발송 요청을 보냈습니다! (미응답 시 알리고 자동 백업 발송)",
            };
        }

        if (!hasAligoCredentials(smsConfig)) {
            throw new Error("SMS 설정이 완료되지 않았습니다.");
        }

        try {
            const sendRes = await sendViaAligoApi({
                apiKey: smsConfig.apiKey!,
                userId: smsConfig.userId!,
                sender: smsConfig.sender!,
                receiver: args.phone,
                message: "[소노아임레디] SMS 연동 테스트 메시지입니다.",
                msgType: "SMS",
                testMode: true,
            });

            if (sendRes.ok) {
                return { success: true, message: "테스트 발송 성공 (실제 발송되지 않음)" };
            }
            return { success: false, message: sendRes.errorMessage || "발송 실패" };
        } catch (error: any) {
            return { success: false, message: `오류: ${error.message}` };
        }
    },
});

export const getRemainCount = action({
    args: {},
    handler: async (ctx): Promise<any> => {
        const { api } = await import("./_generated/api");
        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});

        if (!smsConfig || !smsConfig.apiKey || !smsConfig.userId) {
            return { success: false, remain: 0, message: "알리고 API 정보가 입력되지 않았습니다." };
        }

        const formData = new URLSearchParams();
        formData.append("key", smsConfig.apiKey);
        formData.append("user_id", smsConfig.userId);

        try {
            const response = await fetch("https://apis.aligo.in/remain/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            const result = await response.json();

            if (String(result?.result_code) === "1") {
                return {
                    success: true,
                    remain: {
                        sms: Number(result.SMS_CNT) || 0,
                        lms: Number(result.LMS_CNT) || 0,
                        mms: Number(result.MMS_CNT) || 0,
                    },
                    message: "조회 성공",
                };
            }
            return { success: false, remain: 0, message: result?.message || "조회 실패" };
        } catch (error: any) {
            return { success: false, remain: 0, message: `오류: ${error.message}` };
        }
    },
});

export const sendCustomGuideSms = action({
    args: {
        applicationId: v.optional(v.id("applications")),
        applicationNo: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerPhone: v.string(),
        smsType: v.optional(v.string()),
        senderName: v.optional(v.string()),
        title: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
        const { api } = await import("./_generated/api");
        if (args.applicationId) {
            const targetApp = await ctx.runQuery(api.sms.getApplicationForSmsInternal, {
                applicationId: args.applicationId,
            });
            if (targetApp && !isMaeumProductType(targetApp.productType)) {
                throw new Error("마음든든 상품 고객에게만 문자를 발송할 수 있습니다.");
            }
        }
        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});
        const provider = smsConfig?.provider || "phone_bridge";

        const smsTitle = args.title || "[소노아임레디] 안내";
        const smsType = args.smsType || "상품안내";

        if (provider === "phone_bridge") {
            if (!smsConfig?.bridgeSecret) {
                throw new Error(
                    "회사폰 연동 보안키가 설정되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정에서 보안키를 저장해주세요."
                );
            }
            await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: args.customerName,
                customerPhone: args.customerPhone,
                smsType,
                title: smsTitle,
                message: args.message,
                senderName: args.senderName,
            });
            return {
                success: true,
                message:
                    "회사폰으로 문자 발송 요청을 전달했습니다. (절전·지연 시 알리고 자동 백업 발송)",
            };
        }

        if (!hasAligoCredentials(smsConfig)) {
            throw new Error(
                "SMS 설정이 완료되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정에서 정보를 입력해주세요."
            );
        }

        try {
            const sendRes = await sendViaAligoApi({
                apiKey: smsConfig.apiKey!,
                userId: smsConfig.userId!,
                sender: smsConfig.sender!,
                receiver: args.customerPhone,
                title: smsTitle,
                message: args.message,
                msgType: "LMS",
            });
            if (sendRes.ok) {
                await ctx.runMutation(internal.sms.logSms, {
                    applicationId: args.applicationId,
                    applicationNo: args.applicationNo,
                    customerName: args.customerName,
                    customerPhone: args.customerPhone,
                    smsType,
                    title: smsTitle,
                    message: args.message,
                    status: "성공",
                    senderName: args.senderName,
                });
                return { success: true, message: "문자 발송이 완료되었습니다." };
            }
            const errMsg = sendRes.errorMessage || "알리고 발송 실패";
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: args.customerName,
                customerPhone: args.customerPhone,
                smsType,
                title: smsTitle,
                message: args.message,
                status: "실패",
                errorMessage: errMsg,
                senderName: args.senderName,
            });
            throw new Error(errMsg);
        } catch (error: any) {
            if (!error.message?.startsWith("알리고 발송 실패:")) {
                await ctx.runMutation(internal.sms.logSms, {
                    applicationId: args.applicationId,
                    applicationNo: args.applicationNo,
                    customerName: args.customerName,
                    customerPhone: args.customerPhone,
                    smsType,
                    title: smsTitle,
                    message: args.message,
                    status: "실패",
                    errorMessage: error.message || "알 수 없는 오류",
                    senderName: args.senderName,
                });
            }
            throw new Error(`SMS 발송 중 오류: ${error.message}`);
        }
    },
});

export const sendBulkSms = action({
    args: {
        recipients: v.array(
            v.object({
                applicationId: v.id("applications"),
                applicationNo: v.optional(v.string()),
                customerName: v.string(),
                customerPhone: v.string(),
                productType: v.optional(v.string()),
                products: v.optional(v.string()),
                selectedGift: v.optional(v.string()),
                planType: v.optional(v.string()),
            })
        ),
        title: v.string(),
        messageTemplate: v.string(),
        senderName: v.optional(v.string()),
    },
    handler: async (
        ctx,
        args
    ): Promise<{ total: number; successCount: number; failCount: number }> => {
        const { api } = await import("./_generated/api");
        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});
        const provider = smsConfig?.provider || "phone_bridge";

        if (provider === "phone_bridge" && !smsConfig?.bridgeSecret) {
            throw new Error(
                "회사폰 연동 보안키가 설정되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정을 확인해주세요."
            );
        }
        if (provider !== "phone_bridge" && !hasAligoCredentials(smsConfig)) {
            throw new Error(
                "알리고 SMS 설정이 완료되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정을 확인해주세요."
            );
        }

        let successCount = 0;
        let failCount = 0;

        for (const r of args.recipients) {
            if (!isMaeumProductType(r.productType)) {
                failCount += 1;
                continue;
            }
            const digits = normalizeKoreanPhone(r.customerPhone);
            if (digits.length < 9) {
                failCount += 1;
                continue;
            }
            const productLabel = formatProductDisplayName(r.productType, r.products);
            const giftLabel = (r.selectedGift || "").trim() || "상담 시 맞춤 사은품 안내";
            const planLabel = (r.planType || "").trim() || "1구좌";
            const safeName = (r.customerName || "고객").trim() || "고객";

            const resolvedMsg = args.messageTemplate
                .replaceAll("{고객명}", safeName)
                .replaceAll("{상품명}", productLabel)
                .replaceAll("{사은품}", giftLabel)
                .replaceAll("{구좌}", planLabel)
                .replaceAll("{접수번호}", r.applicationNo || "");

            try {
                if (provider === "phone_bridge") {
                    await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                        applicationId: r.applicationId,
                        applicationNo: r.applicationNo,
                        customerName: safeName,
                        customerPhone: digits,
                        smsType: "일괄발송",
                        title: args.title || "[소노아임레디] 안내",
                        message: resolvedMsg,
                        senderName: args.senderName || "일괄발송",
                    });
                    successCount += 1;
                } else {
                    const sendRes = await sendViaAligoApi({
                        apiKey: smsConfig.apiKey!,
                        userId: smsConfig.userId!,
                        sender: smsConfig.sender!,
                        receiver: digits,
                        title: args.title || "[소노아임레디] 안내",
                        message: resolvedMsg,
                        msgType: "LMS",
                    });
                    await ctx.runMutation(internal.sms.logSms, {
                        applicationId: r.applicationId,
                        applicationNo: r.applicationNo,
                        customerName: safeName,
                        customerPhone: digits,
                        smsType: "일괄발송",
                        title: args.title || "[소노아임레디] 안내",
                        message: resolvedMsg,
                        status: sendRes.ok ? "성공" : "실패",
                        errorMessage: sendRes.ok ? undefined : sendRes.errorMessage,
                        senderName: args.senderName || "일괄발송",
                    });
                    if (sendRes.ok) successCount += 1;
                    else failCount += 1;
                }
            } catch {
                failCount += 1;
            }
        }

        return { total: args.recipients.length, successCount, failCount };
    },
});

export const getApplicationForSmsInternal = query({
    args: { applicationId: v.id("applications") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.applicationId);
    },
});

export const sendMaeumEcontractRequestSms = action({
    args: {
        applicationId: v.id("applications"),
        originUrl: v.optional(v.string()),
        senderName: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
        const { api } = await import("./_generated/api");
        const app = await ctx.runQuery(api.sms.getApplicationForSmsInternal, {
            applicationId: args.applicationId,
        });
        if (!app) {
            throw new Error("고객 신청 정보를 찾을 수 없습니다.");
        }
        if (!isMaeumProductType(app.productType)) {
            throw new Error("마음든든 고객관리 대상에게만 전자계약 안내 문자를 발송할 수 있습니다.");
        }

        const receiver = normalizeKoreanPhone(app.customerPhone || "");
        if (receiver.length < 9) {
            throw new Error("고객 휴대폰 번호가 올바르지 않습니다.");
        }

        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});
        const provider = smsConfig?.provider || "phone_bridge";

        const baseOrigin = (args.originUrl || "https://www.sonopartner.com").replace(/\/$/, "");
        const contractUrl = `${baseOrigin}/products/maeum/econtract?appId=${args.applicationId}`;

        const safeName = (app.customerName || "고객").trim() || "고객";
        const productLabel = formatProductDisplayName(app.productType, app.products);
        const giftLabel = (app.selectedGift || "").trim() || "상담 시 맞춤 사은품 안내";
        const planLabel = (app.planType || "").trim() || "1구좌";

        const title =
            (smsConfig?.econtractRequestTitle || "").trim() ||
            DEFAULT_ECONTRACT_REQUEST_TITLE;
        const template =
            (smsConfig?.econtractRequestMessage || "").trim() ||
            DEFAULT_ECONTRACT_REQUEST_MESSAGE;

        const message = template
            .replaceAll("{고객명}", safeName)
            .replaceAll("{상품명}", productLabel)
            .replaceAll("{사은품}", giftLabel)
            .replaceAll("{구좌}", planLabel)
            .replaceAll("{접수번호}", app.applicationNo || "")
            .replaceAll("{계약링크}", contractUrl);

        if (provider === "phone_bridge") {
            if (!smsConfig?.bridgeSecret) {
                throw new Error(
                    "회사폰 연동 보안키가 설정되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정에서 보안키를 저장해주세요."
                );
            }
            await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                applicationId: args.applicationId,
                applicationNo: app.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "전자계약안내",
                title,
                message,
                senderName: args.senderName || "어드민",
            });
            return {
                success: true,
                message: "전자계약 서명 안내 문자를 회사폰으로 발송 요청했습니다.",
            };
        }

        if (!hasAligoCredentials(smsConfig)) {
            throw new Error(
                "SMS 설정이 완료되지 않았습니다. 환경설정 > 문자(SMS) 연동 설정에서 정보를 입력해주세요."
            );
        }

        const sendRes = await sendViaAligoApi({
            apiKey: smsConfig.apiKey!,
            userId: smsConfig.userId!,
            sender: smsConfig.sender!,
            receiver,
            title,
            message,
            msgType: "LMS",
        });

        await ctx.runMutation(internal.sms.logSms, {
            applicationId: args.applicationId,
            applicationNo: app.applicationNo,
            customerName: safeName,
            customerPhone: receiver,
            smsType: "전자계약안내",
            title,
            message,
            status: sendRes.ok ? "성공" : "실패",
            errorMessage: sendRes.ok ? undefined : sendRes.errorMessage || "알리고 발송 실패",
            senderName: args.senderName || "어드민",
        });

        if (!sendRes.ok) {
            throw new Error(sendRes.errorMessage || "알리고 발송 실패");
        }
        return { success: true, message: "전자계약 서명 안내 문자가 발송되었습니다." };
    },
});

export const sendMaeumEcontractCompleteSms = internalAction({
    args: {
        applicationId: v.optional(v.id("applications")),
        applicationNo: v.optional(v.string()),
        customerName: v.string(),
        customerPhone: v.string(),
        productType: v.optional(v.string()),
        products: v.optional(v.string()),
        selectedGift: v.optional(v.string()),
        planType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!isMaeumProductType(args.productType)) {
            return { success: false, skipped: true, reason: "not_maeum" };
        }
        const { api } = await import("./_generated/api");
        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});

        if (smsConfig?.autoSendOnEcontractComplete === false) {
            return { success: false, skipped: true, reason: "disabled" };
        }

        const receiver = normalizeKoreanPhone(args.customerPhone);
        if (receiver.length < 9) {
            return { success: false, skipped: true, reason: "invalid_phone" };
        }

        const safeName = args.customerName.trim() || "고객";
        const productLabel = formatProductDisplayName(args.productType, args.products);
        const giftLabel = (args.selectedGift || "").trim() || "상담 시 맞춤 사은품 안내";
        const planLabel = (args.planType || "").trim() || "1구좌";

        const title =
            (smsConfig?.econtractCompleteTitle || "").trim() ||
            DEFAULT_ECONTRACT_COMPLETE_TITLE;
        const template =
            (smsConfig?.econtractCompleteMessage || "").trim() ||
            DEFAULT_ECONTRACT_COMPLETE_MESSAGE;

        const message = template
            .replaceAll("{고객명}", safeName)
            .replaceAll("{상품명}", productLabel)
            .replaceAll("{사은품}", giftLabel)
            .replaceAll("{구좌}", planLabel)
            .replaceAll("{접수번호}", args.applicationNo || "");

        if (!message.trim()) {
            return { success: false, skipped: true, reason: "empty_message" };
        }

        const provider = smsConfig?.provider || "phone_bridge";

        if (provider === "phone_bridge" && smsConfig?.bridgeSecret) {
            await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "전자계약완료",
                title,
                message,
                senderName: "자동발송",
            });
            return { success: true, queued: true };
        }

        if (!hasAligoCredentials(smsConfig)) {
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "전자계약완료",
                title,
                message,
                status: "실패",
                errorMessage: "문자(SMS) 연동 설정이 완료되지 않아 자동 발송되지 않았습니다.",
                senderName: "자동발송",
            });
            return { success: false, skipped: true, reason: "not_configured" };
        }

        try {
            const sendRes = await sendViaAligoApi({
                apiKey: smsConfig.apiKey!,
                userId: smsConfig.userId!,
                sender: smsConfig.sender!,
                receiver,
                title,
                message,
                msgType: "LMS",
            });
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "전자계약완료",
                title,
                message,
                status: sendRes.ok ? "성공" : "실패",
                errorMessage: sendRes.ok ? undefined : sendRes.errorMessage,
                senderName: "자동발송",
            });
            return { success: sendRes.ok, result: sendRes.raw };
        } catch (error: any) {
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "전자계약완료",
                title,
                message,
                status: "실패",
                errorMessage: error?.message || "알 수 없는 오류",
                senderName: "자동발송",
            });
            return { success: false, error: error?.message };
        }
    },
});

export const sendAutoApplicationSms = internalAction({
    args: {
        applicationId: v.optional(v.id("applications")),
        applicationNo: v.optional(v.string()),
        customerName: v.string(),
        customerPhone: v.string(),
        productType: v.optional(v.string()),
        products: v.optional(v.string()),
        selectedGift: v.optional(v.string()),
        planType: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        if (!isMaeumProductType(args.productType)) {
            return { success: false, skipped: true, reason: "not_maeum" };
        }
        const { api } = await import("./_generated/api");
        const smsConfig = await ctx.runQuery(api.sms.getSmsConfigInternal, {});

        if (smsConfig?.autoSendOnApply === false) {
            return { success: false, skipped: true, reason: "disabled" };
        }

        const receiver = normalizeKoreanPhone(args.customerPhone);
        if (receiver.length < 9) {
            return { success: false, skipped: true, reason: "invalid_phone" };
        }

        const safeName = args.customerName.trim() || "고객";
        const productLabel = formatProductDisplayName(args.productType, args.products);
        const giftLabel = (args.selectedGift || "").trim() || "상담 시 맞춤 사은품 안내";
        const planLabel = (args.planType || "").trim() || "1구좌";

        const title = (smsConfig?.autoApplyTitle || "").trim() || DEFAULT_AUTO_APPLY_TITLE;
        const template = (smsConfig?.autoApplyMessage || "").trim() || DEFAULT_AUTO_APPLY_MESSAGE;

        const message = template
            .replaceAll("{고객명}", safeName)
            .replaceAll("{상품명}", productLabel)
            .replaceAll("{사은품}", giftLabel)
            .replaceAll("{구좌}", planLabel)
            .replaceAll("{접수번호}", args.applicationNo || "");

        if (!message.trim()) {
            return { success: false, skipped: true, reason: "empty_message" };
        }

        const provider = smsConfig?.provider || "phone_bridge";

        if (provider === "phone_bridge" && smsConfig?.bridgeSecret) {
            await ctx.runMutation(internal.sms.enqueuePhoneOutbox, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "접수안내",
                title,
                message,
                senderName: "자동발송",
            });
            return { success: true, queued: true };
        }

        if (!hasAligoCredentials(smsConfig)) {
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "접수안내",
                title,
                message,
                status: "실패",
                errorMessage: "문자(SMS) 연동 설정이 완료되지 않아 자동 발송되지 않았습니다.",
                senderName: "자동발송",
            });
            return { success: false, skipped: true, reason: "not_configured" };
        }

        try {
            const sendRes = await sendViaAligoApi({
                apiKey: smsConfig.apiKey!,
                userId: smsConfig.userId!,
                sender: smsConfig.sender!,
                receiver,
                title,
                message,
                msgType: "LMS",
            });
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "접수안내",
                title,
                message,
                status: sendRes.ok ? "성공" : "실패",
                errorMessage: sendRes.ok ? undefined : sendRes.errorMessage,
                senderName: "자동발송",
            });
            return { success: sendRes.ok, result: sendRes.raw };
        } catch (error: any) {
            await ctx.runMutation(internal.sms.logSms, {
                applicationId: args.applicationId,
                applicationNo: args.applicationNo,
                customerName: safeName,
                customerPhone: receiver,
                smsType: "접수안내",
                title,
                message,
                status: "실패",
                errorMessage: error?.message || "알 수 없는 오류",
                senderName: "자동발송",
            });
            return { success: false, error: error?.message };
        }
    },
});

export const createPhoneOtpInternal = internalMutation({
    args: {
        name: v.string(),
        phone: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const latest = await ctx.db
            .query("phone_verifications")
            .withIndex("by_phone_and_createdAt", (q) => q.eq("phone", args.phone))
            .order("desc")
            .first();

        if (latest && now - latest.createdAt < 30_000) {
            const waitSec = Math.ceil((30_000 - (now - latest.createdAt)) / 1000);
            return {
                ok: false as const,
                error: `${waitSec}초 후에 다시 요청해 주세요.`,
            };
        }

        const expiresAt = now + 5 * 60 * 1000;
        const verificationId = await ctx.db.insert("phone_verifications", {
            phone: args.phone,
            name: args.name,
            code: args.code,
            attempts: 0,
            verified: false,
            expiresAt,
            createdAt: now,
        });

        const smsConfig = await getSmsConfigFromDb(ctx);
        return {
            ok: true as const,
            verificationId,
            expiresAt,
            smsConfig,
        };
    },
});

export const enqueueOtpOutboxInternal = internalMutation({
    args: {
        name: v.string(),
        phone: v.string(),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const smsLogId = await ctx.db.insert("sms_logs", {
            customerName: args.name,
            customerPhone: args.phone,
            smsType: "본인인증",
            message: args.message,
            status: "발송대기",
            senderName: "본인인증",
            direction: "outbound",
            createdAt: now,
        });

        const outboxId = await ctx.db.insert("sms_outbox", {
            smsLogId,
            receiverPhone: args.phone,
            message: args.message,
            status: "pending",
            createdAt: now,
            updatedAt: now,
        });

        const smsConfig = await getSmsConfigFromDb(ctx);
        if (isAligoAutoFallbackEnabled(smsConfig)) {
            await ctx.scheduler.runAfter(6_000, internal.sms.processOutboxFallback, {
                outboxId,
            });
        }
        return { outboxId, smsLogId };
    },
});

export const requestPhoneOtp = action({
    args: {
        name: v.string(),
        phone: v.string(),
    },
    handler: async (
        ctx,
        args
    ): Promise<{ ok: boolean; error?: string; expiresAt?: number }> => {
        const trimmedName = args.name.trim();
        const normalizedPhone = normalizeKoreanPhone(args.phone);

        if (!trimmedName) {
            return { ok: false, error: "성명을 입력해 주세요." };
        }
        if (normalizedPhone.length < 10 || !normalizedPhone.startsWith("01")) {
            return { ok: false, error: "올바른 휴대폰 번호(010 등)를 입력해 주세요." };
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const created: any = await ctx.runMutation(internal.sms.createPhoneOtpInternal, {
            name: trimmedName,
            phone: normalizedPhone,
            code,
        });

        if (!created.ok) {
            return { ok: false, error: created.error };
        }

        const message = `[소노아임레디] 전자계약 본인인증 번호는 [${code}]입니다. (5분 이내 입력)`;
        const smsConfig = created.smsConfig as SmsConfig;

        if (hasAligoCredentials(smsConfig)) {
            try {
                const sendRes = await sendViaAligoApi({
                    apiKey: smsConfig.apiKey!,
                    userId: smsConfig.userId!,
                    sender: smsConfig.sender!,
                    receiver: normalizedPhone,
                    message,
                    msgType: "SMS",
                });
                await ctx.runMutation(internal.sms.logSms, {
                    customerName: trimmedName,
                    customerPhone: normalizedPhone,
                    smsType: "본인인증",
                    message,
                    status: sendRes.ok ? "성공" : "실패",
                    errorMessage: sendRes.ok ? undefined : sendRes.errorMessage,
                    senderName: "본인인증",
                });
                if (!sendRes.ok) {
                    return {
                        ok: false,
                        error: sendRes.errorMessage || "인증번호 문자 발송에 실패했습니다.",
                    };
                }
                return { ok: true, expiresAt: created.expiresAt };
            } catch (err: any) {
                await ctx.runMutation(internal.sms.logSms, {
                    customerName: trimmedName,
                    customerPhone: normalizedPhone,
                    smsType: "본인인증",
                    message,
                    status: "실패",
                    errorMessage: err?.message || "알 수 없는 오류",
                    senderName: "본인인증",
                });
                return {
                    ok: false,
                    error: "인증번호 문자 발송 중 오류가 발생했습니다.",
                };
            }
        }

        await ctx.runMutation(internal.sms.enqueueOtpOutboxInternal, {
            name: trimmedName,
            phone: normalizedPhone,
            message,
        });
        return { ok: true, expiresAt: created.expiresAt };
    },
});

export const verifyPhoneOtp = mutation({
    args: {
        phone: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const normalizedPhone = normalizeKoreanPhone(args.phone);
        const trimmedCode = args.code.trim();

        if (normalizedPhone.length < 10) {
            return { ok: false, error: "올바른 휴대폰 번호가 아닙니다." };
        }
        if (trimmedCode.length !== 6) {
            return { ok: false, error: "6자리 인증번호를 입력해 주세요." };
        }

        const latest = await ctx.db
            .query("phone_verifications")
            .withIndex("by_phone_and_createdAt", (q) => q.eq("phone", normalizedPhone))
            .order("desc")
            .first();

        if (!latest) {
            return { ok: false, error: "인증번호 발송 내역이 없습니다. 먼저 인증번호를 요청해 주세요." };
        }
        if (Date.now() > latest.expiresAt) {
            return { ok: false, error: "인증번호 유효시간(5분)이 만료되었습니다. 다시 요청해 주세요." };
        }
        if (latest.attempts >= 5) {
            return { ok: false, error: "인증 시도 횟수(5회)를 초과했습니다. 인증번호를 다시 요청해 주세요." };
        }
        if (latest.code !== trimmedCode) {
            const nextAttempts = latest.attempts + 1;
            await ctx.db.patch(latest._id, { attempts: nextAttempts });
            const remain = 5 - nextAttempts;
            return {
                ok: false,
                error:
                    remain > 0
                        ? `인증번호가 일치하지 않습니다. (남은 시도 ${remain}회)`
                        : "인증 시도 횟수(5회)를 초과했습니다. 인증번호를 다시 요청해 주세요.",
            };
        }

        await ctx.db.patch(latest._id, { verified: true });
        return {
            ok: true,
            verifiedName: latest.name,
            verifiedPhone: latest.phone,
        };
    },
});
