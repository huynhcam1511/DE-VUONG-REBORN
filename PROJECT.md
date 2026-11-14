# Project: Audit & Recovery of Quiz Submissions EXM-57035431 & EXM-75958058 (CLS-63191700)

## Architecture
- **Canonical Webapp**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- **Data Stores (Firestore Collections)**:
  - `classes`: contains active canonical class `classes/631917` and inactive merged alias `classes/CLS-63191700`. Assessments and submissions are stored in `classDoc.assessments[].submissions[]`.
  - `quiz_attempts`: stores quiz attempt records, containing `quizId`, `quizTemplateId`, `studentId`, `userId`, `classId`, scores, answers, timestamps.
  - `student_sessions`: stores individual student session data, attendance, and lesson notes.
  - `exam_bank_items`: exam definitions, questions, and master assessment templates (36 items).
  - `student_grades`: grade summaries and evaluation records (12 records for class 631917, storing composite practical grades).
- **Application Flow**:
  - Student takes exam via quiz interface -> writes to `quiz_attempts` and atomically updates `classes/{classId}.assessments[].submissions`.
  - In `ExamTakingPage.tsx`, alias class references resolve `mergedInto: "631917"`, writing to canonical `classes/631917`.

## Feature / Audit Inventory
| # | Audit Item | Description | Milestone | Status |
|---|------------|-------------|-----------|--------|
| 1 | `quiz_attempts` Audit | Search for all attempts matching `EXM-57035431`, `EXM-75958058`, bank ID, or student UIDs of CLS-63191700 | M1 | DONE |
| 2 | `student_sessions` & `student_grades` Audit | Search session records for `assessmentScores` across CLS-63191700 students | M1 | DONE |
| 3 | `classes` Multi-Class & Delivery Audit | Check CLS-63191700, CLS-91269700, and other classes for misrouted submissions or duplicate assessments | M1 | DONE |
| 4 | Code Submission Pipeline Trace | Analyze code in `De_Vuong_Webapp/` to understand how submissions are saved, key names used, and failure modes | M1 | DONE |
| 5 | Findings Synthesis & Root Cause | Aggregate all audit findings, determine where submissions are located or why missing | M2 | DONE |
| 6 | Data Remediation / Re-linking | Sync `classes/CLS-63191700` assessments with canonical `classes/631917` for 100% data parity | M3 | DONE |
| 7 | Verification & Comprehensive Report | Verify data integrity, build/test passes, independent audit | M4 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Milestone 1: Multi-Collection Audit & Pipeline Trace | Parallel audit of quiz_attempts, student_sessions, classes, and code submission flow | none | DONE |
| 2 | Milestone 2: Findings Synthesis & Root Cause Determination | Reconcile findings across all collections, verify student rosters, identify discrepancies | M1 | DONE |
| 3 | Milestone 3: Data Remediation & Re-linking | Sync script `sync-merged-class-assessments.mjs` executed atomically with backup | M2 | DONE |
| 4 | Milestone 4: Verification & Final Report | Reviewer APPROVE, Forensic Auditor CLEAN, 100% parity verified | M3 | DONE |

## Code & Artifact Layout
- `De_Vuong_Webapp/scripts/sync-merged-class-assessments.mjs` — Synchronization tool with dry-run, backup, and atomic transaction
- `De_Vuong_Webapp/scripts/audit_target_exams.mjs` — Read-only examination auditor
- `De_Vuong_Webapp/node_modules/.cache/class-sync-backup/` — Pre-sync safety snapshot backups
- `.agents/teamwork/orchestrator/GATE_STATUS.md` — Quality and forensic gate verdicts
- `.agents/teamwork/orchestrator/handoff.md` — Final orchestrator state dump and synthesis
