# Dispatch: Explorer 3 (Survey - exam_banks & Code Submission Flow)

## Objective
Investigate `exam_banks`, exam definitions for `EXM-57035431` & `EXM-75958058`, and analyze the full application code flow for quiz/exam submission to understand how attempts and submissions are routed and stored.

## Input Files
- `ORIGINAL_REQUEST.md`: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
- `PROJECT.md`: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md

## Scope & Tasks
1. Investigate `exam_banks` collection:
   - Find documents corresponding to `EXM-57035431` and `EXM-75958058` (or search by title "PivotChart").
   - Extract their document IDs, codes, question count, and creation/update timestamps.
2. Codebase Investigation in `De_Vuong_Webapp/`:
   - Trace how an assessment is assigned/delivered to a class:
     * How are assessment IDs (e.g. `assess-exam-...`) and Codes generated?
     * Why are there two assessments (`assess-exam-1791498498715-1791540316712-6mjky` and `assess-exam-1791498498715-1791498580829-1dya3`) for PivotChart in CLS-63191700?
   - Trace the student quiz taking and submission flow:
     * Where in UI/routes does a student open and submit a quiz?
     * Which backend API / Firebase call handles submission? (e.g. `apiRequests.post(...)`, direct Firestore update, Cloud Function?)
     * What collections and fields does the submission write to? (`quiz_attempts`, `classes/{classId}`, `student_sessions`, etc.)
     * Are there key mismatches? (e.g., mismatch between `assessmentId`, `examCode`, `quizId`, `studentId` vs `userId` vs `uid`?)
     * Is there any bug or race condition that would cause submissions not to be recorded in `classes/{classId}.assessments[].submissions`?
3. Synthesize findings and explain why submissions are missing or where they might be stored.
4. Produce a comprehensive report in your working directory (`handoff.md`).

## Working Directory
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\`


## 2026-11-12T20:24:38Z
You are Explorer 3 for the Quiz Submission Audit of EXM-57035431 and EXM-75958058 (CLS-63191700).

Your working directory is:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\

Scope:
- Target: `exam_banks` collection and application codebase in `De_Vuong_Webapp/`.
- Inspect `exam_banks` collection for `EXM-57035431` and `EXM-75958058` (or search by title "PivotChart"):
  * Extract their document IDs, codes, question count, and creation/update timestamps.
- Codebase investigation in `De_Vuong_Webapp/`:
  * Trace how an assessment is assigned/delivered to a class: How are assessment IDs (e.g. `assess-exam-...`) and Codes generated? Why are there two assessments (`assess-exam-1791498498715-1791540316712-6mjky` and `assess-exam-1791498498715-1791498580829-1dya3`) for PivotChart in CLS-63191700?
  * Trace the student quiz taking and submission flow:
    - Where does a student open and submit a quiz in UI/routes?
    - Which backend API or Firebase call handles submission?
    - What collections and fields does the submission write to? (`quiz_attempts`, `classes/{classId}`, `student_sessions`, etc.)
    - Are there key mismatches or bug conditions? (e.g., mismatch between `assessmentId`, `examCode`, `quizId`, `studentId` vs `userId` vs `uid`?)
    - Why would submissions fail to appear in `classes/{classId}.assessments[].submissions`?
- Synthesize findings and explain where submissions are routed or why they might not appear in the class document.
- Produce a detailed handoff report in your working directory (`handoff.md`).
- Communicate your completion report to your caller via send_message.
