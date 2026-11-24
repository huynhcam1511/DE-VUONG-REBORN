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

module.exports = {
  parseTransactionDetail,
  parseExcelDate,
  formatDate,
  normalizeMoney,
  removeAccents
};
