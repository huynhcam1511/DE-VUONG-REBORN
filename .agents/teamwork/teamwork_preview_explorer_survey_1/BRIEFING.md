# BRIEFING — 2026-11-01T17:36:00Z

## Mission
Investigate Sổ cái (Ledger / FinancialLedger / Transactions) and SePay Webhook components/services in De_Vuong_Webapp, focusing on bank transactions, student name resolution, LEA/LRN ID fabrication, and description rendering/truncation.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, reporter
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_1
- Original parent: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Investigate De_Vuong_Webapp (archives is read-only)
- Adhere strictly to AGENTS.md standards

## Current Parent
- Conversation ID: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - `De_Vuong_Webapp/server.ts` (sepayHandler lines 2773-3240)
  - `De_Vuong_Webapp/src/utils/codeGenerator.ts`
  - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
  - `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx`
  - `De_Vuong_Webapp/src/components/admin/CommercialLifecycleBar.tsx`
  - `De_Vuong_Webapp/tests/fin-pay-01.test.ts`
- **Key findings**:
  - Located Ledger UI in `AdminLedgerModule.tsx` and SePay Webhook in `server.ts` (`sepayHandler`).
  - Identified root cause of 'Học viên E-learning' vs actual student name: `server.ts:3025` only queries `customer_profiles` (misses `crm_records`), and `parseLedgerSmartInfo:117` skips lookup when name is 'Học viên E-learning'.
  - Identified root cause of fabricated LRN (`LRN-91690914`): `AdminLedgerModule.tsx:1349` calls `ensureValidBusinessCode(..., 'LRN')` on `tx.studentId` which is `LEA-91690914`, causing `codeGenerator.ts` to substitute prefix `LEA` with `LRN`.
  - Identified root cause of two-line jagged description: `AdminLedgerModule.tsx:1369-1378` renders `originalContent` as a second visible line, and `parseLedgerSmartInfo:183` misses `[SePay-COL]` and `[SePay-HP]`.
  - Identified root cause of R3 (3.000đ + 2.000đ not summing): `CRMAdmissionsModule.tsx:1517` filters out `stx.refCode?.startsWith('COL')` even when `credit > 0`, and `server.ts:3094,3107` overwrites rather than increments `paidAmount`.
- **Unexplored areas**: None for Ledger & SePay survey scope.

## Key Decisions Made
- Fully documented all 4 dispatch survey questions with exact file locations, line numbers, and proposed code changes.

## Artifact Index
- `DISPATCH.md` — Received dispatch instructions
- `progress.md` — Progress tracking and liveness heartbeat
- `handoff.md` — Complete 5-component handoff report
