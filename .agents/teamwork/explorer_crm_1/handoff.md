# Báo Cáo Chuyển Giao (Handoff Report)
## Khảo Sát Kiến Trúc Dữ Liệu & Cơ Chế Lưu Trữ Cho Mở Rộng Phí Tuyển Sinh CRM

- **Người thực hiện**: Explorer 1 (`teamwork_explorer`)
- **Tệp phân tích chi tiết**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_1\analysis.md`
- **Tệp tài liệu gốc**: `.agents/teamwork/ORIGINAL_REQUEST.md` & `.agents/teamwork/orchestrator_4/plan.md`

---

### 1. Observation (Quan Sát Thực Nghiệm)

1. **Vị trí định nghĩa kiểu dữ liệu CRM**:
   - `CRMRecord` được định nghĩa trực tiếp tại `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`, dòng 656 - 710.
   - Các trường tài chính hiện có trong `CRMRecord`:
     - `tuition?: string;` (dòng 673)
     - `paidAmount?: number | string;` (dòng 684)
     - `paymentStatus?: string;` (dòng 685)
     - `intermediaryFeePercent?: number;` (dòng 695)
     - `trainingPackages?: TrainingPackageItem[];` (dòng 705)
   - Trong `De_Vuong_Webapp/src/domain/revenue.ts`, `CustomerProfileInput` (dòng 3 - 31) là interface đối ứng được dùng bởi `revenueService.upsertCustomer`.

2. **Cơ chế lưu trữ và nạp dữ liệu**:
   - Bộ nhớ cục bộ LocalStorage: Sử dụng các khóa `katc_custom_crm_records`, `katc_crm_overrides`, `katc_deleted_crm_ids` (dòng 1318 - 1320, dòng 1356 - 1370).
   - Cơ sở dữ liệu Firestore: Lắng nghe realtime trên 2 collections:
     - `crm_records` (dòng 2894)
     - `customer_profiles` (dòng 2952)
   - Đáng chú ý: Listener `customer_profiles` (dòng 2954 - 3005) mapping tường minh từng thuộc tính từ snapshot mà không dùng spread `...data`.
   - Cơ chế ghi Firestore: Dùng `setDoc` với `{ merge: true }` cho cả 2 collections `customer_profiles` và `crm_records` (dòng 3518 - 3519).
   - Trước khi ghi Firestore, dữ liệu được lọc bỏ các trường `undefined` qua `removeUndefinedFields` (nhập từ `src/services/quotationService.ts`, dòng 156 - 169).

3. **Cơ chế nhập liệu và format tiền tệ hiện tại**:
   - Ô nhập học phí hiện tại (`formTuition`, dòng 5133 - 5141):
     - Hiển thị: `value={formTuition ? (parseInt(formTuition.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN') : ''}`
     - Thay đổi: `onChange={(e) => setFormTuition(e.target.value.replace(/\D/g, ''))}`
     - Hàm format tái sử dụng trong component: `formatVND` (dòng 2512 - 2517): `digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')`.

4. **Trạng thái Build của dự án**:
   - Lệnh `npm run build` (`vite build`) chạy thành công trong `De_Vuong_Webapp`:
     - Kết quả: `✓ built in 10.90s`
     - Mã thoát: `exit code 0`.
   - Khi chạy `npm run lint` (`tsc --noEmit`), phát hiện một số lỗi type pre-existing ở các module khác (`ClassDetail.tsx`, `StudentPortal.tsx`, `CRMAdmissionsModule.tsx` ở dòng 1420/1627 về `expected_revenue` và `TNARecord`). Các thay đổi mới bắt buộc phải sạch type hoàn toàn, không phát sinh bất kỳ lỗi TS mới nào.

---

### 2. Logic Chain (Chuỗi Lập Luận)

1. Từ **Observation 1**, `CRMRecord` là single-source-of-truth cho dữ liệu hàng trong CRM Admissions. Để đáp ứng R1 và R3, ta cần mở rộng `CRMRecord` với:
   - `classIntakeFee?: number;` (Phí nhận lớp)
   - `monthlyCommissions?: MonthlyCommissionItem[];` (Danh sách phí chênh lệch hàng tháng)
   - Interface `MonthlyCommissionItem`: `{ month: number; amount: number; note: string; }`

2. Từ **Observation 2**, khi đọc Firestore, `customer_profiles` ánh xạ tường minh từng trường. Do đó, nếu Worker chỉ thêm trường vào `CRMRecord` mà quên mapping trong `latestProfileDocs = snapshot.docs.map(...)` (dòng 2954), dữ liệu từ `customer_profiles` sẽ bị mất thuộc tính `classIntakeFee` và `monthlyCommissions`. Bắt buộc phải thêm mapping ở cả 2 snapshot listeners (`crm_records` và `customer_profiles`).

3. Từ **Observation 2**, quá trình lưu form (`handleSaveForm`) sử dụng `removeUndefinedFields` và `setDoc(..., { merge: true })`. Điều này đảm bảo:
   - Nếu `monthlyCommissions` là mảng rỗng hoặc undefined, khi được lưu sẽ không gây lỗi Firestore "unsupported field value: undefined".
   - Các document cũ trong Firestore không có 2 trường này sẽ được bảo toàn nguyên vẹn mà không bị ảnh hưởng (tương thích ngược 100%).

4. Từ **Observation 3**, việc áp dụng mẫu `e.target.value.replace(/\D/g, '')` cho ô nhập `formClassIntakeFee` và các dòng `formMonthlyCommissions[i].amount` đảm bảo tính nhất quán tuyệt đối với ô Học phí hiện có, ngăn chặn người dùng nhập chữ cái hoặc ký tự đặc biệt, đồng thời tự động phân tách hàng nghìn theo chuẩn tiếng Việt (`toLocaleString('vi-VN')`).

5. Từ **Observation 1 & 3**, công thức tính toán:
   - $\text{Tổng hoa hồng hàng tháng} = \sum \text{amount của các dòng tháng}$
   - $\text{Dòng tiền thực nhận} = \text{Học phí} - \text{Phí nhận lớp} - \text{Tổng hoa hồng}$
   Các hàm `calculateTotalCommission` và `calculateNetCashflow` là pure functions và được bọc bởi `useMemo`, đảm bảo UI cập nhật tức thì (reactive) ngay khi gõ từng con số.

---

### 3. Caveats (Khu Vực Chưa Thể Hiện Thực Hóa & Giả Định)

1. **Giả định về xóa dòng tháng**: Khi người dùng xóa một dòng tháng ở giữa (ví dụ xóa Tháng 2 khi có Tháng 1, 2, 3), hệ thống nên tự động re-index lại thành Tháng 1, Tháng 2 để đảm bảo chuỗi tháng luôn liên tục. Nếu người dùng xóa dòng duy nhất còn lại (Tháng 1), form sẽ reset giá trị về `{ month: 1, amount: 0, note: '' }` thay vì để mảng rỗng (theo yêu cầu R1: "mặc định có sẵn dòng Tháng 1").
2. **Khu vực chưa can thiệp**: Explorer 1 tuân thủ nghiêm ngặt nguyên tắc **READ-ONLY**, không chỉnh sửa bất kỳ tệp nguồn nào trong `De_Vuong_Webapp/`. Toàn bộ mã đề xuất đã được viết sẵn trong `analysis.md` để Worker chỉ việc áp dụng.

---

### 4. Conclusion (Kết Luận & Giải Pháp)

1. **Mô hình dữ liệu chuẩn**:
   ```typescript
   export interface MonthlyCommissionItem {
     month: number;
     amount: number;
     note: string;
   }
   ```
   Bổ sung vào `CRMRecord`:
   - `classIntakeFee?: number;` (default `0`)
   - `monthlyCommissions?: MonthlyCommissionItem[];` (default `[{ month: 1, amount: 0, note: '' }]`)
2. **State & Xử lý Form**:
   - `formClassIntakeFee: string` (quản lý chuỗi số để gõ mượt mà).
   - `formMonthlyCommissions: MonthlyCommissionItem[]` (quản lý danh sách động).
   - Hàm thêm: `handleAddMonthlyCommissionRow` (thêm Tháng $N+1$).
   - Hàm xóa: `handleRemoveMonthlyCommissionRow` (xóa và re-index).
   - Hàm sửa: `handleUpdateMonthlyCommissionRow`.
3. **Đồng bộ Firestore**:
   - Cập nhật mapping tại dòng 2894 (`crm_records`) và dòng 2952 (`customer_profiles`).
   - Cập nhật gộp tại dòng 2761 (`mergeCRMRecord`).
   - Cập nhật payload tại dòng 3376 (`handleSaveForm`).
   - Cập nhật nhân bản tại dòng 3920 (`handleDuplicateRecord`).

---

### 5. Verification Method (Phương Pháp Kiểm Tra Độc Lập)

Sau khi Worker triển khai, Reviewer và Challenger có thể kiểm chứng độc lập bằng các bước sau:

1. **Kiểm tra biên dịch và build**:
   - Chạy lệnh trong thư mục `De_Vuong_Webapp`:
     ```powershell
     npm run build
     ```
   - Điều kiện đạt: Lệnh build chạy xong, mã thoát `0` (`exit code 0`), bundle được sinh ra trong thư mục `dist/`.

2. **Kiểm tra tính toàn vẹn dữ liệu và tương thích ngược**:
   - Mở màn hình Tuyển sinh CRM (`tab=leads`).
   - Chọn mở form tạo mới hoặc chỉnh sửa một hồ sơ cũ:
     - Quan sát: Ô "Phí nhận lớp" hiển thị `0` hoặc số tiền đã lưu.
     - Quan sát: Danh sách "Phí chênh lệch hàng tháng" hiển thị mặc định dòng "Tháng 1" với ô nhập số tiền và ô ghi chú đối soát.
   - Bấm nút `(+) Thêm tháng tiếp theo`:
     - Quan sát: Dòng "Tháng 2" xuất hiện.
   - Nhập thử các số tiền:
     - Học phí: `10.000.000`
     - Phí nhận lớp: `2.000.000`
     - Tháng 1: `1.000.000`
     - Tháng 2: `500.000`
     - Quan sát tức thì: Tổng hoa hồng = `1.500.000 đ`, Dòng tiền thực nhận = `6.500.000 đ` ($10.000.000 - 2.000.000 - 1.500.000$).
   - Bấm "Lưu cập nhật", tải lại trang (F5):
     - Quan sát: Dữ liệu vẫn được giữ nguyên đầy đủ, không bị reset về 0.
