const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function testCreateApplication() {
    console.log("Testing createApplication via Convex mutation...");
    try {
        const result = await client.mutation("applications:createApplication", {
            partnerId: "P-1770193430054",
            partnerName: "라이프앤조이",
            productType: "스마트케어",
            customerName: "시스템테스트",
            customerPhone: "010-0000-0000",
            customerAddress: "테스트 주소"
        });
        console.log("Application created successfully:", result.applicationNo);
    } catch (e) {
        console.error("Mutation failed:", e.message);
        // If it fails with validation error, it will show here.
    }
}

testCreateApplication();
