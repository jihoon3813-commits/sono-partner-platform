import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const resolvedParams = await params;
        const category = decodeURIComponent(resolvedParams.category);
        const url = new URL(request.url);
        url.pathname = "/api/hybrid";
        url.searchParams.set("category", category);
        
        return NextResponse.redirect(url);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
