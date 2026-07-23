// Test both dev and prod Convex servers
const DEV_URL = "https://successful-marmot-772.convex.cloud";
const PROD_URL = "https://resolute-orca-48.convex.cloud";

async function queryConvex(baseUrl, path, args) {
    const url = `${baseUrl}/api/query`;
    const body = { path, args, format: "json" };
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function main() {
    // DEV server test
    console.log("=== DEV SERVER (successful-marmot-772) ===");
    const devResult = await queryConvex(DEV_URL, "retention2:getRetentionRecords", { partnerId: "P-1770618951261" });
    console.log("Status:", devResult.status);
    if (devResult.value) {
        console.log("Record count:", devResult.value.length);
    } else {
        console.log("Response:", JSON.stringify(devResult, null, 2));
    }

    // PROD server test
    console.log("\n=== PROD SERVER (resolute-orca-48) ===");
    const prodResult = await queryConvex(PROD_URL, "retention2:getRetentionRecords", { partnerId: "P-1770618951261" });
    console.log("Status:", prodResult.status);
    if (prodResult.value) {
        console.log("Record count:", prodResult.value.length);
    } else {
        console.log("Response:", JSON.stringify(prodResult, null, 2));
    }
}

main();
