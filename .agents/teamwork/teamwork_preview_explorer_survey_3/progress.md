# Progress Log

Last visited: 2026-11-01T17:37:30Z

- Initialized briefing and progress log.
- Located all files relating to Phiếu thu (`COL-`), `CommercialLifecycleBar`, and financial reconciliation.
- Investigated SePay webhook handling in `server.ts`: discovered `paidAmount` overwrite bug (line 3094, 3107) and missing `bankEventId` in `ledger_transactions` (line 3066).
- Investigated `parseLedgerSmartInfo` in `AdminLedgerModule.tsx`: discovered `Học viên E-learning` placeholder block and fake LRN code generation from `LEA` digits (`ensureValidBusinessCode(..., 'LRN')`).
- Investigated `getCollectedAmountForOrder` in `SepayReconciliationModule.tsx` and `AdminDashboard.tsx`: discovered strict `tx.refCode` match failure against incoming payments with `HOCPHI LEA...` memo.
- Investigated `activeCollectionOrder` in `CRMAdmissionsModule.tsx`: discovered line 1517 erroneously excluding `stx.refCode?.startsWith('COL')` and line 1530 only taking single `latest.credit`, dropping previous payments.
- Executed unit tests (`paymentCore.test.ts`), all 7 passed. Typecheck `npm run lint` running.
