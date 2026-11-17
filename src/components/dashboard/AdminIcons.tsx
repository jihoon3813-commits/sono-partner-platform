"use client";

import React from "react";

export type AdminIconName =
    | "home"
    | "grid"
    | "users"
    | "network"
    | "building"
    | "box"
    | "gift"
    | "clock"
    | "chart"
    | "folder"
    | "settings"
    | "external"
    | "arrow-up-right"
    | "arrow-right"
    | "chevron-right"
    | "chevron-down"
    | "search"
    | "bell"
    | "plus"
    | "calendar"
    | "download"
    | "upload"
    | "phone"
    | "check"
    | "check-circle"
    | "trend"
    | "info"
    | "close"
    | "menu"
    | "copy"
    | "file"
    | "mic"
    | "shield"
    | "megaphone"
    | "refresh"
    | "logout"
    | "trash";

export function AdminIcon({
    name,
    className = "",
}: {
    name: AdminIconName;
    className?: string;
}) {
    const renderPaths = () => {
        switch (name) {
            case "home":
                return <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />;
            case "grid":
                return (
                    <>
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </>
                );
            case "users":
                return (
                    <>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        <circle cx="9" cy="7" r="4" />
                    </>
                );
            case "network":
                return (
                    <>
                        <rect x="8" y="3" width="8" height="5" rx="1" />
                        <rect x="2" y="16" width="7" height="5" rx="1" />
                        <rect x="15" y="16" width="7" height="5" rx="1" />
                        <path d="M12 8v4M5.5 16v-4h13v4" />
                    </>
                );
            case "building":
                return <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h4v12M2 21h20M8 7h4M8 11h4M8 15h4M9 21v-3h2v3" />;
            case "box":
                return <path d="m12 3 9 5v9l-9 5-9-5V8zm0 9 9-4M12 12 3 8m9 4v10M7.5 5.5l9 5v4" />;
            case "gift":
                return (
                    <>
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M5 12v9h14v-9M12 8v13" />
                        <path d="M12 8H7.5A2.5 2.5 0 1 1 10 5.5zm0 0h4.5A2.5 2.5 0 1 0 14 5.5z" />
                    </>
                );
            case "clock":
                return (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </>
                );
            case "chart":
                return <path d="M3 3v18h18M7 16v-5m5 5V7m5 9v-7" />;
            case "folder":
                return <path d="M3 7V5a2 2 0 0 1 2-2h5l3 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />;
            case "settings":
                return (
                    <>
                        <path d="m9 3-.6 2.2-2 .9-2.1-.7-2 3.5 1.6 1.6v2.4l-1.6 1.6 2 3.5 2.1-.7 2 .9L9 21h4l.6-2.2 2-.9 2.1.7 2-3.5-1.6-1.6v-2.4l1.6-1.6-2-3.5-2.1.7-2-.9L13 3z" />
                        <circle cx="11" cy="12" r="3" />
                    </>
                );
            case "external":
                return <path d="M14 3h7v7M21 3 11 13M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />;
            case "arrow-up-right":
                return <path d="M7 17 17 7M7 7h10v10" />;
            case "arrow-right":
                return <path d="M4 12h16m-6-6 6 6-6 6" />;
            case "chevron-right":
                return <path d="m9 5 7 7-7 7" />;
            case "chevron-down":
                return <path d="m6 9 6 6 6-6" />;
            case "search":
                return (
                    <>
                        <circle cx="10.5" cy="10.5" r="7" />
                        <path d="m16 16 5 5" />
                    </>
                );
            case "bell":
                return <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />;
            case "plus":
                return <path d="M12 5v14M5 12h14" />;
            case "calendar":
                return (
                    <>
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M7 3v4m10-4v4M3 11h18M7 15h2m6 0h2m-10 3h2" />
                    </>
                );
            case "download":
                return <path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />;
            case "upload":
                return <path d="M12 16V4m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />;
            case "phone":
                return <path d="m8 3 2 5-3 2c1 3 3 5 6 6l2-3 5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 6a2 2 0 0 1 2-2z" />;
            case "check":
                return <path d="m5 12 4 4L19 6" />;
            case "check-circle":
                return (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 12 3 3 5-6" />
                    </>
                );
            case "trend":
                return <path d="m3 17 6-6 4 4 8-11M15 4h6v6" />;
            case "info":
                return (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 11v6M12 7h.01" />
                    </>
                );
            case "close":
                return <path d="m6 6 12 12M6 18 18 6" />;
            case "menu":
                return <path d="M4 6h16M4 12h16M4 18h16" />;
            case "copy":
                return (
                    <>
                        <rect x="8" y="8" width="13" height="13" rx="2" />
                        <path d="M16 8V3H3v13h5" />
                    </>
                );
            case "file":
                return <path d="M14 2H5v20h14V7zm0 0v5h5M8 12h8M8 16h8" />;
            case "mic":
                return (
                    <>
                        <rect x="9" y="2" width="6" height="13" rx="3" />
                        <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
                    </>
                );
            case "shield":
                return (
                    <>
                        <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z" />
                        <path d="m8 11 3 3 5-5" />
                    </>
                );
            case "megaphone":
                return <path d="m3 9 14-5v16L3 15zm14-1 4-2v12l-4-2M5 16l2 6h4l-2-5" />;
            case "refresh":
                return <path d="M20 7A9 9 0 0 0 4 5M3 2v5h5m-4 10a9 9 0 0 0 16 2m1 3v-5h-5" />;
            case "logout":
                return <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />;
            case "trash":
                return <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6m4-6v6" />;
            default:
                return <path d="M14 2H5v20h14V7zm0 0v5h5" />;
        }
    };

    return (
        <svg
            className={`adm-icon ${className}`}
            aria-hidden="true"
            viewBox="0 0 24 24"
        >
            {renderPaths()}
        </svg>
    );
}
