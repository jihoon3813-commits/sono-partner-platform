const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

// Production URL (resolute-orca-48)
const PROD_URL = "https://resolute-orca-48.convex.cloud";
const client = new ConvexHttpClient(PROD_URL);

async function useProvidedTemplate() {
    const storageId = "k97d8gnq3xvqtp2jgn05dhnfrs80p8vx";
    const key = "standard_template_url";

    console.log(`Updating '${key}' to Provided Storage ID: ${storageId}`);

    try {
        await client.mutation("settings:updateSetting", {
            key: key,
            value: storageId
        });
        console.log("✅ Successfully updated template setting to use YOUR file!");
    } catch (error) {
        console.error("❌ Failed to update template:", error);
    }
}

useProvidedTemplate();
