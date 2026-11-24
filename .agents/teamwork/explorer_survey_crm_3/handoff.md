# BÁO CÁO KHẢO SÁT HỆ THỐNG: MÔ HÌNH DỮ LIỆU, HỢP ĐỒNG CHUYỂN GIAO GIAI ĐOẠN 1 <-> GIAI ĐOẠN 2 & KIỂM TOÁN AGENTS.MD

**Đơn vị thực hiện**: Teamwork Explorer (Survey CRM 3)  
**Thời điểm khảo sát**: 2026-11-19T09:20:00Z  
**Phạm vi khảo sát**: 
1. `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` (Mục 3 Tuyển sinh / Khởi tạo - Giai đoạn 1)
2. `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` (Chi tiết Học viên / Tab Học phí & Giao dịch - Giai đoạn 2)
3. `De_Vuong_Webapp/src/components/AdminDashboard.tsx` (Tab learners & điều hướng)
4. `De_Vuong_Webapp/src/services/paymentService.ts`, `classService.ts`, `userService.ts`, `ledgerService.ts`
5. Trạng thái Build (`npm run build`) và TypeScript (`npx tsc --noEmit`)

---

## 1. Observation (Dữ liệu quan sát thực tế)

### 1.1. Hiện trạng Mục 3 trong Cổng Tuyển sinh (`CRMAdmissionsModule.tsx`)
- **Vị trí code**: Dòng 5696 - 6144 (`CRMAdmissionsModule.tsx`).
- **Thành phần hiện hữu**:
  - Dòng 5730-5771: Nhập học phí dự kiến (`formTuition`), phí nhận lớp (`formClassIntakeFee`), ngày hạch toán phí (`formClassIntakeFeeDate`).
  - Dòng 5773-5826: Chọn nguồn chi trả phí nhận lớp (`formIntakeFeePaymentSource`: `'cash'` vs `'surplus_offset'`).
  - Dòng 5828-5861: Chọn kết quả lớp học (`formClassOutcome`: `'start'` vs `'non_start'`).
  - Dòng 5882-5976: Khối tính toán Corporate VAT Invoice Calculator luôn hiển thị chiếm diện tích lớn khi `isInvoiceDemandActive` là true. Chưa được thu gọn thành toggle checkbox `[ ] Xuất hóa đơn VAT Doanh nghiệp` với trạng thái mặc định ẩn.
  - Dòng 5978-6063: Danh sách động phí chênh lệch hàng tháng (`formMonthlyCommissions`: Tháng 1, Tháng 2, Tháng 3... và nút `+ Thêm tháng tiếp theo`). Các khoản thu định kỳ tháng 2, tháng 3 đang làm phân mảnh và rối rắm giao diện Tuyển sinh (Giai đoạn 1).
  - Dòng 6065-6142: Dải ribbon tổng hợp dòng tiền gồm 4 cột, trừ tổng hoa hồng của tất cả các tháng.
  - Chưa có bộ chọn hình thức kế hoạch học phí (`paymentPlan`: Đóng trọn gói 1 lần, chia theo đợt milestone, hoặc thu theo tháng).
  - Chưa có ô ghi nhận học phí đợt đầu (Ghi có Đợt 1).
  - Thao tác quyết định chuyển giao hiện tại chỉ là nút chọn radio outcome nhỏ, lưu chung bằng nút modal footer `Lưu thay đổi`, chưa có nút hành động dứt khoát: `[★ XẾP VÀO LỚP HỌC (START)]` và `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`.

### 1.2. Đứt gãy đồng bộ dữ liệu giữa Stage 1 và Stage 2
- **Lưu trữ dữ liệu trong `CRMAdmissionsModule.tsx`**:
  - Dòng 3958-3959: Ghi dữ liệu vào Firestore `customer_profiles/{id}` và `crm_records/{id}`.
  - Dòng 4005-4026: Ghi hồ sơ học viên vào collection `users/{uid}` (`UserProfile`).
  - Dòng 4032-4054: Ghi thông tin lớp vào collection `classes/{classId}` (`Class`).
  - Dòng 3693-3700: Ghi bút toán cấn trừ ví vào `ledger_transactions`.
  - **TUYỆT ĐỐI KHÔNG GHI VÀO `payments/{studentId}`**: Trong toàn bộ 8.220 dòng của `CRMAdmissionsModule.tsx`, không có bất kỳ lệnh gọi nào tới `paymentService` hay collection `payments`.
