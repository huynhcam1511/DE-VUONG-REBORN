# Handoff Report — Explorer Survey 3: Firestore Dry-run Script, Data Models, Test & Build Infrastructure (R1 & R3)

**Author**: Explorer Survey 3 (`explorer_survey3_3`)  
**Recipient**: Lead Orchestrator (`parent` / `029cef84-8361-4084-a50e-50f632a7bb27`)  
**Project**: Finance Consolidation Project — De_Vuong_Webapp  
**Date**: 2026-11-11  

---

## 1. Observation

### 1.1. Build & Test Infrastructure
- **`package.json`**:
  - Located at `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\package.json`.
  - Type: `"type": "module"`.
  - Build script (line 12): `"build": "vite build"`.
  - Lint script (line 22): `"lint": "tsc --noEmit"`.
  - Test script (line 23): `"test": "node --import tsx --test tests/paymentCore.test.ts tests/classDetailHelpers.test.ts tests/mobileSwipe.test.ts tests/admissionsDebtSync.test.ts"`.
  - Test framework: Native Node.js Test Runner (`node:test` + `node:assert/strict`) executed with `tsx` (`"tsx": "^4.23.2"`).
- **Execution of `npm test`**:
  - Command: `cd De_Vuong_Webapp; npm test`
  - Result: **Exited with code 0. 23 tests, 0 suites, 23 pass, 0 fail, duration 1872ms**.
- **Execution of `tests/admissionsDebtSync.test.ts`**:
  - Command: `cd De_Vuong_Webapp; node --import tsx --test tests/admissionsDebtSync.test.ts`
  - Result: **Exited with code 0. 4 tests, 4 pass, 0 fail, duration 1841ms**.
  - Verified tests:
    1. `resolveStudentIdentity: resolves genuine LRN from student_code_internal, phone, email, or name` (pass)
    2. `parseLedgerSmartInfo: multi-hop identity resolution eliminates generic placeholders and pseudo-LRN` (pass)
    3. `parseLedgerSmartInfo: cleans [LỆNH THU] descriptions into single-line format` (pass)
    4. `parseLedgerSmartInfo: resolves hashed crm_* record and ignores duplicate nameless/placeholder LEA-* ghost stub` (pass)
- **Execution of `npm run build`**:
  - Command: `cd De_Vuong_Webapp; npm run build` (`vite build`)
  - Result: **Exited with code 0. Built in 15.69s**. Output generated in `dist/` with 0 bundle or syntax errors.
- **Execution of `npm run lint` (`tsc --noEmit`)**:
  - Exited with code 1 due to pre-existing TypeScript errors in legacy modules outside finance (`ClassDetail.tsx`, `StudentPortal.tsx`, `TrainingPrograms.tsx`, etc.).
  - Within finance components:
    - `AdminLedgerModule.tsx:1533`: `sepayId` property not yet declared on `Transaction` interface in `src/types/admin.ts`.
    - `CRMAdmissionsModule.tsx:1420, 1719, 1756, 1864`: Type comparison warning where `TransactionType` does not include `'expected_revenue'` (since `expected_revenue` was cleaned from `TransactionType`).

---

### 1.2. Firestore Collections & Schema Analysis

Through read-only audit of Firestore using Admin SDK:

