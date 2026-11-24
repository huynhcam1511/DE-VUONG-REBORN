const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

function parseExcelDate(val) {
  if (!val) return null;
  if (typeof val === 'number') {
    const utc_days = Math.floor(val - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
  const s = String(val).trim();
  const m = s.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m) {
    return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  }
  return null;
}

const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
const mwb = XLSX.readFile(manualPath);
const mSheet = mwb.Sheets[mwb.SheetNames[0]];
const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

// Check row 3 (which was 2,200,000 for Nhat Huy on 17/01/2024)
const r3 = mRows[3];
const d3 = parseExcelDate(r3[2]);
console.log('Row 3 raw date:', r3[2], 'Parsed:', d3);

// Load bank 2024.01 row 78
const wb = XLSX.readFile(path.resolve('temp_statements/lich-su-giao-dich-tai-khoan 2024.01.xlsx'));
const bRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
const b78 = bRows[78];
console.log('Bank row 78 col 2 (Date):', b78[2]);
const lines = String(b78[2]).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
console.log('Bank lines[0]:', lines[0]);
const bDate = parseExcelDate(lines[0]);
console.log('Bank parsed date:', bDate);

const diffDays = Math.abs((bDate - d3) / (1000 * 60 * 60 * 24));
console.log('Diff days:', diffDays);
