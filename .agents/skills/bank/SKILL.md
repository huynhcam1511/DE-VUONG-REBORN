---
name: bank-reconciliation
description: >-
  Kỹ năng chuyên gia xử lý, đối soát và hạch toán sao kê ngân hàng (Vietcombank, VietinBank, TPBank...)
  với sổ kế toán học phí của trung tâm. Tự động bóc tách mã giao dịch (Trans ID, Doc No),
  lọc chi tiêu sinh hoạt, giải mã MoMo và quản lý DUY NHẤT một file Master Data tài chính có Pivot Table.
  Kích hoạt khi người dùng nhắc đến sao kê ngân hàng, đối soát học phí, mapping mã ngân hàng, @bank, hoặc thư mục Sao kê ngân hàng.
---

# Bank Reconciliation & Master Finance Skill (`@bank`)

## 1. Nguyên tắc Bất khả xâm phạm (Single Source of Truth)
1. **Thư mục Sao kê ngân hàng** (`C:\Users\zit\OneDrive\Tài liệu\Sao kê ngân hàng`):
   - Chứa các file sao kê hàng tháng tải về từ các ngân hàng (Vietcombank, VietinBank, TPBank...).
   - **ĐÂY LÀ SINGLE SOURCE OF TRUTH (Dữ liệu gốc khách quan)**: Tuyệt đối KHÔNG sửa đổi, không ghi đè, không xóa bất kỳ file sao kê hàng tháng nào của người dùng.
2. **File Kết quả DUY NHẤT**:
   - Tên file duy nhất được phép tồn tại và cập nhật:
     👉 **`Bang_Master_Tai_Chinh_De_Vuong.xlsx`**
   - Tuyệt đối không sinh ra nhiều file phụ (`...v2`, `...Final`, `...Dau_Am_Duong`). Toàn bộ việc bổ sung sao kê mới (Vietcombank, VietinBank, TPBank) đều phải gom và cập nhật trực tiếp vào file Master duy nhất này.

---

## 2. Cấu trúc Workbook Master Tài Chính (`Bang_Master_Tai_Chinh_De_Vuong.xlsx`)

File Master gồm 2 sheet đồng bộ:

### Sheet 1: `Pivot_Tai_Chinh` (Báo cáo Pivot động như Ảnh 2)
Cột báo cáo:
- `Năm` (Cấp tổng số năm, ví dụ `+ Tổng số 2024`, `+ Tổng số 2025`, `+ Tổng số 2026`)
- `Tháng` (Chi tiết từng tháng `01`, `02`, ..., `12`)
- `SUM của Phí dư` (Bảo toàn số dương `+` khi tăng quỹ và số âm `-` khi rút cấn trừ)
- `SUM của Ghi nợ` (Tổng chi phí nhận lớp, thù lao, hoàn phí)
- `SUM của Ghi có` (Tổng doanh thu học phí thực thu)
- `Lợi nhuận` = `SUM Ghi có - SUM Ghi nợ`
- `Chi phí/Doanh thu` = `SUM Ghi nợ / SUM Ghi có` (%)
- `Chi phí/ Lợi nhuận` = `SUM Ghi nợ / Lợi nhuận` (%)
- `TEST LỢI NHUẬN NÀY`

### Sheet 2: `Master_Data_Chi_Tiet` (Cơ sở dữ liệu chi tiết toàn bộ các năm)
Chứa toàn bộ các dòng giao dịch từ trước đến nay với đầy đủ 20 cột chuẩn:
1. `STT`
2. `MÃ GIAO DỊCH NGÂN HÀNG (TRANS ID)`
3. `SỐ CHỨNG TỪ (DOC NO)`
4. `NGÀY GIAO DỊCH (THỰC TẾ)`
5. `NGÀY SỔ CŨ`
6. `NĂM`, `THÁNG`
7. `MÃ LỚP`
8. `TRẠNG THÁI`
9. `GHI NỢ (CHI/LƯƠNG)`
10. `GHI CÓ (THU HỌC PHÍ)`
11. `PHÍ DƯ (+ TĂNG QUỸ / - RÚT CẤN TRỪ)`
12. `TÊN HỌC VIÊN`
13. `SỐ ĐIỆN THOẠI`
14. `MÔN HỌC`, `HÌNH THỨC`, `ĐỊA CHỈ`
15. `TRẠNG THÁI ĐỐI SOÁT`
16. `NỘI DUNG CHI TIẾT SAO KÊ`
17. `FILE NGUỒN SAO KÊ`

