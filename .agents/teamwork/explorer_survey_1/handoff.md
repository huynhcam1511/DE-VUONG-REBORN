# Handoff Report: CRM Admissions Financial & Accounting System Survey

**Agent**: `explorer_survey_1` (CRM Admissions Codebase Explorer)  
**Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\`  
**Target Codebase**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` and related CRM, Lead, Class, and Ledger files.  
**Date**: 2026-11-17T15:35:00Z  

---

## 1. Observation

### 1.1 Collections & Persistence Architecture
1. **Firestore Collections Used**:
   - `crm_records`: Primary collection storing lead/deal records (`CRMAdmissionsModule.tsx:3103`).
   - `customer_profiles`: Secondary/mirror collection (`CRMAdmissionsModule.tsx:3163`). In `handleSaveLead` (`lines 3763-3764`), records are written simultaneously to **both** collections:
     ```ts
     await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
     await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
     ```
   - `classes`: When a lead reaches status `'Đã xếp lớp'`, `CRMAdmissionsModule.tsx:3834-3868` creates/updates class documents in `classes/` with `programId`, `studentIds`, `sessions`, and `type: 'individual' | 'corporate'`.
   - `partners`: Syncs B2B profile data to `partners/` (`line 3768`).
   - `quotations`: Syncs linked quotation data (`line 3788`).
   - `ledger_transactions`: General ledger records (`AdminLedgerModule.tsx`, `LeadPaymentModal.tsx:400-417`, `ledgerService.ts`).
2. **CRM Schema & Types**:
   - `CRMRecord` defined at `CRMAdmissionsModule.tsx:776-833`:
     ```ts
     export type CRMRecord = {
       id: string | number;
       code?: string; // LEA-XXXXXXXX
       reconciliationCode?: string;
       name: string;
       kind: CustomerKind; // 'Cá nhân' | 'Doanh nghiệp'
       contact?: string; phone?: string; email?: string; source: string;
       need: string; roadmap: string; department?: string; programName?: string;
       tuition?: string;
       classIntakeFee?: number; // Phí nhận lớp ban đầu
       classIntakeFeeDate?: string; // Ngày hạch toán (YYYY-MM-DD)
       monthlyCommissions?: MonthlyCommissionItem[];
       classId?: string; classCode?: string; className?: string;
       status: CRMStatus;
       intermediary?: string; // Tên trung gian xuất hóa đơn
       intermediaryFeePercent?: number; // Tỉ lệ phí trung gian (%)
       hasInvoiceDemand?: boolean; // Yêu cầu xuất hóa đơn VAT
       hasPitTaxSupport?: boolean;
       ...
     };
     ```
   - Schema gaps identified:
     - Missing `intakeFeePaymentSource?: 'cash' | 'surplus_offset'` on `CRMRecord`.
     - Missing `intakeFeeLedgerTxId?: string` to link the fee payment to `ledger_transactions`.
     - Missing `classOutcome?: 'start' | 'non_start'` or outcome trigger in `CRMStatus`.
     - Missing computed VAT invoice fields: `vatSurchargePercent`, `vatInvoicedAmount`, `intermediaryFeeAmount`, `netCashflowAmount`.

### 1.2 Current Intake Fee, Commissions & Net Cashflow Implementation
1. **Intake Fee & Monthly Commission**:
   - `classIntakeFee` is inputted via `SaaSCurrencyInput` (`line 5541`) and stored as a raw number.
   - `classIntakeFeeDate` is inputted via `FormDateInput` (`line 5556`).
   - `monthlyCommissions` is modeled as `MonthlyCommissionItem[]` (`{ id, month, amount, note, date }`) (`lines 656-662`).
   - Dynamic handlers: `handleAddMonthlyCommission`, `handleRemoveMonthlyCommission`, `handleUpdateMonthlyCommission` (`lines 1658-1696`).
