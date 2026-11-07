# BRIEFING — 2026-11-02T09:43:30Z

## Mission
Investigate Requirement R2: Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế trong `LeadPaymentModal.tsx` and related components/hooks.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, reporter
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2
- Original parent: 172bc567-8630-477a-939d-7495c3c6423e
- Milestone: Explorer Survey 2 - LeadPaymentModal & Tuition Debt Sync

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source code files
- Document exact file paths, line numbers, data structures, and function signatures
- Write comprehensive findings to `handoff.md`
- Send completion message to parent when finished

## Current Parent
- Conversation ID: 172bc567-8630-477a-939d-7495c3c6423e
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/components/admin/LeadPaymentModal.tsx`
  - `src/components/admin/CRMAdmissionsModule.tsx`
  - `src/components/admin/CommercialLifecycleBar.tsx`
  - `src/components/admin/AdminLedgerModule.tsx`
  - `src/services/ledgerService.ts`
  - `src/services/userService.ts`
  - `src/utils/codeGenerator.ts`
- **Key findings**:
  1. Header lacks LRN code because `LeadPaymentModalProps.lead` only has `studentId`, not `studentCode`, and header renders only `targetCode` (which defaults to LEA for leads).
  2. `previouslyPaidAmount` is currently unlinked from `allLedgerTransactions`. `handleOpenLeadPayment` only passes `target.paidAmount` from `crm_records` (often 0), causing Ô 2 to suggest full tuition instead of remaining debt and hiding the multi-stage progress bar.
  3. `effectiveTuition` has a stale-state leak when opening from table view rows because `formTuition` is prioritized over `target.tuition`.
  4. VietQR and Ô 3 already react in real time to `collectionAmount` (Ô 2). Once Ô 2 receives the properly computed remaining debt (3.000đ), VietQR immediately reflects 3.000đ and Ô 3 reflects 0đ.
  5. Cross-admission pollution can be prevented by verifying that if a ledger transaction explicitly mentions another LEA code, it is excluded from the current LEA calculation.
- **Unexplored areas**: None for R2 scope.

## Key Decisions Made
- Fully documented 5-component handoff in `handoff.md` with exact before/after code snippets, props, function signatures, and verification steps.

## Artifact Index
- `DISPATCH.md` — Inbound instructions
- `BRIEFING.md` — Situational awareness
- `progress.md` — Heartbeat and activity log
- `handoff.md` — 5-component handoff report
