import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 더 해피 450one",
    description: "호텔&리조트 혜택부터 헬스케어 서비스까지 이용하고도 만기 시 납입금 100% 환급 보장",
    openGraph: {
        title: "소노아임레디 | 더 해피 450one",
        description: "호텔&리조트 혜택부터 헬스케어 서비스까지 이용하고도 만기 시 납입금 100% 환급 보장",
        images: [
            {
                url: "https://res.cloudinary.com/lyjyvy54/image/upload/v1785994788/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_2_dkc5vb.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 더 해피 450one",
            }
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "소노아임레디 | 더 해피 450one",
        description: "호텔&리조트 혜택부터 헬스케어 서비스까지 이용하고도 만기 시 납입금 100% 환급 보장",
        images: ["https://res.cloudinary.com/lyjyvy54/image/upload/v1785994788/%EC%86%8C%EB%85%B8_%EB%8C%80%ED%91%9C_2_dkc5vb.png"],
    },
};

export default function Happy450ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
