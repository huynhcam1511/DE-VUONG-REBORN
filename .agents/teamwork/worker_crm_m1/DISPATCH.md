## 2026-11-19T09:22:25Z
You are Worker CRM M1 (teamwork_worker).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_m1\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The project specification is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_6\PROJECT.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You own exclusively: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`.
Do NOT modify `StudentDetail.tsx` (reserved for Milestone 2).

SURVEY REPORTS TO READ:
- Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_1\handoff.md`
- Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_3\handoff.md`

TASK SPECIFICATION (Milestone 1 - CRM Admissions Section 3 Single Flat Ledger Card):
In `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`:
1. Tái cấu trúc Mục 3 (thay thế phân đoạn dòng 5697 - 6143) thành một thẻ sổ cái phẳng duy nhất (Single Flat Ledger Card) cho Giai đoạn 1 (Tuyển sinh / Khởi tạo):
   - Kế hoạch học phí:
     - Input Tổng học phí cam kết (`formTuition`).
     - Bộ chọn hình thức thanh toán (`formTuitionPlanType`: 'full' [Trọn gói 1 lần] / 'installments' [Chia nhỏ đợt] / 'monthly' [Thu theo tháng]).
   - Ghi có Đợt đầu (Đợt 1):
     - Input số tiền thu đợt 1 (`formInitialPaymentAmount`, ví dụ: 900.000 ₫ hoặc trọn gói 3.600.000 ₫).
     - Phương thức thu (`formInitialPaymentMethod`: 'Chuyển khoản VCB' / 'Tiền mặt').
   - Phí nhận lớp ban đầu:
     - Input phí nhận lớp (`formClassIntakeFee`) & ngày hạch toán (`formClassIntakeFeeDate`).
     - Toggle chọn nguồn thanh toán: 'Tiền mặt / VCB' vs 'Cấn trừ Quỹ Phí Dư' (kết nối số dư `availableSurplusFund`, hiển thị số dư khả dụng, vô hiệu hóa nếu quỹ không đủ).
   - Máy tính VAT Doanh nghiệp (Corporate VAT):
     - Thu gọn hoàn toàn vào checkbox toggle: `[ ] Xuất hóa đơn VAT Doanh nghiệp (Phụ thu 10% VAT, Phí trung gian 8%)`.
     - Mặc định ẩn (`formHasInvoiceDemand = false`). Khi tích chọn mới bung ra khối tính toán.
   - Loại bỏ hoàn toàn danh sách hoa hồng định kỳ tháng 2, tháng 3... (`formMonthlyCommissions`) khỏi Mục 3 của Giai đoạn Tuyển sinh.
   - Thao tác quyết định chuyển giao duy nhất:
     - `[★ XẾP VÀO LỚP HỌC (START)]`:
       - Chuyển trạng thái lead thành 'Đã xếp lớp', cập nhật classOutcome thành 'start'.
       - Tạo/cập nhật lớp học (`classService.saveClass`) và hồ sơ học sinh (`userService.updateUserProfile`).
       - KHỞI TẠO ĐỒNG BỘ `payments/{studentId}` via `paymentService.savePayment`:
         - `totalAmount`: tổng học phí (`computedTuitionNumber`).
         - `deposit` / `paidAmount`: số tiền thu đợt 1 (`computedInitialPaymentNumber`).
         - `debt`: `Math.max(0, computedTuitionNumber - computedInitialPaymentNumber)`.
         - `transactions`: 1 giao dịch `debt_recognition` (tổng học phí) và 1 giao dịch `deposit` hoặc `partial_payment` (đợt 1).
       - Ghi nhận `ledger_transactions` (bút toán cấn trừ ví nếu dùng quỹ phí dư, và bút toán ghi có đợt 1 nếu có).
       - Lưu vĩnh viễn vào Firestore (`crm_records`, `customer_profiles`, `classes`, `users`, `payments`, `ledger_transactions`).
     - `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`:
       - Chuyển trạng thái lead thành 'Đã hủy', cập nhật classOutcome thành 'non_start'.
       - Tự động hoàn phí nhận lớp vào Quỹ Phí Dư trên `ledger_transactions` qua `triggerNonStartRefundIfEligible`.
       - Lưu vĩnh viễn vào Firestore (`crm_records`, `customer_profiles`, `ledger_transactions`).

2. BUILD VERIFICATION:
   - Chạy lệnh kiểm tra `npm run build` trong thư mục `De_Vuong_Webapp/`.
   - Đảm bảo mã thoát 0, không có lỗi TypeScript hoặc lỗi bundle.

3. REPORT:
   - Cập nhật `progress.md`.
   - Viết báo cáo chi tiết vào `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_m1\handoff.md`.
   - Gửi tin nhắn thông báo cho parent khi hoàn tất.


## 2026-11-19T09:32:44Z
**Context**: Milestone 1 CRMAdmissionsModule.tsx Section 3 implementation.
**Content**: Checking in on your progress with the Single Flat Ledger Card and START/NON-START implementation.
**Action**: Please provide a brief status update on your current step and estimated completion.
