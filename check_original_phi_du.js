const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheet = mwb.Sheets[mwb.SheetNames[0]];
const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

console.log('Original Header:', mRows[0].slice(0, 12));
console.log('\n--- Rows with Phi Du in original manual file ---');
let count = 0;
for (let r = 1; r < mRows.length; r++) {
  const row = mRows[r];
  const phiDuRaw = row[7];
  if (phiDuRaw !== '' && phiDuRaw !== null && phiDuRaw !== undefined && phiDuRaw !== 0) {
    count++;
    if (count <= 15) {
      console.log(`Row ${r}: Ngay=${row[2]}, Lop=${row[3]}, TrangThai=${row[4]}, No=${row[5]}, Co=${row[6]}, PhiDu=${phiDuRaw}, Ten=${row[9]}`);
    }
  }
}
console.log(`Total rows with Phi Du: ${count}`);
