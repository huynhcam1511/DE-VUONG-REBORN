# BRIEFING — 2026-11-17T16:12:00Z

## Mission
Implement Milestone 2: Admissions & Revenue Financial Integration in `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`, including intake fee payment source selector (cash vs surplus fund offset with live balance), automated refund crediting on non-start deals, corporate VAT invoice calculation card, net cashflow logic, and persistence.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_1\
- Original parent: e1dcf4d0-0a1d-44d3-a061-ad2467493128
- Milestone: Milestone 2 (Admissions Financial Integration)

## 🔒 Key Constraints
- Write ownership: strictly De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx
- Read-only: archives/
- No fake/dummy code, no hardcoded values. Real logic and state.
- Strictly adhere to AGENTS.md rules (read-only cells, 3-dot action menu, sticky header, full-bleed table, etc.)
- Run npm run lint and npm run build in De_Vuong_Webapp/ to verify 0 errors.

## Current Parent
- Conversation ID: e1dcf4d0-0a1d-44d3-a061-ad2467493128
- Updated: 2026-11-17T16:00:16Z

## Task Summary
- **What to build**:
  1. `CRMRecord` data schema extensions (`intakeFeePaymentSource`, `vatSurchargePercent`, `vatInvoicedAmount`, `intermediaryFeeAmount`, `netCashflowAmount`).
  2. Live `availableSurplusFund` calculation via subscription to `ledger_transactions`.
  3. Intake fee payment source selector in financial section with live surplus fund balance, fund validation, and ledger deduction recording when `surplus_offset` is used.
  4. Automated Quỹ Phí Dư refund crediting (`class_cancel_surplus`) on lead status `Đã hủy` or Non-Start, with duplicate prevention.
  5. Corporate VAT invoice calculator card (base price, 10% VAT surcharge, invoice amount, 8% intermediary fee, net received).
  6. Net cashflow ribbon and table updates.
  7. Form state management & persistence to Firestore (`customer_profiles` and `crm_records`).
- **Success criteria**:
  - All requested features working reactively.
  - Verification with `npm test` and `npm run build` passing with 0 errors.
- **Interface contracts**: PROJECT.md, AGENTS.md
- **Code layout**: De_Vuong_Webapp/

## Key Decisions Made
- Extended `calculateNetCashflow` with an optional 5th parameter object for options (`hasInvoiceDemand`, `vatSurchargePercent`, `intermediaryFeePercent`, `intakeFeePaymentSource`) so that existing calls without options remain 100% backwards-compatible.
- Implemented real-time fund balance filtering to strictly exclude `isTestTransaction(tx)` and only sum non-test ledger surplus amounts.
- Designed automated refund transaction creation with an idempotency guard (`allLedgerTransactions.find`) to prevent double-crediting when an admin repeatedly edits or saves a non-start lead.
- Typecast legacy ledger transaction type assertions cleanly to satisfy `tsc --noEmit` with 0 errors in target file.

## Artifact Index
- DISPATCH.md — dispatch instructions
- BRIEFING.md — persistent memory
- progress.md — liveness heartbeat
- handoff.md — final handoff report

## Change Tracker
- **Files modified**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Build status**: PASS (`npm run build` exit code 0, 3788 modules transformed, built in 17s)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (`npm test` 28/28 tests passed, `npm run build` passed)
- **Lint status**: 0 errors in `CRMAdmissionsModule.tsx`
- **Tests added/modified**: Verified against all existing tests in `tests/admissionsDebtSync.test.ts`
