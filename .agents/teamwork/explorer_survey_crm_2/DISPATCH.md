## 2026-11-19T09:07:44Z
You are Explorer Survey CRM 2 (teamwork_explorer).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_2\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

YOUR MISSION:
Survey and inspect `StudentDetail.tsx` (and related student profile/ledger components):
1. Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`.
2. Inspect `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` (especially the "Học phí & Giao dịch" / Payment & Ledger tab):
   - Locate the Payment & Ledger tab and analyze how tuition, transactions, and debt are currently modeled and rendered.
   - Check where the class reference code (e.g., `LG4729`) is available or how classes are associated with the student, and how to render the class code prominently on the debt/ledger header.
   - Examine how student record inherits/receives data from Admissions (Total tuition, amount paid in Stage 1, remaining balance).
   - Identify how to add the required quick actions:
     - `[+ Thu học phí đợt tiếp theo]` (e.g., 900.000 ₫ for milestone or 2.200.000 ₫/month).
     - `[+ Nộp phí chênh lệch trung tâm]` (e.g., 200.000 ₫/month for partner, auto debiting the general ledger).
   - Check existing transaction ledger schema, how records are added, and how updates persist to Firestore/backend.
3. Write a comprehensive survey report to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_2\handoff.md` with concrete code snippets, line numbers, and architectural recommendations.
4. Update `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_2\progress.md`.
5. Send a message to your parent orchestrator when complete.
