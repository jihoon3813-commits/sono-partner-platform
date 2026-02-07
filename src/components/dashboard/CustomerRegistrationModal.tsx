"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Partner } from "@/lib/types";
import DaumPostcode from 'react-daum-postcode';
import { useQuery } from "convex/react";

interface CustomerRegistrationModalProps {
    onClose: () => void;
    onSuccess: () => void;
    partner: any; // Logged in partner (session) or selected partner - session has 'name', db has 'companyName'
    partners?: Partner[]; // List of partners for Admin to select
    isAdmin?: boolean;
}

interface StagedCustomer {
    id: string; // Temporary ID for list management
    customerName: string;
    customerPhone: string;
    customerBirth: string;
    customerGender: string;
    customerAddress: string;
    customerAddressDetail: string;
    productType: string;
    planType: string; // 구좌
    products: string; // 가전제품
    partnerMemberId: string; // 회원번호
    inquiry: string;
    // For Admin:
    selectedPartnerId?: string;
    selectedPartnerName?: string;
    selectedPartnerLoginId?: string; // 로그인 ID
}

export default function CustomerRegistrationModal({ onClose, onSuccess, partner, partners = [], isAdmin = false }: CustomerRegistrationModalProps) {
    const createApplications = useMutation(api.applications.createApplications);

    // Get template URLs from settings
    const standardTemplateUrl = useQuery(api.settings.getTemplateUrl, { key: "standard_template_url" });
    const adminTemplateUrl = useQuery(api.settings.getTemplateUrl, { key: "admin_template_url" });

    const [stagedCustomers, setStagedCustomers] = useState<StagedCustomer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpenPostcode, setIsOpenPostcode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Entry Form State
    const [manualForm, setManualForm] = useState<StagedCustomer>({
        id: "",
        customerName: "",
        customerPhone: "",
        customerBirth: "",
        customerGender: "남",
        customerAddress: "",
        customerAddressDetail: "",
        productType: "더 해피 450 ONE",
        planType: "1",
        products: "",
        partnerMemberId: "",
        inquiry: "",
        selectedPartnerId: partner?.partnerId || "",
        selectedPartnerLoginId: partner?.loginId || "",
        selectedPartnerName: partner?.companyName || partner?.name || "",
    });

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === "customerPhone") {
            const numbers = value.replace(/[^\d]/g, "");
            if (numbers.length <= 3) finalValue = numbers;
            else if (numbers.length <= 7) finalValue = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            else finalValue = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        } else if (name === "customerBirth") {
            const numbers = value.replace(/[^\d]/g, "");
            if (numbers.length <= 4) finalValue = numbers;
            else if (numbers.length <= 6) finalValue = `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
            else finalValue = `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }

        // When partner is selected, also update loginId and name
        if (name === "selectedPartnerId") {
            const selectedP = partners.find(p => p.partnerId === value);
            setManualForm(prev => ({
                ...prev,
                selectedPartnerId: value,
                selectedPartnerLoginId: selectedP?.loginId || "",
                selectedPartnerName: selectedP?.companyName || "",
            }));
            return;
        }

        setManualForm(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleCompletePostcode = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setManualForm(prev => ({
            ...prev,
            customerAddress: fullAddress,
            customerAddressDetail: ""
        }));
        setIsOpenPostcode(false);
    };

    const addManualCustomer = () => {
        if (!manualForm.customerName || !manualForm.customerPhone) {
            alert("고객명과 연락처는 필수입니다.");
            return;
        }

        // Admin check: Partner selection
        let pId = partner?.partnerId || "";
        let pName = partner?.companyName || partner?.name || "";
        let pLoginId = partner?.loginId || "";

        if (isAdmin) {
            if (!manualForm.selectedPartnerId) {
                alert("파트너사를 선택해주세요.");
                return;
            }
            pId = manualForm.selectedPartnerId;
            const selectedP = partners.find(p => p.partnerId === pId);
            pName = selectedP?.companyName || "";
            pLoginId = selectedP?.loginId || "";
        }

        const newCustomer: StagedCustomer = {
            ...manualForm,
            id: Date.now().toString(),
            selectedPartnerId: pId,
            selectedPartnerName: pName,
            selectedPartnerLoginId: pLoginId
        };

        setStagedCustomers(prev => [...prev, newCustomer]);

        // Reset form but keep partner selection if admin
        setManualForm({
            id: "",
            customerName: "",
            customerPhone: "",
            customerBirth: "",
            customerGender: "남",
            customerAddress: "",
            customerAddressDetail: "",
            productType: "더 해피 450 ONE",
            planType: manualForm.productType === '더 해피 450 ONE' ? "1" : "4",
            products: "",
            partnerMemberId: "",
            inquiry: "",
            selectedPartnerId: isAdmin ? manualForm.selectedPartnerId : (partner?.partnerId || ""),
            selectedPartnerLoginId: isAdmin ? manualForm.selectedPartnerLoginId : (partner?.loginId || ""),
            selectedPartnerName: isAdmin ? manualForm.selectedPartnerName : (partner?.companyName || partner?.name || ""),
        });
    };

    const removeStaged = (id: string) => {
        setStagedCustomers(prev => prev.filter(c => c.id !== id));
    };



    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

            // Remove header
            if (data.length < 2) return;
            const rows = data.slice(1);

            const newCustomers: StagedCustomer[] = [];

            rows.forEach((row, idx) => {
                // Determine index offset based on isAdmin (header shift)
                const offset = isAdmin ? 1 : 0;

                // If admin, read partner ID
                let pId = partner?.partnerId || "";
                let pName = partner?.companyName || partner?.name || "";
                let pLoginId = partner?.loginId || "";

                if (isAdmin) {
                    const loginId = String(row[0] || "").trim(); // First col is Partner Login ID

                    // Try to find partner by Login ID or Partner ID (exact match)
                    let p = partners.find(p => p.loginId === loginId || p.partnerId === loginId);

                    if (p) {
                        pId = p.partnerId;
                        pLoginId = p.loginId || ""; // Store login ID first
                        pName = p.companyName || ""; // Only use company name
                    } else {
                        // Fallback: If no partner found by ID, use manually selected partner if available
                        if (manualForm.selectedPartnerId) {
                            pId = manualForm.selectedPartnerId;
                            const selected = partners.find(p => p.partnerId === pId);
                            pName = selected?.companyName || "";
                            pLoginId = selected?.loginId || "";
                        }
                    }
                }

                if (!pId) return; // Skip if no partner identified

                const customerName = row[0 + offset];
                const customerPhone = row[1 + offset];
                if (!customerName || !customerPhone) return;

                newCustomers.push({
                    id: `excel-${Date.now()}-${idx}`,
                    customerName: String(customerName),
                    customerPhone: String(customerPhone),
                    customerBirth: row[2 + offset] ? String(row[2 + offset]) : "",
                    customerGender: row[3 + offset] ? String(row[3 + offset]) : "남",
                    customerAddress: row[4 + offset] ? String(row[4 + offset]) : "",
                    customerAddressDetail: row[5 + offset] ? String(row[5 + offset]) : "",
                    productType: row[6 + offset] ? (String(row[6 + offset]).toLowerCase().includes("smart") || String(row[6 + offset]).includes("스마트") ? "스마트케어" : "더 해피 450 ONE") : "더 해피 450 ONE",
                    planType: row[7 + offset] ? String(row[7 + offset]) : "1",
                    products: row[8 + offset] ? String(row[8 + offset]) : "",
                    partnerMemberId: row[9 + offset] ? String(row[9 + offset]) : "",
                    inquiry: row[10 + offset] ? String(row[10 + offset]) : "",
                    selectedPartnerId: pId,
                    selectedPartnerName: pName,
                    selectedPartnerLoginId: pLoginId
                });
            });

            setStagedCustomers(prev => [...prev, ...newCustomers]);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        };
        reader.readAsBinaryString(file);
    };

    const handleSave = async () => {
        if (stagedCustomers.length === 0) return;
        setIsSubmitting(true);
        try {
            // Transform StagedCustomer to API payload
            const payload = stagedCustomers.map(c => ({
                partnerId: c.selectedPartnerLoginId || partner?.loginId || "",
                // partnerName: only use companyName
                partnerName: c.selectedPartnerName || partner?.companyName || partner?.name || "",
                productType: c.productType,
                planType: c.planType,
                products: c.products,
                customerName: c.customerName,
                customerBirth: c.customerBirth,
                customerGender: c.customerGender,
                customerPhone: c.customerPhone,
                customerEmail: "", // Not in simple form
                customerAddress: `${c.customerAddress} ${c.customerAddressDetail}`.trim(),
                customerZipcode: "", // Not in simple form, maybe parse from address?
                partnerMemberId: c.partnerMemberId,
                preferredContactTime: "",
                inquiry: c.inquiry,
                status: "접수",
                assignedTo: ""
            }));

            await createApplications({ applications: payload });
            alert(`${stagedCustomers.length}명의 고객이 등록되었습니다!`);
            onSuccess();
        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`저장 중 오류가 발생했습니다: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up relative">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-sono-dark">고객 직접 등록</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. Manual Entry / Excel Actions */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Actions */}
                        <div className="md:col-span-3 flex flex-wrap gap-3 items-center justify-end">
                            <button
                                onClick={() => {
                                    // Use the proxy API route for downloading.
                                    // This handles secure file fetching from Convex and avoids CORS/Mixed Content issues.
                                    window.location.assign(`/api/download-template?type=${isAdmin ? 'admin' : 'standard'}`);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                양식 다운로드
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm font-bold hover:bg-green-100 transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    엑셀 업로드
                                </button>
                            </div>

                            {/* Guide Text */}
                            <div className="w-full mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
                                <p className="font-bold flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    엑셀 일괄 등록 가이드
                                </p>
                                <ol className="list-decimal text-left list-inside pl-1 space-y-0.5 text-blue-700/80">
                                    <li>[양식 다운로드] 버튼을 눌러 엑셀 파일을 다운로드합니다.</li>
                                    <li>다운로드한 파일에 고객 정보를 입력합니다. (헤더 삭제 금지)</li>
                                    <li>[엑셀 업로드] 버튼을 눌러 작성한 파일을 선택하면 자동으로 목록에 추가됩니다.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Manual Form */}
                    <div className="md:col-span-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">개별 등록</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {isAdmin && (
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">파트너사</label>
                                    <select
                                        name="selectedPartnerId"
                                        value={manualForm.selectedPartnerId}
                                        onChange={handleManualChange}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                    >
                                        <option value="">선택</option>
                                        {partners.map(p => (
                                            <option key={p.partnerId} value={p.partnerId}>{p.companyName} ({p.loginId})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">고객명 *</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={manualForm.customerName}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">연락처 *</label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    value={manualForm.customerPhone}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                    placeholder="010-0000-0000"
                                    maxLength={13}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">상품</label>
                                <select
                                    name="productType"
                                    value={manualForm.productType}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                >
                                    <option value="더 해피 450 ONE">더 해피 450 ONE</option>
                                    <option value="스마트케어">스마트케어</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">구좌</label>
                                <select
                                    name="planType"
                                    value={manualForm.planType}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                >
                                    {manualForm.productType === '더 해피 450 ONE'
                                        ? ["1", "2", "3"].map(n => <option key={n} value={n}>{n}구좌</option>)
                                        : ["2", "3", "4", "6"].map(n => <option key={n} value={n}>{n}구좌</option>)
                                    }
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-400 mb-1">가전제품 (스마트케어만)</label>
                                <input
                                    type="text"
                                    name="products"
                                    value={manualForm.products}
                                    onChange={handleManualChange}
                                    disabled={manualForm.productType !== '스마트케어'}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary disabled:bg-gray-100"
                                    placeholder="예: 삼성 에어드레서"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">생년월일</label>
                                <input
                                    type="text"
                                    name="customerBirth"
                                    value={manualForm.customerBirth}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                    placeholder="YYYY-MM-DD"
                                    maxLength={10}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 mb-1">성별</label>
                                <select
                                    name="customerGender"
                                    value={manualForm.customerGender}
                                    onChange={handleManualChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                >
                                    <option value="남">남</option>
                                    <option value="여">여</option>
                                </select>
                            </div>
                            <div className="col-span-4 grid grid-cols-4 gap-3">
                                <div className="col-span-4 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">주소</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="customerAddress"
                                            value={manualForm.customerAddress}
                                            readOnly
                                            onClick={() => setIsOpenPostcode(true)}
                                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary bg-white cursor-pointer"
                                            placeholder="주소 검색"
                                        />
                                        <button
                                            onClick={() => setIsOpenPostcode(true)}
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 whitespace-nowrap"
                                        >
                                            검색
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-400 mb-1">상세주소</label>
                                    <input
                                        type="text"
                                        name="customerAddressDetail"
                                        value={manualForm.customerAddressDetail}
                                        onChange={handleManualChange}
                                        className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-sono-primary"
                                        placeholder="상세주소를 입력하세요"
                                    />
                                </div>
                            </div>
                            <div className="col-span-4 flex justify-end mt-2">
                                <button
                                    onClick={addManualCustomer}
                                    className="px-6 py-2 bg-sono-dark text-white rounded-lg text-sm font-bold hover:bg-black transition-all"
                                >
                                    추가하기
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Staging List */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <h3 className="text-lg font-bold text-sono-dark">등록 대기 목록 <span className="text-sono-primary">({stagedCustomers.length})</span></h3>
                        </div>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {isAdmin && <th className="px-4 py-3 font-bold text-gray-500 text-xs">파트너</th>}
                                        <th className="px-4 py-3 font-bold text-gray-500 text-xs text-center w-20">고객명</th>
                                        <th className="px-4 py-3 font-bold text-gray-500 text-xs text-center">연락처</th>
                                        <th className="px-4 py-3 font-bold text-gray-500 text-xs text-center">상품</th>
                                        <th className="px-4 py-3 font-bold text-gray-500 text-xs text-center w-16">구좌</th>
                                        <th className="px-4 py-3 font-bold text-gray-500 text-xs text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {stagedCustomers.length > 0 ? stagedCustomers.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            {isAdmin && <td className="px-4 py-3 text-gray-600 font-bold text-xs truncate max-w-[100px]">{c.selectedPartnerName}</td>}
                                            <td className="px-4 py-3 font-bold text-sono-dark text-xs text-center">{c.customerName}</td>
                                            <td className="px-4 py-3 text-gray-600 text-xs text-center">{c.customerPhone}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.productType === '스마트케어' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {c.productType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 text-xs text-center">{c.planType}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => removeStaged(c.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 6 : 5} className="px-4 py-10 text-center text-gray-400 text-xs">
                                                등록된 고객이 없습니다. 고객을 추가해주세요.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={stagedCustomers.length === 0 || isSubmitting}
                        className="px-8 py-2.5 bg-sono-primary text-white rounded-xl text-sm font-bold hover:bg-sono-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sono-primary/20 transition-all"
                    >
                        {isSubmitting ? "저장 중..." : `${stagedCustomers.length}명 저장하기`}
                    </button>
                </div>

                {/* Postcode Modal */}
                {isOpenPostcode && (
                    <div className="absolute inset-0 z-[210] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-bold text-sono-dark">주소 검색</h3>
                                <button onClick={() => setIsOpenPostcode(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="h-[400px]">
                                <DaumPostcode onComplete={handleCompletePostcode} style={{ height: '100%' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