---

## 3. Quy tắc Kế toán Quỹ Phí Dư
- **Số Dương (`+`)**: Tăng quỹ phí dư (lớp Non-Start hoàn tiền vào quỹ, học viên nộp thừa).
- **Số Âm (`-`)**: Rút quỹ cấn trừ (lấy quỹ phí dư cũ bù vào học phí lớp mới).
- Tuyệt đối không dùng `Math.abs()` làm mất dấu âm/dương của Phí dư.

---

## 4. Mở rộng đa ngân hàng (Multi-Bank Ingestion: VietinBank, TPBank...)
Khi người dùng tải thêm file sao kê của VietinBank hoặc TPBank vào folder:
1. Đọc cấu trúc bảng sao kê của ngân hàng mới (cột Ngày, Số tiền Ghi nợ/Ghi có, Nội dung).
2. Lọc bỏ chi tiêu sinh hoạt cá nhân.
3. Đối soát mã giao dịch và ghi nhận doanh thu vào `Master_Data_Chi_Tiet`.
4. Tự động tính toán lại và làm mới bảng `Pivot_Tai_Chinh` trong `Bang_Master_Tai_Chinh_De_Vuong.xlsx`.

---

## 5. Quy tắc Nhận diện Cú pháp Chuyển khoản TPBank (Huỳnh Kiên Cẩm)
Đối với tài khoản cá nhân TPBank liên kết SePay webhook:
1. **Chiều Thu (Doanh thu)**:
   - Cú pháp VietQR chuẩn: `THANH TOAN HOC PHI [MÃ LEA / MÃ LỚP]` (ví dụ: `THANH TOAN HOC PHI LEA-46888244` hoặc `THANH TOAN HOC PHI RK1444`).
   - Tự động gán mã hồ sơ tuyển sinh `LEA` hoặc lớp học, xếp vào loại Doanh thu học phí.
2. **Chiều Chi (Chi phí nhận lớp / Chênh lệch)**:
   - Từ khóa nhận diện: `NHAN LOP [MÃ LỚP]` hoặc `NHANLOP [MÃ LỚP]` $\to$ Phân loại là **Ghi nợ (Chi phí nhận lớp)**.
   - Từ khóa chênh lệch & phí dư: `HUYNH CAM CHUYEN PHI CHENH LECH [MÃ LỚP] TRU PHI DU` (hoặc `CHENH LECH [MÃ LỚP] TRU PHI DU`) $\to$ Ghi nhận chi tiền thực tế và ghi chú khấu trừ Quỹ phí dư tồn đọng.
   - Lệnh rút tiền: `HOANPHI` (rút quỹ hoàn phí) hoặc `RUT VE VCB` / `RUT VON` (chuyển dòng tiền tích lũy sang Vietcombank).
3. **Chuẩn xuất file Excel cho Module Hạch toán Thủ công**:
   - Khi xuất dữ liệu cho người dùng import vào web (`tab=manual-accounting`), luôn xuất file Excel chuẩn 12 cột: `Năm`, `Tháng`, `Ngày`, `Mã lớp`, `Trạng thái`, `Ghi nợ`, `Ghi có`, `Phí dư`, `Tình trạng`, `Tên học viên`, `Số điện thoại`, `Ghi chú`.
