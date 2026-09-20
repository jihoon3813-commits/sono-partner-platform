/**
 * 소노아임레디(THEHAPPYONE) 웹 접수 연동 서비스
 * 대상 사이트: https://direct.sonoimready.com/THEHAPPYONE/write
 */

export interface SonoRegisterInput {
    customerName: string;
    customerPhone: string;
    authCode?: string; // 파트너별 인증코드 (기본 fallback: 'BIZI0012')
    orderQty?: string | number; // 구좌수 (1, 2, 3) 기본 1
    preferredContactTime?: string; // 희망 통화 시간
    partnerName?: string;
    inquiry?: string;
    memo?: string;
    sellerName?: string; // 판매사원 성명 (기본: 김지훈)
    sellerPhone?: string; // 판매자 연락처 (기본: 01043223813)
    sellerBirthDay?: string; // 판매자 생년월일 8자리 (기본: 19811115)
}

export interface SonoRegisterResult {
    success: boolean;
    status: 'SUCCESS' | 'DUPLICATE' | 'FAILED';
    code: number;
    message: string;
    agentNm?: string;
    authCodeUsed: string;
    timestamp: string;
}

// 통화 요청 날짜 및 시간 계산 헬퍼
function getCallDateAndTime(preferredTime?: string) {
    // 한국 표준시 (KST) 기준 날짜 계산
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kst = new Date(utc + (9 * 60 * 60000));

    const currentHour = kst.getHours();
    
    // 기본 날짜는 오늘(17시 이전) 또는 내일(17시 이후)
    let targetDate = new Date(kst);
    if (currentHour >= 17) {
        targetDate.setDate(targetDate.getDate() + 1);
    }
    
    // 일요일(0)이면 월요일(+1), 토요일(6)이면 월요일(+2)
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

    // 가능한 옵션들
    const validTimes = [
        "10:00 ~ 11:00",
        "11:00 ~ 12:00",
        "14:00 ~ 15:00",
        "15:00 ~ 16:00",
        "16:00 ~ 17:00",
        "17:00 ~ 18:00"
    ];

    let callTime = "10:00 ~ 11:00"; // 기본값
    if (preferredTime) {
        const matched = validTimes.find(t => preferredTime.includes(t.substring(0, 5)) || preferredTime.includes(t.substring(8, 13)));
        if (matched) {
            callTime = matched;
        } else if (preferredTime.includes("오후") || preferredTime.includes("14") || preferredTime.includes("15")) {
            callTime = "14:00 ~ 15:00";
        } else if (preferredTime.includes("16") || preferredTime.includes("17")) {
            callTime = "16:00 ~ 17:00";
        }
    }

    return { callDate, callTime };
}

