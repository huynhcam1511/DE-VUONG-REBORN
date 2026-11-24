# BÁO CÁO KHẢO SÁT & KIỂM TRA KIẾN TRÚC MỤC 3 CRM ADMISSIONS & MÀN HÌNH CHI TIẾT HỌC VIÊN

**Người thực hiện**: `explorer_survey_crm_1` (Teamwork Explorer)  
**Thời gian**: 2026-11-19T09:22:00Z  
**Tài liệu tham chiếu**: `ORIGINAL_REQUEST.md`, `AGENTS.md`  
**Không gian làm việc ứng dụng**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\`  

---

## 1. OBSERVATION (Quan sát trực tiếp & Bằng chứng thực tế)

### 1.1. Hiện trạng Mục 3 trong `CRMAdmissionsModule.tsx`
- **Vị trí**: Nằm bên trong giao diện Form Chi tiết toàn trang (`isFormOpen === true`), tại cột bên phải (`lg:col-span-8`), bắt đầu từ dòng **5697** đến dòng **6143**:
  ```tsx
  5697: {/* Phân đoạn 3: Kế hoạch Tài chính & Phí hoa hồng (Flat Canvas theo chuẩn AGENTS.md) */}
  5698: <div className="pt-3 border-t border-slate-100 space-y-4">
  5699:   <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
  5700:     <div className="flex items-center gap-2">
  5701:       <Wallet size={15} className="text-emerald-600" />
  5702:       <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
  5703:         3. Kế hoạch Tài chính & Phí hoa hồng (Dòng tiền thực nhận)
  5704:       </h4>
  5705:     </div>
  ```
- **Các thành phần JSX hiện có trong Mục 3**:
  1. **Hàng nhập liệu chính (Dòng 5729 - 5771)**:
     - `Học phí dự kiến (VNĐ)`: input `formTuition` qua `SaaSCurrencyInput`.
     - `Phí nhận lớp (VNĐ)`: input `formClassIntakeFee` qua `SaaSCurrencyInput`.
     - `Ngày hạch toán phí`: input `formClassIntakeFeeDate` qua `FormDateInput`.
  2. **Bộ chuyển đổi nguồn chi trả phí nhận lớp & Kết quả vận hành lớp (Dòng 5774 - 5861)**:
     - Nguồn trả: 2 nút bấm toggle `formIntakeFeePaymentSource === 'cash'` ("Tiền mặt / MoMo / Ngân hàng") vs `'surplus_offset'` ("Cấn trừ Quỹ phí dư"). Hiển thị số dư `availableSurplusFund`.
     - Kết quả lớp: 2 nút bấm toggle `formClassOutcome === 'start'` ("Thành công (Start)") vs `'non_start'` ("Non-Start (Hủy)").
  3. **Banner cảnh báo hoàn phí dư khi Non-Start (Dòng 5864 - 5880)**:
     - Xuất hiện khi `formClassOutcome === 'non_start' || formStatus === 'Đã hủy'`.
  4. **Khối máy tính VAT Doanh nghiệp (Corporate VAT Invoice Calculator) (Dòng 5883 - 5976)**:
     - Điều kiện render: `{isInvoiceDemandActive && (...)}`.
     - Tại dòng **1887**: `const isInvoiceDemandActive = formKind === 'Doanh nghiệp' ? formHasInvoiceDemand : formHasInvoiceDemand;` và tại dòng **1756**: `const [formHasInvoiceDemand, setFormHasInvoiceDemand] = useState<boolean>(true);`.
     - **Vấn đề quan sát**: Do `formHasInvoiceDemand` mặc định là `true`, khối hóa đơn VAT này **luôn luôn hiển thị mặc định** cho cả B2C và B2B, chiếm trọn 1 card lớn và làm rối màn hình.
  5. **Danh sách động Phí chênh lệch hàng tháng (Hoa hồng định kỳ) (Dòng 5978 - 6063)**:
     - Render danh sách `formMonthlyCommissions` với từng dòng: Tháng 1, Tháng 2, Tháng 3... gồm ô tiền VNĐ, ngày hạch toán, ghi chú đối soát, nút xóa, và nút "+ Thêm tháng tiếp theo".
     - **Vấn đề quan sát**: Danh sách thu hoa hồng định kỳ tháng 2, tháng 3... nằm trực tiếp trong Form Tuyển sinh Giai đoạn 1 làm phân mảnh và rối rắm nghiệp vụ Tuyển sinh ban đầu.
  6. **Ribbon Tổng hợp Dòng tiền thực nhận (Dòng 6066 - 6142)**:
     - Hiển thị 4 chỉ số: 1. Học phí dự kiến / Thực nhận VAT, 2. Phí nhận lớp, 3. Tổng hoa hồng các tháng, 4. Dòng tiền thực nhận.

### 1.2. Hiện trạng Kế hoạch học phí & Thu đợt 1
- Trong `CRMRecord` (dòng 796-867), chỉ có trường `tuition?: string;` và `paidAmount?: number | string;`.
- Hiện tại **CHƯA CÓ** trường hoặc bộ chọn hình thức thanh toán kế hoạch học phí (Trọn gói 1 lần / Chia nhỏ theo đợt milestone / Thu theo tháng).
- Hiện tại Mục 3 **CHƯA CÓ** ô nhập rõ ràng cho việc Ghi có Đợt 1 ngay tại thẻ sổ cái phẳng (ví dụ: thu đợt 1 900.000 ₫ hoặc đóng trọn gói 3.600.000 ₫).

### 1.3. Hiện trạng Hành động Quyết định Chuyển giao: START vs NON-START
- Hiện tại nút `[★ XẾP VÀO LỚP HỌC (START)]` và `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]` đang được trình bày dưới dạng 2 nút nhỏ nằm cạnh "Nguồn chi trả phí nhận lớp" (dòng 5834-5859).
- Việc lưu form tổng thể vẫn phụ thuộc vào nút "Lưu cập nhật" ở thanh tiêu đề trên cùng (dòng 4981).
- Trong `handleCreateClassFromLead` (dòng 4734-4916):
  - Khi xếp lớp, nó gọi `classService.saveClass(newClass)` và `userService.updateUserProfile(targetStudentId, ...)`.
  - Tuy nhiên, trạng thái cập nhật `status: 'Đã xếp lớp'` chỉ được lưu vào `localStorage` qua `persistCustomRecords(next)` (dòng 4902) mà **chưa gọi `updateDoc` hoặc `setDoc` lên Firestore `crm_records` và `customer_profiles`**!
- Trong `triggerNonStartRefundIfEligible` (dòng 3716-3755):
  - Khi Non-Start, hệ thống đã có logic tự động ghi có vào `ledger_transactions` với `type: 'class_cancel_surplus'` và `surplus: +intakeFee` để hoàn tiền vào Quỹ Phí Dư.

### 1.4. Hiện trạng Màn hình Chi tiết Học viên (`StudentDetail.tsx`)
- **Vị trí tab Học phí & Giao dịch**: Dòng 2866 đến 3105 trong `StudentDetail.tsx`.
- **Thanh tiêu đề công nợ (Dòng 2912-2936)**:
  - Hiện tại chỉ có: `<h4 className="font-bold text-slate-900 flex items-center gap-2"><History size={18} className="text-emerald-600" />Sổ công nợ & Giao dịch</h4>`.
  - **Thiếu**: Chưa hiển thị mã đối chiếu lớp học (ví dụ: `LG4729` hoặc `student_code_reference`) trên thanh tiêu đề này.
  - Các nút hành động hiện có: Nút `[Thu học phí (VietQR)]` (mở `LeadPaymentModal`) và nút `[+ Thêm giao dịch]` (mở modal thêm giao dịch thủ công).
  - **Thiếu**: Chưa có 2 nút thao tác nhanh chuẩn hóa theo R2:
    - `[+ Thu học phí đợt tiếp theo]` (thu các đợt tiếp theo như đợt 2, đợt 3... ví dụ 900.000 ₫ hoặc theo tháng 2.200.000 ₫).
    - `[+ Nộp phí chênh lệch trung tâm]` (ghi nhận chi phí chênh lệch định kỳ cho đối tác/trung tâm, tự động ghi nợ vào sổ cái `ledger_transactions`).
- **Liên kết dữ liệu giữa Tuyển sinh và Học viên**:
  - Dữ liệu tài chính học viên được quản lý qua service `paymentService.ts` tại collection `payments/{studentId}` với các trường: `totalAmount`, `deposit`, `paidAmount`, `debt`, `credit`, `transactions`.
  - Khi ghi nhận công nợ (type: `'debt_recognition'`), `totalAmount` tăng lên.
  - Khi thu tiền (type: `'deposit'`, `'partial_payment'`, `'full_payment'`), `paidAmount` tăng lên và `debt = Math.max(0, totalAmount - paidAmount)`.

### 1.5. Kết quả Kiểm tra Build Baseline
- Đã chạy lệnh: `cd De_Vuong_Webapp; npm run build`.
- **Kết quả**: Exit code `0`, `built in 10.13s`, 0 lỗi TypeScript, 0 lỗi bundle.

---

## 2. LOGIC CHAIN (Chuỗi suy luận từ quan sát đến kết luận)

1. **Về sự phân định 2 giai đoạn (Giai đoạn 1: Tuyển sinh vs Giai đoạn 2: Vận hành & Công nợ)**:
   - *Từ Observation 1.1 & 1.4*: Hiện tại việc quản lý học phí bị lẫn lộn giữa hai màn hình. Mục 3 của CRM Admissions lại chứa cả danh sách hoa hồng tháng 1, 2, 3... khiến Form tuyển sinh phình to. Ngược lại, màn hình Chi tiết Học viên (`StudentDetail.tsx`) lại thiếu các nút thu tiền các đợt tiếp theo và nộp phí chênh lệch định kỳ.
   - *Suy luận*: Cần tinh gọn Mục 3 CRM Admissions thành **Single Flat Ledger Card** chỉ tập trung vào: Kế hoạch học phí ban đầu, Phí nhận lớp & nguồn chi trả, Thu học phí Đợt 1 (Ghi có đợt 1), và hành động chuyển giao dứt khoát `START` hoặc `NON-START`. Mọi khoản thu định kỳ đợt 2, đợt 3 và chi hoa hồng định kỳ tháng 2, tháng 3 phải được chuyển giao toàn bộ sang Giai đoạn 2 (`StudentDetail.tsx` - Tab Học phí & Giao dịch).

2. **Về Thiết kế Thẻ Sổ cái Phẳng (Single Flat Ledger Card) cho Mục 3 CRM Admissions**:
   - *Từ Observation 1.1 & 1.2*: Cần tái cấu trúc Mục 3 thành một thẻ phẳng duy nhất, không chia nhiều phân đoạn viền con rườm rà.
   - Thẻ phẳng gồm 4 khối nội dung liền mạch:
     - **Khối A - Kế hoạch học phí**:
       - `Tổng học phí cam kết (VNĐ)`: input số tiền (`formTuition`).
       - `Hình thức thanh toán`: bộ 3 nút chọn (segmented pills/select):
         - `Trọn gói (1 lần)`: 100% học phí.
         - `Chia nhỏ theo đợt (Milestone)`: Đợt 1, Đợt 2, Đợt 3...
         - `Thu theo tháng`: Đóng theo từng tháng đào tạo.
     - **Khối B - Ghi có Đợt đầu (Đợt 1) & Nguồn thanh toán**:
       - `Số tiền thu Đợt 1`: ví dụ 900.000 ₫ hoặc trọn gói 3.600.000 ₫.
       - `Hình thức thu`: Chuyển khoản (VCB/VietQR) hoặc Tiền mặt.
       - `Ngày thu`: date picker.
     - **Khối C - Phí nhận lớp ban đầu & Chuyển đổi nguồn**:
       - `Phí nhận lớp ban đầu (VNĐ)` (`formClassIntakeFee`).
       - `Nguồn chi trả`: Chuyển đổi giữa `Tiền mặt / VCB` vs `Cấn trừ Quỹ Phí Dư` (kèm số dư khả dụng thực tế `availableSurplusFund`).
     - **Khối D - Máy tính Hóa đơn VAT Doanh nghiệp (Encapsulated Toggle)**:
       - Mặc định thu gọn (`formHasInvoiceDemand = false`).
       - Checkbox toggle: `[ ] Xuất hóa đơn VAT Doanh nghiệp`. Khi tích chọn mới bung ra 3 ô: Đơn vị trung gian, Phụ phí VAT (10%), Phí trung gian (8%) và dải tính toán thực nhận.
     - **Khối E - Thao tác quyết định chuyển giao duy nhất**:
       - `[★ XẾP VÀO LỚP HỌC (START)]`: Nút chính màu xanh ngọc (emerald), khi bấm sẽ tạo/gán lớp học, tạo hồ sơ học viên, đẩy dữ liệu công nợ sang `payments/{studentId}`, ghi nhận bút toán `ledger_transactions`, đổi trạng thái Lead thành `'Đã xếp lớp'`, và có tùy chọn mở ngay màn hình Học viên.
       - `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`: Nút cảnh báo màu đỏ/hồng (rose), khi bấm sẽ đổi trạng thái thành `'Đã hủy'`, tự động kích hoạt hoàn phí nhận lớp vào Quỹ Phí Dư trên Sổ Cái nếu đã trừ quỹ trước đó.

3. **Về Nâng cấp Màn hình Chi tiết Học viên (`StudentDetail.tsx`)**:
   - *Từ Observation 1.4*: Tab "Học phí & Giao dịch":
     - Trên Header của card `Sổ công nợ & Giao dịch`: Bổ sung hiển thị mã đối chiếu lớp học (ví dụ: `LG4729` hoặc `student_code_reference`) bằng phông mono tinh gọn `font-mono text-xs font-semibold text-slate-700` (tuân thủ AGENTS.md Rule 3, không bọc badge/pill).
     - Nhận và hiển thị đầy đủ 4 thẻ chỉ số: Tổng học phí, Đã đóng (kế thừa từ Đợt 1 Tuyển sinh), Còn nợ, Tiền dư (Credit).
     - Thêm 2 nút thao tác nhanh:
       - `[+ Thu học phí đợt tiếp theo]`: Mở modal thu tiền đợt 2/đợt 3 (nhập số tiền, phương thức, ngày, ghi chú), cập nhật `payments/{studentId}` và thêm bút toán ghi có vào `ledger_transactions`.
       - `[+ Nộp phí chênh lệch trung tâm]`: Mở modal ghi nhận chi phí chênh lệch đối tác (ví dụ 200.000 ₫/tháng), tự động ghi nợ vào `ledger_transactions` (`type: 'class_accept'`).

4. **Về Tuân thủ AGENTS.md & Lưu trữ Dữ liệu Vĩnh viễn (Persistence)**:
   - *Từ Observation 1.3 & Rule 13*: Mọi thao tác đổi trạng thái, tạo giao dịch, xếp lớp, hoàn phí... bắt buộc phải gọi Firestore APIs (`setDoc`, `updateDoc`, `addDoc`) để lưu vào các collection `customer_profiles`, `crm_records`, `classes`, `users`, `payments`, `ledger_transactions`. Tuyệt đối không chỉ cập nhật local state hoặc chỉ lưu `localStorage`.

---

## 3. CAVEATS (Vấn đề lưu ý & Giới hạn khảo sát)

1. **Khả năng tương thích ngược dữ liệu cũ (Legacy Data Compatibility)**:
   - Các bản ghi CRM cũ có thể chưa có trường `tuitionPlanType` hoặc `initialPaymentAmount`. Khi render, cần fallback an toàn: nếu chưa có `initialPaymentAmount`, fallback sang `paidAmount`; nếu chưa có `tuitionPlanType`, mặc định là `'full'` nếu `paidAmount === tuition` hoặc `'installments'` nếu `paidAmount < tuition`.
2. **Đồng bộ 2 chiều giữa Lead và Student Payment**:
   - Khi Lead nhấn `[★ XẾP VÀO LỚP HỌC (START)]`, bản ghi trong `payments/{studentId}` cần được khởi tạo với:
     - `totalAmount = tuition` (qua transaction `debt_recognition`).
     - `paidAmount = initialPaymentAmount` (qua transaction `deposit` hoặc `partial_payment`).
     - `debt = tuition - initialPaymentAmount`.
   - Cần đảm bảo `studentId` hoặc `student_code_reference` được neo giữ duy nhất (Code-Anchoring) tránh ghi đè nhầm học viên khác.
3. **Phân quyền thao tác**:
   - Nút hoàn phí Quỹ Phí Dư tác động trực tiếp đến dòng tiền Sổ cái chung (`ledger_transactions`), nên cần có confirm dialog (`AdminConfirm`) để tránh người dùng click nhầm.

---

## 4. CONCLUSION & ĐỀ XUẤT KIẾN TRÚC CHI TIẾT

### 4.1. Cấu trúc lại Mục 3 trong `CRMAdmissionsModule.tsx`
Thay thế toàn bộ phân đoạn dòng **5696 - 6143** bằng **Single Flat Ledger Card**:
```tsx
{/* 3. Kế hoạch Học phí & Thanh toán Giai đoạn 1 (Single Flat Ledger Card) */}
<div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
  {/* Header Thẻ Sổ cái */}
  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      <Wallet size={16} className="text-emerald-600" />
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
        3. Kế hoạch Học phí & Khởi tạo Thanh toán (Giai đoạn 1)
      </h4>
    </div>
    <span className="font-mono text-xs font-medium text-slate-400">Đơn vị: VNĐ</span>
  </div>

  {/* Khối 1: Kế hoạch học phí & Hình thức thanh toán */}
  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
    <div className="sm:col-span-6">
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        Tổng học phí cam kết *
      </label>
      <SaaSCurrencyInput
        value={formTuition}
        onChange={(clean) => setFormTuition(clean)}
        placeholder="Nhập tổng mức học phí..."
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-emerald-800 outline-none focus:border-emerald-500"
      />
    </div>

    <div className="sm:col-span-6">
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        Hình thức thanh toán dự kiến *
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { key: 'full', label: 'Trọn gói (1 lần)' },
          { key: 'installments', label: 'Chia nhỏ đợt' },
          { key: 'monthly', label: 'Thu theo tháng' }
        ].map((plan) => (
          <button
            key={plan.key}
            type="button"
            onClick={() => setFormTuitionPlanType(plan.key as any)}
            className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all text-center cursor-pointer ${
              formTuitionPlanType === plan.key
                ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {plan.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Khối 2: Ghi có Đợt đầu (Đợt 1) & Phí nhận lớp ban đầu */}
  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
    <div className="sm:col-span-6 space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        Thu học phí Đợt đầu (Ghi có Đợt 1)
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SaaSCurrencyInput
          value={formInitialPaymentAmount}
          onChange={(clean) => setFormInitialPaymentAmount(clean)}
          placeholder="Số tiền đợt 1..."
          className="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
        />
        <AdminSaaSSelect
          options={[
            { value: 'Chuyển khoản VCB', label: 'Chuyển khoản VCB' },
            { value: 'Tiền mặt', label: 'Tiền mặt' },
          ]}
          value={formInitialPaymentMethod}
          onChange={(val) => setFormInitialPaymentMethod(val)}
        />
      </div>
      <p className="text-[10px] text-slate-400">
        Ví dụ: 900.000 ₫ (Đợt 1) hoặc trọn gói {formatThousandsVN(formTuition) || '3.600.000'} ₫
      </p>
    </div>

    <div className="sm:col-span-6 space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        Phí nhận lớp ban đầu (nếu có)
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <SaaSCurrencyInput
          value={formClassIntakeFee}
          onChange={(clean) => setFormClassIntakeFee(clean)}
          placeholder="Phí nhận lớp..."
          className="h-8.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
        />
        <FormDateInput
          value={formClassIntakeFeeDate}
          onChange={(val) => setFormClassIntakeFeeDate(val)}
          placeholder="Ngày hạch toán"
        />
      </div>

      {/* Toggle nguồn chi trả phí nhận lớp */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setFormIntakeFeePaymentSource('cash')}
          className={`flex-1 py-1 px-2 rounded-md border text-[11px] font-medium text-center transition-all cursor-pointer ${
            formIntakeFeePaymentSource === 'cash'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tiền mặt / VCB
        </button>
        <button
          type="button"
          onClick={() => {
            if (computedClassIntakeFeeNumber <= availableSurplusFund || availableSurplusFund > 0) {
              setFormIntakeFeePaymentSource('surplus_offset');
            }
          }}
          disabled={computedClassIntakeFeeNumber > availableSurplusFund && availableSurplusFund <= 0}
          className={`flex-1 py-1 px-2 rounded-md border text-[11px] font-medium text-center transition-all ${
            formIntakeFeePaymentSource === 'surplus_offset'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold cursor-pointer'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          <span>Cấn trừ Quỹ ({formatThousandsVN(availableSurplusFund) || '0'} ₫)</span>
        </button>
      </div>
    </div>
  </div>

  {/* Khối 3: Máy tính VAT Doanh nghiệp (Thu gọn mặc định trong Checkbox Toggle) */}
  <div className="pt-2 border-t border-slate-100">
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={formHasInvoiceDemand}
        onChange={(e) => setFormHasInvoiceDemand(e.target.checked)}
        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
      />
      <span>Xuất hóa đơn VAT Doanh nghiệp (Phụ thu 10% VAT, Phí trung gian 8%)</span>
    </label>

    {formHasInvoiceDemand && (
      <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
        {/* Render 3 inputs và dải tính toán 5 chỉ số */}
      </div>
    )}
  </div>

  {/* Khối 4: Thao tác Quyết định Chuyển giao Duy nhất (START vs NON-START) */}
  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
    <div className="text-[11px] text-slate-500">
      <span>Trạng thái hiện tại: </span>
      <strong className="text-slate-800 font-semibold">{currentLeadStatus}</strong>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleNonStartOutcome}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 bg-rose-50/80 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
      >
        <X size={14} className="text-rose-600" />
        <span>✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)</span>
      </button>

      <button
        type="button"
        onClick={handleStartAndEnrollClass}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
      >
        <CheckCircle2 size={14} className="text-white" />
        <span>★ XẾP VÀO LỚP HỌC (START)</span>
      </button>
    </div>
  </div>
</div>
```

### 4.2. Nâng cấp Tab "Học phí & Giao dịch" trong `StudentDetail.tsx`
1. **Hiển thị Mã đối chiếu Lớp học trên Header**:
   ```tsx
   <div className="p-4 border-b border-slate-100 flex items-center justify-between">
     <div className="flex items-center gap-2">
       <History size={16} className="text-emerald-600" />
       <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
         Sổ công nợ & Giao dịch
       </h4>
       {activeClassCode && (
         <>
           <span className="text-slate-300">·</span>
           <span className="font-mono text-xs font-semibold text-slate-700">
             Mã lớp: {activeClassCode}
           </span>
         </>
       )}
     </div>

     {/* Fast Action Buttons */}
     <div className="flex items-center gap-2">
       <button
         type="button"
         onClick={() => setIsAddNextInstallmentModalOpen(true)}
         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
       >
         <Plus size={13} />
         <span>+ Thu học phí đợt tiếp theo</span>
       </button>

       <button
         type="button"
         onClick={() => setIsAddCenterFeeModalOpen(true)}
         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
       >
         <Plus size={13} />
         <span>+ Nộp phí chênh lệch trung tâm</span>
       </button>

       <button
         type="button"
         onClick={() => setIsVietQRModalOpen(true)}
         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
       >
         <QrCode size={13} />
         <span>Thu học phí (VietQR)</span>
       </button>
     </div>
   </div>
   ```

2. **Xử lý `[+ Thu học phí đợt tiếp theo]`**:
   - Mở modal/popup xác nhận thu tiền đợt tiếp theo (ví dụ: Đợt 2: 900.000 ₫ hoặc Theo tháng: 2.200.000 ₫).
   - Khi xác nhận:
     - Thêm transaction vào `payments/{studentId}`: type `'partial_payment'` (hoặc `'full_payment'` nếu hết nợ).
     - Gọi `ledgerService.addTransaction`: type `'payment'`, credit: `amount`, refCode: `activeClassCode`, date, studentName.
     - Cập nhật tự động `paidAmount` và giảm `debt`.

3. **Xử lý `[+ Nộp phí chênh lệch trung tâm]`**:
   - Mở modal ghi nhận phí chênh lệch đối tác (ví dụ: 200.000 ₫/tháng).
   - Khi xác nhận:
     - Ghi nhận bút toán Ghi nợ vào Sổ cái chung:
       ```ts
       await ledgerService.addTransaction({
         refCode: activeClassCode || student.student_code_reference,
         type: 'class_accept',
         debit: feeAmount,
         credit: 0,
         surplus: 0,
         studentName: student.fullName,
         studentId: student.uid,
         description: `Phí chênh lệch trung tâm - Lớp ${activeClassCode} (${note})`,
         date: feeDate || new Date().toISOString().slice(0, 10),
         year: new Date().getFullYear(),
         month: new Date().getMonth() + 1,
         startStatus: 'start',
         activeStatus: 'active',
       });
       ```

---

## 5. VERIFICATION METHOD (Phương pháp Xác minh Độc lập)

1. **Kiểm tra File & Cú pháp Code**:
   - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`: kiểm tra cấu trúc Mục 3, checkbox VAT toggle, logic START/NON-START, và các cuộc gọi Firestore.
   - `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`: kiểm tra hiển thị mã lớp trên Header, 2 nút thao tác nhanh `[+ Thu học phí đợt tiếp theo]` và `[+ Nộp phí chênh lệch trung tâm]`.
2. **Kiểm tra Biên dịch Hệ thống (Build Command)**:
   - Chạy lệnh trong terminal:
     ```powershell
     cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
     npm run build
     ```
   - **Tiêu chí hoàn thành (Passing Criteria)**: Mã thoát (exit code) = 0, không có lỗi TypeScript, không có cảnh báo nghiêm trọng về bundle.
3. **Điều kiện Hủy bỏ / Invalidation Conditions**:
   - Nếu Mục 3 vẫn hiển thị danh sách hoa hồng tháng 2, tháng 3 làm rối giao diện Tuyển sinh.
   - Nếu khối tính VAT vẫn luôn mở mặc định mà không thể thu gọn qua checkbox toggle.
   - Nếu thao tác xếp lớp/hủy lớp chỉ thay đổi state giao diện mà không lưu Firestore.
   - Nếu màn hình StudentDetail tab Học phí không có mã lớp đối chiếu hoặc thiếu 2 nút thao tác nhanh.

---
*Báo cáo kết thúc tại đây và sẵn sàng chuyển giao cho Implementer Agent.*
