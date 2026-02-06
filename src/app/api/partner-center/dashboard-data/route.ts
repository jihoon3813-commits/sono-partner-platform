import { NextResponse } from 'next/server';
import { getAllPartners, getAllApplications, getPendingPartnerRequests, getPartnerById, getPartnerByLoginId, getPartnerByCustomUrl } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('partnerId');

        if (!partnerId) {
            return NextResponse.json({ success: false, message: 'Partner ID is required' }, { status: 400 });
        }

        const isAdmin = partnerId === 'admin' || partnerId.startsWith('ADMIN');

        if (isAdmin) {
            const [partners, customers, pendingRequests] = await Promise.all([
                getAllPartners(),
                getAllApplications(),
                getPendingPartnerRequests()
            ]);

            return NextResponse.json({
                success: true,
                isAdmin: true,
                customers: customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
                partners: partners,
                pendingRequests: pendingRequests
            });
        }
        // 일반 파트너인 경우
        // partnerId 또는 loginId/customUrl로 파트너 검색
        let partner = await getPartnerById(partnerId);
        if (!partner) {
            partner = await getPartnerByLoginId(partnerId);
            if (!partner) {
                partner = await getPartnerByCustomUrl(partnerId);
            }
        }

        if (!partner) {
            return NextResponse.json({ success: false, message: 'Partner not found' }, { status: 404 });
        }

        // 파트너 계층 구조 조회 (본인 + 하위 파트너)
        const allPartners = await getAllPartners();
        const myPartners = allPartners.filter(p => p.partnerId === partnerId || p.parentPartnerId === partnerId);

        // 고객 데이터 조회를 위한 ID 목록 구성 (본인 + 하위 파트너들의 ID 및 LoginID)
        const validIds: string[] = [];
        myPartners.forEach(p => {
            if (p.partnerId) validIds.push(p.partnerId);
            if (p.loginId) validIds.push(p.loginId);
        });

        const allApplications = await getAllApplications();
        const partnerApplications = allApplications
            .filter(app => validIds.includes(app.partnerId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            isAdmin: false,
            customers: partnerApplications,
            partners: myPartners,
            pendingRequests: []
        });
    } catch (error: any) {
        console.error('Dashboard data error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
