import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret, x-bridge-secret",
};

function jsonReply(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders,
        },
    });
}

function pickFirstString(obj: Record<string, any>, keys: string[]): string {
    for (const key of keys) {
        const val = obj?.[key];
        if (typeof val === "string" && val.trim()) return val.trim();
        if (typeof val === "number") return String(val);
    }
    return "";
}

http.route({
    path: "/api/sms-inbound",
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
    path: "/api/sms-inbound",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        try {
            const configuredSecret = process.env.SMS_WEBHOOK_SECRET;
            if (configuredSecret) {
                const url = new URL(req.url);
                const headerSecret = req.headers.get("x-webhook-secret") || "";
                const querySecret = url.searchParams.get("secret") || "";
                if (headerSecret !== configuredSecret && querySecret !== configuredSecret) {
                    return jsonReply({ ok: false, error: "Unauthorized" }, 401);
                }
            }

            const contentType = (req.headers.get("content-type") || "").toLowerCase();
            let items: Record<string, any>[] = [];

            if (contentType.includes("application/json")) {
                const parsed = await req.json();
                if (Array.isArray(parsed)) {
                    items = parsed;
                } else if (Array.isArray(parsed?.messages)) {
                    items = parsed.messages;
                } else if (parsed?.data && typeof parsed.data === "object") {
                    items = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
                } else if (parsed && typeof parsed === "object") {
                    items = [parsed];
                }
            } else if (contentType.includes("application/x-www-form-urlencoded")) {
                const text = await req.text();
                const params = new URLSearchParams(text);
                const obj: Record<string, string> = {};
                params.forEach((v, k) => {
                    obj[k] = v;
                });
                items = [obj];
            } else if (contentType.includes("multipart/form-data")) {
                const form = await req.formData();
                const obj: Record<string, string> = {};
                form.forEach((v, k) => {
                    if (typeof v === "string") obj[k] = v;
                });
                items = [obj];
            } else {
                const raw = await req.text();
                try {
                    const parsed = JSON.parse(raw);
                    items = Array.isArray(parsed) ? parsed : [parsed];
                } catch {
                    const params = new URLSearchParams(raw);
                    const obj: Record<string, string> = {};
                    params.forEach((v, k) => {
                        obj[k] = v;
                    });
                    items = [obj];
                }
            }

            const results = [];
            for (const item of items) {
                const senderPhone = pickFirstString(item, [
                    "from",
                    "sender",
                    "senderPhone",
                    "phone",
                    "caller",
                    "발신번호",
                ]);
                const receiverNumber = pickFirstString(item, [
                    "to",
                    "receiver",
                    "receiverNumber",
                    "called",
                    "수신번호",
                ]);
                const message = pickFirstString(item, [
                    "text",
                    "msg",
                    "message",
                    "content",
                    "body",
                    "내용",
                ]);
                const title = pickFirstString(item, ["subject", "title", "제목"]);

                if (!senderPhone || !message) continue;

                const res = await ctx.runMutation(internal.sms.recordInboundSms, {
                    senderPhone,
                    receiverNumber: receiverNumber || undefined,
                    message,
                    title: title || undefined,
                });
                results.push(res);
            }

            return jsonReply({ ok: true, processed: results.length, results }, 200);
        } catch (err: any) {
            return jsonReply({ ok: false, error: err?.message || "Invalid request" }, 400);
        }
    }),
});

http.route({
    path: "/api/sms-bridge/poll",
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
    path: "/api/sms-bridge/poll",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        try {
            const body = await req.json().catch(() => ({}));
            const secret = String(req.headers.get("x-bridge-secret") || body?.secret || "").trim();
            const deviceName =
                typeof body?.deviceName === "string" ? body.deviceName.trim() : undefined;
            const appVersion =
                typeof body?.appVersion === "string" ? body.appVersion.trim() : undefined;

            const res = await ctx.runMutation(internal.sms.pollBridgeOutbox, {
                secret,
                deviceName,
                appVersion,
            });
            return jsonReply(res, res.ok ? 200 : 401);
        } catch (err: any) {
            return jsonReply({ ok: false, error: err?.message || "Invalid request", jobs: [] }, 400);
        }
    }),
});

http.route({
    path: "/api/sms-bridge/ack",
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
    path: "/api/sms-bridge/ack",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        try {
            const body = await req.json();
            const secret = String(req.headers.get("x-bridge-secret") || body?.secret || "").trim();
            const outboxId = body?.outboxId;
            if (!outboxId) {
                return jsonReply({ ok: false, error: "outboxId is required" }, 400);
            }

            const res = await ctx.runMutation(internal.sms.ackBridgeOutbox, {
                secret,
                outboxId,
                success: Boolean(body?.success),
                errorMessage:
                    typeof body?.errorMessage === "string" ? body.errorMessage : undefined,
            });
            return jsonReply(res, res.ok ? 200 : 401);
        } catch (err: any) {
            return jsonReply({ ok: false, error: err?.message || "Invalid request" }, 400);
        }
    }),
});

http.route({
    path: "/api/sms-bridge/sync",
    method: "OPTIONS",
    handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
    path: "/api/sms-bridge/sync",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        try {
            const body = await req.json();
            const secret = String(req.headers.get("x-bridge-secret") || body?.secret || "").trim();
            const deviceName =
                typeof body?.deviceName === "string" ? body.deviceName.trim() : undefined;
            const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

            const messages = rawMessages
                .filter(
                    (m: any) =>
                        (m?.direction === "inbound" || m?.direction === "outbound") &&
                        typeof m?.phone === "string" &&
                        typeof m?.message === "string"
                )
                .map((m: any) => ({
                    direction: m.direction as "inbound" | "outbound",
                    phone: String(m.phone),
                    message: String(m.message),
                    timestamp: typeof m.timestamp === "number" ? m.timestamp : undefined,
                }));

            const res = await ctx.runMutation(internal.sms.syncBridgeMessages, {
                secret,
                deviceName,
                messages,
            });
            return jsonReply(res, res.ok ? 200 : 401);
        } catch (err: any) {
            return jsonReply({ ok: false, error: err?.message || "Invalid request" }, 400);
        }
    }),
});

export default http;
