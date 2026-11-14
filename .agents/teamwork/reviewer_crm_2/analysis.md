# Báo Cáo Phân Tích & Đánh Giá Độc Lập (Analysis & Review Report) - Reviewer 2

- **Đối tượng đánh giá**: Giải pháp mở rộng Phí nhận lớp & Phí chênh lệch hoa hồng hàng tháng trong CRM Tuyển sinh (`CRMAdmissionsModule.tsx`).
- **Thực hiện bởi**: Reviewer 2 (`reviewer_crm_2` - Archetype: Reviewer & Adversarial Critic)
- **Ngày đánh giá**: 2026-11-14
- **Trạng thái**: Hoàn tất xác minh độc lập

---

## 1. Quality Review (Đánh Giá Chất Lượng Nghiệp Vụ & Kỹ Thuật)

### 1.1 Tính Đúng Đắn & Tính Đầy Đủ (Correctness & Completeness)
- **Yêu cầu R1 (Trường Phí nhận lớp & Danh sách Phí chênh lệch hàng tháng)**:
  - Khai báo giao diện `MonthlyCommissionItem` và mở rộng `CRMRecord` với `classIntakeFee?: number` và `monthlyCommissions?: MonthlyCommissionItem[]`.
  - Mặc định danh sách khởi tạo với Tháng 1 (`[{ month: 1, amount: '', note: '' }]`).
  - Thao tác thêm tháng (`handleAddMonthlyCommission`): Tự động tạo Tháng $N+1$.
  - Thao tác xóa tháng (`handleRemoveMonthlyCommission`): Tự động đánh số lại các tháng tuần tự (Tháng 1, Tháng 2...). Nếu danh sách chỉ còn 1 dòng, hệ thống thực hiện xóa trắng nội dung thay vì để mảng rỗng, đảm bảo form luôn có sẵn dòng Tháng 1.
  - Ô nhập `SaaSCurrencyInput`: Tự động loại bỏ ký tự phi số, định dạng phân cách hàng nghìn dấu chấm chuẩn Việt Nam (`1.000.000`), có suffix `₫` tinh gọn.
- **Yêu cầu R2 (Tính toán dòng tiền tự động & Phản ứng tức thì)**:
  - Hàm thuần túy `calculateTotalCommission` và `calculateNetCashflow` xử lý an toàn dữ liệu đầu vào (`null`, `undefined`, chuỗi có dấu chấm, số âm).
  - Sử dụng `useMemo` tính toán 4 chỉ số tài chính: `computedTuitionNumber`, `computedClassIntakeFeeNumber`, `computedTotalMonthlyCommission`, `computedNetCashflow`. Phản ứng ngay lập tức theo từng phím gõ.
  - Hiển thị trực quan qua **Real-time Cashflow Banner** gồm 4 thẻ chỉ số cân đối.
  - Hiển thị trên Master Table: Cột Học phí hiển thị học phí gốc và dòng phụ `Thực: {netCash.toLocaleString('vi-VN')} đ` khi có khoản khấu trừ.
- **Yêu cầu R3 (Lưu trữ vĩnh viễn & Đồng bộ Firestore)**:
  - `handleSaveForm` và `handleDuplicateRecord`: Ghi đồng thời vào cả 2 collection `customer_profiles` và `crm_records` qua `setDoc(..., { merge: true })` với bộ lọc `removeUndefinedFields`.
  - Real-time Listeners (`latestCrmDocs` và `latestProfileDocs`) và thuật toán gộp `mergeCRMRecord` nạp và bảo toàn đầy đủ `classIntakeFee` và `monthlyCommissions`.
- **Yêu cầu R4 & AGENTS.md Compliance**:
  - Tuân thủ Rule 1: Không có sự kiện click nhầm trên dòng hay ô dữ liệu, toàn bộ thao tác mở form/sửa qua menu `MoreVertical`.
  - Tuân thủ Rule 4: Chống lạm dụng badge/pill màu mè (Anti-Pill Overload), sử dụng phông mono tinh tế (`font-mono text-xs font-semibold`), chấm tròn màu emerald (`w-1.5 h-1.5 rounded-full bg-emerald-500`).
  - Sửa lỗi đánh máy cũ: `formExpectedStartDate` -> `formStartDate`.
  - Bổ sung import `updateDoc` từ `firebase/firestore`.

---

## 2. Adversarial Review & Stress-Testing (Thử Nghiệm Đối Kháng)

