const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function checkPartner() {
    console.log("Checking partner 'lifenjoy'...");
    try {
        const result = await client.mutation("partners:validatePartnerCredentials", {
            loginId: "lifenjoy",
            password: "123" // Test wrong password first
        });
        console.log("Result with '123':", result.valid);

        const result2 = await client.mutation("partners:validatePartnerCredentials", {
            loginId: "lifenjoy",
            password: "1234" // Correct password
        });
        console.log("Result with '1234':", result2.valid);
        if (result2.valid) {
            console.log("Partner Details:", result2.partner);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkPartner();
