const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function debugSyncQuery() {
    const client = new ConvexHttpClient(prodUrl);
    console.log("Debugging Sync Query for Baek Seung-hee (백승희) in PROD...");

    // From Excel (Hypothetical/Cleaned)
    const customerName = "백승희";
    const partnerName = "제이온";
    const formattedPhone = "010-9181-9068";
    const unformattedPhone = "01091819068";

    try {
        const apps = await client.query("applications:getAllApplications");

        console.log("\nSearching for match in full dump...");
        const targets = apps.filter(a =>
            a.customerName === customerName &&
            (a.customerPhone === formattedPhone || a.customerPhone === unformattedPhone) &&
            a.partnerName === partnerName
        );

        if (targets.length > 0) {
            console.log(`Found ${targets.length} manual matches:`);
            targets.forEach(t => {
                console.log(`  ID: ${t._id} | Name: [${t.customerName}] | Phone: [${t.customerPhone}] | Partner: [${t.partnerName}] | RegDate: [${t.registrationDate}]`);
            });
        } else {
            console.log("No manual match found. Checking for invisible characters...");
            const nearTargets = apps.filter(a => a.customerName.includes("백승희"));
            nearTargets.forEach(t => {
                console.log(`  NEAR MATCH: ID: ${t._id} | Name: [${t.customerName}] | HEX Name: ${JSON.stringify(t.customerName)} | Phone: [${t.customerPhone}] | Partner: [${t.partnerName}] | HEX Partner: ${JSON.stringify(t.partnerName)}`);
            });
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

debugSyncQuery();
