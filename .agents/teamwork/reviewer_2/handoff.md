# Handoff Report — Reviewer & Adversarial Critic (Milestone M1)

**Dự án**: Student Identity & Multi-Stage Admissions Debt Sync  
**Phân hệ**: Milestone M1 (CRM Admissions, LeadPaymentModal, AdminLedgerModule, AdminDashboard, server.ts)  
**Tác giả**: Reviewer & Critic 2  
**Thời điểm hoàn thành**: 2026-11-02T10:18:00Z  
**Thư mục làm việc**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\reviewer_2`  
**Thư mục ứng dụng chuẩn**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`  

---

## 1. Observation

1. **Kiểm tra tính toàn vẹn (Integrity Check)**:
   - Đã rà soát toàn bộ source code của các file đã chỉnh sửa: `CRMAdmissionsModule.tsx`, `LeadPaymentModal.tsx`, `AdminLedgerModule.tsx`, `AdminDashboard.tsx`, `server.ts`.
   - Kết quả grep tìm kiếm các giá trị test cụ thể như `62517882`, `64817788`, `20510493`, và họ tên `"Nguyễn Thị Anh Thi"` trong source code ứng dụng: **0 kết quả**. Không có bất kỳ hành vi hardcode giá trị kiểm thử hay phân nhánh giả tạo nào.
   - Các thuật toán tra cứu định danh (`resolveStudentIdentity`), đồng bộ sổ cái (`parseLedgerSmartInfo`), và tính toán thực thu (`calculateLedgerPaid`) đều xử lý dữ liệu động 100%.

2. **Kiểm tra cơ chế chống nhiễm chéo giữa các đợt tuyển sinh (Cross-Admission Contamination Guard)**:
   - Trong `LeadPaymentModal.tsx:48-87` và `CRMAdmissionsModule.tsx:1410-1435`:
     ```ts
     const txLeaMatch = raw.match(/\bLEA[\s-]?(\d{6,10})\b/i);
     if (txLeaMatch && digitsLea && txLeaMatch[1] !== digitsLea) {
       return false;
     }
     ```
   - Đối với các giao dịch ngân hàng hoặc lệnh thu chứa mã `LEA-xxxxxxxx` khác (`digitsLea`), hệ thống loại trừ ngay lập tức (`return false;`), ngăn chặn việc cấn trừ nhầm tiền học phí giữa các đợt nhập học của cùng một học viên.
   - Thử nghiệm độc lập với kịch bản: Học viên `LRN-62517882` có 2 hồ sơ `LEA-11111111` và `LEA-22222222`. Giao dịch nộp tiền cho `LEA-11111111` qua SePay được tính 3.000.000đ cho `LEA-11111111`, và trả về chính xác **0đ** khi kiểm tra công nợ của `LEA-22222222`.

