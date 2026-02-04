import { NextResponse } from 'next/server';
import { getPartnerByCustomUrl } from '@/lib/db';

// 파트너 정보 조회 (공개용 - 전용 페이지용)
export async function GET(
    request: Request,
    { params }: { params: Promise<{ partnerId: string }> }
) {
    try {
        const { partnerId } = await params;
        console.log(`[API] Fetching public partner data for: ${partnerId}`);

        const partner = await getPartnerByCustomUrl(partnerId);
        console.log(`[API] Partner search result: ${partner ? 'Found' : 'Not Found'}`);

        if (!partner || partner.status !== 'active') {
            return NextResponse.json(
                { success: false, message: '파트너를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 공개 정보만 반환 (민감 정보 제외)
        const publicPartner = {
            partnerId: partner.partnerId,
            name: partner.companyName,
            customUrl: partner.customUrl,
            logoUrl: partner.logoUrl,
            logoText: partner.logoText,
            landingTitle: partner.landingTitle,
            pointInfo: partner.pointInfo,
            brandColor: partner.brandColor,
        };

        return NextResponse.json({
            success: true,
            data: publicPartner,
        });
    } catch (error) {
        console.error('Partner fetch error:', error);
        return NextResponse.json(
            { success: false, message: '데이터 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
