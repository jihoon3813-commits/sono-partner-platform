import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || '자료';

    if (!url) {
        return new NextResponse("URL is required", { status: 400 });
    }

    try {
        console.log(`Proxying download: ${url} as ${filename}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const data = await response.arrayBuffer();
        const contentType = response.headers.get("Content-Type") || "application/octet-stream";

        // Determine extension if not in filename
        let finalFilename = filename;
        if (!filename.includes('.')) {
            const ext = url.split('.').pop()?.split('?')[0];
            if (ext && ext.length < 5) {
                finalFilename = `${filename}.${ext}`;
            }
        }

        return new NextResponse(data, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(finalFilename)}`,
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error("Download proxy error:", error);
        return new NextResponse("Failed to download file", { status: 500 });
    }
}
