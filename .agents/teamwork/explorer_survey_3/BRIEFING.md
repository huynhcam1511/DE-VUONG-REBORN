# BRIEFING — 2026-11-12T20:30:00Z

## Mission
Investigate `exam_banks` collection for EXM-57035431 and EXM-75958058 (PivotChart) and trace the full codebase flow for assessment delivery, quiz taking, and quiz submission in `De_Vuong_Webapp/`. Identify root causes for why submissions might not appear in `classes/{classId}.assessments[].submissions`.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesist
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3
- Original parent: 0cddbbf5-4841-4fc9-a481-1790ad791569
- Milestone: M1 - Explorer 3 Survey (exam_banks & Code Submission Pipeline Trace)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly read-only investigation, no edits to application source code
- Document exact file paths, line numbers, data structures, and function signatures

## Current Parent
- Conversation ID: 0cddbbf5-4841-4fc9-a481-1790ad791569
- Updated: 2026-11-12T20:30:00Z

## Investigation State
- **Explored paths**:
  - Firestore collections: `exam_banks`, `exam_bank_items`, `classes`, `quiz_attempts`, `student_sessions`, `student_grades`, `practice_submissions`
  - `De_Vuong_Webapp/src/services/classService.ts` (lines 340-530: assessment mapping and course inheritance)
  - `De_Vuong_Webapp/src/services/quizService.ts` (lines 20-280: quiz retrieval and attempt submission)
  - `De_Vuong_Webapp/src/components/portal/ExamTakingPage.tsx` (lines 980-1150: student taking and submission logic)
  - `De_Vuong_Webapp/server.ts` (lines 1757-1865: atomic submission API `/api/classes/:classId/assessments/:assessmentId/submit`)
  - `De_Vuong_Webapp/src/App.tsx` (lines 217-221, 255-257: redirect routes `/t/:code` -> `/portal`)
  - `De_Vuong_Webapp/src/components/portal/StudentPortal.tsx` (lines 7404-7436: exam portal modal rendering)
  - `De_Vuong_Webapp/scripts/reconcile-class-assessment-attempts.mjs` (reconciliation logic)
- **Key findings**:
  - `exam_banks` collection is empty (0 docs). Actual collection is `exam_bank_items` (36 docs).
  - EXM-57035431 is doc `exam-1791498498715` (Topic 5: "Làm quen với PivotChart và tạo biểu đồ cơ bản", 20 questions).
  - EXM-75958058 is doc `exam-1791498515804` (Topic 6: "Định dạng và tùy chỉnh biểu đồ PivotChart", 20 questions).
  - Both exams were assigned to class 631917 because both topics are part of the 12-topic syllabus.
  - Active canonical class is `classes/631917` (status: active). `classes/CLS-63191700` is an inactive alias (status: inactive, mergedInto: "631917").
  - Submissions are atomic via `server.ts:1757`. Submissions write to `quiz_attempts` and `classes/:classId.assessments[].submissions`.
  - In `classes/631917`, both assessments ALREADY have 1 submission by student `xQ3zCo1PxRXtXf97hTqhGAXkRbg1` (Trần Ngọc Minh Tùng).
  - In `quiz_attempts`, there are ONLY 2 attempts across all 201 records in the entire database for these exams, both belonging to `xQ3zCo1PxRXtXf97hTqhGAXkRbg1`.
  - Zero submissions are missing or unlinked. The remaining 10 students simply never attempted the PivotChart quizzes.
- **Unexplored areas**: None. Scope fully investigated.

## Key Decisions Made
- Concluded investigation with empirical verification across all collections and codebase paths.
- Preparing 5-component handoff report.

## Artifact Index
- DISPATCH.md — Received dispatch instructions
- BRIEFING.md — Working memory and situational awareness
- progress.md — Liveness heartbeat
- handoff.md — 5-Component handoff report with complete findings
