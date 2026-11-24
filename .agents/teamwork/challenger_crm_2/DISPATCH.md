## 2026-11-19T09:59:27Z
You are Challenger CRM 2 (teamwork_challenger).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_crm_2\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The project specification is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_6\PROJECT.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

YOUR MISSION:
Empirically verify and stress-test Stage 2 in `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx`:
1. Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` and `PROJECT.md`.
2. Inspect and adversarially test `StudentDetail.tsx`:
   - Test class code anchoring: verify `resolvedClassCode` (fallback `'LG4729'`) displays in plain mono font on the debt header without pill wrapping.
   - Test financial inheritance: ensure the 4 cards accurately calculate and reflect `payments/{studentId}`.
   - Test `NextInstallmentModal` (`[+ Thu học phí đợt tiếp theo]`):
     - Test collection of 900k, 2.2M, full debt, or custom amount.
     - Check that `payments/{studentId}` is updated and a credit entry is posted to `ledger_transactions`.
   - Test `CenterCommissionModal` (`[+ Nộp phí chênh lệch trung tâm]`):
     - Test 200k/month remittance, verify debit entry in `ledger_transactions` (`type: 'class_accept'`) and audit log in `internalNotes`. Verify it does NOT corrupt student tuition debt.
   - Test AGENTS.md compliance:
     - Verify empty `<th>` for action column.
     - Verify 3-dot `MoreVertical` action menu (no naked trash button).
     - Verify plain text + dot status indicator (no candy pills).
     - Verify emerald hover effect.
   - Verify 0 TypeScript errors.
3. Run `npm run build` inside `De_Vuong_Webapp/` to verify zero compile or bundle errors.
4. Deliver your stress-test report in `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_crm_2\handoff.md` with an explicit verdict: APPROVE or REQUEST_CHANGES. Update `progress.md` and notify parent.
