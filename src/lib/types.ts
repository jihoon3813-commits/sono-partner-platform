// ????뺤쓽

// ?뚰듃???뺣낫

export interface Partner {
    partnerId: string;
    companyName: string;
    businessNumber: string;
    ceoName: string;
    managerName: string;
    managerPhone: string;
    managerEmail: string;
    inquiryPhone?: string;
    shopUrl: string;
    shopType: string;
    memberCount: string;
    partnerGroup?: string;
    showLandingUrl?: boolean;
    landingVisibility?: {
        smartcare?: boolean;
        happy450?: boolean;
        maeum?: boolean;
    };
    customUrl: string;
    logoUrl: string;
    logoText?: string;
    landingTitle?: string;
    pointInfo: string;
    brandColor: string;
    loginId: string;
    loginPassword: string;
    status: 'active' | 'inactive' | 'pending';
    parentPartnerId?: string;
    parentPartnerName?: string;
    role?: string; // 'master' | 'tm'
    sonoAuthCode?: string; // ?뚮끂?묒닔 ?몄쬆肄붾뱶 (?? BIZI0011)
    affiliation?: string; // ?뚯냽
    employeeNumber?: string; // ?ъ썝踰덊샇
    departmentName?: string; // 遺???)紐?
    createdAt: string;
    approvedAt: string;
    approvedBy: string;
}

// 怨좉컼 ?좎껌 ?뺣낫
export interface Application {
    applicationNo: string;
    _id?: string;
    partnerId: string;
    partnerName: string;
    productType: 'happy450' | 'smartcare' | 'maeum' | string;
    planType: string;
    products?: string;
    customerName: string;
    customerBirth: string;
    customerGender: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    customerZipcode: string;
    partnerMemberId: string;
    preferredContactTime: string;
    inquiry: string;
    accessPath?: string;
    status: ApplicationStatus;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
    contractDate?: string;
    deliveryDate?: string;
    settlementDate?: string;
    firstPaymentDate?: string;
    registrationDate?: string;
    paymentMethod?: string;
    cancellationProcessing?: string;
    withdrawalProcessing?: string;
    remarks?: string;
    statusUpdatedAt?: string;
    duplicateConfirmed?: boolean;
    isAdditionalRegistration?: boolean;
    hasDuplicate?: boolean;
    sonoRegisterStatus?: string; // 'SUCCESS' | 'DUPLICATE' | 'FAILED'
    sonoRegisteredAt?: string;
    sonoRegisterMessage?: string;
    sonoAuthCodeUsed?: string;
    contractTemplateId?: string;
    contractData?: Record<string, any>;
    contractSignatureDataUrl?: string;
    contractPdfStorageId?: string;
    contractSignedAt?: string;
    selectedGift?: string;
    selectedGiftId?: string;
    googleContactsSyncedAt?: number;
}

// 怨꾩빟 ?곹깭 (吏꾪뻾?곹깭 ?ㅼ젙?먯꽌 ?숈쟻?쇰줈 愿由щ맖)
export type ApplicationStatus = string;
/* ?댁쟾 ?섎뱶肄붾뵫??媛믩뱾:
    | '?묒닔?湲?
    | '?묒닔?꾨즺'
    | '遺??
    | '蹂대쪟'
    | '嫄곕?'
    | '?묒닔痍⑥냼'
    | '?뺤긽媛??
    | '諛곗넚?꾨즺'
    | '泥?빟泥좏쉶'
    | '?댁빟'
    | '遺덇?'
    | '?뱀랬?꾨즺(異쒓툑?뺤씤以?'
    | '?뺤궛?꾨즺';
*/

// ?곹깭 蹂寃??대젰
export interface StatusHistory {
    historyId: string;
    applicationNo: string;
    previousStatus: ApplicationStatus;
    newStatus: ApplicationStatus;
    changedBy: string;
    changedAt: string;
    memo: string;
}

// ?뺤궛 ?댁뿭
export interface Settlement {
    settlementId: string;
    partnerId: string;
    settlementMonth: string;
    contractCount: number;
    totalAmount: number;
    commissionRate: number;
    deduction: number;
    netAmount: number;
    settlementDate: string;
    status: 'pending' | 'processing' | 'completed';
    createdAt: string;
}

// 愿由ъ옄 怨꾩젙
export interface Admin {
    adminId: string;
    adminName: string;
    email: string;
    password: string;
    role: 'super' | 'normal';
    createdAt: string;
    lastLogin: string;
}

// ?뚰듃???좎껌 ?湲?
export interface PartnerRequest {
    requestId: string;
    companyName: string;
    businessNumber: string;
    ceoName: string;
    companyAddress: string;
    companyPhone: string;
    managerName: string;
    managerDepartment: string;
    managerPhone: string;
    managerEmail: string;
    // Mall Info
    loginId?: string;
    loginPassword?: string;
    customUrl?: string;

    shopType: string;
    shopUrl: string;
    partnerGroup?: string;
    monthlyVisitors: string;
    memberCount: string;
    mainProducts: string;
    expectedMonthlySales: string;
    pointRate: string;
    additionalRequest: string;
    pointsInfo?: string; // For backward compatibility if needed
    parentPartnerId?: string;
    parentPartnerName?: string;
    status: 'pending' | 'approved' | 'rejected' | 'hold';
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
}

// API ?묐떟 ???
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ?뚰듃???좎껌 ???곗씠??
export interface PartnerApplyFormData {
    companyName: string;
    businessNumber: string;
    ceoName: string;
    companyAddress: string;
    companyPhone: string;
    managerName: string;
    managerDepartment: string;
    managerPhone: string;
    managerEmail: string;
    // Mall Info
    loginId?: string;
    loginPassword?: string;
    customUrl?: string;

    shopType: string;
    shopUrl: string;
    monthlyVisitors: string;
    memberCount: string;
    mainProducts: string;
    expectedMonthlySales: string;
    pointRate: string;
    additionalRequest: string;
    privacyAgreed: boolean;
}

// 怨좉컼 ?좎껌 ???곗씠??
export interface CustomerApplyFormData {
    partnerId: string;
    partnerName: string;
    productType: 'happy450' | 'smartcare' | 'maeum' | string;
    planType: string;
    products?: string;
    name: string;
    birthdate: string;
    gender: string;
    phone: string;
    email: string;
    zipcode: string;
    address: string;
    addressDetail: string;
    partnerId_member: string;
    preferredTime: string;
    inquiry: string;
    privacyAgreed: boolean;
}

// 怨좉컼 ?곷떞 ?뱀랬 ?뚯꽦?뚯씪 ?뺣낫
export interface Recording {
    _id: string;
    applicationNo: string;
    storageId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    duration?: number;
    uploadedAt: string;
    uploadedBy?: string;
    memo?: string;
    url?: string | null;
}

