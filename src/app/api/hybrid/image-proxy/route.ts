import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get("fileUrl");

        if (!fileUrl) {
            return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
        }

        const externalImgUrl = `https://www.sonoimready.com/service/file/fileView?fileUrl=${encodeURIComponent(fileUrl)}`;
        
        const res = await fetch(externalImgUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Referer': 'https://www.sonoimready.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch image from host" }, { status: res.status });
        }

        let contentType = res.headers.get("content-type");
        if (!contentType || contentType === "application/octet-stream" || contentType.includes("text/html")) {
            const lower = fileUrl.toLowerCase();
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".gif")) contentType = "image/gif";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else if (lower.endsWith(".svg")) contentType = "image/svg+xml";
            else contentType = "image/jpeg";
        }

        const buffer = await res.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"
            }
        });
    } catch (error: any) {
        console.error("Image proxy error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
