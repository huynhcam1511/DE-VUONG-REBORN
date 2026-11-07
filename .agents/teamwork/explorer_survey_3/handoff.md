# Handoff Report: Explorer 3 Survey (R3 - Ledger Sync & Student Identity Recognition)

## 1. Observation

### Exact File Paths, Line Numbers & Verbatim Signatures

1. **`De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`**:
   - **`parseLedgerSmartInfo` definition (Lines 95–223)**:
     ```typescript
     export const parseLedgerSmartInfo = (tx: any, allStudents?: UserProfile[], allCrmRecords?: any[]) => {
     ```
   - **Current LEA / LRN regex matching (Lines 98–109)**:
     ```typescript
     const candidateLeaStr = `${content} ${tx.studentId || ''} ${tx.refCode || ''}`;
     const leaMatch = candidateLeaStr.match(/\bLEA[\s-]?(\d{6,10})\b/i);
     const normalizedLeaCode = leaMatch ? `LEA-${leaMatch[1]}` : null;
     const lrnMatch = candidateLeaStr.match(/\bLRN[\s-]?(\d{6,10})\b/i);
     const normalizedLrnCode = lrnMatch ? `LRN-${lrnMatch[1]}` : null;
     const phoneMatch = content.match(/\b(0\d{9,10})\b/);
     ```
   - **Generic placeholder check (Lines 118–124)**:
     ```typescript
     const isGenericPlaceholder = !studentDisplay || 
       studentDisplay === '---' || 
       studentDisplay === 'N/A' || 
       studentDisplay === '-' || 
       studentDisplay === 'Ẩn danh' || 
       studentDisplay === 'Học viên E-learning' || 
       studentDisplay.trim() === '';
     ```
   - **Hardcoded fallback to `'Học viên E-learning'` (Lines 166–167)**:
     ```typescript
     } else if (normalizedLeaCode || tx.type === 'unclassified_in') {
       studentDisplay = 'Học viên E-learning';
     ```
   - **Data loading for `allCrmRecords` (Lines 371–379)**:
     ```typescript
     useEffect(() => {
       const unsub = onSnapshot(collection(db, "crm_records"), (snapshot) => {
         const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         setAllCrmRecords(records);
       }, (err) => {
         console.warn("Lỗi tải crm_records cho sổ cái:", err);
       });
       return () => unsub();
     }, []);
     ```
   - **Transaction row rendering for student name and LRN (Lines 1358–1374)**:
     ```tsx
     {/* Cột Đối tượng / Học viên */}
     <td className="px-4 py-3.5">
       <div className="flex flex-col leading-tight">
         <span className="text-[13px] font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
           {smart.studentDisplay}
         </span>
         {(() => {
           // Chỉ hiển thị mã LRN khi thực sự có mã LRN hợp lệ, tuyệt đối không lấy nhầm mã LEA biến thành LRN
           const rawCode = smart.lrnCode || (tx.internalId && !tx.internalId.startsWith('LEA') ? tx.internalId : '') || (tx.studentId && !tx.studentId.startsWith('LEA') ? tx.studentId : '');
           if (!rawCode) return null;
           return (
             <span className="font-mono text-[11px] text-slate-400">
               {ensureValidBusinessCode(rawCode, 'LRN')}
             </span>
           );
         })()}
       </div>
     </td>
     ```
   - **Search filtering defect (Lines 662–675)**:
     ```typescript
     const filteredTransactions = useMemo(() => {
       return transactions.filter((tx) => {
         const matchSearch =
           tx.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tx.refCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tx.description.toLowerCase().includes(searchTerm.toLowerCase());
     ```
   - **Student Report tab pseudo-LRN generation (Lines 1560–1562)**:
     ```tsx
     <span className="font-mono text-[10px] text-slate-400">
       {ensureValidBusinessCode(item.id, 'LRN')}
     </span>
     ```

2. **`De_Vuong_Webapp/server.ts` (SePay Webhook Ingestion)**:
   - **LEA Order Lookup Defect (Lines 3025–3040)**:
     ```typescript
     const profilesSnap = await db.collection('customer_profiles')
       .where('code', 'in', [fullLeaCode, `LEA${cleanLeaDigits}`])
       .limit(1)
       .get();
     ```
     `server.ts` ONLY queries `customer_profiles`. It completely skips `crm_records` and `users`!
   - **Payer name fallback to `'Học viên E-learning'` (Lines 3045–3047)**:
     ```typescript
     const payerName = profileData?.fullName || profileData?.partnerName || profileData?.name || 'Học viên E-learning';
     ```
   - **Saving to `ledger_transactions` with LEA code in `studentId` and `'Học viên E-learning'` (Lines 3066–3087)**:
     ```typescript
     tx.create(db.collection('ledger_transactions').doc(`COL-${bankEventId}`), {
       id: colCode,
       refCode: colCode,
       date,
       sepayId,
       bankRef,
       studentId: fullLeaCode,
       studentName: payerName,
       phoneNumber: payerPhone,
       description: `[SePay-COL] Thu học phí đơn ${fullLeaCode} - ${payerName}`,
       credit: amount_in,
       debit: 0,
       type: 'tuition_fee',
       ...
     ```

