"use client";

import MaeumEcontractDrawer from "@/components/products/MaeumEcontractDrawer";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MaeumMobileEcontractInner() {
    const searchParams = useSearchParams();
    const appId = searchParams.get("appId") || "";
    const planParam = searchParams.get("plan");
    const partnerIdParam = searchParams.get("partnerId") || "";
    const partnerUrlParam = searchParams.get("partnerUrl") || "";
    const partnerNameParam = searchParams.get("partnerName") || "";
    const partnerPhoneParam = searchParams.get("partnerPhone") || "";

    const existingApp = useQuery(
        api.maeumContracts.getApplicationForEcontract,
        appId ? { applicationId: appId } : "skip"
    );

    if (appId && existingApp === undefined) {
        return (
            <div className="min-h-screen bg-[#f4f2e7] flex items-center justify-center text-sm font-medium text-[#173c37]">
                전자계약 정보를 불러오는 중입니다...
            </div>
        );
    }

    const derivedPlan: "3" | "4" | "5" =
        planParam === "3" || planParam === "4" || planParam === "5"
            ? planParam
            : existingApp?.productType?.includes("3")
            ? "3"
            : existingApp?.productType?.includes("5")
            ? "5"
            : "4";

    return (
        <MaeumEcontractDrawer
            variant="page"
            isOpen={true}
            initialPlan={derivedPlan}
            partnerId={existingApp?.partnerId || partnerIdParam}
            partnerUrl={partnerUrlParam}
            partnerName={existingApp?.partnerName || partnerNameParam}
            partnerPhone={partnerPhoneParam}
            applicationId={existingApp?._id ? String(existingApp._id) : undefined}
            prefill={
                existingApp
                    ? {
                          customerName: existingApp.customerName,
                          customerPhone: existingApp.customerPhone,
                          customerBirth: existingApp.customerBirth,
                          customerGender: existingApp.customerGender,
                          customerEmail: existingApp.customerEmail,
                          customerAddress: existingApp.customerAddress,
                          customerZipcode: existingApp.customerZipcode,
                          productType: existingApp.productType,
                      }
                    : undefined
            }
        />
    );
}

export default function MaeumMobileEcontractPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f4f2e7] flex items-center justify-center text-sm font-medium text-[#173c37]">
                    불러오는 중...
                </div>
            }
        >
            <MaeumMobileEcontractInner />
        </Suspense>
    );
}
