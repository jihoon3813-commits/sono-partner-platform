import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'API is working',
        time: new Date().toISOString(),
        env: {
            convexUrl: !!process.env.NEXT_PUBLIC_CONVEX_URL
        }
    });
}