2. **Net Cashflow Calculation**:
   - Helper `calculateNetCashflow(tuition, intakeFee, monthlyCommissions)` (`lines 672-685`):
     $$\text{Net Cashflow} = \text{Tuition} - \text{IntakeFee} - \sum \text{MonthlyCommissions}$$
   - Displayed in a 4-part summary ribbon inside the modal (`lines 5654-5709`) and on the master table column (`lines 7327-7355`).
3. **Class Outcome & Non-Start Handling**:
   - Currently, `CRMStatus` supports `'Mới quan tâm' | 'Đang tư vấn' | 'Chờ thu tiền' | 'Đã thanh toán (Chờ xếp lớp)' | 'Đã xếp lớp' | 'Đã lưu trữ' | 'Đã hủy'`.
   - When a class/lead fails to start (status set to `'Đã hủy'` or class outcome is `'Non-Start'`), **there is currently NO automated mechanism in `CRMAdmissionsModule.tsx` to refund the intake fee into Quỹ Phí Dư (`ledger_transactions`)**.

### 1.3 User's Excel Accounting Model ("cách tôi nhập.xlsx")
Direct inspection of `C:\Users\zit\Downloads\cách tôi nhập.xlsx` (473 rows, Sheet1) revealed the exact accounting structure:
- Columns: `['Năm', 'Tháng', 'Ngày', 'Mã lớp', 'Trạng thái', 'Ghi nợ', 'Ghi có', 'Phí dư', 'Tình trạng', 'Tên học viên', ...]`
- **Taking a new class**:
  - Row 34: `MaLop: 'RY2635'`, `TrangThai: 'Start'`, `GhiNo: 660.000 đ`, `PhiDu: -440.000 đ` (Offset from fund: Intake fee is 660k, 440k is deducted from Quỹ phí dư).
- **Class Non-Start (Không thành công)**:
  - Row 28: Initial fee paid: `RY2337`, `TrangThai: 'Non-Start'`, `GhiNo: 440.000 đ`.
  - Row 32: Refund credited to fund: `RY2337`, `TrangThai: 'Non-Start'`, `GhiCo: 440.000 đ`, `PhiDu: +440.000 đ`.
- **Withdrawal from Center (`HOANPHI`)**:
  - Row 144: `MaLop: 'HOANPHI'`, `GhiCo: 1.220.000 đ` (bank cash received), `PhiDu: -1.220.000 đ` (fund balance cleared).

### 1.4 Financial & Commission Section Location in the UI
- **Modal / Detail View**: `CRMAdmissionsModule.tsx:5490-5710` (Section `2. Kế hoạch Thu học phí & Chi phí Môi giới (Nhận lớp & Hoa hồng định kỳ)`).
- **Master Table View**: `CRMAdmissionsModule.tsx:7327-7355` (Column `Học phí / Dòng tiền`, rendering Tuition and `Thực: XX.XXX.XXX đ` with tooltip).

### 1.5 AGENTS.md Rule Compliance Status
- **Rule 1 (Read-only cells & 3-dots action menu)**: Fully compliant. No click handlers on `<tr>` or `<td>`. 3-dots menu uses `AdminRowActions` (`line 7484`). Table header for actions is empty: `<th className="sticky top-0 z-20 bg-white w-14 px-3 py-2.5 text-right whitespace-nowrap"></th>`.
- **Rule 2 (Freeze Panes)**: Fully compliant. `sticky top-0 z-20 bg-white` used on all `<th>` tags. Container uses `flex-1 min-h-0 overflow-hidden`.
- **Rule 3 (Mono Record IDs without pills)**: Fully compliant. `LEA-XXXXXXXX` rendered with `font-mono text-xs font-semibold text-slate-700` without pills. Detail header also displays mono ID without pill (`lines 4737-4747`).
- **Rule 4 (CSS, Hover & Anti-Pill Overload)**: Fully compliant. `hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100`. Statuses use plain text + dot instead of heavy badges.
- **Rule 5 & 12 (Single-Row Toolbar & Custom Filter Dropdowns)**: Fully compliant. `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">` with `AdminFilterDropdown`s in 1 row. No `h1` or `<p>` clutter.
- **Rule 13 (Persistence)**: Compliant with Firestore writes (`crm_records`, `customer_profiles`, `classes`, `ledger_transactions`).

