# Dispatch for Survey Explorer 3

## Mission
Investigate R1/R3: Firestore Dry-run Script, Data Models, Test & Build Infrastructure (`npm run build`, `npm test`, dry-run reporting).

## Scope & Working Directory
- Webapp path: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Agent working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3`
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Canonical repository policy: Only inspect files in `De_Vuong_Webapp/`. NEVER touch `archives/`.

## Key Questions to Answer
1. What Firestore collections are used across the finance system (`crm_records`, `customer_profiles`, `sepay_bank_events`, `ledger_transactions`, `contracts`, etc.) and what are their schemas?
2. What are the ghost document patterns (e.g. docs with "Chưa đặt tên", missing `code`, test transactions `SP111111...`) in existing code?
3. How should the dry-run script be implemented (e.g. in `De_Vuong_Webapp/scripts/` or similar), what command should execute it, and what should the dry-run audit report output look like? (Reminder: strictly dry-run, no writes or deletes).
4. What build and test scripts are defined in `package.json`? How does `tests/admissionsDebtSync.test.ts` run, and what dependencies/config does it use (vitest, jest, tsx)?
5. Are there existing build or lint errors in `De_Vuong_Webapp`?


## 2026-11-11T15:57:29Z
You are Survey Explorer 3 for the Finance Consolidation Project.

Your task is to investigate Requirement 1 and 3 (R1 & R3): Firestore Dry-run Script, Data Models, Test & Build Infrastructure.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3\DISPATCH.md`
3. Canonical Repository Policy:
   - Only inspect files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`.
   - NEVER read or touch files under `archives/`.
4. Your working directory for coordination metadata and reports is:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3`
   Update `progress.md` with your status during your work.
5. Produce a comprehensive report in:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey3_3\handoff.md`

Focus areas to investigate:
- Inspect all Firestore data models and services in `De_Vuong_Webapp/` related to finance, CRM, and customers (`crm_records`, `customer_profiles`, `sepay_bank_events`, `ledger_transactions`, `contracts`, etc.).
- Analyze the requirements for a dry-run reconciliation/cleanup script:
  - Scanning for ghost documents ("Chưa đặt tên" in `crm_records` or `customer_profiles`).
  - Scanning for test transactions (e.g. `SP111111...` or specific test patterns).
  - Checking for missing `code: LEA-*` on real customer profiles.
  - Generating an audit report to a file without modifying or deleting anything in Firestore.
  - Where the script should live (e.g., `scripts/reconcileFinanceDataDryRun.ts` or similar), how it should run via npm/tsx.
- Check build and test configuration in `package.json`:
  - Scripts (`npm run build`, `npm test`, etc.).
  - What test framework is configured (vitest, jest, etc.).
  - Check how `tests/admissionsDebtSync.test.ts` is run and whether it currently passes or has issues.
  - Check TypeScript configuration (`tsconfig.json`) and if any existing build errors or bundle issues exist.

When finished, write `handoff.md` and send a message back with your findings.
