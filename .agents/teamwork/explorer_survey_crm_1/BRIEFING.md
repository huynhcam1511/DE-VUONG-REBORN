# BRIEFING — 2026-11-19T09:22:00Z

## Mission
Survey CRMAdmissionsModule.tsx and related admissions/finance logic focusing on Section 3 (Kế hoạch học phí & thanh toán).

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: survey, inspect, report
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_crm_1
- Original parent: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Milestone: Survey CRMAdmissionsModule and admissions/finance logic

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Editable app is De_Vuong_Webapp/ only (no edits during investigation)
- Never touch archives/
- Work strictly inside working directory for metadata and reports

## Current Parent
- Conversation ID: f6cc1e79-c7fd-4477-b25b-149ae6603513
- Updated: 2026-11-19T09:07:37Z

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md` (core user requirements R1, R2, R3, R4)
  - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx` (lines 5697-6143, Section 3, states, lifecycle, save handler)
  - `De_Vuong_Webapp/src/components/admin/StudentDetail.tsx` (lines 2866-3105, tab Học phí & Giao dịch)
  - `De_Vuong_Webapp/src/services/paymentService.ts` and `ledgerService.ts`
  - `De_Vuong_Webapp/src/components/AdminDashboard.tsx` (navigation between tabs)
- **Key findings**:
  - Mục 3 hiện tại bị lẫn lộn giữa Tuyển sinh Giai đoạn 1 và Vận hành định kỳ Giai đoạn 2 (đang chứa toàn bộ danh sách hoa hồng tháng 1, 2, 3... chiếm nhiều diện tích).
  - Khối hóa đơn VAT Doanh nghiệp đang bị kích hoạt mặc định (`formHasInvoiceDemand = true`), cần chuyển thành checkbox toggle `[ ] Xuất hóa đơn VAT Doanh nghiệp` mặc định thu gọn.
  - Cần tái cấu trúc Mục 3 thành một Thẻ Sổ cái Phẳng duy nhất (Single Flat Ledger Card) bao gồm: Kế hoạch học phí (Trọn gói / Đợt / Theo tháng), Ghi có Đợt 1, Phí nhận lớp ban đầu (Tiền mặt/VCB vs Cấn trừ Quỹ Phí Dư), VAT toggle và 2 nút hành động chuyển giao `[★ XẾP VÀO LỚP HỌC (START)]` & `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`.
  - Tab "Học phí & Giao dịch" trong `StudentDetail.tsx` cần bổ sung mã đối chiếu lớp (`LG4729`) ở header và 2 nút thao tác nhanh `[+ Thu học phí đợt tiếp theo]` & `[+ Nộp phí chênh lệch trung tâm]`.
  - Baseline build `npm run build` trong `De_Vuong_Webapp/` chạy thành công 100% không lỗi.
- **Unexplored areas**: None.

## Key Decisions Made
- Hoàn thành toàn diện báo cáo khảo sát và kiến trúc tại `handoff.md`.
- Sẵn sàng bàn giao cho orchestrator và implementer agent.

## Artifact Index
- DISPATCH.md — Received task instructions
- BRIEFING.md — Situational awareness
- progress.md — Liveness & progress tracking
- handoff.md — Comprehensive survey report
