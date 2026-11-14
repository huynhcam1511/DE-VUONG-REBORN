# Dispatch for Worker M2 (Flash)

## Mission
Implement Milestone 2: Sidebar & UI Consolidation for Finance & Accounting.

## Target Codebase & Working Directory
- Codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Working Directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_flash`
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
1. Update `adminModuleRegistry.ts` with `LEGACY_TAB_REDIRECTS`.
2. Update `App.tsx` with `<Route path="/admin" element={<AdminRedirect />} />`.
3. Update `AdminDashboard.tsx` (sidebar pruning to 3 items, legacy redirect hook, search preservation).
4. Update `AdminLedgerModule.tsx` (Tab 1, Tab 2, Tab 3, UI standards, Modals).
5. Verify `npm test` and `npm run build` in `De_Vuong_Webapp/`.
6. Write `handoff.md`.
