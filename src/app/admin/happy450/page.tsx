import Happy450Content from "@/components/products/Happy450Content";

export const dynamic = "force-dynamic";

export default function AdminHappy450Page() {
    return (
        <Happy450Content
            partnerMode={true}
            partnerUrl="admin"
            partnerName="본사 관리자"
            partnerId="ADMIN"
            partnerPhone="1588-5811"
        />
    );
}
