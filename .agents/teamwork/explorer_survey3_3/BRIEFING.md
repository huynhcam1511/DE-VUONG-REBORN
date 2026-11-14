# BRIEFING — 2026-11-11T16:15:00Z

## Mission
Investigate R1 & R3: Firestore Dry-run Script, Data Models, Test & Build Infrastructure in De_Vuong_Webapp.

## 🔒 My Identity
- Archetype: explorer
- Roles: survey, investigation, synthesis
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Finance Consolidation Survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement production changes.
- Canonical Repository Policy: Only inspect files in `De_Vuong_Webapp/`. NEVER touch `archives/`.
- No modifications or deletes to Firestore during dry-run design.
- Report all findings back via send_message to parent (029cef84-8361-4084-a50e-50f632a7bb27).

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: 2026-11-11T16:15:00Z

## Investigation State
- **Explored paths**:
  - `package.json`, `tsconfig.json`
  - `tests/admissionsDebtSync.test.ts`, `tests/paymentCore.test.ts`
  - `server.ts` (SePay webhook, lines 2775-3355)
  - `src/services/ledgerService.ts`, `src/services/financeService.ts`, `src/services/documentService.ts`
  - `src/components/admin/AdminLedgerModule.tsx`, `src/components/admin/CRMAdmissionsModule.tsx`, `src/components/admin/SepayReconciliationModule.tsx`, `src/components/CourseCheckoutModal.tsx`
  - `src/utils/codeGenerator.ts`, `src/domain/revenue.ts`, `src/domain/practiceIdentity.ts`
  - Live Firestore collections analysis (READ-ONLY) via admin SDK
- **Key findings**:
  1. Build & Test: `npm run build` (`vite build`) passes with 0 errors in 15.69s. `npm test` passes 23/23 tests including `tests/admissionsDebtSync.test.ts` (4/4 pass).
  2. Collections: Raw bank events are stored in `bank_events` (114 docs). General ledger is in `ledger_transactions` (182 docs). Leads in `crm_records` (20 docs) and `customer_profiles` (17 docs). B2B contracts in `documents` (7 docs).
  3. Ghost Docs: 3 ghost stubs found in `crm_records` (`LEA-64817788`, `LEA-91690914`, `LEA-96055010`) with empty names. Correlated with real `crm_179*` documents that hash to these exact LEA numbers.
  4. Missing Code: 8 real lead documents (`crm_179*`) have names/phones/emails but are missing `code: LEA-*`.
  5. Test Transactions: Over 50 test events in `bank_events` and `ledger_transactions` with `SP111111...`, `TEST...`, `TT TEST PHI`.
  6. Expected Revenue: 28 records with `type: 'expected_revenue'` (`[LỆNH THU]`) exist in `ledger_transactions`, distorting actual cash flow.
  7. Dry-run Script: Designed `scripts/reconcileFinanceDataDryRun.ts` to scan and export audit JSON & Markdown without any Firestore writes.
- **Unexplored areas**: None for R1/R3 scope. Ready for handoff.

## Key Decisions Made
- Dry-run script must strictly wrap Firestore with read-only calls and throw on write.
- Recommending unification of `resolveStudentIdentity`, `parseLedgerSmartInfo`, and `server.ts` into `src/domain/financeIdentity.ts` (`resolveFinanceParty`).

## Artifact Index
- DISPATCH.md — Task dispatch and instructions
- progress.md — Liveness heartbeat and progress
- BRIEFING.md — Persistent situational awareness
- inspect_finance_data.mjs — Read-only verification script
- handoff.md — Comprehensive 5-component report
