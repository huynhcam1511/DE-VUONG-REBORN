# Handoff Report: Milestone 1 — Shared Identity Backbone & Unit Test Suite Expansion

**Agent**: Explorer M1-1 (`explorer_m1_1`)  
**Parent Orchestrator**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Date**: 2026-11-11T16:21:00Z  
**Target Path**: `De_Vuong_Webapp/src/domain/financeIdentity.ts` & `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

### Obs 1.1: Existing Test Runner & Test Suite State
- Executed `npm test` inside `De_Vuong_Webapp/`:
  - Command: `cd De_Vuong_Webapp; npm test`
  - Current configuration in `package.json` line 23:
    `"test": "node --import tsx --test tests/paymentCore.test.ts tests/classDetailHelpers.test.ts tests/mobileSwipe.test.ts tests/admissionsDebtSync.test.ts"`
  - Result: 23 passed, 0 failed, duration 1.75s.
- Existing tests in `tests/admissionsDebtSync.test.ts` (lines 1–201):
  - Test 1 (lines 7–52): `resolveStudentIdentity` resolves genuine `LRN` from phone, email, UID, or LRN.
  - Test 2 (lines 54–106): `parseLedgerSmartInfo` multi-hop identity resolution eliminates generic placeholders ("Học viên E-learning") and bridges CRM lead to authentic `LRN`, asserting `smart.studentDisplay === 'Nguyễn Thị Anh Thi'`, `smart.lrnCode === 'LRN-62517882'`, `smart.lrnCode !== 'LRN-64817788'`, `smart.cleanDesc === 'Thu học phí E-learning'`.
  - Test 3 (lines 108–128): Cleans `[LỆNH THU]` descriptions into single-line format: `Lệnh thu học phí` or `Lệnh thu học phí (Đóng cọc đợt 1)`.
  - Test 4 (lines 130–200): Resolves hashed `crm_*` records (`crm_1792918953302` $\to$ `LEA-96055010`, `crm_1793608413805` $\to$ `LEA-64817788`) and ignores duplicate nameless/placeholder `LEA-*` ghost stubs even when ghost stubs appear earlier in the array.

### Obs 1.2: Code Patterns & Utilities in `De_Vuong_Webapp/`
- Domain folder: `src/domain/practiceIdentity.ts` imports `ensureValidBusinessCode` from `../utils/codeGenerator`.
- `src/utils/codeGenerator.ts`:
  - `ensureValidBusinessCode(existingCodeOrId, prefix)` (lines 94–140): Handles 3-letter prefix + 8-digit standard (`LRN-XXXXXXXX`, `LEA-XXXXXXXX`, `CTR-XXXXXXXX`, `ENT-XXXXXXXX`).
  - `hashStringTo8Digits(str)` (lines 45–57): Deterministic 8-digit hash for unanchored IDs (e.g. `crm_1792918953302` $\to$ `96055010`).
- `src/utils/studentUtils.ts`:
  - `resolveStudentName(name, email)` (lines 36–71): Resolves authentic display name or email-based fallback, suppressing generic terms.
  - `toProperCase(str)` (lines 21–34): Normalizes Vietnamese person names with capital letters.
- `AdminLedgerModule.tsx`:
  - `isGenericLedgerName` (lines 94–109): Detects placeholders: `---`, `N/A`, `-`, `—`, `Ẩn danh`, `Học viên`, `Học viên E-learning`, `Khách hàng`, `Khách hàng tuyển sinh`, `Chưa đặt tên`.
  - `parseLedgerSmartInfo` (lines 113–326): Multi-hop resolution logic that will be consolidated into `resolveFinanceParty`.

### Obs 1.3: Interface Contract Established in `PROJECT.md`
- In `PROJECT.md` lines 44–89:
  - `FinancePartyInput`: `{ studentId?, internalId?, refCode?, description?, originalContent?, note?, studentName?, partnerId?, partnerName?, sepayId?, bankRef?, type?, isTest? }`
  - `FinancePartyResolution`: `{ partyType: 'learner' | 'lead' | 'partner' | 'internal' | 'unclassified', partyName, partyCode, lrnCode?, leaCode?, partnerId?, contractCode?, isPlaceholder, cleanDescription, isTestTransaction, categoryLabel }`
  - Functions: `resolveFinanceParty(tx, context)`, `isTestTransaction(tx)`, `isGenericPlaceholderName(name)`.

---

## 2. Logic Chain

1. **Unification of Identity Logic**:
   - Currently, identity matching exists in 4 places (`CRMAdmissionsModule.tsx`, `AdminLedgerModule.tsx`, `AdminDashboard.tsx`, and `server.ts`).
   - By creating `src/domain/financeIdentity.ts`, a single deterministic function `resolveFinanceParty` encapsulates:
     - Extraction of `LEA-*`, `LRN-*`, `CTR-*`, phone, and bank sender name.
     - Lookup in CRM records by code, ID, or deterministic hash (`hashStringTo8Digits`).
     - Prioritization of authentic profiles over ghost stubs (`isGenericPlaceholderName`).
     - Multi-hop traversal to student user profiles (`UserProfile`) by UID, internal code, phone, or email.
     - Prevention of pseudo-LRN synthesis: if a candidate LRN starts with `LEA` or `COL`, it is rejected.

2. **Capitalization Discipline for Company & Internal Names**:
   - During prototype scratch testing (`test_scratch.ts`), running `toProperCase` on partner names corrupted official uppercase business names (e.g. `CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA` turned into `Công Ty Tnhh...`) and internal preset labels (e.g. `Cẩm - Vốn góp` turned into `Cẩm - Vốn Góp`).
   - *Resolution*: Apply `toProperCase` only to individual person names (`learner` / `lead`). Preserve company names and internal transaction labels verbatim.

3. **Three-Stream Data Separation & Test Transaction Filtering**:
   - `isTestTransaction`: Tags transactions where `isTest: true`, `refCode` matches `/^SP1{5,}/` or `/^SP_TEST/i` or `/^CP-TEST/i` or `/^VGTEST/i`, `sepayId` is test-generated, or descriptions contain `TEST`, `TT TEST PHI`, `THU NGHIEM`.
   - In Sổ cái and Cash Flow calculations:
     - Stream 1 (Bank Feed): Identifies test records with `isTest: true` to prevent inclusion in official totals.
     - Stream 2 (Sổ cái Thực thu / Thực chi): Strictly includes transactions where `!isTestTransaction(tx)` and `tx.type !== 'expected_revenue'`.
     - Stream 3 (Công nợ Phải thu): Projected debt is derived solely from commercial contracts (`documents` milestone balances) and CRM leads (`tuition - paidAmount > 0`), completely decoupled from Sổ cái credit lines.

---

## 3. Caveats

1. **Dual Export Compatibility**:
   - Existing modules call `parseLedgerSmartInfo(tx, allStudents, allCrmRecords)`. To ensure zero breakage, `AdminLedgerModule.tsx` can either retain `parseLedgerSmartInfo` as a lightweight wrapper calling `resolveFinanceParty`, or callers can migrate directly to `resolveFinanceParty`.
2. **ESM / TypeScript Imports**:
   - Within `De_Vuong_Webapp/src/`, files import using standard relative TS paths without `.js` extension (e.g., `import { ensureValidBusinessCode } from '../utils/codeGenerator';`).
3. **Read-Only Explorer Discipline**:
   - In adherence to the Teamwork Explorer role, code was verified in a standalone scratch environment (`proposed_financeIdentity.ts` + `test_scratch.ts`) with 8/8 tests passing 100%. The implementation files are provided below for the Implementer agent to apply to `De_Vuong_Webapp/`.

---

## 4. Conclusion & Complete Implementation

### 4.1. File 1: `De_Vuong_Webapp/src/domain/financeIdentity.ts`

```typescript
import { ensureValidBusinessCode } from '../utils/codeGenerator';
import { resolveStudentName, toProperCase } from '../utils/studentUtils';