### 2.1 Kiểm Tra Thuật Toán Con Trỏ Chuột `SaaSCurrencyInput`
- **Tình huống tấn công 1: Chèn số vào giữa chuỗi đang được định dạng**
  - Giả lập: Chuỗi `1.000.000`, đặt con trỏ tại vị trí index 3 (giữa số 0 thứ nhất và thứ hai), gõ phím `5`.
  - Kết quả dự đoán & thực tế: Thuật toán đếm `digitsBeforeCursor = 3`. Chuỗi sau làm sạch là `10500000`, chuỗi mới là `10.500.000`. Vị trí con trỏ mới được tính toán lại chính xác tại index 4 (ngay sau số 5 vừa nhập). Con trỏ **không bị nhảy về cuối chuỗi**.
- **Tình huống tấn công 2: Dán văn bản bẩn (Copy-Paste Dirty String)**
  - Giả lập: Dán chuỗi `"10,000,000 VND"` hoặc `"abc 5.000.000 xyz"`.
  - Kết quả: Regex `/\D/g` loại bỏ hoàn toàn chữ cái và ký tự lạ, chuyển thành `10000000`, định dạng thành `10.000.000`. State nhận `10000000`, không sinh lỗi `NaN`.
- **Tình huống tấn công 3: Xóa trắng toàn bộ ô nhập**
  - Giả lập: Nhấn Backspace đến rỗng.
  - Kết quả: `cleanDigits` là `""`, `numValue` là `0`, ô nhập hiển thị placeholder `"0"`.

### 2.2 Kiểm Tra Biên Tài Chính (Boundary & Edge Cases)
- **Tình huống 1: Học phí = 0 hoặc rỗng, Phí nhận lớp > 0, Hoa hồng > 0 (Dòng tiền âm)**
  - Giả lập: Học phí = `0`, Phí nhận lớp = `2.000.000`, Hoa hồng Tháng 1 = `1.000.000`.
  - Kết quả: `computedNetCashflow = -3.000.000`.
  - Giao diện: Banner chuyển sang viền đỏ nhạt `border-rose-300 bg-rose-50/70 text-rose-900`, số tiền hiển thị `-3.000.000 đ`. Bảng Master hiển thị `Thực: -3.000.000 đ`.
- **Tình huống 2: Người dùng mở form mới nhưng không nhập hoa hồng nào**
  - Giả lập: Tháng 1 có số tiền rỗng `""` và ghi chú rỗng `""`.
  - Kết quả: Trong `handleSaveForm`, bộ lọc `sanitized.some(m => m.amount > 0 || m.note.length > 0)` trả về `false`, ghi `monthlyCommissions: []` lên Firestore thay vì lưu mảng rác.

---

## 3. Anti-Cheating & Integrity Review (Kiểm Tra Liêm Chính)

| Tiêu Chí Kiểm Tra Liêm Chính | Kết Quả Đánh Giá |
|---|---|
| Hardcoded test results / expected outputs | **KHÔNG CÓ**. Các hàm tính toán tài chính thuần túy, hoạt động trên mọi giá trị thực tế. |
| Dummy / Facade implementations | **KHÔNG CÓ**. Toàn bộ state React, hooks, listeners, dual Firestore persistence hoạt động thật 100%. |
| Shortcuts bypassing requirements | **KHÔNG CÓ**. Không bỏ qua bất kỳ tiêu chí nào của R1-R4. |
| Fabricated verification outputs | **KHÔNG CÓ**. Đã chạy lệnh độc lập `npm test` (28/28 passed) và `npm run build` (Exit code 0). |
| Self-certifying without genuine verification | **KHÔNG CÓ**. Đã kiểm tra trực tiếp qua shell độc lập. |

---

## 4. Kết Quả Xác Minh Độc Lập (Independent Verification)

1. **Unit Tests**:
   - Lệnh: `npm test` trong `De_Vuong_Webapp/`
   - Kết quả: **28/28 passed**, 0 failed, duration: ~2.46s (Exit Code 0).
2. **Production Build**:
   - Lệnh: `npm run build` (`vite build`) trong `De_Vuong_Webapp/`
   - Kết quả: Build hoàn tất trong 19.27s (Exit Code 0), không có lỗi cú pháp hay đóng gói.
3. **Phạm Vi Tệp Thay Đổi**:
   - Duy nhất: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`.
   - Không chạm vào `archives/` hay các tệp không phận sự.
