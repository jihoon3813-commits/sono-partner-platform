import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nowKST } from "./utils";

// 파트너 매핑 해결 헬퍼 함수 (업로드 시 / DB 재바인딩 시 각 레코드에 파트너 정보 주입)
function resolvePartnerForRecord(record: any, allPartners: any[], allApps: any[], allMappings1: any[], allMappings2: any[]) {
    const subComp = (record.subCompany || "").trim();
    const b2bComp = (record.b2bCompany || "").trim();
    const idNo = (record.idNo || "").trim();
    const transferor = (record.transferorName || "").trim();
    const customerName = (record.customerName || "").replace(/\s+/g, '').trim();
    const phoneDigits = (record.phone || "").replace(/[^0-9]/g, '');

    const subClean = subComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
    const b2bClean = b2bComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();

    // 1순위: 신청서 DB(applications) 고객명 + 전화번호 역매칭 (하위 파트너 링크를 통해 신청한 고객 파트너사 추적)
    if (customerName && phoneDigits && allApps.length > 0) {
        const last4 = phoneDigits.length >= 4 ? phoneDigits.slice(-4) : "";
        const first3 = phoneDigits.length >= 3 ? phoneDigits.slice(0, 3) : "";

        for (const app of allApps) {
            if (!app.customerName || !app.customerPhone) continue;
            const appName = app.customerName.replace(/\s+/g, '').trim();
            const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');

            let phoneMatch = false;
            if (phoneDigits.includes('*') || phoneDigits.length < 10) {
                phoneMatch = appPhoneDigits.startsWith(first3) && appPhoneDigits.endsWith(last4);
            } else {
                phoneMatch = (appPhoneDigits === phoneDigits);
            }
            if (!phoneMatch) continue;

            let nameMatch = false;
            if (customerName === appName) {
                nameMatch = true;
            } else if (customerName.includes('*')) {
                if (customerName.length === appName.length) {
                    let match = true;
                    for (let i = 0; i < customerName.length; i++) {
                        if (customerName[i] !== '*' && customerName[i] !== appName[i]) { match = false; break; }
                    }
                    if (match) nameMatch = true;
                } else if (customerName.length === 2 && appName.length >= 2 && customerName[0] === appName[0]) {
                    nameMatch = true;
                }
            } else if (appName.includes('*')) {
                if (appName.length === customerName.length) {
                    let match = true;
                    for (let i = 0; i < appName.length; i++) {
                        if (appName[i] !== '*' && appName[i] !== customerName[i]) { match = false; break; }
                    }
                    if (match) nameMatch = true;
                } else if (appName.length === 2 && customerName.length >= 2 && appName[0] === customerName[0]) {
                    nameMatch = true;
                }
            }

            if (nameMatch) {
                const aId = (app.partnerId || "").trim();
                const aName = (app.partnerName || "").trim();
                const aCleanName = aName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();

                const foundP = allPartners.find((p: any) => {
                    if (!p) return false;
                    if (aId && (p.partnerId === aId || p.loginId === aId || p.customUrl === aId || String(p._id) === aId)) return true;
                    const pComp = (p.companyName || "").trim();
                    const pClean = pComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
                    if (aName && (pComp === aName || pComp.includes(aName) || aName.includes(pComp))) return true;
                    if (aCleanName && pClean && (pClean === aCleanName || pClean.includes(aCleanName) || aCleanName.includes(pClean))) return true;
                    return false;
                });

                if (foundP) return foundP;
            }
        }
    }

    // 2순위: 엑셀 소속(subCompany) 파트너사명 대조
    if (subClean) {
        const foundP = allPartners.find((p: any) => {
            if (!p) return false;
            const pComp = (p.companyName || "").trim();
            const pClean = pComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (pClean && (subClean === pClean || subClean.includes(pClean) || pClean.includes(subClean))) return true;
            if (p.partnerId && subComp === p.partnerId) return true;
            if (p.loginId && subComp === p.loginId) return true;
            return false;
        });
        if (foundP) return foundP;
    }

    // 3순위: ID NO (Column P)가 파트너 PartnerID / LoginID와 직접 대조
    if (idNo) {
        const foundP = allPartners.find((p: any) => {
            if (!p) return false;
            if (p.partnerId && idNo === p.partnerId.trim()) return true;
            if (p.loginId && idNo === p.loginId.trim()) return true;
            if (p.customUrl && idNo === p.customUrl.trim()) return true;
            return false;
        });
        if (foundP) return foundP;
    }

    // 4순위: 미매칭 시 본사(라이프앤조이)로 할당
    const hq = allPartners.find((p: any) => p.companyName === "라이프앤조이" || p.loginId === "lifenjoy");
    return hq || null;
}

