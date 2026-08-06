"use client";

import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function PartnerTracker() {
    const params = useParams();
    const pathname = usePathname();
    const recordHit = useMutation(api.analytics.recordHit);

    // Extract partner identifier from route params or URL path (/p/[partnerId]/...)
    const routePartnerId = params?.partnerId as string;
    const pathParts = pathname ? pathname.split("/").filter(Boolean) : [];
    const pathPartnerId = (pathParts[0] === "p" && pathParts[1]) ? pathParts[1] : undefined;

    // Safely extract query parameters without causing Next.js useSearchParams CSR bailout during SSG
    let queryPartnerId: string | undefined = undefined;
    if (typeof window !== "undefined") {
        try {
            const search = new URLSearchParams(window.location.search);
            queryPartnerId = search.get("partnerId") || search.get("p") || undefined;
        } catch (e) {}
    }

    const partnerIdentifier = routePartnerId || pathPartnerId || queryPartnerId || "main";

    // Query partner by customUrl or partnerId if identifier is present
    const partnerByCustomUrl = useQuery(api.partners.getPartnerByCustomUrl,
        (partnerIdentifier && partnerIdentifier !== "main") ? { customUrl: partnerIdentifier } : "skip" as any
    );
    const partnerById = useQuery(api.partners.getPartnerById,
        (partnerIdentifier && partnerIdentifier !== "main" && !partnerByCustomUrl) ? { partnerId: partnerIdentifier } : "skip" as any
    );

    const lastRecordedKey = useRef<string>("");

    useEffect(() => {
        if (!pathname) return;

        // Skip internal admin dashboard / API calls
        if (pathname.startsWith("/partner-center") || pathname.startsWith("/api")) {
            return;
        }

        // Determine final partnerId (or fallback to identifier / "main")
        const finalPartnerId = partnerByCustomUrl?.partnerId || partnerById?.partnerId || partnerIdentifier || "main";

        // Deduplicate hit calls for same path and partnerId during same session/render
        const recordKey = `${pathname}:${finalPartnerId}`;
        if (lastRecordedKey.current === recordKey) return;
        lastRecordedKey.current = recordKey;

        // Visitor ID handling (LocalStorage)
        let visitorId = "";
        if (typeof window !== "undefined") {
            try {
                visitorId = localStorage.getItem("sono_visitor_id") || "";
                if (!visitorId) {
                    visitorId = "v_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
                    localStorage.setItem("sono_visitor_id", visitorId);
                }
            } catch (err) {
                visitorId = "v_anon_" + Date.now();
            }
        }

        const hitData = {
            partnerId: finalPartnerId,
            path: pathname,
            visitorId: visitorId || "anonymous",
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
        };

        recordHit(hitData).catch(err => console.error("Failed to record analytics hit:", err));

    }, [partnerByCustomUrl, partnerById, partnerIdentifier, pathname, recordHit]);

    return null;
}
