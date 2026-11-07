# Handoff Report — Explorer 2: Tuition & Real-time Debt Sync in LeadPaymentModal (Requirement R2)

**Task**: Deep investigation of Requirement R2 (Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế trong `LeadPaymentModal.tsx`) and the exact Acceptance Criteria.  
**Author**: Explorer Survey 2  
**Date**: 2026-11-02T09:43:00Z  
**Status**: Completed (Read-only Investigation)  
**Target Files**:
- `src/components/admin/LeadPaymentModal.tsx`
- `src/components/admin/CRMAdmissionsModule.tsx`
- `src/components/admin/CommercialLifecycleBar.tsx`

---

## 1. Observation

### Obs 1.1: `LeadPaymentModalProps` Interface & Data Ingestion
In `src/components/admin/LeadPaymentModal.tsx` (lines 11–44):
```typescript
export interface LeadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCollectionCode?: string;
  lead?: {
    id: string | number;
    code?: string;
    name?: string;
    partnerName?: string;
    phone?: string;
    email?: string;
    tuition?: number;
    paidAmount?: number;
    note?: string;
    internalNote?: string;
    programName?: string;
    roadmap?: string;
    targetAudience?: string;
    studentId?: string;
  } | null;
  student?: {
    id: string;
    studentCode?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    debt?: number;
    totalAmount?: number;
    paidAmount?: number;
    className?: string;
    notes?: string;
  } | null;
  onPaymentRecorded?: (data: { collectionCode: string; amount: number; method: string }) => void;
}
```
**Finding**:
- `lead` does **not** contain `studentCode` (e.g. `LRN-xxxxxxxx`). It only has `studentId?: string`.
- `LeadPaymentModalProps` does **not** accept `allLedgerTransactions?: LedgerTransaction[]`.
- `LeadPaymentModal.tsx` does **not** import `ledgerService` or query Firebase Firestore collection `ledger_transactions`.

---

### Obs 1.2: Modal Header Rendering
In `src/components/admin/LeadPaymentModal.tsx` (lines 69–77 and 230–248):
```typescript
// Resolve target identifier strictly based on type
const targetCode = isStudent
  ? ensureValidBusinessCode(student!.studentCode || student!.id, 'LRN')
  : ensureValidBusinessCode(String(lead?.code || lead?.id), 'LEA');

const clientName = isStudent
  ? (student!.fullName || 'Học viên')
  : (lead?.partnerName || lead?.name || 'Khách hàng');
```
Header JSX (lines 232–248):
```tsx
<div className="flex items-center gap-2.5">
  <h3 className="text-sm font-bold text-slate-900">
    Tạo mã VietQR & Thu học phí
  </h3>
  <span className="font-mono text-xs font-semibold text-slate-700">{targetCode}</span>
  {currentColCode && (
    <>
      <span className="text-xs text-slate-400">·</span>
      <span className="font-mono text-xs font-semibold text-slate-700">
        {currentColCode}
      </span>
    </>
  )}
  <span className="text-xs text-slate-400">·</span>
  <span className="text-xs font-medium text-slate-600 truncate max-w-xs">{clientName}</span>
</div>
```
**Finding**:
- When opened for a lead, `{targetCode}` displays strictly `LEA-xxxxxxxx`.
- The student's `LRN-xxxxxxxx` identifier is **omitted** from the header entirely.
- Even if `lead.studentId` is present, it is never resolved or rendered alongside `LEA`.

---

