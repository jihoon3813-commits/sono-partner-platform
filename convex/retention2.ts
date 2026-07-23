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

    // 현재 파트너 찾기 (partnerId, loginId, customUrl 중 일치하는 항목)
    const currentPartner = allPartners.find((p: any) =>
        p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId || String(p._id) === partnerId
    );

    if (!currentPartner) {
        console.log("[Retention2 Filter] Current partner not found for ID:", partnerId);
        return [];
    }

    // 본인 및 하위 파트너 정보 전체 수집
    const validPartnerIds = new Set<string>();
    const validCompanyNames = new Set<string>();
    const validManagerNames = new Set<string>();

    const addPartnerToValid = (p: any) => {
        if (p.partnerId) validPartnerIds.add(p.partnerId.trim());
        if (p.loginId) validPartnerIds.add(p.loginId.trim());
        if (p.customUrl) validPartnerIds.add(p.customUrl.trim());
        if (p._id) validPartnerIds.add(String(p._id));

        if (p.companyName) {
            const comp = p.companyName.trim();
            validCompanyNames.add(comp);
            const cleanComp = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (cleanComp) validCompanyNames.add(cleanComp);
        }

        if (p.managerName) {
            validManagerNames.add(p.managerName.trim());
        }
    };

    // 하위 파트너 재귀적 수집
    const collectedPartnerIds = new Set<string>();
    
    const collectHierarchy = (parentP: any) => {
        if (!parentP || collectedPartnerIds.has(String(parentP._id))) return;
        collectedPartnerIds.add(String(parentP._id));
        addPartnerToValid(parentP);

        const pId = parentP.partnerId?.trim();
        const pLogin = parentP.loginId?.trim();
        const pUrl = parentP.customUrl?.trim();
        const pObjId = String(parentP._id);
        const pComp = parentP.companyName?.trim();
        const pCleanComp = pComp ? pComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim() : "";

        const children = allPartners.filter((p: any) => {
            if (!p || collectedPartnerIds.has(String(p._id))) return false;

            // 1. parentPartnerId 매칭
            const subParentId = p.parentPartnerId ? p.parentPartnerId.trim() : "";
            if (subParentId) {
                if (pId && subParentId === pId) return true;
                if (pLogin && subParentId === pLogin) return true;
                if (pUrl && subParentId === pUrl) return true;
                if (pObjId && subParentId === pObjId) return true;
            }

            // 2. parentPartnerName 매칭
            const subParentName = p.parentPartnerName ? p.parentPartnerName.trim() : "";
            if (subParentName) {
                if (pComp && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) return true;
                if (pLogin && subParentName === pLogin) return true;
                if (pId && subParentName === pId) return true;

                const subCleanName = subParentName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
                if (pCleanComp && subCleanName && (subCleanName === pCleanComp || subCleanName.includes(pCleanComp) || pCleanComp.includes(subCleanName))) return true;
            }

            return false;
        });

        children.forEach((child: any) => collectHierarchy(child));
    };

    collectHierarchy(currentPartner);

    console.log("[Retention2 Filter] Valid Company Names:", Array.from(validCompanyNames));
    console.log("[Retention2 Filter] Valid Partner IDs:", Array.from(validPartnerIds));

    // 본인 및 하위 파트너의 신청서 목록 가져오기
    const allApps = await ctx.db.query("applications").collect();
    const filteredApps = allApps.filter((app: any) => {
        if (app.partnerId && validPartnerIds.has(app.partnerId.trim())) return true;
        if (app.partnerName) {
            const appComp = app.partnerName.trim();
            const appCleanComp = appComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            for (const comp of Array.from(validCompanyNames)) {
                if (appComp === comp || appComp.includes(comp) || comp.includes(appComp)) return true;
                if (appCleanComp && (appCleanComp === comp || appCleanComp.includes(comp) || comp.includes(appCleanComp))) return true;
            }
        }
        return false;
    });

    console.log("[Retention2 Filter] Filtered Apps Count:", filteredApps.length);

    // 엑셀 유효 데이터 필터링
    return records.filter(r => {
        // 1. 엑셀 데이터 자체 항목(소속/업체명, B2B회사명, ID NO, 추천인명 등)이 수집된 파트너 정보와 일치하는지 검사
        const subComp = (r.subCompany || "").trim();
        const b2bComp = (r.b2bCompany || "").trim();
        const idNo = (r.idNo || "").trim();
        const transferor = (r.transferorName || "").trim();

        const subClean = subComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
        const b2bClean = b2bComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();

        // 1-A. 파트너 ID / LoginID 직접 일치 검사
        if (subComp && validPartnerIds.has(subComp)) return true;
        if (b2bComp && validPartnerIds.has(b2bComp)) return true;
        if (idNo && validPartnerIds.has(idNo)) return true;

        // 1-B. 회사명 직접 일치 검사
        for (const comp of Array.from(validCompanyNames)) {
            const compClean = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (subComp && (subComp === comp || subComp.includes(comp) || comp.includes(subComp))) return true;
            if (b2bComp && (b2bComp === comp || b2bComp.includes(comp) || comp.includes(b2bComp))) return true;
            if (subClean && compClean && (subClean === compClean || subClean.includes(compClean) || compClean.includes(subClean))) return true;
            if (b2bClean && compClean && (b2bClean === compClean || b2bClean.includes(compClean) || compClean.includes(b2bClean))) return true;
        }

        // 1-C. 담당자/추천인명 검사
        if (transferor && (validManagerNames.has(transferor) || validCompanyNames.has(transferor))) return true;

        // 2. 신청서 DB(applications)와의 고객명+전화번호 매칭 검사
        if (filteredApps.length > 0) {
            const rName = (r.customerName || "").replace(/\s+/g, '').trim();
            const rPhoneDigits = (r.phone || "").replace(/[^0-9]/g, '');

            for (const app of filteredApps) {
                if (!app.customerName || !app.customerPhone) continue;
                const appName = app.customerName.replace(/\s+/g, '').trim();
                const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');

                // 이름 매칭 (마스킹 포함)
                let nameMatch = false;
                if (rName === appName) {
                    nameMatch = true;
                } else if (rName.includes('*')) {
                    if (rName.length === appName.length && appName.startsWith(rName[0]) && appName.endsWith(rName[rName.length - 1])) {
                        nameMatch = true;
                    } else if (rName.length === 2 && appName.startsWith(rName[0])) {
                        nameMatch = true;
                    }
                } else if (appName.includes('*')) {
                    if (appName.length === rName.length && rName.startsWith(appName[0]) && rName.endsWith(appName[appName.length - 1])) {
                        nameMatch = true;
                    } else if (appName.length === 2 && rName.startsWith(appName[0])) {
                        nameMatch = true;
                    }
                }

                if (!nameMatch) continue;

                // 전화번호 매칭 (마스킹 및 다양한 형태 지원)
                if (!rPhoneDigits || !appPhoneDigits) {
                    return true;
                }

                if (rPhoneDigits === appPhoneDigits) return true;
                
                const rFirst3 = rPhoneDigits.slice(0, 3);
                const rLast4 = rPhoneDigits.slice(-4);
                
                if (appPhoneDigits.startsWith(rFirst3) && appPhoneDigits.endsWith(rLast4)) return true;
                if (rPhoneDigits.length >= 7 && appPhoneDigits.startsWith(rPhoneDigits.slice(0, 7))) return true;
                if (rPhoneDigits.length >= 4 && appPhoneDigits.endsWith(rLast4)) return true;
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
