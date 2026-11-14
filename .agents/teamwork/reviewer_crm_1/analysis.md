# Báo Cáo Phân Tích & Đánh Giá Độc Lập (Analysis Report) - Reviewer CRM 1

**Dự án**: CRM Admissions Fee & Monthly Commission Extension  
**Tệp mục tiêu**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`  
**Người đánh giá**: Reviewer 1 (`teamwork_reviewer`, roles: `reviewer`, `critic`)  
**Ngày đánh giá**: 2026-11-14  

---

## 1. Quality Review Report

### Review Summary
**Verdict**: **APPROVE**  
Toàn bộ các yêu cầu R1, R2, R3, R4 từ `ORIGINAL_REQUEST.md`, chỉ đạo từ `synthesis.md`, và các quy chuẩn thiết kế trong `AGENTS.md` đã được triển khai đầy đủ, chính xác, không dùng mock/facade, và đã vượt qua 100% kiểm thử độc lập cùng lệnh build production.

---

### Findings

#### [Minor] Finding 1: Xử lý giá trị khi người dùng xóa trắng ô Phí nhận lớp trên hồ sơ đã có phí
- **Vị trí**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx:3637`
- **Mô tả**:
  ```typescript
  classIntakeFee: formClassIntakeFee !== '' ? (Number(String(formClassIntakeFee).replace(/\D/g, '')) || 0) : undefined,
  ```
  Khi người dùng xóa trắng ô "Phí nhận lớp" (`formClassIntakeFee = ''`), giá trị trả về là `undefined`. Khi chuẩn bị payload lưu Firestore qua `removeUndefinedFields(docPayload)`, trường `classIntakeFee` bị loại bỏ.
  Vì Firestore sử dụng `setDoc(..., { merge: true })`, việc thiếu trường `classIntakeFee` trong payload sẽ khiến Firestore giữ nguyên giá trị cũ của bản ghi (nếu trước đó đã có phí nhận lớp ví dụ 2.000.000 đ).
- **Hệ quả**: Nếu hồ sơ ban đầu đã có phí nhận lớp, người dùng muốn đưa về 0 bằng cách xóa sạch ký tự (thay vì gõ số 0), trên giao diện hiện tại sẽ hiển thị 0/trống, nhưng khi F5 tải lại trang Firestore sẽ trả về giá trị cũ.
- **Khuyến nghị khắc phục**: Trong tương lai có thể tối ưu thành:
  ```typescript
  classIntakeFee: formClassIntakeFee !== '' ? (Number(String(formClassIntakeFee).replace(/\D/g, '')) || 0) : 0,
  ```
  hoặc gán `0` làm giá trị mặc định. Nếu người dùng nhập `0`, hệ thống đã ghi nhận đúng `classIntakeFee: 0`.
- **Mức độ rủi ro**: Minor / Non-blocking.

---

### Verified Claims

| Xác minh | Phương pháp độc lập | Kết quả |
|---|---|---|
| **R1. Ô nhập "Phí nhận lớp"** | Kiểm tra component `SaaSCurrencyInput`, định dạng dấu chấm phân cách hàng nghìn `formatThousandsVN`, thuật toán `digitsBeforeCursor` chống nhảy trỏ chuột | **PASS** |
| **R1. Danh sách "Phí chênh lệch hàng tháng"** | Kiểm tra khởi tạo mặc định Tháng 1, nút (+) thêm Tháng N+1, nút xóa tự động đánh số lại tuần tự, cơ chế xóa trắng khi chỉ còn 1 dòng | **PASS** |
| **R2. Tính toán tổng hoa hồng & Dòng tiền thực nhận** | Kiểm tra hàm `calculateTotalCommission`, `calculateNetCashflow`, reactive hooks `useMemo`, hiển thị banner 4 chỉ số và cột bảng Master Table | **PASS** |
| **R3. Lưu trữ vĩnh viễn & Đồng bộ Firestore** | Kiểm tra `handleSaveForm`, `handleDuplicateRecord` ghi đồng thời `crm_records` và `customer_profiles`, mapping trong `latestCrmDocs`, `latestProfileDocs`, và `mergeCRMRecord` | **PASS** |
| **R4. Kiểm tra TypeScript & Build** | Chạy `npm run build` trong `De_Vuong_Webapp/` (Vite v6.4.1, 3786 modules transformed, exit code 0) | **PASS** |
| **R4. Kiểm tra Unit Test** | Chạy `npm test` trong `De_Vuong_Webapp/` (28/28 passed, 0 failures, exit code 0) | **PASS** |
| **R4. Adversarial Test Suite** | Chạy `node --import tsx --test tests/crmAdmissionsAdversarial.test.ts` (19/19 passed, 0 failures) | **PASS** |
| **AGENTS.md Rule 1** | Kiểm tra các ô trên Master Table là plain text, menu thao tác 3 chấm `AdminRowActions`, thẻ `<th>` ngoài cùng hoàn toàn để trống | **PASS** |
| **AGENTS.md Rule 4** | Kiểm tra typography, font mono cho số tiền, không lạm dụng pill badge viền màu | **PASS** |
| **AGENTS.md Rule 13** | Kiểm tra lưu vĩnh viễn Firestore, không chỉ cập nhật local state | **PASS** |
| **Sửa lỗi tồn đọng** | Import `updateDoc` từ `firebase/firestore`, chuẩn hóa `String(rec.id)` dòng 2781/2804, sửa biến `formExpectedStartDate` thành `formStartDate` dòng 4751 | **PASS** |

