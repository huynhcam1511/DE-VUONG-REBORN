const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

function normalizeMoney(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Math.round(val);
  const s = String(val).replace(/[^0-9.-]+/g, '');
  return Math.round(parseFloat(s)) || 0;
}

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mRows = XLSX.utils.sheet_to_json(mwb.Sheets[mwb.SheetNames[0]], { header: 1, defval: '' });
const r3 = mRows[3];
console.log('Manual r3[5] (Ghi no):', JSON.stringify(r3[5]), 'norm:', normalizeMoney(r3[5]));
console.log('Manual r3[6] (Ghi co):', JSON.stringify(r3[6]), 'norm:', normalizeMoney(r3[6]));

const wb = XLSX.readFile(path.resolve('temp_statements/lich-su-giao-dich-tai-khoan 2024.01.xlsx'));
const bRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
const b78 = bRows[78];
console.log('Bank b78[3] (Debit):', JSON.stringify(b78[3]), 'norm:', normalizeMoney(b78[3]));
console.log('Bank b78[4] (Credit):', JSON.stringify(b78[4]), 'norm:', normalizeMoney(b78[4]));
