# BRIEFING — 2026-11-02T09:46:00Z

## Mission
Investigate Requirement R1 - Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh & LeadPaymentModal in De_Vuong_Webapp.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Read-only investigator, codebase analyst, evidence collector
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1
- Original parent: 172bc567-8630-477a-939d-7495c3c6423e
- Milestone: Investigation R1 (Lead identity anchoring & payment modal handover)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Strictly read-only on De_Vuong_Webapp/ source files
- Document exact file paths, line numbers, data structures, and function signatures
- Write findings to handoff.md in working directory
- Send completion message to parent via send_message

## Current Parent
- Conversation ID: 172bc567-8630-477a-939d-7495c3c6423e
- Updated: 2026-11-02T09:34:01Z

## Investigation State
- **Explored paths**:
  - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` (lines 656-738, 1256-1510, 1585-1685, 2070-2100, 2660-2855, 3010-3356, 3505-3535, 3805-4320, 4605-4660, 5665-5740, 6360-6405, 6790-6860)
  - `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx` (lines 11-150, 151-285, 295-360, 500-660)
  - `De_Vuong_Webapp/src/components/admin/CommercialLifecycleBar.tsx` (lines 1-225, 585-615)
  - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx` (lines 98-240, 1360-1375)
  - `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` (lines 3441-3465)
  - `De_Vuong_Webapp/src/services/userService.ts` (lines 10-170)
  - `De_Vuong_Webapp/src/utils/codeGenerator.ts` (lines 1-100)
  - `De_Vuong_Webapp/src/utils/studentUtils.ts` (lines 1-115)
- **Key findings**:
  1. `CRMRecord` defines `studentId?: string`. In Firestore, this is written to both `customer_profiles` and `crm_records`.
  2. However, currently `formStudentId` and `studentOptions` store internal Firestore `uid` (`student_174...` or auth uid) rather than canonical `student_code_internal` (`LRN-xxxxxxx`).
  3. When typing SĐT/Email, there is no automatic student matching hook; if the user doesn't pick from dropdown, `studentId` remains `undefined`.
  4. In `LeadPaymentModal.tsx`, the header completely ignores `lead.studentId` and only renders `targetCode` (`LEA-xxxxxxx`) and `clientName`, failing to display the LRN code parallel to the LEA code.
  5. In `CommercialLifecycleBar.tsx`, `studentCode` prop lookup fails when `studentId` is an LRN or when student profile only has `student_code_internal` (omitting `studentCode`).
- **Unexplored areas**: None for R1 focus scope.

## Key Decisions Made
- Document exact root causes and provide specific before/after code proposals and function signatures for `CRMAdmissionsModule.tsx` and `LeadPaymentModal.tsx`.

## Artifact Index
- DISPATCH.md — Initial dispatch message
- BRIEFING.md — Persistent context & state
- progress.md — Liveness heartbeat
- handoff.md — 5-component handoff report (complete)
