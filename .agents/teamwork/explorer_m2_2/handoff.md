# Handoff Report: Tab 1 ("Sổ cái & Đối soát") Architecture & Implementation Specification

**Agent**: Explorer M2-2 (`explorer_m2_2`)  
**Mission**: Design the exact architecture and implementation for Tab 1 ("Sổ cái & Đối soát") inside `AdminLedgerModule.tsx` and related components.  
**Parent Agent**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Milestone**: Milestone 2: Sidebar & UI Consolidation  
**Target Codebase**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`  

---

## 1. Observation

### 1.1 Current Architecture & Code Locations
- **`src/components/admin/AdminLedgerModule.tsx`**:
  - Lines 154–164: Defines legacy `FINANCE_TABS`:
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
  - Lines 646–678: Sổ cái Thu/Chi table currently displays `historyTransactions` filtered by `!isTestTransaction(tx)` and `tx.type !== 'expected_revenue'`.
  - Lines 1020–1067 & 1070–1144: Logic for MISA export (`misaTransactions`, `handleExportMisaFile`, `handleBatchMarkMisaPosted`) currently exists inside a standalone sub-tab `misa_export`, completely separated from the General Ledger.
  - Lines 1332–1438: General Ledger table currently lacks:
    1. A MISA status dot column (`isPosted ? '• Đã hạch toán' : '• Chưa hạch toán'`).
    2. Toolbar MISA status and period filter dropdowns.
    3. Quick row action to mark a transaction as accounted in MISA.
  - Lines 1850–1988: Standalone `misa_export` sub-tab table header lacks an action menu column (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`), violating AGENTS.md Rule 1.
- **`src/components/admin/SepayReconciliationModule.tsx`**:
  - Lines 49–67: `sepayTab` has `'create'`, `'collection'`, `'overview'`, `'transactions'`.
  - Lines 1502–1548: Sub-tab `'create'` is a redundant VietQR generator for students and leads, duplicating functionality already available in `LeadPaymentModal.tsx` and `CRMAdmissionsModule.tsx`.
  - Lines 1464–1488: SePay transactions table rows only have view detail and copy actions; they lack actions to "Gán hồ sơ LEA", "Gán hợp đồng B2B", and "Đánh dấu giao dịch test / bỏ qua".
- **`server.ts`**:
  - Lines 2836–2865: SePay webhook creates two records upon bank transaction arrival:
    1. `bank_events.doc(bankEventId)`: The immutable raw webhook event with `sepayId`, `bankRef`, `amountIn`, `amountOut`, `content`, `transactionDate`, `classification`, `status`, `isTest`, `receivedAt`.
    2. `ledger_transactions.doc('BANK-' + bankEventId)`: The ledger counterpart with `autoClassified`, `needsReview`, `isTest`.
  - Lines 3040–3053 & 3426–3452: When a transaction is unmatched or ambiguous, webhook sets `needsReview: true`, `autoClassified: false`, and `type: 'unclassified_in' | 'unclassified_out' | 'payment_review'`.
- **`firestore.rules`**:
  - Lines 257–260:
    ```javascript
    match /bank_events/{eventId} {
      allow read: if isAdmin();
      allow write: if false;
    }
    ```
    Confirms that client webapp can read `bank_events`, but writes are strictly forbidden from client SDK.
- **`src/components/AdminDashboard.tsx`**:
  - Lines 2434–2444: `finance_group` currently lists 5 items (`ledger`, `sepay_reconcile`, `receivables`, `cashflow`, `misa`).
  - Lines 6191–6225: Mounts `AdminLedgerModule` with `hideSubTabs={true}` and individual tabs.
  - Lines 1213–1253: Demonstrates pattern for legacy URL redirect handling (`rawUrlTab === 'deals' ? 'leads' : rawUrlTab`).
