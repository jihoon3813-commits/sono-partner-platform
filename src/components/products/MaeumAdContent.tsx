"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import MaeumConsultDrawer from "./MaeumConsultDrawer";

export default function MaeumAdContent() {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [iframeHeight, setIframeHeight] = useState<number>(3000);
    const [isConsultOpen, setIsConsultOpen] = useState(false);

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
        // 이미 로드된 경우 대비
        if (iframe.contentDocument?.readyState === "complete") {
            cleanup = bindIframeHandlers();
        }

        return () => {
            iframe.removeEventListener("load", handleLoad);
            if (cleanup) cleanup();
        };
    }, [bindIframeHandlers]);

    return (
        <div className="min-h-screen bg-[#e9dfd1] pb-24">
            <iframe
                ref={iframeRef}
                src="/landing/maeum-ad-detail.html"
                title="마음든든 3·4·5 상세 안내"
                scrolling="no"
                className="w-full border-0 block"
                style={{ height: `${iframeHeight}px` }}
            />

            {/* 하단 플로팅 빠른 상담 신청 바 */}
            <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
                <button
                    type="button"
                    onClick={() => setIsConsultOpen(true)}
                    className="pointer-events-auto shadow-2xl flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#2b2119] text-[#faf5ef] hover:bg-[#3e3025] active:scale-[0.98] transition-all border border-[#b98a6a]/50 font-bold text-sm sm:text-base"
                >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#b98a6a] animate-pulse" />
                    <span>마음든든 3·4·5 지금 상담받기</span>
                    <span className="text-[#b98a6a] font-black">→</span>
                </button>
            </div>

            <MaeumConsultDrawer
                isOpen={isConsultOpen}
                onClose={() => setIsConsultOpen(false)}
                initialPlan="4"
                initialTarget="부모님"
                productNamePrefix="마음든든(광고)"
            />
        </div>
    );
}
