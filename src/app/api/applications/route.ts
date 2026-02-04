import { NextResponse } from 'next/server';
import {
    createApplication,
    getAllApplications,
    getApplicationsByPartnerId,
    getPartnerById,
    getPartnerByLoginId,
    getPartnerByCustomUrl
} from '@/lib/db';

// 고객 신청 생성
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            partnerId,
            partnerName,
            productType,
            planType,
            name,
            birthdate,
            gender,
            phone,
            email,
            zipcode,
            address,
            addressDetail,
            partnerId: partnerMemberId,
            preferredTime,
            inquiry,
            products,
        } = body;

        // 필수 필드 검증
        if (!partnerId || !productType || !name || !phone) {
            return NextResponse.json(
                { success: false, message: '필수 정보가 누락되었습니다.' },
                { status: 400 }
            );
        }

        // 파트너 확인 (ID 또는 커스텀 URL로 검색)
        let partner = await getPartnerById(partnerId);
        if (!partner) {
            // partnerId라는 이름으로 넘어왔지만 사실상 customUrl(예: lifenjoy)인 경우 대비
            partner = await getPartnerByLoginId(partnerId);
            if (!partner) {
                partner = await getPartnerByCustomUrl(partnerId);
            }
        }

        // 데모 계정 예외 처리 (DB에 없을 경우)
        if (!partner && partnerId.startsWith('P-DEMO')) {
            partner = {
                partnerId: partnerId,
                companyName: partnerName || '데모 파트너',
                status: 'active',
                customUrl: 'demo'
            } as any;
        }

        if (!partner || partner.status !== 'active') {
            console.error('[API] Partner not found or inactive for ID:', partnerId);
            return NextResponse.json(
                { success: false, message: '유효하지 않은 파트너입니다.' },
                { status: 400 }
            );
        }

        // DB 저장을 위한 실제 파트너 ID 사용
        const dbPartnerId = partner.partnerId;

        // 신청 데이터 생성
        const appData = {
            partnerId: dbPartnerId,
            partnerName: partnerName || partner.companyName || '-',
            productType,
            planType: planType || '-',
            products: products || '',
            customerName: name,
            customerBirth: birthdate || '',
            customerGender: gender || '-',
            customerPhone: phone,
            customerEmail: email || '',
            customerAddress: `${address || ''} ${addressDetail || ''}`.trim(),
            customerZipcode: zipcode || '',
            partnerMemberId: partnerId || '',
            preferredContactTime: preferredTime || '',
            inquiry: inquiry || '',
            status: '접수',
            assignedTo: '',
        };
        console.log('[API] Creating application with data:', JSON.stringify(appData, null, 2));

        const application = await createApplication(appData as any);

        // TODO: SMS 발송, 이메일 발송

        return NextResponse.json({
            success: true,
            data: {
                applicationNo: application.applicationNo,
            },
            message: '신청이 완료되었습니다.',
        });
    } catch (error) {
        console.error('Application creation error:', error);

        // Google Sheets 연결 에러인 경우
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

// 신청 목록 조회 (관리자용)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('partnerId');

        let applications;

        if (partnerId) {
            applications = await getApplicationsByPartnerId(partnerId);
        } else {
            applications = await getAllApplications();
        }

        return NextResponse.json({
            success: true,
            data: applications,
        });
    } catch (error) {
        console.error('Applications fetch error:', error);
        return NextResponse.json(
            { success: false, message: '데이터 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
