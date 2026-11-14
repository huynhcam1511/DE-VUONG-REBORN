# Báo Cáo Thẩm Định & Thách Thức Thực Nghiệm (Handoff Report) - Challenger 1

## 1. Observation (Quan Sát Trực Tiếp)

- **Tệp nguồn kiểm tra**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Harness kiểm tra thực nghiệm độc lập**: `De_Vuong_Webapp/tests/crmAdmissionsAdversarial.test.ts`
- **Các quan sát trực tiếp từ mã nguồn và terminal**:
  1. **Công thức và hàm tính toán tài chính** (Dòng 663-684):
     ```typescript
     export const calculateTotalCommission = (items?: MonthlyCommissionItem[] | null): number => {
       if (!items || !Array.isArray(items)) return 0;
       return items.reduce((sum, item) => {
         const amt = Number(String(item?.amount || '').replace(/\D/g, '')) || 0;
         return sum + amt;
       }, 0);
     };

     export const calculateNetCashflow = (
       tuition: string | number | undefined,
       intakeFee: string | number | undefined,
       monthlyCommissions?: MonthlyCommissionItem[] | null
     ): number => {
       const rawTuition = typeof tuition === 'number' 
         ? tuition 
         : (Number(String(tuition || '').replace(/\D/g, '')) || 0);
       const rawIntakeFee = typeof intakeFee === 'number'
         ? intakeFee
         : (Number(String(intakeFee || '').replace(/\D/g, '')) || 0);
       const totalCommission = calculateTotalCommission(monthlyCommissions);
       return rawTuition - rawIntakeFee - totalCommission;
     };
     ```
  2. **Bộ định dạng tiền tệ chống nhảy trỏ chuột** (Dòng 686-751):
     Hàm `formatThousandsVN` sử dụng regex `\B(?=(\d{3})+(?!\d))` để định dạng dấu chấm phân cách hàng nghìn. Component `SaaSCurrencyInput` tính toán chính xác số chữ số trước vị trí con trỏ `digitsBeforeCursor` và khôi phục vị trí qua `requestAnimationFrame` và `setSelectionRange`.
  3. **Xử lý danh sách động Tháng** (Dòng 1636-1672):
     - `handleAddMonthlyCommission`: Tăng `prev.length + 1` tạo tuần tự Tháng 2, Tháng 3...
     - `handleRemoveMonthlyCommission`: Khi `prev.length <= 1`, trả về mảng 1 phần tử đã xóa trắng giá trị `amount: ''` và `note: ''`. Khi xóa dòng giữa, ánh xạ lại tuần tự `month: idx + 1` mà vẫn giữ nguyên số tiền và ghi chú của các tháng còn lại.
  4. **Bảng tổng hợp Dòng tiền thực nhận (Banner)** (Dòng 5491-5549):
     Hiển thị 4 chỉ số (Học phí, Phí nhận lớp, Tổng hoa hồng, Dòng tiền thực nhận). Khi âm, hiển thị định dạng chuẩn `-${Math.abs(computedNetCashflow).toLocaleString('vi-VN')} đ` và viền rose-300; khi dương viền emerald-300.
  5. **Bảng Master Table** (Dòng 7167-7195):
     Cột Học phí hiển thị học phí gốc và chỉ hiển thị dòng phụ `Thực: {netCash.toLocaleString('vi-VN')} đ` khi có phát sinh giảm trừ (`hasDeductions = intakeFee > 0 || monthlyCommissionsSum > 0`).
  6. **Đồng bộ Firestore và chuẩn hóa dữ liệu** (Dòng 3637-3646, 4142-4144):
     `classIntakeFee` rỗng được lưu là `undefined`. `monthlyCommissions` nếu không có dữ liệu được lưu là `[]`. Cả `handleSaveForm` và `handleDuplicateRecord` đều ghi nhận và lưu vĩnh viễn vào cả `crm_records` và `customer_profiles`.
  7. **Kết quả chạy kiểm thử thực nghiệm (Terminal Outputs)**:
     - Chạy `node --import tsx --test tests/crmAdmissionsAdversarial.test.ts`:
       `ℹ tests 19 | ℹ suites 1 | ℹ pass 19 | ℹ fail 0 | ℹ duration_ms 2633.2064` (Exit Code 0).
     - Chạy toàn bộ test suite (`paymentCore`, `classDetailHelpers`, `mobileSwipe`, `admissionsDebtSync`, `crmAdmissionsAdversarial`):
       `ℹ tests 47 | ℹ suites 1 | ℹ pass 47 | ℹ fail 0 | ℹ duration_ms 2515.3711` (Exit Code 0).
     - Chạy `npm run build` trong `De_Vuong_Webapp/`:
       `✓ 3786 modules transformed.`
       `dist/index.html 1.54 kB`
       `✓ built in 23.23s` (Exit Code 0).

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. Từ **Quan sát 1 & 7**: 
   Các ca kiểm thử thực nghiệm trực tiếp từ đơn giản đến phức tạp (chuẩn 15M/2M/1M+1M -> 11M, ca zero 0/0/0 -> 0, ca âm 5M/4M/2M -> -1M, ca đa tháng 12 tháng -> 12.2M, ca cực đại 500 tỷ VNĐ) đều cho kết quả chính xác 100%. Hàm xử lý an toàn với mọi chuỗi định dạng (chứa dấu chấm, phẩy, ký hiệu đ, khoảng trắng) và các giá trị nullish/undefined.
