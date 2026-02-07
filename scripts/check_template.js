const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const PROD_URL = "https://resolute-orca-48.convex.cloud";
const client = new ConvexHttpClient(PROD_URL);

async function checkTemplate() {
    process.env.CONVEX_DEPLOYMENT = "prod:resolute-orca-48"; // Ensure context logic if needed, though browser client uses URL

    const key = "standard_template_url";
    console.log(`Checking template for key: ${key}`);

    try {
        const setting = await client.query("settings:getSetting", { key });
        console.log("Raw Setting Value:", JSON.stringify(setting, null, 2));

        if (setting && setting.value) {
            console.log("Value exists. Testing getTemplateUrl...");
            const url = await client.query("settings:getTemplateUrl", { key });
            console.log("Resolved URL:", url);

            if (!url) {
                console.log("!!! URL is NULL. Storage ID might be invalid for this deployment.");
            }
        } else {
            console.log("Setting not found.");
        }

    } catch (error) {
        console.error("Error checking template:", error.message);
        console.error(error);
    }
}

checkTemplate();
