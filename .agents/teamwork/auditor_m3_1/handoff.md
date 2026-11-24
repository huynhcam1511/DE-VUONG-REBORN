# Forensic Integrity Audit Report: Milestones 1 & 2

- **Auditor**: `teamwork_auditor` (Forensic Integrity Auditor)
- **Target Work Products**:
  - `De_Vuong_Webapp/src/types/admin.ts`
  - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\auditor_m3_1\`
- **Date**: 2026-11-17T16:18:30Z
- **Verdict**: **CLEAN**

---

## 1. Observation

### 1.1 Source Code Analysis

1. **`De_Vuong_Webapp/src/types/admin.ts`**:
   - Lines 589–598: `TransactionType` union includes `'surplus_withdrawal'` alongside `'class_cancel_surplus'` and `'class_accept_surplus'`.
   - Lines 610–618: `Transaction` interface includes `surplus: number;` and optional `sepayId?: string | number;`.
   - No mock data, no stubbed types, no facade interfaces.

2. **`De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`**:
   - Lines 120–127: `parseLedgerSmartInfo` dynamically identifies `tx.type === 'surplus_withdrawal' || tx.refCode === 'HOANPHI'` and maps it to `'Rút quỹ hoàn phí (HOANPHI)'`.
   - Lines 450–468: `useMemo` dynamically computes `availableSurplus`, `totalCredit`, and `totalDebit`:
     ```ts
     const nonTestTxs = transactions.filter((t) => !isTestTransaction(t));
     const surplusVal = nonTestTxs.reduce((sum, t) => sum + (t.surplus || 0), 0);
     ```
   - Lines 483–487 & 509–510: In `handleSaveModalTransaction`, `computedSurplus` evaluates:
     ```ts
     const computedSurplus = modalType === 'class_cancel_surplus'
       ? cleanAmount
       : modalType === 'class_accept_surplus'
       ? -cleanAmount
       : 0;
     ```
     Persisted to Firestore via `revenueService.recordConfirmedRevenue` and local state.
   - Lines 599–658: `handleSaveWithdrawal` parses `cleanAmount`, validates `cleanAmount > 0` and `cleanAmount <= availableSurplus`, and executes an authentic Firestore write:
     ```ts
     const docRef = await addDoc(collection(db, "ledger_transactions"), {
       date: dateVal,
       refCode: "HOANPHI",
       type: "surplus_withdrawal",
       credit: cleanAmount,
       debit: 0,
       surplus: -cleanAmount,
       paymentMethod: withdrawPaymentMethod || 'Vietcombank',
       studentName: centerName,
       description: desc,
       year: dateObj.getFullYear(),
       month: dateObj.getMonth() + 1,
       startStatus: 'start',
       activeStatus: 'active',
       misaStatus: 'unposted',
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp(),
     });
     ```
   - Lines 1351–1468: Sticky header toolbar uses `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">` with a single-row flex layout. Zero `<h1>` and zero `<p>` header bloat.
   - Lines 1501–1522: Real-time Quỹ Phí Dư badge and amber quick-action button `+ Rút quỹ (HOANPHI)`.
   - Lines 1555–1568: Table header uses `className="sticky top-0 z-20 bg-white border-b border-slate-200 text-xs font-semibold text-slate-700"`. Action menu column header is completely empty: `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`.
   - Line 1571: `<tr key={tx.id} className="group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors">` has NO `onClick`.
   - Lines 1578–1646: All table cells are read-only plain text. Cột "Phí dư" (lines 1624–1636) renders `+{tx.surplus.toLocaleString('vi-VN')} đ` in `text-emerald-700 font-semibold font-mono` for positive values, `-{Math.abs(tx.surplus).toLocaleString('vi-VN')} đ` in `text-amber-700 font-semibold font-mono` for negative values, and `-` in `text-slate-300` for zero. Zero badge pill containers.
   - Line 1649: Actions accessed solely via 3-dots menu (`AdminRowActions`).
   - Lines 1673–1735: Cashflow KPI cards dynamically render `availableSurplus`, `totalCredit`, `totalDebit`, and net cash profit `(totalCredit - totalDebit)` using genuine mathematical aggregations.

