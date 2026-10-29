"use client";

import MaeumContent from "@/components/products/MaeumContent";
import { useState, useEffect, use } from "react";

interface PartnerData {
    customUrl: string;
    name: string;
    partnerId: string;
    inquiryPhone?: string;
}

export default function PartnerMaeumProductPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolvedParams = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [partner, setPartner] = useState<PartnerData | null>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchPartner() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/partners/${encodeURIComponent(resolvedParams.partnerId)}`, {
                    cache: 'no-store'
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
                    partnerId: `P-TEMP-${resolvedParams.partnerId}`
                });
            } catch (error) {
                console.warn("Partner fetch handled gracefully:", error);
                if (isMounted) {
                    setPartner({
                        customUrl: resolvedParams.partnerId,
                        name: "소노 파트너",
                        partnerId: `P-TEMP-${resolvedParams.partnerId}`
                    });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        fetchPartner();
        return () => { isMounted = false; };
    }, [resolvedParams.partnerId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-[#316d60] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <MaeumContent
            partnerMode={true}
            partnerUrl={partner?.customUrl || resolvedParams.partnerId}
            partnerName={partner?.name || ""}
            partnerId={partner?.partnerId || resolvedParams.partnerId}
            partnerPhone={partner?.inquiryPhone || ""}
        />
    );
}

export const dynamic = 'force-dynamic';
