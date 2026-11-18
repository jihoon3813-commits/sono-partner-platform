"use client";

import MaeumContractForm from "@/components/products/MaeumContractForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MaeumContractInner() {
    const searchParams = useSearchParams();
    const planParam = searchParams.get("plan");
    const initialPlan = planParam === "3" || planParam === "4" || planParam === "5" ? planParam : "4";

    return (
        <MaeumContractForm
            initialPlan={initialPlan}
            backHref="/products/maeum"
        />
    );
}

export default function MaeumContractPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-gray-500">불러오는 중...</div>}>
            <MaeumContractInner />
        </Suspense>
    );
}
