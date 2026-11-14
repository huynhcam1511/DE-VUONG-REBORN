# BRIEFING — 2026-11-14T16:07:00Z

## Mission
Implement "Phí nhận lớp" and "Phí chênh lệch hàng tháng" (Monthly commission dynamic rows) with real-time net cashflow calculation and Firestore sync in CRMAdmissionsModule.tsx.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_crm_1\
- Original parent: 08099f55-bb2b-4fd9-835b-93c0480cae41
- Milestone: CRM Admissions Fee & Monthly Commission Extension

## 🔒 Key Constraints
- EXCLUSIVE FILE WRITE OWNERSHIP: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` ONLY. Never modify other source files or archives/.
- Canonical application directory is `De_Vuong_Webapp/`.
- Integrity mandate: genuine implementation only, no hardcoded values or facades.
- Adhere strictly to AGENTS.md UI standards (Rule 4 Anti-Pill Overload, Rule 1 Read-only table columns with 3-dot action menu, Rule 13 API/Firestore persistence).
- Build and tests must pass with exit code 0 (`npm run build`, `npm test`).

## Current Parent
- Conversation ID: 08099f55-bb2b-4fd9-835b-93c0480cae41
- Updated: 2026-11-14T16:07:00Z

## Task Summary
- **What to build**: Add `classIntakeFee` and `monthlyCommissions` to CRM Admissions: data models, form states, input formatting, dynamic monthly rows (add, delete with sequential re-index, fallback clear), financial summary banner (Tuition, Fee, Commission, Net Cashflow), master table column annotation, Firestore persistence and dual-collection sync, snapshot listener mappings, duplicate preservation, bug fixes (`updateDoc` import, `formStartDate`).
- **Success criteria**: Zero compilation errors, `npm run build` passes, `npm test` passes, all financial calculations reactive and accurate.
- **Interface contracts**: `CRMRecord`, `MonthlyCommissionItem`
- **Code layout**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`

## Key Decisions Made
- Reorganized Section 2 of form to have clean 3-col info rows followed by a dedicated "Tài chính lớp học & Phí hoa hồng" block.
- Built `SaaSCurrencyInput` using `digitsBeforeCursor` and `requestAnimationFrame` selection restoration to prevent cursor jumping on input.
- Added reactive calculations with `useMemo` for instant real-time cashflow update.
- Updated Master Table tuition column to cleanly display `Thực: {netCash.toLocaleString('vi-VN')} đ` without pill clutter.
- Fixed pre-existing bugs in `CRMAdmissionsModule.tsx`: added missing `updateDoc` import and fixed `formExpectedStartDate` typo.

## Artifact Index
- `.agents/teamwork/worker_crm_1/DISPATCH.md` — Dispatch assignment
- `.agents/teamwork/worker_crm_1/BRIEFING.md` — Situational awareness
- `.agents/teamwork/worker_crm_1/progress.md` — Liveness & progress tracking
- `.agents/teamwork/worker_crm_1/changes.md` — Detailed change documentation
- `.agents/teamwork/worker_crm_1/handoff.md` — Handoff report

## Change Tracker
- **Files modified**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Build status**: PASS (exit code 0, vite build completed in ~14s)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS (`npm test` 28/28 passed; `npm run build` code 0)
- **Lint status**: 0 new TypeScript errors introduced in `CRMAdmissionsModule.tsx` (fixed 2 pre-existing errors)
- **Tests added/modified**: Calculation verified with formula test script
