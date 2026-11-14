# Dispatch for Worker M1 (Generation 3)

## Mission
Implement Milestone 1: Data Layer & Identity Backbone for the Finance Consolidation Project.

## Working Directory & Context
- Target codebase: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- Worker working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_gen3`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Explorer Reports to Read:
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1\handoff.md` (Domain identity & tests)
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2\handoff.md` (Server.ts webhook)
  - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3\handoff.md` (CRM & 3-stream separation)

## Mandatory Integrity Warning
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Exclusive Write Ownership
You own and may edit ONLY the following files in `De_Vuong_Webapp/`:
1. `src/domain/financeIdentity.ts` (create new)
2. `server.ts`
3. `src/components/admin/CRMAdmissionsModule.tsx`
4. `src/components/admin/AdminLedgerModule.tsx`
5. `tests/admissionsDebtSync.test.ts`
NEVER edit any other files. NEVER touch `archives/`.

## Tasks
1. Create `src/domain/financeIdentity.ts` with:
   - `FinancePartyInput`, `FinancePartyResolution` interfaces.
   - `resolveFinanceParty(tx, context)` resolving genuine LRN, LEA, B2B partner, suppressing placeholders.
   - `isTestTransaction(tx)` identifying test events (`SP111111...`, `TEST`).
   - `isGenericPlaceholderName(name)`.
   - `cleanTransactionDescription(desc)`.
   - `calculateLeadDebt(record, ledgerTransactions)`.
2. Update `server.ts`:
   - Tag test transactions across all 4 write sites with `isTest: true`, `status: 'test'`.
   - In `findBestLeadDoc` and LEA order matching: update `code: fullLeaCode` directly on existing real profile doc (`canonicalProfileId`) with `{ merge: true }`.
   - Eliminate code creating ghost stub `crm_records/fullLeaCode`.
3. Update `src/components/admin/CRMAdmissionsModule.tsx`:
   - In `handleSave`: ensure `code: canonicalCode` is assigned directly to `updated` before calling `setRecords(next)` and `persistCustomRecords(next)`.
   - Write `docPayload` containing `code: canonicalCode`, `fullName`, and `updatedAt` to both `customer_profiles` and `crm_records`.
4. Update `src/components/admin/AdminLedgerModule.tsx`:
   - Re-export `parseLedgerSmartInfo` by delegating to `resolveFinanceParty`.
   - Filter `!isTestTransaction(tx)` in `filteredTransactions`.
   - Filter `tx.type !== 'expected_revenue' && !isTestTransaction(tx)` in official ledger and summaries.
5. Update `tests/admissionsDebtSync.test.ts`:
   - Add automated test cases for `resolveFinanceParty`, `isTestTransaction`, and 3-stream separation.
6. Verification:
   - Run `npm test` in `De_Vuong_Webapp` (must pass 100%).
   - Run `npm run build` in `De_Vuong_Webapp` (must pass with exit code 0).
7. Write `handoff.md` with:
   - Observation, Logic Chain, Caveats, Conclusion, Verification Results.


## 2026-11-11T16:24:26Z
You are Worker M1 (Generation 3) for Milestone 1 of the Finance Consolidation Project.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_gen3\DISPATCH.md`
3. You MUST read the 3 explorer reports at:
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1\handoff.md`
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_2\handoff.md`
   - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_3\handoff.md`
4. Also read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Canonical Repository Policy:
- Only modify files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
- NEVER touch `archives/`.

Exclusive Write Ownership:
You own and may edit ONLY the following files:
1. `De_Vuong_Webapp/src/domain/financeIdentity.ts`
2. `De_Vuong_Webapp/server.ts`
3. `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
4. `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
5. `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts`

Working directory for your metadata and handoff report:
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_gen3`

Execute all 7 tasks listed in `DISPATCH.md`. Run `npm test` and `npm run build` inside `De_Vuong_Webapp/` to verify your changes. Document your implementation and verification in `handoff.md`, then send a message when complete.


## 2026-11-11T16:34:56Z
**Context**: Milestone 1 Implementation
**Content**: Checking in on your progress. We see `financeIdentity.ts` has been created. How are the remaining updates (`server.ts`, `CRMAdmissionsModule.tsx`, `AdminLedgerModule.tsx`, and tests) going?
**Action**: Please provide a brief status update or continue toward completion.
