const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
    console.error("NEXT_PUBLIC_CONVEX_URL is not set");
    process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

async function checkPartner(loginId) {
    console.log(`Checking partner with loginId: ${loginId}`);

    // We can't query directly from node script easily without defining an internal query or using "list" if available.
    // However, we can try to use a defined query if it doesn't require auth.
    // Let's try to query all partners and filter.

    try {
        const partners = await client.query("partners:getAllPartners");
        const partner = partners.find(p => p.loginId === loginId);

        if (partner) {
            console.log("Partner FOUND:");
            console.log(`- ID: ${partner.partnerId}`);
            console.log(`- LoginID: ${partner.loginId}`);
            console.log(`- Password: ${partner.loginPassword}`);
            console.log(`- Status: ${partner.status}`);
        } else {
            console.log("Partner NOT FOUND.");
            console.log("Available Login IDs:", partners.map(p => p.loginId).slice(0, 10)); // Show sample
        }

    } catch (e) {
        console.error("Error querying partners:", e.message);
    }
}

checkPartner('lifenjoy');
