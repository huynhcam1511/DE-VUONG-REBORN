const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const dest = path.resolve('C:/Users/zit/Downloads/So_Thu_Hoc_Phi_Tu_Dong_Tu_Sao_Ke_80_Phan_Tram.xlsx');
const wb = XLSX.readFile(dest);
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

console.log('Sample rows:');
for (let i = 1; i <= 6; i++) {
  const r = rows[i];
  console.log(`[Dòng ${r[0]}] ${r[3]} | Tiền: ${(r[6]).toLocaleString()} đ | Người nộp: ${r[7] || '(chưa có)'} | Lớp: ${r[8] || '(chưa có)'} | Mức độ AI: ${r[10]}`);
  console.log(`   Trans ID: ${r[1]} | Doc: ${r[2]}`);
  console.log(`   Nội dung: ${r[12]}\n`);
}
