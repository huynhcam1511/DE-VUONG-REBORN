# Handoff Report: Finance, Cashflow, & General Ledger Architecture Investigation

- **Author**: `explorer_survey_2` (Teamwork Explorer — Finance & Cashflow)
- **Target File**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md`
- **Timestamp**: 2026-11-17T15:35:00Z
- **Status**: COMPLETE

---

## 1. Observation

### 1.1 Application Entry Points and Routing
- Direct observation in `De_Vuong_Webapp/src/components/AdminDashboard.tsx`:
  - Lines 6245–6285:
    - `activeTab === 'ledger'` renders `<AdminLedgerModule initialSubTab="ledger" parentTab="ledger" />`
    - `activeTab === 'receivables'` renders `<AdminLedgerModule initialSubTab="receivables" parentTab="receivables" />`
    - `activeTab === 'cashflow'` renders `<AdminLedgerModule initialSubTab="summary" parentTab="cashflow" />`
    - `activeTab === 'misa'` renders `<AdminLedgerModule initialSubTab="misa_export" parentTab="ledger" />`
    - `activeTab === 'finance'` renders `financeContent`, which in lines 5773–5779 also renders `<AdminLedgerModule initialData={b2bTabExtraData['finance']} />`.
  - Therefore, `AdminLedgerModule.tsx` (`src/components/admin/AdminLedgerModule.tsx`) is the single canonical engine powering Sổ cái (General Ledger), Báo cáo Dòng tiền (Cashflow), Công nợ Hợp đồng (Accounts Receivable), and Đối soát MISA.

### 1.2 Data Persistence & Firestore Schema
- Observed in `De_Vuong_Webapp/src/services/ledgerService.ts` (lines 26–50) and `src/components/admin/AdminLedgerModule.tsx` (lines 392–404):
  - Primary Firestore collection is `"ledger_transactions"`.
  - Secondary collection for targets is `"financial_goals"`.
  - Model `LedgerTransaction` / `Transaction` contains:
    - `id: string` (Firestore Document ID)
    - `date: string` (formatted as `'yyyy-MM-dd'` or `'yyyy-MM-dd HH:mm:ss'`)
    - `refCode: string` (Class code e.g. `'RY2337'`, or payment/order code `'COL643860'`, or withdrawal code `'HOANPHI'`)
    - `studentName: string` / `studentId?: string` / `internalId?: string`
    - `credit: number` (Ghi Có: Cash Inflow into bank / revenue)
    - `debit: number` (Ghi Nợ: Cash Outflow from bank / expense)
    - `surplus: number` (Phí Dư: Delta on Escrow/Deposit Credit Fund)
    - `type: TransactionType`
    - `paymentMethod?: string` (`'Vietcombank'`, `'MoMo'`, `'TPBank'`, `'Tiền mặt'`)
    - `description: string` / `originalContent?: string` / `note?: string`
    - `createdAt: any`, `updatedAt?: any` (Firestore `serverTimestamp()`)
- Real-world Firestore inspection via Node script confirmed existing documents in collection `ledger_transactions` with `surplus != 0`:
  - Document `h94pELeJIWFn5dc3I2Vb`: `refCode: "RF1003", type: "class_accept_wallet", surplus: -200000, debit: 200000, credit: 0`
  - Document `linJ49Iw3ve6nBKqm8Bn`: `refCode: "RF1002", type: "class_cancel", surplus: 100000, debit: -100000, credit: 0`

### 1.3 User's Actual Excel Bookkeeping Analysis
- Programmatic inspection of `C:\Users\zit\Downloads\cách tôi nhập.xlsx` (Sheet1, 411 records) revealed the exact accounting mechanism used by the business:
  1. **Column Structure**:
     - `Năm`, `Tháng`, `Ngày`, `Mã lớp`, `Trạng thái` (Start / Non-Start), `Ghi nợ`, `Ghi có`, `Phí dư`, `Tình trạng`, `Tên học viên`, `Số điện thoại`, `Công ty`, `Diễn giải`.
  2. **Class Failure ('Non-Start') → Fund Credited (+Phí dư)**:
     - Example Row 33: `Mã lớp: RY2337 | Trạng thái: Non-Start | Ghi có: 440.000 đ | Phí dư: 440.000 đ`
     - Example Row 36: `Mã lớp: ZY6617 | Trạng thái: Non-Start | Ghi có: 660.000 đ | Phí dư: 660.000 đ`
     - When a class fails to start, the intake fee deposit held at the center is refunded into user's fund at the center as positive `+Phí dư`.
  3. **New Class Accepted ('Start') → Fund Offset (-Phí dư)**:
     - Example Row 35: `Mã lớp: RY2635 | Trạng thái: Start | Ghi nợ: 660.000 đ | Phí dư: -440.000 đ`
     - User takes a new class, offsetting 440.000đ from the deposit fund, reducing the fund balance by `-440.000đ`.
  4. **Fund Withdrawal back to Bank Account ('HOANPHI')**:
     - Example Row 145: `Mã lớp: HOANPHI | Trạng thái: Non-Start | Ghi có: 1.220.000 đ | Phí dư: -1.220.000 đ`
     - Example Row 219: `Mã lớp: HOANPHI | Trạng thái: Start | Ghi có: 1.290.000 đ | Phí dư: -1.290.000 đ`
     - Example Row 266: `Mã lớp: HOANPHI | Trạng thái: Start | Ghi có: 700.000 đ | Phí dư: -700.000 đ`
     - In a withdrawal, the center transfers money to the user's bank account (`Ghi có: +X`), and the center fund balance is cleared (`Phí dư: -X`).
  5. **Running Total Mechanics**:
     - Cumulative sum of `Phí dư` across all rows in the Excel file equals the real-time available deposit fund balance (`Net Available Quỹ Phí Dư = sum(surplus)`).

### 1.4 Current Implementation Gaps in `AdminLedgerModule.tsx`
- **Table Column Misnaming**:
  - In `AdminLedgerModule.tsx` (lines 1432–1436):
    ```tsx
    <th className="px-4 py-3.5 text-xs font-semibold text-slate-700 w-[110px] text-right">Ghi Có</th>
    <th className="px-4 py-3.5 text-xs font-semibold text-slate-700 w-[110px] text-right">Ghi Nợ</th>
    <th className="px-4 py-3.5 text-xs font-semibold text-slate-700 w-[110px] text-right">Tồn quỹ</th>
    ```
    The column is labeled `"Tồn quỹ"`, but line 1495 renders `tx.surplus`!
  - In line 1494–1496:
    ```tsx
    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 text-right tabular-nums font-mono whitespace-nowrap">
      {tx.surplus !== 0 ? tx.surplus.toLocaleString() : <span className="text-slate-300 font-normal">-</span>}
    </td>
    ```
    It renders `tx.surplus` as neutral gray without `+` or `-` indicators and without semantic color distinctions.
- **Missing Top Summary Cards for "Quỹ Phí Dư" in Sổ cái & Cashflow**:
  - `activeSubTab === "receivables"` has 4 KPI summary cards (lines 1797–1828), and `activeSubTab === "student_report"` has 4 KPI summary cards (lines 1596–1620).
  - In contrast, `activeSubTab === "summary"` (Cashflow) directly starts with the raw month-by-month table, lacking top KPI metrics cards.
  - In `activeSubTab === "ledger"` (Sổ cái Thu/Chi), there is no display of the current available "Quỹ Phí Dư" balance.
- **Missing "Tạo lệnh Rút quỹ (HOANPHI)" Quick Action**:
  - Lines 1400–1412 only provide `exportToExcel` and `+ Ghi nhận Thu / Chi`.
  - There is no quick action button or dedicated modal to execute a `"HOANPHI"` withdrawal order.
- **Modal Logic Defect in Manual Recording**:
  - Line 468 in `handleSaveModalTransaction` hardcodes `surplus: 0`, even when `modalType === 'class_cancel_surplus'` or `'class_accept_surplus'`.

---

## 2. Logic Chain

1. **Premise**: In tuition brokerage and training center operations, "Phí nhận lớp ban đầu" is an upfront intake fee paid to the intermediary center. If a class fails to start, the money is not lost; it remains as a credit balance held by the center on behalf of the teacher/business ("Quỹ Phí Dư").
2. **Observation Alignment**: The user's Excel file confirms that `Phí dư` is a separate signed account:
   - When refunded (+): `Phí dư = +amount`, `Ghi có = +amount`
   - When offset (-): `Phí dư = -amount`, `Ghi nợ = amount`
   - When withdrawn (-): `Phí dư = -amount`, `Ghi có = +amount` (cash in bank increases by amount, fund balance is reduced by amount)
3. **Ledger Table Blueprint**:
   - The column header in `AdminLedgerModule.tsx` must be renamed from `"Tồn quỹ"` to `"Phí dư"`.
   - The cell renderer must check `tx.surplus`:
     - If `tx.surplus > 0`: render `+{tx.surplus.toLocaleString()}đ` with `font-semibold text-emerald-700 font-mono`
     - If `tx.surplus < 0`: render `-{Math.abs(tx.surplus).toLocaleString()}đ` with `font-semibold text-amber-700 font-mono`
     - If `0`: render `<span className="text-slate-300 font-normal">-</span>`
   - This complies with AGENTS.md Rule 4 (Plain text, anti-pill overload, font-mono, no colorful bubble pills).
4. **Quỹ Phí Dư Summary Card Blueprint**:
   - The real-time available fund balance is computed across all non-test transactions:
     $$\text{AvailableSurplus} = \sum_{\substack{\text{tx} \in \text{transactions} \\ \neg \text{isTest(tx)}}} \text{tx.surplus}$$
   - Placements:
     - **In `tab=cashflow` (`activeSubTab === "summary"`)**: Place a 4-card KPI grid at the top before the summary table:
       1. **Quỹ Phí Dư Khả Dụng**: `availableSurplus.toLocaleString()}đ` (Icon: `Wallet`, Color: `text-emerald-700`, Subtitle: "Tích lũy từ cọc hoàn khi lớp không mở được")
       2. **Tổng Doanh Thu Thực Nhận**: `totalCredit.toLocaleString()}đ` (Icon: `TrendingUp`, Color: `text-emerald-600`)
       3. **Tổng Chi Phí Hoạt Động**: `totalDebit.toLocaleString()}đ` (Icon: `TrendingDown`, Color: `text-rose-600`)
       4. **Lợi Nhuận Dòng Tiền**: `(totalCredit - totalDebit).toLocaleString()}đ` (Icon: `DollarSign`, Color: `text-blue-700`)
     - **In `tab=ledger` (`activeSubTab === "ledger"`)**: In the single-row toolbar header (`<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">`), add an inline KPI badge next to the actions:
       `<div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-xs font-medium cursor-default shadow-xs">`
       `  <Wallet size={13} className="text-emerald-600" />`
       `  <span className="text-slate-600">Quỹ Phí Dư:</span>`
       `  <span className="font-mono font-bold text-emerald-700 tabular-nums">{availableSurplus.toLocaleString()}đ</span>`
       `</div>`
