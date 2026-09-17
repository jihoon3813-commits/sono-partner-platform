/**
 * 브라우저 탭 파비콘 및 타이틀에 카카오톡 스타일의 빨간색 원 알림 뱃지를 그리는 유틸리티
 */

const DEFAULT_FAVICON = "/favicon_sono.png";
export const BASE_TITLE = "소노아임레디 제휴 파트너 플랫폼";

let cachedOriginalFaviconImg: HTMLImageElement | null = null;

function getOriginalFaviconImage(): Promise<HTMLImageElement> {
    if (cachedOriginalFaviconImg && cachedOriginalFaviconImg.complete) {
        return Promise.resolve(cachedOriginalFaviconImg);
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = DEFAULT_FAVICON;
        img.onload = () => {
            cachedOriginalFaviconImg = img;
            resolve(img);
        };
        img.onerror = (err) => reject(err);
    });
}

/**
 * 파비콘에 카톡/iOS 스타일의 빨간색 원 숫자 뱃지를 합성하여 적용
 */
export async function updateFaviconBadge(count: number): Promise<void> {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");

    if (count <= 0) {
        iconLinks.forEach((link) => {
            link.href = DEFAULT_FAVICON;
        });
        return;
    }

    try {
        const img = await getOriginalFaviconImage();
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 기존 파비콘 아이콘 그리기
        ctx.drawImage(img, 0, 0, 32, 32);

        // 카카오톡 알림 스타일 빨간색 원 뱃지 그리기
        const countText = count > 99 ? "99+" : String(count);

        ctx.save();
        ctx.fillStyle = "#FF3B30"; // 카카오톡/iOS 비비드 알림 레드
        ctx.strokeStyle = "#FFFFFF"; // 선명한 화이트 테두리
        ctx.lineWidth = 2;

        if (count < 10) {
            // 1자리 숫자: 깔끔한 원형 뱃지
            const centerX = 23;
            const centerY = 9;
            const radius = 8;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // 흰색 숫자
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(countText, centerX, centerY + 0.5);
        } else {
            // 2자리 이상: 알약(Pill) 형태 뱃지
            const width = count > 99 ? 22 : 18;
            const height = 14;
            const x = 32 - width;
            const y = 1;
            const r = height / 2;

            ctx.beginPath();
            if (typeof ctx.roundRect === "function") {
                ctx.roundRect(x, y, width, height, r);
            } else {
                ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
                ctx.arc(x + width - r, y + r, r, (3 * Math.PI) / 2, Math.PI / 2);
                ctx.closePath();
            }
            ctx.fill();
            ctx.stroke();

            // 흰색 숫자
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 9px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(countText, x + width / 2, y + height / 2 + 0.5);
        }

        ctx.restore();

        const badgeDataUrl = canvas.toDataURL("image/png");

        if (iconLinks.length === 0) {
            const newLink = document.createElement("link");
            newLink.rel = "icon";
            newLink.href = badgeDataUrl;
            document.head.appendChild(newLink);
        } else {
            iconLinks.forEach((link) => {
                link.href = badgeDataUrl;
            });
        }
    } catch (e) {
        console.error("Failed to update favicon badge:", e);
    }
}
