const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const masterPath = path.resolve('C:/Users/zit/Downloads/Bang_Master_Tai_Chinh_De_Vuong.xlsx');
const wb = XLSX.readFile(masterPath);

// Sheet 1 is Pivot_Tai_Chinh, Sheet 2 is Master_Data_Chi_Tiet
const rawRows = XLSX.utils.sheet_to_json(wb.Sheets['Master_Data_Chi_Tiet'], { header: 1, defval: '' });
console.log('Headers in Master_Data_Chi_Tiet:\n', rawRows[0]);

// Build standard import rows for ManualAccountingModule:
// Required headers:
// 'Mã chứng từ', 'Năm', 'Tháng', 'Ngày', 'Mã lớp', 'Trạng thái', 'Ghi nợ', 'Ghi có', 'Phí dư', 'Tình trạng', 'Tên học viên', 'Số điện thoại', 'Ghi chú'
const importRows = [];
importRows.push([
  'Mã chứng từ',
  'Năm',
  'Tháng',
  'Ngày',
  'Mã lớp',
  'Trạng thái',
  'Ghi nợ',
  'Ghi có',
  'Phí dư',
  'Tình trạng',
  'Tên học viên',
  'Số điện thoại',
  'Ghi chú'
]);

for (let r = 1; r < rawRows.length; r++) {
  const row = rawRows[r];
  const transId = row[1];
  const docNo = row[2];
  const ngay = row[3]; // DD/MM/YYYY
  const nam = row[5];
  const thang = row[6];
  const lop = row[7];
  const trangThai = row[8] || 'Start';
  const ghiNo = row[9] || 0;
  const ghiCo = row[10] || 0;
  const phiDu = row[11] || 0;
  const tenHV = row[12];
  const sdt = row[13];
  const monHoc = row[14];
  const trangThaiDoiSoat = row[17];
  const chiTietSaoKe = row[18];

  const entryCode = transId && !transId.startsWith('CT_') ? String(transId) : `REC_${nam}_${String(thang).padStart(2, '0')}_${r}`;
  const note = [monHoc, trangThaiDoiSoat, chiTietSaoKe ? `[${chiTietSaoKe.slice(0, 40)}]` : ''].filter(Boolean).join(' - ');

  importRows.push([
    entryCode,
    nam,
    thang,
    ngay,
    lop,
    trangThai,
    ghiNo,
    ghiCo,
    phiDu,
    'Non-Active',
    tenHV,
    sdt,
    note
  ]);
}

const outWb = XLSX.utils.book_new();
const outWs = XLSX.utils.aoa_to_sheet(importRows);
outWs['!cols'] = [
  { wch: 22 }, // Ma CT
  { wch: 8 },  // Nam
  { wch: 8 },  // Thang
  { wch: 14 }, // Ngay
  { wch: 12 }, // Ma lop
  { wch: 12 }, // Trang thai
  { wch: 14 }, // Ghi no
  { wch: 14 }, // Ghi co
  { wch: 14 }, // Phi du
  { wch: 12 }, // Tinh trang
  { wch: 24 }, // Ten HV
  { wch: 14 }, // SDT
  { wch: 50 }  // Ghi chu
];

XLSX.utils.book_append_sheet(outWb, outWs, 'BANG_HACH_TOAN_LOP');

const dest = path.resolve('C:/Users/zit/Downloads/File_Up_Len_Web_Hach_Toan_Lop.xlsx');
XLSX.writeFile(outWb, dest);
console.log(`Saved web-compatible upload file (${importRows.length - 1} rows) to:\n${dest}`);
