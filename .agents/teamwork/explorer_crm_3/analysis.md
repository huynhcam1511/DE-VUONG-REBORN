# Technical Analysis: AGENTS.md Compliance, UI Standards & Build Verification for CRM Admissions Extension

- **Project**: CRM Admissions Fee & Commission Extension
- **Target Component**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Related Types**: `CRMRecord`, `MonthlyCommissionItem`
- **Investigator**: Explorer 3 (`teamwork_explorer`)
- **Date**: 2026-11-14

---

## 1. Executive Summary

This exploration evaluates `AGENTS.md` Admin Module UI Standards, analyzes `CRMAdmissionsModule.tsx` architectural structure and integration points, and assesses the repository build/test baseline in `De_Vuong_Webapp/`.

### Key Findings
1. **Production Build Baseline**: `npm run build` (`vite build`) completes with **Exit Code 0** in ~11 seconds. Production bundling succeeds cleanly.
2. **Unit Test Baseline**: `npm test` runs 28 unit tests and all **28 pass with Exit Code 0** in 2.3 seconds.
3. **Typecheck (`tsc --noEmit`) Baseline**: `npm run lint` fails with Exit Code 1 due to pre-existing TypeScript issues across multiple legacy files (`ClassDetail.tsx`, `StudentPortal.tsx`, `ExamTakingPage.tsx`). Inside `CRMAdmissionsModule.tsx`, there are isolated pre-existing typing gaps (e.g., missing `updateDoc` import on line 31, typo `formExpectedStartDate` on line 4540). The Worker must introduce zero new type errors and should resolve the typing in `CRMAdmissionsModule.tsx`.
4. **AGENTS.md Compliance in CRMAdmissionsModule.tsx**: The module already strictly adheres to Rules 1, 2, 3, 4, 5, 6, 8, 12, 13, and 14 in its master table and full-page detail view. New inputs and calculation summaries must strictly inherit these patterns.

---

## 2. AGENTS.md Compliance Standards & Audit Checklist

The following rules from `AGENTS.md` directly apply to the CRM Admissions Fee & Commission Extension:

