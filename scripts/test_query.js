const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function testQuery() {
    console.log("Testing query partners:getPartnerByCustomUrl for 'lifenjoy'");
    try {
        const result = await client.query("partners:getPartnerByCustomUrl", {
            customUrl: "lifenjoy"
        });
        console.log("Query result:", JSON.stringify(result, null, 2));
        if (result) {
            console.log("SUCCESS: Partner found by customUrl.");
        } else {
            console.log("FAILURE: Partner NOT found by customUrl.");
        }
    } catch (e) {
        console.error("Error during query:", e.message);
    }
}

testQuery();
