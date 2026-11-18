import { PDFDict, PDFDocument, PDFName, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export interface ContractFieldDef {
    id: string;
    type: "text" | "checkbox" | "signature" | "date" | string;
    fieldKey: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    page: number;
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
    fontSize?: number;
    checkedValue?: string;
    groupName?: string;
}

let cachedFontBytes: ArrayBuffer | null = null;

async function getKoreanFontBytes(): Promise<ArrayBuffer> {
    if (cachedFontBytes) return cachedFontBytes;
    const res = await fetch("/fonts/NanumGothic-Regular.ttf");
    if (!res.ok) {
        throw new Error("한글 폰트(/fonts/NanumGothic-Regular.ttf)를 불러오지 못했습니다.");
    }
    cachedFontBytes = await res.arrayBuffer();
    return cachedFontBytes;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * PDF 템플릿에 가입자 입력 데이터와 전자서명을 합성하여 완성된 PDF 바이트를 반환합니다.
 */
export async function generateFilledContractPdf(params: {
    templatePdfUrl: string;
    fields: ContractFieldDef[];
    contractData: Record<string, any>;
    signatureDataUrl?: string;
}): Promise<Uint8Array> {
    const { templatePdfUrl, fields, contractData, signatureDataUrl } = params;

    const [pdfRes, fontBytes] = await Promise.all([
        fetch(templatePdfUrl),
        getKoreanFontBytes(),
    ]);

    if (!pdfRes.ok) {
        throw new Error("전자계약서 PDF 양식을 불러오지 못했습니다.");
    }

    const pdfBytes = await pdfRes.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit);
    const koreanFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();

    // PDF 원본에 포함된 기존 AcroForm/Widget 음영 박스 제거 (투명 배경 유지)
    try {
        const form = pdfDoc.getForm();
        for (const formField of form.getFields()) {
            try {
                form.removeField(formField);
            } catch {
                // ignore if already removed
            }
        }
        pdfDoc.catalog.delete(PDFName.of("AcroForm"));
    } catch {
        // ignore if PDF has no AcroForm
    }
    for (const page of pages) {
        const annots = page.node.Annots();
        if (annots) {
            for (let i = annots.size() - 1; i >= 0; i--) {
                const annot = annots.lookup(i);
                if (annot instanceof PDFDict && annot.get(PDFName.of("Subtype")) === PDFName.of("Widget")) {
                    annots.remove(i);
                }
            }
        }
    }

    let embeddedSig: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
    if (signatureDataUrl && signatureDataUrl.startsWith("data:image/png")) {
        try {
            embeddedSig = await pdfDoc.embedPng(dataUrlToUint8Array(signatureDataUrl));
        } catch (err) {
            console.error("Signature PNG embed error:", err);
        }
    }

    for (const field of fields) {
        const pageIndex = (field.page || 1) - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { width: pageW, height: pageH } = page.getSize();

        const boxW = field.widthRatio * pageW;
        const boxH = field.heightRatio * pageH;
        const pdfX = field.xRatio * pageW;
        const pdfY = pageH - (field.yRatio + field.heightRatio) * pageH;

        const rawVal = contractData?.[field.fieldKey];

        if (field.type === "checkbox") {
            const isChecked =
                rawVal === true ||
                rawVal === "true" ||
                rawVal === "Y" ||
                rawVal === "1" ||
                (field.checkedValue && rawVal === field.checkedValue);

            if (isChecked) {
                const cx = pdfX + boxW * 0.5;
                const cy = pdfY + boxH * 0.5;
                const size = Math.min(boxW, boxH) * 0.38;
                page.drawLine({
                    start: { x: cx - size * 0.85, y: cy + size * 0.05 },
                    end: { x: cx - size * 0.15, y: cy - size * 0.65 },
                    thickness: 1.6,
                    color: rgb(0.08, 0.25, 0.2),
                });
                page.drawLine({
                    start: { x: cx - size * 0.15, y: cy - size * 0.65 },
                    end: { x: cx + size * 0.95, y: cy + size * 0.75 },
                    thickness: 1.6,
                    color: rgb(0.08, 0.25, 0.2),
                });
            }
            continue;
        }

        if (field.type === "signature") {
            const sigUrl =
                typeof rawVal === "string" && rawVal.startsWith("data:image/png")
                    ? rawVal
                    : signatureDataUrl;

            let sigImg = embeddedSig;
            if (sigUrl && sigUrl !== signatureDataUrl && sigUrl.startsWith("data:image/png")) {
                try {
                    sigImg = await pdfDoc.embedPng(dataUrlToUint8Array(sigUrl));
                } catch {
                    sigImg = embeddedSig;
                }
            }

            if (sigImg) {
                const dims = sigImg.scaleToFit(boxW * 0.92, boxH * 0.92);
                page.drawImage(sigImg, {
                    x: pdfX + (boxW - dims.width) / 2,
                    y: pdfY + (boxH - dims.height) / 2,
                    width: dims.width,
                    height: dims.height,
                });
            }
            continue;
        }

        // text or date
        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "") {
            const text = String(rawVal).trim();
            const availW = Math.max(16, boxW - 6);
            let fontSize = field.fontSize || 10;
            while (fontSize > 6.5 && koreanFont.widthOfTextAtSize(text, fontSize) > availW) {
                fontSize = Math.max(6.5, fontSize - 0.5);
            }
            const textY = pdfY + Math.max(1.5, (boxH - fontSize) / 2);

            page.drawText(text, {
                x: pdfX + 3,
                y: textY,
                size: fontSize,
                font: koreanFont,
                color: rgb(0.08, 0.08, 0.08),
                maxWidth: availW,
            });
        }
    }

    return await pdfDoc.save();
}

export function triggerPdfDownload(pdfBytes: Uint8Array, fileName: string) {
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