| AGENTS.md Rule | Standard Requirement | Implementation in CRMAdmissionsModule | Worker Guardrails |
|---|---|---|---|
| **Rule 1: Action Menu & Anti-Accidental Click** | Row and data cells (`<tr>`, `<td>`) must be plain text with NO `onClick`. Operations only via 3-dot `MoreVertical` (`AdminRowActions`). `<th>` for action column must be empty with no text label. | Master table lines 6597 (`<th className="sticky top-0 z-20 bg-white w-14 ..."></th>`) and 6657 (`<tr key={rec.id} ...>`) follow this. | Do NOT add click events on row cells. In detail view, use standard button actions (`Save`, `Quay lại`). |
| **Rule 2: Freeze Panes** | Table header (`<th>`) sticky top-0 z-20 bg-white. Module body `flex-1 min-h-0 overflow-y-auto`. | Table uses `sticky top-0 z-20 bg-white`. Detail view uses sticky header `sticky top-0 z-30 bg-white border-b px-5 py-3` with independent scroll body `flex-1 min-h-0 overflow-y-auto`. | Maintain sticky header and independent scrolling container in detail form. |
| **Rule 3: Business Record IDs** | Business IDs (`LEA-XXXXXXXX`) must be displayed in `font-mono text-xs font-semibold text-slate-700`. Strictly NEVER wrap in colored or gray bordered badges/pills. Code-anchoring must be strict. | Lines 4405, 6053, 6663 display `LEA-XXXXXXXX` using pure plain text `font-mono text-xs font-semibold text-slate-700`. | Any ID references must remain plain text font-mono, no pill wrapping. |
| **Rule 4: Visuals, Hover, Typography & Anti-Pill Overload** | Typography hierarchy: Headline 24px (`text-2xl`), Section 16px/12px uppercase (`text-xs font-semibold uppercase tracking-wider text-slate-700`), Body/Input 14px/12px (`text-xs font-medium text-slate-800`), Buttons 12px/14px (`text-xs font-bold`). Operational status must use dot indicator (`<span className="w-1.5 h-1.5 rounded-full ..."/>`), never heavy pills. Plain text preferred. | Form uses `text-xs font-semibold text-slate-700 mb-1` for labels, `h-9 rounded-lg border border-slate-200 text-xs` for inputs. Status uses dot indicator (lines 4430-4437). | Format financial numbers with `toLocaleString('vi-VN')` and subtle font-mono styling (`font-mono text-xs font-semibold text-emerald-700`). Do not wrap financial totals in heavy pill badges. |
| **Rule 5: Module Header / Toolbar Layout** | Single-row layout, sticky top-0, no large `<h1>` or descriptive `<p>`. | Desktop toolbar lines 6181-6279 uses single-row `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">`. | Do not alter toolbar into multi-row or inject extraneous headings. |
| **Rule 6 & 12: Notion/Linear Filter Popovers & Column Sorting** | Filters must use `AdminFilterDropdown` on toolbar with fixed button width and built-in `x` clear button. Sorting directly on `<th>`. No native `<select>` on toolbar. | Lines 6208-6232 use `AdminFilterDropdown` for Kind, Source, Status. Table `<th>` lines 6515-6596 have `onClick={() => handleSort(...)}`. | Filters remain on toolbar; column sorting remains on `<th>`. |
| **Rule 8: Detail View Layout** | When editing/viewing detail, control bar must be sticky top-0 with Back button (`ChevronLeft`), Record ID in font-mono (no pill), Save button, and Status. | Lines 4386-4452 implement this exact structure. | Keep the Detail Header intact when saving new fields. |
| **Rule 11: Select/Input Dropdown Chevrons** | Native `<select>` arrows must be hidden (`appearance-none`) and replaced with custom SVG chevron with 10px right padding (`right-2.5`), or use `AdminSaaSSelect`. | Lines 5083, 5112 use `AdminSaaSSelect` portal popover. | If select elements are needed, use `AdminSaaSSelect`. |
| **Rule 13: Firestore / API Persistence** | Changes must persist to database (Firestore), not just React local state (`useState`). | Lines 3511-3520 write to Firestore `customer_profiles` and `crm_records` via `setDoc(doc(db, ...), docPayload, { merge: true })` and `localStorage` (`katc_custom_crm_records`, `katc_crm_overrides`). | `classIntakeFee` and `monthlyCommissions` must be saved to Firestore and local state, and correctly merged in `mergeCRMRecord`. |
| **Rule 14: Full-Bleed Layout** | Edge-to-edge layout without wrapping in floating card with `p-5 bg-slate-50 border shadow`. Container class: `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`. | Container on line 4384 & line 6176 use `flex h-full min-h-0 w-full flex-col overflow-hidden bg-white`. | Maintain full-bleed edge-to-edge layout. |
| **Rule 25: Zero Hardcoded Seed & Code Immutability** | No fake mock seed data generation. Code/ID immutability. | Lines 857: `defaultSeedCRMRecords: CRMRecord[] = []`. Empty seeds by default. | Do not add mock customer seed data. |

---

## 3. Architecture & Data Flow in CRMAdmissionsModule.tsx

### 3.1 Type Definitions (Line 656)
`CRMRecord` is defined inside `CRMAdmissionsModule.tsx`:
```ts
export type MonthlyCommissionItem = {
  month: number;
  amount: number | string;
  note?: string;
};

export type CRMRecord = {
  id: string | number;
  code?: string;
  // ... other fields ...
  tuition?: string;
  classIntakeFee?: number | string; // Phí nhận lớp
  monthlyCommissions?: MonthlyCommissionItem[]; // Danh sách phí chênh lệch hàng tháng
  // ...
};
```

### 3.2 State Variables Needed
Inside `CRMAdmissionsModule` component:
- `formClassIntakeFee`: string (holds raw digits or formatted string, e.g. `'1000000'`)
- `formMonthlyCommissions`: array of `MonthlyCommissionItem` (defaults to `[{ month: 1, amount: '', note: '' }]`)

