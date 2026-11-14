# Handoff Report — Explorer M1-2: SePay Webhook Hardening & Ghost Stub Elimination

**Explorer**: Explorer M1-2 (`explorer_m1_2`)  
**Parent Agent**: Lead Orchestrator (`029cef84-8361-4084-a50e-50f632a7bb27`)  
**Milestone**: Milestone 1 (Data Layer & Identity Backbone)  
**Date**: 2026-11-11T16:25:00Z  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

### 1.1. Ingestion Architecture in `server.ts`
- **Location**: `De_Vuong_Webapp/server.ts`, lines 2776–3352 (`const sepayHandler = async (req: any, res: any) => { ... }`).
- **Parsing of Webhook Payload** (lines 2791–2801):
  ```typescript
  const amount_in   = parseInt(req.body.amount_in  || (req.body.transferType === "in" ? req.body.transferAmount : "0") || "0");
  const amount_out  = parseInt(req.body.amount_out || (req.body.transferType === "out" ? req.body.transferAmount : "0") || "0");
  const content     = (req.body.transaction_content || req.body.content || "").trim();
  const sourceDate  = req.body.transaction_date || req.body.transactionDate;
  const date        = normalizeVietnamDateTime(sourceDate) || new Date().toISOString();
  const sepayId     = req.body.id || null;
  const bankRef     = req.body.reference_number || req.body.referenceCode || null;
  const refCode     = `SP${sepayId || bankRef || Date.now()}`;
  const bankEventId = createBankEventId(sepayId, bankRef);
  ```
- **Current Observation**:
  - `sepayHandler` does not compute or assign `isTest` anywhere.
  - Transactions originating from SePay test calls (e.g. `sepayId = "111111"`, `refCode = "SP111111..."`, or `content` containing `"TEST"`) are written with `status: 'completed'` and `isTest: undefined`.
  - In Firestore, over 50 test events exist in `bank_events` and 10+ in `ledger_transactions` with `sepayId` matching `111111...` or descriptions with `TEST PHI`, `CP-TEST`, `VGTEST` (verified in `explorer_survey3_3/handoff.md`).

### 1.2. The 4 Write Sites to `bank_events` and `ledger_transactions`
There are exactly four write sites in `server.ts`:
1. **Helper `recordLedgerEvent`** (lines 2814–2847):
   Handles:
   - Line 2999: `payment_review`
   - Line 3261: `center_payment` (`TT`)
   - Line 3277: `capital_injection` (`VG`)
   - Line 3293: `expense` (`CP`)
   - Line 3309: `owner_withdrawal` (`RT`/`WD`)
   - Line 3323: `unclassified_out`
   - Line 3337: `unclassified_in`
   Current code (lines 2823–2840):
   ```typescript
   tx.create(bankEventRef, {
     sepayId, bankRef, amountIn: amount_in, amountOut: amount_out,
     content, transactionDate: date, classification: ledgerData.type,
     status: 'completed', receivedAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
     surplus: 0, autoClassified: true, needsReview: false,
     createdAt: admin.firestore.FieldValue.serverTimestamp(),
     ...ledgerData,
   });
   ```
2. **Payment Intent Refund** (lines 2894–2900):
   ```typescript
   tx.create(bankEventRef, {
     sepayId, bankRef, amountIn: 0, amountOut: amount_out, content,
     transactionDate: date, classification: 'refund', paymentIntentId: intentDoc.id,
     studentId: userId, status: 'completed', receivedAt: admin.firestore.FieldValue.serverTimestamp()
   });
   tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
     date, sepayId, bankRef, refCode, studentName: intentData.studentName || 'N/A', studentId: userId,
     description: `[SePay-REFUND] ${content}`, credit: 0, debit: amount_out, surplus: 0,
     type: 'refund', originalContent: content, paymentIntentId: intentDoc.id, bankEventId,
     autoClassified: true, needsReview: false, createdAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   ```
