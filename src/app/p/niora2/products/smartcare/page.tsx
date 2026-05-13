"use client";

import SmartCareContent from "@/components/products/SmartCareContent";
import { useState, useEffect } from "react";

interface PartnerData {
    customUrl: string;
    name: string;
    partnerId: string;
}

export default function Niora2SmartCarePage() {
    const partnerId = "niora2";
    const [isLoading, setIsLoading] = useState(true);
    const [partner, setPartner] = useState<PartnerData | null>(null);

    useEffect(() => {
        // niora2 파트너 정보 조회
        async function fetchPartner() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/partners/${partnerId}`);
                const data = await response.json();
                if (data.success && data.data) {
                    setPartner(data.data);
                } else {
                    setPartner({
                        customUrl: partnerId,
                        name: "니오라2",
                        partnerId: `P-${partnerId.toUpperCase()}`
                    });
                }
            } catch (error) {
                console.error("Partner fetch error:", error);
                setPartner({
                    customUrl: partnerId,
                    name: "니오라2",
                    partnerId: `P-${partnerId.toUpperCase()}`
                });
            } finally {
                setIsLoading(false);
            }
        }
        fetchPartner();
    }, []);

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
            partnerUrl={partner?.customUrl || partnerId}
            partnerName={partner?.name || "니오라2"}
            partnerId={partner?.partnerId || partnerId}
            isPremiumMallMode={true}
        />
    );
}
