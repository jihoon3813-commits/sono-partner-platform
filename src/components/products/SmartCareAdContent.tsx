"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import InquiryModal from "@/components/InquiryModal";
import {
    LandingGiftBottom,
    LandingGiftOverlays,
    LandingGiftTop,
    useLandingGiftEvent,
} from "./LandingGiftWidgets";

export default function SmartCareAdContent() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(3000);
    const [isConsultOpen, setIsConsultOpen] = useState(false);
    const giftState = useLandingGiftEvent("smartcare-ad");

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

    return (
        <div className="min-h-screen bg-[#dfe5ee] pb-24">
            <LandingGiftTop
                state={giftState}
                onApplyWithGift={(gift) => {
                    giftState.setSelectedGiftId(gift._id);
                    setIsConsultOpen(true);
                }}
            />

            <iframe
                ref={iframeRef}
                src="/landing/smartcare-ad-detail.html"
                title="스마트케어 가전 렌탈·상조 결합상품 상세 안내"
                scrolling="no"
                className="w-full border-0 block"
                style={{ height: `${iframeHeight}px` }}
            />

            <LandingGiftBottom
                state={giftState}
                onApplyWithGift={(gift) => {
                    giftState.setSelectedGiftId(gift._id);
                    setIsConsultOpen(true);
                }}
            />

            <LandingGiftOverlays
                state={giftState}
                onApplyWithGift={(gift) => {
                    giftState.setSelectedGiftId(gift._id);
                    setIsConsultOpen(true);
                }}
            />

            {/* 하단 플로팅 빠른 상담 신청 바 */}
            <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                <button
                    type="button"
                    onClick={() => setIsConsultOpen(true)}
                    className="pointer-events-auto shadow-2xl flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#111c33] text-[#f3f6fb] hover:bg-[#1a2b4d] active:scale-[0.98] transition-all border border-[#6899de]/50 font-bold text-sm sm:text-base"
                >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6899de] animate-pulse" />
                    <span>스마트케어 지금 상담받기</span>
                    <span className="text-[#6899de] font-black">→</span>
                </button>
            </div>

            <InquiryModal
                isOpen={isConsultOpen}
                onClose={() => setIsConsultOpen(false)}
                partnerId="ADMIN"
                partnerName="본사 직접 신청"
                productType="스마트케어(광고)"
                showProductSelect={false}
                initialUnit="4"
                variant="drawer"
                gifts={giftState.gifts}
                selectedGiftId={giftState.selectedGiftId}
                onSelectGiftId={giftState.setSelectedGiftId}
            />
        </div>
    );
}
