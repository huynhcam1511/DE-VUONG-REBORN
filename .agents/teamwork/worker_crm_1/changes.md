# Chi Tiết Thay Đổi: Mở Rộng Phí Nhận Lớp & Phí Hoa Hồng Hàng Tháng

- **Tệp thay đổi duy nhất**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Tác giả**: Worker 1 (`teamwork_worker`)
- **Ngày thực hiện**: 2026-11-14

---

## 1. Schema & Kiểu Dữ Liệu
1. Khai báo kiểu dữ liệu `MonthlyCommissionItem`:
   ```typescript
   export interface MonthlyCommissionItem {
     id?: string;
     month: number;
     amount: number | string;
     note: string;
   }
   ```
2. Mở rộng `CRMRecord`:
   - Bổ sung `classIntakeFee?: number;` (Phí nhận lớp ban đầu).
   - Bổ sung `monthlyCommissions?: MonthlyCommissionItem[];` (Danh sách hoa hồng định kỳ theo tháng).

---

## 2. Các Hàm Tiện Ích & Component Nhập Liệu Tiền Tệ Chống Nhảy Con Trỏ
1. `calculateTotalCommission(items)`:
   - Tính tổng toàn bộ các dòng hoa hồng đã nhập trong mảng, tự động làm sạch ký tự phân cách.
2. `calculateNetCashflow(tuition, intakeFee, monthlyCommissions)`:
   - Tính dòng tiền thực nhận theo công thức chuẩn: `Học phí - Phí nhận lớp - Tổng hoa hồng`.
3. `formatThousandsVN(val)`:
   - Định dạng chuỗi số phân cách hàng nghìn dấu chấm chuẩn Việt Nam (`1.000.000`).
4. `SaaSCurrencyInput`:
   - Component ô nhập tiền tệ SaaS cao cấp với thuật toán `digitsBeforeCursor` kết hợp `requestAnimationFrame` và `setSelectionRange`.
   - Ngăn chặn hoàn toàn hiện tượng con trỏ chuột bị nhảy về cuối khi người dùng sửa hoặc xóa ký tự ở giữa chuỗi.
   - Hỗ trợ suffix `₫` tinh tế ở mép phải.

---

## 3. Quản Lý State & Thao Tác Danh Sách Động Trong Form
1. Khởi tạo state:
   - `formClassIntakeFee`: chuỗi số cho phí nhận lớp.
   - `formMonthlyCommissions`: danh sách các dòng tháng, khởi tạo mặc định dòng Tháng 1:
     `[{ id: 'mc_init_1', month: 1, amount: '', note: '' }]`.
2. Handlers:
   - `handleAddMonthlyCommission`: Thêm dòng tháng tiếp theo (`Tháng N+1`).
   - `handleRemoveMonthlyCommission`: Xóa dòng được chọn và tự động đánh số lại các tháng còn lại tuần tự (`Tháng 1`, `Tháng 2`...). Nếu danh sách chỉ còn 1 dòng, xóa trắng dữ liệu thay vì để mảng rỗng.
   - `handleUpdateMonthlyCommission`: Cập nhật linh hoạt số tiền hoặc ghi chú đối soát của từng dòng tháng.
3. Reactive Calculations:
   - `computedTuitionNumber`, `computedClassIntakeFeeNumber`, `computedTotalMonthlyCommission`, `computedNetCashflow` cập nhật tức thì theo từng phím gõ nhờ React `useMemo`.

---

## 4. Giao Diện & Bố Cục UI (Tuân thủ nghiêm ngặt AGENTS.md)
1. **Tái cấu trúc Section 2 (Kế hoạch & Thông tin tư vấn)**:
   - Hàng 1 (3 cột cân đối): Nguồn khách, PIC, Hình thức đào tạo.
   - Hàng 2 (3 cột ngày tháng): Ngày ghi nhận nhu cầu, Ngày dự kiến khai giảng, Hẹn liên hệ lại.
   - Hàng 3 (Khối Kế hoạch Tài chính & Phí hoa hồng):
     * Hàng 2 ô nhập chính: Học phí dự kiến (VNĐ) và Phí nhận lớp (VNĐ).
     * Danh sách động Phí chênh lệch hàng tháng với nhãn tháng, ô nhập tiền tệ, ô ghi chú đối soát, nút xóa thùng rác và nút `(+) Thêm tháng tiếp theo`.
     * Bảng tổng hợp Dòng tiền thực nhận (Real-time Cashflow Banner) hiển thị 4 chỉ số:
       (1) Học phí dự kiến, (2) Phí nhận lớp, (3) Tổng hoa hồng, (4) Dòng tiền thực nhận (màu xanh emerald nếu dương, màu đỏ rose nếu âm).
2. **Master Table View (Cột Học phí)**:
   - Dòng chính: Tổng học phí `font-mono text-xs font-semibold text-slate-800`.
   - Dòng phụ: Nếu có phí nhận lớp hoặc hoa hồng, hiển thị dòng tiền thực nhận:
     `Thực: {netCash.toLocaleString('vi-VN')} đ` (`font-mono text-[10px] font-semibold text-emerald-700`).

---

## 5. Lưu Trữ Vĩnh Viễn & Đồng Bộ Hai Chiều Firestore
1. `handleSaveForm`:
   - Ghi `classIntakeFee` (số nguyên) và `monthlyCommissions` vào `updated: CRMRecord`.
   - Làm sạch payload bằng `removeUndefinedFields` và ghi đồng thời vào cả `customer_profiles` và `crm_records` qua `setDoc(..., { merge: true })`.
2. Real-time Snapshot Listeners:
   - Nạp và mapping cả `classIntakeFee` và `monthlyCommissions` trong `latestCrmDocs` và `latestProfileDocs`.
3. Thuật toán gộp `mergeCRMRecord`:
   - Bảo toàn `classIntakeFee` và `monthlyCommissions` khi hợp nhất tài liệu tránh thất lạc dữ liệu realtime.
4. Nhân bản bản ghi `handleDuplicateRecord`:
   - Bảo toàn `classIntakeFee` và bản sao sâu của `monthlyCommissions`, lưu đồng thời lên cả 2 collection Firestore.

---

## 6. Sửa Lỗi Tồn Đọng (Bug Fixes)
1. Bổ sung `updateDoc` vào import từ `'firebase/firestore'`.
2. Sửa truyền tham số `String(rec.id)` trong `updateDoc` (lines 2781 & 2804).
3. Sửa lỗi đánh máy `formExpectedStartDate` thành biến state chuẩn `formStartDate` (line 4751).
