const { ConvexHttpClient } = require("convex/browser");
require("dotenv").config({ path: ".env.local" });
const client = new ConvexHttpClient("https://resolute-orca-48.convex.cloud");
async function run() {
    const apps = await client.query("applications:getAllApplications");
    const names = ["박희철", "정숙근", "이상해", "이근자", "서강섭", "박봉선", "서여선"];
    const targets = apps.filter(a => names.includes(a.customerName));
    console.log(JSON.stringify(targets, null, 2));
}
run();
