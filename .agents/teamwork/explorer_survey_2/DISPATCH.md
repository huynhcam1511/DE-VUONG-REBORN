## 2026-11-02T09:34:01Z

You are Explorer 2 for the Student Identity & Multi-Stage Admissions Debt Sync project.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2`
Canonical app directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
Authoritative requirements: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (read section ## 2026-11-02T09:30:40Z).

YOUR FOCUS:
Investigate Requirement R2 - Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế trong `LeadPaymentModal.tsx`:
1. Examine `LeadPaymentModal.tsx` and related components/hooks:
   - How does the modal currently receive lead data and tuition?
   - Where does "1. Tổng học phí" get its initial value? Does it sync with the "Học phí dự kiến" field on the outer admission form?
   - How is `previouslyPaidAmount` calculated? Does it query `allLedgerTransactions` (or ledger state/Firebase) by `LEA`, `LRN`, or phone?
   - How does "2. Thu đợt này" propose the remaining debt (`Tổng học phí - Đã thu`)?
   - How is the VietQR amount generated from "2. Thu đợt này"?
   - How is "3. Còn lại sau đợt này" calculated in real time?
   - Header of modal: how does it display `LEA`, `LRN`, and student name?
2. What are the exact state variables, props, calculations, and UI elements that need adjustments to satisfy Acceptance Criteria (6.000đ total, 3.000đ paid -> 3.000đ due, VietQR = 3.000đ, header with LEA, LRN, Name)?

Strict Constraints:
- READ-ONLY exploration. Do NOT modify source code files.
- Document exact file paths, line numbers, data structures, and function signatures.
- Write your comprehensive findings to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md`.
- Send a completion message to your parent when finished.
