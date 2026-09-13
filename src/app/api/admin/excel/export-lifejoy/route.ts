import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import ExcelJS from "exceljs";

// 최신 라이프앤조이 엑셀 파일 경로 조회 (/tmp 및 hoon 디렉토리 병합 탐색)
function getLatestExcelFilePath(): { filePath: string; fileName: string } {
    const candidates: { filePath: string; fileName: string }[] = [];

    // 1. /tmp 디렉토리 탐색 (서버리스 환경)
    try {
        const tmpDir = os.tmpdir();
        if (fs.existsSync(tmpDir)) {
            const tmpFiles = fs.readdirSync(tmpDir).filter(f => f.startsWith("라이프앤조이_더해피one_가입요청") && f.endsWith(".xlsx"));
            tmpFiles.forEach(f => {
                candidates.push({ filePath: path.join(tmpDir, f), fileName: f });
            });
        }
    } catch (e) {
        console.warn("Failed to read tmp directory:", e);
    }

    // 2. hoon 디렉토리 탐색 (로컬 및 빌드 배포본)
    try {
        const hoonDir = path.join(process.cwd(), "hoon");
        if (fs.existsSync(hoonDir)) {
            const hoonFiles = fs.readdirSync(hoonDir).filter(f => f.startsWith("라이프앤조이_더해피one_가입요청") && f.endsWith(".xlsx"));
            hoonFiles.forEach(f => {
                candidates.push({ filePath: path.join(hoonDir, f), fileName: f });
            });
        }
    } catch (e) {
        console.warn("Failed to read hoon directory:", e);
    }

    if (candidates.length === 0) {
        throw new Error("기준 엑셀 파일이 존재하지 않습니다.");
    }

    // 파일명 기준 정렬 (최신 날짜/차수 우선)
    candidates.sort((a, b) => b.fileName.localeCompare(a.fileName, undefined, { numeric: true }));
    return candidates[0];
}

// 판매채널 자동 판별 함수 (환경설정 매핑 지원)
function resolveSalesChannel(app: any, channelMappings?: any[]): string {
    const partnerId = String(app.partnerId || "").trim();
    const partnerName = String(app.partnerName || "").trim();

    if (Array.isArray(channelMappings) && channelMappings.length > 0) {
        const matched = channelMappings.find((m: any) => {
            if (!m) return false;
            const mId = String(m.partnerId || "").trim().toLowerCase();
            const mName = String(m.partnerName || "").trim().toLowerCase();
            const pId = partnerId.toLowerCase();
            const pName = partnerName.toLowerCase();
            return (
                (mId && (mId === pId || pId.includes(mId))) ||
                (mName && (mName === pName || pName.includes(mName)))
            );
        });
        if (matched && matched.excelChannelName) {
            return matched.excelChannelName;
        }
    }

    const lowerId = partnerId.toLowerCase();
    if (lowerId === "dlwodyd007" || partnerName.includes("직영") || partnerName.includes("이재용")) {
        return "라이프앤조이_직영";
    }
    if (lowerId === "neora" || partnerName.includes("베스트원") || partnerName.includes("프리미엄") || partnerName.includes("니오라")) {
        return "라이프앤조이_프리미엄몰";
    }
    if (lowerId === "deaee" || partnerName.includes("딜애")) {
        return "라이프앤조이_딜애";
    }
    if (partnerName) {
        return `라이프앤조이_${partnerName.replace(/\s+/g, "")}`;
    }
    return "라이프앤조이_직영";
}

// 시간 문자열 정제 (예: "17:00~18:00" -> "17시~18시")
function formatTimeSlot(timeStr?: string): string {
    if (!timeStr || timeStr.trim() === "" || timeStr === "-") return "무관";
    let t = timeStr.trim();
    t = t.replace(/(\d{1,2}):00/g, "$1시");
    return t;
}

// 날짜 문자열을 Date 객체로 안전하게 파싱 (KST 00:00:00 기준)
function parseToDate(dateStr?: string): Date {
    if (!dateStr) return new Date();
    const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
        return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date();
    return d;
}

