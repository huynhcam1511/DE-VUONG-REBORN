const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const dest = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Chuan_Dau_Am_Duong.xlsx');
const wb = XLSX.readFile(dest);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

console.log('Sample rows with signed Phi Du:');
[32, 34, 35, 37, 45, 46, 50].forEach(rIdx => {
  const r = rows[rIdx];
  console.log(`STT ${r[0]} | Ngày: ${r[3]} | Lớp: ${r[7]} | HV: ${r[12]} | Phí dư: ${r[11]} | Trạng thái: ${r[17]}`);
});