// 유지율2 데이터 업로드 (매칭 파트너 및 상위 파트너 정보 DB 즉시 저장)
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

        const allPartners = await ctx.db.query("partners").collect();
        const allApps = await ctx.db.query("applications").collect();
        let allMappings1: any[] = [];
        let allMappings2: any[] = [];

        try {
            allMappings1 = await ctx.db.query("partnerRetentionMappings").collect();
            allMappings2 = await ctx.db.query("partnerRetentionMappings2").collect();
        } catch (e) {
            console.error("Mapping table error:", e);
        }

        // 새 데이터 삽입 (파트너 정보 바인딩 후 저장)
        for (const record of args.records) {
            const joinStatus = record.joinStatus || "";
            const paymentStatus = (joinStatus.includes("해약") || joinStatus === "해약") ? "해약처리" : record.paymentStatus;
            
            const matchedP = resolvePartnerForRecord(record, allPartners, allApps, allMappings1, allMappings2);
            
            const partnerId = matchedP?.partnerId || matchedP?.loginId || "";
            const partnerName = matchedP?.companyName || "";
            const parentPartnerId = matchedP?.parentPartnerId || "";
            const parentPartnerName = matchedP?.parentPartnerName || "";

            await ctx.db.insert("retentionRecords2", {
                ...record,
                paymentStatus,
                partnerId,
                partnerName,
                parentPartnerId,
                parentPartnerName,
                uploadedAt: now,
            });
        }
        return { count: args.records.length };
    }
});

