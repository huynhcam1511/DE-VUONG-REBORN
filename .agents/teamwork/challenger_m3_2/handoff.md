# Handoff Report: Ledger Reconciliation & Accounting Empirical Challenge (Milestone 3)

**Author**: `teamwork_challenger` (Ledger Reconciliation Challenger)  
**Date**: 2026-11-17  
**Artifact Path**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m3_2\handoff.md`  
**Verdict**: **`APPROVE`**

---

## 1. Observation

### 1.1 Direct Excel Dataset Verification (`"C:\Users\zit\Downloads\cách tôi nhập.xlsx"`)
Inspected the canonical source spreadsheet directly via Node.js and the `xlsx` library:

1. **Quỹ Phí Dư Totals & Statistics**:
   - `Sheet1` contains 473 rows (header + 472 data rows) across 32 columns.
   - Column index 7 (`Phí dư`) contains exactly 122 rows with non-empty values.
   - Executing the summation script:
     ```bash
     cd De_Vuong_Webapp; node -e "const XLSX = require('xlsx'); const wb = XLSX.readFile('C:\\Users\\zit\\Downloads\\cách tôi nhập.xlsx'); const ws = wb.Sheets['Sheet1']; const rows = XLSX.utils.sheet_to_json(ws, {header: 1, raw: false}); let totalCredits = 0, totalDebits = 0, bal = 0; rows.slice(1).forEach(r => { if (r[7]) { const v = parseInt(r[7].replace(/[^0-9-]/g, ''), 10); bal += v; if (v > 0) totalCredits += v; else totalDebits += Math.abs(v); } }); console.log('Credits:', totalCredits, 'Debits:', totalDebits, 'Final Balance:', bal);"
     ```
     **Direct Command Output**:
     ```
     Credits: 31350000 Debits: 30060000 Final Balance: 1290000
     ```
   - Running balance trajectory:
     * Minimum running balance: `-40.000 đ` at Row 239 (Class `RZ4249`, delta `-700.000 đ`).
     * Maximum running balance: `2.000.000 đ` at Row 45.
     * Final available balance: `1.290.000 đ`.

2. **HOANPHI Withdrawal Entries & Zeroing Dynamics**:
   - Exactly 3 withdrawal rows exist with `Mã lớp = 'HOANPHI'`:
     * `Row 145 (1/23/25)`: `Credit = 1.220.000 đ`, `Phí dư = -1.220.000 đ`. Balance immediately before: `+1.220.000 đ`. Balance after: `0 đ`.
     * `Row 219 (5/26/25)`: `Credit = 1.290.000 đ`, `Phí dư = -1.290.000 đ`. Balance immediately before: `+1.290.000 đ`. Balance after: `0 đ`.
     * `Row 266 (8/18/25)`: `Credit = 700.000 đ`, `Phí dư = -700.000 đ`, learner `Tri thuc hoan lop`. Balance immediately before: `+700.000 đ`. Balance after: `0 đ`.
   - In all three occurrences, the withdrawal entry brought the available surplus balance to exactly zero.

3. **Intake Fee & Monthly Commission Precision (`LG4729` & `SG2509`)**:
   - **`LG4729`**:
     * `Row 2 (1/9/24)`: `Phải thu = 2.200.000 đ`, `Lương = 2.000.000 đ`, `Tỉ lệ phí nhận lớp = 25%`, `Ghi nợ = 500.000 đ` ($2.000.000 \times 25\% = 500.000$ đ).
     * `Row 4 (1/17/24)`: `Ghi có = 2.200.000 đ` (Month 1 tuition).
     * `Row 10 (2/3/24)`: `Ghi nợ = 200.000 đ` (Month 2 commission: $2.2M - 2.0M = 200.000$ đ).
     * `Row 11 (2/22/24)`: `Ghi có = 2.200.000 đ` (Month 2 tuition).
     * `Row 18 (4/2/24)`: `Ghi có = 2.200.000 đ` (Month 3 tuition).
     * `Row 19 (4/2/24)`: `Ghi nợ = 200.000 đ` (Month 3 commission: $2.2M - 2.0M = 200.000$ đ).
   - **`SG2509`**:
     * `Row 8 (1/26/24)`: `Phải thu = 2.400.000 đ`, `Lương = 2.200.000 đ`, `Tỉ lệ = 25%`, `Ghi nợ = 550.000 đ` ($2.200.000 \times 25\% = 550.000$ đ).
     * `Row 9 (1/31/24)`: `Ghi có = 2.400.000 đ` (Month 1 tuition).
     * `Row 13 (3/6/24)`: `Ghi có = 2.400.000 đ` (Month 2 tuition).
     * `Row 14 (3/14/24)`: `Ghi nợ = 200.000 đ` (Month 2 commission: $2.4M - 2.2M = 200.000$ đ).
     * `Row 20 (4/10/24)`: `Ghi có = 2.400.000 đ` (Month 3 tuition).
     * `Row 21 (4/11/24)`: `Ghi nợ = 200.000 đ` (Month 3 commission).
     * `Row 23 (5/3/24)`: `Ghi có = 2.400.000 đ`, `Tổng Ghi nợ = 1.150.000 đ`, `Tổng Ghi có = 9.600.000 đ`, `Net = 8.450.000 đ`.
     * `Row 24 (5/5/24)`: `Ghi nợ = 200.000 đ` (Month 4 commission).

4. **Corporate VAT 8% Intermediary Fee Ratio (`KC006`)**:
   - `Row 274 (9/9/25)`: `Credit = 15.250.000 đ`, `Debit = 1.220.000 đ`, description: `Trainee Excel & Pivot`.
     Ratio: $\frac{1.220.000}{15.250.000} = 0.08000$ ($8.00\%$).
   - `Row 339 (3/13/26)`: `Credit = 20.250.000 đ`, `Debit = 1.620.000 đ`, description: `Trainee Excel & Pivot`.
     Ratio: $\frac{1.620.000}{20.250.000} = 0.08000$ ($8.00\%$).

---

### 1.2 Codebase Implementation Inspection (`De_Vuong_Webapp/`)

1. **`src/components/admin/AdminLedgerModule.tsx`**:
   - Lines 451–467: `availableSurplus` is calculated via `useMemo`:
     ```ts
     const nonTestTxs = transactions.filter((t) => !isTestTransaction(t));
     const surplusVal = nonTestTxs.reduce((sum, t) => sum + (t.surplus || 0), 0);
     ```
     Correctly excludes test transactions per 3-stream financial identity rules.
   - Lines 599–659: `handleSaveWithdrawal`:
     * Validates `cleanAmount <= availableSurplus`.
     * Blocks invalid amounts with clear alerts.
     * Records transaction in `ledger_transactions`:
       `{ date, refCode: 'HOANPHI', type: 'surplus_withdrawal', credit: cleanAmount, debit: 0, surplus: -cleanAmount, ... }`.
     * Deducts exactly `cleanAmount` from surplus, matching Excel Rows 145, 219, 266.
   - Lines 483–487: `handleSaveModalTransaction`:
     ```ts
     const computedSurplus = modalType === 'class_cancel_surplus'
       ? cleanAmount
       : modalType === 'class_accept_surplus'
       ? -cleanAmount
       : 0;
     ```
     Correctly writes signed surplus to Firestore and local state.
   - Lines 125–127: `parseLedgerSmartInfo`:
     ```ts
     if (tx.type === 'surplus_withdrawal' || tx.refCode === 'HOANPHI') {
       typeLabel = 'Rút quỹ hoàn phí (HOANPHI)';
     }
     ```
   - Lines 1434 & 1495: Table header rendered as "Phí dư" (`w-[120px]`), cells display signed values (`+` in emerald, `-` in amber, `-` in gray).

2. **`src/components/admin/CRMAdmissionsModule.tsx`**:
   - Lines 674–705: `calculateNetCashflow`:
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
   - Lines 1885–1889: Computes live `availableSurplusFund` across `allLedgerTransactions` excluding test transactions.
   - Lines 5801–5830: Intake fee payment source selector with live fund balance display (`Cấn trừ Quỹ phí dư ({formatThousandsVN(availableSurplusFund)} ₫)`).
   - Lines 3683–3720: `triggerAcceptWalletDeductionIfEligible` writes `{ type: 'class_accept_wallet', debit: intakeFee, credit: 0, surplus: -intakeFee }` when `intakeFeePaymentSource === 'surplus_offset'`.
   - Lines 3722–3761: `triggerNonStartRefundIfEligible` automatically writes `{ type: 'class_cancel_surplus', credit: intakeFee, debit: 0, surplus: +intakeFee }` when status is "Đã hủy" or outcome is "non_start". Includes idempotency check against existing `class_cancel_surplus` transactions.

---

### 1.3 Test Suite Execution & Output

1. **Dedicated Challenger Empirical Test Suite (`tests/challenger_ledger_reconciliation.test.ts`)**:
   Command:
   ```bash
   cd De_Vuong_Webapp; node --import tsx --test tests/challenger_ledger_reconciliation.test.ts
   ```
   Output:
   ```
   ✔ 1. Excel Dataset Verification: Quỹ Phí Dư Running Balance & Statistics (46.9486ms)
   ✔ 2. HOANPHI Withdrawal Entries: Exact Zeroing of Running Balance (33.3069ms)
   ✔ 3. Initial Intake Fee & Monthly Commissions: LG4729 & SG2509 Precision (27.3814ms)
   ✔ 4. Corporate VAT 8% Intermediary Fee Ratio: KC006 (Row 274 & Row 339) (27.3179ms)
   ✔ 5. Stress Testing Edge Case A: Partial Offsets (Intake Fee > Fund Balance) (0.2714ms)
   ✔ 6. Stress Testing Edge Case B: Zero Intake Fee Classes (0.1182ms)
   ✔ 7. Stress Testing Edge Case C: Non-Start Classes With & Without Intake Fee (0.1454ms)
   ✔ 8. Currency Formatting & Input Sanitization (0.1825ms)
   ℹ tests 8
   ℹ suites 0
   ℹ pass 8
   ℹ fail 0
   ℹ duration_ms 2501.3344
   ```
   Exit code: 0.

2. **Existing Core Test Suite (`npm test`)**:
   Command:
   ```bash
   cd De_Vuong_Webapp; npm test
   ```
   Output:
   ```
   ✔ resolveStudentIdentity: resolves genuine LRN from student_code_internal, phone, email, or name
   ...
   ✔ bank transaction time takes priority over Firestore creation time
   ℹ tests 28
   ℹ suites 0
   ℹ pass 28
   ℹ fail 0
   ```
   Exit code: 0.

3. **Financial & Revenue Test Suite**:
   Command:
   ```bash
   cd De_Vuong_Webapp; node --import tsx --test tests/financeIdentity.adversarial.test.ts tests/biz-rev-01.test.ts tests/partnerDealDocumentFlow.test.ts
   ```
   Output:
   ```
   ℹ tests 25
   ℹ suites 0
   ℹ pass 25
   ℹ fail 0
   ```
   Exit code: 0.

4. **Production Build (`npm run build`)**:
   Command:
   ```bash
   cd De_Vuong_Webapp; npm run build
   ```
   Output:
   ```
   ✓ 3788 modules transformed.
   ✓ built in 16.86s
   ```
   Exit code: 0.

---

## 2. Logic Chain

1. **Reconciliation of Excel Totals (Observation 1.1.1 → Verification Test 1)**:
   - Direct parsing of `cách tôi nhập.xlsx` confirmed that sum of positive surplus entries is 31,350,000 đ, sum of negative surplus entries is 30,060,000 đ, yielding an available reserve balance of 1,290,000 đ.
   - In `AdminLedgerModule.tsx` (Observation 1.2.1), `availableSurplus` aggregates `tx.surplus` across all non-test transactions. When seeded with the historical transactions, it computes exactly 1,290,000 đ.
   - Therefore, the webapp implementation reflects the exact numerical reality of the user's spreadsheet.

2. **Reconciliation of HOANPHI Zeroing (Observation 1.1.2 → Observation 1.2.1 → Verification Test 2)**:
   - Historical rows 145, 219, and 266 demonstrate that withdrawing from the center credits cash to the bank account and simultaneously reduces the surplus fund by the identical amount (`surplus: -amount`), resetting the reserve balance to zero.
   - The implementation in `handleSaveWithdrawal` (Observation 1.2.1) executes this exact arithmetic (`credit: cleanAmount, debit: 0, surplus: -cleanAmount, refCode: 'HOANPHI'`). Clicking "Rút toàn bộ" pre-fills `availableSurplus` and drives the post-withdrawal reserve balance to $0$ đ.
   - The smart info parser (`parseLedgerSmartInfo`) recognizes both `type: 'surplus_withdrawal'` and `refCode: 'HOANPHI'`, labelling the transaction correctly as "Rút quỹ hoàn phí (HOANPHI)".

3. **Reconciliation of LG4729 & SG2509 Commissions (Observation 1.1.3 → Observation 1.2.2 → Verification Test 3)**:
   - In `LG4729`, the initial fee of 500,000 đ is $2.0M \times 25\%$, and subsequent monthly fees of 200,000 đ equal $2.2M - 2.0M$.
   - In `SG2509`, the initial fee of 550,000 đ is $2.2M \times 25\%$, and subsequent monthly fees of 200,000 đ equal $2.4M - 2.2M$.
   - `calculateTotalCommission` and `calculateNetCashflow` replicate these multi-month accounting deductions with 100% precision:
     * `LG4729` (3 months): $6.6M - 500k - 400k = 5.7M$ đ.
     * `SG2509` (4 months): $9.6M - 550k - 600k = 8.45M$ đ.

4. **Reconciliation of Corporate VAT 8% Intermediary Ratio (Observation 1.1.4 → Observation 1.2.2 → Verification Test 4)**:
   - Excel Rows 274 and 339 (`KC006`) show expenses of 1,220,000 đ on 15,250,000 đ and 1,620,000 đ on 20,250,000 đ, both yielding a ratio of exactly 8.00%.
   - In `CRMAdmissionsModule.tsx`, corporate invoicing calculates $P_{invoice} = P_{base} \times (1 + \text{vatRate})$, then takes $F_{inter} = P_{invoice} \times \text{interRate}$ (defaulting to 8%).
   - The net retained cashflow $P_{net} = P_{invoice} - F_{inter}$ accurately mirrors the Excel ledger entries and provides live transparency in the CRM deal ribbon and master table.

5. **Resolution of Stress Test Edge Cases (Observation 1.2.2 → Verification Tests 5, 6, 7)**:
   - **Partial offsets (Intake fee > Available fund)**:
     When a counselor chooses "Cấn trừ Quỹ phí dư" while `fee > availableSurplus`, the UI presents a distinct warning banner indicating insufficient funds. In the ledger, should an overdraft occur (as observed at Excel Row 239 where balance dipped to -40,000 đ), negative surplus values are rendered in amber/rose (`text-amber-700 font-mono`), and `handleSaveWithdrawal` strictly forbids cash withdrawals until the balance is restored.
   - **Zero intake fee classes**:
     When `classIntakeFee` is 0, empty, or undefined, `triggerAcceptWalletDeductionIfEligible` returns immediately without creating extraneous ledger entries, and `calculateNetCashflow` computes net revenue cleanly without producing `NaN`.
   - **Non-start classes without intake fee**:
     When a class is cancelled or marked Non-Start without an intake fee (`intakeFee <= 0`), `triggerNonStartRefundIfEligible` safely aborts and creates no ghost refund. When an intake fee is present, it credits `class_cancel_surplus` and prevents duplicate refund creation via idempotency check on `refCode` / `canonicalCode`.

---

## 3. Caveats

1. **Unified vs Multi-Center Reserve**:
   In both the Excel spreadsheet and the webapp implementation, Quỹ Phí Dư is aggregated into a unified escrow reserve balance, representing the user's total credit pool. The withdrawal modal includes a `withdrawCenterName` field allowing the user to document which specific center returned funds.
2. **Offline Firestore Defaulting**:
   If the application runs in an offline development environment without Firestore connectivity or mock ledger seed data, `availableSurplusFund` defaults safely to `0 đ`. The UI accounts for this by disabling the "Cấn trừ Quỹ phí dư" button when balance is zero.

---

## 4. Conclusion

All empirical challenge checks across the Excel dataset, mathematical formulas, edge-case conditions, and code implementations have passed completely.
- Quỹ Phí Dư balance dynamics (31.35M credits, 30.06M debits, 1.29M balance) match the Excel dataset with 100% fidelity.
- HOANPHI withdrawal balance zeroing across Rows 145, 219, and 266 is replicated faithfully.
- Intake fee and monthly commission mechanics for `LG4729` and `SG2509` are verified.
- Corporate VAT 8% intermediary fee ratio in `KC006` is verified.
- Edge cases (partial offsets, zero intake fee, non-start classes without fee, idempotency) are defended by robust guards.
- All test suites (8 challenger tests, 28 core unit tests, 25 revenue tests) pass with exit code 0.
- Production build succeeds without errors in 16.86s.

**Explicit Verdict**: **`APPROVE`**

---

## 5. Verification Method

To independently reproduce and verify this assessment:

1. **Run the Challenger Empirical Test Suite**:
   ```bash
   cd De_Vuong_Webapp
   node --import tsx --test tests/challenger_ledger_reconciliation.test.ts
   ```
   *Expected outcome*: 8 tests passing, 0 failing, exit code 0.

2. **Run Core Unit Tests**:
   ```bash
   cd De_Vuong_Webapp
   npm test
   ```
   *Expected outcome*: 28 tests passing, 0 failing, exit code 0.

3. **Run Business Revenue & Partner Flow Tests**:
   ```bash
   cd De_Vuong_Webapp
   node --import tsx --test tests/financeIdentity.adversarial.test.ts tests/biz-rev-01.test.ts tests/partnerDealDocumentFlow.test.ts
   ```
   *Expected outcome*: 25 tests passing, 0 failing, exit code 0.

4. **Run Production Build**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
   *Expected outcome*: Vite transforms 3788 modules and builds successfully in under 20s with exit code 0.
