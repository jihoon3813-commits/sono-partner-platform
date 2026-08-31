/**
 * 대한민국 표준시(KST, Asia/Seoul, UTC+9) 기준 날짜 유틸리티
 */

// YYYY-MM-DD 형태의 KST 날짜 문자열 리턴
export function getKSTDateString(dateInput?: Date | string | number): string {
    if (!dateInput && dateInput !== 0) {
        const now = new Date();
        return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
    }
    const d = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput).substring(0, 10);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
}

// YYYY-MM-DD HH:mm:ss 형태의 KST 일시 문자열 리턴
export function getKSTDateTimeString(dateInput?: Date | string | number): string {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return String(dateInput);
    
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).format(d);
}

// 2-digit 연/월/일 및 분단위 일시 표시 포맷 (예: 26. 08. 28. 오후 04:44)
export function formatDateTime(val?: Date | string | number, fallbackCreationTime?: number): string {
    if (!val && !fallbackCreationTime) return "-";

    let d: Date | null = null;

    if (val) {
        // Excel serial handling
        const serial = typeof val === 'number' ? val : (typeof val === 'string' && !val.includes('-') && !val.includes(':') && !val.includes('T') ? parseFloat(val) : NaN);
        if (!isNaN(serial) && serial > 30000 && serial < 60000) {
            d = new Date((serial - 25569) * 86400 * 1000);
        } else {
            const parsed = new Date(String(val));
            if (!isNaN(parsed.getTime())) {
                d = parsed;
            }
        }
    }

    if (!d || isNaN(d.getTime())) {
        if (fallbackCreationTime) {
            d = new Date(fallbackCreationTime);
        }
    }

    if (!d || isNaN(d.getTime())) {
        return String(val || "-");
    }

    return d.toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// 한국 시간 기준 금월 1일 (YYYY-MM-01)
export function getKSTFirstDayOfMonth(): string {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now).split("-");
    return `${parts[0]}-${parts[1]}-01`;
}

// 한국 시간 기준 전월 1일 및 말일
export function getKSTLastMonthRange(): { start: string; end: string } {
    const now = new Date();
    const kstStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
    const [yearStr, monthStr] = kstStr.split("-");
    let year = parseInt(yearStr);
    let month = parseInt(monthStr) - 1; // 전월

    if (month === 0) {
        month = 12;
        year -= 1;
    }

    const startMonthStr = String(month).padStart(2, "0");
    const start = `${year}-${startMonthStr}-01`;

    // 해당 월의 마지막 날짜 계산
    const lastDayNum = new Date(year, month, 0).getDate();
    const end = `${year}-${startMonthStr}-${String(lastDayNum).padStart(2, "0")}`;

    return { start, end };
}

// 한국 시간 기준 N개월 전 1일
export function getKSTMonthsAgoDateString(monthsAgo: number): string {
    const now = new Date();
    const kstStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
    const [yearStr, monthStr, dayStr] = kstStr.split("-");
    let year = parseInt(yearStr);
    let month = parseInt(monthStr) - monthsAgo;

    while (month <= 0) {
        month += 12;
        year -= 1;
    }

    const mStr = String(month).padStart(2, "0");
    return `${year}-${mStr}-${dayStr}`;
}
