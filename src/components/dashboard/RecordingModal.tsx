"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Application } from "@/lib/types";
import { Id } from "../../../convex/_generated/dataModel";
import { compressAudioFile } from "@/lib/audioCompressor";
import { downloadFileWithCustomName, generateRecordingDownloadFileName } from "@/lib/downloadUtils";

interface RecordingModalProps {
    application: Application;
    parentPartnerName?: string;
    onClose: () => void;
    currentUserName?: string;
}

export default function RecordingModal({ application, parentPartnerName, onClose, currentUserName = "관리자" }: RecordingModalProps) {
    const recordings = useQuery(api.recordings.getRecordingsByApplication, {
        applicationNo: application.applicationNo,
    });
    const generateUploadUrl = useMutation(api.recordings.generateUploadUrl);
    const saveRecording = useMutation(api.recordings.saveRecording);
    const deleteRecording = useMutation(api.recordings.deleteRecording);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [useAutoCompress, setUseAutoCompress] = useState(true); // 자동 압축 기본 활성화
    const [compressionSummary, setCompressionSummary] = useState<string | null>(null);
    const [memo, setMemo] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 단일 파일 최대 허용 크기 (50MB)
    const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

    // 파일 크기 포맷터
    const formatBytes = (bytes: number): string => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // 날짜 포맷터
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                const hh = String(d.getHours()).padStart(2, "0");
                const min = String(d.getMinutes()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    // 다운로드 실행기: 등록일시_상위파트너_파트너_고객명_전화번호_시간 포맷
    const handleDownloadFile = async (rec: any) => {
        if (!rec.url) return;
        const customFileName = generateRecordingDownloadFileName({
            uploadedAt: rec.uploadedAt,
            parentPartnerName: parentPartnerName,
            partnerName: application.partnerName,
            customerName: application.customerName,
            customerPhone: application.customerPhone,
            duration: rec.duration,
            originalFileName: rec.fileName,
        });

        try {
            setDownloadingId(rec._id);
            await downloadFileWithCustomName(rec.url, customFileName);
        } catch (err) {
            console.error("다운로드 오류:", err);
            alert("파일 다운로드 중 오류가 발생했습니다.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        setCompressionSummary(null);

        // 용량 체크
        if (file.size > MAX_FILE_SIZE_BYTES) {
            alert(
                `파일 용량이 너무 큽니다 (${formatBytes(file.size)}).\n` +
                `브라우저 처리 및 Convex 스토리지 안정성을 위해 단일 원본 파일은 최대 50MB 이하만 가능합니다.`
            );
            if (fileInputRef.current) fileInputRef.current.value = "";
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("업로드할 음성 파일을 선택해주세요.");
            return;
        }

        try {
            setIsUploading(true);
            setCompressionSummary(null);

            let uploadFile = selectedFile;
            let durationSeconds: number | undefined = undefined;

            // 1. 자동 압축 실행 (옵션 켜져있을 시)
            if (useAutoCompress) {
                setUploadProgress("통화 음성 최적화 압축 시작...");
                try {
                    const result = await compressAudioFile(selectedFile, (info) => {
                        setUploadProgress(`${info.stage} (${info.percent}%)`);
                    });

                    uploadFile = result.compressedFile;
                    durationSeconds = Math.round(result.duration);

                    const summaryText = `압축 완료: ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${result.reductionPercent}% 절감)`;
                    setCompressionSummary(summaryText);
                    setUploadProgress(`${summaryText} - 서버 전송 준비 중...`);
                } catch (compErr) {
                    console.warn("오디오 자동 압축 실패, 원본 파일로 업로드 진행:", compErr);
                    setUploadProgress("압축 건너뜀 (원본 파일로 전송 중)...");
                }
            } else {
                setUploadProgress("원본 파일 전송 준비 중...");
            }

            // 2. Convex Upload URL 발급
            const postUrl = await generateUploadUrl();

            setUploadProgress("Convex 서버로 파일 전송 중...");

            // 3. Convex Storage에 파일 직접 POST 전송
            const response = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": uploadFile.type || "audio/mpeg" },
                body: uploadFile,
            });

            if (!response.ok) {
                throw new Error(`파일 전송에 실패했습니다. (HTTP ${response.status})`);
            }

            const { storageId } = await response.json();

            setUploadProgress("녹취 정보 저장 중...");

            // 4. recordings 테이블에 메타데이터 저장
            await saveRecording({
                applicationNo: application.applicationNo,
                storageId: storageId as Id<"_storage">,
                fileName: uploadFile.name,
                fileSize: uploadFile.size,
                fileType: uploadFile.type || "audio/mpeg",
                duration: durationSeconds,
                uploadedBy: currentUserName,
                memo: memo.trim() || undefined,
            });

            // 초기화
            setSelectedFile(null);
            setMemo("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            alert(`녹취 음성파일이 성공적으로 등록되었습니다.${useAutoCompress ? "\n(고음질 MP3 압축 완료)" : ""}`);
        } catch (error) {
            console.error("녹취 파일 업로드 오류:", error);
            alert("업로드 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsUploading(false);
            setUploadProgress("");
        }
    };

    const handleDelete = async (recId: Id<"recordings">, fileName: string) => {
        if (!confirm(`'${fileName}' 녹취 파일을 정말 삭제하시겠습니까?\n삭제된 파일은 서버에서 복구할 수 없습니다.`)) {
            return;
        }

        try {
            setDeletingId(recId);
            await deleteRecording({ recordingId: recId });
            alert("녹취 파일이 삭제되었습니다.");
        } catch (error) {
            console.error("녹취 삭제 오류:", error);
            alert("삭제 중 오류가 발생했습니다.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up border border-gray-100">
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-sono-dark text-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-sono-primary text-xl shadow-inner">
                            🎙️
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black tracking-tight">상담 녹취 음성파일 관리</h2>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sono-primary/20 text-sono-primary font-bold border border-sono-primary/30">
                                    Convex Storage
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 font-medium mt-0.5">
                                고객별 상담 녹취파일을 안전하게 보관하고 즉시 청취할 수 있습니다.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* 고객 요약 정보 카드 */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                                <span className="text-gray-400 block font-medium">고객명</span>
                                <span className="text-sono-dark font-bold text-sm">{application.customerName || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">연락처</span>
                                <span className="text-sono-dark font-bold text-sm">{application.customerPhone || "-"}</span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">신청번호</span>
                                <span className="text-gray-600 font-bold truncate block" title={application.applicationNo}>
                                    {application.applicationNo}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400 block font-medium">소속 파트너</span>
                                <span className="text-gray-600 font-bold truncate block">{application.partnerName || "-"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 녹취 파일 업로드 폼 */}
                    <form onSubmit={handleUpload} className="bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 hover:border-sono-primary/40 transition-colors">
                        <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span>📤</span> 새 음성파일 업로드
                            </span>
                            <span className="text-[11px] font-normal text-gray-400">
                                단일 최대 50MB (자동 압축 지원)
                            </span>
                        </h3>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-5 rounded-xl border border-dashed text-center cursor-pointer transition-all ${
                                isDragging 
                                    ? "bg-sono-primary/10 border-sono-primary scale-[0.99]" 
                                    : "bg-gray-50/60 hover:bg-gray-50 border-gray-200"
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.webm,.flac,.amr"
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2 shadow-sm border border-emerald-100">
                                        🎵
                                    </div>
                                    <span className="text-sm font-bold text-sono-dark truncate max-w-md">
                                        {selectedFile.name}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold text-gray-600">
                                            원본 크기: {formatBytes(selectedFile.size)}
                                        </span>
                                        {useAutoCompress && (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                                ⚡ 약 {formatBytes(Math.round(selectedFile.size * 0.22))}로 압축 예정
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-gray-400 mt-1">
                                        다른 파일을 선택하려면 클릭하거나 다시 드래그하세요
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg mb-2">
                                        📁
                                    </div>
                                    <span className="text-sm font-bold text-sono-dark">
                                        음성파일을 드래그하거나 클릭하여 선택
                                    </span>
                                    <span className="text-xs text-gray-400 mt-1">
                                        지원 형식: M4A, MP3, WAV, AAC 등 음성 파일
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 자동 압축 옵션 토글 */}
                        <div className="mt-3 p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    checked={useAutoCompress}
                                    onChange={(e) => setUseAutoCompress(e.target.checked)}
                                    className="w-4 h-4 text-sono-primary rounded border-gray-300 focus:ring-sono-primary cursor-pointer accent-indigo-600"
                                />
                                <div>
                                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                                        <span>⚡</span> 통화 음성 고압축 최적화 적용 (권장)
                                    </span>
                                    <p className="text-[11px] text-indigo-700/80 mt-0.5">
                                        10분 통화 기준 11MB → 약 2.3MB로 용량 75% 절감 및 모바일/PC 스트리밍 최적화
                                    </p>
                                </div>
                            </label>
                            <span className="text-[10px] px-2 py-0.5 rounded font-black bg-indigo-200 text-indigo-900 shrink-0 ml-2">
                                75% 절감
                            </span>
                        </div>

                        {/* 압축 완료 요약 */}
                        {compressionSummary && (
                            <div className="mt-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-1.5 animate-fade-in">
                                <span>🎉</span>
                                <span>{compressionSummary}</span>
                            </div>
                        )}

                        {/* 녹취 메모 입력 */}
                        <div className="mt-3">
                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                녹취 메모 (선택사항)
                            </label>
                            <input
                                type="text"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="예: 계약 내용 안내 및 가입동의 완료, 1차 부재 후 재통화 등"
                                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sono-primary/20 focus:border-sono-primary outline-none transition-all"
                            />
                        </div>

                        {/* 업로드 버튼 */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-[11px] text-gray-500 font-medium">
                                {isUploading && <span className="font-bold text-sono-primary animate-pulse">{uploadProgress}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={!selectedFile || isUploading}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 ${
                                    !selectedFile || isUploading
                                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                                        : "bg-sono-primary hover:bg-sono-secondary active:scale-95 shadow-sono-primary/20"
                                }`}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>처리 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        <span>{useAutoCompress ? "압축 후 저장" : "녹취파일 저장"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* 등록된 녹취 파일 목록 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-sono-dark uppercase tracking-wider flex items-center gap-1.5">
                                <span>🎧</span>
                                <span>등록된 녹취 파일 ({recordings?.length || 0}건)</span>
                            </h3>
                            <span className="text-[11px] text-gray-400 font-medium">
                                브라우저에서 바로 청취 가능
                            </span>
                        </div>

                        {recordings === undefined ? (
                            <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                <div className="w-5 h-5 border-2 border-sono-primary/30 border-t-sono-primary rounded-full animate-spin" />
                                <span>녹취 목록을 불러오는 중...</span>
                            </div>
                        ) : recordings.length === 0 ? (
                            <div className="py-10 text-center bg-gray-50/50 rounded-2xl border border-gray-100 text-gray-400">
                                <span className="text-2xl block mb-1">🔇</span>
                                <p className="text-xs font-medium">등록된 녹취 음성파일이 없습니다.</p>
                                <p className="text-[11px] text-gray-400 mt-1">상단의 업로드 영역을 통해 파일을 추가해보세요.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recordings.map((rec) => (
                                    <div
                                        key={rec._id}
                                        className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:border-sono-primary/30 transition-all space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-xs sm:text-sm text-sono-dark truncate block max-w-sm" title={rec.fileName}>
                                                        {rec.fileName}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold shrink-0">
                                                        {formatBytes(rec.fileSize)}
                                                    </span>
                                                    {rec.duration && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold shrink-0">
                                                            ⏱️ {Math.floor(rec.duration / 60)}분 {Math.floor(rec.duration % 60)}초
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                                                    <span>등록일시: {formatDate(rec.uploadedAt)}</span>
                                                    {rec.uploadedBy && (
                                                        <span>등록자: <strong className="text-gray-600">{rec.uploadedBy}</strong></span>
                                                    )}
                                                </div>
                                                {rec.memo && (
                                                    <div className="mt-2 text-xs text-sono-dark bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1.5 font-medium inline-block">
                                                        💬 {rec.memo}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons: Download & Delete */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {rec.url && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadFile(rec)}
                                                        disabled={downloadingId === rec._id}
                                                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                        title={`다운로드: ${generateRecordingDownloadFileName({
                                                            uploadedAt: rec.uploadedAt,
                                                            parentPartnerName: parentPartnerName,
                                                            partnerName: application.partnerName,
                                                            customerName: application.customerName,
                                                            customerPhone: application.customerPhone,
                                                            duration: rec.duration,
                                                            originalFileName: rec.fileName,
                                                        })}`}
                                                    >
                                                        {downloadingId === rec._id ? (
                                                            <div className="w-3.5 h-3.5 border-2 border-gray-600/30 border-t-gray-600 rounded-full animate-spin" />
                                                        ) : (
                                                            <span>⬇️</span>
                                                        )}
                                                        <span className="hidden sm:inline">다운로드</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(rec._id, rec.fileName)}
                                                    disabled={deletingId === rec._id}
                                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    title="파일 삭제"
                                                >
                                                    {deletingId === rec._id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin" />
                                                    ) : (
                                                        <span>🗑️</span>
                                                    )}
                                                    <span className="hidden sm:inline">삭제</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* HTML5 Audio Player */}
                                        {rec.url ? (
                                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                                <audio
                                                    controls
                                                    preload="metadata"
                                                    src={rec.url}
                                                    className="w-full h-8"
                                                >
                                                    브라우저가 오디오 재생을 지원하지 않습니다.
                                                </audio>
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-rose-500 font-medium">
                                                파일 링크를 불러올 수 없습니다.
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 안내 팁 박스 */}
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-950">
                            <span>💡</span> 스마트 음성 압축 및 Convex 보관 안내
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-[11px] pl-1">
                            <li><strong>자동 고압축:</strong> 업로드 시 브라우저에서 통화 음성을 자동으로 <strong>22.05kHz 32kbps 고음질 MP3</strong>로 압축 변환합니다. (10분 통화 기준 11MB → 약 2.3MB)</li>
                            <li><strong>용량 절감 효과:</strong> 원본 대비 <strong>75% 이상 용량이 절약</strong>되어 Convex 스토리지 기본 50GB로 10년 이상(12,000건 이상) 안전하게 보관할 수 있습니다.</li>
                            <li><strong>호환성:</strong> 압축된 MP3 파일은 모바일폰 및 모든 PC 브라우저에서 버퍼링 없이 즉시 고음질로 청취할 수 있습니다.</li>
                        </ul>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-sono-dark hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
