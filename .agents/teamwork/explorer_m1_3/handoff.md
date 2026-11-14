# Handoff Report: Milestone 1 — CRM Admissions Sync Hardening & 3-Stream Data Separation

**Author**: Explorer M1-3 (`explorer_m1_3`)  
**Recipient**: Lead Orchestrator (`parent` / `029cef84-8361-4084-a50e-50f632a7bb27`)  
**Date**: 2026-11-11T16:22:00Z  
**Target Webapp**: `De_Vuong_Webapp/`  
**Handoff Type**: Hard (Investigation & Design Complete)

---

## 1. Observation

### Obs 1.1: `CRMAdmissionsModule.tsx` Save & Code Preservation Defect
- File: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\src\components\admin\CRMAdmissionsModule.tsx`
- Lines 3370–3460 (`handleSave`):
  `const updated: CRMRecord = { ... }` constructs a new record object.
  - Line 3371: `id: editingRecord ? editingRecord.id : 'crm_${Date.now()}',`
  - Field `code` is **NOT set** on `updated`. Even if `editingRecord.code` already existed (e.g. `'LEA-64817788'`), `updated` does not include `code`.
  - Properties from `editingRecord` like `paidAmount`, `paymentStatus`, `receiptCode`, `classId`, `courseId` are not spread into `updated`, causing them to become `undefined` in local state.
- Lines 3483–3498:
  ```ts
  if (editingRecord) {
    setRecords((prev) => {
      const next = prev.map((r) => (r.id === editingRecord.id ? updated : r));
      persistCustomRecords(next);
      return next;
    });
    setNotice(`Đã cập nhật hồ sơ của: ${updated.name}`);
  } else {
    setRecords((prev) => {
      const next = [updated, ...prev];
      persistCustomRecords(next);
      return next;
    });
    setNotice(`Đã thêm mới hồ sơ của: ${updated.name}`);
  }
  ```
  `setRecords` and `persistCustomRecords(next)` run **before** `canonicalCode` is generated or attached. Thus, local React state and `localStorage` store objects with missing `code`.
- Lines 3504–3512:
  ```ts
  const canonicalCode = ensureValidBusinessCode(updated.code || updated.id, 'LEA');
  const docPayload = removeUndefinedFields({
    ...updated,
    code: canonicalCode,
    fullName: updated.name,
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
  await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
  ```
  `canonicalCode` is only attached to `docPayload`. `updated.code` remains `undefined`, and `return updated;` (line 3548) returns an object without `code`.
- Other write paths in `CRMAdmissionsModule.tsx`:
  - `handleQuickUpdateStatus` (line 5963): `docPayload` uses `...updated` which can lack `code` if the record in state lacks it.
  - `LeadPaymentModal.tsx` onComplete callback (lines 5940–5953 and lines 7170–7185): writes `updatePayload` (`paidAmount`, `paymentStatus`) without ensuring `code: canonicalCode` is anchored on the doc.

### Obs 1.2: Lead Debt Calculation in CRM & Presentation to Finance
- In `CRMAdmissionsModule.tsx`:
  - Lines 1858–1875 & Lines 6788–6845:
    `targetTuition = Number(String(rec.tuition || '').replace(/\D/g, '')) || 0;`
    `recCode = ensureValidBusinessCode(String(rec.code || rec.id), 'LEA');`
    `cleanDigits = recCode.replace(/\D/g, '');`
    `ledgerPaidSum = allLedgerTransactions.reduce((sum, tx) => { ... if (tx.type === 'expected_revenue') return sum; ... matches ? sum + tx.credit : sum; }, 0);`
    `actualPaid = Math.max(Number(rec.paidAmount || 0), ledgerPaidSum);`
    `remainingDebt = totalTuition > 0 ? Math.max(0, totalTuition - actualPaid) : 0;`
  - Commercial B2C Debt occurs whenever `totalTuition > 0` and `remainingDebt > 0`.
  - Currently, this debt logic is trapped inside inline JSX IIFEs (lines 6790–6830) and `calculateOverallStatus` (lines 1858–1875) in `CRMAdmissionsModule.tsx`. It is **NOT** exported as a shared function and is **NOT** exposed to `AdminLedgerModule.tsx`.

### Obs 1.3: Fragmented Identity & 3-Stream Conflation in `AdminLedgerModule.tsx`
- File: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\src\components\admin\AdminLedgerModule.tsx`
- Lines 113–326: `parseLedgerSmartInfo` contains 214 lines of ad-hoc regex parsing, multi-hop lookups across `allCrmRecords` and `allStudents`, and generic name fallback logic.
  - It duplicates logic found in `CRMAdmissionsModule.tsx` (`resolveStudentIdentity`), `server.ts` (`findBestLeadDoc`), and `AdminDashboard.tsx`.
- Lines 838–858 (`filteredTransactions`):
  Iterates over `transactions` without checking `!isTestTransaction(tx)`.
  Test transactions (`SP111111...`, `TEST PHI`, `CP-TEST`, `VGTEST`) pass through into the General Ledger.
- Lines 860–866:
  `pinnedTransactions = filteredTransactions.filter(tx => tx.type === 'expected_revenue');`
  `historyTransactions = filteredTransactions.filter(tx => tx.type !== 'expected_revenue');`
  `pinnedTransactions` is never rendered in the UI table (it is unused dead code).
- Lines 868–909 (`summaryData`):
  Sums `credit`, `debit`, `surplus` directly from `transactions`.
  - Synthetic test transactions are NOT excluded, corrupting `totalCredit`, `totalDebit`, and `profit`.
  - Projections (`expected_revenue`) are summed into `totalExpected` instead of pulling from authentic commercial debt (B2B contracts + B2C leads).
- Lines 911–933 (`studentReport`):
  `report[tx.studentId].totalPaid += (tx.credit || 0);`
  - Does NOT check `tx.type !== 'expected_revenue'`. A draft collection order (`[LỆNH THU]`) is counted as actual student payment!
  - Does NOT check `!isTestTransaction(tx)`.
  - Uses raw un-reconciled `tx.studentName` ("Học viên E-learning", "Chưa đặt tên").
- Lines 1200–1242 (`misaTransactions`):
  Does NOT filter out `tx.type === 'expected_revenue'` or `isTestTransaction(tx)`. Projected collection orders and test events can be exported to MISA accounting!
- Lines 947–1062 (`flatMilestones` & `receivablesKPIs`):
  Receivables currently only evaluates B2B contracts (`contracts`). B2C student debt is completely omitted.

---

## 2. Logic Chain

1. **CRM Save Guarantee (In-Memory + Database Consistency)**:
   - To ensure local state and Firestore never drift, `canonicalCode` must be evaluated **before** `const updated = { ... }`.
   - Spreading `...(editingRecord || {})` ensures that existing payment progress (`paidAmount`, `paymentStatus`, `receiptCode`, `transactions`) is never wiped out when editing contact or course info.
   - Assigning `code: canonicalCode` directly to `updated` guarantees that `setRecords(next)`, `persistCustomRecords(next)`, Firestore payloads, and the return value of `handleSave` all contain the identical valid `LEA-*` code.

2. **3-Stream Data Separation Principle**:
   - **Stream 1 (Bank Feed `sepay_bank_events` / `bank_events`)**: Raw incoming webhooks. Test events (`isTest: true`, `SP111111...`, `TEST PHI`, etc.) must be flagged and segregated.
   - **Stream 2 (Actual Ledger `ledger_transactions`)**: Strictly actual cash inflows (`credit`) and outflows (`debit`).
     - Must filter `!isTestTransaction(tx)` AND `tx.type !== 'expected_revenue'`.
     - `pinnedTransactions` must be removed from the general ledger view.
     - `studentReport` and `summaryData` must only aggregate actual money in/out.
   - **Stream 3 (Accounts Receivable / Commercial Debt)**:
     - Must NOT be represented as phantom entries in `ledger_transactions` (`expected_revenue`).
     - B2B Debt: Contract milestones where `status !== 'Paid'` from `documentService.getDocuments()`.
     - B2C Debt: Leads where `tuition > 0` and `(tuition - paidAmount) > 0` from `crm_records` / `customer_profiles`.
     - Total Expected Inflow (Dự thu) = B2B Outstanding + B2C Outstanding.

3. **Domain Layer Consolidation (`resolveFinanceParty` & `calculateLeadDebt`)**:
   - Placing `resolveFinanceParty`, `isTestTransaction`, `isGenericPlaceholderName`, and `calculateLeadDebt` in `src/domain/financeIdentity.ts` creates a single source of truth.
   - `AdminLedgerModule.tsx` `parseLedgerSmartInfo` can wrap `resolveFinanceParty`, keeping existing unit tests (`tests/admissionsDebtSync.test.ts`, `tests/empiricalChallengerM1.test.ts`) 100% green while eliminating duplicate code.

---

## 3. Caveats

1. **Read-Only Scope**: This report is strictly architectural and design-oriented. No production code changes were applied during this explorer turn.
2. **Backward Compatibility**: `parseLedgerSmartInfo` in `AdminLedgerModule.tsx` is imported by multiple tests (`tests/admissionsDebtSync.test.ts`, `tests/empiricalChallengerM1.test.ts`, `tests/challenger_m1_debt_vietqr.test.ts`). Any refactoring must maintain the exact return shape: `{ studentDisplay, typeLabel, cleanDesc, leaCode, lrnCode }`.
3. **Database Write Safety**: Historical records in Firestore must be audited using the dry-run script (`reconcileFinanceDataDryRun.ts`) before any backfills occur.

---

## 4. Conclusion & Proposed Implementation Specifications

### 4.1. Exact Changes to `CRMAdmissionsModule.tsx`

#### Change 1: Upfront `canonicalCode` and `editingRecord` spread in `handleSave` (lines 3370–3520)

**Before (Lines 3370–3512)**:
```ts
    const updated: CRMRecord = {
      id: editingRecord ? editingRecord.id : `crm_${Date.now()}`,
      createdAtMs: editingRecord ? (editingRecord.createdAtMs || Date.now()) : Date.now(),
      createdAt: editingRecord ? (editingRecord.createdAt || new Date().toISOString()) : new Date().toISOString(),
      name: finalName,
      // ... fields ...
      reconciliationCode: formReconciliationCode.trim() || undefined,
    };

    // ...
    if (editingRecord) {
      setRecords((prev) => {
        const next = prev.map((r) => (r.id === editingRecord.id ? updated : r));
        persistCustomRecords(next);
        return next;
      });
      setNotice(`Đã cập nhật hồ sơ của: ${updated.name}`);
    } else {
      setRecords((prev) => {
        const next = [updated, ...prev];
        persistCustomRecords(next);
        return next;
      });
      setNotice(`Đã thêm mới hồ sơ của: ${updated.name}`);
    }

    setIsFormOpen(false);
    setEditingRecord(null);

    // Persist to Firestore
    try {
      const canonicalCode = ensureValidBusinessCode(updated.code || updated.id, 'LEA');
      const docPayload = removeUndefinedFields({
        ...updated,
        code: canonicalCode,
        fullName: updated.name,
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
      await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
```

**After (Proposed Implementation)**:
```ts
    const updatedId = editingRecord ? editingRecord.id : `crm_${Date.now()}`;
    const canonicalCode = ensureValidBusinessCode(
      editingRecord?.code || (editingRecord as any)?.reconciliationCode || formReconciliationCode.trim() || updatedId,
      'LEA'
    );

    const updated: CRMRecord = {
      ...(editingRecord || {}),
      id: updatedId,
      code: canonicalCode,
      createdAtMs: editingRecord ? (editingRecord.createdAtMs || Date.now()) : Date.now(),
      createdAt: editingRecord ? (editingRecord.createdAt || new Date().toISOString()) : new Date().toISOString(),
      name: finalName,
      phone: formPhone.trim(),
      email: formEmail.trim().toLowerCase(),
      contact: finalContact,
      kind: formKind,
      source: formSource,
      department: formDepartment,
      need: formNeed.trim() || (formKind === 'Doanh nghiệp' ? `Đào tạo Doanh nghiệp: ${formDealTitle || finalName}` : (
        formB2CDemandItems.length > 0 
          ? `Nhu cầu học: ${formB2CDemandItems.map(item => item.programName).join(', ')}`
          : 'Nhu cầu đào tạo'
      )),
      roadmap: (() => {
        if (formKind === 'Doanh nghiệp' && formTrainingPackages.length > 0) {
          return formTrainingPackages.map(p => `${p.phase}: ${(p.programs || []).join(' + ')} (${p.targetAudience} - ${p.totalHours}h)`).join(' · ');
        }
        if (formKind === 'Cá nhân' && formB2CDemandItems.length > 0) {
          return formB2CDemandItems.map(item => {
            const topicStr = item.topics && item.topics.length > 0 
              ? ` (${item.topics.join(', ')})`
              : '';
            return `${item.programName}${topicStr}`;
          }).join(' + ');
        }
        if (!formProgramName) return formRoadmap || 'Chương trình đào tạo';
        if (formTopic && formTopic !== 'all') {
          return `${formProgramName} · ${formTopic}`;
        }
        return formProgramName;
      })(),
      programName: (() => {
        if (formKind === 'Cá nhân' && formB2CDemandItems.length > 0) {
          return formB2CDemandItems.map(item => item.programName).join(', ');
        }
        return formProgramName || undefined;
      })(),
      selectedTopics: (() => {
        if (formKind === 'Cá nhân' && formB2CDemandItems.length > 0) {
          const allTopics = Array.from(new Set(formB2CDemandItems.flatMap(item => item.topics || [])));
          return allTopics.length > 0 ? allTopics : undefined;
        }
        return formTopic && formTopic !== 'all' ? [formTopic] : undefined;
      })(),
      learningFormat: formLearningFormat,
      trainingLocation: formTrainingLocation.trim() || undefined,
      preferredSchedule: formatWeeklyScheduleToString(formWeeklySchedule) || formPreferredSchedule,
      weeklySchedule: formWeeklySchedule,
      pic: formPic,
      tuition: formTuition,
      className: editingRecord ? editingRecord.className : 'Chưa xếp lớp',
      status: currentLeadStatus,
      createdDate: formCreatedDate,
      followUp: formFollowUp,
      startDate: formStartDate || undefined,
      expectedStartDate: formStartDate || undefined,
      note: formNote.trim(),
      partnerId: formKind === 'Doanh nghiệp' ? formPartnerId || undefined : undefined,
      partnerName: formKind === 'Doanh nghiệp' ? finalName : undefined,
      studentId: formKind === 'Cá nhân' ? finalStudentId || undefined : undefined,
      linkedQuotationId: formLinkedQuotationId || undefined,
      linkedQuotationCode: formLinkedQuotationCode || undefined,
      dealTitle: formKind === 'Doanh nghiệp' ? formDealTitle.trim() || undefined : undefined,
      taxCode: formKind === 'Doanh nghiệp' ? formTaxCode.trim() || undefined : undefined,
      representativeName: formKind === 'Doanh nghiệp' ? formRepresentativeName.trim() || undefined : undefined,
      representativeRole: formKind === 'Doanh nghiệp' ? formRepresentativeRole.trim() || undefined : undefined,
      intermediary: formKind === 'Doanh nghiệp' ? formIntermediary.trim() || undefined : undefined,
      intermediaryFeePercent: formKind === 'Doanh nghiệp' && formIntermediaryFeePercent ? Number(formIntermediaryFeePercent) : undefined,
      expectedLearnerCount: formKind === 'Doanh nghiệp' && formExpectedLearnerCount ? Number(formExpectedLearnerCount) : undefined,
      hasInvoiceDemand: formKind === 'Doanh nghiệp' ? formHasInvoiceDemand : undefined,
      hasPitTaxSupport: formKind === 'Doanh nghiệp' ? formHasPitTaxSupport : undefined,
      trainingPackages: formKind === 'Doanh nghiệp' 
        ? formTrainingPackages 
        : (formB2CDemandItems.length > 0 
            ? formB2CDemandItems.map((item, idx) => ({
                id: item.id || `b2c_pkg_${idx}`,
                phase: `Mục ${idx + 1}`,
                programs: [item.programName],
                topics: item.topics,
                targetAudience: 'Học viên cá nhân',
                totalHours: 0,
                hoursPerSession: 2,
                learnerCount: 1,
              }))
            : undefined),
      reconciliationCode: formReconciliationCode.trim() || undefined,
    };

    // Tự động đồng bộ Mã đối chiếu & Email sang Hồ sơ Học viên nếu có liên kết
    const linkedStudentUid = formStudentId || editingRecord?.studentId;
    if (linkedStudentUid) {
      const studentSyncData: Record<string, any> = {};
      if (formReconciliationCode.trim()) {
        studentSyncData.student_code_reference = formReconciliationCode.trim();
        studentSyncData.reconciliationCode = formReconciliationCode.trim();
      }
      if (formEmail.trim()) {
        studentSyncData.email = formEmail.trim();
      }
      if (formPhone.trim()) {
        studentSyncData.phone = formPhone.trim();
      }
      if (formName.trim() && formKind === 'Cá nhân') {
        studentSyncData.fullName = formName.trim();
      }
      if (Object.keys(studentSyncData).length > 0) {
        userService.updateUserProfile(linkedStudentUid, studentSyncData).catch(console.warn);
      }
    }

    if (editingRecord) {
      setRecords((prev) => {
        const next = prev.map((r) => (r.id === editingRecord.id ? updated : r));
        persistCustomRecords(next);
        return next;
      });
      setNotice(`Đã cập nhật hồ sơ của: ${updated.name}`);
    } else {
      setRecords((prev) => {
        const next = [updated, ...prev];
        persistCustomRecords(next);
        return next;
      });
      setNotice(`Đã thêm mới hồ sơ của: ${updated.name}`);
    }

    setIsFormOpen(false);
    setEditingRecord(null);

    // Persist to Firestore: Write to BOTH customer_profiles and crm_records
    try {
      const docPayload = removeUndefinedFields({
        ...updated,
        code: canonicalCode,
        fullName: updated.name,
        updatedAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
      await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
```

#### Change 2: Preserve `code` in other write handlers
- In `handleQuickUpdateStatus` (line 5975):
  ```ts
  const canonicalCode = ensureValidBusinessCode(rec.code || rec.id, 'LEA');
  const docPayload = removeUndefinedFields({
    ...updated,
    code: canonicalCode,
    fullName: updated.name,
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
  await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
  ```
- In `LeadPaymentModal.tsx` onComplete callback (lines 5940 & 7170):
  ```ts
  const leadCode = ensureValidBusinessCode(paymentModalLead.code || paymentModalLead.id, 'LEA');
  const updatePayload: any = {
    code: leadCode,
    paidAmount: newPaid,
    paymentStatus: newStatus,
    updatedAt: serverTimestamp(),
  };
  if (targetStudentId) {
    updatePayload.studentId = targetStudentId;
  }
  await setDoc(doc(db, 'customer_profiles', String(paymentModalLead.id)), updatePayload, { merge: true });
  await setDoc(doc(db, 'crm_records', String(paymentModalLead.id)), updatePayload, { merge: true });
  ```

---

### 4.2. Shared Domain Utilities (`src/domain/financeIdentity.ts`)

Create `src/domain/financeIdentity.ts` with the following implementation:

```typescript
import { ensureValidBusinessCode } from '../utils/codeGenerator';

export interface FinancePartyInput {
  id?: string;
  studentId?: string;
  internalId?: string;
  refCode?: string;
  description?: string;
  originalContent?: string;
  note?: string;
  studentName?: string;
  partnerId?: string;
  partnerName?: string;
  sepayId?: string | number;
  bankRef?: string;
  type?: string;
  isTest?: boolean;
  credit?: number;
  debit?: number;
}

export interface FinancePartyResolution {
  partyType: 'learner' | 'lead' | 'partner' | 'internal' | 'unclassified';
  partyName: string;
  partyCode: string; // LRN-XXXXXXXX, LEA-XXXXXXXX, PRT-XXXXXXXX, CTR-XXXXXXXX
  lrnCode?: string;
  leaCode?: string;
  partnerId?: string;
  contractCode?: string;
  isPlaceholder: boolean;
  cleanDescription: string;
  isTestTransaction: boolean;
  categoryLabel: string;
}

const GENERIC_PLACEHOLDER_NAMES = [
  'học viên e-learning',
  'hoc vien e-learning',
  'chưa đặt tên',
  'chua dat ten',
  'chưa có tên',
  'chua co ten',
  'khách hàng',
  'khach hang',
  'khách hàng tuyển sinh',
  'khách hàng khóa học',
  'n/a',
  'null',
  'undefined',
  'học viên',
  'hoc vien',
  'lead',
  'customer',
];

export function isGenericPlaceholderName(name?: string | null): boolean {
  if (!name) return true;
  const trimmed = name.trim().toLowerCase();
  if (trimmed === '') return true;
  return GENERIC_PLACEHOLDER_NAMES.includes(trimmed);
}

export function isTestTransaction(tx: FinancePartyInput): boolean {
  if (tx.isTest === true) return true;

  const ref = String(tx.refCode || tx.id || '');
  if (/^SP1{5,}/i.test(ref) || /^SP(4{5,}|845459|999999)/i.test(ref)) return true;

  const sepayId = String(tx.sepayId || '');
  if (/^(1{5,}|4{5,}|845459|999999)/.test(sepayId)) return true;

  const content = [
    tx.description || '',
    tx.originalContent || '',
    tx.note || '',
    tx.refCode || '',
  ].join(' ');

  if (
    /\b(TT\s+TEST\s+PHI|CP-TEST|VGTEST)\b/i.test(content) ||
    /\bTEST\s+(PHI|LEA|NO\s+PREFIX|RANDOM)\b/i.test(content) ||
    /\b(TEST_TRANSACTION|SYNTHETIC_TEST)\b/i.test(content) ||
    /^TEST\b/i.test(content.trim()) ||
    /\bTEST$/i.test(content.trim())
  ) {
    return true;
  }

  return false;
}

function toProperCase(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
}

export function resolveFinanceParty(
  tx: FinancePartyInput,
  context?: {
    students?: any[];
    crmRecords?: any[];
    partners?: any[];
    documents?: any[];
  }
): FinancePartyResolution {
  const isTest = isTestTransaction(tx);
  const content = [tx.description, tx.originalContent, tx.note].filter(Boolean).join(' ');
  const candidateStr = `${content} ${tx.studentId || ''} ${tx.refCode || ''} ${tx.internalId || ''}`;

  const leaMatch = candidateStr.match(/\bLEA[\s-]?(\d{6,10})\b/i);
  const normalizedLeaCode = leaMatch ? `LEA-${leaMatch[1]}` : null;

  const lrnMatch = candidateStr.match(/\bLRN[\s-]?(\d{6,10})\b/i);
  const normalizedLrnCode = lrnMatch ? `LRN-${lrnMatch[1]}` : null;

  const phoneMatch = content.match(/\b(0\d{9,10})\b/);
  const phone = phoneMatch ? phoneMatch[1] : null;

  const ctMatch = content.match(/CT tu \d+\s+([A-Z\s]+?)\s+toi/i);

  let partyName = tx.studentName || '';
  let matchedStudentCode: string | null = null;
  let partyType: FinancePartyResolution['partyType'] = 'unclassified';
  let partnerId = tx.partnerId;
  let contractCode: string | undefined;

  // 1. Partner lookup
  if (context?.partners && context.partners.length > 0 && (partnerId || tx.partnerName)) {
    const matchedPartner = context.partners.find(p => p.id === partnerId || (tx.partnerName && p.name?.toLowerCase() === tx.partnerName.toLowerCase()));
    if (matchedPartner) {
      partyName = matchedPartner.name;
      partyType = 'partner';
      partnerId = matchedPartner.id;
    }
  }

  // 2. CRM Records Lookup
  let matchedCrm: any = null;
  if (context?.crmRecords && context.crmRecords.length > 0 && (normalizedLeaCode || isGenericPlaceholderName(partyName))) {
    const crmMatches = context.crmRecords.filter((r: any) => {
      const rId = String(r.id || '');
      const rCode = String(r.code || '');
      const rLeadCode = String(r.leadCode || r.reconciliationCode || '');
      if (normalizedLeaCode) {
        const computedLea = rCode && rCode.startsWith('LEA-') ? rCode.toUpperCase() : ensureValidBusinessCode(rCode || rId, 'LEA');
        if (
          rCode.toUpperCase() === normalizedLeaCode ||
          rId.toUpperCase() === normalizedLeaCode ||
          rLeadCode.toUpperCase() === normalizedLeaCode ||
          computedLea === normalizedLeaCode ||
          (leaMatch && (rId.includes(leaMatch[1]) || rCode.includes(leaMatch[1])))
        ) {
          return true;
        }
      }
      if (phone && (r.phone === phone || r.contact === phone || String(r.contact || '').includes(phone))) return true;
      return false;
    });

    if (crmMatches.length > 0) {
      const primaryCrm =
        crmMatches.find((r: any) => !isGenericPlaceholderName(r.name || r.fullName)) ||
        crmMatches[0];
      const withPhoneOrEmail = crmMatches.find((r: any) => r.phone || r.email || r.contact) || primaryCrm;
      const withStudentId =
        crmMatches.find((r: any) => String(r.studentId || r.studentCode || r.learnerCode || '').startsWith('LRN-')) ||
        crmMatches.find((r: any) => r.studentId || r.studentCode || r.learnerCode) ||
        primaryCrm;

      matchedCrm = {
        ...primaryCrm,
        name: !isGenericPlaceholderName(primaryCrm.name) ? primaryCrm.name : withPhoneOrEmail.name,
        fullName: !isGenericPlaceholderName(primaryCrm.fullName) ? primaryCrm.fullName : withPhoneOrEmail.fullName,
        phone: primaryCrm.phone || withPhoneOrEmail.phone,
        contact: primaryCrm.contact || withPhoneOrEmail.contact,
        email: primaryCrm.email || withPhoneOrEmail.email,
        studentId: withStudentId.studentId || primaryCrm.studentId,
        studentCode: withStudentId.studentCode || primaryCrm.studentCode,
        learnerCode: withStudentId.learnerCode || primaryCrm.learnerCode,
      };

      const crmName = matchedCrm.name || matchedCrm.fullName;
      if (!isGenericPlaceholderName(crmName)) {
        partyName = crmName;
      }
      if (matchedCrm.studentId && String(matchedCrm.studentId).startsWith('LRN-')) {
        matchedStudentCode = matchedCrm.studentId;
      } else if (matchedCrm.studentCode && String(matchedCrm.studentCode).startsWith('LRN-')) {
        matchedStudentCode = matchedCrm.studentCode;
      } else if (matchedCrm.learnerCode && String(matchedCrm.learnerCode).startsWith('LRN-')) {
        matchedStudentCode = matchedCrm.learnerCode;
      }
    }
  }

  // 3. User / Student Profiles Lookup (Multi-hop from CRM or direct from tx)
  if (context?.students && context.students.length > 0) {
    if (matchedCrm && (!matchedStudentCode || isGenericPlaceholderName(partyName))) {
      const crmStudentId = matchedCrm.studentId || matchedCrm.studentCode;
      const crmPhone = (matchedCrm.phone || matchedCrm.contact || '').replace(/\D/g, '');
      const crmEmail = (matchedCrm.email || '').trim().toLowerCase();
      const rawCrmName = (matchedCrm.name || matchedCrm.fullName || '').trim();
      const crmName = isGenericPlaceholderName(rawCrmName) ? '' : rawCrmName.toLowerCase();

      const foundFromCrm = context.students.find((s) => {
        if (crmStudentId && (s.uid === crmStudentId || s.student_code_internal === crmStudentId || s.studentCode === crmStudentId)) return true;
        const sPhone = (s.phone || s.phoneNumber || '').replace(/\D/g, '');
        const sEmail = (s.email || '').trim().toLowerCase();
        const sName = (s.fullName || s.displayName || '').trim().toLowerCase();
        if (crmPhone && sPhone && sPhone === crmPhone) return true;
        if (crmEmail && sEmail && sEmail === crmEmail) return true;
        if (!crmPhone && !crmEmail && crmName && sName === crmName) return true;
        return false;
      });

      if (foundFromCrm) {
        if (!matchedStudentCode) {
          matchedStudentCode = foundFromCrm.student_code_internal || foundFromCrm.studentCode || null;
        }
        if (isGenericPlaceholderName(partyName) && !isGenericPlaceholderName(foundFromCrm.fullName)) {
          partyName = foundFromCrm.fullName;
        }
      }
    }

    if (!matchedStudentCode || isGenericPlaceholderName(partyName)) {
      const rawTxStudentId = String(tx.studentId || '');
      const rawTxInternalId = String(tx.internalId || '');
      const cleanTxPhone = phone;
      const displayIsPlaceholder = isGenericPlaceholderName(partyName);

      const matchedStu = context.students.find((s) => {
        if (normalizedLrnCode && (s.student_code_internal === normalizedLrnCode || s.studentCode === normalizedLrnCode || s.uid === normalizedLrnCode)) return true;
        if (rawTxInternalId && (s.student_code_internal === rawTxInternalId || s.uid === rawTxInternalId)) return true;
        if (rawTxStudentId && !rawTxStudentId.startsWith('LEA') && !rawTxStudentId.startsWith('COL') && (s.student_code_internal === rawTxStudentId || s.uid === rawTxStudentId)) return true;
        if (cleanTxPhone && ((s.phone || '').replace(/\D/g, '') === cleanTxPhone || ((s.phoneNumber || '').replace(/\D/g, '') === cleanTxPhone))) return true;
        if (!cleanTxPhone && !displayIsPlaceholder && (s.fullName || '').trim().toLowerCase() === String(partyName).trim().toLowerCase()) return true;
        return false;
      });
      if (matchedStu) {
        if (displayIsPlaceholder && !isGenericPlaceholderName(matchedStu.fullName)) {
          partyName = matchedStu.fullName;
        }
        if (!matchedStudentCode) {
          matchedStudentCode = matchedStu.student_code_internal || matchedStu.studentCode || null;
        }
      }
    }
  }

  // Guard against pseudo-LRN: Never allow LEA or COL to become LRN
  if (matchedStudentCode && (matchedStudentCode.startsWith('LEA') || matchedStudentCode.startsWith('COL'))) {
    matchedStudentCode = null;
  }

  const finalLrnCode = (matchedStudentCode && !matchedStudentCode.startsWith('LEA') && !matchedStudentCode.startsWith('COL'))
    ? matchedStudentCode
    : normalizedLrnCode;

  // Fallback names
  if (isGenericPlaceholderName(partyName)) {
    if (ctMatch && ctMatch[1]) {
      partyName = toProperCase(ctMatch[1].trim());
    } else if (normalizedLeaCode) {
      partyName = 'Khách hàng tuyển sinh';
    } else if (tx.type === 'unclassified_in') {
      partyName = 'Khách hàng khóa học';
    } else if (tx.type === 'center_payment') {
      partyName = 'Trung tâm Đào tạo';
    } else if (tx.type === 'capital_injection') {
      partyName = 'Cẩm - Vốn góp';
    } else if (tx.type === 'expense') {
      partyName = 'Chi phí Vận hành';
    } else {
      partyName = 'Khách hàng';
    }
  }

  // Classify partyType & partyCode
  let partyCode = '';
  if (finalLrnCode) {
    partyType = 'learner';
    partyCode = finalLrnCode;
  } else if (normalizedLeaCode) {
    partyType = 'lead';
    partyCode = normalizedLeaCode;
  } else if (partyType === 'partner') {
    partyCode = partnerId ? ensureValidBusinessCode(partnerId, 'PRT') : 'B2B-PARTNER';
  } else if (tx.type === 'capital_injection' || tx.type === 'expense' || tx.type === 'owner_withdrawal') {
    partyType = 'internal';
    partyCode = 'INTERNAL';
  } else {
    partyType = 'unclassified';
    partyCode = tx.refCode || 'UNCLASSIFIED';
  }

  // Category Label
  let categoryLabel = '';
  if (tx.type === 'unclassified_in' || normalizedLeaCode) {
    categoryLabel = 'Thu học phí E-learning';
  } else if (tx.type === 'center_payment') {
    categoryLabel = 'Thu học phí Trung tâm';
  } else if (tx.type === 'capital_injection') {
    categoryLabel = 'Nạp vốn chủ sở hữu';
  } else if (tx.type === 'expense') {
    categoryLabel = 'Chi phí hoạt động';
  } else if (tx.type === 'owner_withdrawal') {
    categoryLabel = 'Rút về tài khoản VCB';
  } else if (tx.type === 'expected_revenue') {
    categoryLabel = 'Dự thu học phí';
  } else {
    categoryLabel = tx.type || 'Thanh toán';
  }

  // Clean description
  let cleanDescription = tx.description || tx.note || tx.originalContent || '---';
  const isSepayFormat = /^\[SePay[ -]?[A-Z?]*\]/i.test(cleanDescription) || 
    cleanDescription.startsWith('Thu hoc phi don') || 
    cleanDescription.startsWith('Thu học phí đơn');
  const isLenhThuFormat = /^\[LỆNH THU\]/i.test(cleanDescription) || /^\[LENH THU\]/i.test(cleanDescription);

  if (isSepayFormat) {
    if (normalizedLeaCode) {
      cleanDescription = 'Thu học phí E-learning';
    } else if (cleanDescription.includes('CP-TIENCOM')) {
      cleanDescription = 'Chi phí tiền cơm hoạt động';
    } else if (cleanDescription.includes('TT-VP')) {
      cleanDescription = 'Trung tâm VP thanh toán học phí';
    } else if (cleanDescription.includes('TT TEST PHI')) {
      cleanDescription = 'Trung tâm thanh toán học phí thử nghiệm';
    } else {
      cleanDescription = cleanDescription.replace(/^\[SePay\s*[\?\-A-Z]*\]\s*/i, '').trim() || cleanDescription;
    }
  } else if (isLenhThuFormat) {
    const noteMatch = cleanDescription.match(/\[Ghi chú:\s*([^\]]+)\]/i);
    cleanDescription = noteMatch ? `Lệnh thu học phí (${noteMatch[1].trim()})` : 'Lệnh thu học phí';
  } else if (cleanDescription.startsWith('Thu học phí đơn hàng E-learning') || cleanDescription.startsWith('Thu hoc phi don hang E-learning')) {
    cleanDescription = 'Thu học phí E-learning';
  }

  return {
    partyType,
    partyName,
    partyCode,
    lrnCode: finalLrnCode || undefined,
    leaCode: normalizedLeaCode || undefined,
    partnerId,
    contractCode,
    isPlaceholder: isGenericPlaceholderName(partyName),
    cleanDescription,
    isTestTransaction: isTest,
    categoryLabel,
  };
}

export interface LeadDebtItem {
  id: string;
  code: string; // LEA-XXXXXXXX
  name: string;
  phone?: string;
  email?: string;
  programName?: string;
  roadmap?: string;
  totalTuition: number;
  paidAmount: number;
  remainingDebt: number;
  status: string;
  paymentStatus?: string;
  studentId?: string;
  createdDate?: string;
}

export function calculateLeadDebt(
  lead: any,
  ledgerTransactions?: any[]
): LeadDebtItem {
  const totalTuition = Number(String(lead.tuition || '').replace(/\D/g, '')) || 0;
  const leadCode = ensureValidBusinessCode(lead.code || lead.id, 'LEA');
  const cleanDigits = leadCode.replace(/\D/g, '');

  let ledgerPaidSum = 0;
  if (ledgerTransactions && ledgerTransactions.length > 0) {
    ledgerPaidSum = ledgerTransactions.reduce((sum, tx) => {
      if (tx.type === 'expected_revenue') return sum;
      if (isTestTransaction(tx)) return sum;
      if ((tx.credit || 0) <= 0) return sum;
      const raw = `${tx.originalContent || ''} ${tx.description || ''} ${tx.refCode || ''} ${tx.studentId || ''}`.toUpperCase();
      const matches = cleanDigits.length >= 6 && (raw.includes(leadCode) || raw.includes('LEA' + cleanDigits) || raw.includes('LEA-' + cleanDigits));
      return matches ? sum + (tx.credit || 0) : sum;
    }, 0);
  }

  const actualPaid = Math.max(Number(lead.paidAmount || 0), ledgerPaidSum);
  const remainingDebt = totalTuition > 0 ? Math.max(0, totalTuition - actualPaid) : 0;

  return {
    id: String(lead.id),
    code: leadCode,
    name: lead.name || lead.fullName || 'Khách hàng',
    phone: lead.phone || lead.contact,
    email: lead.email,
    programName: lead.programName || lead.need,
    roadmap: lead.roadmap,
    totalTuition,
    paidAmount: actualPaid,
    remainingDebt,
    status: lead.status || 'Mới quan tâm',
    paymentStatus: lead.paymentStatus,
    studentId: lead.studentId,
    createdDate: lead.createdDate,
  };
}
```

---

### 4.3. Exact Changes to `AdminLedgerModule.tsx`

#### Change 1: Re-export `parseLedgerSmartInfo` via `resolveFinanceParty`
In `AdminLedgerModule.tsx`:
```ts
import { 
  resolveFinanceParty, 
  isTestTransaction, 
  isGenericPlaceholderName,
  calculateLeadDebt,
  LeadDebtItem 
} from '../../domain/financeIdentity';

// Helper format tên học viên và phân tích nội dung thông minh (wrapping resolveFinanceParty)
export const parseLedgerSmartInfo = (tx: any, allStudents?: UserProfile[], allCrmRecords?: any[]) => {
  const res = resolveFinanceParty(tx, {
    students: allStudents,
    crmRecords: allCrmRecords,
  });

  return {
    studentDisplay: res.partyName,
    typeLabel: res.categoryLabel,
    cleanDesc: res.cleanDescription,
    leaCode: res.leaCode || null,
    lrnCode: res.lrnCode || null,
    isTest: res.isTestTransaction,
    isPlaceholder: res.isPlaceholder,
    partyCode: res.partyCode,
  };
};
```

#### Change 2: Filter test transactions and separate `expected_revenue` in Ledger View
In `AdminLedgerModule.tsx` (lines 838–866):
```ts
  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return transactions.filter((tx) => {
      // 3-stream rule: Test transactions NEVER appear in general ledger
      if (isTestTransaction(tx)) return false;

      const smart = parseLedgerSmartInfo(tx, students, allCrmRecords);
      const matchSearch = !term ||
        (tx.studentName && tx.studentName.toLowerCase().includes(term)) ||
        (smart.studentDisplay && smart.studentDisplay.toLowerCase().includes(term)) ||
        (tx.refCode && tx.refCode.toLowerCase().includes(term)) ||
        (tx.description && tx.description.toLowerCase().includes(term)) ||
        (tx.originalContent && tx.originalContent.toLowerCase().includes(term)) ||
        (smart.leaCode && smart.leaCode.toLowerCase().includes(term)) ||
        (smart.lrnCode && smart.lrnCode.toLowerCase().includes(term)) ||
        (tx.studentId && String(tx.studentId).toLowerCase().includes(term));
      
      const txDate = new Date(tx.date);
      const matchYear = yearFilter === "all" || txDate.getFullYear().toString() === yearFilter;
      const matchMonth = monthFilter === "all" || (txDate.getMonth() + 1).toString() === monthFilter;
      
      return matchSearch && matchYear && matchMonth;
    });
  }, [transactions, searchTerm, yearFilter, monthFilter, students, allCrmRecords]);

  // Sổ cái thực tế: Chỉ hiển thị bút toán thực tế, không trộn lẫn dự thu
  const historyTransactions = useMemo(() => {
    return filteredTransactions.filter(tx => tx.type !== 'expected_revenue');
  }, [filteredTransactions]);
```

#### Change 3: Purify `summaryData` (Cash Flow)
In `AdminLedgerModule.tsx` (lines 868–909):
```ts
  const summaryData = useMemo(() => {
    const years: Record<string, any> = {};
    transactions.forEach((tx) => {
      // Stream 2 rule: Exclude all test transactions from financial metrics
      if (isTestTransaction(tx)) return;

      const year = tx.date.split("-")[0];
      const month = parseInt(tx.date.split("-")[1]);

      if (!years[year]) {
        years[year] = { 
            year, 
            totalCredit: 0, 
            totalDebit: 0, 
            totalExpected: 0,
            totalSurplus: 0,
            months: Array.from({length: 12}, (_, i) => ({ 
                month: i + 1, 
                credit: 0, 
                debit: 0, 
                expected: 0,
                surplus: 0, 
                profit: 0 
            })) 
        };
      }

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

#### Change 4: Fix `studentReport`
In `AdminLedgerModule.tsx` (lines 911–933):
```ts
  const studentReport = useMemo(() => {
    const report: Record<string, any> = {};
    transactions.forEach((tx) => {
      if (!tx.studentId) return;
      // Do NOT count test transactions or expected revenue as student payments
      if (isTestTransaction(tx) || tx.type === 'expected_revenue') return;

      const smart = parseLedgerSmartInfo(tx, students, allCrmRecords);
      const studentKey = smart.lrnCode || smart.leaCode || tx.studentId;
      const displayName = !isGenericPlaceholderName(smart.studentDisplay) ? smart.studentDisplay : (tx.studentName || 'Học viên');

      if (!report[studentKey]) {
        report[studentKey] = {
          id: studentKey,
          name: displayName,
          totalPaid: 0,
          totalCost: 0,
          totalSurplus: 0,
          lastDate: tx.date,
        };
      }
      report[studentKey].totalPaid += (tx.credit || 0);
      report[studentKey].totalCost += (tx.debit || 0);
      report[studentKey].totalSurplus += (tx.surplus || 0);
      if (new Date(tx.date) > new Date(report[studentKey].lastDate)) {
        report[studentKey].lastDate = tx.date;
      }
    });
    return Object.values(report).sort((a, b) => b.totalPaid - a.totalPaid);
  }, [transactions, students, allCrmRecords]);
```

#### Change 5: Exclude test and `expected_revenue` from MISA Export
In `AdminLedgerModule.tsx` (lines 1200–1242):
```ts
  const misaTransactions = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const term = searchTerm.trim().toLowerCase();

    return transactions.filter(tx => {
      // MISA Accounting Rule: Only authentic settled transactions can be exported
      if (isTestTransaction(tx)) return false;
      if (tx.type === 'expected_revenue') return false;

      const smart = parseLedgerSmartInfo(tx, students, allCrmRecords);
      const matchSearch = !term ||
        (tx.studentName && tx.studentName.toLowerCase().includes(term)) ||
        (smart.studentDisplay && smart.studentDisplay.toLowerCase().includes(term)) ||
        (smart.leaCode && smart.leaCode.toLowerCase().includes(term)) ||
        (smart.lrnCode && smart.lrnCode.toLowerCase().includes(term)) ||
        (tx.refCode && tx.refCode.toLowerCase().includes(term)) ||
        (tx.description && tx.description.toLowerCase().includes(term));
      if (!matchSearch) return false;

      // Period filter
      if (misaPeriodFilter === 'this_month') {
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() !== curYear || (txDate.getMonth() + 1) !== curMonth) return false;
      } else if (misaPeriodFilter === 'last_month') {
        const lastMonth = curMonth === 1 ? 12 : curMonth - 1;
        const lastMonthYear = curMonth === 1 ? curYear - 1 : curYear;
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() !== lastMonthYear || (txDate.getMonth() + 1) !== lastMonth) return false;
      } else if (misaPeriodFilter === 'this_quarter') {
        const curQuarter = Math.floor((curMonth - 1) / 3) + 1;
        const txDate = new Date(tx.date);
        const txQuarter = Math.floor(txDate.getMonth() / 3) + 1;
        if (txDate.getFullYear() !== curYear || txQuarter !== curQuarter) return false;
      }

      // Status filter
      if (misaStatusFilter === 'posted') {
        return (tx as any).misaStatus === 'posted';
      } else if (misaStatusFilter === 'unposted') {
        return (tx as any).misaStatus !== 'posted';
      }

      return true;
    });
  }, [transactions, searchTerm, misaPeriodFilter, misaStatusFilter, students, allCrmRecords]);
```

---

## 5. Verification Method

### 5.1. Unit Test Verification
Run the admissions debt sync test suite:
```bash
cd De_Vuong_Webapp
node --import tsx --test tests/admissionsDebtSync.test.ts
```
Expected result: **Pass 100% (4 tests pass, 0 fail)**.

Run the complete test suite:
```bash
cd De_Vuong_Webapp
npm test
```
Expected result: **Pass 100% (23/23 tests pass, 0 fail)**.

### 5.2. Build Verification
Run Vite bundle build:
```bash
cd De_Vuong_Webapp
npm run build
```
Expected result: **Exited with code 0, 0 build/bundle errors**.

### 5.3. Invalidation Conditions
- If any test in `admissionsDebtSync.test.ts` fails, or if pseudo-LRN is synthesized from `LEA-*` or `COL-*` digits, the change is invalid.
- If `CRMAdmissionsModule.tsx` writes a document to `crm_records` or `customer_profiles` with `code` missing, the change is invalid.
- If `historyTransactions`, `studentReport`, or `misaTransactions` contains transactions with `refCode: 'SP111111...'` or `type: 'expected_revenue'`, the change is invalid.