### Obs 1.3: Initialization of "1. Tổng học phí" (Ô 1) & Fallback Bug
In `src/components/admin/LeadPaymentModal.tsx` (lines 61 and 106–110):
```typescript
const [customTotalTuition, setCustomTotalTuition] = useState<string>('');
...
useEffect(() => {
  if (isOpen) {
    ...
    if (student) {
      ...
    } else if (lead) {
      const leadTuition = Number(lead.tuition || 0);
      const paid = Number(lead.paidAmount || 0);
      setCustomTotalTuition(leadTuition > 0 ? String(leadTuition) : '3000000');
      setPreviouslyPaidAmount(paid);
      const remaining = Math.max(0, leadTuition - paid);
      setCollectionAmount(remaining > 0 ? String(remaining) : (leadTuition > 0 ? String(leadTuition) : ''));
      setInternalNote(lead.internalNote || lead.note || '');
    }
```
**Finding**:
- If `lead.tuition > 0` (e.g. 6.000đ), `customTotalTuition` is initialized to `'6000'`.
- If `lead.tuition` is 0 or undefined, it defaults to hardcoded `'3000000'` (3.000.000đ).
- In Ô 1 input (lines 337–347): It renders formatted number with commas, and updates `customTotalTuition` onChange.

---

### Obs 1.4: Outer Admission Form Tuition & `handleOpenLeadPayment`
In `src/components/admin/CRMAdmissionsModule.tsx`:
1. "Học phí dự kiến" input in Detail View (lines 4895–4903):
```tsx
<label className="block text-xs font-semibold text-slate-700 mb-1">Học phí dự kiến (VNĐ)</label>
<div className="relative">
  <input
    type="text"
    value={formTuition ? (parseInt(formTuition.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN') : ''}
    onChange={(e) => setFormTuition(e.target.value.replace(/\D/g, ''))}
    placeholder="Nhập mức học phí..."
    className="..."
  />
  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">₫</span>
</div>
```
2. Opener `handleOpenLeadPayment` (lines 1357–1394):
```typescript
const handleOpenLeadPayment = (rec?: CRMRecord | null) => {
  const target = rec || editingRecord;
  const effectiveTuition = parseInt(String(formTuition || target?.tuition || '').replace(/\D/g, ''), 10) || 0;
  
  // Tìm mã lệnh thu đang mở gần nhất nếu có
  const targetLeadId = String(target?.id || '');
  const targetCode = ensureValidBusinessCode(target?.code || target?.id || '', 'LEA');
  const targetCodeClean = targetCode.replace('-', '');
  const targetStudentId = target?.studentId || (target === editingRecord ? formStudentId : undefined);

  const existingCol = allLedgerTransactions.find(tx => {
    if (!tx.refCode?.startsWith('COL')) return false;
    const desc = tx.description || '';
    const sId = String(tx.studentId || '');
    return (
      sId === targetLeadId ||
      (targetStudentId && sId === String(targetStudentId)) ||
      desc.includes(targetCode) ||
      desc.includes(targetCodeClean)
    );
  });

  setPaymentModalColCode(existingCol?.refCode);
  setPaymentModalLead({
    id: target?.id || 'new',
    code: target?.code || '',
    name: (target === editingRecord && formName) ? formName : (target?.name || ''),
    partnerName: (target === editingRecord && formPartnerName) ? formPartnerName : (target?.partnerName || ''),
    phone: (target === editingRecord && formPhone) ? formPhone : (target?.phone || target?.contact || ''),
    email: (target === editingRecord && formEmail) ? formEmail : (target?.email || ''),
    tuition: effectiveTuition,
    paidAmount: Number(target?.paidAmount || 0),
    studentId: target?.studentId || (target === editingRecord ? formStudentId : undefined),
    programName: formProgramName || (target as any)?.programName || target?.roadmap || (target as any)?.interestCourse || target?.need || '',
    targetAudience: (formKind || target?.kind) === 'Doanh nghiệp' ? 'Khách hàng Doanh nghiệp' : 'Học viên cá nhân',
  });
  setIsLeadPaymentModalOpen(true);
};
```
**Findings**:
1. When opening from Detail View (`target === editingRecord`), `effectiveTuition` takes `formTuition` (e.g. 6.000đ).
2. **Stale state bug**: When opening from Table View row action menu (lines 5835 and 6591: `handleOpenLeadPayment(rec)`), `target = rec`. But `parseInt(String(formTuition || target?.tuition || ''))` checks `formTuition` first! If another record was previously opened in Detail View, `formTuition` leaks into `rec.tuition`!
3. **Critical Debt calculation bug**: Line 1388 strictly passes:
   `paidAmount: Number(target?.paidAmount || 0)`.
   It **never** queries `allLedgerTransactions` for payments received via SePay or bank!
   In Firestore `crm_records`, `target.paidAmount` is usually 0 unless manually updated. Consequently, `paymentModalLead.paidAmount` is 0.