5. **Quick Action "Tạo lệnh Rút quỹ (HOANPHI)" Blueprint**:
   - Add a button in the toolbar header:
     `<button onClick={() => setIsWithdrawModalOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-xs">`
     `  <ArrowUpRight size={13} className="text-amber-700" />`
     `  <span>Rút quỹ (HOANPHI)</span>`
     `</button>`
   - Modal behavior:
     - Prominently displays the current available Quỹ Phí Dư balance.
     - Inputs: Số tiền rút (`amount <= availableSurplus`), Tài khoản ngân hàng nhận tiền (`Vietcombank`, `TPBank`), Ngày rút, Trung tâm / Đối tác hoàn tiền, Diễn giải.
     - Saves to `ledger_transactions`:
       ```ts
       await addDoc(collection(db, "ledger_transactions"), cleanObject({
         date: withdrawDate,
         refCode: "HOANPHI",
         type: "surplus_withdrawal",
         credit: cleanAmount,       // Cash into bank
         debit: 0,
         surplus: -cleanAmount,     // Quỹ Phí Dư deducted
         paymentMethod: selectedAccount,
         studentName: centerName || "Trung tâm hoàn phí",
         description: description || "Rút tiền hoàn phí từ trung tâm về tài khoản ngân hàng (HOANPHI)",
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp(),
       }));
       ```
     - Updates local state immediately for zero-latency UI responsiveness.

