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

// Preserve negative sign!
function normalizeMoneyWithSign(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return Math.round(val);
  const s = String(val).trim();
  if (!s) return 0;
  const isNegative = s.includes('-') || (s.startsWith('(') && s.endsWith(')'));
  const digits = s.replace(/[^0-9]/g, '');
  const num = parseInt(digits, 10) || 0;
  return isNegative ? -num : num;
}

function normalizeMoney(val) {
  if (val === null || val === undefined || val === '') return 0;
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

async function run() {
  const statementsDir = path.resolve('temp_statements');
  const files = fs.readdirSync(statementsDir).filter(f => f.endsWith('.xlsx'));

  // Load all bank statement transactions
  const allBankRecords = [];
  for (const f of files) {
    const filePath = path.join(statementsDir, f);
    try {
      const wb = XLSX.readFile(filePath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 25); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('ngày') || rowStr.includes('date') || rowStr.includes('số ct') || rowStr.includes('debit') || rowStr.includes('ghi nợ')) {
          headerIdx = i;
          break;
        }
      }
      if (headerIdx === -1) continue;

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        let dateVal = row[2];
        let debitVal = row[3];
        let creditVal = row[4];
        let detailVal = row[6] || row[5] || '';

        let docNo = '';
        let dateObj = null;
        if (typeof dateVal === 'string') {
          const lines = dateVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          dateObj = parseExcelDate(lines[0]);
          if (lines.length > 1) docNo = lines[1];
        } else if (typeof dateVal === 'number') {
          dateObj = parseExcelDate(dateVal);
        }

        const debit = normalizeMoney(debitVal);
        const credit = normalizeMoney(creditVal);
        const { transId, raw } = parseTransactionDetail(detailVal);

        if (dateObj && (debit > 0 || credit > 0 || transId)) {
          allBankRecords.push({
            file: f,
            dateObj,
            dateStr: formatDate(dateObj),
            docNo,
            debit,
            credit,
            transId,
            detail: raw,
            used: false
          });
        }
      }
    } catch (e) {}
  }

  // Load manual entry file: cách tôi nhập.xlsx
  const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
  const mwb = XLSX.readFile(manualPath);
  const mSheet = mwb.Sheets[mwb.SheetNames[0]];
  const mRows = XLSX.utils.sheet_to_json(mSheet, { header: 1, defval: '' });

  const outputRows = [];
  const header = [
    'STT',
    'MÃ GIAO DỊCH NGÂN HÀNG (TRANS ID)',
    'SỐ CHỨNG TỪ (DOC NO)',
    'NGÀY GIAO DỊCH (THỰC TẾ)',
    'NGÀY SỔ CŨ',
    'NĂM',
    'THÁNG',
    'MÃ LỚP',
    'TRẠNG THÁI',
    'GHI NỢ (CHI/LƯƠNG)',
    'GHI CÓ (THU HỌC PHÍ)',
    'PHÍ DƯ (+ TĂNG QUỸ / - RÚT CẤN TRỪ)',
    'TÊN HỌC VIÊN',
    'SỐ ĐIỆN THOẠI',
    'MÔN HỌC',
    'HÌNH THỨC',
    'ĐỊA CHỈ',
    'TRẠNG THÁI ĐỐI SOÁT',
    'NỘI DUNG CHI TIẾT SAO KÊ',
    'FILE NGUỒN SAO KÊ'
  ];
  outputRows.push(header);

  for (let r = 1; r < mRows.length; r++) {
    const row = mRows[r];
    if (!row || row.length === 0) continue;

    const nam = row[0];
    const thang = row[1];
    const rawDate = row[2];
    const dateObj = parseExcelDate(rawDate);
    const dateStr = formatDate(dateObj) || (nam && thang ? `01/${String(thang).padStart(2, '0')}/${nam}` : '');
    const maLop = String(row[3] || '').trim();
    const trangThai = String(row[4] || '').trim();
    const ghiNo = normalizeMoney(row[5]);
    const ghiCo = normalizeMoney(row[6]);
    // PRESERVE POSITIVE / NEGATIVE FOR PHI DU
    const phiDu = normalizeMoneyWithSign(row[7]);
    const tenHV = String(row[9] || '').trim();
    const sdt = String(row[10] || '').trim();
    const dienGiai = String(row[12] || '').trim();
    const monHoc = String(row[13] || '').trim();
    const hinhThuc = String(row[14] || '').trim();
    const diaChi = String(row[15] || '').trim();

    if (!tenHV && !maLop && ghiNo === 0 && ghiCo === 0 && phiDu === 0) continue;

    // Check internal offset
    const isInternal = (
      phiDu !== 0 ||
      trangThai.toLowerCase().includes('dư') ||
      dienGiai.toLowerCase().includes('dư') ||
      dienGiai.toLowerCase().includes('cấn trừ') ||
      tenHV.toLowerCase().includes('cấn trừ') ||
      (ghiNo > 0 && ghiCo > 0 && ghiNo === ghiCo)
    );

    if (isInternal && ghiNo === 0 && ghiCo === 0) {
      outputRows.push([
        r,
        'CẤN_TRỪ_QUỸ_DƯ',
        'NỘI_BỘ_QUỸ',
        dateStr,
        dateStr,
        nam,
        thang,
        maLop,
        trangThai,
        ghiNo,
        ghiCo,
        phiDu, // Keeps + or -
        tenHV,
        sdt,
        monHoc,
        hinhThuc,
        diaChi,
        phiDu > 0 ? 'BÚT TOÁN TĂNG QUỸ PHÍ DƯ (+)' : 'BÚT TOÁN RÚT CẤN TRỪ QUỸ (-)',
        'Cấn trừ số dư học phí giữa các khóa học',
        'SỔ_QUỸ_NỘI_BỘ'
      ]);
      continue;
    }

    const isCredit = ghiCo > 0;
    const targetAmt = isCredit ? ghiCo : ghiNo;

    let matchedBank = null;
    let matchStatus = '';

    if (targetAmt > 0 && dateObj) {
      // 1. Search candidate bank records within +/- 5 days
      const candidates = allBankRecords.filter(b => {
        const bAmt = isCredit ? b.credit : b.debit;
        if (bAmt !== targetAmt) return false;
        if (!b.dateObj) return false;
        const diffDays = Math.abs((b.dateObj - dateObj) / (1000 * 60 * 60 * 24));
        return diffDays <= 5;
      });

      if (candidates.length === 1) {
        matchedBank = candidates[0];
        matchedBank.used = true;
        matchStatus = 'KHỚP CHÍNH XÁC (SỐ TIỀN & NGÀY)';
      } else if (candidates.length > 1) {
        const nameKeywords = removeAccents(tenHV)
          .split(/[\s,()]+/)
          .filter(w => w.length >= 2 && !['chi', 'anh', 'em', 'co', 'thay'].includes(w));

        let bestScore = -100;
        let bestCand = null;

        for (const cand of candidates) {
          let score = 0;
          if (cand.used) score -= 5;
          const detNorm = removeAccents(cand.detail);

          for (const kw of nameKeywords) {
            if (detNorm.includes(kw)) score += 15;
          }
          if (maLop && detNorm.includes(maLop.toLowerCase())) score += 12;
          if (sdt && sdt.length >= 7 && detNorm.includes(sdt)) score += 15;

          const diffDays = Math.abs((cand.dateObj - dateObj) / (1000 * 60 * 60 * 24));
          score -= diffDays * 1.0;

          if (score > bestScore) {
            bestScore = score;
            bestCand = cand;
          }
        }

        matchedBank = bestCand || candidates[0];
        matchedBank.used = true;
        matchStatus = `KHỚP THÔNG MINH (${candidates.length} GIAO DỊCH CÙNG SỐ TIỀN)`;
      } else {
        const widerCandidates = allBankRecords.filter(b => {
          const bAmt = isCredit ? b.credit : b.debit;
          if (bAmt !== targetAmt) return false;
          if (!b.dateObj) return false;
          const diffDays = Math.abs((b.dateObj - dateObj) / (1000 * 60 * 60 * 24));
          return diffDays <= 20;
        });

        if (widerCandidates.length > 0) {
          const nameKeywords = removeAccents(tenHV)
            .split(/[\s,()]+/)
            .filter(w => w.length >= 2 && !['chi', 'anh', 'em'].includes(w));

          let foundKeywordMatch = null;
          for (const cand of widerCandidates) {
            const detNorm = removeAccents(cand.detail);
            const hasName = nameKeywords.some(kw => detNorm.includes(kw));
            if (hasName || (maLop && detNorm.includes(maLop.toLowerCase()))) {
              foundKeywordMatch = cand;
              break;
            }
          }
          if (foundKeywordMatch) {
            matchedBank = foundKeywordMatch;
            matchedBank.used = true;
            matchStatus = 'KHỚP THEO TÊN / MÃ LỚP (LỆCH NGÀY)';
          }
        }
      }
    }

    if (matchedBank) {
      outputRows.push([
        r,
        matchedBank.transId || matchedBank.docNo || 'CHƯA_RÕ_MÃ',
        matchedBank.docNo || 'THEO_SAO_KÊ',
        formatDate(matchedBank.dateObj),
        dateStr,
        nam,
        thang,
        maLop,
        trangThai,
        ghiNo,
        ghiCo,
        phiDu, // Keeps + or -
        tenHV,
        sdt,
        monHoc,
        hinhThuc,
        diaChi,
        matchStatus,
        matchedBank.detail,
        matchedBank.file
      ]);
    } else {
      if (isInternal) {
        outputRows.push([
          r,
          'CẤN_TRỪ_QUỸ_DƯ',
          'NỘI_BỘ_QUỸ',
          dateStr,
          dateStr,
          nam,
          thang,
          maLop,
          trangThai,
          ghiNo,
          ghiCo,
          phiDu, // Keeps + or -
          tenHV,
          sdt,
          monHoc,
          hinhThuc,
          diaChi,
          phiDu < 0 ? 'BÚT TOÁN CẤN TRỪ QUỸ (-)' : 'BÚT TOÁN ĐIỀU CHỈNH / NỘI BỘ (+)',
          'Cấn trừ hoặc hoàn phí nội bộ',
          'SỔ_QUỸ_NỘI_BỘ'
        ]);
      } else {
        outputRows.push([
          r,
          maLop ? `CT_${maLop}_${r}` : `CT_${r}`,
          '',
          dateStr,
          dateStr,
          nam,
          thang,
          maLop,
          trangThai,
          ghiNo,
          ghiCo,
          phiDu, // Keeps + or -
          tenHV,
          sdt,
          monHoc,
          hinhThuc,
          diaChi,
          'CHƯA KHỚP SAO KÊ (CẦN KIỂM TRA LẠI SỐ TIỀN / NGÀY)',
          dienGiai,
          ''
        ]);
      }
    }
  }

  const outWb = XLSX.utils.book_new();
  const outWs = XLSX.utils.aoa_to_sheet(outputRows);

  outWs['!cols'] = [
    { wch: 6 },  // STT
    { wch: 36 }, // Trans ID
    { wch: 18 }, // Doc No
    { wch: 14 }, // Ngay GD Thuc Te
    { wch: 14 }, // Ngay So Cu
    { wch: 8 },  // Nam
    { wch: 8 },  // Thang
    { wch: 12 }, // Ma Lop
    { wch: 12 }, // Trang Thai
    { wch: 14 }, // Ghi No
    { wch: 14 }, // Ghi Co
    { wch: 18 }, // Phi Du (Co ca + va -)
    { wch: 24 }, // Ten HV
    { wch: 14 }, // SDT
    { wch: 12 }, // Mon Hoc
    { wch: 12 }, // Hinh Thuc
    { wch: 25 }, // Dia Chi
    { wch: 34 }, // Trang Thai Doi Soat
    { wch: 60 }, // Chi Tiet Sao Ke
    { wch: 35 }  // File Nguon
  ];

  XLSX.utils.book_append_sheet(outWb, outWs, 'Hach_Toan_Da_Mapping_Chuan');

  const finalPath = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping_Chuan_Dau_Am_Duong.xlsx');
  XLSX.writeFile(outWb, finalPath);
  console.log(`Updated successfully with signed Phi Du (+ / -) to:\n${finalPath}`);
}

run().catch(console.error);
