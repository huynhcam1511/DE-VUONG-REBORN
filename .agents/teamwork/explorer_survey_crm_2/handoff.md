# Báo cáo Khảo sát Chi tiết: `StudentDetail.tsx` & Hệ thống Sổ công nợ / Giao dịch (Giai đoạn 2)

**Người thực hiện**: Explorer Survey CRM 2 (`teamwork_explorer`)  
**Workspace**: `De_Vuong_Webapp/`  
**Mục tiêu**: Khảo sát màn hình `StudentDetail.tsx` (đặc biệt tab "Học phí & Giao dịch" / Payment & Ledger), đối chiếu mã lớp (`LG4729`), kế thừa dữ liệu tuyển sinh Giai đoạn 1, tích hợp các nút thao tác nhanh `[+ Thu học phí đợt tiếp theo]` & `[+ Nộp phí chênh lệch trung tâm]`, tuân thủ chuẩn `AGENTS.md`.

---

## 1. Observation (Quan sát thực tế)

### 1.1 Vị trí và Cấu trúc tab "Học phí & Giao dịch" trong `StudentDetail.tsx`
- **File**: `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`
- **Quản lý state Tab** (Dòng 244):
  ```tsx
  const [activeTab, setActiveTab] = useState<"info" | "learning" | "payment">("info");
  ```
- **Thanh chuyển Tab chuẩn Underline** (Dòng 1637–1646):
  ```tsx
  <button
    type="button"
    onClick={() => setActiveTab("payment")}
    className={`h-full border-b-2 flex items-center text-xs font-semibold transition-all ${
      activeTab === "payment"
        ? "border-emerald-600 text-emerald-700"
        : "border-transparent text-slate-500 hover:text-slate-800"
    }`}
  >
    Học phí & Giao dịch
  </button>
  ```
- **Nguồn dữ liệu công nợ** (Dòng 289, 414–420):
  ```tsx
  const [payment, setPayment] = useState<StudentPayment | null>(null);
  ...
  const unsubscribePayment = paymentService.subscribeToPayment(
    id,
    (paymentData) => {
      setPayment(paymentData);
    },
  );
  ```
  Dữ liệu lắng nghe theo thời gian thực (realtime) từ Firestore collection `payments/{studentId}`.
- **Khối Card thống kê 4 chỉ số công nợ** (Dòng 2868–2907):
  * Tổng học phí: `(payment?.totalAmount || 0).toLocaleString()}đ`
  * Tiền cọc: `(payment?.deposit || 0).toLocaleString()}đ`
  * Đã đóng: `(payment?.paidAmount || 0).toLocaleString()}đ`
  * Còn nợ: `(payment?.debt || 0).toLocaleString()}đ`
- **Bảng lịch sử giao dịch** (Dòng 2938–3058):
  * Lặp qua mảng `payment?.transactions`.
  * Hiển thị Ngày, Loại, Số tiền, Phương thức, Ghi chú, Thao tác.
  * Hiện tại nút thêm giao dịch thủ công mở modal (Dòng 3170–3270) và nút VietQR mở `LeadPaymentModal` (Dòng 3441–3488).

### 1.2 Nhận diện Mã đối chiếu Lớp học (`LG4729` / `CLS-xxxx`)
- **Nguồn gốc mã `LG4729`**:
  * Qua phân tích lịch sử Excel và sổ cái chung (`ledger_transactions`), mã `LG4729` là mã lớp học thực tế trong hồ sơ đào tạo:
    * Khóa học 3 tháng, học phí 2.200.000 ₫/tháng (Tổng: 6.600.000 ₫).
    * Phí nhận lớp ban đầu: 500.000 ₫ (Ghi nợ chi phí ban đầu).
    * Phí chênh lệch trung tâm hàng tháng: 200.000 ₫/tháng (`2.200.000 - 2.000.000 = 200.000 ₫` nộp lại cho trung tâm/đối tác ở Tháng 2 và Tháng 3).
