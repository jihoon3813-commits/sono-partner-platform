import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// 초기 데이터 설정 API (더 이상 구글 시트 마이그레이션은 하지 않음)
export async function POST() {
    try {
        console.log('[Init] Starting Convex data initialization...');

        // --- 1. 데모용 고객 데이터 10명 생성 (다양한 상태와 상품) ---
        const demoApplications = [
            { name: "김태희", phone: "010-1111-2222", product: "스마트케어", plan: "4구좌 / 삼성 Neo QLED 8K", status: "접수", address: "서울특별시 강남구 테헤란로 123" },
            { name: "이병헌", phone: "010-2222-3333", product: "더 해피 450 ONE", plan: "베이직", status: "상담중", address: "경기도 성남시 분당구 판교역로 45" },
            { name: "송혜교", phone: "010-3333-4444", product: "스마트케어", plan: "2구좌 / LG 오브제 냉장고", status: "계약완료", address: "부산광역시 해운대구 마린시티 78" },
            { name: "공유", phone: "010-4444-5555", product: "스마트케어", plan: "4구좌 / 삼성 비스포크 세탁기", status: "설치완료", address: "대구광역시 수성구 달구벌대로 99" },
            { name: "수지", phone: "010-5555-6666", product: "더 해피 450 ONE", plan: "프리미엄", status: "취소", address: "인천광역시 연수구 송도미래로 12" },
            { name: "정우성", phone: "010-6666-7777", product: "스마트케어", plan: "4구좌 / LG 스타일러", status: "접수", address: "광주광역시 서구 상무중앙로 34" },
            { name: "한효주", phone: "010-7777-8888", product: "스마트케어", plan: "2구좌 / 삼성 Neo QLED 8K", status: "상담중", address: "대전광역시 서구 둔산로 56" },
            { name: "조인성", phone: "010-8888-9999", product: "더 해피 450 ONE", plan: "베이직", status: "계약완료", address: "울산광역시 남구 삼산로 21" },
            { name: "손예진", phone: "010-9999-0000", product: "스마트케어", plan: "4구좌 / 삼성 비스포크 세탁기", status: "설치완료", address: "제주특별자치도 제주시 노형로 8" },
            { name: "원빈", phone: "010-1010-2020", product: "더 해피 450 ONE", plan: "프리미엄", status: "접수", address: "강원도 춘천시 중앙로 15" },
        ];

        console.log('[Init] Adding 10 diverse demo applications...');
        for (let i = 0; i < demoApplications.length; i++) {
            const demo = demoApplications[i];
            const appNo = `SA-DEMO-${Date.now()}-${i}`;

            // 이름으로 중복 확인 (이미 있다면 스킵)
            const appsByPartner = await client.query("applications:getApplicationsByPartnerId" as any, { partnerId: "demo" });
            const exists = (appsByPartner as any[]).find(app => (app as any).customerName === demo.name);

            if (!exists) {
                await client.mutation("applications:createApplication" as any, {
                    applicationNo: appNo,
                    partnerId: "demo",
                    partnerName: "데모 쇼핑몰",
                    productType: demo.product,
                    planType: demo.plan,
                    products: demo.plan,
                    customerName: demo.name,
                    customerPhone: demo.phone,
                    customerAddress: demo.address,
                    status: demo.status,
                    customerBirth: "1990-01-01",
                    customerGender: i % 2 === 0 ? "여성" : "남성",
                    customerEmail: `demo${i}@example.com`,
                    customerZipcode: "12345",
                    partnerMemberId: "M-12345",
                    preferredContactTime: "오후 2시 이후",
                    inquiry: "데모 데이터입니다.",
                    assignedTo: "상담원A",
                });
            }
        }

        // --- 2. 기본 제품 정보 생성 (데이터가 없을 경우에만) ---
        const currentProducts = await client.query("products:getAllProducts" as any);
        if ((currentProducts as any[]).length === 0) {
            const initialProducts = [
                { brand: "Samsung", model: "TV", name: "Neo QLED 8K", tag: "TV", image: "" },
                { brand: "LG", model: "Fridge", name: "Object Collection", tag: "가전", image: "" },
                { brand: "Samsung", model: "Washer", name: "Bespoke AI", tag: "가전", image: "" },
                { brand: "LG", model: "Styler", name: "Styler 5", tag: "의류관리", image: "" },
            ];

            for (const prod of initialProducts) {
                await client.mutation("products:addProduct" as any, prod);
            }
            console.log('[Init] Initial products created');
        }

        return NextResponse.json({
            success: true,
            message: '데모 데이터 10명을 포함한 Convex 데이터 초기화가 완료되었습니다.',
        });
    } catch (error) {
        console.error('[Init] Critical Error:', error);
        return NextResponse.json(
            { success: false, message: '데이터 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
