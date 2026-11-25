"use client";

import React, { useEffect, useRef, useState } from "react";

export interface MaeumGiftItem {
    _id: string;
    name: string;
    thumbnailUrl: string;
    resolvedThumbnailUrl?: string;
    resolvedThumbnailUrls?: string[];
    detailImageUrl?: string;
    resolvedDetailImageUrl?: string;
    notice?: string;
    startDate?: string;
    endDate?: string;
}

export interface MaeumGiftEventConfig {
    isEnabled: boolean;
    badgeText?: string;
    title: string;
    subtitle?: string;
    startDate?: string;
    endDate?: string;
    commonNotice?: string;
    slideIntervalMs?: number;
}

function formatPeriodText(startDate?: string, endDate?: string): string {
    const s = (startDate || "").trim();
    const e = (endDate || "").trim();
    if (s && e) return `${s.replace(/-/g, ".")} ~ ${e.replace(/-/g, ".")}`;
    if (s) return `${s.replace(/-/g, ".")} ~`;
    if (e) return `~ ${e.replace(/-/g, ".")} 까지`;
    return "한정 기간 진행";
}

function getGiftThumbnails(gift: MaeumGiftItem): string[] {
    if (Array.isArray(gift.resolvedThumbnailUrls) && gift.resolvedThumbnailUrls.length > 0) {
        return gift.resolvedThumbnailUrls;
    }
    const fallback = gift.resolvedThumbnailUrl || gift.thumbnailUrl;
    return fallback ? [fallback] : [];
}

interface ThumbnailCarouselProps {
    images: string[];
    alt: string;
    intervalMs?: number;
    className?: string;
    imgClassName?: string;
    overlayBadge?: React.ReactNode;
    rightBadge?: React.ReactNode;
}