---

### Obs 1.5: How `previouslyPaidAmount` Is Handled vs Ledger Transactions
- In `CRMAdmissionsModule.tsx` (lines 1517 and 1529–1531), the module has an active real-time subscription to `ledgerService`:
  ```typescript
  const [allLedgerTransactions, setAllLedgerTransactions] = useState<LedgerTransaction[]>([]);
  ...
  const unsubLedger = ledgerService.subscribeToTransactions((txs) => {
    setAllLedgerTransactions(txs || []);
  });
  ```
- In `CRMAdmissionsModule.tsx` (lines 1764–1773), when calculating lead status, it **does** aggregate from `allLedgerTransactions`:
  ```typescript
  const ledgerPaidSum = allLedgerTransactions.reduce((sum, tx) => {
    if ((tx.credit || 0) <= 0) return sum;
    const raw = ((tx.description || '') + ' ' + (tx.originalContent || '') + ' ' + (tx.studentId || '') + ' ' + (tx.refCode || '')).toUpperCase();
    const cleanLea = String(targetCode || targetLeadId).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanDigits = cleanLea.replace(/^LEA/, '');
    const matches = cleanDigits.length >= 6 && (raw.includes(cleanLea) || raw.includes('LEA' + cleanDigits) || raw.includes('LEA-' + cleanDigits));
    return matches ? sum + (tx.credit || 0) : sum;
  }, 0);
  const actualTotalPaid = Math.max(Number(rec.paidAmount || 0), ledgerPaidSum);
  ```
- Similarly, `activeCollectionOrder` (lines 1654–1673) calculates:
  ```typescript
  const collectedAmount = allLedgerTransactions
    .filter((stx) => {
      if (stx.type === 'expected_revenue') return false;
      if ((stx.credit || 0) <= 0) return false;
      ...
    })
    .reduce((acc, stx) => acc + (stx.credit || 0), 0);
  ```
- **Contrast**: While `CRMAdmissionsModule` calculates `ledgerPaidSum` and `collectedAmount` for status chips and `CommercialLifecycleBar`, `handleOpenLeadPayment` passes **only** `Number(target?.paidAmount || 0)` into `LeadPaymentModal`!
- Therefore, in `LeadPaymentModal.tsx`:
  - `previouslyPaidAmount` becomes 0.
  - The multi-stage progress bar (`previouslyPaidAmount > 0`) is **hidden**.
  - Ô 2 proposes the entire 6.000đ instead of the 3.000đ remaining debt.
  - VietQR generates 6.000đ instead of 3.000đ.

---

### Obs 1.6: How "2. Thu đợt này", "3. Còn lại sau đợt này", and VietQR Behave
In `src/components/admin/LeadPaymentModal.tsx`:
1. **Ô 2 ("Thu đợt này")**:
   - Lines 111–112:
     ```typescript
     const remaining = Math.max(0, leadTuition - paid);
     setCollectionAmount(remaining > 0 ? String(remaining) : (leadTuition > 0 ? String(leadTuition) : ''));
     ```
   - Input (lines 357–371): Controlled by `collectionAmount`.
2. **VietQR Amount**:
   - Line 128: `const numericAmount = parseInt(collectionAmount.replace(/\D/g, ''), 10) || 0;`
   - Lines 137–144:
     ```typescript
     const qrUrl = vietQR.generateUrl(
       PAYMENT_CONFIG.BANK_ID,
       PAYMENT_CONFIG.ACCOUNT_NO,
       numericAmount,
       currentMemo,
       PAYMENT_CONFIG.ACCOUNT_NAME,
       'print'
     );
     ```
   - The VietQR code and the manual transfer box (lines 526–528) strictly use `numericAmount`. If `collectionAmount` is 3.000, VietQR immediately generates 3.000đ.
