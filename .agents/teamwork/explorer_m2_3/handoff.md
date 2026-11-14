# Handoff Report: R2 — Design Architecture & Implementation for Tab 2 ("Quản lý Công nợ") and Tab 3 ("Báo cáo Dòng tiền")

**Agent ID**: `explorer_m2_3` (Explorer M2-3)  
**Parent Agent**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Milestone**: Milestone 2: Sidebar & UI Consolidation  
**Mission**: Design the exact architecture and implementation for Tab 2 ("Quản lý Công nợ") and Tab 3 ("Báo cáo Dòng tiền") inside `AdminLedgerModule.tsx` and related components, including 100% AGENTS.md Admin Module UI compliance.

---

## 1. Observation

### 1.1 Current Implementation of Tab 2 ("Công nợ Hợp đồng" / `receivables`)
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - **Lines 154–164**: Sub-tab definitions:
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
  - **Lines 835–934**: `flatMilestones`, `receivablesKPIs`, and `filteredMilestones` currently only parse B2B corporate contracts (`DocumentRecord[]` from `documentService.getDocuments()`). B2C student debt (`tuition - paidAmount > 0` from CRM records) is completely absent from Tab 2.
  - **Lines 1704–1740**: KPI cards display only B2B contract metrics (`totalContractValue`, `totalCollected`, `totalOutstanding`, `totalOverdue`).
  - **Lines 1741–1847**:
    - **Line 1750**: Action column header is missing standard width and empty declaration: `<th className="sticky top-0 z-20 bg-white w-24 px-4 py-3.5 text-right font-medium"></th>`.
    - **Lines 1823–1835**: Naked action button `<button ...>Thu tiền</button>` is rendered directly on table rows:
      ```tsx
      <button
        onClick={() => {
          setPayingMilestone({ contract: m.contract, milestone: m.milestone });
          setMilestonePayAmount(m.amount.toString());
          setMilestonePayDate(format(new Date(), "yyyy-MM-dd"));
          setMilestonePayMethod("Chuyển khoản");
        }}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-2xs"
      >
        <DollarSign size={12} />
        <span>Thu tiền</span>
      </button>
      ```
      This directly violates **AGENTS.md Admin Module UI Standards Rule 1**: "Tuyệt đối không phơi bày các nút icon trần trụi (`Pencil`, `Trash2`) ở cuối dòng... Cơ chế thao tác DUY NHẤT: Mọi hành động xem chi tiết, chỉnh sửa, đổi tên, nhân bản, xóa BẮT BUỘC chỉ được thực hiện thông qua Action Menu 3 chấm (`MoreVertical`) ở cột ngoài cùng bên phải".
    - **Line 1741**: The table is wrapped in `<div className="flex-1 min-h-0 overflow-auto bg-white border border-slate-200 rounded-xl">` with padding `p-6` on line 1705, which creates a floating boxed card instead of the required **Full-Bleed Layout (Rule 14)**.

### 1.2 Current Implementation of Tab 3 ("Báo cáo Dòng tiền" / `summary`)
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - **Lines 679–723**:
    ```typescript
    const summaryData = useMemo(() => {
      const years: Record<string, any> = {};
      transactions.forEach((tx) => {
        // Stream 2 rule: Exclude all test transactions from financial metrics
        if (isTestTransaction(tx)) return;

        const year = tx.date.split("-")[0];
        const month = parseInt(tx.date.split("-")[1]);
        ...
        const mIdx = month - 1;
        if (tx.type === "expected_revenue") {
          years[year].totalExpected += (tx.credit || 0);
          years[year].months[mIdx].expected += (tx.credit || 0);
        } else {
          years[year].totalCredit += (tx.credit || 0);
          years[year].totalDebit += (tx.debit || 0);
          years[year].totalSurplus += (tx.surplus || 0);
          
          years[year].months[mIdx].credit += (tx.credit || 0);
          years[year].months[mIdx].debit += (tx.debit || 0);
          years[year].months[mIdx].surplus += (tx.surplus || 0);
          years[year].months[mIdx].profit = years[year].months[mIdx].credit - years[year].months[mIdx].debit;
        }
      });
      return Object.values(years).sort((a, b) => b.year - a.year);
    }, [transactions]);
    ```
    - **Violation of R1/R2 and 3-Stream Separation**: `summaryData` computes `totalExpected` and `months[mIdx].expected` by summing `tx.type === "expected_revenue"` records from `ledger_transactions`. This conflates internal intent orders (`[LỆNH THU]`) with actual cash flow, and fails to reflect true commercial outstanding receivables from B2B contract milestones and B2C student debts.
  - **Lines 1442–1502**:
    - The summary view is wrapped in a floating card container `<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">` inside `p-6 pt-0` instead of a full-bleed edge-to-edge layout (Rule 14).
    - Table header does not have an action menu column `<th>` to balance line-height and alignment.

