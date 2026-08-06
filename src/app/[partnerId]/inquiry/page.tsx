"use client";

import PartnerInquiryPage from "@/app/p/[partnerId]/inquiry/page";

export default function DirectPartnerInquiryPage({ params }: { params: Promise<{ partnerId: string }> }) {
    return <PartnerInquiryPage params={params} />;
}

export const dynamic = 'force-dynamic';