3. **Ô 3 ("Còn lại sau đợt này")**:
   - Lines 132–134:
     ```typescript
     const currentRemainingDebt = Math.max(0, numericTotalTuition - previouslyPaidAmount);
     const numericRemainingAfterThis = Math.max(0, currentRemainingDebt - numericAmount);
     ```
   - Rendered in Ô 3 (lines 374–382):
     `{numericRemainingAfterThis.toLocaleString()} đ`.
   - Real-time reactivity: Whenever `customTotalTuition` or `collectionAmount` changes, `numericRemainingAfterThis` recalculates synchronously.

---

## 2. Logic Chain

1. **Premise 1 (Obs 1.3 & 1.4)**: The admission detail form stores tuition in `formTuition`. When clicking "Thu tiền & Xuất VietQR" on an active lead, `handleOpenLeadPayment` populates `paymentModalLead.tuition = effectiveTuition`. In `LeadPaymentModal`, `customTotalTuition` is set to `lead.tuition`.
   - *Direct Consequence*: If the user inputs 6.000đ in "Học phí dự kiến", Ô 1 correctly initializes to 6.000đ.
   - *Flaw Identified*: When opening from Table View, `formTuition` can leak across records because `formTuition || target?.tuition` is used without checking `target === editingRecord`.

2. **Premise 2 (Obs 1.1, 1.4 & 1.5)**: When payments are transferred via bank/SePay, entries are stored in `ledger_transactions` with `type: 'payment'` (or credit > 0). They do not automatically update `crm_records.paidAmount`.
   - *Direct Consequence*: `target.paidAmount` in `crm_records` remains 0 or stale.
   - *Flaw Identified*: Because `handleOpenLeadPayment` passes `paidAmount: Number(target?.paidAmount || 0)` and `LeadPaymentModal` does not query `allLedgerTransactions`, `previouslyPaidAmount` becomes 0.

3. **Premise 3 (Obs 1.3 & 1.6)**: In `LeadPaymentModal.tsx`, `remaining` is computed as `Math.max(0, leadTuition - paid)`.
   - When `paid = 0`: `remaining = 6.000đ - 0 = 6.000đ`.
   - Result: Ô 2 is set to 6.000đ, VietQR displays 6.000đ, and the progress bar (`previouslyPaidAmount > 0`) does not render.
   - Conversely, when `paid = 3.000đ`: `remaining = 6.000đ - 3.000đ = 3.000đ`. Ô 2 is initialized to 3.000đ, VietQR generates 3.000đ, progress bar shows `Đã thu 3.000đ / Còn nợ 3.000đ`, and Ô 3 shows `0 đ`.

4. **Premise 4 (Obs 1.2 & Code Generator)**: The header of `LeadPaymentModal` renders `{targetCode}` and `{clientName}`. When `lead` is present, `targetCode` is only `LEA-xxxxxxxx`.
   - *Direct Consequence*: The `LRN` code is missing from the header.
   - *Solution*: By passing `studentCode` (resolved from `students` via `formStudentId`, `lead.studentId`, phone, or email) to `lead` in `LeadPaymentModal`, the header can render `LEA-xxxxxxxx · LRN-xxxxxxxx · [Họ tên]`.

---

## 3. Caveats

- **No Caveats** regarding the core problem and root cause. The data flow, state variables, and failure points are 100% determined.
- **Architectural observation**: `LeadPaymentModal` is rendered in two places within `CRMAdmissionsModule.tsx`:
  1. Line 5673 (Inside Detail View)
  2. Line 6796 (Inside Table/List View)
  Both instances must receive the updated props (`allLedgerTransactions={allLedgerTransactions}`) so that opening from either view exhibits identical, robust behavior.
