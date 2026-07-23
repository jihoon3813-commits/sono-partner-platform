const CONVEX_URL = "https://resolute-orca-48.convex.cloud";

async function queryDebug(partnerId) {
    const url = `${CONVEX_URL}/api/query`;
    const body = {
        path: "retention2:debugPartnerHierarchy",
        args: { partnerId: partnerId },
        format: "json"
    };
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return await response.json();
}

async function main() {
    const result = await queryDebug("P-1770618951261");
    console.log("Collected partners count:", result.value.collectedPartnersCount);
    console.log("Collected partners list:", JSON.stringify(result.value.collectedPartnersList, null, 2));
    console.log("Per partner counts:", JSON.stringify(result.value.perPartnerCounts, null, 2));
}

main();
