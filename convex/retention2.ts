import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nowKST } from "./utils";

// 유지율2 데이터 업로드
export const uploadRetentionRecords = mutation({
    args: {
        records: v.array(v.object({
            memberNo: v.string(),
            uniqueNo: v.optional(v.string()),
            customerName: v.string(),
            birth: v.string(),
            phone: v.string(),
            productName: v.string(),
            paymentStatus: v.string(),
            joinStatus: v.string(),
            joinDate: v.string(),
            transferDate: v.optional(v.string()),
            paymentMethod: v.string(),
            cancelStatus: v.optional(v.string()),
            cancelDate: v.optional(v.string()),
            approvalStatus: v.string(),
            b2bCompany: v.string(),
            idNo: v.string(),
            discountCount: v.number(),
            actualPaymentCount: v.number(),
            subCompany: v.optional(v.string()),
            transferorName: v.optional(v.string()),
        }))
    },
    handler: async (ctx, args) => {
        const now = nowKST();
        
        // 기존 데이터 삭제 (새로고침 방식)
        const existing = await ctx.db.query("retentionRecords2").collect();
        for (const record of existing) {
            await ctx.db.delete(record._id);
        }

        // 새 데이터 삽입
        for (const record of args.records) {
            const joinStatus = record.joinStatus || "";
            const paymentStatus = (joinStatus.includes("해약") || joinStatus === "해약") ? "해약처리" : record.paymentStatus;
            await ctx.db.insert("retentionRecords2", {
                ...record,
                paymentStatus,
                uploadedAt: now,
            });
        }
        return { count: args.records.length };
    }
});

// 유지율2 환수여부/부활여부/연체해결 상태 수정
export const updateRetentionStatus = mutation({
    args: {
        id: v.id("retentionRecords2"),
        refundStatus: v.optional(v.string()),
        revivalStatus: v.optional(v.string()),
        delinquencyResolveStatus: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const patchData: any = {};
        const nowFormatted = nowKST().slice(0, 10).replace(/-/g, ".");
        if (args.refundStatus !== undefined) {
            patchData.refundStatus = args.refundStatus;
            patchData.refundUpdatedAt = nowFormatted;
        }
        if (args.revivalStatus !== undefined) {
            patchData.revivalStatus = args.revivalStatus;
            patchData.revivalUpdatedAt = nowFormatted;
        }
        if (args.delinquencyResolveStatus !== undefined) {
            patchData.delinquencyResolveStatus = args.delinquencyResolveStatus;
            patchData.delinquencyResolveUpdatedAt = nowFormatted;
        }
        await ctx.db.patch(args.id, patchData);
    }
});

// 파트너 매핑 필터 헬퍼 함수 (신청건 기반 매핑 - 본인 및 하위 파트너 포함)
async function filterRecordsForPartner(ctx: any, records: any[], partnerId: string) {
    if (!partnerId || partnerId === "admin") return records;

    const allPartners = await ctx.db.query("partners").collect();

    // 현재 파트너 정보 가져오기
    const partner = allPartners.find((p: any) =>
        p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId
    );

    if (!partner) return [];

    // 본인 및 하위 파트너 정보 수집
    const validPartnerIds = new Set<string>();
    const validCompanyNames = new Set<string>();

    const addPartnerInfo = (p: any) => {
        if (p.partnerId) validPartnerIds.add(p.partnerId);
        if (p.loginId) validPartnerIds.add(p.loginId);
        if (p.companyName) {
            const comp = p.companyName.trim();
            validCompanyNames.add(comp);
            const clean = comp.replace(/\(주\)/g, '').trim();
            if (clean) validCompanyNames.add(clean);
        }
    };

    addPartnerInfo(partner);

    // 하위 파트너 수집 함수
    const findSubPartners = (parent: any) => {
        const pId = parent.partnerId;
        const pLogin = parent.loginId;
        const pComp = parent.companyName?.trim();
        const pCleanComp = pComp ? pComp.replace(/\(주\)/g, '').trim() : "";

        const pUrl = parent.customUrl;
        const pIdStr = String(parent._id);

        const subs = allPartners.filter((p: any) => {
            if (!p) return false;
            const matchParentId = (pId && p.parentPartnerId === pId) ||
                                  (pLogin && p.parentPartnerId === pLogin) ||
                                  (pUrl && p.parentPartnerId === pUrl) ||
                                  (pIdStr && p.parentPartnerId === pIdStr);
            const subParentName = p.parentPartnerName ? p.parentPartnerName.trim() : "";
            const subCleanName = subParentName.replace(/\(주\)/g, '').trim();

            const matchParentName = (pComp && subParentName && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) ||
                                    (pCleanComp && subCleanName && (subCleanName === pCleanComp || subCleanName.includes(pCleanComp) || pCleanComp.includes(subCleanName)));

            return matchParentId || matchParentName;
        });

        subs.forEach((sub: any) => {
            const hasSub = (sub.partnerId && validPartnerIds.has(sub.partnerId)) || (sub.loginId && validPartnerIds.has(sub.loginId));
            if (!hasSub) {
                addPartnerInfo(sub);
                findSubPartners(sub);
            }
        });
    };

    findSubPartners(partner);

    // 전체 신청서 목록 가져오기
    const allApps = await ctx.db.query("applications").collect();

    const filteredApps = allApps.filter((app: any) => {
        if (!app.partnerId && !app.partnerName) return false;
        if (app.partnerId && validPartnerIds.has(app.partnerId)) return true;
        if (app.partnerName) {
            const appComp = app.partnerName.trim();
            for (const comp of Array.from(validCompanyNames)) {
                if (appComp === comp || appComp.includes(comp) || comp.includes(appComp)) {
                    return true;
                }
            }
        }
        return false;
    });

    return records.filter(r => {
        // 1. Excel 데이터 자체의 소속(업체명) / B2B회사명이 본인 또는 하위 파트너사명과 직접 일치하는지 확인
        const subComp = r.subCompany ? r.subCompany.trim() : "";
        const b2bComp = r.b2bCompany ? r.b2bCompany.trim() : "";
        const subClean = subComp.replace(/\(주\)/g, '').trim();
        const b2bClean = b2bComp.replace(/\(주\)/g, '').trim();

        for (const comp of Array.from(validCompanyNames)) {
            const compClean = comp.replace(/\(주\)/g, '').trim();
            if (subComp && (subComp === comp || subComp.includes(comp) || comp.includes(subComp))) return true;
            if (b2bComp && (b2bComp === comp || b2bComp.includes(comp) || comp.includes(b2bComp))) return true;
            if (subClean && compClean && (subClean === compClean || subClean.includes(compClean) || compClean.includes(subClean))) return true;
            if (b2bClean && compClean && (b2bClean === compClean || b2bClean.includes(compClean) || compClean.includes(b2bClean))) return true;
        }

        // 2. 신청서 DB(applications) 매칭을 통한 권한 확인
        if (filteredApps.length > 0) {
            const rPhoneDigits = r.phone ? r.phone.replace(/[^0-9]/g, '') : '';
            const rName = (r.customerName || "").trim();

            for (const app of filteredApps) {
                if (!app.customerName || !app.customerPhone) continue;
                const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');
                const appName = app.customerName.trim();

                // 이름 매칭 (마스킹 포함)
                let nameMatch = false;
                if (rName === appName) {
                    nameMatch = true;
                } else if (rName.includes('*')) {
                    if (rName.length === appName.length && appName.startsWith(rName[0]) && appName.endsWith(rName[rName.length - 1])) {
                        nameMatch = true;
                    }
                } else if (appName.includes('*')) {
                    if (appName.length === rName.length && rName.startsWith(appName[0]) && rName.endsWith(appName[appName.length - 1])) {
                        nameMatch = true;
                    }
                }

                if (!nameMatch) continue;

                // 전화번호 매칭 (마스킹 포함)
                if (rPhoneDigits && appPhoneDigits) {
                    if (rPhoneDigits === appPhoneDigits) return true;
                    const rFirst3 = rPhoneDigits.slice(0, 3);
                    const rLast4 = rPhoneDigits.slice(-4);
                    if (appPhoneDigits.startsWith(rFirst3) && appPhoneDigits.endsWith(rLast4)) return true;
                    if (rPhoneDigits.length >= 7 && appPhoneDigits.startsWith(rPhoneDigits.slice(0, 7))) return true;
                }
            }
        }

        return false;
    });
}