3. **Payment Intent Exact Match** (lines 2972–2988):
   ```typescript
   tx.create(bankEventRef, {
     sepayId, bankRef, amountIn: amount_in, amountOut: amount_out,
     content, transactionDate: date, classification: 'payment',
     paymentIntentId: intentDoc.id, studentId: userId,
     status: 'completed', receivedAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
     date, sepayId, bankRef, refCode,
     studentName: user.data()?.fullName || intentData.studentName || 'N/A',
     studentId: userId,
     description: `[SePay-HP] ${content}`,
     credit: amount_in, debit: 0, surplus: 0,
     type: 'payment', originalContent: content,
     paymentIntentId: intentDoc.id, bankEventId,
     autoClassified: true, needsReview: false,
     createdAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   ```
4. **LEA Order Matching** (lines 3149–3179):
   ```typescript
   tx.create(bankEventRef, {
     sepayId, bankRef, amountIn: amount_in, amountOut: 0,
     content, transactionDate: date, classification: 'elearning_order',
     orderCode: fullLeaCode, refCode: colCode,
     status: 'completed', receivedAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   tx.create(db.collection('ledger_transactions').doc(`COL-${bankEventId}`), {
     id: colCode, refCode: colCode, date, sepayId, bankRef,
     studentId: resolvedLrnCode || fullLeaCode,
     internalId: resolvedLrnCode || undefined,
     studentName: payerName, phoneNumber: payerPhone,
     description: `[SePay-COL] Thu học phí đơn ${fullLeaCode} - ${payerName}`,
     credit: amount_in, debit: 0, amount: amount_in, surplus: 0,
     type: 'tuition_fee', activeStatus: 'active', paymentMethod: 'sepay_vietqr',
     originalContent: content, autoClassified: true, needsReview: false,
     createdAt: admin.firestore.FieldValue.serverTimestamp(),
   });
   ```

### 1.3. Direct Root Cause of Ghost Stubs in `server.ts`
- **Location**: Lines 3081–3226.
- In `server.ts` lines 3212–3226:
  ```typescript
  if (crmMatchedRef) {
    const crmUpdatePayload: any = {
      code: fullLeaCode,
      paymentStatus: 'completed',
      paidAmount: amount_in,
      receiptCode: colCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (!profileData?.classId && profileData?.status !== 'Đã xếp lớp') {
      crmUpdatePayload.status = 'enrolled';
    }
    if (resolvedStudentName && isPlaceholderName(matchedCrmDoc?.data?.name)) {
      crmUpdatePayload.name = resolvedStudentName;
      crmUpdatePayload.fullName = resolvedStudentName;
    }
    tx.set(crmMatchedRef, crmUpdatePayload, { merge: true });
  } else if (customerProfileRef && resolvedStudentName) {
    tx.set(db.collection('crm_records').doc(fullLeaCode), {
      code: fullLeaCode,
      name: resolvedStudentName,
      fullName: resolvedStudentName,
      phone: payerPhone,
      email: candidateEmail || '',
      studentId: resolvedLrnCode || candidateStudentId || undefined,
      paymentStatus: 'completed',
      status: 'enrolled',
      paidAmount: amount_in,
      receiptCode: colCode,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  ```
- **Defects Observed**:
  1. **Document ID Mismatch**: In `CRMAdmissionsModule.tsx` (line 3511–3512), each lead shares the exact same document ID across `customer_profiles` and `crm_records` (e.g. `crm_1792918953302`). In line 3213 above, when `crmMatchedRef` was null (because `crm_records` was unanchored or missing `code`), `server.ts` called `tx.set(db.collection('crm_records').doc(fullLeaCode), ...)`. It created a duplicate record with document ID = `fullLeaCode` (`LEA-96055010`), leaving `crm_records/crm_1792918953302` un-updated!
  2. **Ghost Stub Re-enforcement**: In `findBestLeadDoc` (lines 3052–3055), querying `colRef.doc(fullLeaCode)` pushed the existing ghost stub into `candidates`. If `directDoc` had an existing field or was selected as `candidates[0]`, `crmMatchedRef` pointed to `crm_records/fullLeaCode`, updating the ghost stub while the real profile `crm_179...` remained unanchored.
  3. **No Cross-Collection Twin Linking**: If `findBestLeadDoc('customer_profiles')` successfully resolved `crm_1792918953302`, it did not look up `db.collection('crm_records').doc('crm_1792918953302')` directly.

---

## 2. Logic Chain

