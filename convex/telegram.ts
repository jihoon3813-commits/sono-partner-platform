import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * 디스코드 웹훅 알림 유틸리티
 * 
 * 설정 방법:
 * 1. 디스코드 서버 생성 (또는 기존 서버 사용)
 * 2. 알림 받을 채널 > 설정(⚙️) > 연동 > 웹후크 > 새 웹후크 > URL 복사
 * 3. Convex 대시보드 > Settings > Environment Variables에 아래 값 추가:
 *    - DISCORD_WEBHOOK_URL: 웹훅 URL
 */

// 내부 이름은 sendTelegramNotification으로 유지 (기존 호출과 호환)
export const sendTelegramNotification = internalAction({
    args: {
        message: v.string(),
    },
    handler: async (_ctx, args) => {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.log("[Discord] Webhook URL not configured. Skipping notification.");
            console.log("[Discord] Message would have been:", args.message);
            return { success: false, reason: "not_configured" };
        }

        // HTML 태그를 Discord 마크다운으로 변환
        const discordMessage = args.message
            .replace(/<b>/g, "**")
            .replace(/<\/b>/g, "**")
            .replace(/\\n/g, "\n");

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: discordMessage,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[Discord] Failed to send:", response.status, errorText);
                return { success: false, reason: errorText };
            }

            console.log("[Discord] Notification sent successfully");
            return { success: true };
        } catch (error) {
            console.error("[Discord] Error sending notification:", error);
            return { success: false, reason: String(error) };
        }
    },
});
