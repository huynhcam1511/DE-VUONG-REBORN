## 2026-11-17T15:37:19Z
You are a teamwork_worker.
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_1\
Your identity is: teamwork_worker (General Ledger & Cashflow Worker).

MANDATORY FIRST STEP: Read the original user request from:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md

Also read:
- Project Specification: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\PROJECT.md
- Finance Architecture Findings: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_2\handoff.md
- Excel & Domain Findings: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\handoff.md

Write Ownership:
You exclusively own:
- De_Vuong_Webapp/src/types/admin.ts
- De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope of Work (Milestone 1):
1. In `src/types/admin.ts`:
   - Add `surplus_withdrawal` to `TransactionType` if not already present.
2. In `src/components/admin/AdminLedgerModule.tsx`:
   - Table Column: Rename header column from "Tồn quỹ" to "Phí dư" (with `w-[120px]`).
   - Style `tx.surplus` cells in the ledger table:
     * `tx.surplus > 0`: `+{tx.surplus.toLocaleString('vi-VN')} đ` in `text-emerald-700 font-semibold font-mono whitespace-nowrap`
     * `tx.surplus < 0`: `-{Math.abs(tx.surplus).toLocaleString('vi-VN')} đ` in `text-amber-700 font-semibold font-mono whitespace-nowrap`
     * `0` / empty: `<span className="text-slate-300 font-normal">-</span>`
   - Quỹ Phí Dư Available Balance Calculation:
     * Compute `availableSurplus = transactions.filter(t => !isTestTransaction(t)).reduce((sum, t) => sum + (t.surplus || 0), 0)`.
   - KPI Summary Cards in Cashflow (`activeSubTab === "summary"`):
     * Add a clean 4-card metric strip at the top of the Cashflow view:
       1. Quỹ Phí Dư Khả Dụng (`availableSurplus.toLocaleString('vi-VN')} đ`)
       2. Tổng Doanh Thu Thực Nhận (`totalCredit.toLocaleString('vi-VN')} đ`)
       3. Tổng Chi Phí Hoạt Động (`totalDebit.toLocaleString('vi-VN')} đ`)
       4. Lợi Nhuận Dòng Tiền (`(totalCredit - totalDebit).toLocaleString('vi-VN')} đ`)
   - Toolbar Badge in Sổ Cái (`activeSubTab === "ledger"`):
     * Place a compact, clean Quỹ Phí Dư badge on the sticky toolbar header per AGENTS.md single-row rule.
   - Quick Action "Rút quỹ (HOANPHI)":
     * Add button `+ Rút quỹ (HOANPHI)` on the toolbar.
     * Implement withdrawal modal:
       - Displays available fund balance.
       - Inputs: withdrawal amount (validated `<= availableSurplus`), receiving account/method (`paymentMethod`), date, description.
       - Creates transaction in Firestore `ledger_transactions`:
         `{ refCode: 'HOANPHI', type: 'surplus_withdrawal', credit: amount, debit: 0, surplus: -amount, paymentMethod, studentName: 'Trung tâm hoàn phí', description, ... }`
       - Updates local state immediately for instant feedback.
   - Fix Modal Surplus Calculation:
     * In `handleSaveModalTransaction` (around line 468), compute `surplus`:
       If `modalType === 'class_cancel_surplus'` -> `cleanAmount`.
       If `modalType === 'class_accept_surplus'` -> `-cleanAmount`.
       Otherwise -> `0`.
   - Update `parseLedgerSmartInfo` to recognize `surplus_withdrawal` as `'Rút quỹ hoàn phí (HOANPHI)'`.

Strictly Adhere to AGENTS.md Rules:
- Read-only table cells, 3-dots action menu, single-row toolbars, sticky headers, font hierarchy, no pills overload, full-bleed table layout, apiRequests/Firestore persistence.

Verification:
- Run `npm run lint` and `npm run build` in `De_Vuong_Webapp/`.
- Ensure all builds succeed with 0 errors.

Deliver full results and verification output into:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1_1\handoff.md
Send a completion message when done referencing the handoff path.
