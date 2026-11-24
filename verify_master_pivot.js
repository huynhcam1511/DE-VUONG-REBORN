const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFile = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng\\Bang_Master_Tai_Chinh_De_Vuong.xlsx';
const wb = XLSX.readFile(targetFile);
console.log('Sheets in Master Workbook:', wb.SheetNames);

const ws = wb.Sheets['Pivot_Tai_Chinh'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('\n--- BÁO CÁO PIVOT TÀI CHÍNH TỔNG HỢP ---');
rows.forEach((r, idx) => {
  if (idx === 0) {
    console.log(r.map(c => String(c).padEnd(20)).join(' | '));
    console.log('-'.repeat(160));
  } else {
    const col0 = String(r[0]).padEnd(20);
    const col1 = String(r[1]).padEnd(8);
    const col2 = typeof r[2] === 'number' ? r[2].toLocaleString('vi-VN').padStart(14) : String(r[2]).padStart(14);
    const col3 = typeof r[3] === 'number' ? r[3].toLocaleString('vi-VN').padStart(16) : String(r[3]).padStart(16);
    const col4 = typeof r[4] === 'number' ? r[4].toLocaleString('vi-VN').padStart(18) : String(r[4]).padStart(18);
    const col5 = typeof r[5] === 'number' ? r[5].toLocaleString('vi-VN').padStart(18) : String(r[5]).padStart(18);
    const col6 = typeof r[6] === 'number' ? (r[6] * 100).toFixed(2) + '%' : String(r[6]);
    const col7 = typeof r[7] === 'number' ? (r[7] * 100).toFixed(2) + '%' : String(r[7]);
    console.log(`${col0} | ${col1} | ${col2} | ${col3} | ${col4} | ${col5} | ${col6.padStart(16)} | ${col7.padStart(16)}`);
  }
});
