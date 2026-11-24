## 2026-11-19T09:07:50Z
You are Explorer Survey CRM 3 (teamwork_explorer).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_3\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

YOUR MISSION:
Survey data models, Stage 1 <-> Stage 2 Handover contract, AGENTS.md compliance, and build health:
1. Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`.
2. Map the data structure and schema:
   - How a lead/admission record in CRM transitions into a student profile in `StudentDetail.tsx` (or `AdminDashboard.tsx` learners tab).
   - What fields are shared or transferred: `tuitionTotal`, `tuitionPaid`, `tuitionDebt`, `classCode` / `classId`, `paymentPlan`, `installments`, `fundDeduction`, etc.
   - How `setDoc` / `updateDoc` / `apiRequests` are called across both components to ensure persistent synchronization.
3. Audit AGENTS.md requirements for both screens:
   - Read-only table rules, action menu via 3 dots (`MoreVertical`), no pill/badge overload (avoid candy box styling, use plain text with subtle indicators).
   - Fixed 1-row toolbar (`sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3`).
   - Edge-to-edge full bleed layout.
   - Typography scale (`text-2xl` headline, `text-base` subheadline, `text-sm` body, `text-xs` meta/table).
4. Check the current build status and TypeScript types to flag any potential compile issues.
5. Write a comprehensive survey report to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_3\handoff.md`.
6. Update `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_3\progress.md`.
7. Send a message to your parent orchestrator when complete.
