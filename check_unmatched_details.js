const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

// Check 2024.04 statement for Trang or 2,400,000 or ZB6644 / Anh Tu / 1,950,000
const wb = XLSX.readFile(path.resolve('temp_statements/lich-su-giao-dich-tai-khoan 2024.04.xlsx'));
const bRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

console.log('--- Search 2024.04 ---');
for (let r = 12; r < bRows.length; r++) {
  const str = bRows[r].join(' ');
  if (str.includes('2,400,000') || str.includes('1,950,000') || str.toLowerCase().includes('khang') || str.toLowerCase().includes('trang') || str.toLowerCase().includes('tu') || str.includes('ZB6644') || str.includes('SG2509')) {
    console.log(`Row ${r}: Date=${bRows[r][2]} | Debit=${bRows[r][3]} | Credit=${bRows[r][4]} | Detail=${bRows[r][6]}`);
  }
}
