const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function checkSeo() {
    const client = new ConvexHttpClient(prodUrl);
    try {
        const apps = await client.query("applications:getAllApplications");
        const targets = apps.filter(a => a.customerName && a.customerName.includes("서여선"));
        console.log(JSON.stringify(targets, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkSeo();
