import { NextResponse } from 'next/server';
import { createPartnerRequest } from '@/lib/db';

// 파트너 신청
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            companyName,
            businessNumber,
            ceoName,
            companyAddress,
            companyPhone,
            managerName,
            managerDepartment,
            managerPhone,
            managerEmail,
            // New Fields
            loginId,
            loginPassword,
            customUrl,

            shopType,
            shopUrl,
            monthlyVisitors,
            memberCount,
            mainProducts,
            expectedMonthlySales,
            pointRate,
            additionalRequest,
            parentPartnerId,
            parentPartnerName,
        } = body;

        // 필수 필드 검증 (Removed strict check for new fields to keep them optional if user wants, 
        // but UI will enforce them. Let's enforce them here too if they are "required" in UI.)
        if (!companyName || !businessNumber || !ceoName || !managerName || !managerPhone || !managerEmail || !shopType || !loginId || !loginPassword || !customUrl) {
            return NextResponse.json(
                { success: false, message: '필수 정보가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 신청 데이터 생성
        const partnerRequest = await createPartnerRequest({
            companyName,
            businessNumber,
            ceoName,
            companyAddress: companyAddress || '',
            companyPhone: companyPhone || '',
            managerName,
            managerDepartment: managerDepartment || '',
            managerPhone,
            managerEmail,
            // New Fields
            loginId,
            loginPassword,
            customUrl,

            shopType,
            shopUrl: shopUrl || '',
            monthlyVisitors: monthlyVisitors || '',
            memberCount: memberCount || '',
            mainProducts: mainProducts || '',
            expectedMonthlySales: expectedMonthlySales || '',
            pointRate: pointRate || '',
            additionalRequest: additionalRequest || '',
            parentPartnerId: parentPartnerId || '',
            parentPartnerName: parentPartnerName || '',
        });

        // TODO: 관리자 알림 이메일 발송, 신청자 확인 이메일 발송

        return NextResponse.json({
            success: true,
            data: {
                requestId: partnerRequest.requestId,
            },
            message: '파트너 신청이 완료되었습니다.',
        });
    } catch (error) {
        console.error('Partner application error:', error);

        if (error instanceof Error && error.message.includes('환경변수')) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: '신청 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