---

## 3. Caveats

1. **All-time vs Filtered Surplus Balance**:
   - The available fund balance in Quỹ Phí Dư represents a physical reserve of credits currently held at the center. Therefore, `availableSurplus` must be calculated on the **cumulative all-time dataset**, independent of whether the user has filtered the table view by "Tháng 8" or "Năm 2024". The monthly delta should be displayed in the Cashflow month row, while the summary card displays the all-time available balance.
2. **Negative Surplus Prevention**:
   - In business reality, the user cannot withdraw more than what is available in the fund. The withdrawal modal should validate that `withdrawAmount <= availableSurplus` (or provide an override prompt if the user knowingly records an advance).
3. **AGENTS.md Layout Guardrails**:
   - In `tab=ledger`, AGENTS.md Rule 14 mandates a full-bleed edge-to-edge table layout (`flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`). Do NOT place tall multi-row card containers directly inside the table body scroll area of `tab=ledger`; instead, place the compact Quỹ Phí Dư badge on the sticky toolbar header, and place the full 4-card KPI metric block inside `tab=cashflow` (`activeSubTab === "summary"`).

---

## 4. Conclusion & Concrete Recommendations

### Summary of Component Architecture
| Task Item | Target File | Specific Location | Proposed Change |
|---|---|---|---|
| **1. Rename & Style "Phí dư" Column** | `AdminLedgerModule.tsx` | Line 1434 (`<th>`), Line 1494 (`<td>`) | Rename `Tồn quỹ` $\to$ `Phí dư` (`w-[120px]`). Render `+` in `text-emerald-700` for credits, `-` in `text-amber-700` for deductions. |
| **2. Available Quỹ Phí Dư KPI Card** | `AdminLedgerModule.tsx` | Lines 1530–1535 (`activeSubTab === "summary"`) | Add 4-card KPI metrics strip at the top of Cashflow, featuring `Quỹ Phí Dư Khả Dụng` as Card 1. |
| **3. Toolbar Fund Balance Badge** | `AdminLedgerModule.tsx` | Line 1392 (Toolbar right section) | Add compact badge `<Wallet size={13} /> Quỹ Phí Dư: {availableSurplus.toLocaleString()}đ` on sticky header. |
| **4. Quick Action "Rút quỹ (HOANPHI)"** | `AdminLedgerModule.tsx` | Lines 1392–1412 (Toolbar), Lines 2240+ (Modal) | Add amber button `Rút quỹ (HOANPHI)` + dedicated modal writing `{ credit: amount, debit: 0, surplus: -amount, refCode: 'HOANPHI' }`. |
| **5. Fix Modal Surplus Calculation** | `AdminLedgerModule.tsx` | Line 468 (`handleSaveModalTransaction`) | Correct `surplus: 0` bug: compute `surplus = modalType === 'class_cancel_surplus' ? cleanAmount : modalType === 'class_accept_surplus' ? -cleanAmount : 0`. |
| **6. Update Transaction Types & Smart Parser** | `types/admin.ts`, `AdminLedgerModule.tsx` | `types/admin.ts:588`, `AdminLedgerModule.tsx:120` | Add `surplus_withdrawal` to `TransactionType` and label it `'Rút quỹ hoàn phí (HOANPHI)'` in `parseLedgerSmartInfo`. |

