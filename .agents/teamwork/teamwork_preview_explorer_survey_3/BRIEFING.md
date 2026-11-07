# BRIEFING — 2026-11-01T17:37:45Z

## Mission
Investigate Collection Orders (COL-), CommercialLifecycleBar, and financial receipt/payment accumulation across multiple payments in De_Vuong_Webapp.

## 🔒 My Identity
- Archetype: explorer
- Roles: Explorer - Commercial Lifecycle
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_preview_explorer_survey_3
- Original parent: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Editable application is De_Vuong_Webapp/
- archives/ is read-only recovery material — do not touch
- AGENTS.md rules apply (no border-r/l, action menu 3 dots, anti-pill overload, single row header, etc.)
- Only write metadata to working directory .agents/teamwork/teamwork_preview_explorer_survey_3

## Current Parent
- Conversation ID: 3f29a7db-f167-4091-994a-bb237f2c6dd5
- Updated: 2026-11-01T17:37:45Z

## Investigation State
- **Explored paths**:
  - `src/components/admin/CommercialLifecycleBar.tsx` (B2C 3-column & B2B 5-card lifecycle progress)
  - `src/components/admin/LeadPaymentModal.tsx` (VietQR generation, PT-KATC receipt, `saveCollectionOrderRecord`)
  - `src/components/admin/CRMAdmissionsModule.tsx` (`activeCollectionOrder`, `handleOpenLeadPayment`, `onPaymentRecorded`)
  - `src/components/admin/SepayReconciliationModule.tsx` (`collectionOrders`, `getCollectedAmountForOrder`, SePay matching)
  - `src/components/AdminDashboard.tsx` (`collectionOrders`, `getCollectedAmountForOrder`)
  - `src/components/admin/AdminLedgerModule.tsx` (`parseLedgerSmartInfo`, LRN fake code issue, description 2-line overflow)
  - `src/utils/codeGenerator.ts` (`ensureValidBusinessCode` swapping LEA for LRN)
  - `server.ts` (SePay webhook handler for `LEA[...]`, `paidAmount` overwrite, `bankEventId` omission)
- **Key findings**:
  1. **SePay Webhook Overwrites `paidAmount`**: In `server.ts` lines 3094 & 3107, each incoming transaction sets `paidAmount: amount_in` directly, wiping previous payments instead of adding them (`currentPaid + amount_in`). Also hardcodes `paymentStatus: 'completed'` on partial payments.
  2. **`CRMAdmissionsModule.tsx` Excludes `COL-` Incoming Payments**: In `activeCollectionOrder` line 1517, `stx.refCode?.startsWith('COL')` is excluded from `collectedAmount`. Because `server.ts` line 3066 sets `refCode: colCode` on the bank transaction, real SePay payments are ignored, and line 1530 takes only the single `latest.credit`, dropping previous payments.
  3. **Collection Orders Fail Matching in SePay Module & Admin Dashboard**: `getCollectedAmountForOrder` only tests `content.includes(tx.refCode)`. Because `LeadPaymentModal.tsx` generates transfer memo `HOCPHI LEA...`, `content` does not have `COL-...`, so `paidAmount` always returns 0 for collection orders.
  4. **Fake LRN Code Generation**: In `AdminLedgerModule.tsx` line 1349 and `codeGenerator.ts` line 111, when `lrnCode` is null, falling back to `tx.studentId` (`LEA-91690914`) replaces the prefix to produce fake `LRN-91690914`.
  5. **'Học viên E-learning' Stuck on Ledger**: `server.ts` only queries `customer_profiles`, missing `crm_records`, defaulting name to `'Học viên E-learning'`. In `AdminLedgerModule.tsx` line 117, `'Học viên E-learning'` is considered a valid name, so CRM record lookup is skipped.
  6. **Description Row Height Violation**: `AdminLedgerModule.tsx` line 1372 renders `originalContent` on a second row instead of keeping a single row with tooltip.
- **Unexplored areas**: None, all 4 objectives thoroughly investigated.

## Key Decisions Made
- Confirmed that `CommercialLifecycleBar.tsx` already contains complete UI support for partial vs 100% paid states (`actualPaid >= targetAmount && targetAmount > 0` vs `actualPaid > 0 && remainingDebt > 0`). The root cause lies in how `paidAmount` is accumulated in `server.ts` and `CRMAdmissionsModule.tsx`.

## Artifact Index
- DISPATCH.md — Task dispatch from parent
- BRIEFING.md — Situational awareness and state tracker
- progress.md — Heartbeat and activity log
- handoff.md — Complete 5-component investigation report
