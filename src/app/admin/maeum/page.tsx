import MaeumContent from "@/components/products/MaeumContent";

export const dynamic = "force-dynamic";

export default function AdminMaeumPage() {
    return (
        <MaeumContent
            partnerMode={true}
            partnerUrl="admin"
            partnerName="본사 관리자"
            partnerId="ADMIN"
            partnerPhone="1588-5811"
        />
    );
}
