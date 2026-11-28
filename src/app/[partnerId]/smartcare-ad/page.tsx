"use client";

import SmartCareAdContent from "@/components/products/SmartCareAdContent";
import { useState, useEffect, use } from "react";
import { isReservedKeyword } from "@/lib/constants";

interface PartnerData {
    customUrl: string;
    name: string;
    partnerId: string;
    inquiryPhone?: string;
}

export default function PartnerSmartCareAdDirectPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolvedParams = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [partner, setPartner] = useState<PartnerData | null>(null);

    const lowerId = (resolvedParams.partnerId || "").trim().toLowerCase();

    useEffect(() => {
        if (lowerId === "privacy") {
            window.location.replace("/privacy");
            return;
        }
        if (lowerId === "terms") {
            window.location.replace("/terms");
            return;
        }
        if (lowerId === "disclosure") {
            window.location.replace("/disclosure");
            return;
        }
        if (lowerId === "admin") {
            window.location.replace("/products/smartcare-ad");
            return;
        }
        if (isReservedKeyword(lowerId)) {
            window.location.replace("/");
            return;
        }

        let isMounted = true;
        async function fetchPartner() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/partners/${encodeURIComponent(resolvedParams.partnerId)}`, {
                    cache: "no-store",
                }).catch(() => null);

                if (!isMounted) return;

                if (response && response.ok) {
                    const data = await response.json().catch(() => null);
                    if (data && data.success && data.data) {
                        setPartner(data.data);
                        return;
                    }
                }

                setPartner({
                    customUrl: resolvedParams.partnerId,
                    name: "소노 파트너",
                    partnerId: `P-TEMP-${resolvedParams.partnerId}`,
                });
            } catch (error) {
                console.warn("Partner fetch handled gracefully:", error);
                if (isMounted) {
                    setPartner({
                        customUrl: resolvedParams.partnerId,
                        name: "소노 파트너",
                        partnerId: `P-TEMP-${resolvedParams.partnerId}`,
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        fetchPartner();
        return () => {
            isMounted = false;
        };
    }, [resolvedParams.partnerId, lowerId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f3f6fb] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-[#163a6b] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <SmartCareAdContent
            partnerMode={true}
            partnerId={partner?.partnerId || resolvedParams.partnerId}
            partnerName={partner?.name || ""}
        />
    );
}
