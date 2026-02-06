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
    openGraph: {
        title: "소노아임레디 제휴 파트너 플랫폼",
        description: "소노아임레디 파트너 플랫폼 - 소노아임레디와 함께 비즈니스 동반 성장을 경함하세요",
        images: [
            {
                url: "https://github.com/jihoon3813-commits/img_sono/blob/main/Generated%20Image%20January%2022,%202026%20-%203_21PM.jpeg?raw=true",
                width: 1200,
                height: 630,
            }
        ],
        type: "website",
        locale: "ko_KR",
    },
};



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased min-h-screen bg-sono-light">
                <div style={{ background: 'red', color: 'white', padding: '5px', textAlign: 'center', fontWeight: 'bold', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999 }}>
                    [DEBUG] LAYOUT IS RENDERING
                </div>
                <ConvexClientProvider>
                    <div className="pt-8">
                        {children}
                    </div>
                </ConvexClientProvider>
            </body>
        </html>
    );
}
