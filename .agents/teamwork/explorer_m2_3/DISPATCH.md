# Dispatch for Explorer M2-3

## Mission
Investigate and design the exact updates for Tab 2 ("Quản lý Công nợ") and Tab 3 ("Báo cáo Dòng tiền") inside `AdminLedgerModule.tsx` and related components.

## Working Directory & Context
- Target codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_3`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Reference Survey Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_2\handoff.md`

## Key Questions & Tasks
1. Structure Tab 2 ("Quản lý Công nợ"):
   - Sub-tab 1: Công nợ Doanh nghiệp (B2B contract milestones from `documents` collection).
   - Sub-tab 2: Công nợ Học viên (B2C from CRM leads where `tuition - paidAmount > 0`).
   - Collection action: "Thu tiền" on student debt opens `LeadPaymentModal` with dynamic VietQR. On B2B debt, opens contract milestone payment recorder.
   - Row actions: MUST be housed inside 3-dot `MoreVertical` action menu per AGENTS.md Rule 1 (no raw `<button>Thu tiền</button>`).
2. Structure Tab 3 ("Báo cáo Dòng tiền"):
   - Net Revenue, Total Expense, Net Profit calculated strictly from actual non-test ledger transactions (`!tx.isTest` and not `SP111111...`).
   - Expected Revenue (Dự thu) calculated from real outstanding commercial debt (B2B unpaid milestones + B2C unpaid leads debt) instead of summing `expected_revenue` ledger records.
3. Check Admin Module UI compliance:
   - Freeze panes (`sticky top-0 z-20 bg-white`).
   - Single-row fixed toolbar using `AdminFilterDropdown`.
   - Full-bleed layout (`flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`).
   - Font-mono plain text for IDs without pill/badge styling.
4. Write your findings and exact diffs in `handoff.md`.


## 2026-11-11T16:54:23Z
You are Explorer M2-3 for Milestone 2 of the Finance Consolidation Project.
Mission: Design the exact architecture and implementation for Tab 2 ("Quản lý Công nợ") and Tab 3 ("Báo cáo Dòng tiền") inside `AdminLedgerModule.tsx` and related components, including 100% AGENTS.md Admin Module UI compliance.
