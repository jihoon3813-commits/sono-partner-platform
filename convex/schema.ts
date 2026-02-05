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
        status: v.string(), // '접수', '계약완료' 등
        assignedTo: v.optional(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
        contractDate: v.optional(v.string()),
        deliveryDate: v.optional(v.string()),
        settlement_date: v.optional(v.string()),
        settlementDate: v.optional(v.string()),
    })
        .index("by_applicationNo", ["applicationNo"])
        .index("by_partnerId", ["partnerId"])
        .index("by_createdAt", ["createdAt"]),

    // 상품 테이블 
    products: defineTable({
        brand: v.optional(v.string()),
        model: v.optional(v.string()),
        name: v.optional(v.string()),
        tag: v.optional(v.string()),
        image: v.optional(v.string()),
    }),

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
});
