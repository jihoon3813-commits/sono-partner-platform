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
        const pId = partner.partnerId;
        const pLogin = partner.loginId;
        const pComp = partner.companyName?.trim();
        const pCleanComp = pComp ? pComp.replace(/\(주\)/g, '').trim() : "";

        const myPartners = allPartners.filter(p => {
            if (p.partnerId === partnerId || p.loginId === partnerId) return true;
            const matchId = (pId && p.parentPartnerId === pId) || (pLogin && p.parentPartnerId === pLogin);
            const subParentName = p.parentPartnerName ? p.parentPartnerName.trim() : "";
            const subCleanName = subParentName.replace(/\(주\)/g, '').trim();
            const matchName = (pComp && subParentName && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) ||
                                    (pCleanComp && subCleanName && (subCleanName === pCleanComp || subCleanName.includes(pCleanComp) || pCleanComp.includes(subCleanName)));
            return matchId || matchName;
        });

        // 고객 데이터 조회를 위한 ID 목록 구성 (본인 + 하위 파트너들의 ID, LoginID, 회사명)
        const validIds: string[] = [];
        const validComps: string[] = [];
        myPartners.forEach(p => {
            if (p.partnerId) validIds.push(p.partnerId);
            if (p.loginId) validIds.push(p.loginId);
            if (p.companyName) validComps.push(p.companyName.trim());
        });

        const allApplications = await getAllApplications();
        const partnerApplications = allApplications
            .filter(app => {
                if (app.partnerId && validIds.includes(app.partnerId)) return true;
                if (app.partnerName) {
                    const appComp = app.partnerName.trim();
                    for (const comp of validComps) {
                        if (appComp === comp || appComp.includes(comp) || comp.includes(appComp)) return true;
                    }
                }
                return false;
            })
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