- **Build and Test Verification**:
  - Command: `cd De_Vuong_Webapp; npm test -- tests/admissionsDebtSync.test.ts`
    - Result: 28/28 tests passed (1.81s).
  - Command: `cd De_Vuong_Webapp; npm run build`
    - Result: Vite build passed cleanly in 14.86s, 0 errors.

---

## 2. Logic Chain

1. **Unifying Tab 1 into Exactly 3 Sub-tabs (Observations 1.1, 1.2, 1.3)**:
   - Requirement 2 mandates consolidating the finance menu into 3 main sidebar items: "Sổ cái & Đối soát" (`id: 'ledger'`), "Quản lý Công nợ" (`id: 'receivables'`), and "Báo cáo Dòng tiền" (`id: 'cashflow'`).
   - Inside Tab 1 ("Sổ cái & Đối soát"), all transaction verification and bank reconciliation workflows belong together.
   - Structuring Tab 1 with 3 dedicated sub-tabs:
     - **Sub-tab 1: `ledger` ("Sổ cái Thu / Chi")**: Official verified financial ledger.
     - **Sub-tab 2: `reconcile` ("Hàng đợi Đối soát SePay")**: Unmatched and pending bank feed transactions.
     - **Sub-tab 3: `bank_feed` ("Lịch sử Bank Feed")**: Read-only raw bank events stream directly from webhook.
   - This satisfies R2 by combining General Ledger, SePay reconciliation, and Bank Feed history into a cohesive single workspace.

2. **Absorbing MISA Functionality Directly into Sub-tab 1 (Observation 1.1)**:
   - Observation 1.1 showed that MISA export was an isolated sub-tab operating on the exact same underlying `ledger_transactions`.
   - In accounting workflows, MISA is not a separate ledger; it is an export and posting status of the General Ledger.
   - By adding:
     1. A MISA status dot column (`• Đã hạch toán` / `• Chưa hạch toán`) to the General Ledger table.
     2. MISA status and period filter dropdowns (`AdminFilterDropdown`) to the toolbar.
     3. An export button to download CSV in MISA AMIS/SME format directly from the active filter.
     4. Row actions in `AdminRowActions` (`MoreVertical`) to mark/unmark MISA posting status.
   - The standalone `tab=misa` becomes entirely redundant and can be cleanly folded into Sub-tab 1, preserving 100% of its functionality with zero data loss.

3. **Building the Reconcile Queue in Sub-tab 2 (Observations 1.2, 1.3)**:
   - Observation 1.3 revealed that `server.ts` tags unmatched SePay transactions with `needsReview: true`, `autoClassified: false`, and `type: 'unclassified_in' | 'unclassified_out'`.
   - However, neither `AdminLedgerModule` nor `SepayReconciliationModule` currently provided actions to resolve them.
   - Sub-tab 2 provides an actionable queue containing these unmatched items. Each row action menu (`AdminRowActions`) provides:
     - **Gán hồ sơ LEA**: Associates transaction with a CRM Lead (`crm_records`), updates lead paid amount and remaining debt, changes ledger transaction `type: 'payment'`, sets `needsReview: false`, `status: 'reconciled'`.
     - **Gán hợp đồng B2B**: Associates transaction with a B2B contract milestone (`documents`), marks milestone as `Paid`, sets `type: 'contract_payment'`, `needsReview: false`, `status: 'reconciled'`.
     - **Đánh dấu giao dịch test**: Sets `isTest: true`, `status: 'test'`, `needsReview: false`. This immediately suppresses the transaction from official General Ledger (Sub-tab 1) and Cashflow metrics (Tab 3).
     - **Bỏ qua**: Sets `needsReview: false`, `status: 'ignored'`.
   - This fulfills R1 and R2 by closing the loop on SePay webhook ingestion without generating ghost stubs.

4. **Eliminating Duplicate VietQR Creation Sub-tab (Observation 1.2)**:
   - In `SepayReconciliationModule.tsx`, the `create` sub-tab generated VietQR codes for tuition fees.
   - In `LeadPaymentModal.tsx` and `CRMAdmissionsModule.tsx`, dynamic VietQR generation is already fully implemented with live debt deduction and SePay QR generation.
   - Eliminating the `create` sub-tab from the finance module removes duplicate, desynchronized code while directing all collection actions to `LeadPaymentModal.tsx` in Tab 2.

