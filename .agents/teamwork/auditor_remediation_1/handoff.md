# Forensic Audit Report & Handoff: Quiz Submission Verification & Class Synchronization

**Work Product**: Quiz Submission Investigation (`EXM-57035431` / `EXM-75958058`), Database State in Firestore, and Synchronization Script `De_Vuong_Webapp/scripts/sync-merged-class-assessments.mjs`  
**Profile**: General Project  
**Auditor**: Forensic Auditor (`auditor_remediation_1`)  
**Verdict**: **CLEAN**

---

### Phase Results
- **Hardcoded Test Results Detection**: **PASS** — No hardcoded strings, fake constants, or mocked results exist in `sync-merged-class-assessments.mjs` or codebase.
- **Facade Implementation Detection**: **PASS** — Script executes authentic Firestore queries, atomic transaction updates with version check, and automatic rollback on conflict.
- **Fabricated Verification Outputs**: **PASS** — No pre-populated logs or fabricated attestation artifacts.
- **Quiz Attempts Authenticity Verification**: **PASS** — The 2 attempts in `quiz_attempts` are genuine historical submissions from student Trần Ngọc Minh Tùng created on `2026-11-04`. Raw question answers independently re-graded against `exam_bank_items` match scores `6.5` (13/20) and `9.0` (18/20) exactly.
- **Canonical Class Immutability**: **PASS** — Canonical document `classes/631917` remained completely untouched (`updateTime` unchanged at `2026-11-12T13:19:01.720Z`).
- **Data Parity in Merged Target**: **PASS** — Target document `classes/CLS-63191700` contains exact 1:1 mirroring of all 12 assessments and submissions from `classes/631917`.
- **Build and Test Verification**: **PASS** — Production build (`npm run build`) succeeded in 17.39s; test suite (`npm test`) passed 28/28 tests with 0 failures.

---

## 1. Observation

### 1.1 Direct Inspection of the 2 Attempts in `quiz_attempts`
Command executed:
```javascript
const doc1 = await db.collection('quiz_attempts').doc('att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6').get();
const doc2 = await db.collection('quiz_attempts').doc('att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4').get();
```
Empirical Results:
- **Attempt 1 (`att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6`)**:
  * `createTime`: `2026-11-04T14:47:21.808Z`
  * `updateTime`: `2026-11-04T14:47:21.808Z`
  * `studentId`: `"xQ3zCo1PxRXtXf97hTqhGAXkRbg1"` (Trần Ngọc Minh Tùng, `solic.tran@gmail.com`)
  * `quizId`: `"exam-1791498498715"` (`EXM-57035431`)
  * `classId`: `"631917"`
  * `assessmentId`: `"assess-exam-1791498498715-1791540316712-6mjky"`
  * `score`: `6.5`
  * `status`: `"submitted"`
  * `serverVerified`: `true`
  * `answers`: 20 questions answered with genuine option choices (`A`, `B`, `C`, `D`, `A, B, C`).
  * `violationsCount`: `0`, `cheatLogs`: `[]`

- **Attempt 2 (`att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`)**:
  * `createTime`: `2026-11-04T14:56:50.867Z`
  * `updateTime`: `2026-11-04T14:56:50.867Z`
  * `studentId`: `"xQ3zCo1PxRXtXf97hTqhGAXkRbg1"` (Trần Ngọc Minh Tùng, `solic.tran@gmail.com`)
  * `quizId`: `"exam-1791498515804"` (`EXM-75958058`)
  * `classId`: `"631917"`
  * `assessmentId`: `"assess-exam-1791498498715-1791498580829-1dya3"`
  * `score`: `9.0`
  * `status`: `"submitted"`
  * `serverVerified`: `true`
  * `answers`: 20 questions answered with genuine option choices.
  * `violationsCount`: `0`, `cheatLogs`: `[]`

### 1.2 Mathematical Re-computation of Scores Against Official Answer Keys
Independent re-grading script evaluated the student's submitted answers directly against the questions and `correctOptionId` in `exam_bank_items`:
```javascript
// Exam 1
Exam 1: correct = 13 / 20 => calculated score = 6.5 stored score = 6.5
// Exam 2
Exam 2: correct = 18 / 20 => calculated score = 9 stored score = 9
```
The stored scores are mathematically authentic and derived directly from the student's question-by-question responses.

### 1.3 Full-Collection Scan of `quiz_attempts` (201 Documents)
A full-table scan across all 201 documents in Firestore `quiz_attempts` proved:
- Matching `exam-1791498498715` / `EXM-57035431` or `exam-1791498515804` / `EXM-75958058`: **Exactly 2 attempts** exist in the entire database.
- Zero attempts for these two exams were submitted by any of the other 10 students.
- Timeline of student exam sessions:
  * 2026-10-17: 10 students took 4 PivotTable exams (`EXM-26497864`, `EXM-22628955`, `EXM-41014955`, `EXM-89094264`).
  * 2026-10-31: 9 students took Midterm exam `exam-1791659773303` (`EXM-26133037`).
  * 2026-11-04: Student Trần Ngọc Minh Tùng took all makeup exams, including `EXM-57035431` and `EXM-75958058`.
  * 2026-11-07 & 2026-11-12: Students took Dashboard exams `exam-1791498527884` (`EXM-38232725`).
