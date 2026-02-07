const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

// Production URL (resolute-orca-48)
const PROD_URL = "https://resolute-orca-48.convex.cloud";
const client = new ConvexHttpClient(PROD_URL);

async function updateTemplate() {
    const storageId = "kg2bytfx5j1pyhn66hewrxv22s80pxmv";
    const key = "standard_template_url";

    console.log(`Updating '${key}' to Storage ID: ${storageId}`);
    console.log(`Target Environment: ${PROD_URL}`);

    try {
        await client.mutation("settings:updateSetting", {
            key: key,
            value: storageId
        });
        console.log("✅ Successfully updated template setting!");
    } catch (error) {
        console.error("❌ Failed to update template:", error);
    }
}

updateTemplate();
