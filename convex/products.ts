import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

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
        order: v.optional(v.number()),
        promotionId: v.optional(v.union(v.id("promotions"), v.null())),
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
            let category = "생활가전"; // Default category
            const code = item.primary_category_code || "";
            const rawModel = String(item.model || "").toUpperCase().replace(/\s/g, "");
            const cleanName = String(item.model_name || "").toLowerCase().replace(/\s/g, "");
            
            // 1. TV Rule
            if (rawModel.match(/^[0-9]/) || rawModel.startsWith("KU") || rawModel.startsWith("KQ") || rawModel.startsWith("QN") || rawModel.startsWith("UN") || rawModel.startsWith("OLED") || rawModel.startsWith("QNED") ||
                cleanName.includes("tv") || cleanName.includes("인치") || cleanName.includes("oled") || cleanName.includes("qled") || cleanName.includes("uhd") || cleanName.includes("나노셀") || cleanName.includes("모니터") || cleanName.includes("스탠바이미")) {
                category = "TV";
            } 
            // 2. 냉장가전 (Refrigerators)
            else if (rawModel.startsWith("RF") || rawModel.startsWith("RS") || rawModel.startsWith("RQ") || rawModel.startsWith("RH") || rawModel.startsWith("M8") || rawModel.startsWith("J8") ||
                     cleanName.includes("냉장고") || cleanName.includes("김치냉장고") || cleanName.includes("냉동고") || cleanName.includes("와인셀러") || cleanName.includes("비스포크") || cleanName.includes("오브제")) {
                category = "냉장가전";
            }
            // 3. 에어컨 (Air Conditioners)
            else if (rawModel.startsWith("FQ") || rawModel.startsWith("AF") || cleanName.includes("에어컨") || cleanName.includes("평형") || cleanName.includes("휘센") || cleanName.includes("에어로") || cleanName.includes("풍클래식")) {
                category = "에어컨";
            }
            // 4. 주방가전 (Kitchen Appliances)
            else if (cleanName.includes("인덕션") || cleanName.includes("정수기") || cleanName.includes("식기세척기") || cleanName.includes("오븐") || cleanName.includes("전자레인지") || 
                     cleanName.includes("전기레인지") || cleanName.includes("밥솥") || cleanName.includes("에어프라이어") || cleanName.includes("쿠쿠") || cleanName.includes("쿠첸") || cleanName.includes("큐커")) {
                category = "주방가전";
            }
            // 5. 생활가전 (Living/Laundry)
            else if (rawModel.startsWith("WF") || rawModel.startsWith("DV") || rawModel.startsWith("RD") || rawModel.startsWith("W20") || rawModel.startsWith("F2") || rawModel.startsWith("W1") ||
                     cleanName.includes("세탁기") || cleanName.includes("건조기") || cleanName.includes("워시타워") || cleanName.includes("스타일러") || cleanName.includes("에어드레서") || 
                     cleanName.includes("청소기") || cleanName.includes("공기청정기") || cleanName.includes("가습기") || cleanName.includes("제습기") || cleanName.includes("코드제로") || cleanName.includes("로보락")) {
                category = "생활가전";
            }
            // 6. Fallback by Category Codes
            else if (code.startsWith("008002")) category = "냉장가전";
            else if (code.startsWith("008003")) category = "주방가전";
            else if (code.startsWith("008004")) category = "생활가전";
            else if (code.startsWith("008006")) category = "캠핑/레저";
            else if (code.startsWith("008007")) category = "가전패키지";
            else if (code.startsWith("008005")) category = "TV";
            else {
                category = "기타";
            }
            
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
