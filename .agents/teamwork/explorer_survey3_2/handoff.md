# Handoff Report: R2 — Sidebar & UI Consolidation for Finance & Accounting

**Agent ID**: `explorer_survey3_2` (Survey Explorer 2)  
**Parent Agent**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Mission**: Investigate Requirement 2 (R2) — Sidebar & UI Consolidation for Finance & Accounting (3 main tabs, redirect routing, and Admin Module UI compliance).

---

## 1. Observation

### 1.1 Current Sidebar Navigation & Registered Tabs
- **File**: `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
  - Lines 2434–2444:
    ```typescript
    {
      id: 'finance_group',
      label: 'Tài chính & Kế toán',
      icon: Wallet,
      items: [
        { id: 'ledger', label: 'Sổ cái Thu / Chi', icon: CreditCard },
        { id: 'sepay_reconcile', label: 'Đối soát SePay', icon: ArrowLeftRight },
        { id: 'receivables', label: 'Quản lý Công nợ', icon: FileSpreadsheet },
        { id: 'cashflow', label: 'Báo cáo Dòng tiền', icon: TrendingUp },
        { id: 'misa', label: 'Đối soát MISA', icon: FileText },
      ]
    },
    ```
  - Lines 6189–6227:
    - `activeTab === 'sepay' && sepayContent`
    - `activeTab === 'sepay_reconcile' && sepayReconcileContent`
    - `activeTab === 'ledger' && <AdminLedgerModule students={students} crmLeads={crmLeads} initialData={b2bTabExtraData['ledger']} initialSubTab="ledger" hideSubTabs={true} />`
    - `activeTab === 'receivables' && <AdminLedgerModule students={students} crmLeads={crmLeads} initialData={b2bTabExtraData['receivables']} initialSubTab="receivables" hideSubTabs={true} />`
    - `activeTab === 'cashflow' && <AdminLedgerModule students={students} crmLeads={crmLeads} initialData={b2bTabExtraData['cashflow']} initialSubTab="summary" hideSubTabs={true} />`
    - `activeTab === 'misa' && <AdminLedgerModule students={students} crmLeads={crmLeads} initialData={b2bTabExtraData['misa']} initialSubTab="misa_export" hideSubTabs={true} />`
    - `activeTab === 'finance' && financeContent`
- **File**: `De_Vuong_Webapp/src/components/admin/adminModuleRegistry.ts`
  - Lines 1–5: `ADMIN_TAB_IDS` contains `'sepay', 'finance', 'ledger', 'sepay_reconcile', 'receivables', 'cashflow', 'misa'`.
  - Lines 36–45:
    - `sepay: { label: 'Phiếu thu Học phí', group: 'business', lifecycle: 'live' }`
    - `ledger: { label: 'Sổ cái Thu / Chi', group: 'finance', lifecycle: 'live' }`
    - `sepay_reconcile: { label: 'Đối soát SePay', group: 'finance', lifecycle: 'live' }`
    - `receivables: { label: 'Quản lý Công nợ', group: 'finance', lifecycle: 'live' }`
    - `cashflow: { label: 'Báo cáo Dòng tiền', group: 'finance', lifecycle: 'live' }`
    - `misa: { label: 'Đối soát MISA', group: 'finance', lifecycle: 'live' }`
    - `finance: { label: 'Quản trị Dòng tiền', group: 'finance', lifecycle: 'live' }`

### 1.2 Existing Legacy Tab Redirect Precedent
- **File**: `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
  - Lines 1213–1253:
    ```typescript
    const rawUrlTab = searchParams.get('tab');
    const urlTab = rawUrlTab === 'deals' ? 'leads' : rawUrlTab;
    const storedTab = typeof window !== 'undefined' ? localStorage.getItem('admin_active_tab') : null;
    const effectiveStoredTab = storedTab === 'deals' ? 'leads' : storedTab;
    ...
    useEffect(() => {
      if (rawUrlTab === 'deals') {
        setActiveTab('leads');
        return;
      }
      if (urlTab && (ADMIN_TAB_IDS as readonly string[]).includes(urlTab) && urlTab !== activeTab) {
        setActiveTabState(urlTab as AdminTabId);
      }
    }, [rawUrlTab, urlTab, activeTab, setActiveTab]);
    ```

