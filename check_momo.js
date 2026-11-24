const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Final.xlsx');
const wb = XLSX.readFile(finalPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

let momoCount = 0;
let vcbCount = 0;
let internalCount = 0;
let unmatchedCount = 0;

console.log('--- Sample MoMo rows matched in Final file ---');
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const transId = String(r[1]);
  const detail = String(r[18]);
  if (transId.startsWith('EW') || detail.includes('MOMO')) {
    momoCount++;
    if (momoCount <= 5) {
      console.log(`STT ${r[0]} | Ngày: ${r[3]} | Tiền: ${r[9] || r[10]} | Lớp: ${r[7]} | HV: ${r[12]}`);
      console.log(`   Trans ID: ${transId} | Doc: ${r[2]}`);
      console.log(`   Detail: ${detail}\n`);
    }
  }
}
console.log(`Total MoMo transactions found in final file: ${momoCount}`);