- **Cơ chế đọc dữ liệu trong `StudentDetail.tsx`**:
  - Dòng 414-419: `paymentService.subscribeToPayment(id, (paymentData) => setPayment(paymentData))` chỉ nghe duy nhất collection `payments/{studentId}`.
  - Không đọc từ `customer_profiles` hay `crm_records`.
  - **Hệ quả**: Khi mở học viên vừa chuyển giao từ Tuyển sinh, `payment` là `null`. 4 thẻ chỉ số tài chính hiển thị `0đ` (Tổng học phí: 0đ, Đã đóng: 0đ, Còn nợ: 0đ).
  - Khi thêm giao dịch qua `LeadPaymentModal.tsx` từ `StudentDetail.tsx` (dòng 3455-3487): Do `currentPayment.totalAmount` ban đầu bằng 0, khi nhập số tiền thu đợt 1 (ví dụ 900.000đ), `calculateSummary` tính ra `status: 'overpaid'` và `debt: 0` do thiếu bút toán ghi nhận công nợ gốc (`debt_recognition`).

### 1.3. Khảo sát tab Học phí & Giao dịch trong `StudentDetail.tsx`
- **Vị trí code**: Dòng 2866 - 3125 (`StudentDetail.tsx`).
- **Thanh tiêu đề công nợ**:
  - Dòng 2913: `<h4>Sổ công nợ & Giao dịch</h4>` hiện KHÔNG hiển thị mã đối chiếu lớp học (`LG4729` / `CLS-XXXXXX`).
  - Nút thao tác hiện tại chỉ có: `[Thu học phí (VietQR)]` và `[Thêm giao dịch]`.
  - Chưa có nút nhanh: `[+ Thu học phí đợt tiếp theo]` (đối với đợt 2, đợt 3...) và `[+ Nộp phí chênh lệch trung tâm]` (tự động ghi nợ vào `ledger_transactions`).

### 1.4. Kiểm toán tuân thủ AGENTS.md
- **Vi phạm tại `StudentDetail.tsx`**:
  - **Quy tắc 1 (Action Menu 3 chấm & Tiêu đề rỗng)**:
    - Dòng 2956: Thẻ tiêu đề có chữ: `<th className="... text-right">Thao tác</th>`. AGENTS.md Quy tắc 1 yêu cầu thẻ `<th>` của cột Action Menu **bắt buộc để trống**, tuyệt đối không có chữ 'Thao tác' hay 'Hành động'.
    - Dòng 3034-3042: Cột thao tác phơi bày nút icon rác trần trụi `<button ...><Trash size={16} /></button>`. AGENTS.md Quy tắc 1 cấm tuyệt đối nút icon trần trụi, bắt buộc dùng Action Menu 3 chấm `MoreVertical`.
  - **Quy tắc 4 (Chống lạm dụng Pill / Candy Box)**:
    - Dòng 2868-2907: 4 thẻ thống kê tài chính bọc trong khung nổi bo góc tròn dày `rounded-3xl` với nhiều màu sắc (`bg-blue-50 border-blue-100`, `bg-emerald-50`, `bg-red-50`).
    - Dòng 2973-2986: Cột Loại giao dịch dùng pill badge màu mè (`bg-blue-100`, `bg-emerald-100`, `bg-purple-100`, `bg-indigo-100`, `bg-red-100`). AGENTS.md yêu cầu văn bản thường tinh gọn đi kèm chấm tròn tinh tế.
    - Dòng 2911: Bảng dữ liệu bị bọc trong card trôi nổi `rounded-3xl border border-slate-100 shadow-sm overflow-hidden` bên trong padding `p-6` thay vì tệp liền Full-Bleed.
- **Tuân thủ tại `AdminDashboard.tsx` (Tab Learners)**:
  - Bảng học viên đã tuân thủ tốt các quy tắc: Thẻ `<th>` thao tác rỗng, menu 3 chấm qua Portal, ID dùng font mono không bọc badge xám (`font-mono text-xs font-semibold text-slate-700`), hover row `shadow-[inset_4px_0_0_0_#10b981]`, thanh toolbar 1 hàng cố định.

### 1.5. Kiểm tra Build & Lỗi TypeScript
- **Lệnh thực thi 1**: `npm run build` bên trong thư mục `De_Vuong_Webapp/`.
  - **Kết quả**: **THÀNH CÔNG** (Mã thoát 0, hoàn tất trong 10.12s, sinh bundle `dist/`).
