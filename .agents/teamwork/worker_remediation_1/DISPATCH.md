# Dispatch: Worker (Remediation & Synchronization)

## Objective
Implement and execute a safe database synchronization script that mirrors the `assessments` array from canonical active class `classes/631917` into its merged alias `classes/CLS-63191700`.

## Context & Inputs
- Read `ORIGINAL_REQUEST.md`: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Read Explorer 1 Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md`
- Read Explorer 2 Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md`
- Read Explorer 3 Report: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md`

## Tasks
1. Create a script in `De_Vuong_Webapp/scripts/sync-merged-class-assessments.mjs`:
   - Connect to Firestore using `service-account.json`.
   - Read `classes/631917` (source canonical class).
   - Read `classes/CLS-63191700` (target alias class).
   - Verify `CLS-63191700.mergedInto === '631917'`.
   - Update `classes/CLS-63191700` with the `assessments` from `classes/631917` so both document IDs show the exact same 12 assessments and submissions (including Trần Ngọc Minh Tùng's scores 6.5 and 9.0 on EXM-57035431 and EXM-75958058).
   - Include a dry-run flag (`--dry-run` vs `--apply`).
2. Run the script with `--dry-run`, verify output, then run with `--apply`.
3. Run verification query to confirm:
   - `classes/CLS-63191700` now has `submissions.length === 1` for `EXM-57035431` (score 6.5).
   - `classes/CLS-63191700` now has `submissions.length === 1` for `EXM-75958058` (score 9.0).
   - `classes/631917` remains completely intact and unaltered.
4. Produce `handoff.md` in your working directory with all command outputs and verification evidence.
5. Report back via `send_message`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Working Directory
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_remediation_1\`


## 2026-11-12T21:15:29Z
You are Worker 1 for the Remediation & Synchronization phase of the Quiz Submission Audit for EXM-57035431 and EXM-75958058.

Your working directory is:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_remediation_1\

Please read the following files before starting:
1. ORIGINAL_REQUEST.md: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
2. DISPATCH.md: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_remediation_1\DISPATCH.md
3. Explorer 1 Report: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md
4. Explorer 2 Report: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md
5. Explorer 3 Report: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md

Tasks:
1. Create `De_Vuong_Webapp/scripts/sync-merged-class-assessments.mjs`:
   - Connect to Firestore using `service-account.json`.
   - Read `classes/631917` (source canonical class) and `classes/CLS-63191700` (target merged alias).
   - Sync `assessments` from `classes/631917` into `classes/CLS-63191700` with `--dry-run` and `--apply` flags.
2. Execute with `--dry-run`, verify output, then execute with `--apply`.
3. Verify via query that `classes/CLS-63191700` now contains the submissions for `EXM-57035431` and `EXM-75958058` matching `classes/631917`.
4. Produce `handoff.md` with full output logs and verification.
5. Send completion report back via `send_message`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
