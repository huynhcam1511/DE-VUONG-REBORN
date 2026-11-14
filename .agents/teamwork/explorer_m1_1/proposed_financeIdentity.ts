import { ensureValidBusinessCode } from '../../../De_Vuong_Webapp/src/utils/codeGenerator.js';
import { resolveStudentName, toProperCase } from '../../../De_Vuong_Webapp/src/utils/studentUtils.js';

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
    // Only format person names; do NOT re-case company names or internal preset labels
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
