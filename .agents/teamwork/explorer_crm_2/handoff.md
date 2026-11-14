# Báo Cáo Bàn Giao (Handoff Report) — Explorer 2: UI & Interaction Design
## Dự án: CRM Admissions Fee & Commission Extension

**Người lập**: Explorer 2 (`teamwork_explorer`)  
**Người nhận**: Orchestrator (`08099f55-bb2b-4fd9-835b-93c0480cae41`)  
**Tập tin phân tích chi tiết**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_crm_2\analysis.md`  

---

## 1. Observation (Quan Sát Trực Tiếp)

1. **Target Module & Cấu trúc Master-Detail**:
   - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`:
     * Dòng 656–710: Định nghĩa `CRMRecord`. Hiện có `tuition?: string;`, `paidAmount?: number | string;`, nhưng **chưa có** `classIntakeFee` hay `monthlyCommissions`.
     * Dòng 1345: Cờ `const [isFormOpen, setIsFormOpen] = useState(false);` quản lý hiển thị Master-Detail.
     * Dòng 4382: `if (isFormOpen) {` hiển thị màn hình Fullpage Detail & Form View theo chuẩn AGENTS.md Rule 8 & 14 (Header sticky với nút Quay lại danh sách, mã LEA mono font, nút Lưu cập nhật).
     * Dòng 6176–7200: Hiển thị Master Table View và Kanban View khi `isFormOpen === false`.
2. **Vị trí hiện tại của các trường tài chính trong Form**:
   - Dòng 5069–5432: Section 2 Cột phải (`lg:col-span-8`) tiêu đề "2. Kế hoạch & Thông tin tư vấn".
   - Dòng 5130–5142: Ô nhập "Học phí dự kiến (VNĐ)" hiện đang nằm ở vị trí thứ 4 trong hàng 4 cột:
     ```tsx
     <div>
       <label className="block text-xs font-semibold text-slate-700 mb-1">Học phí dự kiến (VNĐ)</label>
       <div className="relative">
         <input
           type="text"
           value={formTuition ? (parseInt(formTuition.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN') : ''}
           onChange={(e) => setFormTuition(e.target.value.replace(/\D/g, ''))}
           placeholder="Nhập mức học phí..."
           className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 text-xs font-semibold text-emerald-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
         />
         <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">₫</span>
       </div>
     </div>
     ```
3. **Hiện tượng nhảy con trỏ chuột (Cursor Jump)**:
   - Các input số tiền hiện tại (dòng 5135 trong `CRMAdmissionsModule.tsx` và dòng 1468 trong `DocumentManagementModule.tsx`) áp dụng trực tiếp `toLocaleString('vi-VN')` hoặc `formatVNDNumber()` trên prop `value`.
   - Khi gõ hoặc xóa một ký tự ở giữa chuỗi, React thay đổi giá trị prop `value`, trình duyệt mất dấu vị trí con trỏ và đưa `selectionStart` về cuối chuỗi input (`selectionStart = length`).
4. **Vị trí lưu trữ dữ liệu**:
   - Dòng 3518–3519: `await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });` và `await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });`. Cả hai collection đều cần chứa các trường mới.
5. **Trạng thái Build của Ứng dụng**:
   - Chạy lệnh `cd De_Vuong_Webapp; npm run build` hoàn thành với mã thoát 0 (exit code 0), build thành công trong 10.72 giây, tạo đầy đủ bundle trong `dist/`.

---

## 2. Logic Chain (Chuỗi Lập Luận)

1. **Từ Observation 1 & 2 $\rightarrow$ Xác định vị trí tích hợp UI**:
   - Do `CRMAdmissionsModule.tsx` phục vụ cả đối tượng học viên 1-1 (B2C) và đào tạo Doanh nghiệp (B2B), đặt các trường tài chính vào Section 2 ("Kế hoạch & Thông tin tư vấn", Cột phải 8/12) là vị trí duy nhất đảm bảo bao quát 100% các loại hình lớp học.
   - Việc tách Row 1 hiện tại (4 cột bị chật) thành:
     * Cụm thông tin tư vấn cơ bản (3 cột: Nguồn khách, PIC, Hình thức đào tạo; và 3 cột ngày tháng).
     * Khối độc lập "Tài chính lớp học & Phí hoa hồng Tuyển sinh" (gồm Học phí dự kiến, Phí nhận lớp, Danh sách tháng hoa hồng và Bảng tổng hợp dòng tiền thực nhận) giúp giao diện thông thoáng, rõ ràng và tuân thủ chuẩn Typography tại AGENTS.md Rule 4.
2. **Từ Observation 3 $\rightarrow$ Giải pháp Anti-Cursor Jump**:
   - Thuật toán đếm số chữ số đứng trước con trỏ chuột (`digitsBeforeCursor`) trong chuỗi thô của sự kiện `onChange`, sau đó ánh xạ lại vị trí tương ứng trong chuỗi đã định dạng bằng dấu chấm phân cách hàng nghìn (`formatThousandsVN`), và khôi phục qua `requestAnimationFrame(() => input.setSelectionRange(...))` triệt tiêu 100% hiện tượng nhảy con trỏ chuột.
   - Đóng gói thành component `SaaSCurrencyInput` giúp tái sử dụng đồng nhất cho: Học phí, Phí nhận lớp, và tất cả các ô số tiền của từng tháng.