### 3.3 Form Lifecycle Methods
1. **Creation Reset (`handleOpenCreateForm`, line 3122)**:
   - `setFormClassIntakeFee('')`
   - `setFormMonthlyCommissions([{ month: 1, amount: '', note: '' }])`
2. **Edit Initialization (`handleOpenEditForm`, line 3175)**:
   - `setFormClassIntakeFee(rec.classIntakeFee !== undefined ? String(rec.classIntakeFee) : '')`
   - `setFormMonthlyCommissions(rec.monthlyCommissions && rec.monthlyCommissions.length > 0 ? rec.monthlyCommissions : [{ month: 1, amount: '', note: '' }])`
3. **Record Duplication (`handleDuplicateRecord`, line 3920)**:
   - Uses shallow copy `...rec`, which will automatically copy `classIntakeFee` and `monthlyCommissions`.
4. **Snapshot Sync & Merging (`mergeCRMRecord`, line 2761)**:
   - **CRITICAL**: Lines 2789-2830 explicitly enumerate merged fields. Must include:
     ```ts
     classIntakeFee: incoming.classIntakeFee !== undefined ? incoming.classIntakeFee : existing.classIntakeFee,
     monthlyCommissions: (incoming.monthlyCommissions && incoming.monthlyCommissions.length > 0) ? incoming.monthlyCommissions : existing.monthlyCommissions,
     ```
     Omitting this would cause real-time snapshot syncs to drop these fields on update!
5. **Form Save (`handleSaveForm`, line 3335)**:
   - Add to `updated: CRMRecord`:
     ```ts
     classIntakeFee: formClassIntakeFee ? Number(String(formClassIntakeFee).replace(/\D/g, '')) : undefined,
     monthlyCommissions: formMonthlyCommissions.filter(c => Number(String(c.amount).replace(/\D/g, '')) > 0 || c.note?.trim()),
     ```
   - Persist to both Firestore `customer_profiles` & `crm_records` via `setDoc` with `removeUndefinedFields`.
   - Update local state and `persistCustomRecords`.

### 3.4 Financial Calculation Logic (R2)
All financial calculations must be reactive and instant:
```ts
const tuitionValue = Number(String(formTuition || '').replace(/\D/g, '')) || 0;
const classIntakeFeeValue = Number(String(formClassIntakeFee || '').replace(/\D/g, '')) || 0;
const totalMonthlyCommission = formMonthlyCommissions.reduce((sum, item) => {
  const amt = Number(String(item.amount || '').replace(/\D/g, '')) || 0;
  return sum + amt;
}, 0);
const netCashflow = tuitionValue - classIntakeFeeValue - totalMonthlyCommission;
```

---

## 4. UI Design & Placement Specification

### 4.1 Detail Form View Placement
The optimal location is in **Section 2: Kế hoạch & Thông tin tư vấn** (around lines 5130-5144), where `formTuition` ("Học phí dự kiến") is located:
- Place "Phí nhận lớp (VNĐ)" directly adjacent to "Học phí dự kiến (VNĐ)" in the grid.
- Place "Phí chênh lệch hàng tháng (Hoa hồng định kỳ)" as a clean structured card/table block right below:
  - Header: Label "Phí chênh lệch hàng tháng (Hoa hồng đối soát)", showing count and summary.
  - Rows:
    - Month tag (e.g. `Tháng 1`, `Tháng 2`, `Tháng 3`...)
    - Amount Input: Auto thousands-separated VNĐ input (`toLocaleString('vi-VN')`), with `₫` suffix adornment.
    - Note Input: Placeholder "Ghi chú đối soát (ví dụ: chuyển khoản ngày 5 hàng tháng...)".
    - Delete button (`Trash2` / `X` icon, disabled or hidden if only 1 row or allowed with confirmation).
  - Footer of dynamic list:
    - `(+) Thêm tháng tiếp theo` button (`inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer`).
