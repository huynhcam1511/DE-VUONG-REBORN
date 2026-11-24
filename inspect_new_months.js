const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';
const masterFile = path.join(targetFolder, 'Bang_Master_Tai_Chinh_De_Vuong.xlsx');

// 1. Check existing master data
const wb = XLSX.readFile(masterFile);
const dataWs = wb.Sheets['Master_Data_Chi_Tiet'];
const existingRows = XLSX.utils.sheet_to_json(dataWs, { header: 1, defval: '' });
console.log(`Existing master records: ${existingRows.length - 1}`);

// Check maximum date and month in existing master
let maxDate = '';
for (let i = 1; i < existingRows.length; i++) {
  const r = existingRows[i];
  if (r[5] == 2026) {
    console.log(`2026 row ${r[0]}: Nam=${r[5]}, Thang=${r[6]}, Ngay=${r[3]}, Tien=${r[10]}, Detail=${r[18]}`);
  }
}

// 2. Scan monthly statement files for 2026.07, 2026.08, 2026.09, 2026.10
const monthsToScan = ['2026.07', '2026.08', '2026.09', '2026.10'];
for (const m of monthsToScan) {
  const fName = `lich-su-giao-dich-tai-khoan ${m}.xlsx`;
  const fPath = path.join(targetFolder, fName);
  if (fs.existsSync(fPath)) {
    const swb = XLSX.readFile(fPath);
    const sRows = XLSX.utils.sheet_to_json(swb.Sheets[swb.SheetNames[0]], { header: 1, defval: '' });
    console.log(`\n--- File ${fName} (Rows: ${sRows.length}) ---`);
    for (let r = 12; r < sRows.length; r++) {
      const row = sRows[r];
      const credit = row[4];
      const debit = row[3];
      if (credit || debit) {
        console.log(`Row ${r}: Date=${row[2]} | Debit=${debit} | Credit=${credit} | Detail=${row[6]}`);
      }
    }
  } else {
    console.log(`File not found: ${fName}`);
  }
}
