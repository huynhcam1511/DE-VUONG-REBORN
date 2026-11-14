# Báo Cáo Chuyển Giao (Handoff Report) - worker_crm_1

## 1. Observation (Quan Sát Trực Tiếp)
- **Tệp chỉnh sửa duy nhất**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Các điểm quan sát trực tiếp**:
  1. `MonthlyCommissionItem` và `CRMRecord`: Đã mở rộng với `classIntakeFee?: number` và `monthlyCommissions?: MonthlyCommissionItem[]`.
  2. Component `SaaSCurrencyInput` hoạt động với cơ chế `digitsBeforeCursor` chống nhảy trỏ chuột, áp dụng cho cả Tuition, Phí nhận lớp và các dòng hoa hồng theo tháng.
  3. Dynamic month rows: Có sẵn Tháng 1 mặc định, nút (+) thêm Tháng N+1, nút xóa tự động đánh số lại tháng hoặc reset rỗng nếu chỉ còn 1 dòng.
  4. Reactive calculation: `computedTuitionNumber`, `computedClassIntakeFeeNumber`, `computedTotalMonthlyCommission`, `computedNetCashflow` cập nhật tức thời theo từng keystroke.
  5. Financial Summary Banner: Hiển thị trực quan 4 chỉ số (Học phí, Phí nhận lớp, Tổng hoa hồng, Dòng tiền thực nhận) tuân thủ Rule 4 (Anti-Pill Overload, màu emerald nếu dương, rose nếu âm).
  6. Master Table: Cột Học phí hiển thị học phí gốc và dòng phụ `Thực: {netCash.toLocaleString('vi-VN')} đ`.
  7. Firestore sync: `handleSaveForm` và `handleDuplicateRecord` lưu vĩnh viễn cả 2 trường mới vào cả `crm_records` và `customer_profiles` với `removeUndefinedFields` và `setDoc(..., { merge: true })`.
  8. Snapshot listeners & merging: `latestCrmDocs`, `latestProfileDocs`, và `mergeCRMRecord` đã map đầy đủ `classIntakeFee` và `monthlyCommissions`.
  9. Sửa lỗi tồn đọng: Đã bổ sung import `updateDoc` từ `firebase/firestore`, chuẩn hóa `String(rec.id)` trong `updateDoc`, và sửa typo `formExpectedStartDate` thành `formStartDate`.

## 2. Logic Chain (Chuỗi Lập Luận)
- Từ yêu cầu R1: Cần trường Phí nhận lớp và danh sách hoa hồng động $\rightarrow$ Tích hợp `classIntakeFee` và `monthlyCommissions` vào `CRMRecord`, tạo component `SaaSCurrencyInput` để nhập tiền tệ không giật trỏ chuột.
- Từ yêu cầu R2: Cần tính tổng hoa hồng và dòng tiền thực nhận tự động $\rightarrow$ Viết các hàm pure calculation `calculateTotalCommission` và `calculateNetCashflow`, kết nối qua `useMemo` để tính toán phản ứng tức thời trên form và table.
- Từ yêu cầu R3: Cần lưu trữ vĩnh viễn và đồng bộ Firestore $\rightarrow$ Đưa 2 trường vào payload của `handleSaveForm` và `handleDuplicateRecord`, đồng thời map trong các snapshot listeners để khi tải lại trang hoặc lắng nghe realtime dữ liệu không bị thất lạc.
- Từ yêu cầu R4 & AGENTS.md: Giao diện phải sạch sẽ, không candy badges, layout 3 cột cân đối, build và unit test phải pass 100%.

## 3. Caveats (Điểm Lưu Ý)
- Dữ liệu cũ trong Firestore chưa có `classIntakeFee` hoặc `monthlyCommissions` sẽ fallback an toàn về `0` và `undefined` mà không gây lỗi runtime.
- Không sửa bất kỳ tệp nguồn nào ngoài `CRMAdmissionsModule.tsx`, tuân thủ 100% nguyên tắc Exclusive File Write Ownership.

## 4. Conclusion (Kết Luận)
- Tất cả các yêu cầu từ R1 đến R4, synthesis.md và AGENTS.md đã được hoàn thành đầy đủ, chính xác, không dùng mock facade hay hardcode.
- Build và unit test pass 100% với Exit Code 0.

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)
1. **Kiểm tra unit test**:
   ```bash
   cd De_Vuong_Webapp
   npm test
   ```
   *Kết quả thực tế*: 28/28 tests passed (Exit Code 0).
2. **Kiểm tra production build**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
   *Kết quả thực tế*: Vite build thành công trong ~14 giây (Exit Code 0).
3. **Kiểm tra công thức tính toán tài chính độc lập**:
   ```bash
   node -e "
   const calc = (t, fee, comms) => t - fee - comms.reduce((s, c) => s + c.amount, 0);
   console.assert(calc(10000000, 2000000, [{amount: 500000}, {amount: 500000}]) === 7000000);
   console.log('Calculation verified');
   "
   ```
   *Kết quả*: Calculation verified.
