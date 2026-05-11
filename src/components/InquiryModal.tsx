"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface DaumPostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
    zonecode: string;
}

interface InquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnerName?: string;
    partnerId?: string;
    productType?: string;
    planType?: string;
    showProductSelect?: boolean;
    initialAppliance?: string;
    initialUnit?: string;
}

export default function InquiryModal({
    isOpen,
    onClose,
    partnerName = "",
    partnerId = "",
    productType = "",
    planType = "",
    showProductSelect = false,
    initialAppliance = "",
    initialUnit = "4"
}: InquiryModalProps) {
    // Convex 실시간 제품 정보 쿼리
    const rawProductsData = useQuery(api.products.get);
    const productsData = (rawProductsData || []).filter((p: any) => p.isVisible !== false);

    const [selectedUnit, setSelectedUnit] = useState<string>(initialUnit);
    const [selectedAppliance, setSelectedAppliance] = useState<string>(initialAppliance || "상담 시 결정");

    const productListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialUnit) setSelectedUnit(initialUnit);
            if (initialAppliance) setSelectedAppliance(initialAppliance);
        }
    }, [isOpen, initialUnit, initialAppliance]);

    const allAppliances = productsData || [];
    const isLoadingAppliances = productsData === undefined;

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        birthdate: "",
        gender: "-",
        zonecode: "",
        address: "",
        addressDetail: "",
        selectedProduct: productType || "",
        preferredTime: "",
        inquiry: "",
        privacyAgreed: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (productType) {
            setFormData(prev => ({ ...prev, selectedProduct: productType }));
        }
    }, [productType]);

    useEffect(() => {
        if (isOpen && !document.getElementById("daum-postcode-script")) {
            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isOpen]);

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
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
        setFormData(prev => ({ ...prev, birthdate: value }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const openAddressSearch = () => {
        const daum = (window as any).daum;
        if (daum && daum.Postcode) {
            new daum.Postcode({
                oncomplete: (data: any) => {
                    let addr = data.roadAddress || data.address;
                    let extraAddr = '';

                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }

                    setFormData(prev => ({
                        ...prev,
                        zonecode: data.zonecode,
                        address: addr + extraAddr,
                    }));
                },
            }).open();
        } else {
            alert("주소 검색 서비스를 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Determine product type
        const currentProduct = formData.selectedProduct || productType;
        const isSmartCareProduct = ["smartcare", "스마트케어", "스마트 케어"].includes(currentProduct);

        // Validation for Birthdate (only for 스마트케어)
        if (isSmartCareProduct && formData.birthdate.length !== 8) {
            alert("생년월일은 8자리 숫자로 입력해주세요 (예: 19800101)");
            return;
        }

        setIsSubmitting(true);

        try {
            const selectedProd = formData.selectedProduct || productType;
            let productName = selectedProd;
            if (selectedProd === "happy450") productName = "더 해피 450 ONE";
            if (selectedProd === "smartcare") productName = "스마트케어";

            let calculatedPlanType = planType || "-";
            let productsInfo = "";
            const isSmartCare = ["smartcare", "스마트케어", "스마트 케어"].includes(selectedProd);
            const isHappy450 = ["happy450", "더 해피 450", "더 해피 450 ONE"].includes(selectedProd);

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
                    partnerId,
                    partnerName,
                    productType: productName,
                    planType: calculatedPlanType,
                    products: productsInfo,
                    name: formData.name,
                    phone: formData.phone,
                    birthdate: formData.birthdate,
                    gender: formData.gender || "-",
                    email: "",
                    zipcode: formData.zonecode,
                    address: formData.address,
                    addressDetail: formData.addressDetail,
                    preferredTime: formData.preferredTime,
                    inquiry: formData.inquiry,
                    accessPath: "H",
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsSubmitted(true);
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

    const handleClose = () => {
        setFormData({
            name: "",
            phone: "",
            birthdate: "",
            gender: "-",
            zonecode: "",
            address: "",
            addressDetail: "",
            selectedProduct: productType || "",
            preferredTime: "",
            inquiry: "",
            privacyAgreed: false,
        });
        setIsSubmitted(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-sono-dark/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up no-scrollbar">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 md:px-8 py-5 md:py-6 flex items-center justify-between border-b border-gray-50 z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-sono-dark tracking-tight">상담 신청</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-[#f2f4f6] rounded-full transition-colors">
                        <svg className="w-6 h-6 text-[#adb5bd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-10 md:p-12 text-center">
                        <div className="w-16 md:w-20 h-16 md:h-20 rounded-[24px] md:rounded-[28px] bg-[#00d084]/10 mx-auto mb-8 flex items-center justify-center text-[#00d084]">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-sono-dark mb-4">신청이 완료되었습니다!</h3>
                        <p className="text-[#6b7684] font-medium mb-10 leading-relaxed text-sm md:text-base">곧 담당 플래너가 연락드리겠습니다.</p>
                        <button onClick={handleClose} className="btn-primary w-full py-4 !rounded-2xl">확인</button>
                    </div>
                ) : (showProductSelect && !formData.selectedProduct) ? (
                    <div className="p-6 md:p-8 min-h-[400px] flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-center mb-8 text-sono-dark">
                            상담받으실 상품을<br />선택해주세요
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, selectedProduct: "happy450" }));
                                    setSelectedUnit("1");
                                }}
                                className="group p-8 rounded-[24px] bg-[#f2f4f6] hover:bg-sono-primary hover:text-white transition-all text-left relative overflow-hidden border-2 border-transparent hover:border-sono-primary/10 hover:shadow-xl hover:shadow-sono-primary/20"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <span className="block text-sm font-bold text-[#8b95a1] mb-2 group-hover:text-white/80">여행, 웨딩, 칠순 등 라이프 서비스</span>
                                        <span className="block text-2xl font-bold text-sono-dark group-hover:text-white">더 해피 450 ONE</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, selectedProduct: "smartcare" }));
                                    setSelectedUnit("4");
                                }}
                                className="group p-8 rounded-[24px] bg-[#f2f4f6] hover:bg-sono-primary hover:text-white transition-all text-left relative overflow-hidden border-2 border-transparent hover:border-sono-primary/10 hover:shadow-xl hover:shadow-sono-primary/20"
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <span className="block text-sm font-bold text-[#8b95a1] mb-2 group-hover:text-white/80">최신 가전제품 100% 지원 혜택</span>
                                        <span className="block text-2xl font-bold text-sono-dark group-hover:text-white">스마트케어</span>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8">
                        {showProductSelect && (
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-3 block">상품 선택</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: "happy450", label: "더 해피 450 ONE" },
                                        { value: "smartcare", label: "스마트케어" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, selectedProduct: opt.value }));
                                                if (opt.value === "happy450") setSelectedUnit("1");
                                                else if (opt.value === "smartcare") setSelectedUnit("4");
                                            }}
                                            className={`py-3 rounded-[14px] font-bold text-sm transition-all border-none ${formData.selectedProduct === opt.value ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20" : "bg-[#f2f4f6] text-[#6b7684] hover:bg-gray-200"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block">성함 <span className="text-sono-primary">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="홍길동" required />
                            </div>
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block">연락처 <span className="text-sono-primary">*</span></label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} inputMode="numeric" className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="010-1234-5678" required />
                            </div>
                            {["smartcare", "스마트케어", "스마트 케어"].includes(formData.selectedProduct || productType) && (
                                <>
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">생년월일 (8자리) <span className="text-sono-primary">*</span></label>
                                        <input type="tel" name="birthdate" value={formData.birthdate} onChange={handleBirthdateChange} inputMode="numeric" maxLength={8} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="19800101" required />
                                    </div>
                                    <div>
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">성별 <span className="text-sono-primary">*</span></label>
                                        <div className="flex bg-[#f9fafb] p-1 rounded-2xl h-[56px]">
                                            {["남", "여"].map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, gender: g === "남" ? "남성" : "여성" }))}
                                                    className={`flex-1 rounded-xl text-sm font-bold transition-all ${formData.gender === (g === "남" ? "남성" : "여성") ? "bg-white text-sono-primary shadow-sm" : "text-gray-400"}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {["smartcare", "스마트케어"].includes(formData.selectedProduct || productType) && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 구좌 선택</label>
                                    <div className="flex bg-[#f2f4f6] p-1 rounded-xl">
                                        {["2", "3", "4", "6"].map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedUnit(u);
                                                    setSelectedAppliance("상담 시 결정");
                                                    if (productListRef.current) {
                                                        productListRef.current.scrollTop = 0;
                                                    }
                                                }}
                                                className={`flex-1 py-2 md:py-3 rounded-xl transition-all flex flex-col items-center justify-center ${selectedUnit === u ? "bg-white text-sono-primary shadow-sm" : "text-[#8b95a1]"}`}
                                            >
                                                <span className={`text-[9px] font-bold mb-0.5 ${selectedUnit === u ? "text-sono-primary/60" : "text-[#8b95a1]/60"}`}>스마트케어330</span>
                                                <span className="text-sm md:text-base font-black">{u}구좌</span>
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
                                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${selectedAppliance === "상담 시 결정" ? "border-sono-primary bg-sono-primary/5" : "border-gray-100 hover:border-gray-200"}`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold leading-tight text-center">상담 시<br />결정</div>
                                            <span className="font-bold text-sono-dark">상담 시 결정</span>
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
                                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all text-left w-full ${selectedAppliance === applianceValue ? "border-sono-primary bg-sono-primary/5 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}
                                                    >
                                                        <div className="flex-shrink-0 bg-white rounded-xl p-1 border border-gray-100">
                                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[10px] text-[#8b95a1] font-bold uppercase">{item.brand}</span>
                                                            <span className="font-bold text-sono-dark text-sm leading-tight break-keep">{item.name}</span>
                                                            {item.model && (
                                                                <span className="text-[11px] text-sono-primary font-bold uppercase mt-1 bg-white px-1.5 py-0.5 rounded border border-sono-primary/20 self-start break-all text-left">
                                                                    {item.model}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                    {selectedAppliance && selectedAppliance !== "상담 시 결정" && (
                                        <div className="mt-3 p-4 bg-sono-primary/5 border border-sono-primary/20 rounded-2xl">
                                            <span className="text-xs font-bold text-sono-primary block mb-1">선택하신 제품</span>
                                            <div className="font-bold text-sono-dark text-lg break-keep leading-snug">{selectedAppliance}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {["happy450", "더 해피 450", "더 해피 450 ONE"].includes(formData.selectedProduct || productType) && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 구좌 선택</label>
                                    <div className="flex bg-[#f2f4f6] p-1 rounded-xl">
                                        {["1", "2", "3"].map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setSelectedUnit(u)}
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${selectedUnit === u ? "bg-white text-sono-primary shadow-sm" : "text-[#8b95a1]"}`}
                                            >
                                                {u}구좌
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {["smartcare", "스마트케어", "스마트 케어"].includes(formData.selectedProduct || productType) && (
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block">주소</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={formData.zonecode} readOnly inputMode="numeric" className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 flex-1" placeholder="우편번호" />
                                    <button type="button" onClick={openAddressSearch} className="bg-sono-primary text-white font-bold px-6 rounded-2xl">검색</button>
                                </div>
                                <input type="text" value={formData.address} readOnly className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 mb-2" placeholder="기본 주소" />
                                <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4" placeholder="상세 주소" />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="bg-[#f9fafb] border border-gray-100 rounded-2xl p-4 text-[11px] text-[#8b95a1] leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
                                <p className="font-bold text-[#4e5968] mb-2">[더해피450 one 상품 가입을 위한 개인정보 수집, 이용 및 위탁 안내]</p>
                                <p className="mb-4">㈜소노스테이션은 더해피450 one 상품 가입을 위하여 회원님의 개인정보를 아래와 같이 수집, 이용 및 위탁하고자 합니다.</p>
                                
                                <p className="font-bold text-[#6b7684] mb-1">1. 개인정보 수집 및 이용 동의 (필수사항)</p>
                                <ul className="space-y-0.5 mb-4 list-none pl-0">
                                    <li>▷ 수집, 이용하는 자 : ㈜소노스테이션</li>
                                    <li>▷ 수집, 이용하려는 개인정보 항목: 성명, 연락처(이동전화 | 유선전화)</li>
                                    <li>▷ 개인정보 수집, 이용 및 위탁 목적 : 더해피450 one 상품 소개, 계약상담, 계약체결</li>
                                    <li>▷ 개인정보 보유 기간 : 개인정보 수집 및 이용 동의일로부터 30일 또는 수집/이용 목적 달성 시까지</li>
                                </ul>
                                
                                <p className="mb-4">* 고객님은 위의 개인정보 수집, 이용 및 위탁 대한 동의를 거부하실 수 있습니다. 그러나 동의를 거부할 경우 상품 가입 등 서비스 제공에 제한을 받을 수 있습니다.</p>
                                
                                <p className="font-bold text-[#6b7684] mb-1">2. 개인정보 취급업무 위탁 안내</p>
                                <ul className="space-y-0.5 list-none pl-0">
                                    <li>▷ 취급을 위탁받는 자(수탁업체) : {partnerName || "파트너사"}</li>
                                    <li>▷ 업무내용 : 더해피450 one 상품 소개, 상담접수</li>
                                </ul>
                            </div>

                            <div className="bg-[#f2f4f6] rounded-[22px] p-6">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formData.privacyAgreed} onChange={handleChange} name="privacyAgreed" className="w-5 h-5 rounded-lg border-gray-300 text-sono-primary focus:ring-sono-primary" required />
                                    <span className="text-sm font-bold text-[#4e5968]">개인정보 활용 동의 <span className="text-sono-primary">(필수)</span></span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-5 text-xl shadow-xl shadow-sono-primary/20 disabled:opacity-50">
                            {isSubmitting ? "데이터 저장 중..." : "상담 신청하기"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