- **Cross-admission protection**: If a student has multiple admission waves (`LEA-1` and `LEA-2`), a bank transaction whose description specifically contains `LEA-2` must not count towards `LEA-1`. The query matching logic must verify that if another LEA code is explicitly stated in the transaction, it does not contaminate the current LEA.

---

## 4. Conclusion & Required Adjustments

To satisfy the Acceptance Criteria:
- **6.000đ total tuition, 3.000đ paid -> 3.000đ due, VietQR = 3.000đ**
- **Header displaying `LEA`, `LRN`, and student name**

The following concrete adjustments are required:

### Summary of State Variables, Props & UI Elements to Adjust

| Component | Element / State / Prop | Nature of Adjustment |
|---|---|---|
| `LeadPaymentModalProps` | `lead.studentCode?: string;` | Add field to receive the resolved `LRN` code (e.g. `LRN-62517882`). |
| `LeadPaymentModalProps` | `allLedgerTransactions?: LedgerTransaction[];` | Add optional prop to accept the ledger transaction list. |
| `LeadPaymentModal.tsx` | `targetLrnCode` resolution | Resolve `targetLrnCode` from `student?.studentCode` or `lead?.studentCode` or `lead?.studentId`. |
| `LeadPaymentModal.tsx` | Header UI (lines 232–248) | Render `targetLeaCode · targetLrnCode · clientName` (e.g. `LEA-64817788 · LRN-62517882 · Nguyễn Thị Anh Thi`). |
| `LeadPaymentModal.tsx` | Left column customer info (lines 304–307) | Display both `targetLeaCode` and `targetLrnCode` mono badges. |
| `LeadPaymentModal.tsx` | `previouslyPaidAmount` calculation | Calculate ledger paid sum matching `targetLeaCode`, `targetLrnCode`, `phone`, or `COL` code (excluding `expected_revenue`), taking `Math.max(lead.paidAmount, ledgerPaidSum)`. |
| `LeadPaymentModal.tsx` | Ô 2 suggestion | Propose `remaining = Math.max(0, leadTuition - previouslyPaidAmount)` (e.g. 3.000đ). |
| `CRMAdmissionsModule.tsx` | `handleOpenLeadPayment` (lines 1357–1394) | 1. Fix tuition priority: if `rec && rec !== editingRecord`, use `rec.tuition` instead of stale `formTuition`.<br>2. Resolve student `LRN` via `students` lookup.<br>3. Compute `actualPaidAmount` from `allLedgerTransactions` and pass to `paymentModalLead`. |
| `CRMAdmissionsModule.tsx` | `<LeadPaymentModal>` tags (lines 5673 & 6796) | Pass `allLedgerTransactions={allLedgerTransactions}`. |

---

### Exact Implementation Specifications

#### A. In `src/components/admin/LeadPaymentModal.tsx`

1. **Update `LeadPaymentModalProps`**:
```typescript
export interface LeadPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCollectionCode?: string;
  lead?: {
    id: string | number;
    code?: string;
    name?: string;
    partnerName?: string;
    phone?: string;
    email?: string;
    tuition?: number;
    paidAmount?: number;
    note?: string;
    internalNote?: string;
    programName?: string;
    roadmap?: string;
    targetAudience?: string;
    studentId?: string;
    studentCode?: string; // NEW: LRN code
  } | null;
  student?: {
    id: string;
    studentCode?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    debt?: number;
    totalAmount?: number;
    paidAmount?: number;
    className?: string;
    notes?: string;
  } | null;
  allLedgerTransactions?: any[]; // NEW: ledger transactions list
  onPaymentRecorded?: (data: { collectionCode: string; amount: number; method: string }) => void;
}
```

