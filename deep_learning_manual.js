const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheet = mwb.Sheets[mwb.SheetNames[0]];
const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

// Let's analyze the 411 manual rows to extract exact patterns:
// 1. Who are the recurring students / payers?
// 2. What are the typical fee patterns?
// 3. What do they write in the transfer detail?
// 4. How did the user categorize them?

const studentMap = {}; // name -> { count, typicalAmounts, classes, subjects }
const classPatterns = {}; // classCode -> { subject, fee }
const transferTextKeywords = {}; // keyword -> count

for (let r = 1; r < mRows.length; r++) {
  const row = mRows[r];
  const year = row[0];
  const month = row[1];
  const lop = row[3];
  const status = row[4];
  const debit = row[5];
  const credit = row[6];
  const phiDu = row[7];
  const tenHV = row[9];
  const sdt = row[10];
  const monHoc = row[13];
  const hinhThuc = row[14];

  if (!tenHV && !lop) continue;

  if (tenHV) {
    if (!studentMap[tenHV]) studentMap[tenHV] = { count: 0, classes: new Set(), months: [] };
    studentMap[tenHV].count++;
    if (lop) studentMap[tenHV].classes.add(lop);
    studentMap[tenHV].months.push(`${year}-${month}`);
  }
}

console.log('Top 25 recurring students in manual bookkeeping:');
Object.entries(studentMap)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 25)
  .forEach(([name, data]) => {
    console.log(`- ${name}: ${data.count} entries, Classes: [${[...data.classes].join(', ')}]`);
  });
