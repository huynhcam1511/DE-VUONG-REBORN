# Scope & Plan: CRM Admissions Fee & Commission Extension

## Scope
- Target Module: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- Related Types: `CRMRecord` and `MonthlyCommissionItem`
- Persistence: Firestore dual sync (`crm_records` & `customer_profiles`) and local React state
- Compliance: Full compliance with `AGENTS.md` Admin Module UI Standards

## Requirements Breakdown & Status
- **R1: Input Fields & Dynamic Month List** — **DONE**
  - "Phí nhận lớp": Currency input with thousands separator formatting (`SaaSCurrencyInput`, anti-cursor jump).
  - "Phí chênh lệch hàng tháng" (Monthly commission):
    - Default includes Month 1 ("Tháng 1") with amount input and reconciliation note ("ghi chú đối soát").
    - (+) button dynamically adds Month 2, Month 3...
    - Remove button with sequential re-index and fallback clear on single item.
  - UI integration strictly adhering to AGENTS.md (clean typography, no pill overload).
- **R2: Automated Financial Calculations** — **DONE**
  - Total Monthly Commission = sum of all monthly difference/commission entries.
  - Net Cashflow ("Dòng tiền thực nhận") = Tuition Fee - "Phí nhận lớp" - Total Monthly Commission.
  - Instant reactive updates via `useMemo` on every keystroke.
  - 4-metric Cashflow Summary Banner in form view & subtle clean secondary plain text in Master Table Tuition column.
- **R3: Persistence & Schema Sync** — **DONE**
  - `CRMRecord` interface extended with `classIntakeFee?: number` and `monthlyCommissions?: MonthlyCommissionItem[]`.
  - Stored permanently in both `customer_profiles` and `crm_records` via `setDoc(..., { merge: true })` with `removeUndefinedFields`.
  - Mapped in `latestCrmDocs`, `latestProfileDocs`, `mergeCRMRecord`, and `handleDuplicateRecord` (deep clone).
- **R4: Quality & Build** — **DONE**
  - 0 new TypeScript compiler errors.
  - Unit tests: 28/28 regression tests + 36/36 adversarial tests passed (exit code 0).
  - Production build: `npm run build` completed successfully in ~19s (exit code 0).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CRM Admissions Fee Extension | `CRMAdmissionsModule.tsx` | none | **DONE** |
