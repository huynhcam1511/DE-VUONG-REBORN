import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const webappDir = 'c:/Users/zit/Documents/Antigravity/DE VUONG REBORN/De_Vuong_Webapp';
const require = createRequire(path.join(webappDir, 'package.json'));
const admin = require('firebase-admin');
const serviceAccountPath = path.join(webappDir, 'service-account.json');

if (!admin.apps.length) {
  try {
    const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(sa),
    });
  } catch (e) {
    console.error('Failed to init firebase admin:', e);
    process.exit(1);
  }
}

const db = admin.firestore();

async function runAnalysis() {
  console.log('=== RUNNING READ-ONLY FIRESTORE AUDIT ===\n');

  // 1. CRM Records & Customer Profiles
  const crmSnap = await db.collection('crm_records').get();
  const profileSnap = await db.collection('customer_profiles').get();

  console.log(`crm_records count: ${crmSnap.size}`);
  console.log(`customer_profiles count: ${profileSnap.size}`);

  const isPlaceholder = (val) => {
    if (!val) return true;
    const t = String(val).trim();
    return t === '' || t === 'Chưa đặt tên' || t === 'Học viên' || t === 'Học viên E-learning' || t === 'Khách hàng' || t === '---' || t === '—';
  };

  console.log('\n--- CRM RECORDS AUDIT ---');
  crmSnap.forEach(d => {
    const data = d.data();
    const name = data.name || data.fullName || '';
    const code = data.code;
    const phone = data.phone || data.contact || '';
    const email = data.email || '';
    const placeholder = isPlaceholder(name);
    const missingCode = !code || !String(code).startsWith('LEA-');
    if (placeholder || missingCode || d.id.startsWith('LEA-')) {
      console.log(`[CRM Doc] ID: ${d.id.padEnd(25)} | Name: "${name}" | Code: ${code || 'MISSING'} | Phone: ${phone} | Email: ${email}`);
    }
  });

  console.log('\n--- CUSTOMER PROFILES AUDIT ---');
  profileSnap.forEach(d => {
    const data = d.data();
    const name = data.name || data.fullName || '';
    const code = data.code;
    const phone = data.phone || data.contact || '';
    const email = data.email || '';
    const placeholder = isPlaceholder(name);
    const missingCode = !code || !String(code).startsWith('LEA-');
    if (placeholder || missingCode || d.id.startsWith('LEA-')) {
      console.log(`[Profile Doc] ID: ${d.id.padEnd(25)} | Name: "${name}" | Code: ${code || 'MISSING'} | Phone: ${phone} | Email: ${email}`);
    }
  });

  // 2. Ledger Transactions
  const ledgerSnap = await db.collection('ledger_transactions').get();
  console.log(`\nledger_transactions count: ${ledgerSnap.size}`);
  
  const expectedRev = [];
  const testLedger = [];
  const placeholderLedger = [];

  ledgerSnap.forEach(d => {
    const data = d.data();
    const desc = data.description || data.originalContent || data.note || '';
    const refCode = data.refCode || '';
    const id = d.id;
    const name = data.studentName || '';

    if (data.type === 'expected_revenue') {
      expectedRev.push({ id, refCode, name, desc, credit: data.credit });
    }
    if (refCode.includes('111111') || desc.includes('TEST') || desc.includes('test') || id.includes('111111')) {
      testLedger.push({ id, refCode, name, desc, credit: data.credit, debit: data.debit });
    }
    if (isPlaceholder(name)) {
      placeholderLedger.push({ id, refCode, name, desc });
    }
  });

  console.log(`\nFound ${expectedRev.length} expected_revenue records in ledger_transactions:`);
  expectedRev.slice(0, 10).forEach(r => console.log(`  - ${r.id} (${r.refCode}): "${r.desc}" credit=${r.credit}`));
  if (expectedRev.length > 10) console.log(`  ... and ${expectedRev.length - 10} more`);

  console.log(`\nFound ${testLedger.length} test records in ledger_transactions:`);
  testLedger.forEach(r => console.log(`  - ${r.id} (${r.refCode}): "${r.desc}" credit=${r.credit} debit=${r.debit}`));

  console.log(`\nFound ${placeholderLedger.length} placeholder studentName records in ledger_transactions`);

  // 3. Bank Events
  const bankSnap = await db.collection('bank_events').get();
  console.log(`\nbank_events count: ${bankSnap.size}`);
  const testBank = [];
  bankSnap.forEach(d => {
    const data = d.data();
    const content = data.content || '';
    const sepayId = data.sepayId || '';
    const bankRef = data.bankRef || '';
    if (content.includes('TEST') || content.includes('test') || String(sepayId).includes('111111') || String(bankRef).includes('111111')) {
      testBank.push({ id: d.id, sepayId, bankRef, content, amountIn: data.amountIn, amountOut: data.amountOut });
    }
  });
  console.log(`Found ${testBank.length} test records in bank_events:`);
  testBank.forEach(r => console.log(`  - ${r.id}: sepayId=${r.sepayId} bankRef=${r.bankRef} content="${r.content}" in=${r.amountIn} out=${r.amountOut}`));
}

runAnalysis().catch(console.error);
