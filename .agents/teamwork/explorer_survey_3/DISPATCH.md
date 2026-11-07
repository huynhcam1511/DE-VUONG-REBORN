## 2026-11-02T09:34:01Z
You are Explorer 3 for the Student Identity & Multi-Stage Admissions Debt Sync project.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3`
Canonical app directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
Authoritative requirements: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (read section ## 2026-11-02T09:30:40Z).

YOUR FOCUS:
Investigate Requirement R3 - Đồng bộ hiển thị và Nhận diện trên Sổ cái Kế toán (`AdminLedgerModule`):
1. Examine `AdminLedgerModule.tsx` and transaction enrichment/lookup logic:
   - When a transaction comes from SePay or manual entry with a `LEA` code or description:
   - How does the ledger resolve the customer/student name and `LRN` code?
   - Why do some transactions show "Học viên E-learning" or "---"? Where in the code is that placeholder assigned or defaulted?
   - How can we guarantee that transactions with a `LEA` code cross-reference CRM leads (or users) to display the real student name and genuine `LRN` code?
   - What about transaction descriptions and AGENTS.md compliance (table styles, typography, freeze panes, action menus, 1-line descriptions)?
2. What changes are required in `AdminLedgerModule.tsx` (and any shared transaction processing / webhook logic) to satisfy R3 and acceptance criteria?

Strict Constraints:
- READ-ONLY exploration. Do NOT modify source code files.
- Document exact file paths, line numbers, data structures, and function signatures.
- Write your comprehensive findings to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md`.
- Send a completion message to your parent when finished.
