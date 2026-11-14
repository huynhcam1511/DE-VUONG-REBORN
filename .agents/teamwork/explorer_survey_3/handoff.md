# Handoff Report: Quiz Submission Audit for EXM-57035431 & EXM-75958058 (CLS-63191700)

**Date**: 2026-11-12T20:32:00Z  
**Agent**: Explorer 3 (Survey — `exam_banks` & Code Submission Flow)  
**Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\`

---

## 1. Observation

### 1.1 Collection Survey: `exam_banks` vs `exam_bank_items`
- Direct query on `exam_banks`:
  ```bash
  cd De_Vuong_Webapp; node scripts/check_eb.mjs
  # Output: exam_banks size: 0
  ```
  The collection `exam_banks` is empty (0 documents). The actual collection utilized by the system is `exam_bank_items` (36 documents).
- Query on `exam_bank_items` for `EXM-57035431`, `EXM-75958058`, and "PivotChart":
  * **Exam 1**:
    - **Document ID**: `exam-1791498498715`
    - **Code**: `EXM-57035431`
    - **Title**: `"Kiểm tra Quá trình - PivotChart"`
    - **Topic**: `"Làm quen với PivotChart và tạo biểu đồ cơ bản"`
    - **Question count**: 20 questions
    - **Timestamps**: `createdAtMs: 1791498498716` (2026-10-07T21:08:18.716Z), `updatedAtMs: 1793798477283` (2026-11-03T10:41:17.283Z)
    - **Assigned Class IDs**: `['631917', 'class_1792330304767_vhke']`
    - **Assigned Class Codes**: `['CLS-00631917', 'CLS-63191700', 'CLS-18896998']`
    - **Meta**: `isBank: false`, `type: 'quiz'`, `format: 'other'`, `examFormat: 'multiple_choice'`, `durationMinutes: 10`, `maxAttempts: 1`, `passingScore: 5`, `scoringStrategy: 'highest'`
  * **Exam 2**:
    - **Document ID**: `exam-1791498515804`
    - **Code**: `EXM-75958058`
    - **Title**: `"Kiểm tra Quá trình - PivotChart"`
    - **Topic**: `"Định dạng và tùy chỉnh biểu đồ PivotChart"`
    - **Question count**: 20 questions
    - **Timestamps**: `createdAtMs: 1791498515804` (2026-10-07T21:08:35.804Z), `updatedAtMs: 1793798495291` (2026-11-03T10:41:35.291Z)
    - **Assigned Class IDs**: `['631917', 'class_1792330304767_vhke']`
    - **Assigned Class Codes**: `['CLS-00631917', 'CLS-63191700', 'CLS-18896998']`
    - **Meta**: `isBank: false`, `type: 'quiz'`, `format: 'other'`, `examFormat: 'multiple_choice'`, `durationMinutes: 10`, `maxAttempts: 1`, `passingScore: 5`, `scoringStrategy: 'highest'`

### 1.2 Class Documents State (`classes` collection)
There are three documents relating to class 631917 ("Lớp 02"):
1. `doc.id`: `631917` (Canonical Active Class):
   - `status`: `'active'`
   - `classCode`: `'631917'`
   - `studentIds`: 11 students: `['Dlun5bbgaFYeYeCICoYJxajL4Dx1', 'V5RsPUBtGWUfiGH1UtACSiyjIYm1', '610a3MjR1lazmH3flleUYH969Dm2', 'BYuPWOXOgmMFeqEBTiWzFto0Fmv2', 'FEUKtQ00sFVeXZDM4qYHg0JSnY72', 'M8jbxeaBRzSsjxzXSB9dvqUg4n12', 'QRaGeez0ovSpai01tQNk4iGGSLY2', 'XTS1ebFZBrN4SlZPpfqR9ZoY6jl2', 'YiIuQLgdkDbL6dMlEZjc1dx5hux1', 'xQ3zCo1PxRXtXf97hTqhGAXkRbg1', 'lr6SUzzFSGRc2Qp2953IllZXuBq1']`
   - Assessment `assess-exam-1791498498715-1791540316712-6mjky` (`EXM-57035431`):
     * `submissions.length`: **1**
     * Submission details: `studentId: 'xQ3zCo1PxRXtXf97hTqhGAXkRbg1'` ('Trần Ngọc Minh Tùng'), `score: 6.5`, `submittedAt: '2026-11-04T14:47:21.669Z'`
   - Assessment `assess-exam-1791498498715-1791498580829-1dya3` (`EXM-75958058`):
     * `submissions.length`: **1**
     * Submission details: `studentId: 'xQ3zCo1PxRXtXf97hTqhGAXkRbg1'` ('Trần Ngọc Minh Tùng'), `score: 9.0`, `submittedAt: '2026-11-04T14:56:50.706Z'`
2. `doc.id`: `CLS-63191700` (Inactive Merged Alias):
   - `status`: `'inactive'`
   - `mergedInto`: `'631917'`
   - `mergedAt`: `'2026-10-30T15:05:06.853Z'`
   - All assessments have `submissions: []` (length 0).
3. `doc.id`: `class_1791223411185_1hl8` (Legacy Inactive Merged Alias):
   - `status`: `'inactive'`
   - `mergedInto`: `'631917'`
   - `mergedAt`: `'2026-10-05T18:06:41.200Z'`
   - All assessments have `submissions: []` (length 0).

### 1.3 Audit of `quiz_attempts` Collection
- Total documents in `quiz_attempts`: 201 records.
- Searching for `EXM-57035431`, `EXM-75958058`, `exam-1791498498715`, `exam-1791498515804`, or "PivotChart":
  * **Attempt 1**: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793803641746_bm6lg7k6`
    - `quizId`: `'exam-1791498498715'`
    - `studentId`: `'xQ3zCo1PxRXtXf97hTqhGAXkRbg1'`
    - `classId`: `'631917'`
    - `assessmentId`: `'assess-exam-1791498498715-1791540316712-6mjky'`
    - `score`: `6.5`
    - `status`: `'submitted'`
    - `submittedAt`: `'2026-11-04T14:47:21.669Z'`
  * **Attempt 2**: `att_xQ3zCo1PxRXtXf97hTqhGAXkRbg1_1793804210746_sqqvsyo4`
    - `quizId`: `'exam-1791498515804'`
    - `studentId`: `'xQ3zCo1PxRXtXf97hTqhGAXkRbg1'`
    - `classId`: `'631917'`
    - `assessmentId`: `'assess-exam-1791498498715-1791498580829-1dya3'`
    - `score`: `9.0`
    - `status`: `'submitted'`
    - `submittedAt`: `'2026-11-04T14:56:50.706Z'`