| Collection Name | Document Count | Purpose & Role | Key Fields Observed |
| :--- | :--- | :--- | :--- |
| `bank_events` | 114 | Raw SePay webhook bank feeds | `id` (hash of sepayId/bankRef), `sepayId`, `bankRef`, `amountIn`, `amountOut`, `content`, `transactionDate`, `classification`, `status`, `receivedAt` |
| `ledger_transactions` | 182 | Sổ cái kế toán chính thức | `id`, `refCode`, `date`, `credit` (thu), `debit` (chi), `surplus`, `type` (`payment`, `tuition_fee`, `center_payment`, `capital_injection`, `expense`, `owner_withdrawal`, `expected_revenue`, `unclassified_in`, `unclassified_out`), `studentName`, `studentId`, `description`, `originalContent`, `sepayId`, `bankRef` |
| `crm_records` | 20 | Hồ sơ Tuyển sinh & CRM Leads | `id`, `name`, `fullName`, `code` (`LEA-XXXXXXXX`), `phone`, `email`, `tuition`, `paidAmount`, `paymentStatus`, `status`, `studentId` |
| `customer_profiles` | 17 | Hồ sơ Khách hàng & Storefront Leads | Mirror schema of `crm_records`, used by `CourseCheckoutModal.tsx` and legacy sync |
| `documents` | 7 | Chứng từ & Hợp đồng Kinh tế B2B | `id`, `contractCode` (`CTR-XXXXXXXX`), `title`, `partnerId`, `partnerName`, `documentGroup` (`01_commercial`, `02_legal`), `type`, `contractValue`, `paymentMilestones` |
| `payments` | 6 | Sổ theo dõi học phí học viên LMS | `studentId`, `totalAmount`, `paidAmount`, `debt`, `transactions` |
| `payment_intents` | 1 | Intent chuyển khoản SePay VietQR | `transferCode`, `expectedAmount`, `status`, `expiresAt`, `studentId` |
| `orders` | 3 | Đơn hàng Video E-learning | `orderCode`, `receiptCode`, `customerName`, `customerPhone`, `amount`, `status` |
| `partners` | 4 | Danh bạ Doanh nghiệp B2B | `id`, `name`, `taxCode`, `representativeName`, `phone`, `email` |
| `users` | 80 | Tài khoản người dùng & học viên LMS | `uid`, `student_code_internal` (`LRN-XXXXXXXX`), `fullName`, `phone`, `email`, `role`, `status` |

---

### 1.3. Direct Evidence of Ghost Documents & Root Cause

1. **Ghost Stubs in `crm_records`**:
   - `LEA-64817788`: `name: ""`, `code: MISSING`, `phone: ""`, `email: ""`
   - `LEA-96055010`: `name: ""`, `code: MISSING`, `phone: ""`, `email: ""`
   - `LEA-91690914`: `name: ""`, `code: MISSING`, `phone: ""`, `email: ""`
2. **Real Profiles in `crm_records` and `customer_profiles` Missing `code: LEA-*`**:
   - `crm_1792918953302`: `name: "Nguyễn Minh Phương"`, `phone: "0987255999"`, `email: "nguyenminhphuong1883@gmail.com"`, `studentId: "LRN-36435305"`, **`code: MISSING`**.
   - `crm_1793608413805`: `name: "Nguyễn Thị Anh Thi"`, `phone: "0948275769"`, `email: "anhthi20041105@gmail.com"`, **`code: MISSING`**.
   - `crm_1790350595176`: `name: "CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA"`, `phone: "0868383217"`, **`code: MISSING`**.
   - `crm_1791894369394`: `name: "Phạm Minh Tiến"`, `phone: "0901790624"`, `email: "tienpham3307@gmail.com"`, **`code: MISSING`**.
   - `crm_1791990768144`: `name: "Anh Tý"`, `phone: "0962721100"`, **`code: MISSING`**.
   - `crm_1792814827439`: `name: "Nguyễn Danh Khang"`, `phone: "0332098708"`, `email: "danhkhangnguyen687@gmail.com"`, **`code: MISSING`**.
   - `crm_1793099685204`: `name: "Trần Nhựt Lan Anh"`, `phone: "0968601049"`, `email: "trannhutlananh1911@gmail.com"`, **`code: MISSING`**.
   - `crm_1793108005735`: `name: "Trần Quang Minh"`, `phone: "0388890496"`, `email: "minhtran01052003@gmail.com"`, **`code: MISSING`**.
3. **Deterministic Hash Verification**:
   - Using `hashStringTo8Digits` from `src/utils/codeGenerator.ts`:
     - `hashStringTo8Digits('crm_1792918953302')` $\to$ `96055010` $\implies$ `LEA-96055010`.
     - `hashStringTo8Digits('crm_1793608413805')` $\to$ `64817788` $\implies$ `LEA-64817788`.
   - **Conclusion**: The ghost docs `LEA-96055010` and `LEA-64817788` were created historically when SePay webhooks received transfer notes referencing `LEA-96055010` and `LEA-64817788`. Because the genuine profiles `crm_1792918953302` and `crm_1793608413805` lacked `code: 'LEA-...'` in Firestore, the query failed to find them, generating a blank stub.

---

### 1.4. Test Transactions & Expected Revenue in `ledger_transactions` and `bank_events`