### 1.3 Module Structure & Current Deficiencies
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - Lines 346–356:
    ```typescript
    const FINANCE_TABS: {
      id: "ledger" | "receivables" | "summary" | "misa_export" | "student_report" | "goals";
      label: string;
    }[] = [
      { id: "ledger", label: "Sổ cái Thu/Chi" },
      { id: "receivables", label: "Công nợ Hợp đồng" },
      { id: "summary", label: "Báo cáo Dòng tiền" },
      { id: "misa_export", label: "Đối soát MISA" },
      { id: "student_report", label: "Học viên" },
      { id: "goals", label: "Mục tiêu" },
    ];
    ```
  - Lines 868–909: `summaryData` calculates expected revenue from `tx.type === "expected_revenue"` inside `ledger_transactions`, which violates R1/R2 requirement to compute expected revenue from real outstanding debt (B2B + B2C) and exclude test transactions.
  - Lines 1879–2025 (`receivables` sub-tab): Only renders B2B Contract milestones (`contracts`). B2C student debt (`crm_records` tuition - paidAmount > 0) is entirely absent.
  - Line 2005: Raw action button `<button ...>Thu tiền</button>` on contract milestone row, violating AGENTS.md Rule 1.
  - Lines 2055–2079 (`misa_export` sub-tab): Table header lacks an action menu column (`<th></th>`), violating AGENTS.md Rule 1.
- **File**: `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx`
  - Lines 49–67: `sepayTab` has `'create'` (redundant VietQR creation sub-tab), `'collection'` (order collection history), `'overview'`, `'transactions'` (SePay bank feed events).
  - Lines 1464–1488: Row action menu on SePay transactions only has view detail and copy functions; lacks actions to "Gán hồ sơ LEA / LRN / B2B" and "Đánh dấu giao dịch test / bỏ qua".
- **File**: `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx`
  - Lines 11–46 & 89–150: Already implements dynamic VietQR generation for both `lead` and `student`, calculates net unpaid debt from ledger, and generates real-time SePay QR. Can be directly reused for B2C debt collection triggers.
- **File**: `De_Vuong_Webapp/src/App.tsx`
  - Lines 238–244: Missing `<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />`. Direct navigation to `/admin?tab=...` falls through to wildcard `<Route path="*" element={<NotFound />} />`.

### 1.4 Test & Build Health
- Test execution: `cd De_Vuong_Webapp; npm test -- tests/admissionsDebtSync.test.ts`
  - Result: 23 passed, 0 failed, duration 1.83s.
- Build execution: `cd De_Vuong_Webapp; npm run build`
  - Result: `✓ built in 14.62s`, exit code 0, zero compilation or bundle errors.

---

## 2. Logic Chain

1. **Sidebar Menu Consolidation (Observation 1.1)**:
   - Observation 1.1 shows that under `finance_group` there are currently 5 items: `ledger`, `sepay_reconcile`, `receivables`, `cashflow`, `misa`.
   - Requirement 2 mandates consolidating to exactly 3 main tabs:
     1. "Sổ cái & Đối soát" (`id: 'ledger'`)
     2. "Quản lý Công nợ" (`id: 'receivables'`)
     3. "Báo cáo Dòng tiền" (`id: 'cashflow'`)
   - Removing `sepay_reconcile` and `misa` from the sidebar group directly reduces the items from 5 to 3 without breaking internal tab ID keys.

