import { redirect } from "next/navigation";

export default async function LegacyPartnerPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const { partnerId } = await params;
    // 파트너 메인페이지 제거 지침에 따라 스마트케어 상품페이지로 즉시 리다이렉트
    redirect(`/${partnerId}/smartcare`);
}
