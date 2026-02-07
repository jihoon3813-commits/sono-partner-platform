import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import * as XLSX from "xlsx";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const isAdmin = type === 'admin';
    const filename = isAdmin ? 'customer_template_admin.xlsx' : 'customer_template.xlsx';

    try {
        console.log("Checking template configuration...");
        // 1. Convex에서 설정된 템플릿 파일 URL 조회
        const key = isAdmin ? "admin_template_url" : "standard_template_url";
        let fileUrl = null;
        try {
            fileUrl = await convex.query(api.settings.getTemplateUrl, { key });
        } catch (e) {
            console.error("Convex query failed:", e);
        }

        if (fileUrl) {
            console.log(`Downloading template from Convex URL: ${fileUrl}`);
            // 2. 파일 URL에서 데이터 가져오기 (Server-to-Server Fetch는 CORS 문제 없음)
            const fileResponse = await fetch(fileUrl);

            if (fileResponse.ok) {
                const fileBuffer = await fileResponse.arrayBuffer();

                // 3. 클라이언트로 전달 (Proxy Response)
                return new NextResponse(fileBuffer, {
                    status: 200,
                    headers: {
                        'Content-Disposition': `attachment; filename="${filename}"`,
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'Content-Length': fileBuffer.byteLength.toString(),
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                    },
                });
            } else {
                console.warn("Failed to fetch file from Convex URL, falling back to generation.");
            }
        } else {
            console.log("No template URL configured, using fallback generation.");
        }

        // --- Fallback: 설정된 파일이 없거나 fetch 실패 시 직접 생성하여 반환 ---

        const standardHeaders = [
            "고객명 *",
            "연락처(010-xxxx-xxxx) *",
            "생년월일(YYYY-MM-DD) *",
            "성별(남/여) *",
            "주소 *",
            "상세주소",
            "상품유형(더 해피 450 ONE/스마트케어) *",
            "구좌수(숫자만) *",
            "가전제품(스마트케어인 경우)",
            "회원번호(선택)",
            "문의사항(선택)"
        ];

        const sampleRow = [
            "홍길동",
            "010-1234-5678",
            "1980-01-01",
            "남",
            "서울시 송파구 올림픽로 300",
            "롯데월드타워 101호",
            "더 해피 450 ONE",
            "1",
            "",
            "",
            "오후 2시 이후 통화 희망"
        ];

        let headers = [...standardHeaders];
        let data: any[][] = [headers, sampleRow];

        if (isAdmin) {
            headers = ["파트너ID(로그인ID) *", ...standardHeaders];
            const adminSample = ["lifenjoy", ...sampleRow];
            data = [headers, adminSample];
        }

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Set column widths
        const wscols = [
            { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 12 },
            { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
            { wch: 30 }, { wch: 15 }, { wch: 30 }
        ];
        if (isAdmin) wscols.unshift({ wch: 20 });
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "업로드양식");

        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });

        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });

    } catch (error) {
        console.error("Template download error:", error);
        return new NextResponse("Failed to download template", { status: 500 });
    }
}
