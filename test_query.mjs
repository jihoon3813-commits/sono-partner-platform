const CONVEX_URL = "https://resolute-orca-48.convex.cloud";

async function queryConvex(path, args) {
    const url = `${CONVEX_URL}/api/query`;
    const body = { path, args, format: "json" };
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function main() {
    console.log("=== getRetentionRecords for 베스트원서브 (P-1770618951261) ===");
    const res1 = await queryConvex("retention2:getRetentionRecords", { partnerId: "P-1770618951261" });
    console.log("Record count:", res1.value?.length);

    console.log("\n=== getRetentionRecords for 니오라 (P-1770619308881) ===");
    const res2 = await queryConvex("retention2:getRetentionRecords", { partnerId: "P-1770619308881" });
    console.log("Record count:", res2.value?.length);

    console.log("\n=== getRetentionRecords for 제이온 (P-1770619312240) ===");
    const res3 = await queryConvex("retention2:getRetentionRecords", { partnerId: "P-1770619312240" });
    console.log("Record count:", res3.value?.length);
}

main();
