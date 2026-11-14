# Handoff Report — Challenger 2 (Empirical Verification)

## 1. Observation
- **Target File Analyzed**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Related Service**: `De_Vuong_Webapp/src/services/quotationService.ts` (`removeUndefinedFields`)
- **Key Code Locations Observed**:
  1. `MonthlyCommissionItem` & `CRMRecord`: lines 656-661, 775-805.
     `classIntakeFee?: number;` (line 793) and `monthlyCommissions?: MonthlyCommissionItem[];` (line 794).
  2. `SaaSCurrencyInput` cursor positioning math: lines 719-751.
     `const digitsBeforeCursor = rawVal.slice(0, rawCursor).replace(/\D/g, '').length;`
     `requestAnimationFrame(() => inputRef.current.setSelectionRange(newCursorPos, newCursorPos));`
  3. Form saving & Firestore serialization: lines 3637-3646, 3728-3735.
     `removeUndefinedFields` strips `undefined` before `setDoc(doc(db, 'customer_profiles', ...), docPayload, { merge: true })` and `setDoc(doc(db, 'crm_records', ...), docPayload, { merge: true })`.
  4. Duplicate record: lines 4138-4144.
     `classIntakeFee: rec.classIntakeFee` and deep clone `monthlyCommissions: rec.monthlyCommissions ? JSON.parse(JSON.stringify(rec.monthlyCommissions)) : undefined`.
  5. Real-time snapshot listeners: lines 3105-3106 (`latestCrmDocs`) and 3164-3165 (`latestProfileDocs`).
     Both listeners map `classIntakeFee` as number and `monthlyCommissions` as array.
  6. Record merging: lines 2989-2992 (`mergeCRMRecord`).
     Retains `classIntakeFee` (including numeric `0`) and preserves `monthlyCommissions`.
- **Empirical Execution Commands & Verbatim Outputs**:
  - `cd De_Vuong_Webapp; npm test` $\to$ Exit Code 0, 28/28 tests passed (duration: 2.35s).
  - `cd De_Vuong_Webapp; npm run build` $\to$ Exit Code 0, Vite built in 19.22s, 3786 modules transformed.
  - `cd De_Vuong_Webapp; node --import tsx --test tests/crmAdmissionsAdversarial.test.ts tests/challenger_crm_persistence_cursor.test.ts` $\to$ Exit Code 0, 36/36 adversarial tests passed (duration: 2.34s).

## 2. Logic Chain
1. **Firestore Persistence without Crashes**: Observation 3 shows `formClassIntakeFee !== '' ? ... : undefined` produces `undefined` when blank. Because `removeUndefinedFields` cleans the payload before calling `setDoc`, Firestore does not reject the document with `Unsupported field value: undefined`. When a fee is 0, `0 !== undefined`, so `removeUndefinedFields` preserves `0` as verified in Test 1.2.
2. **Real-time Listener Concurrency**: Observation 5 confirms both `latestCrmDocs` and `latestProfileDocs` extract `classIntakeFee` and `monthlyCommissions`. When real-time snapshots fire from Firestore, neither field is dropped or reset to empty.
3. **Record Merge Integrity**: Observation 6 confirms `mergeCRMRecord` checks `incoming.classIntakeFee !== undefined ? incoming.classIntakeFee : existing.classIntakeFee`. Because `0 !== undefined`, zero fee values are preserved rather than overwritten by existing truthy values, verified in Test 2.4.
4. **Deep Clone Mutation Safety**: Observation 4 demonstrates `JSON.parse(JSON.stringify(rec.monthlyCommissions))` breaks object references upon duplicating a record. Modifying the duplicate's months does not mutate the source record in memory (Test 1.4).
5. **Cursor Stability on Keystrokes**: Observation 2 and tests 3.1-3.4 verify `digitsBeforeCursor` correctly tracks the logical digit index irrespective of dot punctuation. Inserting characters at the beginning, middle, or end, or pressing backspace on a dot, never causes the cursor to jump to the end of the input or freeze out-of-bounds.
6. **Input Sanitization**: `cleanDigits = rawVal.replace(/\D/g, '')` strips currency symbols, alphabetic letters, and emojis, ensuring the underlying numeric state remains clean (Test 3.5 & 3.6).

## 3. Caveats
- Legacy records created before this feature that lack `classIntakeFee` or `monthlyCommissions` in Firestore will naturally yield `undefined` upon load, which the UI cleanly falls back to `0` or Month 1 blank row without crashing.
- Pre-existing TypeScript errors in unrelated legacy modules (`AdminLedgerModule.tsx`, `ClassDetail.tsx`, `StudentPortal.tsx`) exist in the workspace, but zero TypeScript errors were introduced by this implementation, and `npm run build` succeeds cleanly.

## 4. Conclusion
- **Explicit Verdict**: **APPROVE**
- All 4 acceptance criteria (R1, R2, R3, R4), persistence safety, real-time snapshot mapping, and cursor stability requirements are met with empirical proof.

## 5. Verification Method
To independently reproduce and verify this assessment:
1. **Run Unit & Regression Tests**:
   ```powershell
   cd De_Vuong_Webapp
   npm test
   ```
   *Expected*: 28 tests pass, exit code 0.
2. **Run Dedicated CRM Adversarial Tests**:
   ```powershell
   cd De_Vuong_Webapp
   node --import tsx --test tests/crmAdmissionsAdversarial.test.ts tests/challenger_crm_persistence_cursor.test.ts
   ```
   *Expected*: 36 tests pass, exit code 0.
3. **Run Production Build**:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   *Expected*: Vite builds successfully in ~19s, exit code 0.
