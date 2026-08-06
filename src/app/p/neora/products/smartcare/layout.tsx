import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 결합 상조 서비스",
    description: "스마트케어 - 최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
    openGraph: {
        title: "소노아임레디 | 결합 상조 서비스",
        description: "스마트케어 - 최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
        images: [
            {
                url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785994215/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_1_moatcv.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 결합 상조 서비스",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 | 결합 상조 서비스",
        description: "스마트케어 - 최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
        images: ["https://res.cloudinary.com/lyjyvy54/image/upload/v1785994215/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_1_moatcv.png"],
    },
};

export default function NeoraSmartCareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