1. **Tagging Test Transactions**:
   - *Observation*: SePay sends test webhooks with `id: 111111...` or content containing `TEST`. These currently populate `bank_events` with `status: 'completed'` and `ledger_transactions` with `credit > 0` (Obs 1.1).
   - *Reasoning*: By detecting test events at webhook intake (evaluating `isTestTransaction` and pattern rules on `sepayId`, `refCode`, and `content`), every write to `bank_events` and `ledger_transactions` can be tagged with `isTest: Boolean(isTest)` and `status: isTest ? 'test' : 'completed'`.
   - *Deduction*: When `AdminLedgerModule.tsx` and Cash Flow reports filter `!tx.isTest`, all test events are completely excluded from General Ledger and financial totals, satisfying Requirement 1.

2. **Suppressing Test Side Effects on Student Records**:
   - *Observation*: When a test event matches an order or intent, recording `paidAmount: amount_in` reduces student debt with fictitious money.
   - *Reasoning*: A test transaction must record the event in the audit log (`bank_events`, `ledger_transactions`) for tracing, but must NOT alter `paidAmount`, set `paymentStatus: 'completed'`, or grant LMS access (`accessGranted: false`).

3. **Deterministic Twin Profile Reconciliation**:
   - *Observation*: Leads in CRM have canonical IDs like `crm_1792918953302` in both `customer_profiles` and `crm_records`. The 8-digit hash of this ID equals `96055010`, yielding `LEA-96055010` (Obs 1.3).
   - *Reasoning*:
     - When `fullLeaCode` matches an existing profile in either `customer_profiles` or `crm_records` (via `code`, `leadCode`, or hash), determine `canonicalProfileId = matchedDoc.id`.
     - Explicitly verify whether the twin document exists in the companion collection with that exact ID (`canonicalProfileId`).
     - Point BOTH `customerProfileRef` and `crmMatchedRef` to `doc(canonicalProfileId)` (e.g. `doc('crm_1792918953302')`).
   - *Deduction*: Writing directly to `doc(canonicalProfileId)` updates `code: fullLeaCode` on the authentic document in both collections. It eliminates line 3213's `doc(fullLeaCode)`, permanently halting ghost stub generation.

4. **Guarding against Unknown/Nameless Stub Creation**:
   - *Observation*: Historical ghost stubs in Firestore (`LEA-64817788`, `LEA-96055010`) have `name: ""`, `phone: ""`, and no `code` field.
   - *Reasoning*: If no authentic profile exists in `customer_profiles` or `crm_records`, and no customer name or phone is supplied in the payment, `server.ts` must NOT create a blank document in `crm_records`. The payment is captured in `bank_events`, `ledger_transactions`, and `orders`, allowing manual match from the SePay reconciliation dashboard.

---

## 3. Caveats

1. **Read-Only Invariant for Explorer**: In accordance with the Teamwork explorer protocol, no changes have been applied to `De_Vuong_Webapp/server.ts` during this investigation. Implementation will be executed by Worker M1.
2. **Historical Data vs New Ingestion**: The changes designed here protect all *future* incoming webhook calls and ensure idempotent anchoring on existing records. Existing historical ghost stubs already present in Firestore (the 3 stubs identified in survey 3.3) will be cataloged by the Milestone 3 dry-run script.
3. **Shared Utility Dependency**: `server.ts` can import `isTestTransaction` from `./src/domain/financeIdentity`. In case that module is being authored in parallel by Explorer M1-1, `server.ts` should also include inline fallback regex guards so that it operates independently and robustly.

---

## 4. Conclusion & Complete Implementation Design

### 4.1. Import Changes in `server.ts` (Lines 16–24)
Add `isTestTransaction` import from `./src/domain/financeIdentity`:

```typescript
// Location: server.ts lines 16–24
import {
  calculatePaymentSummary,
  classifyIntentAmount,
  createBankEventId,
  extractTransferCode,
} from "./src/server/paymentCore";
import { normalizeVietnamDateTime } from "./src/utils/dateTime";
import { isTestTransaction } from "./src/domain/financeIdentity";
import { PRACTICE_MAX_FILES, PRACTICE_MAX_FILE_BYTES, isAllowedPracticeFileName } from "./src/domain/practiceFiles";
```

### 4.2. Test Transaction Detection at Intake (Lines 2791–2810)
Directly after parsing `bankEventId`, compute `isTest`:

```typescript
// Location: server.ts lines 2791–2810
    // Parse payload
    const amount_in   = parseInt(req.body.amount_in  || (req.body.transferType === "in" ? req.body.transferAmount : "0") || "0");
    const amount_out  = parseInt(req.body.amount_out || (req.body.transferType === "out" ? req.body.transferAmount : "0") || "0");
    const content     = (req.body.transaction_content || req.body.content || "").trim();
    const sourceDate  = req.body.transaction_date || req.body.transactionDate;
    const date        = normalizeVietnamDateTime(sourceDate) || new Date().toISOString();
    const sepayId     = req.body.id || null;
    const bankRef     = req.body.reference_number || req.body.referenceCode || null;
    const refCode     = `SP${sepayId || bankRef || Date.now()}`;
    const bankEventId = createBankEventId(sepayId, bankRef);

    // Airtight Test Transaction Detection (Single-Source-of-Truth + Regex Defense)
    const isTest = Boolean(
      (typeof isTestTransaction === 'function' && isTestTransaction({
        sepayId,
        bankRef,
        refCode,
        originalContent: content,
        description: content,
        isTest: Boolean(req.body.isTest || req.body.test),
      })) ||
      req.body.isTest ||
      req.body.test ||
      (sepayId && (/^(1{5,}|4{5,}|9{5,})/i.test(String(sepayId)) || String(sepayId).toUpperCase().includes('TEST'))) ||
      (refCode && (/^SP1{5,}/i.test(refCode) || /^SP_TEST/i.test(refCode) || refCode.toUpperCase().includes('TEST'))) ||
      (bankRef && String(bankRef).toUpperCase().includes('TEST')) ||
      /\bTEST\b/i.test(content) ||
      /\bTHU NGHIEM\b/i.test(content) ||
      /\bTHỬ NGHIỆM\b/i.test(content) ||
      /\b(CP[-]?TEST|VG[-]?TEST|TT[-]?TEST)\b/i.test(content)
    );

    if (isTest) {
      console.log(`[SePay] ⚠ Test transaction detected: ${refCode} (sepayId=${sepayId}) - will tag isTest: true`);
    }
```

### 4.3. Update Write Site 1: `recordLedgerEvent` (Lines 2814–2847)
Tag both `bank_events` and `ledger_transactions` with `isTest: Boolean(isTest)` and `status: 'test'`:

```typescript
// Location: server.ts lines 2814–2847
    const recordLedgerEvent = async (ledgerData: Record<string, any>) => {
      let duplicate = false;
      await db.runTransaction(async (tx) => {
        const event = await tx.get(bankEventRef);
        if (event.exists) {
          duplicate = true;
          return;
        }

        tx.create(bankEventRef, {
          sepayId,
          bankRef,
          amountIn: amount_in,
          amountOut: amount_out,
          content,
          transactionDate: date,
          classification: ledgerData.type,
          status: isTest ? 'test' : 'completed',
          isTest: Boolean(isTest),
          receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
          surplus: 0,
          autoClassified: true,
          needsReview: false,
          isTest: Boolean(isTest),
          ...(isTest ? { status: 'test' } : {}),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          ...ledgerData,
        });
        tx.set(db.collection('system_status').doc('sepay'), {
          last_webhook_at: admin.firestore.FieldValue.serverTimestamp(),
          status: 'online',
        }, { merge: true });
      });
      return duplicate;
    };
```

### 4.4. Update Write Site 2: Payment Intent Refund (Lines 2894–2900)
```typescript
// Location: server.ts lines 2894–2900
              tx.create(bankEventRef, {
                sepayId, bankRef, amountIn: 0, amountOut: amount_out, content,
                transactionDate: date, classification: 'refund', paymentIntentId: intentDoc.id,
                studentId: userId,
                status: isTest ? 'test' : 'completed',
                isTest: Boolean(isTest),
                receivedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
                date, sepayId, bankRef, refCode, studentName: intentData.studentName || 'N/A', studentId: userId,
                description: `[SePay-REFUND] ${content}`, credit: 0, debit: amount_out, surplus: 0,
                type: 'refund', originalContent: content, paymentIntentId: intentDoc.id, bankEventId,
                autoClassified: true, needsReview: false,
                isTest: Boolean(isTest),
                ...(isTest ? { status: 'test' } : {}),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });
```

