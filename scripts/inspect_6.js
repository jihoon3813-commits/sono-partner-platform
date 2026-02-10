const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });

const prodUrl = "https://resolute-orca-48.convex.cloud";

async function run() {
    const client = new ConvexHttpClient(prodUrl);
    const apps = await client.query("applications:getAllApplications");
    const names = ["박희철", "이근자", "서여선"];
    const targets = apps.filter(a => names.includes(a.customerName));

    targets.forEach(t => {
        console.log(`--- ${t.customerName} ---`);
        console.log(`Status: "${t.status}" (Length: ${t.status?.length})`);
        if (t.status) {
            console.log(`Hex: ${Buffer.from(t.status).toString('hex')}`);
        }
        console.log(JSON.stringify(t, null, 2));
    });
}

run();