2. **Backward-Compatible URL Redirection (Observations 1.1, 1.2, 1.3)**:
   - External links and existing bookmarks use `tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, and `tab=finance`.
   - By creating a redirect dictionary in `AdminDashboard.tsx`:
     ```typescript
     const LEGACY_TAB_REDIRECTS: Record<string, { tab: AdminTabId; sub?: string }> = {
       deals: { tab: 'leads' },
       misa: { tab: 'ledger', sub: 'misa' },
       sepay_reconcile: { tab: 'ledger', sub: 'reconcile' },
       sepay: { tab: 'ledger', sub: 'reconcile' },
       finance: { tab: 'ledger', sub: 'ledger' },
     };
     ```
   - And updating `resolveAdminTab` in `adminModuleRegistry.ts` to map `misa`, `sepay_reconcile`, `sepay`, `finance` -> `ledger`.
   - And adding `<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />` in `App.tsx`:
   - Every legacy link will immediately redirect to the correct consolidated tab and sub-tab while preserving existing query parameters (`search`, `q`, etc.), avoiding white screens or 404 errors.

3. **Tab 1: "Sổ cái & Đối soát" Integration (Observations 1.1, 1.3)**:
   - R2 requires integrating: (a) Official General Ledger with MISA status, period/status filter, CSV export, mark as accounted; (b) SePay Bank Feed Reconcile queue (unmatched transactions, assign LEA/LRN/B2B or mark test/ignore; duplicate VietQR generator sub-tab removed); (c) Read-only raw Bank Feed history.
   - In `AdminLedgerModule.tsx`, the sub-tabs should be structured as:
     1. `ledger`: "Sổ cái Thu / Chi" (Official confirmed transactions, MISA status dot, MISA filter dropdowns, CSV export button, row action to mark accounted).
     2. `reconcile`: "Hàng đợi Đối soát SePay" (Unmatched transactions from `sepay_bank_events`, action to assign to CRM Lead LEA or B2B Contract, or mark as test `SP111111...` / ignore).
     3. `bank_feed`: "Lịch sử Bank Feed" (Read-only list of raw bank events from SePay webhook).
   - This eliminates the standalone `tab=misa` and `tab=sepay_reconcile` and unifies the entire reconciliation workflow.

4. **Tab 2: "Quản lý Công nợ" Integration (Observations 1.3, 1.4)**:
   - Currently, `AdminLedgerModule`'s `receivables` sub-tab only contains B2B contract milestones.
   - B2C student debt (where `tuition - paidAmount > 0`) is tracked in CRM leads and student payments.
   - Tab 2 must provide 2 sub-tabs (or clear segmented sections):
     1. `b2b_debt`: "Công nợ Doanh nghiệp (B2B)" — Contract milestones, KPI cards, due dates, overdue indicators.
     2. `b2c_debt`: "Công nợ Học viên (B2C)" — Table of students with outstanding tuition (`tuition - paidAmount > 0`), displaying LEA/LRN code, learner name, course/class, tuition, paid, debt balance.
   - For collection actions: Clicking "Thu tiền" on B2C debt triggers `LeadPaymentModal` (Observation 1.3) with dynamic VietQR for instant SePay collection. Clicking "Thu tiền" on B2B debt triggers milestone payment recording modal. Both must be housed inside the 3-dot `MoreVertical` action menu per AGENTS.md Rule 1.

5. **Tab 3: "Báo cáo Dòng tiền" Integration (Observation 1.3)**:
   - Observation 1.3 shows `summaryData` in `AdminLedgerModule.tsx` was summing `expected_revenue` from ledger transactions.
   - Under R1/R2, `expected_revenue` records are excluded from `ledger_transactions`.
   - Tab 3 must compute:
     - **Net Revenue (Tổng thu thực)** = Sum of `credit` for non-test transactions (`!tx.isTest` and not `SP111111...`) from `ledger_transactions`.
     - **Total Expense (Tổng chi thực)** = Sum of `debit` from `ledger_transactions`.
     - **Net Profit (Lợi nhuận)** = Net Revenue - Total Expense.
     - **Expected Revenue (Dự thu)** = Sum of actual B2B outstanding debt (unpaid contract milestones) + actual B2C outstanding debt (`tuition - paidAmount > 0`).

6. **Admin Module UI Standards Compliance (Observations 1.1, 1.3)**:
   - **Action Menu (Rule 1)**: All tables across the 3 tabs must place actions inside `AdminRowActions` (`MoreVertical`), with an empty rightmost `<th>` (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`). Remove bare buttons (`<button>Thu tiền</button>`) from the table rows.
   - **Freeze Panes (Rule 2)**: All `<th>` elements must have `sticky top-0 z-20 bg-white`.
   - **Code Anchoring & Anti-Pill (Rule 3 & 4)**: Display all IDs (`LEA-*`, `LRN-*`, `SP*`, `REC-*`, `PAY-*`, `CTR-*`) as `font-mono text-xs font-semibold text-slate-700` plain text without pill backgrounds or borders.
   - **Single-Row Fixed Toolbar (Rule 5, 6, 12)**: `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">` with search (`x` button) and max 2–3 `AdminFilterDropdown` components. No standalone "Xóa lọc" button.
   - **Full-Bleed Layout (Rule 14)**: Frame class `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.

---

## 3. Caveats

1. **SePay Bank Events Collection**: `sepay_bank_events` collection structure was reviewed in client code and test files. If the implementer embeds `SepayReconciliationModule` views into `AdminLedgerModule`, they can either pass existing subscriptions or instantiate a clean listener for `sepay_bank_events`.
2. **Permission Roles**: The sidebar menu is accessible to users with the `admin` role. No role changes are needed for R2.
3. **No Database Writes during UI Survey**: In accordance with the Explorer archetype, no database writes or code edits were performed during this investigation.

---

## 4. Conclusion

The consolidation of the Finance & Accounting subsystem to exactly 3 main tabs is completely feasible, architecturally sound, and directly supported by existing components:

| Target Main Tab | Tab ID | Sub-tabs | Source Modules & Key Features |
|---|---|---|---|
| **Sổ cái & Đối soát** | `ledger` | 1. Sổ cái Thu/Chi (`ledger`)<br>2. Hàng đợi Đối soát (`reconcile`)<br>3. Lịch sử Bank Feed (`bank_feed`) | Merges `AdminLedgerModule` + `SepayReconciliationModule` (minus duplicate QR generator). Adds MISA dot status & filters, CSV export, mark accounted action. |
| **Quản lý Công nợ** | `receivables` | 1. Công nợ B2B (`b2b_debt`)<br>2. Công nợ B2C (`b2c_debt`) | Merges contract milestones receivables from `AdminLedgerModule` with CRM student debt from `crm_records` & `LeadPaymentModal` VietQR trigger. |
| **Báo cáo Dòng tiền** | `cashflow` | 1. Tổng quan Dòng tiền<br>2. Bảng theo Năm/Tháng | Cleans `summaryData` to calculate Net Revenue, Expense, Profit from actual ledger (excluding test transactions `SP111111...`) and Expected Revenue from real B2B + B2C debt. |

### Legacy URL Redirect Specification

```typescript
// Add to AdminDashboard.tsx and resolveAdminTab
const LEGACY_TAB_REDIRECTS: Record<string, { tab: AdminTabId; sub?: string }> = {
  deals: { tab: 'leads' },
  misa: { tab: 'ledger', sub: 'misa' },
  sepay_reconcile: { tab: 'ledger', sub: 'reconcile' },
  sepay: { tab: 'ledger', sub: 'reconcile' },
  finance: { tab: 'ledger', sub: 'ledger' },
};
```
Plus in `App.tsx`:
```tsx
<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
```

### Required UI Fixes for 100% AGENTS.md Compliance
1. Replace raw `<button>Thu tiền</button>` on contract receivables rows with `AdminRowActions` (`MoreVertical`) dropdown.
2. Add empty `<th>` and `AdminRowActions` to MISA export table.
3. Ensure all business codes (`LEA-*`, `LRN-*`, `SP*`, `REC-*`, etc.) use `font-mono text-xs font-semibold text-slate-700` plain text without pill/badge wrapper.
4. Ensure all table containers use `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden` and `<th>` has `sticky top-0 z-20 bg-white`.

---

## 5. Verification Method

To verify the implementation independently:

1. **Verify Sidebar Menu Count**:
   - Inspect `menuGroups` in `AdminDashboard.tsx` under `id: 'finance_group'`: exactly 3 items must be present (`ledger`, `receivables`, `cashflow`).
2. **Verify Legacy Redirects**:
   - Navigate to `/admin/dashboard?tab=misa` $\rightarrow$ should redirect to `tab=ledger&sub=misa` (no 404, no blank screen).
   - Navigate to `/admin/dashboard?tab=sepay_reconcile` $\rightarrow$ should redirect to `tab=ledger&sub=reconcile`.
   - Navigate to `/admin/dashboard?tab=sepay&search=SP123` $\rightarrow$ should redirect to `tab=ledger&sub=reconcile&search=SP123`.
   - Navigate to `/admin/dashboard?tab=finance` $\rightarrow$ should redirect to `tab=ledger`.
   - Navigate to `/admin` $\rightarrow$ should redirect to `/admin/dashboard`.
3. **Verify Admin Module UI Compliance**:
   - Inspect all table headers in the 3 tabs: rightmost `<th>` must be empty (`<th ...></th>`), with no text "Thao tác" or "Hành động".
   - Inspect action buttons on table rows: must use `AdminRowActions` with `MoreVertical`, no naked buttons.
   - Inspect ID columns: font-mono text without pill or border classes.
   - Inspect table scroll behavior: header remains fixed (`sticky top-0 z-20 bg-white`).
4. **Automated Test Command**:
   ```bash
   cd De_Vuong_Webapp
   npm test -- tests/admissionsDebtSync.test.ts
   ```
   Must pass 100% (23/23 tests).
5. **Production Build Command**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
   Must compile cleanly in Vite with zero TypeScript or bundle errors.
