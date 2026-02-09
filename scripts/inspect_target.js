const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function inspectTarget() {
    const client = new ConvexHttpClient(prodUrl);
    try {
        const apps = await client.query("applications:getAllApplications");
        const targets = apps.filter(a => a.customerName === "박희철");
        console.log("Record for 박희철 in PROD:");
        console.log(JSON.stringify(targets, null, 2));
    } catch (e) {
        console.error(e);
    }
}

inspectTarget();
