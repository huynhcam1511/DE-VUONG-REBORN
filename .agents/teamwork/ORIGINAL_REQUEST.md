# Original User Request

## Approved Task Prompt — 2026-11-14T15:42:49Z

Triển khai bổ sung ô nhập "Phí nhận lớp" và "Phí chênh lệch (định nghĩa là Phí hoa hồng hàng tháng)" vào Màn hình Tuyển sinh Master CRM (De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx).

Working directory: De_Vuong_Webapp
Integrity mode: development

## Requirements

### R1. Bổ sung trường "Phí nhận lớp" và danh sách "Phí chênh lệch hàng tháng" vào CRM Tuyển sinh
- Thêm ô nhập "Phí nhận lớp": nhập số tiền VNĐ và tự động định dạng phân cách hàng nghìn khi nhập.
- Thêm danh sách "Phí chênh lệch hàng tháng" (Phí hoa hồng định kỳ theo tháng): mặc định có sẵn dòng Tháng 1 (gồm ô nhập số tiền VNĐ và ghi chú đối soát), có nút (+) để thêm các tháng tiếp theo (Tháng 2, Tháng 3... tùy biến theo số tháng của lớp học) và có nút xóa dòng tháng.
- Phạm vi hiển thị trên giao diện CRM Tuyển sinh do nhóm triển khai tự quyết định dựa theo các tiêu chuẩn thiết kế trong AGENTS.md.

### R2. Tự động tính toán tổng hoa hồng và dòng tiền thực nhận
- Tự động tính toán tổng hoa hồng hàng tháng từ các dòng phí chênh lệch đã nhập.
- Tự động tính toán và hiển thị dòng tiền thực nhận theo công thức: Học phí - Phí nhận lớp - Tổng hoa hồng.

### R3. Lưu trữ vĩnh viễn và đồng bộ dữ liệu
- Lưu trữ vĩnh viễn dữ liệu phí nhận lớp và danh sách phí chênh lệch hàng tháng vào Firestore và local state, đồng bộ với cấu trúc CRMRecord.
- Tuân thủ triệt để các tiêu chuẩn thiết kế bảng và form trong AGENTS.md.

### R4. Kiểm tra chất lượng và build
- Kiểm tra compile TypeScript không có lỗi type.
- Chạy lệnh 'npm run build' trong De_Vuong_Webapp thành công không có lỗi.

## Acceptance Criteria

### Chức năng và Giao diện
- [ ] Ô nhập "Phí nhận lớp" cho phép nhập số tiền VNĐ và hiển thị định dạng phân cách hàng nghìn chính xác.
- [ ] Danh sách "Phí chênh lệch hàng tháng" hiển thị mặc định dòng Tháng 1 gồm số tiền và ghi chú đối soát.
- [ ] Nút (+) thêm dòng tháng tiếp theo (Tháng 2, Tháng 3...) và nút xóa dòng hoạt động chính xác.
- [ ] Tổng hoa hồng hàng tháng và Dòng tiền thực nhận (Học phí - Phí nhận lớp - Tổng hoa hồng) được tính toán tự động và cập nhật tức thì khi người dùng thay đổi giá trị.
- [ ] Giao diện các trường mới tuân thủ các quy tắc trong AGENTS.md (typography, khoảng cách, không lạm dụng pill).

### Lưu trữ dữ liệu
- [ ] Dữ liệu "Phí nhận lớp" và "Phí chênh lệch hàng tháng" được lưu thành công vào Firestore và giữ nguyên khi tải lại trang.

### Build và Kiểm thử
- [ ] Lệnh 'npm run build' trong De_Vuong_Webapp chạy hoàn tất với mã trả về 0 (exit code 0), không có lỗi TypeScript hay cú pháp.
