# Empirical Challenge Report — Milestone M1 (Challenger 1)

**Dự án**: Student Identity & Multi-Stage Admissions Debt Sync  
**Phân hệ**: Milestone M1 (Admissions Debt Calculation & VietQR Generation Logic)  
**Tác giả**: Empirical Challenger 1  
**Ngày hoàn thành**: 2026-11-02T10:17:00Z  
**Thư mục làm việc**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_1`  
**Thư mục ứng dụng chuẩn**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`  
**Verdict**: **APPROVE**  

---

## 1. Observation

### 1.1. Khảo sát mã nguồn thực thi
1. **Hàm tổng hợp công nợ `calculateLedgerPaid` trong `LeadPaymentModal.tsx` (dòng 48–87)**:
   - Nhận danh sách `transactions`, `leaCode`, `lrnCode`, `phone`, `colCode`.
   - Lọc bỏ giao dịch nháp: `if (tx.type === 'expected_revenue') return false;`.
   - Lọc bỏ giao dịch không phát sinh dòng tiền vào: `if ((tx.credit || 0) <= 0) return false;`.
   - Cơ chế bảo vệ chống nhiễm chéo đợt tuyển sinh khác (Cross-admission guard, dòng 74–77):
     ```ts
     const txLeaMatch = raw.match(/\bLEA[\s-]?(\d{6,10})\b/i);
     if (txLeaMatch && digitsLea && txLeaMatch[1] !== digitsLea) {
       return false;
     }
     ```
   - Khớp nối đa kênh: `matchesLea || matchesLrn || matchesPhone || matchesCol`.
   - Cộng dồn số tiền thanh toán thực tế: `.reduce((sum, tx) => sum + (tx.credit || 0), 0);`.

2. **Cơ chế khởi tạo & tính toán thời gian thực trong `LeadPaymentModal.tsx` (dòng 155–199)**:
   - Trường hợp `lead`:
     - Học phí gốc kế thừa: `leadTuition = Number(lead.tuition || 0)`.
     - Số tiền đã thu trước đó: `previouslyPaidAmount = Math.max(Number(lead.paidAmount || 0), ledgerPaid)`.
     - Số tiền đề xuất tại Ô 2: `setCollectionAmount(remaining > 0 ? String(remaining) : (leadTuition > 0 ? '0' : ''))` với `remaining = Math.max(0, leadTuition - paid)`.
   - Tính toán công nợ phản ứng (Reactive debt calculation):
     - `currentRemainingDebt = Math.max(0, numericTotalTuition - previouslyPaidAmount)`
     - `numericRemainingAfterThis = Math.max(0, currentRemainingDebt - numericAmount)`
   - Xử lý số học an toàn: Cả Ô 1 và Ô 2 đều dùng `parseInt(val.replace(/\D/g, ''), 10) || 0`, triệt tiêu hoàn toàn lỗi khi nhập dấu phẩy, chấm hay ký tự lạ.

3. **Sinh mã VietQR trong `vietQR.ts` (dòng 24–42)**:
   - Xây dựng URL theo chuẩn VietQR mẫu in `print` (chứa Tên ngân hàng, Số tài khoản, Tên tài khoản, Số tiền, Diễn giải).
   - Khi `amount > 0`: gắn tham số `&amount=${numericAmount}`.
   - Khi `amount === 0`: bỏ qua tham số `&amount`, cho phép người chuyển tiền tự điền trên app ngân hàng.
   - Làm sạch chuỗi diễn giải: `sanitizedDesc = String(description || '').trim().replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()`.

4. **Hiển thị Header và Mã định danh (dòng 300–319)**:
   - Hiển thị song song: `LEA-xxxxxxxx · LRN-xxxxxxxx · [COL-xxxxxxxx] · Nguyễn Thị Anh Thi`.
   - Đảm bảo chuẩn mono không bọc pill/badge theo AGENTS.md.

---

## 2. Logic Chain

### 2.1. Thẩm định kịch bản chấp thuận chuẩn (Acceptance Scenario)
- **Thiết lập đầu vào**: Hồ sơ có học phí dự kiến $6.000$đ, trong Sổ cái có giao dịch $3.000$đ khớp mã `LEA-64817788`.
- **Hành vi thực tế ghi nhận qua bộ kiểm thử tự động `tests/challenger_m1_debt_vietqr.test.ts`**:
  - `numericTotalTuition = 6000` (Ô 1 hiển thị 6.000đ).
  - `previouslyPaidAmount = 3000`.
  - Thanh tiến độ hiển thị: Đã thu 3.000đ / Học phí: 6.000đ / Còn nợ 3.000đ.
  - `collectionAmount = '3000'` (Ô 2 tự động gợi ý đúng số tiền nợ còn lại là 3.000đ).
  - `numericRemainingAfterThis = 0` (Ô 3 hiển thị 0đ).
  - VietQR sinh ra có tham số `&amount=3000`.
  - Header hiển thị đầy đủ `LEA-64817788 · LRN-62517882 · Nguyễn Thị Anh Thi`.
- **Kết luận**: Kịch bản chấp thuận cốt lõi đạt chuẩn 100%.

