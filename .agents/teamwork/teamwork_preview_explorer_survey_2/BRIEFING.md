# BRIEFING — 2026-11-01T17:38:00Z

## Mission
Investigate CRM Tuyển sinh (Leads), Learner management, LEA-XXXXXXXX vs LRN-XXXXXXXX mapping, and cross-module resolution between Ledger transactions and CRM Lead/Learner records.

## 🔒 My Identity
- Archetype: explorer
- Roles: Explorer - CRM Leads Mapping
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_2
- Original parent: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Milestone: Investigation & Analysis

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Work only in c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp for codebase inspection
- Write reports and artifacts only in your own folder: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_2

## Current Parent
- Conversation ID: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/components/admin/CRMAdmissionsModule.tsx` (Admissions, Leads, activeCollectionOrder)
  - `src/components/admin/AdminLedgerModule.tsx` (Sổ cái Thu/Chi, parseLedgerSmartInfo, Table rendering)
  - `src/components/admin/CommercialLifecycleBar.tsx` (Commercial timeline, collection order status)
  - `src/services/userService.ts` (UserProfile, getStudentCode, student_code_internal)
  - `src/utils/codeGenerator.ts` (ensureValidBusinessCode prefix replacement)
  - `server.ts` (SePay webhook handler, paidAmount overwriting, ghost stub in crm_records)
  - Live Firestore data queries (`users`, `crm_records`, `customer_profiles`, `ledger_transactions`, `bank_events`)
- **Key findings**:
  - Identified exact root causes of:
    1. Fake `LRN-91690914` generated from `ensureValidBusinessCode(tx.studentId, 'LRN')` when `tx.studentId` is `'LEA-91690914'`.
    2. Inconsistent student names ('Học viên E-learning' vs 'Nguyễn Thị Anh Thi') caused by non-triggering lookup when `studentName` is `'Học viên E-learning'` and matching empty stub in `crm_records`.
    3. Failure to accumulate payment in Phiếu thu (`COL`): `server.ts` overwrites `paidAmount: amount_in` instead of accumulating, and `activeCollectionOrder` in `CRMAdmissionsModule` takes only `matched[0]` and filters out `refCode.startsWith('COL')`.
    4. Description duplication and row height expansion from rendering `tx.originalContent` on a second line.
- **Unexplored areas**: None, all 4 investigation tasks fully answered with exact file paths and line numbers.

## Key Decisions Made
- Fully documented root causes and actionable 4-step resolution strategy in `handoff.md`.

## Artifact Index
- handoff.md — 5-component handoff report to parent
