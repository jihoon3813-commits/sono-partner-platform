import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 대한민국 표준시(KST, Asia/Seoul, UTC+9) YYYY-MM-DD 날짜 추출 헬퍼
function getKSTDateStr(dateInput?: Date | string | number): string {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return String(dateInput).substring(0, 10);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
}

// 유입 사이트 URL 및 User-Agent 기반 유입 출처 분석 헬퍼
export function parseReferrerSite(url?: string, userAgent?: string): { siteName: string; domain: string; category: string } {
    const cleanUrl = (url || "").trim();
    const ua = (userAgent || "").toLowerCase();

    // 1. UTM 파라미터 감지 (예: utm://kakaotalk 또는 URL 내 utm_source)
    let utmSource = "";
    if (cleanUrl.startsWith("utm://")) {
        utmSource = cleanUrl.replace("utm://", "").toLowerCase();
    } else if (cleanUrl.includes("utm_source=")) {
        try {
            const urlObj = new URL(cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`);
            utmSource = urlObj.searchParams.get("utm_source")?.toLowerCase() || "";
        } catch (e) {
            const match = cleanUrl.match(/utm_source=([^&]+)/i);
            if (match) utmSource = decodeURIComponent(match[1]).toLowerCase();
        }
    }

    if (utmSource) {
        if (utmSource.includes("kakao")) return { siteName: "카카오톡 (UTM)", domain: "kakaotalk", category: "kakao" };
        if (utmSource.includes("insta")) return { siteName: "인스타그램 (UTM)", domain: "instagram.com", category: "social" };
        if (utmSource.includes("face") || utmSource.includes("fb")) return { siteName: "페이스북 (UTM)", domain: "facebook.com", category: "social" };
        if (utmSource.includes("naver") || utmSource.includes("blog")) return { siteName: "네이버 (UTM)", domain: "naver.com", category: "naver" };
        if (utmSource.includes("sms") || utmSource.includes("mms") || utmSource.includes("msg") || utmSource.includes("text")) return { siteName: "문자 메시지 (SMS)", domain: "sms", category: "direct" };
        if (utmSource.includes("google")) return { siteName: "구글 (UTM)", domain: "google.com", category: "google" };
        if (utmSource.includes("youtube")) return { siteName: "유튜브 (UTM)", domain: "youtube.com", category: "youtube" };
        if (utmSource.includes("band")) return { siteName: "네이버 밴드 (UTM)", domain: "band.us", category: "naver" };
        return { siteName: `캠페인/광고 (${utmSource})`, domain: utmSource, category: "campaign" };
    }

    // 2. 자사 내부 도메인, 로컬호스트 또는 direct 여부 판별
    let isInternalOrDirect = !cleanUrl || cleanUrl === "direct";
    let hostname = "";
    if (cleanUrl && !isInternalOrDirect) {
        try {
            if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
                const parsed = new URL(cleanUrl);
                hostname = parsed.hostname.toLowerCase();
            } else {
                hostname = cleanUrl.split("/")[0].toLowerCase();
            }
        } catch (e) {
            hostname = cleanUrl.toLowerCase();
        }

        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname.includes("sono-partners.com") ||
            hostname.includes("vercel.app")
        ) {
            isInternalOrDirect = true;
        }
    }

    // 3. 내부 이동이거나 직접 유입인 경우 -> User-Agent로 인앱 브라우저(카카오톡, 인스타 등) 확인
    if (isInternalOrDirect) {
        if (ua.includes("kakaotalk")) {
            return { siteName: "카카오톡 (인앱)", domain: "kakaotalk", category: "kakao" };
        }
        if (ua.includes("instagram")) {
            return { siteName: "인스타그램 (인앱)", domain: "instagram.com", category: "social" };
        }
        if (ua.includes("fban") || ua.includes("fbav") || ua.includes("fb_iab")) {
            return { siteName: "페이스북 (인앱)", domain: "facebook.com", category: "social" };
        }
        if (ua.includes("naver(inapp)")) {
            return { siteName: "네이버 앱 (인앱)", domain: "naver.com", category: "naver" };
        }
        if (ua.includes("line/")) {
            return { siteName: "라인 (인앱)", domain: "line.me", category: "social" };
        }
        if (ua.includes("band/")) {
            return { siteName: "네이버 밴드 (인앱)", domain: "band.us", category: "naver" };
        }
        if (ua.includes("daumapps")) {
            return { siteName: "다음 앱 (인앱)", domain: "daum.net", category: "daum" };
        }
        if (ua.includes("twitter") || ua.includes("tweet") || ua.includes("x/")) {
            return { siteName: "X (트위터)", domain: "x.com", category: "social" };
        }
        if (ua.includes("tiktok")) {
            return { siteName: "틱톡 (인앱)", domain: "tiktok.com", category: "social" };
        }
        return { siteName: "직접 유입 (Direct / 문자 등)", domain: "direct", category: "direct" };
    }

    // 4. 외부 유입 사이트 판별
    if (hostname.includes("naver.com")) {
        if (hostname.includes("search.naver.com") || hostname.includes("m.search.naver.com")) {
            return { siteName: "네이버 통합검색", domain: hostname, category: "naver" };
        }
        if (hostname.includes("blog.naver.com") || hostname.includes("m.blog.naver.com")) {
            return { siteName: "네이버 블로그", domain: hostname, category: "naver" };
        }
        if (hostname.includes("cafe.naver.com") || hostname.includes("m.cafe.naver.com")) {
            return { siteName: "네이버 카페", domain: hostname, category: "naver" };
        }
        if (hostname.includes("kin.naver.com")) {
            return { siteName: "네이버 지식iN", domain: hostname, category: "naver" };
        }
        return { siteName: "네이버 (NAVER)", domain: hostname, category: "naver" };
    }
    if (hostname.includes("google")) {
        return { siteName: "구글 (Google)", domain: hostname, category: "google" };
    }
    if (hostname.includes("daum.net") || hostname.includes("daum.co.kr")) {
        return { siteName: "다음 (Daum)", domain: hostname, category: "daum" };
    }
    if (hostname.includes("kakao")) {
        return { siteName: "카카오 (Kakao)", domain: hostname, category: "kakao" };
    }
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        return { siteName: "유튜브 (YouTube)", domain: hostname, category: "youtube" };
    }
    if (hostname.includes("instagram.com")) {
        return { siteName: "인스타그램 (Instagram)", domain: hostname, category: "social" };
    }
    if (hostname.includes("facebook.com")) {
        return { siteName: "페이스북 (Facebook)", domain: hostname, category: "social" };
    }
    if (hostname.includes("t.co") || hostname.includes("twitter.com") || hostname.includes("x.com")) {
        return { siteName: "X (트위터)", domain: hostname, category: "social" };
    }
    if (hostname === "direct" || hostname === "localhost" || hostname === "127.0.0.1") {
        return { siteName: "직접 유입 (Direct)", domain: hostname, category: "direct" };
    }

    return { siteName: hostname || "기타 외부 사이트", domain: hostname || cleanUrl, category: "external" };
}

// 페이지뷰/방문 기록 (IP 및 Referrer 수집 추가)
export const recordHit = mutation({
    args: {
        partnerId: v.string(),
        path: v.string(),
        visitorId: v.string(),
        userAgent: v.optional(v.string()),
        referrer: v.optional(v.string()),
        ip: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = new Date();
        const kstDate = getKSTDateStr(now); // 대한민국 표준시 기준 YYYY-MM-DD

        let partnerId = (args.partnerId || "main").trim();

        // customUrl이 전달되었을 경우 정규 partnerId로 변환
        if (partnerId !== "main") {
            const partner = await ctx.db
                .query("partners")
                .withIndex("by_customUrl", (q) => q.eq("customUrl", partnerId))
                .first();
            if (partner) {
                partnerId = partner.partnerId;
            }
        }

        await ctx.db.insert("analytics", {
            partnerId: partnerId,
            date: kstDate,
            path: args.path,
            visitorId: args.visitorId,
            userAgent: args.userAgent,
            referrer: args.referrer,
            ip: args.ip,
            createdAt: now.toISOString(),
        });
    },
});

// 통계 데이터 요약 조회 (관리자용 - 한국시간 KST 적용 + Referrer / IP 집계 포함)
export const getStatsSummary = query({
    args: {
        startDate: v.optional(v.string()), // YYYY-MM-DD (KST)
        endDate: v.optional(v.string()),   // YYYY-MM-DD (KST)
        partnerId: v.optional(v.string()), // 특정 파트너 필터
    },
    handler: async (ctx, args) => {
        // 1. 데이터 수집 및 전처리를 위한 맵 구성
        const allPartners = await ctx.db.query("partners").collect();
        const idMap: Record<string, string> = {};
        allPartners.forEach(p => {
            const pid = p.partnerId.trim();
            idMap[pid.toLowerCase()] = pid;
            if (p.customUrl) {
                idMap[p.customUrl.trim().toLowerCase()] = pid;
            }
        });

        // 2. 데이터 수집 (지수 사용 최적화)
        const rawLogs = await (args.startDate 
            ? ctx.db.query("analytics").withIndex("by_date", (q) => q.gte("date", args.startDate!))
            : ctx.db.query("analytics")
        ).collect();

        // 3. 필터링 및 집계
        const dailyStats: Record<string, { pv: number, uv: Set<string> }> = {};
        const partnerStats: Record<string, { pv: number, uv: Set<string> }> = {};
        const pathStats: Record<string, { pv: number, uv: Set<string> }> = {};
        const referrerStats: Record<string, { siteName: string; domain: string; pv: number; uv: Set<string>; category: string }> = {};
        const ipStats: Record<string, { ip: string; pv: number; uv: Set<string>; lastPath: string; lastTime: string }> = {};
        const applicationStats: Record<string, number> = {}; // daily app count (KST)
        const partnerAppStats: Record<string, number> = {}; // partner total app count
        let totalPv = 0;
        let totalApps = 0;
        const totalUvSet = new Set<string>();

        // 시작일/종료일 기준 모든 날짜 KST 기준 연속 초기화
        if (args.startDate && args.endDate) {
            const startParts = args.startDate.split("-").map(Number);
            const endParts = args.endDate.split("-").map(Number);
            
            let curr = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
            const end = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
            
            let count = 0;
            while (curr <= end && count < 60) {
                const year = curr.getUTCFullYear();
                const month = String(curr.getUTCMonth() + 1).padStart(2, "0");
                const day = String(curr.getUTCDate()).padStart(2, "0");
                const dStr = `${year}-${month}-${day}`;
                
                dailyStats[dStr] = { pv: 0, uv: new Set() };
                curr.setUTCDate(curr.getUTCDate() + 1);
                count++;
            }
        }

        rawLogs.forEach(log => {
            // log.date (KST 저장분) 또는 log.createdAt KST 변환
            const logKstDate = log.date && log.date.length === 10 ? log.date : getKSTDateStr(log.createdAt);

            // 날짜 범위 확인 (endDate 필터링 - KST 기준)
            if (args.endDate && logKstDate > args.endDate) return;
            if (args.startDate && logKstDate < args.startDate) return;

            // 파트너 ID 정규화
            const logId = log.partnerId.trim().toLowerCase();
            const normalizedPid = idMap[logId] || log.partnerId.trim();
            
            // 파트너 필터 확인
            if (args.partnerId && normalizedPid !== args.partnerId) return;

            totalPv++;
            totalUvSet.add(log.visitorId);

            // 일별 통계 (KST 기준)
            if (!dailyStats[logKstDate]) dailyStats[logKstDate] = { pv: 0, uv: new Set() };
            dailyStats[logKstDate].pv++;
            dailyStats[logKstDate].uv.add(log.visitorId);

            // 파트너별 통계
            if (!partnerStats[normalizedPid]) partnerStats[normalizedPid] = { pv: 0, uv: new Set() };
            partnerStats[normalizedPid].pv++;
            partnerStats[normalizedPid].uv.add(log.visitorId);

            // 페이지별 통계
            const path = log.path || "/";
            if (!pathStats[path]) pathStats[path] = { pv: 0, uv: new Set() };
            pathStats[path].pv++;
            pathStats[path].uv.add(log.visitorId);

            // 유입 사이트 통계 (User-Agent 기반 인앱 브라우저 분석 포함)
            const refInfo = parseReferrerSite(log.referrer, log.userAgent);
            const refKey = refInfo.domain;
            if (!referrerStats[refKey]) {
                referrerStats[refKey] = {
                    siteName: refInfo.siteName,
                    domain: refInfo.domain,
                    category: refInfo.category,
                    pv: 0,
                    uv: new Set(),
                };
            }
            referrerStats[refKey].pv++;
            referrerStats[refKey].uv.add(log.visitorId);

            // IP별 통계
            const ipKey = (log.ip || "미수집").trim();
            if (!ipStats[ipKey]) {
                ipStats[ipKey] = {
                    ip: ipKey,
                    pv: 0,
                    uv: new Set(),
                    lastPath: path,
                    lastTime: log.createdAt,
                };
            }
            ipStats[ipKey].pv++;
            ipStats[ipKey].uv.add(log.visitorId);
            if (log.createdAt > ipStats[ipKey].lastTime) {
                ipStats[ipKey].lastPath = path;
                ipStats[ipKey].lastTime = log.createdAt;
            }
        });

        // 4. 신청 통계 수집 (대한민국 표준시 KST 변환 기준)
        const allApps = await ctx.db.query("applications").collect();
        allApps.forEach(app => {
            const appDateKST = getKSTDateStr(app.createdAt || app.registrationDate);

            if (args.startDate && appDateKST < args.startDate) return;
            if (args.endDate && appDateKST > args.endDate) return;
            
            const appPartnerId = app.partnerId ? app.partnerId.trim() : "";
            if (args.partnerId && appPartnerId !== args.partnerId) return;

            totalApps++;
            applicationStats[appDateKST] = (applicationStats[appDateKST] || 0) + 1;
            if (appPartnerId) {
                partnerAppStats[appPartnerId] = (partnerAppStats[appPartnerId] || 0) + 1;
            }
        });

        // 5. 결과 포맷팅
        const daily = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            pv: stats.pv,
            uv: stats.uv.size,
            apps: applicationStats[date] || 0
        })).sort((a, b) => a.date.localeCompare(b.date));

        const partner = Object.entries(partnerStats).map(([pid, stats]) => ({
            partnerId: pid,
            pv: stats.pv,
            uv: stats.uv.size,
            apps: partnerAppStats[pid] || 0
        })).sort((a, b) => b.pv - a.pv);

        const paths = Object.entries(pathStats).map(([path, stats]) => ({
            path,
            pv: stats.pv,
            uv: stats.uv.size
        })).sort((a, b) => b.pv - a.pv);

        const referrers = Object.values(referrerStats).map(r => ({
            siteName: r.siteName,
            domain: r.domain,
            category: r.category,
            pv: r.pv,
            uv: r.uv.size,
            percentage: totalPv > 0 ? Math.round((r.pv / totalPv) * 1000) / 10 : 0
        })).sort((a, b) => b.pv - a.pv);

        const ips = Object.values(ipStats).map(i => ({
            ip: i.ip,
            pv: i.pv,
            uv: i.uv.size,
            lastPath: i.lastPath,
            lastTime: i.lastTime,
            percentage: totalPv > 0 ? Math.round((i.pv / totalPv) * 1000) / 10 : 0
        })).sort((a, b) => b.pv - a.pv);

        return {
            totalPv,
            totalUv: totalUvSet.size,
            totalApps,
            daily,
            partner,
            paths,
            referrers,
            ips
        };
    },
});

// 특정 선택 일자(YYYY-MM-DD)의 유입 사이트, IP 및 상세 로그 조회
export const getDailyDetailLogs = query({
    args: {
        date: v.string(), // YYYY-MM-DD
        partnerId: v.optional(v.string()), // 특정 파트너 필터
    },
    handler: async (ctx, args) => {
        if (!args.date) {
            return {
                date: "",
                totalPv: 0,
                totalUv: 0,
                totalUniqueIps: 0,
                referrers: [],
                ips: [],
                logs: [],
            };
        }

        // 파트너 정보 맵 준비
        const allPartners = await ctx.db.query("partners").collect();
        const partnerNameMap = new Map<string, string>();
        allPartners.forEach(p => {
            partnerNameMap.set(p.partnerId, p.companyName);
            if (p.customUrl) {
                partnerNameMap.set(p.customUrl, p.companyName);
            }
        });

        // 날짜별 인덱스로 로그 수집
        let rawLogs = await ctx.db
            .query("analytics")
            .withIndex("by_date", (q) => q.eq("date", args.date))
            .collect();

        // 파트너 필터링
        if (args.partnerId) {
            const targetPid = args.partnerId.trim().toLowerCase();
            rawLogs = rawLogs.filter(log => {
                const pid = log.partnerId.trim().toLowerCase();
                return pid === targetPid;
            });
        }

        // 최근 시각순 정렬
        rawLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPv = rawLogs.length;
        const totalUvSet = new Set<string>();
        const referrerMap: Record<string, { siteName: string; domain: string; rawUrls: Set<string>; pv: number; uvSet: Set<string>; category: string }> = {};
        const ipMap: Record<string, { ip: string; pv: number; uvSet: Set<string>; lastPath: string; lastTime: string }> = {};

        const enrichedLogs = rawLogs.map(log => {
            totalUvSet.add(log.visitorId);

            const refInfo = parseReferrerSite(log.referrer, log.userAgent);
            const refDomain = refInfo.domain;

            if (!referrerMap[refDomain]) {
                referrerMap[refDomain] = {
                    siteName: refInfo.siteName,
                    domain: refInfo.domain,
                    rawUrls: new Set(),
                    category: refInfo.category,
                    pv: 0,
                    uvSet: new Set(),
                };
            }
            referrerMap[refDomain].pv++;
            referrerMap[refDomain].uvSet.add(log.visitorId);
            if (log.referrer && !log.referrer.includes("sono-partners.com") && !log.referrer.includes("localhost")) {
                referrerMap[refDomain].rawUrls.add(log.referrer);
            }

            const ipKey = (log.ip || "미수집").trim();
            if (!ipMap[ipKey]) {
                ipMap[ipKey] = {
                    ip: ipKey,
                    pv: 0,
                    uvSet: new Set(),
                    lastPath: log.path || "/",
                    lastTime: log.createdAt,
                };
            }
            ipMap[ipKey].pv++;
            ipMap[ipKey].uvSet.add(log.visitorId);
            if (log.createdAt > ipMap[ipKey].lastTime) {
                ipMap[ipKey].lastPath = log.path || "/";
                ipMap[ipKey].lastTime = log.createdAt;
            }

            return {
                _id: log._id,
                partnerId: log.partnerId,
                partnerName: partnerNameMap.get(log.partnerId) || log.partnerId,
                path: log.path,
                visitorId: log.visitorId,
                userAgent: log.userAgent,
                referrer: log.referrer || "",
                siteName: refInfo.siteName,
                domain: refInfo.domain,
                category: refInfo.category,
                ip: log.ip || "미수집",
                createdAt: log.createdAt,
            };
        });

        const referrers = Object.values(referrerMap).map(r => ({
            siteName: r.siteName,
            domain: r.domain,
            rawUrls: Array.from(r.rawUrls).slice(0, 5),
            category: r.category,
            pv: r.pv,
            uv: r.uvSet.size,
            percentage: totalPv > 0 ? Math.round((r.pv / totalPv) * 1000) / 10 : 0
        })).sort((a, b) => b.pv - a.pv);

        const ips = Object.values(ipMap).map(i => ({
            ip: i.ip,
            pv: i.pv,
            uv: i.uvSet.size,
            lastPath: i.lastPath,
            lastTime: i.lastTime,
            percentage: totalPv > 0 ? Math.round((i.pv / totalPv) * 1000) / 10 : 0
        })).sort((a, b) => b.pv - a.pv);

        return {
            date: args.date,
            totalPv,
            totalUv: totalUvSet.size,
            totalUniqueIps: Object.keys(ipMap).length,
            referrers,
            ips,
            logs: enrichedLogs,
        };
    },
});

// 데이터가 없을 때 데모/테스트용 유입 샘플 데이터 생성 도구
export const seedSampleAnalytics = mutation({
    args: {
        date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const targetDate = args.date || getKSTDateStr();
        const samplePartners = await ctx.db.query("partners").collect();
        const partnerIds = samplePartners.map(p => p.partnerId);
        if (partnerIds.length === 0) partnerIds.push("P-SAMPLE01", "P-SAMPLE02");

        const sampleReferrers = [
            "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=소노아임레디",
            "https://m.search.naver.com/search.naver?query=소노파트너스몰",
            "https://blog.naver.com/sono_official/223456789",
            "https://www.google.com/search?q=sono+partner+platform",
            "https://search.daum.net/search?w=tot&DA=23A&rtmaxcoll=Z8T&q=소노라이프",
            "https://m.kin.naver.com/mobile/qna/detail.naver?d1id=4&dirId=401",
            "https://www.instagram.com/p/C8xXyZ123/",
            "",
            "",
        ];

        const sampleIps = [
            "121.134.45.12",
            "211.234.110.88",
            "175.209.64.103",
            "118.32.19.240",
            "220.89.141.5",
            "58.120.91.77",
            "112.170.8.219"
        ];

        const samplePaths = ["/", "/p/partner1", "/p/partner2", "/inquiry", "/products", "/disclosure"];

        const createdCount = 15;
        for (let i = 0; i < createdCount; i++) {
            const partnerId = partnerIds[i % partnerIds.length];
            const referrer = sampleReferrers[i % sampleReferrers.length];
            const ip = sampleIps[i % sampleIps.length];
            const path = samplePaths[i % samplePaths.length];
            const visitorId = "v_seed_" + (i % 8);
            
            const hour = String(Math.floor(8 + (i * 0.8))).padStart(2, "0");
            const minute = String((i * 17) % 60).padStart(2, "0");
            const second = String((i * 23) % 60).padStart(2, "0");
            const timestamp = `${targetDate}T${hour}:${minute}:${second}.000Z`;

            await ctx.db.insert("analytics", {
                partnerId,
                date: targetDate,
                path,
                visitorId,
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                referrer: referrer || undefined,
                ip,
                createdAt: timestamp,
            });
        }

        return { success: true, count: createdCount, date: targetDate };
    },
});
