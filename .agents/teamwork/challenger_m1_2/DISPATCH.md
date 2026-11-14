# Dispatch for Challenger M1-2

## Mission
Empirically challenge and adversarially test the Milestone 1 implementation:
- Stress test `calculateLeadDebt` with multiple payment installments, partial payments, overpayments, and debt edge cases.
- Stress test SePay webhook lead matching logic with edge-case payment descriptions (`LEA12345678`, `HOC PHI LEA-12345678`, whitespace variations).
- Verify twin-linking reconciliation between `customer_profiles` and `crm_records` under concurrent/mock payloads.

## Code Under Challenge
- `De_Vuong_Webapp/src/domain/financeIdentity.ts`
- `De_Vuong_Webapp/server.ts`
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`

## References
- Authoritative User Request: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
- Project Scope: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
- Worker Handoff: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_gen3\handoff.md`

## Instructions
1. Write and execute an adversarial test harness in `De_Vuong_Webapp/tests/`.
2. Report empirical findings and issue verdict (`APPROVE` or `REQUEST_CHANGES`):
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m1_2\handoff.md`

## 2026-11-11T16:42:07Z
You are Challenger M1-2 for Milestone 1 of the Finance Consolidation Project.

MANDATORY INSTRUCTIONS:
1. You MUST read the authoritative user request at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`
2. You MUST read your dispatch file at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m1_2\DISPATCH.md`
3. Read `PROJECT.md` at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md`
4. Read Worker M1's handoff report at:
   `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_gen3\handoff.md`

Canonical Repository Policy:
- Only modify test files under `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/tests/`.
- NEVER touch `archives/`.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_m1_2`

Write and execute an adversarial test suite to empirically test `calculateLeadDebt`, SePay webhook lead matching, and twin-document reconciliation. Issue your verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md`, then send a message.