1. **Expected Revenue (`expected_revenue` / `[LỆNH THU]`)**:
   - Observed **28 records** in `ledger_transactions` with `type === 'expected_revenue'` or descriptions matching `[LỆNH THU] ...` / `[LENH THU] ...`.
   - Examples:
     - `4t48wltaKl0vG02uAQ2s` (`COL-71360435`): `"[LỆNH THU] Anh Tý - LEA-91756809 (HOCPHI LEA91756809)"`, credit = 4,500,000 VND.
     - `0LyIgZWKhTw2msWDsQ0X` (`COL643860`): `"[LENH THU] THANH TOAN HOC PHI - NGUYỄN THỊ ANH THI"`, credit = 5,000 VND.
   - Impact: These represent uncollected receivables created from collection orders, NOT money received in bank accounts. They artificially inflate Sổ cái credit and cash flow totals if not segregated.
2. **Synthetic Test Transactions**:
   - In `ledger_transactions`: 10+ transactions with `refCode` like `SP111111...` or descriptions containing `TEST`, `TT TEST PHI`, `CP-TEST`, `VGTEST`.
   - In `bank_events`: Over 50 records with `sepayId` matching `111111...`, `444444...`, `845459...`, `99999903`, or contents like `TEST LEA40172601 RANDOM`, `TEST NO PREFIX`, `TT TEST PHI`, `CP-TEST`.

---

## 2. Logic Chain

1. **Premise 1 (Data Flow Ingestion)**: In `server.ts` (lines 2814-2845 and 3141-3250), SePay webhook creates a `bank_events` record, writes a corresponding `ledger_transactions` entry, and updates `customer_profiles` / `crm_records`.
2. **Premise 2 (Ghost Doc Emergence)**: If a real profile was saved in Firestore with ID `crm_179...` without a persistent `code` field (as observed in `crm_1792918953302` and 7 others), the SePay webhook's lookup for `where('code', '==', fullLeaCode)` failed. A fallback routine created a new document with doc ID = `fullLeaCode` without customer name, resulting in ghost stubs.
3. **Premise 3 (In-Memory Resolution vs Database State)**: Although `parseLedgerSmartInfo` and `tests/admissionsDebtSync.test.ts` successfully bridge these records in memory during runtime, the underlying Firestore database remains un-reconciled, retaining both the ghost stub and the unanchored `crm_179...` profile.
4. **Premise 4 (Cash Flow Accuracy)**: Because 28 `expected_revenue` transactions exist in `ledger_transactions` alongside over 50 test events (`SP111111...`), naive summation of `credit` and `debit` produces incorrect cash flow and revenue metrics.
5. **Deduction (Requirement 1 & 3 Mandate)**:
   - A dedicated **dry-run audit script** must be established to scan Firestore, pair ghost stubs with real profiles, compute proposed deterministic `LEA-*` backfill codes, quantify test transactions and `expected_revenue` amounts, and output an audit report without touching or mutating Firestore.
   - A shared domain utility `resolveFinanceParty` must replace duplicate identity resolution code in `CRMAdmissionsModule.tsx`, `AdminLedgerModule.tsx`, and `server.ts`.

---

## 3. Caveats

1. **Read-Only Constraint**: In strict adherence to our explorer mission and the task prompt, no write, delete, or merge operations were executed against Firestore. The inspection was 100% read-only.
2. **Emulator vs Production Database**: The service account `service-account.json` connects to the active development/staging Firestore instance. When the dry-run script is executed in CI or local development, it must cleanly switch between emulator (`FIRESTORE_EMULATOR_HOST`) and service account credentials.
3. **Pre-existing TypeScript Errors**: `npm run lint` (`tsc --noEmit`) currently reports errors in non-finance modules (`ClassDetail.tsx`, `StudentPortal.tsx`, `TrainingPrograms.tsx`). These are legacy code issues and do not impede `npm run build` (`vite build`), which succeeds completely.

---

## 4. Conclusion & Proposed Architecture

### 4.1. Dry-Run Script Architecture (`scripts/reconcileFinanceDataDryRun.ts`)

- **File Path**: `De_Vuong_Webapp/scripts/reconcileFinanceDataDryRun.ts`.
- **Execution Command**:
  - `node --import tsx scripts/reconcileFinanceDataDryRun.ts`
  - NPM Script in `package.json`: `"finance:dry-run": "node --import tsx scripts/reconcileFinanceDataDryRun.ts"`