- **Lệnh thực thi 2**: `npx tsc --noEmit` bên trong thư mục `De_Vuong_Webapp/`.
  - **Kết quả**: Báo lỗi TypeScript hiện hữu trong dự án. Riêng trong phạm vi khảo sát `StudentDetail.tsx`, xuất hiện 3 lỗi kiểu dữ liệu:
    1. `src/components/admin/StudentDetail.tsx(3447,51): error TS2339: Property 'displayName' does not exist on type 'UserProfile'.`
    2. `src/components/admin/StudentDetail.tsx(3448,45): error TS2339: Property 'phoneNumber' does not exist on type 'UserProfile'.`
    3. `src/components/admin/StudentDetail.tsx(3453,50): error TS2339: Property 'enrolledClasses' does not exist on type 'UserProfile'.`
  - `CRMAdmissionsModule.tsx`: **0 lỗi compile**.

---

## 2. Logic Chain (Chuỗi suy luận logic từ dữ liệu quan sát)

1. **Từ Quan sát 1.1 & 1.2**: 
   - `CRMAdmissionsModule.tsx` hiện chỉ lưu trữ cam kết tài chính vào `customer_profiles` và `crm_records`. Khi thực hiện phân bổ lớp (Assign Class) hoặc cấp học viên, hệ thống không khởi tạo bản ghi trong collection `payments/{studentId}`.
   - Do đó, khi `StudentDetail.tsx` khởi chạy và đăng ký lắng nghe collection `payments/{studentId}` (Quan sát 1.2), nó nhận về `null`. Khi người dùng thực hiện thanh toán đợt tiếp theo, hệ thống coi `totalAmount = 0`, gây ra sai lệch công nợ nghiêm trọng (tự động gán nhãn `overpaid` - Đóng dư).

2. **Từ Quan sát 1.1 & Yêu cầu R1**:
   - Giao diện Mục 3 hiện chứa danh sách nhiều tháng (`formMonthlyCommissions`), gây quá tải thông tin cho giai đoạn Tuyển sinh. Bản chất Giai đoạn 1 là **Khởi tạo & Thu đợt đầu** (Onboarding & Initial Intake).
   - Vì vậy, việc tinh gọn Mục 3 thành một Thẻ Sổ Cái Phẳng Duy Nhất (Single Flat Ledger Card) tập trung vào 4 đại lượng cốt lõi: (1) Tổng học phí cam kết, (2) Hình thức thanh toán (`paymentPlan`), (3) Phí nhận lớp ban đầu & Nguồn chi trả (`cash` vs `surplus_offset`), (4) Học phí thu đợt 1.
   - Nút hành động dứt khoát `[★ XẾP VÀO LỚP HỌC (START)]` sẽ là điểm neo kích hoạt Hợp đồng chuyển giao (Handover Contract) từ Giai đoạn 1 sang Giai đoạn 2.

3. **Từ Quan sát 1.2 & 1.3**:
   - Khi kích hoạt `[★ XẾP VÀO LỚP HỌC (START)]`:
     - Phải tự động ghi nhận một giao dịch `debt_recognition` với số tiền bằng `tuitionTotal` vào `payments/{studentId}`.
     - Nếu có thu học phí đợt đầu (`initialCollectedAmount > 0`), tự động ghi nhận giao dịch `deposit` hoặc `partial_payment` cho Đợt 1.
     - Ghi nhận `totalAmount`, `paidAmount = initialCollectedAmount`, `debt = tuitionTotal - initialCollectedAmount`.
     - Lưu trữ mã đối chiếu lớp học (`classCode` / `reconciliationCode`) vào hồ sơ học sinh và lớp học.
   - Nhờ vậy, khi màn hình `StudentDetail.tsx` mở ra, nó kế thừa chính xác 100% dữ liệu từ Tuyển sinh: Tổng học phí, Đã đóng đợt 1, Dư nợ còn lại, và hiển thị rõ mã đối chiếu lớp trên header công nợ.