- **Hiện trạng trong `StudentDetail.tsx`**:
  * Danh sách lớp học được nạp vào state `classes` qua `classService.getAllClasses()` (Dòng 219, 337, 397).
  * Lớp học mà học viên tham gia được lọc tại Dòng 1916:
    ```tsx
    const enrolledClasses = classes.filter((c) => c?.studentIds?.includes(id || "") && !c.mergedInto && c.status !== "inactive");
    ```
  * Mỗi đối tượng `Class` (`src/types/admin.ts`, Dòng 326–375) chứa:
    * `classCode`: Mã lớp chính (e.g. `LG4729`, `CLS-01`, `CLS-84920194`).
    * `originLeadCode`: Mã lead tuyển sinh ban đầu (e.g. `LEA-4729`).
    * `legacyClassCodes`: Danh sách mã lớp cũ tương thích ngược.
  * Đối tượng học viên `UserProfile` (`src/services/userService.ts`, Dòng 10–47) chứa:
    * `student_code_reference`: Mã đối chiếu nhập tay hoặc kế thừa.
    * `reconciliationCode`: Mã đối chiếu từ CRM Tuyển sinh.
  * **Khoảng trống hiện tại**: Trên thanh tiêu đề của tab "Học phí & Giao dịch" (Dòng 2913: `<h4>Sổ công nợ & Giao dịch</h4>`), **hoàn toàn chưa hiển thị mã đối chiếu lớp học nào**.

### 1.3 Cơ chế Kế thừa & Bàn giao Dữ liệu từ Tuyển sinh (Giai đoạn 1) sang Hồ sơ Học viên (Giai đoạn 2)
- **Dữ liệu tại Tuyển sinh (Giai đoạn 1)**:
  * Trong `CRMAdmissionsModule.tsx`, mỗi bản ghi tuyển sinh (`CRMRecord`, Dòng 796–860) lưu trữ:
    * `tuition`: Tổng học phí cam kết (ví dụ: `3.600.000` hoặc `6.600.000`).
    * `paidAmount`: Số tiền đã đóng ở đợt 1 / đặt cọc (ví dụ: `900.000` hoặc `2.200.000`).
    * `classIntakeFee`: Phí nhận lớp ban đầu (ví dụ: `500.000`).
    * `intakeFeePaymentSource`: Nguồn thanh toán phí nhận lớp (`cash` vs `surplus_offset`).
    * `classOutcome`: Kết quả lớp (`start` vs `non_start`).
    * `classCode`: Mã lớp (ví dụ: `LG4729`).
    * `studentId`: ID học viên được liên kết (`LRN-xxxxxxxx` hoặc `student_...`).
- **Thực trạng chuyển giao**:
  * Khi bấm nút `[★ XẾP VÀO LỚP HỌC (START)]` (Dòng 4295, 4735 trong `CRMAdmissionsModule.tsx`):
    * Lớp học được tạo/gán (`classService.saveClass`), gán `studentIds: [targetStudent.uid]`.
    * Hồ sơ học viên được tạo/cập nhật (`userService.createUserProfile` / `updateUserProfile`) với `classIds: [newClassId]`.
    * **Tuy nhiên**, bảng `payments/{studentId}` chưa được tự động tạo giao dịch `debt_recognition` (Tổng học phí) và `partial_payment` (Đã đóng đợt 1)!
  * Hậu quả: Khi admin mở `StudentDetail.tsx`, nếu bảng `payments/{studentId}` rỗng, giao diện hiển thị Tổng học phí 0đ, Đã đóng 0đ, Còn nợ 0đ, làm đứt gãy dòng dữ liệu bàn giao từ Tuyển sinh.

