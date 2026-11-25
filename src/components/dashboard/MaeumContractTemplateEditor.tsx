"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AdminIcon } from "./AdminIcons";
import {
    ContractFieldDef,
    generateFilledContractPdf,
    triggerPdfDownload,
} from "@/lib/maeumPdf";

const PRESET_FIELDS: Array<{
    label: string;
    fieldKey: string;
    type: "text" | "checkbox" | "signature" | "date";
    category: "customer" | "partner" | "custom";
    widthRatio: number;
    heightRatio: number;
}> = [
    { label: "성명", fieldKey: "customerName", type: "text", category: "customer", widthRatio: 0.18, heightRatio: 0.032 },
    { label: "생년월일", fieldKey: "customerBirth", type: "text", category: "customer", widthRatio: 0.16, heightRatio: 0.032 },
    { label: "성별", fieldKey: "customerGender", type: "text", category: "customer", widthRatio: 0.08, heightRatio: 0.032 },
    { label: "연락처", fieldKey: "customerPhone", type: "text", category: "customer", widthRatio: 0.2, heightRatio: 0.032 },
    { label: "이메일", fieldKey: "customerEmail", type: "text", category: "customer", widthRatio: 0.24, heightRatio: 0.032 },
    { label: "우편번호", fieldKey: "customerZipcode", type: "text", category: "customer", widthRatio: 0.12, heightRatio: 0.032 },
    { label: "주소", fieldKey: "customerAddress", type: "text", category: "customer", widthRatio: 0.45, heightRatio: 0.032 },
    { label: "상품명", fieldKey: "productType", type: "text", category: "customer", widthRatio: 0.18, heightRatio: 0.032 },
    { label: "구좌수", fieldKey: "planType", type: "text", category: "customer", widthRatio: 0.08, heightRatio: 0.032 },
    { label: "신청일자", fieldKey: "contractDate", type: "date", category: "customer", widthRatio: 0.16, heightRatio: 0.032 },
    { label: "파트너사명", fieldKey: "partnerCompanyName", type: "text", category: "partner", widthRatio: 0.2, heightRatio: 0.032 },
    { label: "소속", fieldKey: "partnerAffiliation", type: "text", category: "partner", widthRatio: 0.18, heightRatio: 0.032 },
    { label: "사원번호", fieldKey: "partnerEmployeeNumber", type: "text", category: "partner", widthRatio: 0.15, heightRatio: 0.032 },
    { label: "부서(팀)명", fieldKey: "partnerDepartmentName", type: "text", category: "partner", widthRatio: 0.18, heightRatio: 0.032 },
    { label: "담당자명", fieldKey: "partnerManagerName", type: "text", category: "partner", widthRatio: 0.15, heightRatio: 0.032 },
    { label: "담당자 연락처", fieldKey: "partnerPhone", type: "text", category: "partner", widthRatio: 0.2, heightRatio: 0.032 },
    { label: "지정인 관계", fieldKey: "beneficiaryRelation", type: "text", category: "custom", widthRatio: 0.12, heightRatio: 0.025 },
    { label: "지정인 나이", fieldKey: "beneficiaryAge", type: "text", category: "custom", widthRatio: 0.08, heightRatio: 0.025 },
    { label: "카드사", fieldKey: "cardBrand", type: "text", category: "custom", widthRatio: 0.13, heightRatio: 0.025 },
    { label: "카드번호", fieldKey: "cardNumber", type: "text", category: "custom", widthRatio: 0.3, heightRatio: 0.025 },
    { label: "유효기간(월)", fieldKey: "cardMonth", type: "text", category: "custom", widthRatio: 0.06, heightRatio: 0.025 },
    { label: "유효기간(년)", fieldKey: "cardYear", type: "text", category: "custom", widthRatio: 0.06, heightRatio: 0.025 },
    { label: "예금주", fieldKey: "accountOwner", type: "text", category: "custom", widthRatio: 0.19, heightRatio: 0.025 },
    { label: "은행명", fieldKey: "bankName", type: "text", category: "custom", widthRatio: 0.19, heightRatio: 0.025 },
    { label: "계좌번호", fieldKey: "accountNumber", type: "text", category: "custom", widthRatio: 0.3, heightRatio: 0.025 },
    { label: "텍스트 입력", fieldKey: "customText", type: "text", category: "custom", widthRatio: 0.2, heightRatio: 0.032 },
    { label: "체크박스", fieldKey: "agreeCheck", type: "checkbox", category: "custom", widthRatio: 0.028, heightRatio: 0.024 },
    { label: "전자서명", fieldKey: "signature", type: "signature", category: "custom", widthRatio: 0.18, heightRatio: 0.065 },
];