---

## 2. Logic Chain

1. **Intake Fee Payment Source Integration**:
   - The user needs to choose between `"Tiền mặt / MoMo / Ngân hàng"` vs `"Cấn trừ từ Quỹ phí dư"`.
   - The real-time available fund balance is computed by:
     $$\text{Available Fund Balance} = \sum_{\text{tx} \in \text{ledger\_transactions}} (\text{tx.surplus} \parallel 0)$$
   - In `CRMAdmissionsModule.tsx`, a real-time subscription (`ledgerService.subscribeToTransactions` or `onSnapshot(collection(db, 'ledger_transactions'))`) will provide `availableSurplusFund`.
   - In the Intake Fee section (`lines 5537-5550`), adding a selector:
     * When `"Tiền mặt / MoMo"` is selected: saves `intakeFeePaymentSource: 'cash'`. Creates/updates a `ledger_transactions` entry with `type: 'class_accept'`, `debit: intakeFee`, `surplus: 0`.
     * When `"Cấn trừ từ Quỹ phí dư"` is selected: checks `intakeFee <= availableSurplusFund`. If valid, saves `intakeFeePaymentSource: 'surplus_offset'`. Creates/updates a `ledger_transactions` entry with `type: 'class_accept_wallet'`, `debit: intakeFee`, `surplus: -intakeFee`.

2. **Automated Fund Crediting on Non-Start ("Không thành công / Non-Start")**:
   - When a class/lead outcome is set to `"Không thành công / Non-Start"` (or status is set to `'Không thành công / Non-Start'` / `'Đã hủy'` with Non-Start flag):
   - If the lead has an initial intake fee (`classIntakeFee > 0`):
     * The system creates an automated refund transaction in `ledger_transactions`:
       - `refCode`: `rec.code` or `rec.classCode`
       - `studentName`: `rec.name`
       - `type`: `'class_cancel'`
       - `startStatus`: `'non-start'`
       - `credit`: `rec.classIntakeFee`
       - `surplus`: `+rec.classIntakeFee` (fund credited)
       - `description`: `Hủy lớp ${rec.classCode || rec.code} - Hoàn phí dư vào quỹ`
       - `date`: `new Date().toISOString().slice(0, 10)`
     * This directly matches Row 32 & Row 35 of the Excel sheet!

3. **Corporate VAT Invoice Intermediary Fee Calculation**:
   - Variables already exist in state: `formIntermediary` and `formIntermediaryFeePercent` (`lines 1726-1727`), but lack UI rendering and calculation cards.
   - For B2B deals (`kind === 'Doanh nghiệp'` or when `hasInvoiceDemand === true`):
     * Base tuition: $T_{base}$
     * Surcharge rate: $r_{vat} = 10\%$ (VAT rate).
     * Total Invoiced Value: $T_{invoice} = T_{base} \times (1 + r_{vat}) = 1.10 \times T_{base}$ (e.g. $100\text{M} \to 110\text{M}$).
     * Intermediary fee rate: $r_{inter}$ (default 8%, editable via `formIntermediaryFeePercent`).
     * Intermediary fee charged by center: $F_{inter} = T_{invoice} \times r_{inter}$ (e.g. $110\text{M} \times 8\% = 8.8\text{M}$).
     * Net received by user: $T_{net} = T_{invoice} - F_{inter} = 110\text{M} - 8.8\text{M} = 101.2\text{M}$.
     * Net gain over base: $P_{extra} = T_{net} - T_{base} = +1.2\text{M}$ (+1.2%).
   - Adding a dedicated calculation card in Section 2 when `formKind === 'Doanh nghiệp'` or when `formHasInvoiceDemand` is active gives complete transparency.

---

## 3. Caveats

