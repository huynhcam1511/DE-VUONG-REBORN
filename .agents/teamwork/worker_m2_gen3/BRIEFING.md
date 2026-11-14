# BRIEFING — 2026-11-11T17:05:00Z

## Mission
Implement Milestone 2: Sidebar & UI Consolidation for Finance & Accounting in De_Vuong_Webapp.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_gen3
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Milestone 2: Sidebar & UI Consolidation

## 🔒 Key Constraints
- Exclusive write ownership:
  1. `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
  2. `De_Vuong_Webapp/src/components/admin/adminModuleRegistry.ts`
  3. `De_Vuong_Webapp/src/App.tsx`
  4. `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  5. `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx`
- Only modify files under `De_Vuong_Webapp/`.
- NEVER touch `archives/`.
- DO NOT CHEAT. All implementations must be genuine.

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: 2026-11-11T17:05:00Z

## Task Summary
- **What to build**:
  1. Sidebar Finance Menu pruned to 3 items: "Sổ cái & Đối soát", "Quản lý Công nợ", "Báo cáo Dòng tiền".
  2. Backward-compatible URL redirects for `tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, `tab=finance`, `tab=deals`, and route `/admin` -> `/admin/dashboard` preserving query params (`search`, `q`).
  3. Tab 1 ("Sổ cái & Đối soát") in `AdminLedgerModule.tsx`: Sổ cái Thu/Chi (MISA dot, filters, CSV export, mark accounted), Hàng đợi đối soát SePay (unmatched txs, assign LEA lead or B2B contract, mark test `SP111111...` / ignore), Bank Feed history (read-only stream from `bank_events`), remove duplicate VietQR creator subtab.
  4. Tab 2 ("Quản lý Công nợ"): B2B contract milestones + B2C student debt (`tuition - paidAmount > 0`), 3-dot `MoreVertical` action menu with empty `<th>`, "Thu tiền (Tạo VietQR)" triggers `LeadPaymentModal`, plain mono IDs without pills.
  5. Tab 3 ("Báo cáo Dòng tiền"): Net Revenue/Expense from actual non-test ledger transactions, Expected Revenue from real commercial debt (`B2B + B2C`), freeze panes, full-bleed layout.
- **Success criteria**:
  - `tests/admissionsDebtSync.test.ts` pass 100%.
  - `npm run build` succeeds cleanly.
  - All Admin Module UI standards met.
- **Interface contracts**: `PROJECT.md`
- **Code layout**: `PROJECT.md § Code Layout`

## Change Tracker
- **Files modified**: None yet
- **Build status**: Initial baseline passed
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (initial baseline 28 tests)
- **Lint status**: clean
- **Tests added/modified**: TBD

## Loaded Skills
None requested.
