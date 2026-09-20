import { NextResponse } from 'next/server';
import { searchPartners } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
        return NextResponse.json({ success: true, results: [] });
    }

    try {
        const results = await searchPartners(query);
        return NextResponse.json({
            success: true,
            results: results.map(p => ({
                partnerId: p.partnerId,
                companyName: p.companyName,
                ceoName: p.ceoName,
                sonoAuthCode: p.sonoAuthCode || ''
            }))
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ success: false, message: '검색 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
