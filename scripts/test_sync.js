const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const devUrl = process.env.NEXT_PUBLIC_CONVEX_URL; // hitting DEV

async function testSync() {
    const client = new ConvexHttpClient(devUrl);
    const testData = [{
        customerName: "박희철",
        customerPhone: "010-4262-7353",
        partnerName: "제이온",
        productType: "더 해피 450 ONE",
        status: "해약",
        cancellationProcessing: "2025-10-14",
        remarks: "9/8 1구좌 가입완료, 9/10 2구좌 가입완료"
    }];

    try {
        const res = await client.mutation("applications:bulkSyncApplications", { applications: testData });
        console.log("Sync Result:", JSON.stringify(res, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testSync();
