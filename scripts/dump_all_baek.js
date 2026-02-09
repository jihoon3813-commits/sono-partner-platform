const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function dumpAllBaek() {
    const client = new ConvexHttpClient(prodUrl);
    try {
        const apps = await client.query("applications:getAllApplications");
        const targets = apps.filter(a => a.customerName && a.customerName.includes("백승희"));
        console.log(JSON.stringify(targets, null, 2));

        targets.forEach(t => {
            console.log(`ID: ${t._id}`);
            console.log(`Name HEX: ${Buffer.from(t.customerName, 'utf8').toString('hex')}`);
            console.log(`Phone: [${t.customerPhone}]`);
            console.log(`Partner: [${t.partnerName}]`);
            console.log(`RegDate: [${t.registrationDate}]`);
            console.log(`---`);
        });
    } catch (e) {
        console.error(e);
    }
}

dumpAllBaek();
