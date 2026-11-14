# Dispatch for Survey Explorer 2

## Mission
Investigate R2: Sidebar & UI Consolidation for Finance & Accounting (3 main tabs, redirect routing, Admin Module UI compliance).

## Scope & Working Directory
- Webapp path: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_2`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Canonical repository policy: Only inspect files in `De_Vuong_Webapp/`. NEVER touch `archives/`.

## Key Questions to Answer
1. How is the sidebar currently organized in `AdminLayout.tsx` / `AdminDashboard.tsx` or related files? Which tabs currently exist for Finance & Accounting (`tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, `tab=finance`, `tab=general_ledger`, etc.)?
2. How should the 3 target tabs be structured and integrated:
   - Tab 1: "Sổ cái & Đối soát" (General Ledger + MISA status/export + SePay reconcile queue + read-only raw Bank Feed; remove standalone `tab=misa`; remove duplicate VietQR sub-tab).
   - Tab 2: "Quản lý Công nợ" (B2B corporate debt + B2C student debt with VietQR collection action).
   - Tab 3: "Báo cáo Dòng tiền" (Cashflow Report: Net Revenue, Expense, Profit from actual Ledger transactions, excluding test txs, plus Expected Revenue from B2B + B2C debt).
3. How to implement seamless URL redirection for legacy tabs (`tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, `tab=finance`) to the new tabs and sub-tabs?
4. What UI changes are required in each module to meet 100% of the Admin Module UI standards (AGENTS.md):
   - 3-dot action menu (`MoreVertical`) in rightmost column, empty `<th>`.
   - Freeze panes (`sticky top-0 z-20 bg-white`).
   - 1-row fixed toolbar with `AdminFilterDropdown`.
   - Full-bleed layout (`flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`).
   - No pill/badge styling on IDs or multi-item text lists.

## 2026-11-11T16:08:22Z
[From Parent Agent 029cef84-8361-4084-a50e-50f632a7bb27]
**Context**: Survey Phase
**Content**: Checking in on your progress for R2 Sidebar & UI Consolidation investigation. How is your exploration progressing?
**Action**: Please provide a quick status update or finish your handoff report if ready.
