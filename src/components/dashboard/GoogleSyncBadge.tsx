"use client";

import React from "react";
import { formatDateTime } from "@/lib/dateUtils";
import { normalizeKoreanPhone } from "@/utils/googleContacts";

interface GoogleSyncBadgeProps {
    syncedAt?: number;
    className?: string;
}

export function isCustomerGoogleSynced(params: {
    isAdmin?: boolean;
    customerPhone?: string;
    googleContactsSyncedAt?: number;
    cachedContactPhones?: Set<string>;
    syncedDbPhones?: Set<string>;
}): boolean {
    if (!params.isAdmin) return false;
    if (params.googleContactsSyncedAt) return true;
    const norm = normalizeKoreanPhone(params.customerPhone || "");
    if (norm.length < 9) return false;
    return Boolean(
        params.cachedContactPhones?.has(norm) || params.syncedDbPhones?.has(norm)
    );
}

/**
 * 구글 주소록(Google Contacts) 연동 완료 상태를 표시하는 배지
 */
export const GoogleSyncBadge: React.FC<GoogleSyncBadgeProps> = ({
    syncedAt,
    className = "",
}) => {
    const titleText = syncedAt
        ? `구글 주소록 연동 완료 (${formatDateTime(undefined, syncedAt)})`
        : "구글 주소록에 연동된 연락처입니다";

    return (
        <span
            className={`inline-flex items-center gap-1 px-1.5 py-[2.5px] rounded-[5px] bg-[#e3f1ea] text-[#185a46] text-[10.5px] font-semibold leading-tight whitespace-nowrap ${className}`}
            title={titleText}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-[#185a46] shrink-0" />
            <span>구글연동</span>
        </span>
    );
};
