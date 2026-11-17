"use client";

import React, { useEffect } from "react";
import { AdminIcon } from "./AdminIcons";

export interface AdminDrawerTab {
    id: string;
    label: string;
    badge?: string | number;
}

interface AdminDrawerProps {
    title: string;
    subtitle?: string;
    headerRight?: React.ReactNode;
    tabs?: AdminDrawerTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    onClose: () => void;
    footer?: React.ReactNode;
    footerCaption?: string;
    maxWidth?: string;
    zIndex?: number;
    children: React.ReactNode;
}

export default function AdminDrawer({
    title,
    subtitle,
    headerRight,
    tabs,
    activeTab,
    onTabChange,
    onClose,
    footer,
    footerCaption,
    maxWidth = "610px",
    zIndex = 65,
    children,
}: AdminDrawerProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    return (
        <div
            className="adm-drawer-overlay"
            style={{ zIndex }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <aside
                className="adm-drawer"
                style={{ maxWidth: `min(${maxWidth}, 100%)` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="adm-drawer-head">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2>{title}</h2>
                            {headerRight}
                        </div>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="adm-icon-btn"
                        aria-label="패널 닫기"
                    >
                        <AdminIcon name="close" />
                    </button>
                </div>

                {tabs && tabs.length > 0 && (
                    <div className="adm-drawer-tabs" role="tablist">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === t.id}
                                onClick={() => onTabChange?.(t.id)}
                                className={`adm-drawer-tab ${activeTab === t.id ? "active" : ""}`}
                            >
                                <span>{t.label}</span>
                                {t.badge !== undefined && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#edf2e7] text-[#3a6149] font-bold">
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <div className="adm-drawer-scroll">{children}</div>

                {footer !== undefined && (
                    <div className="adm-drawer-foot">
                        {footerCaption && <span className="adm-caption">{footerCaption}</span>}
                        {footer}
                    </div>
                )}
            </aside>
        </div>
    );
}