- **Strict Read-Only Enforcement**:
  - Script must instantiate Firestore Admin with read-only calls (`.get()`, `.listCollections()`).
  - No calls to `setDoc`, `updateDoc`, `deleteDoc`, `addDoc`, or `runTransaction`.
  - Safety check: If any write method is invoked, the script throws an error and aborts immediately.
- **Audit Categories Scanned**:
  1. **Ghost Stubs**: Identify documents in `crm_records` and `customer_profiles` with `name === ""` or placeholder names, and identify their corresponding real `crm_*` profile by hashed ID or contact info.
  2. **Unanchored Real Profiles**: Identify documents with real customer info missing `code: LEA-*`, and compute their deterministic `LEA-XXXXXXXX` code via `hashStringTo8Digits`.
  3. **Test Bank Events & Transactions**: Scan `bank_events` and `ledger_transactions` for test identifiers (`SP111111...`, `111111...`, `TEST`, `TT TEST PHI`, `CP-TEST`), count them, and sum their monetary amount.
  4. **Expected Revenue Separation**: Scan `ledger_transactions` for `type === 'expected_revenue'` or `[LỆNH THU]`, count them, and calculate the total amount to be excluded from actual cash flow.
  5. **Accounts Receivable (Công nợ) Baseline**:
     - B2B Receivables: Scan `documents` collection for active contracts and milestone payments where `status !== 'paid'` or `amount > (paidAmount || 0)`.
     - B2C Receivables: Scan `crm_records` / `customer_profiles` where `tuition - (paidAmount || 0) > 0`.
- **Report Output**:
  - Generates `reports/finance_consolidation_audit_<timestamp>.json` (machine-readable).
  - Generates `reports/finance_consolidation_audit_<timestamp>.md` (human-readable summary table).

### 4.2. Unified Identity Function (`resolveFinanceParty`)

Consolidate identity logic from `CRMAdmissionsModule.tsx`, `AdminLedgerModule.tsx`, and `server.ts` into a single domain utility:
- **Location**: `src/domain/financeIdentity.ts`.
- **Function Signature**:
  ```typescript
  export interface FinancePartyResolution {
    partyType: 'learner' | 'partner' | 'internal' | 'unclassified';
    partyName: string;
    partyCode: string; // LRN-XXXXXXXX, LEA-XXXXXXXX, ENT-XXXXXXXX, CTR-XXXXXXXX
    lrnCode?: string;
    leaCode?: string;
    partnerId?: string;
    contractCode?: string;
    isPlaceholder: boolean;
    cleanDescription: string;
    isTestTransaction: boolean;
  }

  export function resolveFinanceParty(
    tx: {
      studentId?: string;
      internalId?: string;
      refCode?: string;
      description?: string;
      originalContent?: string;
      note?: string;
      studentName?: string;
      partnerId?: string;
      partnerName?: string;
      sepayId?: string | number;
      bankRef?: string;
      type?: string;
    },
    context: {
      students?: UserProfile[];
      crmRecords?: any[];
      partners?: any[];
      documents?: any[];
    }
  ): FinancePartyResolution;
  ```

---

## 5. Verification Method

To independently verify these findings, run the following commands inside `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`:

1. **Verify Automated Admissions Debt Sync Test**:
   ```powershell
   node --import tsx --test tests/admissionsDebtSync.test.ts
   ```
   *Expected outcome*: 4 tests pass with exit code 0.

2. **Verify Full Test Suite**:
   ```powershell
   npm test
   ```
   *Expected outcome*: 23 tests pass across 4 test suites with exit code 0.

3. **Verify Vite Production Build**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Vite builds successfully in ~15-16s with exit code 0, creating bundles in `dist/`.

4. **Verify Firestore Read-Only Audit**:
   Execute our audit script:
   ```powershell
   node "../.agents/teamwork/explorer_survey3_3/inspect_finance_data.mjs"
   ```
   *Expected outcome*: Lists the 3 ghost stubs (`LEA-64817788`, `LEA-96055010`, `LEA-91690914`), the 8 unanchored `crm_179*` documents, the 28 `expected_revenue` transactions, and the test bank events.

---
*Report completed and ready for orchestrator review.*
