# Handoff Report: Explorer 1 (Survey — `quiz_attempts` & `student_grades` Audit for CLS-63191700 / 631917)

## 1. Observation

### 1.1 Class Architecture & Dual Document Resolution
- In Firestore `classes` collection, there are two related class documents for "Lớp 02" (AnPhaTech):
  1. `classes/CLS-63191700`:
     - `status`: `"inactive"`
     - `mergedInto`: `"631917"`
     - `mergedAt`: `"2026-10-30T15:05:06.853Z"`
     - `classCode`: `"631917"`
     - `studentIds`: 11 students
     - `assessments`: 12 assessments
  2. `classes/631917`:
     - `status`: `"active"`
     - `classCode`: `"631917"`
     - `studentIds`: 11 students (identical roster)
     - `assessments`: 12 assessments
- In `De_Vuong_Webapp/src/components/portal/ExamTakingPage.tsx` (lines 1026–1037), when a student starts or submits an assessment, if `targetClassToSave?.mergedInto` exists, it resolves the canonical class (`classes/631917`) and writes submissions and quiz attempts using `classId: "631917"`.

### 1.2 Student Roster of Class CLS-63191700 / 631917
All 11 enrolled student accounts were resolved from `classes/631917` and `classes/CLS-63191700` against the `users` collection:

| # | Student UID | Full Name | Email | Internal Code | Reference Code | Role | Status |
|---|---|---|---|---|---|---|---|
| 1 | `Dlun5bbgaFYeYeCICoYJxajL4Dx1` | Huỳnh Kiến Cẩm | `huynhcam.4gstexas@gmail.com` | `LRN-87003092` | — | `student` | `active` |
| 2 | `V5RsPUBtGWUfiGH1UtACSiyjIYm1` | Trần Thị Thu Thảo | `thao.tran.tpp@gmail.com` | `LRN-77416076` | `KS01` | `student` | `active` |
| 3 | `610a3MjR1lazmH3flleUYH969Dm2` | Nguyễn Thị Tâm | `tam.nguyen.anphatech@gmail.com` | `LRN-40869853` | `KS32` | `student` | `active` |
| 4 | `BYuPWOXOgmMFeqEBTiWzFto0Fmv2` | Lê Thị Quế Hương | `ltqhuong@gmail.com` | `LRN-70931521` | `KS21` | `student` | `active` |
| 5 | `FEUKtQ00sFVeXZDM4qYHg0JSnY72` | Đinh Khánh Đoan | `khanhdoan.anphatech@gmail.com` | `LRN-12753552` | `KS06` | `student` | `active` |
| 6 | `M8jbxeaBRzSsjxzXSB9dvqUg4n12` | Đinh Thị Kim Hương | `huong.dinh.anphatech@gmail.com` | `LRN-24373447` | `KS12` | `student` | `active` |
| 7 | `QRaGeez0ovSpai01tQNk4iGGSLY2` | Nguyễn Ngọc Trúc Lan | `truclan0412@gmail.com` | `LRN-48093799` | `KS31` | `student` | `active` |
| 8 | `XTS1ebFZBrN4SlZPpfqR9ZoY6jl2` | Bố Nguyễn Kim Long | `bonguyenkimlong91@gmail.com` | `LRN-61879489` | `KS19` | `student` | `active` |
| 9 | `YiIuQLgdkDbL6dMlEZjc1dx5hux1` | Nguyễn Thị Lụa | `ntl.vlu18@gmail.com` | `LRN-23445033` | `KS30` | `student` | `active` |
| 10 | `xQ3zCo1PxRXtXf97hTqhGAXkRbg1` | Trần Ngọc Minh Tùng | `solic.tran@gmail.com` | `LRN-24669238` | `KS15` | `student` | `active` |
| 11 | `lr6SUzzFSGRc2Qp2953IllZXuBq1` | Lê Thị Mỹ Trang | `trang.le.anphatech@gmail.com` | `LRN-46393935` | `KS05` | `student` | `active` |

### 1.3 Target Assessments & Underlying Exam Banks
The two PivotChart assessments are configured in both class documents as follows:

1. **Assessment `assess-exam-1791498498715-1791540316712-6mjky`**:
   - `code`: `EXM-57035431`
   - `title`: `"Kiểm tra Quá trình - PivotChart"`
   - `examId`: `exam-1791498498715` (found in `exam_bank_items`, 20 questions)
   - `openDateTime`: `2026-10-17T10:00`
   - `closeDateTime`: `2026-11-04T23:00`
   - `submissions` in `classes/CLS-63191700`: **0**
   - `submissions` in `classes/631917`: **1** (Trần Ngọc Minh Tùng)