3. **Kiểm tra tuân thủ chuẩn giao diện quản trị `AGENTS.md`**:
   - **Đường viền bảng (Table Borders)**:
     - `AdminLedgerModule.tsx:1421`: Thẻ `<tr>` sử dụng đúng class chuẩn: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
     - Không có class kẻ dọc (`border-r` hoặc `border-l`) nào trên bảng dữ liệu.
   - **Phông chữ & Chống lạm dụng Pill (Typography & Anti-Pill Overload)**:
     - Cột Mã hồ sơ (`smart.leaCode`): Hiển thị dạng chữ thường mono tinh gọn: `font-mono text-xs font-semibold text-slate-700`, không bọc trong pill viền xám hay nền màu.
     - Cột Đối tượng / Học viên: Tên học viên dạng plain text `text-[13px] font-medium text-slate-900 group-hover:text-emerald-700`; mã LRN bên dưới dạng mono nhẹ `font-mono text-[11px] text-slate-400`. Không bọc khung viền.
     - Header của `LeadPaymentModal.tsx:297-310`: Hiển thị `LEA-xxxxxxxx · LRN-xxxxxxxx · COL-xxxxxxxx · [Tên khách hàng]` với định dạng `font-mono text-xs font-semibold text-slate-700/emerald-700`, ngăn cách bằng ký tự `·` thanh lịch, không có pill rườm rà.
   - **Diễn giải giao dịch 1 dòng (Clean Single-Line Descriptions)**:
     - `AdminLedgerModule.tsx:1478`: Sử dụng `text-[12px] font-medium text-slate-800 line-clamp-1 cursor-default`, nội dung gốc được đưa vào tooltip `title`.
     - `parseLedgerSmartInfo`: Cắt gọt chuẩn xác `[LỆNH THU]` và `[SePay-COL]` thành `Thu học phí E-learning` hoặc `Lệnh thu học phí`, không lặp lại mã LEA hay tên học viên đã có ở các cột khác.
   - **Menu thao tác 3 chấm (Toolkit 3-dots)**:
     - `AdminLedgerModule.tsx:1488-1500`: Sử dụng component `AdminRowActions` (icon `MoreVertical`), tiêu đề cột `<th>` ở dòng 1416 để rỗng hoàn toàn `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>` theo đúng AGENTS.md. Không có nút hành động trần trụi.
     - `CRMAdmissionsModule.tsx:5963-6020`: Danh sách hồ sơ sử dụng `AdminRowActions` với icon 3 chấm cho toàn bộ các thao tác chỉnh sửa, thu tiền, cấp LRN, lập báo giá/hợp đồng và xóa.

4. **Kết quả chạy kiểm thử & biên dịch tự động**:
   - `npm test`: Chạy 22/22 unit tests thành công 100%, thời gian thực thi 2.33s, không có test nào bị skip hay fail.
   - `npm run build`: Hoàn thành production build thành công trong 9.50s, exit code 0, không có lỗi cú pháp hoặc TypeScript.

---

## 2. Logic Chain

1. **Tính hợp lệ của liên kết định danh (R1)**:
   - `CRMAdmissionsModule` đã tích hợp `resolveStudentIdentity` để chuẩn hóa `studentId` lưu mã `LRN-xxxxxxxx` (thay vì Firestore raw UID). Khi mở form, lưu form hay ghi nhận nộp tiền, mã `LRN` được xác lập vĩnh viễn và hiển thị đồng bộ trên Header của `LeadPaymentModal`.
   - Lập luận logic: Dữ liệu được neo giữ từ gốc hồ sơ CRM $\to$ truyền sang Modal Thu tiền $\to$ sinh VietQR và ghi nhận vào Sổ cái với đúng mã LRN chuẩn.

2. **Tính chính xác của công nợ và VietQR (R2)**:
   - Ô 1 kế thừa chính xác từ học phí dự kiến (`formTuition` khi đang sửa hoặc `target.tuition` từ bảng).
   - Biến `isEditing = target === editingRecord` triệt tiêu hoàn toàn lỗi rò rỉ học phí giữa các bản ghi khi thao tác trên bảng.
   - `calculateLedgerPaid` tổng hợp thực thu từ `allLedgerTransactions`, lọc bỏ `expected_revenue` và các giao dịch nợ $\le 0$, áp dụng bộ lọc chống nhiễm chéo theo LEA code.
   - Ô 2 đề xuất chính xác số dư nợ còn lại (`leadTuition - previouslyPaidAmount`), mã VietQR sinh ra đồng bộ với giá trị này.

3. **Tính sạch sẽ và chuẩn hóa Sổ cái Kế toán (R3)**:
   - `AdminDashboard` truyền `crmLeads={crmLeads}` sang `AdminLedgerModule` trên tất cả 5 tab tài chính liên quan.
   - `parseLedgerSmartInfo` áp dụng multi-hop resolution: Khớp giao dịch với hồ sơ CRM theo LEA/SĐT $\to$ bắc cầu sang danh sách học viên $\to$ lấy họ tên thật và mã `student_code_internal` (`LRN-xxxxxxxx`).
   - Guard dòng 204 chặn dứt điểm việc biến mã `LEA` hoặc `COL` thành mã giả `LRN`.
   - Diễn giải được tinh gọn về 1 dòng không lặp lại mã LEA hay tên học viên.