4. **Từ Quan sát 1.3**:
   - Để hỗ trợ vận hành công nợ định kỳ tại Giai đoạn 2 mà không làm rối Tuyển sinh, các tác vụ thu đợt 2, đợt 3... và nộp hoa hồng/chênh lệch trung tâm hàng tháng phải được xử lý ngay tại `StudentDetail.tsx`:
     - Nút `[+ Thu học phí đợt tiếp theo]`: Tăng `paidAmount`, giảm `debt` trong `payments/{studentId}`.
     - Nút `[+ Nộp phí chênh lệch trung tâm]`: Tự động tạo bút toán chiết khấu/chi phí trong `ledger_transactions` với `debit: amount`, `refCode: classCode`.

5. **Từ Quan sát 1.4**:
   - `StudentDetail.tsx` hiện có nhiều vi phạm AGENTS.md (cột Thao tác có chữ, phơi bày icon Trash trần trụi, dùng badge pill màu sắc quá mức, bo góc `rounded-3xl` quá khổ). Bắt buộc phải chuẩn hóa theo benchmark `DocumentManagementModule.tsx` và Quy tắc 1, 4, 8, 14.

6. **Từ Quan sát 1.5**:
   - 3 lỗi TypeScript trong `StudentDetail.tsx` (dòng 3447-3453) bắt nguồn từ việc truy xuất thuộc tính không tồn tại trên `UserProfile` (`displayName`, `phoneNumber`, `enrolledClasses`). Cần sửa thành `student.fullName`, `student.phone`, và `student.classIds` để bảo đảm chuẩn kiểu tĩnh sạch 100%.

---

## 3. Caveats (Các điểm giới hạn & Giả định)

1. **Giả định về định danh lớp học**: Một số học viên 1-1 có thể chưa có mã lớp ngắn hạn (như `LG4729`), hệ thống sẽ dự phòng bằng mã `CLS-XXXXXXXX` hoặc mã hồ sơ tuyển sinh `LEA-XXXXXXXX`.
2. **Quy tắc phân bổ Quỹ Phí Dư**: Khi nguồn thanh toán là `surplus_offset`, số dư Quỹ Phí Dư được tính động từ các bút toán có `surplus` trong `ledger_transactions`. Nếu quỹ không đủ cấn trừ, hệ thống phải cảnh báo người dùng.
3. **Phạm vi mã nguồn**: Báo cáo này là điều tra chỉ đọc (Read-only), không chỉnh sửa mã nguồn cho đến khi có kế hoạch thực thi chính thức.

---

## 4. Conclusion (Đặc tả Hợp đồng Chuyển giao & Đề xuất Kế hoạch Thực thi)

### 4.1. Bản đồ cấu trúc dữ liệu Hợp đồng Chuyển giao (Handover Contract)

| Trường dữ liệu | Kiểu dữ liệu | Vai trò tại Stage 1 (Tuyển sinh) | Vai trò tại Stage 2 (Vận hành / Chi tiết HV) |
|---|---|---|---|
| `studentId` / `uid` | `string` | Neo giữ định danh LRN (`users/{uid}`) | Khóa chính của màn hình chi tiết & `payments` |
| `reconciliationCode` | `string` | Mã đối chiếu tuyển sinh (`LEA-XXXXXXXX`) | Hiển thị đối soát trên header chi tiết học viên |
| `classId` / `classCode` | `string` | Mã lớp học được chỉ định / tạo mới (`LG4729`) | Hiển thị mã lớp trên Header Sổ công nợ |
| `tuitionTotal` | `number` | Tổng học phí cam kết tại Mục 3 | Ghi nhận công nợ gốc (`totalAmount`, `debt_recognition`) |
| `paymentPlan` | `'full' \| 'milestones' \| 'monthly'` | Hình thức thanh toán dự kiến | Xác định lộ trình các đợt thu tiếp theo |
| `initialCollectedAmount` | `number` | Số tiền thu đợt đầu (Đợt 1) | Ghi nhận tiền đã đóng (`paidAmount`, `deposit`/`partial`) |
| `tuitionDebt` | `number` | Tính toán tức thời: `tuitionTotal - initialCollectedAmount` | Dư nợ ban đầu cần thu tại Stage 2 (`debt`) |
| `classIntakeFee` | `number` | Phí nhận lớp ban đầu | Chi phí trung gian / hoa hồng khởi tạo |
| `intakeFeePaymentSource` | `'cash' \| 'surplus_offset'` | Chọn nguồn: Tiền mặt vs Cấn trừ Quỹ Phí Dư | Ghi bút toán `class_accept_wallet` vào Sổ cái chung |
| `corporateVat` | `object` | Toggle ẩn `[ ] Xuất hóa đơn VAT Doanh nghiệp` | Thông tin xuất hóa đơn GTGT nếu có nhu cầu |

