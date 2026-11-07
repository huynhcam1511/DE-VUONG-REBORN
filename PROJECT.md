# Project: SePay Webhook, Ledger & Multi-Module Cross-Reconciliation (LEA/LRN & COL)

## Architecture
- **Webapp Core**: `De_Vuong_Webapp/` (React + Vite + TailwindCSS + Firebase Firestore + Express backend in `server.ts`).
- **Data Flow & Cross-Module Linkage**:
  - `server.ts`: SePay Webhook (`/api/sepay/webhook`) processes incoming bank transfers (`bank_events`), creates `ledger_transactions` with `refCode: COL-...`, queries `crm_records` & `customer_profiles` for student details, and accumulates `paidAmount`.
  - `AdminLedgerModule.tsx`: Renders financial transactions, parses smart info (`parseLedgerSmartInfo`), enriches student name and genuine `LRN-` code from `allCrmRecords` and `allStudents`, formats description to single line with tooltip, maintaining uniform row height.
  - `CRMAdmissionsModule.tsx`: Computes `activeCollectionOrder` by aggregating all payments (including `COL-` and bank transactions matching LEA code), passing `paidAmount` to `CommercialLifecycleBar.tsx`.
  - `CommercialLifecycleBar.tsx`: Displays commercial progress, transitioning to "Đã nộp đủ 100%" (0đ debt) when cumulative payments reach tuition.
  - `SepayReconciliationModule.tsx`: Matches SePay transactions against collection orders using both `refCode` and `LEA-` identifiers.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | R1.1: Consistent Student Name on Ledger | All transactions for a given `LEA-XXXXXXXX` show consistent CRM student name (e.g. "Nguyễn Thị Anh Thi") instead of placeholder "Học viên E-learning". | M1 | ORIGINAL_REQUEST §R1 |
| 2 | R1.2: Authentic LRN Code Resolution | Resolve genuine `LRN-XXXXXXXX` from CRM/Users profile (`LRN-20510493`), eliminating fake LRN prefix fabrication (`LRN-91690914`). | M1 | ORIGINAL_REQUEST §R1 |
| 3 | R2.1: Clean Description & No Duplication | Strip prefixes `[SePay-COL]`, `[SePay-HP]`, `[LENH THU]`, remove redundant LEA code and student name from Diễn giải. | M2 | ORIGINAL_REQUEST §R2 |
| 4 | R2.2: Uniform Row Height & Tooltip | Display Diễn giải in single line (`truncate`/`line-clamp-1`), tuck raw SePay content into `title` tooltip. | M2 | ORIGINAL_REQUEST §R2 |
| 5 | R3.1: Multi-payment Accumulation in Webhook | Accumulate `paidAmount = (currentPaid || 0) + amount_in` in `server.ts` for CRM records, query `crm_records` alongside `customer_profiles`. | M3 | ORIGINAL_REQUEST §R3 |
| 6 | R3.2: Cumulative Collection Order Calculation | In `CRMAdmissionsModule.tsx`, do not exclude `COL-` payments, sum all credit transactions matching LEA/receiptCode. | M3 | ORIGINAL_REQUEST §R3 |
| 7 | R3.3: CommercialLifecycleBar 100% Transition | Update `CommercialLifecycleBar` to display 100% completed status and 0đ remaining debt when multiple payments sum to tuition (e.g. 3.000đ + 2.000đ = 5.000đ). | M3 | ORIGINAL_REQUEST §R3 |
| 8 | R3.4: SePay Reconciliation Matching | Update `getCollectedAmountForOrder` in `SepayReconciliationModule.tsx` & `AdminDashboard.tsx` to match on LEA code. | M3 | ORIGINAL_REQUEST §R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Data Consistency (LEA/LRN & Name Resolution) | `AdminLedgerModule.tsx`, `codeGenerator.ts` guard, `server.ts` | Survey | IN_PROGRESS |
| 2 | M2: Description Cleaning & UI/UX Uniformity | `AdminLedgerModule.tsx` | M1 | PLANNED |
| 3 | M3: Payment Accumulation (COL & CommercialLifecycleBar) | `CRMAdmissionsModule.tsx`, `server.ts`, `SepayReconciliationModule.tsx`, `AdminDashboard.tsx` | M1 | PLANNED |
| 4 | M4: E2E Verification & Forensic Integrity Audit | Full test suite, manual check, reviewer, challenger, auditor | M1, M2, M3 | PLANNED |

## Interface Contracts
### Ledger ↔ CRM Records & Users
- Input: `tx.studentId`, `tx.description`, `tx.originalContent`, `tx.refCode`.
- Extracted: `normalizedLeaCode` (e.g. `'LEA-91690914'`).
- Lookup: `allCrmRecords.find(r => r.code === normalizedLeaCode || r.id === normalizedLeaCode || r.allIds?.includes(normalizedLeaCode))`. Filter out empty stub docs.
- Student Name: `matchedCrm.name || matchedCrm.fullName`.
- Learner Code: `allStudents.find(s => s.uid === matchedCrm.studentId)?.student_code_internal` (`'LRN-20510493'`).
- Safeguard: NEVER pass `LEA-` code into `ensureValidBusinessCode(..., 'LRN')`. If no genuine LRN code exists, leave `lrnCode` as `null`.

### Collection Order ↔ Ledger Payments
- Matching criteria for LEA record: All `ledger_transactions` with `credit > 0` and `type !== 'expected_revenue'` whose content, `studentId`, or `refCode` matches `targetCode` or `receiptCode`.
- `paidAmount = sum(all matching credit)`.
- Status: `paidAmount >= tuition ? 'completed' : 'partial'`.

## Code Layout
- `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`: Sổ cái table, `parseLedgerSmartInfo`, column rendering.
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`: CRM lead details, `activeCollectionOrder`.
- `De_Vuong_Webapp/src/components/admin/CommercialLifecycleBar.tsx`: Commercial progress visualization.
- `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx`: SePay IPN order reconciliation.
- `De_Vuong_Webapp/server.ts`: SePay webhook endpoint & Firestore updates.
