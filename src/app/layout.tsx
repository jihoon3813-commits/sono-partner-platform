import React, { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
    title: "소노아임레디 제휴 파트너 플랫폼",
    description: "소노 아임레디 제휴 파트너 플랫폼",
    keywords: ["소노아임레디", "상조", "제휴", "파트너", "스마트케어", "더해피450", "회원제쇼핑몰"],
    icons: {
        icon: "https://github.com/jihoon3813-commits/img_sono/blob/main/%ED%8C%8C%EB%B9%84%EC%BD%98_%EC%86%8C%EB%85%B8%ED%8C%8C%ED%8A%B8%EB%84%88.png?raw=true",
    },
    openGraph: {
        title: "소노아임레디 제휴 파트너 플랫폼",
        description: "소노 아임레디 제휴 파트너 플랫폼",
        url: "https://resolute-orca-48.convex.site",
        siteName: "소노아임레디 파트너",
        images: [
            {
                url: "https://github.com/jihoon3813-commits/img_sono/blob/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%ED%8C%8C%ED%8A%B8%EB%84%88%EB%B3%84%EC%82%AC%EC%9D%B4%ED%8A%B8%20%EB%A9%94%EC%9D%B8.png?raw=true",
                width: 1200,
                height: 630,
                alt: "소노아임레디 제휴 파트너 플랫폼",
            },
        ],
        locale: "ko_KR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 제휴 파트너 플랫폼",
        description: "소노 아임레디 제휴 파트너 플랫폼",
        images: ["https://github.com/jihoon3813-commits/img_sono/blob/main/%EB%8C%80%ED%91%9C%EC%9D%B4%EB%AF%B8%EC%A7%80_%ED%8C%8C%ED%8A%B8%EB%84%88%EB%B3%84%EC%82%AC%EC%9D%B4%ED%8A%B8%20%EB%A9%94%EC%9D%B8.png?raw=true"],
    },
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="antialiased min-h-screen bg-sono-light">
                <ConvexClientProvider>
                    {children}
                </ConvexClientProvider>
            </body>
        </html>
    );
}
