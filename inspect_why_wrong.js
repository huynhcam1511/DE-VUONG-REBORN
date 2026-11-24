const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';

['2026.07', '2026.08', '2026.09', '2026.10'].forEach(m => {
  const fPath = path.join(targetFolder, `lich-su-giao-dich-tai-khoan ${m}.xlsx`);
  const wb = XLSX.readFile(fPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
  console.log(`\n================ ${m} ================`);
  for (let r = 12; r < rows.length; r++) {
    const row = rows[r];
    const credit = row[4];
    const debit = row[3];
    const detail = row[6] || row[5];
    if (credit) {
      console.log(`[CREDIT] Row ${r}: Date=${row[2]} | ${credit} | Detail=${detail}`);
    }
  }
});
