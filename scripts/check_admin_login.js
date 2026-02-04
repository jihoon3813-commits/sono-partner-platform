const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function checkAdmins() {
    console.log("Checking admins...");
    try {
        // Since we don't have a specific listAdmins query exposed, 
        // we might not actully be able to listing them easily if 'getAllPartners' style query isn't there for admins.
        // But wait, 'admins.ts' doesn't have a 'getAllAdmins'. 
        // I'll try to use a direct query if possible, but I can't from here without correct internal query.

        // Let's try to 'validate' with the expected credentials and see result
        const result = await client.mutation("admins:validateAdminCredentials", {
            loginId: "admin",
            password: "admin1234"
        });

        console.log("Validation Result for 'admin' / 'admin1234':", result);

        const resultEmail = await client.mutation("admins:validateAdminCredentials", {
            loginId: "admin@sono.com",
            password: "admin1234"
        });
        console.log("Validation Result for 'admin@sono.com' / 'admin1234':", resultEmail);

    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkAdmins();
