# Dispatch for Explorer M1-3

## Mission
Investigate and design the exact updates to `CRMAdmissionsModule.tsx` and 3-stream data separation logic for Milestone 1.

## Working Directory & Context
- Webapp: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Prior Survey Reports:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_1\handoff.md`
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3\handoff.md`

## Instructions
1. Inspect `CRMAdmissionsModule.tsx`:
   - Lines 3480–3520 (`handleSave`): ensure `code: canonicalCode` is attached to `updated` BEFORE `setRecords` and `persistCustomRecords`, and written to both `customer_profiles` and `crm_records`.
   - Inspect lead debt calculation (`tuition - paidAmount > 0`) and verify how CRM exports or presents debt data for finance modules.
2. Inspect `AdminLedgerModule.tsx`:
   - How `resolveFinanceParty` from `src/domain/financeIdentity.ts` should be integrated to replace fragmented identity resolution.
   - How `isTestTransaction` and `tx.type !== 'expected_revenue'` should filter the ledger view and summaries.
3. Write exact recommendations and code snippets in `handoff.md`.


## 2026-11-11T16:13:17Z
You are Explorer M1-3 for Milestone 1 of the Finance Consolidation Project.

Mission: Design the exact updates to `CRMAdmissionsModule.tsx` and 3-stream data separation logic for Milestone 1.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3\DISPATCH.md`
3. Also read `PROJECT.md` at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
4. Canonical Repository Policy:
   - Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
   - NEVER touch or read `archives/`.
5. Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3`
   Update `progress.md` with your status.
6. Write a detailed handoff report in `handoff.md` with:
   - Exact changes to `CRMAdmissionsModule.tsx` `handleSave` to guarantee `code: canonicalCode` is set on `updated` before local state/storage updates and saved to both `customer_profiles` and `crm_records`.
   - Exact changes to `AdminLedgerModule.tsx` to adopt `resolveFinanceParty`, filter `!isTestTransaction(tx)`, and separate `tx.type !== 'expected_revenue'` from actual ledger in/out.
   - Verification steps.

When complete, write `handoff.md` and send a message.