2. **Dual-code Resolution**:
```typescript
const isStudent = Boolean(student);

const targetLeaCode = !isStudent && (lead?.code || lead?.id)
  ? ensureValidBusinessCode(String(lead.code || lead.id), 'LEA')
  : undefined;

const targetLrnCode = isStudent
  ? ensureValidBusinessCode(student!.studentCode || student!.id, 'LRN')
  : (lead?.studentCode
      ? ensureValidBusinessCode(lead.studentCode, 'LRN')
      : (lead?.studentId ? ensureValidBusinessCode(lead.studentId, 'LRN') : undefined));

const targetCode = isStudent
  ? (targetLrnCode || ensureValidBusinessCode(student!.studentCode || student!.id, 'LRN'))
  : (targetLeaCode || ensureValidBusinessCode(String(lead?.code || lead?.id), 'LEA'));
```

3. **Ledger Debt Calculation Logic**:
```typescript
const calculateLedgerPaid = (
  transactions: any[] | undefined,
  leaCode?: string,
  lrnCode?: string,
  phone?: string,
  colCode?: string
): number => {
  if (!transactions || transactions.length === 0) return 0;
  
  const cleanLea = leaCode ? leaCode.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const digitsLea = cleanLea.replace(/^LEA/, '');
  
  const cleanLrn = lrnCode ? lrnCode.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const digitsLrn = cleanLrn.replace(/^LRN/, '');
  
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const cleanCol = colCode ? colCode.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

  return transactions
    .filter(tx => {
      if (tx.type === 'expected_revenue') return false;
      if ((tx.credit || 0) <= 0) return false;

      const raw = `${tx.originalContent || ''} ${tx.transaction_content || ''} ${tx.description || ''} ${tx.refCode || ''} ${tx.studentId || ''}`.toUpperCase();

      // Guard: If tx mentions a DIFFERENT LEA code, do not cross-contaminate
      const txLeaMatch = raw.match(/\bLEA[\s-]?(\d{6,10})\b/i);
      if (txLeaMatch && digitsLea && txLeaMatch[1] !== digitsLea) {
        return false;
      }

      const matchesLea = Boolean(digitsLea.length >= 6 && (raw.includes(cleanLea) || raw.includes('LEA' + digitsLea) || raw.includes('LEA-' + digitsLea)));
      const matchesLrn = Boolean(digitsLrn.length >= 6 && (raw.includes(cleanLrn) || raw.includes('LRN' + digitsLrn) || raw.includes('LRN-' + digitsLrn)));
      const matchesPhone = Boolean(cleanPhone.length >= 9 && raw.includes(cleanPhone));
      const matchesCol = Boolean(cleanCol && raw.includes(cleanCol));

      return matchesLea || matchesLrn || matchesPhone || matchesCol;
    })
    .reduce((sum, tx) => sum + (tx.credit || 0), 0);
};
```

4. **In `useEffect`**:
```typescript
} else if (lead) {
  const leadTuition = Number(lead.tuition || 0);
  const ledgerPaid = calculateLedgerPaid(
    allLedgerTransactions,
    targetLeaCode,
    targetLrnCode,
    clientPhone,
    currentColCode || existingCollectionCode
  );
  const paid = Math.max(Number(lead.paidAmount || 0), ledgerPaid);
  
  setCustomTotalTuition(leadTuition > 0 ? String(leadTuition) : '3000000');
  setPreviouslyPaidAmount(paid);
  const remaining = Math.max(0, leadTuition - paid);
  setCollectionAmount(remaining > 0 ? String(remaining) : (leadTuition > 0 ? '0' : ''));
  setInternalNote(lead.internalNote || lead.note || '');
}
```

5. **Header UI**:
```tsx
<div className="flex items-center gap-2.5">
  <h3 className="text-sm font-bold text-slate-900">
    Tạo mã VietQR & Thu học phí
  </h3>
  {targetLeaCode && (
    <span className="font-mono text-xs font-semibold text-slate-700">{targetLeaCode}</span>
  )}
  {targetLeaCode && targetLrnCode && (
    <span className="text-xs text-slate-400">·</span>
  )}
  {targetLrnCode && (
    <span className="font-mono text-xs font-semibold text-slate-700">{targetLrnCode}</span>
  )}
  {currentColCode && (
    <>
      <span className="text-xs text-slate-400">·</span>
      <span className="font-mono text-xs font-semibold text-slate-700">
        {currentColCode}
      </span>
    </>
  )}
  <span className="text-xs text-slate-400">·</span>
  <span className="text-xs font-medium text-slate-600 truncate max-w-xs">{clientName}</span>
</div>
```

