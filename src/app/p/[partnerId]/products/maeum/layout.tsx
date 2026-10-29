import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 마음든든",
    description: "마음든든 2·5·1. 지정 1인을 위한 잔금 보장 구조와 의전서비스 및 호텔·리조트 멤버십",
};

export default function PartnerMaeumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