export default function MaeumContractTemplateEditor() {
    const templates = useQuery(api.maeumContracts.getTemplates) || [];
    const generateUploadUrl = useMutation(api.maeumContracts.generateUploadUrl);
    const saveTemplate = useMutation(api.maeumContracts.saveTemplate);
    const updateTemplateFields = useMutation(api.maeumContracts.updateTemplateFields);
    const setActiveTemplate = useMutation(api.maeumContracts.setActiveTemplate);
    const deleteTemplate = useMutation(api.maeumContracts.deleteTemplate);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState("마음든든 전자계약서 양식");
    const [fields, setFields] = useState<ContractFieldDef[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [pendingPreset, setPendingPreset] = useState<(typeof PRESET_FIELDS)[0] | null>(null);

    const [pdfPages, setPdfPages] = useState<string[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [isRenderingPdf, setIsRenderingPdf] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Drag / Resize state
    const [dragState, setDragState] = useState<{
        fieldId: string;
        mode: "move" | "resize";
        startX: number;
        startY: number;
        origXRatio: number;
        origYRatio: number;
        origWRatio: number;
        origHRatio: number;
    } | null>(null);

    const canvasWrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentTemplate = templates.find((t: any) => String(t._id) === selectedTemplateId);

    // Auto-select active or first template on load
    useEffect(() => {
        if (!selectedTemplateId && templates.length > 0) {
            const active = templates.find((t: any) => t.isActive) || templates[0];
            setSelectedTemplateId(String(active._id));
            setTemplateName(active.name);
            setFields((active.fields || []) as ContractFieldDef[]);
        }
    }, [templates, selectedTemplateId]);

    const renderPdfToImages = useCallback(async (url: string) => {
        setIsRenderingPdf(true);
        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            const loadingTask = pdfjsLib.getDocument({ url });
            const pdf = await loadingTask.promise;
            const rendered: string[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.6 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    await page.render({ canvasContext: ctx, canvas, viewport }).promise;
                    rendered.push(canvas.toDataURL("image/png"));
                }
            }
            setPdfPages(rendered);
            setActivePage(1);
        } catch (err) {
            console.error("PDF render error:", err);
            alert("PDF 페이지를 렌더링하는 중 오류가 발생했습니다.");
        } finally {
            setIsRenderingPdf(false);
        }
    }, []);

    useEffect(() => {
        if (currentTemplate?.pdfUrl) {
            renderPdfToImages(currentTemplate.pdfUrl);
        } else {
            setPdfPages([]);
        }
    }, [currentTemplate?.pdfUrl, renderPdfToImages]);

    const handleSelectTemplate = (t: any) => {
        setSelectedTemplateId(String(t._id));
        setTemplateName(t.name);
        setFields((t.fields || []) as ContractFieldDef[]);
        setSelectedFieldId(null);
    };

    const handleUploadNewPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            alert("PDF 파일만 업로드 가능합니다.");
            return;
        }

        setIsUploading(true);
        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            const arrayBuf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuf.slice(0) }).promise;
            const pageCount = pdf.numPages;

            const uploadUrl = await generateUploadUrl();
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/pdf" },
                body: file,
            });
            if (!uploadRes.ok) throw new Error("파일 업로드 실패");
            const { storageId } = await uploadRes.json();

            const newId = await saveTemplate({
                name: file.name.replace(/\.pdf$/i, ""),
                storageId,
                fileName: file.name,
                pageCount,
                fields: [],
                isActive: true,
            });

            setSelectedTemplateId(String(newId));
            setTemplateName(file.name.replace(/\.pdf$/i, ""));
            setFields([]);
            setSelectedFieldId(null);
            alert("전자계약서 PDF 양식이 업로드되었습니다. 이제 우측/좌측 팔레트에서 입력 항목을 배치해주세요.");
        } catch (err: any) {
            console.error("Template upload error:", err);
            alert("양식 업로드 중 오류가 발생했습니다: " + (err?.message || ""));
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!pendingPreset || !canvasWrapperRef.current) return;
        const rect = canvasWrapperRef.current.getBoundingClientRect();
        const xRatio = Math.max(0, Math.min(0.95, (e.clientX - rect.left) / rect.width));
        const yRatio = Math.max(0, Math.min(0.95, (e.clientY - rect.top) / rect.height));

        const isUniqueKey = ["customText", "agreeCheck"].includes(pendingPreset.fieldKey);
        const existingCount = fields.filter((f) => f.fieldKey.startsWith(pendingPreset.fieldKey)).length;
        const fieldKey = isUniqueKey
            ? `${pendingPreset.fieldKey}_${existingCount + 1}`
            : pendingPreset.fieldKey;

        const newField: ContractFieldDef = {
            id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: pendingPreset.type,
            fieldKey,
            label: isUniqueKey ? `${pendingPreset.label} ${existingCount + 1}` : pendingPreset.label,
            placeholder: "",
            required: pendingPreset.type === "signature",
            page: activePage,
            xRatio: Math.min(xRatio, 1 - pendingPreset.widthRatio),
            yRatio: Math.min(yRatio, 1 - pendingPreset.heightRatio),
            widthRatio: pendingPreset.widthRatio,
            heightRatio: pendingPreset.heightRatio,
            fontSize: 10,
            checkedValue: pendingPreset.type === "checkbox" ? "V" : undefined,
        };

        setFields((prev) => [...prev, newField]);
        setSelectedFieldId(newField.id);
        setPendingPreset(null);
    };

    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            if (!dragState || !canvasWrapperRef.current) return;
            const rect = canvasWrapperRef.current.getBoundingClientRect();
            const dxRatio = (e.clientX - dragState.startX) / rect.width;
            const dyRatio = (e.clientY - dragState.startY) / rect.height;

            setFields((prev) =>
                prev.map((f) => {
                    if (f.id !== dragState.fieldId) return f;
                    if (dragState.mode === "move") {
                        return {
                            ...f,
                            xRatio: Math.max(0, Math.min(1 - f.widthRatio, dragState.origXRatio + dxRatio)),
                            yRatio: Math.max(0, Math.min(1 - f.heightRatio, dragState.origYRatio + dyRatio)),
                        };
                    } else {
                        return {
                            ...f,
                            widthRatio: Math.max(0.02, Math.min(1 - f.xRatio, dragState.origWRatio + dxRatio)),
                            heightRatio: Math.max(0.015, Math.min(1 - f.yRatio, dragState.origHRatio + dyRatio)),
                        };
                    }
                })
            );
        },
        [dragState]
    );

    const handlePointerUp = useCallback(() => {
        setDragState(null);
    }, []);

    useEffect(() => {
        if (dragState) {
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
            return () => {
                window.removeEventListener("pointermove", handlePointerMove);
                window.removeEventListener("pointerup", handlePointerUp);
            };
        }
    }, [dragState, handlePointerMove, handlePointerUp]);

    const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

    const updateSelectedField = (patch: Partial<ContractFieldDef>) => {
        if (!selectedFieldId) return;
        setFields((prev) =>
            prev.map((f) => (f.id === selectedFieldId ? { ...f, ...patch } : f))
        );
    };

    const handleDeleteField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
        if (selectedFieldId === id) setSelectedFieldId(null);
    };

    const handleSaveFields = async () => {
        if (!currentTemplate) return;
        setIsSaving(true);
        try {
            await updateTemplateFields({
                templateId: currentTemplate._id,
                name: templateName.trim() || currentTemplate.name,
                fields: fields.map((f) => ({
                    id: f.id,
                    type: f.type,
                    fieldKey: f.fieldKey,
                    label: f.label,
                    placeholder: f.placeholder || undefined,
                    required: Boolean(f.required),
                    page: f.page,
                    xRatio: f.xRatio,
                    yRatio: f.yRatio,
                    widthRatio: f.widthRatio,
                    heightRatio: f.heightRatio,
                    fontSize: f.fontSize || 10,
                    checkedValue: f.checkedValue || undefined,
                    groupName: f.groupName || undefined,
                })),
            });
            alert("전자계약서 양식 설정이 저장되었습니다.");
        } catch (err: any) {
            alert("저장 중 오류가 발생했습니다: " + (err?.message || ""));
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPreviewPdf = async () => {
        if (!currentTemplate?.pdfUrl) return;
        try {
            const sampleData: Record<string, any> = {};
            fields.forEach((f) => {
                if (f.type === "checkbox") sampleData[f.fieldKey] = true;
                else if (f.type === "date") sampleData[f.fieldKey] = "2026-11-18";
                else if (f.type === "text") sampleData[f.fieldKey] = `[${f.label} 테스트]`;
            });
            const bytes = await generateFilledContractPdf({
                templatePdfUrl: currentTemplate.pdfUrl,
                fields,
                contractData: sampleData,
            });
            triggerPdfDownload(bytes, `${templateName}_미리보기.pdf`);
        } catch (err: any) {
            alert("미리보기 PDF 생성 실패: " + (err?.message || ""));
        }
    };

    const currentPageFields = fields.filter((f) => f.page === activePage);

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">MAEUM · ELECTRONIC CONTRACT</div>
                    <h1>마음든든 전자계약 양식 관리</h1>
                    <p>
                        전자계약서 PDF 양식을 업로드하고, 텍스트 입력·체크박스·전자서명 위치를 배치하세요.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleUploadNewPdf}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="upload" />
                        <span>{isUploading ? "업로드 중..." : "새 PDF 양식 업로드"}</span>
                    </button>
                    {currentTemplate && (
                        <>
                            <button
                                type="button"
                                onClick={handleTestPreviewPdf}
                                className="adm-btn"
                            >
                                <AdminIcon name="download" />
                                <span>샘플 PDF 미리보기</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveFields}
                                disabled={isSaving}
                                className="adm-btn primary"
                            >
                                <AdminIcon name="check" />
                                <span>{isSaving ? "저장 중..." : "양식 필드 저장"}</span>
                            </button>
                        </>
                    )}
                </div>
            </section>

            {/* 저장된 양식 목록 */}
            <div className="adm-panel p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[#0c2340]">등록된 전자계약 양식 ({templates.length}건)</h3>
                </div>
                {templates.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#788699] bg-[#f8faf7] rounded-lg border border-dashed border-[#d5e0d0]">
                        등록된 PDF 양식이 없습니다. 우측 상단의 &quot;새 PDF 양식 업로드&quot; 버튼을 눌러 양식을 등록해주세요.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {templates.map((t: any) => {
                            const isSelected = String(t._id) === selectedTemplateId;
                            return (
                                <div
                                    key={t._id}
                                    onClick={() => handleSelectTemplate(t)}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                        isSelected
                                            ? "border-[#163a6b] bg-[#f2f7f1] shadow-sm"
                                            : "border-[#e3ebdf] bg-white hover:border-[#b8ccb4]"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <strong className="text-xs font-bold text-[#0c2340] truncate">
                                                    {t.name}
                                                </strong>
                                                {t.isActive && (
                                                    <span className="adm-pill green !text-[10px] !py-0">사용중</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-[#7a8777] mt-0.5 truncate">
                                                {t.fileName} · {t.pageCount}페이지 · 필드 {t.fields?.length || 0}개
                                            </p>
                                        </div>
                                        <div
                                            className="flex items-center gap-1 shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {!t.isActive && (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTemplate({ templateId: t._id })}
                                                    className="adm-btn small sage"
                                                >
                                                    활성화
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(`"${t.name}" 양식을 삭제하시겠습니까?`)) {
                                                        deleteTemplate({ templateId: t._id });
                                                        if (isSelected) setSelectedTemplateId(null);
                                                    }
                                                }}
                                                className="adm-btn small !text-red-600"
                                                title="삭제"
                                            >
                                                <AdminIcon name="trash" className="!w-3.5 !h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 에디터 작업 영역 */}
            {currentTemplate && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* 좌측: 필드 팔레트 */}
                    <div className="lg:col-span-3 adm-panel p-4 space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-[#3b495c] mb-1">양식 이름</label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="adm-input w-full !text-xs"
                            />
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#f3f7f1] border border-[#dce6d8] text-[11px] text-[#355248] leading-relaxed">
                            아래 항목을 클릭한 뒤, 가운데 PDF 화면에서 원하는 위치를 클릭하면 배치됩니다.
                            배치된 박스는 드래그로 이동하고 우하단 모서리로 크기를 조절할 수 있습니다.
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-[#163a6b] mb-1.5">가입자 기본 정보</div>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_FIELDS.filter((p) => p.category === "customer").map((p) => (
                                    <button
                                        key={p.fieldKey}
                                        type="button"
                                        onClick={() => setPendingPreset(pendingPreset?.fieldKey === p.fieldKey ? null : p)}
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                                            pendingPreset?.fieldKey === p.fieldKey
                                                ? "bg-[#163a6b] text-white border-[#163a6b]"
                                                : "bg-white text-[#162438] border-[#d6e0d2] hover:bg-[#f2f6f0]"
                                        }`}
                                    >
                                        + {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-[#163a6b] mb-1.5">파트너 정보 (자동 반영)</div>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_FIELDS.filter((p) => p.category === "partner").map((p) => (
                                    <button
                                        key={p.fieldKey}
                                        type="button"
                                        onClick={() => setPendingPreset(pendingPreset?.fieldKey === p.fieldKey ? null : p)}
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                                            pendingPreset?.fieldKey === p.fieldKey
                                                ? "bg-[#163a6b] text-white border-[#163a6b]"
                                                : "bg-white text-[#162438] border-[#d6e0d2] hover:bg-[#f2f6f0]"
                                        }`}
                                    >
                                        + {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-[11px] font-bold text-[#163a6b] mb-1.5">체크 · 자유입력 · 전자서명</div>
                            <div className="flex flex-wrap gap-1.5">
                                {PRESET_FIELDS.filter((p) => p.category === "custom").map((p) => (
                                    <button
                                        key={p.fieldKey}
                                        type="button"
                                        onClick={() => setPendingPreset(pendingPreset?.fieldKey === p.fieldKey ? null : p)}
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                                            pendingPreset?.fieldKey === p.fieldKey
                                                ? "bg-[#163a6b] text-white border-[#163a6b]"
                                                : "bg-[#faf8f2] text-[#162438] border-[#dfd8c5] hover:bg-[#f2ede0]"
                                        }`}
                                    >
                                        + {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 중앙: PDF 캔버스 */}
                    <div className="lg:col-span-6 adm-panel p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#0c2340]">
                                    페이지 {activePage} / {pdfPages.length || currentTemplate.pageCount}
                                </span>
                                {pendingPreset && (
                                    <span className="adm-pill orange animate-pulse">
                                        배치할 위치 클릭: {pendingPreset.label}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: pdfPages.length || 1 }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setActivePage(p)}
                                        className={`px-2.5 py-1 rounded text-xs font-bold ${
                                            activePage === p
                                                ? "bg-[#163a6b] text-white"
                                                : "bg-[#f0f4ee] text-[#3b495c] hover:bg-[#e1e9de]"
                                        }`}
                                    >
                                        {p}P
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isRenderingPdf ? (
                            <div className="py-24 text-center text-xs text-[#7a8777]">PDF 페이지를 불러오는 중...</div>
                        ) : pdfPages[activePage - 1] ? (
                            <div
                                ref={canvasWrapperRef}
                                onClick={handleCanvasClick}
                                className={`relative w-full border border-[#d5e0d0] rounded-lg overflow-hidden select-none bg-white ${
                                    pendingPreset ? "cursor-crosshair" : "cursor-default"
                                }`}
                            >
                                <img
                                    src={pdfPages[activePage - 1]}
                                    alt={`Page ${activePage}`}
                                    className="w-full h-auto block pointer-events-none"
                                    draggable={false}
                                />
                                {currentPageFields.map((field) => {
                                    const isSelected = field.id === selectedFieldId;
                                    const colorClass =
                                        field.type === "signature"
                                            ? "border-amber-600 bg-amber-500/15 text-amber-900"
                                            : field.type === "checkbox"
                                            ? "border-emerald-600 bg-emerald-500/20 text-emerald-900"
                                            : "border-blue-600 bg-blue-500/15 text-blue-950";

                                    return (
                                        <div
                                            key={field.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFieldId(field.id);
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                setSelectedFieldId(field.id);
                                                setDragState({
                                                    fieldId: field.id,
                                                    mode: "move",
                                                    startX: e.clientX,
                                                    startY: e.clientY,
                                                    origXRatio: field.xRatio,
                                                    origYRatio: field.yRatio,
                                                    origWRatio: field.widthRatio,
                                                    origHRatio: field.heightRatio,
                                                });
                                            }}
                                            style={{
                                                left: `${field.xRatio * 100}%`,
                                                top: `${field.yRatio * 100}%`,
                                                width: `${field.widthRatio * 100}%`,
                                                height: `${field.heightRatio * 100}%`,
                                            }}
                                            className={`absolute border-2 rounded-sm flex items-center justify-center text-[10px] font-bold cursor-move transition-shadow ${colorClass} ${
                                                isSelected ? "ring-2 ring-[#0c2340] z-20 shadow-md" : "z-10"
                                            }`}
                                            title={`${field.label} (${field.fieldKey})`}
                                        >
                                            <span className="truncate px-1 pointer-events-none">
                                                {field.type === "checkbox" ? "✓" : field.label}
                                            </span>
                                            <div
                                                onPointerDown={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFieldId(field.id);
                                                    setDragState({
                                                        fieldId: field.id,
                                                        mode: "resize",
                                                        startX: e.clientX,
                                                        startY: e.clientY,
                                                        origXRatio: field.xRatio,
                                                        origYRatio: field.yRatio,
                                                        origWRatio: field.widthRatio,
                                                        origHRatio: field.heightRatio,
                                                    });
                                                }}
                                                className="absolute -right-1 -bottom-1 w-2.5 h-2.5 bg-[#0c2340] border border-white rounded-xs cursor-nwse-resize"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center text-xs text-[#788699]">
                                PDF 미리보기를 표시할 수 없습니다.
                            </div>
                        )}
                    </div>

                    {/* 우측: 선택된 필드 속성 */}
                    <div className="lg:col-span-3 adm-panel p-4 space-y-3">
                        <h3 className="text-xs font-bold text-[#0c2340] border-b border-[#edf2ea] pb-2">
                            선택된 필드 속성
                        </h3>
                        {!selectedField ? (
                            <p className="text-xs text-[#788699] py-6 text-center">
                                캔버스에서 필드를 선택하면 세부 속성을 수정할 수 있습니다.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-[#3b495c] mb-1">표시 라벨 (항목명)</label>
                                    <input
                                        type="text"
                                        value={selectedField.label}
                                        onChange={(e) => updateSelectedField({ label: e.target.value })}
                                        className="adm-input w-full !text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#3b495c] mb-1">필드 키 (매핑 키)</label>
                                    <input
                                        type="text"
                                        value={selectedField.fieldKey}
                                        onChange={(e) => updateSelectedField({ fieldKey: e.target.value })}
                                        className="adm-input w-full !text-xs font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-[#3b495c] mb-1">입력 유형</label>
                                    <select
                                        value={selectedField.type}
                                        onChange={(e) => updateSelectedField({ type: e.target.value as any })}
                                        className="adm-select w-full !text-xs"
                                    >
                                        <option value="text">텍스트 입력</option>
                                        <option value="checkbox">체크박스</option>
                                        <option value="date">날짜</option>
                                        <option value="signature">전자서명</option>
                                    </select>
                                </div>
                                {selectedField.type !== "checkbox" && selectedField.type !== "signature" && (
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#3b495c] mb-1">글자 크기 (pt)</label>
                                        <input
                                            type="number"
                                            min={6}
                                            max={24}
                                            value={selectedField.fontSize || 10}
                                            onChange={(e) =>
                                                updateSelectedField({ fontSize: Number(e.target.value) || 10 })
                                            }
                                            className="adm-input w-full !text-xs"
                                        />
                                    </div>
                                )}
                                <label className="flex items-center gap-2 text-xs font-semibold text-[#162438] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(selectedField.required)}
                                        onChange={(e) => updateSelectedField({ required: e.target.checked })}
                                    />
                                    필수 입력 항목
                                </label>
                                <div className="pt-2 border-t border-[#edf2ea]">
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteField(selectedField.id)}
                                        className="adm-btn small w-full justify-center !text-red-600"
                                    >
                                        <AdminIcon name="trash" className="!w-3.5 !h-3.5" />
                                        <span>이 필드 삭제</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
