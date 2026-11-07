# Orchestration Plan — Sổ cái, SePay Webhook & Đối soát Đa Module (LEA/LRN & COL)

## Objectives & Requirements
1. **R1: Đồng nhất Định danh Học viên & Mã hồ sơ trên Sổ cái**
   - Mọi giao dịch ngân hàng cùng mã hồ sơ `LEA-XXXXXXXX` phải hiển thị chính xác, đồng nhất Họ tên học viên từ CRM (thay vì dòng hiện tên thật, dòng hiện 'Học viên E-learning').
   - Hiển thị đúng mã học viên `LRN-XXXXXXXX` thực tế từ hồ sơ CRM, tuyệt đối không sinh mã giả từ số đuôi của mã LEA (ví dụ không tự ghép `LRN-91690914`).
2. **R2: Tinh gọn Diễn giải & Triệt tiêu trùng lặp dữ liệu**
   - Cắt gọt chuỗi diễn giải giao dịch ngân hàng để không lặp lại mã LEA hay tên học viên đã có cột riêng.
   - Ẩn chuỗi nội dung gốc SePay vào tooltip để chiều cao dòng bảng luôn đều tăm tắp, đúng chuẩn AGENTS.md (truncate/line-clamp-1).
3. **R3: Tích hợp & Cộng dồn Thanh toán vào Phiếu thu (COL)**
   - Hỗ trợ thanh toán nhiều đợt cho cùng 1 mã hồ sơ / phiếu thu (ví dụ 3.000đ + 2.000đ = 5.000đ).
   - Tổng số tiền đã thu (`paidAmount`) trên thanh tiến trình thương mại (`CommercialLifecycleBar`) được cộng dồn chính xác và tự động chuyển trạng thái hoàn tất thu tiền khi đạt 100% (5.000đ / 5.000đ, còn nợ 0đ).

## Architecture & Workflows
- Working Directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- UI Standards: Strictly conform to `AGENTS.md` (Table visuals, Freeze panes, 1-row toolbar, plain text anti-pill, read-only master table, MoreVertical action menu).
- Data Persistence: Firestore / API calls via canonical webapp patterns.

## Team Execution Strategy
1. **Phase 0: Survey & Discovery (Parallel Exploration)**
   - Explorer 1: Inspect Ledger/Finance module (`FinancialLedgerModule.tsx` or similar), transaction rendering, columns, and SePay webhook handlers / services.
   - Explorer 2: Inspect CRM Admissions (`CRMAdmissionsModule.tsx`, lead data models, `leadId` / `LEA-` vs `learnerId` / `LRN-` generation and linkage).
   - Explorer 3: Inspect Commercial lifecycle (`CommercialLifecycleBar.tsx`, collection orders `COL-`, payment accumulation logic, order statuses).
2. **Phase 1: Architecture & Synthesis**
   - Synthesize explorer findings into `PROJECT.md` (Feature Inventory, precise root causes, code layout, interface contracts, milestone plan).
3. **Phase 2: Milestone Implementation (Worker + Reviewers + Challengers + Auditor)**
   - Milestone 1: Data consistency (LEA/LRN resolution and student name matching on Ledger).
   - Milestone 2: Clean Diễn giải column, tooltip for raw SePay, line-clamp-1, uniform row height.
   - Milestone 3: Multiple payment accumulation into Collection Order & CommercialLifecycleBar (paidAmount calculation & status update).
4. **Phase 3: Independent Verification Gate & Forensic Audit**
   - Two Reviewers verify code quality, UX compliance, AGENTS.md compliance, and build/test success.
   - Two Challengers perform empirical validation / test case runs.
   - One Forensic Auditor conducts zero-tolerance integrity audit (no dummy code, no hardcoding, genuine calculation).
5. **Phase 4: Synthesis & Reporting to Parent**
   - Update `BRIEFING.md` and `progress.md`.
   - Send comprehensive completion report to parent orchestrator.
