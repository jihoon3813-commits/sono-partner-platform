import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 스마트케어 - 니오라",
    description: "소노아임레디 스마트케어 - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
    openGraph: {
        title: "소노아임레디 스마트케어 - 니오라",
        description: "소노아임레디 스마트케어 - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
        images: [
            {
                url: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%ED%8C%8C%ED%8A%B8%EB%84%88%EB%B3%84%EC%82%AC%EC%9D%B4%ED%8A%B8%20%EB%A9%94%EC%9D%B8.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 스마트케어",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 스마트케어 - 니오라",
        description: "소노아임레디 스마트케어 - 니오라 파트너 전용 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
        images: ["https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%ED%8C%8C%ED%8A%B8%EB%84%88%EB%B3%84%EC%82%AC%EC%9D%B4%ED%8A%B8%20%EB%A9%94%EC%9D%B8.png"],
    },
};

export default function NeoraSmartCareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
