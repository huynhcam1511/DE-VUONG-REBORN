# Independent Review Report: Milestone 1 & 2 Financial Logic & QA

- **Author**: `teamwork_reviewer` (Financial Logic & QA Reviewer)
- **Target File**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\reviewer_m3_2\handoff.md`
- **Timestamp**: 2026-11-17T16:18:30Z
- **Verdict**: **APPROVE**

---

## 1. Observation

### 1.1 Verified File Paths & Direct Code Inspection
1. **`De_Vuong_Webapp/src/types/admin.ts`**:
   - Lines 590–603: `surplus_withdrawal` added to `TransactionType` union:
     ```ts
     export type TransactionType =
       | "payment"
       | "class_accept_auto"
       | "class_cancel_surplus"
       | "class_accept_surplus"
       | "surplus_withdrawal"
       ...
     ```
   - Line 617: `sepayId?: string | number;` added to `Transaction` interface.
   - Verification: `npx tsc --noEmit` returns **0 errors** on `src/types/admin.ts`.

2. **`De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`**:
   - Header Rename & Table Layout (Lines 1555–1567):
     Column header reads `<th className="px-4 py-3.5 text-xs font-semibold text-slate-700 w-[120px] text-right">Phí dư</th>`.
     Empty action header: `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>` per AGENTS.md Rule 1.
   - Semantic Surplus Formatting (Lines 1624–1636):
     * Positive surplus (`tx.surplus > 0`): `+{tx.surplus.toLocaleString('vi-VN')} đ` in `text-emerald-700 font-semibold font-mono whitespace-nowrap`.
     * Negative surplus (`tx.surplus < 0`): `-{Math.abs(tx.surplus).toLocaleString('vi-VN')} đ` in `text-amber-700 font-semibold font-mono whitespace-nowrap` (no double-minus).
     * Zero or undefined: `<span className="text-slate-300 font-normal">-</span>`.
     * Anti-Pill Overload compliant: plain text with font-mono, no pill wrapping.
   - Available Balance Calculation (Lines 451–467):
     ```ts
     const { availableSurplus, totalCredit, totalDebit } = useMemo(() => {
       const nonTestTxs = transactions.filter((t) => !isTestTransaction(t));
       const surplusVal = nonTestTxs.reduce((sum, t) => sum + (t.surplus || 0), 0);
       ...
     ```
     Excludes test transactions via `!isTestTransaction(t)` to prevent test data pollution.
   - Cashflow KPI Metrics Strip (Lines 1674–1734):
     Displays 4 distinct KPI cards for: (1) Quỹ Phí Dư Khả Dụng, (2) Tổng Doanh Thu Thực Nhận, (3) Tổng Chi Phí Hoạt Động, and (4) Lợi Nhuận Dòng Tiền.
   - Sticky Header & HOANPHI Quick Action (Lines 1500–1522):
     Sticky toolbar badge `<Wallet /> Quỹ Phí Dư: {availableSurplus.toLocaleString('vi-VN')} đ` and amber action button `+ Rút quỹ (HOANPHI)`.
   - Dedicated Rút Quỹ (HOANPHI) Modal & Persistence (Lines 599–659):
     Validates `cleanAmount > 0` and `cleanAmount <= availableSurplus`.
     Persists to Firestore collection `ledger_transactions`:
     `{ date: dateVal, refCode: "HOANPHI", type: "surplus_withdrawal", credit: cleanAmount, debit: 0, surplus: -cleanAmount, paymentMethod: withdrawPaymentMethod, studentName: centerName, description: desc, year, month, startStatus: 'start', activeStatus: 'active', misaStatus: 'unposted', createdAt, updatedAt }`.
     Immediately updates local state: `setTransactions(prev => [newWithdrawTx, ...prev])`.
   - Manual Transaction Modal Surplus Computation (Lines 483–487, 512, 583):
     `const computedSurplus = modalType === 'class_cancel_surplus' ? cleanAmount : modalType === 'class_accept_surplus' ? -cleanAmount : 0;`
     Now correctly writes `surplus: computedSurplus` to Firestore `ledger_transactions` and local state.

3. **`De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`**:
   - `CRMRecord` Schema Extensions (Lines 846–865):
     Adds `intakeFeePaymentSource?: 'cash' | 'surplus_offset'`, `intakeFeeLedgerTxId?: string`, `classOutcome?: 'start' | 'non_start'`, `vatSurchargePercent?: number`, `vatInvoicedAmount?: number`, `intermediaryFeeAmount?: number`, `netCashflowAmount?: number`.
   - Live Available Surplus Fund (Lines 1885–1889):
     Derives `availableSurplusFund` in real-time from `allLedgerTransactions.filter(t => !isTestTransaction(t)).reduce((sum, t) => sum + (t.surplus || 0), 0)`.
   - Intake Fee Payment Source Selector & Fund Validation (Lines 5780–5831):
     Option 1: `Tiền mặt / MoMo / Ngân hàng` (`'cash'`).
     Option 2: `Cấn trừ Quỹ phí dư` (`'surplus_offset'`) with live balance indicator `(${formatThousandsVN(availableSurplusFund)} ₫)`.
     If `availableSurplusFund <= 0`, option 2 is visually disabled with `cursor-not-allowed`. If selected and intake fee exceeds balance, renders amber warning alert: `Quỹ phí dư (${formatThousandsVN(availableSurplusFund)} ₫) không đủ cấn trừ ${formatThousandsVN(computedClassIntakeFeeNumber)} ₫.`
   - Idempotent Wallet Deduction Trigger (Lines 3683–3720):
     `triggerAcceptWalletDeductionIfEligible` checks if `class_accept_wallet` transaction already exists for `refCode` or `canonicalCode`. If not, creates `{ refCode, type: 'class_accept_wallet', debit: intakeFee, credit: 0, surplus: -intakeFee, studentName, description, ... }` in Firestore `ledger_transactions`.
   - Idempotent Automated Quỹ Phí Dư Refund on Non-Start (Lines 3722–3761):
     `triggerNonStartRefundIfEligible` checks `record.status === 'Đã hủy' || record.classOutcome === 'non_start'`.
     Checks for pre-existing `class_cancel_surplus` or `class_cancel` on `refCode` or `canonicalCode`. If none exists, creates `{ refCode, type: 'class_cancel_surplus', credit: intakeFee, debit: 0, surplus: +intakeFee, studentName, description, ... }` in `ledger_transactions`.
     Integrated into `handleSaveForm` (line 4094), status dropdown quick updates (line 4400), and inline status changes (line 6974).
   - Corporate VAT Invoice Calculator Card (Lines 5888–5980):
     Dynamic inputs for `formIntermediary`, `formVatSurchargePercent` (default 10%), `formIntermediaryFeePercent` (default 8%).
     Real-time 5-box breakdown: $P_{base}$ -> $P_{vat} (+10\%)$ -> $P_{invoice}$ -> $F_{inter} (-8\%)$ -> $P_{net}$.
   - End-to-End Net Cashflow Calculation (Lines 674–705 & 1922–1929):
     `calculateNetCashflow` properly handles VAT net revenue, 0 cash deduction when `intakeFeePaymentSource === 'surplus_offset'`, and multi-month commission subtractions.
   - Dual-Write Persistence (Lines 3958–3965, 4081–4082, 6971–6972):
     Always writes to **both** `customer_profiles` and `crm_records` using `setDoc` with `{ merge: true }` and `removeUndefinedFields`.

### 1.2 Independent Test & Build Execution Results
1. **Production Build (`npm run build`)**:
   - Command: `cd De_Vuong_Webapp; npm run build`
   - Output: `✓ 3788 modules transformed. ✓ built in 17.68s. Exit code 0.`
2. **Official Test Suite (`npm test`)**:
   - Command: `cd De_Vuong_Webapp; npm test`
   - Output: `ℹ tests 28, pass 28, fail 0. Duration: 2221ms. Exit code 0.`
3. **Adversarial Finance & CRM Test Suite**:
   - Command: `cd De_Vuong_Webapp; node --import tsx --test tests/financeIdentity.adversarial.test.ts tests/crmAdmissionsAdversarial.test.ts`
   - Output: `ℹ tests 34, pass 34, fail 0. Duration: 2025ms. Exit code 0.`
4. **Independent Financial Runtime Assertions (Custom 6-test suite)**:
   - Command: verified standard personal lead cashflow, surplus offset cashflow, corporate VAT invoice net math, custom % VAT, `parseLedgerSmartInfo` HOANPHI resolution, and test transaction exclusion in available surplus.
   - Output: `ALL ADVERSARIAL FINANCIAL RUNTIME TESTS PASSED SUCCESSFULLY (6/6)`.
5. **Edge Case Assertions (Custom 6-test suite)**:
   - Command: verified string formatting with dots/currency symbols, zero values, negative net cashflow, missing option defaults, 0% VAT, and empty string/null commissions.
   - Output: `ALL EDGE CASE ASSERTIONS PASSED (6/6)`.
6. **TypeScript Check on Target Files**:
   - `src/types/admin.ts`: 0 errors.
   - `src/components/admin/AdminLedgerModule.tsx`: 0 errors.
   - `src/components/admin/CRMAdmissionsModule.tsx`: 0 errors.

---

## 2. Logic Chain

1. **Accounting Model Consistency**:
   - In the user's Excel model ("cách tôi nhập.xlsx"), Quỹ Phí Dư acts as an escrow credit reserve held by brokerage centers.
   - When a class fails to start (`non_start` / `Đã hủy`), the initial deposit is refunded into this fund (`surplus: +fee`).
   - When taking a new class using `surplus_offset`, the initial deposit is deducted from the fund (`surplus: -fee`), requiring 0 cash out-of-pocket from the user. Consequently, the user's operational net cashflow for that deal does not deduct an intake fee from cash collected.
   - When funds are withdrawn from the center back to the bank account (`HOANPHI`), cash in bank increases (`credit: fee, debit: 0`) while the reserve fund decreases (`surplus: -fee`).
   - The implementation across `AdminLedgerModule.tsx` and `CRMAdmissionsModule.tsx` strictly mirrors this 3-way balance mechanics.

2. **State Reactivity & Dual-Write Persistence**:
   - CRM deal modifications persist atomically to both `customer_profiles` and `crm_records` via `setDoc(..., { merge: true })`.
   - Real-time Firestore subscriptions (`allLedgerTransactions`) guarantee that Quỹ Phí Dư balance changes made in the General Ledger (e.g. after a HOANPHI withdrawal) immediately reflect in CRM Admissions modals without requiring a page refresh.
   - Immediate optimistic local state updates in both modules ensure zero-latency UI interaction.

3. **Defensive Handling & Edge Case Resistance**:
   - Both `triggerNonStartRefundIfEligible` and `triggerAcceptWalletDeductionIfEligible` query existing transactions before executing Firestore `addDoc`, guaranteeing idempotency and preventing duplicate accounting records even if a deal status is changed repeatedly.
   - Withdrawals exceeding available surplus are strictly validated and blocked before submission.
   - Test transactions are cleanly quarantined from real fund reserves.
   - Zero and negative values are handled gracefully with proper signage and empty dash fallbacks.

4. **Integrity & Code Quality**:
   - No hardcoded test stubs or mock bypasses exist in the target files.
   - Full Firestore and state logic is implemented and executed end-to-end.
   - Full compliance with AGENTS.md standards: read-only table cells, 3-dots action menu, empty th for action columns, sticky top-0 headers, no vertical borders, font-mono for numeric amounts and business IDs, and anti-pill overload.

---

## 3. Caveats

- **Aggregated vs Center-Specific Reserve**: The Excel workflow aggregates all broker center deposits into a unified Quỹ Phí Dư balance. The implementation supports this unified balance while allowing the user to document specific center names (`withdrawCenterName`) during withdrawals.
- **Pre-existing Repository Lints**: The repository contains legacy TypeScript lint issues in unrelated modules (`ClassDetail.tsx`, `TNAModule.tsx`, `StudentPortal.tsx`), but the target files (`admin.ts`, `AdminLedgerModule.tsx`, `CRMAdmissionsModule.tsx`) have 0 errors and `npm run build` succeeds cleanly.

---

## 4. Conclusion

**Verdict: APPROVE**

The implementation of Milestone 1 (General Ledger & Cashflow Enhancements) and Milestone 2 (CRM Admissions Financial & VAT Workflow) is complete, robust, defensively designed, and verified with 100% test pass rates and successful production builds. All accounting rules from "cách tôi nhập.xlsx" and AGENTS.md specifications are fully satisfied.

---

## 5. Verification Method

To independently reproduce this verification:

1. **Verify Production Build**:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   *Expected result*: Exit code 0, `✓ built in ~17-19s`.

2. **Verify Official & Adversarial Test Suites**:
   ```powershell
   cd De_Vuong_Webapp
   npm test
   node --import tsx --test tests/financeIdentity.adversarial.test.ts tests/crmAdmissionsAdversarial.test.ts
   ```
   *Expected result*: 28/28 and 34/34 tests pass (Total 62 tests passing, 0 failures).

3. **Verify Runtime Financial Logic via Node**:
   ```powershell
   cd De_Vuong_Webapp
   node --import tsx -e "
   import assert from 'node:assert/strict';
   import { calculateNetCashflow } from './src/components/admin/CRMAdmissionsModule';
   import { parseLedgerSmartInfo } from './src/components/admin/AdminLedgerModule';

   // Standard Lead
   assert.equal(calculateNetCashflow(10000000, 1000000, [{ month: 1, amount: 500000 }]), 8500000);
   // Surplus Offset
   assert.equal(calculateNetCashflow(10000000, 1000000, [{ month: 1, amount: 500000 }], { intakeFeePaymentSource: 'surplus_offset' }), 9500000);
   // Corporate VAT
   assert.equal(calculateNetCashflow(100000000, 0, [], { hasInvoiceDemand: true, vatSurchargePercent: 10, intermediaryFeePercent: 8 }), 101200000);
   // HOANPHI Smart Info
   assert.equal(parseLedgerSmartInfo({ type: 'surplus_withdrawal' }).typeLabel, 'Rút quỹ hoàn phí (HOANPHI)');
   console.log('All financial assertions verified.');
   "
   ```
