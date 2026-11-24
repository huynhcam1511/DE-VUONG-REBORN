# BRIEFING — 2026-11-19T09:17:30Z

## Mission
Survey and inspect `StudentDetail.tsx` (and related student profile/ledger components) for class codes, debt tracking, tuition installment quick actions, and transaction ledger persistence.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: Read-only investigation, code surveyor, synthesis
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_2
- Original parent: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Milestone: Survey CRM Phase 2 (StudentDetail & Ledger)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly read/write metadata within own working directory (`.agents/teamwork/explorer_survey_crm_2/`)
- All findings must reference exact files and line numbers
- Concrete recommendations for StudentDetail.tsx ledger, class code anchoring, quick actions, and Firestore persistence

## Current Parent
- Conversation ID: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Updated: 2026-11-19T09:17:30Z

## Investigation State
- **Explored paths**:
  * `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`
  * `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
  * `De_Vuong_Webapp/src/services/paymentService.ts`
  * `De_Vuong_Webapp/src/services/ledgerService.ts`
  * `De_Vuong_Webapp/src/services/userService.ts`
  * `De_Vuong_Webapp/src/types/admin.ts`
  * `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
  * `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx`
  * `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- **Key findings**:
  * Class code `LG4729` is an authentic class reference code from financial ledger history (Row 2, 4, 10, 11, 18, 19 of historical ledger with 2.2M tuition, 500k initial fee, 200k monthly center difference).
  * `StudentDetail.tsx` currently lacks class code on the debt/ledger header.
  * `payments/{studentId}` relies on `debt_recognition` transactions for `totalAmount` calculation; Stage 1 handover must establish initial `debt_recognition` (total tuition) and `partial_payment` (stage 1 paid) to prevent 0đ display.
  * Quick actions `[+ Thu học phí đợt tiếp theo]` and `[+ Nộp phí chênh lệch trung tâm]` require dual persistence (student payment ledger + general ledger `ledger_transactions`).
  * Identified 4 AGENTS.md compliance violations in `StudentDetail.tsx` (Rule 1 th "Thao tác", Rule 1 naked Trash icon, Rule 4 color pills, Rule 4 hover style).
- **Unexplored areas**: None for this survey scope.

## Key Decisions Made
- All findings and architectural recommendations compiled into `handoff.md`.
- Baseline project build verified (`npm run build` in `De_Vuong_Webapp/` passed with 0 errors).

## Artifact Index
- DISPATCH.md — Incoming parent instructions
- BRIEFING.md — Persistent memory
- progress.md — Liveness & status tracking
- handoff.md — Comprehensive 5-component survey report