---

#### B. In `src/components/admin/CRMAdmissionsModule.tsx`

1. **In `handleOpenLeadPayment`**:
```typescript
const handleOpenLeadPayment = (rec?: CRMRecord | null) => {
  const target = rec || editingRecord;
  const isEditing = target === editingRecord;
  const effectiveTuition = isEditing
    ? (parseInt(String(formTuition || target?.tuition || '').replace(/\D/g, ''), 10) || 0)
    : (parseInt(String(target?.tuition || '').replace(/\D/g, ''), 10) || 0);

  const targetLeadId = String(target?.id || '');
  const targetCode = ensureValidBusinessCode(target?.code || target?.id || '', 'LEA');
  const targetCodeClean = targetCode.replace('-', '');
  const targetStudentId = target?.studentId || (isEditing ? formStudentId : undefined);
  const targetPhone = (isEditing && formPhone ? formPhone : (target?.phone || target?.contact || '')).trim().replace(/\D/g, '');
  const targetEmail = (isEditing && formEmail ? formEmail : (target?.email || '')).trim().toLowerCase();
  const targetName = (isEditing && formName ? formName : (target?.name || target?.partnerName || '')).trim().toLowerCase();

  // Smart student lookup from students list
  const matchedStudent = students.find(s => {
    if (targetStudentId && s.uid === targetStudentId) return true;
    const sPhone = (s.phone || s.phoneNumber || '').trim().replace(/\D/g, '');
    const sEmail = (s.email || '').trim().toLowerCase();
    const sName = (s.fullName || s.displayName || '').trim().toLowerCase();
    return (targetPhone && sPhone === targetPhone) ||
           (targetEmail && sEmail === targetEmail) ||
           (targetName && sName === targetName);
  });

  const resolvedStudentCode = matchedStudent
    ? ensureValidBusinessCode(matchedStudent.student_code_internal || (matchedStudent as any).studentCode || matchedStudent.uid, 'LRN')
    : (targetStudentId ? ensureValidBusinessCode(targetStudentId, 'LRN') : undefined);

  // Compute ledger payments
  const cleanLea = targetCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const digitsLea = cleanLea.replace(/^LEA/, '');
  const cleanLrn = resolvedStudentCode ? resolvedStudentCode.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
  const digitsLrn = cleanLrn.replace(/^LRN/, '');

  const ledgerPaidSum = allLedgerTransactions
    .filter(tx => {
      if (tx.type === 'expected_revenue') return false;
      if ((tx.credit || 0) <= 0) return false;
      const raw = `${(tx as any).originalContent || ''} ${(tx as any).transaction_content || ''} ${tx.description || ''} ${tx.refCode || ''} ${(tx as any).studentId || ''}`.toUpperCase();
      const txLeaMatch = raw.match(/\bLEA[\s-]?(\d{6,10})\b/i);
      if (txLeaMatch && digitsLea && txLeaMatch[1] !== digitsLea) return false;

      const matchesLea = Boolean(digitsLea.length >= 6 && (raw.includes(cleanLea) || raw.includes('LEA' + digitsLea) || raw.includes('LEA-' + digitsLea)));
      const matchesLrn = Boolean(digitsLrn.length >= 6 && (raw.includes(cleanLrn) || raw.includes('LRN' + digitsLrn) || raw.includes('LRN-' + digitsLrn)));
      const matchesPhone = Boolean(targetPhone.length >= 9 && raw.includes(targetPhone));
      return matchesLea || matchesLrn || matchesPhone;
    })
    .reduce((sum, tx) => sum + (tx.credit || 0), 0);

  const actualPaidAmount = Math.max(Number(target?.paidAmount || 0), ledgerPaidSum);

  const existingCol = allLedgerTransactions.find(tx => {
    if (!tx.refCode?.startsWith('COL')) return false;
    const desc = tx.description || '';
    const sId = String(tx.studentId || '');
    return (
      sId === targetLeadId ||
      (targetStudentId && sId === String(targetStudentId)) ||
      desc.includes(targetCode) ||
      desc.includes(targetCodeClean)
    );
  });

  setPaymentModalColCode(existingCol?.refCode);
  setPaymentModalLead({
    id: target?.id || 'new',
    code: target?.code || '',
    name: isEditing && formName ? formName : (target?.name || ''),
    partnerName: isEditing && formPartnerName ? formPartnerName : (target?.partnerName || ''),
    phone: isEditing && formPhone ? formPhone : (target?.phone || target?.contact || ''),
    email: isEditing && formEmail ? formEmail : (target?.email || ''),
    tuition: effectiveTuition,
    paidAmount: actualPaidAmount,
    studentId: matchedStudent?.uid || targetStudentId,
    studentCode: resolvedStudentCode,
    programName: formProgramName || (target as any)?.programName || target?.roadmap || (target as any)?.interestCourse || target?.need || '',
    targetAudience: (formKind || target?.kind) === 'Doanh nghiệp' ? 'Khách hàng Doanh nghiệp' : 'Học viên cá nhân',
  });
  setIsLeadPaymentModalOpen(true);
};
```

