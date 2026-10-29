import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 마음든든",
    description: "마음든든 2·5·1. 지정 1인을 위한 잔금 보장 구조와 의전서비스 및 호텔·리조트 멤버십",
    openGraph: {
        title: "소노아임레디 | 마음든든 (Maeum 251)",
        description: "마음든든 2·5·1. 지정 1인을 위한 잔금 보장 구조와 의전서비스 및 호텔·리조트 멤버십",
        images: [
            {
                url: "/images/maeum/family-moment.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 마음든든",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 | 마음든든",
        description: "마음든든 2·5·1. 지정 1인을 위한 잔금 보장 구조와 의전서비스 및 호텔·리조트 멤버십",
        images: ["/images/maeum/family-moment.png"],
    },
};

export default function MaeumProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