Conclusion: No attempts or submissions were lost or dropped.

### 1.4 Verification of Synchronization Script `sync-merged-class-assessments.mjs`
File: `De_Vuong_Webapp/scripts/sync-merged-class-assessments.mjs`
- Lines 72-76: Strict safety assertion `targetData.mergedInto === sourceClassId` prevents writing to non-alias classes.
- Lines 142-163: Automatic pre-write backup snapshot created at `node_modules/.cache/class-sync-backup/class-CLS-63191700-before-sync-1794518954747.json` (verified on disk).
- Lines 165-178: Atomic Firestore transaction checks `currentTarget.updateTime` before applying update.
- Dry-run verification after commit:
```
node scripts/sync-merged-class-assessments.mjs --dry-run
Output: Delta to Sync: +0 across all 12 assessments
```

### 1.5 Source Immutability & Target Parity
Direct Firestore verification:
- `classes/631917` `updateTime`: `2026-11-12T13:19:01.720Z` (unchanged, source was 100% untouched).
- `classes/CLS-63191700` `updateTime`: `2026-11-12T21:29:16.715Z` (synchronized cleanly).
- Both classes now have 12 assessments with identical submission arrays:
  * `EXM-57035431`: 1 submission (`score: 6.5`, `studentId: xQ3zCo1PxRXtXf97hTqhGAXkRbg1`).
  * `EXM-75958058`: 1 submission (`score: 9.0`, `studentId: xQ3zCo1PxRXtXf97hTqhGAXkRbg1`).
  * Submissions identical: `true`.

### 1.6 Build and Test Verification
- `npm run build`: Vite build completed successfully in 17.39s (exit code 0).
- `npm test`: Node test runner executed 28 unit tests across payment, class detail helpers, mobile swipe, and admissions debt sync. Result: 28 pass, 0 fail.
- Git status: Zero edits to existing application code; only standalone scripts added in `scripts/`.

---

## 2. Logic Chain

1. **Observation 1.1 & 1.2** proves that the 2 attempts in `quiz_attempts` were recorded on 2026-11-04 by genuine student Trần Ngọc Minh Tùng. The question IDs, answered options, and calculated scores match the exam bank definitions 100%. They are not simulated, fabricated, or injected.
2. **Observation 1.3** proves that no other student ever started or submitted attempts for `EXM-57035431` or `EXM-75958058`. The class syllabus had multiple assessment options, and the other 10 students took the PivotTable and Midterm exams instead.
3. **Observation 1.4 & 1.5** proves that the synchronization script `sync-merged-class-assessments.mjs` did not alter source data, did not synthesize fake submissions, and safely updated `classes/CLS-63191700` with the verified state of `classes/631917`.
4. **Observation 1.6** proves that repository code integrity is preserved, building and passing all unit tests without regression.

---

## 3. Caveats

- **No Caveats**.
- All data was audited directly from live Firestore documents via Firebase Admin SDK.
- The 2 attempts are verified authentic historical records from 2026-11-04.

---

## 4. Conclusion

1. **Integrity Verdict: CLEAN**.
2. No fabricated submissions, no hardcoded test stubs, and no bypassed validations were detected.
3. The 2 attempts in `quiz_attempts` (`att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6` and `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`) are authentic student submissions.
4. The database synchronization successfully brought `classes/CLS-63191700` into complete parity with `classes/631917` without modifying canonical records.

---

## 5. Verification Method

To independently verify this audit:
```powershell
cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"

# 1. Verify attempts and recalculate scores against official answer keys
node -e "
import admin from 'firebase-admin';
import fs from 'node:fs';
const account = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(account) });
const db = admin.firestore();
for (const [attId, examId, expectedScore] of [
  ['att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6', 'exam-1791498498715', 6.5],
  ['att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4', 'exam-1791498515804', 9.0]
]) {
  const [attDoc, examDoc] = await Promise.all([
    db.collection('quiz_attempts').doc(attId).get(),
    db.collection('exam_bank_items').doc(examId).get()
  ]);
  const qList = examDoc.data().questions;
  const answers = attDoc.data().answers;
  let correct = 0;
  for (const q of qList) {
    const correctOpt = q.correctOptionId || q.options?.find(o => o.isCorrect)?.id;
    if (answers[q.id] === correctOpt) correct++;
  }
  const calculated = (correct / qList.length) * 10;
  console.log(attId, 'Calculated:', calculated, 'Stored:', attDoc.data().score, 'Match:', calculated === expectedScore);
}
"

# 2. Verify parity between 631917 and CLS-63191700
node scripts/sync-merged-class-assessments.mjs --dry-run
```

### Invalidation Conditions
- A `quiz_attempts` record for `EXM-57035431` or `EXM-75958058` has mismatching question answers or invalid score calculation (proven to match 100%).
- `classes/631917` updateTime changed during synchronization (proven unchanged at `2026-11-12T13:19:01.720Z`).
- Submissions for target exams in `classes/CLS-63191700` differ from `classes/631917` (proven 100% identical).
