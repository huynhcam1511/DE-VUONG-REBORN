# Dispatch for Explorer M1-2

## Mission
Investigate and design the exact updates to `server.ts` (SePay webhook) to tag test transactions and eliminate ghost stubs.

## Working Directory & Context
- Webapp: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Prior Survey Reports:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_1\handoff.md`
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3\handoff.md`

## Instructions
1. Inspect `server.ts` lines 2750–3260:
   - Where SePay webhook receives bank events and creates `bank_events` and `ledger_transactions`.
   - How `isTest: true` should be assigned to `bank_events` and `ledger_transactions` when `sepayId` or `refCode` starts with `SP111111...` or content has `TEST`.
   - In `findBestLeadDoc` and transaction writes (lines 3040–3250): ensure that when a real profile (`crm_179...` or customer profile) matches, it sets `code: fullLeaCode` on that real document, and NEVER creates a new nameless stub `crm_records/fullLeaCode`.
2. Provide exact code diffs and safety considerations in `handoff.md`.


## 2026-11-11T16:13:09Z
You are Explorer M1-2 for Milestone 1 of the Finance Consolidation Project.

Mission: Design the exact updates to `server.ts` (SePay webhook) to tag test transactions and eliminate ghost stubs.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2\DISPATCH.md`
3. Also read `PROJECT.md` at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
4. Canonical Repository Policy:
   - Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
   - NEVER touch or read `archives/`.
5. Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2`
   Update `progress.md` with your status.
6. Write a detailed handoff report in `handoff.md` with:
   - Exact line numbers and code changes in `server.ts` to tag test transactions (`isTest: true`, `status: 'test'`).
   - Exact line numbers and code changes in `server.ts` to update `code: fullLeaCode` directly on existing real profile doc, preventing ghost stub creation.
   - Verification steps.

When complete, write `handoff.md` and send a message.
