# Handoff Report — Explorer 2: CRM Leads & Learner Mapping (LEA vs LRN)

## 1. Observation

### 1.1 Direct Database Records (Firestore Live Snapshot)
Executed Firestore queries against production-mirrored collections (`customer_profiles`, `crm_records`, `users`, `ledger_transactions`, `bank_events`) for identifiers `91690914`, `Anh Thi`, and `20510493`:

1. **LMS Student User Record** (`users` collection):
   - Document ID: `RmJqF3seCWVQG41RyNaFYU9KZBc2`
   - `fullName`: `"Nguyễn Thị Anh Thi"`
   - `email`: `"anhthi20041105@gmail.com"`
   - `role`: `"student"`
   - `student_code_internal`: `"LRN-20510493"` *(Actual official Learner ID)*

2. **CRM Admissions / Order Record** (`customer_profiles` & `crm_records` collections):
   - Primary Record Doc ID: `crm_1793537175731`
   - `code`: `"LEA-91690914"` *(Official Lead ID)*
   - `fullName`: `"Nguyễn Thị Anh Thi"`, `name`: `"Nguyễn Thị Anh Thi"`
   - `email`: `"anhthi20041105@gmail.com"`, `phone`: `"0948275769"`
   - `studentId`: `"RmJqF3seCWVQG41RyNaFYU9KZBc2"` *(Foreign Key referencing users.uid)*
   - `tuition`: `"5000"` *(Total fee: 5,000 VND)*
   - `paidAmount`: `2000` *(State anomaly: shows only 2,000 VND instead of 3,000 + 2,000 = 5,000 VND)*
   - `receiptCode`: `"COL-17510319"`
   - `status`: `"Chờ thu tiền"`, `paymentStatus`: `"paid"`
   - **Secondary Stub Document in `crm_records`**:
     - Doc ID: `LEA-91690914`
     - Fields: `{ paymentStatus: 'completed', status: 'enrolled', paidAmount: 2000, receiptCode: 'COL-17510319', updatedAt: ... }`
     - **Missing fields**: `fullName: undefined`, `name: undefined`, `code: undefined`, `studentId: undefined`.

3. **Ledger Transactions** (`ledger_transactions` collection):
   - **Transaction 1** (Doc ID: `COL-a508898c33cb172df83090458949923c34e3ff764621640b01edbd219795cd9d`):
     - `date`: `2026-11-01T13:21:30.000Z`
     - `refCode`: `"COL-89460173"`
     - `credit`: `3000`
     - `studentId`: `"LEA-91690914"`
     - `studentName`: `"Học viên E-learning"` *(Anomalous generic placeholder name)*
     - `description`: `"[SePay-COL] Thu học phí đơn LEA-91690914 - Học viên E-learning"`
     - `originalContent`: `"QR - HOCPHI LEA91690914"`
   - **Transaction 2** (Doc ID: `COL-6592e9e8ea818280e4d1b72e743c64edc45f400c0b9d95d7c2b0a1587a061bb9`):
     - `date`: `2026-11-01T14:46:22.000Z`
     - `refCode`: `"COL-17510319"`
     - `credit`: `2000`
     - `studentId`: `"LEA-91690914"`
     - `studentName`: `"Nguyễn Thị Anh Thi"` *(Actual learner name)*
     - `description`: `"[SePay-COL] Thu học phí đơn LEA-91690914 - Nguyễn Thị Anh Thi"`
     - `originalContent`: `"154631286223 HOCPHI LEA91690914 CHUYEN TIEN OQCH000NlIvl MOMO154631286223MOMO"`

---

### 1.2 Codebase Locations and Specific Lines Observed

