"use client";

import React from "react";

export interface LatestSmsSummary {
    message: string;
    direction: "outbound" | "inbound";
    smsType: string;
    status: string;
    isRead?: boolean;
    createdAt: number;
}

interface RecentSmsCellProps {
    latestSms?: LatestSmsSummary;
    unreadCount?: number;
}

export function formatSmsShortTime(createdAt: number): string {
    const kst = new Date(createdAt + 9 * 60 * 60 * 1000);
    const mm = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(kst.getUTCDate()).padStart(2, "0");
    const hh = String(kst.getUTCHours()).padStart(2, "0");
    const min = String(kst.getUTCMinutes()).padStart(2, "0");
    return `${mm}.${dd} ${hh}:${min}`;
}

export const RecentSmsCell: React.FC<RecentSmsCellProps> = ({ latestSms, unreadCount = 0 }) => {
    if (!latestSms) {
        return <span className="text-[#9ba594] text-[12px]">-</span>;
    }

    const isInbound = latestSms.direction === "inbound";
    const isUnread = unreadCount > 0;

    let badgeClass = "green";
    let badgeLabel = "발신";
    if (isInbound) {
        badgeClass = isUnread ? "red" : "teal";
        badgeLabel = isUnread ? `수신 (${unreadCount})` : "수신";
    } else if (latestSms.status === "실패") {
        badgeClass = "red";
        badgeLabel = "실패";
    } else if (latestSms.status === "발송대기") {
        badgeClass = "orange";
        badgeLabel = "대기";
    }

    return (
        <div className="min-w-0 max-w-[200px] space-y-0.5" title={latestSms.message}>
            <div className="flex items-center justify-between gap-1.5">
                <span className={`adm-pill ${badgeClass} !py-0 !px-1.5 !text-[10px]`}>
                    {badgeLabel}
                </span>
                <span className="text-[10px] font-mono text-[#86918a] shrink-0">
                    {formatSmsShortTime(latestSms.createdAt)}
                </span>
            </div>
            <div
                className={`truncate text-[11.5px] leading-snug ${
                    isUnread ? "font-bold text-[#a85042]" : "text-[#526058]"
                }`}
            >
                {latestSms.message}
            </div>
        </div>
    );
};