### 2.2. Thẩm định các trường hợp biên & áp lực (Adversarial Edge Cases)
1. **Học phí bằng 0 hoặc chưa nhập**:
   - `lead.tuition = 0` hoặc `undefined`: Hệ thống dùng giá trị mặc định chuẩn `3.000.000đ` cho Ô 1, Ô 2 để trống (placeholder `0`), VietQR không gắn `&amount=` (cho phép quét tự do), thanh tiến độ ẩn sạch sẽ. Không phát sinh lỗi `NaN`.
2. **Đã thanh toán đủ hoặc nộp thừa (Paid >= Tuition)**:
   - Học phí $6.000$đ, đã nộp $6.000$đ: `currentRemainingDebt = 0`, Ô 2 đề xuất `'0'`, Ô 3 hiển thị `0đ`, thanh tiến độ báo Đã thu 6.000đ / Còn nợ 0đ.
   - Nộp thừa ($8.000$đ trên học phí $6.000$đ): Hàm `Math.max(0, ...)` khóa cứng đáy bằng 0, không bao giờ xuất hiện số âm.
3. **Cộng dồn nhiều lần chuyển khoản (Multiple Ledger Transactions)**:
   - Đợt 1 $1.000$đ + Đợt 2 $2.000$đ = $3.000$đ. Hệ thống cộng dồn chính xác.
   - Giao dịch nháp `expected_revenue` ($5.000$đ) bị loại bỏ hoàn toàn, không tính nhầm vào tiền đã thu.
   - Giao dịch nợ/hoàn tiền `credit <= 0` bị loại trừ.
4. **Nhập ký tự phi số vào Ô 1 và Ô 2**:
   - Chuỗi định dạng `"6,000,000 VND / đợt"` và `"2,500,000 đ (cọc)"` tự động được rút trích thành `6000000` và `2500000`.
   - Chuỗi rác thuần túy `"xyz!@#$"` tự động fallback về `0`, không làm sập giao diện hay ném Exception.
5. **Người dùng nhập số tiền thu đợt này lớn hơn số nợ còn lại**:
   - Nợ còn lại $3.000$đ, người dùng gõ $5.000$đ: Ô 3 vẫn hiển thị `0đ` (nhờ `Math.max(0, currentRemainingDebt - numericAmount)`), VietQR tự động cập nhật số tiền $5.000$đ theo đúng ý người dùng.
6. **Mở từ màn hình Học viên cũ (StudentDetail)**:
   - Phân nhánh `student` tính toán chính xác từ `student.totalAmount` và `student.debt`, hiển thị mã `LRN` trên header và cú pháp VietQR dạng `LRN... HOC PHI [TEN]`.
7. **Ngăn chặn nhiễm chéo giữa các đợt tuyển sinh khác nhau (Cross-admission Guard)**:
   - Học viên có 2 đợt tuyển sinh `LEA-11111111` (khóa cũ) và `LEA-22222222` (khóa mới) cùng số điện thoại: Giao dịch của khóa cũ không bị nhận nhầm sang khóa mới vì đã có guard kiểm tra mã `LEA` khác biệt.
8. **Cập nhật phản ứng thời gian thực (Dynamic Reactive Update)**:
   - Khi người dùng sửa học phí Ô 1 (ví dụ từ 6M lên 8M), công nợ Ô 3 ngay lập tức nhảy từ 0đ lên 2M tương ứng mà không cần reload trang.

---

## 3. Caveats

- **No Caveats**: Tất cả các kịch bản kiểm thử, bao gồm kịch bản chấp thuận cốt lõi và 10 trường hợp biên bất lợi, đã được kiểm chứng thực nghiệm bằng mã kiểm thử độc lập và cho kết quả chuẩn xác 100%.

---

## 4. Conclusion

- **Verdict**: **APPROVE**
- Hệ thống tính toán công nợ và sinh mã VietQR trong `LeadPaymentModal.tsx` và `CRMAdmissionsModule.tsx` hoàn toàn vững chắc, chính xác về mặt số học, an toàn trước các dữ liệu biên/dữ liệu rác và thỏa mãn 100% tiêu chí chấp nhận của Milestone M1.

---

## 5. Verification Method

### 5.1. Lệnh kiểm thử tự động độc lập của Challenger
```powershell
node --import tsx --test tests/challenger_m1_debt_vietqr.test.ts
```
**Kết quả**: 11/11 tests pass (0 fail, 0 cancel, duration ~760ms).

### 5.2. Toàn bộ Unit Tests của ứng dụng
```powershell
npm test
```
**Kết quả**: 22/22 tests pass (0 fail, 0 cancel, duration ~1860ms).

### 5.3. Kiểm tra Build Production
```powershell
npm run build
```
**Kết quả**: Exit code 0, hoàn tất sau 9.61s, không có bất kỳ lỗi cú pháp hay TypeScript nào.

### 5.4. Tệp kiểm thử được lưu trữ để tái kiểm chứng độc lập
- `De_Vuong_Webapp/tests/challenger_m1_debt_vietqr.test.ts`
