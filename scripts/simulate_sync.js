const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });
const fs = require('fs');

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function run() {
    const client = new ConvexHttpClient(prodUrl);

    // First get current DB state
    const apps = await client.query("applications:getAllApplications");
    const names = ["박희철", "이근자", "서여선"];
    const dbRecords = {};
    for (const name of names) {
        dbRecords[name] = apps.filter(a => a.customerName === name);
    }

    // Test with exact data that matches DB
    const testData = [
        {
            customerName: "박희철",
            customerPhone: "010-4262-7353",
            partnerName: "제이온",
            productType: "더 해피 450 ONE",
            planType: "3",
            paymentMethod: "CMS",
            firstPaymentDate: "2025-09-08",
            cancellationProcessing: "2025-10-14",
            withdrawalProcessing: "",
            status: "해약",
            remarks: "9/8 1구좌 가입완료, 9/10 2구좌 가입완료",
            registrationDate: "2025-08-26",
            createdAt: "8월 25일",
        },
    ];

    const res = await client.mutation("applications:bulkSyncApplications", { applications: testData });
    console.log("Test 1 (exact copy):", JSON.stringify(res, null, 2));

    // After sync, check what changed
    const after = await client.query("applications:getAllApplications");
    const afterBak = after.filter(a => a.customerName === "박희철");

    const output = [];
    output.push("=== BEFORE SYNC ===");
    output.push(JSON.stringify(dbRecords["박희철"], null, 2));
    output.push("\n=== AFTER SYNC ===");
    output.push(JSON.stringify(afterBak, null, 2));
    output.push("\n=== SYNC RESULT ===");
    output.push(JSON.stringify(res, null, 2));

    // Now check: what fields are DIFFERENT between the DB and what we sent?
    const dbRec = dbRecords["박희철"][0];
    const sentData = testData[0];
    output.push("\n=== FIELD COMPARISON ===");
    for (const key of Object.keys(sentData)) {
        const sent = (sentData[key] || "").trim();
        const db = (dbRec[key] !== undefined ? String(dbRec[key]) : "").trim();
        const match = sent === db;
        if (!match) {
            output.push(`MISMATCH: ${key}: sent=[${sent}] db=[${db}]`);
        }
    }

    fs.writeFileSync('scripts/sync_comparison.txt', output.join('\n'), 'utf8');
    console.log("Written to scripts/sync_comparison.txt");
}

run();
