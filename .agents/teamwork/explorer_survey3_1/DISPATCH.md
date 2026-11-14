# Dispatch for Survey Explorer 1

## Mission
Investigate R1: Data layer & Identity backbone (`resolveFinanceParty`, SePay webhook, CRM, 3-stream data separation, and tests).

## Scope & Working Directory
- Webapp path: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_1`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Canonical repository policy: Only inspect files in `De_Vuong_Webapp/`. NEVER touch `archives/`.

## Key Questions to Answer
1. Where and how are `crm_records` and `customer_profiles` currently resolved and linked? Where are the recent identity fixes located?
2. How should `resolveFinanceParty` be structured and shared across General Ledger, SePay Bank Feed, Debt Management, and MISA?
3. How are the 3 data streams currently handled:
   - Raw Bank Feed (`sepay_bank_events`) and test transaction filtering (`SP111111...`).
   - Sổ cái (`ledger_transactions`): how are `expected_revenue` / `[LỆNH THU]` currently stored/queried, and how to separate them so the ledger only reflects actual money in/out.
   - Expected revenue / Debt: how are B2B contracts/milestones and B2C Leads debt (`tuition - paidAmount > 0`) currently queried and calculated?
4. In `server.ts` (SePay webhook) and `CRMAdmissionsModule.tsx`, what causes ghost records or missing `code: LEA-*`, and what changes are needed?
5. What is the current status of `tests/admissionsDebtSync.test.ts`?


## 2026-11-11T15:57:11Z
[Message from parent: 029cef84-8361-4084-a50e-50f632a7bb27]
You are Survey Explorer 1 for the Finance Consolidation Project.
Investigate Requirement 1 (R1): Data Layer & Identity Backbone (`resolveFinanceParty`, SePay webhook, CRM synchronization, 3-stream data separation, and tests).
Focus areas:
- Where and how `crm_records` and `customer_profiles` are currently resolved and linked in `De_Vuong_Webapp/`. Where are recent identity fixes located?
- Where and how `resolveFinanceParty` should be defined and shared across General Ledger, SePay Bank Feed, Debt Management, and MISA export.
- How the 3 data streams are currently implemented and how they should be cleanly separated (Raw Bank Feed, Ledger, Expected revenue / Debt).
- In `server.ts` (SePay webhook) and `CRMAdmissionsModule.tsx`, what causes ghost records or missing `code: LEA-*`, and what changes are needed to guarantee `code: LEA-*` synchronization on real profiles.
- Examine `tests/admissionsDebtSync.test.ts` to see what is tested and what assertions exist.


## 2026-11-11T16:08:17Z
[Message from parent: 029cef84-8361-4084-a50e-50f632a7bb27]
**Context**: Survey Phase
**Content**: Checking in on your progress for R1 Backbone & Identity investigation. How is your exploration progressing?
**Action**: Please provide a quick status update or finish your handoff report if ready.
