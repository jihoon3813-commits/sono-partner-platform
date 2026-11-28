import type { Metadata } from "next";

const OG_IMAGE_URL =
    "https://res.cloudinary.com/lyjyvy54/image/upload/v1795863364/%EC%9E%A5%EB%B3%91%EA%B3%BC_%ED%95%A0%EB%A8%B8%EB%8B%88_%EA%B7%A4%EB%A1%9C_%EC%9D%B4%EC%96%B4%EC%A7%84_%EB%A7%88%EC%9D%8C-2_sqsqxw.png";

export const metadata: Metadata = {
    title: "소노아임레디 | 군장병·군인가족 마음든든(밀리)",
    description:
        "나라를 지키는 동안, 가족의 내일도 든든하게. 조부모·부모 사전 지정 시 5년 잔금 면제 보장, 소노 리조트 연 10박 회원가, 만기 시 100% 전액 환급.",
    openGraph: {
        title: "소노아임레디 | 군장병·군인가족 마음든든",
        description:
            "할머니·할아버지, 부모님을 위한 첫 효도. 5년 잔금 면제 보장과 리조트 멤버십, 만기 100% 환급까지 한 번에 준비하세요.",
        images: [
            {
                url: OG_IMAGE_URL,
                width: 1200,
                height: 630,
                alt: "소노아임레디 군장병·군인가족 마음든든",
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
