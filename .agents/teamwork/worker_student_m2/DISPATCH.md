## 2026-11-19T09:43:28Z
You are Worker Student M2 (teamwork_worker).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_student_m2\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The project specification is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_6\PROJECT.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You own exclusively: `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`.
Do NOT modify `CRMAdmissionsModule.tsx` (completed in Milestone 1).

REFERENCE REPORTS TO READ:
- Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_2\handoff.md`
- Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_3\handoff.md`
- Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_m1\handoff.md`

TASK SPECIFICATION (Milestone 2 - Student Detail Payment & Ledger Enhancement):
In `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`:
1. Tại tab "Học phí & Giao dịch" (Payment & Ledger):
   - **Hiển thị Mã đối chiếu Lớp học trên thanh tiêu đề công nợ**:
     - Lấy mã lớp đối chiếu từ `enrolledClasses[0]?.classCode`, `student?.reconciliationCode`, hoặc `student?.student_code_reference` (fallback e.g. `'LG4729'`).
     - Hiển thị nổi bật cạnh tiêu đề "Sổ công nợ & Giao dịch" với phông mono tinh gọn: `<span className="font-mono text-xs font-semibold text-slate-700">Mã lớp: {resolvedClassCode}</span>`, tuyệt đối KHÔNG bọc vào pill/badge viền xám theo đúng chuẩn AGENTS.md Quy tắc 3.
   - **Kế thừa & Nhận dữ liệu bàn giao từ Tuyển sinh**:
     - `payments/{studentId}` đã được khởi tạo từ Giai đoạn 1 (Milestone 1) với `totalAmount`, `paidAmount` (Đợt 1), và `debt` còn lại.
     - Đảm bảo 4 thẻ chỉ số (Tổng học phí, Tiền cọc, Đã đóng, Còn nợ) phản ánh chính xác dữ liệu từ `payments/{studentId}`.
   - **Bổ sung 2 Nút Thao tác Nhanh trên Header Sổ công nợ**:
     - Nút 1: `[+ Thu học phí đợt tiếp theo]`:
       - Mở modal/dialog cho phép admin chọn mức thu nhanh (Preset: 900.000 ₫ theo milestone, 2.200.000 ₫ theo tháng như lớp LG4729, hoặc toàn bộ nợ còn lại `payment?.debt`), chọn phương thức, ngày thu, ghi chú.
       - Khi xác nhận: thêm transaction (`type: 'partial_payment'` hoặc `'full_payment'`) vào `payments/{studentId}` qua `paymentService.savePayment`, đồng thời ghi có (`credit: amount`, `debit: 0`, `type: 'payment'`, `refCode: resolvedClassCode`) vào Sổ cái chung `ledger_transactions` qua `ledgerService.addTransaction`.
     - Nút 2: `[+ Nộp phí chênh lệch trung tâm]`:
       - Mở modal/dialog ghi nhận nộp phí chênh lệch định kỳ cho trung tâm/đối tác (ví dụ: 200.000 ₫/tháng cho lớp `LG4729`).
       - Khi xác nhận: Tự động ghi nợ vào Sổ cái chung `ledger_transactions` (`type: 'class_accept'`, `debit: amount`, `credit: 0`, `refCode: resolvedClassCode`, `description: 'Nộp phí chênh lệch trung tâm - Lớp LG4729...'`) qua `ledgerService.addTransaction`, và ghi nhật ký vào `internalNotes` của học viên để đối soát.
2. **Chuẩn hóa Bảng Giao dịch theo AGENTS.md**:
   - Thẻ `<th>` của cột Action Menu ngoài cùng bên phải BẮT BUỘC để trống, TUYỆT ĐỐI KHÔNG có chữ 'Thao tác' (sửa dòng 2956 thành `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`).
   - Xóa bỏ nút icon `Trash` trần trụi (dòng 3034-3042), thay thế bằng Action Menu 3 chấm (`MoreVertical`).
   - Loại bỏ badge pill sặc sỡ ở cột Loại giao dịch, thay bằng văn bản thường tinh gọn kèm chấm tròn tinh tế `•` theo Quy tắc 4.
   - Chuẩn hóa hover effect cho thẻ `<tr>`: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
3. **Khắc phục 3 lỗi TypeScript trong `StudentDetail.tsx`**:
   - Dòng 3447: `student.displayName` $\to$ `student.fullName`
   - Dòng 3448: `student.phoneNumber` $\to$ `student.phone`
   - Dòng 3453: `student.enrolledClasses` $\to$ `student.classIds`
4. **Build Verification**:
   - Chạy lệnh kiểm tra `npm run build` trong thư mục `De_Vuong_Webapp/`.
   - Đảm bảo mã thoát 0, không có lỗi TypeScript hoặc lỗi bundle.
5. **Report**:
   - Cập nhật `progress.md`.
   - Viết báo cáo chi tiết vào `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_student_m2\handoff.md`.
   - Gửi tin nhắn thông báo cho parent khi hoàn tất.

## 2026-11-19T09:53:54Z
Sender: f6cc1e79-c7fd-4477-b25b-149ae6603513 (Parent)
Priority: MESSAGE_PRIORITY_HIGH
Content:
**Context**: Milestone 2 StudentDetail.tsx enhancement.
**Content**: Checking in on your progress with the class reference code anchoring, quick actions ([+ Thu học phí đợt tiếp theo], [+ Nộp phí chênh lệch trung tâm]), AGENTS.md compliance, and TypeScript fixes in StudentDetail.tsx.
**Action**: Please share a brief update on your current step.

