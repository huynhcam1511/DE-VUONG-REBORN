const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

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
  const firstToken = d.split(/[. \n]/)[0];
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
  if (typeof val === 'number') return Math.round(val);
  const s = String(val).replace(/[^0-9]/g, '');
  return parseInt(s, 10) || 0;
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

  // Class code match
  const classMatch = detail.match(/\b([A-Z]{2}\d{4}|KC\d{3}|[0-9]{2}[A-Z]{2}\d{2})\b/);
  if (classMatch) {
    classCode = classMatch[1];
  }

  // Subject match
  if (norm.includes('tieng anh') || norm.includes('english')) subject = 'English';
  else if (norm.includes('excel')) subject = 'Excel';
  else if (norm.includes('word')) subject = 'Word';
  else if (norm.includes('powerpoint') || norm.includes('ppt')) subject = 'PowerPoint';
  else if (norm.includes('tin hoc')) subject = 'Tin học VP';

  // Payer Name match
  let nameMatch = detail.match(/CT tu \d+\s+([A-Z\s]{4,30})\s+toi/i);
  if (nameMatch) {
    payerName = nameMatch[1].trim();
  } else {
    nameMatch = detail.match(/([A-Z\s]{4,30})\s+(?:chuyen tien|dong hoc|nop hoc phi|hoc phi|thanh toan)/i);
    if (nameMatch) {
      payerName = nameMatch[1].trim();
    }
  }

  if (payerName) {
    payerName = payerName.replace(/MBVCB|HUYNH KIEN CAM|NGAN HANG|IBFT|FT\d+/gi, '').trim();
  }

  return { classCode, subject, payerName };
}

async function runClean() {
  const statementsDir = path.resolve('temp_statements');
  const files = fs.readdirSync(statementsDir).filter(f => f.endsWith('.xlsx'));
  files.sort();

  const personalKeywords = [
    'me chuyen', 'banh uot', 'tien ship', 'muon', 'tra tien', 'an sang', 'com', 'cafe', 
    'lai tien gui', 'hoan tien', 'tiet kiem', 'viettel', 'nap tien', 'zalopay'
  ];

  const tuitionKeywords = ['hoc phi', 'dong hoc', 'khoa hoc', 'lop', 'tuition', 'tieng anh', 'english', 'excel', 'word', 'powerpoint', 'lq', 'lg', 'zg', 'rg', 'sg', 'zb', 'sh', 'kc', 'hp'];

  const extractedRows = [];
  const header = [
    'STT',
    'MÃ GIAO DỊCH (TRANS ID)',
    'SỐ CHỨNG TỪ (DOC NO)',
    'NGÀY GIAO DỊCH',
    'NĂM',
    'THÁNG',
    'SỐ TIỀN THU (GHI CÓ)',
    'TÊN HỌC VIÊN / NGƯỜI NỘP (GỢI Ý)',
    'MÃ LỚP (GỢI Ý)',
    'MÔN HỌC (GỢI Ý)',
    'MỨC ĐỘ TỰ ĐỘNG CỦA AI',
    'Ô GÕ BỔ SUNG / GHI CHÚ TAY',
    'NỘI DUNG CHI TIẾT SAO KÊ',
    'FILE NGUỒN SAO KÊ'
  ];
  extractedRows.push(header);

  let stt = 0;
  let totalRevenue = 0;

  for (const f of files) {
    try {
      const wb = XLSX.readFile(path.join(statementsDir, f));
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 25); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('ngày') || rowStr.includes('date') || rowStr.includes('số ct') || rowStr.includes('credit') || rowStr.includes('ghi có')) {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx === -1) continue;

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        let dateVal = row[2];
        let creditVal = row[4];
        let detailVal = row[6] || row[5] || '';

        const credit = normalizeMoney(creditVal);
        // Business logic: Tuition is >= 300,000 VND
        if (credit < 300000) continue;

        let docNo = '';
        let dateObj = null;
        if (typeof dateVal === 'string') {
          const lines = dateVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          dateObj = parseExcelDate(lines[0]);
          if (lines.length > 1) docNo = lines[1];
        } else if (typeof dateVal === 'number') {
          dateObj = parseExcelDate(dateVal);
        }

        if (!dateObj) continue; // Skip opening balance row

        const dateStr = formatDate(dateObj);
        const { transId, raw } = parseTransactionDetail(detailVal);
        const norm = removeAccents(raw);

        // Filter out obvious personal items
        if (personalKeywords.some(k => norm.includes(k))) continue;

        stt++;
        totalRevenue += credit;
        const { classCode, subject, payerName } = extractPayerInfo(raw);

        let aiStatus = 'AI ĐÃ ĐIỀN 80% (CẦN GÕ THÊM MÃ LỚP)';
        if (classCode && payerName) {
          aiStatus = 'AI ĐÃ ĐIỀN 95% (ĐẦY ĐỦ THÔNG TIN)';
        } else if (classCode && !payerName) {
          aiStatus = 'AI ĐÃ ĐIỀN 85% (CÓ MÃ LỚP, THIẾU TÊN)';
        }

        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;

        extractedRows.push([
          stt,
          transId || 'VCB_' + stt,
          docNo || '',
          dateStr,
          year,
          month,
          credit,
          payerName || '',
          classCode || '',
          subject || '',
          aiStatus,
          '', // Ô để bạn gõ tay
          raw,
          f
        ]);
      }
    } catch (e) {}
  }

  console.log(`Final clean autonomous ledger: ${stt} rows, total: ${(totalRevenue).toLocaleString()} VND`);

  const outWb = XLSX.utils.book_new();
  const outWs = XLSX.utils.aoa_to_sheet(extractedRows);

  outWs['!cols'] = [
    { wch: 6 },  // STT
    { wch: 34 }, // Trans ID
    { wch: 18 }, // Doc No
    { wch: 14 }, // Ngay
    { wch: 8 },  // Nam
    { wch: 8 },  // Thang
    { wch: 16 }, // So tien thu
    { wch: 25 }, // Ten HV
    { wch: 14 }, // Ma lop
    { wch: 14 }, // Mon hoc
    { wch: 38 }, // Muc do tu dong
    { wch: 30 }, // O go tay bo sung
    { wch: 60 }, // Chi tiet sao ke
    { wch: 35 }  // File nguon
  ];

  XLSX.utils.book_append_sheet(outWb, outWs, 'So_Quy_Tu_Dong_Sao_Ke');

  const dest = path.resolve('C:/Users/zit/Downloads/So_Thu_Hoc_Phi_Tu_Dong_Tu_Sao_Ke_80_Phan_Tram.xlsx');
  XLSX.writeFile(outWb, dest);
  console.log(`Saved to: ${dest}`);
}

runClean().catch(console.error);
