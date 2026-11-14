# Handoff Report: Requirement 1 (R1) Data Layer & Identity Backbone Investigation

**Explorer**: Survey Explorer 1 (`explorer_survey3_1`)  
**Parent Agent**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Date**: 2026-11-11T16:11:00Z  
**Target Project**: `De_Vuong_Webapp/`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

### Obs 1.1: Current Test Suite Status in `De_Vuong_Webapp/`
- Running `npm test` inside `De_Vuong_Webapp/` executes:
  `node --import tsx --test tests/paymentCore.test.ts tests/classDetailHelpers.test.ts tests/mobileSwipe.test.ts tests/admissionsDebtSync.test.ts`
- **Result**: All 23 tests passed (0 failed, duration ~3.15s).
- Running challenger test suites `npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts` also passed 100% (18/18 tests, duration ~1.63s).
- Specifically in `tests/admissionsDebtSync.test.ts` (lines 1–201):
  - Test 1 (lines 7–52): `resolveStudentIdentity` resolves genuine `LRN` from `student_code_internal`, phone, email, or name.
  - Test 2 (lines 54–106): `parseLedgerSmartInfo` multi-hop identity resolution eliminates generic placeholders ("Học viên E-learning") and bridges CRM lead to authentic `LRN`, asserting:
    - `assert.notEqual(smart.studentDisplay, 'Học viên E-learning');`
    - `assert.equal(smart.studentDisplay, 'Nguyễn Thị Anh Thi');`
    - `assert.equal(smart.lrnCode, 'LRN-62517882');`
    - `assert.notEqual(smart.lrnCode, 'LRN-64817788');` (never synthesizes pseudo-LRN from LEA digits)
    - `assert.equal(smart.cleanDesc, 'Thu học phí E-learning');`
  - Test 3 (lines 108–128): Cleans `[LỆNH THU]` descriptions into single-line format:
    - `assert.equal(smart.cleanDesc, 'Lệnh thu học phí');`
    - `assert.equal(smartWithNote.cleanDesc, 'Lệnh thu học phí (Đóng cọc đợt 1)');`
  - Test 4 (lines 130–200): Resolves hashed `crm_*` records (`crm_1792918953302` -> `LEA-96055010`, `crm_1793608413805` -> `LEA-64817788`) and suppresses duplicate nameless/placeholder `LEA-*` ghost stubs even when ghost stubs appear earlier in the array.

### Obs 1.2: CRM Records vs Customer Profiles Resolution & Identity Fixes
- `CRMAdmissionsModule.tsx`:
  - Lines 2735–2950: Subscribes to `crm_records` and `customer_profiles`.
  - Lines 2761–2831: `mergeCRMRecord(existing, incoming)` prioritizes real profiles over stubs (`isPlaceholderLeadName`), preserving authentic name, contact phone, and genuine `LRN` (`studentId.startsWith('LRN-')`).
  - Lines 2841–2881: Uses `leaToKeyMap` to collapse ghost stubs into their authentic parent record using `ensureValidBusinessCode(item.code || item.reconciliationCode || idKey, 'LEA')`.
  - Lines 3504–3512: In `handleSave`, writes to BOTH collections:
    ```ts
    const canonicalCode = ensureValidBusinessCode(updated.code || updated.id, 'LEA');
    const docPayload = removeUndefinedFields({
      ...updated,
      code: canonicalCode,
      fullName: updated.name,
      updatedAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
    await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
    ```
  - **Issue in `handleSave`**: At lines 3483–3498, local state (`setRecords`) and local storage (`persistCustomRecords`) receive `updated` *before* `code: canonicalCode` is set on it! Thus in-memory objects and localStorage can exist with missing `code: LEA-*`.