---

## 5. Verification Method

1. **Static Analysis & Typecheck**:
   - Run: `cd De_Vuong_Webapp && npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors across `AdminLedgerModule.tsx`, `types/admin.ts`, and `revenue.ts`.
2. **Automated Unit & Adversarial Tests**:
   - Run: `node --import tsx --test tests/financeIdentity.adversarial.test.ts` to ensure 3-stream classification and party identity resolution remain 100% passing (15/15 tests).
   - Run: `node --import tsx --test tests/admissionsDebtSync.test.ts` to ensure CRM lead and student debt syncing are uncompromised.
3. **Build Verification**:
   - Run: `npm run build` in `De_Vuong_Webapp/` to ensure production Vite bundle builds without errors.
4. **Manual & Flow Verification in Browser**:
   - Navigate to `tab=ledger`:
     - Inspect the table: verify column header reads `"Phí dư"` and cell values show `+{amount}đ` in green, `-{amount}đ` in amber, and `-` in gray.
     - Inspect the toolbar: verify the Quỹ Phí Dư badge displays the correct cumulative sum and the `"Rút quỹ (HOANPHI)"` button is visible.
   - Click `"Rút quỹ (HOANPHI)"`:
     - Enter 500.000đ, destination Vietcombank, submit.
     - Verify a new transaction appears with `Mã: HOANPHI`, `Ghi Có: +500.000đ`, `Phí dư: -500.000đ`, and the available Quỹ Phí Dư balance decreases by 500.000đ immediately.
   - Navigate to `tab=cashflow` (`activeSubTab === "summary"`):
     - Verify the 4 KPI summary cards are rendered cleanly at the top of the page.
