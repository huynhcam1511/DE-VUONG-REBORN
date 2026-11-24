const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheetName = mwb.SheetNames[0];
const mRows = XLSX.utils.sheet_to_json(mwb.Sheets[mSheetName], { header: 1, defval: '' });

console.log('Row 0 headers:', mRows[0]);
console.log('Sample row 1:', mRows[1]);
console.log('Sample row 2:', mRows[2]);
console.log('Sample row 3:', mRows[3]);