3. **`De_Vuong_Webapp/src/utils/codeGenerator.ts`**:
   - **Prefix transformation in `ensureValidBusinessCode` (Lines 104–111)**:
     ```typescript
     const prefixMatch = strVal.match(/^([A-Z]{3})-(\d{8})$/i);
     if (prefixMatch) {
       const existingPrefix = prefixMatch[1].toUpperCase();
       const digits = prefixMatch[2];
       if (existingPrefix === prefix) {
         return strVal.toUpperCase();
       }
       return `${prefix}-${digits}`;
     }
     ```
     When `strVal` is `COL-91690914` or `LEA-91690914` and target `prefix` is `'LRN'`, line 111 re-prefixes it into `LRN-91690914`.

4. **`De_Vuong_Webapp/src/components/AdminDashboard.tsx`**:
   - Merged `crmLeads` created from `crm_records` + `customer_profiles` + `localStorage` (Lines 1601–1629).
   - In lines 5715 and 6186, `AdminLedgerModule` is invoked without passing `crmLeads`:
     ```tsx
     <AdminLedgerModule students={students} initialData={b2bTabExtraData['ledger']} initialSubTab="ledger" hideSubTabs={true} />
     ```

---

## 2. Logic Chain

```
[SePay Webhook Ingestion in server.ts:3025]
  |
  +--> Queries only 'customer_profiles' (misses CRM leads stored in 'crm_records')
  |
  +--> profileData is null
  |
  +--> Line 3045: payerName defaults to 'Học viên E-learning'
  |
  +--> Line 3072: Writes ledger_transaction with studentId = 'LEA-...', studentName = 'Học viên E-learning'
         |
         v
[AdminLedgerModule Client Presentation]
  |
  +--> allCrmRecords only listens to Firestore crm_records (ignores customer_profiles & localStorage katc_custom_crm_records)
  |
  +--> Initial mount: allCrmRecords is [] (empty) before network returns
  |
  +--> parseLedgerSmartInfo Step 1: fails to match if records missing or unmounted
  |
  +--> parseLedgerSmartInfo Step 2: only checks allStudents with regex phone or LRN from transfer text
  |      (fails to bridge matched CRM record's email/phone/contact/name to allStudents)
  |
  +--> parseLedgerSmartInfo Step 3: line 167 explicitly defaults studentDisplay = 'Học viên E-learning'
  |
  +--> Table rendering:
         - studentDisplay shows 'Học viên E-learning'
         - rawCode receives non-student code (e.g. COL-...) -> ensureValidBusinessCode synthesizes pseudo-LRN
         - cleanDesc does not clean [LỆNH THU] or [SePay-COL], leaving student name and LEA duplicated in description
```

### Direct Reasoning Steps:
1. **Source of 'Học viên E-learning' at creation time**: `server.ts:3025` queries `customer_profiles`. Because CRM Admissions Module stores admission leads in Firestore collection `crm_records`, `profileData` is not found, causing line 3045 to default `payerName = 'Học viên E-learning'`.
2. **Source of 'Học viên E-learning' at render time**: In `AdminLedgerModule.tsx:167`, if `studentDisplay` is missing or placeholder and has a `LEA` code or `unclassified_in`, line 167 explicitly assigns `'Học viên E-learning'`.
3. **Source of missing LRN code**: Even when `allCrmRecords` matches a CRM lead in Step 1, if the CRM lead does not yet have `studentId` populated (or has a Firebase UID), `parseLedgerSmartInfo` does not attempt to cross-reference `allStudents` using the CRM lead's `phone`, `contact`, `email`, or `name`.
4. **Source of fake LRN (`LRN-91690914`)**: When `tx.studentId` or `tx.refCode` contains `COL-XXXXXXXX` or `LEA-XXXXXXXX`, passing it to `ensureValidBusinessCode(rawCode, 'LRN')` causes lines 104–111 of `codeGenerator.ts` to swap the prefix to `LRN-`, synthesizing a fake LRN code from the tail digits.
5. **Redundant Descriptions**: `LeadPaymentModal.tsx:175` formats descriptions as `[LỆNH THU] {clientName} - {targetCode} (...)`. `parseLedgerSmartInfo:196` only detects `^\[SePay`, so `[LỆNH THU]` and `[SePay-COL]` descriptions retain redundant student names and LEA codes in the description column.

---

## 3. Caveats