1. **Dual Persistence in CRM**: `CRMAdmissionsModule.tsx` writes to both `customer_profiles` and `crm_records`. Any schema additions (`intakeFeePaymentSource`, `classOutcome`, `vatSurchargePercent`, etc.) must be written to both collections via `removeUndefinedFields` to prevent missing fields upon re-sync.
2. **Idempotency of Ledger Auto-Refund**: When a user changes status to "Non-Start" multiple times (or edits other fields of a Non-Start lead), the system must check whether an auto-refund transaction for that `refCode` with `type: 'class_cancel'` already exists to prevent duplicate `+Phí dư` credits.

---

## 4. Conclusion & Concrete Recommendations

### 4.1 Schema Additions to `CRMRecord` (`CRMAdmissionsModule.tsx`)
```ts
export type CRMRecord = {
  // Existing fields...
  intakeFeePaymentSource?: 'cash' | 'surplus_offset'; // Nguồn thanh toán: Tiền mặt vs Cấn trừ quỹ
  intakeFeeLedgerTxId?: string; // ID bút toán trong ledger_transactions
  classOutcome?: 'start' | 'non_start'; // Kết quả lớp: Thành công (Start) vs Không thành công (Non-Start)
  vatSurchargePercent?: number; // % Phụ phí VAT (mặc định 10%)
  vatInvoicedAmount?: number; // Tổng giá trị xuất hóa đơn (Học phí + 10%)
  intermediaryFeeAmount?: number; // Phí trung gian thu (8% trên tổng hóa đơn)
  netCashflowAmount?: number; // Thực nhận sau thuế & phí trung gian
};
```

### 4.2 UI Changes in Financial Section (`CRMAdmissionsModule.tsx:5524-5565`)
1. **Intake Fee Source Selector**:
   - Add a clean 2-button radio toggle right under `Phí nhận lớp (VNĐ)`:
     * `[Tiền mặt / MoMo]`
     * `[Cấn trừ Quỹ phí dư (Dư khả dụng: {formatThousandsVN(availableSurplusFund)} ₫)]`
   - Disable/warn if `classIntakeFee > availableSurplusFund`.
2. **Outcome / Non-Start Status Toggle**:
   - Add a "Kết quả vận hành lớp" selector: `[Thành công (Start)]` vs `[Không thành công (Non-Start)]` (or integrate into `CRMStatus` / status dropdown).
   - If marked `Non-Start`, show visual indicator: `★ Tự động hoàn lại {formatThousandsVN(intakeFee)} ₫ vào Quỹ Phí Dư`.
3. **Corporate VAT Invoice Breakdown Card**:
   - Under Tuition, when `formKind === 'Doanh nghiệp'` and `formHasInvoiceDemand`:
   - Interactive fields for:
     * Đơn vị trung gian xuất hộ (`formIntermediary`)
     * Tỉ lệ phí trung gian (`formIntermediaryFeePercent`, default 8%)
     * Summary pills:
       - Giá xuất HĐ (+10%): `110.000.000 đ`
       - Phí trung gian (-8%): `-8.800.000 đ`
       - Thực nhận tài khoản: `101.200.000 đ` (+1.200.000 đ)

---

## 5. Verification Method

1. **Type & Syntax Verification**:
   ```bash
   cd De_Vuong_Webapp
   npm run lint
   ```
2. **Build Verification**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
3. **Functional Inspection**:
   - Check that `availableSurplusFund` accurately sums `ledger_transactions.surplus`.
   - Create a test lead with `classIntakeFee = 500.000 đ` and select `Cấn trừ từ Quỹ phí dư`. Verify that `ledger_transactions` receives `type: 'class_accept_wallet'`, `debit: 500000`, `surplus: -500000`.
   - Update lead outcome to `Non-Start`. Verify that `ledger_transactions` receives `type: 'class_cancel'`, `credit: 500000`, `surplus: +500000`.
   - Verify layout adheres 100% to AGENTS.md (no horizontal borders, 3-dots action menu, single-row toolbar, mono IDs without pills).
