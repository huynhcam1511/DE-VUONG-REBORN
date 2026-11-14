# Progress — explorer_survey3_3

Last visited: 2026-11-11T16:15:00Z

- [x] Initialized DISPATCH.md and BRIEFING.md
- [x] Investigate `De_Vuong_Webapp/package.json`, test scripts, tsconfig, build status
  - `npm run build` runs `vite build`, completes in 15.69s with 0 errors.
  - `npm test` runs Node test runner with tsx, 23/23 tests pass 100%.
  - `tests/admissionsDebtSync.test.ts` runs 4 tests, 4/4 pass 100%.
- [x] Investigate Firestore collections & schemas (`crm_records`, `customer_profiles`, `sepay_bank_events` / `bank_events`, `ledger_transactions`, `documents`, etc.)
  - Identified 20 `crm_records`, 17 `customer_profiles`, 114 `bank_events`, 182 `ledger_transactions`, 7 `documents`.
- [x] Analyze ghost document patterns and test transactions
  - Ghost stubs identified: `LEA-64817788`, `LEA-96055010`, `LEA-91690914` (empty names, missing code).
  - Unanchored profiles identified: `crm_179*` (real names/phones/emails, but missing `code: LEA-*`).
  - Hashed correlation demonstrated: `crm_1792918953302` hashes to `LEA-96055010`, `crm_1793608413805` hashes to `LEA-64817788`.
  - 28 `expected_revenue` transactions found in `ledger_transactions`.
  - 50+ test transactions in `bank_events` and `ledger_transactions` with `SP111111...`, `TEST...`.
- [x] Design dry-run script architecture and report format (`scripts/reconcileFinanceDataDryRun.ts`)
- [x] Synthesize findings into `handoff.md` and notify parent
