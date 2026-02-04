const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function listPartners() {
    console.log("Listing all partners...");
    try {
        const partners = await client.query("partners:getAllPartners");
        console.log(`Found ${partners.length} partners.`);
        partners.forEach(p => {
            console.log(`- ID: ${p.partnerId}, Login: ${p.loginId}, Name: ${p.companyName}`);
        });

        const lifenjoyPartners = partners.filter(p => p.loginId === "lifenjoy");
        console.log(`\nPartners with login 'lifenjoy': ${lifenjoyPartners.length}`);

    } catch (e) {
        console.error("Error:", e.message);
    }
}

listPartners();
