const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });
const fs = require('fs');

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function run() {
    const client = new ConvexHttpClient(prodUrl);
    const apps = await client.query("applications:getAllApplications");

    const output = [];

    // Check for duplicates by key
    const keyMap = new Map();
    for (const app of apps) {
        const name = (app.customerName || "").trim().replace(/[\u200b-\u200f\ufeff\u00a0]/g, "").normalize("NFC");
        const phone = app.customerPhone || "";
        const partner = (app.partnerName || "").trim().replace(/[\u200b-\u200f\ufeff\u00a0]/g, "").normalize("NFC");
        const key = `${name}|${phone}|${partner}`;

        if (!keyMap.has(key)) {
            keyMap.set(key, []);
        }
        keyMap.get(key).push(app);
    }

    // Find duplicates
    let dupCount = 0;
    for (const [key, records] of keyMap.entries()) {
        if (records.length > 1) {
            dupCount++;
            output.push(`\nDUPLICATE KEY: ${key} (${records.length} records)`);
            for (const r of records) {
                output.push(`  ID: ${r._id}, Status: ${r.status}, RegDate: ${r.registrationDate}`);
            }
        }
    }

    output.push(`\nTotal duplicate keys: ${dupCount}`);

    // Now specifically check the 3 problem names
    const names = ["박희철", "이근자", "서여선"];
    output.push("\n\n=== PROBLEM RECORDS ===");
    for (const name of names) {
        const records = apps.filter(a => a.customerName === name);
        output.push(`\n--- ${name}: ${records.length} records ---`);
        for (const r of records) {
            output.push(JSON.stringify(r, null, 2));
        }
    }

    fs.writeFileSync('scripts/diagnostic_output.txt', output.join('\n'), 'utf8');
    console.log("Written to scripts/diagnostic_output.txt");
}

run();