### 1.4 Schema Sổ cái và Dịch vụ Thanh toán hiện tại
- **Schema `StudentPayment`** (`src/services/paymentService.ts`, Dòng 59–70):
  ```ts
  export interface StudentPayment {
    studentId: string;
    totalAmount: number; // Tổng học phí
    deposit: number;     // Tiền cọc
    paidAmount: number;  // Tổng đã đóng
    debt: number;        // Dư nợ = Math.max(0, totalAmount - paidAmount)
    credit: number;      // Tiền thừa / Credit
    status: 'unpaid' | 'partial' | 'fully_paid' | 'overpaid';
    internalNotes: string;
    transactions: Transaction[];
    updatedAt: any;
  }
  ```
- **Schema `Transaction`** (`src/services/paymentService.ts`, Dòng 38–57):
  * `type`: `'debt_recognition'` | `'deposit'` | `'partial_payment'` | `'full_payment'` | `'refund'` | `'credit'` | `'tip'`
  * Chú ý quan trọng: Hàm `calculateSummary` (Dòng 93–132) tính `totalAmount` bằng cách cộng dồn các giao dịch có `type === 'debt_recognition'`. Còn `paidAmount` cộng dồn từ `deposit`, `partial_payment`, `full_payment`.
- **Schema Sổ cái chung `LedgerTransaction`** (`src/services/ledgerService.ts`, Dòng 26–48):
  * Lưu vào Firestore collection `ledger_transactions`.
  * Thu học phí: `credit > 0`, `debit = 0`, `type: 'payment'`, `refCode: classCode` (e.g. `LG4729`).
  * Chi trả phí chênh lệch trung tâm: `debit > 0`, `credit = 0`, `type: 'class_accept'` hoặc `'expense'`, `refCode: classCode` (e.g. `LG4729`).

### 1.5 Điểm vi phạm AGENTS.md hiện tại trên `StudentDetail.tsx`
1. **Tiêu đề cột Action Menu**: Dòng 2956 có chữ `<th ...>Thao tác</th>`.  
   $\to$ Vi phạm **Quy tắc 1** của `AGENTS.md`: *Thẻ `<th>` của cột Action Menu BẮT BUỘC để trống, TUYỆT ĐỐI KHÔNG có chữ 'Thao tác' hay 'Hành động'*.
2. **Nút thao tác trần trụi**: Dòng 3034–3042 phơi bày nút icon rác `<Trash size={16} />` trần trụi ở cuối mỗi dòng.  
   $\to$ Vi phạm **Quy tắc 1** của `AGENTS.md`: *Cơ chế thao tác DUY NHẤT: Mọi hành động BẮT BUỘC chỉ được thực hiện thông qua Action Menu 3 chấm (`MoreVertical`). Tuyệt đối không phơi bày các nút icon trần trụi (`Pencil`, `Trash2`) ở cuối dòng*.
3. **Lạm dụng Pill / Badge sặc sỡ**: Dòng 2974–3001 bọc Loại giao dịch vào các khung pill nền màu sặc sỡ (`bg-blue-100`, `bg-emerald-100`, `bg-purple-100`...).  
   $\to$ Vi phạm **Quy tắc 4** của `AGENTS.md`: *Tuyệt đối KHÔNG bọc mọi trường vào badge/pill có nền màu hay viền sặc sỡ... Chỉ hiển thị dạng chấm tròn tinh tế (`•`) kèm chữ thanh lịch (`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700`, chấm tròn `w-1.5 h-1.5 rounded-full bg-emerald-500`)*.
4. **Hiệu ứng dòng hover**: Dòng 2967 dùng `hover:bg-slate-50/50`.  
   $\to$ Cần chuẩn hóa theo **Quy tắc 4**: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.

---

## 2. Logic Chain (Chuỗi lập luận kỹ thuật)

