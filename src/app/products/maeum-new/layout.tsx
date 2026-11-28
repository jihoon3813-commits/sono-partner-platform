import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "소노아임레디 | 마음든든(new) 3·4·5",
    description: "마음든든 3·4·5. 부모님을 위한 2·5·1 잔금 보장 구조와 의전서비스 및 소노호텔앤리조트 멤버십",
    openGraph: {
        title: "소노아임레디 | 마음든든(new) 3·4·5",
        description: "마음든든 3·4·5. 부모님을 위한 2·5·1 잔금 보장 구조와 의전서비스 및 소노호텔앤리조트 멤버십",
        images: [
            {
                url: "/images/maeum/family-moment.png",
                width: 1200,
                height: 630,
                alt: "소노아임레디 | 마음든든(new) 3·4·5",
            },
        ],
        type: "website",
    },
};

export default function MaeumNewProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
