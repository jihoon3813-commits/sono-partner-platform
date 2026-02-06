import React, { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export const metadata: Metadata = {
    title: "소노아임레디 제휴 파트너 플랫폼",
    description: "소노아임레디 파트너 플랫폼 - 소노아임레디와 함께 비즈니스 동반 성장을 경함하세요",
    keywords: ["소노아임레디", "상조", "제휴", "파트너", "스마트케어", "더해피450", "회원제쇼핑몰"],
    icons: {
        icon: "https://github.com/jihoon3813-commits/img_sono/blob/main/%ED%8C%8C%EB%B9%84%EC%BD%98_%EC%86%8C%EB%85%B8%ED%8C%8C%ED%8A%B8%EB%84%88.png?raw=true",
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
