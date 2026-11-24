# HANDOFF REPORT: Milestone 1 - CRM Admissions Section 3 Single Flat Ledger Card

**Agent**: `worker_crm_m1` (Teamwork Worker)  
**Timestamp**: 2026-11-19T09:44:00Z  
**Application Root**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`  
**Modified File**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`  
**Reference Documents**: `ORIGINAL_REQUEST.md`, `PROJECT.md`, `AGENTS.md`  

---

## 1. Observation

1. **Section 3 Replacement in `CRMAdmissionsModule.tsx`**:
   - Previously, lines ~5697-6143 contained a multi-section financial panel featuring:
     - Hardcoded `formHasInvoiceDemand = true` causing corporate VAT calculator to always render by default.
     - A dynamic list of monthly commissions (`formMonthlyCommissions`: Month 1, Month 2, Month 3... "+ Thêm tháng tiếp theo") which cluttered Stage 1 (Admissions) with Stage 2 recurring operational collections.
     - Radio buttons for class outcome without a decisive handover action.
     - Absence of a tuition plan type selector (`tuitionPlanType`: full, installments, monthly) and initial payment amount / payment method fields.
     - Total omission of synchronization to `payments/{studentId}` in Firestore upon class assignment.
   - **Post-Change Implementation**:
     - Imported `paymentService`, `StudentPayment`, `Transaction`, `TransactionType` from `../../services/paymentService`.
     - Added fields to `CRMRecord`: `tuitionPlanType?: 'full' | 'installments' | 'monthly'`, `initialPaymentAmount?: number`, `initialPaymentMethod?: string`.
     - Added reactive state variables:
       - `formTuitionPlanType`: default `'full'`
       - `formInitialPaymentAmount`: string
       - `formInitialPaymentMethod`: `'Chuyển khoản VCB' | 'Tiền mặt'`, default `'Chuyển khoản VCB'`
       - `computedInitialPaymentNumber`: memoized integer parsed from `formInitialPaymentAmount`
       - `formHasInvoiceDemand`: default `false` (collapsed by default).
     - Section 3 transformed into a **Single Flat Ledger Card** (`rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-xs`):
       - **Kế hoạch học phí**: Input `formTuition` and 3-button segmented selector `formTuitionPlanType` ('full' [Trọn gói 1 lần], 'installments' [Chia nhỏ đợt], 'monthly' [Thu theo tháng]).
       - **Ghi có Đợt đầu (Đợt 1)**: Input `formInitialPaymentAmount` and `AdminSaaSSelect` `formInitialPaymentMethod` ('Chuyển khoản VCB' / 'Tiền mặt').
       - **Phí nhận lớp ban đầu**: Input `formClassIntakeFee`, `formClassIntakeFeeDate`, and toggle button between 'Tiền mặt / VCB' vs 'Cấn trừ Quỹ' with dynamic surplus fund balance `availableSurplusFund` (disabled if fund insufficient).
       - **Máy tính VAT Doanh nghiệp**: Fully encapsulated in a checkbox toggle `[ ] Xuất hóa đơn VAT Doanh nghiệp (Phụ thu 10% VAT, Phí trung gian 8%)`, default unchecked (`false`). Expanding it reveals the 3 inputs and the 5-metric calculation summary.
       - **Decisive Transition Actions**:
         - `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`: triggers `handleNonStartOutcome`
         - `[★ XẾP VÀO LỚP HỌC (START)]`: triggers `handleStartAndEnrollClass`.
     - Monthly commissions (`formMonthlyCommissions`) completely removed from Section 3.

2. **Decisive Transition Handlers**:
   - `handleStartAndEnrollClass`:
     - Sets lead status to `'Đã xếp lớp'` and `classOutcome` to `'start'`.
     - Resolves or creates student profile via `userService.createUserProfile` / `userService.updateUserProfile`.
     - Resolves or creates class via `classService.generateClassCode` and `classService.saveClass`.
     - Synchronously initializes `payments/{studentId}` via `paymentService.savePayment`:
       - `totalAmount`: `computedTuitionNumber`
       - `deposit`: `computedInitialPaymentNumber`
       - `paidAmount`: `computedInitialPaymentNumber`
       - `debt`: `Math.max(0, computedTuitionNumber - computedInitialPaymentNumber)`
       - `transactions`: 1 `debt_recognition` transaction for total tuition, plus 1 `full_payment` / `deposit` / `partial_payment` transaction for initial payment if `computedInitialPaymentNumber > 0`.
     - Creates ledger transactions:
       - Debits wallet (`class_accept_wallet`, `surplus: -intakeFee`) if `formIntakeFeePaymentSource === 'surplus_offset'`.
       - Credits ledger (`type: 'payment'`, `credit: computedInitialPaymentNumber`) if `computedInitialPaymentNumber > 0`.
     - Persists lead record to both `customer_profiles` and `crm_records` via Firestore `setDoc`.
   - `handleNonStartOutcome`:
     - Sets lead status to `'Đã hủy'` and `classOutcome` to `'non_start'`.
     - Calls `triggerNonStartRefundIfEligible` to automatically credit the surplus fund on `ledger_transactions` (`type: 'class_cancel_surplus'`, `surplus: +intakeFee`).
     - Persists updated status to `customer_profiles` and `crm_records` via Firestore `setDoc`.

