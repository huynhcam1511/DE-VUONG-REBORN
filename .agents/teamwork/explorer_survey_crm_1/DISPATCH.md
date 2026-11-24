## 2026-11-19T09:07:37Z
You are Explorer Survey CRM 1 (teamwork_explorer).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_1\
The authoritative request is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
The application workspace is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\

YOUR MISSION:
Survey and inspect `CRMAdmissionsModule.tsx` and related admissions/finance logic:
1. Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md`.
2. Inspect `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` (especially Section 3 / Mục 3 - Kế hoạch học phí & thanh toán):
   - Locate Mục 3 in the component and inspect its current JSX layout, state management, and props.
   - Analyze how tuition plans (trọn gói, chia nhỏ đợt, theo tháng) are represented and selected.
   - Analyze the initial class acceptance fee (Phí nhận lớp ban đầu) and payment source switching: Tiền mặt/VCB vs Cấn trừ Quỹ Phí Dư.
   - Examine how Đợt 1 credit (Ghi có đợt 1, e.g. 900.000 ₫ or 3.600.000 ₫) is recorded and whether monthly recurring fees (tháng 2, tháng 3) currently clutter the UI.
   - Examine the actions: `[★ XẾP VÀO LỚP HỌC (START)]` and `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`, how status transition works and where data is saved.
   - Examine the VAT Doanh nghiệp calculation block (10% surcharge, 8% fee) and how to encapsulate it neatly behind `[ ] Xuất hóa đơn VAT Doanh nghiệp` checkbox toggle (default collapsed).
   - Check persistence calls: Firestore (`setDoc`, `updateDoc`, `addDoc`) or API calls.
3. Write a comprehensive survey report to `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_1\handoff.md` with concrete code snippets, line numbers, and architectural recommendations.
4. Update `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_1\progress.md`.
5. Send a message to your parent orchestrator when complete.