3. **Từ Observation 1 & Yêu cầu R1 $\rightarrow$ Thiết kế danh sách động**:
   - Mặc định danh sách khởi tạo với Tháng 1: `[{ id: '...', month: 1, amount: '', note: '' }]`.
   - Nút `(+)` nối thêm `Tháng N+1` vào cuối danh sách.
   - Nút xóa dòng lọc bỏ phần tử được chọn và map lại `month = idx + 1` để đảm bảo thứ tự luôn tuần tự (Tháng 1, Tháng 2, Tháng 3...). Nếu chỉ còn 1 dòng duy nhất, nút xóa reset giá trị về rỗng thay vì xóa mất dòng Tháng 1.
4. **Từ Yêu cầu R2 $\rightarrow$ Tính toán tức thì**:
   - Sử dụng React `useMemo` tính:
     * `totalMonthlyCommission = sum(formMonthlyCommissions.map(item => item.amount))`
     * `netCashflow = tuitionNumber - classIntakeFeeNumber - totalMonthlyCommission`
   - Hiển thị bảng tổng hợp 4 thẻ card trực quan ngay bên dưới danh sách tháng, và bổ sung dòng hiển thị phụ `Thực: X đ` tại cột Học phí của Master Table.
5. **Từ Observation 4 & 5 $\rightarrow$ Đồng bộ dữ liệu & kiểm thử**:
   - Cập nhật `CRMRecord`, `handleSaveForm`, `mergeCRMRecord`, `latestCrmDocs`, `latestProfileDocs` để dữ liệu được lưu bền vững vào cả Firestore và localStorage.

---

## 3. Caveats (Điểm Cần Lưu Ý)

1. **Số âm khi Dòng tiền thực nhận $< 0$**:
   - Nếu Học phí chưa nhập (bằng 0) nhưng đã nhập Phí nhận lớp hoặc Hoa hồng, Dòng tiền thực nhận sẽ mang giá trị âm. Hệ thống cần hiển thị rõ ràng dấu trừ (ví dụ `-1.000.000 đ`) và đổi màu viền/chữ sang tông đỏ (`text-rose-600 bg-rose-50/70 border-rose-300`) để cảnh báo người dùng.
2. **Hồ sơ cũ chưa có dữ liệu hoa hồng**:
   - Khi mở chỉnh sửa một hồ sơ cũ (`handleOpenEditForm`), nếu `rec.monthlyCommissions` là `undefined` hoặc mảng rỗng, hệ thống phải tự động fallback về mảng mặc định có Tháng 1 rỗng để giao diện hiển thị đồng nhất.

---

## 4. Conclusion (Kết Luận & Đề Xuất)

- **Vị trí UI**: Tạo phân khu chuyên biệt *"Tài chính lớp học & Phí hoa hồng (Dòng tiền thực nhận)"* nằm trong Section 2 của `CRMAdmissionsModule.tsx` (Dòng 5130).
- **Component nhập tiền**: Sử dụng `SaaSCurrencyInput` với thuật toán đếm chữ số và `setSelectionRange` trong `requestAnimationFrame` để chống nhảy con trỏ chuột.
- **Danh sách động**: Mặc định Tháng 1, hỗ trợ thêm tháng tiếp theo, xóa dòng có tự động đánh số lại thứ tự tuần tự.
- **Dòng tiền thực nhận**: Tính tự động theo công thức `Học phí - Phí nhận lớp - Tổng hoa hồng`, cập nhật real-time và hiển thị trên cả Form chi tiết lẫn Master Table.
- **Mã nguồn đã sẵn sàng**: Chi tiết JSX, hàm xử lý và vị trí dòng sửa đổi đã được ghi đầy đủ tại `analysis.md` cho Worker tiến hành triển khai.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

1. **Kiểm tra Build dự án**:
   - Mở terminal tại thư mục gốc workspace.
   - Chạy lệnh:
     ```powershell
     cd De_Vuong_Webapp
     npm run build
     ```
   - Điều kiện đạt: Lệnh thoát với mã 0 (`exit code 0`), bundle được sinh ra trong `dist/`.
2. **Kiểm tra giao diện & tính năng tương tác**:
   - Mở ứng dụng web tại tab Quản lý Tuyển sinh (`tab=leads`).
   - Bấm nút `+ Thêm nhu cầu học` (hoặc mở chỉnh sửa một hồ sơ bất kỳ):
     * Xác nhận ô "Học phí dự kiến" và "Phí nhận lớp" hiển thị định dạng phân cách hàng nghìn dấu chấm (`.`).
     * Thử đặt con trỏ chuột vào giữa số tiền và gõ thêm/xóa: con trỏ chuột phải giữ nguyên vị trí, không bị nhảy về cuối.
     * Xác nhận danh sách có sẵn dòng `Tháng 1` với ô số tiền và ghi chú đối soát.
     * Bấm `(+) Thêm tháng`: xác nhận xuất hiện `Tháng 2`, `Tháng 3`.
     * Bấm xóa `Tháng 2`: xác nhận các dòng còn lại tự động đánh số lại thành `Tháng 1`, `Tháng 2`.
     * Nhập Học phí = 10.000.000đ, Phí nhận lớp = 2.000.000đ, Tháng 1 = 1.000.000đ, Tháng 2 = 500.000đ: xác nhận Thẻ Dòng tiền thực nhận hiển thị chính xác `6.500.000 đ`.
   - Bấm "Lưu cập nhật / Tạo hồ sơ", tải lại trang (F5): xác nhận dữ liệu Phí nhận lớp và các dòng tháng hoa hồng vẫn được lưu nguyên vẹn từ Firestore.
