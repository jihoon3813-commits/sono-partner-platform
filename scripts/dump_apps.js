const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function dump() {
    const client = new ConvexHttpClient(prodUrl);
    const names = ["백승희", "김효영", "김나현"];
    console.log(`Dumping specific applications for ${names.join(", ")} from PROD...`);
    try {
        const apps = await client.query("applications:getAllApplications");

        const targets = apps.filter(a => names.includes(a.customerName));

        console.log(`Found ${targets.length} records:`);
        targets.forEach(a => {
            console.log(`\nName: ${a.customerName}`);
            console.log(`  ID: ${a._id}`);
            console.log(`  Phone: [${a.customerPhone}]`);
            console.log(`  Partner: [${a.partnerName}]`);
            console.log(`  RegDate: [${a.registrationDate}]`);
            console.log(`  Status: ${a.status}`);
            console.log(`  CreatedAt: ${a.createdAt}`);
            console.log(`  ApplicationNo: ${a.applicationNo}`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

dump();