1. **Generation of Fake LRN-91690914**:
   - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`, lines 1347-1351:
     ```tsx
     {(smart.lrnCode || tx.internalId || tx.studentId) && (
       <span className="font-mono text-[11px] text-slate-400">
         {ensureValidBusinessCode(smart.lrnCode || tx.internalId || tx.studentId || '', 'LRN')}
       </span>
     )}
     ```
   - `De_Vuong_Webapp/src/utils/codeGenerator.ts`, lines 104-112:
     ```typescript
     const prefixMatch = strVal.match(/^([A-Z]{3})-(\d{8})$/i);
     if (prefixMatch) {
       const existingPrefix = prefixMatch[1].toUpperCase();
       const digits = prefixMatch[2];
       if (existingPrefix === prefix) {
         return strVal.toUpperCase();
       }
       return `${prefix}-${digits}`;
     }
     ```
     When `tx.studentId` is `'LEA-91690914'`, `ensureValidBusinessCode(..., 'LRN')` strips `LEA` and replaces it with `LRN`, returning `'LRN-91690914'`.

2. **Skipping Name Resolution for "Học viên E-learning" & Matching Empty Stubs**:
   - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`, lines 117-132:
     ```typescript
     let studentDisplay = tx.studentName;
     let matchedStudentCode: string | null = null;

     if (!studentDisplay || studentDisplay === '---' || studentDisplay === 'N/A' || studentDisplay === '-' || studentDisplay === 'Ẩn danh' || studentDisplay.trim() === '') {
       if (allCrmRecords && allCrmRecords.length > 0) {
         const matchedCrm = allCrmRecords.find((r: any) => {
           const rId = String(r.id || '');
           const rCode = String(r.code || '');
           if (normalizedLeaCode && (rCode === normalizedLeaCode || rId === normalizedLeaCode || rId.includes(leaMatch![1]) || rCode.includes(leaMatch![1]))) return true;
           ...
         });
         if (matchedCrm) {
           studentDisplay = matchedCrm.name || matchedCrm.fullName;
           if (matchedCrm.studentId || matchedCrm.studentCode || matchedCrm.learnerCode) {
             matchedStudentCode = matchedCrm.studentId || matchedCrm.studentCode || matchedCrm.learnerCode;
           }
         }
       }
     ...
     ```
     - For Transaction 1: `tx.studentName` is `'Học viên E-learning'`. Because `'Học viên E-learning'` is not in the condition, the lookup block is skipped entirely.
     - For Transaction 2: `tx.studentName` is `'Nguyễn Thị Anh Thi'`. The lookup block is also skipped, so `matchedStudentCode` remains `null`.
     - When lookup does run for any record with `normalizedLeaCode`: `allCrmRecords.find()` matches the stub document `LEA-91690914` created by `server.ts`, which has no `name`, `fullName`, or `studentId`.