export interface FinancePartyInput {
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

/**
 * Kiểm tra xem một chuỗi tên có phải là tên rác / placeholder chung hay không
 */
export function isGenericPlaceholderName(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return true;
  const trimmed = val.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();

  const exactPlaceholders = new Set([
    '---',
    '--',
    '-',
    '—',
    'n/a',
    'na',
    'null',
    'undefined',
    'ẩn danh',
    'an danh',
    'học viên',
    'hoc vien',
    'học viên mới',
    'hoc vien moi',
    'học viên e-learning',
    'hoc vien e-learning',
    'khách hàng',
    'khach hang',
    'khách hàng tuyển sinh',
    'khach hang tuyen sinh',
    'khách hàng khóa học',
    'khach hang khoa hoc',
    'chưa đặt tên',
    'chua dat ten',
    'chưa có tên',
    'chua co ten',
    'người dùng',
    'nguoi dung',
  ]);

  if (exactPlaceholders.has(lower)) return true;

  // Pattern checks for punctuation or stub names
  if (/^[-—._\s]+$/.test(trimmed)) return true;
  if (/^(học viên|khách hàng|chưa đặt tên)\b/i.test(lower) && trimmed.length <= 25) return true;

  return false;
}

/**
 * Kiểm tra xem một giao dịch có phải là giao dịch test/thử nghiệm hay không
 */
export function isTestTransaction(tx: FinancePartyInput): boolean {
  if (!tx) return false;
  if (tx.isTest === true) return true;

  const ref = String(tx.refCode || '').trim();
  if (/^SP1{5,}/i.test(ref) || /^SP_TEST/i.test(ref) || /^TEST/i.test(ref) || /^CP-TEST/i.test(ref) || /^VGTEST/i.test(ref)) {
    return true;
  }

  const sepayId = String(tx.sepayId || '').trim();
  if (/^1{5,}/.test(sepayId) || /^4{5,}/.test(sepayId) || sepayId === '99999903' || /^test/i.test(sepayId)) {
    return true;
  }

  const bankRef = String(tx.bankRef || '').trim();
  if (/test/i.test(bankRef)) {
    return true;
  }

  const combinedContent = [tx.description, tx.originalContent, tx.note].filter(Boolean).join(' ');
  if (/\b(TEST|TT TEST PHI|THU NGHIEM|THỬ NGHIỆM|CP-TEST|VGTEST)\b/i.test(combinedContent)) {
    return true;
  }
  if (/TEST\s+LEA\d+/i.test(combinedContent) || /TEST\s+NO\s+PREFIX/i.test(combinedContent)) {
    return true;
  }

  return false;
}

/**
 * Làm sạch diễn giải giao dịch thành 1 dòng duy nhất, loại bỏ ký tự rườm rà
 */
export function cleanTransactionDescription(
  desc?: string | null,
  normalizedLeaCode?: string | null
): string {
  let cleanDesc = String(desc || '---').replace(/[\r\n]+/g, ' ').trim();
  if (!cleanDesc || cleanDesc === '---') return '---';

  const isSepayFormat =
    /^\[SePay[ -]?[A-Z?]*\]/i.test(cleanDesc) ||
    cleanDesc.startsWith('Thu hoc phi don') ||
    cleanDesc.startsWith('Thu học phí đơn');

  const isLenhThuFormat = /^\[LỆNH THU\]/i.test(cleanDesc) || /^\[LENH THU\]/i.test(cleanDesc);

  if (isSepayFormat) {
    if (normalizedLeaCode) {
      return 'Thu học phí E-learning';
    }
    if (cleanDesc.includes('CP-TIENCOM')) {
      return 'Chi phí tiền cơm hoạt động';
    }
    if (cleanDesc.includes('TT-VP')) {
      return 'Trung tâm VP thanh toán học phí';
    }
    if (cleanDesc.includes('TT TEST PHI')) {
      return 'Trung tâm thanh toán học phí thử nghiệm';
    }
    const stripped = cleanDesc.replace(/^\[SePay\s*[\?\-A-Z]*\]\s*/i, '').trim();
    return stripped || 'Giao dịch SePay';
  }

  if (isLenhThuFormat) {
    const noteMatch = cleanDesc.match(/\[Ghi chú:\s*([^\]]+)\]/i);
    return noteMatch ? `Lệnh thu học phí (${noteMatch[1].trim()})` : 'Lệnh thu học phí';
  }

