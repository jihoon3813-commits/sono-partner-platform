const fs = require('fs');
const XLSX = require('xlsx');
const { ConvexHttpClient } = require("convex/browser");

// Configuration
const PROD_URL = "https://resolute-orca-48.convex.cloud";
const TEMP_FILE_PATH = "public/customer_template.xlsx";

async function fixTemplate() {
    console.log("🛠️ fixing Standard Template...");

    // 1. Define Correct Data Structure (No Partner ID)
    const headers = [
        "고객명 *",
        "연락처(010-xxxx-xxxx) *",
        "생년월일(YYYY-MM-DD) *",
        "성별(남/여) *",
        "주소 *",
        "상세주소",
        "상품유형(더 해피 450 ONE/스마트케어) *",
        "구좌수(숫자만) *",
        "가전제품(스마트케어인 경우)",
        "회원번호(선택)",
        "문의사항(선택)"
    ];

    const sampleRow = [
        "홍길동",
        "010-1234-5678",
        "1980-01-01",
        "남",
        "서울시 송파구 올림픽로 300",
        "롯데월드타워 101호",
        "더 해피 450 ONE",
        "1",
        "",
        "",
        "오후 2시 이후 통화 희망"
    ];

    const data = [headers, sampleRow];

    // 2. Create Workbook
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const wscols = [
        { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 12 },
        { wch: 40 }, { wch: 20 }, { wch: 30 }, { wch: 15 },
        { wch: 30 }, { wch: 15 }, { wch: 30 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "업로드양식");

    // 3. Write to File
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    fs.writeFileSync(TEMP_FILE_PATH, buffer);
    console.log(`   ✅ Correct file generated at ${TEMP_FILE_PATH}`);

    // 4. Upload to Prod
    console.log(`\n📤 Uploading to Prod Storage...`);
    const prodClient = new ConvexHttpClient(PROD_URL);

    try {
        const uploadUrl = await prodClient.mutation("resources:generateUploadUrl");

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            body: buffer,
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        const { storageId: newStorageId } = await uploadResponse.json();
        console.log(`   ✅ Uploaded! New Storage ID: ${newStorageId}`);

        // 5. Update Setting
        console.log(`\n⚙️ Updating 'standard_template_url' setting...`);
        await prodClient.mutation("settings:updateSetting", {
            key: "standard_template_url",
            value: newStorageId
        });
        console.log(`   ✅ Setting updated successfully!`);

    } catch (e) {
        console.error("\n❌ Fix failed:", e);
    }
}

fixTemplate();
