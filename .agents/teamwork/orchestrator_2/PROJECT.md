# Project: Student Identity & Multi-Stage Admissions Debt Sync

## Architecture
- **CRM Admissions Module (`CRMAdmissionsModule.tsx`)**:
  - Manages admission leads (`LEA-xxxxxxxx`).
  - Anchors student identity by ensuring `studentId` always stores the genuine `LRN-xxxxxxxx` code (`student_code_internal`) rather than raw Firestore UIDs.
  - Automatically recognizes existing students when phone, email, or name are entered.
  - Computes `previouslyPaidAmount` from `allLedgerTransactions` and passes genuine `studentCode` and debt data to `LeadPaymentModal`.
- **Payment & Receipt Modal (`LeadPaymentModal.tsx`)**:
  - Receives `lead`, `student`, and `allLedgerTransactions`.
  - Header renders: `LEA-xxxxxxxx · LRN-xxxxxxxx · [COL-xxxxxxxx] · [Tên học viên]`.
  - Field 1 ("1. Tổng học phí"): Inherits from "Học phí dự kiến" from the outer admission form.
  - Field 2 ("2. Thu đợt này"): Automatically suggests the remaining debt (`Tổng học phí - Đã thu`).
  - Field 3 ("3. Còn lại sau đợt này"): Reactively computes remaining balance in real time.
  - VietQR: Automatically generated with the exact amount from Field 2.
- **Accounting Ledger Module (`AdminLedgerModule.tsx`)**:
  - Enriches ledger transactions with multi-hop lookup: `LEA code` -> `CRM lead` -> `Student (LRN)`.
  - Displays real student name and genuine `LRN` code.
  - Eliminates generic placeholders like `'Học viên E-learning'` or `'---'`.
  - Eliminates fake pseudo-LRNs (e.g. converting `LEA-64817788` to `LRN-64817788`).
  - Cleans 1-line transaction descriptions without repeating student name or LEA code.
- **Admin Dashboard (`AdminDashboard.tsx`)**:
  - Feeds merged `crmLeads` to `<AdminLedgerModule />`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | R1.1 Student Identity Anchoring in CRM | In `CRMAdmissionsModule`, store genuine `LRN-xxxxxxxx` into `studentId`, auto-detect student by phone/email/name, update `handleSaveForm` and `handleOpenEditForm`. | M1 | ORIGINAL_REQUEST R1 |
| F2 | R1.2 Dual-Code Header in LeadPaymentModal | In `LeadPaymentModal.tsx`, display both `LEA-xxxxxxxx` and `LRN-xxxxxxxx` alongside student name in the modal header and customer summary box. | M1 | ORIGINAL_REQUEST R1 |
| F3 | R2.1 Expected Tuition Linkage | In `CRMAdmissionsModule` and `LeadPaymentModal`, ensure Field 1 inherits expected tuition directly from the admission form without stale data leakage. | M1 | ORIGINAL_REQUEST R2 |
| F4 | R2.2 Real-time Debt Calculation | Calculate `previouslyPaidAmount` by querying `allLedgerTransactions` for payments matching `LEA`, `LRN`, phone, or `COL` code (with cross-admission guard). | M1 | ORIGINAL_REQUEST R2 |
| F5 | R2.3 Propose Remaining Due & VietQR Sync | Field 2 automatically proposes remaining debt (`Tổng học phí - Đã thu`), Field 3 computes balance in real time, VietQR syncs exact amount. | M1 | ORIGINAL_REQUEST R2 |
| F6 | R3.1 Student Name & LRN Resolution in Ledger | In `AdminLedgerModule`, implement multi-hop identity resolution (`LEA` -> `CRM` -> `Student`) to display real student name and genuine `LRN` code. | M1 | ORIGINAL_REQUEST R3 |
| F7 | R3.2 Eradicate Generic Placeholders | Permanently eliminate `'Học viên E-learning'` and `'---'` fallbacks for transactions associated with admission leads. | M1 | ORIGINAL_REQUEST R3 |
| F8 | R3.3 Guard Against Pseudo-LRN Generation | Prevent stripping prefixes from `LEA` or `COL` codes to generate fake `LRN` codes. | M1 | ORIGINAL_REQUEST R3 |
| F9 | R3.4 Clean Transaction Descriptions | Strip redundant student names and LEA codes from `[LỆNH THU]` and `[SePay-COL]` descriptions for single-line AGENTS.md compliance. | M1 | ORIGINAL_REQUEST R3 |
| F10 | Dashboard Prop Integration | In `AdminDashboard.tsx`, pass `crmLeads={crmLeads}` to `AdminLedgerModule`. | M1 | ORIGINAL_REQUEST R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Student Identity & Admissions Debt Sync Implementation | Implement F1 through F10 in `CRMAdmissionsModule.tsx`, `LeadPaymentModal.tsx`, `AdminLedgerModule.tsx`, and `AdminDashboard.tsx`. Verify with build and automated checks. | None | DONE |

## Interface Contracts
### `CRMAdmissionsModule` -> `LeadPaymentModal`
- `LeadPaymentModalProps`:
  - `lead`:
    - `code`: `string` (e.g. `LEA-64817788`)
    - `studentId`: `string` (e.g. `LRN-62517882`)
    - `studentCode`: `string` (e.g. `LRN-62517882`)
    - `tuition`: `number` (from `formTuition` or `target.tuition`)
    - `paidAmount`: `number` (computed from ledger)
  - `allLedgerTransactions`: `LedgerTransaction[]`
- Header: renders `LEA-xxxxxxxx · LRN-xxxxxxxx · [COL-xxxxxxxx] · Client Name`.

### `AdminDashboard` -> `AdminLedgerModule`
- `AdminLedgerModuleProps`:
  - `crmLeads`: `CRMRecord[]`
  - `students`: `UserProfile[]`
- `parseLedgerSmartInfo`:
  - Input: `tx`, `allStudents`, `allCrmRecords`
  - Returns: `{ studentDisplay, lrnCode, leaCode, cleanDesc, ... }`
  - Guarantee: Never returns `'Học viên E-learning'` when LEA or student is present; never synthesizes fake LRN from LEA digits.

## Code Layout
- Canonical directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- Implementation files:
  - `src/components/admin/CRMAdmissionsModule.tsx`
  - `src/components/admin/LeadPaymentModal.tsx`
  - `src/components/admin/AdminLedgerModule.tsx`
  - `src/components/AdminDashboard.tsx`
  - `server.ts` (optional backend webhook enrichment if applicable)
