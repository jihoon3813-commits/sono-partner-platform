const fs = require('fs');
const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

// Use the Production URL provided by the user
const PROD_URL = "https://resolute-orca-48.convex.cloud";
const client = new ConvexHttpClient(PROD_URL);

async function seed() {
    console.log("Connecting to Production Database:", PROD_URL);
    try {
        let rawData = fs.readFileSync('products_seed.json');

        // Remove BOM if present
        if (rawData[0] === 0xFF && rawData[1] === 0xFE) {
            rawData = rawData.slice(2);
            rawData = Buffer.from(rawData).toString('utf16le');
        } else {
            rawData = rawData.toString('utf8');
        }

        const products = JSON.parse(rawData);

        console.log(`Seeding ${products.length} products to PRODUCTION...`);

        await client.mutation("products:seed", { products });

        console.log("Seeding to PRODUCTION complete!");
    } catch (error) {
        console.error("Seeding failed:");
        if (error.message && error.message.includes("Could not find function")) {
            console.error("ERROR: The 'products:seed' function does not exist on the production server.");
            console.error("You must deploy your Convex functions first. Run: npx convex deploy");
        } else {
            console.error(error);
        }
    }
}

seed();