2. **Assessment `assess-exam-1791498498715-1791498580829-1dya3`**:
   - `code`: `EXM-75958058`
   - `title`: `"Kiểm tra Quá trình - PivotChart"`
   - `examId`: `exam-1791498515804` (found in `exam_bank_items`, 20 questions)
   - `openDateTime`: `2026-10-17T10:00`
   - `closeDateTime`: `2026-11-04T23:00`
   - `submissions` in `classes/CLS-63191700`: **0**
   - `submissions` in `classes/631917`: **1** (Trần Ngọc Minh Tùng)

### 1.4 Findings in `quiz_attempts` Collection
A full scan of the entire `quiz_attempts` collection (100% of documents) was executed:
- **Attempts matching exam codes `EXM-57035431` / `EXM-75958058` or exam IDs `exam-1791498498715` / `exam-1791498515804`**:
  There are **EXACTLY 2 attempts** in the entire database. Both were submitted by student **Trần Ngọc Minh Tùng** (`xQ3zCo1PxRXtXf97hTqhGAXkRbg1`):
  
  * **Attempt 1 (`EXM-57035431`)**:
    - Document ID: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6`
    - `studentId`: `xQ3zCo1PxRXtXf97hTqhGAXkRbg1`
    - `quizId`: `exam-1791498498715`
    - `quizTemplateId`: `exam-1791498498715`
    - `classId`: `631917`
    - `assessmentId`: `assess-exam-1791498498715-1791540316712-6mjky`
    - `score`: `6.5` (13/20 correct)
    - `status`: `"submitted"`
    - `startTime`: `2026-11-04T14:37:22.669Z`
    - `submitTime`: `2026-11-04T14:47:21.669Z`
    - `answers`: 20 questions answered
    - `violationsCount`: `0`

  * **Attempt 2 (`EXM-75958058`)**:
    - Document ID: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`
    - `studentId`: `xQ3zCo1PxRXtXf97hTqhGAXkRbg1`
    - `quizId`: `exam-1791498515804`
    - `quizTemplateId`: `exam-1791498515804`
    - `classId`: `631917`
    - `assessmentId`: `assess-exam-1791498498715-1791498580829-1dya3`
    - `score`: `9.0` (18/20 correct)
    - `status`: `"submitted"`
    - `startTime`: `2026-11-04T14:49:41.706Z`
    - `submitTime`: `2026-11-04T14:56:50.706Z`
    - `answers`: 20 questions answered
    - `violationsCount`: `0`

- **Total attempts across all exams for the 11 students**:
  A total of **94 attempts** were found in `quiz_attempts` for the 11 students.
  - 83 attempts were recorded with `classId: "631917"`
  - 3 attempts were recorded with `classId: "912697"` (Huỳnh Kiến Cẩm)
  - 6 attempts were recorded with `classId: undefined` (early practice in early October)
  - **0 attempts were recorded with `classId: "CLS-63191700"`** (because `CLS-63191700` was merged into `631917`).

- **Student Exam Participation History for Class 631917**:
  * **2026-10-17**: 10 of 11 students took 4 PivotTable exams: `EXM-26497864`, `EXM-22628955`, `EXM-41014955`, `EXM-89094264`. Trần Ngọc Minh Tùng was absent.
  * **2026-10-31**: 9 students took the Midterm exam `EXM-26133037` ("Kiểm tra Giữa kỳ - PivotTable, PivotChart").
  * **2026-11-04**: Trần Ngọc Minh Tùng took all makeup exams in a single session:
    - 13:29: `EXM-26497864` (score: 9.0)
    - 13:42: `EXM-41014955` (score: 7.0)
    - 14:09: `EXM-22628955` (score: 9.5)
    - 14:24 & 14:35: `EXM-89094264` (score: 5.5, retake 9.5)
    - 14:47: `EXM-57035431` (score: 6.5)
    - 14:56: `EXM-75958058` (score: 9.0)
  * **2026-11-07 & 2026-11-12**: Students took the Dashboard exams `EXM-27408327` & `EXM-38232725`.
  * **No other student ever attempted `EXM-57035431` or `EXM-75958058`**.

