import * as XLSX from "xlsx";

export interface ParsedRetentionRecord {
    memberNo: string;
    uniqueNo?: string;
    customerName: string;
    birth: string;
    phone: string;
    productName: string;
    paymentStatus: string;
    joinStatus: string;
    joinDate: string;
    transferDate?: string;
    paymentMethod: string;
    cancelStatus?: string;
    cancelDate?: string;
    approvalStatus: string;
    b2bCompany: string;
    idNo: string;
    discountCount: number;
    actualPaymentCount: number;
    subCompany?: string;
    transferorName?: string;
}

export function toSafeNumber(val: unknown): number {
    if (typeof val === "number") return Number.isFinite(val) ? val : 0;
    if (val === undefined || val === null) return 0;
    const cleaned = String(val).replace(/,/g, "").replace(/[^0-9.-]/g, "").trim();
    if (!cleaned || cleaned === "-" || cleaned === ".") return 0;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
}

export async function parseRetentionExcelFile(
    file: File,
    normalizeDate: (val: string | number | undefined) => string
): Promise<ParsedRetentionRecord[]> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
        throw new Error("엑셀 파일에서 시트를 찾을 수 없습니다.");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const json: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
    });

    const rows = json.slice(1).filter((row: any) => {
        if (!row || !Array.isArray(row)) return false;
        const hasAnyValue = row.some(
            (cell) => cell !== undefined && cell !== null && String(cell).trim() !== ""
        );
        if (!hasAnyValue) return false;

        const firstCell = String(row[0] ?? "").trim();
        const nameCell = String(row[2] ?? "").trim();
        if (firstCell === "회원번호" || firstCell === "합계" || firstCell === "총계") {
            return false;
        }
        return Boolean(firstCell || nameCell);
    });

    return rows.map((row: any) => {
        const joinStatus = String(row[7] ?? "").trim();
        let paymentStatus = String(row[6] ?? "").trim();
        if (joinStatus.includes("해약") || joinStatus === "해약") {
            paymentStatus = "해약처리";
        }
        return {
            memberNo: String(row[0] ?? "").trim(),
            uniqueNo: String(row[1] ?? "").trim(),
            customerName: String(row[2] ?? "").trim(),
            birth: String(row[3] ?? "").trim(),
            phone: String(row[4] ?? "").trim(),
            productName: String(row[5] ?? "").trim(),
            paymentStatus,
            joinStatus,
            joinDate: normalizeDate(row[8]),
            transferDate: String(row[9] ?? "")
                .trim()
                .replace(/\.0$/, "")
                .replace(/[^0-9]/g, ""),
            paymentMethod: String(row[10] ?? "").trim(),
            cancelStatus: String(row[11] ?? "").trim(),
            cancelDate: String(row[12] ?? "").trim(),
            approvalStatus: String(row[13] ?? "").trim(),
            b2bCompany: String(row[14] ?? "").trim(),
            idNo: String(row[15] ?? "").trim(),
            discountCount: toSafeNumber(row[16]),
            actualPaymentCount: toSafeNumber(row[17]),
            subCompany: String(row[18] ?? "").trim(),
            transferorName: String(row[19] ?? "").trim(),
        };
    });
}

export async function uploadRetentionRecordsInChunks(
    records: ParsedRetentionRecord[],
    clearBatchFn: (args: { batchSize?: number }) => Promise<{ deleted: number; hasMore: boolean }>,
    uploadFn: (args: { records: ParsedRetentionRecord[]; append?: boolean }) => Promise<{ count: number }>,
    chunkSize = 300
): Promise<void> {
    if (records.length === 0) {
        throw new Error("업로드할 유효한 데이터가 없습니다.");
    }

    while (true) {
        const res = await clearBatchFn({ batchSize: 500 });
        if (!res?.hasMore) break;
    }

    for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        await uploadFn({ records: chunk, append: true });
    }
}
