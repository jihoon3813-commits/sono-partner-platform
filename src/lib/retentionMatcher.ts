/**
 * 연체관리 / 연체관리(8월이후) 엑셀 업로드 자료 기반 고객 및 파트너 매칭 유틸리티
 * 
 * 엑셀 형식:
 * - 고객명: 마스킹 형태 (예: 김*훈, 이*금, 김*)
 * - 휴대전화: 끝 2자리 마스킹 (예: 010-****-**18, 010-****-**02, 010-****-3716, **18)
 * - 생년월일: 공란이거나 마스킹 형태
 */

export function extractPhoneSuffix(phone: string | undefined | null): string {
    if (!phone) return "";
    const trimmed = String(phone).trim();
    if (trimmed.includes('*')) {
        const lastStarIdx = trimmed.lastIndexOf('*');
        return trimmed.slice(lastStarIdx + 1).replace(/[^0-9]/g, '');
    }
    return trimmed.replace(/[^0-9]/g, '');
}

export function matchPhone(excelPhone: string | undefined | null, appPhone: string | undefined | null): boolean {
    if (!excelPhone || !appPhone) return false;
    const cleanAppDigits = String(appPhone).replace(/[^0-9]/g, '');
    if (!cleanAppDigits) return false;

    const trimmedExcel = String(excelPhone).trim();
    
    // 마스킹(*)이 없는 경우
    if (!trimmedExcel.includes('*')) {
        const cleanExcelDigits = trimmedExcel.replace(/[^0-9]/g, '');
        if (cleanExcelDigits.length >= 9) return cleanAppDigits === cleanExcelDigits;
        if (cleanExcelDigits.length >= 2) return cleanAppDigits.endsWith(cleanExcelDigits);
        return false;
    }

    // 마스킹(*)이 있는 경우: 마지막 '*' 뒤의 숫자(끝 2자리 또는 끝 4자리)를 suffix로 확인
    const lastStarIdx = trimmedExcel.lastIndexOf('*');
    const suffix = trimmedExcel.slice(lastStarIdx + 1).replace(/[^0-9]/g, '');
    const firstStarIdx = trimmedExcel.indexOf('*');
    const prefix = trimmedExcel.slice(0, firstStarIdx).replace(/[^0-9]/g, '');

    // suffix는 최소 2자리 이상이어야 함 (예: '18', '02', '3716')
    if (suffix.length < 2) return false;
    if (!cleanAppDigits.endsWith(suffix)) return false;

    // 접두부(010, 011 등)가 2자리 이상 명시된 경우 접두부 일치 확인
    if (prefix.length >= 2 && !cleanAppDigits.startsWith(prefix)) return false;

    return true;
}

export function matchCustomerName(excelName: string | undefined | null, appName: string | undefined | null): boolean {
    if (!excelName || !appName) return false;
    const cleanExcel = String(excelName).replace(/\s+/g, '').trim();
    const cleanApp = String(appName).replace(/\s+/g, '').trim();

    if (!cleanExcel || !cleanApp) return false;
    if (cleanExcel === cleanApp) return true;

    if (cleanExcel.includes('*') || cleanApp.includes('*')) {
        // 동일 길이 마스킹 대조 (예: 김*훈 vs 김지훈, 이*금 vs 이나금)
        if (cleanExcel.length === cleanApp.length) {
            for (let i = 0; i < cleanExcel.length; i++) {
                const c1 = cleanExcel[i];
                const c2 = cleanApp[i];
                if (c1 !== '*' && c2 !== '*' && c1 !== c2) return false;
            }
            return true;
        }

        // 2글자 마스킹 대조 (예: 김* vs 김지훈, *순 vs 이순)
        if (cleanExcel.length === 2 && cleanExcel[1] === '*') return cleanApp.startsWith(cleanExcel[0]);
        if (cleanExcel.length === 2 && cleanExcel[0] === '*') return cleanApp.endsWith(cleanExcel[1]);
        if (cleanApp.length === 2 && cleanApp[1] === '*') return cleanExcel.startsWith(cleanApp[0]);
        if (cleanApp.length === 2 && cleanApp[0] === '*') return cleanExcel.endsWith(cleanApp[1]);
    }
    return false;
}

export function computeMatchScore(record: any, app: any): number {
    let score = 0;
    const rawExcelPhone = (record?.phone || "").trim();
    const excelPhoneSuffix = extractPhoneSuffix(rawExcelPhone);

    // 1. 전화번호 일치 정밀도
    if (excelPhoneSuffix.length >= 4) {
        score += 40;
    } else if (excelPhoneSuffix.length >= 2) {
        score += 20;
    }

    // 2. 고객명 일치 정밀도
    const cleanExcelName = (record?.customerName || "").replace(/\s+/g, '');
    const cleanAppName = (app?.customerName || "").replace(/\s+/g, '');
    if (cleanExcelName === cleanAppName) {
        score += 30;
    } else if (cleanExcelName.length === cleanAppName.length) {
        score += 20;
    } else {
        score += 10;
    }

    // 3. 상품명 유사도
    const excelProd = (record?.productName || "").replace(/\s+/g, '').toLowerCase();
    const appProd = (app?.products || app?.productType || app?.planType || "").replace(/\s+/g, '').toLowerCase();
    if (excelProd && appProd && (excelProd.includes(appProd) || appProd.includes(excelProd))) {
        score += 15;
    }

    // 4. 가입일자 및 등록일자 연/월 근접도
    if (record?.joinDate && (app?.createdAt || app?.registrationDate || app?.contractDate)) {
        const appDateStr = (app.registrationDate || app.contractDate || app.createdAt || "").slice(0, 10).replace(/[^0-9]/g, '');
        const excelDateStr = (record.joinDate || "").slice(0, 10).replace(/[^0-9]/g, '');
        if (appDateStr && excelDateStr && appDateStr.slice(0, 6) === excelDateStr.slice(0, 6)) {
            score += 10;
        }
    }

    return score;
}

export function createApplicationBucketMap(applications: any[]): Map<string, any[]> {
    const map = new Map<string, any[]>();
    if (!applications) return map;

    for (const app of applications) {
        if (!app.customerPhone) continue;
        const digits = String(app.customerPhone).replace(/[^0-9]/g, '');
        if (digits.length < 2) continue;
        const last2 = digits.slice(-2);
        if (!map.has(last2)) map.set(last2, []);
        map.get(last2)!.push(app);
    }
    return map;
}

export function findBestMatchingApplication(
    record: any,
    applications: any[],
    bucketMap?: Map<string, any[]>
): any | null {
    if (!record || !applications || applications.length === 0) return null;
    const suffix = extractPhoneSuffix(record.phone);
    let candidates = applications;
    if (bucketMap && suffix.length >= 2) {
        candidates = bucketMap.get(suffix.slice(-2)) || [];
    }

    const matches = candidates.filter(app => {
        if (!app.customerName || !app.customerPhone) return false;
        return matchCustomerName(record.customerName, app.customerName) && matchPhone(record.phone, app.customerPhone);
    });

    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0];

    return [...matches].sort((a, b) => {
        const scoreB = computeMatchScore(record, b);
        const scoreA = computeMatchScore(record, a);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const timeA = a._creationTime || a.createdAt || a.appliedAt || 0;
        const timeB = b._creationTime || b.createdAt || b.appliedAt || 0;
        return timeA - timeB;
    })[0];
}
