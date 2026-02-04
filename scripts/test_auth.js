const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function testAuth() {
    console.log("Testing auth for [lifenjoy / 1234]");
    try {
        const result = await client.mutation("partners:validatePartnerCredentials", {
            loginId: "lifenjoy",
            password: "1234"
        });
        console.log("Full result from Convex:", JSON.stringify(result, null, 2));

        if (result && result.valid && result.partner) {
            console.log("SUCCESS: Partner object extracted.");
        } else {
            console.log("FAILURE: valid=false or missing partner object.");
        }
    } catch (e) {
        console.error("Error during mutation:", e);
    }
}

testAuth();
