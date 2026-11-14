# Dispatch: Explorer 1 (Survey - quiz_attempts & student_grades)

## Objective
Investigate Firestore collections `quiz_attempts` and `student_grades` for any attempts/submissions related to PivotChart quizzes `EXM-57035431` and `EXM-75958058` or students of class `CLS-63191700`.

## Input Files
- `ORIGINAL_REQUEST.md`: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
- `PROJECT.md`: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md

## Scope & Tasks
1. Identify the student roster of class `CLS-63191700` (UIDs, student codes `LRN-*`, emails, names).
2. Query `quiz_attempts` for:
   - Any attempt with `quizId`, `quizTemplateId`, or `examCode` matching `EXM-57035431` or `EXM-75958058` or the underlying exam bank ID.
   - Any attempt submitted by any student of class `CLS-63191700` across all time (especially around 17/10 to 04/11).
   - Any attempt containing "PivotChart" or "Kiểm tra Quá trình".
3. Query `student_grades` for any records for CLS-63191700 students or PivotChart exams.
4. If writing audit scripts to query Firestore:
   - Place read-only scripts in `De_Vuong_Webapp/scripts/` (e.g. `audit_quiz_attempts.ts`).
   - Run via `npx ts-node` or `node` as supported by `De_Vuong_Webapp/package.json`.
   - Never modify or delete any Firestore data during this exploration.
5. Produce a comprehensive report in your working directory (`handoff.md`).

## Working Directory
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\`


## 2026-11-12T20:24:14Z
Dispatch received from orchestrator (0cddbbf5-4841-4fc9-a481-1790ad791569):
You are Explorer 1 for the Quiz Submission Audit of EXM-57035431 and EXM-75958058 (CLS-63191700).
Scope:
- Target Firestore collections: `quiz_attempts` and `student_grades`.
- Find the roster of students in class `CLS-63191700` (UIDs, student codes, emails, names).
- Query `quiz_attempts` for attempts referencing `EXM-57035431` / `EXM-75958058` or the underlying exam bank ID, or any attempts submitted by students of `CLS-63191700` (especially around Oct 17 to Nov 4).
- Query `student_grades` for any recorded grades.
- If writing audit scripts to query Firestore, place read-only scripts in `De_Vuong_Webapp/scripts/` and run them. Do NOT modify or delete any database records.
- Produce a detailed handoff report in your working directory (`handoff.md`).
- Communicate your completion report to your caller via send_message.