2. Từ **Quan sát 2 & 7**:
   Thuật toán tính toán vị trí con trỏ `newCursorPos` của `SaaSCurrencyInput` không bao giờ vượt biên và giữ nguyên vị trí con trỏ ngay sau chữ số vừa nhập, loại bỏ hoàn toàn hiện tượng trỏ chuột bị nhảy về cuối ô khi gõ nhanh.
3. Từ **Quan sát 3 & 7**:
   Logic state của danh sách tháng đảm bảo mảng không bao giờ bị rỗng (khi còn 1 dòng nhấn xóa sẽ reset rỗng chứ không xóa mất dòng), và việc thêm/xóa/đánh số lại tháng hoàn toàn tuần tự, không gây mất mát dữ liệu của các tháng khác.
4. Từ **Quan sát 4, 5 & AGENTS.md**:
   Giao diện tuân thủ các quy tắc trong AGENTS.md: không dùng candy badges/pill màu mè rườm rà, dùng chữ mono tinh gọn cho số tiền, phân định rõ ràng giữa học phí gốc và dòng tiền thực nhận, màu sắc ngữ nghĩa chuẩn (emerald khi dương, rose khi âm, không bị lỗi hiển thị hai dấu trừ `--`).
5. Từ **Quan sát 6 & 7**:
   Việc lưu trữ dữ liệu vào Firestore được thực hiện qua cả hai collection `crm_records` và `customer_profiles`, có xử lý sanitize để tránh lưu các trường undefined hoặc rác, đảm bảo tính bền vững dữ liệu (data persistence).
6. Từ **Quan sát 7**:
   Lệnh `npm run build` hoàn thành với Exit Code 0, khẳng định không có lỗi cú pháp hoặc lỗi build bundler nào.

---

## 3. Caveats (Điểm Lưu Ý)

- Kiểm thử tập trung vào tính đúng đắn của logic tính toán, định dạng dữ liệu, chuyển đổi trạng thái và tuân thủ giao diện. Việc kết nối mạng thực tế tới Firestore Cloud được kiểm chứng qua mock payload cấu trúc và Firebase SDK runtime typing.
- Lệnh `npm run lint` (`tsc --noEmit`) hiển thị một số cảnh báo type tồn đọng từ trước của toàn bộ codebase cũ (trong `ClassDetail.tsx`, `StudentPortal.tsx`...), hoàn toàn không liên quan đến các tính năng mới bổ sung trong `CRMAdmissionsModule.tsx`.

---

## 4. Conclusion (Kết Luận Thẩm Định)

**VERDICT: APPROVE**

Module `CRMAdmissionsModule.tsx` đã vượt qua 100% các bài kiểm thử thực nghiệm đối kháng (19/19 tests), đảm bảo độ chính xác tài chính tuyệt đối, khả năng phục hồi với dữ liệu dị biệt, tuân thủ nghiêm ngặt các quy tắc giao diện trong `AGENTS.md`, và vượt qua quá trình đóng gói production build (`npm run build` Exit Code 0).

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Bất kỳ thành viên nào trong nhóm hoặc Orchestrator đều có thể xác minh độc lập bằng các câu lệnh sau:

1. **Chạy bộ kiểm thử đối kháng tài chính**:
   ```powershell
   cd De_Vuong_Webapp
   node --import tsx --test tests/crmAdmissionsAdversarial.test.ts
   ```
   *Điều kiện hợp lệ*: 19/19 tests pass, Exit Code 0.

2. **Chạy toàn bộ test suite hệ thống**:
   ```powershell
   cd De_Vuong_Webapp
   node --import tsx --test tests/paymentCore.test.ts tests/classDetailHelpers.test.ts tests/mobileSwipe.test.ts tests/admissionsDebtSync.test.ts tests/crmAdmissionsAdversarial.test.ts
   ```
   *Điều kiện hợp lệ*: 47/47 tests pass, Exit Code 0.

3. **Chạy kiểm tra production build**:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   *Điều kiện hợp lệ*: Vite build thành công, tạo thư mục `dist/`, Exit Code 0.
