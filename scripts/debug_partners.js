const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function checkPartners() {
    const client = new ConvexHttpClient(prodUrl);
    try {
        const partners = await client.query("partners:getAllPartners");
        console.log("--- Partner Table Search (제이온) ---");
        const pMatch = partners.filter(p => p.companyName.includes("제이온") || p.companyName.includes("JON"));
        pMatch.forEach(p => {
            console.log(`[${p.companyName}] | ID: ${p.partnerId} | HEX: ${JSON.stringify(p.companyName)}`);
        });

        const apps = await client.query("applications:getAllApplications");
        console.log("\n--- Application Table Search (백승희) ---");
        const aMatch = apps.filter(a => a.customerName === "백승희");
        aMatch.forEach(a => {
            console.log(`Name: [${a.customerName}] | Partner: [${a.partnerName}] | HEX Partner: ${JSON.stringify(a.partnerName)} | ID: ${a._id}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

checkPartners();
