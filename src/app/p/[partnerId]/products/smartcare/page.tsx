"use client";

import SmartCareContent from "@/components/products/SmartCareContent";
import { useState, useEffect, use } from "react";

interface PartnerData {
    customUrl: string;
    name: string;
    partnerId: string;
}

export default function PartnerSmartCarePage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolvedParams = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [partner, setPartner] = useState<PartnerData | null>(null);

    useEffect(() => {
        // 파트너 정보 조회
        async function fetchPartner() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/partners/${resolvedParams.partnerId}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setPartner(data.data);
                } else {
                    setPartner({
                        customUrl: resolvedParams.partnerId,
                        name: "소노 파트너",
                        partnerId: `P-TEMP-${resolvedParams.partnerId}`
                    });
                }
            } catch (error) {
                console.error("Partner fetch error:", error);
                setPartner({
                    customUrl: resolvedParams.partnerId,
                    name: "소노 파트너",
                    partnerId: `P-TEMP-${resolvedParams.partnerId}`
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchPartner();
    }, [resolvedParams.partnerId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-sono-light flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-sono-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <SmartCareContent
            partnerMode={true}
            partnerUrl={partner?.customUrl || resolvedParams.partnerId}
            partnerName={partner?.name || ""}
            partnerId={partner?.partnerId || resolvedParams.partnerId}
        />
    );
}
