const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Final.xlsx');
const wb = XLSX.readFile(finalPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Final workbook headers:\n', rows[0]);
console.log('\n--- 5 Sample Matched Rows ---');
for (let i = 1; i <= 5; i++) {
  console.log(`\nRow ${i}:`);
  console.log(`STT: ${rows[i][0]} | Trans ID: ${rows[i][1]} | Doc No: ${rows[i][2]} | Ngày thực tế: ${rows[i][3]}`);
  console.log(`Học viên: ${rows[i][11]} | Lớp: ${rows[i][6]} | Thu (Có): ${rows[i][9]} | Chi (Nợ): ${rows[i][8]}`);
  console.log(`Đối soát: ${rows[i][16]} | File: ${rows[i][18]}`);
  console.log(`Sao kê gốc: ${rows[i][17]}`);
}
