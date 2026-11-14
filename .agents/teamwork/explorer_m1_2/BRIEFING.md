# BRIEFING — 2026-11-11T16:22:30Z

## Mission
Design the exact updates to `server.ts` (SePay webhook) to tag test transactions and eliminate ghost stubs.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, synthesizer
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2
- Original parent: 029cef84-8361-4084-a50e-50f632a7bb27
- Milestone: Milestone 1: Data Layer & Identity Backbone

## 🔒 Key Constraints
- Read-only investigation — do NOT implement directly in `server.ts` during exploration
- Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- NEVER touch or read `archives/`

## Current Parent
- Conversation ID: 029cef84-8361-4084-a50e-50f632a7bb27
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`, `PROJECT.md`
  - `explorer_survey3_1/handoff.md`, `explorer_survey3_3/handoff.md`
  - `server.ts` (lines 1–65, 2050–2070, 2740–3370)
  - `src/types/admin.ts` (Transaction interface)
  - `src/server/paymentCore.ts`, `src/utils/codeGenerator.ts`
  - `src/components/CourseCheckoutModal.tsx`, `CRMAdmissionsModule.tsx`
  - Test suites: `paymentCore.test.ts`, `admissionsDebtSync.test.ts`, `fin-pay-01.test.ts`, `localPaymentFlow.test.ts`, challenger tests
- **Key findings**:
  - `sepayHandler` in `server.ts` (lines 2777–3352) has 4 distinct write sites to `bank_events` and `ledger_transactions`:
    1. Helper `recordLedgerEvent` (lines 2823–2840)
    2. Payment intent refund (lines 2894–2900)
    3. Payment intent exact match (lines 2972–2988)
    4. LEA order match (lines 3149–3179)
  - Ghost stubs were historically caused by lines 3212–3226: when `crmMatchedRef` was null (or mismatched), it executed `tx.set(db.collection('crm_records').doc(fullLeaCode), ...)` creating a document keyed by `fullLeaCode` instead of the genuine `customerProfileRef.id` (`crm_179...`).
  - By resolving the canonical profile ID across `customer_profiles` and `crm_records` (`canonicalProfileId = matchedProfileDoc.id || matchedCrmDoc.id`), and setting `code: fullLeaCode` directly on both documents via `{ merge: true }`, ghost stubs are 100% eliminated.
  - Test transactions (`isTest: true`) are detected via `isTestTransaction` and pattern matching on `sepayId` (`/^1{5,}/`), `refCode` (`/^SP1{5,}/`), and `content` (`\bTEST\b`, `\bTHU NGHIEM\b`). They receive `isTest: true, status: 'test'` on `bank_events` and `ledger_transactions`, and do not alter real customer payment balances.
- **Unexplored areas**: None for M1-2 scope.

## Key Decisions Made
- Formulate complete before-and-after diffs for all 4 write sites and `findBestLeadDoc` / profile reconciliation in `server.ts`.
- Document verification steps using `npm test` and targeted integration checks.

## Artifact Index
- `.agents/teamwork/explorer_m1_2/DISPATCH.md` — Inbound instructions
- `.agents/teamwork/explorer_m1_2/progress.md` — Liveness heartbeat
- `.agents/teamwork/explorer_m1_2/handoff.md` — Final handoff report
