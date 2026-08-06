import { query, mutation, action, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

function determineCategory(modelName: string, model: string, categoryCode: string, caName: string): string {
    const cleanName = modelName.toLowerCase().replace(/\s/g, "");
    const rawModel = model.toUpperCase().replace(/\s/g, "");
    const cleanCa = caName.toLowerCase();

    // 0. 애플 브랜드 판별 (애플 제품은 TV/디지털로 분류)
    const isApple = cleanName.includes("애플") || cleanName.includes("apple") || cleanName.includes("ipad") || cleanName.includes("아이패드") || cleanName.includes("macbook") || cleanName.includes("맥북") || cleanName.includes("아이맥") || cleanName.includes("imac") || cleanName.includes("에어팟") || cleanName.includes("airpods") || cleanName.includes("iphone") || cleanName.includes("아이폰");
    if (isApple) {
        return "TV/디지털";
    }

    // 타 카테고리 오인식 방지용 키워드 정의
    const isWashing = cleanName.includes("세탁기") || cleanName.includes("건조기") || cleanName.includes("워시타워") || cleanName.includes("스타일러") || cleanName.includes("에어드레서") || cleanName.includes("의류건조");
    const isAircon = cleanName.includes("에어컨") || cleanName.includes("시스템에어컨") || cleanName.includes("창문형에어컨") || cleanName.includes("휘센") || cleanName.includes("에어로") || cleanName.includes("풍클래식") || cleanCa.includes("에어컨");
    const isFridge = cleanName.includes("냉장고") || cleanName.includes("김치냉장고") || cleanName.includes("냉동고") || cleanName.includes("와인셀러") || cleanName.includes("쇼케이스") || cleanCa.includes("냉장고");
    const isKitchen = cleanName.includes("인덕션") || cleanName.includes("정수기") || cleanName.includes("식기세척기") || cleanName.includes("식세기") || cleanName.includes("오븐") || cleanName.includes("전자레인지") || cleanName.includes("전기레인지") || cleanName.includes("쿡탑") || cleanName.includes("밥솥") || cleanName.includes("에어프라이어") || cleanName.includes("큐커") || cleanName.includes("음식물");
    const isBeautyHealth = cleanName.includes("안마") || cleanName.includes("마사지") || cleanName.includes("뷰티") || cleanName.includes("프라엘") || cleanName.includes("이온수") || cleanName.includes("비데") || cleanName.includes("헤어드라이") || cleanName.includes("메디큐브") || cleanCa.includes("안마") || cleanCa.includes("뷰티");
    const isFurniture = (cleanName.includes("침대") || cleanName.includes("매트리스") || cleanName.includes("프레임") || 
        cleanName.includes("소파") || cleanName.includes("식탁") || cleanName.includes("테이블") || 
        cleanName.includes("서랍장") || (cleanName.includes("의자") && !cleanName.includes("안마")) || cleanName.includes("가구") || 
        cleanName.includes("장롱") || cleanName.includes("러그") || cleanName.includes("침구") || 
        cleanName.includes("이불") || cleanName.includes("소노시즌") || cleanName.includes("어드밴스") || cleanCa.includes("침대") || cleanCa.includes("소파") || cleanCa.includes("가구")) && !isBeautyHealth;
    const isLaptopTablet = cleanName.includes("노트북") || cleanName.includes("그램") || cleanName.includes("맥북") || cleanName.includes("갤럭시북") || cleanName.includes("아이패드") || cleanName.includes("ipad") || cleanName.includes("태블릿") || cleanName.includes("갤럭시탭") || cleanName.includes("컴퓨터") || cleanName.includes("pc");
    if (isLaptopTablet) {
        return "TV/디지털";
    }

    // 1. ca_name 기준 매핑 (가장 정확한 대분류)
    if (cleanCa.includes("tv") || cleanCa.includes("티비") || cleanCa.includes("텔레비전") || cleanCa.includes("방송")) {
        if (!isLaptopTablet && !isFurniture && !isWashing) {
            return "TV/디지털";
        }
    }
    if (cleanCa.includes("냉장고") || cleanCa.includes("김치냉장고") || cleanCa.includes("냉동고") || cleanCa.includes("와인")) {
        return "냉장가전";
    }
    if (cleanCa.includes("에어컨") || cleanCa.includes("시스템에어컨") || cleanCa.includes("냉난방기")) {
        return "에어컨/에어케어";
    }
    if (cleanCa.includes("세탁기") || cleanCa.includes("건조기") || cleanCa.includes("스타일러") || cleanCa.includes("의류건조") || cleanCa.includes("워시타워") || cleanCa.includes("에어드레서")) {
        return "세탁가전";
    }
    if (cleanCa.includes("정수기") || cleanCa.includes("식기세척기") || cleanCa.includes("인덕션") || cleanCa.includes("전기레인지") || cleanCa.includes("오븐") || cleanCa.includes("식세기") || cleanCa.includes("쿡탑")) {
        return "주방가전";
    }
    if (cleanCa.includes("안마") || cleanCa.includes("뷰티") || cleanCa.includes("마사지") || cleanCa.includes("프라엘") || cleanCa.includes("비데") || cleanCa.includes("이온수")) {
        return "건강/뷰티";
    }
    if (cleanCa.includes("침대") || cleanCa.includes("매트리스") || cleanCa.includes("소파") || cleanCa.includes("가구") || cleanCa.includes("테이블") || cleanCa.includes("의자") || cleanCa.includes("소노시즌")) {
        return "가구/침대";
    }
    if (cleanCa.includes("청소기") || cleanCa.includes("공기청정기") || cleanCa.includes("가습기") || cleanCa.includes("제습기") || cleanCa.includes("로봇청소기")) {
        return "생활가전";
    }

    // 2. 건강/뷰티 키워드 매핑
    if (isBeautyHealth) {
        return "건강/뷰티";
    }

    // 3. 가구/침대 키워드 매핑
    if (isFurniture) {
        return "가구/침대";
    }

    // 4. 세탁가전 키워드 매핑
    if (isWashing || rawModel.startsWith("WF") || rawModel.startsWith("DV") || rawModel.startsWith("RD") || 
        rawModel.startsWith("W20") || rawModel.startsWith("F2") || rawModel.startsWith("W1") || rawModel.startsWith("FG")) {
        return "세탁가전";
    }

    // 5. 에어컨/에어케어 키워드 매핑
    if (isAircon || rawModel.startsWith("FQ") || rawModel.startsWith("AF")) {
        return "에어컨/에어케어";
    }

    // 6. TV/디지털 키워드 매핑 (노트북/태블릿 오인식 방지 포함)
    const hasTvModelPrefix = rawModel.startsWith("KU") || rawModel.startsWith("KQ") || rawModel.startsWith("QN") || rawModel.startsWith("UN") || rawModel.startsWith("OLED") || rawModel.startsWith("QNED");
    const hasTvNameKeyword = cleanName.includes("tv") || cleanName.includes("oled") || cleanName.includes("qled") || cleanName.includes("uhd") || cleanName.includes("나노셀") || cleanName.includes("모니터") || cleanName.includes("스탠바이미");
    const isTvByInches = cleanName.includes("인치") && !isLaptopTablet;
    const isTvByModelNumber = rawModel.match(/^[0-9]/) && !isLaptopTablet && !isFurniture && !isWashing && !isFridge && !isKitchen && !isBeautyHealth;

    if (hasTvModelPrefix || hasTvNameKeyword || isTvByInches || isTvByModelNumber) {
        if (!isLaptopTablet && !isFurniture && !isWashing && !isFridge && !isKitchen && !isBeautyHealth) {
            return "TV/디지털";
        }
    }

    // 7. 냉장가전 키워드 매핑
    if (isFridge || rawModel.startsWith("RF") || rawModel.startsWith("RS") || rawModel.startsWith("RQ") || rawModel.startsWith("RH") || rawModel.startsWith("M8") || rawModel.startsWith("J8")) {
        return "냉장가전";
    }

    // 8. 주방가전 키워드 매핑
    if (isKitchen) {
        return "주방가전";
    }

    // 9. 생활가전 키워드 매핑
    if (cleanName.includes("청소기") || cleanName.includes("공기청정기") || cleanName.includes("가습기") || cleanName.includes("제습기") || 
        cleanName.includes("코드제로") || cleanName.includes("로보락") || cleanName.includes("청소") || cleanName.includes("로봇청소기") || 
        cleanName.includes("선풍기") || cleanName.includes("써큘레이터") || cleanName.includes("온수매트")) {
        return "생활가전";
    }

    // 10. 카테고리 코드 기반 매핑
    if (categoryCode.startsWith("008002")) return "냉장가전";
    if (categoryCode.startsWith("008003")) return "주방가전";
    if (categoryCode.startsWith("008004")) return "생활가전";
    if (categoryCode.startsWith("008005")) return "TV/디지털";

    return "기타가전";
}

// 모든 상품 조회 (클라이언트 호환성을 위해 인자 제거)
function escapeRegex(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cleanBrandDeduplication(rawProdName: string, brandName: string): string {
    if (!rawProdName) return "";
    let name = rawProdName.trim();
    const brand = (brandName || "").trim();

    // 1. 이미 [브랜드] 태그가 포함된 경우 (예: [삼성] 삼성 85인치... -> [삼성] 85인치...)
    if (name.startsWith("[")) {
        const match = name.match(/^\[([^\]]+)\]\s*(.*)/);
        if (match) {
            const tag = match[1].trim();
            let rest = match[2].trim();
            if (tag) {
                const regex = new RegExp(`^${escapeRegex(tag)}\\s*`, 'i');
                if (regex.test(rest)) {
                    rest = rest.replace(regex, '');
                }
            }
            return `[${tag}] ${rest}`;
        }
    }

    // 2. [브랜드] 태그가 없는 경우 (예: 삼성 85인치... -> [삼성] 85인치...)
    if (brand && brand !== "기타") {
        const regex = new RegExp(`^${escapeRegex(brand)}\\s*`, 'i');
        if (regex.test(name)) {
            name = name.replace(regex, '');
        }
        return `[${brand}] ${name}`;
    }

    return name;
}

export const get = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("products").collect();
        const cleaned = all.map(p => ({
            ...p,
            name: cleanBrandDeduplication(p.name, p.brand)
        }));
        // Sort by order (ascending), then by name as fallback
        return cleaned.sort((a, b) => {
            if ((a.order ?? 0) !== (b.order ?? 0)) {
                return (a.order ?? 0) - (b.order ?? 0);
            }
            return a.name.localeCompare(b.name);
        });
    },
});

