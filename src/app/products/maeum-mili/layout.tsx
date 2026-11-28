import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 마음든든(밀리) · 군장병·군인가족 특별 안내",
    description:
        "군장병·군인가족을 위한 마음든든 5. 만 80세 이하 조부모·부모 지정 시 5년 잔금 면제 보장, 전국 24시간 의전, 소노 리조트 멤버십 및 만기 100% 환급",
    openGraph: {
        title: "소노아임레디 | 마음든든(밀리) · 군장병·군인가족 특별 안내",
        description:
            "나라를 지키는 동안, 가족의 내일도 든든하게. 조부모·부모 지정 가능, 5년 잔금 면제 보장, 만기 100% 환급",
        images: [
            {
                url: "/images/maeum/family-moment.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 마음든든(밀리)",
            },
        ],
        type: "website",
    },
};

export default function MaeumMiliProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