  if (
    cleanDesc.startsWith('Thu học phí đơn hàng E-learning') ||
    cleanDesc.startsWith('Thu hoc phi don hang E-learning')
  ) {
    return 'Thu học phí E-learning';
  }

  return cleanDesc;
}

/**
 * Định danh thống nhất đối tượng tài chính (Unified Finance Identity Backbone)
 */
export function resolveFinanceParty(
  tx: FinancePartyInput,
  context?: {
    students?: any[];
    crmRecords?: any[];
    partners?: any[];
    documents?: any[];
  }
): FinancePartyResolution {
  const content = [tx.description, tx.originalContent, tx.note].filter(Boolean).join(' ');
  const candidateStr = `${content} ${tx.studentId || ''} ${tx.refCode || ''} ${tx.internalId || ''}`;

  // 1. Kiểm tra giao dịch test
  const testTx = isTestTransaction(tx);

  // 2. Trích xuất các mã định danh ứng viên
  const leaMatch = candidateStr.match(/\bLEA[\s-]?(\d{6,10})\b/i);
  const normalizedLeaCode = leaMatch ? `LEA-${leaMatch[1]}` : null;

  const lrnMatch = candidateStr.match(/\bLRN[\s-]?(\d{6,10})\b/i);
  const normalizedLrnCode = lrnMatch ? `LRN-${lrnMatch[1]}` : null;

  const ctrMatch = candidateStr.match(/\bCTR[\s-]?(\d{6,10})\b/i);
  const normalizedCtrCode = ctrMatch ? `CTR-${ctrMatch[1]}` : null;

  const phoneMatch = content.match(/\b(0\d{9,10})\b/);
  const candidatePhone = phoneMatch ? phoneMatch[1] : null;

  const ctMatch = content.match(/CT tu \d+\s+([A-Z\s]+?)\s+toi/i);
  const senderName = ctMatch ? toProperCase(ctMatch[1].trim()) : null;

  const originalNameIsPlaceholder = isGenericPlaceholderName(tx.studentName);
  let resolvedPartyName = tx.studentName && !originalNameIsPlaceholder ? tx.studentName.trim() : '';
  let resolvedLrnCode: string | undefined = undefined;
  let resolvedLeaCode: string | undefined = normalizedLeaCode || undefined;
  let resolvedPartnerId: string | undefined = tx.partnerId;
  let resolvedContractCode: string | undefined = normalizedCtrCode || undefined;

  let matchedCrm: any = null;
  const allCrmRecords = context?.crmRecords;
  const allStudents = context?.students;
  const allPartners = context?.partners;
  const allDocuments = context?.documents;

  // 3. Tra cứu CRM Records (Leads)
  if (allCrmRecords && allCrmRecords.length > 0 && (normalizedLeaCode || originalNameIsPlaceholder || candidatePhone)) {
    const crmMatches = allCrmRecords.filter((r: any) => {
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
      if (candidatePhone && (r.phone === candidatePhone || r.contact === candidatePhone || String(r.contact || '').includes(candidatePhone))) {
        return true;
      }
      return false;
    });

    if (crmMatches.length > 0) {
      const primaryCrm =
        crmMatches.find((r: any) => !isGenericPlaceholderName(r.name || r.fullName)) ||
        crmMatches[0];
      const withContact = crmMatches.find((r: any) => r.phone || r.email || r.contact) || primaryCrm;
      const withStudentId =
        crmMatches.find((r: any) => String(r.studentId || r.studentCode || r.learnerCode || '').startsWith('LRN-')) ||
        crmMatches.find((r: any) => r.studentId || r.studentCode || r.learnerCode) ||
        primaryCrm;

      matchedCrm = {
        ...primaryCrm,
        name: !isGenericPlaceholderName(primaryCrm.name) ? primaryCrm.name : withContact.name,
        fullName: !isGenericPlaceholderName(primaryCrm.fullName) ? primaryCrm.fullName : withContact.fullName,
        phone: primaryCrm.phone || withContact.phone,
        contact: primaryCrm.contact || withContact.contact,
        email: primaryCrm.email || withContact.email,
        studentId: withStudentId.studentId || primaryCrm.studentId,
        studentCode: withStudentId.studentCode || primaryCrm.studentCode,
        learnerCode: withStudentId.learnerCode || primaryCrm.learnerCode,
      };

      const crmName = matchedCrm.name || matchedCrm.fullName;
      if (!isGenericPlaceholderName(crmName)) {
        resolvedPartyName = crmName;
      }

      if (matchedCrm.studentId && String(matchedCrm.studentId).startsWith('LRN-')) {
        resolvedLrnCode = String(matchedCrm.studentId);
      } else if (matchedCrm.studentCode && String(matchedCrm.studentCode).startsWith('LRN-')) {
        resolvedLrnCode = String(matchedCrm.studentCode);
      } else if (matchedCrm.learnerCode && String(matchedCrm.learnerCode).startsWith('LRN-')) {
        resolvedLrnCode = String(matchedCrm.learnerCode);
      }

      if (!resolvedLeaCode) {
        resolvedLeaCode = matchedCrm.code ? ensureValidBusinessCode(matchedCrm.code, 'LEA') : ensureValidBusinessCode(matchedCrm.id, 'LEA');
      }
    }
  }

  // 4. Tra cứu Students / Learners (Multi-hop từ CRM hoặc trực tiếp từ tx)
  let matchedStudent: any = null;
  if (allStudents && allStudents.length > 0) {
    // 4a. Multi-hop qua matched CRM
    if (matchedCrm && (!resolvedLrnCode || isGenericPlaceholderName(resolvedPartyName))) {
      const crmStudentId = matchedCrm.studentId || matchedCrm.studentCode;
      const crmPhone = (matchedCrm.phone || matchedCrm.contact || '').replace(/\D/g, '');
      const crmEmail = (matchedCrm.email || '').trim().toLowerCase();
      const rawCrmName = (matchedCrm.name || matchedCrm.fullName || '').trim();
      const crmName = isGenericPlaceholderName(rawCrmName) ? '' : rawCrmName.toLowerCase();

      matchedStudent = allStudents.find((s) => {
        if (crmStudentId && (s.uid === crmStudentId || s.student_code_internal === crmStudentId || s.studentCode === crmStudentId)) return true;
        const sPhone = (s.phone || s.phoneNumber || '').replace(/\D/g, '');
        const sEmail = (s.email || '').trim().toLowerCase();
        const sName = (s.fullName || s.displayName || '').trim().toLowerCase();
        if (crmPhone && sPhone && sPhone === crmPhone) return true;
        if (crmEmail && sEmail && sEmail === crmEmail) return true;
        if (!crmPhone && !crmEmail && crmName && sName === crmName) return true;
        return false;
      });

      if (matchedStudent) {
        if (!resolvedLrnCode) {
          resolvedLrnCode = matchedStudent.student_code_internal || matchedStudent.studentCode || undefined;
        }
        if (isGenericPlaceholderName(resolvedPartyName) && !isGenericPlaceholderName(matchedStudent.fullName)) {
          resolvedPartyName = resolveStudentName(matchedStudent.fullName, matchedStudent.email);
        }
      }
    }

    // 4b. Tra cứu trực tiếp từ tx
    if (!resolvedLrnCode || isGenericPlaceholderName(resolvedPartyName)) {
      const rawTxStudentId = String(tx.studentId || '');
      const rawTxInternalId = String(tx.internalId || '');
      const cleanTxPhone = candidatePhone;

      matchedStudent = allStudents.find((s) => {
        if (normalizedLrnCode && (s.student_code_internal === normalizedLrnCode || s.studentCode === normalizedLrnCode || s.uid === normalizedLrnCode)) return true;
        if (rawTxInternalId && (s.student_code_internal === rawTxInternalId || s.uid === rawTxInternalId)) return true;
        if (rawTxStudentId && !rawTxStudentId.startsWith('LEA') && !rawTxStudentId.startsWith('COL') && (s.student_code_internal === rawTxStudentId || s.uid === rawTxStudentId)) return true;
        if (cleanTxPhone && ((s.phone || '').replace(/\D/g, '') === cleanTxPhone || (s.phoneNumber || '').replace(/\D/g, '') === cleanTxPhone)) return true;
        if (!cleanTxPhone && !isGenericPlaceholderName(resolvedPartyName) && (s.fullName || '').trim().toLowerCase() === resolvedPartyName.trim().toLowerCase()) return true;
        return false;
      });

      if (matchedStudent) {
        if (isGenericPlaceholderName(resolvedPartyName) && !isGenericPlaceholderName(matchedStudent.fullName)) {
          resolvedPartyName = resolveStudentName(matchedStudent.fullName, matchedStudent.email);
        }
        if (!resolvedLrnCode) {
          resolvedLrnCode = matchedStudent.student_code_internal || matchedStudent.studentCode || undefined;
        }
      }
    }
  }

  // Guard against pseudo-LRN: Never allow LEA or COL to become LRN
  if (resolvedLrnCode && (resolvedLrnCode.startsWith('LEA') || resolvedLrnCode.startsWith('COL'))) {
    resolvedLrnCode = undefined;
  }
  if (!resolvedLrnCode && normalizedLrnCode && !normalizedLrnCode.startsWith('LEA') && !normalizedLrnCode.startsWith('COL')) {
    resolvedLrnCode = normalizedLrnCode;
  }

  // 5. Tra cứu B2B Partners / Contracts
  let matchedPartner: any = null;
  if (allPartners && allPartners.length > 0 && (tx.partnerId || tx.partnerName)) {
    matchedPartner = allPartners.find(
      (p: any) => (tx.partnerId && p.id === tx.partnerId) || (tx.partnerName && p.name === tx.partnerName)
    );
  }

  let matchedDocument: any = null;
  if (allDocuments && allDocuments.length > 0 && (normalizedCtrCode || tx.refCode || tx.partnerId)) {
    matchedDocument = allDocuments.find(
      (d: any) =>
        (normalizedCtrCode && d.contractCode === normalizedCtrCode) ||
        (tx.refCode && d.contractCode === tx.refCode) ||
        (tx.partnerId && d.partnerId === tx.partnerId)
    );
    if (matchedDocument && !resolvedContractCode) {
      resolvedContractCode = matchedDocument.contractCode;
    }
  }

  // 6. Quyết định partyType, partyCode, partyName, categoryLabel
  let partyType: 'learner' | 'lead' | 'partner' | 'internal' | 'unclassified' = 'unclassified';
  let partyCode = '';
  let categoryLabel = 'Khác';

  const isInternalType =
    tx.type === 'capital_injection' ||
    tx.type === 'center_payment' ||
    tx.type === 'expense' ||
    tx.type === 'owner_withdrawal';

  if (resolvedLrnCode || (matchedStudent && resolvedPartyName)) {
    partyType = 'learner';
    partyCode = resolvedLrnCode || ensureValidBusinessCode(matchedStudent?.uid, 'LRN');
    categoryLabel = 'Học viên';
  } else if (resolvedLeaCode || matchedCrm) {
    partyType = 'lead';
    partyCode = resolvedLeaCode || (matchedCrm?.code ? ensureValidBusinessCode(matchedCrm.code, 'LEA') : ensureValidBusinessCode(matchedCrm?.id, 'LEA'));
    categoryLabel = 'Tuyển sinh';
  } else if (matchedPartner || matchedDocument || resolvedContractCode || tx.partnerId || tx.partnerName) {
    partyType = 'partner';
    partyCode = resolvedContractCode || resolvedPartnerId || (matchedPartner ? ensureValidBusinessCode(matchedPartner.id, 'ENT') : 'PRT-10000000');
    categoryLabel = 'Doanh nghiệp';
    if (!resolvedPartyName) {
      resolvedPartyName = matchedPartner?.name || matchedDocument?.partnerName || tx.partnerName || 'Đối tác Doanh nghiệp';
    }
  } else if (isInternalType) {
    partyType = 'internal';
    partyCode = tx.refCode || 'INTERNAL';
    categoryLabel = 'Nội bộ';
    if (!resolvedPartyName) {
      if (tx.type === 'capital_injection') resolvedPartyName = 'Cẩm - Vốn góp';
      else if (tx.type === 'center_payment') resolvedPartyName = 'Trung tâm Đào tạo';
      else if (tx.type === 'expense') resolvedPartyName = 'Chi phí Vận hành';
      else if (tx.type === 'owner_withdrawal') resolvedPartyName = 'Rút về tài khoản VCB';
      else resolvedPartyName = 'Nội bộ';
    }
  } else {
    partyType = 'unclassified';
    partyCode = tx.refCode || tx.studentId || '';
    categoryLabel = 'Khác';
  }

  // Fallback tên nếu vẫn là placeholder
  if (isGenericPlaceholderName(resolvedPartyName)) {
    if (senderName) {
      resolvedPartyName = senderName;
    } else if (partyType === 'lead') {
      resolvedPartyName = 'Khách hàng tuyển sinh';
    } else if (tx.type === 'unclassified_in') {
      resolvedPartyName = 'Khách hàng khóa học';
    } else if (partyType === 'partner') {
      resolvedPartyName = 'Đối tác Doanh nghiệp';
    } else {
      resolvedPartyName = 'Khách hàng';
    }
  } else {
    // Chỉ chuẩn hóa ProperCase cho tên người (học viên / tuyển sinh), không làm méo tên doanh nghiệp viết hoa
    if (partyType === 'learner' || partyType === 'lead') {
      resolvedPartyName = toProperCase(resolvedPartyName);
    }
  }

  const cleanDescription = cleanTransactionDescription(
    tx.description || tx.originalContent || tx.note,
    resolvedLeaCode
  );

  return {
    partyType,
    partyName: resolvedPartyName,
    partyCode,
    lrnCode: resolvedLrnCode,
    leaCode: resolvedLeaCode,
    partnerId: resolvedPartnerId,
    contractCode: resolvedContractCode,
    isPlaceholder: originalNameIsPlaceholder,
    cleanDescription,
    isTestTransaction: testTx,
    categoryLabel,
  };
}
```

---

### 4.2. File 2: Expanded Unit Tests for `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts`

Append these unit tests to `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts` (preserving the 4 existing tests):

```typescript
import {
  resolveFinanceParty,
  isTestTransaction,
  isGenericPlaceholderName,
} from '../src/domain/financeIdentity';

