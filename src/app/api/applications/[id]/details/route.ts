import { NextResponse } from 'next/server';
import { updateApplicationDetails } from '@/lib/db';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const updates = await request.json();

        const success = await updateApplicationDetails(id, updates);

        if (success) {
            return NextResponse.json({
                success: true,
                message: '정보가 수정되었습니다.',
            });
        } else {
            return NextResponse.json(
                { success: false, message: '신청 내역을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }
    } catch (error: any) {
        console.error('Details update error:', error);
        return NextResponse.json(
            { success: false, message: error.message || '처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
