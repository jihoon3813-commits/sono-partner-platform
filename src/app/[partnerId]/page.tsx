import { redirect } from "next/navigation";
import { isReservedKeyword } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export default async function PartnerMainRedirectPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const { partnerId } = await params;
    const lowerId = (partnerId || "").trim().toLowerCase();

    if (lowerId === "privacy") {
        redirect("/privacy");
    }
    if (lowerId === "terms") {
        redirect("/terms");
    }
    if (lowerId === "disclosure") {
        redirect("/disclosure");
    }
    if (isReservedKeyword(lowerId)) {
        redirect("/");
    }

    // 파트너 메인페이지 대신 대표 상품(스마트케어)으로 즉시 리다이렉트
    redirect(`/${partnerId}/smartcare`);
}

