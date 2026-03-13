import { NextResponse } from 'next/server';
import {
    getAllPartners,
    getPartnerById,
    updatePartner,
    getPendingPartnerRequests,
    approvePartnerRequest,
    rejectPartnerRequest,
} from '@/lib/db';

// 전체 파트너 목록 조회
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('id');

        if (partnerId) {
            const partner = await getPartnerById(partnerId);
            if (!partner) {
                return NextResponse.json(
                    { success: false, message: '파트너를 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }
            return NextResponse.json({ success: true, data: partner });
        }

        const partners = await getAllPartners();
        const pendingRequests = await getPendingPartnerRequests();

        return NextResponse.json({
            success: true,
            data: {
                partners,
                pendingRequests,
            },
        });
    } catch (error) {
        console.error('Partners fetch error:', error);
        return NextResponse.json(
            { success: false, message: '데이터 조회 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 파트너 정보 업데이트
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { partnerId, ...updates } = body;

        if (!partnerId) {
            return NextResponse.json(
                { success: false, message: '파트너 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        const success = await updatePartner(partnerId, updates);

        if (!success) {
            return NextResponse.json(
                { success: false, message: '파트너를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '파트너 정보가 업데이트되었습니다.',
        });
    } catch (error) {
        console.error('Partner update error:', error);
        return NextResponse.json(
            { success: false, message: '업데이트 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 파트너 신청 승인/거부
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, requestId, approvedBy, partnerData } = body;

        if (!action) {
            return NextResponse.json(
                { success: false, message: '액션이 지정되지 않았습니다.' },
                { status: 400 }
            );
        }

        // approve/reject 액션은 requestId 필요
        if ((action === 'approve' || action === 'reject') && !requestId) {
            return NextResponse.json(
                { success: false, message: '신청 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        if (action === 'approve') {
            if (!partnerData?.customUrl || !partnerData?.loginId || !partnerData?.loginPassword) {
                return NextResponse.json(
                    { success: false, message: '파트너 설정 정보가 필요합니다.' },
                    { status: 400 }
                );
            }

            const partner = await approvePartnerRequest(requestId, approvedBy, partnerData);

            if (!partner) {
                return NextResponse.json(
                    { success: false, message: '신청을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: '파트너가 승인되었습니다.',
                data: partner,
            });
        } else if (action === 'reject') {
            const success = await rejectPartnerRequest(requestId, approvedBy);

            if (!success) {
                return NextResponse.json(
                    { success: false, message: '신청을 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: '파트너 신청이 거부되었습니다.',
            });
        } else if (action === 'register') {
            // 어드민에서 직접 파트너 등록
            if (!partnerData?.companyName || !partnerData?.customUrl || !partnerData?.loginId || !partnerData?.loginPassword) {
                return NextResponse.json(
                    { success: false, message: '필수 정보가 누락되었습니다.' },
                    { status: 400 }
                );
            }

            const { createPartner } = await import('@/lib/db');

            const partner = await createPartner({
                companyName: partnerData.companyName,
                businessNumber: partnerData.businessNumber || '',
                ceoName: partnerData.ceoName || '',
                managerName: partnerData.managerName || '',
                managerPhone: partnerData.managerPhone || '',
                managerEmail: partnerData.managerEmail || '',
                shopUrl: partnerData.shopUrl || '',
                shopType: partnerData.shopType || '회원제 쇼핑몰',
                memberCount: partnerData.memberCount || '',
                customUrl: partnerData.customUrl,
                logoUrl: partnerData.logoUrl || '',
                logoText: partnerData.logoText || '',
                landingTitle: partnerData.landingTitle || '',
                pointInfo: partnerData.pointInfo || '',
                brandColor: partnerData.brandColor || '#1e3a5f',
                loginId: partnerData.loginId,
                loginPassword: partnerData.loginPassword,
                partnerGroup: partnerData.partnerGroup || '전체 상품 판매',
                status: 'active',
                parentPartnerId: partnerData.parentPartnerId || '',
                parentPartnerName: partnerData.parentPartnerName || '',
                approvedAt: new Date().toISOString().split('T')[0],
                approvedBy: partnerData.approvedBy || 'admin',
            });

            return NextResponse.json({
                success: true,
                message: '파트너가 등록되었습니다.',
                data: partner,
            });
        }

        return NextResponse.json(
            { success: false, message: '유효하지 않은 액션입니다.' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Partner action error:', error);
        return NextResponse.json(
            { success: false, message: '처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

// 파트너 삭제
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const partnerId = searchParams.get('id');

        if (!partnerId) {
            return NextResponse.json(
                { success: false, message: '파트너 ID가 필요합니다.' },
                { status: 400 }
            );
        }

        const { deletePartner } = await import('@/lib/db');
        const success = await deletePartner(partnerId);

        if (!success) {
            return NextResponse.json(
                { success: false, message: '파트너를 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '파트너가 삭제되었습니다.',
        });
    } catch (error) {
        console.error('Partner delete error:', error);
        return NextResponse.json(
            { success: false, message: '삭제 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