1. **ReadOnly Constraint**: No changes to application source files were made during this investigation.
2. **Dual Lead Storage**: CRM records can exist in Firestore `crm_records`, Firestore `customer_profiles`, and browser `localStorage` (`katc_custom_crm_records` and `katc_crm_overrides`). The ledger module must inspect all of these sources to guarantee 100% resolution.
3. **Historical Data vs Realtime Resolution**: Existing records in Firestore `ledger_transactions` may already contain `'Học viên E-learning'`. Presentation-layer resolution in `parseLedgerSmartInfo` must cleanly override this stored placeholder at render time, while `server.ts` prevents future occurrences.

---

## 4. Conclusion

To fulfill Requirement R3 and satisfy all acceptance criteria, the following coordinated updates are required:

### A. In `De_Vuong_Webapp/server.ts` (Webhook Ingestion)
- At lines 3020–3045: When `leaMatch` is detected, query **both** `customer_profiles` AND `crm_records` (by ID `fullLeaCode` and where `code == fullLeaCode`).
- If a match is found in `crm_records`, query the `users` collection using the lead's `studentId`, `phone`, or `email` to obtain the student's genuine `student_code_internal` (`LRN-XXXXXXXX`) and real name.
- Write the genuine name and LRN code into `ledger_transactions` at line 3072 (`studentName: realName`, `studentId: genuineLrnCode || fullLeaCode`, `internalId: genuineLrnCode`).

### B. In `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
1. **Props & State Integration**:
   - Add optional `crmLeads?: any[]` to `AdminLedgerModuleProps`.
   - In `allCrmRecords` state initialization, seed with `props.crmLeads`, plus `localStorage` (`katc_custom_crm_records` and `katc_crm_overrides`), alongside the Firestore `crm_records` snapshot listener.
2. **Multi-Hop Identity Resolution in `parseLedgerSmartInfo`**:
   - **Hop 1 (Transaction $\rightarrow$ CRM Lead)**: Match by `normalizedLeaCode` against `r.id`, `r.code`, or digits; or match by phone.
   - **Hop 2 (CRM Lead $\rightarrow$ User/Student)**: If `matchedCrm` is found, adopt `matchedCrm.name || matchedCrm.fullName`. If `matchedCrm.studentId` is a genuine `LRN-...`, use it. If not, look up `allStudents` by `s.uid === matchedCrm.studentId`, phone, contact, email, or full name. Retrieve `s.student_code_internal`.
   - **Hop 3 (Direct User Lookup)**: If no CRM match, lookup `allStudents` by `tx.studentId`, `normalizedLrnCode`, phone, or student name.
   - **Hop 4 (Eliminate Placeholder Defaults)**: Eliminate `studentDisplay = 'Học viên E-learning'` when a LEA code is present; fall back to `'Khách hàng (Chờ cập nhật)'` or student name.
3. **Guard Against Pseudo-LRN Generation**:
   - In table row render (line 1365): Ensure `rawCode` does NOT start with `LEA` or `COL`.
   - If `smart.lrnCode` is a valid `LRN-XXXXXXXX`, display directly (`<span className="font-mono text-[11px] text-slate-400">{smart.lrnCode}</span>`).
   - In `Student Report` tab (line 1561): Do not convert `LEA-...` to `LRN-...`.
4. **Description Cleaning & AGENTS.md Compliance**:
   - Recognize `[LỆNH THU]`, `[LENH THU]`, `[SePay-COL]`, `[THU HỌC PHÍ]` in `cleanDesc`.
   - Strip out redundant student names and LEA codes from `cleanDesc`.
   - Retain `line-clamp-1` with `title={tx.originalContent || tx.description}`.
5. **Search Filter Enhancement**:
   - In `filteredTransactions`, search across `smart.studentDisplay`, `smart.lrnCode`, `smart.leaCode`, `tx.refCode`, and `tx.originalContent`.

### C. In `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
- Pass `crmLeads={crmLeads}` to `<AdminLedgerModule ... />` at lines 5715 and 6186.

---

## 5. Verification Method

1. **Build Verification**:
   ```powershell
   cd "c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp"
   npm run build
   ```
   Must exit with code 0.

2. **Test Suite Verification**:
   ```powershell
   npm run test
   ```
   Must pass 100% of unit tests.

3. **Behavioral Invalidation Tests**:
   - Open Sổ cái (`AdminLedgerModule`): A transaction with `description: "[SePay-COL] Thu học phí đơn LEA-64817788"` must resolve to `Nguyễn Thị Anh Thi` and display `LRN-62517882` (or `LRN-20510493`), without ever showing `Học viên E-learning` or synthesizing `LRN-64817788`.
   - Search for `"Anh Thi"` or `"LRN-62517882"` in the ledger search box: The corresponding transaction row must be returned.
   - Inspect the `Diễn giải` column: Must display clean 1-line text (e.g. `Thu học phí E-learning` or `Lệnh thu học phí`) without repeating the student name or LEA code.