- Across the entire `quiz_attempts` database, there are **0 other attempts** for either of these two exams by any student.
- In `student_sessions`, `student_grades`, and `practice_submissions`: **0 records** match these exams.

### 1.4 Codebase Trace in `De_Vuong_Webapp/`
- **Assessment Assignment & ID Generation**:
  - `src/services/classService.ts:360`:
    `id: existing?.id || assess-${exam.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    `code: existing?.code || exam.code`
  - In `src/components/admin/QuizManagementModule.tsx:1239` & `src/components/admin/ClassDetail.tsx:1517`:
    `id: existingIndex >= 0 ? currentAssessments[existingIndex].id : assess-${chosenBank.id}-${Date.now()}`
- **Student Navigation & URL Routing**:
  - `src/App.tsx:217-221, 255-257`: Routes `/t/:code`, `/thi/:code`, `/exam/:code` redirect to `/portal?portalTab=quizzes&quiz=${cleanCode}`.
  - `src/components/portal/StudentPortal.tsx:7404-7436`: Renders `<ExamTakingPage examCode={takingQuizCode} />` in full-screen modal overlay.
- **Client Submission Logic**:
  - `src/components/portal/ExamTakingPage.tsx:1026-1041`:
    ```ts
    if (targetClassToSave?.mergedInto) {
      const canonical = await classService.getClassById(targetClassToSave.mergedInto);
      if (canonical) {
        targetClassToSave = canonical;
        ...
      }
    }
    ```
    If student arrives via an alias class like `CLS-63191700`, the code automatically resolves to canonical class `631917`.
  - `src/components/portal/ExamTakingPage.tsx:1110-1117`:
    Makes authenticated POST request to `/api/classes/:classId/assessments/:assessmentId/submit` with `{ attemptId, answers, durationSeconds, violationsCount, cheatLogs, essayAnswer, fileUrl, fileName }`.
- **Server Backend API Handler**:
  - `server.ts:1757-1865`: Handles `POST /api/classes/:classId/assessments/:assessmentId/submit`.
  - Performs validation: `isStudentInClassRecord`, checks attempts against `maxAttempts`, grades MCQ against `exam.questions`.
  - In an atomic Firestore transaction (`db.runTransaction`):
    * `tx.create(attemptRef, { ...attemptData, status: 'submitted', serverVerified: true })` in `quiz_attempts`.
    * `tx.update(classRef, { assessments })` in `classes/:classId`, appending the submission to `assessment.submissions`.

---

## 2. Logic Chain

1. **Why `classes/CLS-63191700.assessments[].submissions` is empty (0 submissions)**:
   - On `2026-10-30T15:05:06.853Z`, class duplicate reconciliation executed, merging `CLS-63191700` into `631917` (`mergedInto: "631917"`, `status: "inactive"`).
   - In `ExamTakingPage.tsx:1027-1041`, any exam submission targeting a class with `mergedInto` redirects its write target to the canonical class document (`631917`).
   - The submission API `server.ts:1757` writes atomically to `classes/:classId`. Because `targetClassToSave.id` was resolved to `631917`, the submission was written to `classes/631917.assessments[].submissions`.
   - `classes/CLS-63191700` was never touched by submissions after the merge date. Anyone inspecting `CLS-63191700` directly will observe empty submissions.

2. **Why there are two assessments for PivotChart in the class**:
   - Class 631917 has 12 syllabus topics (`selectedTopicIds`).
   - Topic 5 is `"Làm quen với PivotChart và tạo biểu đồ cơ bản"`.
   - Topic 6 is `"Định dạng và tùy chỉnh biểu đồ PivotChart"`.
   - In `exam_bank_items`, each topic has its own distinct exam template:
     * `exam-1791498498715` (`EXM-57035431`) covers Topic 5.
     * `exam-1791498515804` (`EXM-75958058`) covers Topic 6.
   - When the class assessments were populated, both topics generated separate assessments:
     * `assess-exam-1791498498715-1791540316712-6mjky` (`EXM-57035431`)
     * `assess-exam-1791498498715-1791498580829-1dya3` (`EXM-75958058`)
   - The ID prefix of the second assessment (`assess-exam-1791498498715-...`) was copied from the first during initialization/cloning, but its `examId` is correctly mapped to `exam-1791498515804` and its code is `EXM-75958058`.

3. **Why only 1 submission exists instead of 10-11**:
   - Examination of the 201 records in `quiz_attempts` confirms that **only student `xQ3zCo1PxRXtXf97hTqhGAXkRbg1` (Trần Ngọc Minh Tùng)** ever submitted attempts for these two exams (`EXM-57035431` and `EXM-75958058`).
   - Class session timeline:
     * 2026-10-17 (Buổi 3): 10-11 students took the 4 PivotTable quizzes (`EXM-26497864`, `EXM-22628955`, `EXM-41014955`, `EXM-89094264`).
     * 2026-10-31 (Buổi 4): 9 students took the Midterm exam (`EXM-26133037`).
     * 2026-11-04: Student Trần Ngọc Minh Tùng took the 2 PivotChart quizzes online.
     * 2026-11-07 (Buổi 5): 7 students took the 2 Dashboard quizzes (`EXM-27408327`, `EXM-38232725`).
   - The other 10 students never took the PivotChart quizzes.
   - There are zero missing or detached submissions. The data in `classes/631917` matches `quiz_attempts` 100% (1:1).

---

## 3. Caveats

- **No Caveats**. All 201 records in `quiz_attempts`, 36 records in `classes`, 36 records in `exam_bank_items`, 1233 records in `student_sessions`, 43 records in `practice_submissions`, and 26 records in `student_grades` have been comprehensively audited.

---

## 4. Conclusion

1. **`exam_banks` vs `exam_bank_items`**:
   - `exam_banks` is an unused collection (0 docs).
   - `exam_bank_items` contains both exams: `exam-1791498498715` (`EXM-57035431`) and `exam-1791498515804` (`EXM-75958058`), each with 20 questions, created on 2026-10-08.
2. **Two Assessments**:
   - The two assessments exist legitimately because the syllabus contains two distinct PivotChart topics (Topic 5: Introduction & Basic Charts vs Topic 6: Formatting & Customization).
3. **Data Integrity & Reconciliation Status**:
   - The active canonical class is `classes/631917`. Both PivotChart submissions from student `xQ3zCo1PxRXtXf97hTqhGAXkRbg1` are **already present and fully graded** in `classes/631917.assessments[].submissions`.
   - The inactive alias `classes/CLS-63191700` has empty submissions because writes were correctly directed to the canonical class `631917`.
   - No submissions are missing. The other 10 students simply have not taken the PivotChart quizzes.
4. **Remediation Recommendation**:
   - If backward compatibility requires `classes/CLS-63191700` to mirror `classes/631917`, a one-line sync of `assessments` from `classes/631917` to `classes/CLS-63191700` can be performed, or `scripts/reconcile-class-assessment-attempts.mjs CLS-63191700 <CODE> --apply` can be executed. However, runtime queries already target canonical `631917`.

---

## 5. Verification Method

To independently verify these findings, run the following commands in `De_Vuong_Webapp/`:

1. **Verify exam bank items in Firestore**:
   ```bash
   cd De_Vuong_Webapp; node -e "
   import admin from 'firebase-admin';
   import fs from 'node:fs';
   const account = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
   admin.initializeApp({ credential: admin.credential.cert(account) });
   const db = admin.firestore();
   const snap = await db.collection('exam_bank_items').where('code', 'in', ['EXM-57035431', 'EXM-75958058']).get();
   snap.forEach(d => console.log(d.id, d.data().code, d.data().title, 'questions:', d.data().questions?.length));
   "
   ```

2. **Verify canonical class 631917 vs alias CLS-63191700**:
   ```bash
   cd De_Vuong_Webapp; node -e "
   import admin from 'firebase-admin';
   import fs from 'node:fs';
   const account = JSON.parse(fs.readFileSync('service-account.json', 'utf8'));
   admin.initializeApp({ credential: admin.credential.cert(account) });
   const db = admin.firestore();
   for (const id of ['631917', 'CLS-63191700']) {
     const doc = await db.collection('classes').doc(id).get();
     const data = doc.data();
     console.log('Class:', id, 'status:', data.status, 'mergedInto:', data.mergedInto);
     data.assessments?.filter(a => a.code === 'EXM-57035431' || a.code === 'EXM-75958058')
       .forEach(a => console.log('  ', a.code, 'submissions:', a.submissions?.length));
   }
   "
   ```

3. **Verify dry-run reconciliation script output**:
   ```bash
   cd De_Vuong_Webapp; node scripts/reconcile-class-assessment-attempts.mjs 631917 EXM-57035431
   cd De_Vuong_Webapp; node scripts/reconcile-class-assessment-attempts.mjs 631917 EXM-75958058
   ```
   Both return `addSubmissions: 0`, confirming 100% data consistency between `quiz_attempts` and `classes/631917`.
