"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { bulkSyncApplications } from "@/lib/db";

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
                            status: getVal(idx.status) || "접수",
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-sono-dark tracking-tight">본사 엑셀 일괄 등록</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-sono-dark">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-xs text-blue-800 space-y-1 font-medium">
                            <p>• 본사에서 받은 '더해피450' 엑셀 파일을 선택하세요.</p>
                            <p>• 모든 시트의 데이터를 자동으로 통합 분석합니다.</p>
                            <p>• 가입자명 + 연락처 + 채널명을 기준으로 기존 데이터를 업데이트하거나 신규 등록합니다.</p>
                        </div>
                    </div>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[24px] p-10 hover:border-sono-primary transition-colors bg-gray-50/50">
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="excel-upload"
                                disabled={isLoading}
                            />
                            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                                    <svg className="w-8 h-8 text-sono-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-sono-dark">엑셀 파일 선택하기</span>
                                <span className="text-xs text-gray-400 font-medium">.xlsx, .xls 형식의 파일을 지원합니다</span>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center space-y-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-sono-dark">동기화 완료</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 mb-1">신규 등록</p>
                                    <p className="text-xl font-black text-sono-primary">{result.created}건</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 mb-1">기존 업데이트</p>
                                    <p className="text-xl font-black text-sono-secondary">{result.updated}건</p>
                                </div>
                            </div>

                            {result.updatedNames && result.updatedNames.length > 0 && (
                                <div className="text-left bg-white p-4 rounded-xl border border-gray-100 max-h-[120px] overflow-y-auto">
                                    <p className="text-[10px] font-bold text-gray-400 mb-2">업데이트된 고객 명단:</p>
                                    <p className="text-xs text-sono-dark leading-relaxed font-medium">
                                        {[...new Set(result.updatedNames)].join(", ")}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full bg-sono-dark text-white font-bold py-3.5 rounded-2xl text-sm hover:bg-black transition-all"
                            >
                                닫기
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center space-y-3">
                            <div className="animate-spin w-8 h-8 border-4 border-sono-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-sm font-bold text-sono-primary">{progress}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
