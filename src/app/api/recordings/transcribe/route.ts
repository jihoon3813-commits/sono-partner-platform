import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

export const maxDuration = 60; // Vercel Serverless Function 최대 실행 시간 (초)

async function getDbOpenAiKey(): Promise<string> {
    try {
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) return "";
        const client = new ConvexHttpClient(convexUrl);
        const setting = await client.query("settings:getSetting" as any, { key: "openai_api_key" });
        return (setting?.value || "").trim();
    } catch {
        return "";
    }
}

function formatTimestamp(seconds: number): string {
    const totalSec = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function ensureSupportedFileName(fileName?: string, fileType?: string): string {
    const supportedExts = [".flac", ".m4a", ".mp3", ".mp4", ".mpeg", ".mpga", ".oga", ".ogg", ".wav", ".webm"];
    if (fileName) {
        const lower = fileName.toLowerCase();
        if (supportedExts.some((ext) => lower.endsWith(ext))) {
            return fileName;
        }
    }

    if (fileType) {
        if (fileType.includes("mp4") || fileType.includes("m4a") || fileType.includes("aac")) return "recording.m4a";
        if (fileType.includes("wav")) return "recording.wav";
        if (fileType.includes("ogg")) return "recording.ogg";
        if (fileType.includes("webm")) return "recording.webm";
        if (fileType.includes("flac")) return "recording.flac";
    }

    return "recording.mp3";
}

export async function GET() {
    return NextResponse.json({
        hasServerApiKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0),
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            audioUrl,
            fileName,
            fileType,
            apiKey: clientApiKey,
            includeTimestamps = true,
        } = body as {
            audioUrl?: string;
            fileName?: string;
            fileType?: string;
            apiKey?: string;
            includeTimestamps?: boolean;
        };

        if (!audioUrl) {
            return NextResponse.json(
                { error: "음성 파일 URL이 제공되지 않았습니다." },
                { status: 400 }
            );
        }

        const dbKey = await getDbOpenAiKey();
        const apiKey = (process.env.OPENAI_API_KEY || clientApiKey || dbKey || "").trim();
        if (!apiKey) {
            return NextResponse.json(
                {
                    error: "OpenAI API 키가 설정되지 않았습니다. 총괄 어드민의 [🔑 STT 설정]에서 키를 등록하거나 환경변수(OPENAI_API_KEY)를 설정해주세요.",
                    code: "MISSING_API_KEY",
                },
                { status: 400 }
            );
        }

        // 1. Convex Storage에서 오디오 파일 다운로드
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            return NextResponse.json(
                { error: `음성 파일을 불러오는데 실패했습니다. (HTTP ${audioResponse.status})` },
                { status: 502 }
            );
        }

        const arrayBuffer = await audioResponse.arrayBuffer();
        const maxWhisperBytes = 25 * 1024 * 1024; // OpenAI Whisper 단일 파일 최대 25MB 제한
        if (arrayBuffer.byteLength > maxWhisperBytes) {
            return NextResponse.json(
                {
                    error: "OpenAI Whisper API는 최대 25MB 이하의 오디오 파일만 변환할 수 있습니다. 업로드 시 '통화 음성 고압축 최적화' 옵션을 켜서 다시 업로드해주세요.",
                },
                { status: 413 }
            );
        }

        const safeFileName = ensureSupportedFileName(fileName, fileType);
        const mimeType = fileType || "audio/mpeg";
        const audioBlob = new Blob([arrayBuffer], { type: mimeType });

        // 2. OpenAI Whisper API 호출용 FormData 구성
        const formData = new FormData();
        formData.append("file", audioBlob, safeFileName);
        formData.append("model", "whisper-1");
        formData.append("language", "ko");
        formData.append("response_format", "verbose_json");
        formData.append(
            "prompt",
            "소노아임레디, 더 해피 450 ONE, 스마트케어, 마음, 상조, 구좌, 결합상품, 가전제품, 가입 동의, 약관 안내, 청약철회, 해약, 만기 환급, 월 납입금, 제휴카드 할인, 상담원, 고객님"
        );

        const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!whisperRes.ok) {
            let errorDetail = "";
            try {
                const errJson = await whisperRes.json();
                errorDetail = errJson?.error?.message || JSON.stringify(errJson);
            } catch {
                errorDetail = await whisperRes.text();
            }

            if (whisperRes.status === 401) {
                return NextResponse.json(
                    {
                        error: "OpenAI API 키가 유효하지 않습니다. API 키를 다시 확인해주세요.",
                        detail: errorDetail,
                        code: "INVALID_API_KEY",
                    },
                    { status: 401 }
                );
            }

            if (whisperRes.status === 429) {
                return NextResponse.json(
                    {
                        error: "OpenAI API 호출 한도 초과 또는 크레딧 잔액이 부족합니다. OpenAI 계정의 결제/크레딧 상태를 확인해주세요.",
                        detail: errorDetail,
                    },
                    { status: 429 }
                );
            }

            return NextResponse.json(
                {
                    error: `음성 텍스트 변환 실패 (HTTP ${whisperRes.status}): ${errorDetail}`,
                },
                { status: whisperRes.status }
            );
        }

        const result = await whisperRes.json();
        const rawText: string = (result.text || "").trim();
        const segments: Array<{ start: number; end: number; text: string }> = Array.isArray(result.segments)
            ? result.segments
            : [];

        // 구간별 타임스탬프 포맷 텍스트 생성
        let timestampedText = rawText;
        let plainSegmentedText = rawText;

        if (segments.length > 0) {
            timestampedText = segments
                .map((seg) => `[${formatTimestamp(seg.start)}] ${(seg.text || "").trim()}`)
                .filter((line) => !line.endsWith("] "))
                .join("\n");

            plainSegmentedText = segments
                .map((seg) => (seg.text || "").trim())
                .filter(Boolean)
                .join("\n");
        }

        const transcript = includeTimestamps ? timestampedText : plainSegmentedText;

        return NextResponse.json({
            success: true,
            transcript: transcript || "(인식된 음성 텍스트가 없습니다.)",
            timestampedText: timestampedText || rawText,
            plainText: plainSegmentedText || rawText,
            duration: result.duration,
        });
    } catch (error) {
        console.error("녹취 STT 변환 오류:", error);
        return NextResponse.json(
            {
                error:
                    "서버에서 음성 변환 처리 중 오류가 발생했습니다: " +
                    (error instanceof Error ? error.message : String(error)),
            },
            { status: 500 }
        );
    }
}
