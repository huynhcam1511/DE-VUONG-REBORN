## 2026-11-17T15:26:49Z
You are a teamwork_explorer.
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\
Your identity is: teamwork_explorer (CRM Admissions Codebase Explorer).

MANDATORY FIRST STEP: Read the original user request from:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md

Investigate De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx and related CRM/Lead files and types:
1. How leads, admissions, classes, and deals are currently modeled, stored, and persisted (Firestore collections, schema types, state management).
2. How initial intake fee ("Phí nhận lớp ban đầu"), commissions, tuition, and class outcome states ("Không thành công / Non-Start", "Thành công", etc.) are handled.
3. Where the financial & commission section lives in the UI/modal/detail view.
4. Where/how payment source options ("Tiền mặt / MoMo" vs "Cấn trừ từ Quỹ phí dư") can be integrated with real-time available fund balance.
5. How Corporate VAT invoice calculation (10% surcharge, 8% intermediary fee, net calculation) can be added to the lead/class detail view.
6. Verify compliance with AGENTS.md rules (read-only table cells, 3-dots action menu, single-row toolbars, sticky headers, font hierarchy, no pills overload, full-bleed table layout, apiRequests/Firestore persistence).

Write your findings and recommendations into:
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1\handoff.md
Send a completion message when done referencing the handoff path.
