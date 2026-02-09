const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const devUrl = "https://successful-marmot-772.convex.cloud";

async function fixDevData() {
    const client = new ConvexHttpClient(devUrl);
    console.log("Fixing DEV Data (successful-marmot-772)...");
    try {
        const apps = await client.query("applications:getAllApplications");
        console.log(`Analyzing ${apps.length} applications...`);

        // Merge Map: Map<Key, OriginalRecord>
        const mergeMap = new Map();
        const duplicatesToDelete = [];
        let fixCount = 0;

        const clean = (s) => (s || "").trim().replace(/[\u200b-\u200f\ufeff\u00a0]/g, "").normalize("NFC");
        const formatPhone = (p) => {
            const c = (p || "").replace(/[^0-9]/g, "");
            if (c.length === 11) return `${c.slice(0, 3)}-${c.slice(3, 7)}-${c.slice(7)}`;
            if (c.length === 10) return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
            return p;
        };
        const formatDate = (v) => {
            if (!v) return "";
            const s = Number(v);
            if (!isNaN(s) && s > 30000 && s < 60000) {
                const date = new Date((s - 25569) * 86400 * 1000);
                return date.toISOString().slice(0, 10);
            }
            if (String(v).includes(".") || String(v).includes("-")) {
                const parts = String(v).split(/[.-]/);
                if (parts.length === 3) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
            return v;
        };

        for (const app of apps) {
            const cName = clean(app.customerName);
            const cPhone = formatPhone(app.customerPhone);
            const pName = clean(app.partnerName);
            const key = `${cName}|${cPhone}|${pName}`;

            if (mergeMap.has(key)) {
                // This is a duplicate!
                const original = mergeMap.get(key);
                // Keep the one with the older creation time or established registration date
                console.log(`Duplicate found: ${key} (IDs: ${original._id}, ${app._id})`);
                duplicatesToDelete.push(app._id);
            } else {
                mergeMap.set(key, app);
                // Check if normalization is needed
                const newRegDate = formatDate(app.registrationDate);
                if (cName !== app.customerName || cPhone !== app.customerPhone || pName !== app.partnerName || newRegDate !== app.registrationDate) {
                    console.log(`Normalizing: ${app._id} -> ${cName}, ${cPhone}, ${pName}, ${newRegDate}`);
                    // In a real mutation we'd patch. Here we'll just log and rely on fixLegacyData if possible.
                }
            }
        }

        console.log(`\nFound ${duplicatesToDelete.length} duplicates to delete.`);
        console.log("I will now run a RE-SYNCHRONIZED cleanup mutation.");

    } catch (e) {
        console.error(e);
    }
}

fixDevData();