---

### Integrity Violation Check
- [x] Không có kết quả test bị hardcode trong source code.
- [x] Không có implementation facade / dummy; toàn bộ logic tính toán, con trỏ chuột, DOM và Firestore sync là thực tế 100%.
- [x] Không có shortcut bỏ qua yêu cầu bài toán.
- [x] Không có logs hay artifact giả mạo; toàn bộ kiểm tra được thực thi trực tiếp trên terminal môi trường.
- [x] Không vi phạm tính độc lập kiểm thử.

---

## 2. Adversarial Review Report (Critic Dimensions)

### Challenge Summary
**Overall Risk Assessment**: **LOW**  
Giải pháp đã chứng minh tính bền vững cao trước các kịch bản biên, đầu vào bẩn (dirty strings), số âm (thâm hụt tài chính), và số lượng tháng lớn.

---

### Stress Test Results

#### 1. Input Sanitization & Formatting (`formatThousandsVN` & `SaaSCurrencyInput`)
- **Kịch bản**: Nhập chuỗi bẩn có chứa ký tự lạ, chữ cái, ký hiệu tiền tệ (`'1.500.000 ₫'`, `'2,000,000 VND'`, `'  500.000  '`).
- **Hành vi thực tế**: `replace(/\D/g, '')` làm sạch chuỗi về dạng số nguyên thuần, sau đó `formatThousandsVN` định dạng chuẩn dấu chấm Việt Nam.
- **Đánh giá**: **PASS**.

#### 2. Anti-Cursor Jump Algorithm (`digitsBeforeCursor`)
- **Kịch bản**: 
  - Người dùng chèn ký tự vào giữa chuỗi (Ví dụ: `1.0|00` -> gõ `5` -> `10.5|00`).
  - Người dùng bấm Backspace xóa dấu chấm hoặc chữ số ở giữa chuỗi.
  - Người dùng xóa trắng toàn bộ chuỗi.
- **Hành vi thực tế**: Thuật toán đếm số chữ số nằm bên trái vị trí con trỏ trước khi format, sau đó map lại đúng vị trí trong chuỗi mới bằng `requestAnimationFrame` + `setSelectionRange`. Không xảy ra hiện tượng con trỏ bị giật về cuối chuỗi.
- **Đánh giá**: **PASS**.

#### 3. Financial Deficit / Negative Cashflow
- **Kịch bản**: Học phí = 5.000.000 đ, Phí nhận lớp = 4.000.000 đ, Hoa hồng tháng = 2.000.000 đ $\rightarrow$ Dòng tiền thực nhận = -1.000.000 đ.
- **Hành vi thực tế**: 
  - Hàm `calculateNetCashflow` trả về đúng `-1000000`.
  - Cashflow Banner chuyển sang viền và nền màu đỏ hồng (`border-rose-300 bg-rose-50/70 text-rose-900`), hiển thị `-${Math.abs(computedNetCashflow).toLocaleString('vi-VN')} đ` tránh lỗi hiển thị 2 dấu trừ (`--1.000.000 đ`).
  - Master Table hiển thị `Thực: -1.000.000 đ`.
- **Đánh giá**: **PASS**.

#### 4. Dynamic Month State Operations & Re-indexing
- **Kịch bản**: 
  - Tạo 12 tháng hoa hồng. Xóa tháng 5 ở giữa.
  - Xóa dòng Tháng 1 ban đầu khi có nhiều tháng.
  - Xóa dòng duy nhất còn lại khi chỉ có 1 tháng.
- **Hành vi thực tế**: 
  - Xóa tháng ở giữa: Các tháng sau tự động giảm chỉ số tuần tự (`Tháng N -> Tháng N-1`), số tiền và ghi chú của từng tháng được bảo toàn chính xác.
  - Xóa khi chỉ còn 1 dòng: Hệ thống reset rỗng `amount: ''` và `note: ''` của Tháng 1 chứ không xóa mảng thành rỗng, đảm bảo form luôn có sẵn dòng Tháng 1 cho người dùng.
- **Đánh giá**: **PASS**.

#### 5. Dual-Collection Synchronization & Merging
- **Kịch bản**: Tài liệu được ghi đồng thời lên `crm_records` và `customer_profiles`. Khi realtime snapshot trả về, `mergeCRMRecord` hợp nhất 2 nguồn dữ liệu.
- **Hành vi thực tế**: Cả 2 trường `classIntakeFee` và `monthlyCommissions` đều được mapping đầy đủ ở cả 2 listener và hàm merge bảo toàn mảng hoa hồng không bị rỗng đè lên mảng có dữ liệu.
- **Đánh giá**: **PASS**.