### 4.5. Update Write Site 3: Payment Intent Exact Match (Lines 2972–2988)
```typescript
// Location: server.ts lines 2972–2988
              tx.create(bankEventRef, {
                sepayId, bankRef, amountIn: amount_in, amountOut: amount_out,
                content, transactionDate: date, classification: 'payment',
                paymentIntentId: intentDoc.id, studentId: userId,
                status: isTest ? 'test' : 'completed',
                isTest: Boolean(isTest),
                receivedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
              tx.create(db.collection('ledger_transactions').doc(`BANK-${bankEventId}`), {
                date, sepayId, bankRef, refCode,
                studentName: user.data()?.fullName || intentData.studentName || 'N/A',
                studentId: userId,
                description: `[SePay-HP] ${content}`,
                credit: amount_in, debit: 0, surplus: 0,
                type: 'payment', originalContent: content,
                paymentIntentId: intentDoc.id, bankEventId,
                autoClassified: true, needsReview: false,
                isTest: Boolean(isTest),
                ...(isTest ? { status: 'test' } : {}),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              });
```

### 4.6. Hardening `findBestLeadDoc` & Twin Profile Linking (Lines 3040–3100)
Replace lines 3040–3093 with robust fallback and cross-collection twin document resolution:

```typescript
// Location: server.ts lines 3040–3100
        const findBestLeadDoc = async (colName: string): Promise<{ ref: any; data: any } | null> => {
          const colRef = db.collection(colName);
          const candidates: Array<{ ref: any; data: any }> = [];

          // 1. Direct indexed queries by code or leadCode
          const byCode = await colRef.where('code', 'in', [fullLeaCode, `LEA${cleanLeaDigits}`]).get();
          byCode.docs.forEach((d) => candidates.push({ ref: d.ref, data: d.data() }));

          const byLeadCode = await colRef.where('leadCode', '==', fullLeaCode).get();
          byLeadCode.docs.forEach((d) => {
            if (!candidates.some((c) => c.ref.id === d.id)) candidates.push({ ref: d.ref, data: d.data() });
          });

          // 2. Direct document ID lookup
          const directDoc = await colRef.doc(fullLeaCode).get();
          if (directDoc.exists && !candidates.some((c) => c.ref.id === directDoc.id)) {
            candidates.push({ ref: directDoc.ref, data: directDoc.data() });
          }

          // 3. Fallback scan for documents whose ID hashes to fullLeaCode (e.g. crm_1792918953302)
          // Always scan collection docs to guarantee finding unanchored real profiles missing field `code`
          const allSnap = await colRef.get();
          for (const d of allSnap.docs) {
            const dData = d.data();
            const dCode = String(dData?.code || '').trim().toUpperCase();
            const dHashed = `LEA-${hashLeaDigits(d.id)}`;
            if (dCode === fullLeaCode || dHashed === fullLeaCode) {
              if (!candidates.some((c) => c.ref.id === d.id)) {
                candidates.push({ ref: d.ref, data: dData });
              }
            }
          }

          if (candidates.length === 0) return null;

          // Prioritization order:
          // 1st: Real profile with authentic name AND doc ID not equal to fullLeaCode (e.g. crm_179...)
          const realNamedNotStub = candidates.find(
            (c) => !isPlaceholderName(c.data?.fullName || c.data?.name || c.data?.partnerName) && c.ref.id !== fullLeaCode
          );
          if (realNamedNotStub) return realNamedNotStub;

          // 2nd: Real profile with authentic name (any doc ID)
          const realNamed = candidates.find(
            (c) => !isPlaceholderName(c.data?.fullName || c.data?.name || c.data?.partnerName)
          );
          if (realNamed) return realNamed;

          // 3rd: Profile with phone/email and doc ID not equal to fullLeaCode
          const withContactNotStub = candidates.find(
            (c) => (c.data?.phone || c.data?.email) && c.ref.id !== fullLeaCode
          );
          if (withContactNotStub) return withContactNotStub;

          // 4th: Profile with phone/email (any doc ID)
          const withContact = candidates.find((c) => c.data?.phone || c.data?.email);
          if (withContact) return withContact;

          // 5th: If doc is only a nameless stub with placeholder and no contact, reject it (return null)
          const nonGhost = candidates.find(
            (c) => !isPlaceholderName(c.data?.fullName || c.data?.name) || c.data?.phone || c.data?.email
          );
          return nonGhost || null;
        };

        // Tìm Lead / Đơn hàng trong customer_profiles và crm_records
        const matchedProfileDoc = await findBestLeadDoc('customer_profiles');
        const matchedCrmDoc = await findBestLeadDoc('crm_records');

        // Deterministic Twin Reconciliation:
        // Identify canonical record ID (prioritizing authentic crm_* IDs over LEA-* ghost stubs)
        let customerProfileRef: any = matchedProfileDoc?.ref || null;
        let crmMatchedRef: any = matchedCrmDoc?.ref || null;

        const canonicalProfileId = (matchedProfileDoc?.ref?.id && matchedProfileDoc.ref.id !== fullLeaCode)
          ? matchedProfileDoc.ref.id
          : ((matchedCrmDoc?.ref?.id && matchedCrmDoc.ref.id !== fullLeaCode)
            ? matchedCrmDoc.ref.id
            : (matchedProfileDoc?.ref?.id || matchedCrmDoc?.ref?.id || null));

        if (canonicalProfileId) {
          if (!customerProfileRef || customerProfileRef.id === fullLeaCode) {
            const profSnap = await db.collection('customer_profiles').doc(canonicalProfileId).get();
            if (profSnap.exists) {
              customerProfileRef = profSnap.ref;
            }
          }
          if (!crmMatchedRef || crmMatchedRef.id === fullLeaCode) {
            const crmSnap = await db.collection('crm_records').doc(canonicalProfileId).get();
            if (crmSnap.exists) {
              crmMatchedRef = crmSnap.ref;
            } else {
              // Ensure crmMatchedRef targets the canonical ID, NEVER creating a fullLeaCode stub!
              crmMatchedRef = db.collection('crm_records').doc(canonicalProfileId);
            }
          }
        }
```

