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
    initialPlanId?: string;
    isPremiumMallMode?: boolean;
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
    initialUnit = "4",
    initialPlanId = "",
    isPremiumMallMode = false
}: InquiryModalProps) {
    // Convex 실시간 제품 정보 쿼리
    const rawProductsData = useQuery(api.products.get);
    const productsData = (rawProductsData || []).filter((p: any) => p.isVisible !== false);
    const careProducts = useQuery(api.careProducts.get);

    const formatApplianceText = (brand?: string, name?: string, model?: string) => {
        const cleanBrand = (brand || "").trim();
        let cleanName = (name || "").trim();
        
        if (cleanBrand) {
            const bracketBrand = `[${cleanBrand}]`;
            if (cleanName.startsWith(bracketBrand)) {
                cleanName = cleanName.slice(bracketBrand.length).trim();
            } else if (cleanName.startsWith(cleanBrand)) {
                cleanName = cleanName.slice(cleanBrand.length).trim();
            }
        }
        
        const brandPrefix = cleanBrand ? `[${cleanBrand}] ` : "";
        const modelSuffix = model ? ` (${model})` : "";
        return `${brandPrefix}${cleanName}${modelSuffix}`;
    };

    const [selectedUnit, setSelectedUnit] = useState<string>(initialUnit);
    const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId);
    const [selectedAppliance, setSelectedAppliance] = useState<string>(initialAppliance || "상담 시 결정");

    const productListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialPlanId) {
                setSelectedPlanId(initialPlanId);
                const cp = careProducts?.find(c => c._id === initialPlanId);
                if (cp) setSelectedUnit(cp.slotCount.toString());
            } else if (initialUnit) {
                setSelectedUnit(initialUnit);
                const cp = careProducts?.find(c => c.slotCount === Number(initialUnit));
                if (cp) setSelectedPlanId(cp._id);
            }
            if (initialAppliance) {
                // If the parent passed a string, format it if brand is prepended without brackets
                let cleaned = initialAppliance;
                // e.g. "LG [LG] 오브제..." -> "[LG] 오브제..."
                const brands = ["LG", "삼성", "다이슨", "쿠쿠", "코웨이", "sk매직", "SK매직"];
                for (const b of brands) {
                    if (cleaned.startsWith(`${b} [${b}]`)) {
                        cleaned = cleaned.replace(`${b} [${b}]`, `[${b}]`);
                    } else if (cleaned.startsWith(`${b} ${b}`)) {
                        cleaned = cleaned.replace(`${b} ${b}`, `${b}`);
                    }
                }
                setSelectedAppliance(cleaned);
            }
        }
    }, [isOpen, initialPlanId, initialUnit, initialAppliance, careProducts]);

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
        if (isOpen && !document.getElementById("daum-postcode-script") && !isPremiumMallMode) {
            const script = document.createElement("script");
            script.id = "daum-postcode-script";
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isOpen, isPremiumMallMode]);

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

        const currentProduct = formData.selectedProduct || productType;
        const isSmartCare = ["smartcare", "스마트케어", "스마트 케어"].includes(currentProduct);
        const isHappy450 = ["happy450", "더 해피 450", "더 해피 450 ONE"].includes(currentProduct);

        if (isPremiumMallMode) {
            // Validation for premium mall mode
            if (!selectedUnit) {
                alert("가입 구좌를 선택해주세요.");
                return;
            }

            // Redirect logic
            let redirectUrl = "";
            if (isHappy450) {
                const happy450Mapping: Record<string, string> = {
                    "1": "https://www.premiummall.co.kr/rental/list-view.html?uid=1447",
                    "2": "https://www.premiummall.co.kr/rental/list-view.html?uid=1448",
                    "3": "https://www.premiummall.co.kr/rental/list-view.html?uid=1449"
                };
                redirectUrl = happy450Mapping[selectedUnit];
            } else if (isSmartCare) {
                const smartcareMapping: Record<string, string> = {
                    "2": "https://www.premiummall.co.kr/rental/list-view.html?uid=1456",
                    "3": "https://www.premiummall.co.kr/rental/list-view.html?uid=1459",
                    "4": "https://www.premiummall.co.kr/rental/list-view.html?uid=1458",
                    "6": "https://www.premiummall.co.kr/rental/list-view.html?uid=1457"
                };
                redirectUrl = smartcareMapping[selectedUnit];
            }

            if (redirectUrl) {
                window.open(redirectUrl, "_blank");
                onClose();
            } else {
                alert("상품 정보가 올바르지 않습니다.");
            }
            return;
        }

        // Validation for Birthdate (only for 스마트케어)
        if (isSmartCare && formData.birthdate.length !== 8) {
            alert("생년월일은 8자리 숫자로 입력해주세요 (예: 19800101)");
            return;
        }

        // Validation for preferredTime
        if (!formData.preferredTime) {
            alert("통화가능 시간을 선택해주세요.");
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
            const isSmartCareProduct = ["smartcare", "스마트케어", "스마트 케어"].includes(selectedProd);
            const isHappy450Product = ["happy450", "더 해피 450", "더 해피 450 ONE"].includes(selectedProd);

            if (isSmartCareProduct) {
                const currentPlan = careProducts?.find(cp => cp._id === selectedPlanId);
                calculatedPlanType = currentPlan 
                    ? `${currentPlan.name} (${currentPlan.slotCount}구좌)` 
                    : `${selectedUnit}구좌`;
                productsInfo = selectedAppliance;
            } else if (isHappy450Product) {
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

            <div className="relative bg-white rounded-none shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up no-scrollbar">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 md:px-8 py-5 md:py-6 flex items-center justify-between border-b border-gray-50 z-10">
                    <h2 className="text-xl md:text-2xl font-bold text-sono-dark tracking-tight">
                        {isPremiumMallMode ? "프리미엄몰 접수" : "상담 신청"}
                    </h2>
                    <button onClick={handleClose} className="p-2 hover:bg-[#f2f4f6] rounded-none transition-colors">
                        <svg className="w-6 h-6 text-[#adb5bd]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="p-10 md:p-12 text-center">
                        <div className="w-16 md:w-20 h-16 md:h-20 rounded-none bg-[#00d084]/10 mx-auto mb-8 flex items-center justify-center text-[#00d084]">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-sono-dark mb-4">신청이 완료되었습니다!</h3>
                        <p className="text-[#6b7684] font-medium mb-10 leading-relaxed text-sm md:text-base">곧 담당 플래너가 연락드리겠습니다.</p>
                        <button onClick={handleClose} className="bg-[#0c2340] hover:bg-[#0a1f38] text-white w-full py-4 rounded-none font-bold transition-colors shadow-lg">확인</button>
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
                                className="group p-8 rounded-none bg-[#f2f4f6] hover:bg-sono-primary hover:text-white transition-all text-left relative overflow-hidden border-2 border-transparent hover:border-sono-primary/10 hover:shadow-xl hover:shadow-sono-primary/20"
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
                                className="group p-8 rounded-none bg-[#f2f4f6] hover:bg-sono-primary hover:text-white transition-all text-left relative overflow-hidden border-2 border-transparent hover:border-sono-primary/10 hover:shadow-xl hover:shadow-sono-primary/20"
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
                        {isPremiumMallMode && (
                            <div className="text-center space-y-4 mb-4">
                                <img 
                                    src="https://res.cloudinary.com/dfkntvpmv/image/upload/v1781675975/logo_ewkbpd.png" 
                                    alt="Promotional Logo" 
                                    className="mx-auto max-w-[200px] h-auto"
                                />
                                <div className="bg-sono-primary/5 py-4 px-6 rounded-none border border-sono-primary/10">
                                    <p className="text-sono-dark font-black text-lg break-keep">
                                        본 상품은 <span className="text-sono-primary">&lt;프리미엄몰&gt;</span>을 통해서 접수 가능합니다.
                                    </p>
                                </div>
                            </div>
                        )}

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
                                            className={`py-3 rounded-none font-bold text-sm transition-all border-none ${formData.selectedProduct === opt.value ? "bg-sono-primary text-white shadow-lg shadow-sono-primary/20" : "bg-[#f2f4f6] text-[#6b7684] hover:bg-gray-200"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isPremiumMallMode && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-2 block">성함 <span className="text-sono-primary">*</span></label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4" placeholder="홍길동" required />
                                </div>
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-2 block">연락처 <span className="text-sono-primary">*</span></label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} inputMode="numeric" className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4" placeholder="010-1234-5678" required />
                                </div>
                                {["smartcare", "스마트케어", "스마트 케어"].includes(formData.selectedProduct || productType) && (
                                    <>
                                        <div>
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">생년월일 (8자리) <span className="text-sono-primary">*</span></label>
                                            <input type="tel" name="birthdate" value={formData.birthdate} onChange={handleBirthdateChange} inputMode="numeric" maxLength={8} className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4" placeholder="19800101" required />
                                        </div>
                                        <div>
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block">성별 <span className="text-sono-primary">*</span></label>
                                            <div className="flex bg-[#f9fafb] p-1 rounded-none h-[56px]">
                                                {["남", "여"].map((g) => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, gender: g === "남" ? "남성" : "여성" }))}
                                                        className={`flex-1 rounded-none text-sm font-bold transition-all ${formData.gender === (g === "남" ? "남성" : "여성") ? "bg-white text-sono-primary shadow-sm" : "text-gray-400"}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="input-label !text-[#4e5968] !font-bold mb-2 block">통화가능 시간 <span className="text-sono-primary">*</span></label>
                                    <select
                                        name="preferredTime"
                                        value={formData.preferredTime}
                                        onChange={handleChange}
                                        className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4 w-full cursor-pointer text-[#4e5968] font-medium"
                                        required
                                    >
                                        <option value="">통화가능 시간을 선택해주세요</option>
                                        <option value="10:00~11:00">10:00~11:00</option>
                                        <option value="11:00~12:00">11:00~12:00</option>
                                        <option value="14:00~15:00">14:00~15:00</option>
                                        <option value="15:00~16:00">15:00~16:00</option>
                                        <option value="16:00~17:00">16:00~17:00</option>
                                        <option value="17:00~18:00">17:00~18:00</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {["smartcare", "스마트케어"].includes(formData.selectedProduct || productType) && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 상품 선택</label>
                                    <div className="flex bg-[#f2f4f6] border border-gray-300 p-1 rounded-none flex-wrap gap-1">
                                        {(careProducts || []).map((cp) => (
                                            <button
                                                key={cp._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPlanId(cp._id);
                                                    setSelectedUnit(cp.slotCount.toString());
                                                    setSelectedAppliance(isPremiumMallMode ? "" : "상담 시 결정");
                                                    if (productListRef.current) {
                                                        productListRef.current.scrollTop = 0;
                                                    }
                                                }}
                                                className={`flex-1 min-w-[80px] py-2 md:py-3 rounded-none transition-all flex flex-col items-center justify-center ${selectedPlanId === cp._id ? "bg-[#0c2340] text-white shadow-md font-bold" : "bg-white text-[#4e5968] hover:bg-gray-50"}`}
                                            >
                                                <span className={`text-[9px] font-bold mb-0.5 ${selectedPlanId === cp._id ? "text-white/80" : "text-gray-400"}`}>{cp.name}</span>
                                                <span className={`text-sm font-black ${selectedPlanId === cp._id ? "text-white" : "text-sono-dark"}`}>{cp.slotCount}구좌</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가전제품 선택</label>
                                    <div
                                        ref={productListRef}
                                        className="flex flex-col h-[380px] overflow-y-auto border border-gray-400 bg-white rounded-none divide-y divide-gray-300 no-scrollbar"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAppliance("상담 시 결정")}
                                            className={`w-full py-2.5 px-4 text-xs font-bold transition-all text-left flex items-center justify-between ${
                                                selectedAppliance === "상담 시 결정"
                                                    ? "bg-[#fff3cd] text-[#0c2340] font-extrabold"
                                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <span>상담 시 결정</span>
                                            {selectedAppliance === "상담 시 결정" && (
                                                <span className="text-[#0c2340] text-xs shrink-0 font-bold ml-2">✓ 선택됨</span>
                                            )}
                                        </button>
                                        {allAppliances
                                            .filter(item => {
                                                return selectedPlanId 
                                                    ? (item.careProductId === selectedPlanId || 
                                                       (!item.careProductId && (item.slotCount || 4).toString() === selectedUnit))
                                                    : (item.slotCount || 4).toString() === selectedUnit;
                                            })
                                            .map((item, idx) => {
                                                const displayLabel = formatApplianceText(item.brand, item.name, item.model);
                                                const applianceValue = formatApplianceText(item.brand, item.name, item.model);

                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setSelectedAppliance(applianceValue)}
                                                        className={`w-full py-2.5 px-4 text-xs font-bold transition-all text-left flex items-center justify-between ${
                                                            selectedAppliance === applianceValue
                                                                ? "bg-[#fff3cd] text-[#0c2340] font-extrabold"
                                                                : "bg-white text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <span className="truncate">{displayLabel}</span>
                                                        {selectedAppliance === applianceValue && (
                                                            <span className="text-[#0c2340] text-xs shrink-0 font-bold ml-2">✓ 선택됨</span>
                                                        )}
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                    {selectedAppliance && selectedAppliance !== "상담 시 결정" && (
                                        <div className="mt-3 p-4 bg-[#fff3cd] border border-[#d69e2e] rounded-none shadow-sm animate-fade-in">
                                            <span className="text-xs font-bold text-[#0c2340] block mb-1">선택하신 제품</span>
                                            <div className="font-bold text-sono-dark text-sm break-keep leading-snug">{selectedAppliance}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {["happy450", "더 해피 450", "더 해피 450 ONE"].includes(formData.selectedProduct || productType) && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="input-label !text-[#4e5968] !font-bold mb-3 block">가입 구좌 선택</label>
                                    <div className="flex bg-[#f2f4f6] border border-gray-300 p-1 rounded-none gap-1">
                                        {["1", "2", "3"].map((u) => (
                                            <button
                                                key={u}
                                                type="button"
                                                onClick={() => setSelectedUnit(u)}
                                                className={`flex-1 py-2.5 rounded-none text-sm font-bold transition-all ${selectedUnit === u ? "bg-[#0c2340] text-white shadow-md font-bold" : "bg-white text-[#4e5968] hover:bg-gray-50"}`}
                                            >
                                                {u}구좌
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {["smartcare", "스마트케어", "스마트 케어"].includes(formData.selectedProduct || productType) && !isPremiumMallMode && (
                            <div>
                                <label className="input-label !text-[#4e5968] !font-bold mb-2 block">주소</label>
                                <div className="flex gap-2 mb-2">
                                    <input type="text" value={formData.zonecode} readOnly inputMode="numeric" className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4 flex-1" placeholder="우편번호" />
                                    <button type="button" onClick={openAddressSearch} className="bg-[#0c2340] hover:bg-[#0a1f38] text-white font-bold px-6 rounded-none transition-colors">검색</button>
                                </div>
                                <input type="text" value={formData.address} readOnly className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4 mb-2" placeholder="기본 주소" />
                                <input type="text" name="addressDetail" value={formData.addressDetail} onChange={handleChange} className="input-field !bg-[#f9fafb] !border-none !rounded-none !py-4" placeholder="상세 주소" />
                            </div>
                        )}

                        {!isPremiumMallMode && (
                            <div className="space-y-4">
                                <div className="bg-[#f9fafb] border border-gray-100 rounded-none p-4 text-[11px] text-[#8b95a1] leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
                                    {(() => {
                                        const currentProd = formData.selectedProduct || productType;
                                        const isSmartCare = ["smartcare", "스마트케어", "스마트 케어"].includes(currentProd);
                                        const displayProductName = isSmartCare ? "스마트케어" : "더해피450 one";
                                        const displayPurpose = isSmartCare ? "스마트케어 상품 소개, 계약상담, 계약체결" : "더해피450 one 상품 소개, 계약상담, 계약체결";
                                        const displayWorkContent = isSmartCare ? "스마트케어" : "더해피450 one";
                                        
                                        return (
                                            <>
                                                <p className="font-bold text-[#4e5968] mb-2">[{displayProductName} 상품 가입을 위한 개인정보 수집, 이용 및 위탁 안내]</p>
                                                <p className="mb-4">㈜소노스테이션은 {displayProductName} 상품 가입을 위하여 회원님의 개인정보를 아래와 같이 수집, 이용 및 위탁하고자 합니다.</p>
                                                
                                                <p className="font-bold text-[#6b7684] mb-1">1. 개인정보 수집 및 이용 동의 (필수사항)</p>
                                                <ul className="space-y-0.5 mb-4 list-none pl-0">
                                                    <li>▷ 수집, 이용하는 자 : ㈜소노스테이션</li>
                                                    <li>▷ 수집, 이용하려는 개인정보 항목: 성명, 연락처(이동전화 | 유선전화)</li>
                                                    <li>▷ 개인정보 수집, 이용 및 위탁 목적 : {displayPurpose}</li>
                                                    <li>▷ 개인정보 보유 기간 : 개인정보 수집 및 이용 동의일로부터 30일 또는 수집/이용 목적 달성 시까지</li>
                                                </ul>
                                                
                                                <p className="mb-4">* 고객님은 위의 개인정보 수집, 이용 및 위탁 대한 동의를 거부하실 수 있습니다. 그러나 동의를 거부할 경우 상품 가입 등 서비스 제공에 제한을 받을 수 있습니다.</p>
                                                
                                                <p className="font-bold text-[#6b7684] mb-1">2. 개인정보 취급업무 위탁 안내</p>
                                                <ul className="space-y-0.5 list-none pl-0">
                                                    <li>▷ 취급을 위탁받는 자(수탁업체) : 라이프앤조이, {partnerName || "파트너사"}, (주)효성ITX</li>
                                                    <li>▷ 업무내용 : {displayWorkContent} 상품 소개, 상담접수, 계약체결</li>
                                                </ul>
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="bg-[#f2f4f6] rounded-none p-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.privacyAgreed} onChange={handleChange} name="privacyAgreed" className="w-5 h-5 rounded-none border-gray-300 text-sono-primary focus:ring-sono-primary" required />
                                        <span className="text-sm font-bold text-[#4e5968]">개인정보 활용 동의 <span className="text-sono-primary">(필수)</span></span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="bg-[#0c2340] hover:bg-[#0a1f38] text-white w-full py-3 sm:py-4.5 text-base sm:text-xl font-bold transition-colors disabled:opacity-50 !rounded-none shadow-xl shadow-[#0c2340]/10"
                        >
                            {isSubmitting ? "데이터 저장 중..." : (isPremiumMallMode ? "프리미엄몰 접수 바로가기" : "상담 신청하기")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
