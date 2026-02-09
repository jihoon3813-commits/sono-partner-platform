const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function inspect() {
    console.log("Inspecting Partners and Applications for normalization issues...");
    try {
        const partners = await client.query("partners:getAllPartners");
        console.log("\n--- Partners ---");
        partners.forEach(p => {
            console.log(`Name: [${p.companyName}] | Length: ${p.companyName.length} | JSON: ${JSON.stringify(p.companyName)}`);
        });

        const apps = await client.query("applications:getAllApplications");
        console.log("\n--- '백승희' Applications ---");
        const targets = apps.filter(a => a.customerName === "백승희" || a.customerName?.includes("백승희"));
        targets.forEach(t => {
            console.log(`ID: ${t._id}`);
            console.log(`Name: [${t.customerName}] | JSON: ${JSON.stringify(t.customerName)}`);
            console.log(`Phone: [${t.customerPhone}] | JSON: ${JSON.stringify(t.customerPhone)}`);
            console.log(`Partner: [${t.partnerName}] | JSON: ${JSON.stringify(t.partnerName)}`);
            console.log(`RegDate: [${t.registrationDate}] | JSON: ${JSON.stringify(t.registrationDate)}`);
            console.log("---");
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

inspect();