### 1.5 Findings in `student_grades` Collection
- Total documents in `student_grades`: **26 documents**.
- 12 documents correspond to students of class `631917`:
  - Document IDs follow the pattern `631917__none__[studentId]`.
  - None of them have `classId: "CLS-63191700"`.
  - All 12 documents store `midtermPractice` (composite midterm practical grades, e.g. 7.0, 5.65, 8.1, 9.25).
  - None of them store individual quiz attempt scores or references to `EXM-57035431` / `EXM-75958058`. Individual quiz scores are stored in `classDoc.assessments[].submissions` and `quiz_attempts`.

---

## 2. Logic Chain

1. **Observation 1.1** demonstrates that `classes/CLS-63191700` is an inactive alias merged into `classes/631917` on `2026-10-30T15:05:06.853Z`.
2. **Observation 1.1 & Code Trace** in `ExamTakingPage.tsx` shows that when a student opens an assessment assigned to `CLS-63191700`, the application detects `mergedInto: "631917"` and directs both the submission write and the `quiz_attempts` creation to `classes/631917`.
3. **Observation 1.3 & 1.4** shows that on `2026-11-04` (after the merge date of Oct 30), student Trần Ngọc Minh Tùng submitted attempts for both `EXM-57035431` and `EXM-75958058`.
4. As designed by the alias resolution logic, both submissions were written to `classes/631917.assessments` and `quiz_attempts` with `classId: "631917"`.
5. Because the write targeted `classes/631917`, the inactive document `classes/CLS-63191700` was never touched after Oct 30, leaving its `submissions` array with length 0 for `EXM-57035431`, `EXM-75958058`, `EXM-26133037` (Giữa kỳ), and `EXM-27408327` (Dashboard).
6. **Observation 1.4** verifies that across all 11 enrolled students and all 36 classes in Firestore, **no other student ever started or submitted attempts for `EXM-57035431` or `EXM-75958058`**. The reason is that on class session Oct 17, the class completed 4 PivotTable exams, and on Oct 31, they completed the composite Midterm exam. The 2 PivotChart quizzes were only completed by Minh Tùng during his makeup session on Nov 4.
7. **Observation 1.5** demonstrates that `student_grades` does not track granular quiz submissions; it only stores final/midterm practice course summary grades.

---

## 3. Caveats

1. **Exam Delivery Scope**: The 10 other students in the class did not submit `EXM-57035431` or `EXM-75958058` not because of a database bug or data loss, but because they simply never took those two specific quizzes. Their process grades were derived from the 4 PivotTable quizzes on Oct 17 and the Midterm exam on Oct 31.
2. **Read-Only Scope**: In strict adherence to the Explorer role and system instructions, no database records were modified, migrated, or re-linked during this audit.
3. **Class Document Synchronization**: If any admin view specifically queries `classes/CLS-63191700` directly rather than following the `mergedInto: "631917"` pointer, it will display 0 submissions.

---

## 4. Conclusion

1. **Root Cause of "0 or 1 submissions"**:
   - Class `CLS-63191700` was merged into `631917` on `2026-10-30`.
   - All subsequent quiz submissions were correctly written to `classes/631917` and `quiz_attempts` with `classId: "631917"`.
   - In `classes/631917`, both `EXM-57035431` and `EXM-75958058` have **1 submission** (Trần Ngọc Minh Tùng, scores 6.5 and 9.0 respectively).
   - In `quiz_attempts`, both attempts exist intact with full answer payloads, timestamps, and scores.
2. **No Missing Submissions from Other Students**:
   - No submissions from the other 10 students were lost. They did not take those two quizzes.
3. **Recommended Remediation (for Milestone 3)**:
   - Ensure that any admin reporting or student portal queries referencing `CLS-63191700` resolve the canonical class `631917` (or mirror the `assessments` array from `classes/631917` into `classes/CLS-63191700` if legacy views require it).

---

## 5. Verification Method

To independently verify these findings, run the read-only audit scripts located in `De_Vuong_Webapp/scripts/`:

```powershell
cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
node scripts/audit_target_exams.mjs
node scripts/print_target_attempts.mjs
node scripts/check_classes_and_subs.mjs
node scripts/inspect_all_student_grades.mjs
```

### Invalidation Conditions
- A `quiz_attempts` document is found with `classId: "CLS-63191700"` (proven to be 0).
- An attempt for `EXM-57035431` or `EXM-75958058` by any student other than Minh Tùng is found in Firestore (proven to be 0 across all collections).
- `classes/CLS-63191700.mergedInto` does not point to `631917` (proven to be `"631917"`).
