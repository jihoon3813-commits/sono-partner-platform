import SmartCareContent from "@/components/products/SmartCareContent";

export const dynamic = "force-dynamic";

export default function AdminSmartcarePage() {
    return (
        <SmartCareContent
            partnerMode={true}
            partnerUrl="admin"
            partnerName="본사 관리자"
            partnerId="ADMIN"
            partnerPhone="1588-5811"
        />
    );
}
