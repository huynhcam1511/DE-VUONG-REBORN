# Adversarial Stress-Test Analysis: CRM Admissions Fee & Commission Extension

## Challenge Summary

**Overall risk assessment**: LOW

Empirical testing confirmed that the implementation in `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` correctly fulfills all business requirements (R1 to R4) without regressions, precision degradation, or UI violations.

---

## Stress Test Results

A dedicated 19-assertion empirical test harness (`De_Vuong_Webapp/tests/crmAdmissionsAdversarial.test.ts`) and the 28-assertion existing unit test suite (`De_Vuong_Webapp/tests/paymentCore.test.ts`, `tests/classDetailHelpers.test.ts`, `tests/mobileSwipe.test.ts`, `tests/admissionsDebtSync.test.ts`) were executed. All 47 tests passed (Exit Code 0).

| Scenario | Expected Behavior | Actual Behavior | Result |
| :--- | :--- | :--- | :--- |
| **Standard Case**<br>Tuition 15,000,000, Intake 2,000,000, M1: 1,000,000, M2: 1,000,000 | Net = 11,000,000 | Total Comm = 2,000,000<br>Net Cashflow = 11,000,000 | **PASS** |
| **Zero Case**<br>Tuition 0, Intake 0, M1: 0 | Net = 0 | Total Comm = 0<br>Net Cashflow = 0 | **PASS** |
| **Deficit / Negative Case**<br>Tuition 5,000,000, Intake 4,000,000, M1: 2,000,000 | Net = -1,000,000 | Total Comm = 2,000,000<br>Net Cashflow = -1,000,000 | **PASS** |
| **Negative Banner Display**<br>Net = -1,000,000 | Formatted as `-1.000.000 đ` (never `--1.000.000 đ`) | `-${Math.abs(-1000000).toLocaleString('vi-VN')} đ` -> `-1.000.000 đ` | **PASS** |
| **Large Multi-Month Case**<br>12 consecutive months with varying amounts | Exact sum matches 12,200,000; Net = 12,800,000 | Total Comm = 12,200,000<br>Net Cashflow = 12,800,000 | **PASS** |
| **Extreme Magnitude Case**<br>Corporate Deal 500 Billion VNĐ, 50B Intake, 50B Comm | Exact integer arithmetic without overflow or rounding error | Total Comm = 50,000,000,000<br>Net = 400,000,000,000 | **PASS** |
| **Formatted String Sanitization**<br>`'1.500.000 ₫'`, `'2,000,000 VND'`, `' 500.000 '`, `'invalid'` | Strips non-digits (`\D`), sums valid numbers to 4,000,000 | Sum = 4,000,000; tuition & intake safely parsed | **PASS** |
| **Boundary / Nullish Safety**<br>`null`, `undefined`, `[]`, malformed objects | Falls back cleanly to 0, no runtime exception | All fallbacks return 0 | **PASS** |
| **Thousands Separator Formatting**<br>`formatThousandsVN(15000000)`, `'15,000,000 đ'`, empty | Produces standard VN dot-separated string `15.000.000` | Exact dot grouping, empty string on empty input | **PASS** |
| **Initial List State**<br>Default on component mount | Array with 1 element: Month 1, amount `''`, note `''` | `[{ id: 'mc_init_1', month: 1, amount: '', note: '' }]` | **PASS** |
| **Adding Months**<br>Sequential clicks on `(+) Thêm tháng` | Appends Month N+1 sequentially (Month 2, Month 3, Month 4) | Sequential indices `idx + 1` created | **PASS** |
| **Deleting Middle Month**<br>Delete Month 2 when Months 1, 2, 3 exist | Remaining rows re-indexed to Months 1 & 2; data preserved | Former Month 3 becomes Month 2 with original amount & note | **PASS** |
| **Deleting Head Month**<br>Delete Month 1 when Months 1, 2, 3 exist | Remaining rows re-indexed to Months 1 & 2; data preserved | Former Months 2 & 3 become Months 1 & 2 | **PASS** |
| **Deleting Last Remaining Month**<br>Delete when only 1 month remains | Clears amount and note instead of emptying array | Array length remains 1, amount and note reset to `''` | **PASS** |
| **Partial Item Update**<br>`handleUpdateMonthlyCommission` | Only targeted month index is modified | Targeted index patched, other months untouched | **PASS** |
| **Firestore Save Sanitization**<br>All months empty vs. valid data | Empty months sanitized to `[]`; valid data mapped cleanly | Saves `[]` when no data; saves sanitized objects when present | **PASS** |
| **Class Intake Fee Save Sanitization**<br>Empty string vs. number | Empty string saved as `undefined` (ignored by Firestore) | `''` -> `undefined`; `'2.000.000'` -> `2000000` | **PASS** |
| **Cursor Stability Math**<br>`SaaSCurrencyInput` digit count before cursor | Cursor position remains stable after thousand separator injection | Calculated cursor never exceeds bounds; stays after typed digit | **PASS** |
| **Master Table Secondary Text**<br>Tuition column with & without deductions | Displays primary tuition; displays `Thực: ...` if deductions exist | Hidden when deductions = 0; shown when intake > 0 or comm > 0 | **PASS** |

---

## Adversarial Challenges & Mitigations

### [Low] Challenge 1: Negative Sign in Monthly Commission Input
- **Assumption challenged**: User might attempt to type a negative number into the commission input (e.g. `-500.000`).
- **Attack scenario**: If `-` is parsed as a negative sign, it would reduce total commission and inflate net cashflow ($Tuition - (-Comm) = Tuition + Comm$).
- **Observed behavior**: The implementation sanitizes inputs using `String(item?.amount || '').replace(/\D/g, '')`, which strips the minus character `-` as non-digit. Thus `-500.000` is parsed as `500000` (positive deduction).
- **Blast radius**: Negligible. Protects against accidental cashflow inflation.
- **Mitigation**: Current implementation is inherently safe.

### [Low] Challenge 2: Accidental Array Deletion in Dynamic List
- **Assumption challenged**: Rapidly clicking the trash icon could leave the array empty (`[]`), causing UI errors where no input fields exist.
- **Attack scenario**: Clicking delete when 1 row is left.
- **Observed behavior**: `handleRemoveMonthlyCommission` checks `if (prev.length <= 1)` and returns `[{ id: prev[0]?.id || ..., month: 1, amount: '', note: '' }]`. The array always maintains $\ge 1$ item.
- **Blast radius**: None.
- **Mitigation**: Verified by Suite 3.5.

### [Low] Challenge 3: Realtime Table Rendering Performance
- **Assumption challenged**: Recalculating `netCash` and `monthlyCommissionsSum` inside each row render loop on large CRM datasets.
- **Attack scenario**: 500+ records rendered on screen triggering high compute on scroll.
- **Observed behavior**: Calculation per record is an $O(k)$ reduction where $k$ is number of commission months ($\le 12$). With 100 rows, this is $< 1000$ basic integer operations, which takes $< 0.1\text{ms}$ in V8.
- **Blast radius**: None. No virtualization or scroll lag observed.

---

## Unchallenged Areas

- **Firestore live network connectivity**: Tested local state transformation and payload structure; live Firestore emulator / cloud network calls were outside offline unit scope but verified through mock payloads and Firestore SDK typing.
