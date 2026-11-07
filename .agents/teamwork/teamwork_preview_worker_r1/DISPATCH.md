# Dispatch to Worker — R1, R2, R3 Implementation

## 2026-11-01T17:40:25Z

## Task Description
Read:
- `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Survey Reports:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_1\handoff.md`
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_2\handoff.md`
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_3\handoff.md`

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Scope & Files Owned Exclusively
You are the primary Worker responsible for implementing the fixes for R1, R2, and R3.
Working directory for the app: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
Files you own exclusively:
1. `src/components/admin/AdminLedgerModule.tsx`
2. `src/components/admin/CRMAdmissionsModule.tsx`
3. `src/components/admin/SepayReconciliationModule.tsx` (and `src/components/AdminDashboard.tsx` if needed for `getCollectedAmountForOrder`)
4. `server.ts`

## Specific Requirements to Implement
1. **R1: Consistent Student Identity & Authentic LRN Code Resolution on Ledger**:
   - In `AdminLedgerModule.tsx` (`parseLedgerSmartInfo`):
     - Treat `'Học viên E-learning'` as a placeholder name requiring enrichment from `allCrmRecords`.
     - Match `matchedCrm` by `normalizedLeaCode` in `allCrmRecords` (ignoring empty stub records with no name).
     - Populate `studentDisplay = matchedCrm.name || matchedCrm.fullName` ("Nguyễn Thị Anh Thi").
     - Resolve genuine `lrnCode` by cross-referencing `matchedCrm.studentId` with `allStudents` (finding `s.uid === matchedCrm.studentId` to get `student_code_internal` = `"LRN-20510493"`).
     - In table JSX (line 1347-1351): NEVER pass `tx.studentId` (or any `LEA-` code) to `ensureValidBusinessCode(..., 'LRN')`. Only display `smart.lrnCode` when a genuine LRN code exists (or leave blank if none).
   - In `server.ts`:
     - When receiving `LEA` transactions in `sepayHandler`, search both `crm_records` and `customer_profiles` so `payerName` is populated with the student's real name instead of falling back to `'Học viên E-learning'`.
     - When updating `crm_records`, do not create empty stub documents lacking `name`/`fullName`.

2. **R2: Clean Description & Uniform Row Heights (AGENTS.md compliance)**:
   - In `AdminLedgerModule.tsx` (`parseLedgerSmartInfo`):
     - Strip prefixes `[SePay-COL]`, `[SePay-HP]`, `[LENH THU]`, and remove duplicate LEA codes and student names.
     - Default to a clean description like `"Thu học phí E-learning"`.
   - In table JSX (line 1369-1378):
     - Render ONLY a single line for the description column (`truncate`/`line-clamp-1`).
     - Remove the second `<span>` that renders `tx.originalContent`.
     - Put `tx.originalContent` inside the `title` attribute as a tooltip (e.g. `title={`${smart.cleanDesc} • Nội dung gốc: ${tx.originalContent}`}`).
     - Maintain uniform row heights across all rows.

3. **R3: Payment Accumulation into Collection Orders (COL) & CommercialLifecycleBar**:
   - In `CRMAdmissionsModule.tsx` (`activeCollectionOrder`):
     - Do NOT exclude `stx.refCode?.startsWith('COL')`. Include all real credit transactions (`credit > 0` and `type !== 'expected_revenue'`) matching the LEA record or receiptCode.
     - Sum all matching credit transactions (`totalCollected`).
     - Set `finalCollectedAmount = Math.max(totalCollected, Number(editingRecord.paidAmount || 0))`.
     - Pass `paidAmount: finalCollectedAmount` so `CommercialLifecycleBar` receives 5.000đ / 5.000đ and displays "Đã nộp đủ 100%" (remaining debt 0đ).
   - In `server.ts`:
     - Accumulate `paidAmount: (currentPaid || 0) + amount_in` instead of overwriting with `amount_in`.
     - Set `paymentStatus = isFullyPaid ? 'completed' : 'partial'`.
   - In `SepayReconciliationModule.tsx` and `AdminDashboard.tsx`:
     - Ensure `getCollectedAmountForOrder` also matches when transactions contain the `LEA` code.

## Verification Requirements
- Run builds and tests inside `De_Vuong_Webapp/`:
  - `npm test` (must pass 100%)
  - Add or update test cases covering the LEA/LRN resolution, description truncation, and multi-payment accumulation if appropriate.
- Write your complete handoff report to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_worker_r1\handoff.md`.
- Notify the orchestrator via `send_message` when done.
