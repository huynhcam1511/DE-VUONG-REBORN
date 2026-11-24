const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Final.xlsx');
const wb = XLSX.readFile(finalPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('--- 6 DÒNG ĐẦU TIÊN CỦA FILE CUỐI CÙNG ---');
for (let i = 1; i <= 6; i++) {
  const r = rows[i];
  console.log(`[Dòng ${r[0]}] Mã GD: ${r[1]} | Số CT: ${r[2]} | Ngày thực tế: ${r[3]} | Lớp: ${r[7]} | HV: ${r[12]} | Thu (Có): ${r[10]} | Chi (Nợ): ${r[9]} | Đối soát: ${r[17]} | File: ${r[19]}`);
}
