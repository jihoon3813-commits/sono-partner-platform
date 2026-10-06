/**
 * 소노아임레디 통화 요청 일시 계산 및 희망시간 파싱 유틸리티
 */

export const VALID_CALL_TIMES = [
    "10:00 ~ 11:00",
    "11:00 ~ 12:00",
    "14:00 ~ 15:00",
    "15:00 ~ 16:00",
    "16:00 ~ 17:00",
    "17:00 ~ 18:00"
] as const;

/**
 * 고객이 입력/선택한 preferredTime(예: "17:00~18:00", "5시~6시", "16:00~17:00", "오후 2시")을
 * 소노 전산 규격("HH:00 ~ HH:00")에 정확히 매핑합니다.
 */
export function parsePreferredTimeToCallTime(preferredTime?: string): string {
    if (!preferredTime || typeof preferredTime !== 'string') {
        return "10:00 ~ 11:00";
    }

    const clean = preferredTime.replace(/\s+/g, '');

    // 1단계: 정확한 구간 문자열 매칭 (공백 제거 상태)
    if (clean.includes("17:00~18:00") || clean.includes("17시~18시") || clean.includes("5시~6시")) {
        return "17:00 ~ 18:00";
    }
    if (clean.includes("16:00~17:00") || clean.includes("16시~17시") || clean.includes("4시~5시")) {
        return "16:00 ~ 17:00";
    }
    if (clean.includes("15:00~16:00") || clean.includes("15시~16시") || clean.includes("3시~4시")) {
        return "15:00 ~ 16:00";
    }
    if (clean.includes("14:00~15:00") || clean.includes("14시~15시") || clean.includes("2시~3시")) {
        return "14:00 ~ 15:00";
    }
    if (clean.includes("11:00~12:00") || clean.includes("11시~12시")) {
        return "11:00 ~ 12:00";
    }
    if (clean.includes("10:00~11:00") || clean.includes("10시~11시")) {
        return "10:00 ~ 11:00";
    }

    // 2단계: 시작 시간(첫 번째 시간) 추출 분석
    // 예: "17시 이후", "오후 5시", "17:00", "5시", "2시"
    const isPm = clean.includes("오후") || clean.toLowerCase().includes("pm");

    // 첫 번째 숫자를 시간(hour)으로 파싱
    const match = clean.match(/(\d{1,2})/);
    if (match) {
        let hour = parseInt(match[1], 10);
        // 12시간제 변환: 1~6시이고(오후이거나 일반적인 통화시간) -> 13~18시
        if (hour >= 1 && hour <= 6) {
            hour += 12;
        } else if (isPm && hour >= 7 && hour <= 11) {
            hour += 12;
        }

        if (hour >= 17) return "17:00 ~ 18:00";
        if (hour === 16) return "16:00 ~ 17:00";
        if (hour === 15) return "15:00 ~ 16:00";
        if (hour === 14 || hour === 12 || hour === 13) return "14:00 ~ 15:00";
        if (hour === 11) return "11:00 ~ 12:00";
        if (hour === 10) return "10:00 ~ 11:00";
    }

    if (isPm) return "14:00 ~ 15:00";
    if (clean.includes("오전")) return "10:00 ~ 11:00";

    return "10:00 ~ 11:00";
}

/**
 * 기본 통화 요청 날짜 및 시간 계산 (KST 기준)
 * 17시 이후 또는 주말인 경우 영업일로 날짜를 조정하고,
 * 고객의 희망시간을 파싱하여 기본 통화 시간을 반환합니다.
 */
export function getDefaultCallDateTime(preferredTime?: string) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (9 * 60 * 60000));

    const currentHour = kst.getHours();
    let targetDate = new Date(kst);
    if (currentHour >= 17) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    // 주말 처리 (토: +2일, 일: +1일 -> 월요일)
    const day = targetDate.getDay();
    if (day === 6) {
        targetDate.setDate(targetDate.getDate() + 2);
    } else if (day === 0) {
        targetDate.setDate(targetDate.getDate() + 1);
    }

    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const callDate = `${yyyy}-${mm}-${dd}`;

    const callTime = parsePreferredTimeToCallTime(preferredTime);

    return { callDate, callTime };
}
