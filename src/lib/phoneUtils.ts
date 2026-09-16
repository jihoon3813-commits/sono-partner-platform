/**
 * 한국 전화번호 자동 하이픈 포맷팅 유틸리티
 * - 전국대표번호 (1588-XXXX, 1544-XXXX, 1600-XXXX, 1800-XXXX 등 8자리: 4-4)
 * - 서울 지역번호 (02-XXX-XXXX, 02-XXXX-XXXX)
 * - 휴대폰 및 일반 지역/인터넷 전화 (010-XXXX-XXXX, 031-XXX-XXXX, 070-XXXX-XXXX 등)
 */
export function formatPhoneNumber(val: string): string {
    if (!val) return "";
    const nums = val.replace(/[^0-9]/g, "");

    // 1. 전국대표번호 (15xx, 16xx, 18xx 등 8자리 이하)
    if (/^1[5-8]/.test(nums)) {
        if (nums.length <= 4) return nums;
        if (nums.length <= 8) return `${nums.slice(0, 4)}-${nums.slice(4)}`;
        return `${nums.slice(0, 4)}-${nums.slice(4, 8)}`;
    }

    // 2. 서울 지역번호 (02)
    if (nums.startsWith("02")) {
        if (nums.length <= 2) return nums;
        if (nums.length <= 5) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
        if (nums.length <= 9) return `${nums.slice(0, 2)}-${nums.slice(2, 5)}-${nums.slice(5)}`;
        return `${nums.slice(0, 2)}-${nums.slice(2, 6)}-${nums.slice(6, 10)}`;
    }

    // 3. 휴대폰 및 기타 지역번호 (010, 031, 051, 070 등)
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
}

/**
 * 하이픈이나 공백 등 기호를 모두 제거한 순수 숫자 전화번호 반환 (tel:, sms: 링크용)
 */
export function getRawPhoneNumber(val: string): string {
    return (val || "").replace(/[^0-9]/g, "");
}
