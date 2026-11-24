const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

function parseExcelDate(serial) {
  if (!serial) return null;
  if (typeof serial === 'number') {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
  }
  return null;
}

[45300, 45305, 45308, 45311, 45317, 45322].forEach(s => {
  const d = parseExcelDate(s);
  console.log(`Serial ${s} -> ${d ? d.toISOString().split('T')[0] : 'null'}`);
});

// Check 2024.01 bank statement for 2,200,000 on 2024-01-18 or 500,000 on 2024-01-10
const wb = XLSX.readFile(path.resolve('temp_statements/lich-su-giao-dich-tai-khoan 2024.01.xlsx'));
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Bank rows with 2,200,000 or 500,000 in 2024.01:');
for (let r = 12; r < rows.length; r++) {
  const row = rows[r];
  const str = row.join(' ');
  if (str.includes('2,200,000') || str.includes('500,000') || str.includes('4,200,000') || str.includes('Kiều') || str.includes('Thuỷ') || str.includes('LG4729') || str.includes('ZG5917')) {
    console.log(`Row ${r}: Date=${row[2]}, Debit=${row[3]}, Credit=${row[4]}, Detail=${row[6]}`);
  }
}
