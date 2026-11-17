"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Partner } from "@/lib/types";
import DaumPostcode from 'react-daum-postcode';
import { useQuery } from "convex/react";
import AdminDrawer from "./AdminDrawer";
import { AdminIcon } from "./AdminIcons";

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
    preferredContactTime: string; // 통화가능 시간
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

    // Query products and careProducts for dynamic home appliance options
    const productsData = useQuery(api.products.get);
    const careProductsData = useQuery(api.careProducts.get);

    const [stagedCustomers, setStagedCustomers] = useState<StagedCustomer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpenPostcode, setIsOpenPostcode] = useState(false);
    const [isCustomProduct, setIsCustomProduct] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual Entry Form State
    const [manualForm, setManualForm] = useState<StagedCustomer>({
        id: "",
        customerName: "",
        customerPhone: "",
        customerBirth: "",
        customerGender: "-",
        customerAddress: "",
        customerAddressDetail: "",
        productType: "더 해피 450 ONE",
        planType: "1",
        products: "",
        preferredContactTime: "",
        partnerMemberId: "",
        inquiry: "",
        selectedPartnerId: partner?.partnerId || partner?.loginId || "",
        selectedPartnerLoginId: partner?.loginId || partner?.partnerId || "",
        selectedPartnerName: partner?.companyName || partner?.name || "",
    });

    // Available partners (for Admin: all partners, for Partner: self + sub-partners)
    const availablePartners = useMemo(() => {
        if (isAdmin) return partners;

        const list: Partner[] = [];
        const seen = new Set<string>();

        // Add self first if available
        if (partner) {
            list.push(partner);
            if (partner.partnerId) seen.add(partner.partnerId);
            if (partner.loginId) seen.add(partner.loginId);
        }

        // Add partners passed from dashboard (which contains self + sub-partners)
        partners.forEach(p => {
            const pId = p.partnerId;
            const pLogin = p.loginId;
            const alreadyIn = (pId && seen.has(pId)) || (pLogin && seen.has(pLogin));
            if (!alreadyIn) {
                list.push(p);
                if (pId) seen.add(pId);
                if (pLogin) seen.add(pLogin);
            }
        });

        return list;
    }, [isAdmin, partners, partner]);

    // Check if sub-partners exist for logged-in partner
    const hasSubPartners = !isAdmin && availablePartners.length > 1;
    const showPartnerSelect = isAdmin || hasSubPartners;

    const isSmartCare = manualForm.productType.startsWith("스마트케어") || manualForm.productType.startsWith("스마트");
    const currentSlot = Number(manualForm.planType.replace(/[^0-9]/g, "")) || 0;

    // Filter available home appliances dynamically based on selected product & slot count
    const availableAppliances = useMemo(() => {
        if (!productsData) return [];
        const visible = productsData.filter(p => p.isVisible !== false);
        if (!isSmartCare) return visible;

        // Determine specific target care product name
        let targetPlanName = "";
        const cleanProdName = manualForm.productType.replace(/\s+/g, "");

        if (cleanProdName.includes("4더블") || (cleanProdName.includes("스마트케어4") && currentSlot === 2)) {
            targetPlanName = "스마트케어 4더블";
        } else if (cleanProdName.includes("5더블") || (cleanProdName.includes("스마트케어5") && currentSlot === 2)) {
            targetPlanName = "스마트케어 5더블";
        } else if (cleanProdName.includes("5트리플") || (cleanProdName.includes("스마트케어5") && currentSlot === 3)) {
            targetPlanName = "스마트케어 5트리플";
        } else if (cleanProdName.includes("5쿼드") || (cleanProdName.includes("스마트케어5") && currentSlot === 4)) {
            targetPlanName = "스마트케어 5쿼드";
        } else if (cleanProdName === "스마트케어5" && currentSlot === 1) {
            targetPlanName = "스마트케어 5";
        }

        if (careProductsData && targetPlanName) {
            const targetCp = careProductsData.find(cp =>
                cp.name === targetPlanName ||
                cp.name.replace(/\s+/g, "") === targetPlanName.replace(/\s+/g, "") ||
                cp.name.endsWith(targetPlanName.replace("스마트케어 ", ""))
            );
            if (targetCp) {
                const exactMatched = visible.filter(p => p.careProductId === targetCp._id);
                if (exactMatched.length > 0) {
                    return exactMatched;
                }
            }
        }

        if (currentSlot > 0) {
            const slotMatched = visible.filter(p => {
                if (p.careProductId && careProductsData) {
                    const cp = careProductsData.find(c => c._id === p.careProductId);
                    if (cp) {
                        if (targetPlanName) {
                            return cp.name === targetPlanName || cp.name.replace(/\s+/g, "") === targetPlanName.replace(/\s+/g, "");
                        }
                        return cp.slotCount === currentSlot;
                    }
                }
                return (p.slotCount || 4) === currentSlot;
            });
            if (slotMatched.length > 0) return slotMatched;
        }
        return visible;
    }, [productsData, careProductsData, isSmartCare, currentSlot, manualForm.productType]);

    // Calculate allowed product types for the selected partner (dynamically read from careProductsData)
    const allowedProductOptions = useMemo(() => {
        const selectedP = availablePartners.find(p => p.partnerId === manualForm.selectedPartnerId || p.loginId === manualForm.selectedPartnerId) || partner;
        const pGroup = selectedP?.partnerGroup || "전체 상품 판매";

        let dbList: { id: string; name: string; productType: string; slotCount: number }[] = [];

        if (careProductsData && careProductsData.length > 0) {
            dbList = careProductsData.map(cp => ({
                id: cp._id,
                name: cp.name,
                productType: cp.productType || (cp.name.includes("해피") ? "standard" : "combination"),
                slotCount: cp.slotCount || 1,
            }));
        } else {
            dbList = [
                { id: "happy450", name: "더 해피 450 ONE", productType: "standard", slotCount: 1 },
                { id: "smartcare4", name: "스마트케어4", productType: "combination", slotCount: 2 },
                { id: "smartcare5", name: "스마트케어5", productType: "combination", slotCount: 1 }
            ];
        }

        if (pGroup === "전체 상품 판매" || !pGroup.trim()) {
            return dbList;
        }

        if (pGroup === "결합 상품 판매") {
            const combi = dbList.filter(p => p.productType === "combination" || p.name.includes("스마트"));
            return combi.length > 0 ? combi : dbList;
        }

        const selectedNames = pGroup.split(",").map((s: string) => s.trim()).filter(Boolean);

        const filtered = dbList.filter(item => {
            return selectedNames.some((name: string) => {
                if (item.name === name) return true;
                if (name === "더해피450" || name === "더 해피 450 ONE") {
                    return item.name === "더해피450 ONE" || item.name === "더 해피 450 ONE";
                }
                if (name === "스마트케어4" || name === "스마트케어 4") {
                    return item.name.includes("4더블") || item.name === "스마트케어4";
                }
                if (name === "스마트케어5" || name === "스마트케어 5") {
                    return item.name === "스마트케어 5" || item.name.includes("5더블") || item.name.includes("트리플") || item.name.includes("쿼드");
                }
                return false;
            });
        });

        return filtered.length > 0 ? filtered : dbList;
    }, [careProductsData, availablePartners, manualForm.selectedPartnerId, partner]);

    // Keep manualForm.productType aligned with allowedProductOptions
    useEffect(() => {
        const optionNames = allowedProductOptions.map(o => o.name);
        if (optionNames.length > 0 && !optionNames.includes(manualForm.productType)) {
            const nextItem = allowedProductOptions[0];
            let defaultPlan = "1";
            if (nextItem.slotCount) {
                defaultPlan = String(nextItem.slotCount);
            } else if (nextItem.productType === "combination") {
                defaultPlan = "2";
            }

            setManualForm(prev => ({
                ...prev,
                productType: nextItem.name,
                planType: defaultPlan,
                products: nextItem.productType === "combination" ? prev.products : "",
            }));
        }
    }, [allowedProductOptions, manualForm.productType]);

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
        } else if (name === "productType") {
            const selectedOpt = allowedProductOptions.find(o => o.name === value);
            let defaultPlan = "1";
            if (selectedOpt?.slotCount) {
                defaultPlan = String(selectedOpt.slotCount);
            } else if (value.includes("4") || value.includes("더블")) {
                defaultPlan = "2";
            } else if (value.includes("트리플")) {
                defaultPlan = "3";
            } else if (value.includes("쿼드")) {
                defaultPlan = "4";
            }
            setManualForm(prev => ({
                ...prev,
                productType: value,
                planType: defaultPlan,
                products: (value.startsWith("스마트") || selectedOpt?.productType === "combination") ? prev.products : "",
            }));
            setIsCustomProduct(false);
            return;
        }

        // When partner is selected, also update loginId and name
        if (name === "selectedPartnerId") {
            const selectedP = availablePartners.find(p => p.partnerId === value || p.loginId === value);
            setManualForm(prev => ({
                ...prev,
                selectedPartnerId: value,
                selectedPartnerLoginId: selectedP?.loginId || value,
                selectedPartnerName: selectedP?.companyName || (selectedP as any)?.name || "",
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
        if (!manualForm.customerName.trim()) {
            alert("고객명을 입력해주세요.");
            return;
        }
        if (!manualForm.customerPhone.trim()) {
            alert("연락처를 입력해주세요.");
            return;
        }
        if (!manualForm.preferredContactTime) {
            alert("통화가능 시간을 선택해주세요.");
            return;
        }
        if (isSmartCare && !manualForm.products.trim()) {
            alert("스마트케어 상품 선택 시 가전제품은 필수 입력/선택사항입니다.");
            return;
        }

        // Partner selection determination
        let pId = partner?.partnerId || partner?.loginId || "";
        let pName = partner?.companyName || partner?.name || "";
        let pLoginId = partner?.loginId || partner?.partnerId || "";

        if (manualForm.selectedPartnerId) {
            const selectedP = availablePartners.find(p => p.partnerId === manualForm.selectedPartnerId || p.loginId === manualForm.selectedPartnerId);
            if (selectedP) {
                pId = selectedP.partnerId || selectedP.loginId || "";
                pName = selectedP.companyName || (selectedP as any).name || "";
                pLoginId = selectedP.loginId || selectedP.partnerId || "";
            }
        }

        if (isAdmin && !pId) {
            alert("파트너사를 선택해주세요.");
            return;
        }

        const newCustomer: StagedCustomer = {
            ...manualForm,
            id: Date.now().toString(),
            selectedPartnerId: pId,
            selectedPartnerName: pName,
            selectedPartnerLoginId: pLoginId
        };

        setStagedCustomers(prev => [...prev, newCustomer]);

        // Reset form but keep partner selection
        setManualForm({
            id: "",
            customerName: "",
            customerPhone: "",
            customerBirth: "",
            customerGender: "-",
            customerAddress: "",
            customerAddressDetail: "",
            productType: "더 해피 450 ONE",
            planType: "1",
            products: "",
            preferredContactTime: "",
            partnerMemberId: "",
            inquiry: "",
            selectedPartnerId: manualForm.selectedPartnerId || partner?.partnerId || partner?.loginId || "",
            selectedPartnerLoginId: manualForm.selectedPartnerLoginId || partner?.loginId || "",
            selectedPartnerName: manualForm.selectedPartnerName || partner?.companyName || partner?.name || "",
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

            if (data.length < 2) return;
            const headerRow = (data[0] || []).map((h: any) => String(h || "").trim());
            const rows = data.slice(1);

            const getCol = (keywords: string[], fallbackIdx: number) => {
                const foundIdx = headerRow.findIndex(h => keywords.some(k => h.includes(k)));
                return foundIdx !== -1 ? foundIdx : fallbackIdx;
            };

            const partnerColIdx = getCol(["파트너", "아이디", "ID", "loginId"], -1);
            const hasPartnerCol = partnerColIdx !== -1;

            const offset = (isAdmin || hasPartnerCol) ? 1 : 0;
            const nameIdx = getCol(["고객명", "성함"], 0 + offset);
            const phoneIdx = getCol(["연락처", "전화"], 1 + offset);
            const birthIdx = getCol(["생년월일"], 2 + offset);
            const genderIdx = getCol(["성별"], 3 + offset);
            const addrIdx = getCol(["주소"], 4 + offset);
            const addrDetailIdx = getCol(["상세주소"], 5 + offset);
            const prodTypeIdx = getCol(["상품유형", "상품"], 6 + offset);
            const planIdx = getCol(["구좌"], 7 + offset);
            const timeIdx = getCol(["통화가능", "희망시간", "선호시간"], 8 + offset);
            const applianceIdx = getCol(["가전제품", "가전"], 9 + offset);
            const memberIdIdx = getCol(["회원번호"], 10 + offset);
            const inquiryIdx = getCol(["문의사항"], 11 + offset);

            const newCustomers: StagedCustomer[] = [];

            rows.forEach((row, idx) => {
                let pId = partner?.partnerId || partner?.loginId || "";
                let pName = partner?.companyName || partner?.name || "";
                let pLoginId = partner?.loginId || partner?.partnerId || "";

                if (hasPartnerCol && row[partnerColIdx]) {
                    const rowPartnerVal = String(row[partnerColIdx] || "").trim();
                    let p = availablePartners.find(p =>
                        p.loginId === rowPartnerVal ||
                        p.partnerId === rowPartnerVal ||
                        p.companyName === rowPartnerVal ||
                        (p as any).name === rowPartnerVal
                    );

                    if (p) {
                        pId = p.partnerId || p.loginId;
                        pLoginId = p.loginId || p.partnerId;
                        pName = p.companyName || (p as any).name || "";
                    } else if (manualForm.selectedPartnerId) {
                        pId = manualForm.selectedPartnerId;
                        const selected = availablePartners.find(p => p.partnerId === pId || p.loginId === pId);
                        pName = selected?.companyName || (selected as any)?.name || "";
                        pLoginId = selected?.loginId || "";
                    }
                } else if (manualForm.selectedPartnerId) {
                    pId = manualForm.selectedPartnerId;
                    const selected = availablePartners.find(p => p.partnerId === pId || p.loginId === pId);
                    if (selected) {
                        pName = selected?.companyName || (selected as any)?.name || "";
                        pLoginId = selected?.loginId || "";
                    }
                }

                if (!pId && !pLoginId) return;

                const customerName = row[nameIdx];
                const customerPhone = row[phoneIdx];
                if (!customerName || !customerPhone) return;

                const prodRaw = String(row[prodTypeIdx] || "");
                const planRaw = String(row[planIdx] || "");
                let parsedProductType = "더 해피 450 ONE";
                if (prodRaw.includes("스마트케어4") || prodRaw.includes("스마트케어 4") || prodRaw.includes("smart4") || prodRaw.includes("smartcare4")) {
                    parsedProductType = "스마트케어4";
                } else if (prodRaw.includes("스마트케어5") || prodRaw.includes("스마트케어 5") || prodRaw.includes("smart5") || prodRaw.includes("smartcare5")) {
                    parsedProductType = "스마트케어5";
                } else if (prodRaw.includes("스마트케어") || prodRaw.includes("smart")) {
                    parsedProductType = (planRaw === "2") ? "스마트케어4" : "스마트케어5";
                }

                newCustomers.push({
                    id: `excel-${Date.now()}-${idx}`,
                    customerName: String(customerName),
                    customerPhone: String(customerPhone),
                    customerBirth: row[birthIdx] ? String(row[birthIdx]) : "",
                    customerGender: row[genderIdx] ? (String(row[genderIdx]).includes("여") ? "여성" : "남성") : "-",
                    customerAddress: row[addrIdx] ? String(row[addrIdx]) : "",
                    customerAddressDetail: row[addrDetailIdx] ? String(row[addrDetailIdx]) : "",
                    productType: parsedProductType,
                    planType: row[planIdx] ? String(row[planIdx]) : (parsedProductType === "스마트케어4" ? "2" : "1"),
                    preferredContactTime: row[timeIdx] ? String(row[timeIdx]) : "",
                    products: row[applianceIdx] ? String(row[applianceIdx]) : "",
                    partnerMemberId: row[memberIdIdx] ? String(row[memberIdIdx]) : "",
                    inquiry: row[inquiryIdx] ? String(row[inquiryIdx]) : "",
                    selectedPartnerId: pId,
                    selectedPartnerName: pName,
                    selectedPartnerLoginId: pLoginId
                });
            });

            setStagedCustomers(prev => [...prev, ...newCustomers]);
            if (fileInputRef.current) fileInputRef.current.value = "";
        };
        reader.readAsBinaryString(file);
    };

    const handleSave = async () => {
        if (stagedCustomers.length === 0) return;
        setIsSubmitting(true);
        try {
            // Transform StagedCustomer to API payload
            const payload = stagedCustomers.map(c => ({
                partnerId: c.selectedPartnerLoginId || c.selectedPartnerId || partner?.loginId || partner?.partnerId || "",
                // partnerName: only use companyName
                partnerName: c.selectedPartnerName || partner?.companyName || partner?.name || "",
                productType: c.productType,
                planType: c.planType ? (c.planType.includes("구좌") ? c.planType : `${c.planType}구좌`) : "1구좌",
                products: c.products,
                customerName: c.customerName,
                customerBirth: c.customerBirth,
                customerGender: c.customerGender,
                customerPhone: c.customerPhone,
                customerEmail: "", // Not in simple form
                customerAddress: `${c.customerAddress} ${c.customerAddressDetail}`.trim(),
                customerZipcode: "", // Not in simple form, maybe parse from address?
                partnerMemberId: c.partnerMemberId,
                preferredContactTime: c.preferredContactTime || "",
                inquiry: c.inquiry,
                status: "접수대기",
                accessPath: "D",
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
        <AdminDrawer
            title="고객 직접 등록"
            subtitle="개별 입력 또는 엑셀 업로드로 상담 접수 고객을 등록합니다."
            maxWidth="960px"
            zIndex={70}
            onClose={onClose}
            footerCaption={`등록 대기 ${stagedCustomers.length}명`}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="adm-btn"
                        disabled={isSubmitting}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={stagedCustomers.length === 0 || isSubmitting}
                        className="adm-btn primary"
                    >
                        <AdminIcon name="check" />
                        <span>{isSubmitting ? "저장 중..." : `${stagedCustomers.length}명 저장하기`}</span>
                    </button>
                </>
            }
        >
            <div className="space-y-5 relative">
                    {/* 1. 엑셀 일괄 등록 가이드 & 버튼 */}
                    <div className="adm-section-note !items-start justify-between flex-col sm:flex-row">
                        <div className="flex items-start gap-2.5">
                            <AdminIcon name="info" className="mt-0.5" />
                            <div className="space-y-1 text-xs">
                                <strong className="block text-[#263d36]">엑셀 일괄 등록 가이드</strong>
                                <ol className="list-decimal list-inside space-y-0.5 text-[#5a6659]">
                                    <li>[양식 다운로드] 버튼을 눌러 엑셀 파일을 다운로드합니다.</li>
                                    <li>다운로드한 파일에 고객 정보를 입력합니다. (헤더 삭제 금지)</li>
                                    {hasSubPartners && (
                                        <li>하위파트너로 등록 시 엑셀 1열의 파트너ID에 하위파트너 로그인 ID를 입력하거나, 개별 폼에서 하위파트너를 선택한 후 업로드할 수 있습니다.</li>
                                    )}
                                    <li>[엑셀 업로드] 버튼을 눌러 작성한 파일을 선택하면 자동으로 대기 목록에 추가됩니다.</li>
                                </ol>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => {
                                    window.location.assign(`/api/download-template?type=${isAdmin || hasSubPartners ? 'admin' : 'standard'}`);
                                }}
                                className="adm-btn"
                            >
                                <AdminIcon name="download" />
                                <span>양식 다운로드</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept=".xlsx, .xls"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="adm-btn sage"
                            >
                                <AdminIcon name="upload" />
                                <span>엑셀 업로드</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. 개별 입력 폼 */}
                    <div>
                        <div className="adm-section-label !mt-0">고객 개별 입력</div>
                        <div className="adm-field-grid">
                            {showPartnerSelect && (
                                <div className="adm-field">
                                    <label>{isAdmin ? "파트너사 *" : "하위파트너 지정 *"}</label>
                                    <select
                                        name="selectedPartnerId"
                                        value={manualForm.selectedPartnerId}
                                        onChange={handleManualChange}
                                        className="adm-select"
                                    >
                                        {isAdmin && <option value="">선택</option>}
                                        {availablePartners.map(p => {
                                            const isSelf = partner && (p.partnerId === (partner.partnerId || partner.loginId) || p.loginId === partner.loginId);
                                            const rolePrefix = isAdmin ? "" : (isSelf ? "[본인] " : "[하위] ");
                                            const displayName = p.companyName || (p as any).name || '파트너';
                                            const displayId = p.loginId || p.partnerId;
                                            const val = p.partnerId || p.loginId;
                                            return (
                                                <option key={val} value={val}>
                                                    {rolePrefix}{displayName} ({displayId})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}
                            <div className="adm-field">
                                <label>고객명 *</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={manualForm.customerName}
                                    onChange={handleManualChange}
                                    className="adm-input"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div className="adm-field">
                                <label>연락처 *</label>
                                <input
                                    type="text"
                                    name="customerPhone"
                                    value={manualForm.customerPhone}
                                    onChange={handleManualChange}
                                    className="adm-input font-mono"
                                    placeholder="010-0000-0000"
                                    maxLength={13}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="adm-field">
                                <label>통화가능 시간 *</label>
                                <select
                                    name="preferredContactTime"
                                    value={manualForm.preferredContactTime}
                                    onChange={handleManualChange}
                                    className="adm-select"
                                >
                                    <option value="">선택</option>
                                    <option value="10:00~11:00">10:00~11:00</option>
                                    <option value="11:00~12:00">11:00~12:00</option>
                                    <option value="14:00~15:00">14:00~15:00</option>
                                    <option value="15:00~16:00">15:00~16:00</option>
                                    <option value="16:00~17:00">16:00~17:00</option>
                                    <option value="17:00~18:00">17:00~18:00</option>
                                </select>
                            </div>
                            <div className="adm-field">
                                <label>상품 *</label>
                                <select
                                    name="productType"
                                    value={manualForm.productType}
                                    onChange={handleManualChange}
                                    className="adm-select"
                                >
                                    {allowedProductOptions.map(opt => (
                                        <option key={opt.id || opt.name} value={opt.name}>{opt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="adm-field">
                                <label>구좌 *</label>
                                <select
                                    name="planType"
                                    value={manualForm.planType}
                                    onChange={handleManualChange}
                                    className="adm-select"
                                >
                                    {(() => {
                                        const selectedItem = allowedProductOptions.find(o => o.name === manualForm.productType);
                                        const isStandard = selectedItem ? selectedItem.productType === "standard" : (!manualForm.productType.includes("스마트"));
                                        if (isStandard) {
                                            return ["1", "2", "3"].map(n => <option key={n} value={n}>{n}구좌</option>);
                                        }
                                        if (manualForm.productType.includes("4")) {
                                            return ["2"].map(n => <option key={n} value={n}>{n}구좌</option>);
                                        }
                                        return ["1", "2", "3", "4"].map(n => <option key={n} value={n}>{n}구좌</option>);
                                    })()}
                                </select>
                            </div>
                            <div className="adm-field full">
                                <label>
                                    가전제품 {isSmartCare ? '(스마트케어 필수) *' : '(스마트케어만)'}
                                </label>
                                {isSmartCare ? (
                                    <div className="space-y-1.5">
                                        {!isCustomProduct ? (
                                            <select
                                                value={manualForm.products}
                                                onChange={(e) => {
                                                    if (e.target.value === "__CUSTOM__") {
                                                        setIsCustomProduct(true);
                                                        setManualForm(prev => ({ ...prev, products: "" }));
                                                    } else {
                                                        setManualForm(prev => ({ ...prev, products: e.target.value }));
                                                    }
                                                }}
                                                className="adm-select"
                                            >
                                                <option value="">-- 가전제품 선택 ({availableAppliances.length}개) --</option>
                                                {availableAppliances.map((p: any) => {
                                                    const brand = (p.brand || "").trim();
                                                    let name = (p.name || "").trim();
                                                    const model = (p.model || "").trim();

                                                    let label = name;
                                                    if (brand) {
                                                        const brandTag = `[${brand}]`;
                                                        if (name.startsWith(brandTag)) {
                                                            label = name;
                                                        } else if (name.startsWith(brand)) {
                                                            const stripped = name.slice(brand.length).trim();
                                                            label = `${brandTag} ${stripped}`;
                                                        } else {
                                                            label = `${brandTag} ${name}`;
                                                        }
                                                    }
                                                    if (model && !label.includes(model)) {
                                                        label = `${label} (${model})`;
                                                    }

                                                    return (
                                                        <option key={p._id} value={label}>
                                                            {label}
                                                        </option>
                                                    );
                                                })}
                                                <option value="__CUSTOM__">직접 입력 (목록에 없는 경우)</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    name="products"
                                                    value={manualForm.products}
                                                    onChange={handleManualChange}
                                                    className="adm-input flex-1"
                                                    placeholder="예: 삼성 에어드레서"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomProduct(false);
                                                        setManualForm(prev => ({ ...prev, products: "" }));
                                                    }}
                                                    className="adm-btn shrink-0"
                                                >
                                                    목록에서 선택
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        name="products"
                                        value={manualForm.products}
                                        disabled={true}
                                        className="adm-input disabled:opacity-50"
                                        placeholder="스마트케어 선택 시 입력 가능"
                                    />
                                )}
                            </div>
                            <div className="adm-field">
                                <label>생년월일</label>
                                <input
                                    type="text"
                                    name="customerBirth"
                                    value={manualForm.customerBirth}
                                    onChange={handleManualChange}
                                    className="adm-input font-mono"
                                    placeholder="YYYY-MM-DD"
                                    maxLength={10}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="adm-field">
                                <label>성별</label>
                                <select
                                    name="customerGender"
                                    value={manualForm.customerGender}
                                    onChange={handleManualChange}
                                    className="adm-select"
                                >
                                    <option value="-">선택안함</option>
                                    <option value="남성">남성</option>
                                    <option value="여성">여성</option>
                                </select>
                            </div>
                            <div className="adm-field">
                                <label>주소</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="customerAddress"
                                        value={manualForm.customerAddress}
                                        readOnly
                                        onClick={() => setIsOpenPostcode(true)}
                                        className="adm-input flex-1 min-w-0 cursor-pointer"
                                        placeholder="주소 검색"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsOpenPostcode(true)}
                                        className="adm-btn shrink-0"
                                    >
                                        검색
                                    </button>
                                </div>
                            </div>
                            <div className="adm-field">
                                <label>상세주소</label>
                                <input
                                    type="text"
                                    name="customerAddressDetail"
                                    value={manualForm.customerAddressDetail}
                                    onChange={handleManualChange}
                                    className="adm-input"
                                    placeholder="상세주소를 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-3">
                            <button
                                type="button"
                                onClick={addManualCustomer}
                                className="adm-btn primary"
                            >
                                <AdminIcon name="plus" />
                                <span>대기 목록에 추가</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. 등록 대기 목록 */}
                    <div>
                        <div className="adm-section-label">
                            등록 대기 목록 ({stagedCustomers.length}명)
                        </div>
                        <div className="adm-panel overflow-hidden">
                            <div className="adm-table-scroll">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            {showPartnerSelect && <th>파트너</th>}
                                            <th>고객명</th>
                                            <th>연락처</th>
                                            <th>통화가능시간</th>
                                            <th>상품</th>
                                            <th className="text-center">구좌</th>
                                            <th className="text-right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stagedCustomers.length > 0 ? stagedCustomers.map((c) => (
                                            <tr key={c.id}>
                                                {showPartnerSelect && (
                                                    <td className="font-semibold text-xs text-[#263d36] truncate max-w-[140px]">
                                                        {c.selectedPartnerName || c.selectedPartnerLoginId || "-"}
                                                    </td>
                                                )}
                                                <td className="font-bold text-[#263d36]">{c.customerName}</td>
                                                <td className="font-mono text-xs text-[#6b7768]">{c.customerPhone}</td>
                                                <td className="text-xs text-[#6b7768]">{c.preferredContactTime || "-"}</td>
                                                <td>
                                                    <span className={`adm-pill ${c.productType.includes('스마트') ? 'teal' : 'green'}`}>
                                                        {c.productType}
                                                    </span>
                                                </td>
                                                <td className="text-xs text-center font-semibold">{c.planType}구좌</td>
                                                <td className="text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeStaged(c.id)}
                                                        className="adm-btn small danger"
                                                    >
                                                        삭제
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={showPartnerSelect ? 7 : 6} className="py-10 text-center text-xs text-[#86918a]">
                                                    등록 대기 중인 고객이 없습니다. 위에서 고객을 추가하거나 엑셀을 업로드해 주세요.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    {/* Postcode Modal */}
                    {isOpenPostcode && (
                        <div className="fixed inset-0 z-[210] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpenPostcode(false)}>
                            <div className="bg-white rounded-[14px] shadow-2xl w-full max-w-lg overflow-hidden relative border border-[#e6eae3]" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#e6eae3] bg-[#f8f9f5]">
                                    <h3 className="font-bold text-[#263d36] text-sm">주소 검색</h3>
                                    <button type="button" onClick={() => setIsOpenPostcode(false)} className="adm-icon-btn">
                                        <AdminIcon name="close" />
                                    </button>
                                </div>
                                <div className="h-[400px]">
                                    <DaumPostcode onComplete={handleCompletePostcode} style={{ height: '100%' }} />
                                </div>
                            </div>
                        </div>
                    )}
            </div>
        </AdminDrawer>
    );
}
