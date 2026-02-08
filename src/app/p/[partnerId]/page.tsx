"use client";

import { Header, Footer } from "@/components/layout";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import InquiryModal from "@/components/InquiryModal";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface PartnerData {
    partnerId: string;
    name: string;
    logoUrl?: string;
    logoText?: string;
    landingTitle?: string;
    pointInfo: string;
    brandColor?: string;
    customUrl: string;
}

const fallbackPartners: Record<string, PartnerData> = {
    "demo": {
        partnerId: "P-DEMO-001",
        name: "데모 쇼핑몰",
        pointInfo: "계약 시 최대 30만 포인트 지급",
        brandColor: "#1e3a5f",
        customUrl: "demo",
    },
    "abc-mall": {
        partnerId: "P-ABC-001",
        name: "ABC 쇼핑몰",
        pointInfo: "계약 시 최대 20만 포인트 지급",
        brandColor: "#2563eb",
        customUrl: "abc-mall",
    },
    "lifenjoy2": {
        partnerId: "P-LIFE-002",
        name: "라이프엔조이2",
        pointInfo: "특별 제휴 혜택 최대 50만P",
        brandColor: "#ff5a5f",
        customUrl: "lifenjoy2",
    },
};

export default function PartnerPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolvedParams = use(params);
    const [partner, setPartner] = useState<PartnerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchPartner() {
            // Check for immediate fallback match to avoid spinner for demo accounts
            const immediateFallback = fallbackPartners[resolvedParams.partnerId];
            if (immediateFallback) {
                setPartner(immediateFallback);
                setIsLoading(false);
                return;
            }

            console.log("Fetching partner data for:", resolvedParams.partnerId);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // increased timeout to 10s

            try {
                const response = await fetch(`/api/partners/${resolvedParams.partnerId}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setPartner(data.data);
                    } else {
                        // Fallback to local data if API fails or partner not in DB
                        const fb = fallbackPartners[resolvedParams.partnerId as keyof typeof fallbackPartners];
                        setPartner({
                            partnerId: fb?.partnerId || `P-TEMP-${resolvedParams.partnerId}`,
                            name: fb?.name || "소노 파트너",
                            customUrl: resolvedParams.partnerId,
                            logoUrl: fb?.logoUrl,
                            logoText: fb?.logoText,
                            landingTitle: fb?.landingTitle,
                            pointInfo: fb?.pointInfo || "소노아임레디 특별 혜택",
                            brandColor: fb?.brandColor || "#1e3a5f"
                        });
                    }
                } else {
                    // API call failed (e.g., 404, 500)
                    console.error(`API error: ${response.status}`);
                    const fb = fallbackPartners[resolvedParams.partnerId as keyof typeof fallbackPartners];
                    setPartner({
                        partnerId: fb?.partnerId || `P-TEMP-${resolvedParams.partnerId}`,
                        name: fb?.name || "소노 파트너",
                        customUrl: resolvedParams.partnerId,
                        logoUrl: fb?.logoUrl,
                        logoText: fb?.logoText,
                        landingTitle: fb?.landingTitle,
                        pointInfo: fb?.pointInfo || "소노아임레디 특별 혜택",
                        brandColor: fb?.brandColor || "#1e3a5f"
                    });
                }
            } catch (error) {
                console.error("Partner fetch error:", error);
                const fb = fallbackPartners[resolvedParams.partnerId as keyof typeof fallbackPartners];
                setPartner({
                    partnerId: fb?.partnerId || `P-TEMP-${resolvedParams.partnerId}`,
                    name: fb?.name || "소노 파트너",
                    customUrl: resolvedParams.partnerId,
                    logoUrl: fb?.logoUrl,
                    logoText: fb?.logoText,
                    landingTitle: fb?.landingTitle,
                    pointInfo: fb?.pointInfo || "소노아임레디 특별 혜택",
                    brandColor: fb?.brandColor || "#1e3a5f"
                });
            } finally {
                setIsLoading(false);
            }
        }

        if (resolvedParams.partnerId) {
            fetchPartner();
        } else {
            setError(true);
            setIsLoading(false);
        }
    }, [resolvedParams.partnerId]);

    const [selectedProduct, setSelectedProduct] = useState<"happy450" | "smartcare" | null>(null);
    const [modalProduct, setModalProduct] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        zonecode: "",
        address: "",
        addressDetail: "",
        preferredTime: "",
        inquiry: "",
        privacyAgreed: false,
    });
    const [smartCareUnit, setSmartCareUnit] = useState<string>("4");
    const [selectedAppliance, setSelectedAppliance] = useState<string>("상담 시 결정");

    // Convex Products Query
    const productsData = useQuery(api.products.get);
    const allAppliances = productsData || [];
    const isLoadingAppliances = productsData === undefined;

    // Remove GAS Effect
    /*
    useEffect(() => {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwQkuIm7ERScHFZMUrn4bqw81hhr3oE2Zw9MNGXmkldCTGh16Ho5-WdzVXwZHJC8b_b/exec";
        async function fetchProducts() {
            try {
                setIsLoadingAppliances(true);
                const response = await fetch(`${GAS_URL}?action=getProducts`);
                const data = await response.json();
                setAllAppliances(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoadingAppliances(false);
            }
        }
        fetchProducts();
    }, []);
    */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    useEffect(() => {
        if (!document.getElementById("daum-postcode-script")) {
            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    if (isLoading) {
        return (
            <>
                <Header />
                <main className="pt-24 min-h-screen bg-white flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-sono-primary border-t-transparent rounded-full"></div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !partner) {
        return (
            <>
                <Header />
                <main className="pt-24 min-h-screen bg-[#f2f4f6] flex items-center justify-center">
                    <div className="text-center p-12 card bg-white">
                        <div className="w-20 h-20 rounded-[28px] bg-gray-100 mx-auto mb-8 flex items-center justify-center text-gray-400">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-sono-dark mb-4">페이지를 찾을 수 없습니다</h1>
                        <p className="text-[#6b7684] mb-10 font-medium">유효하지 않은 파트너 페이지입니다.</p>
                        <Link href="/" className="btn-primary inline-block">홈으로 돌아가기</Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        if (numbers.length <= 11) return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData(prev => ({ ...prev, phone: formatted }));
    };

    const openAddressSearch = () => {
        if ((window as any).daum && (window as any).daum.Postcode) {
            new (window as any).daum.Postcode({
                oncomplete: (data: { zonecode: string; address: string }) => {
                    setFormData(prev => ({
                        ...prev,
                        zonecode: data.zonecode,
                        address: data.address,
                    }));
                },
            }).open();
        } else {
            alert("주소 검색 서비스를 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    customerName: formData.name,
                    customerPhone: formData.phone,
                    zipcode: formData.zonecode,
                    address: formData.address,
                    addressDetail: formData.addressDetail,
                    partnerId: partner.partnerId,
                    partnerName: partner.name,
                    productType: selectedProduct === "happy450" ? "더 해피 450 ONE" : "스마트케어",
                    planType: selectedProduct === "smartcare" ? `${smartCareUnit}구좌 / ${selectedAppliance}` : selectedPlan,
                }),
            });

            if (response.ok) {
                setIsSubmitted(true);
            } else {
                alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
            }
        } catch {
            alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <>
                <Header partnerMode={true} partnerUrl={partner.customUrl} partnerName={partner.name} partnerId={partner.partnerId} />
                <main className="pt-24 min-h-screen bg-[#f2f4f6]">
                    <div className="max-w-2xl mx-auto px-6 py-20">
                        <div className="card bg-white !p-12 text-center animate-fade-in shadow-xl shadow-sono-primary/5">
                            <div className="w-24 h-24 rounded-[30px] bg-[#00d084]/10 mx-auto mb-8 flex items-center justify-center">
                                <svg className="w-12 h-12 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-sono-dark mb-6 tracking-tight">
                                상담 신청이 완료되었습니다!
                            </h1>
                            <p className="text-lg text-[#6b7684] font-medium mb-10 leading-relaxed">
                                전문 플래너가 곧 연락드릴 예정입니다.
                            </p>
                            <div className="bg-[#f9fafb] rounded-[24px] p-8 inline-block w-full">
                                <p className="text-sm font-bold text-[#8b95a1] mb-2">선택 상품</p>
                                <p className="text-2xl font-bold text-sono-primary tracking-tight">
                                    {selectedProduct === "happy450" ? "더 해피 450 ONE" : "스마트케어"}
                                    {selectedPlan && <span className="ml-2 text-xl text-[#4e5968]">({selectedPlan})</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            {!isInquiryModalOpen && <Header partnerMode={true} partnerUrl={partner?.customUrl} partnerName={partner?.name} partnerId={partner?.partnerId} />}
            <main className="min-h-screen bg-[#f2f4f6]">
                {/* 히어로 */}
                <section
                    className="relative py-20 md:py-40 overflow-hidden pt-12 bg-sono-dark flex items-center min-h-[60vh]"
                    style={{
                        backgroundImage: 'url("https://github.com/jihoon3813-commits/img_sono/blob/main/Generated%20Image%20January%2024,%202026%20-%2010_30AM.jpeg?raw=true")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* 오버레이: 텍스트 가독성을 위한 레이어 */}
                    <div className="absolute inset-0 bg-sono-dark/70 z-0"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 z-0"></div>

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="flex flex-col items-center justify-center mb-12 animate-fade-in">
                            {/* Logo Container: Horizontal Glass Container - Reduced size (70%) */}
                            <div className="bg-white/95 backdrop-blur-md rounded-[32px] px-6 py-3 sm:px-9 sm:py-4.5 flex items-center justify-center gap-3 sm:gap-7 shadow-2xl shadow-black/30 border border-white/20">
                                {/* Partner Logo/Text */}
                                <div className="flex items-center justify-center">
                                    {partner.logoUrl ? (
                                        <img src={partner.logoUrl} alt={partner.name} className="h-9 sm:h-12 w-auto object-contain max-w-[200px]" />
                                    ) : (
                                        <span className="text-sono-primary font-bold text-2xl sm:text-3xl tracking-tighter">{partner.logoText || partner.name}</span>
                                    )}
                                </div>
                                <span className="text-2xl sm:text-4xl text-[#adb5bd] font-light">×</span>
                                {/* Sono Logo */}
                                <div className="flex items-center justify-center">
                                    <img
                                        src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EA%B3%B5%EC%8B%9D%EC%B4%9D%ED%8C%90%20BI_%EA%B0%80%EB%A1%9CA.png?raw=true"
                                        alt="Sono I'M READY"
                                        className="h-9 sm:h-12 w-auto object-contain max-w-[200px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter leading-[1.1] filter drop-shadow-2xl animate-fade-in">
                            {partner.landingTitle || `${partner.name} 회원`}님을 위한<br />특별한 라이프 케어 솔루션
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-bold mb-12 leading-relaxed break-keep max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            소노아임레디 공식총판과 함께하는 프리미엄 혜택<br />
                            <span className="text-sono-gold underline underline-offset-8 decoration-sono-gold/40">{partner.pointInfo}</span>
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                            <a href="#product-selection" className="bg-white text-sono-primary hover:bg-sono-gold hover:text-white px-12 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/20">
                                혜택 자세히 보기
                            </a>
                            <button
                                onClick={() => {
                                    setModalProduct("");
                                    setIsInquiryModalOpen(true);
                                }}
                                className="border-2 border-white/60 bg-white/10 text-white hover:bg-white/20 px-12 py-5 rounded-2xl font-bold text-xl active:scale-[0.98] transition-all duration-300 backdrop-blur-md"
                            >
                                간편 상담문의
                            </button>
                        </div>
                    </div>
                </section>

                {/* 회사소개 섹션 */}
                <section className="py-16 md:py-32 bg-[#f2f4f6] relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                        <div className="text-center mb-24">
                            <span className="badge-primary mb-6 px-4 py-2">ABOUT US</span>
                            <h2 className="section-title">대명소노그룹의<br className="md:hidden" /> 라이프케어 브랜드</h2>
                            <p className="section-subtitle max-w-3xl md:max-w-5xl mx-auto">
                                &quot;인생의 모든 순간이 준비될 때까지&quot;<br />
                                40년 이상의 레저 사업 노하우를 바탕으로 고객의 삶을 더욱 풍요롭게 만드는 토탈 라이프케어 서비스를 제공합니다.
                            </p>
                        </div>



                        {/* 주요 성과 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-24 max-w-6xl mx-auto">
                            {[
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list01.jpg?raw=true",
                                    title: "고객 선수금 1조 돌파",
                                    subtitle: "2024 06월 기준"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list03.jpg?raw=true",
                                    title: "자본금 100억원",
                                    subtitle: "법정 자본금(15억원)요건 6배"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list04.jpg?raw=true",
                                    title: "대명소노그룹사",
                                    subtitle: "2024년 기준 대규모기업"
                                },
                                {
                                    image: "https://github.com/jihoon3813-commits/img_sono/blob/main/credibility_list02.jpg?raw=true",
                                    title: "신용평가 1등급",
                                    subtitle: "기준: 2025.8.1~2025.7.31 / 상조보증공제조합"
                                }
                            ].map((item, i) => (
                                <div key={i} className="card !p-0 overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md group flex flex-col">
                                    <div className="aspect-[4/3] relative overflow-hidden">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="p-6 bg-white flex-1 flex flex-col">
                                        <p className="font-bold text-sono-dark text-lg mb-1 leading-tight">{item.title}</p>
                                        <p className="text-xs text-[#8b95a1] font-medium leading-relaxed mt-auto">{item.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 브랜드 소개 텍스트 */}
                        <div className="max-w-4xl mx-auto mb-24 text-center">
                            <p className="text-[#4e5968] text-lg md:text-xl leading-relaxed font-medium break-keep">
                                지난 40년 이상 국내 레저사업을 이끌어온 대명소노그룹의 서비스 노하우를 바탕으로 설립된 (주)소노스테이션의 대표 브랜드 소노아임레디.
                                소노아임레디는 상조 서비스를 중심으로 여행, 교육, 웨딩 등 삶에 필요한 서비스를 제공하고 있습니다.
                                다양한 라이프케어 서비스를 소비자가 원하는 시점에 선택하여 이용할 수 있도록 항상 준비되어 있습니다.
                                소노아임레디를 통해 고객의 삶을 더욱 풍요롭게 하는 것이 우리 브랜드의 목표입니다.
                            </p>
                        </div>


                        {/* 주요 사업 영역 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-6xl mx-auto">
                            {[
                                {
                                    category: "LIFE STYLE",
                                    title: "소노아임레디",
                                    desc: "상조 · 웨딩 · 여행 토탈라이프케어 서비스",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_dm_h_dark.png"
                                },
                                {
                                    category: "HOTEL & RESORT",
                                    title: "소노호텔앤리조트",
                                    desc: "세계로 향하는 대한민국 대표 호스피탈리티 기업",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_sono.png"
                                },
                                {
                                    category: "ENTERTAINMENTS",
                                    title: "비발디파크 오션월드/스키월드",
                                    desc: "대명소노그룹의 흥미로운 여행 액티비티\n대명소노그룹 골프, 승마, 요트, Pet, 소노 스카이거너스 프로농구단",
                                    logo: "https://www.sonoimready.com/assets/images/cs/logo_vivaldi_park.png"
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-[24px] md:rounded-[32px] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col min-h-[280px] text-left relative group hover:shadow-md transition-all">
                                    <div className="flex-1">
                                        <p className="text-sono-primary font-bold text-xs md:text-sm tracking-wider mb-3 leading-none">{item.category}</p>
                                        <h4 className="text-xl md:text-2xl font-black text-sono-dark mb-4 break-keep leading-tight">{item.title}</h4>
                                        <p className="text-[#8b95a1] text-xs md:text-sm font-medium leading-relaxed whitespace-pre-line break-keep">{item.desc}</p>
                                    </div>
                                    <div className="mt-8 flex justify-end">
                                        <img src={item.logo} alt={item.title} className="h-6 md:h-8 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 상품 선택 */}
                <section id="product-selection" className="py-12 md:py-24 scroll-mt-24 bg-gradient-to-b from-[#f2f4f6] to-white relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20 md:mb-28">
                            <span className="badge-primary mb-6 px-5 py-2 text-base">CHOOSE YOUR VALUE</span>
                            <h2 className="section-title text-5xl md:text-6xl mb-8">나에게 꼭 맞는<br />라이프 솔루션 선택</h2>
                            <p className="section-subtitle text-xl max-w-2xl mx-auto">
                                파트너사 회원님만을 위한 특별한 구성과 혜택을 확인하시고<br className="hidden md:block" />
                                원하시는 미래의 가치를 선택해주세요.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10 md:gap-16 max-w-6xl mx-auto">
                            {/* 더 해피 450 ONE */}
                            <div className="group relative card !p-0 transition-all duration-500 overflow-hidden border-2 border-transparent bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.01] hover:border-gray-200">
                                <div className="p-6 md:p-14">
                                    <div className="flex items-start justify-between mb-10">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-[#8b95a1] text-xs font-bold mb-4">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                SINGLE SOLUTION
                                            </div>
                                            <h3 className="text-4xl font-black text-sono-dark tracking-tighter leading-tight mb-2">더 해피 450 ONE</h3>
                                            <p className="text-sono-primary font-bold">실속과 가성비를 모두 잡은 베이직 모델</p>
                                        </div>
                                    </div>
                                    {[
                                        { text: partner.pointInfo, sub: "가입 즉시 제휴몰 포인트 적립" },
                                        { text: "납입금 100% 전액 환급", sub: "미이용 시 만기에 전액 돌려받는 안심 환급" },
                                        { text: "소노그룹 멤버십 무상 제공", sub: "전국 리조트 및 레저 시설 할인 혜택" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-sono-success/10 text-sono-success flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sono-dark text-lg leading-tight">{item.text}</p>
                                                <p className="text-sm text-[#8b95a1] mt-1">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 md:pt-10 border-t border-gray-100 mb-8 md:mb-10">
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                        <div className="text-[#8b95a1] font-bold text-lg mb-1">매월 납입금</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-sono-primary tracking-tighter">18,000</span>
                                            <span className="text-2xl font-bold text-[#8b95a1]">원</span>
                                            <span className="text-sm font-bold text-[#8b95a1] ml-1">부터~</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        href={`/p/${resolvedParams.partnerId}/products/happy450`}
                                        className="flex items-center justify-center py-4 rounded-xl border-2 border-gray-100 text-sono-dark font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        상품 자세히 보기
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setModalProduct("happy450");
                                            setIsInquiryModalOpen(true);
                                        }}
                                        className="flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-sono-dark text-white hover:bg-black"
                                    >
                                        가입 신청하기
                                    </button>
                                </div>
                            </div>

                            {/* 스마트케어 */}
                            <div className="group relative card !p-0 transition-all duration-500 overflow-hidden border-2 border-transparent bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.01] hover:border-gray-200">
                                <div className="absolute top-8 -right-12 bg-sono-gold text-white font-black text-xs py-2 w-48 text-center rotate-45 shadow-lg z-20">
                                    RECOMMENDED
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sono-primary/5 to-transparent"></div>

                                <div className="p-6 md:p-14 relative z-10">
                                    <div className="flex items-start justify-between mb-10">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sono-primary/10 text-sono-primary text-xs font-bold mb-4">
                                                <span className="w-1.5 h-1.5 rounded-full bg-sono-primary animate-pulse"></span>
                                                BEST CHOICE
                                            </div>
                                            <h3 className="text-4xl font-black text-sono-dark tracking-tighter leading-tight mb-2">스마트케어</h3>
                                            <p className="text-sono-gold font-bold">삼성/LG 최신 가전 지원 프리미엄 모델</p>
                                        </div>
                                    </div>
                                    {[
                                        { text: "삼성/LG 최신 가전 지원", sub: "내가 원하는 가전을 가입 즉시 배송/설치" },
                                        { text: partner.pointInfo, sub: "가입 즉시 제휴몰 포인트 추가 적립" },
                                        { text: "납입금 100% 전액 환급", sub: "만기 시 가전 가격 포함 납입금 100% 환급" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-full bg-sono-primary/10 text-sono-primary flex items-center justify-center flex-shrink-0 mt-1">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sono-dark text-lg leading-tight">{item.text}</p>
                                                <p className="text-sm text-[#8b95a1] mt-1">{item.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10 border-t border-gray-100 mb-10">
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                        <div className="text-[#8b95a1] font-bold text-lg mb-1">매월 납입금</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-sono-primary tracking-tighter">33,000</span>
                                            <span className="text-2xl font-bold text-[#8b95a1]">원</span>
                                            <span className="text-sm font-bold text-[#8b95a1] ml-1">부터~</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Link
                                        href={`/p/${resolvedParams.partnerId}/products/smartcare`}
                                        className="flex items-center justify-center py-4 rounded-xl border-2 border-gray-100 text-sono-dark font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        상품 자세히 보기
                                    </Link>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setModalProduct("smartcare");
                                            setIsInquiryModalOpen(true);
                                        }}
                                        className="flex items-center justify-center py-4 rounded-xl font-bold transition-all bg-sono-dark text-white hover:bg-black"
                                    >
                                        가입 신청하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>



                {/* 중요정보 고지사항 */}
                <section className="py-20 bg-[#f9fafb]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111] text-center mb-12">중요정보 고지사항</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* 환급기준 및 환급시기 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    환급기준 및 환급시기
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">중도해약에 대한 환급 기준은 상조서비스 약관 규정에 의해 환급됩니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">환급금은 신청완료일로부터 3영업일 이내에 수령하실 수 있습니다.</p>
                                    </li>
                                </ul>
                            </div>

                            {/* 총 고객환급의무액 및 자산 현황 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    총 고객환급의무액 및 자산 현황
                                </h3>
                                <div className="bg-blue-50/50 rounded-xl p-5 mb-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:border-r sm:border-blue-100 sm:pr-6">
                                        <p className="text-xs font-bold text-gray-500 mb-1">총 고객환급의무액</p>
                                        <p className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">1,068,990,831천원</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 mb-1">상조 관련 자산</p>
                                        <p className="text-xl md:text-2xl font-black text-blue-600 tracking-tight">1,221,786,713천원</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 font-medium">* 2024년 12월말 기준, 공인회계사 회계감사를 완료하였습니다.</p>
                            </div>

                            {/* 고객 불입금 관리방법 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    고객 불입금 관리방법
                                </h3>
                                <div className="flex items-start gap-3">
                                    <span className="w-1.5 h-14 bg-blue-100 rounded-full shrink-0 hidden sm:block"></span>
                                    <p className="text-gray-600 font-medium leading-relaxed break-keep">
                                        [할부거래에 관한 법률] 제18조에 의거 선불식 할부거래업 등록하였으며, 동법 제27조에 따라 고객 불입금의 50%는 상조보증공제조합에 소비자피해보상을 위한 공제계약을 체결하고 있습니다.
                                    </p>
                                </div>
                            </div>

                            {/* 소비자 유의사항 */}
                            <div className="bg-white p-8 rounded-[20px] shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2.5">
                                    <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block"></span>
                                    소비자 유의사항
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">장의차량 운행 시 발생되는 도로공사 비용(통행료) 및 주차비 등은 고객 부담입니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">장례식장 임대료 및 접객용 음식료 등은 상품 구성에서 제외되어 있습니다.</p>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 shrink-0"></span>
                                        <p className="text-gray-600 font-medium leading-relaxed">회비 납입 도중 행사 발생 시, 발인 전까지 잔여 회비를 일시납 하셔야 합니다.</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>
            </main >
            {!isInquiryModalOpen && <Footer />
            }

            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                partnerName={partner?.name}
                partnerId={partner?.partnerId}
                productType={modalProduct}
                showProductSelect={!modalProduct}
            />
        </>
    );
}
