const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheet = mwb.Sheets[mwb.SheetNames[0]];
const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

for (let r = 1; r <= 10; r++) {
  const row = mRows[r];
  console.log(`Manual row ${r}: Nam=${row[0]}, Thang=${row[1]}, Ngay=${row[2]}, Lop=${row[3]}, No=${row[5]}, Co=${row[6]}, Ten=${row[9]}`);
}
