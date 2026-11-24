# Project: CRM Admissions Section 3 Restructuring & Student Detail Enhancement (2-Stage Workflow)

## Architecture
- **Application Root**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- **Key Files**:
  - `src/components/admin/CRMAdmissionsModule.tsx`: Stage 1 (Admissions / Initial Intake) - Single Flat Ledger Card for Section 3, fee plan, intake fee toggle, first installment credit, START/NON-START transitions, VAT toggle.
  - `src/components/admin/StudentDetail.tsx`: Stage 2 (Operations / Student Ledger & Debt) - Class reference code (`LG4729`), handover data inheritance (`payments/{studentId}`), fast actions `[+ Thu học phí đợt tiếp theo]` and `[+ Nộp phí chênh lệch trung tâm]`, AGENTS.md table compliance.
  - `src/services/paymentService.ts`: Real-time subscription and transaction management for student payments.
  - `src/services/ledgerService.ts`: General ledger transactions (`ledger_transactions`).
  - `src/services/classService.ts`: Class management and student-class associations.
  - `src/services/userService.ts`: User profiles (`users/{uid}`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Section 3 Single Flat Ledger Card | Replace lines 5697-6143 with single flat card: total tuition, payment plan selector (full, milestones, monthly) | M1 | Survey 1, 3 |
| 2 | Initial Intake Fee & Source Toggle | Initial class fee with toggle: Cash/VCB vs Surplus Fund Offset (`availableSurplusFund`) | M1 | Survey 1, 3 |
| 3 | Initial Installment Credit (Đợt 1) | Record Đợt 1 credit (e.g. 900.000 ₫ or 3.600.000 ₫) cleanly without month 2/3 clutter | M1 | Survey 1, 3 |
| 4 | Decisive Transition Buttons (START & NON-START) | `[★ XẾP VÀO LỚP HỌC (START)]` (initializes class, student profile, payments/{studentId}, updates CRM) and `[✖ NON-START]` (auto refund to surplus fund) | M1 | Survey 1, 3 |
| 5 | Corporate VAT Calculator Toggle | Encapsulate corporate VAT calculator in `[ ] Xuất hóa đơn VAT Doanh nghiệp` checkbox toggle (default false/collapsed) | M1 | Survey 1, 3 |
| 6 | Class Code Anchoring in Student Detail | Render resolved class reference code (`LG4729` / `CLS-xxxx`) on debt card header in plain mono font `font-mono text-xs font-semibold text-slate-700` | M2 | Survey 2, 3 |
| 7 | Admissions Data Handover Inheritance | StudentDetail inherits full Stage 1 financial state: total tuition, Đợt 1 paid amount, remaining debt from `payments/{studentId}` | M2 | Survey 2, 3 |
| 8 | Fast Action: Next Installment Collection | `[+ Thu học phí đợt tiếp theo]` button & modal (milestone 900k or monthly 2.2M) updating `payments` and crediting `ledger_transactions` | M2 | Survey 2, 3 |
| 9 | Fast Action: Center Partner Commission Payment | `[+ Nộp phí chênh lệch trung tâm]` button & modal (e.g. 200k/month for LG4729), auto debiting `ledger_transactions` and logging note | M2 | Survey 2, 3 |
| 10 | AGENTS.md Compliance in StudentDetail | Empty `<th>` for action column, replace naked trash icon with 3-dot `MoreVertical`, plain text + bullet for transaction types, fix hover classes | M2 | Survey 2, 3 |
| 11 | TypeScript Cleanliness in StudentDetail | Fix 3 pre-existing TS errors (`displayName`, `phoneNumber`, `enrolledClasses` -> `fullName`, `phone`, `classIds`) | M2 | Survey 3 |
| 12 | End-to-End Build & Verification Gate | Clean `npm run build` (exit 0) and full integrity audit verification | M3 | Survey 1, 2, 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Milestone 1: CRM Admissions Section 3 Single Flat Ledger Card | Features 1, 2, 3, 4, 5 in `CRMAdmissionsModule.tsx` | none | DONE |
| 2 | Milestone 2: Student Detail Payment & Ledger Enhancement | Features 6, 7, 8, 9, 10, 11 in `StudentDetail.tsx` | M1 | DONE |
| 3 | Milestone 3: End-to-End Verification & Gate | Feature 12: E2E testing, Challenger stress tests, Forensic Audit, Build verification | M1, M2 | DONE |

## Interface Contracts
### Stage 1 (CRM Admissions) ↔ Stage 2 (Student Detail)
1. **Firestore `payments/{studentId}` initialization**:
   - `studentId`: UID of student (`LRN-xxxxxxxx` or `users/{uid}`).
   - `totalAmount`: total tuition (`tuitionTotal`).
   - `paidAmount`: collected initial amount (`initialCollectedAmount`).
   - `debt`: `Math.max(0, totalAmount - paidAmount)`.
   - `transactions`:
     - Giao dịch 1: `{ type: 'debt_recognition', amount: tuitionTotal, note: 'Ghi nhận học phí cam kết (GĐ 1 Tuyển sinh)', refCode: classCode }`
     - Giao dịch 2 (nếu `initialCollectedAmount > 0`): `{ type: 'partial_payment' | 'full_payment', amount: initialCollectedAmount, note: 'Thu học phí đợt 1 (GĐ 1 Tuyển sinh)', refCode: classCode }`
2. **Class Reference Anchoring**:
   - `classCode` on Class object (e.g. `LG4729`).
   - `student.classIds` includes `classId`.
   - StudentDetail resolves `classCode` from `classes.find(c => c.id === student.classIds[0])?.classCode || student.student_code_reference || 'LG4729'`.
3. **General Ledger (`ledger_transactions`) Contract**:
   - Thu học phí: `type: 'payment'`, `credit: amount`, `debit: 0`, `refCode: classCode`.
   - Phí nhận lớp cấn trừ ví: `type: 'class_accept_wallet'`, `debit: intakeFee`, `credit: 0`, `surplus: -intakeFee`.
   - Hoàn phí nhận lớp khi Non-Start: `type: 'class_cancel_surplus'`, `debit: 0`, `credit: 0`, `surplus: +intakeFee`.
   - Nộp phí chênh lệch trung tâm: `type: 'class_accept'`, `debit: commissionAmount`, `credit: 0`, `refCode: classCode`.

## Code Layout
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` — Owned by Worker (M1) [DONE]
- `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` — Owned by Worker (M2) [DONE]