1. **Từ Yêu cầu R2 đến Vị trí Hiển thị Mã Lớp**:
   - Yêu cầu R2 nêu rõ: *"Hiển thị rõ mã đối chiếu lớp học (ví dụ: `LG4729`) trên thanh tiêu đề công nợ."*
   - Trong `StudentDetail.tsx`, học viên liên kết với lớp qua `student.classIds` hoặc `class.studentIds`.
   - Lớp học được tìm thấy sẽ có `classCode` (ví dụ: `LG4729` hoặc `CLS-01`) hoặc fallback là `student.student_code_reference` / `student.reconciliationCode`.
   - Vị trí lý tưởng nhất để hiển thị mã lớp là ngay trên thanh Header của khối *"Sổ công nợ & Giao dịch"* (Dòng 2913), cạnh tiêu đề với font mono tinh tế: `<span className="font-mono text-xs font-semibold text-slate-700">LG4729</span>` (không bọc pill thô, tuân thủ Quy tắc 3 & 4 của `AGENTS.md`).

2. **Từ Kế thừa Tuyển sinh (GĐ 1) đến Khởi tạo Sổ công nợ Học viên (GĐ 2)**:
   - Khi tuyển sinh thành công, lead có `tuition` (ví dụ: 3.600.000 ₫) và `paidAmount` đợt 1 (ví dụ: 900.000 ₫).
   - Khi bàn giao sang Giai đoạn 2 (Hồ sơ học viên), sổ công nợ `payments/{studentId}` cần có:
     * Giao dịch `debt_recognition`: `amount = 3.600.000 ₫`, `note = 'Ghi nhận học phí cam kết (GĐ 1 Tuyển sinh)'`, `refCode = classCode`.
     * Giao dịch `partial_payment`: `amount = 900.000 ₫`, `note = 'Thu học phí đợt 1 (GĐ 1 Tuyển sinh)'`, `refCode = classCode`.
   - Nhờ đó, hàm `paymentService.calculateSummary` sẽ tính ra chính xác:
     * Tổng học phí: `3.600.000 ₫`
     * Đã thanh toán: `900.000 ₫`
     * Còn nợ: `2.700.000 ₫`
   - Trong `StudentDetail.tsx`, khi nạp dữ liệu: Nếu `payment` chưa tồn tại hoặc rỗng, component sẽ tự động tra cứu lead liên kết từ `crm_records` và cung cấp nút *"Đồng bộ dữ liệu từ Tuyển sinh"* hoặc tự động thiết lập ban đầu (auto-seed) để đảm bảo không bị trắng dữ liệu.

3. **Từ Nhu cầu Thu đợt 2, đợt 3 đến Nút thao tác nhanh `[+ Thu học phí đợt tiếp theo]`**:
   - Khi học viên đến hạn đóng đợt 2, đợt 3 (ví dụ 900.000 ₫ theo milestone hoặc 2.200.000 ₫/tháng theo lớp `LG4729`):
   - Thay vì phải bấm modal thêm giao dịch phức tạp nhiều bước, admin bấm trực tiếp nút `[+ Thu học phí đợt tiếp theo]`:
     * Modal mở ra với các gợi ý thông minh: Đợt 900.000 ₫, Đợt theo tháng 2.200.000 ₫, hoặc Đóng toàn bộ nợ còn lại (`payment.debt`).
     * Khi bấm xác nhận:
       1. Thêm giao dịch `partial_payment` (hoặc `full_payment` nếu trả hết) vào `payment.transactions` và lưu vào Firestore `payments/{studentId}` qua `paymentService.savePayment`.
       2. Tự động ghi có (`credit: amount`) vào Sổ cái chung `ledger_transactions` qua `ledgerService.addTransaction`:
          `type: 'payment'`, `refCode: classCode`, `description: 'Thu học phí đợt tiếp theo - Học viên ... (Mã lớp: LG4729)'`.
       3. Tự động cập nhật số dư còn nợ ngay lập tức trên UI.