2. **Pass `allLedgerTransactions` Prop**:
Lines 5673 and 6796:
```tsx
<LeadPaymentModal
  isOpen={isLeadPaymentModalOpen}
  onClose={() => setIsLeadPaymentModalOpen(false)}
  existingCollectionCode={paymentModalColCode}
  lead={paymentModalLead}
  allLedgerTransactions={allLedgerTransactions}
  ...
/>
```

---

## 5. Verification Method

To independently verify the implementation once applied by the implementer:

1. **Build Verification**:
   ```powershell
   npm run build
   ```
   Must pass with zero TypeScript errors or broken imports.

2. **Step-by-step UI Verification of Acceptance Criteria**:
   - Navigate to CRM Admissions Module (`tab=leads`).
   - Create or edit an admission lead:
     - Set "Học phí dự kiến" = `6.000` (6.000đ).
     - Link to an existing student (or enter matching phone/email) who has an `LRN` code (e.g. `LRN-62517882`, Nguyễn Thị Anh Thi).
     - Ensure a ledger transaction exists in `ledger_transactions` with `credit: 3000` matching this `LEA` or `LRN`.
   - Click "Thu tiền & Xuất mã VietQR" to open `LeadPaymentModal`.
   - **Inspect Header**:
     Verify header displays: `LEA-64817788 · LRN-62517882 · Nguyễn Thị Anh Thi` (no missing LRN, no placeholder).
   - **Inspect Ô 1 ("1. Tổng học phí")**:
     Verify value is `6,000` (inherited from the outer form).
   - **Inspect Progress Bar**:
     Verify progress bar is visible and shows: `Đã thu: 3.000đ / Học phí: 6.000đ · Còn nợ: 3.000đ`.
   - **Inspect Ô 2 ("2. Thu đợt này")**:
     Verify value is automatically pre-filled with `3,000` (the 3.000đ remaining debt).
   - **Inspect Ô 3 ("3. Còn lại sau đợt này")**:
     Verify value displays `0 đ`.
     Type `1,000` in Ô 2 -> verify Ô 3 changes in real time to `2,000 đ`.
   - **Inspect VietQR**:
     Verify VietQR image contains `3000` and the manual transfer box displays `3.000 đ`.

3. **Invalidation Conditions**:
   - If Ô 1 defaults to `3.000.000đ` when "Học phí dự kiến" is `6.000đ`.
   - If Ô 2 proposes `6.000đ` instead of `3.000đ` when a 3.000đ payment exists in the ledger.
   - If the header does not display the `LRN` code.
