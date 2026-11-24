const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Final.xlsx');
const wb = XLSX.readFile(finalPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log('Total rows:', rows.length - 1);
const statusCounts = {};
const unmatchedRows = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const status = r[17];
  statusCounts[status] = (statusCounts[status] || 0) + 1;
  if (status.includes('CHƯA KHỚP')) {
    unmatchedRows.push({
      stt: r[0],
      ngay: r[3],
      lop: r[7],
      hv: r[12],
      thu: r[10],
      chi: r[9],
      ghiChu: r[18]
    });
  }
}

console.log('Status counts:', statusCounts);
console.log(`Unmatched rows count: ${unmatchedRows.length}`);
console.log('Sample 10 unmatched rows:');
unmatchedRows.slice(0, 10).forEach(u => {
  console.log(`STT ${u.stt} | Ngày: ${u.ngay} | Lớp: ${u.lop} | HV: ${u.hv} | Thu: ${u.thu} | Chi: ${u.chi} | Diễn giải: ${u.ghiChu}`);
});