4. **Từ Mô hình Đối tác Trung tâm đến Nút thao tác nhanh `[+ Nộp phí chênh lệch trung tâm]`**:
   - Đối với các lớp nhận từ trung tâm đối tác như `LG4729`, học viên nộp 2.200.000 ₫/tháng cho giáo viên, nhưng giáo viên chỉ nhận lương 2.000.000 ₫, còn 200.000 ₫ phải nộp lại hàng tháng cho trung tâm đối tác.
   - Khi admin/giáo viên nộp 200.000 ₫ này cho trung tâm:
     * Đây là khoản **Chi phí (Debit)** phát sinh định kỳ của lớp học.
     * Cần tự động hạch toán vào Sổ cái chung `ledger_transactions`:
       `type: 'class_accept'`, `debit: 200000`, `credit: 0`, `refCode: classCode` (`LG4729`), `description: 'Nộp phí chênh lệch trung tâm - Lớp LG4729 (Tháng ...)'`.
     * Đồng thời, trong hồ sơ học viên (`StudentDetail.tsx`), ghi nhận một dòng nhật ký vào `payment.internalNotes` hoặc giao dịch ghi chú để admin theo dõi được lịch sử các lần đã nộp phí cho trung tâm mà không làm sai lệch công nợ học phí của học viên.

---

## 3. Caveats (Các điểm cần lưu ý)

1. **Tính độc lập giữa Công nợ Học viên và Sổ cái Doanh nghiệp**:
   - Công nợ học viên (`payments/{studentId}`) đo lường số tiền **học viên nợ trung tâm/giáo viên**.
   - Khoản "Phí chênh lệch trung tâm" (200.000 ₫) là số tiền **giáo viên nộp lại cho đối tác** (chi phí của lớp học). Vì vậy, khoản này phải ghi nợ (`debit: 200.000 ₫`) trên Sổ cái chung `ledger_transactions`, tuyệt đối không cộng thêm vào nợ học phí của học viên (không được coi là học viên nợ thêm 200k).
2. **Xử lý Học viên tham gia nhiều lớp**:
   - Một số học viên có thể học 2 lớp khác nhau. Khi hiển thị mã lớp trên header công nợ, cần ưu tiên lớp đang hoạt động (`status !== 'inactive'`), hiển thị lớp chính và cho phép chọn lớp đối chiếu nếu học viên có nhiều hơn 1 lớp.
3. **Khả năng tương thích ngược (Backward Compatibility)**:
   - Các học viên cũ đã tạo từ trước có thể chưa có `classCode` định dạng chuẩn. Bộ phân giải mã lớp cần có fallback chuỗi: `classCode` $\to$ `originLeadCode` $\to$ `student_code_reference` $\to$ `reconciliationCode` $\to$ `CLS-{id}`.

---

## 4. Conclusion & Kiến trúc đề xuất cho Implementation

### 4.1 Bố cục Header Công nợ & Nhận diện Mã lớp
Tại Dòng 2911 của `StudentDetail.tsx`:
```tsx
{/* Header Sổ công nợ có hiển thị Mã lớp đối chiếu */}
<div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-2">
      <History size={18} className="text-emerald-600" />
      <h4 className="font-bold text-slate-900 text-sm">Sổ công nợ & Giao dịch</h4>
    </div>
    {resolvedClassCode && (
      <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
        <span className="text-xs text-slate-400 font-medium">Mã lớp:</span>
        <span className="font-mono text-xs font-semibold text-slate-700">
          {resolvedClassCode}
        </span>
        {primaryClass?.name && (
          <span className="text-xs text-slate-500 font-medium truncate max-w-[220px]">
            • {primaryClass.name}
          </span>
        )}
      </div>
    )}
  </div>

  {/* Các nút thao tác nhanh */}
  <div className="flex items-center gap-2">
    {/* Nút 1: Thu học phí đợt tiếp theo */}
    <button
      type="button"
      onClick={() => setIsNextInstallmentModalOpen(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
      title="Thu học phí đợt 2, đợt 3 hoặc theo tháng"
    >
      <Plus size={14} />
      <span>+ Thu học phí đợt tiếp theo</span>
    </button>

    {/* Nút 2: Nộp phí chênh lệch trung tâm */}
    <button
      type="button"
      onClick={() => setIsCenterCommissionModalOpen(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
      title="Nộp hoa hồng / phí chênh lệch hàng tháng cho đối tác trung tâm"
    >
      <ArrowUpRight size={14} className="text-amber-600" />
      <span>+ Nộp phí chênh lệch trung tâm</span>
    </button>

    {/* Nút 3: VietQR thu học phí */}
    <button
      type="button"
      onClick={() => setIsVietQRModalOpen(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
    >
      <QrCode size={14} />
      <span>VietQR</span>
    </button>

    {/* Nút 4: Thêm giao dịch tùy chỉnh */}
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsPaymentModalOpen(true)}
      className="h-8 px-3 rounded-xl text-xs font-semibold"
    >
      Giao dịch khác
    </Button>
  </div>
</div>
```

