# Handoff Report: Milestone 1 — Data Layer & Identity Backbone

**Worker**: Worker M1 (Generation 3)  
**Parent Orchestrator**: `029cef84-8361-4084-a50e-50f632a7bb27`  
**Timestamp**: 2026-11-11T16:42:00Z  
**Type**: Hard Handoff (Task Complete)

---

## 1. Observation

Direct observations and evidence across all 5 assigned files and verification commands:

### 1.1. Codebase State & Implementation
- **File 1**: `De_Vuong_Webapp/src/domain/financeIdentity.ts`
  - Created new canonical domain module defining:
    - Interfaces: `FinancePartyInput`, `FinancePartyResolution`, `LeadDebtItem`.
    - Functions: `isGenericPlaceholderName`, `isTestTransaction`, `cleanTransactionDescription`, `resolveFinanceParty`, `calculateLeadDebt`.
    - Strict pseudo-LRN guard: `if (resolvedLrnCode && (resolvedLrnCode.startsWith('LEA') || resolvedLrnCode.startsWith('COL'))) resolvedLrnCode = undefined;`.
    - Preserves exact casing for B2B partners (`partyType === 'partner'`) and internal operations (`partyType === 'internal'`), only applying title-casing (`toProperCase`) to individual learner/lead names.
- **File 2**: `De_Vuong_Webapp/server.ts`
  - Added import `isTestTransaction` from `./src/domain/financeIdentity`.
  - Tagged incoming transactions at line 209: `const isTest = isTestTransaction({ ...req.body, id: paymentData.id, refCode: paymentData.referenceCode, description: paymentData.description, originalContent: paymentData.content, bankRef: paymentData.bankTransactionId, sepayId: paymentData.id });`.
  - Tagged all 4 write sites with `isTest: Boolean(isTest)` and `status: isTest ? 'test' : 'completed'`:
    - Line 250: `recordLedgerEvent(..., { isTest: Boolean(isTest), status: isTest ? 'test' : 'completed' })`
    - Line 283: `recordLedgerEvent(refundEvent, { isTest: Boolean(isTest), status: isTest ? 'test' : 'completed' })`
    - Line 310: `recordLedgerEvent(intentEvent, { isTest: Boolean(isTest), status: isTest ? 'test' : 'completed' })`
    - Line 463: `recordLedgerEvent(orderEvent, { isTest: Boolean(isTest), status: isTest ? 'test' : 'completed' })`
  - Hardened `findBestLeadDoc` (lines 405-430) with twin document reconciliation: checks both `customer_profiles` and `crm_records`, extracts `canonicalProfileId` pointing to authentic document IDs (e.g. `crm_1792918953302`), and writes updates to real documents with `{ merge: true }`.
  - Permanently eliminated ghost stub document creation by deleting `crm_records.doc(fullLeaCode).set(...)` (previously at line 440).
- **File 3**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
  - In `handleSave` (lines 1047-1100): upfront `canonicalCode` evaluation and assignment to `updated.code` before calling `setRecords` and `persistCustomRecords`.
  - Dual collection write: persists `docPayload` containing `code: canonicalCode`, `fullName`, and `updatedAt` to both `customer_profiles` and `crm_records`.
  - In `handleQuickUpdateStatus` (line 1146): ensured `code: canonicalCode` is anchored on `updated`.
  - In both `LeadPaymentModal` `onComplete` handlers (lines 1478 & 1515): ensured `canonicalCode` is preserved on `updated`.
- **File 4**: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - Re-exported `parseLedgerSmartInfo` (lines 169-204) by delegating directly to `resolveFinanceParty(tx, { students: allStudents, crmRecords: allCrm, partners: allPartners, documents: allDocuments })`.
  - Added filter `!isTestTransaction(tx)` to `filteredTransactions` (line 1205).
  - Added filter `tx.type !== 'expected_revenue'` to `historyTransactions` (line 1279).
  - Added filter `!isTestTransaction(tx)` to `summaryData` (line 1285).
  - Excluded test transactions and `expected_revenue` from `studentReport` calculation (line 1307).
  - Excluded test transactions and `expected_revenue` from `misaTransactions` export (line 1342).
- **File 5**: `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts`
  - Expanded test suite from 4 tests to 9 tests:
    - Test 5: `isGenericPlaceholderName & isTestTransaction: detects placeholders and flags test transactions`
    - Test 6: `resolveFinanceParty: unified resolution resolves genuine learner with multi-hop LRN and suppresses placeholders`
    - Test 7: `resolveFinanceParty: resolves B2B partner and economic contracts without corrupting company names`
    - Test 8: `resolveFinanceParty: handles internal corporate transactions without mangling labels`
    - Test 9: `Three-stream separation: filters test transactions and expected_revenue from actual cash flow`

### 1.2. Verification Commands & Output
- Command: `cd De_Vuong_Webapp; node --import tsx --test tests/admissionsDebtSync.test.ts`
  - Output: `ℹ tests 9`, `ℹ pass 9`, `ℹ fail 0`, `duration_ms 1928.9049`.
- Command: `cd De_Vuong_Webapp; npm test`
  - Output: `ℹ tests 28`, `ℹ pass 28`, `ℹ fail 0`, `duration_ms 1736.434`.
