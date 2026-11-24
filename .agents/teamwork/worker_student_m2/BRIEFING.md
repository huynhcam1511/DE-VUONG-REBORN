# BRIEFING — 2026-11-19T09:58:00Z

## Mission
Milestone 2 - Student Detail Payment & Ledger Enhancement: Enhance `StudentDetail.tsx` with class reconciliation code, quick payment collection modal, center differential fee submission modal, AGENTS.md compliant transaction table, and TypeScript error fixes.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_student_m2\
- Original parent: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Milestone: Milestone 2 - Student Detail Payment & Ledger

## 🔒 Key Constraints
- Exclusive file ownership: `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`.
- Do NOT modify `CRMAdmissionsModule.tsx` or any file outside ownership.
- Genuine implementation only, no mock/dummy facades.
- Adhere to AGENTS.md UI standards (Rules 1, 3, 4: table headers, MoreVertical action menu, plain text status with dot, hover state, no pill clutter).
- Verify with `npm run build` in `De_Vuong_Webapp/`.

## Current Parent
- Conversation ID: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Updated: 2026-11-19T09:58:00Z

## Task Summary
- **What to build**:
  1. Show resolved class reconciliation code on debt header in plain mono font `font-mono text-xs font-semibold text-slate-700` (no pill).
  2. Verify 4 stat cards (Total tuition, deposit, paid, remaining debt) reflect `payments/{studentId}` correctly.
  3. Two quick action buttons on debt header:
     - `+ Thu học phí đợt tiếp theo`: Quick collection modal (presets: 900.000 ₫, 2.200.000 ₫, full debt `payment?.debt`, custom amount, method, date, notes) -> updates `paymentService.savePayment` and adds credit transaction to `ledgerService.addTransaction`.
     - `+ Nộp phí chênh lệch trung tâm`: Differential fee modal (e.g. 200.000 ₫/month for LG4729) -> debit transaction to `ledgerService.addTransaction` (`type: 'class_accept'`, debit, credit 0, refCode) and logs to student's `internalNotes`.
  4. Standardize transaction table per AGENTS.md: empty `<th>` for action column, `MoreVertical` action menu replacing raw trash icon, plain text + dot for transaction type, standardized tr hover class `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
  5. Fix 3 TypeScript errors:
     - `student.displayName` -> `student.fullName`
     - `student.phoneNumber` -> `student.phone`
     - `student.enrolledClasses` -> `student.classIds`
  6. Verification with `npm run build`.

## Change Tracker
- **Files modified**: `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` (555 insertions, 51 deletions)
- **Build status**: Pass (Exit code 0, Vite build 17.88s)
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (0 errors in Vite build, 0 errors in StudentDetail.tsx under tsc)
- **Lint status**: Clean
- **Tests added/modified**: Build verification, TypeScript typecheck

## Loaded Skills
None required.

## Artifact Index
- `DISPATCH.md` — assignment details and message log
- `progress.md` — liveness heartbeat
- `handoff.md` — final 5-component report
