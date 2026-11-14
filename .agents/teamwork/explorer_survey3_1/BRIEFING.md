# BRIEFING — 2026-11-11T16:10:00Z

## Mission
Investigate R1: Data Layer & Identity Backbone (`resolveFinanceParty`, SePay webhook, CRM synchronization, 3-stream data separation, and tests) for Finance Consolidation Project.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_1
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Finance Consolidation Survey R1

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Canonical repository policy: Only inspect files in `De_Vuong_Webapp/`. NEVER touch `archives/`.
- No writes outside `.agents/teamwork/explorer_survey3_1/`.

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: 2026-11-11T16:08:17Z (parent check-in received)

## Investigation State
- **Explored paths**:
  - `tests/admissionsDebtSync.test.ts`, `tests/paymentCore.test.ts`, `tests/challenger_m1_debt_vietqr.test.ts`, `tests/empiricalChallengerM1.test.ts`
  - `src/components/admin/CRMAdmissionsModule.tsx`, `src/components/admin/AdminLedgerModule.tsx`, `src/components/admin/SepayReconciliationModule.tsx`, `src/components/admin/LeadPaymentModal.tsx`
  - `src/components/AdminDashboard.tsx`, `src/services/financeService.ts`, `src/services/paymentService.ts`, `src/services/documentService.ts`
  - `server.ts` (SePay webhook, lines 2776-3356), `src/server/paymentCore.ts`, `src/utils/codeGenerator.ts`, `src/domain/practiceIdentity.ts`, `src/domain/revenue.ts`
- **Key findings**:
  1. `crm_records` vs `customer_profiles`: dual collections in Firestore. `CRMAdmissionsModule.tsx` reads and merges both. Recent identity fixes in `AdminLedgerModule.tsx` (`parseLedgerSmartInfo`) and `server.ts` bridge hashed IDs (e.g. `crm_1792918953302`) to genuine `LRN-*` and suppress placeholder ghost stubs.
  2. Root cause of ghost stubs: When leads were saved without explicit `code: LEA-*`, incoming SePay transactions created new docs `crm_records/LEA-*` with placeholder names. Also `LeadPaymentModal.tsx` inserts `expected_revenue` into `ledger_transactions`.
  3. 3-stream data separation: Raw Bank Feed (`bank_events`), Ledger (`ledger_transactions`), and Debt (B2B contracts milestones + B2C leads where `tuition - paidAmount > 0`). Test transactions (`SP111111...`) need explicit `isTest: true` tagging and must be filtered out of revenue totals.
  4. `resolveFinanceParty`: should be defined in `src/domain/financeIdentity.ts` and shared across Ledger, Bank Feed, Receivables, and MISA export.
  5. `tests/admissionsDebtSync.test.ts` currently passes 100% (4/4 tests). Ready to add test cases for `resolveFinanceParty` and 3-stream separation.
- **Unexplored areas**: None for R1 scope.

## Key Decisions Made
- Define `resolveFinanceParty` in `src/domain/financeIdentity.ts` for clean shared domain architecture.
- Structure dry-run script `scripts/audit_finance_identity_dryrun.mjs` to be 100% read-only with structured markdown/JSON reporting.

## Artifact Index
- DISPATCH.md — incoming instructions & timestamps
- BRIEFING.md — persistent situational awareness
- progress.md — liveness heartbeat
- handoff.md — 5-component handoff report
