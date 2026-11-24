const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';
const currentFile = path.join(targetFolder, 'Bang_Hach_Toan_Toan_Bo_Da_Mapping_Chuan_Dau_Am_Duong.xlsx');
const newMasterName = 'Bang_Master_Tai_Chinh_De_Vuong.xlsx';
const newMasterPath = path.join(targetFolder, newMasterName);

console.log('Reading file:', currentFile);
const wb = XLSX.readFile(currentFile);
const rawDataWs = wb.Sheets[wb.SheetNames[0]];
const dataRows = XLSX.utils.sheet_to_json(rawDataWs, { header: 1, defval: '' });

console.log(`Loaded ${dataRows.length - 1} data records.`);
const header = dataRows[0];
console.log('Data Header:', header);

// Let's identify columns:
// STT: 0
// MÃ GIAO DỊCH NGÂN HÀNG (TRANS ID): 1
// SỐ CHỨNG TỪ (DOC NO): 2
// NGÀY GIAO DỊCH (THỰC TẾ): 3
// NGÀY SỔ CŨ: 4
// NĂM: 5
// THÁNG: 6
// MÃ LỚP: 7
// TRẠNG THÁI: 8
// GHI NỢ (CHI/LƯƠNG): 9
// GHI CÓ (THU HỌC PHÍ): 10
// PHÍ DƯ (+ TĂNG QUỸ / - RÚT CẤN TRỪ): 11

// Let's aggregate by Year & Month to build the Pivot Summary matching Image 2:
// Columns in Image 2:
// [Năm, Tháng, SUM của Phí dư, SUM của Ghi nợ, SUM của Ghi có, Lợi nhuận, Chi phí/Doanh thu, Chi phí/ Lợi nhuận, TEST LỢI NHUẬN NÀY]
// Lợi nhuận = SUM Ghi có - SUM Ghi nợ
// Chi phí/Doanh thu = SUM Ghi nợ / SUM Ghi có
// Chi phí/Lợi nhuận = SUM Ghi nợ / Lợi nhuận
// TEST LỢI NHUẬN NÀY = Lợi nhuận (hoặc Lợi nhuận + Phí dư tùy công thức)

const summaryMap = {}; // key: year -> { totalPhiDu, totalNo, totalCo, months: { month -> { phiDu, no, co } } }

for (let r = 1; r < dataRows.length; r++) {
  const row = dataRows[r];
  const year = parseInt(row[5], 10) || 2024;
  const month = parseInt(row[6], 10) || 1;
  const no = typeof row[9] === 'number' ? row[9] : (parseFloat(String(row[9]).replace(/[^0-9.-]/g, '')) || 0);
  const co = typeof row[10] === 'number' ? row[10] : (parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0);
  const phiDu = typeof row[11] === 'number' ? row[11] : (parseFloat(String(row[11]).replace(/[^0-9.-]/g, '')) || 0);

  if (!summaryMap[year]) {
    summaryMap[year] = {
      phiDu: 0,
      no: 0,
      co: 0,
      months: {}
    };
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

console.log('Aggregated years:', Object.keys(summaryMap));

// Build Pivot Table Sheet Rows matching Image 2 exactly
const pivotRows = [];

// Header row
pivotRows.push([
  'Năm',
  'Tháng',
  'SUM của Phí dư',
  'SUM của Ghi nợ',
  'SUM của Ghi có',
  'Lợi nhuận',
  'Chi phí/Doanh thu',
  'Chi phí/ Lợi nhuận',
  'TEST LỢI NHUẬN NÀY'
]);

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

  // Year Total Row: e.g. "+ Tổng số 2024"
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

  // If year is recent (e.g. 2026 or all years), list detailed months:
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

// Grand Total Row: "Tổng cộng"
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

// Create fresh workbook with 2 sheets:
// Sheet 1: Báo Cáo PIVOT Tài Chính
// Sheet 2: Master Data Chi Tiết
const masterWb = XLSX.utils.book_new();

const pivotWs = XLSX.utils.aoa_to_sheet(pivotRows);
pivotWs['!cols'] = [
  { wch: 18 }, // Năm
  { wch: 10 }, // Tháng
  { wch: 18 }, // SUM Phí dư
  { wch: 20 }, // SUM Ghi nợ
  { wch: 20 }, // SUM Ghi có
  { wch: 20 }, // Lợi nhuận
  { wch: 18 }, // Chi phí/Doanh thu
  { wch: 18 }, // Chi phí/ Lợi nhuận
  { wch: 22 }  // TEST LỢI NHUẬN
];

// Format numbers in pivot sheet
for (let r = 1; r < pivotRows.length; r++) {
  // cols C, D, E, F, I (2, 3, 4, 5, 8) as Currency
  [2, 3, 4, 5, 8].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (pivotWs[cellAddr]) {
      pivotWs[cellAddr].z = '#,##0" đ"';
    }
  });
  // cols G, H (6, 7) as Percentage
  [6, 7].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (pivotWs[cellAddr]) {
      pivotWs[cellAddr].z = '0.00%';
    }
  });
}

XLSX.utils.book_append_sheet(masterWb, pivotWs, 'Pivot_Tai_Chinh');
XLSX.utils.book_append_sheet(masterWb, rawDataWs, 'Master_Data_Chi_Tiet');

// Write out to the single master file in the folder!
XLSX.writeFile(masterWb, newMasterPath);
console.log('Successfully written Master file with Pivot Table to:\n', newMasterPath);

// Also copy to Downloads for user accessibility
const downloadMaster = path.resolve('C:/Users/zit/Downloads/Bang_Master_Tai_Chinh_De_Vuong.xlsx');
XLSX.writeFile(masterWb, downloadMaster);
console.log('Also synced copy to Downloads:\n', downloadMaster);