// 상품 추가 또는 업데이트
export const upsert = mutation({
    args: {
        id: v.optional(v.id("products")),
        brand: v.string(),
        model: v.string(),
        name: v.string(),
        category: v.string(),
        slotCount: v.number(),
        monthlyPayment: v.number(),
        cardDiscountPayment: v.number(),
        image: v.string(),
        isVisible: v.boolean(),
        hasGift: v.boolean(),
        isBest: v.optional(v.boolean()),
        order: v.optional(v.number()),
        promotionId: v.optional(v.union(v.id("promotions"), v.null())),
        careProductId: v.optional(v.union(v.id("careProducts"), v.null())),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        const now = new Date().toISOString();
        if (id) {
            await ctx.db.patch(id, { ...data, updatedAt: now });
            return id;
        } else {
            return await ctx.db.insert("products", {
                ...data,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

// 가시성 토글
export const toggleVisibility = mutation({
    args: { id: v.id("products"), isVisible: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isVisible: args.isVisible, updatedAt: new Date().toISOString() });
    },
});

// 사은품 여부 토글
export const toggleGift = mutation({
    args: { id: v.id("products"), hasGift: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { hasGift: args.hasGift, updatedAt: new Date().toISOString() });
    },
});

// 베스트 여부 토글 (베스트 선택 시 목록 맨 위로 자동 이동)
export const toggleBest = mutation({
    args: { id: v.id("products"), isBest: v.boolean() },
    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.id);
        if (!product) return;

        const now = new Date().toISOString();

        if (args.isBest) {
            // 동일 그룹(동일 플랜 또는 구좌)의 제품 목록 가져오기
            const allProducts = await ctx.db.query("products").collect();
            const sameGroup = allProducts
                .filter(p => {
                    if (product.careProductId && p.careProductId) return p.careProductId === product.careProductId;
                    return (p.slotCount || 4) === (product.slotCount || 4);
                })
                .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

            // 다른 제품들의 order를 2부터 순차 할당하고 선택된 제품을 order: 1로 맨 위 배치
            let nextOrder = 2;
            for (const p of sameGroup) {
                if (p._id === args.id) continue;
                await ctx.db.patch(p._id, { order: nextOrder++, updatedAt: now });
            }

            await ctx.db.patch(args.id, { isBest: true, order: 1, updatedAt: now });
        } else {
            await ctx.db.patch(args.id, { isBest: false, updatedAt: now });
        }
    },
});

// 순서 업데이트
export const updateOrder = mutation({
    args: { 
        id: v.id("products"), 
        order: v.number() 
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { 
            order: args.order, 
            updatedAt: new Date().toISOString() 
        });
    },
});

