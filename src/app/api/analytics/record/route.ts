import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { partnerId, path, visitorId, userAgent, referrer } = body;

        if (!path || !visitorId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        // HTTP 요청 헤더에서 클라이언트의 IP 주소 추출
        const forwardedFor = req.headers.get("x-forwarded-for");
        const realIp = req.headers.get("x-real-ip");
        const cfIp = req.headers.get("cf-connecting-ip");
        const headerReferrer = req.headers.get("referer");

        let ip = "127.0.0.1";
        if (forwardedFor) {
            ip = forwardedFor.split(",")[0].trim();
        } else if (realIp) {
            ip = realIp.trim();
        } else if (cfIp) {
            ip = cfIp.trim();
        }

        const finalReferrer = referrer || headerReferrer || "";

        if (convex) {
            await convex.mutation(api.analytics.recordHit, {
                partnerId: partnerId || "main",
                path: path || "/",
                visitorId: visitorId || "anonymous",
                userAgent: userAgent || req.headers.get("user-agent") || undefined,
                referrer: finalReferrer || undefined,
                ip: ip || undefined,
            });
        }

        return NextResponse.json({ success: true, ip });
    } catch (error) {
        console.error("Error recording analytics hit:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
