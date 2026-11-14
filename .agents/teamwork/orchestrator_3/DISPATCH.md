# Dispatch for Orchestrator 3

## Assigned Task
Triển khai thống nhất lại phân hệ Tài chính trong De_Vuong_Webapp theo Plan 3 giai đoạn (gồm 3 mục: Sổ cái & Đối soát, Quản lý Công nợ B2B+B2C, Báo cáo Dòng tiền), đồng thời bảo toàn và tích hợp trọn vẹn các thay đổi sửa lỗi định danh vừa thực hiện.

## Authoritative User Request
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md

## Working Directory
c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_3

## 2026-11-11T15:54:47Z
Triển khai thống nhất lại phân hệ Tài chính trong De_Vuong_Webapp theo Plan 3 giai đoạn (gồm 3 mục: Sổ cái & Đối soát, Quản lý Công nợ B2B+B2C, Báo cáo Dòng tiền), đồng thời bảo toàn và tích hợp trọn vẹn các thay đổi sửa lỗi định danh vừa thực hiện.

Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp
Integrity mode: development

## Requirements

### R1. Chuẩn hóa tầng dữ liệu và Identity dùng chung (Backbone)
- Bảo toàn và tích hợp trọn vẹn các thay đổi định danh hiện có trong `De_Vuong_Webapp/` (tìm kiếm và liên kết đúng hồ sơ thật qua `crm_records` và `customer_profiles`, ưu tiên hồ sơ có tên thật và mã `LRN-*`, loại bỏ các placeholder như "Chưa đặt tên").
- Thống nhất một hàm định danh đối tượng tài chính (`resolveFinanceParty`) dùng chung cho cả Sổ cái, SePay Bank Feed, Công nợ và MISA.
- Tách bạch rõ ràng 3 luồng dữ liệu:
  + Bank Feed thô (`sepay_bank_events` / hàng chờ đối soát): đánh dấu các giao dịch test để không bao giờ lọt vào tổng thu/chi thực tế.
  + Sổ cái thực thu / thực chi (`ledger_transactions`): chỉ phản ánh dòng tiền thực tế vào/ra, không trộn lẫn các bản ghi dự thu `expected_revenue` (`[LỆNH THU]`).
  + Lệnh thu / Công nợ phải thu: quy về nguồn gốc thương mại từ hợp đồng/đợt thanh toán B2B và hồ sơ CRM Leads B2C còn phải thu (`tuition - paidAmount > 0`).
- Cập nhật webhook SePay (`server.ts`) và module CRM (`CRMAdmissionsModule.tsx`) để không tạo thêm bản ghi rác và luôn đồng bộ mã `LEA-*` lên hồ sơ thật.
- Xây dựng script dry-run và xuất báo cáo đối soát/xác nhận dọn dữ liệu lịch sử trên Firestore (rà soát các ghost doc "Chưa đặt tên", đối soát giao dịch test, backfill mã `code: LEA-*`), tuyệt đối không xóa hay ghi đè dữ liệu trực tiếp lên Firestore trong quá trình chạy.

### R2. Gom gọn giao diện Sidebar Tài chính & Kế toán thành 3 mục
- Gom các mục sidebar phân hệ Tài chính & Kế toán thành đúng 3 mục chính:
  1. **Sổ cái & Đối soát**: Tích hợp Sổ cái chính thức (kèm trạng thái MISA, bộ lọc kỳ/trạng thái và tính năng xuất CSV MISA / đánh dấu đã hạch toán), Hàng đợi đối soát ngân hàng SePay (xử lý các giao dịch chưa khớp, gán hồ sơ LEA / hợp đồng B2B hoặc đánh dấu test/bỏ qua; loại bỏ sub-tab Tạo mã VietQR bị trùng), và Lịch sử Bank Feed gốc ở chế độ read-only. Loại bỏ màn hình `tab=misa` độc lập.
  2. **Quản lý Công nợ**: Tích hợp cả Công nợ Doanh nghiệp (B2B) và Công nợ Học viên (B2C lấy từ Leads/Tiến độ thu còn phải thu, có nút Thu tiền kích hoạt VietQR).
  3. **Báo cáo Dòng tiền**: Tổng hợp sạch Tổng thu, Tổng chi, Lợi nhuận từ Sổ cái thực tế (đã loại giao dịch test) và Dự thu từ tổng công nợ còn phải thu (B2B + B2C).
