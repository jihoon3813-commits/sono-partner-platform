const fs = require('fs');
const { ConvexHttpClient } = require("convex/browser");
require('dotenv').config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function seed() {
    try {
        // Read file (handle encoding if needed, but fs.readFile usually assumes utf8)
        // If file is utf16le, we might need specific encoding.
        // Let's try reading as buffer and checking.
        let rawData = fs.readFileSync('products_seed.json');

        // Remove BOM if present
        if (rawData[0] === 0xFF && rawData[1] === 0xFE) {
            rawData = rawData.slice(2); // Strip BOM
            // Convert from UTF-16LE
            rawData = Buffer.from(rawData).toString('utf16le');
        } else {
            rawData = rawData.toString('utf8');
        }

        const products = JSON.parse(rawData);

        console.log(`Seeding ${products.length} products...`);

        await client.mutation("products:seed", { products });

        console.log("Seeding complete!");
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

seed();
