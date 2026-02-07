const fs = require('fs');
const { ConvexHttpClient } = require("convex/browser");

// Configuration
const DEV_URL = "https://successful-marmot-772.convex.cloud";
const PROD_URL = "https://resolute-orca-48.convex.cloud";
const TARGET_ID = "kg2bytfx5j1pyhn66hewrxv22s80pxmv";
const TEMP_FILE_PATH = "temp_template.xlsx";

async function migrate() {
    console.log("🚀 Starting Template Migration from Dev to Prod...");

    // 1. Download from Dev
    console.log(`\n1. Downloading file from Dev Storage (${TARGET_ID})...`);
    const devStorageUrl = `${DEV_URL}/api/storage/${TARGET_ID}`;

    try {
        const response = await fetch(devStorageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download from Dev: ${response.status} ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(TEMP_FILE_PATH, Buffer.from(buffer));
        console.log(`   ✅ Downloaded ${buffer.byteLength} bytes to ${TEMP_FILE_PATH}`);
    } catch (e) {
        console.error("   ❌ Download failed. The ID might be wrong or not in Dev.");
        console.error("   Attempting to use local 'public/customer_template.xlsx' as fallback...");
        if (fs.existsSync('public/customer_template.xlsx')) {
            fs.copyFileSync('public/customer_template.xlsx', TEMP_FILE_PATH);
            console.log("   ✅ Using local fallback file.");
        } else {
            console.error("   ❌ No local file found. Aborting.");
            return;
        }
    }

    // 2. Upload to Prod
    console.log(`\n2. Uploading to Prod Storage...`);
    const prodClient = new ConvexHttpClient(PROD_URL);

    try {
        // Generate Upload URL (requires "resources:generateUploadUrl" mutation in Prod)
        const uploadUrl = await prodClient.mutation("resources:generateUploadUrl");
        console.log(`   ✅ Generated Upload URL`);

        // Upload File
        const fileContent = fs.readFileSync(TEMP_FILE_PATH);
        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            body: fileContent,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const { storageId: newStorageId } = await uploadResponse.json();
        console.log(`   ✅ Uploaded to Prod! New Storage ID: ${newStorageId}`);

        // 3. Update Setting in Prod
        console.log(`\n3. Updating 'standard_template_url' setting...`);
        await prodClient.mutation("settings:updateSetting", {
            key: "standard_template_url",
            value: newStorageId
        });
        console.log(`   ✅ Setting updated successfully!`);

        // Clean up
        fs.unlinkSync(TEMP_FILE_PATH);
        console.log("\n🎉 Migration Complete!");

    } catch (e) {
        console.error("\n❌ Migration failed:", e);
    }
}

migrate();
