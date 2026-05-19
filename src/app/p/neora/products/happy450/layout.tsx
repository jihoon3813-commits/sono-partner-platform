import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 더 해피 450 ONE - 니오라",
    description: "소노아임레디 더 해피450 ONE - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
    openGraph: {
        title: "소노아임레디 더 해피 450 ONE - 니오라",
        description: "소노아임레디 더 해피450 ONE - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
        images: [
            {
                url: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%EB%8D%94%ED%95%B4%ED%94%BC450.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 더 해피 450 ONE",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 더 해피 450 ONE - 니오라",
        description: "소노아임레디 더 해피450 ONE - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
        images: ["https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%EB%8D%94%ED%95%B4%ED%94%BC450.png"],
    },
};

export default function NeoraHappy450Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