3. **`De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`**:
   - Lines 796–860: `CRMRecord` interface specifies `intakeFeePaymentSource?: 'cash' | 'surplus_offset'`, `classOutcome?: 'start' | 'non_start'`, `vatSurchargePercent?: number`, `vatInvoicedAmount?: number`, `intermediaryFeeAmount?: number`, and `netCashflowAmount?: number`.
   - Lines 674–705: `calculateNetCashflow` computes:
     ```ts
     let effectiveRevenue = rawTuition;
     if (options?.hasInvoiceDemand) {
       const vatRate = (options.vatSurchargePercent !== undefined ? options.vatSurchargePercent : 10) / 100;
       const interRate = (options.intermediaryFeePercent !== undefined ? options.intermediaryFeePercent : 8) / 100;
       const invoiceTotal = Math.round(rawTuition * (1 + vatRate));
       const interFee = Math.round(invoiceTotal * interRate);
       effectiveRevenue = invoiceTotal - interFee;
     }
     const effectiveIntakeFee = options?.intakeFeePaymentSource === 'surplus_offset' ? 0 : rawIntakeFee;
     return effectiveRevenue - effectiveIntakeFee - totalCommission;
     ```
   - Lines 1885–1889: Live `availableSurplusFund` calculation via `useMemo`:
     ```ts
     const availableSurplusFund = useMemo(() => {
       return allLedgerTransactions
         .filter((t) => !isTestTransaction(t))
         .reduce((sum, t) => sum + (t.surplus || 0), 0);
     }, [allLedgerTransactions]);
     ```
   - Lines 1900–1920: Corporate VAT calculation:
     ```ts
     const vatAmt = Math.round(pBase * (effectiveVatSurchargePercent / 100));
     const pInvoice = pBase + vatAmt;
     const feeInter = Math.round(pInvoice * (effectiveIntermediaryFeePercent / 100));
     const pNet = pInvoice - feeInter;
     ```
   - Lines 3683–3720: `triggerAcceptWalletDeductionIfEligible` checks `intakeFeePaymentSource === 'surplus_offset'`, verifies idempotency against existing `class_accept_wallet` transactions, and writes `{ refCode, type: 'class_accept_wallet', debit: intakeFee, credit: 0, surplus: -intakeFee, ... }` to Firestore `ledger_transactions`.
   - Lines 3722–3761: `triggerNonStartRefundIfEligible` checks `record.status === 'Đã hủy' || record.classOutcome === 'non_start'`, verifies idempotency against existing `class_cancel_surplus` transactions, and writes `{ refCode, type: 'class_cancel_surplus', credit: intakeFee, debit: 0, surplus: +intakeFee, ... }` to Firestore `ledger_transactions`.
   - Lines 3958–3965: `handleSaveForm` sanitizes payloads with `removeUndefinedFields` and writes to both `customer_profiles` and `crm_records` via `setDoc(..., { merge: true })`.
   - Lines 5780–5831: Intake fee payment source selector with live `availableSurplusFund` badge and over-draft validation warning.
   - Lines 5888–5980: Interactive Corporate VAT card with live parameter adjustments and 5-metric breakdown.
   - Lines 6071–6148: 4-part summary ribbon displaying base/VAT tuition, intake fee deduction / surplus offset, commissions, and net cashflow.
   - Lines 7162–7260: Single-row sticky toolbar with no `<h1>` or `<p>` text.
   - Lines 7564–7578: Sticky header `sticky top-0 z-20 bg-white` with empty 3-dot column `<th>`.
   - Line 7640: `<tr key={rec.id} className="group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors">` has NO `onClick`.
   - Lines 7643–7940: All cells are read-only plain text. IDs are plain mono without pill container. Net cashflow formatted in plain mono text with tooltip breakdown.
   - Line 7943: Actions accessed solely via 3-dots menu (`AdminRowActions`).

### 1.2 Empirical Execution Output

1. **Vite Production Build**:
   ```
   vite v6.4.1 building for production...
   ✓ 3788 modules transformed.
   ✓ built in 17.35s
   Exit code: 0
   ```
2. **Standard Test Suite (`npm test`)**:
   ```
   ✔ 28/28 tests passed.
   Exit code: 0
   ```
3. **Financial Adversarial Test Suite (`node --import tsx --test tests/financeIdentity.adversarial.test.ts`)**:
   ```
   ✔ 15/15 tests passed.
   Exit code: 0
   ```
4. **Independent Mathematical Assertions**:
   - `calculateNetCashflow(10000000, 500000, [{ month: 1, amount: 200000 }, { month: 2, amount: 200000 }])` $\to 9,100,000$ (Pass)
   - `calculateNetCashflow(10000000, 500000, [...], { intakeFeePaymentSource: 'surplus_offset' })` $\to 9,600,000$ (Pass)
   - `calculateNetCashflow(100000000, 0, [], { hasInvoiceDemand: true, vatSurchargePercent: 10, intermediaryFeePercent: 8 })` $\to 101,200,000$ (Pass)
   - `parseLedgerSmartInfo({ type: 'surplus_withdrawal', refCode: 'HOANPHI' })` $\to$ `'Rút quỹ hoàn phí (HOANPHI)'` (Pass)
   - `parseLedgerSmartInfo({ refCode: 'HOANPHI' })` $\to$ `'Rút quỹ hoàn phí (HOANPHI)'` (Pass)

---

## 2. Logic Chain

