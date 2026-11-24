const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Chuan_Dau_Am_Duong.xlsx');
const wb = XLSX.readFile(finalPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

// Create mappings: (Bank Name / Bank Pattern) -> Student Profile
const bankToStudentProfile = {};

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const hv = row[12];
  const lop = row[7];
  const mon = row[14];
  const hinhThuc = row[15];
  const sdt = row[13];
  const detail = String(row[18]);

  if (!hv || !detail || detail.includes('Cấn trừ')) continue;

  // Extract bank account name from detail
  // Patterns:
  // "CT tu ... <NAME> toi"
  // "<NAME> chuyen tien"
  // "QR - <NAME>"
  // "IBFT <NAME>"
  // "<NAME> thanh toan"
  let bankName = '';
  let m = detail.match(/CT tu \d+\s+([A-Z\s]{4,30})\s+toi/i);
  if (m) bankName = m[1].trim();
  else {
    m = detail.match(/(?:QR\s*-\s*|IBFT\s+)?([A-Z\s]{4,30})\s+(?:chuyen tien|chuyen khoan|thanh toan|ck|transfer|dong hoc)/i);
    if (m) bankName = m[1].trim();
  }

  if (bankName) {
    bankName = bankName.replace(/MBVCB|HUYNH KIEN CAM|NGAN HANG/gi, '').trim();
    if (bankName.length >= 4) {
      if (!bankToStudentProfile[bankName]) {
        bankToStudentProfile[bankName] = { hv, lop, mon, hinhThuc, sdt, count: 0, examples: [] };
      }
      bankToStudentProfile[bankName].count++;
      bankToStudentProfile[bankName].examples.push(detail);
    }
  }
}

console.log('Learned Bank Payer Profiles:');
Object.entries(bankToStudentProfile)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([bName, p]) => {
    console.log(`[Bank: "${bName}"] -> HV: "${p.hv}" | Lớp: ${p.lop} | Môn: ${p.mon} (${p.count} lần)`);
  });
