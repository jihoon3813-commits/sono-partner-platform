export interface SmsTemplate {
    id: string;
    title: string;
    content: string;
}

export const DEFAULT_AUTO_APPLY_TITLE = "[소노아임레디] 상담 접수 완료 안내";

export const DEFAULT_AUTO_APPLY_MESSAGE = `[소노아임레디] {고객명}님, 상담 신청이 정상적으로 접수 완료되었습니다.

■ 신청 상품: {상품명}
■ 사은품 내역: {사은품}

잠시 후 전담 상담사가 [010-2666-0883] 번호로 상담 안내 전화를 드릴 예정입니다.
원활한 안내를 위해 010-2666-0883 전화를 꼭 받아주시기 바랍니다.

감사합니다.`;

export const DEFAULT_ECONTRACT_REQUEST_TITLE = "[소노아임레디] 마음든든 전자계약 서명 안내";

export const DEFAULT_ECONTRACT_REQUEST_MESSAGE = `[소노아임레디] {고객명}님, {상품명} 전자계약 서명 안내드립니다.

아래 링크를 눌러 모바일에서 간편하게 전자계약 서명을 진행해 주세요.
▶ 전자계약 바로가기: {계약링크}

※ 전자계약 완료 후 당일 혹은 익일에 [1644-8399] 번호로 가입 해피콜 안내 전화가 나갈 예정입니다.
1644-8399 전화를 꼭 받아주셔야 최종 계약이 완료됩니다.

감사합니다.`;

export const DEFAULT_ECONTRACT_COMPLETE_TITLE = "[소노아임레디] 마음든든 전자계약 완료 안내";

export const DEFAULT_ECONTRACT_COMPLETE_MESSAGE = `[소노아임레디] {고객명}님, {상품명} 전자계약 서명이 정상적으로 완료되었습니다.

■ 접수번호: {접수번호}

전자계약 완료 후 당일 혹은 익일에 [1644-8399] 번호로 가입 해피콜 안내 전화가 나갈 예정입니다.
1644-8399 전화를 꼭 받아주셔야 최종 계약이 완료되오니 수신 부탁드립니다.

감사합니다.`;

export const DEFAULT_SMS_TEMPLATES: SmsTemplate[] = [
    {
        id: "apply_confirm",
        title: "① 접수 완료 · 010-2666-0883 전화 안내",
        content: `[소노아임레디] {고객명}님, 상담 신청이 정상적으로 접수 완료되었습니다.

■ 신청 상품: {상품명}
■ 사은품 내역: {사은품}

잠시 후 전담 상담사가 [010-2666-0883] 번호로 상담 안내 전화를 드릴 예정입니다.
원활한 상담 진행을 위해 010-2666-0883 전화를 꼭 받아주시기 바랍니다.

문의사항이 있으시면 언제든 이 번호로 답장 주세요!`,
    },
    {
        id: "product_guide",
        title: "② 상품 · 결합 혜택 상세 안내",
        content: `[소노아임레디] {고객명}님, 신청하신 {상품명} 안내드립니다.

■ 신청 상품: {상품명} ({구좌})
■ 사은품 혜택: {사은품}

담당 상담사가 010-2666-0883 번호로 연락드려 월 납입금, 제휴카드 할인 및 사은품 지급 일정을 자세히 안내해 드리겠습니다.

편하신 통화 시간이 있으시면 답장으로 남겨주세요!`,
    },
    {
        id: "missed_call",
        title: "③ 부재중 · 재통화 요청 안내",
        content: `[소노아임레디] {고객명}님, 안녕하세요.

신청하신 {상품명} 상담 안내를 위해 [010-2666-0883]으로 연락드렸으나 부재중이셔서 문자 남깁니다.

■ 사은품 내역: {사은품}

010-2666-0883 번호로 다시 전화드리거나, 통화 가능하신 시간대를 답장으로 남겨주시면 맞춰서 연락드리겠습니다.

감사합니다.`,
    },
    {
        id: "gift_notice",
        title: "④ 사은품 증정 · 가입 진행 안내",
        content: `[소노아임레디] {고객명}님, 가입 진행 및 사은품 안내드립니다.

■ 진행 상품: {상품명}
■ 선택 사은품: {사은품}

정상 가입 및 초회 납입 확인 후 안내드린 일정에 맞춰 사은품이 발송됩니다.
궁금하신 점은 010-2666-0883 또는 본 문자로 문의 부탁드립니다.`,
    },
    {
        id: "contract_guide",
        title: "⑤ 녹취 · 전자서명 완료 안내",
        content: `[소노아임레디] {고객명}님, {상품명} 가입 접수가 정상 진행 중입니다.

추가 확인이나 서류 안내가 필요할 경우 010-2666-0883 번호로 연락드릴 예정이오니 전화 수신 부탁드립니다.

항상 최선을 다하는 소노아임레디가 되겠습니다. 감사합니다.`,
    },
];

export function formatSmsProductLabel(productType?: string, products?: string): string {
    const raw = (productType || "").trim();
    const lower = raw.toLowerCase();
    let label = raw || "소노아임레디 상조";
    if (lower === "happy450" || lower.includes("해피") || lower.includes("happy")) {
        label = "더 해피 450 ONE";
    } else if (lower.includes("스마트케어(광고)")) {
        label = raw;
    } else if (lower.includes("스마트케어4") || lower.includes("smartcare4") || lower.includes("smart4")) {
        label = "스마트케어 4";
    } else if (lower.includes("스마트케어5") || lower.includes("smartcare5") || lower.includes("smart5")) {
        label = "스마트케어 5";
    } else if (lower === "smartcare" || lower.includes("스마트") || lower.includes("smart")) {
        label = "스마트케어";
    } else if (lower === "maeum" || lower.includes("마음든든")) {
        label = raw.includes("마음든든") ? raw : "마음든든";
    }

    const trimmedProducts = (products || "").trim();
    if (trimmedProducts && trimmedProducts !== "-" && !label.includes(trimmedProducts)) {
        return `${label} (${trimmedProducts})`;
    }
    return label;
}

export function resolveSmsTemplateText(
    template: string,
    app: {
        customerName?: string;
        productType?: string;
        products?: string;
        selectedGift?: string;
        planType?: string;
        applicationNo?: string;
    }
): string {
    const safeName = (app.customerName || "고객").trim() || "고객";
    const productLabel = formatSmsProductLabel(app.productType, app.products);
    const giftLabel = (app.selectedGift || "").trim() || "상담 시 맞춤 사은품 안내";
    const rawPlan = (app.planType || "1구좌").trim();
    const planLabel = rawPlan.includes("구좌") ? rawPlan : `${rawPlan}구좌`;

    return template
        .replaceAll("{고객명}", safeName)
        .replaceAll("{상품명}", productLabel)
        .replaceAll("{사은품}", giftLabel)
        .replaceAll("{구좌}", planLabel)
        .replaceAll("{접수번호}", app.applicationNo || "");
}