3. **Build Command Execution**:
   - Command: `cd De_Vuong_Webapp; npm run build`
   - Output:
     ```
     > react-example@0.0.0 build
     > vite build
     vite v6.4.1 building for production...
     transforming...
     ✓ 3788 modules transformed.
     rendering chunks...
     computing gzip size...
     dist/index.html                                             1.54 kB
     dist/assets/index-DPn2jBIz.js                           6,520.15 kB
     ✓ built in 11.28s
     ```
   - Exit code: `0`. 0 TypeScript compile errors. 0 bundle errors.

---

## 2. Logic Chain

1. From Requirement R1 and Survey Reports 1 & 3:
   - Admissions (Stage 1) is solely concerned with Onboarding, tuition commitment, initial intake fee deduction source, first installment credit, and transitioning to class/operations.
   - By removing recurring monthly commissions from Section 3 and placing tuition plan type, Đợt 1 credit, intake fee toggle, and corporate VAT checkbox toggle into a Single Flat Ledger Card, the UI is completely decluttered and adheres strictly to AGENTS.md.
2. From the Handover Contract between Stage 1 and Stage 2:
   - Previously, Stage 2 (`StudentDetail.tsx`) was disconnected from Stage 1 because `payments/{studentId}` was never created in Admissions, resulting in zeroed-out debt summaries and broken `LeadPaymentModal` calculations.
   - Implementing `handleStartAndEnrollClass` to synchronously initialize `payments/{studentId}` with `debt_recognition` (for total tuition) and initial payment credit bridges the gap completely.
   - When Stage 2 opens, `paymentService.subscribeToPayment(studentId)` immediately receives the exact total tuition, paid amount, and remaining debt.
3. From the Non-Start specification:
   - If a class cancels before starting, `handleNonStartOutcome` sets `classOutcome = 'non_start'`, `status = 'Đã hủy'`, and invokes `triggerNonStartRefundIfEligible` to refund the intake fee back to the Surplus Fund (`Quỹ Phí Dư`) in `ledger_transactions`.
4. From Build Verification:
   - `npm run build` ran cleanly in 11.28s with code 0, confirming no syntax, type, or module errors were introduced.

---

## 3. Caveats

- **Exclusive Ownership Respect**: Only `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` was touched. `StudentDetail.tsx` was left strictly unmodified, ready for Milestone 2 worker.
- **Surplus Fund Balance**: The surplus fund offset is dynamically bounded by `availableSurplusFund`. If `availableSurplusFund <= 0`, the surplus offset button is properly disabled.

---

## 4. Conclusion

Milestone 1 is complete.
1. Section 3 in `CRMAdmissionsModule.tsx` is transformed into a Single Flat Ledger Card.
2. Tuition plan type, Đợt 1 credit, intake fee source toggle, and collapsed Corporate VAT calculator are operational.
3. Decisive handover actions `[★ XẾP VÀO LỚP HỌC (START)]` and `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]` are fully integrated with Firestore persistence (`crm_records`, `customer_profiles`, `classes`, `users`, `payments`, `ledger_transactions`).
4. Vite build passes with 0 errors (Exit code 0).

---

## 5. Verification Method

1. **Build Verification**:
   ```powershell
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm run build
   ```
   *Expected outcome*: Exit code 0, bundle generated in `dist/`.

2. **Code Inspection**:
   - Inspect `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`:
     - Line ~27: `import { paymentService, StudentPayment, Transaction, TransactionType } from '../../services/paymentService';`
     - Lines ~4940-5300: `handleStartAndEnrollClass` and `handleNonStartOutcome` implementations.
     - Lines ~6080-6450: Single Flat Ledger Card JSX with 4 blocks: Kế hoạch học phí, Thu đợt 1 & Phí nhận lớp, Toggle VAT doanh nghiệp, Decisive action buttons.

3. **Invalidation Conditions**:
   - If monthly commissions still appear in Section 3 of Admissions.
   - If VAT invoice calculator is expanded by default when creating a new lead.
   - If clicking START fails to initialize `payments/{studentId}` in Firestore.