### 4.7. Update Write Site 4: LEA Order & Profile Mutation (Lines 3140–3245)
- Set `isTest: Boolean(isTest)` on `bank_events` and `ledger_transactions`.
- Update `code: fullLeaCode` directly on existing real profile doc via `merge: true`.
- Guard `paidAmount` so test transactions never inflate payments.
- Completely remove lines 3212–3226 (`crm_records.doc(fullLeaCode)`):

```typescript
// Location: server.ts lines 3140–3245
        let duplicate = false;
        await db.runTransaction(async (tx) => {
          const eventDoc = await tx.get(bankEventRef);
          if (eventDoc.exists) {
            duplicate = true;
            return;
          }

          // 1. Tạo Bank Event (có tag isTest)
          tx.create(bankEventRef, {
            sepayId, bankRef, amountIn: amount_in, amountOut: 0,
            content, transactionDate: date, classification: 'elearning_order',
            orderCode: fullLeaCode, refCode: colCode,
            status: isTest ? 'test' : 'completed',
            isTest: Boolean(isTest),
            receivedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 2. Tự động sinh bản ghi ledger_transactions với mã refCode: colCode (COL-xxxxxxxx, có tag isTest)
          tx.create(db.collection('ledger_transactions').doc(`COL-${bankEventId}`), {
            id: colCode,
            refCode: colCode,
            date,
            sepayId,
            bankRef,
            studentId: resolvedLrnCode || fullLeaCode,
            internalId: resolvedLrnCode || undefined,
            studentName: payerName,
            phoneNumber: payerPhone,
            description: `[SePay-COL] Thu học phí đơn ${fullLeaCode} - ${payerName}`,
            credit: amount_in,
            debit: 0,
            amount: amount_in,
            surplus: 0,
            type: 'tuition_fee',
            activeStatus: 'active',
            paymentMethod: 'sepay_vietqr',
            originalContent: content,
            autoClassified: true,
            needsReview: false,
            isTest: Boolean(isTest),
            ...(isTest ? { status: 'test' } : {}),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // 3. Cập nhật mã `code: fullLeaCode` và trạng thái thanh toán trên chính doc customer_profiles gốc
          if (customerProfileRef) {
            const profileUpdatePayload: any = {
              code: fullLeaCode,
              receiptCode: colCode,
              receiptDate: date,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (!isTest) {
              profileUpdatePayload.paymentStatus = 'paid';
              profileUpdatePayload.orderStatus = 'paid';
              profileUpdatePayload.paidAmount = amount_in;
              profileUpdatePayload.accessGranted = true;
            }
            if (resolvedStudentName && isPlaceholderName(matchedProfileDoc?.data?.fullName || matchedProfileDoc?.data?.name)) {
              profileUpdatePayload.fullName = resolvedStudentName;
              profileUpdatePayload.name = resolvedStudentName;
            }
            if (resolvedLrnCode) {
              profileUpdatePayload.studentId = resolvedLrnCode;
            }
            tx.set(customerProfileRef, profileUpdatePayload, { merge: true });
          }

          // 4. Cập nhật mã `code: fullLeaCode` và trạng thái thanh toán trên chính doc crm_records gốc
          // TUYỆT ĐỐI KHÔNG TẠO GHOST STUB crm_records/fullLeaCode
          if (crmMatchedRef) {
            const crmUpdatePayload: any = {
              code: fullLeaCode,
              receiptCode: colCode,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            if (!isTest) {
              crmUpdatePayload.paymentStatus = 'completed';
              crmUpdatePayload.paidAmount = amount_in;
              if (!profileData?.classId && profileData?.status !== 'Đã xếp lớp') {
                crmUpdatePayload.status = 'enrolled';
              }
            }
            if (resolvedStudentName && isPlaceholderName(matchedCrmDoc?.data?.name || matchedCrmDoc?.data?.fullName)) {
              crmUpdatePayload.name = resolvedStudentName;
              crmUpdatePayload.fullName = resolvedStudentName;
            }
            if (payerPhone && !matchedCrmDoc?.data?.phone) {
              crmUpdatePayload.phone = payerPhone;
            }
            if (candidateEmail && !matchedCrmDoc?.data?.email) {
              crmUpdatePayload.email = candidateEmail;
            }
            if (resolvedLrnCode) {
              crmUpdatePayload.studentId = resolvedLrnCode;
            }
            tx.set(crmMatchedRef, crmUpdatePayload, { merge: true });
          }

          // 5. Cập nhật hoặc tạo bản ghi trong collection orders
          const orderDocRef = db.collection('orders').doc(fullLeaCode);
          tx.set(orderDocRef, {
            orderCode: fullLeaCode,
            receiptCode: colCode,
            customerName: payerName,
            customerPhone: payerPhone,
            courseName: courseTitle,
            amount: amount_in,
            status: isTest ? 'test' : 'paid',
            isTest: Boolean(isTest),
            paidAt: date,
            sepayId,
            accessGranted: !isTest,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });

          // 6. Cập nhật hệ thống sepay status
          tx.set(db.collection('system_status').doc('sepay'), {
            last_webhook_at: admin.firestore.FieldValue.serverTimestamp(),
            status: 'online',
          }, { merge: true });
        });
```