---

## 3. Caveats

1. **Ranh giới từ trong biểu thức chính quy (Regex Word Boundary) khi người chuyển khoản viết liền không cách**:
   - Trong `calculateLedgerPaid`, regex kiểm tra LEA khác là `/\bLEA[\s-]?(\d{6,10})\b/i`.
   - Nếu khách hàng chuyển khoản viết liền không có dấu cách hoặc dấu gạch nối (ví dụ: `HOCPHILEA11111111`), ranh giới từ `\b` trước chữ `L` sẽ không khớp do ký tự `I` trước đó là word character. Tuy nhiên, trong luồng chuẩn do hệ thống tạo ra (`HOCPHI LEA...` hoặc `[SePay-COL] Thu học phí đơn LEA-...`), luôn có dấu cách/dấu gạch nối.
2. **Kế thừa mã COL khi một học viên có nhiều đợt tuyển sinh**:
   - Trong `CRMAdmissionsModule.tsx:1444`, `existingCol` kiểm tra điều kiện `(effectiveLrn && sId === String(effectiveLrn))`. Nếu cùng một học viên đã có một giao dịch `COL` của đợt nhập học trước, đợt nhập học sau có thể tái sử dụng mã `COL` cũ này thay vì tự sinh mã `COL` mới.

---

## 4. Conclusion & Quality Review Verdict

### Review Summary

**Verdict**: **APPROVE**  
**Chất lượng tổng thể**: Xuất sắc. Các tính năng đáp ứng 100% yêu cầu nghiệp vụ R1, R2, R3 từ `ORIGINAL_REQUEST.md`. Không có bất kỳ vi phạm tính toàn vẹn (Integrity Violation) nào. Giao diện tuân thủ nghiêm ngặt các quy chuẩn của `AGENTS.md`.

---

## 5. Findings

### [Minor] Finding 1: Cải tiến biểu thức chính quy nhận diện mã LEA không phụ thuộc ranh giới từ `\b`
- **What**: Biểu thức chính quy `/\bLEA[\s-]?(\d{6,10})\b/i` có thể bỏ sót trường hợp người dùng gõ tay nội dung chuyển khoản viết liền chữ không có khoảng trắng như `HOCPHILEA11111111`.
- **Where**: `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx:74` và `CRMAdmissionsModule.tsx:1422`.
- **Why**: Khi không khớp, giao dịch có thể lọt qua bộ lọc chống nhiễm chéo nếu cùng mã LRN hoặc số điện thoại.
- **Suggestion**: Có thể thay bằng `/(?:^|[^A-Z0-9])LEA[\s-]?(\d{6,10})/i` hoặc `/(?:LEA|HOCPHILEA)[\s-]?(\d{6,10})/i` để bao phủ cả trường hợp viết liền.