- Real-time Financial Summary Strip:
  - Clean 3-metric horizontal bar:
    1. **Tổng học phí**: `font-mono text-xs font-semibold text-slate-800`
    2. **Phí nhận lớp + Tổng hoa hồng**: `font-mono text-xs font-semibold text-rose-600`
    3. **Dòng tiền thực nhận**: `font-mono text-xs font-bold text-emerald-700`
  - Style: Clean bordered box `rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex items-center justify-between`, completely free of candy pill overload.

---

## 5. Build, Lint & Test Verification Baseline

### 5.1 Verification Commands Run
```bash
# 1. Production Build:
cd De_Vuong_Webapp && npm run build
# Result: Exit code 0, built in 10.97s, dist/ created cleanly.

# 2. Existing Unit Tests:
cd De_Vuong_Webapp && npm test
# Result: Exit code 0, 28/28 tests passed in 2.32s.

# 3. TypeScript Typecheck:
cd De_Vuong_Webapp && npm run lint  # (tsc --noEmit)
# Result: Exit code 1 due to pre-existing errors in other components.
```

### 5.2 Pre-existing TypeScript Errors in `CRMAdmissionsModule.tsx`
When running `npx tsc --noEmit`, the following pre-existing issues were noted in `CRMAdmissionsModule.tsx`:
1. Line 2600 & 2623: `Cannot find name 'updateDoc'`. (Missing `updateDoc` in `import { ... } from 'firebase/firestore'`).
2. Line 4540: `Cannot find name 'formExpectedStartDate'`. (State variable is named `formStartDate`).
3. Lines 1420, 1719, 1756, 1864, 6808: Comparison with `"expected_revenue"` on `TransactionType`.

**Worker Guidance**:
- Fix item 1 (add `updateDoc` to import from `'firebase/firestore'`) and item 2 (`formStartDate`).
- Ensure all new types (`MonthlyCommissionItem`, `CRMRecord` extension) are 100% type-safe.
- Verify `npm run build` exits with code 0.

---

## 6. Worker Implementation Guardrails Checklist

- [ ] **Data Model**:
  - [ ] Add `MonthlyCommissionItem` type to `CRMAdmissionsModule.tsx`.
  - [ ] Add `classIntakeFee?: number | string` and `monthlyCommissions?: MonthlyCommissionItem[]` to `CRMRecord`.
  - [ ] Update `mergeCRMRecord` to retain `classIntakeFee` and `monthlyCommissions` across snapshot updates.
- [ ] **State & Lifecycle**:
  - [ ] Add `formClassIntakeFee` and `formMonthlyCommissions` state hooks.
  - [ ] Initialize properly in `handleOpenCreateForm` (default Tháng 1).
  - [ ] Populate from record in `handleOpenEditForm`.
  - [ ] Include in `updated` object in `handleSaveForm`.
  - [ ] Write to Firestore `customer_profiles` and `crm_records` using existing `removeUndefinedFields` + `setDoc`.
- [ ] **UI & Formatting**:
  - [ ] Format "Phí nhận lớp" with `toLocaleString('vi-VN')` and strip non-digits on input.
  - [ ] Dynamic monthly list with auto-incrementing month numbers ("Tháng 1", "Tháng 2", ...).
  - [ ] Each monthly entry contains amount input and reconciliation note.
  - [ ] (+) Button adds next month; remove button deletes row.
  - [ ] Reactive calculation of Total Commission and Net Cashflow (`Học phí - Phí nhận lớp - Tổng hoa hồng`).
- [ ] **AGENTS.md Strict Compliance**:
  - [ ] Zero accidental click handlers on master table rows/cells.
  - [ ] Empty `<th className="sticky top-0 z-20 bg-white w-14 ..."></th>` for table action column.
  - [ ] Pure font-mono for numbers and record IDs (`font-mono text-xs font-semibold`).
  - [ ] Anti-pill overload: No candy colored pill wrappers around metrics.
  - [ ] Full-bleed edge-to-edge container styling.
- [ ] **Verification**:
  - [ ] `npm run build` exits with code 0.
  - [ ] `npm test` passes 100%.
  - [ ] Add unit test for the calculation formula and thousands separator formatting.