### Obs 1.3: SePay Webhook Root Cause for Ghost Records in `server.ts`
- In `server.ts` (lines 3016–3254):
  - When SePay webhook receives `amount_in > 0` with content matching `\bLEA[-]?([0-9]{6,10})\b`:
  - `findBestLeadDoc` (lines 3040–3079) searches `customer_profiles` and `crm_records` by:
    1. `where('code', 'in', [fullLeaCode, ...])`
    2. `where('leadCode', '==', fullLeaCode)`
    3. `colRef.doc(fullLeaCode).get()`
    4. Fallback: scans collection documents checking if doc.id hashes to `fullLeaCode` via `LEA-${hashLeaDigits(d.id)}`.
  - At lines 3196–3226:
    ```ts
    if (crmMatchedRef) {
      ...
      tx.set(crmMatchedRef, crmUpdatePayload, { merge: true });
    } else if (customerProfileRef && resolvedStudentName) {
      tx.set(db.collection('crm_records').doc(fullLeaCode), {
        code: fullLeaCode,
        name: resolvedStudentName,
        fullName: resolvedStudentName,
        phone: payerPhone,
        email: candidateEmail || '',
        studentId: resolvedLrnCode || candidateStudentId || undefined,
        paymentStatus: 'completed',
        status: 'enrolled',
        paidAmount: amount_in,
        receiptCode: colCode,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    ```
  - **Historical cause of ghost docs**: Prior to recent fallback hash checks, when a lead document had ID `crm_1792918953302` without field `code: LEA-96055010`, queries by `code` or doc ID `LEA-96055010` returned nothing. The webhook then created a brand-new doc `crm_records/LEA-96055010` with default placeholder name (`"Chưa đặt tên"` or `"Học viên E-learning"`), producing duplicate ghost records.

### Obs 1.4: Current State of the 3 Data Streams
1. **Raw Bank Feed (`sepay_bank_events` / `bank_events`)**:
   - Webhook in `server.ts` (line 2812) writes to Firestore collection `'bank_events'` keyed by `bankEventId = createBankEventId(sepayId, bankRef)`.
   - Simultaneously writes to `ledger_transactions` with ID `BANK-${bankEventId}` or `COL-${bankEventId}`.
   - At line 2799: `refCode = 'SP' + (sepayId || bankRef || Date.now())`.
   - In `SepayReconciliationModule.tsx` (lines 278–283): Bank feed transactions are currently filtered from `ledger_transactions` using:
     `Boolean(t.bankEventId || (t.refCode?.startsWith('SP') && t.autoClassified))`
   - Test transactions (e.g. `refCode` starting with `SP111111` or content containing `TEST PHI`) currently lack an explicit `isTest: true` property and leak into general ledger totals (`totalCredit` and `totalCollected`).
2. **Sổ cái thực thu / thực chi (`ledger_transactions`)**:
   - In `LeadPaymentModal.tsx` (lines 224–244): Whenever a user copies a VietQR/Zalo payment message, it writes:
     ```ts
     await addDoc(collection(db, 'ledger_transactions'), cleanObject({
       type: 'expected_revenue',
       description: `[LỆNH THU] ${clientName} - ${targetCode} (${currentMemo}) ...`,
       credit: numericAmount,
       ...
     }));
     ```
   - In `AdminLedgerModule.tsx`:
     - Lines 861–866: Pinned transactions (`pinnedTransactions = filteredTransactions.filter(tx => tx.type === 'expected_revenue')`) are displayed on top of the General Ledger table.
     - Lines 893–905: `summaryData` separates `expected_revenue` from `totalCredit`.
     - Lines 911–933: `studentReport` erroneously adds `totalPaid += (tx.credit || 0)` for ALL transactions without checking `tx.type !== 'expected_revenue'`, causing projected collection orders to count as actual student payments!
3. **Expected revenue / Debt (Công nợ phải thu)**:
   - In `AdminLedgerModule.tsx` (lines 947–1062): Receivables (`flatMilestones`) only processes B2B contracts (`contracts` from `documentService.getDocuments()`).
   - B2C Leads debt (`tuition - paidAmount > 0`) is tracked in `CRMAdmissionsModule.tsx` and has never been merged into the Finance Receivables view!
   - In `AdminDashboard.tsx` (lines 3329–3332), "total outstanding" was calculated by summing `ledger_transactions` where `type === 'expected_revenue'`, which is brittle and conflates projections with commercial debt.

### Obs 1.5: MISA Export Logic in `AdminLedgerModule.tsx`
- Lines 1251–1278: Exports CSV with headers:
  `["NgayHachToan", "NgayChungTu", "SoChungTu", "DienGiai", "TKNo", "TKCo", "SoTien", "MaDoiTuong", "TenDoiTuong"]`
