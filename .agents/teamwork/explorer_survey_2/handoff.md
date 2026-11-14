# Handoff Report: Quiz Submission Audit for EXM-57035431 & EXM-75958058 (CLS-63191700 / 631917)

## 1. Observation

### 1.1 Document Status: `classes/CLS-63191700` vs `classes/631917`
Direct inspection of Firestore `classes` collection documents revealed two documents for the same class ("Lớp 02"):

- **`classes/CLS-63191700`**:
  * `createTime`: `2026-10-30T14:50:00.434Z`
  * `updateTime`: `2026-10-31T05:26:56.128Z`
  * `status`: `"inactive"`
  * `mergedInto`: `"631917"`
  * `mergedAt`: `"2026-10-30T15:05:06.853Z"`
  * `classCode`: `"631917"`
  * `studentIds` (11 students): `['Dlun5bbgaFYeYeCICoYJxajL4Dx1', 'V5RsPUBtGWUfiGH1UtACSiyjIYm1', '610a3MjR1lazmH3flleUYH969Dm2', 'BYuPWOXOgmMFeqEBTiWzFto0Fmv2', 'FEUKtQ00sFVeXZDM4qYHg0JSnY72', 'M8jbxeaBRzSsjxzXSB9dvqUg4n12', 'QRaGeez0ovSpai01tQNk4iGGSLY2', 'XTS1ebFZBrN4SlZPpfqR9ZoY6jl2', 'YiIuQLgdkDbL6dMlEZjc1dx5hux1', 'xQ3zCo1PxRXtXf97hTqhGAXkRbg1', 'lr6SUzzFSGRc2Qp2953IllZXuBq1']`
  * Target assessments in `assessments` array:
    - `assess-exam-1791498498715-1791540316712-6mjky` (`EXM-57035431`, `exam-1791498498715`): `submissions = []` (length 0)
    - `assess-exam-1791498498715-1791498580829-1dya3` (`EXM-75958058`, `exam-1791498515804`): `submissions = []` (length 0)
    - `EXM-26133037` (Midterm MCQ): `submissions = []` (length 0)
    - `EXM-27408327` (Dashboard MCQ): `submissions = []` (length 0)
    - `EXM-38232725` (Dashboard MCQ): `submissions = []` (length 0)

- **`classes/631917` (Canonical Active Class)**:
  * `createTime`: `2026-10-05T18:06:41.389Z`
  * `updateTime`: `2026-11-12T13:19:01.720Z`
  * `status`: `"active"`
  * `classCode`: `"631917"`
  * `studentIds` (11 students): Identical 11 UIDs to `CLS-63191700`.
  * Target assessments in `assessments` array:
    - `assess-exam-1791498498715-1791540316712-6mjky` (`EXM-57035431`, `exam-1791498498715`): `submissions = 1`
      * Student: Trần Ngọc Minh Tùng (`xQ3zCo1PxRXtXf97hTqhGAXkRbg1`, `LRN-24669238`, `solic.tran@gmail.com`)
      * Score: `6.5`, MCQ Score: `6.5`, Duration: `599s`, Violations: `0`
      * SubmittedAt: `2026-11-04T14:47:21.669Z`
      * Attempt ID: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6`
    - `assess-exam-1791498498715-1791498580829-1dya3` (`EXM-75958058`, `exam-1791498515804`): `submissions = 1`
      * Student: Trần Ngọc Minh Tùng (`xQ3zCo1PxRXtXf97hTqhGAXkRbg1`, `LRN-24669238`, `solic.tran@gmail.com`)
      * Score: `9.0`, MCQ Score: `9.0`, Duration: `429s`, Violations: `0`
      * SubmittedAt: `2026-11-04T14:56:50.706Z`
      * Attempt ID: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`
    - `EXM-26133037` (Midterm MCQ): `submissions = 9` (taken 2026-10-31 and 2026-11-11)
    - `EXM-27408327` (Dashboard MCQ): `submissions = 7` (taken 2026-11-07)
    - `EXM-38232725` (Dashboard MCQ): `submissions = 7` (taken 2026-11-07 and 2026-11-12)
    - `EXM-26497864` (PivotTable): `submissions = 11` (10 on 2026-10-17 + Trần Ngọc Minh Tùng on 2026-11-04)
    - `EXM-22628955` (PivotTable): `submissions = 10` (9 on 2026-10-17 + Trần Ngọc Minh Tùng on 2026-11-04)
    - `EXM-89094264` (PivotTable): `submissions = 9` (8 on 2026-10-17 + Trần Ngọc Minh Tùng on 2026-11-04)
    - `EXM-41014955` (PivotTable): `submissions = 10` (9 on 2026-10-17 + Trần Ngọc Minh Tùng on 2026-11-04)

