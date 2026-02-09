const { ConvexHttpClient } = require("convex/browser");

const prodUrl = "https://resolute-orca-48.convex.cloud";
const devUrl = "https://successful-marmot-772.convex.cloud";

async function check(url, label) {
    const client = new ConvexHttpClient(url);
    console.log(`\nChecking [${label}] at ${url}...`);
    try {
        const apps = await client.query("applications:getAllApplications");
        const names = ["백승희", "김효영", "김나현"];
        const targets = apps.filter(a => names.includes(a.customerName));

        console.log(`Found ${targets.length} records:`);
        targets.forEach(t => {
            console.log(`${t.customerName} | Phone: [${t.customerPhone}] | Partner: [${t.partnerName}] | RegDate: [${t.registrationDate}] | Status: ${t.status} | ID: ${t._id}`);
        });
    } catch (e) {
        console.error(`Error for ${label}:`, e.message);
    }
}

async function run() {
    await check(devUrl, "DEV");
    await check(prodUrl, "PROD");
}

run();