- Command: `cd De_Vuong_Webapp; npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts`
  - Output: `ℹ tests 18`, `ℹ pass 18`, `ℹ fail 0`, `duration_ms 1301.9458`.
- Command: `cd De_Vuong_Webapp; npm run build`
  - Output: `✓ built in 14.49s`, exit code 0.

---

## 2. Logic Chain

1. **Root Cause Analysis (from Observation 1.1)**:
   - Previously, transactions in SePay webhooks created new ghost documents under `crm_records/LEA-XXXXXXXX` because `findBestLeadDoc` only matched on exact stored code fields, failing to detect hashed doc IDs (`crm_179...`). This fractured learner identity and orphaned lead updates.
   - Stale placeholder strings like "Học viên E-learning" and pseudo-LRN codes (synthesizing `LRN-64817788` from `LEA-64817788`) corrupted ledger views and student reports.
   - Test transactions with test keywords, zero amounts, or sandbox identifiers were being summed into cash flow reports and ledger summaries, inflating financial figures.
   - `expected_revenue` (revenue orders / [LỆNH THU]) were mixed with actual completed bank credits, conflating receivables with collected cash.

2. **Unified Domain Backbone (`financeIdentity.ts`)**:
   - Centralizing resolution in `resolveFinanceParty` allows multi-hop traversal (`transaction -> CRM lead -> UserProfile (student)`) while strictly verifying that LRN codes never start with `LEA` or `COL`.
   - Incorporating comprehensive placeholder detection (`isGenericPlaceholderName`) allows graceful fallbacks to sender name, CRM name, or contextual role labels without displaying "Học viên E-learning".
   - Identifying test transactions via `isTestTransaction` across ref codes (`SP_TEST_`, `CP-TEST-`, `VGTEST-`, `SP111111`), SePay test IDs, descriptions, and bank references provides a single source of truth for all ingestion and reporting pathways.

3. **Ingestion & Reconciliation Hardening (`server.ts`)**:
   - Marking test transactions with `isTest: Boolean(isTest)` and `status: isTest ? 'test' : 'completed'` preserves an immutable audit trail in `bank_events` and `ledger_transactions` while preventing unintended side-effects (e.g. inflating student `paidAmount` or granting course access).
   - Linking twin documents in `customer_profiles` and `crm_records` via `canonicalProfileId` updates the authoritative student lead doc without spawning detached ghost stubs (`crm_records.doc(fullLeaCode)` removed).

4. **UI & Data Layer Protection (`CRMAdmissionsModule.tsx` & `AdminLedgerModule.tsx`)**:
   - Anchoring `code: canonicalCode` in CRM state mutations ensures that lead codes are never overwritten by empty strings or lost during edits.
   - Re-exporting `parseLedgerSmartInfo` through `resolveFinanceParty` guarantees 100% backward compatibility for existing callers while providing B2B partner and internal transaction classification.
   - Enforcing three-stream separation (filtering `!isTestTransaction` and `tx.type !== 'expected_revenue'`) guarantees that cash flow, student financial reports, and MISA export reflect only actual realized cash.

---

## 3. Caveats

- **Scope Boundary**: As specified in `DISPATCH.md` and Milestone 1 boundaries, frontend UI overhaul for Milestone 2 (Ledger module full-bleed redesign, tabs, drawer, filter dropdowns) and Milestone 3 (Debt & Receivables center) were not modified here.
- **Existing Archives**: In accordance with the Canonical Repository Policy, `archives/` was strictly untouched.
- **Firestore Emulation**: Tests are executed via TypeScript unit and challenger test suites in node environment using genuine domain logic and mock data structures matching real Firestore schemas.

---

## 4. Conclusion

Milestone 1 (Data Layer & Identity Backbone) is 100% complete and fully verified.
- Ghost stub documents are eradicated at intake.
- Pseudo-LRN generation is completely blocked.
- Multi-hop identity resolution accurately bridges SePay transactions, CRM leads, and genuine student LRNs.
- Test transactions are tagged and isolated from live accounting.
- Three-stream financial separation is enforced across cash flow, student balances, and accounting exports.
- All 28 test suite cases, 18 challenger suite cases, and the production Vite build pass without error.

---

## 5. Verification Method

To independently verify all changes, run the following commands inside `De_Vuong_Webapp/`:

1. **Admissions & Finance Identity Unit Tests**:
   ```powershell
   cd De_Vuong_Webapp; node --import tsx --test tests/admissionsDebtSync.test.ts
   ```
   *Expected*: 9 passed, 0 failed.

2. **Full Repository Test Suite**:
   ```powershell
   cd De_Vuong_Webapp; npm test
   ```
   *Expected*: 28 passed, 0 failed.

3. **Challenger Test Suites**:
   ```powershell
   cd De_Vuong_Webapp; npx tsx --test tests/challenger_m1_debt_vietqr.test.ts tests/empiricalChallengerM1.test.ts
   ```
   *Expected*: 18 passed, 0 failed.

4. **Production Build**:
   ```powershell
   cd De_Vuong_Webapp; npm run build
   ```
   *Expected*: Build completed successfully with exit code 0.
