# Dispatch for Explorer M2-2

## Mission
Investigate and design the exact updates for Tab 1 ("Sổ cái & Đối soát") inside `AdminLedgerModule.tsx` and related components.

## Working Directory & Context
- Target codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_2`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Reference Survey Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_2\handoff.md`

## Key Questions & Tasks
1. Structure Tab 1 ("Sổ cái & Đối soát") with 3 sub-tabs:
   - Sub-tab 1: Sổ cái Thu/Chi (official confirmed transactions, MISA status dot, period/status filters, CSV export button, row action to mark accounted).
   - Sub-tab 2: Hàng đợi Đối soát SePay (unmatched bank feed transactions, actions to assign LEA lead or B2B contract or mark test `SP111111...` / ignore; eliminate duplicate VietQR creator sub-tab).
   - Sub-tab 3: Lịch sử Bank Feed (read-only list of raw bank events from SePay webhook).
2. Check how `SepayReconciliationModule.tsx` is integrated or embedded cleanly into `AdminLedgerModule.tsx`.
3. Check Admin Module UI compliance:
   - 3-dot `MoreVertical` action menu on rightmost column, empty `<th>` (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`).
   - Freeze panes (`sticky top-0 z-20 bg-white`).
   - Single-row fixed toolbar using `AdminFilterDropdown`.
   - Full-bleed layout (`flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`).
   - Font-mono plain text for IDs without pill/badge styling.
4. Write your findings and exact diffs in `handoff.md`.


## 2026-11-11T16:54:13Z
Sender: 029cef84-8361-4084-a50e-50f632a7bb27
You are Explorer M2-2 for Milestone 2 of the Finance Consolidation Project.

Mission: Design the exact architecture and implementation for Tab 1 ("Sổ cái & Đối soát") inside `AdminLedgerModule.tsx` and related components.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_2\DISPATCH.md`
3. Read `PROJECT.md` at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
4. Read Survey Explorer 2's report at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_2\handoff.md`

Canonical Repository Policy:
- Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
- NEVER touch `archives/`.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_2`

Produce a comprehensive report with exact code changes and line numbers in `handoff.md`, then send a message.