// 유지율2 데이터 조회 (Admin 또는 파트너 필터링)
export const getRetentionRecords = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const records = await ctx.db.query("retentionRecords2").order("desc").collect();
        
        if (!args.partnerId || args.partnerId === "admin") {
            return records;
        }

        return await filterRecordsForPartner(ctx, records, args.partnerId);
    }
});

// 대시보드 통계 조회
export const getRetentionStats = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // 데이터 필터링
        const records = await ctx.db.query("retentionRecords2").collect();
        let filtered = records;

        if (args.partnerId && args.partnerId !== "admin") {
            filtered = await filterRecordsForPartner(ctx, records, args.partnerId);
        }

        // 고유 인원 계산 함수 (이름+생일+전화번호)
        const getUniqueCount = (data: typeof filtered) => {
            const keys = new Set(data.map(r => `${r.customerName}_${r.birth}_${r.phone}`));
            return keys.size;
        };

        const normalRecords = filtered.filter(r => 
            !r.joinStatus.includes("해약") && 
            !r.joinStatus.includes("철회") && 
            (r.paymentStatus.includes("정상") || r.paymentStatus === "" || r.paymentStatus === "정상납입")
        );

        const delinquentRecords = filtered.filter(r => 
            !r.joinStatus.includes("해약") && 
            !r.joinStatus.includes("철회") && 
            r.paymentStatus.includes("연체")
        );

        const cancelRecords = filtered.filter(r => 
            r.joinStatus.includes("해약") || 
            r.joinStatus.includes("철회") ||
            (r.cancelStatus && r.cancelStatus !== "" && r.cancelStatus !== "-")
        );

        // 통계 계산
        const stats = {
            total: { count: filtered.length, unique: getUniqueCount(filtered) },
            normalPayment: { count: normalRecords.length, unique: getUniqueCount(normalRecords) },
            delinquent: { count: delinquentRecords.length, unique: getUniqueCount(delinquentRecords) },
            cancel: { count: cancelRecords.length, unique: getUniqueCount(cancelRecords) },
            delinquentCounts: {} as Record<string, { count: number, unique: number }>,
            cardCount: filtered.filter(r => r.paymentMethod.includes("카드")).length,
            cmsCount: filtered.filter(r => r.paymentMethod.toUpperCase().includes("CMS") || r.paymentMethod.includes("이체")).length,
        };

        // 연체 회차별 카운트
        filtered.forEach(r => {
            if (r.paymentStatus.includes("연체")) {
                const status = r.paymentStatus;
                if (!stats.delinquentCounts[status]) {
                    stats.delinquentCounts[status] = { count: 0, unique: 0 };
                }
                stats.delinquentCounts[status].count++;
            }
        });

        // 각 연체 회차별 고유 인원 보정
        Object.keys(stats.delinquentCounts).forEach(status => {
            const statusRecords = filtered.filter(r => r.paymentStatus === status);
            stats.delinquentCounts[status].unique = getUniqueCount(statusRecords);
        });

        return stats;
    }
});
