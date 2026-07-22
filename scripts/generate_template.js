const XLSX = require('xlsx');
const path = require('path');

const standardHeaders = [
    "고객명 *", "연락처 *", "생년월일(선택)", "성별(선택)", "주소(선택)", "상세주소(선택)",
    "상품유형 *", "구좌수 *", "통화가능시간 *", "가전제품(스마트케어인 경우 필수)",
    "회원번호(선택)", "문의사항(선택)"
];

const adminHeaders = [
    "파트너ID(로그인ID) *",
    ...standardHeaders
];

// Generate Standard Template
const ws = XLSX.utils.aoa_to_sheet([standardHeaders]);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "업로드양식");
XLSX.writeFile(wb, path.resolve(__dirname, '../public/customer_template.xlsx'));

// Generate Admin Template
const wsAdmin = XLSX.utils.aoa_to_sheet([adminHeaders]);
const wbAdmin = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbAdmin, wsAdmin, "업로드양식");
XLSX.writeFile(wbAdmin, path.resolve(__dirname, '../public/customer_template_admin.xlsx'));

console.log(`Templates created in public folder.`);
