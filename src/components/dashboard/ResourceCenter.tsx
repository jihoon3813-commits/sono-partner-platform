"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

interface ResourceCenterProps {
    isAdmin: boolean;
}

export default function ResourceCenter({ isAdmin }: ResourceCenterProps) {
    const [selectedType, setSelectedType] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const resources = useQuery(api.resources.listResources, {
        type: selectedType === "all" ? undefined : selectedType,
    });

    const deleteResource = useMutation(api.resources.deleteResource);

    const handleDelete = async (id: Id<"resources">) => {
        if (confirm("정말 이 자료를 삭제하시겠습니까?")) {
            await deleteResource({ id });
        }
    };

    return (
        <div className="space-y-5">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">SONO I&apos;M READY · RESOURCES</div>
                    <h1>자료실</h1>
                    <p>정확한 상품 안내와 편리한 영업을 위한 공식 자료를 확인하고 다운로드하세요.</p>
                </div>
                <div className="adm-heading-buttons">
                    <div className="adm-segmented">
                        {["all", "image", "video", "file"].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedType(type)}
                                className={selectedType === type ? "active" : ""}
                            >
                                {type === "all"
                                    ? "전체"
                                    : type === "image"
                                    ? "이미지"
                                    : type === "video"
                                    ? "영상"
                                    : "일반파일"}
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="adm-btn primary"
                        >
                            <AdminIcon name="plus" />
                            <span>자료 등록</span>
                        </button>
                    )}
                </div>
            </section>

            {/* Resource Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {!resources ? (
                    <div className="col-span-full adm-panel py-16 text-center text-xs text-[#788699] font-semibold">
                        자료를 불러오는 중...
                    </div>
                ) : resources.length === 0 ? (
                    <div className="col-span-full adm-panel py-16 text-center text-[#788699]">
                        <AdminIcon name="folder" className="mx-auto mb-2.5 !w-7 !h-7 text-[#b0bfa8]" />
                        <strong className="block text-sm text-[#162438] mb-1">등록된 자료가 없습니다</strong>
                        <p className="text-xs">선택한 분류에 등록된 자료가 없습니다.</p>
                    </div>
                ) : (
                    resources.map((res) => (
                        <article
                            key={res._id}
                            className="group adm-panel flex flex-col overflow-hidden hover:border-[#a7baa6] transition-all"
                        >
                            {/* Thumbnail Area */}
                            <div className="aspect-video relative overflow-hidden bg-[#f4f6f0] border-b border-[#e1e7f0]">
                                {res.directThumbnailUrl ? (
                                    <img
                                        src={res.directThumbnailUrl}
                                        alt={res.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : res.type === "image" && res.directFileUrl ? (
                                    <img
                                        src={res.directFileUrl}
                                        alt={res.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-12 h-14 rounded-lg bg-[#e8efe2] text-[#163a6b] font-bold text-xs grid place-items-center border border-[#d6e2cd]">
                                            {res.type === "video" ? "VID" : "FILE"}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className={`adm-pill ${
                                            res.type === "image"
                                                ? "orange"
                                                : res.type === "video"
                                                ? "red"
                                                : "green"
                                        }`}
                                    >
                                        {res.type.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Info Area */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-sm text-[#162438] mb-1.5 line-clamp-1 group-hover:text-[#163a6b] transition-colors">
                                    {res.title}
                                </h3>
                                <p className="text-xs text-[#788699] line-clamp-2 mb-5 flex-1 leading-relaxed">
                                    {res.description || "등록된 설명이 없습니다."}
                                </p>

                                <div className="flex gap-2 pt-3 border-t border-[#eaeff7]">
                                    <button
                                        type="button"
                                        onClick={() => window.open(res.directFileUrl, "_blank")}
                                        className="flex-1 adm-btn small"
                                    >
                                        미리보기
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const downloadUrl = `/api/download?url=${encodeURIComponent(
                                                res.directFileUrl
                                            )}&filename=${encodeURIComponent(res.title)}`;
                                            window.location.assign(downloadUrl);
                                        }}
                                        className="flex-1 adm-btn small sage"
                                    >
                                        <AdminIcon name="download" />
                                        <span>다운로드</span>
                                    </button>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(res._id)}
                                            className="adm-btn small danger !px-2"
                                            title="삭제"
                                        >
                                            <AdminIcon name="trash" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {isModalOpen && <ResourceRegistrationModal onClose={() => setIsModalOpen(false)} />}
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

            if (!form.isExternalUrl && selectedFile) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                const { storageId: sId } = await result.json();
                storageId = sId;
                finalFileUrl = sId;
            }

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
        <AdminDrawer
            title="자료 등록"
            subtitle="자료실에 게시할 문서, 이미지, 영상 또는 외부 링크를 등록합니다."
            maxWidth="560px"
            zIndex={70}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="adm-btn"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        form="resource-reg-drawer"
                        disabled={isSubmitting}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="check" />
                        <span>{isSubmitting ? "등록 중..." : "자료 등록하기"}</span>
                    </button>
                </>
            }
        >
            <form id="resource-reg-drawer" onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-[#475870] mb-2">자료 구분</label>
                    <div className="grid grid-cols-3 gap-2">
                        {["image", "video", "file"].map((t) => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setForm({ ...form, type: t })}
                                className={`py-2.5 rounded-[9px] text-xs font-bold border transition-all cursor-pointer ${
                                    form.type === t
                                        ? "bg-[#163a6b] text-white border-[#163a6b]"
                                        : "bg-[#f6f8fc] text-[#6d7b64] border-[#dce4f0] hover:bg-white"
                                }`}
                            >
                                {t === "image" ? "이미지" : t === "video" ? "영상" : "일반파일"}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#475870] mb-1.5">제목</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[9px] bg-[#f7f9fc] border border-[#dce4f0] text-sm outline-none focus:bg-white focus:border-[#163a6b]"
                        placeholder="자료 제목을 입력하세요"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#475870] mb-1.5">
                        설명 (간략히)
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-[9px] bg-[#f7f9fc] border border-[#dce4f0] text-sm outline-none focus:bg-white focus:border-[#163a6b] min-h-[96px]"
                        placeholder="자료에 대한 설명을 입력하세요"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-[#475870]">
                            자료 파일 / 링크
                        </label>
                        <button
                            type="button"
                            onClick={() =>
                                setForm({ ...form, isExternalUrl: !form.isExternalUrl })
                            }
                            className="text-xs font-bold text-[#163a6b] hover:underline"
                        >
                            {form.isExternalUrl ? "파일 업로드로 변경" : "외부 URL 링크로 변경"}
                        </button>
                    </div>

                    {form.isExternalUrl ? (
                        <input
                            type="text"
                            value={form.fileUrl}
                            onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-[9px] bg-[#f7f9fc] border border-[#dce4f0] text-sm outline-none focus:bg-white focus:border-[#163a6b]"
                            placeholder="https://example.com/..."
                        />
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full p-7 border border-dashed border-[#cfdcf0] rounded-[11px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#f8faf5] transition-colors"
                        >
                            <AdminIcon name="upload" className="!w-6 !h-6 text-[#163a6b]" />
                            <span className="text-xs font-bold text-[#162438]">
                                {selectedFile ? selectedFile.name : "파일 선택 (클릭)"}
                            </span>
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
                    <label className="block text-xs font-bold text-[#475870] mb-1.5">
                        썸네일 이미지 (선택)
                    </label>
                    <div
                        onClick={() => thumbInputRef.current?.click()}
                        className="w-full p-3.5 bg-[#f6f8fc] border border-[#e1e7f0] rounded-[10px] flex items-center gap-3.5 cursor-pointer hover:bg-[#f1f4ec] transition-colors"
                    >
                        <div className="w-11 h-11 bg-white rounded-[8px] border border-[#dce4f0] flex items-center justify-center overflow-hidden shrink-0">
                            {selectedThumb ? (
                                <img
                                    src={URL.createObjectURL(selectedThumb)}
                                    alt="썸네일 미리보기"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <AdminIcon name="file" className="text-[#96a392]" />
                            )}
                        </div>
                        <span className="text-xs font-semibold text-[#475870] truncate">
                            {selectedThumb ? selectedThumb.name : "썸네일용 이미지 선택"}
                        </span>
                        <input
                            type="file"
                            ref={thumbInputRef}
                            onChange={(e) => setSelectedThumb(e.target.files?.[0] || null)}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </div>
            </form>
        </AdminDrawer>
    );
}
