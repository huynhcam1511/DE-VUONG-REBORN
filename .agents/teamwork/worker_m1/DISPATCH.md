## 2026-11-02T09:48:41Z
You are the Implementation Worker for Milestone M1 of the Student Identity & Multi-Stage Admissions Debt Sync project.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1`
Canonical app directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp` (All implementation, builds, tests must run here. Never touch `archives/`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY SPECIFICATIONS TO READ BEFORE CODING:
1. `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (read section ## 2026-11-02T09:30:40Z)
2. `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_2\PROJECT.md`
3. Explorer survey reports with exact line numbers and proposed solutions:
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md` (R1)
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md` (R2)
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md` (R3)

EXCLUSIVE WRITE OWNERSHIP:
You exclusively own and may edit:
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx`
- `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
- `De_Vuong_Webapp/server.ts`

CORE REQUIREMENTS TO IMPLEMENT:
1. **R1: Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh & LeadPaymentModal**
   - In `CRMAdmissionsModule.tsx`:
     - Provide `resolveStudentIdentity` to look up students by LRN, phone, email, or name.
     - Store genuine `LRN-xxxxxxxx` (from `student_code_internal`) in `formStudentId` and `CRMRecord.studentId` instead of Firestore raw UIDs.
     - Auto-detect existing student when phone/email is entered in create/edit form.
     - In `handleOpenEditForm`, resolve and restore genuine `LRN` code if missing or raw UID.
     - In `onPaymentRecorded`, ensure `studentId` is set to genuine `LRN` code.
     - In `handleOpenLeadPayment`, resolve and pass `studentCode` / `effectiveLrn` into `paymentModalLead`.
   - In `LeadPaymentModal.tsx`:
     - Update `LeadPaymentModalProps.lead` to accept `studentCode?: string`.
     - In the modal Header (lines 232-248), render both `leadCode` and `lrnCode` in parallel:
       `LEA-64817788 · LRN-62517882 · [COL-xxxxxxxx] · Nguyễn Thị Anh Thi`.
     - Update client summary box and print preview to display both codes cleanly.

2. **R2: Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế**
   - In `LeadPaymentModal.tsx`:
     - Accept optional prop `allLedgerTransactions?: any[]`.
     - Field 1 ("1. Tổng học phí"): Inherits from `lead.tuition` (e.g. 6.000đ).
     - Calculate `previouslyPaidAmount`: Query `allLedgerTransactions` for payments matching `targetLeaCode`, `targetLrnCode`, phone, or `COL` code (with cross-admission guard: ignore transactions with a different LEA code). Take `Math.max(lead.paidAmount, ledgerPaidSum)`.
     - Field 2 ("2. Thu đợt này"): Automatically proposes the remaining debt: `Math.max(0, leadTuition - previouslyPaidAmount)` (e.g. 3.000đ when 6.000đ total and 3.000đ paid).
     - Field 3 ("3. Còn lại sau đợt này"): Reactively computes `Math.max(0, currentRemainingDebt - numericAmount)` (shows 0đ when paying 3.000đ).
     - VietQR: Automatically generated with the exact amount from Field 2.
     - In `CRMAdmissionsModule.tsx`: Pass `allLedgerTransactions={allLedgerTransactions}` to both `<LeadPaymentModal>` instances. Prevent stale `formTuition` leakage when opening from table view rows.

3. **R3: Đồng bộ hiển thị và Nhận diện trên Sổ cái Kế toán (AdminLedgerModule)**
   - In `AdminDashboard.tsx`: Pass `crmLeads={crmLeads}` to `<AdminLedgerModule ... />`.
   - In `AdminLedgerModule.tsx`:
     - Accept `crmLeads?: any[]` in props and seed `allCrmRecords` with `crmLeads` + localStorage (`katc_custom_crm_records` & `katc_crm_overrides`) + Firestore listener.
     - In `parseLedgerSmartInfo`: Multi-hop resolution: Match transaction to CRM lead by LEA code, then bridge CRM lead to `allStudents` by `studentId`, phone, email, or name to extract real student name and genuine `student_code_internal` (`LRN-xxxxxxxx`).
     - Eradicate generic placeholders: Eliminate fallback to `'Học viên E-learning'` or `'---'`.
     - Guard against pseudo-LRN: In table row render (and Student Report tab), never convert `LEA-xxxxxxxx` or `COL-xxxxxxxx` to `LRN-xxxxxxxx` by swapping prefixes.
     - Clean descriptions: In `cleanDesc`, recognize `[LỆNH THU]`, `[SePay-COL]`, etc., and strip redundant student names and LEA codes to keep single-line display compliant with AGENTS.md.
   - In `server.ts`: In webhook ingestion (lines 3020-3050), query `crm_records` alongside `customer_profiles` so that incoming SePay transactions resolve student name and LRN.

VERIFICATION:
- Run `npm test` and `npm run build` in `De_Vuong_Webapp/`.
- Ensure build exits with code 0 and all tests pass.
- Document exact changes and verification commands/output in `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1\handoff.md`.
- Send a completion message to parent when finished.
