"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";
import { getKSTDateString } from "@/lib/dateUtils";

interface ThumbnailItem {
    url?: string;
    storageId?: Id<"_storage">;
    previewUrl: string;
}

interface GiftItem {
    _id: Id<"maeumGifts">;
    landingKey: string;
    name: string;
    thumbnailUrl: string;
    thumbnailStorageId?: Id<"_storage">;
    thumbnailImages?: { url?: string; storageId?: Id<"_storage"> }[];
    detailImageUrl?: string;
    detailImageStorageId?: Id<"_storage">;
    resolvedThumbnailUrl?: string;
    resolvedThumbnailUrls?: string[];
    resolvedDetailImageUrl?: string;
    notice?: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

function getPeriodStatus(today: string, isActive: boolean, startDate?: string, endDate?: string) {
    if (!isActive) return { label: "비활성", pill: "gray" };
    const start = (startDate || "").trim();
    const end = (endDate || "").trim();
    if (start && today < start) return { label: "진행 예정", pill: "blue" };
    if (end && today > end) return { label: "기간 종료", pill: "red" };
    return { label: "진행중", pill: "green" };
}

export default function MaeumGiftManagement() {
    const config = useQuery(api.maeumGifts.getEventConfig, { landingKey: "maeum-ad" });
    const gifts = useQuery(api.maeumGifts.listAdminGifts, { landingKey: "maeum-ad" });

    const saveEventConfig = useMutation(api.maeumGifts.saveEventConfig);
    const createGift = useMutation(api.maeumGifts.createGift);
    const updateGift = useMutation(api.maeumGifts.updateGift);
    const deleteGift = useMutation(api.maeumGifts.deleteGift);
    const generateUploadUrl = useMutation(api.maeumGifts.generateUploadUrl);

    const today = getKSTDateString();

    // Event config form state
    const [eventForm, setEventForm] = useState({
        isEnabled: true,
        badgeText: "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중",
        title: "지금 마음든든 상담·가입 시 특별 사은품 증정!",
        subtitle: "기간 한정 특별 혜택, 원하는 사은품을 선택하고 상담을 신청해 보세요.",
        startDate: "",
        endDate: "",
        commonNotice: "",
        slideIntervalSec: "1.5",
    });
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        if (config) {
            setEventForm({
                isEnabled: config.isEnabled ?? true,
                badgeText: config.badgeText || "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중",
                title: config.title || "",
                subtitle: config.subtitle || "",
                startDate: config.startDate || "",
                endDate: config.endDate || "",
                commonNotice: config.commonNotice || "",
                slideIntervalSec: String(
                    ((config.slideIntervalMs ?? 1500) / 1000).toFixed(1)
                ).replace(/\.0$/, ".0"),
            });
        }
    }, [config]);

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventForm.title.trim()) {
            alert("이벤트 제목을 입력해 주세요.");
            return;
        }
        const parsedSec = parseFloat(eventForm.slideIntervalSec);
        const slideIntervalMs =
            !isNaN(parsedSec) && parsedSec >= 0.3
                ? Math.round(parsedSec * 1000)
                : 1500;

        setSavingConfig(true);
        try {
            await saveEventConfig({
                landingKey: "maeum-ad",
                isEnabled: eventForm.isEnabled,
                badgeText: eventForm.badgeText,
                title: eventForm.title,
                subtitle: eventForm.subtitle,
                startDate: eventForm.startDate,
                endDate: eventForm.endDate,
                commonNotice: eventForm.commonNotice,
                slideIntervalMs,
            });
            alert("사은품 이벤트 설정이 저장되었습니다.");
        } catch (err) {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.");
        } finally {
            setSavingConfig(false);
        }
    };

    // Gift modal state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
    const [giftForm, setGiftForm] = useState({
        name: "",
        thumbnailImages: [] as ThumbnailItem[],
        newThumbUrlInput: "",
        detailImageUrl: "",
        detailImageStorageId: undefined as Id<"_storage"> | undefined,
        detailImagePreview: "",
        notice: "",
        startDate: "",
        endDate: "",
        isActive: true,
        order: 0,
    });
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingDetail, setUploadingDetail] = useState(false);
    const [savingGift, setSavingGift] = useState(false);

    const openGiftDrawer = (gift?: GiftItem) => {
        if (gift) {
            setEditingGift(gift);
            const existingThumbs: ThumbnailItem[] = [];
            if (Array.isArray(gift.thumbnailImages) && gift.thumbnailImages.length > 0) {
                gift.thumbnailImages.forEach((item, idx) => {
                    const resolved =
                        gift.resolvedThumbnailUrls?.[idx] || item.url || "";
                    existingThumbs.push({
                        url: item.url,
                        storageId: item.storageId,
                        previewUrl: resolved,
                    });
                });
            } else if (gift.resolvedThumbnailUrl || gift.thumbnailUrl) {
                existingThumbs.push({
                    url: gift.thumbnailUrl || undefined,
                    storageId: gift.thumbnailStorageId,
                    previewUrl: gift.resolvedThumbnailUrl || gift.thumbnailUrl,
                });
            }

            setGiftForm({
                name: gift.name,
                thumbnailImages: existingThumbs,
                newThumbUrlInput: "",
                detailImageUrl: gift.detailImageUrl || "",
                detailImageStorageId: gift.detailImageStorageId,
                detailImagePreview: gift.resolvedDetailImageUrl || gift.detailImageUrl || "",
                notice: gift.notice || "",
                startDate: gift.startDate || "",
                endDate: gift.endDate || "",
                isActive: gift.isActive,
                order: gift.order ?? 0,
            });
        } else {
            const nextOrder =
                gifts && gifts.length > 0
                    ? Math.max(...gifts.map((g) => g.order ?? 0)) + 1
                    : 0;
            setEditingGift(null);
            setGiftForm({
                name: "",
                thumbnailImages: [],
                newThumbUrlInput: "",
                detailImageUrl: "",
                detailImageStorageId: undefined,
                detailImagePreview: "",
                notice: "",
                startDate: "",
                endDate: "",
                isActive: true,
                order: nextOrder,
            });
        }
        setIsDrawerOpen(true);
    };

    const handleUploadThumbnails = async (files: FileList) => {
        const imageFiles = Array.from(files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (imageFiles.length === 0) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }
        setUploadingThumb(true);
        try {
            const uploaded: ThumbnailItem[] = [];
            for (const file of imageFiles) {
                const postUrl = await generateUploadUrl();
                const res = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });
                if (!res.ok) throw new Error("이미지 업로드 실패");
                const { storageId } = await res.json();
                uploaded.push({
                    storageId,
                    previewUrl: URL.createObjectURL(file),
                });
            }
            setGiftForm((prev) => ({
                ...prev,
                thumbnailImages: [...prev.thumbnailImages, ...uploaded],
            }));
        } catch (err) {
            console.error(err);
            alert("섬네일 이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploadingThumb(false);
        }
    };

    const handleAddThumbnailUrl = () => {
        const url = giftForm.newThumbUrlInput.trim();
        if (!url) return;
        setGiftForm((prev) => ({
            ...prev,
            thumbnailImages: [
                ...prev.thumbnailImages,
                { url, previewUrl: url },
            ],
            newThumbUrlInput: "",
        }));
    };

    const handleMoveThumbnail = (idx: number, dir: -1 | 1) => {
        setGiftForm((prev) => {
            const next = [...prev.thumbnailImages];
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= next.length) return prev;
            [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
            return { ...prev, thumbnailImages: next };
        });
    };

    const handleRemoveThumbnail = (idx: number) => {
        setGiftForm((prev) => ({
            ...prev,
            thumbnailImages: prev.thumbnailImages.filter((_, i) => i !== idx),
        }));
    };

    const handleUploadDetailImage = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }
        setUploadingDetail(true);
        try {
            const postUrl = await generateUploadUrl();
            const res = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!res.ok) throw new Error("이미지 업로드 실패");
            const { storageId } = await res.json();
            const localPreview = URL.createObjectURL(file);

            setGiftForm((prev) => ({
                ...prev,
                detailImageStorageId: storageId,
                detailImagePreview: localPreview,
            }));
        } catch (err) {
            console.error(err);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setUploadingDetail(false);
        }
    };

    const handleSaveGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!giftForm.name.trim()) {
            alert("사은품 제품명을 입력해 주세요.");
            return;
        }
        if (giftForm.thumbnailImages.length === 0) {
            alert("사은품 섬네일 이미지를 최소 1장 이상 등록해 주세요.");
            return;
        }

        const cleanThumbnails = giftForm.thumbnailImages.map((t) => ({
            ...(t.url ? { url: t.url } : {}),
            ...(t.storageId ? { storageId: t.storageId } : {}),
        }));
        const firstThumb = cleanThumbnails[0];

        setSavingGift(true);
        try {
            if (editingGift) {
                await updateGift({
                    id: editingGift._id,
                    name: giftForm.name.trim(),
                    thumbnailUrl: firstThumb.url || "",
                    thumbnailStorageId: firstThumb.storageId ?? null,
                    thumbnailImages: cleanThumbnails,
                    detailImageUrl: giftForm.detailImageUrl.trim(),
                    detailImageStorageId: giftForm.detailImageStorageId ?? null,
                    notice: giftForm.notice.trim(),
                    startDate: giftForm.startDate.trim(),
                    endDate: giftForm.endDate.trim(),
                    isActive: giftForm.isActive,
                    order: Number(giftForm.order) || 0,
                });
                alert("사은품 정보가 수정되었습니다.");
            } else {
                await createGift({
                    landingKey: "maeum-ad",
                    name: giftForm.name.trim(),
                    thumbnailUrl: firstThumb.url || "",
                    thumbnailStorageId: firstThumb.storageId,
                    thumbnailImages: cleanThumbnails,
                    detailImageUrl: giftForm.detailImageUrl.trim(),
                    detailImageStorageId: giftForm.detailImageStorageId,
                    notice: giftForm.notice.trim(),
                    startDate: giftForm.startDate.trim(),
                    endDate: giftForm.endDate.trim(),
                    isActive: giftForm.isActive,
                    order: Number(giftForm.order) || 0,
                });
                alert("새 사은품이 등록되었습니다.");
            }
            setIsDrawerOpen(false);
        } catch (err) {
            console.error(err);
            alert("사은품 저장 중 오류가 발생했습니다.");
        } finally {
            setSavingGift(false);
        }
    };

    const handleDeleteGift = async (gift: GiftItem) => {
        if (!confirm(`"${gift.name}" 사은품을 삭제하시겠습니까?`)) return;
        try {
            await deleteGift({ id: gift._id });
        } catch (err) {
            console.error(err);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleToggleGiftActive = async (gift: GiftItem) => {
        try {
            await updateGift({
                id: gift._id,
                isActive: !gift.isActive,
            });
        } catch (err) {
            console.error(err);
        }
    };

    const eventStatus = getPeriodStatus(
        today,
        eventForm.isEnabled,
        eventForm.startDate,
        eventForm.endDate
    );

    return (
        <div className="space-y-6">
            <section className="adm-page-heading">
                <div>
                    <div className="adm-eyebrow">MAEUM-AD · GIFT EVENT</div>
                    <h1>사은품 이벤트 관리</h1>
                    <p>
                        마음든든 광고 랜딩페이지(<code>/products/maeum-ad</code>) 상단·중간·하단에 노출되는 사은품 증정 이벤트와 사은품 목록을 실시간으로 관리합니다.
                    </p>
                </div>
                <div className="adm-heading-buttons">
                    <a
                        href="/products/maeum-ad"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn"
                    >
                        <span>랜딩페이지 미리보기 ↗</span>
                    </a>
                    <button
                        type="button"
                        onClick={() => openGiftDrawer()}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="plus" />
                        <span>새 사은품 추가</span>
                    </button>
                </div>
            </section>

            {/* 1. 이벤트 진행 설정 패널 */}
            <form onSubmit={handleSaveConfig} className="adm-panel p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6eae3] pb-4">
                    <div className="flex items-center gap-2.5">
                        <AdminIcon name="gift" className="text-[#295e52]" />
                        <h2 className="text-base font-bold text-[#263d36]">
                            사은품 증정 이벤트 기본 설정
                        </h2>
                        <span className={`adm-pill ${eventStatus.pill}`}>
                            {eventStatus.label}
                        </span>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#263d36]">
                        <input
                            type="checkbox"
                            checked={eventForm.isEnabled}
                            onChange={(e) =>
                                setEventForm((prev) => ({
                                    ...prev,
                                    isEnabled: e.target.checked,
                                }))
                            }
                            className="w-4 h-4 accent-[#295e52]"
                        />
                        <span>랜딩페이지에 사은품 이벤트 노출</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                            상단 강조 배지 문구
                        </label>
                        <input
                            type="text"
                            value={eventForm.badgeText}
                            onChange={(e) =>
                                setEventForm((prev) => ({
                                    ...prev,
                                    badgeText: e.target.value,
                                }))
                            }
                            placeholder="예: SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중"
                            className="adm-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                            이벤트 진행 기간 (비워두면 상시 진행)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={eventForm.startDate}
                                onChange={(e) =>
                                    setEventForm((prev) => ({
                                        ...prev,
                                        startDate: e.target.value,
                                    }))
                                }
                                className="adm-input flex-1"
                            />
                            <span className="text-xs text-[#86918a]">~</span>
                            <input
                                type="date"
                                value={eventForm.endDate}
                                onChange={(e) =>
                                    setEventForm((prev) => ({
                                        ...prev,
                                        endDate: e.target.value,
                                    }))
                                }
                                className="adm-input flex-1"
                            />
                            {(eventForm.startDate || eventForm.endDate) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEventForm((prev) => ({
                                            ...prev,
                                            startDate: "",
                                            endDate: "",
                                        }))
                                    }
                                    className="adm-btn small"
                                >
                                    초기화
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                            이벤트 메인 제목 *
                        </label>
                        <input
                            type="text"
                            required
                            value={eventForm.title}
                            onChange={(e) =>
                                setEventForm((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            placeholder="지금 마음든든 상담·가입 시 특별 사은품 증정!"
                            className="adm-input w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                            이벤트 부제목 (설명)
                        </label>
                        <input
                            type="text"
                            value={eventForm.subtitle}
                            onChange={(e) =>
                                setEventForm((prev) => ({
                                    ...prev,
                                    subtitle: e.target.value,
                                }))
                            }
                            placeholder="기간 한정 특별 혜택, 원하는 사은품을 선택하고 상담을 신청해 보세요."
                            className="adm-input w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                            썸네일 자동 슬라이딩 속도 (초, 기본 1.5초)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                min="0.5"
                                max="10"
                                value={eventForm.slideIntervalSec}
                                onChange={(e) =>
                                    setEventForm((prev) => ({
                                        ...prev,
                                        slideIntervalSec: e.target.value,
                                    }))
                                }
                                className="adm-input w-28"
                            />
                            <span className="text-xs font-semibold text-[#45554e]">초</span>
                            <div className="flex items-center gap-1 ml-1">
                                {["1.0", "1.5", "2.0", "3.0"].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() =>
                                            setEventForm((prev) => ({
                                                ...prev,
                                                slideIntervalSec: preset,
                                            }))
                                        }
                                        className={`adm-btn small ${
                                            eventForm.slideIntervalSec === preset ? "primary" : ""
                                        }`}
                                    >
                                        {preset}초
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#45554e] mb-1.5">
                        공통 유의사항 (모든 사은품 하단에 공통 표시)
                    </label>
                    <textarea
                        rows={3}
                        value={eventForm.commonNotice}
                        onChange={(e) =>
                            setEventForm((prev) => ({
                                ...prev,
                                commonNotice: e.target.value,
                            }))
                        }
                        placeholder="예: • 사은품은 정상 가입 및 초회 납입 완료 고객에 한해 증정됩니다."
                        className="adm-textarea w-full"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={savingConfig}
                        className="adm-btn primary"
                    >
                        {savingConfig ? "저장 중..." : "이벤트 설정 저장"}
                    </button>
                </div>
            </form>

            {/* 2. 사은품 목록 */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#263d36]">
                        등록된 사은품 목록 ({gifts ? gifts.length : 0}개)
                    </h2>
                    <p className="text-xs text-[#6b7768]">
                        1개 등록 시 단독 강조 카드 / 2개 이상 등록 시 모바일 2열 · PC 최대 4열 자동 배치됩니다.
                    </p>
                </div>

                {!gifts ? (
                    <div className="adm-panel p-14 text-center text-xs text-[#86918a]">
                        사은품 목록을 불러오는 중...
                    </div>
                ) : gifts.length === 0 ? (
                    <div className="adm-panel p-16 text-center">
                        <AdminIcon
                            name="gift"
                            className="mx-auto mb-3 !w-8 !h-8 text-[#a6b6a1]"
                        />
                        <strong className="block text-sm text-[#263d36] mb-1">
                            등록된 사은품이 없습니다
                        </strong>
                        <p className="text-xs text-[#86918a] mb-4">
                            우측 상단 &ldquo;새 사은품 추가&rdquo; 버튼을 눌러 사은품을 등록해 보세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => openGiftDrawer()}
                            className="adm-btn primary"
                        >
                            + 첫 사은품 등록하기
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {gifts.map((gift) => {
                            const status = getPeriodStatus(
                                today,
                                gift.isActive,
                                gift.startDate,
                                gift.endDate
                            );
                            const thumbSrc =
                                gift.resolvedThumbnailUrl || gift.thumbnailUrl;
                            const hasDetail = Boolean(
                                gift.resolvedDetailImageUrl || gift.detailImageUrl
                            );

                            return (
                                <article
                                    key={gift._id}
                                    className="adm-panel flex flex-col overflow-hidden hover:border-[#adc0ad] transition-all"
                                >
                                    <div className="relative bg-[#f5f6f3] aspect-[4/3] overflow-hidden border-b border-[#e6eae3]">
                                        {thumbSrc ? (
                                            <img
                                                src={thumbSrc}
                                                alt={gift.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-[#86918a]">
                                                이미지 없음
                                            </div>
                                        )}
                                        <span
                                            className={`adm-pill ${status.pill} absolute top-2.5 left-2.5 shadow-sm`}
                                        >
                                            {status.label}
                                        </span>
                                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                                            순서 {gift.order}
                                        </span>
                                        {(gift.resolvedThumbnailUrls?.length || 0) > 1 && (
                                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                                                사진 {gift.resolvedThumbnailUrls?.length}장
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <h3 className="font-bold text-sm text-[#263d36] line-clamp-2">
                                            {gift.name}
                                        </h3>

                                        <div className="text-[11px] text-[#6b7768] space-y-1">
                                            <div>
                                                기간:{" "}
                                                {gift.startDate || gift.endDate
                                                    ? `${gift.startDate || "제한없음"} ~ ${
                                                          gift.endDate || "제한없음"
                                                      }`
                                                    : "이벤트 기본 기간 따름"}
                                            </div>
                                            <div>
                                                상세이미지:{" "}
                                                <strong
                                                    className={
                                                        hasDetail
                                                            ? "text-[#295e52]"
                                                            : "text-[#86918a]"
                                                    }
                                                >
                                                    {hasDetail ? "등록됨" : "미등록"}
                                                </strong>
                                            </div>
                                        </div>

                                        {gift.notice && (
                                            <p className="text-[11px] text-[#6b7768] bg-[#f8f9f7] border border-[#e6eae3] rounded-md p-2 line-clamp-2 whitespace-pre-line">
                                                {gift.notice}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-3 border-t border-[#eef1ec] flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleGiftActive(gift)
                                                }
                                                className="adm-btn small"
                                            >
                                                {gift.isActive ? "숨기기" : "노출하기"}
                                            </button>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => openGiftDrawer(gift)}
                                                    className="adm-btn small"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteGift(gift)}
                                                    className="adm-btn small danger"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 사은품 등록/수정 드로어 */}
            {isDrawerOpen && (
                <AdminDrawer
                    onClose={() => setIsDrawerOpen(false)}
                    title={editingGift ? "사은품 수정" : "새 사은품 등록"}
                    subtitle="제품명, 섬네일, 상세이미지, 유의사항 및 진행 기간을 설정합니다."
                >
                <form onSubmit={handleSaveGift} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#263d36] mb-1.5">
                            사은품 제품명 *
                        </label>
                        <input
                            type="text"
                            required
                            value={giftForm.name}
                            onChange={(e) =>
                                setGiftForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="예: 삼성 비스포크 공기청정기 / 백화점 상품권 10만원권"
                            className="adm-input w-full"
                        />
                    </div>

                    {/* 다중 섬네일 이미지 (좌우 슬라이드) */}
                    <div className="p-3.5 rounded-lg border border-[#e6eae3] bg-[#fafbf9] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <label className="text-xs font-bold text-[#263d36]">
                                    섬네일 이미지 * ({giftForm.thumbnailImages.length}장)
                                </label>
                                <p className="text-[11px] text-[#86918a]">
                                    여러 장 등록 시 랜딩페이지에서 좌우 슬라이드로 표시됩니다.
                                </p>
                            </div>
                            <label className="adm-btn small cursor-pointer shrink-0">
                                <span>
                                    {uploadingThumb ? "업로드 중..." : "+ 파일 업로드 (다중 선택)"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    disabled={uploadingThumb}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleUploadThumbnails(e.target.files);
                                        }
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        </div>

                        <div className="flex gap-1.5">
                            <input
                                type="text"
                                value={giftForm.newThumbUrlInput}
                                onChange={(e) =>
                                    setGiftForm((prev) => ({
                                        ...prev,
                                        newThumbUrlInput: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddThumbnailUrl();
                                    }
                                }}
                                placeholder="또는 이미지 URL 입력 후 추가 (https://...)"
                                className="adm-input flex-1 text-xs"
                            />
                            <button
                                type="button"
                                onClick={handleAddThumbnailUrl}
                                className="adm-btn small shrink-0"
                            >
                                + URL 추가
                            </button>
                        </div>

                        {giftForm.thumbnailImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                                {giftForm.thumbnailImages.map((item, idx) => (
                                    <div
                                        key={`${item.storageId || item.url || idx}-${idx}`}
                                        className="relative rounded-md overflow-hidden border border-[#dce3d8] bg-white flex flex-col"
                                    >
                                        <div className="relative aspect-[4/3] bg-[#f3f5f1]">
                                            <img
                                                src={item.previewUrl}
                                                alt={`섬네일 ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                                                {idx === 0 ? "대표" : idx + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveThumbnail(idx)}
                                                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        {giftForm.thumbnailImages.length > 1 && (
                                            <div className="flex border-t border-[#e6eae3] bg-[#fafbf9]">
                                                <button
                                                    type="button"
                                                    disabled={idx === 0}
                                                    onClick={() => handleMoveThumbnail(idx, -1)}
                                                    className="flex-1 py-1 text-[10px] font-bold text-[#45554e] disabled:opacity-30 hover:bg-[#eef1ec]"
                                                >
                                                    ◀
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={idx === giftForm.thumbnailImages.length - 1}
                                                    onClick={() => handleMoveThumbnail(idx, 1)}
                                                    className="flex-1 py-1 text-[10px] font-bold text-[#45554e] disabled:opacity-30 hover:bg-[#eef1ec] border-l border-[#e6eae3]"
                                                >
                                                    ▶
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 상세 이미지 */}
                    <div className="p-3.5 rounded-lg border border-[#e6eae3] bg-[#fafbf9] space-y-2.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#263d36]">
                                상세 이미지 (클릭 시 팝업으로 노출)
                            </label>
                            <label className="adm-btn small cursor-pointer">
                                <span>
                                    {uploadingDetail ? "업로드 중..." : "파일 업로드"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingDetail}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUploadDetailImage(f);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                        </div>
                        <input
                            type="text"
                            value={giftForm.detailImageUrl}
                            onChange={(e) =>
                                setGiftForm((prev) => ({
                                    ...prev,
                                    detailImageUrl: e.target.value,
                                    detailImagePreview:
                                        e.target.value || prev.detailImagePreview,
                                }))
                            }
                            placeholder="또는 상세이미지 URL 직접 입력 (https://...)"
                            className="adm-input w-full text-xs"
                        />
                        {giftForm.detailImagePreview && (
                            <div className="relative w-full max-h-48 rounded-md overflow-hidden border border-[#dce3d8] bg-white">
                                <img
                                    src={giftForm.detailImagePreview}
                                    alt="상세이미지 미리보기"
                                    className="w-full max-h-48 object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setGiftForm((prev) => ({
                                            ...prev,
                                            detailImageUrl: "",
                                            detailImageStorageId: undefined,
                                            detailImagePreview: "",
                                        }))
                                    }
                                    className="absolute top-1.5 right-1.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded"
                                >
                                    제거
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#263d36] mb-1.5">
                            사은품 유의사항
                        </label>
                        <textarea
                            rows={4}
                            value={giftForm.notice}
                            onChange={(e) =>
                                setGiftForm((prev) => ({
                                    ...prev,
                                    notice: e.target.value,
                                }))
                            }
                            placeholder="예: • 색상은 랜덤 발송됩니다.&#10;• 제세공과금(22%)은 고객 부담입니다."
                            className="adm-textarea w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-[#263d36] mb-1.5">
                                개별 시작일 (선택)
                            </label>
                            <input
                                type="date"
                                value={giftForm.startDate}
                                onChange={(e) =>
                                    setGiftForm((prev) => ({
                                        ...prev,
                                        startDate: e.target.value,
                                    }))
                                }
                                className="adm-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#263d36] mb-1.5">
                                개별 종료일 (선택)
                            </label>
                            <input
                                type="date"
                                value={giftForm.endDate}
                                onChange={(e) =>
                                    setGiftForm((prev) => ({
                                        ...prev,
                                        endDate: e.target.value,
                                    }))
                                }
                                className="adm-input w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                            <label className="block text-xs font-bold text-[#263d36] mb-1.5">
                                노출 순서 (숫자가 작을수록 먼저)
                            </label>
                            <input
                                type="number"
                                value={giftForm.order}
                                onChange={(e) =>
                                    setGiftForm((prev) => ({
                                        ...prev,
                                        order: Number(e.target.value),
                                    }))
                                }
                                className="adm-input w-full"
                            />
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-[#263d36] pt-5">
                            <input
                                type="checkbox"
                                checked={giftForm.isActive}
                                onChange={(e) =>
                                    setGiftForm((prev) => ({
                                        ...prev,
                                        isActive: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 accent-[#295e52]"
                            />
                            <span>랜딩페이지에 노출</span>
                        </label>
                    </div>

                    <div className="pt-4 border-t border-[#e6eae3] flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="adm-btn"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={savingGift || uploadingThumb || uploadingDetail}
                            className="adm-btn primary"
                        >
                            {savingGift
                                ? "저장 중..."
                                : editingGift
                                ? "수정 완료"
                                : "사은품 등록"}
                        </button>
                    </div>
                </form>
                </AdminDrawer>
            )}
        </div>
    );
}
