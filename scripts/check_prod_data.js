const { ConvexHttpClient } = require("convex/browser");

async function check() {
    const url = "https://resolute-orca-48.convex.cloud";
    const client = new ConvexHttpClient(url);
    try {
        console.log("Checking partners:getAllPartners...");
        const partners = await client.query("partners:getAllPartners");
        console.log("Found partners count:", partners.length);
        if (partners.length > 0) {
            console.log("First partner loginId:", partners[0].loginId);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

check();