3. **Missing Cross-Reference from CRM `studentId` (UID) to LMS `student_code_internal`**:
   - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`, lines 135-146:
     ```typescript
     // 2. Thử tìm trong danh sách User / Students
     if ((!studentDisplay || studentDisplay === '---') && allStudents && allStudents.length > 0) {
     ```
     Step 2 only runs if `studentDisplay` is empty. If Step 1 found `matchedCrm`, Step 2 never runs. Even if `matchedCrm.studentId` is `'RmJqF3seCWVQG41RyNaFYU9KZBc2'`, it was never used to query `allStudents.find(s => s.uid === matchedCrm.studentId)?.student_code_internal` (`'LRN-20510493'`).

4. **Webhook SePay Overwriting `paidAmount` and Creating Ghost Doc**:
   - `De_Vuong_Webapp/server.ts`, lines 3090-3112:
     ```typescript
     if (customerProfileRef) {
       tx.set(customerProfileRef, {
         paymentStatus: 'paid',
         orderStatus: 'paid',
         paidAmount: amount_in, // OVERWRITES existing payments instead of accumulating
         receiptCode: colCode,
         ...
       }, { merge: true });
     }
     const crmRecordRef = db.collection('crm_records').doc(fullLeaCode);
     tx.set(crmRecordRef, {
       paymentStatus: 'completed',
       status: 'enrolled',
       paidAmount: amount_in, // OVERWRITES existing payments; doc ID 'LEA-91690914' has no name/code fields!
       receiptCode: colCode,
       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
     }, { merge: true });
     ```

5. **Phiếu Thu (COL) Omits Prior Payments in `CRMAdmissionsModule.tsx`**:
   - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`, lines 1506-1538:
     ```typescript
     matched.sort((a, b) => new Date(b.date || (b as any).createdAt || 0).getTime() - new Date(a.date || (a as any).createdAt || 0).getTime());
     const latest = matched[0]; // Takes only latest COL (2,000 VND)

     const collectedAmount = allLedgerTransactions
       .filter((stx) => {
         if (stx.type === 'expected_revenue' || stx.refCode?.startsWith('COL')) return false; // EXCLUDES all COL transactions!
         ...
       })
       .reduce((acc, stx) => acc + (stx.credit || 0), 0);

     const directCollected = (latest.type !== 'expected_revenue' && (latest.credit || 0) > 0)
       ? (latest.credit || 0) // Only latest.credit (2,000 VND), drops Transaction 1 (3,000 VND)
       : 0;

     const finalCollectedAmount = Math.max(
       collectedAmount,
       directCollected,
       Number(editingRecord.paidAmount || 0)
     );
     ```

6. **Description Column Formatting and Uneven Row Heights**:
   - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`, lines 183-199 & 1369-1376:
     - `isSepayRaw` check misses `[SePay-COL]`, preserving redundant `LEA-91690914` and student names in description.
     - Lines 1372-1375 render `tx.originalContent` as a second span under `cleanDesc`, pushing row height beyond standard SaaS baseline.

---

## 2. Logic Chain

1. **From Observation 1.1 & 1.2.4**:
   - When SePay webhook received the first payment (3,000 VND) at `13:21:30Z`, `customer_profiles` lookup did not resolve `fullName` because the document was keyed under `crm_1793537175731` and not `LEA-91690914`.
   - `server.ts` line 3045 defaulted `studentName` to `'Học viên E-learning'` and wrote Transaction 1 with `refCode: 'COL-89460173'`, `credit: 3000`.
   - When the second payment (2,000 VND) arrived at `14:46:22Z`, `customerProfileRef` resolved the profile, setting `studentName: 'Nguyễn Thị Anh Thi'`.
   - In both cases, `server.ts` executed `paidAmount: amount_in`, setting `paidAmount` in Firestore to `2000` rather than accumulating `3000 + 2000 = 5000`.
   - In addition, `server.ts` wrote a new document to `crm_records` with doc ID `'LEA-91690914'` containing only payment status and amount, creating a name-less stub document.

2. **From Observation 1.2.2 & 1.2.3**:
   - When `AdminLedgerModule` rendered Transaction 1:
     - `studentDisplay` was `'Học viên E-learning'`.
     - Because `parseLedgerSmartInfo` treats `'Học viên E-learning'` as a non-empty name, it skipped the lookup block (line 117).
     - As a result, Transaction 1 retained the generic name `'Học viên E-learning'`, while Transaction 2 displayed `'Nguyễn Thị Anh Thi'`.
     - Even if the lookup ran, `allCrmRecords.find()` stopped at the stub document `LEA-91690914`, which had no `fullName` or `studentId`.

3. **From Observation 1.2.1 & 1.2.3**:
   - In `AdminLedgerModule`, `matchedStudentCode` was `null` for both transactions because `parseLedgerSmartInfo` never retrieved `matchedCrm.studentId` or linked `matchedCrm.studentId` (`'RmJqF3seCWVQG41RyNaFYU9KZBc2'`) to `allStudents`.
   - When rendering the student code in the table (line 1347-1349), the fallback evaluated `ensureValidBusinessCode(tx.studentId, 'LRN')`.
   - Since `tx.studentId` was `'LEA-91690914'`, `ensureValidBusinessCode` in `codeGenerator.ts` line 104-112 matched the 8 digits `91690914` and prepended `LRN-`, generating the synthetic code `'LRN-91690914'`.
   - The true learner ID `'LRN-20510493'` stored on user `RmJqF3seCWVQG41RyNaFYU9KZBc2` was ignored.

4. **From Observation 1.2.5**:
   - In `CRMAdmissionsModule`, `activeCollectionOrder` filtered for transactions with `refCode.startsWith('COL')`. Both `COL-89460173` (3,000 VND) and `COL-17510319` (2,000 VND) matched.
   - However, `latest = matched[0]` selected only `COL-17510319` (2,000 VND).
   - The `collectedAmount` calculation explicitly filtered out all `refCode.startsWith('COL')` transactions (line 1517).
   - Thus, `finalCollectedAmount` became `Math.max(0, 2000, 2000) = 2000` VND.
   - The initial payment of 3,000 VND was completely omitted from the total paid amount.
   - `CommercialLifecycleBar` received `paidAmount = 2000` against `effectiveTuition = 5000`, displaying `Đã thu 2.000đ / 5.000đ · Còn nợ: 3.000đ` instead of `5.000đ / 5.000đ` and `✓ Đã thu tiền`.

5. **From Observation 1.2.6**:
   - `AdminLedgerModule`'s `cleanDesc` logic did not sanitize `[SePay-COL]` descriptions, resulting in duplicated `LEA` codes and student names in the Description column.
   - The presence of `tx.originalContent` as a second block in `<td>` caused row height inflation, violating AGENTS.md rules.

---

## 3. Caveats

- **Existing Type Warnings**: Running `npm run lint` (`tsc --noEmit`) revealed pre-existing type warnings in unrelated modules (`HrPolicyModule`, `QualityAssessmentModule`, `TrainingPrograms`, etc.). Tests in `npm test` pass 100% (19/19 tests passing in ~2 seconds).
- **Dual Collection Sync**: Both `customer_profiles` and `crm_records` are used in parallel across legacy and new modules. Any resolution logic must query both collections or unify them, ignoring empty stub documents.
- **Scope Restriction**: As Explorer 2, investigation is strictly read-only; no code modifications have been made to application source files.

---

## 4. Conclusion & Actionable Resolution Strategy

### 4.1 Resolution Strategy for R1 (Consistent Student Identity & Accurate LRN)
1. **In `AdminLedgerModule.tsx` (`parseLedgerSmartInfo`)**:
   - Expand placeholder name condition: Treat `'Học viên E-learning'` as a placeholder that triggers CRM lookup, exactly like `'---'` or `'Ẩn danh'`.
   - Extract `normalizedLeaCode` from `tx.description`, `tx.originalContent`, `tx.note`, or `tx.studentId` (if starting with `'LEA-'`).
   - Query `allCrmRecords`: Match by `r.code === normalizedLeaCode || r.id === normalizedLeaCode || r.allIds?.includes(normalizedLeaCode)`. Filter out empty stub records where `!r.fullName && !r.name`.
   - When `matchedCrm` is found:
     - Set `studentDisplay = matchedCrm.name || matchedCrm.fullName` (`'Nguyễn Thị Anh Thi'`).
     - Resolve actual `lrnCode`:
       a. If `matchedCrm.studentId`: Look up `allStudents.find(s => s.uid === matchedCrm.studentId || s.student_code_internal === matchedCrm.studentId)`. Retrieve `student.student_code_internal` (`'LRN-20510493'`).
       b. Fallback: Match by email or phone in `allStudents`.
       c. If lead record has `matchedCrm.learnerCode` or `matchedCrm.studentCode` formatted as `LRN-XXXXXXXX`, use that.
       d. If no student profile exists, set `lrnCode: null` (never fabricate an LRN code from LEA digits).
2. **In `AdminLedgerModule.tsx` Table JSX (line 1347-1351)**:
   - Guard against prefix conversion: **Never** pass a `LEA-` code into `ensureValidBusinessCode(..., 'LRN')`.
   - Only render the sub-label if `smart.lrnCode` is non-null:
     ```tsx
     {smart.lrnCode && (
       <span className="font-mono text-[11px] text-slate-400">
         {smart.lrnCode}
       </span>
     )}
     ```

### 4.2 Resolution Strategy for R2 (Clean Description & Uniform Row Heights)
1. **In `parseLedgerSmartInfo`**:
   - Add handling for `[SePay-COL]` and `[LENH THU]`:
     ```typescript
     if (cleanDesc.startsWith('[SePay-COL]') || cleanDesc.startsWith('[LENH THU]')) {
       cleanDesc = 'Thu học phí E-learning';
     }
     ```
2. **In Table JSX (line 1369-1376)**:
   - Render `smart.cleanDesc` as a single truncated line (`line-clamp-1` / `truncate`).
   - Remove the second `<span>` rendering `tx.originalContent`.
   - Place `tx.originalContent` inside the `title` attribute of the container or text span:
     ```tsx
     <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
       <span
         className="text-[12px] font-medium text-slate-800 truncate block max-w-[360px]"
         title={tx.originalContent ? `${smart.cleanDesc} (${tx.originalContent})` : smart.cleanDesc}
       >
         {smart.cleanDesc}
       </span>
     </td>
     ```

### 4.3 Resolution Strategy for R3 (Cumulative Collection Payments & Progress Bar)
1. **In `CRMAdmissionsModule.tsx` (`activeCollectionOrder`)**:
   - Sum all matching COL transactions:
     ```typescript
     const totalMatchedColAmount = matched.reduce((sum, tx) => sum + (tx.credit || 0), 0);
     ```
   - Calculate `finalCollectedAmount`:
     ```typescript
     const finalCollectedAmount = Math.max(
       totalMatchedColAmount,
       collectedAmount,
       Number(editingRecord.paidAmount || 0)
     );
     ```
   - Return `paidAmount: finalCollectedAmount`.
2. **In `server.ts` (SePay Webhook)**:
   - When updating `customer_profiles` and `crm_records`:
     Accumulate `paidAmount: (existingPaid || 0) + amount_in` instead of overwriting.
   - Synchronize `fullName`, `name`, and `code` when updating `crm_records`, preventing empty stub documents.

---

## 5. Verification Method

1. **Unit Test Suite**:
   Run the project test command in `De_Vuong_Webapp/`:
   ```bash
   npm test
   ```
   Must pass with 0 failures.

2. **Automated Verification Script for Ledger & CRM Resolution**:
   Run node test checking `parseLedgerSmartInfo` and `activeCollectionOrder` logic with mock transactions for `LEA-91690914`:
   - Verification Assertions:
     - All transactions matching `LEA-91690914` return `studentDisplay === 'Nguyễn Thị Anh Thi'`.
     - All transactions matching `LEA-91690914` return `lrnCode === 'LRN-20510493'`.
     - No transaction displays `'LRN-91690914'`.
     - Transaction with 3,000 VND and 2,000 VND yields cumulative `paidAmount === 5000`.
     - `CommercialLifecycleBar` receives `paidAmount = 5000` / `effectiveTuition = 5000` and displays `"✓ Đã thu tiền"`.
     - Description column renders exactly 1 line without duplicate LEA or student names.

3. **Invalidation Conditions**:
   - If any ledger row with `LEA-91690914` displays `'Học viên E-learning'` or `'LRN-91690914'`.
   - If `activeCollectionOrder.paidAmount` displays `2.000đ` instead of `5.000đ`.
   - If description column height exceeds standard single-line height (`py-3.5`).
