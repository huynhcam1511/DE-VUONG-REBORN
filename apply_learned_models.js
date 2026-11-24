const fs = require('fs');
const path = require('path');
const XLSX = require(path.resolve('De_Vuong_Webapp/node_modules/xlsx'));

const targetFolder = 'C:\\Users\\zit\\OneDrive\\Tài liệu\\Sao kê ngân hàng';

// Learned Profiles dictionary from 3 years of manual entries!
const learnedProfiles = [
  { match: /LE THI THANH/i, hv: 'Chị Thanh', lop: 'RM6644', mon: 'Tin học VP' },
  { match: /HA THI THUY|ck ho thuy/i, hv: 'Chị Thuỷ', lop: 'ZG5917', mon: 'Excel' },
  { match: /NGUYEN THI THAO/i, hv: 'Chị Thảo', lop: 'RY2635', mon: 'Excel' },
  { match: /NGUYEN HOANG PHUOC/i, hv: 'Anh Phước', lop: 'KC003', mon: 'Excel Leader' },
  { match: /NGUYEN THANH MINH/i, hv: 'Anh Minh', lop: 'KC008', mon: 'Excel' },
  { match: /LE THI TUYET ANH|Le Tuyet Anh/i, hv: 'Chị Tuyết Anh', lop: 'KC005', mon: 'Excel' },
  { match: /NGUYEN THI BICH HANH|chi Hanh/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /LE NHU QUYNH|Le Nhu Quynh/i, hv: 'Chị Quỳnh', lop: 'GG1206', mon: 'Excel' },
  { match: /PHAM HUU TAI|anh tai/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /NGUYEN THI MINH THU|Thu Ky District K/i, hv: 'Minh Anh', lop: 'KC010', mon: 'Excel' },
  { match: /Bean District K|IBFT Bean/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /NGUYEN THI GIANG|C giang/i, hv: 'Chị Giang', lop: 'GF1322', mon: 'Tin học VP' },
  { match: /NGO HAI DANG/i, hv: 'Anh Đăng', lop: 'KC004', mon: 'Excel' },
  { match: /HO NGOC THUY DUONG/i, hv: 'Chị Pin', lop: 'KC007', mon: 'PinkDiamond Leader' },
  { match: /a yohan|A YOHAN/i, hv: 'Thư Kỳ_Yohan', lop: 'KC012', mon: 'Excel' },
  { match: /NGUYEN HONG PHUONG|Chi Phuong ck hoc phi|Danh Khang ck hoc phi/i, hv: 'Chị Phương AnPha', lop: 'KC016', mon: 'Excel Doanh Nghiệp' },
  { match: /DUONG THI MY TRINH/i, hv: 'Chị Trinh', lop: 'ZM6921', mon: 'Excel' },
  { match: /TRAN THE VINH|A Vinh/i, hv: 'Anh Vinh', lop: 'GJ0160', mon: 'Tin học' },
  { match: /PHAM THI MY TU/i, hv: 'Chị Tú', lop: 'SQ2216', mon: 'Excel' },
  { match: /NGUYEN MY LINH/i, hv: 'Chị Linh', lop: 'GH1714', mon: 'Excel' },
  { match: /MAI THI NGA|mai nga/i, hv: 'Chị Nga', lop: 'RH3826', mon: 'Tin học' },
  { match: /NGUYEN ANH TU/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /HUYNH NGUYEN NGOC TRAN/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Duc An/i, hv: 'Đức An', lop: 'EZ0310', mon: 'MOS' },
  { match: /TRAN VAN MINH|Tysocola/i, hv: 'Tysocola', lop: 'RX1572', mon: 'Excel' },
  { match: /TRAN DINH DUY|Jey chuyen/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Hoang Phuc/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Nguyen Minh Hy/i, hv: 'Minh Hy', lop: 'AI01', mon: 'AI Vibe Coding' },
  { match: /NGUYEN QUANG VINH/i, hv: 'Em Vinh', lop: 'TX2030', mon: 'Tin học' },
  { match: /MAI THI NGOC TIEN|VO MINH NHUT/i, hv: 'Chị Tiên', lop: 'NK1205', mon: 'Excel' },
  { match: /PHAM THI LUONG|LE DINH MY/i, hv: 'Chị Lương', lop: 'RK1446', mon: 'Excel' },
  { match: /THAI THI TRA MY|Myny|C My/i, hv: 'Thái Trà My', lop: 'KC015', mon: 'Tin học VP' },
  { match: /Simon District K Sac/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Ly Thanh Hai/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /DANG THIEN LY|Thien ly/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Tan Tommy District K/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /HUYNH THANH CAO KY|Caoo Ky/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Tuyen Le Palmora/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Phuong Teddy/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Tho chuyen khoan/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Khakha chuyen/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Quang Hoang|QUANG THAI HOANG/i, hv: 'A.Nat & A.Phước', lop: 'KC006', mon: 'Excel & Pivot' },
  { match: /Cty An Pha thanh toan/i, hv: 'Công ty An Pha', lop: 'HĐ_ANPHA_2026', mon: 'Đào tạo Doanh nghiệp' }
];

console.log(`Configured ${learnedProfiles.length} learned student profiles.`);

// Scan statements 2026.07 to 2026.10
['2026.07', '2026.08', '2026.09', '2026.10'].forEach(m => {
  const fPath = path.join(targetFolder, `lich-su-giao-dich-tai-khoan ${m}.xlsx`);
  const wb = XLSX.readFile(fPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

  console.log(`\n--- BÓC TÁCH THÔNG MINH CHO ${m} ---`);
  for (let r = 12; r < rows.length; r++) {
    const credit = rows[r][4];
    const detail = String(rows[r][6] || rows[r][5] || '');
    if (!credit) continue;

    // Check if matches a learned student profile
    const matched = learnedProfiles.find(p => p.match.test(detail));
    if (matched) {
      console.log(`[HỌC VIÊN QUEN] Ngày: ${rows[r][2].split('\n')[0]} | Tiền: ${credit} | HV: ${matched.hv} | Lớp: ${matched.lop} | Môn: ${matched.mon}`);
      console.log(`   Detail: ${detail}`);
    } else if (detail.toLowerCase().includes('hoc phi') || detail.toLowerCase().includes('hoc excel') || detail.toLowerCase().includes('dong tro')) {
      console.log(`[HỌC VIÊN MỚI / TỪ KHÓA] Ngày: ${rows[r][2].split('\n')[0]} | Tiền: ${credit} | Detail: ${detail}`);
    }
  }
});
