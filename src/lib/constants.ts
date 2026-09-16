// 시스템 예약 경로 및 키워드 (파트너 ID나 커스텀 URL로 사용 불가한 키워드)
export const RESERVED_PARTNER_KEYWORDS = new Set([
    "privacy",
    "terms",
    "policy",
    "disclosure",
    "admin",
    "partner",
    "partners",
    "partner-center",
    "products",
    "lecture",
    "neora",
    "api",
    "main",
    "null",
    "undefined",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml"
]);

export function isReservedKeyword(keyword?: string | null): boolean {
    if (!keyword) return false;
    return RESERVED_PARTNER_KEYWORDS.has(keyword.trim().toLowerCase());
}
