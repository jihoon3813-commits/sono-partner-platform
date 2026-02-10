"use client";

import { useState, useEffect, use, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

interface DaumPostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
}

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

export default function PartnerInquiryPage({ params }: { params: Promise<{ partnerId: string }> }) {
    const resolvedParams = use(params);
    const [partner, setPartner] = useState<PartnerData | null>(null);
    const [isLoadingPartner, setIsLoadingPartner] = useState(true);

    // Convex 실시간 제품 정보 쿼리
    const productsData = useQuery(api.products.get);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        birthdate: "",
        gender: "남",
        zonecode: "",
        address: "",
        addressDetail: "",
        selectedProduct: "",
        preferredTime: "",
        inquiry: "",
        privacyAgreed: false,
    });

    const [selectedUnit, setSelectedUnit] = useState<string>("4");
    const [selectedAppliance, setSelectedAppliance] = useState<string>("상담 시 결정");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const productListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchPartner() {
            try {
                const response = await fetch(`/api/partners/${resolvedParams.partnerId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data) {
                        setPartner(data.data);
                    }
                }
            } catch (err) {
                console.error("Partner fetch failed:", err);
            } finally {
                setIsLoadingPartner(false);
            }
        }
        fetchPartner();
    }, [resolvedParams.partnerId]);

    useEffect(() => {
        if (!document.getElementById("daum-postcode-script")) {
            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

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

    const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        let formatted = value;
        if (value.length > 4) {
            formatted = `${value.slice(0, 4)}-${value.slice(4)}`;
        }
        if (value.length > 6) {
            formatted = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
        }
        setFormData(prev => ({ ...prev, birthdate: formatted }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const openAddressSearch = () => {
        if (window.daum && window.daum.Postcode) {
            new window.daum.Postcode({
                oncomplete: (data: DaumPostcodeData) => {
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
        if (!formData.selectedProduct) {
            alert("상담받으실 상품을 선택해주세요.");
            return;
        }

        // Validation for Birthdate (only for 스마트케어)
        const isSmartCareSelected = ["smartcare", "스마트케어"].includes(formData.selectedProduct);
        if (isSmartCareSelected && formData.birthdate.length !== 10) {
            alert("생년월일은 YYYY-MM-DD 형식으로 입력해주세요 (예: 1980-01-01)");
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedProd = formData.selectedProduct;
            let productName = selectedProd;
            if (selectedProd === "happy450") productName = "더 해피 450 ONE";
            if (selectedProd === "smartcare") productName = "스마트케어";

            let calculatedPlanType = "-";
            let productsInfo = "";
            const isSmartCare = ["smartcare", "스마트케어"].includes(selectedProd);
            const isHappy450 = ["happy450", "더 해피 450"].includes(selectedProd);

            if (isSmartCare) {
                calculatedPlanType = `${selectedUnit}구좌`;
                productsInfo = selectedAppliance;
            } else if (isHappy450) {
                calculatedPlanType = `${selectedUnit}구좌`;
            }

            const response = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    partnerId: partner?.partnerId || resolvedParams.partnerId,
                    partnerName: partner?.name || "파트너",
                    productType: productName,
                    planType: calculatedPlanType,
                    products: productsInfo,
                    name: formData.name,
                    phone: formData.phone,
                    birthdate: formData.birthdate,
                    gender: formData.gender,
                    email: "",
                    zipcode: formData.zonecode,
                    address: formData.address,
                    addressDetail: formData.addressDetail,
                    preferredTime: formData.preferredTime,
                    inquiry: formData.inquiry,
                }),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setIsSubmitted(true);
                window.scrollTo(0, 0);
            } else {
                throw new Error(result.message || "신청 처리에 실패했습니다.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert(error instanceof Error ? error.message : "신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingPartner) {
        return <div className="min-h-screen flex items-center justify-center font-bold">로딩 중...</div>;
    }

    const allAppliances = productsData || [];

    return (
        <main className="min-h-screen bg-[#f2f4f6] flex items-center justify-center py-10 md:py-20">
            <div className="max-w-2xl w-full px-6">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-sono-dark px-8 py-10 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">상담 신청</h1>
                        <p className="text-gray-400 font-medium">
                            {partner?.name} 고객님을 위한 특별 혜택 상담
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-[28px] bg-[#00d084]/10 mx-auto mb-8 flex items-center justify-center text-[#00d084]">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-sono-dark mb-4">신청이 완료되었습니다!</h3>
                            <p className="text-[#6b7684] font-medium mb-10 leading-relaxed">
                                접수하신 정보를 확인하여<br />
                                최대한 빨리 담당 플래너가 연락드리겠습니다.
                            </p>
                            <button
                                onClick={() => window.location.href = `/p/${resolvedParams.partnerId}`}
                                className="btn-primary w-full py-4 !rounded-2xl"
                            >
                                확인
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* 상품 선택 */}
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-4 block">상담받으실 상품 <span className="text-sono-primary">*</span></label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { value: "happy450", label: "더 해피 450 ONE", desc: "라이프 서비스" },
                                        { value: "smartcare", label: "스마트케어", desc: "가전 지원 혜택" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, selectedProduct: opt.value }));
                                                if (opt.value === "happy450") setSelectedUnit("1");
                                                else if (opt.value === "smartcare") setSelectedUnit("4");
                                            }}
                                            className={`p-6 rounded-[24px] text-left transition-all border-2 ${formData.selectedProduct === opt.value
                                                ? "border-sono-primary bg-sono-primary/5 shadow-lg shadow-sono-primary/10"
                                                : "border-gray-50 bg-[#f9fafb] text-[#6b7684] hover:bg-gray-100"}`}
                                        >
                                            <span className={`block text-xs font-bold mb-1 ${formData.selectedProduct === opt.value ? "text-sono-primary" : "text-gray-400"}`}>{opt.desc}</span>
                                            <span className={`block text-lg font-bold ${formData.selectedProduct === opt.value ? "text-sono-dark" : "text-[#6b7684]"}`}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 스마트케어 상세 설정 */}
                            {formData.selectedProduct === "smartcare" && (
                                <div className="space-y-6 animate-fade-in bg-gray-50 p-6 rounded-[24px]">
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 구좌 선택</label>
                                        <div className="flex bg-white p-1 rounded-xl shadow-sm">
                                            {["2", "3", "4", "6"].map((u) => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUnit(u);
                                                        setSelectedAppliance("상담 시 결정");
                                                    }}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedUnit === u ? "bg-sono-primary text-white shadow-md" : "text-gray-400"}`}
                                                >
                                                    {u}구좌
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가전제품 선택</label>
                                        <div
                                            ref={productListRef}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAppliance("상담 시 결정")}
                                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all bg-white text-left ${selectedAppliance === "상담 시 결정" ? "border-sono-primary shadow-sm" : "border-transparent"}`}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold leading-tight text-center">상담 시<br />결정</div>
                                                <span className="font-bold text-sono-dark text-sm">상담 시 결정</span>
                                            </button>
                                            {allAppliances
                                                .filter(item => item.tag && item.tag.includes(`${selectedUnit}구좌`))
                                                .map((item, idx) => {
                                                    const applianceValue = item.model
                                                        ? `${item.brand} ${item.name} (${item.model})`
                                                        : `${item.brand} ${item.name}`;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setSelectedAppliance(applianceValue)}
                                                            className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all bg-white text-left w-full ${selectedAppliance === applianceValue ? "border-sono-primary shadow-sm" : "border-transparent"}`}
                                                        >
                                                            <div className="flex-shrink-0 bg-white rounded-xl p-1 border border-gray-100">
                                                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[10px] text-[#8b95a1] font-bold uppercase">{item.brand}</span>
                                                                <span className="font-bold text-sono-dark text-xs leading-tight break-keep">{item.name}</span>
                                                            </div>
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                        {selectedAppliance !== "상담 시 결정" && (
                                            <div className="mt-3 p-4 bg-white border border-sono-primary/20 rounded-2xl shadow-sm">
                                                <span className="text-[10px] font-bold text-sono-primary block mb-1">선택 제품</span>
                                                <div className="font-bold text-sono-dark text-sm break-keep">{selectedAppliance}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 더 해피 450 상세 설정 */}
                            {formData.selectedProduct === "happy450" && (
                                <div className="space-y-6 animate-fade-in bg-gray-50 p-6 rounded-[24px]">
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 구좌 선택</label>
                                        <div className="flex bg-white p-1 rounded-xl shadow-sm">
                                            {["1", "2", "3"].map((u) => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => setSelectedUnit(u)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${selectedUnit === u ? "bg-sono-primary text-white shadow-md" : "text-gray-400"}`}
                                                >
                                                    {u}구좌
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 고객 인적 사항 */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">성함 <span className="text-sono-primary">*</span></label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="홍길동" required />
                                    </div>
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">연락처 <span className="text-sono-primary">*</span></label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} inputMode="numeric" className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="010-1234-5678" required />
                                    </div>
                                    {["smartcare", "스마트케어"].includes(formData.selectedProduct) && (
                                        <>
                                            <div>
                                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">생년월일 <span className="text-sono-primary">*</span></label>
                                                <input type="tel" name="birthdate" value={formData.birthdate} onChange={handleBirthdateChange} inputMode="numeric" maxLength={10} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="1980-01-01" required />
                                            </div>
                                            <div>
                                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">성별 <span className="text-sono-primary">*</span></label>
                                                <div className="flex bg-[#f9fafb] p-1 rounded-2xl h-[56px]">
                                                    {["남", "여"].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, gender: g }))}
                                                            className={`flex-1 rounded-xl text-sm font-bold transition-all ${formData.gender === g ? "bg-white text-sono-primary shadow-sm" : "text-gray-400"}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {["smartcare", "스마트케어"].includes(formData.selectedProduct) && (
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">주소 <span className="text-sono-primary">*</span></label>
                                        <div className="flex gap-2 mb-2">
                                            <input type="text" value={formData.zonecode} readOnly className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 flex-1" placeholder="우편번호" required />
                                            <button type="button" onClick={openAddressSearch} className="bg-sono-dark text-white font-bold px-6 rounded-2xl text-sm">검색</button>
                                        </div>
                                        <input type="text" value={formData.address} readOnly className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 mb-2" placeholder="기본 주소" required />
                                        <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="상세 주소" required />
                                    </div>
                                )}

                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">희망 상담 시간 / 문의사항</label>
                                    <textarea
                                        name="inquiry"
                                        value={formData.inquiry}
                                        onChange={handleChange}
                                        className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 min-h-[120px]"
                                        placeholder="상담 받고 싶으신 시간대나 궁금하신 점을 남겨주세요."
                                    />
                                </div>
                            </div>

                            {/* 약관 동의 */}
                            <div className="bg-[#f9fafb] rounded-[24px] p-6 border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.privacyAgreed}
                                        onChange={handleChange}
                                        name="privacyAgreed"
                                        className="w-6 h-6 rounded-lg border-gray-300 text-sono-primary focus:ring-sono-primary"
                                        required
                                    />
                                    <span className="text-sm font-bold text-[#4e5968]">개인정보 수집 및 상담 활용 동의 <span className="text-sono-primary">(필수)</span></span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-5 text-xl shadow-xl shadow-sono-primary/20 disabled:opacity-50 !rounded-[24px]"
                            >
                                {isSubmitting ? "접수 중..." : "상담 신청 완료하기"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
