/**
 * 한국 시간(KST, UTC+9)으로 ISO 문자열을 반환합니다.
 * Convex 서버는 UTC에서 실행되므로, 9시간을 더해 KST로 변환합니다.
 */
export function nowKST(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().replace("Z", "+09:00");
}

/**
 * 한국 시간(KST) 기준 날짜를 YYYYMMDD 형태로 반환합니다.
 */
export function todayKSTStr(): string {
    return nowKST().slice(0, 10).replace(/-/g, "");
}