### 4.2 Modal Thu học phí đợt tiếp theo (`NextInstallmentModal`)
- **State điều khiển**: `isNextInstallmentModalOpen`, `installmentAmount`, `installmentDate`, `installmentMethod`, `installmentNote`.
- **Gợi ý số tiền nhanh (Preset Pills)**:
  * `900.000 ₫` (Đợt định kỳ milestone)
  * `2.200.000 ₫` (Thu theo tháng như lớp `LG4729`)
  * `Tất cả nợ còn lại` (`payment.debt`)
- **Hành động khi submit**:
  1. Ghi nhận giao dịch vào `payment.transactions`:
     ```ts
     const newTx: Transaction = {
       id: `TX-${Date.now()}`,
       type: amount >= (payment?.debt || 0) ? 'full_payment' : 'partial_payment',
       amount,
       date: new Date(installmentDate).toISOString(),
       method: installmentMethod,
       note: installmentNote || `Thu học phí đợt tiếp theo - Lớp ${resolvedClassCode}`,
       confirmedBy: adminProfile?.fullName || 'Admin',
       classId: primaryClass?.id,
       className: primaryClass?.name,
     };
     const updatedTransactions = [newTx, ...(payment?.transactions || [])];
     const summary = paymentService.calculateSummary(updatedTransactions);
     await paymentService.savePayment({
       ...currentPayment,
       ...summary,
       transactions: updatedTransactions
     });
     ```
  2. Tự động ghi có vào Sổ cái chung `ledger_transactions`:
     ```ts
     await ledgerService.addTransaction({
       refCode: resolvedClassCode || 'HOCPHI',
       type: 'payment',
       credit: amount,
       debit: 0,
       surplus: 0,
       studentId: id,
       studentName: fullName,
       description: `Thu học phí đợt tiếp theo - Học viên ${fullName} (${resolvedClassCode})`,
       date: installmentDate.slice(0, 10),
       year: new Date(installmentDate).getFullYear(),
       month: new Date(installmentDate).getMonth() + 1,
       startStatus: 'start',
       activeStatus: 'active',
     });
     ```

### 4.3 Modal Nộp phí chênh lệch trung tâm (`CenterCommissionModal`)
- **State điều khiển**: `isCenterCommissionModalOpen`, `commissionAmount` (mặc định 200.000 ₫), `commissionMonth` (chọn Tháng 1..12), `commissionDate`, `commissionMethod`, `commissionNote`.
- **Hành động khi submit**:
  1. Tự động ghi nợ vào Sổ cái chung `ledger_transactions`:
     ```ts
     await ledgerService.addTransaction({
       refCode: resolvedClassCode || 'HOAHONG',
       type: 'class_accept',
       debit: commissionAmount,
       credit: 0,
       surplus: 0,
       studentId: id,
       studentName: fullName,
       partnerId: primaryClass?.partnerId,
       partnerName: primaryClass?.partnerName || primaryClass?.company || 'Trung tâm đối tác',
       description: `Nộp phí chênh lệch trung tâm - Lớp ${resolvedClassCode} (${commissionMonth})`,
       date: commissionDate.slice(0, 10),
       year: new Date(commissionDate).getFullYear(),
       month: new Date(commissionDate).getMonth() + 1,
       startStatus: 'start',
       activeStatus: 'active',
     });
     ```
  2. Ghi nhận nhật ký vào `internalNotes` của học viên để đối soát:
     ```ts
     const logEntry = `[${format(new Date(), 'dd/MM/yyyy HH:mm')}] Đã nộp phí chênh lệch ${commissionAmount.toLocaleString('vi-VN')}₫ cho trung tâm (${commissionMonth} - Lớp ${resolvedClassCode})`;
     const nextNotes = payment?.internalNotes ? `${payment.internalNotes}\n${logEntry}` : logEntry;
     await paymentService.updatePayment(id, { internalNotes: nextNotes });
     ```

