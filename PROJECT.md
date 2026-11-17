# Project: Accounting & Financial Workflow (Quỹ Phí Dư & CRM Admissions)

## Architecture
- **Webapp Root**: `De_Vuong_Webapp/` (Strict adherence to AGENTS.md rules).
- **Primary Data Model**:
  - `ledger_transactions` collection in Firestore:
    * `credit`: Cash Inflow to bank / revenue.
    * `debit`: Cash Outflow from bank / expense.
    * `surplus`: Quỹ Phí Dư adjustment (+ for credit upon Non-Start refund, - for new class offset or HOANPHI withdrawal).
    * `refCode`: Class Code (e.g. `RY2337`, `LG4729`), or `HOANPHI`.
  - `crm_records` & `customer_profiles` collections in Firestore:
    * `classIntakeFee`: Phí nhận lớp ban đầu.
    * `intakeFeePaymentSource`: `'cash'` vs `'surplus_offset'`.
    * `hasInvoiceDemand`: boolean for Corporate VAT invoice.
    * `intermediary`: Corporate VAT issuing partner.
    * `intermediaryFeePercent`: Fee charged by intermediary (default 8%).
    * `vatSurchargePercent`: 10%.
- **Key Modules**:
  - `AdminLedgerModule.tsx` (Sổ cái, Báo cáo Dòng tiền, HOANPHI withdrawal).
  - `CRMAdmissionsModule.tsx` (Quản lý Tuyển sinh, Phí nhận lớp, Cấn trừ Phí Dư, Non-Start refund, VAT Calculator).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | "Phí dư" Column Display | Rename "Tồn quỹ" to "Phí dư", add +/- semantic styling (+ emerald, - amber, 0 dash) in General Ledger table | M1 | Survey 2 & 3 |
| 2 | Quỹ Phí Dư KPI Summary Cards | Real-time available balance card in Cashflow (`activeSubTab === 'summary'`) and compact badge in Ledger toolbar header | M1 | Survey 2 & 3 |
| 3 | Quick Action "Rút quỹ (HOANPHI)" | Toolbar button and modal to record HOANPHI fund withdrawals (`credit: amount, debit: 0, surplus: -amount`) with Firestore persistence | M1 | Survey 2 & 3 |
| 4 | Fix Modal Surplus Logic | Ensure `surplus` is correctly recorded for surplus types in `handleSaveModalTransaction` | M1 | Survey 2 & 3 |
| 5 | Intake Fee Payment Source Selector | Add selector in CRM financial section for "Tiền mặt / MoMo" vs "Cấn trừ từ Quỹ phí dư" with live available balance display | M2 | Survey 1 & 3 |
| 6 | Auto Quỹ Phí Dư Credit on Non-Start | When lead status transitions to "Không thành công / Non-Start", automatically credit `classIntakeFee` to `ledger_transactions` with `surplus: +fee` | M2 | Survey 1 & 3 |
| 7 | Corporate VAT Invoice Calculation Card | Interactive 10% VAT surcharge, 8% intermediary fee, and net payout calculation ribbon in CRM Admissions | M2 | Survey 1 & 3 |
| 8 | E2E Testing & Audit Verification | Linting, test suite execution, build verification, Reviewer, Challenger, and Forensic Audit checks | M3 | System |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | General Ledger & Cashflow Engine | `src/types/admin.ts`, `src/components/admin/AdminLedgerModule.tsx` | None | DONE |
| M2 | CRM Admissions Financial & VAT Workflow | `src/components/admin/CRMAdmissionsModule.tsx` | M1 | DONE |
| M3 | Comprehensive Verification & Hardening | Full build, unit tests, Challenger, Reviewer, Auditor | M1, M2 | DONE |

## Interface Contracts
### `ledgerService` & `AdminLedgerModule` ↔ `CRMAdmissionsModule`
- `availableSurplusFund = sum(tx.surplus)` across all non-test `ledger_transactions`.
- When `intakeFeePaymentSource === 'surplus_offset'`:
  - `ledger_transactions` receives `{ type: 'class_accept_wallet', debit: intakeFee, surplus: -intakeFee, refCode: classCode, ... }`.
- When class outcome is Non-Start:
  - `ledger_transactions` receives `{ type: 'class_cancel_surplus', credit: intakeFee, surplus: +intakeFee, refCode: classCode, ... }`.
- When withdrawing funds:
  - `ledger_transactions` receives `{ type: 'surplus_withdrawal', credit: amount, debit: 0, surplus: -amount, refCode: 'HOANPHI', ... }`.

## Code Layout
- `De_Vuong_Webapp/src/types/admin.ts`: Transaction types & schemas.
- `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`: Sổ cái, Dòng tiền, Quỹ Phí Dư cards, HOANPHI action.
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`: Lead financial section, intake fee payment source, VAT calculator, Non-Start handler.
