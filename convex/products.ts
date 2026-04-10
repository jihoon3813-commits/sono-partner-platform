import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// 모든 상품 조회
export const get = query({
    args: {
        includeInactive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const all = await ctx.db.query("products").collect();
        // Sort by order (ascending), then by name as fallback
        const sorted = all.sort((a, b) => {
            if ((a.order ?? 0) !== (b.order ?? 0)) {
                return (a.order ?? 0) - (b.order ?? 0);
            }
            return a.name.localeCompare(b.name);
        });

        if (args.includeInactive) return sorted;
        
        // Return products where isVisible is true or not set (for legacy compatibility)
        return sorted.filter(p => p.isVisible !== false);
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
        promotionId: v.optional(v.id("promotions")),
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
        promotionId: v.optional(v.id("promotions")) 
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
            let category = "기타";
            const code = item.primary_category_code || "";
            const name = item.model_name.toLowerCase();
            
            if (code.startsWith("008001") || name.includes("에어컨")) category = "에어컨";
            else if (code.startsWith("008002") || name.includes("냉장고") || name.includes("쇼케이스") || name.includes("와인셀러")) category = "냉장가전";
            else if (code.startsWith("008003") || name.includes("정수기") || name.includes("음식물") || name.includes("전자레인지") || name.includes("인덕션") || name.includes("식기세척기")) category = "주방가전";
            else if (code.startsWith("008004") || name.includes("세탁기") || name.includes("건조기") || name.includes("스타일러") || name.includes("청소기") || name.includes("안마의자") || name.includes("공기청정기")) category = "생활가전";
            else if (code.startsWith("008005") || name.includes("tv") || name.includes("컴퓨터") || name.includes("맥북") || name.includes("노트북")) category = "TV";
            else if (code.startsWith("008006") || name.includes("캠핑") || name.includes("자전거") || name.includes("오토바이")) category = "캠핑/레저";
            else if (code.startsWith("008007") || name.includes("패키지")) category = "가전패키지";
            
            // UI categories: ["에어컨", "냉장가전", "주방가전", "생활가전", "TV", "캠핑/레저", "가전패키지", "기타"]
            
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