export async function registerToSonoImready(input: SonoRegisterInput): Promise<SonoRegisterResult> {
    const authCode = (input.authCode || 'BIZI0012').trim();
    const sellerName = input.sellerName || '김지훈';
    const sellerPhone = (input.sellerPhone || '01043223813').replace(/[^0-9]/g, '');
    const sellerBirthDay = (input.sellerBirthDay || '19811115').replace(/[^0-9]/g, '');

    const cleanCustomerName = (input.customerName || '').trim();
    const cleanCustomerPhone = (input.customerPhone || '').replace(/[^0-9]/g, '');

    const nowIso = new Date(Date.now() + 9 * 3600000).toISOString().replace('Z', '+09:00');

    if (!cleanCustomerName) {
        return {
            success: false,
            status: 'FAILED',
            code: -99,
            message: '고객명이 누락되었습니다.',
            authCodeUsed: authCode,
            timestamp: nowIso
        };
    }

    if (!cleanCustomerPhone || cleanCustomerPhone.length < 10) {
        return {
            success: false,
            status: 'FAILED',
            code: -99,
            message: '고객 연락처가 올바르지 않습니다.',
            authCodeUsed: authCode,
            timestamp: nowIso
        };
    }

    try {
        // Step 1: 웹 접수 페이지 로드하여 세션 쿠키 및 _c5r7t 토큰 획득
        const pageRes = await fetch('https://direct.sonoimready.com/THEHAPPYONE/write', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            cache: 'no-store'
        });

        if (!pageRes.ok) {
            throw new Error(`페이지 접속 실패 (HTTP ${pageRes.status})`);
        }

        // 쿠키 추출
        const setCookieHeaders = pageRes.headers.getSetCookie 
            ? pageRes.headers.getSetCookie() 
            : [pageRes.headers.get('set-cookie') || ''];
        
        const cookieMap = new Map<string, string>();
        setCookieHeaders.forEach(header => {
            if (!header) return;
            header.split(';').forEach(part => {
                const [key, ...val] = part.trim().split('=');
                if (key && val.length > 0 && !['path', 'domain', 'expires', 'httponly', 'samesite'].includes(key.toLowerCase())) {
                    cookieMap.set(key, val.join('='));
                }
            });
        });

        const cookieStr = Array.from(cookieMap.entries()).map(([k, v]) => `${k}=${v}`).join('; ');

        const html = await pageRes.text();
        const tokenMatch = html.match(/name="_c5r7t"\s+value="([^"]+)"/);
        if (!tokenMatch || !tokenMatch[1]) {
            throw new Error('보안 토큰(_c5r7t)을 찾을 수 없습니다.');
        }
        const c5r7t = tokenMatch[1];

        const commonHeaders = {
            'Content-Type': 'application/json',
            'C5R7T': c5r7t,
            'Cookie': cookieStr,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://direct.sonoimready.com/THEHAPPYONE/write',
            'Origin': 'https://direct.sonoimready.com'
        };

        // Step 2: 소속 인증코드 확인 (selectAuthCode)
        const authRes = await fetch('https://direct.sonoimready.com/service/product/selectAuthCode', {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({
                b2bStts: 'THEHAPPYONE',
                b2bNm: '더해피원',
                oscCd: 'THEHAPPYONE',
                authCd: authCode
            })
        });

        if (!authRes.ok) {
            throw new Error(`소속 인증 요청 실패 (HTTP ${authRes.status})`);
        }

        const authJson = await authRes.json();
        if (!authJson.data || !authJson.data.result) {
            return {
                success: false,
                status: 'FAILED',
                code: -10,
                message: `유효하지 않은 소노접수 인증코드입니다: ${authCode}`,
                authCodeUsed: authCode,
                timestamp: nowIso
            };
        }

        const sllrPart = authJson.data.agentNm || '더해피원';

        // Step 3: 판매사원 정보 확인 (selectAgentInfo)
        const agentRes = await fetch('https://direct.sonoimready.com/service/product/selectAgentInfo', {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify({
                name: sellerName,
                hp: sellerPhone,
                birthDay: sellerBirthDay,
                empNum: '',
                agentNum: '',
                ci: ''
            })
        });

        if (!agentRes.ok) {
            throw new Error(`판매사원 검증 요청 실패 (HTTP ${agentRes.status})`);
        }

        const agentJson = await agentRes.json();
        if (!agentJson.data || agentJson.data.result !== 1) {
            return {
                success: false,
                status: 'FAILED',
                code: -20,
                message: `판매자 정보 검증 실패 (성명: ${sellerName}, 결과코드: ${agentJson.data?.result ?? 'null'})`,
                authCodeUsed: authCode,
                timestamp: nowIso
            };
        }

        // Step 4: 고객 상담 데이터 전송 (insertConsultData)
        const { callDate, callTime } = getCallDateAndTime(input.preferredContactTime);
        const orderQty = String(input.orderQty || '1');

        let memoText = '';
        if (input.partnerName) {
            memoText += `[${input.partnerName}] `;
        }
        if (input.inquiry) {
            memoText += input.inquiry;
        }
        if (input.memo) {
            memoText += ` ${input.memo}`;
        }
        memoText = memoText.trim().substring(0, 240);

        const consultPayload = {
            b2bStts: 'THEHAPPYONE',
            b2bCd: '',
            b2bNm: '더해피원',
            isDuplicate: 'true',
            sllrPart: sllrPart,
            agentEmpNm: sellerName,
            sllrCtel: sellerPhone,
            birthDay: sellerBirthDay,
            name: cleanCustomerName,
            hp: cleanCustomerPhone,
            callDate: callDate,
            callTime: callTime,
            joinType: '2', // 전자계약
            orderQty: orderQty,
            prdctCd: 'THEHAPPYONE1',
            prdctNm: '더해피 450 ONE_R1',
            memo: memoText,
            agree: 'on'
        };

        const consultRes = await fetch('https://direct.sonoimready.com/service/product/insertConsultData', {
            method: 'POST',
            headers: commonHeaders,
            body: JSON.stringify(consultPayload)
        });

        if (!consultRes.ok) {
            throw new Error(`상담 접수 전송 실패 (HTTP ${consultRes.status})`);
        }

        const consultJson = await consultRes.json();
        const resultCode = consultJson.data;

        if (resultCode === 1) {
            return {
                success: true,
                status: 'SUCCESS',
                code: 1,
                message: '소노아임레디 상담 신청이 정상 완료되었습니다.',
                agentNm: sllrPart,
                authCodeUsed: authCode,
                timestamp: nowIso
            };
        } else if (resultCode === -2) {
            return {
                success: true,
                status: 'DUPLICATE',
                code: -2,
                message: '오늘 이미 접수된 고객입니다. (중복 접수)',
                agentNm: sllrPart,
                authCodeUsed: authCode,
                timestamp: nowIso
            };
        } else {
            return {
                success: false,
                status: 'FAILED',
                code: typeof resultCode === 'number' ? resultCode : -1,
                message: `소노아임레디 접수 처리 실패 (응답코드: ${resultCode})`,
                agentNm: sllrPart,
                authCodeUsed: authCode,
                timestamp: nowIso
            };
        }

    } catch (err: any) {
        console.error('[SonoService Error]', err);
        return {
            success: false,
            status: 'FAILED',
            code: -500,
            message: `소노아임레디 통신 중 오류: ${err.message || String(err)}`,
            authCodeUsed: authCode,
            timestamp: nowIso
        };
    }
}
