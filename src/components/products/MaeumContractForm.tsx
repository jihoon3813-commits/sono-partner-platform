"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    ContractFieldDef,
    generateFilledContractPdf,
    triggerPdfDownload,
} from "@/lib/maeumPdf";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface MaeumContractFormProps {
    partnerUrl?: string;
    partnerId?: string;
    partnerName?: string;
    initialPlan?: "3" | "4" | "5";
    backHref?: string;
}

export default function MaeumContractForm({
    partnerUrl = "",
    partnerId = "",
    partnerName = "",
    initialPlan = "4",
    backHref = "/products/maeum",
}: MaeumContractFormProps) {
    const activeTemplate = useQuery(api.maeumContracts.getActiveTemplate);
    const partnerRecord = useQuery(
        api.partners.getPartnerById,
        partnerId && partnerId !== "ADMIN" ? { partnerId } : "skip"
    );
    const generateUploadUrl = useMutation(api.maeumContracts.generateUploadUrl);
    const submitMaeumContract = useMutation(api.maeumContracts.submitMaeumContract);

    const [productType, setProductType] = useState<"마음든든3" | "마음든든4" | "마음든든5">(
        `마음든든${initialPlan}` as "마음든든3" | "마음든든4" | "마음든든5"
    );
    const [planType, setPlanType] = useState("1");
    const [customerName, setCustomerName] = useState("");
    const [customerBirth, setCustomerBirth] = useState("");
    const [customerGender, setCustomerGender] = useState("남");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerZipcode, setCustomerZipcode] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");

    const [customValues, setCustomValues] = useState<Record<string, any>>({});
    const [hasSignature, setHasSignature] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedResult, setSubmittedResult] = useState<{
        applicationNo: string;
        pdfBytes?: Uint8Array;
    } | null>(null);

    const sigCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    // Initialize signature canvas
    useEffect(() => {
        const canvas = sigCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(300, rect.width) * dpr;
        canvas.height = 160 * dpr;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#11221e";
        }
    }, [submittedResult]);

    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = sigCanvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleSigPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        canvas.setPointerCapture(e.pointerId);
        isDrawingRef.current = true;
        const pt = getCanvasPoint(e);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        setHasSignature(true);
    };

    const handleSigPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const ctx = sigCanvasRef.current?.getContext("2d");
        if (!ctx) return;
        const pt = getCanvasPoint(e);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
    };

    const handleSigPointerUp = () => {
        isDrawingRef.current = false;
    };

    const clearSignature = () => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    // Custom fields from active template (excluding standard auto-mapped fields)
    const standardKeys = new Set([
        "customerName",
        "customerBirth",
        "customerGender",
        "customerPhone",
        "customerEmail",
        "customerZipcode",
        "customerAddress",
        "productType",
        "planType",
        "contractDate",
        "partnerCompanyName",
        "partnerAffiliation",
        "partnerEmployeeNumber",
        "partnerDepartmentName",
        "partnerManagerName",
        "signature",
    ]);

    const extraTemplateFields: ContractFieldDef[] = (
        (activeTemplate?.fields as ContractFieldDef[]) || []
    ).filter((f) => !standardKeys.has(f.fieldKey) && f.type !== "signature");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim()) return alert("가입자 성명을 입력해주세요.");
        if (!customerPhone.trim()) return alert("연락처를 입력해주세요.");
        if (!hasSignature) return alert("전자서명을 완료해주세요.");

        // Check required extra fields
        for (const f of extraTemplateFields) {
            if (f.required && !customValues[f.fieldKey]) {
                return alert(`"${f.label}" 항목을 입력(또는 체크)해주세요.`);
            }
        }

        setIsSubmitting(true);
        try {
            const sigDataUrl = sigCanvasRef.current?.toDataURL("image/png") || "";
            const todayStr = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

            const fullContractData: Record<string, any> = {
                ...customValues,
                customerName: customerName.trim(),
                customerBirth: customerBirth.trim(),
                customerGender,
                customerPhone: customerPhone.trim(),
                customerEmail: customerEmail.trim(),
                customerZipcode: customerZipcode.trim(),
                customerAddress: customerAddress.trim(),
                productType,
                planType: `${planType}구좌`,
                contractDate: todayStr,
                partnerCompanyName: partnerRecord?.companyName || partnerName || "본사 직접 신청",
                partnerAffiliation: "티유디지털",
                partnerEmployeeNumber: partnerRecord?.employeeNumber || "",
                partnerDepartmentName: partnerRecord?.departmentName || "",
                partnerManagerName: partnerRecord?.managerName || "",
            };

            let pdfBytes: Uint8Array | undefined;
            let contractPdfStorageId: any = undefined;

            if (activeTemplate?.pdfUrl) {
                pdfBytes = await generateFilledContractPdf({
                    templatePdfUrl: activeTemplate.pdfUrl,
                    fields: (activeTemplate.fields || []) as ContractFieldDef[],
                    contractData: fullContractData,
                    signatureDataUrl: sigDataUrl,
                });

                const uploadUrl = await generateUploadUrl();
                const uploadRes = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/pdf" },
                    body: new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }),
                });
                if (uploadRes.ok) {
                    const uploaded = await uploadRes.json();
                    contractPdfStorageId = uploaded.storageId;
                }
            }

            const res = await submitMaeumContract({
                partnerId: partnerId || "ADMIN",
                partnerName: partnerRecord?.companyName || partnerName || "본사 직접 신청",
                productType,
                planType,
                customerName: customerName.trim(),
                customerBirth: customerBirth.trim(),
                customerGender,
                customerPhone: customerPhone.trim(),
                customerEmail: customerEmail.trim(),
                customerAddress: customerAddress.trim(),
                customerZipcode: customerZipcode.trim(),
                accessPath: partnerUrl ? "P" : "D",
                contractTemplateId: activeTemplate ? String(activeTemplate._id) : undefined,
                contractData: fullContractData,
                contractSignatureDataUrl: sigDataUrl,
                contractPdfStorageId,
            });

            setSubmittedResult({
                applicationNo: res.applicationNo,
                pdfBytes,
            });
        } catch (err: any) {
            console.error("Contract submit error:", err);
            alert("전자계약 접수 중 오류가 발생했습니다: " + (err?.message || ""));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedResult) {
        return (
            <div className="min-h-screen bg-[#f5f6f3] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#e3ebdf] p-6 text-center space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#e6f3ec] text-[#295e52] flex items-center justify-center text-2xl font-bold">
                        ✓
                    </div>
                    <h1 className="text-xl font-bold text-[#193f39]">전자계약 접수가 완료되었습니다</h1>
                    <p className="text-sm text-[#5b695e]">
                        신청번호: <strong className="font-mono text-[#193f39]">{submittedResult.applicationNo}</strong>
                    </p>
                    <p className="text-xs text-[#7a8777] leading-relaxed">
                        입력하신 가입자 정보와 전자서명이 정상적으로 저장되었습니다.
                    </p>
                    <div className="pt-2 space-y-2.5">
                        {submittedResult.pdfBytes && (
                            <button
                                type="button"
                                onClick={() =>
                                    triggerPdfDownload(
                                        submittedResult.pdfBytes!,
                                        `마음든든_전자계약서_${customerName}_${submittedResult.applicationNo}.pdf`
                                    )
                                }
                                className="w-full py-3.5 rounded-xl bg-[#295e52] text-white font-bold text-sm hover:bg-[#1f4a40] transition-colors"
                            >
                                작성된 전자계약서 PDF 다운로드
                            </button>
                        )}
                        <Link
                            href={backHref}
                            className="block w-full py-3 rounded-xl bg-[#f0f4ee] text-[#295e52] font-bold text-sm hover:bg-[#e2eadf] transition-colors"
                        >
                            상품 안내 페이지로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f6f3] pb-12">
            {/* Mobile Sticky Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#e3ebdf] px-4 py-3">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href={backHref} className="text-xs font-bold text-[#5b695e] hover:text-[#193f39]">
                        ← 돌아가기
                    </Link>
                    <span className="text-sm font-extrabold text-[#193f39]">마음든든 전자계약 신청</span>
                    <span className="w-12" />
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 pt-5 space-y-4">
                {/* 상품 선택 카드 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <section className="bg-white rounded-2xl border border-[#e3ebdf] p-4 shadow-xs space-y-3">
                        <h2 className="text-sm font-extrabold text-[#193f39]">1. 가입 상품 선택</h2>
                        <div className="grid grid-cols-3 gap-2">
                            {(["마음든든3", "마음든든4", "마음든든5"] as const).map((prod) => {
                                const priceMap = { 마음든든3: "32,000원", 마음든든4: "43,000원", 마음든든5: "54,000원" };
                                const active = productType === prod;
                                return (
                                    <button
                                        key={prod}
                                        type="button"
                                        onClick={() => setProductType(prod)}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            active
                                                ? "border-[#295e52] bg-[#f1f7f2] ring-1 ring-[#295e52]"
                                                : "border-[#e3ebdf] bg-white"
                                        }`}
                                    >
                                        <div className="text-xs font-extrabold text-[#193f39]">{prod}</div>
                                        <div className="text-[11px] text-[#5b695e] mt-0.5">월 {priceMap[prod]}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#45554e] mb-1">구좌 수</label>
                            <select
                                value={planType}
                                onChange={(e) => setPlanType(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#d7e1d4] text-sm bg-white"
                            >
                                <option value="1">1구좌</option>
                                <option value="2">2구좌</option>
                                <option value="3">3구좌</option>
                            </select>
                        </div>
                    </section>

                    {/* 가입자 정보 입력 */}
                    <section className="bg-white rounded-2xl border border-[#e3ebdf] p-4 shadow-xs space-y-3">
                        <h2 className="text-sm font-extrabold text-[#193f39]">2. 가입자 정보 입력</h2>
                        <div>
                            <label className="block text-xs font-bold text-[#45554e] mb-1">성명 *</label>
                            <input
                                type="text"
                                required
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="홍길동"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="block text-xs font-bold text-[#45554e] mb-1">생년월일 (YYYYMMDD)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={customerBirth}
                                    onChange={(e) => setCustomerBirth(e.target.value)}
                                    placeholder="19800101"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#45554e] mb-1">성별</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {["남", "여"].map((g) => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setCustomerGender(g)}
                                            className={`py-2.5 rounded-xl border text-xs font-bold ${
                                                customerGender === g
                                                    ? "border-[#295e52] bg-[#295e52] text-white"
                                                    : "border-[#d7e1d4] bg-white text-[#45554e]"
                                            }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#45554e] mb-1">연락처 *</label>
                            <input
                                type="tel"
                                required
                                inputMode="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                                placeholder="010-1234-5678"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#45554e] mb-1">이메일</label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                value={customerZipcode}
                                onChange={(e) => setCustomerZipcode(e.target.value)}
                                placeholder="우편번호"
                                className="col-span-1 px-3 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                            />
                            <input
                                type="text"
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                placeholder="상세 주소 입력"
                                className="col-span-2 px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                            />
                        </div>
                    </section>

                    {/* 양식 기반 추가 입력 / 체크박스 */}
                    {extraTemplateFields.length > 0 && (
                        <section className="bg-white rounded-2xl border border-[#e3ebdf] p-4 shadow-xs space-y-3">
                            <h2 className="text-sm font-extrabold text-[#193f39]">3. 계약서 추가 확인 항목</h2>
                            {extraTemplateFields.map((field) => {
                                if (field.type === "checkbox") {
                                    return (
                                        <label
                                            key={field.id}
                                            className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8faf7] border border-[#e3ebdf] cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={Boolean(customValues[field.fieldKey])}
                                                onChange={(e) =>
                                                    setCustomValues((prev) => ({
                                                        ...prev,
                                                        [field.fieldKey]: e.target.checked,
                                                    }))
                                                }
                                                className="w-4 h-4 accent-[#295e52]"
                                            />
                                            <span className="text-xs font-semibold text-[#193f39]">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </span>
                                        </label>
                                    );
                                }
                                return (
                                    <div key={field.id}>
                                        <label className="block text-xs font-bold text-[#45554e] mb-1">
                                            {field.label} {field.required && "*"}
                                        </label>
                                        <input
                                            type={field.type === "date" ? "date" : "text"}
                                            value={customValues[field.fieldKey] || ""}
                                            onChange={(e) =>
                                                setCustomValues((prev) => ({
                                                    ...prev,
                                                    [field.fieldKey]: e.target.value,
                                                }))
                                            }
                                            placeholder={field.placeholder || `${field.label} 입력`}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#d7e1d4] text-sm"
                                        />
                                    </div>
                                );
                            })}
                        </section>
                    )}

                    {/* 전자서명 */}
                    <section className="bg-white rounded-2xl border border-[#e3ebdf] p-4 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-extrabold text-[#193f39]">
                                {extraTemplateFields.length > 0 ? "4." : "3."} 전자서명 *
                            </h2>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="text-xs font-bold text-[#6b7768] hover:text-[#193f39] underline"
                            >
                                다시 서명
                            </button>
                        </div>
                        <div className="relative rounded-xl border-2 border-dashed border-[#c9d6c5] bg-[#fcfdfb] overflow-hidden">
                            <canvas
                                ref={sigCanvasRef}
                                onPointerDown={handleSigPointerDown}
                                onPointerMove={handleSigPointerMove}
                                onPointerUp={handleSigPointerUp}
                                onPointerCancel={handleSigPointerUp}
                                className="w-full h-[160px] touch-none block cursor-crosshair"
                            />
                            {!hasSignature && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-[#9aa896]">
                                    여기에 손가락 또는 마우스로 서명해주세요
                                </div>
                            )}
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-2xl bg-[#295e52] text-white font-extrabold text-base shadow-md hover:bg-[#1e4a40] disabled:opacity-60 transition-colors"
                    >
                        {isSubmitting ? "전자계약서 생성 및 접수 중..." : "전자계약서 제출하기"}
                    </button>
                </form>
            </main>
        </div>
    );
}
