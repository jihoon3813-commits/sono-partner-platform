"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { bulkSyncApplications } from "@/lib/db";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

interface BulkUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkUploadModal({ onClose, onSuccess }: BulkUploadModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState("");
    const [result, setResult] = useState<{ created: number, updated: number, updatedNames?: string[] } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setProgress("파일을 읽는 중...");
        setResult(null);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });

                const allData: any[] = [];

                workbook.SheetNames.forEach((sheetName) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    if (rows.length === 0) return;

                    // Automatically find header row (within first 10 rows)
                    let headerIdx = -1;
                    const keywords = ["가입자", "가입사", "채널명", "성명", "연락처", "전화번호"];

                    for (let i = 0; i < Math.min(rows.length, 10); i++) {
                        const row = rows[i];
                        if (row && row.some(cell => keywords.some(k => String(cell || "").includes(k)))) {
                            headerIdx = i;
                            break;
                        }
                    }

                    if (headerIdx === -1) {
                        console.warn(`Could not find header in sheet: ${sheetName}`);
                        return;
                    }

                    const headerRow = rows[headerIdx];
                    const findIdx = (names: string[]) =>
                        headerRow.findIndex(h => names.some(n => String(h || "").includes(n)));

                    const idx = {
                        createdAt: findIdx(["신청일"]),
                        partnerName: findIdx(["채널명"]),
                        customerName: findIdx(["가입자", "가입사", "성명"]),
                        customerPhone: findIdx(["전화번호", "연락처", "본인휴대폰"]),
                        planType: findIdx(["구좌"]),
                        firstPaymentDate: findIdx(["초회납입일"]),
                        registrationDate: findIdx(["신규등록일"]),
                        paymentMethod: findIdx(["납입방법"]),
                        cancellationProcessing: findIdx(["해약처리"]),
                        withdrawalProcessing: findIdx(["청약철회"]),
                        status: findIdx(["상담결과", "상담상태", "처리상태"]),
                        remarks: findIdx(["사유", "비고"]),
                    };

                    // 만약 사용자가 D열(index 3)이라고 특정했다면, 자동 찾기 실패 시 3 사용
                    if (idx.partnerName === -1) idx.partnerName = 3;

                    // 데이터는 헤더 다음 행부터 시작
                    // Helper for phone formatting
                    const formatPhoneNumber = (str: string) => {
                        const cleaned = str.replace(/[^0-9]/g, "");
                        if (cleaned.length === 11) {
                            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
                        }
                        if (cleaned.length === 10) {
                            if (cleaned.startsWith('02')) { // 02-1234-5678
                                return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
                            }
                            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`; // 011-123-4567
                        }
                        return cleaned;
                    };

                    const dataRows = rows.slice(headerIdx + 1);

                    dataRows.forEach((row) => {
                        const getVal = (i: number) => i !== -1 ? String(row[i] || "").trim() : "";

                        // 가입자명과 연락처가 필수
                        const name = getVal(idx.customerName);
                        // 자동 하이픈 포맷팅 적용
                        const phone = formatPhoneNumber(getVal(idx.customerPhone));

                        if (!name || !phone) return;

                        const applicationData = {
                            partnerName: getVal(idx.partnerName),
                            customerName: name,
                            customerPhone: phone,
                            productType: "더 해피 450 ONE", // 상품명 변경 저장
                            planType: getVal(idx.planType),
                            firstPaymentDate: getVal(idx.firstPaymentDate),
                            registrationDate: getVal(idx.registrationDate),
                            paymentMethod: getVal(idx.paymentMethod),
                            cancellationProcessing: getVal(idx.cancellationProcessing),
                            withdrawalProcessing: getVal(idx.withdrawalProcessing),
                            status: getVal(idx.status),
                            remarks: getVal(idx.remarks),
                            createdAt: getVal(idx.createdAt),
                        };

                        allData.push(applicationData);
                    });
                });

                if (allData.length === 0) {
                    alert("업로드할 유효한 데이터가 없습니다.");
                    setIsLoading(false);
                    return;
                }

                setProgress(`${allData.length}건의 데이터를 서버에 동기화 중...`);

                // DEBUG: Log problem records
                const debugNames = ["박희철", "이근자", "서여선"];
                const debugRecords = allData.filter((d: any) => debugNames.includes(d.customerName));
                console.log(`[BulkUpload Debug] Total records: ${allData.length}`);
                console.log(`[BulkUpload Debug] Problem records:`, JSON.stringify(debugRecords, null, 2));

                const res = await bulkSyncApplications(allData);
                setResult(res);
                setProgress("동기화 완료!");
                onSuccess();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Bulk upload error:", error);
            alert("처리 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminDrawer
            title="본사 엑셀 일괄 등록"
            subtitle="본사 현황 엑셀(.xlsx, .xls)을 업로드하여 신규 등록 및 상태를 동기화합니다."
            maxWidth="540px"
            zIndex={70}
            onClose={onClose}
            footer={
                <button type="button" onClick={onClose} className="adm-btn">
                    닫기
                </button>
            }
        >
            <div className="space-y-5">
                {typeof window !== "undefined" && (
                    <div className={`p-3 rounded-[10px] border flex items-center justify-between text-xs font-semibold ${
                        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".local"))
                            ? "bg-[#eaf3e8] border-[#cfe0c7] text-[#3a6144]"
                            : "bg-[#faf0df] border-[#ead7b7] text-[#946b31]"
                    }`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                                (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".local"))
                                    ? "bg-[#4f7d53] animate-pulse"
                                    : "bg-[#b58c4b]"
                            }`} />
                            <span>
                                {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".local"))
                                    ? "개발 DB 연결됨 (Dev)"
                                    : "실사이트 운영 DB 연결됨 (Prod)"}
                            </span>
                        </div>
                        <span className="text-[11px] font-bold">
                            {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.endsWith(".local"))
                                ? "실서버 영향 없음"
                                : "운영 서버 실시간 반영"}
                        </span>
                    </div>
                )}

                <div className="bg-[#f8f9f5] p-4 rounded-[11px] border border-[#e6eae3] text-xs text-[#5d6c5d] space-y-1.5 leading-relaxed">
                    <p className="font-bold text-[#295e52] flex items-center gap-1.5 mb-1">
                        <AdminIcon name="info" className="!w-4 !h-4" />
                        업로드 기준 안내
                    </p>
                    <p>• 본사에서 받은 &apos;더해피450&apos; 엑셀 파일을 선택하세요.</p>
                    <p>• 모든 시트의 데이터를 자동으로 통합 분석합니다.</p>
                    <p>• 가입자명 + 연락처 + 채널명을 기준으로 기존 데이터를 업데이트하거나 신규 등록합니다.</p>
                </div>

                {!result ? (
                    <div className="border border-dashed border-[#cbd8c0] rounded-[12px] p-10 text-center hover:bg-[#f9fbf7] transition-colors">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="excel-upload"
                            disabled={isLoading}
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-2.5">
                            <div className="w-12 h-12 bg-[#edf2e7] text-[#295e52] rounded-xl flex items-center justify-center mb-1">
                                <AdminIcon name="upload" className="!w-6 !h-6" />
                            </div>
                            <span className="font-bold text-[#263d36] text-sm">엑셀 파일 선택하기</span>
                            <span className="text-xs text-[#86918a]">.xlsx, .xls 형식의 파일을 지원합니다</span>
                        </label>
                    </div>
                ) : (
                    <div className="bg-[#f8f9f5] p-6 rounded-[12px] border border-[#e6eae3] text-center space-y-4">
                        <div className="w-11 h-11 bg-[#eaf3e8] text-[#295e52] rounded-full flex items-center justify-center mx-auto">
                            <AdminIcon name="check" />
                        </div>
                        <h3 className="font-bold text-[#263d36]">동기화 완료</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-3.5 rounded-[10px] border border-[#e6eae3]">
                                <p className="text-[11px] font-semibold text-[#86918a] mb-1">신규 등록</p>
                                <p className="text-xl font-bold text-[#295e52]">{result.created}건</p>
                            </div>
                            <div className="bg-white p-3.5 rounded-[10px] border border-[#e6eae3]">
                                <p className="text-[11px] font-semibold text-[#86918a] mb-1">기존 업데이트</p>
                                <p className="text-xl font-bold text-[#263d36]">{result.updated}건</p>
                            </div>
                        </div>

                        {result.updatedNames && result.updatedNames.length > 0 && (
                            <div className="text-left bg-white p-4 rounded-[10px] border border-[#e6eae3] max-h-[140px] overflow-y-auto">
                                <p className="text-[11px] font-bold text-[#86918a] mb-1.5">업데이트된 고객 명단:</p>
                                <p className="text-xs text-[#263d36] leading-relaxed">
                                    {[...new Set(result.updatedNames)].join(", ")}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {isLoading && (
                    <div className="text-center space-y-2.5 py-2">
                        <div className="animate-spin w-7 h-7 border-[3px] border-[#295e52] border-t-transparent rounded-full mx-auto" />
                        <p className="text-xs font-bold text-[#295e52]">{progress}</p>
                    </div>
                )}
            </div>
        </AdminDrawer>
    );
}
