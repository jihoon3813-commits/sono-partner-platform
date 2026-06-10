import { query, mutation, action, internalMutation } from "./_generated/server";
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
export const get = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("products").collect();
        // Sort by order (ascending), then by name as fallback
        return all.sort((a, b) => {
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

// 베스트 여부 토글
export const toggleBest = mutation({
    args: { id: v.id("products"), isBest: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isBest: args.isBest, updatedAt: new Date().toISOString() });
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
        
        // 2. URL 호출 및 자동 보정
        let syncUrl = plan.syncUrl.trim();
        
        // 사용자가 웹페이지 주소(list.php)를 잘못 기입한 경우 API 엔드포인트로 자동 전환 지원
        if (syncUrl.includes("model/list.php")) {
            syncUrl = syncUrl.replace("model/list.php", "api/v2/models");
            if (!syncUrl.includes("section=models")) {
                syncUrl += (syncUrl.includes("?") ? "&" : "?") + "section=models&list_size=200";
            }
        }

        console.log("Fetching syncUrl:", syncUrl);
        const res = await fetch(syncUrl);
        if (!res.ok) {
            throw new Error(`동기화 API 호출 실패 (HTTP ${res.status})`);
        }

        const contentType = res.headers.get("content-type") || "";
        const bodyText = await res.text();
        console.log("Response Content-Type:", contentType);
        console.log("Response Body Snippet:", bodyText.substring(0, 500));

        if (!contentType.includes("application/json")) {
            throw new Error(`동기화 URL이 올바른 JSON API 주소가 아닙니다. (Content-Type: ${contentType}) 일반 웹페이지 주소 대신 데이터 API 주소를 입력해주세요.`);
        }

        let data;
        try {
            data = JSON.parse(bodyText);
        } catch (err) {
            throw new Error("API 응답 JSON 파싱에 실패했습니다. (유효하지 않은 JSON 형식)");
        }
        
        // 빌리고 API 형식 검증
        if (!data.Lists || !Array.isArray(data.Lists)) {
            throw new Error("올바르지 않은 API 응답 형식입니다. (Lists 배열 없음)");
        }
        
        // 3. 제품 데이터 파싱
        const slotCount = plan.slotCount;

        // 기존 동일 구좌 제품의 제휴카드 요금 기본값 가져오기 (없으면 0)
        const existingProducts = await ctx.runQuery(api.products.get);
        const defaultCardDiscount = existingProducts.find(p => p.slotCount === slotCount && p.cardDiscountPayment)?.cardDiscountPayment || 0;

        const products = data.Lists.map((item: any, i: number) => {
            const brandMatch = item.model_name?.match(/^\[(.*?)\]/);
            const brand = brandMatch ? brandMatch[1] : "기타";
            
            // 카테고리 판별 로직
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