- `MaDoiTuong` is derived from `smart.lrnCode || smart.leaCode || tx.refCode || ''`.
- `TenDoiTuong` is derived from `!isGenericLedgerName(smart.studentDisplay) ? smart.studentDisplay : (tx.studentName || 'Khách hàng')`.
- This logic is currently private to `AdminLedgerModule.tsx` and duplicated in parts of `SepayReconciliationModule.tsx` and `AdminDashboard.tsx`.

---

## 2. Logic Chain

1. **Identity Resolution Fragmented across 4 Places**:
   - `CRMAdmissionsModule.tsx`: `resolveStudentIdentity` (Obs 1.1, lines 715–739).
   - `AdminLedgerModule.tsx`: `parseLedgerSmartInfo` (Obs 1.1, lines 113–326).
   - `AdminDashboard.tsx`: `getStudentLeadInfo` (Obs 1.4, lines 470–560).
   - `server.ts`: `findBestLeadDoc` (Obs 1.3, lines 3040–3079).
   *Reasoning*: Each file re-implements matching by phone, email, name, `LRN-*`, `LEA-*`, and placeholder detection (`isGenericLedgerName`, `isPlaceholderName`, `isPlaceholderLeadName`). By defining `resolveFinanceParty` in `src/domain/financeIdentity.ts`, all four modules and MISA export share a single authoritative resolution engine.

2. **Preventing Ghost Stubs and Guaranteeing `code: LEA-*` Sync**:
   - When saving in `CRMAdmissionsModule.tsx`, setting `updated.code = canonicalCode` *before* `setRecords(next)` and `persistCustomRecords(next)` ensures local React state and `localStorage` always carry the canonical `LEA-*` code (Obs 1.2).
   - In `server.ts` webhook, when a matching `crm_*` doc is found by hash or phone/email, the webhook must explicitly write `code: fullLeaCode` to that existing doc (`crmMatchedRef`) via `tx.set(crmMatchedRef, { code: fullLeaCode, ... }, { merge: true })` (Obs 1.3). It must NEVER create a separate document `crm_records/fullLeaCode` when `crmMatchedRef` exists.

3. **Clean 3-Stream Data Separation**:
   - **Stream 1 (Bank Feed)**: Real bank events from SePay webhook stored in `bank_events`. All transactions where `refCode` matches `/^SP1{5,}/` or content contains `TEST` or `test_` must be flagged with `isTest: true`. All ledger/cashflow calculations must filter `!tx.isTest`.
   - **Stream 2 (General Ledger)**: Sổ cái must strictly represent actual cash flow (`type !== 'expected_revenue'`). The `pinnedTransactions` table in `AdminLedgerModule.tsx` must be removed from the Ledger tab, and `studentReport` must exclude `expected_revenue`.
   - **Stream 3 (Debt & Expected Revenue)**: Debt must not be tracked via fake ledger records. Instead:
     - B2B Debt: Unpaid milestones from `documentService.getDocuments()` (`milestone.status !== 'Paid'`).
     - B2C Debt: Leads from CRM where `tuition > 0` and `(tuition - paidAmount) > 0`.
     - Total Projected Inflow = Total B2B Remaining Milestones + Total B2C Remaining Leads Debt.

4. **Historical Data Reconciliation (Dry-Run)**:
   - A dedicated Node/TS script `scripts/audit_finance_identity_dryrun.mjs` must run with read-only permissions (calling only `.get()`).
   - It will scan `crm_records`, `customer_profiles`, `ledger_transactions`, and `bank_events`, producing a structured audit report of:
     - Number of ghost stubs with "Chưa đặt tên" or empty contact.
     - Records missing `code: LEA-*` with proposed deterministic backfill codes.
     - Test transactions (`SP111111...`) tagged for exclusion.
     - Discrepancies between `expected_revenue` in ledger vs real commercial debt.
     - Zero database writes occur during the dry-run.

---

## 3. Caveats

- **Firestore Service Account Credentials**: Running scripts against production Firestore requires `serviceAccountKey.json` or `FIREBASE_SERVICE_ACCOUNT_JSON`. In local development/emulator mode, scripts must target `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`. The dry-run script must gracefully detect and support both environments without crashing.
- **LocalStorage Seed Records**: `CRMAdmissionsModule.tsx` currently merges local overrides (`katc_crm_overrides`) and custom records (`katc_custom_crm_records`). Identity resolution must ensure that in-memory resolution does not produce different results on different client machines when Firestore is the source of truth.
- **Backwards Compatibility**: Existing `ledger_transactions` already containing `type: 'expected_revenue'` must not be deleted destructively; rather, the Ledger queries and Cash Flow report must explicitly filter them out (`tx.type !== 'expected_revenue'`), while the Debt Management module reads directly from commercial sources.