### 1.3 Existing Shared Helpers & Components Ready for Integration
- **File**: `De_Vuong_Webapp/src/domain/financeIdentity.ts`
  - **Lines 476–536**: `calculateLeadDebt(record: any, ledgerTransactions?: any[]): LeadDebtItem` is fully implemented and tested. It takes a CRM lead / customer profile record and the ledger transactions, filters out test transactions and `expected_revenue`, computes `actualPaid = Math.max(record.paidAmount, ledgerPaidSum)`, and calculates `remainingDebt = totalTuition > 0 ? Math.max(0, totalTuition - actualPaid) : 0`.
  - **Lines 94–143**: `isTestTransaction(tx)` accurately flags test transactions (`SP111111...`, `SP_TEST`, `TEST PHI`, etc.).
  - **Lines 197–474**: `resolveFinanceParty(tx, context)` unifies identity resolution across learners, leads, partners, and internal accounts.
- **File**: `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx`
  - Already accepts `lead`, `student`, and `allLedgerTransactions`, calculates remaining balance, dynamically generates official VietQR via SePay (`vietQR.generateUrl`), and supports recording payments directly to Firestore.
- **File**: `De_Vuong_Webapp/src/components/admin/AdminRowActions.tsx`
  - Standardized 3-dot action menu (`MoreVertical`) with dropdown portal, keyboard accessibility, and clean hover styling.

### 1.4 Test & Build Verification Baseline
- Command: `cd De_Vuong_Webapp; npm test -- tests/admissionsDebtSync.test.ts`
  - Result: 28/28 tests passed (including Test 9 "Three-stream separation: filters test transactions and expected_revenue from actual cash flow").
- Command: `cd De_Vuong_Webapp; npm run build`
  - Result: Built in 14.60s with zero compilation or TypeScript errors.

---

## 2. Logic Chain

1. **Tab 2 Integration Requirements (Observation 1.1, 1.3)**:
   - R2 explicitly requires: *"Quản lý Công nợ: Tích hợp cả Công nợ Doanh nghiệp (B2B) và Công nợ Học viên (B2C lấy từ Leads/Tiến độ thu còn phải thu, có nút Thu tiền kích hoạt VietQR)"*.
   - Currently, Tab 2 only shows B2B contracts (`flatMilestones`).
   - By creating a segmented view state `receivablesSegment: 'b2b' | 'b2c'` inside Tab 2:
     - Sub-tab `'b2b'` displays B2B corporate contract milestones.
     - Sub-tab `'b2c'` displays student tuition debts derived from `allCrmRecords` via `calculateLeadDebt(r, transactions)` where `totalTuition > 0 || remainingDebt > 0`.
   - On B2C debt rows, triggering "Thu tiền" opens `LeadPaymentModal` with the lead's identity and tuition information pre-filled.
   - On B2B milestone rows, triggering "Ghi nhận thu tiền" opens the milestone payment recording modal (`payingMilestone`).

