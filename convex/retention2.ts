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
    const allApps = await ctx.db.query("applications").collect();
    let allMappings1: any[] = [];
    let allMappings2: any[] = [];

    try {
        allMappings1 = await ctx.db.query("partnerRetentionMappings").collect();
        allMappings2 = await ctx.db.query("partnerRetentionMappings2").collect();
    } catch (e) {
        console.error("Mapping table error:", e);
    }

    // 현재 파트너 찾기 (partnerId, loginId, customUrl, _id 중 일치하는 항목)
    const currentPartner = allPartners.find((p: any) =>
        p.partnerId === partnerId || p.loginId === partnerId || p.customUrl === partnerId || String(p._id) === partnerId
    );

    if (!currentPartner) {
        return [];
    }

    // 본인 및 하위 파트너 정보 수집
    const collectedPartners: any[] = [];
    const collectedPartnerIds = new Set<string>();
    
    const collectHierarchy = (parentP: any) => {
        if (!parentP || collectedPartnerIds.has(String(parentP._id))) return;
        collectedPartnerIds.add(String(parentP._id));
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

    // 단일 파트너별 연체 레코드 매핑 필터 헬퍼 함수
    const getRecordsForSinglePartner = (p: any) => {
        const pPartnerIds = new Set<string>();
        const pCompanyNames = new Set<string>();
        const pManagerNames = new Set<string>();

        if (p.partnerId) pPartnerIds.add(p.partnerId.trim());
        if (p.loginId) pPartnerIds.add(p.loginId.trim());
        if (p.customUrl) pPartnerIds.add(p.customUrl.trim());
        if (p._id) pPartnerIds.add(String(p._id));

        if (p.companyName) {
            const comp = p.companyName.trim();
            pCompanyNames.add(comp);
            const cleanComp = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            if (cleanComp) pCompanyNames.add(cleanComp);
        }

        if (p.managerName) {
            const mgr = p.managerName.trim();
            pManagerNames.add(mgr);
            const cleanMgr = mgr.replace(/\s+/g, '').trim();
            if (cleanMgr) pManagerNames.add(cleanMgr);
        }
        if (p.ceoName) {
            const ceo = p.ceoName.trim();
            pManagerNames.add(ceo);
            const cleanCeo = ceo.replace(/\s+/g, '').trim();
            if (cleanCeo) pManagerNames.add(cleanCeo);
        }

        // 매핑 테이블 항목 추가
        for (const vId of Array.from(pPartnerIds)) {
            const m2 = allMappings2.filter((m: any) => m.partnerId === vId);
            m2.forEach((m: any) => m.idNos?.forEach((id: string) => pPartnerIds.add(id.trim())));

            const m1 = allMappings1.filter((m: any) => m.partnerId === vId);
            m1.forEach((m: any) => m.idNos?.forEach((id: string) => pPartnerIds.add(id.trim())));
        }

        // 해당 파트너의 신청서 목록
        const pApps = allApps.filter((app: any) => {
            if (!app) return false;
            const aId = (app.partnerId || "").trim();
            const aParentId = (app.parentPartnerId || "").trim();
            const aName = (app.partnerName || "").trim();
            const aCleanName = aName.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();

            if (aId && pPartnerIds.has(aId)) return true;
            if (aParentId && pPartnerIds.has(aParentId)) return true;

            for (const comp of Array.from(pCompanyNames)) {
                const compClean = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
                if (aName && (aName === comp || aName.includes(comp) || comp.includes(aName))) return true;
                if (aCleanName && compClean && (aCleanName === compClean || aCleanName.includes(compClean) || compClean.includes(aCleanName))) return true;
            }

            return false;
        });

        const pIdArray = Array.from(pPartnerIds);
        const pCompArray = Array.from(pCompanyNames);
        const pMgrArray = Array.from(pManagerNames);

        return records.filter(r => {
            const subComp = (r.subCompany || "").trim();
            const b2bComp = (r.b2bCompany || "").trim();
            const idNo = (r.idNo || "").trim();
            const transferor = (r.transferorName || "").trim();
            const memberNo = (r.memberNo || "").trim();
            const uniqueNo = (r.uniqueNo || "").trim();

            const subClean = subComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            const b2bClean = b2bComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            const transferorClean = transferor.replace(/\s+/g, '').trim();

            // 1-A. 파트너 ID / LoginID / customUrl / _id / 매핑 ID NO 일치
            for (const vId of pIdArray) {
                if (!vId) continue;
                if (subComp && (subComp === vId || subComp.includes(vId) || vId.includes(subComp))) return true;
                if (b2bComp && (b2bComp === vId || b2bComp.includes(vId) || vId.includes(b2bComp))) return true;
                if (idNo && (idNo === vId || idNo.includes(vId) || vId.includes(idNo))) return true;
                if (transferor && (transferor === vId || transferor.includes(vId) || vId.includes(transferor))) return true;
                if (memberNo && (memberNo === vId || memberNo.includes(vId) || vId.includes(memberNo))) return true;
                if (uniqueNo && (uniqueNo === vId || uniqueNo.includes(vId) || vId.includes(uniqueNo))) return true;
            }

            // 1-B. 회사명 일치
            for (const comp of pCompArray) {
                if (!comp) continue;
                const compClean = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
                if (subComp && (subComp === comp || subComp.includes(comp) || comp.includes(subComp))) return true;
                if (b2bComp && (b2bComp === comp || b2bComp.includes(comp) || comp.includes(b2bComp))) return true;
                if (subClean && compClean && (subClean === compClean || subClean.includes(compClean) || compClean.includes(subClean))) return true;
                if (b2bClean && compClean && (b2bClean === compClean || b2bClean.includes(compClean) || compClean.includes(b2bClean))) return true;
                if (transferor && (transferor === comp || transferor.includes(comp) || comp.includes(transferor))) return true;
                if (transferorClean && compClean && (transferorClean === compClean || transferorClean.includes(compClean) || compClean.includes(transferorClean))) return true;
            }

            // 1-C. 담당자/추천인명 검사
            for (const mgr of pMgrArray) {
                if (!mgr) continue;
                const mgrClean = mgr.replace(/\s+/g, '').trim();
                if (transferor && (transferor === mgr || transferor.includes(mgr) || mgr.includes(transferor))) return true;
                if (transferorClean && mgrClean && (transferorClean === mgrClean || transferorClean.includes(mgrClean) || mgrClean.includes(transferorClean))) return true;
                if (subComp && (subComp === mgr || subComp.includes(mgr) || mgr.includes(subComp))) return true;
                if (b2bComp && (b2bComp === mgr || b2bComp.includes(mgr) || mgr.includes(b2bComp))) return true;
            }

            // 2. 신청서 DB 매칭 검사
            if (pApps.length > 0) {
                const rName = (r.customerName || "").replace(/\s+/g, '').trim();
                const rPhoneDigits = (r.phone || "").replace(/[^0-9]/g, '');

                for (const app of pApps) {
                    if (!app.customerName || !app.customerPhone) continue;
                    const appName = app.customerName.replace(/\s+/g, '').trim();
                    const appPhoneDigits = app.customerPhone.replace(/[^0-9]/g, '');

                    let nameMatch = false;
                    if (rName === appName) {
                        nameMatch = true;
                    } else if (rName.includes('*')) {
                        if (rName.length === appName.length) {
                            let match = true;
                            for (let i = 0; i < rName.length; i++) {
                                if (rName[i] !== '*' && rName[i] !== appName[i]) { match = false; break; }
                            }
                            if (match) nameMatch = true;
                        } else if (rName.length === 2 && appName.length >= 2 && rName[0] === appName[0]) {
                            nameMatch = true;
                        }
                    } else if (appName.includes('*')) {
                        if (appName.length === cleanNameLength(appName)) {
                            let match = true;
                            for (let i = 0; i < appName.length; i++) {
                                if (appName[i] !== '*' && appName[i] !== rName[i]) { match = false; break; }
                            }
                            if (match) nameMatch = true;
                        } else if (appName.length === 2 && rName.length >= 2 && appName[0] === rName[0]) {
                            nameMatch = true;
                        }
                    }

                    if (!nameMatch) continue;
                    if (!rPhoneDigits || !appPhoneDigits) return true;
                    if (rPhoneDigits === appPhoneDigits) return true;

                    const rFirst3 = rPhoneDigits.slice(0, 3);
                    const rLast4 = rPhoneDigits.slice(-4);
                    if (appPhoneDigits.startsWith(rFirst3) && appPhoneDigits.endsWith(rLast4)) return true;
                    if (rPhoneDigits.length >= 7 && appPhoneDigits.startsWith(rPhoneDigits.slice(0, 7))) return true;
                    if (rPhoneDigits.length >= 4 && appPhoneDigits.endsWith(rLast4)) return true;
                    if (appPhoneDigits.endsWith(rLast4)) return true;
                }
            }

            return false;
        });
    };

    function cleanNameLength(s: string) { return s.length; }

    // 하위 파트너 및 본인의 모든 연체 리스트 수집 및 병합 (중복 제거)
    const recordMap = new Map<string, any>();
    for (const p of collectedPartners) {
        const pRecords = getRecordsForSinglePartner(p);
        pRecords.forEach(r => {
            recordMap.set(String(r._id), r);
        });
    }

    // 최상위/Master 파트너의 경우 타 파트너 전용 데이터가 아닌 범용 항목도 추가 포함
    const isUpperPartner = (currentPartner.role === 'master') || (!currentPartner.parentPartnerId) || (collectedPartnerIds.size > 1);
    if (isUpperPartner) {
        const otherPartners = allPartners.filter((p: any) => !collectedPartnerIds.has(String(p._id)));
        const otherPartnerNames = new Set<string>();
        otherPartners.forEach((p: any) => {
            if (p.companyName) {
                const comp = p.companyName.trim();
                otherPartnerNames.add(comp);
                const clean = comp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
                if (clean) otherPartnerNames.add(clean);
            }
            if (p.loginId) otherPartnerNames.add(p.loginId.trim());
            if (p.partnerId) otherPartnerNames.add(p.partnerId.trim());
        });
        const otherPartnerArray = Array.from(otherPartnerNames);

        records.forEach(r => {
            if (recordMap.has(String(r._id))) return;

            const subComp = (r.subCompany || "").trim();
            const b2bComp = (r.b2bCompany || "").trim();
            const subClean = subComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();
            const b2bClean = b2bComp.replace(/\(주\)/g, '').replace(/\s+/g, '').trim();

            const isExplicitlyOther = otherPartnerArray.some(otherName => {
                if (!otherName) return false;
                if (subComp && (subComp === otherName || subClean === otherName)) return true;
                if (b2bComp && (b2bComp === otherName || b2bClean === otherName)) return true;
                return false;
            });

            if (!isExplicitlyOther) {
                recordMap.set(String(r._id), r);
            }
        });
    }

    return Array.from(recordMap.values());
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
