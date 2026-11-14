# Dispatch for Explorer M2-1

## Mission
Investigate and design the exact updates for sidebar menu consolidation, legacy URL redirects, and route handling across `AdminDashboard.tsx`, `adminModuleRegistry.ts`, and `App.tsx`.

## Working Directory & Context
- Target codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_1`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Reference Survey Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_2\handoff.md`

## Key Questions & Tasks
1. In `AdminDashboard.tsx` (`menuGroups` under `id: 'finance_group'`), specify the exact 3 items:
   - `id: 'ledger'`, `label: 'Sổ cái & Đối soát'`, `icon: CreditCard`
   - `id: 'receivables'`, `label: 'Quản lý Công nợ'`, `icon: FileSpreadsheet`
   - `id: 'cashflow'`, `label: 'Báo cáo Dòng tiền'`, `icon: TrendingUp`
   (Remove standalone `misa` and `sepay_reconcile` from the sidebar menu).
2. Specify the exact backward-compatible redirect dictionary and `useEffect` logic in `AdminDashboard.tsx`:
   - `tab=misa` -> `tab=ledger&sub=misa`
   - `tab=sepay_reconcile` -> `tab=ledger&sub=reconcile`
   - `tab=sepay` -> `tab=ledger&sub=reconcile` (preserving search query)
   - `tab=finance` -> `tab=ledger`
3. In `adminModuleRegistry.ts`: update tab mappings and metadata so legacy keys route cleanly without type or lookup errors.
4. In `App.tsx`: verify route `<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />`.
5. Write your findings and exact diffs in `handoff.md`.

## 2026-11-11T16:54:06Z
[Message from 029cef84-8361-4084-a50e-50f632a7bb27]
You are Explorer M2-1 for Milestone 2 of the Finance Consolidation Project.

Mission: Design the exact sidebar navigation consolidation, legacy URL redirects, and routing across `AdminDashboard.tsx`, `adminModuleRegistry.ts`, and `App.tsx`.