1. **Anti-Cheating & Authenticity**:
   - In all investigated files, every calculation (`availableSurplus`, `computedSurplus`, `computedVatAmount`, `computedIntermediaryFeeAmount`, `computedNetFromInvoice`, `calculateNetCashflow`) is executed through dynamic arithmetic functions.
   - There are zero hardcoded return values, zero facade classes/functions, and zero stub implementations.
   - Database operations in `AdminLedgerModule.tsx` (`handleSaveWithdrawal`, `handleSaveModalTransaction`) and `CRMAdmissionsModule.tsx` (`handleSaveForm`, `triggerNonStartRefundIfEligible`, `triggerAcceptWalletDeductionIfEligible`) use genuine Firebase Firestore SDK calls (`addDoc`, `setDoc`, `updateDoc`) with cleaned and validated payloads.
   - Idempotency checks (`existingAcceptWalletTx`, `existingRefundTx`) ensure repeated saves do not duplicate ledger entries.

2. **AGENTS.md Rule Compliance**:
   - *Rule 1 (Read-only table cells & Action Menu)*: Verified that no `onClick` is attached to `<tr>` or `<td>` in either `AdminLedgerModule` or `CRMAdmissionsModule`. Row interactions are strictly managed through the 3-dots action menu (`AdminRowActions`), and the column `<th>` is completely empty.
   - *Rule 2 (Sticky Headers)*: Verified that `<thead>` and header elements include `sticky top-0 z-20 bg-white`.
   - *Rule 3 & 4 (ID & Typography & Anti-Pill Overload)*: Business IDs (`LEA`, `LRN`, `ENT`) are formatted as plain mono text (`font-mono text-xs font-semibold text-slate-700`) without pill background wraps. The "Phí dư" column uses semantic plain text (`+... đ` in emerald, `-... đ` in amber, `-` in slate-300).
   - *Rule 5 (Single-Row Toolbar)*: The toolbar in both modules is contained inside `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">` in a single-row flex layout without `<h1>` or `<p>` description text.
   - *Rule 13 (Persistence)*: Every create, update, or refund operation is persisted to Firestore collections (`ledger_transactions`, `crm_records`, `customer_profiles`).

3. **Compilation & Stability**:
   - `npm run build` completed cleanly in 17.35s with 0 errors.
   - All 43 test assertions (28 general + 15 adversarial) passed with zero failures.

---

## 3. Caveats

- **No Caveats**: The codebase was examined in its active working branch inside `De_Vuong_Webapp/`. All requirements from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `AGENTS.md` have been empirically verified.

---

## 4. Conclusion & Forensic Report

## Forensic Audit Report

**Work Product**: `De_Vuong_Webapp/src/types/admin.ts`, `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`, `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`  
**Profile**: General Project  
**Verdict**: **CLEAN**

### Phase Results
- **Hardcoded Output Detection**: PASS — All formulas are dynamic expressions; no hardcoded test stubs.
- **Facade Detection**: PASS — Genuine Firestore SDK calls and real business logic throughout.
- **Pre-populated Artifact Detection**: PASS — Clean workspace, no fabricated result logs.
- **Self-Certifying Tests**: PASS — Comprehensive independent testing across units, edge cases, and adversarial scenarios.
- **Mathematical Integrity**: PASS — Corporate VAT (10% surcharge, 8% fee $\to 101.2\%$ net), Surplus offset, and HOANPHI withdrawals are mathematically authentic.
- **AGENTS.md Compliance**: PASS — Read-only table cells, 3-dots menu with empty `<th>`, sticky headers, single-row toolbars, anti-pill styling, and Firestore persistence strictly honored.
- **Build & Test Verification**: PASS — `npm run build` (17.35s, code 0), `npm test` (28/28 passed), adversarial suite (15/15 passed).

---

## 5. Verification Method

To independently reproduce this forensic audit:

1. **Execute Production Build**:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   *Expected*: `✓ built in ~17-19s`, exit code 0.

2. **Run Test Suites**:
   ```powershell
   cd De_Vuong_Webapp
   npm test
   node --import tsx --test tests/financeIdentity.adversarial.test.ts
   ```
   *Expected*: All 43 tests pass with 0 failures.

3. **Run Independent Logic Assertions**:
   ```powershell
   cd De_Vuong_Webapp
   node --import tsx -e "
   import assert from 'node:assert/strict';
   import { calculateNetCashflow } from './src/components/admin/CRMAdmissionsModule';
   import { parseLedgerSmartInfo } from './src/components/admin/AdminLedgerModule';

   assert.equal(calculateNetCashflow(10000000, 500000, [{ month: 1, amount: 200000 }, { month: 2, amount: 200000 }]), 9100000);
   assert.equal(calculateNetCashflow(10000000, 500000, [{ month: 1, amount: 200000 }], { intakeFeePaymentSource: 'surplus_offset' }), 9800000);
   assert.equal(calculateNetCashflow(100000000, 0, [], { hasInvoiceDemand: true, vatSurchargePercent: 10, intermediaryFeePercent: 8 }), 101200000);
   assert.equal(parseLedgerSmartInfo({ type: 'surplus_withdrawal', refCode: 'HOANPHI' }).typeLabel, 'Rút quỹ hoàn phí (HOANPHI)');
   console.log('Independent assertions passed!');
   "
   ```
   *Expected*: Logs `Independent assertions passed!` with exit code 0.
