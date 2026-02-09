const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

// Manually put the PROD URL if it's different in .env.local
// According to Step 286, PROD is https://resolute-orca-48.convex.cloud
const prodUrl = "https://resolute-orca-48.convex.cloud";

async function inspectProd() {
    const client = new ConvexHttpClient(prodUrl);
    console.log("Inspecting PROD Applications for '백승희', '김효영', '김나현'...");
    try {
        const apps = await client.query("applications:getAllApplications");
        const names = ["백승희", "김효영", "김나현"];
        const targets = apps.filter(a => names.includes(a.customerName));

        console.log(`\nFound ${targets.length} records in PROD:`);
        targets.forEach(t => {
            console.log(`ID: ${t._id}`);
            console.log(`Name: [${t.customerName}] | JSON: ${JSON.stringify(t.customerName)}`);
            console.log(`Phone: [${t.customerPhone}] | JSON: ${JSON.stringify(t.customerPhone)}`);
            console.log(`PartnerName: [${t.partnerName}] | JSON: ${JSON.stringify(t.partnerName)}`);
            console.log(`RegDate: [${t.registrationDate}] | Status: ${t.status}`);
            console.log("---");
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

inspectProd();
