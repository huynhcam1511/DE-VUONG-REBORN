# Original User Request

## Initial Request — 2026-11-19T09:04:24Z

Tái cấu trúc Mục 3 trong CRM Admissions và nâng cấp Màn hình Chi tiết Học viên trong De_Vuong_Webapp nhằm chuẩn hóa quy trình 2 giai đoạn: Giai đoạn 1 (Tuyển sinh / Khởi tạo) và Giai đoạn 2 (Vận hành / Hồ sơ học viên & Công nợ), tuân thủ nghiêm ngặt AGENTS.md.

Working directory: De_Vuong_Webapp
Integrity mode: development

## Requirements

### R1. Tinh gọn Mục 3 Cổng Tuyển sinh (CRMAdmissionsModule.tsx)
- Tái cấu trúc Mục 3 thành một thẻ sổ cái phẳng duy nhất (Single Flat Ledger Card) cho Giai đoạn 1 (Tuyển sinh / Khởi tạo):
  - Kế hoạch học phí: Tổng học phí, hình thức thanh toán (đóng trọn gói 1 lần, chia nhỏ theo đợt milestone, hoặc thu theo tháng).
  - Phí nhận lớp ban đầu với bộ chuyển đổi nguồn thanh toán: Tiền mặt/VCB vs Cấn trừ Quỹ Phí Dư.
  - Thu học phí đợt đầu (Ghi có đợt 1, ví dụ 900.000 ₫ hoặc trọn gói 3.600.000 ₫).
  - Thao tác quyết định chuyển giao duy nhất: nút `[★ XẾP VÀO LỚP HỌC (START)]` để hoàn tất tuyển sinh và bàn giao sang Giai đoạn 2 (Hồ sơ học viên/Vận hành), hoặc `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`.
  - Khối tính toán hóa đơn VAT Doanh nghiệp (phụ thu 10%, phí 8%) được ẩn gọn gàng bên trong checkbox toggle `[ ] Xuất hóa đơn VAT Doanh nghiệp`, mặc định ẩn.
- Không để các khoản thu định kỳ tháng 2, tháng 3 làm rối giao diện Tuyển sinh.

### R2. Nâng cấp màn hình Chi tiết Học viên (StudentDetail.tsx)
- Tại tab "Học phí & Giao dịch" (Payment & Ledger):
  - Hiển thị rõ mã đối chiếu lớp học (ví dụ: `LG4729`) trên thanh tiêu đề công nợ.
  - Kế thừa và nhận dữ liệu bàn giao từ Tuyển sinh (Tổng học phí, số tiền đã đóng từ Giai đoạn 1, số tiền còn nợ).
  - Cung cấp các nút thao tác nhanh: `[+ Thu học phí đợt tiếp theo]` (đối với đợt 2, đợt 3... ví dụ 900.000 ₫ hoặc theo tháng 2.200.000 ₫) và `[+ Nộp phí chênh lệch trung tâm]` (ví dụ: 200.000 ₫/tháng cho đối tác, tự động ghi nợ vào sổ cái chung).

### R3. Tuân thủ chuẩn AGENTS.md trong De_Vuong_Webapp
- Bảng dữ liệu read-only, thao tác qua menu 3 chấm (`MoreVertical`), thanh công cụ 1 hàng cố định, phân cấp typography chuẩn, không lạm dụng pill/badge, layout tệp liền tràn viền (Full-Bleed Layout).
- Lưu trữ dữ liệu vĩnh viễn qua Firebase/API persistence, không chỉ sửa local state.

### R4. Kiểm tra Build và Xác minh
- Chạy `npm run build` trong `De_Vuong_Webapp/` đảm bảo biên dịch thành công 0 lỗi build/TypeScript/bundle.

## Acceptance Criteria

### CRM Admissions (Section 3)
- [ ] Mục 3 trong `CRMAdmissionsModule.tsx` là một thẻ sổ cái phẳng duy nhất hiển thị kế hoạch học phí (tổng học phí, hình thức thanh toán: trọn gói, chia nhỏ đợt, theo tháng).
- [ ] Phí nhận lớp ban đầu có toggle chọn nguồn: Tiền mặt/VCB hoặc Cấn trừ Quỹ Phí Dư.
- [ ] Ghi có học phí Đợt 1 được ghi nhận chính xác, không bị lẫn các khoản thu tháng 2, tháng 3.
- [ ] Có nút hành động dứt khoát `[★ XẾP VÀO LỚP HỌC (START)]` và `[✖ NON-START (HỦY ➔ HOÀN PHÍ QUỸ)]`.
- [ ] Máy tính VAT Doanh nghiệp được thu gọn trong checkbox toggle `[ ] Xuất hóa đơn VAT Doanh nghiệp`, mặc định ẩn.

### Student Detail (Học phí & Giao dịch)
- [ ] Tab "Học phí & Giao dịch" trong `StudentDetail.tsx` hiển thị mã đối chiếu lớp (ví dụ: `LG4729`) ở header.
- [ ] Nhận và kế thừa đầy đủ dữ liệu bàn giao từ Tuyển sinh (tổng học phí, đã đóng đợt 1, dư nợ còn lại).
- [ ] Có các nút thao tác nhanh `[+ Thu học phí đợt tiếp theo]` và `[+ Nộp phí chênh lệch trung tâm]` (ghi nợ sổ cái chung).

### AGENTS.md Compliance
- [ ] Tuân thủ các quy tắc bảng biểu, menu 3 chấm, typography, layout tràn viền và persistence vào Firestore/API.

### Build Verification
- [ ] Lệnh `npm run build` trong `De_Vuong_Webapp/` hoàn thành với mã thoát 0, không có lỗi TypeScript hoặc bundle.
