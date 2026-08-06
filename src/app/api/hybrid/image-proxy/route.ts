import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get("fileUrl");

        if (!fileUrl) {
            return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
        }

        const externalImgUrl = `https://www.sonoimready.com/service/file/fileView?fileUrl=${fileUrl}`;
        
        // 소노아임레디 서버에 Referer 헤더를 속여서 이미지 데이터를 요청합니다.
        const res = await fetch(externalImgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Referer': 'https://www.sonoimready.com/front/sc/chgServList?prdctCd=%ED%81%AC%EB%A3%A8%EC%A6%88',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch image from host" }, { status: res.status });
        }

        const contentType = res.headers.get("content-type") || "image/jpeg";
        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, must-revalidate" // 하루 동안 이미지 브라우저 캐싱 적용
            }
        });
    } catch (error: any) {
        console.error("Image proxy error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