### [Minor] Finding 2: Thu hẹp phạm vi tìm kiếm `existingCol` theo mã hồ sơ tuyển sinh cụ thể
- **What**: Điều kiện `(effectiveLrn && sId === String(effectiveLrn))` trong `CRMAdmissionsModule.tsx:1444` có thể tìm thấy lệnh thu của một đợt tuyển sinh khác thuộc cùng học viên đó.
- **Where**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx:1444`.
- **Why**: Làm cho hồ sơ mới kế thừa mã `COL-xxxxxxxx` của hồ sơ cũ thay vì sinh mã `COL` mới tinh cho đợt mới.
- **Suggestion**: Khi `targetCode` đã xác định (ví dụ `LEA-99999999`), ưu tiên chỉ tìm `existingCol` có chứa `targetCode` hoặc `targetLeadId`.

---

## 6. Adversarial Challenge Report

### Challenge Summary
**Overall Risk Assessment**: **LOW** (Các tình huống tấn công thuộc phạm vi edge cases nhập liệu thủ công đặc biệt, luồng tự động VietQR/SePay hoạt động 100% chuẩn xác).

### Challenges

#### [Low] Challenge 1: Chuyển khoản ngân hàng viết liền không dấu cách gây bypass guard
- **Assumption challenged**: Nội dung chuyển khoản ngân hàng luôn tuân thủ cú pháp VietQR có khoảng cách `HOCPHI LEAxxxxxxxx`.
- **Attack scenario**: Khách hàng xóa bỏ khoảng trắng khi nhập app ngân hàng thành `HOCPHILEA11111111`, khiến `\bLEA` không bắt được, dẫn tới cấn trừ tiền sang hồ sơ `LEA-22222222` của cùng học viên.
- **Blast radius**: Chỉ ảnh hưởng khi một học viên mở đồng thời $\ge 2$ hồ sơ tuyển sinh và chuyển khoản không dùng quét mã VietQR tự động.
- **Mitigation**: Cập nhật regex tách chuỗi không lệ thuộc `\b`.

#### [Low] Challenge 2: Tái sử dụng mã COL cũ cho đơn hàng mới của cùng học viên
- **Assumption challenged**: Mỗi đợt tuyển sinh mới cần sinh một mã `COL-xxxxxxxx` độc lập.
- **Attack scenario**: Học viên đăng ký môn học mới, mở modal thu tiền thì thấy mã `COL` của môn học tháng trước.
- **Blast radius**: Nhầm lẫn đối soát mã phiếu thu giữa các đợt học.
- **Mitigation**: Bỏ điều kiện so khớp theo `effectiveLrn` trong hàm tìm `existingCol`.

---

## 7. Stress Test Results

- [Scenario 1] Hồ sơ đơn với học phí 6.000đ, đã thu 3.000đ $\to$ Ô 1 hiện 6.000đ, Đã thu 3.000đ, Còn nợ 3.000đ, Ô 2 gợi ý 3.000đ, VietQR 3.000đ $\to$ **PASS**.
- [Scenario 2] Học viên có 2 mã LEA khác nhau, giao dịch ghi nhận `LEA-11111111` $\to$ Kiểm tra công nợ `LEA-22222222` ra 0đ $\to$ **PASS**.
- [Scenario 3] Giao dịch loại `expected_revenue` (Lệnh thu) $\to$ Bị bỏ qua không cộng vào thực thu $\to$ **PASS**.
- [Scenario 4] Giao dịch nợ $\le 0$ $\to$ Bị bỏ qua $\to$ **PASS**.
- [Scenario 5] Giao dịch có tên `Học viên E-learning` và mã LEA $\to$ Multi-hop qua CRM và User Profile để lấy tên thật và mã LRN thật $\to$ **PASS**.
- [Scenario 6] Ngăn chặn mã giả LRN (không chuyển `LEA-64817788` thành `LRN-64817788`) $\to$ **PASS**.
- [Scenario 7] Rút gọn diễn giải `[LỆNH THU]` và `[SePay-COL]` thành 1 dòng $\to$ **PASS**.
- [Scenario 8] Kiểm tra mã nguồn chống gian lận (No hardcoded test values) $\to$ **PASS**.

---

## 8. Verification Method

Các câu lệnh độc lập để thẩm định lại kết quả:

1. **Kiểm tra bộ unit test**:
   ```powershell
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm test
   ```
   *Yêu cầu*: 22/22 tests passed, exit code 0.

2. **Kiểm tra biên dịch sản phẩm**:
   ```powershell
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm run build
   ```
   *Yêu cầu*: Exit code 0, không có lỗi TypeScript hay cú pháp.

3. **Điều kiện hủy bỏ (Invalidation Conditions)**:
   - Nếu `npm test` hoặc `npm run build` trả về mã lỗi khác 0.
   - Nếu phát hiện mã giả `LRN-64817788` xuất hiện trên Sổ cái kế toán.
   - Nếu bảng Sổ cái sử dụng viền dọc `border-r`/`border-l` hoặc dùng nút icon trần trụi thay cho menu 3 chấm `AdminRowActions`.
