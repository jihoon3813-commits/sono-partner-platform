const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function fix() {
    console.log("Starting legacy data fix...");
    try {
        const count = await client.mutation("applications:fixLegacyData");
        console.log(`Fixed ${count} records.`);
    } catch (e) {
        console.error("Error fixing data:", JSON.stringify(e, null, 2));
        if (e.data) console.error("Error data:", e.data);
    }
}

fix();
