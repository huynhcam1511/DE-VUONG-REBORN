## 2026-11-14T15:55:29Z
You are Worker 1 (teamwork_worker) for the CRM Admissions Fee & Monthly Commission Extension project.

Your Working Directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_1\
Original Request File: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
Scope / Plan File: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_4\plan.md
Synthesis File: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_4\synthesis.md
Repository Rules: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\AGENTS.md
Canonical Application Directory: De_Vuong_Webapp/ (NEVER touch archives/)

Explorer Reports to Review:
- Explorer 1: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_1\analysis.md
- Explorer 2: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_2\analysis.md
- Explorer 3: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_3\analysis.md

EXCLUSIVE FILE WRITE OWNERSHIP:
You own `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`. You MUST NOT modify other source code files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR ASSIGNMENT:
Implement "Phí nhận lớp" and "Phí chênh lệch hàng tháng" (Monthly commission) in `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` in strict accordance with ORIGINAL_REQUEST.md, synthesis.md, and AGENTS.md.

Requirements to implement:
1. Schema & Types:
   - Define `MonthlyCommissionItem` interface: `{ id?: string; month: number; amount: number | string; note: string; }`.
   - Extend `CRMRecord` with `classIntakeFee?: number` and `monthlyCommissions?: MonthlyCommissionItem[]`.
2. Form State & Handlers:
   - State for `formClassIntakeFee` (formatted number string) and `formMonthlyCommissions` (`MonthlyCommissionItem[]`, defaulting to Month 1: `[{ month: 1, amount: 0, note: '' }]`).
   - `handleAddMonthlyCommission`: appends `Tháng N+1`.
   - `handleRemoveMonthlyCommission`: deletes row and re-indexes remaining months sequentially. If 1 row remains, clears values instead of leaving an empty list.
   - `handleUpdateMonthlyCommission`: updates amount or reconciliation note.
3. UI Layout in Section 2 (Kế hoạch & Thông tin tư vấn):
   - "Phí nhận lớp" input: formatted with VNĐ thousands separators (e.g. `1.000.000 ₫` / `1,000,000 ₫`), anti-cursor-jump handling.
   - Dynamic monthly commission list:
     * Label with sequential month (Tháng 1, Tháng 2...).
     * Amount input (with thousands separator).
     * Reconciliation note input ("Ghi chú đối soát").
     * Remove button with trash icon.
     * `(+) Thêm tháng tiếp theo` button.
4. Reactive Financial Calculation & Display:
   - Total Monthly Commission = sum of monthly differences.
   - Net Cashflow = Tuition - ClassIntakeFee - TotalMonthlyCommission.
   - Live reactive updates on every keystroke.
   - Financial Summary Banner with 4 metrics (Tuition, Class Intake Fee, Total Commission, Net Cashflow) styled cleanly according to AGENTS.md Rule 4 (no candy badges, clear contrast, rose if negative, emerald if positive).
   - In Master Table "Học phí" column, add clean secondary plain text: `Thực: {formatVND(netCashflow)} ₫`.
5. Persistence to Firestore & LocalState:
   - In `handleSaveForm`, save `classIntakeFee` and `monthlyCommissions` to `docPayload`. Write via `setDoc(..., { merge: true })` with `removeUndefinedFields` to both `crm_records` and `customer_profiles`.
   - In `latestCrmDocs` and `latestProfileDocs` snapshot listeners: map `classIntakeFee` and `monthlyCommissions`.
   - In `mergeCRMRecord`: map `classIntakeFee` and `monthlyCommissions`.
   - In `handleDuplicateRecord`: preserve `classIntakeFee` and `monthlyCommissions`.
6. Fix pre-existing minor bugs in `CRMAdmissionsModule.tsx`:
   - Add missing `updateDoc` import from `firebase/firestore`.
   - Fix typo `formExpectedStartDate` -> `formStartDate`.
7. Build & Verification:
   - Run `npm run build` in `De_Vuong_Webapp/` — MUST pass with exit code 0.
   - Run `npm test` in `De_Vuong_Webapp/` — MUST pass with exit code 0.
   - Check TypeScript compilation for zero new errors.

OUTPUT REQUIREMENTS:
- Write full details of changes made to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_1\changes.md`.
- Write your handoff report to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_1\handoff.md`. Include the exact build/test commands and outputs.
- Send a completion message to the orchestrator when finished.