### 1.2 `quiz_attempts` Collection Audit (Total: 201 records)
A full-collection scan across all 201 documents in `quiz_attempts` returned **exactly 2 attempts** matching `exam-1791498498715` / `EXM-57035431` or `exam-1791498515804` / `EXM-75958058`:
1. `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6`:
   - `quizId`: `"exam-1791498498715"`
   - `studentId`: `"xQ3zCo1PxRXtXf97hTqhGAXkRbg1"` (Trần Ngọc Minh Tùng)
   - `classId`: `"631917"`
   - `score`: `6.5`
   - `status`: `"submitted"`
   - `submitTime`: `"2026-11-04T14:47:21.669Z"`
2. `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`:
   - `quizId`: `"exam-1791498515804"`
   - `studentId`: `"xQ3zCo1PxRXtXf97hTqhGAXkRbg1"` (Trần Ngọc Minh Tùng)
   - `classId`: `"631917"`
   - `score`: `9.0`
   - `status`: `"submitted"`
   - `submitTime`: `"2026-11-04T14:56:50.706Z"`

No other attempt exists in `quiz_attempts` for either quiz. Zero attempts were submitted by the remaining 10 students of the class.

### 1.3 `student_sessions` Collection Audit (Total: 1,233 records)
- Total sessions belonging to the 11 students: 246 records (121 associated with `631917`, 66 with `CLS-63191700`, remainder with other historical classes).
- Sessions mentioning "PivotChart": exactly 13 records, all corresponding to Session 3 of class `631917` (`<studentId>_631917_3`, date: `2026-10-17`). Each contains teacher note: `"Học hết Pivot Chart chapter 1, 2"`.
- Quiz assessment scores in `student_sessions`: Zero records. `assessmentScores` array is empty for all 13 session documents.

### 1.4 Multi-Class Audit across `classes` (Total: 36 classes)
- Duplicate/merged class pattern:
  * `CLS-91269700` is `inactive` and has `mergedInto: "912697"`.
  * `CLS-63191700` is `inactive` and has `mergedInto: "631917"`.
  * `CLS-58706041` is `inactive` and has `mergedInto: "587060"`.
- Target exams in other classes:
  * Classes `188969` and `587060` contain definitions for `EXM-57035431` and `EXM-75958058`, but have 0 submissions.
- Student cross-submission check:
  * Only Huỳnh Kiến Cẩm (`Dlun5bbgaFYeYeCICoYJxajL4Dx1`) has submissions in another class (`912697`, Lớp 01, Microsoft Word exams). No students submitted PivotChart exams to another class.

---

## 2. Logic Chain