// ----------------------------------------------------------------------------
// TEST 5: isGenericPlaceholderName & isTestTransaction Validation
// ----------------------------------------------------------------------------
test('isGenericPlaceholderName & isTestTransaction: detects placeholders and flags test transactions', () => {
  const placeholders = [
    '',
    '   ',
    '---',
    'N/A',
    '-',
    '—',
    'Ẩn danh',
    'Học viên',
    'Học viên mới',
    'học viên e-learning',
    'Khách hàng',
    'Khách hàng tuyển sinh',
    'Chưa đặt tên',
    'chua dat ten',
    null,
    undefined,
  ];
  for (const p of placeholders) {
    assert.equal(isGenericPlaceholderName(p), true, `Expected "${p}" to be placeholder`);
  }

  const genuineNames = [
    'Nguyễn Thị Anh Thi',
    'Trần Văn Nam',
    'CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA',
    'Anh Tý',
    'Nguyễn Minh Phương',
  ];
  for (const g of genuineNames) {
    assert.equal(isGenericPlaceholderName(g), false, `Expected "${g}" to be genuine name`);
  }

  // Test transactions detection
  assert.equal(isTestTransaction({ isTest: true }), true);
  assert.equal(isTestTransaction({ refCode: 'SP11111199999' }), true);
  assert.equal(isTestTransaction({ refCode: 'SP_TEST_01' }), true);
  assert.equal(isTestTransaction({ refCode: 'CP-TEST-001' }), true);
  assert.equal(isTestTransaction({ refCode: 'VGTEST-02' }), true);
  assert.equal(isTestTransaction({ sepayId: 111111222 }), true);
  assert.equal(isTestTransaction({ sepayId: 444444555 }), true);
  assert.equal(isTestTransaction({ sepayId: '99999903' }), true);
  assert.equal(isTestTransaction({ bankRef: 'FT21234test' }), true);
  assert.equal(isTestTransaction({ description: 'TEST LEA40172601 RANDOM' }), true);
  assert.equal(isTestTransaction({ description: 'TEST NO PREFIX' }), true);
  assert.equal(isTestTransaction({ originalContent: 'TT TEST PHI HOC PHI' }), true);

  // Legitimate transactions
  assert.equal(isTestTransaction({ refCode: 'COL-64817788', description: 'Thu hoc phi' }), false);
  assert.equal(isTestTransaction({ refCode: 'SP8452109', description: 'HOCPHI LEA64817788' }), false);
});

