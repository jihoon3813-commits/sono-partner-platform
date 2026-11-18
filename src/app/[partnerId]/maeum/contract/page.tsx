"use client";

import MaeumContractForm from "@/components/products/MaeumContractForm";
import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface PartnerData {
    customUrl: string;
    name: string;
    partnerId: string;
}

function PartnerMaeumContractInner({ partnerIdParam }: { partnerIdParam: string }) {
    const searchParams = useSearchParams();
    const planParam = searchParams.get("plan");
    const initialPlan = planParam === "3" || planParam === "4" || planParam === "5" ? planParam : "4";
    const [partner, setPartner] = useState<PartnerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function fetchPartner() {
            try {
                const res = await fetch(`/api/partners/${encodeURIComponent(partnerIdParam)}`, { cache: "no-store" });
                if (res.ok && mounted) {
                    const data = await res.json();
                    if (data?.success && data?.data) {
                        setPartner(data.data);
                        return;
                    }
                }
                if (mounted) {
                    setPartner({
                        customUrl: partnerIdParam,
                        name: "소노 파트너",
                        partnerId: partnerIdParam,
                    });
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        }
        fetchPartner();
        return () => { mounted = false; };
    }, [partnerIdParam]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">불러오는 중...</div>;
    }

    return (
        <MaeumContractForm
            partnerUrl={partner?.customUrl || partnerIdParam}
            partnerId={partner?.partnerId || partnerIdParam}
            partnerName={partner?.name || "소노 파트너"}
            initialPlan={initialPlan}
            backHref={`/${partnerIdParam}/maeum`}
        />
    );
}

export default function PartnerMaeumDirectContractPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolved = use(params);
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">불러오는 중...</div>}>
            <PartnerMaeumContractInner partnerIdParam={resolved.partnerId} />
        </Suspense>
    );
}
