"use client";

import { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function PartnerTracker() {
    const params = useParams();
    const pathname = usePathname();
    const recordHit = useMutation(api.analytics.recordHit);
    
    // partnerId is in the URL as /p/[partnerId] (this is actually the customUrl)
    const customUrl = params?.partnerId as string;
    const partner = useQuery(api.partners.getPartnerByCustomUrl, 
        customUrl ? { customUrl } : "skip" as any
    );

    useEffect(() => {
        if (!partner || !customUrl) return;

        // visitorId 생성/조회 (LocalStorage 사용)
        let visitorId = localStorage.getItem("sono_visitor_id");
        if (!visitorId) {
            visitorId = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
            localStorage.setItem("sono_visitor_id", visitorId);
        }

        // 기록 요청 (내부 API/Convex 직접 호출)
        const hitData = {
            partnerId: partner.partnerId, // internal ID (e.g., P-177...)
            path: pathname,
            visitorId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        };

        recordHit(hitData).catch(err => console.error("Failed to record analytics hit:", err));

    }, [partner, customUrl, pathname, recordHit]);

    return null; // 렌더링되지 않는 투명 컴포넌트
}