2. **Compliance with AGENTS.md Action Menu Standards (Rule 1)**:
   - Observation 1.1 shows that B2B milestone rows had raw buttons `<button>Thu tiền</button>`.
   - In accordance with Rule 1:
     - The rightmost column header must be an empty `<th>` (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`).
     - Every row must render `AdminRowActions` (`MoreVertical`) containing the actions:
       - For B2B: "Ghi nhận thu tiền" (if unpaid), "Sao chép mã hợp đồng", "Sao chép tên đối tác".
       - For B2C: "Thu tiền (Tạo VietQR)", "Sao chép mã hồ sơ", "Sao chép số điện thoại".
     - All table data cells (`<td>`) remain read-only plain text.

3. **Tab 3 3-Stream Separation and True Expected Revenue (Observation 1.2, 1.3)**:
   - Observation 1.2 revealed that `summaryData` was calculating `expected` by summing `tx.type === "expected_revenue"` from `ledger_transactions`.
   - Under R1 and R2, `ledger_transactions` only reflects actual confirmed cash inflows/outflows. Intent records (`[LỆNH THU]`) must not be summed as actual ledger items.
   - True commercial expected revenue (Dự thu) is the sum of:
     - B2B unpaid milestone amounts: `sum(flatMilestones.filter(m => m.status !== 'Paid').map(m => m.amount))`
     - B2C unpaid tuition debts: `sum(b2cDebtList.map(item => item.remainingDebt))`
   - Actual cash flow metrics (Net Revenue, Total Expense, Net Profit) must be computed exclusively from non-test transactions (`!isTestTransaction(tx) && tx.type !== 'expected_revenue'`).
   - Injecting this commercial debt summary into the Cash Flow report provides an accurate financial picture.

4. **UI Standards Compliance for Tab 2 and Tab 3 (Rules 2, 3, 4, 5, 12, 14)**:
   - **Freeze Panes (Rule 2)**: All table headers (`<th>`) in both Tab 2 and Tab 3 must specify `sticky top-0 z-20 bg-white`.
   - **Code Anchoring (Rule 3)**: All IDs (`CTR-*`, `PRT-*`, `LEA-*`, `LRN-*`) must be rendered as plain text `font-mono text-xs font-semibold text-slate-700` without any pill/badge background (`bg-*`) or border (`border-*`).
   - **Anti-Pill Overload (Rule 4)**: Statuses must use standard dot indicators (`w-1.5 h-1.5 rounded-full`) with neutral or status-specific text colors, avoiding pill wrappers.
   - **Single-Row Toolbar (Rule 5 & 12)**: Toolbar must remain on a single sticky row (`px-5 py-3 border-b border-slate-200 bg-white`) featuring search with clear button `x`, sub-tab toggle, and `AdminFilterDropdown`.
   - **Full-Bleed Layout (Rule 14)**: Module wrapper must be `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`, eliminating floating boxed card containers with padding.

---

## 3. Caveats

1. **Sub-tab Placement vs. Top Toolbar**: Tab 2 can either have sub-tabs toggled on the single-row toolbar (e.g. `[Doanh nghiệp B2B] [Học viên B2C]`) or rendered as a segmented control immediately above the table. Placing the toggle inside the single-row toolbar alongside `AdminFilterDropdown` maintains strict single-row compactness.
2. **Real-time Firestore Sync**: Both `documents` and `allCrmRecords` are already wired with active Firestore listeners in `AdminLedgerModule.tsx`. When a payment is recorded via `LeadPaymentModal` or `handleConfirmMilestonePayment`, the Firestore document updates trigger immediate UI re-rendering without needing manual page reloads.
3. **No Direct Writes during Investigation**: This report provides read-only architectural analysis and precise diffs for the implementer agent.

---

## 4. Conclusion & Concrete Implementation Specification

### 4.1 Tab 2 ("Quản lý Công nợ") Architecture & Implementation

#### A. State & Data Pipeline in `AdminLedgerModule.tsx`
Add state and memoized calculations for B2C student debt and combined commercial KPIs:

```typescript
// Sub-tab segment inside Tab 2
const [receivablesSegment, setReceivablesSegment] = useState<'b2b' | 'b2c'>('b2b');
const [b2cDebtFilter, setB2cDebtFilter] = useState<string>('all');
const [selectedDebtLead, setSelectedDebtLead] = useState<LeadDebtItem | null>(null);
const [isLeadPaymentModalOpen, setIsLeadPaymentModalOpen] = useState(false);

// B2C Debt calculation from merged CRM records
const b2cDebtList = useMemo(() => {
  return allCrmRecords
    .map((r) => calculateLeadDebt(r, transactions))
    .filter((item) => item.totalTuition > 0 || item.remainingDebt > 0);
}, [allCrmRecords, transactions]);

const b2cKPIs = useMemo(() => {
  let totalTuition = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let countWithDebt = 0;

  b2cDebtList.forEach((item) => {
    totalTuition += item.totalTuition;
    totalCollected += item.paidAmount;
    totalOutstanding += item.remainingDebt;
    if (item.remainingDebt > 0) countWithDebt++;
  });

  return {
    totalTuition,
    totalCollected,
    totalOutstanding,
    countWithDebt,
    totalCount: b2cDebtList.length,
  };
}, [b2cDebtList]);

const filteredB2cDebt = useMemo(() => {
  return b2cDebtList.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      !term ||
      item.name.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      (item.studentId && item.studentId.toLowerCase().includes(term)) ||
      (item.phone && item.phone.includes(term)) ||
      (item.programName && item.programName.toLowerCase().includes(term));

    if (!matchSearch) return false;

    if (b2cDebtFilter === 'debt') return item.remainingDebt > 0;
    if (b2cDebtFilter === 'paid') return item.remainingDebt === 0 && item.paidAmount > 0;
    if (b2cDebtFilter === 'partial') return item.paidAmount > 0 && item.remainingDebt > 0;
    if (b2cDebtFilter === 'unpaid') return item.paidAmount === 0 && item.totalTuition > 0;
    return true;
  });
}, [b2cDebtList, searchTerm, b2cDebtFilter]);
```

#### B. Toolbar Updates for Tab 2
Replace lines 1186–1205 in `AdminLedgerModule.tsx` with:

```tsx
{activeSubTab === "receivables" ? (
  <>
    {/* Segmented Sub-tab Switch */}
    <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
      <button
        type="button"
        onClick={() => setReceivablesSegment('b2b')}
        className={`px-3 py-1.5 rounded-md transition-all ${
          receivablesSegment === 'b2b'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Doanh nghiệp B2B ({flatMilestones.length})
      </button>
      <button
        type="button"
        onClick={() => setReceivablesSegment('b2c')}
        className={`px-3 py-1.5 rounded-md transition-all ${
          receivablesSegment === 'b2c'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        Học viên B2C ({b2cKPIs.countWithDebt} còn nợ)
      </button>
    </div>

    {/* Filter Dropdown */}
    {receivablesSegment === 'b2b' ? (
      <AdminFilterDropdown
        label="Trạng thái"
        value={receivablesFilter}
        multiple={false}
        onChange={(selected) => setReceivablesFilter(selected[0] || "all")}
        options={[
          { value: "all", label: "Tất cả trạng thái" },
          { value: "overdue", label: `Quá hạn (${receivablesKPIs.countOverdue})` },
          { value: "upcoming", label: `Sắp đến hạn (${receivablesKPIs.countUpcoming})` },
          { value: "pending", label: "Chưa đến hạn" },
          { value: "paid", label: "Đã thu" },
        ]}
      />
    ) : (
      <AdminFilterDropdown
        label="Tình trạng thu"
        value={b2cDebtFilter}
        multiple={false}
        onChange={(selected) => setB2cDebtFilter(selected[0] || "all")}
        options={[
          { value: "all", label: "Tất cả hồ sơ" },
          { value: "debt", label: `Còn công nợ (${b2cKPIs.countWithDebt})` },
          { value: "partial", label: "Đã cọc một phần" },
          { value: "paid", label: "Đã thu đủ 100%" },
          { value: "unpaid", label: "Chưa thu đồng nào" },
        ]}
      />
    )}
  </>
) : null}
```

#### C. B2B Debt Milestone Table (AGENTS.md Compliant)
Replace the table in lines 1740–1846 with:

```tsx
<div className="flex-1 min-h-0 overflow-auto">
  <table className="w-full text-left border-collapse min-w-[950px]">
    <thead>
      <tr className="border-b border-slate-200 bg-white text-xs font-semibold text-slate-700">
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Hợp đồng & Đối tác</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Đợt thanh toán & Điều kiện</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Số tiền</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Hạn thanh toán</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Trạng thái</th>
        <th className="sticky top-0 z-20 bg-white w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-xs">
      {filteredMilestones.map((m) => (
        <tr
          key={`${m.contractId}-${m.milestoneId}`}
          className="group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors"
        >
          <td className="px-4 py-3.5 align-middle">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-xs">
                  {m.partnerName}
                </p>
                <p className="font-mono text-xs font-semibold text-slate-700">
                  {m.contractCode} <span className="font-sans font-normal text-[11px] text-slate-400">· {m.contractTitle}</span>
                </p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3.5 align-middle">
            <p className="font-medium text-slate-800">{m.phaseName}</p>
            <p className="text-[11px] text-slate-400 line-clamp-1">{m.condition}</p>
          </td>
          <td className="px-4 py-3.5 align-middle text-right font-bold tabular-nums text-slate-900">
            {m.amount.toLocaleString()}đ
          </td>
          <td className="px-4 py-3.5 align-middle">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>{m.dueDate}</span>
            </div>
          </td>
          <td className="px-4 py-3.5 align-middle">
            {m.status === "Paid" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đã thu
              </span>
            ) : m.isOverdue ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                Quá hạn {Math.abs(m.daysDiff)} ngày
              </span>
            ) : m.isUpcoming ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Sắp đến hạn ({m.daysDiff} ngày)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Chưa đến hạn
              </span>
            )}
          </td>
          <td className="w-16 px-4 py-3.5 align-middle text-right">
            <AdminRowActions
              label={`Đợt thanh toán ${m.contractCode}`}
              actions={[
                ...(m.status !== "Paid"
                  ? [
                      {
                        label: "Ghi nhận thu tiền",
                        icon: <DollarSign size={14} />,
                        run: () => {
                          setPayingMilestone({ contract: m.contract, milestone: m.milestone });
                          setMilestonePayAmount(m.amount.toString());
                          setMilestonePayDate(format(new Date(), "yyyy-MM-dd"));
                          setMilestonePayMethod("Chuyển khoản");
                        },
                      },
                    ]
                  : []),
                {
                  label: "Sao chép mã hợp đồng",
                  icon: <Copy size={14} />,
                  run: () => navigator.clipboard.writeText(m.contractCode),
                },
                {
                  label: "Sao chép tên đối tác",
                  icon: <Building2 size={14} />,
                  run: () => navigator.clipboard.writeText(m.partnerName),
                },
              ]}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### D. B2C Student Debt Table
Rendered when `receivablesSegment === 'b2c'`:

```tsx
<div className="flex-1 min-h-0 overflow-auto">
  <table className="w-full text-left border-collapse min-w-[950px]">
    <thead>
      <tr className="border-b border-slate-200 bg-white text-xs font-semibold text-slate-700">
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Mã hồ sơ & Học viên</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Khóa học / Chương trình</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Tổng học phí</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Đã thanh toán</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Còn phải thu</th>
        <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Trạng thái thu</th>
        <th className="sticky top-0 z-20 bg-white w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 text-xs">
      {filteredB2cDebt.length === 0 ? (
        <tr>
          <td colSpan={7} className="py-12 text-center text-slate-400">
            Không tìm thấy học viên nào có công nợ phù hợp
          </td>
        </tr>
      ) : (
        filteredB2cDebt.map((item) => (
          <tr
            key={item.id}
            className="group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors"
          >
            <td className="px-4 py-3.5 align-middle">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-xs">
                  {item.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-slate-700">{item.code}</span>
                  {item.studentId && item.studentId.startsWith('LRN-') && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono text-xs font-semibold text-emerald-700">{item.studentId}</span>
                    </>
                  )}
                  {item.phone && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-400">{item.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </td>
            <td className="px-4 py-3.5 align-middle">
              <p className="font-medium text-slate-800 truncate max-w-xs">{item.programName || item.roadmap || 'Khóa học'}</p>
            </td>
            <td className="px-4 py-3.5 align-middle text-right font-bold tabular-nums text-slate-900">
              {item.totalTuition.toLocaleString()}đ
            </td>
            <td className="px-4 py-3.5 align-middle text-right font-bold tabular-nums text-emerald-700">
              {item.paidAmount.toLocaleString()}đ
            </td>
            <td className="px-4 py-3.5 align-middle text-right font-bold tabular-nums text-rose-600">
              {item.remainingDebt.toLocaleString()}đ
            </td>
            <td className="px-4 py-3.5 align-middle">
              {item.remainingDebt === 0 && item.paidAmount > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Đã thu đủ 100%
                </span>
              ) : item.paidAmount > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Đã cọc ({item.paidAmount.toLocaleString()}đ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Chưa thu
                </span>
              )}
            </td>
            <td className="w-16 px-4 py-3.5 align-middle text-right">
              <AdminRowActions
                label={`Học viên ${item.name}`}
                actions={[
                  {
                    label: "Thu tiền (Tạo VietQR)",
                    icon: <CreditCard size={14} />,
                    run: () => {
                      setSelectedDebtLead(item);
                      setIsLeadPaymentModalOpen(true);
                    },
                  },
                  {
                    label: "Sao chép mã hồ sơ",
                    icon: <Copy size={14} />,
                    run: () => navigator.clipboard.writeText(item.code),
                  },
                  ...(item.phone
                    ? [
                        {
                          label: "Sao chép số điện thoại",
                          icon: <Phone size={14} />,
                          run: () => navigator.clipboard.writeText(item.phone!),
                        },
                      ]
                    : []),
                ]}
              />
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
```

#### E. Rendering `LeadPaymentModal` inside `AdminLedgerModule.tsx`
Add at the end of `AdminLedgerModule.tsx`:

```tsx
<LeadPaymentModal
  isOpen={isLeadPaymentModalOpen}
  onClose={() => {
    setIsLeadPaymentModalOpen(false);
    setSelectedDebtLead(null);
  }}
  lead={selectedDebtLead ? {
    id: selectedDebtLead.id,
    code: selectedDebtLead.code,
    name: selectedDebtLead.name,
    phone: selectedDebtLead.phone,
    email: selectedDebtLead.email,
    tuition: selectedDebtLead.totalTuition,
    paidAmount: selectedDebtLead.paidAmount,
    programName: selectedDebtLead.programName,
    roadmap: selectedDebtLead.roadmap,
    studentId: selectedDebtLead.studentId,
  } : null}
  allLedgerTransactions={transactions}
  onPaymentRecorded={() => {
    // Firestore listener handles live refresh
  }}
/>
```

---

### 4.2 Tab 3 ("Báo cáo Dòng tiền") Architecture & Implementation

#### A. Recalculation of `summaryData` with Clean 3-Stream Separation
Replace lines 679–723 of `AdminLedgerModule.tsx` with:

```typescript
// 1. Clean Commercial Debt summary for Expected Revenue projection
const commercialDebtSummary = useMemo(() => {
  let b2bTotalExpected = 0;
  let b2bOverdue = 0;
  const b2bByYearMonth: Record<string, number> = {};

  flatMilestones.forEach((m) => {
    if (m.status !== 'Paid') {
      b2bTotalExpected += m.amount;
      if (m.isOverdue) b2bOverdue += m.amount;
      if (m.dueDate) {
        const ym = m.dueDate.substring(0, 7);
        b2bByYearMonth[ym] = (b2bByYearMonth[ym] || 0) + m.amount;
      }
    }
  });

  let b2cTotalExpected = 0;
  b2cDebtList.forEach((item) => {
    if (item.remainingDebt > 0) {
      b2cTotalExpected += item.remainingDebt;
    }
  });

  const totalCommercialExpected = b2bTotalExpected + b2cTotalExpected;

  return {
    b2bTotalExpected,
    b2bOverdue,
    b2cTotalExpected,
    totalCommercialExpected,
    b2bByYearMonth,
  };
}, [flatMilestones, b2cDebtList]);

// 2. Cash Flow metrics strictly derived from actual non-test transactions
const summaryData = useMemo(() => {
  const years: Record<string, any> = {};

  transactions.forEach((tx) => {
    // Stream 1 rule: Exclude all test transactions
    if (isTestTransaction(tx)) return;

    // Stream 2 rule: Exclude expected_revenue (Lệnh thu) from actual cash flow
    if (tx.type === 'expected_revenue') return;

    if (!tx.date) return;
    const year = tx.date.split('-')[0];
    const month = parseInt(tx.date.split('-')[1]);
    if (!year || isNaN(month)) return;

    if (!years[year]) {
      years[year] = {
        year,
        totalCredit: 0,
        totalDebit: 0,
        totalExpected: 0,
        totalSurplus: 0,
        months: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          credit: 0,
          debit: 0,
          expected: 0,
          surplus: 0,
          profit: 0,
        })),
      };
    }

    const mIdx = month - 1;
    years[year].totalCredit += tx.credit || 0;
    years[year].totalDebit += tx.debit || 0;
    years[year].totalSurplus += tx.surplus || 0;

    years[year].months[mIdx].credit += tx.credit || 0;
    years[year].months[mIdx].debit += tx.debit || 0;
    years[year].months[mIdx].surplus += tx.surplus || 0;
    years[year].months[mIdx].profit =
      years[year].months[mIdx].credit - years[year].months[mIdx].debit;
  });

  // Stream 3: Populate expected revenue from commercial debt
  const currentYear = String(new Date().getFullYear());
  if (years[currentYear]) {
    years[currentYear].totalExpected = commercialDebtSummary.totalCommercialExpected;
    Object.entries(commercialDebtSummary.b2bByYearMonth).forEach(([ym, amt]) => {
      const [y, mStr] = ym.split('-');
      if (y === currentYear && years[y]) {
        const m = parseInt(mStr);
        if (m >= 1 && m <= 12) {
          years[y].months[m - 1].expected += amt;
        }
      }
    });
  }

  return Object.values(years).sort((a, b) => Number(b.year) - Number(a.year));
}, [transactions, commercialDebtSummary]);
```

#### B. Cash Flow KPI Metric Cards and Full-Bleed Table
Replace lines 1441–1502 with:

```tsx
{/* TAB 3: BÁO CÁO DÒNG TIỀN (SUMMARY) */}
<div
  className={`flex-1 flex flex-col min-h-0 ${activeSubTab === "summary" ? "flex" : "hidden"}`}
>
  {/* TOP KPI CARDS */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-4 border-b border-slate-200 bg-white shrink-0">
    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng thu thực tế</p>
      <p className="text-lg font-black text-emerald-600 tabular-nums">
        {summaryData.reduce((acc, y) => acc + (y.totalCredit || 0), 0).toLocaleString()}đ
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">Dòng tiền đã vào tài khoản</p>
    </div>
    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tổng chi hoạt động</p>
      <p className="text-lg font-black text-rose-600 tabular-nums">
        {summaryData.reduce((acc, y) => acc + (y.totalDebit || 0), 0).toLocaleString()}đ
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">Chi phí vận hành & hoàn phí</p>
    </div>
    <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Lợi nhuận ròng</p>
      <p className="text-lg font-black text-blue-700 tabular-nums">
        {(
          summaryData.reduce((acc, y) => acc + (y.totalCredit || 0), 0) -
          summaryData.reduce((acc, y) => acc + (y.totalDebit || 0), 0)
        ).toLocaleString()}đ
      </p>
      <p className="text-[11px] text-slate-400 mt-0.5">Thu thực tế trừ Chi thực tế</p>
    </div>
    <div className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-2xs">
      <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5">Dự thu thương mại</p>
      <p className="text-lg font-black text-indigo-700 tabular-nums">
        {commercialDebtSummary.totalCommercialExpected.toLocaleString()}đ
      </p>
      <p className="text-[11px] text-indigo-600/80 mt-0.5 truncate">
        B2B: {commercialDebtSummary.b2bTotalExpected.toLocaleString()}đ · B2C: {commercialDebtSummary.b2cTotalExpected.toLocaleString()}đ
      </p>
    </div>
  </div>

  {/* FULL-BLEED CASH FLOW TABLE */}
  <div className="flex-1 min-h-0 overflow-auto">
    <table className="w-full text-left border-collapse min-w-[950px]">
      <thead className="sticky top-0 z-20 bg-white border-b border-slate-200 text-xs font-semibold text-slate-700">
        <tr>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5">Thời gian</th>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Tổng Chi</th>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Tổng Thu</th>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Lợi Nhuận</th>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Dự Thu Thương mại</th>
          <th className="sticky top-0 z-20 bg-white px-4 py-3.5 text-right">Phí Dư</th>
          <th className="sticky top-0 z-20 bg-white w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 text-xs">
        {summaryData.map((yearData) => (
          <React.Fragment key={yearData.year}>
            <tr className="bg-slate-50/80 font-bold [&>td]:border-b [&>td]:border-slate-200">
              <td className="px-4 py-3 text-[12px] font-black text-slate-900">Năm {yearData.year}</td>
              <td className="px-4 py-3 text-right font-black text-rose-600 tabular-nums">{(yearData.totalDebit || 0).toLocaleString()}đ</td>
              <td className="px-4 py-3 text-right font-black text-emerald-600 tabular-nums">{(yearData.totalCredit || 0).toLocaleString()}đ</td>
              <td className="px-4 py-3 text-right font-black text-blue-700 bg-blue-50/20 tabular-nums">
                {(yearData.totalCredit - yearData.totalDebit).toLocaleString()}đ
              </td>
              <td className="px-4 py-3 text-right font-black text-indigo-700 tabular-nums">{(yearData.totalExpected || 0).toLocaleString()}đ</td>
              <td className="px-4 py-3 text-right font-black text-amber-600 tabular-nums">{(yearData.totalSurplus || 0).toLocaleString()}đ</td>
              <td className="w-16 px-4 py-3 text-right"></td>
            </tr>
            {yearData.months.map((m: any) => (
              <tr
                key={m.month}
                className="group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors"
              >
                <td className="px-4 py-3 text-xs font-medium text-slate-600">
                  Tháng {m.month.toString().padStart(2, "0")}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-600 tabular-nums">
                  {(m.debit || 0).toLocaleString()}đ
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 tabular-nums">
                  {(m.credit || 0).toLocaleString()}đ
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-600 tabular-nums">
                  {(m.profit || 0).toLocaleString()}đ
                </td>
                <td className="px-4 py-3 text-right font-bold text-indigo-600 tabular-nums">
                  {(m.expected || 0).toLocaleString()}đ
                </td>
                <td className="px-4 py-3 text-right font-medium text-amber-600 tabular-nums">
                  {(m.surplus || 0).toLocaleString()}đ
                </td>
                <td className="w-16 px-4 py-3 text-right"></td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## 5. Verification Method

To verify the correctness and completeness of the Tab 2 & Tab 3 implementation independently:

1. **Verify Tab 2 B2B Milestone Actions**:
   - Inspect `AdminLedgerModule.tsx`:
     - Confirm that raw `<button>Thu tiền</button>` is completely removed.
     - Confirm that each milestone row uses `AdminRowActions` (`MoreVertical`) with actions: "Ghi nhận thu tiền" and "Sao chép mã hợp đồng".
     - Confirm that the action column `<th>` is strictly empty.

2. **Verify Tab 2 B2C Debt and VietQR Trigger**:
   - Switch to sub-tab "Học viên B2C".
   - Confirm that students with `remainingDebt > 0` are displayed with `totalTuition`, `paidAmount`, and `remainingDebt`.
   - Confirm that clicking the 3-dot action menu item "Thu tiền (Tạo VietQR)" opens `LeadPaymentModal` with the pre-filled lead data and dynamic SePay VietQR.

3. **Verify Tab 3 Cash Flow Calculation**:
   - Inspect `summaryData` in `AdminLedgerModule.tsx`:
     - Confirm that transactions matching `isTestTransaction(tx)` are skipped.
     - Confirm that transactions with `tx.type === 'expected_revenue'` are skipped from `totalCredit`.
     - Confirm that `totalExpected` reflects commercial debt from `commercialDebtSummary.totalCommercialExpected`.

4. **Verify Admin Module UI Compliance**:
   - Confirm all table headers have `sticky top-0 z-20 bg-white`.
   - Confirm all IDs (`CTR-*`, `PRT-*`, `LEA-*`, `LRN-*`) use `font-mono text-xs font-semibold text-slate-700` plain text without pill/badge classes.
   - Confirm the container is `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.

5. **Automated Unit Tests**:
   ```bash
   cd De_Vuong_Webapp
   npm test -- tests/admissionsDebtSync.test.ts
   ```
   Must pass 100% (28/28 passed).

6. **Production Build**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
   Must complete in Vite with zero TypeScript or bundle compilation errors.
