"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    ContractFieldDef,
    generateFilledContractPdf,
    triggerPdfDownload,
} from "@/lib/maeumPdf";
import "./maeum-econtract.css";

interface MaeumEcontractDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialPlan?: "3" | "4" | "5";
    partnerId?: string;
    partnerUrl?: string;
    partnerName?: string;
    partnerPhone?: string;
}

const PRODUCTS = [
    { key: "3" as const, name: "마음든든 3", month: 32000, total: 3072000, cnt: 96 },
    { key: "4" as const, name: "마음든든 4", month: 43000, total: 4128000, cnt: 96 },
    { key: "5" as const, name: "마음든든 5", month: 54000, total: 5184000, cnt: 96 },
];

const STEP_NAMES = ["상품 선택", "가입자 정보", "결제 정보", "약관·서명", "계약서 확인"];

const BANKS = [
    "KB국민은행",
    "신한은행",
    "우리은행",
    "하나은행",
    "NH농협은행",
    "IBK기업은행",
    "SC제일은행",
    "카카오뱅크",
    "케이뱅크",
    "토스뱅크",
    "기타 은행",
];

const CARD_BRANDS = ["국민", "농협", "하나", "삼성", "신한", "BC", "롯데"];
const WITHDRAW_DATES = ["5", "10", "15", "20", "25"];

const CMS_CLAUSES = [
    "본인은 납부하여야 할 요금에 대하여 별도의 통지 없이 본인의 지정출금계좌에서 수납기관이 정한 지정 출금일(휴일인 경우 익영업일)에 출금 대체 납부하여 주십시오.",
    "출금이체를 위하여 지정출금계좌의 예금을 출금하는 경우에는 예금약관이나 약정서의 규정에 불구하고 예금청구서나 수표 없이 출금이체 처리절차에 의하여 출금하여도 이의가 없습니다.",
    "지정계좌의 예금잔액(자동대출약정이 있는 경우 대출한도 포함)이 지정 출금일 현재 청구금액보다 부족하거나 지급제한 또는 약정대출 연체 등으로 대체 납부가 불가능한 경우의 손해는 본인의 책임으로 하겠습니다.",
    "지정 출금일에 동일한 수종의 출금이체청구가 있는 경우 출금우선순위는 출금은행이 정하는 바에 따르도록 하겠습니다.",
    "출금이체 신규신청에 의한 이체개시일은 수납기관의 사정에 의하여 결정됩니다.",
    "출금이체신청(신규, 해지)은 해당 납기일 5일 전까지 신청서를 제출하여야 합니다.",
    "출금이체 신청에 의한 지정계좌에서의 출금은 수납기관의 청구대로 출금하며, 출금요금에 이의가 있는 경우에는 본인과 수납기관이 협의하여 조정합니다.",
    "출금이체금액은 지정 출금일 은행 영업시간 내에 입금된 예금(지정 출금일에 입금된 타점권 제외)에 한하여 출금 처리됩니다.",
    "이 약관은 신청서를 수납기관에 직접 제출하여 출금이체를 신청한 경우에도 적용합니다.",
    "본 신청과 관련하여 본인은 금융거래정보를 출금이체 신규 신청 시부터 해지 신청 시까지 수납기관에 제공하는 것에 대하여 금융실명거래 및 비밀보장에 관한 법률에 따라 동의합니다.",
];

declare global {
    interface Window {
        kakao?: {
            Postcode?: new (options: {
                width?: string;
                height?: string;
                autoMapping?: boolean;
                oncomplete: (data: {
                    roadAddress?: string;
                    zonecode?: string;
                    bname?: string;
                    buildingName?: string;
                    apartment?: string;
                }) => void;
            }) => {
                embed: (el: HTMLElement, options?: { autoClose?: boolean }) => void;
            };
        };
    }
}

function won(n: number) {
    return new Intl.NumberFormat("ko-KR").format(n) + "원";
}

function formatPhoneInput(raw: string) {
    let v = raw.replace(/\D/g, "").slice(0, 11);
    if (v.length > 7) return `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
    if (v.length > 3) return `${v.slice(0, 3)}-${v.slice(3)}`;
    return v;
}

function koreaTodayYYYYMMDD() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const map = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${map.year}${map.month}${map.day}`;
}

function koreaTodayDisplay() {
    return new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
        .format(new Date())
        .replaceAll(" ", "");
}

function calcBirthAge(value: string, today = koreaTodayYYYYMMDD()): number | null {
    if (!/^[0-9]{8}$/.test(value) || value > today) return null;
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6));
    const maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (year < 1000 || month < 1 || month > 12 || day < 1 || day > maxDay) return null;
    const hadBirthday = today.slice(4) >= value.slice(4);
    return Number(today.slice(0, 4)) - year - (hadBirthday ? 0 : 1);
}

function validateBirthField(value: string, isBeneficiary: boolean) {
    const age = calcBirthAge(value);
    const tooOld = isBeneficiary && age !== null && age > 80;
    let error = "";
    if (value.length !== 8) {
        error = "생년월일을 숫자 8자리로 입력해 주세요.";
    } else if (age === null) {
        error = "오늘까지의 실제 날짜를 연월일 순서로 입력해 주세요.";
    } else if (tooOld) {
        error = `만 ${age}세 · 만 80세를 초과해 지정할 수 없습니다.`;
    }
    return { age, tooOld, error, valid: !error };
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

let postcodeScriptPromise: Promise<void> | null = null;
function loadKakaoPostcode(): Promise<void> {
    if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
    if (window.kakao?.Postcode) return Promise.resolve();
    if (postcodeScriptPromise) return postcodeScriptPromise;
    postcodeScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        const fail = () => {
            clearTimeout(timer);
            script.remove();
            postcodeScriptPromise = null;
            reject(new Error("postcode"));
        };
        const timer = setTimeout(fail, 12000);
        script.onload = () => {
            clearTimeout(timer);
            if (window.kakao?.Postcode) resolve();
            else fail();
        };
        script.onerror = fail;
        script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        document.head.append(script);
    });
    return postcodeScriptPromise;
}

