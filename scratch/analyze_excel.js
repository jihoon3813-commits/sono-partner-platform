const XLSX = require('xlsx');
const path = require('path');

const filename = "비즈이노 순수상조 유지율_20260429_더해피450one(라이프앤조이).xlsx";
const filePath = path.join(process.cwd(), filename);

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log("Headers:", data[0]);
    console.log("Sample Row 1:", data[1]);
    console.log("Sample Row 2:", data[2]);
} catch (e) {
    console.error(e);
}
