import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // 파트너(지사/대리점) 테이블
    partners: defineTable({
        partnerId: v.string(), // P-12345
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        managerName: v.string(),
        managerPhone: v.string(),
        managerEmail: v.string(),
        shopUrl: v.optional(v.string()),
        shopType: v.string(),
        memberCount: v.string(),
        partnerGroup: v.optional(v.string()), // 'ALL' (전체 상품 판매) | 'COMBINED' (결합 상품 판매)
        customUrl: v.string(), // 도메인/p/뒤에 붙는 url
        logoUrl: v.optional(v.string()),
        logoText: v.optional(v.string()),
        landingTitle: v.optional(v.string()),
        pointInfo: v.string(),
        brandColor: v.string(),
        loginId: v.string(),
        loginPassword: v.string(),
        status: v.string(), // 'active', 'inactive'
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
        createdAt: v.string(),
        approvedAt: v.optional(v.string()),
        approvedBy: v.optional(v.string()),
    })
        .index("by_partnerId", ["partnerId"])
        .index("by_loginId", ["loginId"])
        .index("by_customUrl", ["customUrl"])
        .index("by_parentPartnerId", ["parentPartnerId"]),

    // 고객 신청서 테이블
    applications: defineTable({
        applicationNo: v.string(), // SA-날짜-랜덤
        partnerId: v.string(),
        partnerName: v.optional(v.string()),
        productType: v.optional(v.string()),
        planType: v.optional(v.string()),
        products: v.optional(v.string()),
        customerName: v.optional(v.string()),
        customerBirth: v.optional(v.string()),
        customerGender: v.optional(v.string()),
        customerPhone: v.optional(v.string()),
        customerEmail: v.optional(v.string()),
        customerAddress: v.optional(v.string()),
        customerZipcode: v.optional(v.string()),
        partnerMemberId: v.optional(v.string()),
        preferredContactTime: v.optional(v.string()),
        inquiry: v.optional(v.string()),
        accessPath: v.optional(v.string()), // 'H' for Homepage, 'D' for Direct
        status: v.string(), // '접수', '상담중', '가입완료', '취소' 등
        assignedTo: v.optional(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
        contractDate: v.optional(v.string()),
        deliveryDate: v.optional(v.string()),
        settlement_date: v.optional(v.string()),
        settlementDate: v.optional(v.string()),
        // 추가 필드
        firstPaymentDate: v.optional(v.string()), // 초회납입일
        registrationDate: v.optional(v.string()), // 신규등록일
        paymentMethod: v.optional(v.string()), // 납입방법
        cancellationProcessing: v.optional(v.string()), // 해약처리
        withdrawalProcessing: v.optional(v.string()), // 청약철회
        remarks: v.optional(v.string()), // 비고(사유)
        statusUpdatedAt: v.optional(v.string()), // 상태값 변경일시
        duplicateConfirmed: v.optional(v.boolean()), // 중복 확인 완료 여부
        isAdditionalRegistration: v.optional(v.boolean()), // 추가 접수 여부
    })
        .index("by_applicationNo", ["applicationNo"])
        .index("by_partnerId", ["partnerId"])
        .index("by_createdAt", ["createdAt"])
        .index("by_customer_sync", ["customerName", "customerPhone", "partnerName"]),

    // 상품 테이블 
    products: defineTable({
        brand: v.string(),
        model: v.string(),
        name: v.string(),
        category: v.optional(v.string()),
        slotCount: v.optional(v.number()), // 구좌수 (2, 3, 4, 6 등)
        monthlyPayment: v.optional(v.number()), // 월 납입금
        cardDiscountPayment: v.optional(v.number()), // 카드 할인시 납입금
        image: v.string(),
        isVisible: v.optional(v.boolean()), // 노출 여부
        hasGift: v.optional(v.boolean()), // 사은품 제공 여부
        isBest: v.optional(v.boolean()), // 베스트 상품 여부
        order: v.optional(v.number()), // 정렬 순서
        promotionId: v.optional(v.union(v.id("promotions"), v.null())), // 프로모션 연결
        createdAt: v.optional(v.string()),
        updatedAt: v.optional(v.string()),
        tag: v.optional(v.string()), // Old field for compatibility during migration
    })
        .index("by_category", ["category"])
        .index("by_brand", ["brand"])
        .index("by_slotCount", ["slotCount"])
        .index("by_isVisible", ["isVisible"]),

    // 파트너 신청서 (Legacy/Backup)
    partnerApplications: defineTable({
        requestId: v.string(),
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        companyAddress: v.optional(v.string()),
        companyPhone: v.optional(v.string()),
        managerName: v.string(),
        managerDepartment: v.optional(v.string()),
        managerPhone: v.string(),
        managerEmail: v.string(),
        shopType: v.string(),
        shopUrl: v.optional(v.string()),
        monthlyVisitors: v.optional(v.string()),
        memberCount: v.optional(v.string()),
        mainProducts: v.optional(v.string()),
        expectedMonthlySales: v.optional(v.string()),
        pointRate: v.optional(v.string()),
        additionalRequest: v.optional(v.string()),
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
        status: v.string(),
        createdAt: v.string(),
        reviewedBy: v.optional(v.string()),
        reviewedAt: v.optional(v.string()),
    }),

    // 고객 (Legacy or Extra)
    customers: defineTable({
        col1: v.optional(v.string()),
        col2: v.optional(v.string()),
        col3: v.optional(v.string()),
        col4: v.optional(v.string()),
        col5: v.optional(v.string()),
        col6: v.optional(v.string()),
        col7: v.optional(v.string()),
        col8: v.optional(v.string()),
        rawData: v.optional(v.any()),
    }),

    // 파트너 신청 요청 테이블 (Active)
    partnerRequests: defineTable({
        requestId: v.string(),
        companyName: v.string(),
        businessNumber: v.string(),
        ceoName: v.string(),
        companyAddress: v.optional(v.string()),
        companyPhone: v.optional(v.string()),
        managerName: v.string(),
        managerDepartment: v.optional(v.string()),
        managerPhone: v.string(),
        managerEmail: v.string(),
        // Mall Info (Requested)
        loginId: v.optional(v.string()),
        loginPassword: v.optional(v.string()),
        customUrl: v.optional(v.string()), // Subdomain

        shopType: v.string(),
        shopUrl: v.optional(v.string()),
        partnerGroup: v.optional(v.string()),
        monthlyVisitors: v.optional(v.string()),
        memberCount: v.optional(v.string()),
        mainProducts: v.optional(v.string()),
        expectedMonthlySales: v.optional(v.string()),
        pointRate: v.optional(v.string()),
        additionalRequest: v.optional(v.string()),
        parentPartnerId: v.optional(v.string()),
        parentPartnerName: v.optional(v.string()),
        status: v.string(), // 'pending', 'approved', 'rejected'
        createdAt: v.string(),
        reviewedBy: v.optional(v.string()),
        reviewedAt: v.optional(v.string()),
    })
        .index("by_requestId", ["requestId"])
        .index("by_status", ["status"]),

    // 관리자 테이블
    admins: defineTable({
        adminId: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.string(),
        adminName: v.string(),
        lastLogin: v.optional(v.string()),
    })
        .index("by_adminId", ["adminId"])
        .index("by_email", ["email"]),

    // 상태 변경 이력 테이블
    statusHistory: defineTable({
        historyId: v.string(),
        applicationNo: v.string(),
        previousStatus: v.string(),
        newStatus: v.string(),
        changedBy: v.string(),
        changedAt: v.string(),
        memo: v.optional(v.string()),
    })
        .index("by_applicationNo", ["applicationNo"]),

    // 시스템 설정 테이블 (양식 다운로드 링크 등)
    settings: defineTable({
        key: v.string(), // 'standard_template_url', 'admin_template_url'
        value: v.string(),
        updatedAt: v.string(),
    }).index("by_key", ["key"]),

    // 자료실 테이블
    resources: defineTable({
        title: v.string(),
        description: v.optional(v.string()),
        type: v.string(), // 'image', 'video', 'file'
        fileUrl: v.string(), // Storage ID (as string) or external URL
        storageId: v.optional(v.id("_storage")),
        thumbnailUrl: v.optional(v.string()),
        thumbnailStorageId: v.optional(v.id("_storage")),
        isExternalUrl: v.boolean(), // true if fileUrl is an external link
        createdAt: v.string(),
        updatedBy: v.optional(v.string()),
    }).index("by_type", ["type"]),

    // 통계(방문자/페이지뷰) 테이블
    analytics: defineTable({
        partnerId: v.string(), // 파트너 ID (customUrl 또는 partnerId)
        date: v.string(), // YYYY-MM-DD
        path: v.string(), // 접속 경로
        visitorId: v.string(), // 방문자 식별자 (세션/쿠키 기반)
        userAgent: v.optional(v.string()),
        createdAt: v.string(),
    })
        .index("by_partnerId", ["partnerId"])
        .index("by_date", ["date"])
        .index("by_partner_date", ["partnerId", "date"])
        .index("by_path", ["path"]),

    // 프로모션 테이블
    promotions: defineTable({
        title: v.string(),
        period: v.string(),
        description: v.optional(v.string()), // 혜택 텍스트
        imageUrl: v.optional(v.string()), // 혜택 이미지 URL or Storage ID
        externalUrl: v.optional(v.string()), // 혜택 외부 링크 URL
        isActive: v.boolean(),
        createdAt: v.string(),
    }).index("by_isActive", ["isActive"]),

    // 진행 상태 설정 테이블
    applicationStatuses: defineTable({
        label: v.string(), // 표시 명칭 (예: 접수, 대기 등)
        color: v.optional(v.string()), // 테마 색상 (hex or tailwind class)
        order: v.number(), // 정렬 순서
        isActive: v.boolean(), // 활성화 여부
        isSystem: v.optional(v.boolean()), // 시스템 기본값 여부 (삭제 방지용)
        isPartnerVisible: v.optional(v.boolean()), // 파트너에게 노출 및 변경 허용 여부
    }).index("by_order", ["order"]),

    // 유지율 관리 데이터 테이블
    retentionRecords: defineTable({
        certNo: v.string(), // 증권번호
        memberNo: v.string(), // 회원번호
        joinDate: v.string(), // 가입일자
        customerName: v.string(), // 고객명
        birth: v.string(), // 생년월일
        phone: v.string(), // 휴대전화
        productName: v.string(), // 가입상품
        joinStatus: v.string(), // 가입상태
        b2bCompany: v.string(), // B2B회사명
        paymentStatus: v.string(), // 납입상태
        modelName: v.optional(v.string()), // 모델분류명
        transferDate: v.optional(v.string()), // 이체일자
        paymentMethod: v.string(), // 납입방법
        cancelStatus: v.optional(v.string()), // 해약처리
        approvalStatus: v.string(), // 승인상태
        b2bId: v.optional(v.string()), // B2B사번
        idNo: v.string(), // ID_NO (R열 - 매핑 기준)
        discountCount: v.number(), // 특별할인회차
        actualPaymentCount: v.number(), // 실납입회차
        uploadedAt: v.string(),
    }).index("by_idNo", ["idNo"]),

    // 파트너별 유지율 ID_NO 매핑 테이블
    partnerRetentionMappings: defineTable({
        partnerId: v.string(),
        idNos: v.array(v.string()), // ['김지훈', '김현진' 등]
        updatedAt: v.string(),
    }).index("by_partnerId", ["partnerId"]),

    // 유지율 관리 메모/이력 테이블
    retentionMemos: defineTable({
        customerKey: v.string(), // 고객명 + 생년월일 + 휴대전화 (고유 식별자)
        content: v.string(),
        createdBy: v.string(),
        createdAt: v.string(),
    }).index("by_customerKey", ["customerKey"]),

    // 스마트케어 상품정보 테이블
    careProducts: defineTable({
        name: v.string(), // 상품명 (예: 스마트케어 4더블)
        slotCount: v.number(), // 구좌수 (예: 4)
        target: v.string(), // 대상 (예: 일반 가전 / 대형 가전)
        monthlyPayment: v.number(), // 월 납입금 (예: 66000)
        features: v.array(v.string()), // 특장점 3개
        syncUrl: v.optional(v.string()), // 제품 동기화 URL
        paymentCount: v.optional(v.string()), // 납입회차
        defermentPeriod: v.optional(v.string()), // 거치기간
        maturityCount: v.optional(v.string()), // 만기회차
        order: v.optional(v.number()), // 정렬 순서
        createdAt: v.optional(v.string()),
        updatedAt: v.optional(v.string()),
    }).index("by_slotCount", ["slotCount"]),
});
