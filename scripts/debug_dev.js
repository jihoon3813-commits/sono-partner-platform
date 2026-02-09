const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

// Local/Dev URL from .env.local
const devUrl = "https://successful-marmot-772.convex.cloud";

async function debugDev() {
    const client = new ConvexHttpClient(devUrl);
    try {
        const apps = await client.query("applications:getAllApplications");
        const targets = apps.filter(a => a.customerName && a.customerName.includes("백승희"));
        console.log("Records in DEV (successful-marmot-772):");
        console.log(JSON.stringify(targets, null, 2));
    } catch (e) {
        console.error(e);
    }
}

debugDev();
