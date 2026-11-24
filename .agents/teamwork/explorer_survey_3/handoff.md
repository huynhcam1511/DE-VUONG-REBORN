# Handoff Report: Excel Spreadsheet & Domain Spec Investigation

**Author**: `teamwork_explorer` (Excel & Domain Spec Explorer)  
**Date**: 2026-11-17  
**Artifact Path**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md`

---

## 1. Observation

### 1.1 Excel File Inspection: `"C:\Users\zit\Downloads\cách tôi nhập.xlsx"`
- **Workbook Structure**:
  - Exactly 1 Sheet: `Sheet1`.
  - Grid Range: `A1:AF473` (473 rows, 32 columns).
  - All values stored as static formatted strings/numbers (no dynamic Excel formula objects stored).
- **Column Headers (32 columns)**:
  - `0: Năm` (Year)
  - `1: Tháng` (Month)
  - `2: Ngày` (Date, e.g. `"1/9/24"`, `"8/26/24"`, `"12/21/25"`)
  - `3: Mã lớp` (Class Code, e.g. `"LG4729"`, `"SG2509"`, `"RY2635"`, `"KC006"`, `"HOANPHI"`)
  - `4: Trạng thái` (`"Start"` vs `"Non-Start"`)
  - `5: Ghi nợ` (Debit / Cash Outflow / Expense, e.g. `"500.000 đ"`, `"200.000 đ"`)
  - `6: Ghi có` (Credit / Cash Inflow / Revenue, e.g. `"2.200.000 đ"`, `"2.400.000 đ"`)
  - `7: Phí dư` (Escrow Deposit Fund adjustment, e.g. `"440.000 đ"`, `"-440.000 đ"`, `"-1.220.000 đ"`)
  - `8: Tình trạng` (`"Active"` vs `"Non-Active"`)
  - `9: Tên học viên` (Learner / Contact Name, e.g. `"Chị Kiều (Huy)"`, `"Chị Trang (Khang)"`)
  - `10: Số điện thoại` (Phone Number)
  - `11: Công ty` (Enterprise Name, mostly empty in B2C rows)
  - `12: Diễn giải` (Description / Notes, e.g. `"Trainee Excel & Pivot"`, `"Chị Thuỷ chạy facebook"`)
  - `13: Môn học` (Course Topic, e.g. `"English"`, `"Excel"`, `"MOS"`, `"English 11&12"`)
  - `14: Hình thức` (`"Offline"`, `"Online"`, `"Offline & Online"`)
  - `15: Địa chỉ` (Street Address)
  - `16: Quận` (District)
  - `17: Tỉnh` (Province / City)
  - `18: Thời lượng 1 buổi` (Session length in hours, e.g. `1.5`, `2`)
  - `19: Column 32` (Unused)
  - `20: Column 31` (Unused)
  - `21: Tổng số buổi/ tháng` (Sessions per month, e.g. `8`, `12`)
  - `22: Tổng số giờ` (Cumulative hours, e.g. `64`, `18`, `72`)
  - `23: Phải thu học viên` (Expected Student Tuition per month, e.g. `"2.200.000 đ"`, `"2.400.000 đ"`)
  - `24: Lương` (Contracted teacher base pay before monthly commission, e.g. `"2.000.000 đ"`, `"2.200.000 đ"`)
  - `25: Tỉ lệ phí nhận lớp` (Intake fee rate, e.g. `"20%"`, `"25%"`)
  - `26: Diễn giải học phí` (e.g. `"Gia hạn từ 3 -> 4 buổi"`)
  - `27: Tổng Ghi nợ` (Cumulative debit across the class)
  - `28: Tổng Ghi có` (Cumulative credit across the class)
  - `29: Tỉ lệ phí tổng` (Total fee percentage: `Tổng Ghi nợ / Tổng Ghi có`)
  - `30: Lương theo giờ` (Net hourly rate: `(Tổng Ghi có - Tổng Ghi nợ) / Tổng số giờ`)
  - `31: Lương theo buổi` (Net session rate: `Lương theo giờ × Thời lượng 1 buổi`)

### 1.2 Verbatim Representative Rows & Key Transactions

#### A. Initial Brokerage Intake Fee & Monthly Commission (`LG4729` & `SG2509`)
- **Class `LG4729`**:
  - `Row 2 (1/9/24)`: `Mã lớp: LG4729`, `Trạng thái: Start`, `Ghi nợ: 500.000 đ`, `Phải thu: 2.200.000 đ`, `Lương: 2.000.000 đ`, `Tỉ lệ phí: 25%`. (Observation: `2.000.000 × 25% = 500.000 đ` = Initial Intake Fee paid by user).
  - `Row 4 (1/17/24)`: `Mã lớp: LG4729`, `Ghi có: 2.200.000 đ` (Month 1 tuition collected from student).
  - `Row 10 (2/3/24)`: `Mã lớp: LG4729`, `Ghi nợ: 200.000 đ` (Month 2 commission paid to center. Observation: `Phải thu (2.2M) - Lương (2.0M) = 200.000 đ`!).
  - `Row 11 (2/22/24)`: `Mã lớp: LG4729`, `Ghi có: 2.200.000 đ` (Month 2 tuition collected).
  - `Row 18 (4/2/24)`: `Mã lớp: LG4729`, `Ghi có: 2.200.000 đ` (Month 3 tuition collected).
  - `Row 19 (4/2/24)`: `Mã lớp: LG4729`, `Ghi nợ: 200.000 đ` (Month 3 commission paid to center).
- **Class `SG2509`**:
  - `Row 8 (1/26/24)`: `Ghi nợ: 550.000 đ`, `Phải thu: 2.400.000 đ`, `Lương: 2.200.000 đ`, `Tỉ lệ: 25%`. (`2.200.000 × 25% = 550.000 đ`).
  - `Row 9 (1/31/24)`: `Ghi có: 2.400.000 đ` (Month 1 tuition).
  - `Row 13 (3/6/24)`: `Ghi có: 2.400.000 đ` (Month 2 tuition).
  - `Row 14 (3/14/24)`: `Ghi nợ: 200.000 đ` (`2.400.000 - 2.200.000 = 200.000 đ` commission).
  - `Row 20 (4/10/24)`: `Ghi có: 2.400.000 đ` (Month 3 tuition).
  - `Row 21 (4/11/24)`: `Ghi nợ: 200.000 đ` (Month 3 commission).
  - `Row 23 (5/3/24)`: `Ghi có: 2.400.000 đ`, `Tổng Ghi nợ: 1.150.000 đ`, `Tổng Ghi có: 9.600.000 đ`, `Tỉ lệ phí tổng: 12%`, `Tổng giờ: 64`, `Lương theo giờ: 132.031 đ`, `Lương theo buổi: 264.063 đ`.
  - `Row 24 (5/5/24)`: `Ghi nợ: 200.000 đ` (Month 4 commission).
  - *Mathematical verification*:
    `Tổng Ghi nợ` = $550k + 200k + 200k + 200k = 1.150.000 đ$.
    `Tổng Ghi có` = $2.4M \times 4 = 9.600.000 đ$.
    `Tỉ lệ phí tổng` = $1.150.000 / 9.600.000 = 11.979\% \approx 12\%$.
    `Net revenue` = $9.600.000 - 1.150.000 = 8.450.000 đ$.
    `Hourly rate` = $8.450.000 / 64 = 132.031,25 đ/h$.
    `Session rate` = $132.031,25 \times 2h = 264.062,5 đ \approx 264.063 đ$.

#### B. "Quỹ Phí Dư" Credit on Non-Start and Offset on New Class Intake
- There are **122 rows** with non-empty `Phí dư` in `Sheet1`.
- `Row 29 (8/23/24)`: `Mã lớp: RY2337`, `Trạng thái: Non-Start`, `Ghi nợ: 440.000 đ`, `Phí dư: null`. User paid initial intake fee in cash/bank.
- `Row 33 (8/26/24)`: `Mã lớp: RY2337`, `Trạng thái: Non-Start`, `Ghi có: 440.000 đ`, `Phí dư: 440.000 đ`. When the class fails, center credits +440k to the user's reserve fund; `Ghi có` neutralizes the prior debit.
- `Row 35 (8/26/24)`: `Mã lớp: RY2635`, `Trạng thái: Start`, `Ghi nợ: 660.000 đ`, `Phí dư: -440.000 đ`. User takes new class with intake fee 660k, offsets 440k against Quỹ Phí Dư (`Phí dư: -440.000 đ`), paying remaining 220k in cash.
- `Row 36 (8/26/24)`: `Mã lớp: ZY6617`, `Trạng thái: Non-Start`, `Ghi có: 660.000 đ`, `Phí dư: 660.000 đ`.
- `Row 38 (8/28/24)`: `Mã lớp: RY2838`, `Trạng thái: Non-Start`, `Ghi nợ: 660.000 đ`, `Phí dư: -660.000 đ`.
- `Row 45 (9/7/24)`: `Mã lớp: RY2838`, `Trạng thái: Non-Start`, `Ghi có: 660.000 đ`, `Phí dư: 660.000 đ`.
- `Row 52 (10/27/24)`: `Mã lớp: LM6710`, `Trạng thái: Non-Start`, `Ghi nợ: 440.000 đ`, `Phí dư: -440.000 đ`.
- `Row 59 (10/29/24)`: `Mã lớp: LM6710`, `Trạng thái: Non-Start`, `Ghi có: 440.000 đ`, `Phí dư: 440.000 đ`.
- `Row 331 (2/6/26)`: `Mã lớp: RD0624`, `Trạng thái: Start`, `Ghi nợ: 800.000 đ`, `Phí dư: -740.000 đ`. Intake fee 800k offset 740k from fund, 60k paid cash.

#### C. 'HOANPHI' Cash Withdrawals from Reserve Fund to Bank
- `Row 145 (1/23/25)`: `Mã lớp: HOANPHI`, `Ghi có: 1.220.000 đ`, `Phí dư: -1.220.000 đ`. Running balance before this row: `+1.220.000 đ`. Running balance after: `0 đ`!
- `Row 219 (5/26/25)`: `Mã lớp: HOANPHI`, `Ghi có: 1.290.000 đ`, `Phí dư: -1.290.000 đ`. Running balance before: `+1.290.000 đ`. Running balance after: `0 đ`!
- `Row 266 (8/18/25)`: `Mã lớp: HOANPHI`, `Ghi có: 700.000 đ`, `Phí dư: -700.000 đ`, `Tên học viên: Tri thuc hoan lop`. Running balance before: `+700.000 đ`. Running balance after: `0 đ`!
- **Cumulative Running Totals**:
  - `Total Credits (+Phí dư)` = `31.350.000 đ`
  - `Total Debits (-Phí dư)` = `30.060.000 đ`
  - `Current Available Quỹ Phí Dư` = `1.290.000 đ`
  - `Min Running Balance` = `-40.000 đ` (virtually non-negative at all times).

#### D. Corporate VAT Invoices & Intermediary 8% Fee (`KC006`)
- `Row 274 (9/9/25)`: `Mã lớp: KC006`, `Ghi có: 15.250.000 đ`, `Ghi nợ: 1.220.000 đ`, `Tên học viên: A.Nat & A.Phước`, `Diễn giải: Trainee Excel & Pivot`.
  - Ratio: $1.220.000 / 15.250.000 = 8.00\%$!
- `Row 339 (3/13/26)`: `Mã lớp: KC006`, `Ghi có: 20.250.000 đ`, `Ghi nợ: 1.620.000 đ`, `Tên học viên: A.Nat & A.Phước`, `Diễn giải: Trainee Excel & Pivot`.
  - Ratio: $1.620.000 / 20.250.000 = 8.00\%$!
- `Row 212 (5/7/25)`: `Mã lớp: KC003`, `Ghi có: 21.300.000 đ`, `Ghi nợ: 2.130.000 đ` (10% rate).

### 1.3 Webapp Codebase Inspection (`De_Vuong_Webapp/`)
- `src/types/admin.ts`:
  - Line 588-601: `TransactionType` defines `class_accept_auto`, `class_cancel_surplus`, `class_accept_surplus`.
  - Line 602-629: `Transaction` interface contains `credit`, `debit`, `surplus: number`.
- `src/components/admin/AdminLedgerModule.tsx`:
  - Line 1434: Table header renders `<th ...>Tồn quỹ</th>` (currently titled "Tồn quỹ" rather than "Phí dư").
  - Line 1495: Table cell renders `{tx.surplus !== 0 ? tx.surplus.toLocaleString() : '-'}` (plain text, no `+`/`-` or color distinction).
  - Lines 468, 539, 1049, 1091: `surplus` is hardcoded to `0` during transaction creation.
- `src/components/admin/CRMAdmissionsModule.tsx`:
  - Lines 794-796: `AdmissionsRecord` has `classIntakeFee?: number`, `classIntakeFeeDate?: string`, `monthlyCommissions?: MonthlyCommissionItem[]`.
  - Lines 817-827: `intermediary?: string`, `intermediaryFeePercent?: number`, `hasInvoiceDemand?: boolean`.
  - Lines 5538-5564: Intake fee input currently lacks a payment source selector ("Tiền mặt / MoMo" vs "Cấn trừ từ Quỹ phí dư") and does not auto-credit the fund when a class outcome is "Không thành công / Non-Start".
- `src/domain/revenue.ts`:
  - Line 95-118: `RevenueAgreementInput`, `createRevenueAgreementSnapshot`.
  - Line 164-168: `invoiceFee(grossRevenue, rate)` computes `{ grossRevenue, rate, fee, netReceived }`.

---

## 2. Logic Chain

1. **Intake Fee Derivation**:
   - In Excel Row 2 (`LG4729`), `Phải thu = 2.2M`, `Lương = 2.0M`, `Tỉ lệ phí nhận lớp = 25%`. The initial `Ghi nợ` is `500.000 đ`, which is $2.000.000 \times 25\% = 500.000 đ$.
   - In Row 3 (`ZG5917`), `Lương = 3.5M`, `Tỉ lệ = 20%`. Initial `Ghi nợ` is `700.000 đ`, which is $3.500.000 \times 20\% = 700.000 đ$.
   - In Row 8 (`SG2509`), `Lương = 2.2M`, `Tỉ lệ = 25%`. Initial `Ghi nợ` is `550.000 đ`, which is $2.200.000 \times 25\% = 550.000 đ$.
   - **Rule 1**: $\text{Phí nhận lớp ban đầu} = \text{Lương} \times \text{Tỉ lệ phí nhận lớp}$.

2. **Monthly Commission Fee Derivation**:
   - In `LG4729`: Student pays $2.200.000 đ$ (`Ghi có`), Teacher base pay is $2.000.000 đ$. In subsequent months (Row 10, Row 19), user records `Ghi nợ = 200.000 đ`.
   - In `SG2509`: Student pays $2.400.000 đ$ (`Ghi có`), Teacher base pay is $2.200.000 đ$. In subsequent months (Row 14, Row 21, Row 24), user records `Ghi nợ = 200.000 đ`.
   - In `TX2030`: Student pays $3.600.000 đ$, base pay is $3.300.000 đ$. Subsequent month commission is $300.000 đ$ (`Ghi nợ: 300.000 đ`).
   - **Rule 2**: $\text{Phí chênh lệch hàng tháng} = \text{Phải thu học viên} - \text{Lương}$.

3. **Corporate VAT Invoice & Intermediary Fee Derivation**:
   - In `KC006` (Row 274): `Ghi có = 15.250.000 đ`, `Ghi nợ = 1.220.000 đ`. $\frac{1.220.000}{15.250.000} = 8.00\%$.
   - In `KC006` (Row 339): `Ghi có = 20.250.000 đ`, `Ghi nợ = 1.620.000 đ`. $\frac{1.620.000}{20.250.000} = 8.00\%$.
   - As confirmed in interview/request:
     * Base enterprise contract: $P_{base}$
     * Client requires VAT invoice $\implies$ $10\%$ surcharge: $P_{invoice} = P_{base} \times 1.10$.
     * Intermediary center issues VAT invoice and charges $8\%$ (or customizable rate): $\text{Fee}_{inter} = P_{invoice} \times 8\%$.
     * User retains: $P_{invoice} - \text{Fee}_{inter} = P_{base} \times 1.10 \times 0.92 = P_{base} \times 1.012$ (retaining $100\%$ base $+ 1.2\%$ net from VAT differential).
   - **Rule 3**: Accounting entries:
     - `Ghi có` (Cash Inflow): $P_{invoice}$
     - `Ghi nợ` (Expense to Intermediary): $P_{invoice} \times 8\%$
     - Net Cash Retained: $P_{invoice} - \text{Fee}_{inter}$.

4. **"Quỹ Phí Dư" Escrow Mechanics Derivation**:
   - When a class fails to start (`Non-Start`):
     Broker does not return cash immediately. Broker credits user's account with the center.
     User records:
     - `Trạng thái: Non-Start`
     - `Ghi có: IntakeFee` (neutralizing initial debit)
     - `Phí dư: +IntakeFee` (fund increases).
   - When taking a new class:
     User offsets intake fee from Quỹ Phí Dư:
     - `Ghi nợ: IntakeFee`
     - `Phí dư: -OffsetAmount` (where $\text{OffsetAmount} \le \text{AvailableBalance}$)
     - Net cash out-of-pocket: $\text{IntakeFee} - \text{OffsetAmount}$.
   - When user withdraws cash from the center (`HOANPHI`):
     - `Mã lớp: HOANPHI`
     - `Ghi có: Amount` (actual bank deposit received)
     - `Phí dư: -Amount` (fund balance reduced)
     - Observed in Rows 145, 219, 266: all three withdrawals brought the running balance to exactly $0 đ$.

---

## 3. Caveats

1. **Spreadsheet Static Export**: The `.xlsx` file contains computed static values rather than dynamic Excel `=SUM()` formulas. However, every formula was rigorously reverse-engineered and verified against actual numbers with 100% precision across dozens of classes.
2. **Column 11 ("Công ty") in B2C Classes**: In the Excel file, Column 11 was empty for B2C records; corporate class notes were placed in Column 12 (`Diễn giải`) or Column 9 (`Tên học viên`). In the webapp, the CRM data model separates B2C (`name`) from B2B (`partnerName`, `taxCode`, `intermediary`).
3. **Manual vs Automatic Journal Posting**: In Excel, the user typed each row manually. In the webapp, transactions are generated semi-automatically or automatically when CRM leads transition to "Thành công" or "Không thành công", while preserving manual override capabilities.

---

## 4. Conclusion & Actionable Mapping

### 4.1 Field-by-Field Data Mapping

| Excel Spreadsheet Column | Webapp Data Entity & Field | Type & Description |
|---|---|---|
| `Năm` (Col 0) | `Transaction.date` (year component) | string / number |
| `Tháng` (Col 1) | `Transaction.date` (month component) | string / number (1-12) |
| `Ngày` (Col 2) | `Transaction.date` | ISO string `YYYY-MM-DD` |
| `Mã lớp` (Col 3) | `Transaction.classId` / `refCode` / `CRM.classCode` | string (e.g. `LG4729`, `HOANPHI`) |
| `Trạng thái` (Col 4) | `CRM.status` / `Transaction.status` | `'Start'` / `'Non-Start'` |
| `Ghi nợ` (Col 5) | `Transaction.debit` | number (VNĐ) |
| `Ghi có` (Col 6) | `Transaction.credit` | number (VNĐ) |
| `Phí dư` (Col 7) | `Transaction.surplus` | number (Positive: Credit +, Negative: Deduction/Withdrawal -) |
| `Tình trạng` (Col 8) | `CRM.activeStatus` / `class.status` | `'Active'` / `'Non-Active'` |
| `Tên học viên` (Col 9) | `Transaction.studentName` / `CRM.name` | string |
| `Số điện thoại` (Col 10) | `CRM.phone` | string |
| `Công ty` (Col 11) | `CRM.partnerName` / `Transaction.partnerName` | string |
| `Diễn giải` (Col 12) | `Transaction.description` / `note` | string |
| `Môn học` (Col 13) | `CRM.programName` / `course.title` | string |
| `Hình thức` (Col 14) | `CRM.learningFormat` | `'Offline'` / `'Online'` / `'Hybrid'` |
| `Địa chỉ`, `Quận`, `Tỉnh` | `CRM.trainingLocation` | string |
| `Thời lượng 1 buổi` (Col 18) | `TrainingPackageItem.hoursPerSession` | number (e.g. 1.5, 2) |
| `Tổng số buổi/ tháng` (Col 21)| `TrainingPackageItem.sessionCount` | number (e.g. 8, 12) |
| `Tổng số giờ` (Col 22) | `TrainingPackageItem.totalHours` | number (`sessionCount * hoursPerSession`) |
| `Phải thu học viên` (Col 23) | `CRM.tuition` (`formTuition`) | number (VNĐ) |
| `Lương` (Col 24) | `CRM.teacherMonthlyPay` | number (VNĐ) |
| `Tỉ lệ phí nhận lớp` (Col 25)| `CRM.initialCommissionRate` | number (0.20, 0.25) |
| `Diễn giải học phí` (Col 26)| `CRM.note` | string |
| `Tổng Ghi nợ` (Col 27) | Aggregated $\sum \text{debit}$ per class | computed metric |
| `Tổng Ghi có` (Col 28) | Aggregated $\sum \text{credit}$ per class | computed metric |
| `Tỉ lệ phí tổng` (Col 29) | $\sum \text{debit} / \sum \text{credit}$ | computed percentage |
| `Lương theo giờ` (Col 30) | $(\sum \text{credit} - \sum \text{debit}) / \text{totalHours}$ | computed net hourly wage |
| `Lương theo buổi` (Col 31) | $\text{Lương theo giờ} \times \text{hoursPerSession}$ | computed net session wage |

---

### 4.2 Implementation Specification for Developers

#### Module 1: CRM Admissions (`CRMAdmissionsModule.tsx`)
1. **Intake Fee Payment Source Selection**:
   - In class financial & commission section:
     Add selector: `Nguồn chi trả phí nhận lớp`:
     - Option A: `Tiền mặt / MoMo / Chuyển khoản` (`intakeFeePaymentSource = 'cash_or_momo'`).
     - Option B: `Cấn trừ từ Quỹ phí dư` (`intakeFeePaymentSource = 'deduct_from_surplus'`).
   - Display real-time badge: `Quỹ Phí Dư khả dụng: {availableSurplus.toLocaleString('vi-VN')} đ`.
   - Auto-calculate:
     * If `deduct_from_surplus`:
       - `intakeFeeSurplusDeducted = Math.min(classIntakeFee, availableSurplus)`
       - `intakeFeeCashPaid = Math.max(0, classIntakeFee - intakeFeeSurplusDeducted)`
2. **Automatic Quỹ Phí Dư Crediting on "Non-Start / Không thành công"**:
   - When a record's status is changed to `Không thành công / Thất bại` (or `Non-Start`):
     - If `classIntakeFee > 0`, create/prompt ledger transaction:
       * `type`: `'class_cancel_surplus'`
       * `credit`: `classIntakeFee`
       * `surplus`: `+classIntakeFee`
       * `description`: `Hoàn phí nhận lớp vào Quỹ Phí Dư (Non-Start: ${classCode} - ${name})`
3. **Corporate VAT Invoice Calculator**:
   - When `hasInvoiceDemand` is enabled:
     - `baseTuition`: entered amount
     - `vatRate`: 10% (0.10)
     - `vatAmount = Math.round(baseTuition * vatRate)`
     - `invoiceTotal = baseTuition + vatAmount`
     - `intermediaryFeePercent`: default 8% (customizable input)
     - `intermediaryFee = Math.round(invoiceTotal * (intermediaryFeePercent / 100))`
     - `netRetained = invoiceTotal - intermediaryFee`
     - Clean flat-ribbon summary showing: `Học phí gốc`, `Thuế VAT (+10%)`, `Tổng hóa đơn`, `Phí trung gian xuất HĐ (-8%)`, and `Thực nhận`.

#### Module 2: General Ledger & Cashflow (`AdminLedgerModule.tsx`)
1. **Quỹ Phí Dư Available Balance KPI Card**:
   - Add summary KPI card on toolbar/subtabs:
     - `Quỹ Phí Dư khả dụng`: $\sum \text{tx.surplus}$ across all non-test transactions.
     - In user's ledger, current balance is `1.290.000 đ`.
2. **"Phí Dư" Table Column Display**:
   - Rename `<th>` title from "Tồn quỹ" to **"Phí dư"**.
   - Style cell values:
     - `tx.surplus > 0`: `+ ${tx.surplus.toLocaleString('vi-VN')} đ` with emerald accent (`text-emerald-700 font-semibold font-mono`).
     - `tx.surplus < 0`: `- ${Math.abs(tx.surplus).toLocaleString('vi-VN')} đ` with amber/rose accent (`text-amber-700 font-semibold font-mono`).
     - `tx.surplus === 0 || !tx.surplus`: `<span className="text-slate-300 font-normal">-</span>`.
3. **Quick Action: "Tạo lệnh Rút quỹ (HOANPHI)"**:
   - Button on Toolbar: `+ Rút Quỹ (HOANPHI)`.
   - Modal prefilled:
     * `Mã đối soát`: `HOANPHI`
     * `Số tiền rút`: Pre-filled with `availableSurplus` (or user input $\le \text{availableSurplus}$)
     * `Bút toán ghi nhận`:
       - `credit`: `withdrawalAmount` (CASH INFLOW to bank)
       - `surplus`: `-withdrawalAmount` (RESERVE FUND DECREASE)
       - `type`: `'owner_withdrawal'` or `'center_payment'`
       - `paymentMethod`: `'Vietcombank'`
       - `description`: `Rút quỹ phí dư từ trung tâm về tài khoản ngân hàng`
4. **Persistence with Firestore**:
   - Save all fields (`credit`, `debit`, `surplus`, `type`, `refCode`, `description`, etc.) to Firestore collection `ledger_transactions`.

---

## 5. Verification Method

### 5.1 Independent Excel Verification
Run node script against `"C:\Users\zit\Downloads\cách tôi nhập.xlsx"`:
```bash
node -e "const XLSX = require('xlsx'); const wb = XLSX.readFile('C:\\Users\\zit\\Downloads\\cách tôi nhập.xlsx'); const ws = wb.Sheets['Sheet1']; const rows = XLSX.utils.sheet_to_json(ws, {header: 1, raw: false}); let totalCredits = 0, totalDebits = 0, bal = 0; rows.slice(1).forEach(r => { if (r[7]) { const v = parseInt(r[7].replace(/[^0-9-]/g, ''), 10); bal += v; if (v > 0) totalCredits += v; else totalDebits += Math.abs(v); } }); console.log('Credits:', totalCredits, 'Debits:', totalDebits, 'Final Balance:', bal);"
```
*Expected Output*:
`Credits: 31350000 Debits: 30060000 Final Balance: 1290000`

### 5.2 Test Execution
Run test suite in `De_Vuong_Webapp/`:
```bash
npm test
npm run test:business-revenue
```
*Expected Output*:
All tests passing (28 + 10 = 38 tests passing, 0 failing).

### 5.3 Invalidation Conditions
- If the intermediary fee percentage is fixed rather than customizable per contract, or if corporate VAT is not 10%, this specification would need to be updated. (However, the specification explicitly makes intermediary fee percent customizable, defaulting to 8%).
- If `Quỹ Phí Dư` is tracked per broker rather than globally, an additional `brokerId`/`centerId` field can be added. (Currently the user tracks all center deposits in a unified column).