1. **Premise**: User observed 0 or 1 submissions in `classes/CLS-63191700` for PivotChart quizzes `EXM-57035431` and `EXM-75958058`.
2. **Observation 1.1**: `classes/CLS-63191700` was flagged `status: 'inactive'` with `mergedInto: '631917'` at `2026-10-30T15:05:06.853Z`.
3. **Observation 1.1 & 1.2**: When students submit quizzes through the webapp, the backend and frontend use the active class document ID (`631917`), saving all submissions to `classes/631917.assessments[].submissions` and `quiz_attempts` with `classId: "631917"`.
4. **Deduction**: Because `CLS-63191700` was superseded and frozen on October 30, any submissions made in November (such as Trần Ngọc Minh Tùng's submissions on 2026-11-04) went exclusively to `classes/631917`.
5. **Observation 1.1 & 1.2**: In `classes/631917`, both `EXM-57035431` and `EXM-75958058` DO contain the submission of Trần Ngọc Minh Tùng (scores 6.5 and 9.0).
6. **Observation 1.2**: In `quiz_attempts`, exactly 2 attempts exist in the entire database for both PivotChart exam IDs (`exam-1791498498715` and `exam-1791498515804`), both belonging to Trần Ngọc Minh Tùng.
7. **Observation 1.1 & Timeline Trace**: On 2026-10-17, the class took 4 PivotTable exams (`EXM-26497864`, `EXM-22628955`, `EXM-41014955`, `EXM-89094264`), and on 2026-10-31 took Midterm exams (`EXM-26133037` & `EXM-67637099`). The other 10 students were never administered or never submitted `EXM-57035431` or `EXM-75958058`.
8. **Observation 1.3**: `student_sessions` stores attendance, schedule, and lesson notes ("Học hết Pivot Chart chapter 1, 2"), not automated quiz submissions.

---

## 3. Caveats

1. **Exam Delivery Intent**: It cannot be determined purely from database records whether the instructor intended for all 11 students to take `EXM-57035431` and `EXM-75958058` on 2026-10-17, or if they skipped them in favor of the 4 PivotTable exams, with only Trần Ngọc Minh Tùng completing them on 2026-11-04 as self-practice or makeup.
2. **Read-Only Scope**: This audit did not alter or copy any records between `classes/631917` and `classes/CLS-63191700`.

---

## 4. Conclusion

1. **No Lost Data**: All submissions that were ever made for `EXM-57035431` and `EXM-75958058` are fully intact, graded, and stored in `classes/631917` and `quiz_attempts`.
2. **Root Cause of Missing Submissions in `CLS-63191700`**:
   - `CLS-63191700` is an **inactive, merged duplicate** document (`mergedInto: "631917"`, merged on 2026-10-30).
   - Inquiries or dashboard views looking at document ID `CLS-63191700` are viewing a stale pre-merger snapshot.
   - The production application correctly routes to `classes/631917`, where all submissions (including Trần Ngọc Minh Tùng's scores 6.5 and 9.0) are present.
3. **Roster Completion Status**:
   - Only 1 student (Trần Ngọc Minh Tùng) ever took `EXM-57035431` and `EXM-75958058`.
   - The other 10 students never submitted attempts for these two quizzes anywhere in the database.
4. **Remediation Plan**:
   - Consumers and reporting queries must use `classes/631917` (or follow the `mergedInto` pointer if queried with `CLS-63191700`).
   - If UI or legacy components explicitly query `classes/CLS-63191700`, a one-time synchronization script can copy `classes/631917.assessments` into `classes/CLS-63191700.assessments` for parity.

---

## 5. Verification Method

To independently verify these findings, run the read-only audit scripts in `De_Vuong_Webapp/`:

```bash
cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"

# 1. Compare classes/631917 vs classes/CLS-63191700
node -e "
const admin = require('firebase-admin');
const fs = require('fs');
const acc = JSON.parse(fs.readFileSync('service-account.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(acc) });
const db = admin.firestore();
Promise.all([db.collection('classes').doc('631917').get(), db.collection('classes').doc('CLS-63191700').get()]).then(([d1, d2]) => {
  console.log('631917 status:', d1.data().status, 'mergedInto:', d1.data().mergedInto);
  console.log('CLS-63191700 status:', d2.data().status, 'mergedInto:', d2.data().mergedInto);
  const a1 = d1.data().assessments.filter(a => a.code === 'EXM-57035431' || a.code === 'EXM-75958058');
  const a2 = d2.data().assessments.filter(a => a.code === 'EXM-57035431' || a.code === 'EXM-75958058');
  console.log('631917 target subs:', a1.map(a => ({ code: a.code, subs: (a.submissions||[]).length })));
  console.log('CLS-63191700 target subs:', a2.map(a => ({ code: a.code, subs: (a.submissions||[]).length })));
});
"

# 2. Check all attempts in quiz_attempts for PivotChart
node -e "
const admin = require('firebase-admin');
const fs = require('fs');
const acc = JSON.parse(fs.readFileSync('service-account.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(acc) });
const db = admin.firestore();
db.collection('quiz_attempts').get().then(snap => {
  const matches = snap.docs.filter(d => {
    const q = d.data().quizId;
    return q === 'exam-1791498498715' || q === 'exam-1791498515804';
  });
  console.log('Total PivotChart attempts in quiz_attempts:', matches.length);
  matches.forEach(m => console.log('Attempt:', m.id, m.data().studentId, m.data().score, m.data().submitTime));
});
"
```
