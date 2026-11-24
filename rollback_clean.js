const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';
const masterFile = path.join(targetFolder, 'Bang_Master_Tai_Chinh_De_Vuong.xlsx');

// Rollback to original 411 records from cách tôi nhập.xlsx
const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheet = mwb.Sheets[mwb.SheetNames[0]];
const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

// We already had the correctly mapped 411 rows with signed phi du in Bang_Master_Tai_Chinh_De_Vuong.xlsx before adding the 45 rows!
// Let's filter out the rows where STT > 411
const curWb = XLSX.readFile(masterFile);
const curMasterWs = curWb.Sheets['Master_Data_Chi_Tiet'];
const curMasterRows = XLSX.utils.sheet_to_json(curMasterWs, { header: 1, defval: '' });

const originalMasterRows = curMasterRows.filter((r, idx) => idx === 0 || (r[0] && parseInt(r[0], 10) <= 411));
console.log(`Original master records kept: ${originalMasterRows.length - 1}`);

// Rebuild Pivot Sheet matching Image 2 exactly!
const summaryMap = {};
for (let r = 1; r < originalMasterRows.length; r++) {
  const row = originalMasterRows[r];
  const year = parseInt(row[5], 10) || 2024;
  const month = parseInt(row[6], 10) || 1;
  const no = typeof row[9] === 'number' ? row[9] : (parseFloat(String(row[9]).replace(/[^0-9.-]/g, '')) || 0);
  const co = typeof row[10] === 'number' ? row[10] : (parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0);
  const phiDu = typeof row[11] === 'number' ? row[11] : (parseFloat(String(row[11]).replace(/[^0-9.-]/g, '')) || 0);

  if (!summaryMap[year]) {
    summaryMap[year] = { phiDu: 0, no: 0, co: 0, months: {} };
  }
  summaryMap[year].phiDu += phiDu;
  summaryMap[year].no += no;
  summaryMap[year].co += co;

  if (!summaryMap[year].months[month]) {
    summaryMap[year].months[month] = { phiDu: 0, no: 0, co: 0 };
  }
  summaryMap[year].months[month].phiDu += phiDu;
  summaryMap[year].months[month].no += no;
  summaryMap[year].months[month].co += co;
}

const pivotRows = [
  [
    'Năm',
    'Tháng',
    'SUM của Phí dư',
    'SUM của Ghi nợ',
    'SUM của Ghi có',
    'Lợi nhuận',
    'Chi phí/Doanh thu',
    'Chi phí/ Lợi nhuận',
    'TEST LỢI NHUẬN NÀY'
  ]
];

let grandPhiDu = 0;
let grandNo = 0;
let grandCo = 0;

const years = Object.keys(summaryMap).sort((a, b) => a - b);
for (const y of years) {
  const yData = summaryMap[y];
  grandPhiDu += yData.phiDu;
  grandNo += yData.no;
  grandCo += yData.co;

  const yProfit = yData.co - yData.no;
  const yCostToRev = yData.co > 0 ? (yData.no / yData.co) : 0;
  const yCostToProfit = yProfit > 0 ? (yData.no / yProfit) : 0;

  pivotRows.push([
    `+ Tổng số ${y}`,
    '',
    yData.phiDu,
    yData.no,
    yData.co,
    yProfit,
    yCostToRev,
    yCostToProfit,
    yProfit
  ]);

  const months = Object.keys(yData.months).sort((a, b) => a - b);
  for (const m of months) {
    const mData = yData.months[m];
    const mProfit = mData.co - mData.no;
    const mCostToRev = mData.co > 0 ? (mData.no / mData.co) : 0;
    const mCostToProfit = mProfit > 0 ? (mData.no / mProfit) : 0;

    pivotRows.push([
      y,
      String(m).padStart(2, '0'),
      mData.phiDu,
      mData.no,
      mData.co,
      mProfit,
      mCostToRev,
      mCostToProfit,
      mProfit
    ]);
  }
}

const grandProfit = grandCo - grandNo;
const grandCostToRev = grandCo > 0 ? (grandNo / grandCo) : 0;
const grandCostToProfit = grandProfit > 0 ? (grandNo / grandProfit) : 0;

pivotRows.push([
  'Tổng cộng',
  '',
  grandPhiDu,
  grandNo,
  grandCo,
  grandProfit,
  grandCostToRev,
  grandCostToProfit,
  grandProfit
]);

const cleanMasterWb = XLSX.utils.book_new();

const cleanPivotWs = XLSX.utils.aoa_to_sheet(pivotRows);
cleanPivotWs['!cols'] = [
  { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
];

for (let r = 1; r < pivotRows.length; r++) {
  [2, 3, 4, 5, 8].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (cleanPivotWs[cellAddr]) cleanPivotWs[cellAddr].z = '#,##0" đ"';
  });
  [6, 7].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (cleanPivotWs[cellAddr]) cleanPivotWs[cellAddr].z = '0.00%';
  });
}

const cleanMasterWs = XLSX.utils.aoa_to_sheet(originalMasterRows);
cleanMasterWs['!cols'] = [
  { wch: 6 }, { wch: 36 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
  { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 34 },
  { wch: 60 }, { wch: 35 }
];

XLSX.utils.book_append_sheet(cleanMasterWb, cleanPivotWs, 'Pivot_Tai_Chinh');
XLSX.utils.book_append_sheet(cleanMasterWb, cleanMasterWs, 'Master_Data_Chi_Tiet');

XLSX.writeFile(cleanMasterWb, masterFile);
console.log('Successfully rolled back and saved exact clean master file to:\n', masterFile);

const dlFile = path.resolve('C:/Users/zit/Downloads/Bang_Master_Tai_Chinh_De_Vuong.xlsx');
XLSX.writeFile(cleanMasterWb, dlFile);
console.log('Synced to Downloads:\n', dlFile);