// 여러 제품 순서 일괄 업데이트 (드래그앤드롭 순서 변경)
export const reorderProducts = mutation({
    args: {
        orderedIds: v.array(v.id("products")),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        for (let i = 0; i < args.orderedIds.length; i++) {
            await ctx.db.patch(args.orderedIds[i], {
                order: i + 1,
                updatedAt: now,
            });
        }
    },
});

// 프로모션 업데이트
export const updatePromotion = mutation({
    args: { 
        id: v.id("products"), 
        promotionId: v.optional(v.union(v.id("promotions"), v.null())) 
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { 
            promotionId: args.promotionId, 
            updatedAt: new Date().toISOString() 
        });
    },
});

// 상품 삭제
export const remove = mutation({
    args: { id: v.id("products") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// 상품 일괄 삭제
export const removeMany = mutation({
    args: { ids: v.array(v.id("products")) },
    handler: async (ctx, args) => {
        for (const id of args.ids) {
            await ctx.db.delete(id);
        }
    },
});

// 구좌별 제휴카드 금액 일괄 설정
export const bulkUpdateCardDiscount = mutation({
    args: {
        updates: v.array(v.object({
            slotCount: v.number(),
            cardDiscountPayment: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        const allProducts = await ctx.db.query("products").collect();
        
        for (const update of args.updates) {
            const targets = allProducts.filter(p => p.slotCount === update.slotCount);
            for (const p of targets) {
                await ctx.db.patch(p._id, {
                    cardDiscountPayment: update.cardDiscountPayment,
                    updatedAt: now,
                });
            }
        }
    },
});

// 상품 데이터 초기화 (Seed/Import)
export const seed = mutation({
    args: {
        products: v.array(
            v.object({
                brand: v.string(),
                model: v.string(),
                name: v.string(),
                category: v.string(),
                slotCount: v.number(),
                monthlyPayment: v.number(),
                cardDiscountPayment: v.number(),
                image: v.string(),
                isVisible: v.boolean(),
                hasGift: v.boolean(),
                isBest: v.optional(v.boolean()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        // 기존 데이터 삭제 
        const existing = await ctx.db.query("products").collect();
        for (const p of existing) {
            await ctx.db.delete(p._id);
        }

        // 새 데이터 추가
        for (const p of args.products) {
            await ctx.db.insert("products", {
                ...p,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

export const syncFromBilligo = action({
    args: {},
    handler: async (ctx) => {
        const url = "https://xn--299ar6vqrd.com/api/v2/models?ca_id=035&filter_seller[]=AP-100045&section=models&list_size=200";
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch from Billigo: ${res.status}`);
        }
        const data = await res.json();
        
        if (!data.Lists || !Array.isArray(data.Lists)) {
            throw new Error("Invalid format from Billigo API");
        }

        const products = data.Lists.map((item: any, i: number) => {
            // Extract brand using regex like [애플]
            const brandMatch = item.model_name.match(/^\[(.*?)\]/);
            const brand = brandMatch ? brandMatch[1] : "기타";
            
            // Map categories based on primary_category_code or keywords in model_name
            const code = item.primary_category_code || "";
            const category = determineCategory(
                item.model_name || "",
                item.model || "",
                code,
                item.ca_name || ""
            );
            
            return {
                brand: brand,
                model: item.model || "모델명 없음",
                name: item.model_name || "상품명 없음",
                category: category,
                slotCount: parseInt(item.goods_add_gcodes) || 4,
                monthlyPayment: parseInt(item.goods_price) || 0,
                cardDiscountPayment: parseInt(item.model_sale_price) || 0,
                image: item.model_thumnail_url || "",
                isVisible: true,
                hasGift: false,
                order: i + 1, // 초기 순서 할당
            };
        });

        await ctx.runMutation(internal.products.replaceProducts, { products });
    }
});

export const replaceProducts = internalMutation({
    args: {
        products: v.array(
            v.object({
                brand: v.string(),
                model: v.string(),
                name: v.string(),
                category: v.string(),
                slotCount: v.number(),
                monthlyPayment: v.number(),
                cardDiscountPayment: v.number(),
                image: v.string(),
                isVisible: v.boolean(),
                hasGift: v.boolean(),
                isBest: v.optional(v.boolean()),
                order: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        
        // 기존 데이터 삭제 
        const existing = await ctx.db.query("products").collect();
        for (const p of existing) {
            await ctx.db.delete(p._id);
        }

        // 새 데이터 추가
        for (const p of args.products) {
            await ctx.db.insert("products", {
                ...p,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

// 상품(플랜)별 제품 동기화 액션
export const syncProductsForPlan = action({
    args: {
        planId: v.id("careProducts"),
    },
    handler: async (ctx, args) => {
        // 1. plan 정보 조회
        const plan = await ctx.runQuery(api.careProducts.getById, { id: args.planId });
        if (!plan) {
            throw new Error("상품 정보가 존재하지 않습니다.");
        }
        if (!plan.syncUrl) {
            throw new Error("동기화 URL이 등록되지 않은 상품입니다.");
        }
        
        // 2. URL 수집 및 다중 URL 분리 처리
        const rawSyncUrl = plan.syncUrl || "";
        const syncUrls = rawSyncUrl.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);

        if (syncUrls.length === 0) {
            throw new Error("동기화 URL이 등록되지 않은 상품입니다.");
        }

        console.log(`Fetching ${syncUrls.length} syncUrl(s) for plan:`, plan.name);

        let combinedLists: any[] = [];
        let errorMessages: string[] = [];

        const requestHeaders = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
        };

        for (let idx = 0; idx < syncUrls.length; idx++) {
            const rawUrl = syncUrls[idx];
            
            // Candidate URL 목록 생성 (사용자가 웹페이지 주소나 bizinno.kr 등을 입력한 경우 API 엔드포인트 자동 변환)
            const trimmedUrl = rawUrl.trim();

            // 0) bizinno.kr 전용 Supabase REST API 직접 연동 (정확한 bizinno.kr 실제 데이터 수집)
            if (trimmedUrl.includes("bizinno.kr") || trimmedUrl.includes("tvtpvecnjyjnvjhbozks.supabase.co")) {
                const supabaseUrl = "https://tvtpvecnjyjnvjhbozks.supabase.co";
                const apiKey = "sb_publishable_bgd5nh-qDblE3CfK6SbJXw_brkDvmXC";
                
                const queryStr = trimmedUrl.includes("?") ? trimmedUrl.split("?")[1] : "";
                const params = new URLSearchParams(queryStr);
                const accountsParam = params.get("accounts");
                const targetSlotCount = accountsParam ? Number(accountsParam) : plan.slotCount;

                try {
                    console.log(`[Bizinno Supabase Fetch] URL ${idx + 1}/${syncUrls.length}: fetching slotCount ${targetSlotCount}`);
                    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=노출_순위.asc.nullslast`, {
                        headers: {
                            "apikey": apiKey,
                            "Authorization": `Bearer ${apiKey}`
                        }
                    });

                    if (res.ok) {
                        const rawList = await res.json();
                        if (Array.isArray(rawList)) {
                            // 공개 여부가 true(공개)이고 해당 구좌수에 일치하는 제품만 정확하게 필터링
                            const filtered = rawList.filter(p => {
                                const matchSlot = p["구좌수"] === targetSlotCount || p.slotCount === targetSlotCount || p.accounts === targetSlotCount;
                                const isPublic = p["공개_여부"] === true || p.isPublic === true || p.isVisible === true || p["공개_여부"] === "Y" || p["공개_여부"] === undefined;
                                return matchSlot && isPublic;
                            });
                            
                            const bizinnoProducts = filtered.map(p => {
                                const brandName = p["브랜드"] || p.brand || "기타";
                                const rawProdName = p["제품명"] || p.name || p.model_name || "상품명 없음";
                                const formattedName = rawProdName.startsWith("[") ? rawProdName : `[${brandName}] ${rawProdName}`;
                                
                                return {
                                    model_name: formattedName,
                                    model: p["모델명"] || p.model || "모델명 없음",
                                    ca_name: p["카테고리"] || p.category || "",
                                    primary_category_code: "",
                                    model_thumnail_url: p["메인_썸네일(목록용)"] || p.image || ""
                                };
                            });

                            if (bizinnoProducts.length > 0) {
                                combinedLists.push(...bizinnoProducts);
                                console.log(`[Bizinno Supabase] Successfully fetched ${bizinnoProducts.length} public products for accounts=${targetSlotCount}`);
                                continue;
                            }
                        }
                    }
                } catch (err: any) {
                    console.error("[Bizinno Supabase Fetch Failed]", err);
                }
            }

            // Candidate URL 목록 생성 (일반 타사 API 서버 또는 릴레이 서버)
            const candidates: string[] = [];

            // 1) dasonin / 다소닌 API 서버(xn--299ar6vqrd.com) 지원
            if (trimmedUrl.includes("xn--299ar6vqrd.com") || trimmedUrl.includes("dasonin")) {
                const queryStr = trimmedUrl.includes("?") ? trimmedUrl.split("?")[1] : "";
                const params = new URLSearchParams(queryStr);
                if (!params.has("section")) params.set("section", "models");
                if (!params.has("list_size")) params.set("list_size", "200");
                candidates.push(`https://xn--299ar6vqrd.com/api/v2/models?${params.toString()}`);
            }

            // 2) model/list.php URL ➔ api/v2/models 변환
            if (trimmedUrl.includes("model/list.php")) {
                let apiU = trimmedUrl.replace("model/list.php", "api/v2/models");
                if (!apiU.includes("section=models")) {
                    apiU += (apiU.includes("?") ? "&" : "?") + "section=models&list_size=200";
                }
                candidates.push(apiU);
            } else if (!trimmedUrl.includes("api/v2/models") && !trimmedUrl.includes(".json")) {
                // 3) 메인 웹페이지 주소 (예: https://domain.com/?accounts=2) ➔ api/v2/models 변환
                const queryStr = trimmedUrl.includes("?") ? trimmedUrl.split("?")[1] : "";
                const baseUrl = trimmedUrl.split("?")[0].replace(/\/$/, "");
                let apiU = `${baseUrl}/api/v2/models`;
                if (queryStr) {
                    apiU += `?${queryStr}` + (queryStr.includes("section=models") ? "" : "&section=models&list_size=200");
                } else {
                    apiU += "?section=models&list_size=200";
                }
                candidates.push(apiU);
            }

            candidates.push(trimmedUrl);
            const uniqueCandidates = Array.from(new Set(candidates));

            let success = false;
            let lastError = "";

            for (const candUrl of uniqueCandidates) {
                try {
                    console.log(`[URL ${idx + 1}/${syncUrls.length}] Trying:`, candUrl);
                    const res = await fetch(candUrl, { headers: requestHeaders });
                    
                    if (!res.ok) {
                        lastError = `HTTP ${res.status} 응답`;
                        continue;
                    }

                    const contentType = res.headers.get("content-type") || "";
                    const bodyText = await res.text();

                    if (!bodyText.trim().startsWith("{") && !bodyText.trim().startsWith("[")) {
                        lastError = `JSON API가 아닌 HTML 웹페이지 응답 (Content-Type: ${contentType})`;
                        continue;
                    }

                    const data = JSON.parse(bodyText);
                    if (data.Lists && Array.isArray(data.Lists)) {
                        combinedLists.push(...data.Lists);
                        success = true;
                        console.log(`[URL ${idx + 1}/${syncUrls.length}] Success from ${candUrl}: ${data.Lists.length} products`);
                        break;
                    } else if (Array.isArray(data)) {
                        combinedLists.push(...data);
                        success = true;
                        console.log(`[URL ${idx + 1}/${syncUrls.length}] Success from ${candUrl}: ${data.length} products`);
                        break;
                    } else {
                        lastError = `응답에 제품 목록(Lists) 배열이 없습니다.`;
                    }
                } catch (err: any) {
                    lastError = err.message || String(err);
                }
            }

            if (!success) {
                errorMessages.push(`URL ${idx + 1} (${rawUrl}): ${lastError}`);
            }
        }

        if (combinedLists.length === 0) {
            throw new Error(`동기화 실패: 등록된 URL에서 유효한 제품 데이터를 가져올 수 없습니다.\n${errorMessages.join("\n")}`);
        }

        // 중복 모델 제거 (페이지/URL 간 동일 제품 중복 방지)
        const seenKeys = new Set<string>();
        const uniqueCombinedLists: any[] = [];
        for (const item of combinedLists) {
            const key = `${item.model || ''}_${item.model_name || ''}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueCombinedLists.push(item);
            }
        }

        // 3. 제품 데이터 파싱 및 통합
        const slotCount = plan.slotCount;

        // 제휴카드 요금 기본값 가져오기
        const existingProducts = await ctx.runQuery(api.products.get);
        const defaultCardDiscount = (plan as any).cardDiscountPayment !== undefined && (plan as any).cardDiscountPayment !== null
            ? Math.max(0, plan.monthlyPayment - ((plan as any).cardDiscountPayment || 0))
            : (existingProducts.find(p => p.slotCount === slotCount && p.cardDiscountPayment)?.cardDiscountPayment || 0);

        const products = uniqueCombinedLists.map((item: any, i: number) => {
            const rawName = item.model_name || "상품명 없음";
            const brandMatch = rawName.match(/^\[(.*?)\]/);
            const brand = brandMatch ? brandMatch[1] : "기타";
            const cleanedName = cleanBrandDeduplication(rawName, brand);
            
            // 카테고리 판별 로직
            const code = item.primary_category_code || "";
            const category = determineCategory(
                cleanedName,
                item.model || "",
                code,
                item.ca_name || ""
            );
            
            return {
                brand: brand,
                model: item.model || "모델명 없음",
                name: cleanedName,
                category: category,
                slotCount: slotCount,
                monthlyPayment: plan.monthlyPayment, // 플랜에 지정된 월납입금 대입
                cardDiscountPayment: defaultCardDiscount, // 기존 제휴카드 할인 가격 적용
                image: item.model_thumnail_url || "",
                isVisible: true,
                hasGift: false,
                careProductId: args.planId, // 해당 플랜 ID 주입
                order: i + 1,
            };
        });
        
        // 4. Mutation 실행하여 특정 플랜 데이터만 교체
        await ctx.runMutation(internal.products.replaceProductsForPlan, { 
            planId: args.planId, 
            products 
        });
    }
});

// 특정 구좌에 대한 제품 데이터 교체 internal mutation
export const replaceProductsForSlot = internalMutation({
    args: {
        slotCount: v.number(),
        products: v.array(
            v.object({
                brand: v.string(),
                model: v.string(),
                name: v.string(),
                category: v.string(),
                slotCount: v.number(),
                monthlyPayment: v.number(),
                cardDiscountPayment: v.number(),
                image: v.string(),
                isVisible: v.boolean(),
                hasGift: v.boolean(),
                isBest: v.optional(v.boolean()),
                order: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        
        // 해당 구좌수의 기존 제품들만 조회해서 삭제
        const existing = await ctx.db
            .query("products")
            .withIndex("by_slotCount", q => q.eq("slotCount", args.slotCount))
            .collect();
            
        for (const p of existing) {
            await ctx.db.delete(p._id);
        }
        
        // 새 제품 입력
        for (const p of args.products) {
            await ctx.db.insert("products", {
                ...p,
                createdAt: now,
                updatedAt: now,
            });
        }
    }
});

// 특정 스마트케어 상품(플랜)에 대한 제품 데이터 교체 internal mutation
export const replaceProductsForPlan = internalMutation({
    args: {
        planId: v.id("careProducts"),
        products: v.array(
            v.object({
                brand: v.string(),
                model: v.string(),
                name: v.string(),
                category: v.string(),
                slotCount: v.number(),
                monthlyPayment: v.number(),
                cardDiscountPayment: v.number(),
                image: v.string(),
                isVisible: v.boolean(),
                hasGift: v.boolean(),
                isBest: v.optional(v.boolean()),
                careProductId: v.optional(v.union(v.id("careProducts"), v.null())),
                order: v.optional(v.number()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = new Date().toISOString();
        
        // 해당 플랜의 기존 제품들만 조회해서 삭제
        const existing = await ctx.db
            .query("products")
            .withIndex("by_careProductId", q => q.eq("careProductId", args.planId))
            .collect();
            
        for (const p of existing) {
            await ctx.db.delete(p._id);
        }
        
        // 새 제품 입력
        for (const p of args.products) {
            await ctx.db.insert("products", {
                ...p,
                createdAt: now,
                updatedAt: now,
            });
        }

        // 해당 플랜의 최근 동기화 시각(lastSyncedAt) 업데이트
        await ctx.db.patch(args.planId, {
            lastSyncedAt: now,
            updatedAt: now,
        });
    }
});

// 자동 업데이트 Cron 전용 internal action (분단위 시각 대조)
export const runAutoUpdateCron = internalAction({
    args: { targetTime: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const careProducts: any[] = await ctx.runQuery(api.careProducts.get);
        
        // 현재 한국 시각 KST (UTC + 9) HH:mm 계산
        const now = new Date();
        const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const kstHours = String(kstDate.getUTCHours()).padStart(2, '0');
        const kstMinutes = String(kstDate.getUTCMinutes()).padStart(2, '0');
        const currentKstTime = `${kstHours}:${kstMinutes}`;

        const checkTime = args.targetTime || currentKstTime;

        const activePlans = careProducts.filter(p => {
            if (!p.autoUpdate || !p.syncUrl) return false;
            const sched = p.autoUpdateSchedule || "00:00";
            if (sched === "both") {
                return checkTime === "00:00" || checkTime === "12:00";
            }
            return sched === checkTime;
        });

        if (activePlans.length > 0) {
            console.log(`[Auto-Update Cron] Executing for ${activePlans.length} plan(s) at KST ${checkTime}`);
            for (const plan of activePlans) {
                try {
                    await ctx.runAction(api.products.syncProductsForPlan, { planId: plan._id });
                    console.log(`[Auto-Update Cron] Successfully synced plan: ${plan.name}`);
                } catch (err: any) {
                    console.error(`[Auto-Update Cron Error] Plan ${plan.name} (${plan._id}):`, err);
                }
            }
        }
    }
});

// 기존 노트북 카테고리 재분류 마이그레이션 mutation
export const reclassifyLaptops = mutation({
    args: {},
    handler: async (ctx) => {
        const allProducts = await ctx.db.query("products").collect();
        let count = 0;
        const now = new Date().toISOString();
        for (const p of allProducts) {
            const cleanName = p.name.toLowerCase().replace(/\s/g, "");
            const isLaptopTablet = cleanName.includes("노트북") || cleanName.includes("그램") || cleanName.includes("맥북") || cleanName.includes("갤럭시북") || cleanName.includes("아이패드") || cleanName.includes("ipad") || cleanName.includes("태블릿") || cleanName.includes("갤럭시탭") || cleanName.includes("컴퓨터") || cleanName.includes("pc");
            if (isLaptopTablet && p.category !== "TV/디지털") {
                await ctx.db.patch(p._id, { category: "TV/디지털", updatedAt: now });
                count++;
            }
        }
        return count;
    }
});