// 기존 연체 리스트 전체 파트너 정보 재바인딩 DB 업데이트 뮤테이션
export const rebindAllRetentionRecords = mutation({
    args: {},
    handler: async (ctx) => {
        const existing = await ctx.db.query("retentionRecords2").collect();
        const allPartners = await ctx.db.query("partners").collect();
        const allApps = await ctx.db.query("applications").collect();
        let allMappings1: any[] = [];
        let allMappings2: any[] = [];

        try {
            allMappings1 = await ctx.db.query("partnerRetentionMappings").collect();
            allMappings2 = await ctx.db.query("partnerRetentionMappings2").collect();
        } catch (e) {
            console.error("Mapping table error:", e);
        }

        let updatedCount = 0;
        for (const record of existing) {
            const matchedP = resolvePartnerForRecord(record, allPartners, allApps, allMappings1, allMappings2);
            if (matchedP) {
                await ctx.db.patch(record._id, {
                    partnerId: matchedP.partnerId || matchedP.loginId || "",
                    partnerName: matchedP.companyName || "",
                    parentPartnerId: matchedP.parentPartnerId || "",
                    parentPartnerName: matchedP.parentPartnerName || "",
                });
                updatedCount++;
            }
        }
        return { updatedCount, totalCount: existing.length };
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

// 파트너 매핑 필터 헬퍼 함수 (DB 바인딩 저장 필드 + 계층 구조 기반)
async function filterRecordsForPartner(ctx: any, records: any[], partnerId: string) {
    if (!partnerId || partnerId === "admin") return records;

    const allPartners = await ctx.db.query("partners").collect();
    const currentPartner = allPartners.find((p: any) =>
        p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId || String(p._id) === partnerId
    );

    if (!currentPartner) {
        return [];
    }

    // 본인 및 하위 파트너 계층 수집
    const collectedPartners: any[] = [];
    const collectedPartnerIds = new Set<string>();
    const collectedPartnerNames = new Set<string>();
    
    const collectHierarchy = (parentP: any) => {
        if (!parentP || collectedPartnerIds.has(String(parentP._id))) return;
        collectedPartnerIds.add(String(parentP._id));
        if (parentP.partnerId) collectedPartnerIds.add(parentP.partnerId.trim());
        if (parentP.loginId) collectedPartnerIds.add(parentP.loginId.trim());
        if (parentP.customUrl) collectedPartnerIds.add(parentP.customUrl.trim());

        if (parentP.companyName) {
            const comp = parentP.companyName.trim();
            collectedPartnerNames.add(comp);
            const clean = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (clean) collectedPartnerNames.add(clean);
        }

        collectedPartners.push(parentP);

        const pId = (parentP.partnerId || "").trim();
        const pLogin = (parentP.loginId || "").trim();
        const pUrl = (parentP.customUrl || "").trim();
        const pObjId = String(parentP._id);
        const pComp = (parentP.companyName || "").trim();
        const pCleanComp = pComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase();

        const children = allPartners.filter((p: any) => {
            if (!p || collectedPartnerIds.has(String(p._id))) return false;

            const subParentId = (p.parentPartnerId || "").trim();
            const subParentName = (p.parentPartnerName || "").trim();
            const subCleanParentName = subParentName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase();

            if (subParentId) {
                if (pId && subParentId === pId) return true;
                if (pLogin && subParentId === pLogin) return true;
                if (pUrl && subParentId === pUrl) return true;
                if (pObjId && subParentId === pObjId) return true;
                if (pCleanComp && subParentId.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase().includes(pCleanComp)) return true;
            }

            if (subParentName) {
                if (pComp && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) return true;
                if (pLogin && (subParentName === pLogin || subParentName.includes(pLogin))) return true;
                if (pId && (subParentName === pId || subParentName.includes(pId))) return true;
                if (pCleanComp && subCleanParentName && (subCleanParentName.includes(pCleanComp) || pCleanComp.includes(subCleanParentName))) return true;
            }

            return false;
        });

        children.forEach((child: any) => collectHierarchy(child));
    };

    collectHierarchy(currentPartner);

    // DB에 바인딩된 partnerId/parentPartnerId 및 partnerName 기반 100% 명확 필터링
    return records.filter(r => {
        // 1. DB 바인딩 필드 검사
        if (r.partnerId && collectedPartnerIds.has(r.partnerId.trim())) return true;
        if (r.parentPartnerId && collectedPartnerIds.has(r.parentPartnerId.trim())) return true;
        
        if (r.partnerName) {
            const pName = r.partnerName.trim();
            const cleanPName = pName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (collectedPartnerNames.has(pName) || collectedPartnerNames.has(cleanPName)) return true;
        }

        if (r.parentPartnerName) {
            const parentName = r.parentPartnerName.trim();
            const cleanParentName = parentName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (collectedPartnerNames.has(parentName) || collectedPartnerNames.has(cleanParentName)) return true;
        }

        // 2. 엑셀 소속(subCompany) 검사
        if (r.subCompany) {
            const sub = r.subCompany.trim();
            const cleanSub = sub.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (collectedPartnerNames.has(sub) || collectedPartnerNames.has(cleanSub) || collectedPartnerIds.has(sub)) return true;
        }

        return false;
    });
}

// [DEBUG] 파트너 계층 및 연체 매칭 디버그 쿼리
export const debugPartnerHierarchy = query({
    args: { partnerId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const allPartners = await ctx.db.query("partners").collect();
        const records = await ctx.db.query("retentionRecords2").order("desc").collect();

        const partnerId = args.partnerId || "";

        // 현재 파트너 찾기
        const currentPartner = allPartners.find((p: any) =>
            p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId || String(p._id) === partnerId
        );

        if (!currentPartner) {
            return {
                error: `Partner not found for: ${partnerId}`,
                allPartnerSummary: allPartners.map((p: any) => ({
                    partnerId: p.partnerId,
                    loginId: p.loginId,
                    companyName: p.companyName,
                    parentPartnerId: p.parentPartnerId,
                    parentPartnerName: p.parentPartnerName,
                }))
            };
        }

        // collectHierarchy 로직 복제 (디버그 로깅 포함)
        const collectedPartners: any[] = [];
        const collectedPartnerIds = new Set<string>();
        const hierarchyLog: string[] = [];

        const collectHierarchy = (parentP: any) => {
            if (!parentP || collectedPartnerIds.has(String(parentP._id))) return;
            collectedPartnerIds.add(String(parentP._id));
            collectedPartners.push(parentP);
            hierarchyLog.push(`[COLLECTED] ${parentP.companyName} (partnerId=${parentP.partnerId}, loginId=${parentP.loginId})`);

            const pId = (parentP.partnerId || "").trim();
            const pLogin = (parentP.loginId || "").trim();
            const pUrl = (parentP.customUrl || "").trim();
            const pObjId = String(parentP._id);
            const pComp = (parentP.companyName || "").trim();
            const pCleanComp = pComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase();

            const children = allPartners.filter((p: any) => {
                if (!p || collectedPartnerIds.has(String(p._id))) return false;

                const subParentId = (p.parentPartnerId || "").trim();
                const subParentName = (p.parentPartnerName || "").trim();
                const subCleanParentName = subParentName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase();

                if (subParentId) {
                    if (pId && subParentId === pId) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentId(${subParentId}) === pId(${pId})`); return true; }
                    if (pLogin && subParentId === pLogin) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentId(${subParentId}) === pLogin(${pLogin})`); return true; }
                    if (pUrl && subParentId === pUrl) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentId(${subParentId}) === pUrl(${pUrl})`); return true; }
                    if (pObjId && subParentId === pObjId) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentId(${subParentId}) === pObjId(${pObjId})`); return true; }
                    if (pCleanComp && subParentId.replace(/\(주\)/g, '').replace(/\s+/g, '').trim().toLowerCase().includes(pCleanComp)) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentId(${subParentId}) includes pCleanComp(${pCleanComp})`); return true; }
                }

                if (subParentName) {
                    if (pComp && (subParentName === pComp || subParentName.includes(pComp) || pComp.includes(subParentName))) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentName(${subParentName}) matches pComp(${pComp})`); return true; }
                    if (pLogin && (subParentName === pLogin || subParentName.includes(pLogin))) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentName(${subParentName}) matches pLogin(${pLogin})`); return true; }
                    if (pId && (subParentName === pId || subParentName.includes(pId))) { hierarchyLog.push(`  CHILD ${p.companyName}: subParentName(${subParentName}) matches pId(${pId})`); return true; }
                    if (pCleanComp && subCleanParentName && (subCleanParentName.includes(pCleanComp) || pCleanComp.includes(subCleanParentName))) { hierarchyLog.push(`  CHILD ${p.companyName}: subCleanParentName(${subCleanParentName}) matches pCleanComp(${pCleanComp})`); return true; }
                }

                return false;
            });

            if (children.length === 0) {
                hierarchyLog.push(`  [NO CHILDREN FOUND for ${parentP.companyName}]`);
            }

            children.forEach((child: any) => collectHierarchy(child));
        };

        collectHierarchy(currentPartner);

        // 각 파트너별 records.filter 결과 (간략)
        const perPartnerCounts: any[] = [];
        for (const p of collectedPartners) {
            const filteredResult = await filterRecordsForPartner(ctx, records, p.partnerId || p.loginId || String(p._id));
            perPartnerCounts.push({
                companyName: p.companyName,
                partnerId: p.partnerId,
                loginId: p.loginId,
                recordCount: filteredResult.length,
            });
        }

        // 전체 결과
        const fullResult = await filterRecordsForPartner(ctx, records, partnerId);

        return {
            inputPartnerId: partnerId,
            currentPartner: {
                companyName: currentPartner.companyName,
                partnerId: currentPartner.partnerId,
                loginId: currentPartner.loginId,
                parentPartnerId: currentPartner.parentPartnerId,
                parentPartnerName: currentPartner.parentPartnerName,
                role: currentPartner.role,
            },
            collectedPartnersCount: collectedPartners.length,
            collectedPartnersList: collectedPartners.map((p: any) => ({
                companyName: p.companyName,
                partnerId: p.partnerId,
                loginId: p.loginId,
                parentPartnerId: p.parentPartnerId,
                parentPartnerName: p.parentPartnerName,
            })),
            hierarchyLog,
            perPartnerCounts,
            totalRecordsInDB: records.length,
            filteredRecordCount: fullResult.length,
            sampleFilteredRecords: fullResult.slice(0, 5).map((r: any) => ({
                customerName: r.customerName,
                subCompany: r.subCompany,
                b2bCompany: r.b2bCompany,
                idNo: r.idNo,
                transferorName: r.transferorName,
            })),
            // 모든 파트너의 parentPartnerId/parentPartnerName 현황
            allPartnerParentInfo: allPartners.map((p: any) => ({
                companyName: p.companyName,
                partnerId: p.partnerId,
                loginId: p.loginId,
                parentPartnerId: p.parentPartnerId || "(없음)",
                parentPartnerName: p.parentPartnerName || "(없음)",
            })),
        };
    }
});

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