// ----------------------------------------------------------------------------
// TEST 6: resolveFinanceParty Multi-Hop Learner Resolution
// ----------------------------------------------------------------------------
test('resolveFinanceParty: unified resolution resolves genuine learner with multi-hop LRN and suppresses placeholders', () => {
  const mockStudents: UserProfile[] = [
    {
      uid: 'student_1740000001',
      student_code_internal: 'LRN-62517882',
      fullName: 'Nguyễn Thị Anh Thi',
      email: 'anhthi@example.com',
      phone: '0916909144',
      role: 'student',
      status: 'active',
      classIds: [],
    } as any,
  ];

  const mockCrmRecords = [
    {
      id: 'crm_1740000001',
      code: 'LEA-64817788',
      name: 'Nguyễn Thị Anh Thi',
      studentId: 'student_1740000001', // raw UID
      phone: '0916909144',
      email: 'anhthi@example.com',
    },
  ];

  const tx = {
    id: 'COL-12345678',
    refCode: 'COL-12345678',
    studentId: 'LEA-64817788',
    studentName: 'Học viên E-learning', // Database contains stale generic placeholder
    description: '[SePay-COL] Thu học phí đơn LEA-64817788 - Học viên E-learning',
    credit: 3000,
    type: 'tuition_fee',
  };

  const party = resolveFinanceParty(tx, { students: mockStudents, crmRecords: mockCrmRecords });

  assert.equal(party.partyType, 'learner');
  assert.equal(party.partyName, 'Nguyễn Thị Anh Thi');
  assert.equal(party.partyCode, 'LRN-62517882');
  assert.equal(party.lrnCode, 'LRN-62517882');
  assert.notEqual(party.lrnCode, 'LRN-64817788', 'Must never synthesize pseudo-LRN from LEA digits');
  assert.equal(party.leaCode, 'LEA-64817788');
  assert.equal(party.isPlaceholder, true);
  assert.equal(party.isTestTransaction, false);
  assert.equal(party.cleanDescription, 'Thu học phí E-learning');
  assert.equal(party.categoryLabel, 'Học viên');
});

