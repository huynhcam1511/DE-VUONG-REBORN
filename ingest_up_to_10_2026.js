const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';

function parseTransactionDetail(detail) {
  if (!detail) return { transId: '', raw: '' };
  const d = String(detail).trim();
  let m = d.match(/MBVCB\.(\d+)/i);
  if (m) return { transId: `MBVCB.${m[1]}`, raw: d };
  m = d.match(/Ecom\.(EW\w+)/i) || d.match(/(EW\d{10,})/i);
  if (m) return { transId: m[1], raw: d };
  m = d.match(/^(\d{10,}[a-zA-Z0-9]*)\./);
  if (m) return { transId: m[1], raw: d };
  m = d.match(/UHHT\.\.?(\d+)/i);
  if (m) return { transId: `UHHT.${m[1]}`, raw: d };
  m = d.match(/^(\d{4,8})\./);
  if (m) return { transId: m[1], raw: d };
  const firstToken = d.split(/[. \n#]/)[0];
  if (firstToken && firstToken.length >= 4) return { transId: firstToken, raw: d };
  return { transId: '', raw: d };
}

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

function formatDate(d) {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function normalizeMoney(val) {
  if (!val) return 0;
  if (typeof val === 'number') return Math.abs(Math.round(val));
  const s = String(val).trim();
  const digits = s.replace(/[^0-9]/g, '');
  return parseInt(digits, 10) || 0;
}

function removeAccents(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

function extractPayerInfo(detail) {
  const norm = removeAccents(detail);
  let classCode = '';
  let payerName = '';
  let subject = '';

  const classMatch = detail.match(/\b([A-Z]{2}\d{4}|KC\d{3}|[0-9]{2}[A-Z]{2}\d{2})\b/);
  if (classMatch) classCode = classMatch[1];

  if (norm.includes('tieng anh') || norm.includes('english')) subject = 'English';
  else if (norm.includes('excel')) subject = 'Excel';
  else if (norm.includes('word')) subject = 'Word';
  else if (norm.includes('powerpoint') || norm.includes('ppt')) subject = 'PowerPoint';
  else if (norm.includes('tin hoc')) subject = 'Tin học VP';
  else if (norm.includes('ai') || norm.includes('vibe coding')) subject = 'AI Vibe Coding';

  let nameMatch = detail.match(/CT tu \d+\s+([A-Z\s]{4,30})\s+toi/i);
  if (nameMatch) {
    payerName = nameMatch[1].trim();
  } else {
    nameMatch = detail.match(/([A-Z\s]{4,30})\s+(?:chuyen tien|dong hoc|nop hoc phi|hoc phi|thanh toan|chuyen khoan)/i);
    if (nameMatch) {
      payerName = nameMatch[1].trim();
    }
  }

  if (payerName) {
    payerName = payerName.replace(/MBVCB|HUYNH KIEN CAM|NGAN HANG|IBFT|FT\d+|QR\s*-\s*/gi, '').trim();
  }

  return { classCode, subject, payerName };
}

// 1. Read existing master rows
const masterFile = path.join(targetFolder, 'Bang_Master_Tai_Chinh_De_Vuong.xlsx');
const wb = XLSX.readFile(masterFile);
const dataWs = wb.Sheets['Master_Data_Chi_Tiet'];
const masterRows = XLSX.utils.sheet_to_json(dataWs, { header: 1, defval: '' });

console.log(`Current master rows: ${masterRows.length - 1}`);

// Collect all existing Trans IDs or details to avoid duplication
const existingKeys = new Set();
for (let r = 1; r < masterRows.length; r++) {
  const row = masterRows[r];
  const transId = String(row[1]).trim();
  const detail = String(row[18]).trim();
  const dateStr = String(row[3]).trim();
  const amt = String(row[10] || row[9]).trim();
  if (transId && !transId.startsWith('CT_') && transId !== 'CẤN_TRỪ_QUỸ_DƯ') {
    existingKeys.add(transId);
  }
  if (detail) {
    existingKeys.add(`${dateStr}_${amt}_${detail.slice(0, 30)}`);
  }
}

// 2. Scan new statement files: 2026.07, 2026.08, 2026.09, 2026.10
const monthsToIngest = ['2026.07', '2026.08', '2026.09', '2026.10'];
let newAddedCount = 0;
let nextStt = masterRows.length;

const personalKeywords = [
  'me chuyen', 'banh uot', 'tien ship', 'muon', 'tra tien', 'an sang', 'com', 'cafe', 
  'lai tien gui', 'hoan tien', 'tiet kiem', 'viettel', 'nap tien', 'zalopay', 'cat meo', 'oc nhu', 'xang'
];

for (const m of monthsToIngest) {
  const fName = `lich-su-giao-dich-tai-khoan ${m}.xlsx`;
  const fPath = path.join(targetFolder, fName);
  if (!fs.existsSync(fPath)) continue;

  console.log(`Ingesting statements from ${fName}...`);
  const swb = XLSX.readFile(fPath);
  const sRows = XLSX.utils.sheet_to_json(swb.Sheets[swb.SheetNames[0]], { header: 1, defval: '' });

  let headerIdx = -1;
  for (let i = 0; i < Math.min(sRows.length, 25); i++) {
    const rowStr = (sRows[i] || []).join(' ').toLowerCase();
    if (rowStr.includes('ngày') || rowStr.includes('date') || rowStr.includes('số ct') || rowStr.includes('credit') || rowStr.includes('ghi có')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) continue;

  for (let r = headerIdx + 1; r < sRows.length; r++) {
    const row = sRows[r];
    if (!row || row.length === 0) continue;

    let dateVal = row[2];
    let debitVal = row[3];
    let creditVal = row[4];
    let detailVal = row[6] || row[5] || '';

    const credit = normalizeMoney(creditVal);
    const debit = normalizeMoney(debitVal);

    let docNo = '';
    let dateObj = null;
    if (typeof dateVal === 'string') {
      const lines = dateVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      dateObj = parseExcelDate(lines[0]);
      if (lines.length > 1) docNo = lines[1];
    } else if (typeof dateVal === 'number') {
      dateObj = parseExcelDate(dateVal);
    }

    if (!dateObj) continue;

    const dateStr = formatDate(dateObj);
    const { transId, raw } = parseTransactionDetail(detailVal);
    const norm = removeAccents(raw);

    // Filter personal noise
    if (personalKeywords.some(k => norm.includes(k))) continue;

    // Check if revenue or salary
    const isTuition = (credit >= 300000 && !norm.includes('lai tien gui') && !norm.includes('interest payment'));
    const isSalary = (debit >= 500000 && (norm.includes('luong') || norm.includes('giao vien') || norm.includes('tro giang')));

    if (isTuition || isSalary) {
      const checkKey1 = transId;
      const checkKey2 = `${dateStr}_${credit || debit}_${raw.slice(0, 30)}`;

      if (existingKeys.has(checkKey1) || existingKeys.has(checkKey2)) {
        continue; // Already exists
      }

      existingKeys.add(checkKey1);
      existingKeys.add(checkKey2);

      const { classCode, subject, payerName } = extractPayerInfo(raw);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;

      newAddedCount++;
      masterRows.push([
        nextStt++,
        transId || 'VCB_' + (nextStt - 1),
        docNo || '',
        dateStr,
        dateStr,
        year,
        month,
        classCode || '',
        'Start',
        debit,
        credit,
        0, // Phi du
        payerName || '',
        '',
        subject || '',
        'Online',
        '',
        isTuition ? 'KHỚP TỰ ĐỘNG TỪ SAO KÊ MỚI' : 'CHI LƯƠNG TỪ SAO KÊ',
        raw,
        fName
      ]);
    }
  }
}

console.log(`Added ${newAddedCount} new transactions from statements up to 10/2026.`);
console.log(`Total master records now: ${masterRows.length - 1}`);

// 3. Rebuild Pivot Sheet dynamically
const summaryMap = {};
for (let r = 1; r < masterRows.length; r++) {
  const row = masterRows[r];
  const year = parseInt(row[5], 10) || 2024;
  const month = parseInt(row[6], 10) || 1;
  const no = typeof row[9] === 'number' ? row[9] : (parseFloat(String(row[9]).replace(/[^0-9.-]/g, '')) || 0);
  const co = typeof row[10] === 'number' ? row[10] : (parseFloat(String(row[10]).replace(/[^0-9.-]/g, '')) || 0);
  const phiDu = typeof row[11] === 'number' ? row[11] : (parseFloat(String(row[11]).replace(/[^0-9.-]/g, '')) || 0);

  if (!summaryMap[year]) {
    summaryMap[year] = { phiDu: 0, no: 0, co: 0, months: {} };
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

const pivotRows = [
  [
    'Năm',
    'Tháng',
    'SUM của Phí dư',
    'SUM của Ghi nợ',
    'SUM của Ghi có',
    'Lợi nhuận',
    'Chi phí/Doanh thu',
    'Chi phí/ Lợi nhuận',
    'TEST LỢI NHUẬN NÀY'
  ]
];

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

// 4. Write back to single master workbook
const newMasterWb = XLSX.utils.book_new();

const newPivotWs = XLSX.utils.aoa_to_sheet(pivotRows);
newPivotWs['!cols'] = [
  { wch: 18 }, { wch: 10 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }
];

for (let r = 1; r < pivotRows.length; r++) {
  [2, 3, 4, 5, 8].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (newPivotWs[cellAddr]) newPivotWs[cellAddr].z = '#,##0" đ"';
  });
  [6, 7].forEach(c => {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    if (newPivotWs[cellAddr]) newPivotWs[cellAddr].z = '0.00%';
  });
}

const newMasterWs = XLSX.utils.aoa_to_sheet(masterRows);
newMasterWs['!cols'] = [
  { wch: 6 }, { wch: 36 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
  { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 24 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 34 },
  { wch: 60 }, { wch: 35 }
];

XLSX.utils.book_append_sheet(newMasterWb, newPivotWs, 'Pivot_Tai_Chinh');
XLSX.utils.book_append_sheet(newMasterWb, newMasterWs, 'Master_Data_Chi_Tiet');

XLSX.writeFile(newMasterWb, masterFile);
console.log('Successfully updated single master file in OneDrive folder:\n', masterFile);

const dlFile = path.resolve('C:/Users/zit/Downloads/Bang_Master_Tai_Chinh_De_Vuong.xlsx');
XLSX.writeFile(newMasterWb, dlFile);
console.log('Successfully synced copy to Downloads:\n', dlFile);