### 4.2. Kiến trúc tương tác Persistence Layer
```
[Giai đoạn 1: CRM Admissions (Mục 3)]
  │
  ├── Bấm [★ XẾP VÀO LỚP HỌC (START)]
  │     ├── 1. users/{uid} ────────────► Tạo/cập nhật UserProfile (role: student, classIds: [classId])
  │     ├── 2. classes/{classId} ──────► Tạo/cập nhật Class (studentIds: [uid], classCode: 'LG4729')
  │     ├── 3. payments/{uid} ─────────► KHỞI TẠO ĐỒNG BỘ:
  │     │                                  - debt_recognition (tuitionTotal)
  │     │                                  - deposit / partial_payment (initialCollectedAmount)
  │     │                                  - totalAmount, paidAmount, debt
  │     ├── 4. ledger_transactions ────► Ghi nợ class_accept_wallet (nếu cấn trừ quỹ phí dư)
  │     └── 5. crm_records/{leadId} ───► status: 'Đã xếp lớp', classOutcome: 'start'
  │
  └── Bấm [✖ NON-START]
        ├── 1. ledger_transactions ────► Tự động tạo bút toán hoàn Quỹ Phí Dư
        └── 2. crm_records/{leadId} ───► status: 'Đã hủy', classOutcome: 'non_start'
  │
  ▼
[Giai đoạn 2: StudentDetail.tsx & AdminDashboard Learners]
  │
  ├── Tab "Học phí & Giao dịch"
  │     ├── Đọc payments/{uid} ────────► Kế thừa Tổng học phí, Đã đóng, Dư nợ
  │     ├── Header công nợ ────────────► Hiển thị mã đối chiếu lớp (VD: LG4729)
  │     ├── [+ Thu đợt tiếp theo] ─────► Ghi nhận giao dịch vào payments/{uid}, giảm debt
  │     └── [+ Nộp phí chênh lệch] ────► Ghi nhận chi phí vào ledger_transactions (debit: 200.000đ)
  │
  └── AdminDashboard (Tab Learners)
        └── Cột "Dư nợ" ───────────────► Hiển thị chính xác debt từ allPayments[uid]
```

---

## 5. Verification Method (Phương pháp xác minh độc lập)

1. **Kiểm tra TypeScript**:
   ```powershell
   cd 'c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp'
   npx tsc --noEmit
   ```
   *Điều kiện hợp lệ*: Không có lỗi mới phát sinh từ `CRMAdmissionsModule.tsx` và `StudentDetail.tsx`. Các lỗi cũ về `displayName`, `phoneNumber`, `enrolledClasses` được khắc phục triệt để.

2. **Kiểm tra Build Vite**:
   ```powershell
   cd 'c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp'
   npm run build
   ```
   *Điều kiện hợp lệ*: Mã thoát `0`, không có lỗi rollup hay cảnh báo vỡ bundle.

3. **Kiểm tra giao diện & Luồng nghiệp vụ (UI / UX Testing)**:
   - Mở màn hình Tuyển sinh (`tab=leads`), mở chi tiết một lead. Kiểm tra Mục 3 đã tinh gọn thành thẻ sổ cái phẳng, toggle VAT ẩn, các khoản thu tháng 2, tháng 3 không xuất hiện.
   - Nhập mức học phí 3.600.000đ, thu đợt 1 là 900.000đ, bấm `[★ XẾP VÀO LỚP HỌC (START)]`.
   - Chuyển sang `tab=learners`, mở Chi tiết học viên vừa tạo, kiểm tra tab "Học phí & Giao dịch":
     - Mã lớp đối chiếu hiển thị rõ trên thanh tiêu đề công nợ.
     - Tổng học phí hiển thị đúng 3.600.000đ, Đã đóng hiển thị 900.000đ, Còn nợ hiển thị 2.700.000đ.
     - Kiểm tra sự hiện diện và hoạt động của 2 nút nhanh: `[+ Thu học phí đợt tiếp theo]` và `[+ Nộp phí chênh lệch trung tâm]`.
     - Kiểm tra bảng giao dịch tuân thủ AGENTS.md: không có chữ 'Thao tác' trên `<th>`, thao tác qua menu 3 chấm, không dùng pill badge sặc sỡ.
