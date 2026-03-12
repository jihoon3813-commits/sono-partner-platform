import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 스마트케어",
    description: "소노아임레디 스마트케어 - 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
    openGraph: {
        title: "소노아임레디 스마트케어",
        description: "소노아임레디 스마트케어 - 특별한 혜택과 함께 최고의 라이프 서비스를 제공합니다.",
        images: [
            {
                url: "https://raw.githubusercontent.com/jihoon3813-commits/img_sono/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%EC%8A%A4%EB%A7%88%ED%8A%B8%EC%BC%80%EC%96%B4.png",
                width: 1200,
                height: 630,
            }
        ],
    },
};

export default function SmartCareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
