import { NextResponse } from 'next/server';
import { updateApplicationStatus } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, memo, statusUpdatedAt } = await body_json(request);

        if (!status) {
            return NextResponse.json(
                { success: false, message: '변경할 상태값이 필요합니다.' },
                { status: 400 }
            );
        }

        // 실제로는 세션에서 관리자 정보를 가져와야 함
        const changedBy = 'admin';

        const success = await updateApplicationStatus(id, status, changedBy, memo, statusUpdatedAt);

        if (success) {
            return NextResponse.json({
                success: true,
                message: '상태가 변경되었습니다.',
            });
        } else {
            return NextResponse.json(
                { success: false, message: '신청 내역을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Status update error:', error);
        return NextResponse.json(
            { success: false, message: '처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

async function body_json(request: Request) {
    try {
        return await request.json();
    } catch {
        return {};
    }
}
