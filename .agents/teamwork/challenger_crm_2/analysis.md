# Adversarial Audit & Empirical Challenge Report (Challenger 2)

**Project**: CRM Admissions Fee & Monthly Commission Extension  
**Target File**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`  
**Challenger Role**: Empirical Challenger 2 (teamwork_challenger)  
**Date**: 2026-11-14  
**Verdict**: **APPROVE**

---

## 1. Executive Summary

As Empirical Challenger 2, an adversarial audit and stress test were conducted on the UI state management, persistence flow, Firestore listeners, and cursor stability in `CRMAdmissionsModule.tsx`.

All empirical tests passed, with 0 TypeScript compilation errors, 0 runtime crashes, and full build success (`npm run build` completed with Exit Code 0 in 19.22s, and `npm test` 28/28 tests passed).

| Audit Dimension | Test Focus | Result | Status |
|---|---|---|---|
| **Firestore Persistence** | `setDoc`, `removeUndefinedFields`, `handleSaveForm`, `handleDuplicateRecord` | No `undefined` crash, zero fees kept, deep clone prevents mutation leaks | **PASS** |
| **Real-time Sync** | `latestCrmDocs`, `latestProfileDocs`, `mergeCRMRecord` | Both fields mapped cleanly, no data loss on live snapshots | **PASS** |
| **Cursor Stability** | `SaaSCurrencyInput` start/mid/end insertion & separator deletion | Exact cursor position tracking relative to typed digits, no cursor jumping | **PASS** |
| **Input Sanitization** | Non-digits, symbols, letters, spaces, negative values | Stripped cleanly to valid integers; state cannot be corrupted | **PASS** |
| **Empirical Verification** | `npm run build` & Node test suites | 36 adversarial unit tests + 28 standard tests pass (100%) | **PASS** |

---

## 2. Adversarial Challenge 1: Firestore Persistence & Listeners Audit

### 2.1 `removeUndefinedFields` Before `setDoc`
- **Vulnerability Investigated**: Firestore SDK throws runtime error `Function DocumentReference.set() called with invalid data. Unsupported field value: undefined` if any key in the payload is `undefined`.
- **Code Inspection**:
  In `handleSaveForm`:
  ```typescript
  classIntakeFee: formClassIntakeFee !== '' ? (Number(String(formClassIntakeFee).replace(/\D/g, '')) || 0) : undefined,
  ```
  When the user leaves "Phí nhận lớp" blank, `classIntakeFee` is `undefined`.
  Lines 3728-3735:
  ```typescript
  const docPayload = removeUndefinedFields({
    ...updated,
    code: canonicalCode,
    fullName: updated.name,
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
  await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
  ```
- **Empirical Test (`tests/challenger_crm_persistence_cursor.test.ts` Test 1.1)**:
  `removeUndefinedFields` was tested with undefined fields and empty commission arrays.
  Result: Undefined fields are stripped recursively; `classIntakeFee: undefined` is stripped completely from the object, preventing any Firestore crash.
- **Zero-Value Preservation Test (Test 1.2)**:
  When `classIntakeFee` is `0`, `removeUndefinedFields` retains `classIntakeFee: 0` because `0 !== undefined`.

### 2.2 Deep Cloning on Duplicate Record
- **Vulnerability Investigated**: If `rec.monthlyCommissions` is copied by shallow reference, modifying the duplicated record in UI could corrupt the original record in local state.
- **Code Inspection (`handleDuplicateRecord` lines 4138-4144)**:
  ```typescript
  const duplicated: CRMRecord = {
    ...rec,
    id: newId,
    name: `${rec.name} (Bản sao)`,
    classIntakeFee: rec.classIntakeFee,
    monthlyCommissions: rec.monthlyCommissions ? JSON.parse(JSON.stringify(rec.monthlyCommissions)) : undefined,
  };
  ```
- **Empirical Test (Test 1.4)**:
  Mutating `duplicated.monthlyCommissions` (modifying amounts, adding new months) did NOT mutate `originalRecord.monthlyCommissions`. Object isolation is strictly maintained.

### 2.3 Real-time Snapshot Mapping
- **Vulnerability Investigated**: When Firestore real-time snapshot fires (`onSnapshot`), if new fields are omitted in the document mapping function, real-time updates will drop `classIntakeFee` and `monthlyCommissions`.
- **Code Inspection**:
  In `latestCrmDocs` (lines 3105-3106):
  ```typescript
  classIntakeFee: data.classIntakeFee !== undefined ? Number(data.classIntakeFee) : undefined,
  monthlyCommissions: Array.isArray(data.monthlyCommissions) ? data.monthlyCommissions : undefined,
  ```
  In `latestProfileDocs` (lines 3164-3165):
  ```typescript
  classIntakeFee: data.classIntakeFee !== undefined ? Number(data.classIntakeFee) : undefined,
  monthlyCommissions: Array.isArray(data.monthlyCommissions) ? data.monthlyCommissions : undefined,
  ```
- **Empirical Test (Tests 2.1 & 2.2)**:
  Tested snapshot mapping against raw documents with valid data, missing fields, and null fields.
  Result: Cleanly parses numbers and arrays; safely falls back to `undefined` for legacy records without runtime exceptions.

### 2.4 `mergeCRMRecord` Field Retention
- **Vulnerability Investigated**: When merging local records, override maps, and snapshot documents, incoming updates must not erase existing values unless explicitly overwritten.
- **Code Inspection (lines 2989-2992)**:
  ```typescript
  classIntakeFee: incoming.classIntakeFee !== undefined ? incoming.classIntakeFee : existing.classIntakeFee,
  monthlyCommissions: (incoming.monthlyCommissions && incoming.monthlyCommissions.length > 0)
    ? incoming.monthlyCommissions
    : existing.monthlyCommissions,
  ```
- **Empirical Test (Tests 2.3 - 2.7)**:
  - Incoming `classIntakeFee = 2000000` overrides existing: PASS
  - Incoming `classIntakeFee = 0` is retained (not overridden by truthy fallback): PASS
  - Incoming `classIntakeFee = undefined` retains existing value: PASS
  - Incoming `monthlyCommissions` populated overrides existing: PASS
  - Incoming `monthlyCommissions = undefined` retains existing: PASS

---

## 3. Adversarial Challenge 2: Input Formatting & Anti-Cursor-Jump Verification

### 3.1 Anti-Cursor-Jump Math Analysis
- **Mechanism in `SaaSCurrencyInput` (lines 719-751)**:
  1. Count digits to the left of the cursor in unformatted string:
     `const digitsBeforeCursor = rawVal.slice(0, rawCursor).replace(/\D/g, '').length;`
  2. Format the clean digits:
     `const newFormatted = formatThousandsVN(cleanDigits);`
  3. Scan `newFormatted` until the same count of digits is encountered:
     ```typescript
     let newCursorPos = 0;
     let digitCount = 0;
     for (let i = 0; i < newFormatted.length; i++) {
       if (/\d/.test(newFormatted[i])) digitCount++;
       if (digitCount === digitsBeforeCursor) {
         newCursorPos = i + 1;
         break;
       }
     }
     ```
  4. Restore cursor position via `requestAnimationFrame` and `setSelectionRange(newCursorPos, newCursorPos)`.

### 3.2 Keystroke Simulation Test Cases
- **Test 3.1: Start Insertion**:
  Typing '1' before `200.000` $\to$ new formatted `1.200.000`.
  Digit count before cursor is 1 ('1').
  In `1.200.000`, digit '1' is at index 0. Cursor is restored to index 1 (right after '1', before the dot).
  **Result**: Cursor does not jump. PASS.
- **Test 3.2: Middle Insertion**:
  Typing '5' into `1.000.000` at index 4 (`1.00|0.000`) $\to$ new formatted `10.050.000`.
  Digit count before cursor is 4 ('1', '0', '0', '5').
  In `10.050.000`, the 4th digit is '5' at index 4. Cursor is placed at index 5 (right after '5').
  **Result**: Cursor stays precisely next to the inserted digit. PASS.
- **Test 3.3: End Insertion**:
  Typing '0' at the end of `1.000.000` $\to$ new formatted `10.000.000`.
  Cursor lands at length 10. PASS.
- **Test 3.4: Backspace on Dot Separator**:
  User presses backspace on dot separator at index 2 (`1.|000.000`).
  Browser deletes dot $\to$ `1000.000`.
  Digits before cursor is 1 ('1').
  Formatted output is `1.000.000`, cursor is placed at index 1.
  **Result**: Cursor does not jump or freeze. PASS.
- **Test 3.5 & 3.6: Non-numeric and Dirty Input Sanitization**:
  Inputs like `abc1.500.000xyz`, `$$1500000##`, `   1.500.000   `, and letters `1a2b3c4d5e` are completely stripped by `/\D/g` to clean numbers.
  Empty or completely non-numeric strings safely return `0` and empty string display without `NaN` or runtime errors. PASS.

---

## 4. Empirical Test Suite Results

1. **`De_Vuong_Webapp/tests/challenger_crm_persistence_cursor.test.ts`**:
   - 17 test cases executed
   - 17 passed, 0 failed
   - Duration: 2.48s
2. **`De_Vuong_Webapp/tests/crmAdmissionsAdversarial.test.ts`**:
   - 19 test cases executed
   - 19 passed, 0 failed
   - Duration: 2.30s
3. **Existing Regression Suite (`npm test`)**:
   - 28 test cases executed
   - 28 passed, 0 failed
   - Duration: 2.46s
4. **Production Build (`npm run build`)**:
   - 3786 modules transformed
   - Vite production build succeeded with Exit Code 0 in 19.22s.

---

## 5. Explicit Final Verdict

**Verdict**: **APPROVE**  
The implementation in `CRMAdmissionsModule.tsx` is robust, mathematically correct, prevents cursor jumps on formatted numeric inputs, properly serializes data for Firestore without `undefined` crashes, and maintains data integrity during real-time snapshot sync.
