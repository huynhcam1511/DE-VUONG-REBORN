## 2026-11-17T15:47:51Z
You are a teamwork_worker.
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_1\
Your identity is: teamwork_worker (CRM Admissions Financial Worker).

MANDATORY FIRST STEP: Read the original user request from:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md
- CRM Exploration Report: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md
- Excel & Domain Findings: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md
- Milestone 1 Completed Handoff: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_1\handoff.md

Write Ownership:
You exclusively own:
- De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope of Work (Milestone 2):
1. In `src/components/admin/CRMAdmissionsModule.tsx`:
   - Data Schema (`CRMRecord`):
     * Add `intakeFeePaymentSource?: 'cash' | 'surplus_offset'`
     * Add `vatSurchargePercent?: number` (default 10)
     * Add `vatInvoicedAmount?: number`
     * Add `intermediaryFeeAmount?: number`
     * Add `netCashflowAmount?: number`
     * In `handleSaveLead`, ensure all these new fields are saved cleanly to both `customer_profiles` and `crm_records` via `removeUndefinedFields`.
   - Real-time Quỹ Phí Dư Available Balance:
     * In `CRMAdmissionsModule`, subscribe or query `ledger_transactions` to calculate live `availableSurplusFund = sum(t.surplus)` across all non-test transactions.
   - Intake Fee Payment Source Selector:
     * In the financial section of the detail/modal view (`lines 5537-5565`), under `Phí nhận lớp (VNĐ)`:
       Add a clean, modern 2-option selector:
       - Option 1: `Tiền mặt / MoMo / Ngân hàng` (`'cash'`)
       - Option 2: `Cấn trừ từ Quỹ phí dư` (`'surplus_offset'`) with live indicator: `(Dư khả dụng: {formatThousandsVN(availableSurplusFund)} ₫)`.
       - If `formClassIntakeFee > availableSurplusFund`, show a clear validation warning or prevent choosing `surplus_offset` if insufficient fund.
       - If `formIntakeFeePaymentSource === 'surplus_offset'`, when saving a class booking / deal, link/record the deduction transaction in `ledger_transactions` if applicable (`type: 'class_accept_wallet'`, `debit: formClassIntakeFee`, `surplus: -formClassIntakeFee`).
   - Automated Quỹ Phí Dư Crediting on Non-Start ("Không thành công / Non-Start"):
     * When lead status transitions to `'Đã hủy'` or class outcome is marked Non-Start (Không thành công):
       If `formClassIntakeFee > 0` (or `existing.classIntakeFee > 0`):
       Check if a refund transaction in `ledger_transactions` for this `code` or `classCode` with `type: 'class_cancel_surplus'` already exists (prevent duplicate credits on re-saving).
       If not, automatically create the refund transaction in `ledger_transactions`:
       `{ refCode: updated.classCode || updated.code, type: 'class_cancel_surplus', credit: intakeFee, debit: 0, surplus: +intakeFee, studentName: updated.name, description: 'Hoàn phí nhận lớp vào Quỹ Phí Dư (Lớp không thành công/Non-Start)', date: new Date().toISOString().slice(0, 10), startStatus: 'non-start', activeStatus: 'non-active', misaStatus: 'unposted', createdAt: serverTimestamp(), updatedAt: serverTimestamp() }`.
   - Corporate VAT Invoice Calculator Card:
     * When `formKind === 'Doanh nghiệp'` or `formHasInvoiceDemand`:
       Add an interactive calculation card in the financial section:
       - Interactive inputs: Đơn vị trung gian (`formIntermediary`), Tỉ lệ phí trung gian (`formIntermediaryFeePercent`, default 8%), Phụ phí VAT (`formVatSurchargePercent`, default 10%).
       - Real-time reactive calculation summary:
         * Giá trị hợp đồng gốc: $P_{base}$
         * Phụ phí VAT (+10%): $P_{vat} = P_{base} \times 10\%$
         * Tổng giá trị xuất HĐ: $P_{invoice} = P_{base} \times 1.10$
         * Phí trung gian xuất HĐ (-8%): $F_{inter} = P_{invoice} \times 8\%$
         * Thực nhận tài khoản: $P_{net} = P_{invoice} - F_{inter}$ (e.g. 100.000.000 đ -> 110.000.000 đ invoice -> 8.800.000 đ fee -> 101.200.000 đ net).
   - Net Cashflow Ribbon & Master Table Updates:
     * Update `calculateNetCashflow` to account for VAT net payout and intake fee source.
     * Ensure the 4-part summary ribbon in the modal and the table column display the net amounts clearly.
   - Strictly adhere to AGENTS.md Rules:
     * Read-only table cells, 3-dots action menu, single-row toolbars, sticky headers, font hierarchy, no pills overload, full-bleed table layout, apiRequests/Firestore persistence.

Verification:
- Run `npm run lint` and `npm run build` in `De_Vuong_Webapp/`.
- Ensure all builds succeed with 0 errors.

Deliver full results and verification output into:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_1\handoff.md
Send a completion message when done referencing the handoff path.


## 2026-11-17T16:00:16Z
**Context**: Milestone 2 Implementation check.
**Content**: Checking in on your progress with `CRMAdmissionsModule.tsx`. Please provide a brief status update on your implementation and current step.
**Action**: Update your `progress.md` and reply with your current status.
