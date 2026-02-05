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
                        throw new Error("Partner not found in API");
                    }
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            } catch (err) {
                console.error("Partner fetch failed or timed out:", err);
                // Last resort fallback
                setPartner({
                    partnerId: resolvedParams.partnerId || "unknown",
                    name: "파트너 쇼핑몰",
                    pointInfo: "혜택 정보 준비 중",
                    brandColor: "#1e3a5f",
                    customUrl: resolvedParams.partnerId || "home",
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
            <Header partnerMode={true} partnerUrl={partner.customUrl} partnerName={partner.name} partnerId={partner.partnerId} />
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
                                        <img src={partner.logoUrl} alt={partner.name} className="h-6 sm:h-8 w-auto object-contain max-w-[120px]" />
                                    ) : (
                                        <span className="text-sono-primary font-bold text-lg sm:text-xl tracking-tighter">{partner.logoText || partner.name}</span>
                                    )}
                                </div>
                                <span className="text-xl sm:text-2xl text-[#adb5bd] font-light">×</span>
                                {/* Sono Logo */}
                                <div className="flex items-center justify-center">
                                    <img
                                        src="https://github.com/jihoon3813-commits/img_sono/blob/main/%EC%86%8C%EB%85%B8%EC%95%84%EC%9E%84%EB%A0%88%EB%94%94%20BI_3.png?raw=true"
                                        alt="Sono I'M READY"
                                        className="h-6 sm:h-8 w-auto object-contain max-w-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tighter leading-[1.1] filter drop-shadow-2xl animate-fade-in">
                            {partner.landingTitle || `${partner.name} 회원`}님을 위한<br />특별한 라이프 케어 솔루션
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-bold mb-12 leading-relaxed break-keep max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            소노아임레디와 함께하는 프리미엄 혜택<br />
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

                        {/* 브랜드 의미 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24 max-w-6xl mx-auto">
                            {[
                                { char: "S", label: "SONO", desc: "축적된 자산의 모든 서비스", color: "bg-sono-primary" },
                                { char: "I", label: "I'M", desc: "고객 맞춤형 서비스", color: "bg-sono-gold" },
                                { char: "R", label: "READY", desc: "항상 준비된 상태", color: "bg-sono-success" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 md:gap-5 px-5 py-5 md:px-8 md:py-7 bg-white rounded-[28px] md:rounded-[32px] shadow-sm border border-gray-50 text-left transition-all hover:shadow-md">
                                    <span className={`w-12 h-12 md:w-14 md:h-14 rounded-[16px] md:rounded-[18px] ${item.color} flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg flex-shrink-0`}>
                                        {item.char}
                                    </span>
                                    <div>
                                        <p className="text-[10px] md:text-xs font-bold text-[#8b95a1] mb-0.5 md:mb-1">{item.label}</p>
                                        <p className="font-bold text-sono-dark text-base md:text-xl leading-tight">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 주요 성과 카드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-24 max-w-6xl mx-auto">
                            {[
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                    value: "1조원+",
                                    label: "고객 선수금 돌파",
                                    info: "(2024년 6월 기준)",
                                    color: "text-sono-primary",
                                    bgColor: "bg-sono-primary/10"
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />,
                                    value: "100억원",
                                    label: "자본금 보유",
                                    info: "(법정 기준의 6배)",
                                    color: "text-sono-gold",
                                    bgColor: "bg-sono-gold/10"
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                                    value: "1등급",
                                    label: "신용평가 획득",
                                    info: "(재무 안정성 최상위)",
                                    color: "text-sono-success",
                                    bgColor: "bg-sono-success/10"
                                },
                                {
                                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
                                    value: "150만+",
                                    label: "누적 고객 수",
                                    info: "(신뢰의 기반)",
                                    color: "text-sono-primary",
                                    bgColor: "bg-sono-primary/10"
                                }
                            ].map((item, i) => (
                                <div key={i} className="card !p-5 md:!p-8 group hover:bg-[#f9fafb] border border-gray-50 hover:border-gray-100 flex items-center md:block gap-5 md:gap-0">
                                    <div className={`w-14 h-14 md:mb-8 rounded-2xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                                        <svg className={`w-7 h-7 ${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {item.icon}
                                        </svg>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <p className={`text-2xl md:text-4xl font-bold ${item.color} mb-0.5 md:mb-2 tracking-tight leading-tight`}>{item.value}</p>
                                        <p className="text-sm md:text-lg font-bold text-sono-dark leading-tight">{item.label}</p>
                                        <p className="text-xs md:text-sm font-medium text-[#8b95a1] mt-0.5 md:mt-1 leading-tight">{item.info}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 인증 배지 */}
                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-12 text-center border border-gray-100 shadow-sm max-w-6xl mx-auto">
                            <h3 className="font-bold text-[#4e5968] text-xl mb-10 tracking-tight">대내외적으로 공인된 신뢰성</h3>
                            <div className="grid grid-cols-1 md:flex md:flex-wrap justify-center gap-4 md:gap-20">
                                {[
                                    { label: "CCM 인증", info: "소비자중심경영 인증", color: "from-blue-500 to-blue-600" },
                                    { label: "ISMS-P 인증", info: "정보보호 관리체계 인증", color: "from-green-500 to-green-600" },
                                    { label: "업계 2위", info: "대한민국 상조업계", color: "from-purple-500 to-purple-600" }
                                ].map((badge, i) => (
                                    <div key={i} className="flex flex-row md:flex-col items-center gap-4 p-4 md:p-0 bg-[#f9fafb] md:bg-transparent rounded-2xl md:rounded-none">
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="text-left md:text-center">
                                            <p className="font-bold text-sono-dark text-sm md:text-base">{badge.label}</p>
                                            <p className="text-xs md:text-sm font-medium text-[#8b95a1]">{badge.info}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 상품 선택 */}
                <section id="product-selection" className="py-24 md:py-40 scroll-mt-24 bg-gradient-to-b from-[#f2f4f6] to-white relative overflow-hidden">
                    {/* 데코레이션 배경 요소 */}
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
                            <div
                                className={`group relative card !p-0 cursor-pointer transition-all duration-500 overflow-hidden border-2 ${selectedProduct === "happy450"
                                    ? "ring-4 ring-sono-primary/20 border-sono-primary shadow-2xl scale-[1.03] bg-white"
                                    : "border-transparent bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.01] hover:border-gray-200"
                                    }`}
                                onClick={() => {
                                    setSelectedProduct("happy450");
                                    setSelectedPlan("");
                                    setSelectedPlan("");
                                    setShowForm(false);
                                }}
                            >
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
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${selectedProduct === "happy450" ? "bg-sono-primary text-white scale-110 shadow-lg shadow-sono-primary/30" : "bg-gray-100 text-gray-300"}`}>
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
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
                                            className={`flex items-center justify-center py-4 rounded-xl font-bold transition-all ${selectedProduct === "happy450" ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20" : "bg-sono-dark text-white hover:bg-black"}`}
                                        >
                                            가입 신청하기
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 스마트케어 */}
                            <div
                                className={`group relative card !p-0 cursor-default transition-all duration-500 overflow-hidden border-2 ${selectedProduct === "smartcare"
                                    ? "ring-4 ring-sono-primary/20 border-sono-primary shadow-2xl scale-[1.03] bg-white"
                                    : "border-transparent bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.01] hover:border-gray-200"
                                    }`}
                            >
                                {/* 추천 태그 */}
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
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${selectedProduct === "smartcare" ? "bg-sono-primary text-white scale-110 shadow-lg shadow-sono-primary/30" : "bg-gray-100 text-gray-300"}`}>
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-12">
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
                                            className={`flex items-center justify-center py-4 rounded-xl font-bold transition-all ${selectedProduct === "smartcare" ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20" : "bg-sono-dark text-white hover:bg-black"}`}
                                        >
                                            가입 신청하기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 하단 화살표 안내 */}
                        {showForm && (
                            <div className="mt-20 text-center animate-bounce">
                                <p className="text-sono-primary font-bold mb-4">아래 신청 양식으로 이동하세요</p>
                                <svg className="w-10 h-10 text-sono-primary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7-7-7m14-8l-7 7-7-7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </section>

                {/* 스마트케어 플랜 선택 */}
                {selectedProduct === "smartcare" && (
                    <section className="pb-24 md:pb-32 animate-fade-in">
                        <div className="max-w-6xl mx-auto px-6">
                            <h3 className="text-2xl font-bold text-sono-dark text-center mb-12 tracking-tight">상세 플랜을 선택해주세요</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { name: "실속형", units: "2구좌", price: "33,000" },
                                    { name: "인기형", units: "3구좌", price: "49,500", popular: true },
                                    { name: "베스트", units: "4구좌", price: "66,000" },
                                    { name: "프리미엄", units: "6구좌", price: "99,000" },
                                ].map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`card text-center cursor-pointer transition-all bg-white border-none !p-8 ${smartCareUnit === plan.units.replace('구좌', '')
                                            ? "ring-2 ring-sono-primary shadow-xl"
                                            : "hover:shadow-lg"
                                            }`}
                                        onClick={() => {
                                            setSmartCareUnit(plan.units.replace('구좌', ''));
                                            setSelectedAppliance("상담 시 결정");
                                            setSelectedPlan(plan.name);
                                        }}
                                    >
                                        {plan.popular && (
                                            <div className="mb-3">
                                                <span className="bg-sono-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                                            </div>
                                        )}
                                        <h4 className="text-xl font-bold text-sono-dark mb-1">{plan.name}</h4>
                                        <span className="text-sm font-bold text-[#8b95a1]">{plan.units}</span>
                                        <div className="mt-6 flex flex-col">
                                            <span className="text-2xl font-bold text-sono-primary tracking-tight">{plan.price}</span>
                                            <span className="text-sm font-bold text-[#8b95a1]">원 / 월</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 가전제품 선택 리스트 추가 */}
                            <div className="mt-16 bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-sono-dark tracking-tighter mb-1">가전제품 브랜드/모델 선택</h4>
                                        <p className="text-[#8b95a1] font-medium">원하시는 가전을 미리 찜해보세요. (상담 시 최종 변경 가능)</p>
                                    </div>
                                    <div className="inline-flex items-center gap-2 bg-sono-primary/5 text-sono-primary px-4 py-2 rounded-xl font-bold">
                                        <span className="w-2 h-2 rounded-full bg-sono-primary animate-pulse"></span>
                                        {smartCareUnit}구좌 전용 라인업
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAppliance("상담 시 결정")}
                                        className={`group relative flex flex-col items-center justify-center p-6 rounded-[28px] border-2 transition-all h-[240px] ${selectedAppliance === "상담 시 결정" ? "border-sono-primary bg-sono-primary/5 shadow-lg shadow-sono-primary/10" : "border-gray-50 bg-[#f9fafb] hover:border-gray-200"}`}
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-sono-primary text-3xl mb-4 shadow-sm group-hover:scale-110 transition-transform">?</div>
                                        <p className="font-black text-sono-dark text-lg mb-1 tracking-tighter">상담 시 결정</p>
                                        <p className="text-[#8b95a1] font-medium text-xs text-center break-keep">플래너와 상담 후 가장 적합한 모델을 골라드릴게요.</p>
                                    </button>

                                    {allAppliances
                                        .filter(item => item.tag && item.tag.includes(`${smartCareUnit}구좌`))
                                        .map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedAppliance(`${item.brand} ${item.name}`)}
                                                className={`group flex flex-col p-6 rounded-[28px] border-2 transition-all h-[240px] text-left relative overflow-hidden ${selectedAppliance === `${item.brand} ${item.name}` ? "border-sono-primary bg-white shadow-lg shadow-sono-primary/10" : "border-gray-50 bg-white hover:border-sono-primary/30"}`}
                                            >
                                                <div className="relative w-full h-[120px] mb-4 bg-[#f9fafb] rounded-2xl p-4 transition-transform group-hover:scale-105 duration-500">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <p className="text-[10px] font-bold text-[#8b95a1] mb-1 uppercase tracking-widest">{item.brand}</p>
                                                <h5 className="font-extrabold text-sono-dark text-sm leading-tight line-clamp-2">{item.name}</h5>
                                                {selectedAppliance === `${item.brand} ${item.name}` && (
                                                    <div className="absolute top-4 right-4 w-6 h-6 bg-sono-primary text-white rounded-full flex items-center justify-center animate-fade-in shadow-md">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </section>
                )}


                {/* 신청 폼 */}
                {showForm && (selectedProduct === "happy450" || (selectedProduct === "smartcare" && selectedPlan)) && (
                    <section id="application-form" className="pb-32 animate-fade-in scroll-mt-24">
                        <div className="max-w-4xl mx-auto px-6">
                            <div className="card bg-white !p-10 md:!p-16">
                                <div className="text-center mb-12">
                                    <h3 className="text-3xl font-bold text-sono-dark mb-4 tracking-tight">간편 상담 신청</h3>
                                    <p className="text-[#6b7684] font-medium leading-relaxed">
                                        신청을 완료하시면 대명소노 그룹의 전문 플래너가<br className="hidden md:block" />
                                        정확한 혜택 안내를 드릴 수 있도록 빠르게 연락드립니다.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                        <div>
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                                성함 <span className="text-sono-primary">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                                placeholder="홍길동"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                                연락처 <span className="text-sono-primary">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                                placeholder="010-1234-5678"
                                                inputMode="numeric"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                                주소 <span className="text-sono-primary">*</span>
                                            </label>
                                            <div className="flex gap-3 mb-3">
                                                <input
                                                    type="text"
                                                    name="zonecode"
                                                    value={formData.zonecode}
                                                    className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 flex-1"
                                                    placeholder="우편번호"
                                                    readOnly
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={openAddressSearch}
                                                    className="bg-sono-primary text-white font-bold px-8 py-3 rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-sono-primary/10"
                                                >
                                                    검색
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 mb-3"
                                                placeholder="기본 주소"
                                                readOnly
                                                required
                                            />
                                            <input
                                                type="text"
                                                name="addressDetail"
                                                value={formData.addressDetail}
                                                onChange={handleChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                                placeholder="상세 주소 (동/호수)"
                                            />
                                        </div>
                                        <div>
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">희망 상담 시간</label>
                                            <select
                                                name="preferredTime"
                                                value={formData.preferredTime}
                                                onChange={handleChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            >
                                                <option value="">선택 안 함 (상관없음)</option>
                                                <option value="오전 (09:00~12:00)">오전 (09:00~12:00)</option>
                                                <option value="오후 (12:00~18:00)">오후 (12:00~18:00)</option>
                                                <option value="저녁 (18:00~21:00)">저녁 (18:00~21:00)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">문의사항 (선택사항)</label>
                                            <textarea
                                                name="inquiry"
                                                value={formData.inquiry}
                                                onChange={handleChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 min-h-[120px] resize-none"
                                                placeholder="상담 시 궁금하신 점이나 추가 요청사항을 적어주세요."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-[#f2f4f6] rounded-2xl p-6">
                                            <label className="flex items-center gap-4 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="privacyAgreed"
                                                    id="formPrivacyAgreed"
                                                    checked={formData.privacyAgreed}
                                                    onChange={handleChange}
                                                    className="w-6 h-6 rounded-lg border-gray-300 text-sono-primary focus:ring-sono-primary"
                                                    required
                                                />
                                                <span className="text-[#4e5968] font-bold">
                                                    개인정보 수집 및 이용에 동의합니다 <span className="text-sono-primary">(필수)</span>
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full btn-primary py-5 text-xl shadow-xl shadow-sono-primary/20 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    상담 신청 데이터 저장 중...
                                                </span>
                                            ) : (
                                                "상담 신청 완료하기"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />

            <InquiryModal
                isOpen={isInquiryModalOpen}
                onClose={() => setIsInquiryModalOpen(false)}
                partnerName={partner.name}
                partnerId={partner.partnerId}
                productType={modalProduct}
                showProductSelect={!modalProduct}
            />
        </>
    );
}
