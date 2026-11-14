# BRIEFING — 2026-11-11T16:23:00Z

## Mission
Investigate and design the exact updates to `CRMAdmissionsModule.tsx` and 3-stream data separation logic for Milestone 1 of Finance Consolidation.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Milestone 1: Data Layer & Identity Backbone

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Canonical Repository Policy: Only inspect files under `De_Vuong_Webapp/`. NEVER touch `archives/`.
- Must follow Admin Module UI Standards in AGENTS.md.
- Ensure `code: canonicalCode` is set on `updated` before local state/storage updates and saved to both `customer_profiles` and `crm_records`.
- Design adoption of `resolveFinanceParty` from `src/domain/financeIdentity.ts`, filter `!isTestTransaction(tx)`, and separate `tx.type !== 'expected_revenue'` in `AdminLedgerModule.tsx`.

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: 2026-11-11T16:23:00Z

## Investigation State
- **Explored paths**:
  - `CRMAdmissionsModule.tsx` lines 3370–3550 (`handleSave`, code preservation, and dual writes to `customer_profiles` & `crm_records`), lines 1858–1875 & 6788–6845 (lead debt calculation).
  - `AdminLedgerModule.tsx` lines 113–326 (`parseLedgerSmartInfo`), lines 838–933 (`filteredTransactions`, `summaryData`, `studentReport`), lines 1200–1280 (MISA export).
  - `src/domain/financeIdentity.ts` contract and implementation architecture.
  - Test suites: `tests/admissionsDebtSync.test.ts`, `tests/empiricalChallengerM1.test.ts`, `tests/challenger_m1_debt_vietqr.test.ts`.
- **Key findings**:
  - Identified root cause in `CRMAdmissionsModule.tsx` `handleSave`: `code` was missing from `updated` and only computed for `docPayload` *after* `setRecords` and `persistCustomRecords`.
  - Identified 3-stream pollution in `AdminLedgerModule.tsx`: test transactions (`SP111111...`) and `expected_revenue` were not excluded from `filteredTransactions`, `summaryData`, `studentReport`, or MISA export.
  - Designed complete domain functions `resolveFinanceParty`, `isTestTransaction`, `isGenericPlaceholderName`, and `calculateLeadDebt` in `src/domain/financeIdentity.ts`.
- **Unexplored areas**: None for M1-3 scope.

## Key Decisions Made
- Re-export `parseLedgerSmartInfo` from `AdminLedgerModule.tsx` as a wrapper around `resolveFinanceParty` to guarantee 100% backward compatibility with existing tests.
- Spreading `...(editingRecord || {})` and attaching `code: canonicalCode` to `updated` upfront in `handleSave`.
- Formalizing `calculateLeadDebt` in `src/domain/financeIdentity.ts` so both CRM and Finance modules share the exact same B2C debt calculation.

## Artifact Index
- `BRIEFING.md` — persistent working memory
- `progress.md` — liveness heartbeat and subtask progress
- `handoff.md` — 5-component handoff report
