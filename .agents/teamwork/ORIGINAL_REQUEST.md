# Original User Request

## 2026-11-01T17:25:05Z

Full team — Mở rộng kiểm tra toàn bộ luồng Webhook SePay, Sổ cái và đối soát đa module

Đồng bộ nhất quán luồng dữ liệu Tài chính & Tuyển sinh: Chuẩn hóa khớp mã hồ sơ LEA/LRN giữa Sổ cái (Ledger), CRM Tuyển sinh (Leads) và Phiếu thu (Collection Orders / Commercial Lifecycle Bar).

Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp
Integrity mode: development

## Requirements

### R1. Đồng nhất Định danh Học viên & Mã hồ sơ trên Sổ cái
Đảm bảo mọi giao dịch thuộc cùng một mã hồ sơ LEA-XXXXXXXX hiển thị chính xác và đồng nhất Họ tên học viên từ CRM (thay vì dòng có tên thật, dòng hiện 'Học viên E-learning'). Hiển thị đúng mã học viên LRN-XXXXXXXX thực tế từ hồ sơ, tuyệt đối không sinh mã giả từ số đuôi của mã LEA (LRN-91690914).

### R2. Tinh gọn Diễn giải & Triệt tiêu trùng lặp dữ liệu
Cắt gọt chuỗi diễn giải giao dịch ngân hàng để không lặp lại mã LEA hay tên học viên đã có cột riêng; ẩn chuỗi nội dung gốc SePay vào tooltip để chiều cao dòng bảng luôn đều tăm tắp theo AGENTS.md.

### R3. Tích hợp & Cộng dồn Thanh toán vào Phiếu thu (COL)
Đảm bảo khi có nhiều lần chuyển khoản cho cùng một mã hồ sơ/phiếu thu (ví dụ 3.000đ + 2.000đ = 5.000đ), tổng số tiền đã thu (paidAmount) trên thanh tiến trình thương mại (CommercialLifecycleBar) được cộng dồn chính xác và chuyển trạng thái hoàn tất thu tiền khi đủ 100%.

## Acceptance Criteria

### Tính chính xác dữ liệu (Data Consistency)
- [ ] Mọi bút toán cùng mã LEA hiển thị đồng nhất Họ tên học viên và mã LRN chuẩn từ hồ sơ CRM (Nguyễn Thị Anh Thi, LRN-20510493).
- [ ] Không còn tình trạng lấy số đuôi của mã LEA để ghép thành mã LRN giả.

### Tính thẩm mỹ & Trải nghiệm (UI/UX)
- [ ] Cột Diễn giải hiển thị gọn gàng 1 dòng (truncate/line-clamp-1), không bị tràn chữ hay lặp lại các thông tin đã có ở các cột khác.
- [ ] Phiếu thu tương ứng phản ánh chính xác tổng tiền đã thu thực tế từ tất cả các lần chuyển khoản (5.000đ / 5.000đ, còn nợ 0đ).


## 2026-11-02T09:30:40Z

Xây dựng và hoàn thiện cơ chế Đồng bộ liên kết gốc định danh Học viên (LRN / SĐT duy nhất) với các đợt Tuyển sinh (LEA đa đợt) và tự động tính toán bù trừ công nợ, tiến độ thực thu trên Popup VietQR/Phiếu thu và Sổ cái kế toán toàn diện.

Working directory: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
Integrity mode: development

## Requirements

### R1. Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh & Popup Thu tiền
- Khi tạo/sửa hồ sơ tuyển sinh (`LEA`) và chọn "Học viên cũ" hoặc nhập SĐT/Email trùng khớp với tài khoản trong `users`:
  - Hồ sơ tuyển sinh phải lưu trữ và liên kết chặt chẽ với mã định danh học viên duy nhất (`studentId = LRN-xxxxxxx`).
  - Modal tạo mã VietQR & Thu học phí (`LeadPaymentModal`) phải hiển thị rõ mã `LRN` song song với mã hồ sơ `LEA` (ví dụ `LEA-64817788 · LRN-62517882 · Nguyễn Thị Anh Thi`), không được để trống hoặc hiển thị placeholder vô danh.

### R2. Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế
- Khi mở Popup Thu tiền từ màn hình Tuyển sinh:
  - Trường **Tổng học phí (Ô 1)** tự động kế thừa chính xác từ ô **"Học phí dự kiến"** vừa nhập/chỉnh sửa trên form ngoài.
  - Hệ thống tự động truy vấn danh sách giao dịch thực thu trong Sổ cái Ledger (`allLedgerTransactions`) theo mã `LEA`, mã `LRN` hoặc SĐT để tính toán chính xác tổng tiền đã thu trước đó (`previouslyPaidAmount`).
  - Trường **Thu đợt này (Ô 2)** tự động đề xuất đúng số tiền còn nợ (`Tổng học phí - Đã thu`), mã VietQR tự động cập nhật đúng số tiền này.
  - Trường **Còn lại sau đợt này (Ô 3)** phản ánh số dư nợ thời gian thực theo số tiền người dùng nhập.

### R3. Đồng bộ hiển thị và Nhận diện trên Sổ cái Kế toán (Admin Ledger)
- Trên bảng Sổ nhật ký thu chi (`AdminLedgerModule`):
  - Khi có giao dịch nộp tiền từ SePay/Ngân hàng khớp theo mã `LEA` hoặc nội dung chuyển khoản:
  - Cột `Đối tượng / Học viên` phải hiển thị đúng họ tên thật của học viên và mã định danh `LRN` bên dưới.
  - Triệt tiêu hoàn toàn tình trạng hiển thị nhãn placeholder chung chung như `Học viên E-learning` hay `---`.

## Acceptance Criteria

### Tính chính xác của Dữ liệu & Tính toán Công nợ
- [ ] Mở Modal Thu tiền cho hồ sơ có học phí dự kiến 6.000đ và đã chuyển khoản trước 3.000đ: Ô "1. Tổng học phí" hiển thị 6.000đ, thanh tiến độ báo Đã thu 3.000đ / Còn nợ 3.000đ, Ô "2. Thu đợt này" tự động gợi ý 3.000đ.
- [ ] Mã VietQR sinh ra có số tiền khớp chính xác với số tiền ở Ô "2. Thu đợt này".
- [ ] Header của Modal Thu tiền hiển thị đầy đủ cả mã LEA, mã LRN và Tên học viên.

### Tính toàn vẹn trên Sổ cái Ledger & UI
- [ ] Giao dịch chuyển khoản qua mã `LEA-64817788` trên Sổ cái hiển thị rõ Họ tên học viên và mã `LRN`, không xuất hiện chuỗi `Học viên E-learning`.
- [ ] Dự án build production (`npm run build`) thành công 100%, không phát sinh lỗi TypeScript hay cú pháp.
