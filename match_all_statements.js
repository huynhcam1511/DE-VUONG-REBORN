const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

function parseTransactionDetail(detail) {
  if (!detail) return { transId: '', docNo: '' };
  const d = String(detail).trim();
  
  // 1. Check MBVCB pattern: MBVCB.7184264602...
  let m = d.match(/MBVCB\.(\d+)/i);
  if (m) return { transId: `MBVCB.${m[1]}`, raw: d };

  // 2. Check Ecom EW pattern: Ecom.EW24100106406841...
  m = d.match(/Ecom\.(EW\w+)/i) || d.match(/(EW\d{10,})/i);
  if (m) return { transId: m[1], raw: d };

  // 3. Check long numeric/alphanumeric prefix (Napas / Interbank / Trace): 020097040510292250402024NQGW010339
  m = d.match(/^(\d{10,}[a-zA-Z0-9]*)\./);
  if (m) return { transId: m[1], raw: d };

  // 4. Check UHHT pattern: UHHT..677869..20240929
  m = d.match(/UHHT\.\.?(\d+)/i);
  if (m) return { transId: `UHHT.${m[1]}`, raw: d };

  // 5. Check 6-8 digit code at start: 5379. hoặc 020097.
  m = d.match(/^(\d{4,8})\./);
  if (m) return { transId: m[1], raw: d };

  // Fallback: take first token before dot or space
  const firstToken = d.split(/[. \n]/)[0];
  if (firstToken && firstToken.length >= 4) {
    return { transId: firstToken, raw: d };
  }

  return { transId: '', raw: d };
}

function normalizeDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const s = String(val).trim();
  const m = s.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m) {
    return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
  }
  return s;
}

function parseDateObj(dStr) {
  if (!dStr) return null;
  const parts = dStr.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return null;
}

