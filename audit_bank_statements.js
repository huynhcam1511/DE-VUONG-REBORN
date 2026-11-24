const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const statementsDir = path.resolve('temp_statements');
const files = fs.readdirSync(statementsDir).filter(f => f.endsWith('.xlsx'));

let totalTrans = 0;
let totalCredit = 0;
let creditTrans = 0;
let totalDebit = 0;
let debitTrans = 0;

const tuitionKeywords = ['hoc phi', 'dong hoc', 'khoa hoc', 'lop', 'tuition', 'tieng anh', 'english', 'excel', 'word', 'powerpoint', 'lq', 'lg', 'zg', 'rg', 'sg', 'zb', 'sh', 'kc', 'hp'];
const livingKeywords = ['com', 'bun', 'pho', 'an', 'uong', 'cafe', 'coffee', 'nuoc', 'tra sua', 'xang', 'grab', 'shopee', 'momo', 'lazada', 'bhyt', 'xe', 'sieu thi', 'king food', 'winmart', 'circle k'];

let identifiedTuitionCount = 0;
let identifiedTuitionAmount = 0;

let identifiedLivingCount = 0;
let identifiedLivingAmount = 0;

let salaryCount = 0;
let salaryAmount = 0;

function removeAccents(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase();
}

for (const f of files) {
  try {
    const wb = XLSX.readFile(path.join(statementsDir, f));
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    for (let r = 13; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 5) continue;
      const debitStr = String(row[3] || '').replace(/[^0-9]/g, '');
      const creditStr = String(row[4] || '').replace(/[^0-9]/g, '');
      const detail = String(row[6] || row[5] || '');
      const detailNorm = removeAccents(detail);

      const debit = parseInt(debitStr, 10) || 0;
      const credit = parseInt(creditStr, 10) || 0;

      if (credit > 0) {
        creditTrans++;
        totalCredit += credit;
        const isTuition = tuitionKeywords.some(k => detailNorm.includes(k)) || credit >= 1000000;
        if (isTuition) {
          identifiedTuitionCount++;
          identifiedTuitionAmount += credit;
        }
      }

      if (debit > 0) {
        debitTrans++;
        totalDebit += debit;
        const isLiving = livingKeywords.some(k => detailNorm.includes(k));
        const isSalary = detailNorm.includes('luong') || detailNorm.includes('giao vien') || detailNorm.includes('tro giang') || detailNorm.includes('phi nhan lop');
        if (isLiving) {
          identifiedLivingCount++;
          identifiedLivingAmount += debit;
        }
        if (isSalary) {
          salaryCount++;
          salaryAmount += debit;
        }
      }
      totalTrans++;
    }
  } catch (e) {}
}

console.log({
  totalTrans,
  creditTrans,
  totalCredit,
  debitTrans,
  totalDebit,
  identifiedTuitionCount,
  identifiedTuitionAmount,
  identifiedLivingCount,
  identifiedLivingAmount,
  salaryCount,
  salaryAmount
});