### 4.4 Chuẩn hóa Bảng Giao dịch theo `AGENTS.md`
- **Thẻ `<th>` ngoài cùng bên phải**:
  Thay thế line 2956 bằng thẻ rỗng:
  `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`
- **Menu 3 chấm (`MoreVertical`)**:
  Thay thế nút xóa trần trụi (line 3034–3042) bằng dropdown menu 3 chấm với các tùy chọn:
  * Xem chi tiết / Sao chép mã giao dịch
  * Xóa giao dịch (với điều kiện chưa khóa ngân hàng)
- **Hiển thị Loại giao dịch (Anti-Pill)**:
  Thay thế các badge pill sặc sỡ bằng chấm tròn `•` thanh lịch:
  ```tsx
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
    <span className={`w-1.5 h-1.5 rounded-full ${
      item.type === 'debt_recognition' ? 'bg-slate-400' :
      item.type === 'deposit' ? 'bg-blue-500' :
      item.type === 'refund' ? 'bg-rose-500' : 'bg-emerald-500'
    }`} />
    {item.type === 'debt_recognition' ? 'Công nợ' :
     item.type === 'deposit' ? 'Tiền cọc' :
     item.type === 'partial_payment' ? 'Đợt thanh toán' :
     item.type === 'full_payment' ? 'Hoàn tất' :
     item.type === 'refund' ? 'Hoàn tiền' : 'Credit'}
  </span>
  ```

---

## 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

1. **Kiểm tra Biên dịch & Bundle**:
   - Lệnh kiểm tra: `cd De_Vuong_Webapp && npm run build`
   - Điều kiện đạt: Mã thoát 0, không có lỗi TypeScript, không có lỗi import hay thiếu kiểu dữ liệu. Đã xác nhận chạy thành công trong khảo sát (built in 10.06s).
2. **Kiểm tra Tính toàn vẹn Dữ liệu trên Firestore**:
   - Khi bấm `[+ Thu học phí đợt tiếp theo]`:
     * Kiểm tra collection `payments/{studentId}`: `transactions` có bản ghi mới, `paidAmount` tăng, `debt` giảm tương ứng.
     * Kiểm tra collection `ledger_transactions`: xuất hiện bản ghi mới với `credit > 0`, `debit = 0`, `refCode = resolvedClassCode`.
   - Khi bấm `[+ Nộp phí chênh lệch trung tâm]`:
     * Kiểm tra collection `ledger_transactions`: xuất hiện bản ghi mới với `debit = 200.000 ₫`, `credit = 0`, `refCode = resolvedClassCode`.
3. **Kiểm tra Hiển thị UI theo AGENTS.md**:
   - Mã lớp hiển thị dạng plain mono `font-mono text-xs font-semibold text-slate-700` trên header công nợ.
   - Thẻ `<th>` ngoài cùng bên phải của bảng giao dịch rỗng (không có chữ 'Thao tác').
   - Hàng bảng có hiệu ứng hover viền xanh emerald bên trái (`hover:shadow-[inset_4px_0_0_0_#10b981]`).
   - Mọi thao tác xóa/xem đều thông qua menu 3 chấm (`MoreVertical`).