async function run() {
  const statementsDir = path.resolve('temp_statements');
  const files = fs.readdirSync(statementsDir).filter(f => f.endsWith('.xlsx'));
  console.log(`Found ${files.length} statement files in ${statementsDir}`);

  // Load all bank statements into memory
  const allBankRecords = [];
  for (const f of files) {
    const filePath = path.join(statementsDir, f);
    try {
      const wb = XLSX.readFile(filePath);
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      // Find header row
      let headerIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 25); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('ngày') || rowStr.includes('date') || rowStr.includes('số ct') || rowStr.includes('debit') || rowStr.includes('ghi nợ')) {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        console.warn(`Could not find header in ${f}`);
        continue;
      }

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        // Typical Vietcombank layout:
        // Col 0: STT
        // Col 1: Date & Doc No (e.g. "01/10/2024\n5254 - 36505" or separate)
        // Col 2: Debit
        // Col 3: Credit
        // Col 4: Balance
        // Col 5: Transaction in detail
        let dateVal = row[1];
        let debitVal = row[2];
        let creditVal = row[3];
        let detailVal = row[5] || row[4] || '';

        // If dateVal contains docNo
        let docNo = '';
        let dateStr = '';
        if (typeof dateVal === 'string') {
          const lines = dateVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          dateStr = normalizeDate(lines[0]);
          if (lines.length > 1) docNo = lines[1];
        } else {
          dateStr = normalizeDate(dateVal);
        }

        const debit = parseFloat(String(debitVal).replace(/[^0-9.-]+/g, '')) || 0;
        const credit = parseFloat(String(creditVal).replace(/[^0-9.-]+/g, '')) || 0;
        const { transId, raw } = parseTransactionDetail(detailVal);

        if (dateStr && (debit > 0 || credit > 0 || transId)) {
          allBankRecords.push({
            file: f,
            dateStr,
            dateObj: parseDateObj(dateStr),
            docNo,
            debit,
            credit,
            transId,
            detail: raw
          });
        }
      }
    } catch (e) {
      console.error(`Error parsing ${f}:`, e.message);
    }
  }

  console.log(`Successfully loaded ${allBankRecords.length} bank transactions across all months.`);

  // Load manual entry file: cách tôi nhập.xlsx
  const manualPath = path.resolve('C:/Users/zit/Downloads/cách tôi nhập.xlsx');
  console.log('Loading manual entry file:', manualPath);
  const mwb = XLSX.readFile(manualPath);
  const mSheetName = mwb.SheetNames[0];
  const mRows = XLSX.utils.sheet_to_json(mwb.Sheets[mSheetName], { header: 1, defval: '' });

  let mHeaderIdx = -1;
  for (let i = 0; i < Math.min(mRows.length, 20); i++) {
    const s = (mRows[i] || []).join(' ').toLowerCase();
    if (s.includes('mã ct') || s.includes('ngày') || s.includes('ghi nợ') || s.includes('học viên') || s.includes('tên học viên')) {
      mHeaderIdx = i;
      break;
    }
  }

  console.log(`Manual header found at row ${mHeaderIdx}`);
  const headerRow = mRows[mHeaderIdx];
  console.log('Original Headers:', headerRow);

  // Identify column indices
  let colMaCT = -1, colNgay = -1, colLop = -1, colGhiNo = -1, colGhiCo = -1, colPhiDu = -1, colHV = -1, colSDT = -1, colGhiChu = -1;
  headerRow.forEach((h, idx) => {
    const s = String(h).trim().toLowerCase();
    if (s.includes('mã ct') || s === 'mã') colMaCT = idx;
    else if (s.includes('ngày')) colNgay = idx;
    else if (s.includes('lớp') || s.includes('mã lớp')) colLop = idx;
    else if (s.includes('ghi nợ') || s.includes('nợ')) colGhiNo = idx;
    else if (s.includes('ghi có') || s.includes('có')) colGhiCo = idx;
    else if (s.includes('phí dư') || s.includes('dư')) colPhiDu = idx;
    else if (s.includes('tên') || s.includes('học viên')) colHV = idx;
    else if (s.includes('thoại') || s.includes('sđt') || s.includes('sdt')) colSDT = idx;
    else if (s.includes('chú') || s.includes('ghi chú')) colGhiChu = idx;
  });

  console.log({ colMaCT, colNgay, colLop, colGhiNo, colGhiCo, colPhiDu, colHV, colSDT, colGhiChu });

  // Matching logic
  let matchedCount = 0;
  let offsetCount = 0;
  let unmatchedCount = 0;

  const resultRows = [];
  // Build new Header:
  // [MÃ CT GỐC, MÃ GIAO DỊCH NGÂN HÀNG (TRANS ID), SỐ CHỨNG TỪ (DOC NO), NGÀY, MÃ LỚP, GHI NỢ, GHI CÓ, PHÍ DƯ, TÊN HỌC VIÊN, SỐ ĐIỆN THOẠI, GHI CHÚ, CHI TIẾT SAO KÊ GỐC, FILE SAO KÊ NGUỒN]
  const newHeader = [
    'MÃ CT GỐC',
    'MÃ GD NGÂN HÀNG (TRANS ID)',
    'SỐ CHỨNG TỪ (DOC NO)',
    'NGÀY',
    'MÃ LỚP',
    'GHI NỢ',
    'GHI CÓ',
    'PHÍ DƯ',
    'TÊN HỌC VIÊN',
    'SỐ ĐIỆN THOẠI',
    'GHI CHÚ / TRẠNG THÁI KHỚP',
    'CHI TIẾT SAO KÊ GỐC',
    'FILE NGUỒN SAO KÊ'
  ];
  resultRows.push(newHeader);

  for (let r = mHeaderIdx + 1; r < mRows.length; r++) {
    const row = mRows[r];
    if (!row || row.length === 0) continue;

    const maCT = String(row[colMaCT] || '').trim();
    const rawDate = row[colNgay];
    const dateStr = normalizeDate(rawDate);
    const dateObj = parseDateObj(dateStr);
    const lop = String(row[colLop] || '').trim();
    const debit = parseFloat(String(row[colGhiNo] || '').replace(/[^0-9.-]+/g, '')) || 0;
    const credit = parseFloat(String(row[colGhiCo] || '').replace(/[^0-9.-]+/g, '')) || 0;
    const phiDu = parseFloat(String(row[colPhiDu] || '').replace(/[^0-9.-]+/g, '')) || 0;
    const tenHV = String(row[colHV] || '').trim();
    const sdt = String(row[colSDT] || '').trim();
    const ghiChu = String(row[colGhiChu] || '').trim();

    // Skip totally empty rows
    if (!maCT && !dateStr && !tenHV && debit === 0 && credit === 0) continue;

    // Check if internal offset / quỹ phí dư
    const isInternalOffset = (
      debit < 0 || credit < 0 || phiDu !== 0 ||
      ghiChu.toLowerCase().includes('cấn trừ') ||
      ghiChu.toLowerCase().includes('phí dư') ||
      ghiChu.toLowerCase().includes('bảo lưu') ||
      tenHV.toLowerCase().includes('cấn trừ') ||
      tenHV.toLowerCase().includes('phí dư')
    );

    let foundBank = null;
    let matchType = '';

    if (isInternalOffset && credit === 0 && debit === 0) {
      offsetCount++;
      matchType = 'BÚT TOÁN NỘI BỘ (CẤN TRỪ / PHÍ DƯ)';
      resultRows.push([
        maCT,
        'CẤN_TRỪ_QUỸ_DƯ',
        'NỘI_BỘ_QUỸ',
        dateStr,
        lop,
        debit,
        credit,
        phiDu,
        tenHV,
        sdt,
        ghiChu ? `${ghiChu} (${matchType})` : matchType,
        'Cấn trừ số dư nội bộ giữa các kỳ học viên',
        'SỔ_CẤN_TRỪ_QUỸ'
      ]);
      continue;
    }

    // Match with bank records
    // Amount to match: credit (thu học phí) or debit (hoàn phí / chi phí)
    const targetAmount = credit > 0 ? credit : debit;
    const isCredit = credit > 0;

    if (targetAmount > 0 && dateObj) {
      // Find candidate bank records with same amount
      const candidates = allBankRecords.filter(b => {
        const bAmt = isCredit ? b.credit : b.debit;
        if (Math.abs(bAmt - targetAmount) > 1) return false;
        if (!b.dateObj) return false;
        // Date within +/- 4 days
        const diffDays = Math.abs((b.dateObj - dateObj) / (1000 * 60 * 60 * 24));
        return diffDays <= 4;
      });

      if (candidates.length === 1) {
        foundBank = candidates[0];
        matchType = 'KHỚP CHÍNH XÁC (SỐ TIỀN & NGÀY)';
      } else if (candidates.length > 1) {
        // Disambiguate by name / phone / class keyword in detail
        const nameKeywords = tenHV.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        let bestScore = -1;
        let bestCand = null;

        candidates.forEach(cand => {
          let score = 0;
          const detailLow = cand.detail.toLowerCase();
          nameKeywords.forEach(k => {
            if (detailLow.includes(k)) score += 2;
          });
          if (lop && detailLow.includes(lop.toLowerCase())) score += 3;
          if (sdt && detailLow.includes(sdt)) score += 4;
          // Proximity score
          const diffDays = Math.abs((cand.dateObj - dateObj) / (1000 * 60 * 60 * 24));
          score -= diffDays * 0.5;

          if (score > bestScore) {
            bestScore = score;
            bestCand = cand;
          }
        });

        foundBank = bestCand || candidates[0];
        matchType = `KHỚP ĐA ĐIỀU KIỆN (${candidates.length} GD CÙNG TIỀN)`;
      }
    }

    if (foundBank) {
      matchedCount++;
      resultRows.push([
        maCT,
        foundBank.transId || foundBank.docNo || 'CHƯA_RÕ_MÃ',
        foundBank.docNo || 'THEO_SAO_KÊ',
        dateStr,
        lop,
        debit,
        credit,
        phiDu,
        tenHV,
        sdt,
        ghiChu ? `${ghiChu} [${matchType}]` : matchType,
        foundBank.detail,
        foundBank.file
      ]);
    } else {
      if (isInternalOffset) {
        offsetCount++;
        resultRows.push([
          maCT,
          'HOÀN_PHÍ_NỘI_BỘ',
          'NỘI_BỘ_QUỸ',
          dateStr,
          lop,
          debit,
          credit,
          phiDu,
          tenHV,
          sdt,
          ghiChu ? `${ghiChu} (Nội bộ)` : 'Nội bộ cấn trừ',
          'Bút toán điều chỉnh hoặc cấn trừ học phí',
          'SỔ_NỘI_BỘ'
        ]);
      } else {
        unmatchedCount++;
        resultRows.push([
          maCT,
          maCT ? `CT_${maCT}` : 'CHƯA_MAP_MÃ_NGÂN_HÀNG',
          '',
          dateStr,
          lop,
          debit,
          credit,
          phiDu,
          tenHV,
          sdt,
          ghiChu ? `${ghiChu} (Chưa khớp sao kê)` : 'Chưa khớp sao kê',
          '',
          ''
        ]);
      }
    }
  }

  console.log(`Matching Summary:
- Total manual records processed: ${resultRows.length - 1}
- Successfully matched to Bank Statement: ${matchedCount}
- Internal Offsets / Quỹ Phí Dư: ${offsetCount}
- Unmatched / Cần rà soát thêm: ${unmatchedCount}
  `);

  // Write out final consolidated workbook
  const outWb = XLSX.utils.book_new();
  const outWs = XLSX.utils.aoa_to_sheet(resultRows);

  // Set column widths
  outWs['!cols'] = [
    { wch: 15 }, // Ma CT Goc
    { wch: 35 }, // Trans ID
    { wch: 18 }, // Doc No
    { wch: 12 }, // Ngay
    { wch: 16 }, // Ma Lop
    { wch: 14 }, // Ghi No
    { wch: 14 }, // Ghi Co
    { wch: 14 }, // Phi Du
    { wch: 25 }, // Ten HV
    { wch: 14 }, // SDT
    { wch: 35 }, // Ghi Chu
    { wch: 45 }, // Chi tiet sao ke
    { wch: 35 }  // File nguon
  ];

  XLSX.utils.book_append_sheet(outWb, outWs, 'Hach_Toan_Da_Mapping_Toan_Bo');

  const outDest = path.resolve('C:/Users/zit/Downloads/Bang_Hach_Toan_Toan_Bo_Da_Mapping.xlsx');
  XLSX.writeFile(outWb, outDest);
  console.log(`Saved master consolidated file to: ${outDest}`);
}

run().catch(console.error);
