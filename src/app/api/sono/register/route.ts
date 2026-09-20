import { NextResponse } from 'next/server';
import { getApplicationByNo, getEffectiveSonoAuthCode, updateSonoRegisterStatus } from '@/lib/db';
import { registerToSonoImready } from '@/lib/sonoService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            applicationNo, 
            authCode: customAuthCode,
            callDate,
            callTime,
            orderQty,
            memo
        } = body;

        if (!applicationNo) {
            return NextResponse.json(
                { success: false, message: '신청 번호(applicationNo)가 필요합니다.' },
                { status: 400 }
            );
        }

        // 1. 고객 신청 정보 조회
        const app = await getApplicationByNo(applicationNo);
        if (!app) {
            return NextResponse.json(
                { success: false, message: `신청 내역을 찾을 수 없습니다: ${applicationNo}` },
                { status: 404 }
            );
        }

        // 2. 소노 인증코드 결정: 전달된 커스텀 코드가 없으면 상위 파트너 체인 탐색
        let authCode = customAuthCode;
        if (!authCode || authCode.trim() === '') {
            authCode = await getEffectiveSonoAuthCode(app.partnerId || app.partnerName || '');
        }

        // 3. 소노아임레디 등록 서비스 호출
        const sonoResult = await registerToSonoImready({
            customerName: app.customerName,
            customerPhone: app.customerPhone,
            authCode: authCode,
            orderQty: orderQty || 1,
            preferredContactTime: app.preferredContactTime,
            callDate: callDate,
            callTime: callTime,
            partnerName: app.partnerName,
            inquiry: app.inquiry,
            memo: memo !== undefined ? memo : app.remarks,
        });

        // 4. 결과를 DB에 저장
        await updateSonoRegisterStatus(
            applicationNo,
            sonoResult.status,
            sonoResult.message,
            sonoResult.authCodeUsed,
            sonoResult.timestamp
        );

        return NextResponse.json({
            success: sonoResult.success,
            status: sonoResult.status,
            code: sonoResult.code,
            message: sonoResult.message,
            agentNm: sonoResult.agentNm,
            authCodeUsed: sonoResult.authCodeUsed,
            timestamp: sonoResult.timestamp
        });

    } catch (error: any) {
        console.error('[API Sono Register Error]', error);
        return NextResponse.json(
            { 
                success: false, 
                message: `등록 처리 중 오류가 발생했습니다: ${error.message || String(error)}` 
            },
            { status: 500 }
        );
    }
}