export default function MaeumEcontractDrawer({
    isOpen,
    onClose,
    initialPlan = "4",
    partnerId = "",
    partnerUrl = "",
    partnerName = "",
    partnerPhone = "",
}: MaeumEcontractDrawerProps) {
    const partnerLookupKey =
        partnerId && partnerId !== "ADMIN" && !partnerId.startsWith("P-TEMP-")
            ? partnerId
            : partnerUrl && partnerUrl !== "admin"
            ? partnerUrl
            : "";

    const partnerRecord = useQuery(
        api.partners.getPartnerById,
        partnerLookupKey ? { partnerId: partnerLookupKey } : "skip"
    );
    const activeTemplate = useQuery(api.maeumContracts.getActiveTemplate);
    const generateUploadUrl = useMutation(api.maeumContracts.generateUploadUrl);
    const submitMaeumContract = useMutation(api.maeumContracts.submitMaeumContract);

    const [isSubmittingPdf, setIsSubmittingPdf] = useState(false);
    const [submittedResult, setSubmittedResult] = useState<{
        applicationNo: string;
        pdfBytes?: Uint8Array;
    } | null>(null);
    const [step, setStep] = useState(1);
    const [chosenIdx, setChosenIdx] = useState(() => {
        const idx = PRODUCTS.findIndex((p) => p.key === initialPlan);
        return idx >= 0 ? idx : 1;
    });

    // Step 2: Subscriber & Beneficiary
    const [name, setName] = useState("");
    const [birth, setBirth] = useState("");
    const [birthTouched, setBirthTouched] = useState(false);
    const [gender, setGender] = useState<"" | "남" | "여">("");
    const [phone, setPhone] = useState("");
    const [postcode, setPostcode] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [email, setEmail] = useState("");
    const [relation, setRelation] = useState("");
    const [beneficiaryBirth, setBeneficiaryBirth] = useState("");
    const [beneficiaryTouched, setBeneficiaryTouched] = useState(false);

    // Step 3: Payment
    const [pay, setPay] = useState<"cms" | "card">("cms");
    const [accountOwner, setAccountOwner] = useState("");
    const [bank, setBank] = useState("");
    const [account, setAccount] = useState("");
    const [payDate, setPayDate] = useState("");
    const [cardBrand, setCardBrand] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardMonth, setCardMonth] = useState("");
    const [cardYear, setCardYear] = useState("");

    // Step 4: Terms, Staff & Signature
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsAgree, setTermsAgree] = useState(false);
    const [consent, setConsent] = useState<"" | "agree" | "disagree">("");
    const [affiliation, setAffiliation] = useState("티유디지털");
    const [agentName, setAgentName] = useState("");
    const [agentNo, setAgentNo] = useState("");
    const [team, setTeam] = useState("");
    const [agentPhone, setAgentPhone] = useState(partnerPhone ? formatPhoneInput(partnerPhone) : "");
    const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");

    // Address modal state
    const [addrModalOpen, setAddrModalOpen] = useState(false);
    const [addrStatus, setAddrStatus] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);
    const addrMountRef = useRef<HTMLDivElement>(null);
    const addrDetailRef = useRef<HTMLInputElement>(null);
    const addrInputRef = useRef<HTMLInputElement>(null);
    const sigCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const contractRef = useRef<HTMLElement>(null);

    // Sync initialPlan when drawer opens
    useEffect(() => {
        if (isOpen) {
            const idx = PRODUCTS.findIndex((p) => p.key === initialPlan);
            if (idx >= 0) setChosenIdx(idx);
        }
    }, [isOpen, initialPlan]);

    // Sync partner info from partnerRecord or fallback props (소속은 공통 "티유디지털" 유지)
    useEffect(() => {
        const nextAgentName = partnerRecord?.managerName || "";
        const nextAgentNo = partnerRecord?.employeeNumber || "";
        const nextTeam = partnerRecord?.departmentName || "";
        const rawPhone = partnerRecord?.inquiryPhone || partnerRecord?.managerPhone || partnerPhone || "";
        const nextPhone = rawPhone ? formatPhoneInput(rawPhone) : "";

        if (nextAgentName) setAgentName((prev) => prev || nextAgentName);
        if (nextAgentNo) setAgentNo((prev) => prev || nextAgentNo);
        if (nextTeam) setTeam((prev) => prev || nextTeam);
        if (nextPhone) setAgentPhone((prev) => prev || nextPhone);
    }, [partnerRecord, partnerPhone]);

    // Lock body scroll & handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (addrModalOpen) {
                    setAddrModalOpen(false);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, addrModalOpen, onClose]);

    // Initialize signature canvas when entering Step 4
    useEffect(() => {
        if (!isOpen || step !== 4) return;
        const canvas = sigCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#28685e";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (signatureDataUrl) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = signatureDataUrl;
        }
    }, [isOpen, step]);

    // Load Kakao Postcode inside address modal
    useEffect(() => {
        if (!addrModalOpen) return;
        let cancelled = false;
        const mount = addrMountRef.current;
        if (!mount) return;
        mount.replaceChildren();
        setAddrStatus("주소 검색창을 여는 중입니다.");

        loadKakaoPostcode()
            .then(() => {
                if (cancelled || !addrMountRef.current || !window.kakao?.Postcode) return;
                setAddrStatus("");
                new window.kakao.Postcode({
                    width: "100%",
                    height: "100%",
                    autoMapping: false,
                    oncomplete(data) {
                        if (cancelled) return;
                        if (!data.roadAddress) {
                            setAddrStatus("도로명주소를 선택해 주세요.");
                            return;
                        }
                        const extraParts: string[] = [];
                        if (data.bname && /[동|로|가]$/.test(data.bname)) {
                            extraParts.push(data.bname);
                        }
                        if (data.buildingName && data.buildingName.trim() !== "") {
                            extraParts.push(data.buildingName.trim());
                        }
                        const fullRoadAddress = extraParts.length > 0
                            ? `${data.roadAddress} (${extraParts.join(", ")})`
                            : data.roadAddress;

                        if (address !== fullRoadAddress) setAddressDetail("");
                        setPostcode(data.zonecode || "");
                        setAddress(fullRoadAddress);
                        setAddrModalOpen(false);
                        setTimeout(() => addrDetailRef.current?.focus(), 60);
                    },
                }).embed(addrMountRef.current, { autoClose: false });
            })
            .catch(() => {
                if (!cancelled) {
                    setAddrStatus("검색창에 연결할 수 없습니다. 주소를 직접 입력하거나 다시 검색해 주세요.");
                }
            });

        return () => {
            cancelled = true;
        };
    }, [addrModalOpen]);

    if (!isOpen) return null;

    const currentProduct = PRODUCTS[chosenIdx];
    const birthCheck = validateBirthField(birth, false);
    const beneficiaryCheck = validateBirthField(beneficiaryBirth, true);

    const scrollTop = () => {
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };

    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = sigCanvasRef.current!;
        const r = canvas.getBoundingClientRect();
        return [
            ((e.clientX - r.left) * canvas.width) / r.width,
            ((e.clientY - r.top) * canvas.height) / r.height,
        ] as const;
    };

    const handleSigDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        canvas.setPointerCapture(e.pointerId);
        isDrawingRef.current = true;
        const [x, y] = getCanvasPoint(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const handleSigMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;
        const ctx = sigCanvasRef.current?.getContext("2d");
        if (!ctx) return;
        const [x, y] = getCanvasPoint(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const handleSigEnd = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        if (sigCanvasRef.current) {
            setSignatureDataUrl(sigCanvasRef.current.toDataURL("image/png"));
        }
    };

    const clearSignature = () => {
        const canvas = sigCanvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setSignatureDataUrl("");
    };

    const validateCurrentStep = (): boolean => {
        if (step === 1) return true;
        if (step === 2) {
            setBirthTouched(true);
            setBeneficiaryTouched(true);
            if (!name.trim()) {
                alert("가입자 성명을 입력해 주세요.");
                return false;
            }
            if (!birthCheck.valid) {
                alert(birthCheck.error);
                return false;
            }
            if (!gender) {
                alert("성별을 선택해 주세요.");
                return false;
            }
            if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
                alert("연락처를 정확히 입력해 주세요.");
                return false;
            }
            if (!address.trim()) {
                alert("도로명주소를 입력해 주세요.");
                return false;
            }
            if (!relation) {
                alert("지정인과의 관계를 선택해 주세요.");
                return false;
            }
            if (!beneficiaryCheck.valid) {
                alert(beneficiaryCheck.error);
                return false;
            }
            return true;
        }
        if (step === 3) {
            if (pay === "cms") {
                if (!accountOwner.trim()) {
                    alert("예금주 성명을 입력해 주세요.");
                    return false;
                }
                if (!bank) {
                    alert("은행명을 선택해 주세요.");
                    return false;
                }
                if (!account.trim()) {
                    alert("계좌번호를 입력해 주세요.");
                    return false;
                }
                if (!payDate) {
                    alert("출금일을 선택해 주세요.");
                    return false;
                }
            } else {
                if (!cardBrand) {
                    alert("카드사를 선택해 주세요.");
                    return false;
                }
                if (cardNumber.replace(/\D/g, "").length < 12) {
                    alert("카드번호를 정확히 입력해 주세요.");
                    return false;
                }
                if (!cardMonth || !cardYear) {
                    alert("카드 유효기간을 선택해 주세요.");
                    return false;
                }
                if (!payDate) {
                    alert("결제(출금)일을 선택해 주세요.");
                    return false;
                }
            }
            return true;
        }
        if (step === 4) {
            if (!termsAgree) {
                alert("출금이체 약관에 동의해 주세요.");
                return false;
            }
            if (consent !== "agree") {
                setConsent("disagree");
                return false;
            }
            if (!signatureDataUrl) {
                alert("계약자 서명을 입력해 주세요.");
                return false;
            }
            return true;
        }
        return true;
    };

    const handlePrintPdf = () => {
        const contractHtml = contractRef.current?.outerHTML;
        if (!contractHtml) {
            window.print();
            return;
        }
        const win = window.open("", "_blank", "width=820,height=960");
        if (!win) {
            window.print();
            return;
        }
        win.document.write(`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>마음든든 회원가입 계약서 - ${escapeHtml(name.trim() || "고객")}</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { margin: 0; font-family: "Noto Serif KR", "Noto Sans KR", Arial, sans-serif; color: #222; background: #fff; }
  .ec-contract { width: 100%; padding: 8mm 10mm; box-sizing: border-box; }
  .ec-doc-top { display: flex; justify-content: space-between; border-bottom: 2px solid #1f443e; padding-bottom: 9px; }
  .ec-doc-brand { font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; color: #1f443e; }
  .ec-doc-type { text-align: right; font-size: 10px; color: #666; }
  .ec-contract h3 { text-align: center; font-size: 20px; margin: 18px 0 14px; color: #173c37; }
  .ec-contract h4 { font-size: 12px; margin: 16px 0 7px; color: #1f443e; }
  .ec-doc-table { width: 100%; border-collapse: collapse; font: 11px/1.5 Arial, "Noto Sans KR", sans-serif; }
  .ec-doc-table th, .ec-doc-table td { border: 1px solid #cfd2cb; padding: 7px 8px; text-align: left; vertical-align: top; }
  .ec-doc-table th { background: #f2f4ef; width: 23%; font-weight: 700; }
  .ec-doc-note { font: 10px/1.65 Arial, "Noto Sans KR", sans-serif; color: #555; margin: 10px 0; }
  .ec-doc-sign { height: 52px; border: 1px solid #cfd2cb; margin-top: 6px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font: 11px Arial, "Noto Sans KR", sans-serif; }
</style>
</head>
<body>${contractHtml}</body>
</html>`);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
        }, 250);
    };

    const buildMatchedContractData = (): Record<string, any> => {
        const todayKst = koreaTodayYYYYMMDD();
        const yyyy = todayKst.slice(0, 4);
        const yy = todayKst.slice(2, 4);
        const mm = todayKst.slice(4, 6);
        const dd = todayKst.slice(6, 8);
        const beneficiaryAgeStr = beneficiaryCheck.age !== null ? String(beneficiaryCheck.age) : "";
        const staffNameAndNo = [agentName.trim(), agentNo.trim()].filter(Boolean).join(" / ");
        const resolvedProductType = `마음든든${currentProduct.key}`;

        return {
            // 표준/공통 필드
            customerName: name.trim(),
            customerBirth: birth.trim(),
            customerGender: gender,
            customerPhone: phone.trim(),
            customerEmail: email.trim(),
            customerZipcode: postcode.trim(),
            customerAddress: fullMailingAddress,
            productType: resolvedProductType,
            planType: "1구좌",
            contractDate: `${yyyy}-${mm}-${dd}`,
            partnerCompanyName: partnerRecord?.companyName || partnerName || "본사 직접 신청",
            partnerAffiliation: affiliation.trim(),
            partnerEmployeeNumber: staffNameAndNo,
            partnerDepartmentName: team.trim(),
            partnerManagerName: agentName.trim(),
            partnerPhone: agentPhone.trim(),

            // 마음든든 전자계약 전용 시맨틱 키
            beneficiaryRelation: relation,
            beneficiaryBirth: beneficiaryBirth.trim(),
            beneficiaryAge: beneficiaryAgeStr,
            paymentMethod: pay,
            cardBrand: pay === "card" ? cardBrand : "",
            cardNumber: pay === "card" ? cardNumber.trim() : "",
            cardMonth: pay === "card" ? cardMonth : "",
            cardYear: pay === "card" ? cardYear : "",
            accountOwner: pay === "cms" ? accountOwner.trim() : "",
            bankName: pay === "cms" ? bank : "",
            accountNumber: pay === "cms" ? account.trim() : "",
            payDate,
            privacyConsent: consent,
            contractYear2: yy,
            contractMonth: mm,
            contractDay: dd,

            // 현재 양식 에디터에 배치된 체크박스 매칭 (agreeCheck_1 ~ 14)
            agreeCheck_1: currentProduct.key === "3", // 마음든든 3
            agreeCheck_2: currentProduct.key === "4", // 마음든든 4
            agreeCheck_3: currentProduct.key === "5", // 마음든든 5
            agreeCheck_4: pay === "cms", // CMS 자동이체
            agreeCheck_5: pay === "card", // 카드
            agreeCheck_6: gender === "남", // 성별 남
            agreeCheck_7: gender === "여", // 성별 여
            agreeCheck_8: payDate === "5", // 결제일자 5일
            agreeCheck_9: payDate === "10", // 결제일자 10일
            agreeCheck_10: payDate === "15", // 결제일자 15일
            agreeCheck_11: payDate === "20", // 결제일자 20일
            agreeCheck_12: payDate === "25", // 결제일자 25일
            agreeCheck_13: consent === "agree", // CMS/카드 개인정보 제공 동의함
            agreeCheck_14: consent === "disagree", // CMS/카드 개인정보 제공 동의하지 않음

            // 현재 양식 에디터에 배치된 텍스트 필드 매칭 (customText_1 ~ 18)
            customText_1: relation, // 지정인 관계
            customText_2: beneficiaryAgeStr, // 지정인 나이 (만 ___ 세)
            customText_3: pay === "card" ? cardBrand : "", // 카드사
            customText_4: pay === "card" ? cardNumber.trim() : "", // 카드번호
            customText_5: pay === "card" ? cardMonth : "", // 유효기간 Month
            customText_6: pay === "card" ? cardYear : "", // 유효기간 Year
            customText_7: pay === "cms" ? accountOwner.trim() : "", // 예금주
            customText_8: pay === "cms" ? bank : "", // 은행명
            customText_9: pay === "cms" ? account.trim() : "", // 계좌번호
            customText_10: yy, // CMS 개인정보 동의 년 (20__)
            customText_11: mm, // CMS 개인정보 동의 월
            customText_12: dd, // CMS 개인정보 동의 일
            customText_13: yy, // 1p 하단 계약자 동의 년 (20__)
            customText_14: mm, // 1p 하단 계약자 동의 월
            customText_15: dd, // 1p 하단 계약자 동의 일
            customText_16: yy, // 2p 하단 계약자 동의 년 (20__)
            customText_17: mm, // 2p 하단 계약자 동의 월
            customText_18: dd, // 2p 하단 계약자 동의 일
        };
    };

    const handleSaveAndDownloadPdf = async () => {
        if (submittedResult?.pdfBytes) {
            triggerPdfDownload(
                submittedResult.pdfBytes,
                `마음든든_전자계약서_${name.trim() || "고객"}_${submittedResult.applicationNo}.pdf`
            );
            return;
        }

        if (!activeTemplate?.pdfUrl) {
            handlePrintPdf();
            return;
        }

        setIsSubmittingPdf(true);
        try {
            const fullContractData = buildMatchedContractData();
            const pdfBytes = await generateFilledContractPdf({
                templatePdfUrl: activeTemplate.pdfUrl,
                fields: (activeTemplate.fields || []) as ContractFieldDef[],
                contractData: fullContractData,
                signatureDataUrl,
            });

            let contractPdfStorageId: any = undefined;
            const uploadUrl = await generateUploadUrl();
            const uploadRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/pdf" },
                body: new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }),
            });
            if (uploadRes.ok) {
                const uploaded = await uploadRes.json();
                contractPdfStorageId = uploaded.storageId;
            }

            const res = await submitMaeumContract({
                partnerId: partnerId || "ADMIN",
                partnerName: partnerRecord?.companyName || partnerName || "본사 직접 신청",
                productType: `마음든든${currentProduct.key}`,
                planType: "1",
                customerName: name.trim(),
                customerBirth: birth.trim(),
                customerGender: gender || "-",
                customerPhone: phone.trim(),
                customerEmail: email.trim(),
                customerAddress: fullMailingAddress,
                customerZipcode: postcode.trim(),
                accessPath: partnerUrl && partnerUrl !== "admin" ? "P" : "D",
                contractTemplateId: String(activeTemplate._id),
                contractData: fullContractData,
                contractSignatureDataUrl: signatureDataUrl,
                contractPdfStorageId,
            });

            setSubmittedResult({
                applicationNo: res.applicationNo,
                pdfBytes,
            });

            triggerPdfDownload(
                pdfBytes,
                `마음든든_전자계약서_${name.trim() || "고객"}_${res.applicationNo}.pdf`
            );
        } catch (err: any) {
            console.error("Maeum contract PDF/submit error:", err);
            alert("전자계약서 PDF 생성 및 접수 중 오류가 발생했습니다: " + (err?.message || ""));
        } finally {
            setIsSubmittingPdf(false);
        }
    };

    const handleNext = () => {
        if (step === 5) {
            void handleSaveAndDownloadPdf();
            return;
        }
        if (!validateCurrentStep()) return;
        setStep((prev) => Math.min(5, prev + 1));
        scrollTop();
    };

    const handleBack = () => {
        setStep((prev) => Math.max(1, prev - 1));
        scrollTop();
    };

    const maskedAccount = account.trim()
        ? account.trim().replace(/\d(?=\d{4})/g, "•")
        : "미입력";
    const maskedCard = cardNumber.trim()
        ? cardNumber.replace(/\s/g, "").replace(/\d(?=\d{4})/g, "•")
        : "미입력";
    const fullMailingAddress = [
        postcode.trim() ? `(${postcode.trim()})` : "",
        address.trim(),
        addressDetail.trim(),
    ]
        .filter(Boolean)
        .join(" ");

    const nextButtonLabel =
        step === 1
            ? "상품 선택 완료"
            : step === 2
            ? "가입자 정보 확인"
            : step === 3
            ? "결제 정보 확인"
            : step === 4
            ? "계약서 미리보기"
            : isSubmittingPdf
            ? "계약서 PDF 생성 중..."
            : submittedResult
            ? "계약서 PDF 다시 다운로드"
            : "전자계약 접수 및 PDF 저장";

    const nextDisabled = (step === 2 && beneficiaryCheck.tooOld) || (step === 5 && isSubmittingPdf);

    return (
        <div
            className="ec-drawer-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="마음든든 전자계약"
        >
            <aside className="ec-drawer" onClick={(e) => e.stopPropagation()}>
                {/* Top Header */}
                <header className="ec-topbar">
                    <div className="ec-brand">
                        <span className="ec-brand-mark">im</span>
                        <span>
                            소노아임레디 <span style={{ color: "#c5c9bd", margin: "0 4px" }}>|</span> 마음든든
                        </span>
                    </div>
                    <button type="button" className="ec-close-btn" onClick={onClose} aria-label="전자계약 창 닫기">
                        닫기 ✕
                    </button>
                </header>

                {/* Scrollable Body */}
                <div className="ec-scroll" ref={scrollRef}>
                    <div className="ec-intro">
                        <div className="ec-eyebrow">MAEUM DEUNDEUN · E-CONTRACT</div>
                        <h1>마음든든 전자계약</h1>
                        <p>
                            가입 정보를 차례로 입력하고 계약 내용을 확인해 주세요.
                            <br />
                            약 3분이면 작성할 수 있어요.
                        </p>
                    </div>

                    {/* Stepper */}
                    <div className="ec-stepper" aria-label="진행 단계">
                        {STEP_NAMES.map((label, i) => {
                            const idx = i + 1;
                            const isDone = idx < step;
                            const isActive = idx === step;
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    className={`ec-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                                    onClick={() => {
                                        if (isDone) {
                                            setStep(idx);
                                            scrollTop();
                                        }
                                    }}
                                    disabled={!isDone}
                                >
                                    <span className="ec-dot">{idx}</span>
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <main className="ec-content">
                        {/* Step 1: Product Selection */}
                        {step === 1 && (
                            <section className="ec-panel">
                                <div className="ec-section-head">
                                    <div>
                                        <h2>가입 상품을 선택해 주세요</h2>
                                        <p>상품별 월 납입액과 총 납입금을 확인해 주세요.</p>
                                    </div>
                                    <span className="ec-small-tag">1 / 5</span>
                                </div>

                                <div className="ec-product-list">
                                    {PRODUCTS.map((p, idx) => (
                                        <button
                                            key={p.key}
                                            type="button"
                                            className={`ec-product ${chosenIdx === idx ? "selected" : ""}`}
                                            onClick={() => setChosenIdx(idx)}
                                        >
                                            <span className="ec-radio" />
                                            <span className="ec-prod-main">
                                                <span className="ec-prod-row">
                                                    <span className="ec-prod-name">{p.name}</span>
                                                    <span className="ec-price">
                                                        {won(p.month)}
                                                        <small style={{ fontSize: "10.5px", color: "#758078", fontWeight: 600 }}>
                                                            {" "}
                                                            / 월
                                                        </small>
                                                    </span>
                                                </span>
                                                <span className="ec-prod-sub">
                                                    {p.cnt}회 납입 · 총 {won(p.total)}
                                                </span>
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                <div className="ec-summary-band">
                                    <div>
                                        <div className="caption">선택한 상품</div>
                                        <strong>{currentProduct.name}</strong>
                                    </div>
                                    <div className="meta">
                                        <strong>월 {won(currentProduct.month)}</strong>
                                        <br />
                                        {currentProduct.cnt}회 납입 · 총 {won(currentProduct.total)}
                                    </div>
                                </div>

                                <div className="ec-notice">
                                    <b>가입 전 확인</b>
                                    <br />총 납입액은 월 납입금 × 96회 기준입니다. 가입상품과 최종 계약 내용을 다음 단계에서 다시 확인해 주세요.
                                </div>
                            </section>
                        )}

                        {/* Step 2: Subscriber & Beneficiary */}
                        {step === 2 && (
                            <section className="ec-panel">
                                <div className="ec-section-head">
                                    <div>
                                        <h2>가입자와 지정인을 입력해 주세요</h2>
                                        <p>계약서 작성에 필요한 기본 정보를 입력합니다.</p>
                                    </div>
                                    <span className="ec-small-tag">2 / 5</span>
                                </div>

                                <div className="ec-field-grid">
                                    <div className="ec-field">
                                        <label className="ec-label" htmlFor="ec-name">
                                            성명 <i className="ec-required">필수</i>
                                        </label>
                                        <input
                                            id="ec-name"
                                            className="ec-input"
                                            placeholder="홍길동"
                                            autoComplete="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>

                                    <div className="ec-field">
                                        <label className="ec-label" htmlFor="ec-birth">
                                            생년월일 <i className="ec-required">필수</i>
                                        </label>
                                        <input
                                            id="ec-birth"
                                            className="ec-input"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={8}
                                            placeholder="예) 19750321"
                                            value={birth}
                                            aria-invalid={(birthTouched || birth.length === 8) && !birthCheck.valid}
                                            onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                            onBlur={() => setBirthTouched(Boolean(birth))}
                                        />
                                        {(birthTouched || birth.length === 8) && birthCheck.error && (
                                            <p className="ec-birth-msg">{birthCheck.error}</p>
                                        )}
                                    </div>

                                    <div className="ec-field">
                                        <span className="ec-label">
                                            성별 <i className="ec-required">필수</i>
                                        </span>
                                        <div className="ec-radio-row">
                                            {(["남", "여"] as const).map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    className={`ec-choice-btn ${gender === g ? "selected" : ""}`}
                                                    onClick={() => setGender(g)}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="ec-field">
                                        <label className="ec-label" htmlFor="ec-phone">
                                            연락처 <i className="ec-required">필수</i>
                                        </label>
                                        <input
                                            id="ec-phone"
                                            className="ec-input"
                                            type="tel"
                                            inputMode="numeric"
                                            placeholder="010-0000-0000"
                                            autoComplete="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                                        />
                                    </div>

                                    <div className="ec-field full" style={{ display: "grid", gap: "10px" }}>
                                        <div>
                                            <label className="ec-label" htmlFor="ec-postcode">
                                                우편번호
                                            </label>
                                            <div className="ec-input-row">
                                                <input
                                                    id="ec-postcode"
                                                    className="ec-input"
                                                    inputMode="numeric"
                                                    maxLength={5}
                                                    placeholder="우편번호"
                                                    value={postcode}
                                                    onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                                                />
                                                <button
                                                    type="button"
                                                    className="ec-mini-btn"
                                                    onClick={() => setAddrModalOpen(true)}
                                                >
                                                    도로명주소 검색
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="ec-label" htmlFor="ec-address">
                                                도로명주소 (우편물 수령) <i className="ec-required">필수</i>
                                            </label>
                                            <input
                                                ref={addrInputRef}
                                                id="ec-address"
                                                className="ec-input"
                                                placeholder="도로명과 건물번호"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="ec-label" htmlFor="ec-addressDetail">
                                                상세주소
                                            </label>
                                            <input
                                                ref={addrDetailRef}
                                                id="ec-addressDetail"
                                                className="ec-input"
                                                placeholder="동·호수, 층 등 해당하는 경우 입력"
                                                value={addressDetail}
                                                onChange={(e) => setAddressDetail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="ec-field full">
                                        <label className="ec-label" htmlFor="ec-email">
                                            이메일{" "}
                                            <span style={{ fontSize: "10.5px", color: "#89948b", fontWeight: 500 }}>
                                                선택 · 계약서 교부용
                                            </span>
                                        </label>
                                        <input
                                            id="ec-email"
                                            className="ec-input"
                                            type="email"
                                            placeholder="example@email.com"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <hr className="ec-divider" />

                                <h3 className="ec-subhead">
                                    지정인 정보 <span className="ec-required">필수 · 1인</span>
                                </h3>
                                <p className="ec-subdesc">
                                    가입일 기준 만 80세 이하인 본인 또는 가족 1인을 지정해 주세요.
                                </p>

                                <div className="ec-field-grid">
                                    <div className="ec-field full">
                                        <label className="ec-label" htmlFor="ec-relation">
                                            가입자와의 관계 <i className="ec-required">필수</i>
                                        </label>
                                        <select
                                            id="ec-relation"
                                            className="ec-select"
                                            value={relation}
                                            onChange={(e) => setRelation(e.target.value)}
                                        >
                                            <option value="">관계를 선택해 주세요</option>
                                            <option value="본인">본인</option>
                                            <option value="배우자">배우자</option>
                                            <option value="직계존속">직계존속</option>
                                            <option value="직계비속">직계비속</option>
                                        </select>
                                    </div>

                                    <div className="ec-field full">
                                        <label className="ec-label" htmlFor="ec-beneficiaryBirth">
                                            지정인 생년월일 <i className="ec-required">필수</i>
                                        </label>
                                        <input
                                            id="ec-beneficiaryBirth"
                                            className="ec-input"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={8}
                                            placeholder="예) 19500321"
                                            value={beneficiaryBirth}
                                            aria-invalid={
                                                (beneficiaryTouched || beneficiaryBirth.length === 8) &&
                                                !beneficiaryCheck.valid
                                            }
                                            onChange={(e) =>
                                                setBeneficiaryBirth(e.target.value.replace(/\D/g, "").slice(0, 8))
                                            }
                                            onBlur={() => setBeneficiaryTouched(Boolean(beneficiaryBirth))}
                                        />
                                        {(beneficiaryTouched || beneficiaryBirth.length === 8) && (
                                            <p
                                                className="ec-birth-msg"
                                                data-valid={beneficiaryCheck.valid ? "true" : "false"}
                                            >
                                                {beneficiaryCheck.valid
                                                    ? `만 ${beneficiaryCheck.age}세 · 지정 가능합니다.`
                                                    : beneficiaryCheck.error}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="ec-notice">
                                    지정인 자격은 계약서 기준으로 <b>가입일 기준 만 80세 이하</b>이며, 본인·배우자·직계 존·비속 범위입니다. 등록 후 변경은 회사 절차에 따라 처리됩니다.
                                </div>
                            </section>
                        )}

                        {/* Step 3: Payment Info */}
                        {step === 3 && (
                            <section className="ec-panel">
                                <div className="ec-section-head">
                                    <div>
                                        <h2>납입 방법을 선택해 주세요</h2>
                                        <p>
                                            {pay === "cms"
                                                ? "등록한 계좌에서 매월 자동 출금됩니다."
                                                : "본인 명의의 신용·체크카드를 등록해 주세요."}
                                        </p>
                                    </div>
                                    <span className="ec-small-tag">3 / 5</span>
                                </div>

                                <div className="ec-pay-toggle">
                                    <button
                                        type="button"
                                        className={`ec-pay-card ${pay === "cms" ? "selected" : ""}`}
                                        onClick={() => setPay("cms")}
                                    >
                                        <span className="icon">↗</span>
                                        <span>
                                            <b>자동이체</b>
                                            <span>계좌에서 매월 출금</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`ec-pay-card ${pay === "card" ? "selected" : ""}`}
                                        onClick={() => setPay("card")}
                                    >
                                        <span className="icon">▰</span>
                                        <span>
                                            <b>카드 결제</b>
                                            <span>신용·체크카드</span>
                                        </span>
                                    </button>
                                </div>

                                {pay === "cms" ? (
                                    <div>
                                        <div className="ec-field-grid">
                                            <div className="ec-field">
                                                <label className="ec-label" htmlFor="ec-accountOwner">
                                                    예금주 <i className="ec-required">필수</i>
                                                </label>
                                                <input
                                                    id="ec-accountOwner"
                                                    className="ec-input"
                                                    placeholder="예금주 성명"
                                                    value={accountOwner}
                                                    onChange={(e) => setAccountOwner(e.target.value)}
                                                />
                                            </div>

                                            <div className="ec-field">
                                                <label className="ec-label" htmlFor="ec-bank">
                                                    은행명 <i className="ec-required">필수</i>
                                                </label>
                                                <select
                                                    id="ec-bank"
                                                    className="ec-select"
                                                    value={bank}
                                                    onChange={(e) => setBank(e.target.value)}
                                                >
                                                    <option value="">은행을 선택해 주세요</option>
                                                    {BANKS.map((b) => (
                                                        <option key={b} value={b}>
                                                            {b}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="ec-field full">
                                                <label className="ec-label" htmlFor="ec-account">
                                                    계좌번호 <i className="ec-required">필수</i>
                                                </label>
                                                <input
                                                    id="ec-account"
                                                    className="ec-input"
                                                    inputMode="numeric"
                                                    placeholder="숫자만 입력해 주세요"
                                                    autoComplete="off"
                                                    value={account}
                                                    onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
                                                />
                                            </div>

                                            <div className="ec-field full">
                                                <span className="ec-label">
                                                    출금일 <i className="ec-required">필수</i>
                                                </span>
                                                <div className="ec-radio-row">
                                                    {WITHDRAW_DATES.map((d) => (
                                                        <button
                                                            key={d}
                                                            type="button"
                                                            className={`ec-choice-btn ${payDate === d ? "selected" : ""}`}
                                                            onClick={() => setPayDate(d)}
                                                        >
                                                            {d}일
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ec-notice">출금일이 휴일이면 다음 영업일에 출금됩니다.</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="ec-field-grid">
                                            <div className="ec-field full">
                                                <label className="ec-label" htmlFor="ec-cardBrand">
                                                    카드사 <i className="ec-required">필수</i>
                                                </label>
                                                <select
                                                    id="ec-cardBrand"
                                                    className="ec-select"
                                                    value={cardBrand}
                                                    onChange={(e) => setCardBrand(e.target.value)}
                                                >
                                                    <option value="">카드사를 선택해 주세요</option>
                                                    {CARD_BRANDS.map((cb) => (
                                                        <option key={cb} value={cb}>
                                                            {cb}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="ec-field full">
                                                <label className="ec-label" htmlFor="ec-cardNumber">
                                                    카드번호 <i className="ec-required">필수</i>
                                                </label>
                                                <input
                                                    id="ec-cardNumber"
                                                    className="ec-input"
                                                    inputMode="numeric"
                                                    autoComplete="cc-number"
                                                    placeholder="0000 0000 0000 0000"
                                                    maxLength={19}
                                                    value={cardNumber}
                                                    onChange={(e) => {
                                                        const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                                                        setCardNumber(v.replace(/(.{4})/g, "$1 ").trim());
                                                    }}
                                                />
                                            </div>

                                            <div className="ec-field">
                                                <label className="ec-label" htmlFor="ec-cardMonth">
                                                    유효기간 월 <i className="ec-required">필수</i>
                                                </label>
                                                <select
                                                    id="ec-cardMonth"
                                                    className="ec-select"
                                                    value={cardMonth}
                                                    onChange={(e) => setCardMonth(e.target.value)}
                                                >
                                                    <option value="">월</option>
                                                    {Array.from({ length: 12 }, (_, i) => {
                                                        const m = String(i + 1).padStart(2, "0");
                                                        return (
                                                            <option key={m} value={m}>
                                                                {m}월
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div className="ec-field">
                                                <label className="ec-label" htmlFor="ec-cardYear">
                                                    유효기간 년 <i className="ec-required">필수</i>
                                                </label>
                                                <select
                                                    id="ec-cardYear"
                                                    className="ec-select"
                                                    value={cardYear}
                                                    onChange={(e) => setCardYear(e.target.value)}
                                                >
                                                    <option value="">년</option>
                                                    {Array.from({ length: 17 }, (_, i) => {
                                                        const y = String(2026 + i);
                                                        return (
                                                            <option key={y} value={y}>
                                                                {y}년
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div className="ec-field full">
                                                <span className="ec-label">
                                                    결제(출금)일 <i className="ec-required">필수</i>
                                                </span>
                                                <div className="ec-radio-row">
                                                    {WITHDRAW_DATES.map((d) => (
                                                        <button
                                                            key={d}
                                                            type="button"
                                                            className={`ec-choice-btn ${payDate === d ? "selected" : ""}`}
                                                            onClick={() => setPayDate(d)}
                                                        >
                                                            {d}일
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ec-notice">
                                            <b>본인 명의 카드만 등록할 수 있어요.</b>
                                            <br />
                                            가능 카드사: 국민 · 농협 · 하나 · 삼성 · 신한 · BC · 롯데
                                        </div>
                                    </div>
                                )}

                                <div className="ec-privacy-line">
                                    <span>🔒</span>
                                    <span>
                                        <strong>결제정보 보호</strong>
                                        <br />
                                        실제 서비스에서는 결제정보를 승인된 결제기관으로 안전하게 전달하고, 전체 카드번호·계좌번호는 화면과 저장소에 남기지 않도록 처리합니다.
                                    </span>
                                </div>
                            </section>
                        )}

                        {/* Step 4: Terms & Signature */}
                        {step === 4 && (
                            <section className="ec-panel">
                                <div className="ec-section-head">
                                    <div>
                                        <h2>약관을 확인하고 동의해 주세요</h2>
                                        <p>계약에 필요한 내용을 읽고 선택해 주세요.</p>
                                    </div>
                                    <span className="ec-small-tag">4 / 5</span>
                                </div>

                                <div className="ec-consent-block">
                                    <div className="ec-consent-title">
                                        <b>출금이체 약관</b>
                                        <button
                                            type="button"
                                            className="ec-pill"
                                            onClick={() => setTermsOpen((v) => !v)}
                                        >
                                            {termsOpen ? "접기" : "전체 보기"}
                                        </button>
                                    </div>
                                    <details
                                        className="ec-disclosure"
                                        open={termsOpen}
                                        onToggle={(e) => setTermsOpen((e.target as HTMLDetailsElement).open)}
                                    >
                                        <summary>10개 조항 펼쳐 보기</summary>
                                        <div className="ec-terms">
                                            {CMS_CLAUSES.map((clause, i) => (
                                                <p key={i}>
                                                    <b>{i + 1}.</b> {clause}
                                                </p>
                                            ))}
                                        </div>
                                    </details>
                                    <label className={`ec-checkline ${termsAgree ? "checked" : ""}`}>
                                        <input
                                            type="checkbox"
                                            checked={termsAgree}
                                            onChange={(e) => setTermsAgree(e.target.checked)}
                                        />
                                        <span>
                                            <mark className="ec-highlight-mark">
                                                출금이체 약관을 확인하고 동의합니다.
                                            </mark>{" "}
                                            <span className="ec-required">필수</span>
                                        </span>
                                    </label>
                                </div>

                                <div className="ec-consent-block">
                                    <div className="ec-consent-title">
                                        <b>CMS이체 및 카드자동결제 개인정보 제공</b>
                                    </div>
                                    <p className="ec-consent-copy">
                                        제공받는 자: 금융결제원 / ㈜NICE정보통신 / ㈜KIS정보통신
                                        <br />
                                        항목: 예금주·은행명·계좌번호·연락처·생년월일/성별 또는 카드주·카드사·카드번호·유효기간·연락처
                                        <br />
                                        목적: CMS 자동이체 및 카드 자동결제 (주계약서비스 대금 / 결합제품 할부대금 납부)
                                        <br />
                                        기간: ㈜소노스테이션 서비스 탈퇴 시까지
                                    </p>
                                    <div className="ec-consent-actions">
                                        <button
                                            type="button"
                                            className={`ec-pill ec-agree-btn ${consent === "agree" ? "on" : ""}`}
                                            onClick={() => setConsent("agree")}
                                        >
                                            ✓ 동의함
                                        </button>
                                        <button
                                            type="button"
                                            className={`ec-pill ec-disagree-btn ${consent === "disagree" ? "on" : ""}`}
                                            onClick={() => setConsent("disagree")}
                                        >
                                            동의하지 않음
                                        </button>
                                    </div>
                                    {consent === "disagree" && (
                                        <div className="ec-error">
                                            동의하지 않으면 CMS이체 및 카드 자동결제를 이용할 수 없어 계약을 진행할 수 없습니다.
                                        </div>
                                    )}
                                    <p className="ec-consent-copy">
                                        동의를 거부할 권리가 있으며, 거부 시 CMS이체 및 카드 자동결제 이용이 불가합니다.
                                    </p>
                                </div>

                                <div className="ec-staff-box">
                                    <h3 className="ec-subhead" style={{ justifyContent: "space-between" }}>
                                        <span>모집인 정보</span>
                                        {partnerRecord && (
                                            <span style={{ fontSize: "10px", fontWeight: 700, color: "#28685e", background: "#e8f1eb", padding: "2px 7px", borderRadius: "999px" }}>
                                                파트너 정보 연동됨
                                            </span>
                                        )}
                                    </h3>
                                    <div className="ec-field-grid">
                                        <div className="ec-field">
                                            <label className="ec-label" htmlFor="ec-affiliation">
                                                소속
                                            </label>
                                            <input
                                                id="ec-affiliation"
                                                className="ec-input"
                                                placeholder="소속 회사"
                                                value={affiliation}
                                                onChange={(e) => setAffiliation(e.target.value)}
                                            />
                                        </div>
                                        <div className="ec-field">
                                            <label className="ec-label" htmlFor="ec-agentName">
                                                직원명
                                            </label>
                                            <input
                                                id="ec-agentName"
                                                className="ec-input"
                                                placeholder="직원명"
                                                value={agentName}
                                                onChange={(e) => setAgentName(e.target.value)}
                                            />
                                        </div>
                                        <div className="ec-field">
                                            <label className="ec-label" htmlFor="ec-agentNo">
                                                사원번호
                                            </label>
                                            <input
                                                id="ec-agentNo"
                                                className="ec-input"
                                                placeholder="사원번호"
                                                value={agentNo}
                                                onChange={(e) => setAgentNo(e.target.value)}
                                            />
                                        </div>
                                        <div className="ec-field">
                                            <label className="ec-label" htmlFor="ec-team">
                                                부서(팀)명
                                            </label>
                                            <input
                                                id="ec-team"
                                                className="ec-input"
                                                placeholder="부서 또는 팀"
                                                value={team}
                                                onChange={(e) => setTeam(e.target.value)}
                                            />
                                        </div>
                                        <div className="ec-field full">
                                            <label className="ec-label" htmlFor="ec-agentPhone">
                                                연락처
                                            </label>
                                            <input
                                                id="ec-agentPhone"
                                                className="ec-input"
                                                type="tel"
                                                placeholder="010-0000-0000"
                                                value={agentPhone}
                                                onChange={(e) => setAgentPhone(formatPhoneInput(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: "17px" }}>
                                    <div className="ec-label">
                                        계약자 서명 <i className="ec-required">필수</i>
                                    </div>
                                    <p className="ec-subdesc">
                                        화면에 손가락 또는 마우스로 서명해 주세요. 계약서 확인 단계에 서명 완료 여부가 표시됩니다.
                                    </p>
                                    <div className="ec-signature-box">
                                        <canvas
                                            ref={sigCanvasRef}
                                            width={800}
                                            height={220}
                                            onPointerDown={handleSigDown}
                                            onPointerMove={handleSigMove}
                                            onPointerUp={handleSigEnd}
                                            onPointerCancel={handleSigEnd}
                                        />
                                        <div className="ec-sign-foot">
                                            <span>여기에 서명해 주세요</span>
                                            <button type="button" className="ec-text-btn" onClick={clearSignature}>
                                                다시 쓰기
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="ec-notice">
                                    계약일자는 서명 완료 시 자동 입력됩니다. 계약자명은 가입자 성명으로 자동 반영됩니다.
                                </div>
                            </section>
                        )}

                        {/* Step 5: Contract Preview */}
                        {step === 5 && (
                            <section className="ec-panel">
                                <div className="ec-success">
                                    <div className="ec-success-icon">✓</div>
                                    <h2>계약 내용을 확인해 주세요</h2>
                                    <p>
                                        작성한 정보로 계약서 미리보기를 만들었습니다.
                                        <br />
                                        내용을 확인한 뒤 PDF로 저장할 수 있습니다.
                                    </p>
                                </div>

                                <div className="ec-contract-wrap">
                                    <article className="ec-contract" ref={contractRef}>
                                        <div className="ec-doc-top">
                                            <div className="ec-doc-brand">im READY · SONO STATION</div>
                                            <div className="ec-doc-type">
                                                회사 제출용 · VER. 2026.10
                                                <br />
                                                회원번호 __________________
                                            </div>
                                        </div>

                                        <h3>마음든든 회원가입 계약서</h3>

                                        <table className="ec-doc-table">
                                            <tbody>
                                                <tr>
                                                    <th>가입 상품</th>
                                                    <td>{currentProduct.name}</td>
                                                    <th>상품 금액</th>
                                                    <td>{won(currentProduct.total)}</td>
                                                </tr>
                                                <tr>
                                                    <th>월 납입금 / 회차</th>
                                                    <td>
                                                        {won(currentProduct.month)} × {currentProduct.cnt}회
                                                    </td>
                                                    <th>납입방법</th>
                                                    <td>{pay === "cms" ? "CMS(통장 자동이체)" : "카드 자동결제"}</td>
                                                </tr>
                                                <tr>
                                                    <th>가입자 성명</th>
                                                    <td>{name.trim() || "미입력"}</td>
                                                    <th>생년월일 / 성별</th>
                                                    <td>
                                                        {birth.trim() || "미입력"} / {gender || "미입력"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>연락처</th>
                                                    <td>{phone.trim() || "미입력"}</td>
                                                    <th>이메일</th>
                                                    <td>{email.trim() || "미입력"}</td>
                                                </tr>
                                                <tr>
                                                    <th>주소 (우편물 수령)</th>
                                                    <td colSpan={3}>{fullMailingAddress || "미입력"}</td>
                                                </tr>
                                                <tr>
                                                    <th>지정인 관계</th>
                                                    <td>{relation || "미입력"}</td>
                                                    <th>지정인 나이</th>
                                                    <td>
                                                        {beneficiaryCheck.age !== null
                                                            ? `만 ${beneficiaryCheck.age}세`
                                                            : "미입력"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>결제정보</th>
                                                    <td colSpan={3}>
                                                        {pay === "cms" ? (
                                                            <>
                                                                <b>자동이체</b>
                                                                <br />
                                                                예금주 {accountOwner.trim() || "미입력"} · {bank || "미입력"}
                                                                <br />
                                                                계좌 {maskedAccount} · 매월 {payDate || "-"}일
                                                            </>
                                                        ) : (
                                                            <>
                                                                <b>카드 자동결제</b>
                                                                <br />
                                                                {cardBrand || "미입력"} · {maskedCard}
                                                                <br />
                                                                유효기간 {cardMonth || "--"} / {cardYear || "----"} · 매월 {payDate || "-"}일
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <h4>지정인 정보 확인</h4>
                                        <p className="ec-doc-note">
                                            가입일 기준 만 80세 이하, 본인·배우자·직계 존·비속 중 1인을 지정합니다. 지정인 관계 및 연령 확인을 위해 필요한 정보 제공에 동의합니다.
                                        </p>

                                        <h4>출금이체 약관 / 개인정보 제공 동의</h4>
                                        <p className="ec-doc-note">
                                            출금이체 약관 10개 조항을 확인했습니다: {termsAgree ? "동의함" : "미동의"}
                                            <br />
                                            CMS이체 및 카드 자동결제 개인정보 제공: {consent === "agree" ? "동의함" : "미동의"}
                                            <br />
                                            제공받는 자: 금융결제원 / ㈜NICE정보통신 / ㈜KIS정보통신
                                        </p>

                                        <table className="ec-doc-table">
                                            <tbody>
                                                <tr>
                                                    <th>소속</th>
                                                    <td>{affiliation.trim() || "미입력"}</td>
                                                    <th>직원명 / 사원번호</th>
                                                    <td>
                                                        {agentName.trim() || "미입력"} / {agentNo.trim() || "미입력"}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>부서(팀)명</th>
                                                    <td>{team.trim() || "미입력"}</td>
                                                    <th>연락처</th>
                                                    <td>{agentPhone.trim() || "미입력"}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p className="ec-doc-note" style={{ textAlign: "center", marginTop: "18px" }}>
                                            위 내용을 확인하고 계약을 신청합니다.
                                        </p>

                                        <table className="ec-doc-table">
                                            <tbody>
                                                <tr>
                                                    <th>계약일자</th>
                                                    <td>{koreaTodayDisplay()}</td>
                                                    <th>계약자명</th>
                                                    <td>{name.trim() || "미입력"}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="ec-doc-sign">
                                            <span>서명 (날인)</span>
                                            {signatureDataUrl ? (
                                                <img
                                                    src={signatureDataUrl}
                                                    alt="계약자 서명"
                                                    style={{ width: "115px", height: "40px", objectFit: "contain" }}
                                                />
                                            ) : (
                                                <span>(전자서명 영역)</span>
                                            )}
                                        </div>

                                        <p className="ec-doc-note">주식회사 소노스테이션</p>
                                    </article>
                                </div>

                                {submittedResult ? (
                                    <div className="ec-notice" style={{ marginTop: "12px", background: "#eef6f1", borderColor: "#b8d6c4", color: "#193f39" }}>
                                        <b>전자계약 접수가 완료되었습니다.</b>
                                        <br />
                                        신청번호: <strong>{submittedResult.applicationNo}</strong> · 등록된 계약서 PDF 양식에 입력값과 서명이 반영되어 저장되었습니다.
                                    </div>
                                ) : (
                                    <p className="ec-pdf-note">
                                        {activeTemplate?.pdfUrl
                                            ? "전자계약 접수 및 PDF 저장 버튼을 누르면 등록된 계약서 PDF 양식 위치에 입력값과 서명이 자동 매칭되어 접수 및 다운로드됩니다."
                                            : "이 화면은 전자계약 입력 및 미리보기 화면입니다. PDF로 저장하기를 누르면 작성된 계약서 양식을 인쇄 또는 PDF로 저장할 수 있습니다."}
                                    </p>
                                )}
                            </section>
                        )}
                    </main>
                </div>

                {/* Sticky Footer Bar */}
                <footer className="ec-footbar">
                    <div className="ec-bar-inner">
                        {step > 1 && step < 5 && (
                            <button
                                type="button"
                                className="ec-back-btn"
                                onClick={handleBack}
                                aria-label="이전 단계"
                            >
                                ←
                            </button>
                        )}
                        <button
                            type="button"
                            className="ec-primary-btn"
                            onClick={handleNext}
                            disabled={nextDisabled}
                        >
                            {nextButtonLabel}
                        </button>
                    </div>
                    <div className="ec-bar-hint">
                        {step === 5
                            ? "계약일자 · 계약자명 · 서명 내용을 확인해 주세요"
                            : `가입 정보가 안전하게 보호되는지 확인하며 진행해 주세요 · ${step}/4`}
                    </div>
                    <div className="ec-tabstrip">
                        {STEP_NAMES.map((_, i) => (
                            <span key={i} className={i === step - 1 ? "on" : ""} />
                        ))}
                    </div>
                </footer>

                {/* Address Search Dialog inside Drawer */}
                {addrModalOpen && (
                    <div
                        className="ec-addr-modal-backdrop"
                        onClick={() => setAddrModalOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ec-lookup-title"
                    >
                        <div className="ec-addr-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="ec-addr-head">
                                <h3 id="ec-lookup-title">도로명주소 검색</h3>
                                <button
                                    type="button"
                                    className="ec-text-btn"
                                    onClick={() => setAddrModalOpen(false)}
                                >
                                    닫기
                                </button>
                            </div>
                            {addrStatus && (
                                <p className="ec-addr-status" role="status">
                                    {addrStatus}
                                </p>
                            )}
                            <div className="ec-addr-mount" ref={addrMountRef} />
                            <div className="ec-addr-footer">
                                <button
                                    type="button"
                                    className="ec-mini-btn"
                                    onClick={() => {
                                        setAddrModalOpen(false);
                                        setTimeout(() => addrInputRef.current?.focus(), 60);
                                    }}
                                >
                                    주소 직접 입력
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
}