---

## 4. Conclusion & Actionable Blueprint

### Proposed Shared Architecture: `src/domain/financeIdentity.ts`
Create `src/domain/financeIdentity.ts` exposing:
1. `resolveFinanceParty(input: FinancePartyInput, context?: FinancePartyContext): FinanceParty`:
   - Inputs: `Transaction`, bank event, or `{ refCode, studentId, studentName, phoneNumber, email, description, content, type }`.
   - Context: `{ students?: UserProfile[], crmRecords?: any[], partners?: Partner[] }`.
   - Outputs:
     ```ts
     export interface FinanceParty {
       partyType: 'student' | 'lead' | 'partner' | 'internal' | 'unresolved';
       partyCode: string;          // LRN-xxxxxxxx, LEA-xxxxxxxx, PRT-xxxxxxxx, or empty
       partyName: string;          // Guaranteed authentic, non-placeholder name
       lrnCode: string | null;     // Genuine LRN (never synthesized from LEA digits)
       leaCode: string | null;     // Genuine LEA
       partnerCode: string | null; // B2B Partner code
       isTest: boolean;            // true if SP111111, content test, or test flag
       cleanDescription: string;   // Cleaned single-line description
       categoryLabel: string;      // "Học viên", "Tuyển sinh", "Doanh nghiệp", "Nội bộ"
     }
     ```
2. `isTestTransaction(tx: any): boolean`:
   - Checks `tx.isTest === true`, `tx.refCode` matches `/^SP1{5,}/` or `/^SP_TEST/i`, or `tx.description`/`tx.originalContent` contains `\bTEST\b` or `\bTHU NGHIEM\b`.
3. `isGenericPlaceholderName(name?: string | null): boolean`:
   - Centralizes `isGenericLedgerName` / `isPlaceholderName` / `isPlaceholderLeadName`.

### Proposed Code Updates for R1 Implementation
1. **`server.ts`**:
   - In SePay webhook, tag test transactions: if `isTestTransaction({ refCode, content, sepayId })`, set `isTest: true`, `status: 'test'`.
   - Ensure `code: fullLeaCode` is updated directly on `crmMatchedRef` and `customerProfileRef`.
   - Guarantee no ghost document is created when genuine profile exists.
2. **`CRMAdmissionsModule.tsx`**:
   - In `handleSave`, assign `updated.code = canonicalCode` *before* calling `setRecords` and `persistCustomRecords`.
3. **`AdminLedgerModule.tsx`**:
   - Replace local `parseLedgerSmartInfo` internals with `resolveFinanceParty`.
   - Filter `!isTestTransaction(tx)` and `tx.type !== 'expected_revenue'` in Sổ cái table and `summaryData` / `studentReport`.
   - In MISA Export, populate `MaDoiTuong = party.partyCode` and `TenDoiTuong = party.partyName`.
4. **`tests/admissionsDebtSync.test.ts`**:
   - Import and test `resolveFinanceParty` across all 4 party types (student, lead, partner, internal).
   - Assert `isTestTransaction('SP111111') === true` and verify test transactions are excluded from ledger calculations.
5. **Dry-Run Audit Script**:
   - Create `scripts/audit_finance_identity_dryrun.mjs` that runs read-only analysis and writes `reports/finance_audit_dryrun_report.json` with zero database writes.

---

## 5. Verification Method

1. **Automated Unit Tests**:
   - Run in `De_Vuong_Webapp/`:
     ```bash
     npm test
     ```
   - Must pass 100% of tests in `tests/admissionsDebtSync.test.ts` and `tests/paymentCore.test.ts`.
   - Run challenger tests:
     ```bash
     npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts
     ```
2. **Build Verification**:
   - Run in `De_Vuong_Webapp/`:
     ```bash
     npm run build
     ```
   - Must build with zero TypeScript or bundling errors.
3. **Dry-Run Script Verification**:
   - Run:
     ```bash
     node scripts/audit_finance_identity_dryrun.mjs
     ```
   - Verify report file is generated and no Firestore write operations (`set`, `update`, `delete`, `batch`) are executed.
