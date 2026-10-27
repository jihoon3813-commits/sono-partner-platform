import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

interface ExportRow {
    no: number | string;
    accessPath: string;
    applicationNo: string;
    createdAt: string;
    parentPartner: string;
    partnerName: string;
    partnerId: string;
    partnerLoginId: string;
    customerName: string;
    customerPhone: string;
    productName: string;
    combinedProduct: string;
    planType: string;
    address: string;
    zipcode: string;
    birth: string;
    gender: string;
    email: string;
    memberId: string;
    preferredTime: string;
    inquiry: string;
    status: string;
    firstPaymentDate: string;
    registrationDate: string;
    paymentMethod: string;
    cancellationProcessing: string;
    withdrawalProcessing: string;
    remarks: string;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const rows: ExportRow[] = body.rows || [];
        const exportDate = body.exportDate || new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "소노 파트너 플랫폼";
        workbook.lastModifiedBy = "소노 파트너 플랫폼";
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet("고객상담내역", {
            views: [{ showGridLines: true, state: "frozen", ySplit: 5 }],
            properties: { tabColor: { argb: "FF2563EB" } }
        });

        // 1. Title Banner (Row 2)
        worksheet.mergeCells("B2:J2");
        const titleCell = worksheet.getCell("B2");
        titleCell.value = "고객 상담 및 가입 신청 내역";
        titleCell.font = { name: "맑은 고딕", size: 16, bold: true, color: { argb: "FF0F172A" } };
        titleCell.alignment = { vertical: "middle", horizontal: "left" };
        worksheet.getRow(2).height = 32;

        // 2. Metadata Info Banner (Row 3)
        worksheet.mergeCells("B3:P3");
        const metaCell = worksheet.getCell("B3");
        metaCell.value = `■ 다운로드 일시: ${exportDate}    |    ■ 선택 건수: 총 ${rows.length}건    |    ■ 플랫폼: 소노아임레디 제휴 파트너 시스템`;
        metaCell.font = { name: "맑은 고딕", size: 9.5, bold: false, color: { argb: "FF64748B" } };
        metaCell.alignment = { vertical: "middle", horizontal: "left" };
        worksheet.getRow(3).height = 20;

        // Row 4: Spacer
        worksheet.getRow(4).height = 10;

        // 3. Table Headers Definition
        const columns = [
            { key: "no", header: "No.", width: 8, align: "center" as const },
            { key: "accessPath", header: "접수경로", width: 12, align: "center" as const },
            { key: "applicationNo", header: "신청번호", width: 18, align: "center" as const },
            { key: "createdAt", header: "신청일시", width: 22, align: "center" as const },
            { key: "parentPartner", header: "상위파트너", width: 20, align: "center" as const },
            { key: "partnerName", header: "파트너사", width: 22, align: "center" as const },
            { key: "partnerId", header: "시스템ID", width: 14, align: "center" as const },
            { key: "partnerLoginId", header: "로그인ID", width: 14, align: "center" as const },
            { key: "customerName", header: "고객명", width: 13, align: "center" as const },
            { key: "customerPhone", header: "연락처", width: 16, align: "center" as const },
            { key: "productName", header: "상품명", width: 20, align: "center" as const },
            { key: "combinedProduct", header: "결합제품(가전)", width: 22, align: "center" as const },
            { key: "planType", header: "신청구좌", width: 12, align: "center" as const },
            { key: "address", header: "주소", width: 38, align: "left" as const },
            { key: "zipcode", header: "우편번호", width: 12, align: "center" as const },
            { key: "birth", header: "생년월일", width: 14, align: "center" as const },
            { key: "gender", header: "성별", width: 9, align: "center" as const },
            { key: "email", header: "이메일", width: 24, align: "center" as const },
            { key: "memberId", header: "회원번호", width: 15, align: "center" as const },
            { key: "preferredTime", header: "선호시간", width: 16, align: "center" as const },
            { key: "inquiry", header: "문의사항", width: 32, align: "left" as const },
            { key: "status", header: "상태", width: 16, align: "center" as const },
            { key: "firstPaymentDate", header: "초회납입일", width: 14, align: "center" as const },
            { key: "registrationDate", header: "신규등록일", width: 14, align: "center" as const },
            { key: "paymentMethod", header: "납입방법", width: 13, align: "center" as const },
            { key: "cancellationProcessing", header: "해약처리", width: 12, align: "center" as const },
            { key: "withdrawalProcessing", header: "청약철회", width: 12, align: "center" as const },
            { key: "remarks", header: "비고(사유)", width: 30, align: "left" as const }
        ];