function ThumbnailCarousel({
    images,
    alt,
    intervalMs = 1500,
    className = "",
    imgClassName = "object-cover",
    overlayBadge,
    rightBadge,
}: ThumbnailCarouselProps) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef<number | null>(null);

    const hasMulti = images.length > 1;
    const safeIdx = index >= images.length ? 0 : index;

    useEffect(() => {
        if (!hasMulti || isPaused) return;
        const ms = intervalMs >= 300 ? intervalMs : 1500;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, ms);
        return () => clearInterval(timer);
    }, [hasMulti, isPaused, intervalMs, images.length]);

    if (images.length === 0) return null;

    const goPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <div
            className={`flex flex-col bg-[#efe5d7] ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className="relative flex-1 min-h-0 overflow-hidden select-none"
                onTouchStart={(e) => {
                    setIsPaused(true);
                    touchStartX.current = e.touches[0]?.clientX ?? null;
                }}
                onTouchEnd={(e) => {
                    if (hasMulti && touchStartX.current !== null) {
                        const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
                        const diff = touchStartX.current - endX;
                        if (Math.abs(diff) > 30) {
                            if (diff > 0) goNext();
                            else goPrev();
                        }
                    }
                    touchStartX.current = null;
                    setIsPaused(false);
                }}
            >
                <div
                    className="flex w-full h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${safeIdx * 100}%)` }}
                >
                    {images.map((src, i) => (
                        <img
                            key={`${src}-${i}`}
                            src={src}
                            alt={`${alt} ${i + 1}`}
                            className={`w-full h-full shrink-0 ${imgClassName}`}
                            draggable={false}
                        />
                    ))}
                </div>

                {overlayBadge}
                {rightBadge}

                {hasMulti && (
                    <>
                        <button
                            type="button"
                            aria-label="이전 이미지"
                            onClick={goPrev}
                            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold shadow transition z-10"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            aria-label="다음 이미지"
                            onClick={goNext}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center text-sm font-bold shadow transition z-10"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* 하단 작은 썸네일 미리보기 스트립 */}
            {hasMulti && (
                <div
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-[#e8dccb] border-t border-[#dccfbc] overflow-x-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {images.map((src, i) => (
                        <button
                            key={`${src}-thumb-${i}`}
                            type="button"
                            aria-label={`${i + 1}번 썸네일 보기`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIndex(i);
                            }}
                            className={`relative shrink-0 w-9 h-7 sm:w-10 sm:h-8 rounded-md overflow-hidden border transition-all ${
                                i === safeIdx
                                    ? "border-[#2b2119] ring-2 ring-[#b98a6a] opacity-100 scale-[1.03]"
                                    : "border-[#cbb9a4] opacity-65 hover:opacity-95"
                            }`}
                        >
                            <img
                                src={src}
                                alt={`${alt} 미리보기 ${i + 1}`}
                                className="w-full h-full object-cover"
                                draggable={false}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface MaeumGiftEventSectionProps {
    position: "top" | "bottom";
    config: MaeumGiftEventConfig;
    gifts: MaeumGiftItem[];
    selectedGiftId: string;
    onSelectGift: (gift: MaeumGiftItem) => void;
    onOpenDetail: (gift: MaeumGiftItem) => void;
    onApplyWithGift: (gift: MaeumGiftItem) => void;
}

export function MaeumGiftEventSection({
    position,
    config,
    gifts,
    selectedGiftId,
    onSelectGift,
    onOpenDetail,
    onApplyWithGift,
}: MaeumGiftEventSectionProps) {
    if (!gifts || gifts.length === 0) return null;

    const isSingle = gifts.length === 1;
    const periodLabel = formatPeriodText(config.startDate, config.endDate);

    // 2개 이상일 경우 모바일 2열, PC에서는 2개=2열, 3개=3열, 4개이상=4열 (좌우 폭 자동 맞춤)
    const gridClass =
        gifts.length === 2
            ? "grid grid-cols-2 gap-2 sm:gap-5"
            : gifts.length === 3
            ? "grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-5"
            : "grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4";

    return (
        <section
            aria-label={position === "top" ? "상단 사은품 증정 이벤트" : "하단 사은품 증정 이벤트"}
            className={`w-full max-w-[860px] mx-auto px-3 sm:px-0 ${
                position === "top" ? "pt-2.5 pb-3.5 sm:pt-4 sm:pb-5" : "pt-4 pb-6 sm:pt-6 sm:pb-8"
            }`}
        >
            <div className="relative overflow-hidden rounded-[18px] sm:rounded-[24px] border-2 border-[#b98a6a] bg-gradient-to-br from-[#2b2119] via-[#36281e] to-[#241b14] text-[#faf5ef] shadow-[0_20px_50px_rgba(43,33,25,0.28)] p-3.5 sm:p-8">
                {/* 은은한 상단 골드 글로우 */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#b98a6a]/20 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#b98a6a]/15 blur-3xl"
                />

                {/* 헤더 */}
                <div className="relative text-center mb-3 sm:mb-7">
                    <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-[#b98a6a] text-[#1a130e] font-extrabold text-[10px] sm:text-xs tracking-wider uppercase shadow leading-tight break-keep">
                            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#1a130e] animate-ping shrink-0" />
                            <span>
                                {(() => {
                                    const rawBadge =
                                        config.badgeText ||
                                        "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중";
                                    const parts = rawBadge.split(/\s*·\s*/);
                                    if (parts.length >= 2) {
                                        return (
                                            <>
                                                {parts[0]}
                                                <span className="hidden sm:inline"> · </span>
                                                <br className="sm:hidden" />
                                                {parts.slice(1).join(" · ")}
                                            </>
                                        );
                                    }
                                    return rawBadge;
                                })()}
                            </span>
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 border border-[#b98a6a]/40 text-[#f3dcc9] font-bold text-[10px] sm:text-xs whitespace-nowrap">
                            📅 {periodLabel}
                        </span>
                    </div>

                    <h2 className="text-[17px] sm:text-3xl font-extrabold tracking-tight text-[#fff9f2] leading-[1.3] sm:leading-snug break-keep whitespace-pre-line">
                        {(() => {
                            const rawTitle =
                                config.title || "지금 마음든든 상담·가입 시 특별 사은품 증정!";
                            if (rawTitle.includes("\n")) return rawTitle;
                            const match = rawTitle.match(/^(.*?시)\s+(.+)$/);
                            if (match) {
                                return (
                                    <>
                                        {match[1]}
                                        <span className="hidden sm:inline"> </span>
                                        <br className="sm:hidden" />
                                        {match[2]}
                                    </>
                                );
                            }
                            return rawTitle;
                        })()}
                    </h2>
                    {config.subtitle && (
                        <p className="mt-1 sm:mt-1.5 text-[10.5px] sm:text-sm text-[#d9cbbd] leading-snug break-keep whitespace-pre-line">
                            {(() => {
                                const rawSub = config.subtitle;
                                if (rawSub.includes("\n")) return rawSub;
                                const match = rawSub.match(/^([^,]+,)\s*(.+)$/);
                                if (match) {
                                    return (
                                        <>
                                            {match[1]}
                                            <span className="hidden sm:inline"> </span>
                                            <br className="sm:hidden" />
                                            {match[2]}
                                        </>
                                    );
                                }
                                return rawSub;
                            })()}
                        </p>
                    )}
                </div>

                {/* 사은품 목록: 1개면 전체적으로 잘 보이게, 2개 이상이면 모바일 2열 / PC 최대 4열 */}
                {isSingle ? (
                    (() => {
                        const gift = gifts[0];
                        const thumbs = getGiftThumbnails(gift);
                        const detail = gift.resolvedDetailImageUrl || gift.detailImageUrl;
                        const isSelected = selectedGiftId === gift._id;
                        const giftPeriod =
                            gift.startDate || gift.endDate
                                ? formatPeriodText(gift.startDate, gift.endDate)
                                : periodLabel;

                        return (
                            <div
                                onClick={() => onSelectGift(gift)}
                                className={`relative cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border transition-all bg-[#fbf6ee] text-[#2b2119] grid grid-cols-1 md:grid-cols-12 shadow-xl ${
                                    isSelected
                                        ? "border-[#e3b08b] ring-2 ring-[#b98a6a]"
                                        : "border-[#dccfbc] hover:border-[#b98a6a]"
                                }`}
                            >
                                <div className="md:col-span-5 relative bg-[#efe5d7] aspect-[16/10] sm:aspect-[4/3] md:aspect-auto md:min-h-[260px]">
                                    <ThumbnailCarousel
                                        images={thumbs}
                                        alt={gift.name}
                                        intervalMs={config.slideIntervalMs}
                                        className="w-full h-full"
                                        overlayBadge={
                                            <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#2b2119]/85 text-[#f6efe4] text-[10px] sm:text-[11px] font-bold z-10 pointer-events-none">
                                                증정 사은품
                                            </span>
                                        }
                                    />
                                </div>
                                <div className="md:col-span-7 p-3.5 sm:p-7 flex flex-col justify-between gap-2.5 sm:gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                                            <span className="text-[10px] sm:text-[11px] font-bold text-[#8a5d3b] tracking-wide">
                                                행사기간 · {giftPeriod}
                                            </span>
                                            {isSelected && (
                                                <span className="px-2 py-0.5 sm:px-2.5 rounded-full bg-[#2b2119] text-[#faf5ef] text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                                                    ✓ 선택됨
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base sm:text-2xl font-black text-[#2b2119] leading-snug break-keep">
                                            {gift.name}
                                        </h3>
                                        {gift.notice && (
                                            <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 rounded-xl bg-[#f3eadc] border border-[#e2d4c0] text-[11px] sm:text-xs text-[#5e4f42] whitespace-pre-line leading-snug sm:leading-relaxed break-keep">
                                                <strong className="block text-[#2b2119] mb-0.5 sm:mb-1">
                                                    ※ 사은품 유의사항
                                                </strong>
                                                {gift.notice}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 pt-1 sm:pt-2">
                                        {detail && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenDetail(gift);
                                                }}
                                                className="w-full sm:w-auto shrink-0 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-[#cbb9a4] bg-white text-[#2b2119] font-bold text-[11px] sm:text-sm hover:bg-[#f6efe4] transition whitespace-nowrap"
                                            >
                                                상세이미지 보기
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onApplyWithGift(gift);
                                            }}
                                            className="w-full sm:flex-1 min-w-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#2b2119] text-[#faf5ef] font-extrabold text-[11px] sm:text-sm hover:bg-[#3f3126] transition shadow-md whitespace-nowrap"
                                        >
                                            이 사은품으로 상담 신청하기 →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className={`relative ${gridClass}`}>
                        {gifts.map((gift, idx) => {
                            const thumbs = getGiftThumbnails(gift);
                            const detail = gift.resolvedDetailImageUrl || gift.detailImageUrl;
                            const isSelected = selectedGiftId === gift._id;

                            return (
                                <article
                                    key={gift._id}
                                    onClick={() => onSelectGift(gift)}
                                    className={`group cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden bg-[#fbf6ee] text-[#2b2119] border-2 transition-all flex flex-col ${
                                        isSelected
                                            ? "border-[#e3b08b] ring-2 ring-[#b98a6a]/70 shadow-xl -translate-y-0.5"
                                            : "border-transparent hover:border-[#b98a6a]/80"
                                    }`}
                                >
                                    <div className="relative aspect-[5/4] sm:aspect-[4/3] bg-[#efe5d7]">
                                        <ThumbnailCarousel
                                            images={thumbs}
                                            alt={gift.name}
                                            intervalMs={config.slideIntervalMs}
                                            className="w-full h-full"
                                            overlayBadge={
                                                <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 py-0.5 sm:px-2 rounded-full bg-[#2b2119]/85 text-[#f6efe4] text-[9.5px] sm:text-[10px] font-bold z-10 pointer-events-none">
                                                    혜택 {String(idx + 1).padStart(2, "0")}
                                                </span>
                                            }
                                            rightBadge={
                                                isSelected ? (
                                                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 py-0.5 sm:px-2 rounded-full bg-[#b98a6a] text-[#1a130e] text-[9.5px] sm:text-[10px] font-black shadow z-10 pointer-events-none">
                                                        ✓ 선택
                                                    </span>
                                                ) : null
                                            }
                                        />
                                    </div>

                                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
                                        <div>
                                            <h3 className="font-extrabold text-[11.5px] sm:text-sm text-[#2b2119] leading-tight sm:leading-snug line-clamp-2 break-keep">
                                                {gift.name}
                                            </h3>
                                            {(gift.startDate || gift.endDate) && (
                                                <p className="mt-0.5 sm:mt-1 text-[9.5px] sm:text-[11px] font-semibold text-[#8a5d3b] leading-tight">
                                                    {formatPeriodText(gift.startDate, gift.endDate)}
                                                </p>
                                            )}
                                            {gift.notice && (
                                                <p className="mt-1 sm:mt-1.5 text-[9.5px] sm:text-[11px] text-[#6d5c4e] leading-tight sm:leading-snug line-clamp-2 whitespace-pre-line break-keep">
                                                    {gift.notice}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                                            {detail && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onOpenDetail(gift);
                                                    }}
                                                    className="w-full py-1 sm:py-1.5 px-1.5 rounded-lg border border-[#d6c6b2] bg-white text-[#2b2119] font-bold text-[10px] sm:text-[11px] hover:bg-[#f6efe4] transition whitespace-nowrap"
                                                >
                                                    상세이미지 / 유의사항
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onApplyWithGift(gift);
                                                }}
                                                className={`w-full py-1.5 sm:py-2 px-1.5 rounded-lg font-extrabold text-[10.5px] sm:text-xs transition whitespace-nowrap ${
                                                    isSelected
                                                        ? "bg-[#b98a6a] text-[#1a130e]"
                                                        : "bg-[#2b2119] text-[#faf5ef] hover:bg-[#3f3126]"
                                                }`}
                                            >
                                                {isSelected ? "선택됨 · 상담신청 →" : "선택하고 상담신청"}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {/* 공통 유의사항 */}
                {config.commonNotice && (
                    <div className="relative mt-3 sm:mt-5 rounded-xl bg-black/25 border border-[#b98a6a]/30 px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-xs text-[#dfd2c3] whitespace-pre-line leading-snug sm:leading-relaxed break-keep">
                        <strong className="block text-[#f3dcc9] font-bold mb-0.5 sm:mb-1">[이벤트 유의사항]</strong>
                        {config.commonNotice}
                    </div>
                )}
            </div>
        </section>
    );
}

interface MaeumGiftDetailModalProps {
    gift: MaeumGiftItem | null;
    commonNotice?: string;
    onClose: () => void;
    onApplyWithGift: (gift: MaeumGiftItem) => void;
}

export function MaeumGiftDetailModal({
    gift,
    commonNotice,
    onClose,
    onApplyWithGift,
}: MaeumGiftDetailModalProps) {
    if (!gift) return null;

    const thumbs = getGiftThumbnails(gift);
    const detail = gift.resolvedDetailImageUrl || gift.detailImageUrl;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${gift.name} 상세 안내`}
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl max-h-[90vh] bg-[#fbf6ee] text-[#2b2119] rounded-2xl overflow-hidden shadow-2xl border border-[#dccfbc] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#2b2119] text-[#faf5ef]">
                    <div className="font-bold text-sm sm:text-base truncate pr-3">
                        🎁 {gift.name}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold"
                    >
                        닫기 ✕
                    </button>
                </div>

                <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
                    {thumbs.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-[#e3d7c6] bg-white aspect-[4/3]">
                            <ThumbnailCarousel
                                images={thumbs}
                                alt={gift.name}
                                className="w-full h-full"
                                imgClassName="object-contain bg-white"
                            />
                        </div>
                    )}

                    {detail && (
                        <div className="rounded-xl overflow-hidden border border-[#e3d7c6] bg-white">
                            <img
                                src={detail}
                                alt={`${gift.name} 상세이미지`}
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    )}

                    {(gift.startDate || gift.endDate) && (
                        <div className="text-xs font-bold text-[#8a5d3b] bg-[#f3eadc] px-3.5 py-2 rounded-lg border border-[#e2d4c0]">
                            📅 사은품 진행 기간: {formatPeriodText(gift.startDate, gift.endDate)}
                        </div>
                    )}

                    {(gift.notice || commonNotice) && (
                        <div className="p-3.5 rounded-xl bg-[#f3eadc] border border-[#e2d4c0] text-xs text-[#5a4b3d] space-y-2 whitespace-pre-line leading-relaxed">
                            <strong className="block text-[#2b2119] text-sm">
                                사은품 유의사항
                            </strong>
                            {gift.notice && <div>{gift.notice}</div>}
                            {commonNotice && (
                                <div className="pt-2 border-t border-[#e2d4c0] text-[#76675a]">
                                    {commonNotice}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-[#e3d7c6] bg-[#f6efe4] flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-[#cbb9a4] bg-white text-[#2b2119] font-bold text-xs sm:text-sm"
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onApplyWithGift(gift);
                            onClose();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#2b2119] text-[#faf5ef] font-extrabold text-xs sm:text-sm hover:bg-[#3f3126]"
                    >
                        이 사은품 선택하고 상담 신청하기 →
                    </button>
                </div>
            </div>
        </div>
    );
}

interface FloatingGiftWidgetProps {
    config: MaeumGiftEventConfig;
    gifts: MaeumGiftItem[];
    selectedGiftId: string;
    onSelectGift: (gift: MaeumGiftItem) => void;
    onOpenDetail: (gift: MaeumGiftItem) => void;
    onApplyWithGift: (gift: MaeumGiftItem) => void;
}

export function FloatingGiftWidget({
    config,
    gifts,
    selectedGiftId,
    onSelectGift,
    onOpenDetail,
    onApplyWithGift,
}: FloatingGiftWidgetProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);

    const activeGift =
        gifts.find((g) => g._id === selectedGiftId) || gifts[0] || null;
    const thumbs = activeGift ? getGiftThumbnails(activeGift) : [];
    const intervalMs =
        typeof config.slideIntervalMs === "number" && config.slideIntervalMs >= 300
            ? config.slideIntervalMs
            : 1500;

    useEffect(() => {
        setSlideIdx(0);
    }, [activeGift?._id]);

    useEffect(() => {
        if (thumbs.length <= 1 || collapsed) return;
        const timer = setInterval(() => {
            setSlideIdx((prev) => (prev + 1) % thumbs.length);
        }, intervalMs);
        return () => clearInterval(timer);
    }, [thumbs.length, intervalMs, collapsed]);

    if (!activeGift) return null;

    const safeSlideIdx = slideIdx >= thumbs.length ? 0 : slideIdx;
    const currentThumb = thumbs[safeSlideIdx] || thumbs[0] || "";
    const activeGiftIdx = gifts.findIndex((g) => g._id === activeGift._id);
    const periodLabel = formatPeriodText(config.startDate, config.endDate);

    return (
        <>
            {/* PC 우측 빈 영역 플로팅 사은품 위젯 (xl 이상: 중앙 860px 우측 여백) */}
            <aside
                aria-label="사은품 증정 이벤트 플로팅 안내"
                style={{ left: "calc(50% + 448px)" }}
                className="hidden xl:block fixed top-1/2 -translate-y-1/2 z-40 w-[184px] 2xl:w-[236px]"
            >
                {collapsed ? (
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="w-full rounded-2xl bg-[#2b2119] text-[#faf5ef] border-2 border-[#b98a6a] px-3 py-2.5 shadow-2xl flex items-center justify-between gap-2 hover:bg-[#3a2c22] transition"
                    >
                        <span className="text-xs font-extrabold truncate">
                            🎁 사은품 이벤트
                        </span>
                        <span className="text-[10px] font-bold text-[#e3b08b] shrink-0">
                            열기 ▲
                        </span>
                    </button>
                ) : (
                    <div className="rounded-2xl overflow-hidden bg-[#fbf6ee] text-[#2b2119] border-2 border-[#b98a6a] shadow-[0_18px_40px_rgba(43,33,25,0.28)]">
                        {/* 상단 배지 바 */}
                        <div className="bg-gradient-to-r from-[#2b2119] to-[#3f2f23] text-[#faf5ef] px-3 py-2 flex items-center justify-between gap-1">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-tight truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#e3b08b] animate-ping shrink-0" />
                                <span className="truncate">사은품 증정중</span>
                            </span>
                            <button
                                type="button"
                                aria-label="플로팅 배너 접기"
                                onClick={() => setCollapsed(true)}
                                className="text-[10px] text-[#d6c5b3] hover:text-white px-1 shrink-0"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 썸네일 자동 슬라이드 */}
                        <div
                            onClick={() => onOpenDetail(activeGift)}
                            className="relative aspect-[4/3] bg-[#efe5d7] cursor-pointer overflow-hidden"
                        >
                            {currentThumb && (
                                <img
                                    src={currentThumb}
                                    alt={activeGift.name}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                            )}
                            {thumbs.length > 1 && (
                                <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
                                    {thumbs.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`h-1 rounded-full transition-all ${
                                                i === safeSlideIdx
                                                    ? "w-3 bg-[#faf5ef]"
                                                    : "w-1 bg-white/55"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 사은품 정보 & 전환 */}
                        <div className="p-3 space-y-2">
                            <div className="text-[10px] font-bold text-[#8a5d3b] truncate">
                                📅 {periodLabel}
                            </div>
                            <div className="font-black text-xs 2xl:text-[13px] text-[#2b2119] leading-snug line-clamp-2">
                                {activeGift.name}
                            </div>

                            {gifts.length > 1 && (
                                <div className="flex items-center justify-between gap-1 pt-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const prevIdx =
                                                (activeGiftIdx - 1 + gifts.length) %
                                                gifts.length;
                                            onSelectGift(gifts[prevIdx]);
                                        }}
                                        className="px-2 py-0.5 rounded bg-[#efe5d7] hover:bg-[#e2d3bf] text-[10px] font-bold text-[#2b2119]"
                                    >
                                        ‹ 이전
                                    </button>
                                    <span className="text-[10px] font-bold text-[#76675a]">
                                        {activeGiftIdx + 1} / {gifts.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextIdx =
                                                (activeGiftIdx + 1) % gifts.length;
                                            onSelectGift(gifts[nextIdx]);
                                        }}
                                        className="px-2 py-0.5 rounded bg-[#efe5d7] hover:bg-[#e2d3bf] text-[10px] font-bold text-[#2b2119]"
                                    >
                                        다음 ›
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 pt-1">
                                {(activeGift.resolvedDetailImageUrl ||
                                    activeGift.detailImageUrl) && (
                                    <button
                                        type="button"
                                        onClick={() => onOpenDetail(activeGift)}
                                        className="w-full py-1.5 rounded-lg border border-[#d6c6b2] bg-white text-[#2b2119] font-bold text-[11px] hover:bg-[#f6efe4] transition"
                                    >
                                        상세·유의사항
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onApplyWithGift(activeGift)}
                                    className="w-full py-2 rounded-lg bg-[#2b2119] text-[#faf5ef] font-extrabold text-[11px] hover:bg-[#3f3126] transition shadow"
                                >
                                    사은품 받고 신청 →
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* 모바일 / 작은 화면 하단 컴팩트 플로팅 미니 바 */}
            <div className="xl:hidden fixed bottom-[72px] left-0 right-0 z-40 px-3 pointer-events-none flex justify-center">
                {collapsed ? (
                    <button
                        type="button"
                        onClick={() => setCollapsed(false)}
                        className="pointer-events-auto shadow-lg rounded-full bg-[#2b2119]/95 text-[#faf5ef] border border-[#b98a6a] px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5"
                    >
                        <span>🎁 사은품 이벤트 보기</span>
                    </button>
                ) : (
                    <div className="pointer-events-auto w-full max-w-[380px] rounded-2xl bg-[#fbf6ee]/95 backdrop-blur-md text-[#2b2119] border border-[#b98a6a] shadow-[0_10px_28px_rgba(43,33,25,0.28)] p-2 flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => onOpenDetail(activeGift)}
                            className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#efe5d7] border border-[#dccfbc] shrink-0"
                        >
                            {currentThumb && (
                                <img
                                    src={currentThumb}
                                    alt={activeGift.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </button>
                        <div
                            onClick={() => onOpenDetail(activeGift)}
                            className="min-w-0 flex-1 cursor-pointer"
                        >
                            <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#8a5d3b]">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#b98a6a] animate-pulse" />
                                <span>사은품 증정중</span>
                                {gifts.length > 1 && (
                                    <span className="text-[#9a8a7a]">
                                        ({activeGiftIdx + 1}/{gifts.length})
                                    </span>
                                )}
                            </div>
                            <div className="text-xs font-black text-[#2b2119] truncate">
                                {activeGift.name}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onApplyWithGift(activeGift)}
                            className="shrink-0 px-3 py-2 rounded-xl bg-[#2b2119] text-[#faf5ef] font-extrabold text-[11px] hover:bg-[#3f3126]"
                        >
                            받기 →
                        </button>
                        <button
                            type="button"
                            aria-label="미니 사은품 배너 닫기"
                            onClick={() => setCollapsed(true)}
                            className="shrink-0 w-6 h-6 rounded-full text-[#8a7a6a] hover:bg-[#efe5d7] text-[11px] font-bold flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
