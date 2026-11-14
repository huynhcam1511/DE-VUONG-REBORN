# Handoff Report: AGENTS.md Compliance & Build Verification for CRM Admissions Extension

- **Agent**: Explorer 3 (`teamwork_explorer`)
- **Recipient**: Orchestrator (`08099f55-bb2b-4fd9-835b-93c0480cae41`)
- **Date**: 2026-11-14
- **Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_3\`
- **Related Analysis**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_3\analysis.md`

---

## 1. Observation

1. **Build Baseline**:
   - Command: `cd De_Vuong_Webapp && npm run build`
   - Output: `✓ built in 10.97s`, exit code `0`. Production asset bundling passes completely.
2. **Test Baseline**:
   - Command: `cd De_Vuong_Webapp && npm test`
   - Output: `ℹ tests 28, ℹ pass 28, ℹ fail 0`, exit code `0`. All 28 tests pass in 2.33s.
3. **Typecheck Baseline**:
   - Command: `cd De_Vuong_Webapp && npm run lint` (`tsc --noEmit`)
   - Output: Exited with code `1`. Isolated pre-existing TypeScript errors exist in `ClassDetail.tsx`, `StudentPortal.tsx`, `ExamTakingPage.tsx`, and `CRMAdmissionsModule.tsx`.
   - In `CRMAdmissionsModule.tsx`, two trivial pre-existing typing bugs were observed:
     - Lines 2600 & 2623: `Cannot find name 'updateDoc'` (missing `updateDoc` import from `firebase/firestore`).
     - Line 4540: `Cannot find name 'formExpectedStartDate'` (typo for `formStartDate`).
4. **CRMAdmissionsModule.tsx Structure**:
   - Total file size: 7,207 lines.
   - `CRMRecord` is defined on line 656 and is exclusively defined inside `CRMAdmissionsModule.tsx`.
   - Persistence occurs on line 3511 via `setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true })` and `setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true })`, along with `localStorage` (`katc_custom_crm_records`, `katc_crm_overrides`).
   - Merging logic in `mergeCRMRecord` (line 2761) explicitly enumerates mapped keys; any new field added to `CRMRecord` MUST be included in `mergeCRMRecord` to prevent Firestore real-time snapshot sync from dropping the values.
5. **AGENTS.md Admin Module UI Standards Alignment**:
   - **Rule 1 (Accidental Clicks)**: Table headers on line 6597 have empty action column `<th className="sticky top-0 z-20 bg-white w-14 px-3 py-2.5 text-right whitespace-nowrap"></th>`. Master table rows (line 6657) have no `onClick`. Action operations are encapsulated in `AdminRowActions` (`MoreVertical`).
   - **Rule 2 (Freeze Panes)**: `<th>` sticky top-0 z-20 bg-white; table container `h-full overflow-auto`; fullpage detail view has sticky header `sticky top-0 z-30` and body `flex-1 min-h-0 overflow-y-auto`.
   - **Rule 3 (Business Record IDs)**: Pure plain text `font-mono text-xs font-semibold text-slate-700` (`LEA-XXXXXXXX`), never wrapped in badge/pill.
   - **Rule 4 (Visuals & Anti-Pill Overload)**: Plain text preferred over candy badges; status uses dot indicator `<span className="w-1.5 h-1.5 rounded-full ..."/>`.
   - **Rule 5, 6, 12 (Toolbar & Filters)**: Single-row toolbar, `AdminFilterDropdown` popover filters, sorting on `<th>`.
   - **Rule 11 (Dropdown Chevrons)**: Native selects avoid exposed arrows, using `AdminSaaSSelect` or styled inputs.
   - **Rule 13 (Persistence)**: Full Firestore write via `setDoc` with `removeUndefinedFields`.
   - **Rule 14 (Full-Bleed)**: `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.

---

## 2. Logic Chain

1. **Step 1: Identifying Integration Point**:
   - The user request requires "Phí nhận lớp" and "Phí chênh lệch hàng tháng" in `CRMAdmissionsModule.tsx`.
   - The Detail Form view (lines 4382-5712) currently manages financial parameters in Section 2 (lines 5079-5144), specifically `formTuition` ("Học phí dự kiến (VNĐ)").
   - Therefore, "Phí nhận lớp" should be placed adjacent to "Học phí dự kiến", and "Phí chênh lệch hàng tháng" should be placed immediately below as a dynamic monthly sub-table.
2. **Step 2: Deriving the Monthly List Structure**:
   - Default state must start with Month 1 ("Tháng 1") containing an amount input and a reconciliation note ("ghi chú đối soát").
   - A `(+) Thêm tháng` button appends next months (Tháng 2, Tháng 3...), and a trash button removes entries.
   - The existing pattern in `CRMAdmissionsModule.tsx` for dynamic lists (such as `formTrainingPackages`, lines 5550-5705, and `formB2CDemandItems`, lines 5007-5047) provides the exact proven UX model.
3. **Step 3: Deriving Calculation & Reactive Formatting**:
   - Number inputs must format using `(parseInt(val.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN')` with suffix `₫`, matching `formTuition` (lines 5133-5141).
   - Reactive calculation:
     - `Tuition = Number(String(formTuition).replace(/\D/g, '')) || 0`
     - `ClassIntakeFee = Number(String(formClassIntakeFee).replace(/\D/g, '')) || 0`
     - `TotalCommission = sum(monthlyCommissions.map(m => Number(String(m.amount).replace(/\D/g, '')) || 0))`
     - `NetCashflow = Tuition - ClassIntakeFee - TotalCommission`
4. **Step 4: Ensuring Persistence Integrity**:
   - Because `mergeCRMRecord` reconstructs objects field-by-field, omitting the new fields in `mergeCRMRecord` would cause data to disappear when Firestore listeners trigger.
   - Thus, Worker must map `classIntakeFee` and `monthlyCommissions` in:
     a) `CRMRecord` interface.
     b) `handleOpenCreateForm` (defaults to Tháng 1).
     c) `handleOpenEditForm` (loads existing values).
     d) `handleSaveForm` (saves to state and calls `setDoc` on both `customer_profiles` and `crm_records`).
     e) `mergeCRMRecord` (preserves values during snapshot merge).

---

## 3. Caveats

1. **Global TypeScript Baseline**: `npm run lint` (`tsc --noEmit`) currently fails across the whole repo due to pre-existing errors in other components (`ClassDetail.tsx`, etc.). The Worker should focus on ensuring `CRMAdmissionsModule.tsx` is completely type-safe and does not add new compile errors.
2. **Empty Seeds Default**: Per Rule 25, `defaultSeedCRMRecords` is empty. The form and table must function seamlessly when starting from an empty state without relying on hardcoded mock fallback items.

---

## 4. Conclusion

- The codebase is ready for Worker implementation.
- All AGENTS.md rules have clear precedent and established patterns in `CRMAdmissionsModule.tsx`.
- The implementation guardrails provided in `analysis.md` ensure full compliance, data persistence, and build stability.

---

## 5. Verification Method

To independently verify the baseline and future worker changes:
1. **Build Verification**:
   ```bash
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm run build
   ```
   Must exit with code `0`.
2. **Unit Test Verification**:
   ```bash
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm test
   ```
   Must exit with code `0` and 28+ passed tests.
3. **Module Typecheck Verification**:
   ```powershell
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npx tsc --noEmit | Select-String "CRMAdmissionsModule.tsx"
   ```
   Confirm zero new errors in `CRMAdmissionsModule.tsx`.
4. **Inspect Files**:
   - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
   - `.agents/teamwork/explorer_crm_3/analysis.md`
