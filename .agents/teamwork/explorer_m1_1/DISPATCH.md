# Dispatch for Explorer M1-1

## Mission
Investigate and design the exact implementation of `src/domain/financeIdentity.ts` (`resolveFinanceParty`, `isTestTransaction`, `isGenericPlaceholderName`) and unit tests in `tests/admissionsDebtSync.test.ts`.

## Working Directory & Context
- Webapp: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Prior Survey Reports:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_1\handoff.md`
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3\handoff.md`

## Instructions
1. Inspect `src/domain/financeIdentity.ts` if it exists or define its exact exports:
   - `resolveFinanceParty(tx, context)`
   - `isTestTransaction(tx)`
   - `isGenericPlaceholderName(name)`
   - Types: `FinancePartyInput`, `FinancePartyResolution`.
2. Inspect `tests/admissionsDebtSync.test.ts`. Detail what new tests must be added to verify:
   - Genuine LRN and LEA resolution, suppressing placeholders.
   - Exclusion of test transactions (`SP111111...`, `isTest: true`).
   - Clean description parsing for `[LỆNH THU]` without polluting cash flow.
3. Write your report in `handoff.md`.


## 2026-11-11T16:13:01Z
Sender: 029cef84-8361-4084-a50e-50f632a7bb27
Priority: MESSAGE_PRIORITY_HIGH
Content:
You are Explorer M1-1 for Milestone 1 of the Finance Consolidation Project.

Mission: Design the shared identity backbone (`src/domain/financeIdentity.ts`) and unit test suite expansion (`tests/admissionsDebtSync.test.ts`).

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1\DISPATCH.md`
3. Also read `PROJECT.md` at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
4. Canonical Repository Policy:
   - Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
   - NEVER touch or read `archives/`.
5. Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1`
   Update `progress.md` with your status.
6. Write a detailed handoff report in `handoff.md` with:
   - Complete implementation code for `src/domain/financeIdentity.ts` (`resolveFinanceParty`, `isTestTransaction`, `isGenericPlaceholderName`, types).
   - Exact unit tests to add to `tests/admissionsDebtSync.test.ts`.
   - Verification command (`npm test`).

When complete, write `handoff.md` and send a message.
