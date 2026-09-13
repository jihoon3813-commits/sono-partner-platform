import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

// hoon 폴더의 최신 라이프앤조이 엑셀 파일 경로 조회
function getLatestExcelFilePath(): { filePath: string; fileName: string } {
    const hoonDir = path.join(process.cwd(), "hoon");
    if (!fs.existsSync(hoonDir)) {
        fs.mkdirSync(hoonDir, { recursive: true });
    }

    const files = fs.readdirSync(hoonDir).filter(f => f.startsWith("라이프앤조이_더해피one_가입요청") && f.endsWith(".xlsx"));
    if (files.length === 0) {
        throw new Error("hoon 폴더에 기준 엑셀 파일이 존재하지 않습니다.");
    }

    // 파일명 기준 정렬 (최신 날짜/차수 우선)
    files.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    const latestFile = files[0];
    return {
        filePath: path.join(hoonDir, latestFile),
        fileName: latestFile,
    };
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

// POST: 신규 고객들을 엑셀 파일에 추가하고 브라우저 다운로드 제공
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            customers = [], // 추가할 고객 목록
            sellerName = "김지훈",
            outputFileName,
            saveToServer = true,
            channelMappings = [], // 환경설정 채널 매핑 목록
        } = body;

        if (!Array.isArray(customers) || customers.length === 0) {
            return NextResponse.json({ success: false, message: "추가할 고객 데이터가 없습니다." }, { status: 400 });
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

        // 더해피 450 시트 및 스마트케어(결합) 시트 확인
        const sheet450Name = `${currentMonthStr}월 리스트_450`;
        const sheetSmartName = `${currentMonthStr}월 리스트_결합`;

        let ws450 = workbook.getWorksheet(sheet450Name);
        let wsSmart = workbook.getWorksheet(sheetSmartName);

        if (!ws450) {
            const candidate = workbook.worksheets.find(ws => ws.name.includes("450"));
            if (candidate) ws450 = candidate;
        }
        if (!wsSmart) {
            const candidate = workbook.worksheets.find(ws => ws.name.includes("결합") || ws.name.includes("스마트"));
            if (candidate) wsSmart = candidate;
        }

        if (!ws450) {
            throw new Error(`엑셀 파일 내에 [${sheet450Name}] 시트를 찾을 수 없습니다.`);
        }

        // 기본 셀 스타일 템플릿 (나눔고딕 10pt, thin 테두리, 가운데 정렬)
        const defaultFont = { name: "나눔고딕", size: 10, family: 3, charset: 129 };
        const defaultBorder = {
            top: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
            left: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
            bottom: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
            right: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
        };
        const defaultAlignment = { horizontal: "center" as const, vertical: "middle" as const };

        // 마지막 데이터 행과 번호(NO.) 계산 헬퍼 (템플릿에 미리 채워진 빈 번호 무시)
        const getNextRowInfo = (ws: ExcelJS.Worksheet) => {
            let lastDataRowIndex = 4; // 헤더가 4행
            let lastNo = 0;

            for (let r = 5; r <= ws.rowCount; r++) {
                const row = ws.getRow(r);
                const nameCell = row.getCell("G");

                // G열(이름)에 실제 데이터가 채워져 있다면 데이터 행으로 인정
                if (nameCell.value && String(nameCell.value).trim() !== "") {
                    lastDataRowIndex = r;
                    const noCell = row.getCell("C");
                    const parsed = parseInt(String(noCell.value || ""), 10);
                    if (!isNaN(parsed)) {
                        lastNo = parsed;
                    }
                }
            }

            return {
                nextRowIndex: lastDataRowIndex + 1,
                nextNo: lastNo + 1,
            };
        };

        let addedCount = 0;

        for (const customer of customers) {
            const prodType = String(customer.productType || "").toLowerCase();
            const isCombined = prodType.includes("smart") || prodType.includes("스마트") || (customer.products && String(customer.products).trim() !== "");

            const targetSheet: ExcelJS.Worksheet = (isCombined && wsSmart) ? wsSmart : ws450;
            const { nextRowIndex, nextNo } = getNextRowInfo(targetSheet);

            const row = targetSheet.getRow(nextRowIndex);

            const channel = customer.channel || resolveSalesChannel(customer, channelMappings);
            const seller = customer.seller || sellerName || "김지훈";
            const reqDate = parseToDate(customer.registrationDate || customer.createdAt);
            const name = String(customer.customerName || "").trim();
            const phone = String(customer.customerPhone || "").trim();
            const plan = String(customer.planType || "1구좌").trim();
            const contactTime = formatTimeSlot(customer.preferredContactTime);

            if (targetSheet === ws450) {
                // 더해피 450 시트 입력:
                row.getCell("B").value = "요청중";
                row.getCell("C").value = nextNo;
                row.getCell("D").value = channel;
                row.getCell("E").value = seller;
                row.getCell("F").value = reqDate;
                row.getCell("F").numFmt = 'm"월" d"일"';
                row.getCell("G").value = name;
                row.getCell("H").value = phone;
                row.getCell("K").value = plan.includes("구좌") ? plan : `${plan}구좌`;
                row.getCell("P").value = "-";
                row.getCell("S").value = contactTime;

                // 스타일 적용
                ["B", "C", "D", "E", "F", "G", "H", "K", "P", "S"].forEach((col) => {
                    const cell = row.getCell(col);
                    cell.font = defaultFont;
                    cell.border = defaultBorder;
                    cell.alignment = defaultAlignment;
                });
            } else if (wsSmart && targetSheet === wsSmart) {
                // 결합 시트 입력:
                row.getCell("B").value = "접수완료";
                row.getCell("C").value = nextNo;
                row.getCell("D").value = channel;
                row.getCell("E").value = seller;
                row.getCell("F").value = reqDate;
                row.getCell("F").numFmt = 'm"월" d"일"';
                row.getCell("G").value = name;
                row.getCell("H").value = phone;
                row.getCell("I").value = plan.includes("구좌") ? plan : `${plan}구좌`;
                row.getCell("J").value = customer.products || "-";
                row.getCell("K").value = reqDate;
                row.getCell("K").numFmt = 'mm"월" dd"일"';
                row.getCell("L").value = contactTime;
                row.getCell("M").value = "무관";

                // 스타일 적용
                ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"].forEach((col) => {
                    const cell = row.getCell(col);
                    cell.font = defaultFont;
                    cell.border = defaultBorder;
                    cell.alignment = defaultAlignment;
                });
            }

            row.commit();
            addedCount++;
        }

        // 새 파일 바이너리 버퍼 생성
        const buffer = await workbook.xlsx.writeBuffer();

        // 서버 hoon 디렉토리에도 새 파일로 보관
        if (saveToServer) {
            const hoonDir = path.join(process.cwd(), "hoon");
            const newFilePath = path.join(hoonDir, targetFileName);
            fs.writeFileSync(newFilePath, Buffer.from(buffer));
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
