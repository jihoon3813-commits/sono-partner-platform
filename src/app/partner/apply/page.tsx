"use client";

import { Header, Footer } from "@/components/layout";
import { useState } from "react";
import Link from "next/link";

export default function PartnerApplyPage() {
    const [formData, setFormData] = useState({
        // 회사 정보
        companyName: "",
        businessNumber: "",
        ceoName: "",
        companyAddress: "",
        companyPhone: "",
        // 담당자 정보
        managerName: "",
        managerDepartment: "",
        managerPhone: "",
        managerEmail: "",
        // 분양몰 정보 (New)
        mallId: "",
        mallPassword: "",
        mallPasswordConfirm: "",
        subdomain: "",
        // 쇼핑몰 정보
        shopType: "",
        shopUrl: "",
        monthlyVisitors: "",
        memberCount: "",
        mainProducts: "",
        // 제휴 계획
        expectedMonthlySales: "",
        pointRate: "",
        additionalRequest: "",
        // 상위 파트너
        parentPartnerId: "",
        parentPartnerName: "",
        // 동의
        privacyAgreed: false,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ partnerId: string, companyName: string, ceoName: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedParent, setSelectedParent] = useState<{ partnerId: string, companyName: string } | null>(null);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/partners/search?q=${encodeURIComponent(val)}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.results);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectParent = (partner: { partnerId: string, companyName: string }) => {
        setSelectedParent(partner);
        setFormData(prev => ({
            ...prev,
            parentPartnerId: partner.partnerId,
            parentPartnerName: partner.companyName
        }));
        setSearchTerm("");
        setSearchResults([]);
    };

    const clearParent = () => {
        setSelectedParent(null);
        setFormData(prev => ({
            ...prev,
            parentPartnerId: "",
            parentPartnerName: ""
        }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);



    const formatPhone = (val: string) => {
        const nums = val.replace(/[^0-9]/g, "");
        if (nums.length <= 3) return nums;
        if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        if (nums.length <= 11) return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
        return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
    };

    const formatBusinessNumber = (val: string) => {
        const nums = val.replace(/[^0-9]/g, "").slice(0, 10);
        if (nums.length <= 3) return nums;
        if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
        return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        if (name === "managerPhone" || name === "companyPhone") {
            finalValue = formatPhone(value);
        } else if (name === "businessNumber") {
            finalValue = formatBusinessNumber(value);
        } else if (name === "subdomain") {
            // Allow alphanumeric only
            finalValue = value.replace(/[^a-zA-Z0-9]/g, "");
        } else if (name === "mallId") {
            // Allow alphanumeric only
            finalValue = value.replace(/[^a-zA-Z0-9]/g, "");
        }

        setFormData(prev => ({
            ...prev,
            [name]: finalValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password Validation
        if (formData.mallPassword !== formData.mallPasswordConfirm) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Map form data to API payload
            const payload = {
                ...formData,
                loginId: formData.mallId,
                loginPassword: formData.mallPassword,
                customUrl: formData.subdomain,
                // Remove temp fields
                mallId: undefined,
                mallPassword: undefined,
                mallPasswordConfirm: undefined,
                subdomain: undefined
            };

            // 1. Convex (Main Database) 전송
            const apiRes = await fetch("/api/partner/apply", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!apiRes.ok) {
                const errData = await apiRes.json();
                throw new Error(errData.message || "신청 접수 중 오류가 발생했습니다.");
            }

            setIsSubmitted(true);
            window.scrollTo(0, 0);

        } catch (error) {
            console.error("Submission error:", error);
            alert(error instanceof Error ? error.message : "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <>
                <Header />
                <main className="pt-24 md:pt-32 min-h-screen bg-[#f2f4f6]">
                    <div className="max-w-2xl mx-auto px-6 py-20">
                        <div className="card bg-white !p-12 text-center animate-fade-in">
                            <div className="w-24 h-24 rounded-[30px] bg-[#00d084]/10 mx-auto mb-8 flex items-center justify-center">
                                <svg className="w-12 h-12 text-[#00d084]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-sono-dark mb-6 tracking-tight">
                                파트너 신청이 완료되었습니다!
                            </h1>
                            <p className="text-lg text-[#6b7684] font-medium mb-12 leading-relaxed">
                                입력하신 이메일로 접수 확인 메일이 발송됩니다.<br />
                                검토 후 3영업일 내에 담당사가 연락드릴 예정입니다.
                            </p>
                            <Link href="/" className="btn-primary text-lg px-12 py-4">
                                홈으로 돌아가기
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-[#f2f4f6]">
                {/* 히어로 */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://github.com/jihoon3813-commits/img_sono/blob/main/Generated%20Image%20January%2025,%202026%20-%2012_57PM.jpeg?raw=true"
                            alt="Partner Apply Hero"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                        <span className="inline-block px-4 py-2 rounded-full border border-white/30 text-white font-bold text-sm mb-8 backdrop-blur-md">PARTNER APPLICATION</span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter text-white">
                            제휴 파트너 신청
                        </h1>
                        <p className="text-xl text-gray-200 font-medium leading-relaxed max-w-2xl mx-auto break-keep">
                            소노아임레디와 함께할 파트너사를 기다립니다.<br />
                            아래 정보를 입력해주시면 검토 후 연락드리겠습니다.
                        </p>
                    </div>
                </section>

                {/* 신청 폼 */}
                <section className="py-20 md:py-32">
                    <div className="max-w-4xl mx-auto px-6">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            {/* 상위 파트너 정보 (추천인) */}
                            <div className="card bg-white !p-10 md:!p-16 border-2 border-sono-primary/5">
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </span>
                                    추천인(상위 파트너) 검색
                                </h2>

                                {selectedParent ? (
                                    <div className="bg-sono-primary/5 rounded-2xl p-6 flex items-center justify-between border border-sono-primary/10">
                                        <div>
                                            <p className="text-xs font-bold text-sono-primary mb-1 uppercase tracking-wider">Selected Partner</p>
                                            <p className="text-xl font-bold text-sono-dark">{selectedParent.companyName}</p>
                                            <p className="text-sm text-[#8b95a1] font-mono">{selectedParent.partnerId}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={clearParent}
                                            className="text-[#8b95a1] hover:text-red-500 font-bold text-sm transition-colors"
                                        >
                                            변경하기
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="input-label !text-[#4e5968] !font-bold mb-2 block ml-1">상위 파트너사 검색</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    className="w-full bg-[#f9fafb] border-none rounded-2xl py-4 pl-12 pr-5 text-sono-dark font-medium focus:ring-2 focus:ring-sono-primary"
                                                    placeholder="회사명 또는 대표자명을 입력하세요 (2자 이상)"
                                                />
                                                <svg className="w-5 h-5 text-[#adb5bd] absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                {isSearching && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <div className="animate-spin w-4 h-4 border-2 border-sono-primary border-t-transparent rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                                                <div className="max-h-[300px] overflow-y-auto">
                                                    {searchResults.map((p) => (
                                                        <button
                                                            key={p.partnerId}
                                                            type="button"
                                                            onClick={() => selectParent(p)}
                                                            className="w-full text-left px-6 py-4 hover:bg-[#f9fafb] transition-colors border-b border-gray-50 last:border-none group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-bold text-sono-dark group-hover:text-sono-primary transition-colors">{p.companyName}</p>
                                                                    <p className="text-sm text-[#8b95a1]">대표: {p.ceoName}</p>
                                                                </div>
                                                                <span className="text-xs font-bold text-[#adb5bd] uppercase">Select</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
                                            <p className="text-sm text-[#8b95a1] ml-1">해당하는 파트너사를 찾을 수 없습니다.</p>
                                        )}

                                        <p className="text-xs text-[#adb5bd] ml-1 font-medium italic">
                                            * 상위 파트너사가 있는 경우 반드시 검색하여 선택해주세요. 없으면 비워두셔도 됩니다.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 회사 정보 */}
                            <div className="card bg-white !p-10 md:!p-16">
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">1</span>
                                    회사 정보
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="md:col-span-2">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            회사명 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="(주)소노파트너"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            사업자등록번호 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="businessNumber"
                                            value={formData.businessNumber}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="123-45-67890"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            대표자명 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="ceoName"
                                            value={formData.ceoName}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="홍길동"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            회사 주소 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="companyAddress"
                                            value={formData.companyAddress}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="서울시 강남구 테헤란로 123"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            회사 전화번호 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="companyPhone"
                                            value={formData.companyPhone}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="02-1234-5678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 담당자 정보 */}
                            <div className="card bg-white !p-10 md:!p-16">
                                {/* ... (previous content for Manager Info) ... */}
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">2</span>
                                    담당자 정보
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            담당자명 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="managerName"
                                            value={formData.managerName}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="김철수"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">부서/직급</label>
                                        <input
                                            type="text"
                                            name="managerDepartment"
                                            value={formData.managerDepartment}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="마케팅팀 과장"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            휴대폰 번호 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="managerPhone"
                                            value={formData.managerPhone}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="010-1234-5678"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            이메일 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="managerEmail"
                                            value={formData.managerEmail}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="manager@company.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 분양몰 정보 (New Section) */}
                            <div className="card bg-white !p-10 md:!p-16">
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">3</span>
                                    분양몰 정보
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            아이디 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="mallId"
                                            value={formData.mallId}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="영문, 숫자만 가능"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            서브도메인 <span className="text-sono-primary">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500 font-medium">sono24.com/p/</span>
                                            <input
                                                type="text"
                                                name="subdomain"
                                                value={formData.subdomain}
                                                onChange={handleChange}
                                                className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 flex-1"
                                                required
                                                placeholder="mybrand"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            비밀번호 <span className="text-sono-primary">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="mallPassword"
                                            value={formData.mallPassword}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                            placeholder="비밀번호 입력"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            비밀번호 확인 <span className="text-sono-primary">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="mallPasswordConfirm"
                                                value={formData.mallPasswordConfirm}
                                                onChange={handleChange}
                                                className={`input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 w-full ${formData.mallPasswordConfirm && formData.mallPassword !== formData.mallPasswordConfirm ? 'ring-2 ring-red-500' : ''}`}
                                                required
                                                placeholder="비밀번호 재입력"
                                            />
                                            {formData.mallPasswordConfirm && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold">
                                                    {formData.mallPassword === formData.mallPasswordConfirm ? (
                                                        <span className="text-green-500">일치함</span>
                                                    ) : (
                                                        <span className="text-red-500">일치하지 않음</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 쇼핑몰 정보 */}
                            <div className="card bg-white !p-10 md:!p-16">
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">4</span>
                                    쇼핑몰 정보
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="md:col-span-2">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">
                                            쇼핑몰 유형 <span className="text-sono-primary">*</span>
                                        </label>
                                        <select
                                            name="shopType"
                                            value={formData.shopType}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            required
                                        >
                                            <option value="">선택해주세요</option>
                                            <option value="폐쇄형회원제">폐쇄형 회원제 쇼핑몰</option>
                                            <option value="기업복지몰">기업 복지몰</option>
                                            <option value="임직원몰">임직원 전용몰</option>
                                            <option value="기타">기타</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">쇼핑몰 URL</label>
                                        <input
                                            type="url"
                                            name="shopUrl"
                                            value={formData.shopUrl}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="https://www.example.com"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">월 평균 방문자 수</label>
                                        <input
                                            type="text"
                                            name="monthlyVisitors"
                                            value={formData.monthlyVisitors}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="약 10,000명"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">회원 수</label>
                                        <input
                                            type="text"
                                            name="memberCount"
                                            value={formData.memberCount}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="약 50,000명"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 제휴 계획 */}
                            <div className="card bg-white !p-10 md:!p-16">
                                <h2 className="text-2xl font-bold text-sono-dark mb-10 tracking-tight flex items-center gap-4">
                                    <span className="w-10 h-10 rounded-[14px] bg-sono-primary/10 text-sono-primary flex items-center justify-center text-lg">5</span>
                                    제휴 계획
                                </h2>
                                <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">예상 월 판매 건수</label>
                                        <input
                                            type="text"
                                            name="expectedMonthlySales"
                                            value={formData.expectedMonthlySales}
                                            onChange={handleChange}
                                            inputMode="numeric"
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="약 10건"
                                        />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">제공 가능한 포인트 비율</label>
                                        <input
                                            type="text"
                                            name="pointRate"
                                            value={formData.pointRate}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4"
                                            placeholder="계약금의 5% 등"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="input-label !text-[#4e5968] !font-bold mb-2 block">추가 요청사항</label>
                                        <textarea
                                            name="additionalRequest"
                                            value={formData.additionalRequest}
                                            onChange={handleChange}
                                            className="input-field !bg-[#f9fafb] !border-none !rounded-2xl !py-4 min-h-[160px]"
                                            placeholder="제휴에 관한 추가 요청사항이나 문의사항을 적어주세요."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 동의 및 제출 */}
                            <div className="space-y-8">
                                <div className="card bg-white !rounded-3xl !p-6">
                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="privacyAgreed"
                                                checked={formData.privacyAgreed}
                                                onChange={handleChange}
                                                className="w-6 h-6 rounded-lg border-gray-300 text-sono-primary focus:ring-sono-primary"
                                                required
                                            />
                                        </div>
                                        <span className="text-lg text-[#4e5968] font-bold">
                                            개인정보 수집 및 이용에 동의합니다 <span className="text-sono-primary">(필수)</span>
                                        </span>
                                    </label>
                                    <div className="mt-4 pl-10">
                                        <p className="text-sm text-[#8b95a1] font-medium leading-relaxed">
                                            수집항목: 회사정보, 담당자 정보, 쇼핑몰 정보 | 수집목적: 파트너 신청 검토 및 연락 | 보유기간: 신청 후 1년
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary text-xl px-16 py-5 w-full md:w-auto shadow-xl shadow-sono-primary/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-3">
                                                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                </svg>
                                                신청 중...
                                            </span>
                                        ) : (
                                            "파트너 신청 완료하기"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
