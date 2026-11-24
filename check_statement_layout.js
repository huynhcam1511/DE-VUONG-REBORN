const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const sample = path.resolve('temp_statements/lich-su-giao-dich-tai-khoan 2024.01.xlsx');
const wb = XLSX.readFile(sample);
console.log('Sheets in 2024.01:', wb.SheetNames);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
console.log('Rows count:', rows.length);
for (let i = 0; i < Math.min(rows.length, 18); i++) {
  console.log(`Row ${i}:`, rows[i]);
}