---

## 5. Verification Method

To independently verify these designs and ensure no regressions occur once implemented:

### 5.1. Automated Test Suite Execution
Execute from `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`:
```powershell
npm test
```
*Expected Result*: All 23 tests pass (100%), including `tests/paymentCore.test.ts` and `tests/admissionsDebtSync.test.ts`.

### 5.2. Challenger Unit Tests Execution
```powershell
npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts
```
*Expected Result*: All 18 tests pass with exit code 0.

### 5.3. Full Vite Build Verification
```powershell
npm run build
```
*Expected Result*: Vite builds successfully in ~15s with zero bundle or syntax errors.

### 5.4. Webhook Test & Invalidation Conditions
- **Test Invalidation Condition 1**: If a payload with `id: 111111` or `content: "TEST PHI LEA-96055010"` is ingested, verify that the resulting `bank_events` doc contains `isTest: true` and `status: 'test'`, and the `ledger_transactions` doc contains `isTest: true`. If `isTest` is `false` or missing, the test has failed.
- **Test Invalidation Condition 2**: When a transaction with `content: "LEA-96055010"` arrives for existing lead `crm_1792918953302`, verify that `customer_profiles/crm_1792918953302` and `crm_records/crm_1792918953302` both have field `code: 'LEA-96055010'`, and that NO document `crm_records/LEA-96055010` is created. If a new doc `crm_records/LEA-96055010` appears, the test has failed.
