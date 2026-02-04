const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexHttpClient(convexUrl);

async function listPartnersWithPassword() {
    console.log("Listing all partners with passwords...");
    try {
        const partners = await client.query("partners:getAllPartners");
        partners.forEach(p => {
            console.log(`- Login: ${p.loginId}, Password: [${p.loginPassword}], Status: ${p.status}`);
        });
    } catch (e) {
        console.error("Error:", e.message);
    }
}

listPartnersWithPassword();