- Thêm cơ chế tự động chuyển hướng (redirect) từ các URL/tab cũ (`tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, `tab=finance`) sang mục và sub-tab tương ứng mới để đảm bảo tương thích ngược 100%.
- Toàn bộ giao diện các module phải tuân thủ nghiêm ngặt quy chuẩn Admin Module UI (AGENTS.md): menu hành động 3 chấm `MoreVertical` ở cột ngoài cùng bên phải, freeze panes cho tiêu đề bảng (`sticky top-0 z-20 bg-white`), thanh công cụ 1 hàng cố định sử dụng `AdminFilterDropdown`, layout full-bleed `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`, và tuyệt đối không bọc mã ID hay danh sách nhiều mục vào badge/pill viền xám.

### R3. Quy chuẩn mã nguồn và lưu trữ dữ liệu
- Mọi chỉnh sửa chỉ thực hiện trong thư mục `De_Vuong_Webapp/`, tuyệt đối không đọc/sửa các file trong `archives/`.
- Mọi thay đổi dữ liệu phải được lưu trữ bền vững qua API/Firestore theo AGENTS.md, không chỉ cập nhật local React state.

## Acceptance Criteria

### Giao diện và Điều hướng
- [ ] Sidebar phần Tài chính & Kế toán chỉ còn hiển thị đúng 3 mục: "Sổ cái & Đối soát", "Quản lý Công nợ", "Báo cáo Dòng tiền".
- [ ] Truy cập các URL tab cũ (`tab=misa`, `tab=sepay_reconcile`, `tab=sepay`, `tab=finance`) tự động chuyển hướng chính xác vào sub-tab tương ứng mới mà không phát sinh lỗi 404 hay màn hình trắng.
- [ ] Giao diện các bảng dữ liệu trên cả 3 mục tuân thủ 100% chuẩn Admin Module UI: có menu 3 chấm ở cột cuối, thẻ `<th>` cột menu để trống, tiêu đề bảng freeze pane khi cuộn, thanh công cụ 1 hàng cố định với `AdminFilterDropdown`, và mã ID hiển thị font mono không viền pill.

### Tầng Dữ liệu, Đối soát và Báo cáo
- [ ] Sổ cái và các màn hình đối soát không còn hiển thị tên placeholder "Chưa đặt tên"; hiển thị đúng tên hồ sơ thật và mã `LRN-*` / `LEA-*`.
- [ ] Đơn vị tính toán Báo cáo Dòng tiền: Tổng thu và Tổng chi chỉ tính trên các giao dịch thực tế hợp lệ (đã loại bỏ giao dịch test `SP111111...`), Dự thu lấy từ công nợ B2B và B2C thực tế thay vì cộng các bản ghi `expected_revenue`.
- [ ] Webhook SePay và logic CRM không tạo mới các document rác `crm_records/LEA-*` thiếu trường `code` khi có giao dịch mới.
- [ ] Có script dry-run và báo cáo đối soát dữ liệu lịch sử Firestore (danh sách ghost docs, giao dịch test, hồ sơ cần backfill mã) được xuất ra file báo cáo mà không thực hiện xóa trực tiếp trên database.

### Kiểm thử và Độ ổn định
- [ ] Bộ kiểm thử tự động `tests/admissionsDebtSync.test.ts` chạy pass 100%.
- [ ] Lệnh kiểm tra build `npm run build` trong `De_Vuong_Webapp/` hoàn thành thành công không có lỗi TypeScript hoặc lỗi bundle.