        // Header Row (Row 5)
        const headerRow = worksheet.getRow(5);
        headerRow.height = 30;

        columns.forEach((col, idx) => {
            const colNumber = idx + 1;
            const cell = headerRow.getCell(colNumber);
            cell.value = col.header;
            cell.font = { name: "맑은 고딕", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF1E3A8A" } // Deep Royal Blue
            };
            cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
            cell.border = {
                top: { style: "thin", color: { argb: "FF3B82F6" } },
                bottom: { style: "medium", color: { argb: "FF1D4ED8" } },
                left: { style: "thin", color: { argb: "FF3B82F6" } },
                right: { style: "thin", color: { argb: "FF3B82F6" } }
            };

            // Set column width with padding
            worksheet.getColumn(colNumber).width = col.width;
        });

        // 4. Data Rows (Row 6 ~ N)
        const thinBorder: Partial<ExcelJS.Borders> = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } }
        };

        rows.forEach((data, rIdx) => {
            const rowNumber = 6 + rIdx;
            const row = worksheet.getRow(rowNumber);
            row.height = 24;

            const isEven = rIdx % 2 === 1;
            const rowBgColor = isEven ? "FFF8FAFC" : "FFFFFFFF"; // Zebra striping

            columns.forEach((col, cIdx) => {
                const cell = row.getCell(cIdx + 1);
                const rawVal = (data as any)[col.key];
                cell.value = rawVal !== undefined && rawVal !== null ? rawVal : "-";
                cell.font = { name: "맑은 고딕", size: 9.5, color: { argb: "FF1E293B" } };
                cell.alignment = {
                    vertical: "middle",
                    horizontal: col.align,
                    wrapText: col.align === "left"
                };
                cell.border = thinBorder;
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: rowBgColor }
                };

                // Numbers / Codes formatting as string
                if (["applicationNo", "customerPhone", "zipcode", "birth"].includes(col.key)) {
                    cell.numFmt = "@";
                }

                // Special Styling for Status Column
                if (col.key === "status") {
                    const statusText = String(rawVal || "");
                    cell.font = { name: "맑은 고딕", size: 9.5, bold: true };

                    if (
                        statusText.includes("완료") ||
                        statusText.includes("정상") ||
                        statusText.includes("배송")
                    ) {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFDCFCE7" } // Light Green
                        };
                        cell.font = { ...cell.font, color: { argb: "FF15803D" } };
                    } else if (
                        statusText.includes("대기") ||
                        statusText.includes("보류") ||
                        statusText.includes("확인")
                    ) {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFFEF3C7" } // Light Amber
                        };
                        cell.font = { ...cell.font, color: { argb: "FFB45309" } };
                    } else if (
                        statusText.includes("취소") ||
                        statusText.includes("거부") ||
                        statusText.includes("불가") ||
                        statusText.includes("해약") ||
                        statusText.includes("철회")
                    ) {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "FFFEE2E2" } // Light Red
                        };
                        cell.font = { ...cell.font, color: { argb: "FFB91C1C" } };
                    }
                }

                // Customer Name Column Bold
                if (col.key === "customerName") {
                    cell.font = { ...cell.font, bold: true, color: { argb: "FF0F172A" } };
                }

                // Access Path Badge coloring
                if (col.key === "accessPath") {
                    if (rawVal === "홈페이지") {
                        cell.font = { ...cell.font, color: { argb: "FF2563EB" }, bold: true };
                    }
                }
            });
        });

        // 5. Auto Filter on Table Header
        worksheet.autoFilter = {
            from: { row: 5, column: 1 },
            to: { row: 5, column: columns.length }
        };

        // Generate Excel Buffer
        const buffer = await workbook.xlsx.writeBuffer();

        const today = new Date();
        const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, "");
        const fileName = `고객상담내역_${yyyymmdd}_${rows.length}건.xlsx`;
        const encodedFileName = encodeURIComponent(fileName);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
                "Content-Length": buffer.byteLength.toString(),
                "Cache-Control": "no-cache, no-store, must-revalidate"
            }
        });
    } catch (error: any) {
        console.error("Failed to export customer excel:", error);
        return NextResponse.json(
            { error: "엑셀 다운로드 중 오류가 발생했습니다.", details: error.message },
            { status: 500 }
        );
    }
}
