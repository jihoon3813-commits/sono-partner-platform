const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

function toHex(str) {
    return str.split('').map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
}

async function dump() {
    const client = new ConvexHttpClient(prodUrl);
    const names = ["백승희"];
    console.log(`Dumping with hex codes for ${names.join(", ")}...`);
    try {
        const apps = await client.query("applications:getAllApplications");
        const targets = apps.filter(a => names.includes(a.customerName) || a.customerName?.includes("백승희"));

        targets.forEach(a => {
            console.log(`\nName: [${a.customerName}] HEX: ${toHex(a.customerName)}`);
            console.log(`Partner: [${a.partnerName}] HEX: ${toHex(a.partnerName)}`);
            console.log(`Phone: [${a.customerPhone}]`);
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

dump();
