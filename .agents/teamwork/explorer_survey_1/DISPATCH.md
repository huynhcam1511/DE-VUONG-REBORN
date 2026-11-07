## 2026-11-02T09:34:01Z
You are Explorer 1 for the Student Identity & Multi-Stage Admissions Debt Sync project.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1`
Canonical app directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
Authoritative requirements: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (read section ## 2026-11-02T09:30:40Z).

YOUR FOCUS:
Investigate Requirement R1 - Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh:
1. Examine `CRMAdmissionsModule.tsx` (and related files in `De_Vuong_Webapp/src/`):
   - How are leads (`LEA-xxxxxxx`) created, edited, and stored?
   - How is "Học viên cũ" or matching by phone/email currently handled?
   - Where and how is student identity (`studentId` / `LRN-xxxxxxx`, `userId`) stored on the lead record?
   - What happens when a lead is updated or when selecting an existing student?
2. How is data passed from `CRMAdmissionsModule` to `LeadPaymentModal`?
3. What changes are required to ensure the lead record reliably anchors to `studentId = LRN-xxxxxxx` and passes this faithfully to `LeadPaymentModal`?

Strict Constraints:
- READ-ONLY exploration. Do NOT modify source code files.
- Document exact file paths, line numbers, data structures, and function signatures.
- Write your comprehensive findings to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md`.
- Send a completion message to your parent when finished.
