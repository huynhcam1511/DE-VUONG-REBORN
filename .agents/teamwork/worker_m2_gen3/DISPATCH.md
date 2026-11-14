# Dispatch for Worker M2 (Generation 3)

## Mission
Implement Milestone 2: Sidebar & UI Consolidation for Finance & Accounting.

## Target Codebase & Working Directory
- Codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Working Directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_gen3`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Reference Explorer Reports:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_1\handoff.md` (Sidebar, Redirects, App.tsx)
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_2\handoff.md` (Tab 1 Sổ cái & Đối soát)
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_3\handoff.md` (Tab 2 Công nợ & Tab 3 Dòng tiền, Admin UI standards)

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusive Write Ownership
You own and may edit ONLY the following files:
1. `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
2. `De_Vuong_Webapp/src/components/admin/adminModuleRegistry.ts`
3. `De_Vuong_Webapp/src/App.tsx`
4. `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
5. `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx`
NEVER edit any other files. NEVER touch `archives/`.

## Tasks
1. **Sidebar Menu Pruned to 3 Items (`AdminDashboard.tsx`)**:
   - In `menuGroups` under `id: 'finance_group'`, keep exactly 3 items:
     - `ledger`: "Sổ cái & Đối soát"
     - `receivables`: "Quản lý Công nợ"
     - `cashflow`: "Báo cáo Dòng tiền"
   - Completely remove `misa` and `sepay_reconcile` from the sidebar menu.

2. **Backward-Compatible Redirects (`AdminDashboard.tsx`, `adminModuleRegistry.ts`, `App.tsx`)**:
   - Define `LEGACY_TAB_REDIRECTS` in `adminModuleRegistry.ts` (`misa` -> `ledger&sub=misa`, `sepay_reconcile` -> `ledger&sub=reconcile`, `sepay` -> `ledger&sub=reconcile`, `finance` -> `ledger`, `deals` -> `leads`).
   - In `AdminDashboard.tsx`: initialize `initialAdminTab` with redirected tab, apply redirect in `useEffect` with `{ replace: true }`, and preserve `search` and `q` parameters.
   - In `App.tsx`: add `<Route path="/admin" element={<AdminRedirect />} />` redirecting `/admin` to `/admin/dashboard${location.search}`.

3. **Tab 1: Sổ cái & Đối soát (`AdminLedgerModule.tsx`)**:
   - Sub-tab 1: Sổ cái Thu/Chi (MISA status dot `• Đã hạch toán` / `• Chưa hạch toán`, filters, CSV export, mark accounted row action).
   - Sub-tab 2: Hàng đợi Đối soát SePay (unmatched bank feed items, actions to assign LEA lead or B2B contract, or mark test `SP111111...` / ignore; remove duplicate VietQR creator sub-tab).
   - Sub-tab 3: Lịch sử Bank Feed (read-only view from `bank_events`).

4. **Tab 2: Quản lý Công nợ (`AdminLedgerModule.tsx`)**:
   - Sub-tab 1: Công nợ Doanh nghiệp (B2B contract milestones). Remove raw `<button>Thu tiền</button>`, use 3-dot `MoreVertical` action menu with empty `<th>`.
   - Sub-tab 2: Công nợ Học viên (B2C from CRM leads where `remainingDebt > 0`). Action menu "Thu tiền (Tạo VietQR)" triggers `LeadPaymentModal`.
   - Plain mono text for all IDs (`font-mono text-xs font-semibold text-slate-700`) without grey pills.

5. **Tab 3: Báo cáo Dòng tiền (`AdminLedgerModule.tsx`)**:
   - Net Revenue and Expense computed strictly from actual non-test ledger transactions (`!isTestTransaction` and not `expected_revenue`).
   - Expected Revenue (Dự thu) computed from real commercial debt (`B2B Outstanding Milestones + B2C Outstanding Leads Debt`).
   - Freeze panes `sticky top-0 z-20 bg-white`, full-bleed layout `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.

6. **Verification**:
   - Run `npm test` in `De_Vuong_Webapp/` (all tests pass).
   - Run `npm run build` in `De_Vuong_Webapp/` (clean exit code 0).
7. Write comprehensive `handoff.md` with:
   - Observation, Logic Chain, Caveats, Conclusion, Verification Results.


## 2026-11-11T17:03:01Z
[Message] timestamp=2026-11-11T17:03:01Z sender=029cef84-8361-4084-a50e-50f632a7bb27 priority=MESSAGE_PRIORITY_HIGH
You are Worker M2 (Generation 3) for Milestone 2 (Sidebar & UI Consolidation) of the Finance Consolidation Project.
