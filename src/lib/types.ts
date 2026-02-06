// 타입 정의

// 파트너 정보

export interface Partner {
    partnerId: string;
    companyName: string;
    businessNumber: string;
    ceoName: string;
    managerName: string;
    managerPhone: string;
    managerEmail: string;
    shopUrl: string;
    shopType: string;
    memberCount: string;
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
    createdAt: string;
    approvedAt: string;
    approvedBy: string;
}

// 고객 신청 정보
export interface Application {
    applicationNo: string;
    partnerId: string;
    partnerName: string;
    productType: 'happy450' | 'smartcare';
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
    status: ApplicationStatus;
    assignedTo: string;
    createdAt: string;
    updatedAt: string;
    contractDate?: string;
    deliveryDate?: string;
    settlementDate?: string;
}

// 계약 상태
export type ApplicationStatus =
    | '접수'
    | '상담중'
    | '부재'
    | '거부'
    | '접수취소'
    | '계약완료'
    | '1회출금완료'
    | '배송완료'
    | '정산완료'
    | '청약철회'
    | '해약완료';

// 상태 변경 이력
export interface StatusHistory {
    historyId: string;
    applicationNo: string;
    previousStatus: ApplicationStatus;
    newStatus: ApplicationStatus;
    changedBy: string;
    changedAt: string;
    memo: string;
}

// 정산 내역
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

// 관리자 계정
export interface Admin {
    adminId: string;
    adminName: string;
    email: string;
    password: string;
    role: 'super' | 'normal';
    createdAt: string;
    lastLogin: string;
}

// 파트너 신청 대기
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
    monthlyVisitors: string;
    memberCount: string;
    mainProducts: string;
    expectedMonthlySales: string;
    pointRate: string;
    additionalRequest: string;
    pointsInfo?: string; // For backward compatibility if needed
    parentPartnerId?: string;
    parentPartnerName?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    reviewedBy?: string;
    reviewedAt?: string;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 파트너 신청 폼 데이터
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

// 고객 신청 폼 데이터
export interface CustomerApplyFormData {
    partnerId: string;
    partnerName: string;
    productType: 'happy450' | 'smartcare';
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
