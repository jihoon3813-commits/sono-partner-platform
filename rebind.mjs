const CONVEX_URL = "https://resolute-orca-48.convex.cloud";

async function executeMutation(path, args) {
    const url = `${CONVEX_URL}/api/mutation`;
    const body = { path, args, format: "json" };
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function main() {
    console.log("=== Executing rebindAllRetentionRecords mutation ===");
    const result = await executeMutation("retention2:rebindAllRetentionRecords", {});
    console.log("Rebind result:", JSON.stringify(result, null, 2));
}

main();
