"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface ResourceCenterProps {
    isAdmin: boolean;
}

export default function ResourceCenter({ isAdmin }: ResourceCenterProps) {
    const [selectedType, setSelectedType] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const resources = useQuery(api.resources.listResources, {
        type: selectedType === "all" ? undefined : selectedType
    });

    const deleteResource = useMutation(api.resources.deleteResource);

    const handleDelete = async (id: Id<"resources">) => {
        if (confirm("정말 이 자료를 삭제하시겠습니까?")) {
            await deleteResource({ id });
        }
    };

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Filter & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                    {["all", "image", "video", "file"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedType === type
                                ? "bg-white text-sono-primary shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {type === "all" ? "전체" : type === "image" ? "이미지" : type === "video" ? "영상" : "일반파일"}
                        </button>
                    ))}
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto px-6 py-3 bg-sono-primary text-white rounded-2xl font-bold hover:bg-sono-secondary transition-all shadow-lg shadow-sono-primary/20 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        자료 등록
                    </button>
                )}
            </div>

            {/* Resource Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!resources ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-bold">자료를 불러오는 중...</div>
                ) : resources.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-bold bg-white rounded-[32px] border border-dashed border-gray-200">
                        등록된 자료가 없습니다.
                    </div>
                ) : (
                    resources.map((res) => (
                        <div key={res._id} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                            {/* Thumbnail Area */}
                            <div className="aspect-video relative overflow-hidden bg-gray-50 border-b border-gray-100">
                                {res.directThumbnailUrl ? (
                                    <img src={res.directThumbnailUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : res.type === 'image' && res.directFileUrl ? (
                                    <img src={res.directFileUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        {res.type === 'video' ? (
                                            <div className="p-5 bg-red-50 text-red-500 rounded-3xl group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="p-5 bg-blue-50 text-blue-500 rounded-3xl group-hover:scale-110 transition-transform">
                                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${res.type === 'image' ? 'bg-orange-500 text-white' :
                                        res.type === 'video' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                                        }`}>
                                        {res.type}
                                    </span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-sono-dark mb-2 line-clamp-1 group-hover:text-sono-primary transition-colors">{res.title}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-6 flex-1 leading-relaxed">{res.description || "등록된 설명이 없습니다."}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(res.directFileUrl, '_blank')}
                                        className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-sono-primary/10 hover:text-sono-primary transition-all flex items-center justify-center gap-1.5"
                                    >
                                        미리보기
                                    </button>
                                    <button
                                        onClick={() => {
                                            const downloadUrl = `/api/download?url=${encodeURIComponent(res.directFileUrl)}&filename=${encodeURIComponent(res.title)}`;
                                            window.location.assign(downloadUrl);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-sono-primary/5 text-sono-primary rounded-xl text-xs font-bold hover:bg-sono-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
                                    >
                                        다운로드
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(res._id)}
                                            className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                                            title="삭제"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <ResourceRegistrationModal onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
}

function ResourceRegistrationModal({ onClose }: { onClose: () => void }) {
    const generateUploadUrl = useMutation(api.resources.generateUploadUrl);
    const createResource = useMutation(api.resources.createResource);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        type: "image",
        isExternalUrl: false,
        fileUrl: "",
        thumbnailUrl: "",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedThumb, setSelectedThumb] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) return alert("제목을 입력해주세요.");
        if (!form.isExternalUrl && !selectedFile) return alert("파일을 선택해주세요.");
        if (form.isExternalUrl && !form.fileUrl) return alert("URL을 입력해주세요.");

        setIsSubmitting(true);
        try {
            let storageId: Id<"_storage"> | undefined;
            let finalFileUrl = form.fileUrl;
            let thumbnailStorageId: Id<"_storage"> | undefined;
            let finalThumbnailUrl = form.thumbnailUrl;

            // 1. 메인 파일 업로드
            if (!form.isExternalUrl && selectedFile) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                const { storageId: sId } = await result.json();
                storageId = sId;
                finalFileUrl = sId; // Storage ID를 URL 필드에 임시 저장 (서버에서 변환됨)
            }

            // 2. 썸네일 업로드
            if (selectedThumb) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedThumb.type },
                    body: selectedThumb,
                });
                const { storageId: sId } = await result.json();
                thumbnailStorageId = sId;
                finalThumbnailUrl = sId;
            }

            await createResource({
                title: form.title,
                description: form.description,
                type: form.type,
                fileUrl: finalFileUrl,
                storageId,
                thumbnailUrl: finalThumbnailUrl,
                thumbnailStorageId,
                isExternalUrl: form.isExternalUrl,
            });

            alert("자료가 등록되었습니다.");
            onClose();
        } catch (error) {
            console.error(error);
            alert("등록 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-slide-up relative">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-black text-sono-dark">자료 등록</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">구분</label>
                            <div className="flex gap-2">
                                {["image", "video", "file"].map((t) => (
                                    <button
                                        type="button"
                                        key={t}
                                        onClick={() => setForm({ ...form, type: t })}
                                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${form.type === t
                                            ? "bg-sono-dark text-white shadow-lg"
                                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                            }`}
                                    >
                                        {t === 'image' ? '이미지' : t === 'video' ? '영상' : '일반파일'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">제목</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full p-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-sono-primary focus:ring-4 focus:ring-sono-primary/10 transition-all font-bold"
                                placeholder="자료 제목을 입력하세요"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">설명 (간략히)</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full p-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-sono-primary focus:ring-4 focus:ring-sono-primary/10 transition-all font-bold min-h-[100px]"
                                placeholder="자료에 대한 설명을 입력하세요"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">자료 파일 / 링크</label>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, isExternalUrl: !form.isExternalUrl })}
                                    className="text-[10px] font-bold text-sono-primary underline underline-offset-4"
                                >
                                    {form.isExternalUrl ? "파일 업로드로 변경" : "외부 URL 링크로 변경"}
                                </button>
                            </div>

                            {form.isExternalUrl ? (
                                <input
                                    type="text"
                                    value={form.fileUrl}
                                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-gray-200 text-sm outline-none focus:border-sono-primary focus:ring-4 focus:ring-sono-primary/10 transition-all font-bold"
                                    placeholder="https://example.com/..."
                                />
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full p-8 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 hover:border-sono-primary/30 transition-all group"
                                >
                                    <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-sono-primary/10 group-hover:text-sono-primary transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-bold text-gray-500">{selectedFile ? selectedFile.name : "파일 선택 또는 드래그"}</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">썸네일 이미지 (선택)</label>
                            <div
                                onClick={() => thumbInputRef.current?.click()}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-all"
                            >
                                <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {selectedThumb ? (
                                        <img src={URL.createObjectURL(selectedThumb)} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-gray-500">{selectedThumb ? selectedThumb.name : "썸네일용 이미지 선택"}</span>
                                <input
                                    type="file"
                                    ref={thumbInputRef}
                                    onChange={(e) => setSelectedThumb(e.target.files?.[0] || null)}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black hover:bg-gray-50 transition-all"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-sono-primary text-white rounded-2xl font-black hover:bg-sono-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sono-primary/20 transition-all"
                    >
                        {isSubmitting ? "등록 중..." : "자료 등록하기"}
                    </button>
                </div>
            </div>
        </div>
    );
}
