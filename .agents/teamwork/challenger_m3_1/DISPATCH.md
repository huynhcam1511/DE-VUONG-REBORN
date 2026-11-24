## 2026-11-17T16:12:22Z
You are a teamwork_challenger.
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m3_1\
Your identity is: teamwork_challenger (Financial Edge-Case Challenger).

MANDATORY FIRST STEP: Read the original user request from:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md
- Milestone 1 Handoff: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_1\handoff.md
- Milestone 2 Handoff: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m2_1\handoff.md

Empirically test and stress-test the new financial logic:
1. Write a standalone test script (e.g. `tests/accountingWorkflow.challenger.test.ts` or run via `node --import tsx`) to stress-test:
   - Corporate VAT calculations: Base tuition $100M \to 10\%$ VAT surcharge $\to 110M$ total invoice $\to 8\%$ intermediary fee ($8.8M$) $\to 101.2M$ net cashflow (+1.2M net retention). Test with boundary numbers, zeros, large contracts.
   - Quỹ Phí Dư Balance calculations: simulate sequences of Non-Start refunds (+), new class offsets (-), and HOANPHI withdrawals (-). Confirm `availableSurplus` equals running total.
   - Non-start auto-refund idempotency: ensure duplicate calls for the same refCode do not double-credit surplus.
   - Payment source validation: verify surplus offset is rejected or flagged when intake fee exceeds available surplus.
2. Run the test script inside `De_Vuong_Webapp/`.
3. Report empirical results, assert pass/fail, and state explicit verdict: `APPROVE` or `REQUEST_CHANGES`.

Write your report to:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m3_1\handoff.md
Send a completion message when done referencing the handoff path.
