"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MaeumConsultDrawer from "./MaeumConsultDrawer";
import {
    FloatingGiftWidget,
    MaeumGiftDetailModal,
    MaeumGiftEventConfig,
    MaeumGiftEventSection,
    MaeumGiftItem,
} from "./MaeumGiftEventSection";

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatPeriodText(startDate?: string, endDate?: string): string {
    const s = (startDate || "").trim();
    const e = (endDate || "").trim();
    if (s && e) return `${s.replace(/-/g, ".")} ~ ${e.replace(/-/g, ".")}`;
    if (s) return `${s.replace(/-/g, ".")} ~`;
    if (e) return `~ ${e.replace(/-/g, ".")} 까지`;
    return "한정 기간 진행";
}

interface MaeumAdContentProps {
    landingKey?: string;
    productNamePrefix?: string;
    partnerMode?: boolean;
    partnerUrl?: string;
    partnerName?: string;
    partnerId?: string;
    partnerPhone?: string;
}

export default function MaeumAdContent({
    landingKey = "maeum-ad",
    productNamePrefix = "마음든든(광고)",
    partnerMode = false,
    partnerUrl = "",
    partnerName = "",
    partnerId = "",
    partnerPhone = "",
}: MaeumAdContentProps = {}) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(3000);
    const [iframeReady, setIframeReady] = useState(false);
    const [isConsultOpen, setIsConsultOpen] = useState(false);

    const giftEvent = useQuery(api.maeumGifts.getPublicGiftEvent, {
        landingKey,
    });

    const gifts: MaeumGiftItem[] = useMemo(
        () => (giftEvent?.isEventActive ? giftEvent.gifts || [] : []),
        [giftEvent]
    );
    const config: MaeumGiftEventConfig | null = useMemo(
        () => (giftEvent?.config ? giftEvent.config : null),
        [giftEvent]
    );

    const [selectedGiftId, setSelectedGiftId] = useState<string>("");
    const [detailModalGift, setDetailModalGift] = useState<MaeumGiftItem | null>(null);

    // 활성 사은품이 있을 때 기본 자동 선택
    useEffect(() => {
        if (gifts.length === 0) {
            setSelectedGiftId("");
            return;
        }
        const stillExists = gifts.some((g) => g._id === selectedGiftId);
        if (!stillExists) {
            setSelectedGiftId(gifts[0]._id);
        }
    }, [gifts, selectedGiftId]);

    const handleSelectGift = useCallback((gift: MaeumGiftItem) => {
        setSelectedGiftId(gift._id);
    }, []);

    const handleApplyWithGift = useCallback((gift: MaeumGiftItem) => {
        setSelectedGiftId(gift._id);
        setIsConsultOpen(true);
    }, []);

    const bindIframeHandlers = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        let doc: Document | null = null;
        try {
            doc = iframe.contentDocument || iframe.contentWindow?.document || null;
        } catch {
            doc = null;
        }
        if (!doc) return;

        const updateHeight = () => {
            if (!doc) return;
            const fitEl = doc.getElementById("fit");
            const nextHeight = fitEl
                ? fitEl.getBoundingClientRect().height
                : doc.documentElement?.scrollHeight || doc.body?.scrollHeight || 0;
            if (nextHeight > 200) {
                setIframeHeight(Math.ceil(nextHeight));
            }
        };

        updateHeight();
        setIframeReady(true);

        const ctaBtn = doc.getElementById("ctaBtn");
        const onCtaClick = () => {
            setIsConsultOpen(true);
        };
        if (ctaBtn) {
            ctaBtn.style.cursor = "pointer";
            ctaBtn.setAttribute("role", "button");
            ctaBtn.setAttribute("tabindex", "0");
            ctaBtn.addEventListener("click", onCtaClick);
        }

        const fitEl = doc.getElementById("fit");
        let resizeObserver: ResizeObserver | null = null;
        if (fitEl && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(fitEl);
        }

        const win = iframe.contentWindow;
        win?.addEventListener("resize", updateHeight);

        return () => {
            if (ctaBtn) {
                ctaBtn.removeEventListener("click", onCtaClick);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            win?.removeEventListener("resize", updateHeight);
        };
    }, []);

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        const iframe = iframeRef.current;
        if (!iframe) return;

        const handleLoad = () => {
            if (cleanup) cleanup();
            cleanup = bindIframeHandlers();
        };

        iframe.addEventListener("load", handleLoad);
        if (iframe.contentDocument?.readyState === "complete") {
            cleanup = bindIframeHandlers();
        }

        return () => {
            iframe.removeEventListener("load", handleLoad);
            if (cleanup) cleanup();
        };
    }, [bindIframeHandlers]);

    // 중간(iframe 내부 #maeum-gift-mid) 사은품 증정 이벤트 섹션 렌더링
    useEffect(() => {
        if (!iframeReady) return;
        const iframe = iframeRef.current;
        if (!iframe) return;

        let doc: Document | null = null;
        try {
            doc = iframe.contentDocument || iframe.contentWindow?.document || null;
        } catch {
            doc = null;
        }
        if (!doc) return;

        const midEl = doc.getElementById("maeum-gift-mid");
        if (!midEl) return;

        if (!giftEvent?.isEventActive || !config || gifts.length === 0) {
            midEl.style.display = "none";
            midEl.innerHTML = "";
            return;
        }

        const periodText = formatPeriodText(config.startDate, config.endDate);
        const badgeText = escapeHtml(
            config.badgeText || "SPECIAL GIFT EVENT · 사은품 증정 이벤트 진행중"
        );
        const titleText = escapeHtml(
            config.title || "지금 마음든든 상담·가입 시 특별 사은품 증정!"
        );
        const subtitleText = config.subtitle ? escapeHtml(config.subtitle) : "";
        const pcCols = gifts.length === 2 ? 2 : gifts.length === 3 ? 3 : 4;

        const buildSliderHtml = (g: MaeumGiftItem, extraOverlayHtml: string) => {
            const thumbs =
                Array.isArray(g.resolvedThumbnailUrls) &&
                g.resolvedThumbnailUrls.length > 0
                    ? g.resolvedThumbnailUrls
                    : g.resolvedThumbnailUrl || g.thumbnailUrl
                    ? [g.resolvedThumbnailUrl || g.thumbnailUrl]
                    : [];
            const hasMulti = thumbs.length > 1;
            const slides = thumbs
                .map(
                    (url, i) =>
                        `<img src="${escapeHtml(url)}" alt="${escapeHtml(g.name)} ${i + 1}" />`
                )
                .join("");
            const miniThumbs = hasMulti
                ? `<div class="mg-thumbs">${thumbs
                      .map(
                          (url, i) =>
                              `<button type="button" class="mg-thumb ${i === 0 ? "active" : ""}" data-action="slide-to" data-slide-idx="${i}" aria-label="${i + 1}번 썸네일"><img src="${escapeHtml(url)}" alt="${escapeHtml(g.name)} 미리보기 ${i + 1}" /></button>`
                      )
                      .join("")}</div>`
                : "";
            const nav = hasMulti
                ? `<button type="button" class="mg-nav mg-prev" data-action="slide-prev" aria-label="이전 이미지">‹</button><button type="button" class="mg-nav mg-next" data-action="slide-next" aria-label="다음 이미지">›</button>`
                : "";
            return `
              <div class="mg-slider" data-slide-index="0" data-slide-count="${thumbs.length}">
                <div class="mg-stage">
                  <div class="mg-track">${slides}</div>
                  ${nav}
                  ${extraOverlayHtml}
                </div>
                ${miniThumbs}
              </div>
            `;
        };

        const cardsHtml =
            gifts.length === 1
                ? (() => {
                      const g = gifts[0];
                      const hasDetail = Boolean(g.resolvedDetailImageUrl || g.detailImageUrl);
                      const isSel = selectedGiftId === g._id;
                      const gPeriod =
                          g.startDate || g.endDate
                              ? formatPeriodText(g.startDate, g.endDate)
                              : periodText;
                      return `
                        <div class="mg-single ${isSel ? "is-sel" : ""}" data-gift-id="${escapeHtml(g._id)}">
                          <div class="mg-single-img">
                            ${buildSliderHtml(g, '<span class="mg-tag">증정 사은품</span>')}
                          </div>
                          <div class="mg-single-body">
                            <div class="mg-meta">
                              <span>행사기간 · ${escapeHtml(gPeriod)}</span>
                              ${isSel ? '<span class="mg-sel-pill">✓ 선택됨</span>' : ""}
                            </div>
                            <h3>${escapeHtml(g.name)}</h3>
                            ${
                                g.notice
                                    ? `<div class="mg-notice"><strong>※ 사은품 유의사항</strong><div>${escapeHtml(g.notice).replace(/\n/g, "<br>")}</div></div>`
                                    : ""
                            }
                            <div class="mg-actions">
                              ${
                                  hasDetail
                                      ? `<button type="button" class="mg-btn-sec" data-action="detail" data-gift-id="${escapeHtml(g._id)}">상세이미지 보기</button>`
                                      : ""
                              }
                              <button type="button" class="mg-btn-pri" data-action="apply" data-gift-id="${escapeHtml(g._id)}">이 사은품으로 상담 신청하기 →</button>
                            </div>
                          </div>
                        </div>
                      `;
                  })()
                : `<div class="mg-grid mg-cols-${pcCols}">
                    ${gifts
                        .map((g, idx) => {
                            const hasDetail = Boolean(
                                g.resolvedDetailImageUrl || g.detailImageUrl
                            );
                            const isSel = selectedGiftId === g._id;
                            const overlays = `
                              <span class="mg-tag">혜택 ${String(idx + 1).padStart(2, "0")}</span>
                              ${isSel ? '<span class="mg-sel-badge">✓ 선택</span>' : ""}
                            `;
                            return `
                              <div class="mg-card ${isSel ? "is-sel" : ""}" data-gift-id="${escapeHtml(g._id)}">
                                <div class="mg-card-img">
                                  ${buildSliderHtml(g, overlays)}
                                </div>
                                <div class="mg-card-body">
                                  <h4>${escapeHtml(g.name)}</h4>
                                  ${
                                      g.notice
                                          ? `<p class="mg-card-note">${escapeHtml(g.notice)}</p>`
                                          : ""
                                  }
                                  <div class="mg-card-btns">
                                    ${
                                        hasDetail
                                            ? `<button type="button" class="mg-btn-sec" data-action="detail" data-gift-id="${escapeHtml(g._id)}">상세이미지 보기</button>`
                                            : ""
                                    }
                                    <button type="button" class="mg-btn-pri ${isSel ? "is-sel" : ""}" data-action="apply" data-gift-id="${escapeHtml(g._id)}">
                                      ${isSel ? "선택됨 · 상담신청 →" : "선택하고 상담신청"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            `;
                        })
                        .join("")}
                   </div>`;

        midEl.style.display = "block";
        midEl.style.padding = "64px 44px";
        midEl.style.background = "linear-gradient(180deg,#2b2119 0%,#36281e 100%)";
        midEl.style.color = "#faf5ef";

        midEl.innerHTML = `
          <style>
            #maeum-gift-mid *{box-sizing:border-box}
            #maeum-gift-mid{word-break:keep-all;overflow-wrap:break-word}
            #maeum-gift-mid .mg-head{text-align:center;margin-bottom:32px}
            #maeum-gift-mid .mg-badges{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:16px}
            #maeum-gift-mid .mg-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;background:#b98a6a;color:#1a130e;font-weight:900;font-size:16px;letter-spacing:.06em}
            #maeum-gift-mid .mg-period{display:inline-flex;align-items:center;padding:8px 16px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(185,138,106,.45);color:#f3dcc9;font-weight:700;font-size:16px}
            #maeum-gift-mid h2{font-size:40px;font-weight:900;line-height:1.25;color:#fff9f2;letter-spacing:-.03em}
            #maeum-gift-mid .mg-sub{margin-top:10px;font-size:20px;color:#d9cbbd}
            #maeum-gift-mid .mg-single{display:grid;grid-template-columns:340px 1fr;background:#fbf6ee;color:#2b2119;border-radius:22px;overflow:hidden;border:2px solid #dccfbc;cursor:pointer}
            #maeum-gift-mid .mg-single.is-sel{border-color:#e3b08b;box-shadow:0 0 0 3px rgba(185,138,106,.5)}
            #maeum-gift-mid .mg-single-img{position:relative;background:#efe5d7;min-height:260px}
            #maeum-gift-mid .mg-single-img img{width:100%;height:100%;object-fit:cover;display:block}
            #maeum-gift-mid .mg-single-body{padding:28px;display:flex;flex-direction:column;justify-content:space-between;gap:14px}
            #maeum-gift-mid .mg-meta{display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:700;color:#8a5d3b}
            #maeum-gift-mid .mg-sel-pill{padding:4px 12px;border-radius:999px;background:#2b2119;color:#faf5ef;font-size:14px}
            #maeum-gift-mid .mg-single-body h3{font-size:28px;font-weight:900;line-height:1.3}
            #maeum-gift-mid .mg-notice{background:#f3eadc;border:1px solid #e2d4c0;border-radius:12px;padding:12px 14px;font-size:16px;line-height:1.5;color:#5e4f42}
            #maeum-gift-mid .mg-notice strong{display:block;color:#2b2119;margin-bottom:4px}
            #maeum-gift-mid .mg-actions{display:flex;gap:10px;margin-top:4px}
            #maeum-gift-mid .mg-grid{display:grid;gap:16px}
            #maeum-gift-mid .mg-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
            #maeum-gift-mid .mg-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
            #maeum-gift-mid .mg-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
            @media (max-width: 767px){
              #maeum-gift-mid .mg-cols-3,#maeum-gift-mid .mg-cols-4{grid-template-columns:repeat(2,minmax(0,1fr))}
              #maeum-gift-mid .mg-single{grid-template-columns:1fr}
              #maeum-gift-mid .mg-actions{flex-direction:column}
            }
            #maeum-gift-mid .mg-card{background:#fbf6ee;color:#2b2119;border-radius:18px;overflow:hidden;border:2px solid transparent;display:flex;flex-direction:column;cursor:pointer}
            #maeum-gift-mid .mg-card.is-sel{border-color:#e3b08b;box-shadow:0 0 0 3px rgba(185,138,106,.5)}
            #maeum-gift-mid .mg-card-img{position:relative;aspect-ratio:4/3;background:#efe5d7;overflow:hidden}
            #maeum-gift-mid .mg-card-img img{width:100%;height:100%;object-fit:cover;display:block}
            #maeum-gift-mid .mg-slider{display:flex;flex-direction:column;width:100%;height:100%}
            #maeum-gift-mid .mg-stage{position:relative;flex:1;min-height:0;overflow:hidden}
            #maeum-gift-mid .mg-track{display:flex;width:100%;height:100%;transition:transform .3s ease-out}
            #maeum-gift-mid .mg-track img{width:100%;height:100%;object-fit:cover;flex-shrink:0;display:block}
            #maeum-gift-mid .mg-nav{position:absolute;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:999px;border:none;background:rgba(0,0,0,.55);color:#fff;font-size:18px;font-weight:900;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5}
            #maeum-gift-mid .mg-nav:hover{background:rgba(0,0,0,.8)}
            #maeum-gift-mid .mg-prev{left:8px}
            #maeum-gift-mid .mg-next{right:8px}
            #maeum-gift-mid .mg-thumbs{display:flex;align-items:center;gap:6px;padding:6px 8px;background:#e8dccb;border-top:1px solid #dccfbc;overflow-x:auto}
            #maeum-gift-mid .mg-thumb{flex-shrink:0;width:44px;height:34px;padding:0;border-radius:6px;overflow:hidden;border:1.5px solid #cbb9a4;opacity:.65;cursor:pointer;background:#fff;transition:all .15s}
            #maeum-gift-mid .mg-thumb.active{border-color:#2b2119;box-shadow:0 0 0 2px #b98a6a;opacity:1}
            #maeum-gift-mid .mg-thumb img{width:100%;height:100%;object-fit:cover;display:block}
            #maeum-gift-mid .mg-tag{position:absolute;top:10px;left:10px;padding:4px 10px;border-radius:999px;background:rgba(43,33,25,.85);color:#f6efe4;font-size:13px;font-weight:800;z-index:4;pointer-events:none}
            #maeum-gift-mid .mg-sel-badge{position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:999px;background:#b98a6a;color:#1a130e;font-size:13px;font-weight:900;z-index:4;pointer-events:none}
            #maeum-gift-mid .mg-card-body{padding:16px;display:flex;flex-direction:column;flex:1;justify-content:space-between;gap:10px}
            #maeum-gift-mid .mg-card-body h4{font-size:19px;font-weight:900;line-height:1.35;margin:0}
            #maeum-gift-mid .mg-card-note{font-size:14px;color:#6d5c4e;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
            #maeum-gift-mid .mg-card-btns{display:flex;flex-direction:column;gap:6px;margin-top:auto}
            #maeum-gift-mid .mg-btn-sec{padding:9px 12px;border-radius:10px;border:1px solid #cbb9a4;background:#fff;color:#2b2119;font-size:15px;font-weight:800;cursor:pointer}
            #maeum-gift-mid .mg-btn-pri{flex:1;padding:10px 14px;border-radius:10px;border:none;background:#2b2119;color:#faf5ef;font-size:15px;font-weight:900;cursor:pointer}
            #maeum-gift-mid .mg-btn-pri.is-sel{background:#b98a6a;color:#1a130e}
            #maeum-gift-mid .mg-common{margin-top:22px;padding:16px 20px;border-radius:14px;background:rgba(0,0,0,.25);border:1px solid rgba(185,138,106,.3);font-size:16px;line-height:1.6;color:#dfd2c3}
          </style>
          <div class="mg-head">
            <div class="mg-badges">
              <span class="mg-badge">${badgeText}</span>
              <span class="mg-period">📅 ${escapeHtml(periodText)}</span>
            </div>
            <h2>${titleText}</h2>
            ${subtitleText ? `<p class="mg-sub">${subtitleText}</p>` : ""}
          </div>
          ${cardsHtml}
          ${
              config.commonNotice
                  ? `<div class="mg-common"><strong style="color:#f3dcc9;display:block;margin-bottom:4px">[이벤트 유의사항]</strong>${escapeHtml(config.commonNotice).replace(/\n/g, "<br>")}</div>`
                  : ""
          }
        `;

        const applySlide = (slider: HTMLElement, next: number) => {
            slider.dataset.slideIndex = String(next);
            const track = slider.querySelector(".mg-track") as HTMLElement | null;
            if (track) track.style.transform = `translateX(-${next * 100}%)`;
            slider.querySelectorAll(".mg-thumb").forEach((thumb, i) => {
                thumb.classList.toggle("active", i === next);
            });
        };

        const handleMidClick = (ev: Event) => {
            const target = ev.target as HTMLElement | null;
            if (!target) return;
            const actionBtn = target.closest("[data-action]") as HTMLElement | null;
            const action = actionBtn?.dataset.action;

            if (action === "slide-prev" || action === "slide-next" || action === "slide-to") {
                ev.stopPropagation();
                const slider = actionBtn?.closest(".mg-slider") as HTMLElement | null;
                if (!slider) return;
                const count = Number(slider.dataset.slideCount || "1");
                if (count <= 1) return;
                const cur = Number(slider.dataset.slideIndex || "0");
                let next = cur;
                if (action === "slide-prev") next = (cur - 1 + count) % count;
                else if (action === "slide-next") next = (cur + 1) % count;
                else if (action === "slide-to") next = Number(actionBtn?.dataset.slideIdx || "0");
                applySlide(slider, next);
                return;
            }

            const cardEl = target.closest("[data-gift-id]") as HTMLElement | null;
            const giftId = actionBtn?.dataset.giftId || cardEl?.dataset.giftId;
            if (!giftId) return;

            const found = gifts.find((g) => g._id === giftId);
            if (!found) return;

            if (action === "detail") {
                setDetailModalGift(found);
            } else if (action === "apply") {
                handleApplyWithGift(found);
            } else {
                handleSelectGift(found);
            }
        };

        const sliders = Array.from(midEl.querySelectorAll(".mg-slider")) as HTMLElement[];
        const onEnter = (e: Event) => {
            (e.currentTarget as HTMLElement).dataset.paused = "1";
        };
        const onLeave = (e: Event) => {
            (e.currentTarget as HTMLElement).dataset.paused = "0";
        };
        sliders.forEach((s) => {
            s.addEventListener("mouseenter", onEnter);
            s.addEventListener("mouseleave", onLeave);
        });

        const intervalMs =
            typeof config.slideIntervalMs === "number" && config.slideIntervalMs >= 300
                ? config.slideIntervalMs
                : 1500;
        const autoTimer = window.setInterval(() => {
            sliders.forEach((slider) => {
                if (slider.dataset.paused === "1") return;
                const count = Number(slider.dataset.slideCount || "1");
                if (count <= 1) return;
                const cur = Number(slider.dataset.slideIndex || "0");
                applySlide(slider, (cur + 1) % count);
            });
        }, intervalMs);

        midEl.addEventListener("click", handleMidClick);
        return () => {
            window.clearInterval(autoTimer);
            sliders.forEach((s) => {
                s.removeEventListener("mouseenter", onEnter);
                s.removeEventListener("mouseleave", onLeave);
            });
            midEl.removeEventListener("click", handleMidClick);
        };
    }, [
        iframeReady,
        giftEvent,
        config,
        gifts,
        selectedGiftId,
        handleApplyWithGift,
        handleSelectGift,
    ]);

    return (
        <div className="min-h-screen bg-[#e9dfd1] pb-24">
            {/* 상단 사은품 증정 이벤트 섹션 */}
            {giftEvent?.isEventActive && config && gifts.length > 0 && (
                <MaeumGiftEventSection
                    position="top"
                    config={config}
                    gifts={gifts}
                    selectedGiftId={selectedGiftId}
                    onSelectGift={handleSelectGift}
                    onOpenDetail={setDetailModalGift}
                    onApplyWithGift={handleApplyWithGift}
                />
            )}

            <iframe
                ref={iframeRef}
                src="/landing/maeum-ad-detail.html"
                title="마음든든 3·4·5 상세 안내"
                scrolling="no"
                className="w-full border-0 block"
                style={{ height: `${iframeHeight}px` }}
            />

            {/* 하단 사은품 증정 이벤트 섹션 */}
            {giftEvent?.isEventActive && config && gifts.length > 0 && (
                <MaeumGiftEventSection
                    position="bottom"
                    config={config}
                    gifts={gifts}
                    selectedGiftId={selectedGiftId}
                    onSelectGift={handleSelectGift}
                    onOpenDetail={setDetailModalGift}
                    onApplyWithGift={handleApplyWithGift}
                />
            )}

            {/* PC 우측 빈 영역 & 모바일 미니 플로팅 사은품 배너 */}
            {giftEvent?.isEventActive && config && gifts.length > 0 && (
                <FloatingGiftWidget
                    config={config}
                    gifts={gifts}
                    selectedGiftId={selectedGiftId}
                    onSelectGift={handleSelectGift}
                    onOpenDetail={setDetailModalGift}
                    onApplyWithGift={handleApplyWithGift}
                />
            )}

            {/* 하단 플로팅 빠른 상담 신청 바 */}
            <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                <button
                    type="button"
                    onClick={() => setIsConsultOpen(true)}
                    className="pointer-events-auto shadow-2xl flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#2b2119] text-[#faf5ef] hover:bg-[#3e3025] active:scale-[0.98] transition-all border border-[#b98a6a]/50 font-bold text-sm sm:text-base"
                >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#b98a6a] animate-pulse" />
                    <span>
                        {gifts.length > 0
                            ? "사은품 받고 마음든든 상담받기"
                            : "마음든든 5 지금 상담받기"}
                    </span>
                    <span className="text-[#b98a6a] font-black">→</span>
                </button>
            </div>

            {/* 사은품 상세이미지 모달 */}
            <MaeumGiftDetailModal
                gift={detailModalGift}
                commonNotice={config?.commonNotice}
                onClose={() => setDetailModalGift(null)}
                onApplyWithGift={handleApplyWithGift}
            />

            <MaeumConsultDrawer
                isOpen={isConsultOpen}
                onClose={() => setIsConsultOpen(false)}
                initialPlan="5"
                initialTarget="부모님"
                partnerId={partnerMode ? partnerId : ""}
                partnerUrl={partnerMode ? partnerUrl : ""}
                partnerName={partnerMode ? partnerName : ""}
                partnerPhone={partnerMode ? partnerPhone : ""}
                productNamePrefix={productNamePrefix}
                gifts={gifts}
                selectedGiftId={selectedGiftId}
                onSelectGiftId={setSelectedGiftId}
            />
        </div>
    );
}