5. **Providing Read-Only Raw Bank Feed in Sub-tab 3 (Observations 1.3, 1.4)**:
   - Observation 1.3 confirmed that `server.ts` writes raw events to `bank_events`.
   - Observation 1.4 confirmed that `firestore.rules` allows admin read but denies all client writes (`allow write: if false`).
   - Sub-tab 3 binds directly to `bank_events` with an onSnapshot listener, rendering an immutable, read-only audit log with search, date filters, and copy actions.

6. **Admin Module UI Standards Compliance (AGENTS.md)**:
   - All 3 tables adhere strictly to:
     - Rightmost `<th>` is empty (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`), with no text "Thao tác" or "Hành động" (Rule 1).
     - All interactions housed inside 3-dot `MoreVertical` via `AdminRowActions` (Rule 1).
     - Freeze panes (`sticky top-0 z-20 bg-white`) on all table headers (Rule 2).
     - IDs (`LEA-*`, `LRN-*`, `SP*`, `REC-*`, `PAY-*`, `CTR-*`) displayed as `font-mono text-xs font-semibold text-slate-700` without pill/badge wrappers (Rule 3 & 4).
     - Operational status displayed as subtle colored dots (`•`) with text (Rule 4).
     - Fixed single-row toolbar header using `AdminFilterDropdown` (Rule 5, 6, 12).
     - Full-bleed layout `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden` (Rule 14).

---

## 3. Caveats

1. **Read-Only Investigation**: As an Explorer, no source code files or databases were modified. All proposals are presented as concrete specifications, code designs, and replacement snippets ready for the implementer agent.
2. **Backward Compatibility**: Existing database records in `ledger_transactions` that lack `misaStatus` will default to `'unposted'`.
3. **Historical Bank Events**: If `bank_events` was not populated for legacy transactions prior to the webhook update, Sub-tab 3 gracefully handles empty collections or can display historical bank items derived from `ledger_transactions` with `sepayId`.
4. **Permissions**: The Firestore rule for `bank_events` requires `isAdmin()`. Users accessing Tab 1 must possess the `admin` role.

---

## 4. Conclusion & Proposed Architecture

### 4.1 Sub-tab Structure for Tab 1 ("Sổ cái & Đối soát")

In `AdminLedgerModule.tsx`, define Tab 1 sub-tabs:

```typescript
export type LedgerSubTabId = 'ledger' | 'reconcile' | 'bank_feed';

const LEDGER_SUB_TABS: { id: LedgerSubTabId; label: string; badge?: string }[] = [
  { id: 'ledger', label: 'Sổ cái Thu/Chi' },
  { id: 'reconcile', label: 'Hàng đợi Đối soát SePay' },
  { id: 'bank_feed', label: 'Lịch sử Bank Feed' },
];
```

---

### 4.2 Exact Implementation Plan & Code Changes

#### Component 1: Sub-tab 1 — "Sổ cái Thu/Chi" (`ledger`)
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- **Toolbar Setup** (Single-row fixed header):
  - Search input with clear `x` button.
  - `AdminFilterDropdown` for Year (`yearFilter`).
  - `AdminFilterDropdown` for Month (`monthFilter`).
  - `AdminFilterDropdown` for MISA Status (`misaStatusFilter`: `'all'` | `'unposted'` | `'posted'`).
  - `AdminFilterDropdown` for MISA Period (`misaPeriodFilter`: `'this_month'` | `'last_month'` | `'this_quarter'` | `'all'`).
  - Sub-tab segmented switcher (`Sổ cái Thu/Chi` | `Hàng đợi Đối soát` | `Lịch sử Bank Feed`).
  - Action buttons:
    - `handleExportMisaFile`: Icon `FileSpreadsheet`, generates UTF-8 BOM CSV matching MISA AMIS/SME import schema.
    - `exportToExcel`: Icon `Download`, exports standard ledger.
    - `+ Ghi nhận Thu / Chi`: Icon `Plus`, opens `isAddTxModalOpen`.
- **Table Columns** (`min-w-[1250px]`):
  1. `Ngày` (`w-[110px]`): `font-mono font-medium text-slate-700` with time below.
  2. `Mã hồ sơ` (`w-[125px]`): `font-mono text-xs font-semibold text-slate-700` (`smart.leaCode` or `tx.refCode`).
  3. `Đối tượng / Học viên` (`w-[190px]`): `text-[13px] font-medium text-slate-900` with `smart.lrnCode` mono text below. Placeholder names suppressed via `resolveFinanceParty`.
  4. `Nguồn tiền` (`w-[120px]`): `TPBank (SePay)` / `Vietcombank` / `Tiền mặt`.
  5. `Phân loại` (`w-[130px]`): `smart.typeLabel`.
  6. `Ghi Có` (`w-[110px] text-right`): `text-emerald-700 font-mono font-semibold tabular-nums`.
  7. `Ghi Nợ` (`w-[110px] text-right`): `text-rose-700 font-mono font-semibold tabular-nums`.
  8. `Tồn quỹ` (`w-[110px] text-right`): `text-slate-700 font-mono font-semibold tabular-nums`.
  9. `Diễn giải`: Single-line cleaned description (`smart.cleanDesc`).
  10. `MISA` (`w-[130px] text-center`):
      ```tsx
      {tx.misaStatus === 'posted' ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Đã hạch toán
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          Chưa hạch toán
        </span>
      )}
      ```
  11. Empty `<th>`: `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`.
- **Row Actions (`AdminRowActions`)**:
  - `tx.misaStatus === 'posted' ? 'Bỏ đánh dấu MISA' : 'Đánh dấu đã hạch toán MISA'`: Updates `ledger_transactions` with `misaStatus: 'posted' | 'unposted'`.
  - `Xem chi tiết bút toán`: Opens transaction detail popup.
  - `Sao chép mã tham chiếu`: Clipboard copy.
  - `Xóa bút toán` (`destructive: true`): Calls `deleteDoc`.

---

#### Component 2: Sub-tab 2 — "Hàng đợi Đối soát SePay" (`reconcile`)
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- **Data Filtering**:
  ```typescript
  const unmatchedTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const isBank = Boolean(
        tx.sepayId ||
        tx.bankRef ||
        tx.bankEventId ||
        tx.refCode?.startsWith('SP') ||
        tx.id?.startsWith('BANK-') ||
        tx.paymentMethod === 'sepay_vietqr' ||
        tx.originalContent?.includes('TPBANK')
      );
      if (!isBank) return false;

      // Filter by Reconcile Status
      if (reconcileStatusFilter === 'test') {
        return isTestTransaction(tx) || (tx as any).status === 'test';
      }
      if (reconcileStatusFilter === 'reconciled') {
        return (tx as any).status === 'reconciled';
      }
      if (reconcileStatusFilter === 'ignored') {
        return (tx as any).status === 'ignored';
      }

      // Default: 'pending' (Needs review / Unmatched)
      const needsReview = tx.needsReview === true || tx.autoClassified === false;
      const unclassifiedType = tx.type === 'unclassified_in' || tx.type === 'unclassified_out' || tx.type === 'payment_review';
      const smart = parseLedgerSmartInfo(tx, students, allCrmRecords);
      const missingParty = !smart.leaCode && !smart.lrnCode && !tx.partnerId && !tx.contractCode && (smart.isPlaceholder || !tx.studentName || tx.studentName === '—');
      const testUnconfirmed = isTestTransaction(tx) && (tx as any).status !== 'test_confirmed';

      return (needsReview || unclassifiedType || missingParty || testUnconfirmed) && (tx as any).status !== 'reconciled' && (tx as any).status !== 'ignored';
    });
  }, [transactions, reconcileStatusFilter, students, allCrmRecords]);
  ```
- **Table Columns** (`min-w-[1200px]`):
  1. `Thời gian` (`w-[110px]`): `font-mono text-xs text-slate-700`.
  2. `Mã giao dịch` (`w-[120px]`): `font-mono text-xs font-semibold text-emerald-700` (`tx.refCode || ('SP' + tx.sepayId)`).
  3. `Tham chiếu NH` (`w-[130px]`): `font-mono text-xs text-slate-600` (`tx.bankRef || '---'`).
  4. `Biến động` (`w-[120px] text-right`): `font-mono text-xs font-semibold tabular-nums` (`+amount` in green, `-amount` in red).
  5. `Nội dung chuyển khoản gốc`: Text `text-xs text-slate-700` displaying exact bank transfer remark.
  6. `Lý do cần đối soát` (`w-[160px]`): Text `text-xs text-amber-700` (`'Chưa khớp mã LEA'`, `'Thiếu thông tin đối tượng'`, `'Chênh lệch số tiền'`, `'Nghi vấn test'`).
  7. `Trạng thái` (`w-[130px] text-center`):
     ```tsx
     {isTestTransaction(tx) ? (
       <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
         <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
         Giao dịch Test
       </span>
     ) : (
       <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
         <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
         Chờ đối soát
       </span>
     )}
     ```
  8. Empty `<th>`: `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`.
- **Row Actions (`AdminRowActions`)**:
  1. **"Gán hồ sơ Tuyển sinh (Mã LEA)"**:
     - Opens `AssignLeadModal`.
     - Admin searches and selects a Lead from `allCrmRecords`.
     - Execution function `handleReconcileWithLead`:
       ```typescript
       const handleReconcileWithLead = async (tx: Transaction, lead: any) => {
         const leaCode = ensureValidBusinessCode(lead.code || lead.id, 'LEA');
         const cleanName = lead.name || lead.fullName || 'Khách hàng';
         await updateDoc(doc(db, "ledger_transactions", tx.id), {
           studentId: lead.id,
           studentName: cleanName,
           leaCode: leaCode,
           refCode: tx.refCode || `COL-${leaCode}`,
           type: 'payment',
           needsReview: false,
           autoClassified: false,
           status: 'reconciled',
           reconciledAt: new Date().toISOString(),
           reconciledBy: 'admin',
         });
         // Also update CRM record debt
         if (lead.id) {
           const newPaid = (Number(lead.paidAmount) || 0) + (tx.credit || 0);
           const totalTuition = Number(String(lead.tuition || 0).replace(/\D/g, '')) || 0;
           await updateDoc(doc(db, "crm_records", lead.id), {
             paidAmount: newPaid,
             paymentStatus: newPaid >= totalTuition ? 'Đã thu đủ' : 'Thu một phần',
             updatedAt: serverTimestamp(),
           });
         }
       };
       ```
  2. **"Gán Hợp đồng Doanh nghiệp (B2B)"**:
     - Opens `AssignContractModal`.
     - Admin selects B2B contract from `contracts` and chooses a payment milestone.
     - Execution function `handleReconcileWithContract`:
       ```typescript
       const handleReconcileWithContract = async (tx: Transaction, contract: DocumentRecord, milestone: PaymentMilestone) => {
         await updateDoc(doc(db, "ledger_transactions", tx.id), {
           partnerId: contract.partnerId || '',
           partnerName: contract.partnerName || 'Khách hàng B2B',
           contractCode: contract.documentCode || contract.title,
           documentId: contract.id,
           milestoneId: milestone.id,
           type: 'contract_payment',
           needsReview: false,
           autoClassified: false,
           status: 'reconciled',
           reconciledAt: new Date().toISOString(),
           reconciledBy: 'admin',
         });
         // Update milestone status in document
         const updatedMilestones = (contract.paymentMilestones || []).map(m =>
           m.id === milestone.id ? { ...m, status: 'Paid' as const, paidDate: tx.date, paidAmount: tx.credit, ledgerTransactionId: tx.id } : m
         );
         await documentService.saveDocument({ ...contract, paymentMilestones: updatedMilestones });
       };
       ```
  3. **"Đánh dấu giao dịch test (Bỏ qua)"**:
     - Execution function:
       ```typescript
       const handleMarkTransactionAsTest = async (tx: Transaction) => {
         await updateDoc(doc(db, "ledger_transactions", tx.id), {
           isTest: true,
           status: 'test',
           needsReview: false,
           reconciledAt: new Date().toISOString(),
           reconciledBy: 'admin',
           note: `${tx.note || ''} | Đã xác nhận là giao dịch thử nghiệm`.trim(),
         });
       };
       ```
  4. **"Bỏ qua / Không hạch toán"**:
     - Sets `needsReview: false`, `status: 'ignored'`.
  5. **"Xem chi tiết giao dịch"**: Opens full webhook JSON / original content modal.
  6. **"Sao chép nội dung chuyển khoản"**: Copies original content.

---

#### Component 3: Sub-tab 3 — "Lịch sử Bank Feed" (`bank_feed`)
- **File**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- **Data Subscription**:
  - Listens directly to `bank_events` collection:
    ```typescript
    useEffect(() => {
      const q = query(collection(db, "bank_events"), orderBy("receivedAt", "desc"), limit(200));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setBankEvents(events);
      }, (err) => {
        console.warn("Lỗi tải bank_events:", err);
      });
      return () => unsubscribe();
    }, []);
    ```
- **Table Columns** (`min-w-[1200px]`):
  1. `Thời gian nhận` (`w-[140px]`): `font-mono text-xs text-slate-700` (`formatVietnamDateTime`).
  2. `Mã SePay` (`w-[120px]`): `font-mono text-xs font-semibold text-slate-700` (`event.sepayId`).
  3. `Tham chiếu NH` (`w-[130px]`): `font-mono text-xs text-slate-600` (`event.bankRef`).
  4. `Biến động` (`w-[120px] text-right`): `font-mono text-xs font-semibold tabular-nums` (`event.amountIn > 0 ? +event.amountIn : -event.amountOut`).
  5. `Nội dung chuyển khoản gốc (Raw Content)`: `text-xs text-slate-700 font-mono select-all`.
  6. `Phân loại sơ bộ` (`w-[120px] text-center`): `text-xs text-slate-600 font-medium` (`event.classification`).
  7. `Trạng thái` (`w-[120px] text-center`):
     ```tsx
     {event.isTest || event.status === 'test' ? (
       <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
         <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
         Test
       </span>
     ) : (
       <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
         Hợp lệ
       </span>
     )}
     ```
  8. Empty `<th>`: `<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`.
- **Row Actions (`AdminRowActions`)**:
  - `Xem chi tiết Raw Event`: Opens modal showing JSON dump of bank event.
  - `Sao chép mã SePay`
  - `Sao chép mã tham chiếu NH`
  - `Sao chép nội dung gốc`
  - Strict read-only: No delete or edit options.

---

#### Component 4: Modals for Reconcile Actions
1. **`AssignLeadModal`**:
   - Clean rounded dialog (`rounded-2xl border border-slate-200 bg-white shadow-2xl`).
   - Search bar filtering `allCrmRecords` by name, phone, or LEA code.
   - List of matching leads showing:
     - Lead Name (`font-semibold text-slate-900`)
     - Phone / Contact (`font-mono text-xs text-slate-500`)
     - LEA Code (`font-mono text-xs font-semibold text-slate-700`, plain text, no pill)
     - Program / Need (`text-xs text-slate-600`)
     - Outstanding Tuition Debt (`text-xs font-bold text-rose-600`)
   - Confirm button: "Xác nhận gán học viên & Ghi sổ cái" -> triggers `handleReconcileWithLead`.
2. **`AssignContractModal`**:
   - Clean rounded dialog.
   - Select B2B contract from `contracts`.
   - Displays partner name, contract title, code (`font-mono text-xs font-semibold text-slate-700`).
   - Selects unpaid milestone (`paymentMilestones.filter(m => m.status !== 'Paid')`).
   - Confirm button: "Xác nhận gán hợp đồng B2B & Ghi sổ cái" -> triggers `handleReconcileWithContract`.

---

### 4.3 Redirection & Router Updates

In `De_Vuong_Webapp/src/components/AdminDashboard.tsx`:
Add legacy tab redirect mapping:
```typescript
const LEGACY_TAB_REDIRECTS: Record<string, { tab: AdminTabId; sub?: string }> = {
  deals: { tab: 'leads' },
  misa: { tab: 'ledger', sub: 'ledger' },
  sepay_reconcile: { tab: 'ledger', sub: 'reconcile' },
  sepay: { tab: 'ledger', sub: 'reconcile' },
  finance: { tab: 'ledger', sub: 'ledger' },
};
```
And update the legacy URL parser to automatically dispatch to `tab=ledger&sub=...`.

In `De_Vuong_Webapp/src/App.tsx`:
Add route redirect:
```tsx
<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
```

---

## 5. Verification Method

To independently verify the Tab 1 implementation:

1. **Verify Sub-tab 1 ("Sổ cái Thu/Chi")**:
   - Navigate to `/admin/dashboard?tab=ledger&sub=ledger`.
   - Verify table contains column "MISA" with status dot (`• Đã hạch toán` in emerald or `• Chưa hạch toán` in slate).
   - Test toolbar filters: select "Chưa hạch toán MISA" -> verify only unposted records appear.
   - Click toolbar button "Tải file MISA (CSV)" -> verify downloaded CSV starts with UTF-8 BOM (`\uFEFF`) and headers `NgayHachToan,NgayChungTu,SoChungTu,DienGiai,TKNo,TKCo,SoTien,MaDoiTuong,TenDoiTuong`.
   - Click row action menu -> "Đánh dấu đã hạch toán MISA" -> verify status updates immediately on UI and in Firestore `ledger_transactions`.
2. **Verify Sub-tab 2 ("Hàng đợi Đối soát SePay")**:
   - Navigate to `/admin/dashboard?tab=ledger&sub=reconcile` (or legacy URL `/admin/dashboard?tab=sepay_reconcile`).
   - Verify all unmatched SePay bank transactions appear in the queue.
   - Select action "Gán hồ sơ Tuyển sinh (Mã LEA)" -> choose a test lead -> verify transaction updates with lead name and LEA code, moves into Sổ cái chính thức, and lead paid amount increases.
   - Select action "Đánh dấu giao dịch test (Bỏ qua)" on a test transaction -> verify `isTest: true` is written, and it is excluded from General Ledger and Cashflow reports.
   - Verify sub-tab "Tạo mã VietQR" is completely absent.
3. **Verify Sub-tab 3 ("Lịch sử Bank Feed")**:
   - Navigate to `/admin/dashboard?tab=ledger&sub=bank_feed`.
   - Verify raw events from `bank_events` render in read-only format.
   - Verify no edit or delete buttons exist.
4. **Verify Admin Module UI Compliance**:
   - Rightmost `<th>` in all 3 tables is empty (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`) without text "Thao tác".
   - Table headers stay pinned when scrolling (`sticky top-0 z-20 bg-white`).
   - IDs are displayed in plain font-mono text without grey pill boxes.
   - Container uses full-bleed layout `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.
5. **Run Automated Test Command**:
   ```bash
   cd De_Vuong_Webapp
   npm test -- tests/admissionsDebtSync.test.ts
   ```
   Must pass 100% (28/28 tests).
6. **Run Production Build Command**:
   ```bash
   cd De_Vuong_Webapp
   npm run build
   ```
   Must compile cleanly in Vite with exit code 0.
