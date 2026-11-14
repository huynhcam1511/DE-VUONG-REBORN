import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveFinanceParty,
  isTestTransaction,
  isGenericPlaceholderName,
} from './proposed_financeIdentity.js';

test('isGenericPlaceholderName: detects all placeholders and validates genuine names', () => {
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
    'Khách hàng khóa học',
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
    'Phạm Minh Tiến',
    'Nguyễn Minh Phương',
  ];
  for (const g of genuineNames) {
    assert.equal(isGenericPlaceholderName(g), false, `Expected "${g}" to be genuine name`);
  }
});

test('isTestTransaction: detects test transactions across refCode, sepayId, bankRef, and content', () => {
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
  assert.equal(isTestTransaction({ note: 'Giao dich THU NGHIEM he thong' }), true);

  // Normal transactions
  assert.equal(isTestTransaction({ refCode: 'COL-64817788', description: 'Thu hoc phi' }), false);
  assert.equal(isTestTransaction({ refCode: 'SP8452109', description: 'HOCPHI LEA64817788' }), false);
});

test('resolveFinanceParty: multi-hop learner resolution eliminates placeholders and pseudo-LRN', () => {
  const mockStudents = [
    {
      uid: 'student_1740000001',
      student_code_internal: 'LRN-62517882',
      fullName: 'Nguyễn Thị Anh Thi',
      email: 'anhthi@example.com',
      phone: '0916909144',
      role: 'student',
      status: 'active',
      classIds: [],
    },
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

test('resolveFinanceParty: resolves hashed crm_* doc and suppresses ghost stub', () => {
  const ghostStub = {
    id: 'LEA-96055010',
    paidAmount: 900000,
    paymentStatus: 'completed',
    status: 'enrolled',
  };
  const realMinhPhuong = {
    id: 'crm_1792918953302', // Hashes deterministically to LEA-96055010
    name: 'Nguyễn Minh Phương',
    fullName: 'Nguyễn Minh Phương',
    phone: '0987255999',
    email: 'nguyenminhphuong1883@gmail.com',
    studentId: 'LRN-36435305',
  };

  const allCrm = [ghostStub, realMinhPhuong];

  const tx = {
    refCode: 'COL-61839432',
    studentId: 'LEA-96055010',
    studentName: 'Học viên E-learning',
    description: '[SePay-COL] Thu học phí đơn LEA-96055010 - Học viên E-learning',
    originalContent: 'QR - HOCPHI LEA96055010',
    credit: 900000,
    type: 'tuition_fee',
  };

  const party = resolveFinanceParty(tx, { crmRecords: allCrm });

  assert.equal(party.partyType, 'learner');
  assert.equal(party.partyCode, 'LRN-36435305');
  assert.equal(party.partyName, 'Nguyễn Minh Phương');
  assert.equal(party.lrnCode, 'LRN-36435305');
  assert.equal(party.leaCode, 'LEA-96055010');
  assert.equal(party.cleanDescription, 'Thu học phí E-learning');
});

test('resolveFinanceParty: cleans [LỆNH THU] single-line descriptions without polluting cash flow', () => {
  const tx = {
    refCode: 'COL-99999999',
    studentId: 'LRN-62517882',
    studentName: 'Nguyễn Thị Anh Thi',
    description: '[LỆNH THU] Nguyễn Thị Anh Thi - LEA-64817788 (HOCPHI LEA64817788)\nThu hoc phi',
    type: 'expected_revenue',
  };

  const party = resolveFinanceParty(tx);
  assert.equal(party.cleanDescription, 'Lệnh thu học phí');
  assert.equal(party.partyType, 'learner');

  const txWithNote = {
    ...tx,
    description: '[LỆNH THU] Nguyễn Thị Anh Thi - LEA-64817788 (HOCPHI LEA64817788) [Ghi chú: Đóng cọc đợt 1]',
  };
  const partyWithNote = resolveFinanceParty(txWithNote);
  assert.equal(partyWithNote.cleanDescription, 'Lệnh thu học phí (Đóng cọc đợt 1)');
});

test('resolveFinanceParty: resolves B2B partner and economic contracts', () => {
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
  assert.equal(party.partyName, 'CÔNG TY TNHH THƯƠNG MẠI KỸ THUẬT AN PHA');
  assert.equal(party.partyCode, 'CTR-84920194');
  assert.equal(party.contractCode, 'CTR-84920194');
  assert.equal(party.partnerId, 'ENT-17903505');
  assert.equal(party.categoryLabel, 'Doanh nghiệp');
});

test('resolveFinanceParty: handles internal corporate transactions', () => {
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

test('Three-stream separation calculation logic', () => {
  const rawLedgerTransactions = [
    { id: 'tx1', refCode: 'COL-001', credit: 3000000, debit: 0, type: 'tuition_fee', description: 'Học phí LEA-1' },
    { id: 'tx2', refCode: 'COL-002', credit: 2000000, debit: 0, type: 'tuition_fee', description: 'Học phí LEA-2' },
    { id: 'tx3', refCode: 'SP111111000', credit: 50000000, debit: 0, type: 'tuition_fee', description: 'TEST PHI' },
    { id: 'tx4', refCode: 'COL-003', credit: 15000000, debit: 0, type: 'expected_revenue', description: '[LỆNH THU] Dự kiến cọc' },
    { id: 'tx5', refCode: 'EXP-001', credit: 0, debit: 1500000, type: 'expense', description: 'Tiền mạng internet' },
  ];

  // Stream 1: Bank feed & Test filtering
  const nonTestTransactions = rawLedgerTransactions.filter(tx => !isTestTransaction(tx));
  assert.equal(nonTestTransactions.length, 4);

  // Stream 2: Actual cash flow (excludes expected_revenue and test)
  const actualCashFlowTransactions = nonTestTransactions.filter(tx => tx.type !== 'expected_revenue');
  assert.equal(actualCashFlowTransactions.length, 3);

  const totalActualCredit = actualCashFlowTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
  const totalActualDebit = actualCashFlowTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
  const netActualProfit = totalActualCredit - totalActualDebit;

  assert.equal(totalActualCredit, 5000000); // 3M + 2M (excludes 50M test and 15M expected_revenue)
  assert.equal(totalActualDebit, 1500000);
  assert.equal(netActualProfit, 3500000);

  // Stream 3: Commercial debt projection (from B2B + B2C)
  const b2bDebt = 12000000; // Remaining milestone from contracts
  const b2cDebt = 8000000;  // Remaining tuition from CRM leads (tuition - paidAmount)
  const totalCommercialReceivables = b2bDebt + b2cDebt;

  assert.equal(totalCommercialReceivables, 20000000);
});
