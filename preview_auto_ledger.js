const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const dest = path.resolve('C:/Users/zit/Downloads/So_Thu_Hoc_Phi_Tu_Dong_Tu_Sao_Ke_80_Phan_Tram.xlsx');
const wb = XLSX.readFile(dest);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

console.log('--- 8 DÒNG MẪU TỰ ĐỘNG BÓC TÁCH 80% CHỈ TỪ SAO KÊ ---');
for (let i = 1; i <= 8; i++) {
  const r = rows[i];
  console.log(`[Dòng ${r[0]}] Ngày: ${r[3]} | Tiền: ${(r[6]).toLocaleString()} đ | HV: ${r[7] || '(trống)'} | Mã lớp: ${r[8] || '(trống)'} | Môn: ${r[9] || '(trống)'}`);
  console.log(`   Trans ID: ${r[1]} | Trạng thái: ${r[10]}`);
  console.log(`   Nội dung gốc: ${r[12]}`);
}
