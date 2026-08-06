import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 스마트케어",
    description: "최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
    openGraph: {
        title: "소노아임레디 | 스마트케어",
        description: "최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
        url: "./",
        images: [
            {
                url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785994789/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_3_kjxit4.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 스마트케어",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 | 스마트케어",
        description: "최신가전 렌탈금 전액 지원과 만기 시 납입금 100% 환급 보장",
        images: ["https://res.cloudinary.com/lyjyvy54/image/upload/v1785994789/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_3_kjxit4.png"],
    },
};

export default function SmartCareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
