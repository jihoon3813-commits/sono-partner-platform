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

        // 자사 도메인 및 내부 호출 헤더가 유입 리퍼러로 잘못 기록되지 않도록 방지
        const host = req.headers.get("host") || "";
        let cleanReferrer = (referrer || "").trim();

        if (cleanReferrer) {
            try {
                const parsed = new URL(cleanReferrer.startsWith("http") ? cleanReferrer : `https://${cleanReferrer}`);
                if (
                    parsed.host === host ||
                    parsed.host.includes("sono-partners.com") ||
                    parsed.host.includes("localhost") ||
                    parsed.host.includes("127.0.0.1")
                ) {
                    cleanReferrer = ""; // 내부 페이지 이동은 외부 유입 출처가 아니므로 비움
                }
            } catch (e) {}
        }

        if (convex) {
            await convex.mutation(api.analytics.recordHit, {
                partnerId: partnerId || "main",
                path: path || "/",
                visitorId: visitorId || "anonymous",
                userAgent: userAgent || req.headers.get("user-agent") || undefined,
                referrer: cleanReferrer || undefined,
                ip: ip || undefined,
            });
        }

        return NextResponse.json({ success: true, ip });
    } catch (error) {
        console.error("Error recording analytics hit:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