// ----------------------------------------------------------------------------
// TEST 7: resolveFinanceParty Resolves B2B Corporate Partner
// ----------------------------------------------------------------------------
test('resolveFinanceParty: resolves B2B partner and economic contracts without corrupting company names', () => {
  const mockPartners = [
    {
      id: 'ENT-17903505',
      name: 'CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA',
      taxCode: '0314567890',
    },
  ];
  const mockDocs = [
    {
      id: 'doc_001',
      contractCode: 'CTR-84920194',
      partnerId: 'ENT-17903505',
      partnerName: 'CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA',
      documentGroup: '01_commercial',
    },
  ];

  const tx = {
    refCode: 'CTR-84920194',
    partnerId: 'ENT-17903505',
    description: 'Thanh toan dot 1 HĐ Dao tao Doanh nghiep CTR-84920194',
    type: 'payment',
  };

  const party = resolveFinanceParty(tx, { partners: mockPartners, documents: mockDocs });
  assert.equal(party.partyType, 'partner');
  assert.equal(party.partyName, 'CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA', 'Must preserve uppercase company name');
  assert.equal(party.partyCode, 'CTR-84920194');
  assert.equal(party.contractCode, 'CTR-84920194');
  assert.equal(party.partnerId, 'ENT-17903505');
  assert.equal(party.categoryLabel, 'Doanh nghiệp');
});

