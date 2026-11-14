# BRIEFING — 2026-11-11T17:05:00Z

## Mission
Design exact architecture and implementation for Tab 2 ("Quản lý Công nợ") and Tab 3 ("Báo cáo Dòng tiền") in `AdminLedgerModule.tsx` and related components with 100% AGENTS.md Admin Module UI compliance.

## 🔒 My Identity
- Archetype: explorer
- Roles: Teamwork explorer
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m2_3
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Milestone 2: Sidebar & UI Consolidation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Only inspect files under c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/
- NEVER touch archives/
- Comply with AGENTS.md Admin Module UI Standards

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`, `PROJECT.md`, `DISPATCH.md`, Survey Explorer 2's `handoff.md`.
  - `AdminLedgerModule.tsx` (all 2447 lines: state, receivables, summary, misa, modals).
  - `LeadPaymentModal.tsx` (props, dynamic VietQR, SePay memo format, collection logging).
  - `src/domain/financeIdentity.ts` (`calculateLeadDebt`, `resolveFinanceParty`, `isTestTransaction`).
  - `AdminRowActions.tsx`, `AdminFilterDropdown.tsx`.
  - Unit test suite `tests/admissionsDebtSync.test.ts` (28/28 passed).
  - Production build `npm run build` (passed in 14.60s, zero compilation errors).
- **Key findings**:
  - Tab 2 ("Quản lý Công nợ"): Requires two segmented sub-tabs (`b2b` and `b2c`).
    - B2B Corporate Debt: Driven by `contracts` (`documents` collection) milestone tracking with `payingMilestone` recording modal. Must replace naked `<button>Thu tiền</button>` with `AdminRowActions` (`MoreVertical`) and empty `<th>`.
    - B2C Student Debt: Driven by `calculateLeadDebt` over `allCrmRecords` and `transactions` where `remainingDebt > 0`. "Thu tiền (Tạo VietQR)" triggers `LeadPaymentModal` with auto-filled lead data.
  - Tab 3 ("Báo cáo Dòng tiền"):
    - Net Revenue (Credit) and Expense (Debit) strictly calculated from actual non-test ledger transactions (`!isTestTransaction(tx)` and `tx.type !== 'expected_revenue'`).
    - Expected Revenue (Dự thu) completely decoupled from `expected_revenue` transactions, calculated as `B2B Outstanding Milestones + B2C Outstanding Leads Debt`.
  - 100% AGENTS.md Admin Module UI Compliance:
    - Empty `<th>` on action column.
    - `AdminRowActions` with `MoreVertical`.
    - Freeze panes `sticky top-0 z-20 bg-white`.
    - Full-bleed edge-to-edge layout (`flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`).
    - Plain text mono format for IDs (`CTR-*`, `PRT-*`, `LEA-*`, `LRN-*`), strictly no badge/pill styling.
- **Unexplored areas**: None. Scope fully investigated and verified.

## Key Decisions Made
- Tab 2 will use a single-row toolbar toggle for B2B vs B2C debt sub-tabs, maintaining `AdminFilterDropdown` for status filtering.
- B2C debt collection will directly instantiate `LeadPaymentModal` within `AdminLedgerModule.tsx`.
- All row actions use `AdminRowActions` with `MoreVertical`, eliminating raw `<button>` elements.

## Artifact Index
- `.agents/teamwork/explorer_m2_3/BRIEFING.md` — Persistent state index
- `.agents/teamwork/explorer_m2_3/progress.md` — Liveness heartbeat
- `.agents/teamwork/explorer_m2_3/handoff.md` — Final 5-component handoff report