// GET: 현재 엑셀에 이미 등록된 고객 목록 및 최신 파일 정보 반환
export async function GET() {
    try {
        const { filePath, fileName } = getLatestExcelFilePath();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const existingCustomers: { name: string; phone: string; sheet: string; no: number }[] = [];

        workbook.eachSheet((ws) => {
            const rowCount = ws.rowCount;
            for (let r = 5; r <= rowCount; r++) {
                const row = ws.getRow(r);
                const no = row.getCell("C").value;
                const name = row.getCell("G").value;
                const phone = row.getCell("H").value;

                if (name && phone && typeof name === "string") {
                    const cleanPhone = String(phone).replace(/[^\d]/g, "");
                    if (cleanPhone.length >= 8) {
                        existingCustomers.push({
                            name: String(name).trim(),
                            phone: cleanPhone,
                            sheet: ws.name,
                            no: Number(no) || 0,
                        });
                    }
                }
            }
        });

        // 오늘 날짜 기준 추천 출력 파일명 생성 (예: 라이프앤조이_더해피one_가입요청_260913_1.xlsx)
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const todayPrefix = `라이프앤조이_더해피one_가입요청_${yy}${mm}${dd}_`;

        const hoonDir = path.join(process.cwd(), "hoon");
        const todayFiles = fs.readdirSync(hoonDir).filter(f => f.startsWith(todayPrefix) && f.endsWith(".xlsx"));
        const nextOrder = todayFiles.length + 1;
        const suggestedFileName = `${todayPrefix}${nextOrder}.xlsx`;

        return NextResponse.json({
            success: true,
            latestFileName: fileName,
            suggestedFileName,
            existingCustomersCount: existingCustomers.length,
            existingCustomers,
        });
    } catch (error: any) {
        console.error("Failed to inspect excel file:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 상품 종류 판정: "450" (더해피450) vs "combined" (스마트케어 / 결합)
function resolveSheetType(customer: any): "450" | "combined" {
    const prodType = String(customer.productType || "").toLowerCase().trim();
    
    // 스마트케어 계열 (스마트케어, smartcare, smart, 결합 등)
    if (
        prodType.includes("smart") || 
        prodType.includes("스마트") || 
        prodType.includes("결합")
    ) {
        return "combined";
    }

    // 더해피450 계열 (happy450, 450, 해피, happy 등)
    if (
        prodType.includes("450") || 
        prodType.includes("해피") || 
        prodType.includes("happy")
    ) {
        return "450";
    }

    // 그 외 가전제품(products)이 기재되어 있으면 스마트케어(결합), 없으면 기본 450
    if (customer.products && String(customer.products).trim() !== "") {
        return "combined";
    }

    return "450";
}

// POST: 신규 고객들을 엑셀 파일에 추가하고 브라우저 다운로드 제공
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customers,
            outputFileName,
            channelMappings = [],
            sellerName = "김지훈",
            saveToServer = true,
        } = body;

        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            return NextResponse.json(
                { success: false, message: "추가할 고객 데이터가 없습니다." },
                { status: 400 }
            );
        }

        const { filePath } = getLatestExcelFilePath();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        // 오늘 날짜 정보
        const now = new Date();
        const currentMonthStr = String(now.getMonth() + 1).padStart(2, "0"); // "09"
        const yy = String(now.getFullYear()).slice(-2);
        const mm = currentMonthStr;
        const dd = String(now.getDate()).padStart(2, "0");

        const targetFileName = outputFileName || `라이프앤조이_더해피one_가입요청_${yy}${mm}${dd}_1.xlsx`;

        // 기본 서식 정의
        const defaultFont = { name: "나눔고딕", size: 10 };
        const defaultBorder: Partial<ExcelJS.Borders> = {
            top: { style: "thin", color: { argb: "FFD3D3D3" } },
            left: { style: "thin", color: { argb: "FFD3D3D3" } },
            bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
            right: { style: "thin", color: { argb: "FFD3D3D3" } },
        };
        const defaultAlignment: Partial<ExcelJS.Alignment> = {
            vertical: "middle",
            horizontal: "center",
        };

        // 월별 시트 가져오기 (없으면 이전 시트 서식 복제하여 자동 생성)
        const getOrCreateMonthSheet = (wb: ExcelJS.Workbook, sheetType: "450" | "combined", monthStr: string) => {
            const sheetSuffix = sheetType === "450" ? "450" : "결합";
            const sheetName = `${monthStr}월 리스트_${sheetSuffix}`;

            // 공백 유연하게 탐색 (예: "09월 리스트_450", "09월리스트_450" 모두 대응)
            let ws = wb.worksheets.find(s => {
                const sName = s.name.replace(/\s+/g, "");
                const targetName = sheetName.replace(/\s+/g, "");
                return sName === targetName;
            });

            if (ws) return ws;

            // 템플릿으로 삼을 이전 최신 시트 탐색
            const templateSheetName = sheetType === "450" ? "09월 리스트_450" : "09월 리스트_결합";
            let templateWs = wb.getWorksheet(templateSheetName);
            if (!templateWs) {
                templateWs = wb.worksheets.find(s => s.name.includes(sheetType === "450" ? "450" : "결합"));
            }

            // 새 월 시트 추가
            ws = wb.addWorksheet(sheetName);

            // 1. 열 너비 복제
            if (templateWs) {
                for (let c = 1; c <= 25; c++) {
                    const tempCol = templateWs.getColumn(c);
                    if (tempCol && tempCol.width) {
                        ws.getColumn(c).width = tempCol.width;
                    }
                }
            } else {
                if (sheetType === "450") {
                    const widths = [1, 9, 9, 20, 11, 12, 9, 16, 5, 5, 9, 9, 9, 9, 9, 11, 11, 18, 11, 18];
                    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
                } else {
                    const widths = [1, 9, 9, 20, 11, 12, 9, 16, 9, 63, 11, 18, 12];
                    widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
                }
            }

            // 2. Row 2: 타이틀 복제
            const titleCell = ws.getCell("B2");
            titleCell.value = sheetType === "450"
                ? "라이프앤조이 소노 더해피 가입 진행요청"
                : "라이프앤조이 소노 스마트케어(결합) 가입 진행요청";
            titleCell.font = { name: "나눔고딕", size: 14, bold: true };
            titleCell.alignment = { vertical: "middle" };

            // 3. Row 4: 헤더 설정 및 스타일 복제
            if (sheetType === "450") {
                ws.getCell("B4").value = "상태";
                ws.getCell("C4").value = "NO.";
                ws.getCell("D4").value = "판매채널";
                ws.getCell("E4").value = "판매자";
                ws.getCell("F4").value = "요청일";
                ws.getCell("G4").value = "이름";
                ws.getCell("H4").value = "연락처";
                ws.getCell("K4").value = "구좌";
                ws.getCell("P4").value = "1차 희망일시";
                ws.getCell("S4").value = "2차 희망일시";

                try {
                    ws.mergeCells("P4:R4");
                    ws.mergeCells("S4:T4");
                } catch (e) {}

                ["B", "C", "D", "E", "F", "G", "H", "K", "P", "S"].forEach(col => {
                    const cell = ws.getCell(col + "4");
                    cell.font = { name: "나눔고딕", size: 10, bold: true };
                    cell.border = defaultBorder;
                    cell.alignment = defaultAlignment;
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
                });
            } else {
                ws.getCell("B4").value = "상태";
                ws.getCell("C4").value = "NO.";
                ws.getCell("D4").value = "판매채널";
                ws.getCell("E4").value = "판매자";
                ws.getCell("F4").value = "요청일";
                ws.getCell("G4").value = "이름";
                ws.getCell("H4").value = "연락처";
                ws.getCell("I4").value = "구좌";
                ws.getCell("J4").value = "가전";
                ws.getCell("K4").value = "1차 희망일시";

                try {
                    ws.mergeCells("K4:L4");
                } catch (e) {}

                ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K"].forEach(col => {
                    const cell = ws.getCell(col + "4");
                    cell.font = { name: "나눔고딕", size: 10, bold: true };
                    cell.border = defaultBorder;
                    cell.alignment = defaultAlignment;
                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
                });
            }

            // 4. Row 5 ~ Row 104: 100개 행 빈 템플릿 번호 미리 생성
            for (let i = 1; i <= 100; i++) {
                const r = 4 + i;
                const row = ws.getRow(r);
                row.getCell("C").value = i;

                const cols = sheetType === "450"
                    ? ["C", "D", "E", "F", "G", "H", "K", "P", "S"]
                    : ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

                cols.forEach(col => {
                    const cell = row.getCell(col);
                    cell.font = defaultFont;
                    cell.border = defaultBorder;
                    cell.alignment = defaultAlignment;
                });
            }

            return ws;
        };

        // 시트 헤더(4행)를 분석하여 각 컬럼의 위치를 동적으로 감지 (B열 상태 열이 삭제되어도 자동 대응)
        const getSheetColMap = (ws: ExcelJS.Worksheet) => {
            const colMap: { [key: string]: number } = {};
            const headerRow = ws.getRow(4);
            headerRow.eachCell((cell, colNumber) => {
                const val = String(cell.value || "").trim().replace(/\s+/g, "");
                if (val.includes("NO") || val.includes("번호")) colMap["no"] = colNumber;
                else if (val.includes("판매채널") || val.includes("채널")) colMap["channel"] = colNumber;
                else if (val.includes("판매자")) colMap["seller"] = colNumber;
                else if (val.includes("요청일")) colMap["reqDate"] = colNumber;
                else if (val.includes("이름") || val.includes("고객명")) colMap["name"] = colNumber;
                else if (val.includes("연락처") || val.includes("전화")) colMap["phone"] = colNumber;
                else if (val.includes("구좌")) colMap["plan"] = colNumber;
                else if (val.includes("가전")) colMap["product"] = colNumber;
                else if (val.includes("1차")) colMap["time1"] = colNumber;
                else if (val.includes("2차")) colMap["time2"] = colNumber;
                else if (val.includes("희망")) {
                    if (!colMap["time1"]) colMap["time1"] = colNumber;
                    else if (!colMap["time2"]) colMap["time2"] = colNumber;
                }
            });
            return colMap;
        };

        // 마지막 데이터 행과 번호(NO.) 계산 헬퍼 (헤더 자동 매핑 기준)
        const getNextRowInfo = (ws: ExcelJS.Worksheet, colMap: { [key: string]: number }) => {
            let lastDataRowIndex = 4; // 헤더가 4행
            let lastNo = 0;

            const nameCol = colMap["name"] || 7; // 기본 G열
            const noCol = colMap["no"] || 3;     // 기본 C열

            const rowCount = ws.rowCount;
            for (let r = 5; r <= rowCount; r++) {
                const row = ws.getRow(r);
                const nameVal = row.getCell(nameCol).value;
                if (nameVal && String(nameVal).trim() !== "") {
                    lastDataRowIndex = r;
                    const cVal = row.getCell(noCol).value;
                    if (typeof cVal === "number") {
                        lastNo = cVal;
                    } else if (typeof cVal === "string" && !isNaN(Number(cVal))) {
                        lastNo = Number(cVal);
                    }
                }
            }

            return {
                nextRowIndex: lastDataRowIndex + 1,
                nextNo: lastNo + 1,
            };
        };

        // 현재 엑셀에 존재하는 최신 월 파악 (기본 "09")
        let activeMonthStr = "09";
        workbook.worksheets.forEach(ws => {
            const match = ws.name.match(/^(\d{2})월/);
            if (match && match[1] > activeMonthStr) {
                activeMonthStr = match[1];
            }
        });

        let addedCount = 0;

        for (const customer of customers) {
            // 상품별 시트 분기: 더해피450 -> '450', 스마트케어 -> 'combined'
            const sheetType = resolveSheetType(customer);
            const reqDate = parseToDate(customer.registrationDate || customer.createdAt);
            let reqMonthStr = String(reqDate.getMonth() + 1).padStart(2, "0");

            // 26년 09월 기준 유지 (과거월 신청 건이더라도 활성 09월 시트로 배정)
            if (reqMonthStr < activeMonthStr) {
                reqMonthStr = activeMonthStr;
            }

            const targetSheet = getOrCreateMonthSheet(workbook, sheetType, reqMonthStr);
            const colMap = getSheetColMap(targetSheet);
            const { nextRowIndex, nextNo } = getNextRowInfo(targetSheet, colMap);

            const row = targetSheet.getRow(nextRowIndex);

            const channel = customer.channel || resolveSalesChannel(customer, channelMappings);
            const seller = customer.seller || sellerName || "김지훈";
            const name = String(customer.customerName || "").trim();
            const phone = String(customer.customerPhone || "").trim();
            const plan = String(customer.planType || "1구좌").trim();
            const contactTime = formatTimeSlot(customer.preferredContactTime);

            // B열 상태(요청중) 열은 값을 입력하지 않음 (사용자 요청: B열 상태 열 제거/미기재)
            // 동적 컬럼 매핑으로 기재 (B열 삭제 시에도 컬럼 위치 자동 감지)
            const noCol = colMap["no"] || (sheetType === "450" ? 3 : 3);
            const chanCol = colMap["channel"] || 4;
            const sellerCol = colMap["seller"] || 5;
            const dateCol = colMap["reqDate"] || 6;
            const nameCol = colMap["name"] || 7;
            const phoneCol = colMap["phone"] || 8;

            row.getCell(noCol).value = nextNo;
            row.getCell(chanCol).value = channel;
            row.getCell(sellerCol).value = seller;
            row.getCell(dateCol).value = reqDate;
            row.getCell(dateCol).numFmt = 'm"월" d"일"';
            row.getCell(nameCol).value = name;
            row.getCell(phoneCol).value = phone;

            const styledCols: number[] = [noCol, chanCol, sellerCol, dateCol, nameCol, phoneCol];

            if (sheetType === "450") {
                // 더해피 450 시트 입력:
                const planCol = colMap["plan"] || 11; // 기본 K열
                const time1Col = colMap["time1"] || 16; // 기본 P열
                const time2Col = colMap["time2"] || 19; // 기본 S열

                row.getCell(planCol).value = plan.includes("구좌") ? plan : `${plan}구좌`;
                row.getCell(time1Col).value = "-";
                row.getCell(time2Col).value = contactTime;
                styledCols.push(planCol, time1Col, time2Col);
            } else {
                // 결합(스마트케어) 시트 입력:
                const planCol = colMap["plan"] || 9;   // 기본 I열
                const prodCol = colMap["product"] || 10; // 기본 J열
                const time1Col = colMap["time1"] || 11; // 기본 K열
                const time2Col = colMap["time2"] || 12; // 기본 L열

                row.getCell(planCol).value = plan.includes("구좌") ? plan : `${plan}구좌`;
                row.getCell(prodCol).value = customer.products || "-";
                row.getCell(time1Col).value = reqDate;
                row.getCell(time1Col).numFmt = 'mm"월" dd"일"';
                row.getCell(time2Col).value = contactTime;
                styledCols.push(planCol, prodCol, time1Col, time2Col);
            }

            // 스타일 일괄 적용
            styledCols.forEach((c) => {
                const cell = row.getCell(c);
                cell.font = defaultFont;
                cell.border = defaultBorder;
                cell.alignment = defaultAlignment;
            });

            row.commit();
            addedCount++;
        }

        // 새 파일 바이너리 버퍼 생성
        const buffer = await workbook.xlsx.writeBuffer();

        // 서버/임시 저장소 보관 (로컬 hoon 폴더 또는 Vercel /tmp)
        if (saveToServer) {
            try {
                const hoonDir = path.join(process.cwd(), "hoon");
                if (fs.existsSync(hoonDir)) {
                    const newFilePath = path.join(hoonDir, targetFileName);
                    fs.writeFileSync(newFilePath, Buffer.from(buffer));
                }
            } catch (fsErr: any) {
                // Vercel / 서버리스 읽기전용 환경(EROFS)일 경우 /tmp 에 백업 보관
                try {
                    const tmpDir = os.tmpdir();
                    const tmpFilePath = path.join(tmpDir, targetFileName);
                    fs.writeFileSync(tmpFilePath, Buffer.from(buffer));
                } catch (tmpErr) {
                    console.warn("Failed to write to tmp dir:", tmpErr);
                }
            }
        }

        // 다운로드 파일명 인코딩 (한글 지원)
        const encodedFileName = encodeURIComponent(targetFileName).replace(/['()]/g, escape).replace(/\*/g, "%2A");

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
                "X-Added-Count": String(addedCount),
            },
        });
    } catch (error: any) {
        console.error("Lifejoy excel export error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