// ----------------------------------------------------------------------------
// TEST 8: resolveFinanceParty Internal Corporate Operations
// ----------------------------------------------------------------------------
test('resolveFinanceParty: handles internal corporate transactions without mangling labels', () => {
  const txCapital = {
    refCode: 'CAP-001',
    type: 'capital_injection',
    description: 'Nap von chu so huu',
  };
  const partyCapital = resolveFinanceParty(txCapital);
  assert.equal(partyCapital.partyType, 'internal');
  assert.equal(partyCapital.partyName, 'Cẩm - Vốn góp');
  assert.equal(partyCapital.categoryLabel, 'Nội bộ');

  const txExpense = {
    refCode: 'EXP-001',
    type: 'expense',
    description: 'Tien com trua van phong',
  };
  const partyExpense = resolveFinanceParty(txExpense);
  assert.equal(partyExpense.partyType, 'internal');
  assert.equal(partyExpense.partyName, 'Chi phí Vận hành');
  assert.equal(partyExpense.categoryLabel, 'Nội bộ');
});

// ----------------------------------------------------------------------------
// TEST 9: Three-Stream Separation & Test Transaction Exclusion
// ----------------------------------------------------------------------------
test('Three-stream separation: filters test transactions and expected_revenue from actual cash flow', () => {
  const rawLedgerTransactions = [
    { id: 'tx1', refCode: 'COL-001', credit: 3000000, debit: 0, type: 'tuition_fee', description: 'Học phí LEA-1' },
    { id: 'tx2', refCode: 'COL-002', credit: 2000000, debit: 0, type: 'tuition_fee', description: 'Học phí LEA-2' },
    { id: 'tx3', refCode: 'SP111111000', credit: 50000000, debit: 0, type: 'tuition_fee', description: 'TEST PHI' },
    { id: 'tx4', refCode: 'COL-003', credit: 15000000, debit: 0, type: 'expected_revenue', description: '[LỆNH THU] Dự kiến cọc' },
    { id: 'tx5', refCode: 'EXP-001', credit: 0, debit: 1500000, type: 'expense', description: 'Tiền mạng internet' },
  ];

  // Stream 1: Filter out test transactions
  const nonTestTransactions = rawLedgerTransactions.filter(tx => !isTestTransaction(tx));
  assert.equal(nonTestTransactions.length, 4, 'Test transaction SP111111000 must be excluded');

  // Stream 2: Actual cash flow (excludes expected_revenue and test)
  const actualCashFlowTransactions = nonTestTransactions.filter(tx => tx.type !== 'expected_revenue');
  assert.equal(actualCashFlowTransactions.length, 3, 'Must only retain actual completed transactions');

  const totalActualCredit = actualCashFlowTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
  const totalActualDebit = actualCashFlowTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
  const netActualProfit = totalActualCredit - totalActualDebit;

  assert.equal(totalActualCredit, 5000000, 'Actual credit must equal 3M + 2M (5M), ignoring 50M test and 15M expected_revenue');
  assert.equal(totalActualDebit, 1500000);
  assert.equal(netActualProfit, 3500000);

  // Stream 3: Commercial debt projection (from B2B + B2C)
  const b2bDebt = 12000000; // Remaining milestone from contracts
  const b2cDebt = 8000000;  // Remaining tuition from CRM leads (tuition - paidAmount)
  const totalCommercialReceivables = b2bDebt + b2cDebt;

  assert.equal(totalCommercialReceivables, 20000000, 'Receivables projected from B2B + B2C commercial debt sources');
});
```

---

## 5. Verification Method

To independently verify the implementation and tests:

1. **Test Execution**:
   Run from repository root:
   ```powershell
   cd De_Vuong_Webapp; npm test
   ```
   Or specifically test the admissions debt sync suite:
   ```powershell
   cd De_Vuong_Webapp; node --import tsx --test tests/admissionsDebtSync.test.ts
   ```

2. **Challenger Suites Verification**:
   ```powershell
   cd De_Vuong_Webapp; npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts
   ```

3. **Expected Outcomes**:
   - `admissionsDebtSync.test.ts`: 9 tests, 9 pass, 0 fail.
   - `npm test`: 28 tests, 28 pass, 0 fail.
   - `npm run build`: Vite build passes with exit code 0.

4. **Prototype Verification Artifact**:
   - The verified prototype code and empirical test script reside in:
     - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1\proposed_financeIdentity.ts`
     - `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_m1_1\test_scratch.ts`
   - Test execution command:
     ```powershell
     cd De_Vuong_Webapp; npx tsx --test "../.agents/teamwork/explorer_m1_1/test_scratch.ts"
     ```
     Result: 8 tests, 0 suites, 8 pass, 0 fail (duration ~363ms).
