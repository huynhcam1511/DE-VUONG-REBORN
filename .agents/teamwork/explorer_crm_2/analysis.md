# Báo Cáo Phân Tích Kỹ Thuật & Thiết Kế Giao Diện UI/UX
## Bổ Sung "Phí Nhận Lớp" & "Phí Chênh Lệch Hàng Tháng" Vào CRM Tuyển Sinh (Admissions Master)

- **Người thực hiện**: Explorer 2 (`teamwork_explorer`)
- **Dự án**: CRM Admissions Fee & Commission Extension
- **Mục tiêu**: Khảo sát mã nguồn, thiết kế vị trí đặt trường dữ liệu, giải pháp định dạng tiền tệ VNĐ chống nhảy trỏ chuột (anti-cursor jump), thiết kế danh sách động các tháng hoa hồng, và hiển thị dòng tiền thực nhận (Net Cashflow) theo chuẩn `AGENTS.md`.
- **Target File**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Tập tin quy chuẩn**: `AGENTS.md` (Admin Module UI Standards)

---

## 1. Tóm Tắt Kết Quả Khảo Sát (Executive Summary)

1. **Cơ chế Hiển thị Master-Detail trong CRM Tuyển sinh**:
   - `CRMAdmissionsModule.tsx` quản lý 2 chế độ hiển thị chính dựa trên cờ trạng thái `isFormOpen` (Dòng 1345, 4382):
     * **Master Table / Kanban View** (`isFormOpen === false`, Dòng 6176–7200): Bảng tra cứu danh sách hồ sơ tuyển sinh với Freeze Panes, Action Menu 3 chấm (`AdminRowActions`), Subtabs phân loại (`1on1`, `b2b`, `webapp`, `video`).
     * **Fullpage Detail & Form View** (`isFormOpen === true`, Dòng 4382–5970): Màn hình chi tiết toàn trang theo chuẩn AGENTS.md Rule 8 & 14, có Header cố định (`<header className="sticky top-0 z-30">`) với nút "Quay lại danh sách", Mã hồ sơ LEA, và nút "Lưu cập nhật / Tạo hồ sơ".
2. **Vị trí tích hợp Phí nhận lớp & Phí chênh lệch**:
   - Hiện tại, ô nhập "Học phí dự kiến (VNĐ)" (`formTuition`) nằm đơn lẻ tại Section 2: "2. Kế hoạch & Thông tin tư vấn" (Dòng 5130–5142), bị ép co ngắn trong cụm 4 cột `[Nguồn khách] [PIC] [Hình thức đào tạo] [Học phí dự kiến]`.
   - **Giải pháp tối ưu**: Tách biệt và nâng cấp thành phân khu chuyên biệt **"Kế hoạch Tài chính & Phí hoa hồng Tuyển sinh"** ngay trong Section 2 (Cột phải 8/12 - `lg:col-span-8`):
     * Hàng 1: `Học phí dự kiến (VNĐ)` và `Phí nhận lớp (VNĐ)` song song 2 cột.
     * Khối danh sách động: `Phí chênh lệch hàng tháng (Hoa hồng định kỳ)` với mặc định Tháng 1, nút `(+) Thêm tháng tiếp theo`, và nút xóa dòng kèm cơ chế tự động đánh số lại tháng (`Tháng 1`, `Tháng 2`...).
     * Khối tổng hợp Dòng tiền thực nhận (Real-time Cashflow Banner) hiển thị 4 chỉ số tức thì.
3. **Giải pháp Định dạng Tiền Tệ VNĐ & Chống Nhảy Con Trỏ Chuột (Anti-Cursor Jump)**:
   - Các ô nhập hiện tại sử dụng `value={formTuition ? parseInt(...).toLocaleString('vi-VN') : ''}` dẫn đến hiện tượng con trỏ chuột tự động nhảy về cuối chuỗi (jump to end) khi người dùng gõ hoặc xóa ở giữa số.
   - Xây dựng component chuẩn **`SaaSCurrencyInput`** dựa trên thuật toán đếm số chữ số trước con trỏ (`digitsBeforeCursor`) và khôi phục vị trí qua `requestAnimationFrame` + `setSelectionRange`. Hoạt động mượt mà 100%, không phụ thuộc thư viện ngoài.
4. **Tính toán Tự động & Hiển thị Dòng tiền Thực nhận**:
   - `Tổng hoa hồng hàng tháng = ∑(Phí chênh lệch các tháng)`
   - `Dòng tiền thực nhận = Học phí - Phí nhận lớp - Tổng hoa hồng hàng tháng`
   - Cập nhật tức thời (reactive `useMemo`) khi người dùng thay đổi bất kỳ ô nhập nào.
   - Tích hợp thêm nhãn phụ hiển thị dòng tiền thực nhận tinh gọn ngay trên Cột "Học phí" của Master Table View (`Thực: X đ`).

---

## 2. Kiến Trúc UI & Các Thành Phần Trong `CRMAdmissionsModule.tsx`

### 2.1 Cấu Trúc Toàn Bộ Module

| Khối giao diện | Dòng code | Vai trò & Đặc điểm |
|---|---|---|
| **Data Types (`CRMRecord`)** | 656 – 710 | Định nghĩa schema cho một bản ghi hồ sơ tuyển sinh (Lead / CRM Deal). |
| **State Declarations** | 1315 – 1550 | Chứa `records`, `selectedRecord`, `editingRecord`, `isFormOpen`, `formTuition`, v.v. |
| **Event Handlers** | 3160 – 3550 | `handleOpenCreateForm`, `handleOpenEditForm`, `handleSaveForm`, Firestore Sync. |
| **Fullpage Detail & Form View** | 4382 – 5970 | Hiển thị khi `isFormOpen === true`. Bao gồm Header cố định, Lifecycle Bar, Cột trái (Thông tin KH) và Cột phải (Kế hoạch tư vấn & Đào tạo). |
| **Master Toolbar & Subtabs** | 6181 – 6370 | Toolbar 1 hàng tinh gọn, ô tìm kiếm có `x`, bộ lọc `AdminFilterDropdown`, Subtabs chuyển đối tượng. |
| **Master Table View** | 6508 – 7000 | Bảng danh sách cuộn Freeze Panes, 11 cột, hiệu ứng hover emerald, cột ngoài cùng là Action Menu 3 chấm. |
| **Kanban View** | 6000 – 6175 | Xem theo các cột phễu thương mại (Mới quan tâm, Đang tư vấn, Chờ thu tiền, Đã thanh toán, Đã xếp lớp). |

### 2.2 Chi Tiết Cấu Trúc Form Nhập Liệu (`isFormOpen === true`)

Khi mở form tạo mới (`handleOpenCreateForm`, Dòng 3160) hoặc chỉnh sửa (`handleOpenEditForm`, Dòng 3175), giao diện chia thành 2 cột chính:
- **Cột Trái (4/12 cột - `lg:col-span-4`, Dòng 4500–5066)**:
  - Chọn loại khách: `Cá nhân` (B2C) vs `Doanh nghiệp` (B2B).
  - Tra cứu / Chọn hồ sơ học viên có sẵn từ `students` hoặc nhập: Họ tên, Số điện thoại/Zalo, Email, Địa chỉ, Mã đối chiếu chứng từ.
  - Chương trình & Chuyên đề đăng ký (B2C Demand Items).
  - Ghi chú tư vấn (`formNote`).
- **Cột Phải (8/12 cột - `lg:col-span-8`, Dòng 5069–5432)**:
  - Header: `2. Kế hoạch & Thông tin tư vấn` (Dòng 5073).
  - Hàng 1 hiện tại (Dòng 5080–5143): 4 cột `[Nguồn khách] [PIC] [Hình thức đào tạo] [Học phí dự kiến]`.
  - Hàng 2 hiện tại (Dòng 5146–5170): 3 cột ngày tháng `[Ngày ghi nhận nhu cầu] [Ngày dự kiến khai giảng] [Hẹn liên hệ lại]`.
  - Lịch học trong tuần: Khung thời gian học từ Thứ 2 đến Chủ nhật (Dòng 5173–5430).
- **Phần B2B Mở Rộng (`formKind === 'Doanh nghiệp'`, Dòng 5434–5709)**:
  - Ghi nhận giai đoạn, chương trình, phòng ban, sĩ số, số giờ.

---

## 3. Xác Định Vị Trí Tích Hợp "Phí Nhận Lớp" & "Phí Chênh Lệch Hàng Tháng"

### 3.1 Đánh Giá Các Phương Án Đặt Vị Trí

- **Phương án 1: Nhét thêm vào Modal thanh toán (`LeadPaymentModal`)**
  - *Nhược điểm*: `LeadPaymentModal` chỉ dùng để tạo giao dịch thu tiền / tạo mã QR VietQR khi khách đóng tiền. Phí nhận lớp và hoa hồng hàng tháng là các chỉ số kế hoạch tuyển sinh được thỏa thuận từ khâu tư vấn/nhận lớp, không thuộc giao dịch thu tiền học phí của học viên.
- **Phương án 2: Đặt ở Section 3 của Doanh nghiệp B2B**
  - *Nhược điểm*: Khi tuyển sinh lớp kèm 1-1 Cá nhân (B2C) qua các nguồn môi giới hoặc trung tâm giới thiệu, nhu cầu ghi nhận phí nhận lớp và hoa hồng hàng tháng vẫn phát sinh rất lớn. Nếu chỉ đặt ở B2B sẽ bỏ sót hoàn toàn phân hệ B2C.
- **Phương án 3 (Được chọn - Tối ưu nhất)**: **Tích hợp thành phân khu Tài chính chuyên biệt ngay trong Section 2 (Cột phải `lg:col-span-8`) của Detail & Form View**.
  - Phù hợp với cả học viên Cá nhân (1-1) và Doanh nghiệp (B2B).
  - Gom toàn bộ các yếu tố tài chính (Học phí, Phí nhận lớp, Phí hoa hồng từng tháng, Dòng tiền thực nhận) vào cùng một khối logic, giúp tư vấn viên và kế toán đối soát dễ dàng nhìn thấy bức tranh tài chính tổng thể của lớp học.

### 3.2 Bố Cục Chi Tiết Phân Khu "Tài Chính & Phí Hoa Hồng Tuyển Sinh"

Tại Section 2 (Cột phải, thay thế vị trí Dòng 5080–5143), tổ chức lại thành 2 cụm rõ ràng:

1. **Cụm 1: Thông tin tư vấn cơ bản (2 hàng)**:
   - **Hàng 1 (3 cột)**:
     * Cột 1: `Nguồn khách` (`AdminSaaSSelect`)
     * Cột 2: `Người phụ trách (PIC)` (`AdminSaaSSelect`)
     * Cột 3: `Hình thức đào tạo *` (`AdminSaaSSelect`)
   - **Hàng 2 (3 cột)**:
     * Cột 1: `Ngày ghi nhận nhu cầu *` (`FormDateInput`)
     * Cột 2: `Ngày dự kiến khai giảng` (`FormDateInput`)
     * Cột 3: `Hẹn liên hệ lại` (`FormDateInput`)

2. **Cụm 2: Kế hoạch Tài chính & Phí hoa hồng (Khối độc lập)**:
   - Được bao bọc trong khung viền nhẹ thanh lịch: `rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-2xs`.
   - **Tiêu đề phân khu**:
     ```tsx
     <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
       <div className="flex items-center gap-2">
         <Wallet size={15} className="text-emerald-600" />
         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
           Tài chính lớp học & Phí hoa hồng (Dòng tiền thực nhận)
         </h4>
       </div>
       <span className="text-[11px] font-medium text-slate-400">
         Đơn vị tính: VNĐ
       </span>
     </div>
     ```
   - **Hàng 1: Hai ô nhập tiền chính (Học phí & Phí nhận lớp)**:
     * Ô 1 (`w-1/2`): **Học phí dự kiến (VNĐ)** (`formTuition`)
     * Ô 2 (`w-1/2`): **Phí nhận lớp (VNĐ)** (`formClassIntakeFee`)
       - Ghi chú mờ phía dưới: *"Khoản phí thanh toán một lần khi tiếp nhận lớp từ đối tác/môi giới"*
   - **Hàng 2: Danh sách Phí chênh lệch hàng tháng (Monthly Commission List)**:
     * Tiêu đề danh sách: *"Phí chênh lệch hàng tháng (Hoa hồng định kỳ)"*
     * Hướng dẫn: *"Mặc định khởi tạo Tháng 1. Bấm (+) để thêm các tháng tiếp theo theo thời lượng khóa học."*
     * Bảng danh sách các dòng tháng (Mỗi dòng gồm: Nhãn tháng, Ô số tiền VNĐ, Ô ghi chú đối soát, Nút xóa).
     * Nút bấm: `(+) Thêm tháng tiếp theo (Tháng N)`
   - **Hàng 3: Bảng tổng hợp Dòng tiền thực nhận (Real-time Cashflow Banner)**:
     * Thẻ tóm tắt 4 chỉ số: (1) Học phí $\rightarrow$ (2) Phí nhận lớp (-) $\rightarrow$ (3) Tổng hoa hồng (-) $\rightarrow$ (4) **Dòng tiền thực nhận** (Nổi bật, font-mono, số tiền đậm).

---

## 4. Nghiên Cứu Định Dạng Tiền Tệ & Giải Pháp Chống Nhảy Con Trỏ Chuột (Anti-Cursor Jump)

### 4.1 Khảo Sát Hiện Trạng Trong Dự Án `De_Vuong_Webapp`

Hiện tại, codebase có 3 cách xử lý định dạng tiền tệ:
1. `CRMAdmissionsModule.tsx` (Dòng 2512):
   ```ts
   const formatVND = (val: string | number | undefined) => {
     if (val === undefined || val === null || val === '') return '';
     const digits = String(val).replace(/\D/g, '');
     if (!digits) return '';
     return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
   };
   ```
2. `documents/documentConstants.ts` (Dòng 74–82):
   ```ts
   export const formatVNDNumber = (val?: number | null): string => {
     if (val === undefined || val === null || isNaN(val) || val === 0) return '';
     return new Intl.NumberFormat('vi-VN').format(val);
   };
   export const parseVNDNumber = (str: string): number => {
     const digits = str.replace(/[^\d]/g, '');
     return digits ? parseInt(digits, 10) : 0;
   };
   ```
3. Input trực tiếp trong `CRMAdmissionsModule.tsx` (Dòng 5133–5139):
   ```tsx
   <input
     type="text"
     value={formTuition ? (parseInt(formTuition.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN') : ''}
     onChange={(e) => setFormTuition(e.target.value.replace(/\D/g, ''))}
   />
   ```

### 4.2 Nguyên Nhân Lỗi Nhảy Con Trỏ Chuột (Cursor Jump Issue)

Khi người dùng nhập số tiền `100.000` và muốn sửa số `0` ở giữa (ví dụ đặt con trỏ tại vị trí giữa số `100` và dấu `.`, gõ thêm số `5`):
1. Sự kiện `onChange` kích hoạt với giá trị `1005.000`.
2. Trình duyệt ghi nhận vị trí con trỏ `selectionStart = 4`.
3. Hàm xử lý tách chữ số: `"1005000"`.
4. Hàm format tạo ra chuỗi mới: `"1.005.000"`.
5. React render lại input với prop `value="1.005.000"`.
6. Trình duyệt nhận thấy chuỗi `value` bị React thay thế từ bên ngoài, mặc định chuyển vị trí con trỏ `selectionStart` về **CUỐI CÙNG** của input (`selectionStart = 9`).
7. **Hậu quả**: Người dùng gõ tiếp sẽ bị nhảy ra cuối cùng, không thể gõ liên tục vào giữa số. Khi bấm Backspace xóa dấu chấm phân cách, con trỏ cũng bị giật loạn.

### 4.3 Giải Pháp Thuật Toán Chống Nhảy Con Trỏ Chuột Hoàn Hảo

Thuật toán hoạt động dựa trên nguyên lý: **Bảo toàn số lượng chữ số đứng trước con trỏ chuột (`digitsBeforeCursor`)**.

```
Giả sử người dùng đang có chuỗi: "100.000"
Con trỏ đặt tại sau chữ số 0 thứ nhất: "10|0.000" (digitsBeforeCursor = 2)
Người dùng gõ số 5:
Chuỗi thô trong input: "1050.000"
Vị trí con trỏ thô: 3
Số chữ số trước con trỏ: "105" => digitsBeforeCursor = 3.
Số sau khi làm sạch: 1050000
Chuỗi sau khi format lại: "1.050.000"

Xác định vị trí con trỏ mới trong "1.050.000":
Duyệt từ trái sang phải, đếm số ký tự số:
- '1' -> đếm = 1
- '.' -> đếm = 1
- '0' -> đếm = 2
- '5' -> đếm = 3 === digitsBeforeCursor!
=> Đặt con trỏ ngay sau ký tự '5' (index = 4).
Kết quả trong input: "1.05|0.000"
Con trỏ đứng nguyên vẹn ngay sau ký tự người dùng vừa gõ!
```

### 4.4 Thiết Kế Component Chuẩn `SaaSCurrencyInput`

```tsx
import React, { useRef } from 'react';

export interface SaaSCurrencyInputProps {
  value: string | number | undefined;
  onChange: (rawDigits: string, numericValue: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  suffix?: string;
}

export const formatThousandsVN = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  // Format theo chuẩn phân cách hàng nghìn dấu chấm (.) phổ biến tại VN
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const SaaSCurrencyInput: React.FC<SaaSCurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  suffix = '₫',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = formatThousandsVN(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawVal = input.value;
    const rawCursor = input.selectionStart ?? rawVal.length;

    // Đếm số lượng chữ số nằm bên trái vị trí con trỏ
    const digitsBeforeCursor = rawVal.slice(0, rawCursor).replace(/\D/g, '').length;

    // Trích xuất toàn bộ chữ số sạch
    const cleanDigits = rawVal.replace(/\D/g, '');
    const numValue = cleanDigits ? parseInt(cleanDigits, 10) : 0;
    const newFormatted = formatThousandsVN(cleanDigits);

    // Tính toán lại vị trí con trỏ chính xác trong chuỗi mới
    let newCursorPos = 0;
    let digitCount = 0;
    for (let i = 0; i < newFormatted.length; i++) {
      if (/\d/.test(newFormatted[i])) {
        digitCount++;
      }
      if (digitCount === digitsBeforeCursor) {
        newCursorPos = i + 1;
        break;
      }
    }
    if (digitCount < digitsBeforeCursor) {
      newCursorPos = newFormatted.length;
    }

    // Cập nhật giá trị lên state cha
    onChange(cleanDigits, numValue);

    // Khôi phục vị trí con trỏ sau khi React re-render
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className || "h-9 w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:font-sans placeholder:text-slate-400"}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
};
```

---

## 5. Thiết Kế Danh Sách Động "Phí Chênh Lệch Hàng Tháng" (Dynamic Monthly Commission UI)

### 5.1 Cấu Trúc Dữ Liệu `MonthlyCommissionItem`

```ts
export interface MonthlyCommissionItem {
  id: string;              // Unique identifier cho React list key (e.g. "mc_1731600000_1")
  month: number;           // Số thứ tự tháng (1, 2, 3...)
  amount: string;          // Số tiền định dạng chuỗi số sạch ("500000")
  note: string;            // Ghi chú đối soát (e.g. "Đối soát qua CFE", "Chiết khấu tháng 1")
}
```

### 5.2 Khởi Tạo Giá Trị Mặc Định (Requirement R1)

1. **Khi mở form Tạo Mới (`handleOpenCreateForm`, Dòng 3160)**:
   - Mặc định luôn có sẵn dòng **Tháng 1**:
     ```ts
     setFormClassIntakeFee('');
     setFormMonthlyCommissions([
       { id: `mc_${Date.now()}_1`, month: 1, amount: '', note: '' }
     ]);
     ```
2. **Khi mở form Chỉnh Sửa (`handleOpenEditForm`, Dòng 3175)**:
   - Nếu bản ghi đã có dữ liệu `rec.monthlyCommissions` (mảng $\ge 1$ phần tử): Nạp lại danh sách đó và chuẩn hóa số thứ tự `month: idx + 1`.
   - Nếu bản ghi cũ chưa có dữ liệu: Mặc định khởi tạo dòng Tháng 1 rỗng:
     ```ts
     setFormClassIntakeFee(rec.classIntakeFee ? String(rec.classIntakeFee) : '');
     if (Array.isArray(rec.monthlyCommissions) && rec.monthlyCommissions.length > 0) {
       setFormMonthlyCommissions(
         rec.monthlyCommissions.map((item, idx) => ({
           id: item.id || `mc_${Date.now()}_${idx + 1}`,
           month: idx + 1,
           amount: item.amount !== undefined && item.amount !== null ? String(item.amount) : '',
           note: item.note || (item as any).reconciliationNote || '',
         }))
       );
     } else {
       setFormMonthlyCommissions([
         { id: `mc_${Date.now()}_1`, month: 1, amount: '', note: '' }
       ]);
     }
     ```

### 5.3 Thao Tác Thêm Dòng (`(+) Thêm tháng tiếp theo`)

Khi click nút `(+)`:
```ts
const handleAddMonthlyCommission = () => {
  setFormMonthlyCommissions((prev) => {
    const nextMonth = prev.length + 1;
    return [
      ...prev,
      {
        id: `mc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        month: nextMonth,
        amount: '',
        note: '',
      },
    ];
  });
};
```

### 5.4 Thao Tác Xóa Dòng & Đánh Số Lại Thứ Tự Tháng (Sequential Re-labeling)

Khi click nút Thùng rác (`Trash2`):
- Nếu danh sách có nhiều hơn 1 tháng: Xóa dòng tại vị trí `index`, sau đó tự động map lại `month = idx + 1` cho các dòng còn lại để bảo đảm thứ tự liên tục `Tháng 1`, `Tháng 2`, `Tháng 3` không bị khuyết.
- Nếu chỉ còn đúng 1 dòng duy nhất (Tháng 1): Thay vì xóa mất hoàn toàn làm rỗng danh sách (vi phạm Requirement R1 "mặc định có sẵn dòng Tháng 1"), thao tác này sẽ **xóa sạch giá trị** (`amount: '', note: ''`) của dòng Tháng 1.

```ts
const handleRemoveMonthlyCommission = (indexToRemove: number) => {
  setFormMonthlyCommissions((prev) => {
    if (prev.length <= 1) {
      // Giữ nguyên dòng Tháng 1, reset giá trị về rỗng
      return [{ id: prev[0]?.id || `mc_${Date.now()}_1`, month: 1, amount: '', note: '' }];
    }
    const filtered = prev.filter((_, idx) => idx !== indexToRemove);
    // Tự động đánh số lại tháng theo thứ tự tuần tự
    return filtered.map((item, idx) => ({
      ...item,
      month: idx + 1,
    }));
  });
};

const handleUpdateMonthlyCommission = (index: number, patch: Partial<MonthlyCommissionItem>) => {
  setFormMonthlyCommissions((prev) => {
    const next = [...prev];
    next[index] = { ...next[index], ...patch };
    return next;
  });
};
```

### 5.5 Giao Diện Trình Bày Danh Sách Hàng Tháng (Wireframe JSX)

```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
    <div className="flex items-center gap-1.5">
      <span>Phí chênh lệch hàng tháng (Hoa hồng định kỳ)</span>
      <span className="text-[11px] font-normal text-slate-400">
        • {formMonthlyCommissions.length} đợt tháng
      </span>
    </div>
    {totalMonthlyCommission > 0 && (
      <span className="font-mono text-xs font-bold text-amber-700">
        Tổng: {totalMonthlyCommission.toLocaleString('vi-VN')} đ
      </span>
    )}
  </div>

  <div className="space-y-2">
    {formMonthlyCommissions.map((item, idx) => (
      <div
        key={item.id}
        className="flex items-center gap-2.5 rounded-lg border border-slate-200/90 bg-slate-50/70 p-2 hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        {/* Cột 1: Nhãn Tháng cố định */}
        <div className="flex items-center gap-1.5 w-20 shrink-0 select-none pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium text-xs text-slate-700">
            Tháng {item.month}
          </span>
        </div>

        {/* Cột 2: Ô nhập số tiền VNĐ */}
        <div className="w-44 shrink-0">
          <SaaSCurrencyInput
            value={item.amount}
            onChange={(clean) => handleUpdateMonthlyCommission(idx, { amount: clean })}
            placeholder="Số tiền phí..."
            className="h-8 w-full rounded-md border border-slate-200 bg-white pl-2.5 pr-7 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Cột 3: Ô nhập ghi chú đối soát */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.note}
            onChange={(e) => handleUpdateMonthlyCommission(idx, { note: e.target.value })}
            placeholder="Ghi chú đối soát (VD: Hoa hồng giới thiệu, đối tác CFE...)"
            className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Cột 4: Nút Xóa */}
        <button
          type="button"
          onClick={() => handleRemoveMonthlyCommission(idx)}
          title={formMonthlyCommissions.length <= 1 ? "Xóa trắng dữ liệu Tháng 1" : `Xóa dòng Tháng ${item.month}`}
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ))}
  </div>

  {/* Nút Thêm Tháng Tiếp Theo */}
  <div className="pt-1">
    <button
      type="button"
      onClick={handleAddMonthlyCommission}
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition-all cursor-pointer shadow-2xs"
    >
      <Plus size={13} />
      <span>Thêm tháng tiếp theo (Tháng {formMonthlyCommissions.length + 1})</span>
    </button>
  </div>
</div>
```

---

## 6. Tính Toán Tài Chính Tự Động & Hiển Thị Dòng Tiền Thực Nhận (Real-time Net Cashflow)

### 6.1 Công Thức Tính Toán

Các giá trị số nguyên được chuẩn hóa và tính toán phản ứng tức thì qua React `useMemo`:

```ts
// 1. Học phí dự kiến
const tuitionNumber = useMemo(() => {
  return parseInt(String(formTuition || '').replace(/\D/g, ''), 10) || 0;
}, [formTuition]);

// 2. Phí nhận lớp
const classIntakeFeeNumber = useMemo(() => {
  return parseInt(String(formClassIntakeFee || '').replace(/\D/g, ''), 10) || 0;
}, [formClassIntakeFee]);

// 3. Tổng phí chênh lệch / hoa hồng hàng tháng
const totalMonthlyCommission = useMemo(() => {
  return formMonthlyCommissions.reduce((sum, item) => {
    const val = parseInt(String(item.amount || '').replace(/\D/g, ''), 10) || 0;
    return sum + val;
  }, 0);
}, [formMonthlyCommissions]);

// 4. Dòng tiền thực nhận (Net Cashflow)
const netCashflow = useMemo(() => {
  return tuitionNumber - classIntakeFeeNumber - totalMonthlyCommission;
}, [tuitionNumber, classIntakeFeeNumber, totalMonthlyCommission]);
```

### 6.2 Thiết Kế Bảng Tóm Tắt Dòng Tiền Thực Nhận (Cashflow Summary Banner)

Tuân thủ nghiêm ngặt chuẩn Typography và Anti-Pill Overload tại `AGENTS.md` (Rule 4):
- Không bọc toàn bộ thành các pill tròn viền xám lòe loẹt.
- Sử dụng thẻ card bo góc nhẹ (`rounded-lg bg-white border border-slate-200/80 p-2.5 shadow-2xs`).
- Phân định rõ thứ bậc thị giác:
  * Nhãn: `text-[11px] font-medium text-slate-500`
  * Số tiền phụ: `font-mono text-xs font-bold`
  * Dòng tiền thực nhận: `font-mono text-sm font-black` trên nền emerald dịu (`bg-emerald-50/70 border-emerald-300 text-emerald-800`).
  * Nếu Dòng tiền thực nhận âm ($< 0$): tự động cảnh báo bằng sắc đỏ (`bg-rose-50/70 border-rose-300 text-rose-700`).

```tsx
<div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
    <span className="flex items-center gap-1.5">
      <Wallet size={13} className="text-emerald-600" />
      <span>Bảng tổng hợp Dòng tiền thực nhận (Real-time Cashflow)</span>
    </span>
    <span className="font-mono text-[10px] text-slate-400 lowercase font-normal">
      (học phí - phí nhận lớp - tổng hoa hồng)
    </span>
  </div>

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
    {/* 1. Học phí dự kiến */}
    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs">
      <div className="text-[11px] font-medium text-slate-500 mb-0.5">1. Học phí dự kiến</div>
      <div className="font-mono text-xs font-bold text-slate-900">
        {tuitionNumber > 0 ? `${tuitionNumber.toLocaleString('vi-VN')} đ` : '0 đ'}
      </div>
    </div>

    {/* 2. Phí nhận lớp */}
    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs">
      <div className="text-[11px] font-medium text-slate-500 mb-0.5">2. Phí nhận lớp</div>
      <div className={`font-mono text-xs font-bold ${classIntakeFeeNumber > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
        {classIntakeFeeNumber > 0 ? `- ${classIntakeFeeNumber.toLocaleString('vi-VN')} đ` : '0 đ'}
      </div>
    </div>

    {/* 3. Tổng hoa hồng các tháng */}
    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-2xs">
      <div className="text-[11px] font-medium text-slate-500 mb-0.5">
        3. Tổng hoa hồng ({formMonthlyCommissions.length} tháng)
      </div>
      <div className={`font-mono text-xs font-bold ${totalMonthlyCommission > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
        {totalMonthlyCommission > 0 ? `- ${totalMonthlyCommission.toLocaleString('vi-VN')} đ` : '0 đ'}
      </div>
    </div>

    {/* 4. Dòng tiền thực nhận */}
    <div className={`rounded-lg border p-2.5 shadow-2xs transition-colors ${
      netCashflow > 0
        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
        : netCashflow < 0
        ? 'border-rose-300 bg-rose-50/70 text-rose-900'
        : 'border-slate-200/80 bg-white text-slate-800'
    }`}>
      <div className="text-[11px] font-semibold mb-0.5 flex items-center justify-between">
        <span>★ Dòng tiền thực nhận</span>
      </div>
      <div className={`font-mono text-sm font-black ${
        netCashflow > 0 ? 'text-emerald-700' : netCashflow < 0 ? 'text-rose-600' : 'text-slate-800'
      }`}>
        {netCashflow < 0
          ? `-${Math.abs(netCashflow).toLocaleString('vi-VN')} đ`
          : `${netCashflow.toLocaleString('vi-VN')} đ`}
      </div>
    </div>
  </div>
</div>
```

### 6.3 Bổ Sung Hiển Thị Trên Master Table View (Dòng 6786–6797)

Trên bảng Master Table View, tại cột **Học phí**, khi hồ sơ có `classIntakeFee` hoặc `monthlyCommissions`:
Hiển thị thêm dòng phụ nhỏ ở dưới:
```tsx
{/* 4B. Học phí (Giá trị gói thương vụ) */}
<td className="px-3 py-2 align-middle text-right whitespace-nowrap">
  {(() => {
    const totalTuition = Number(String(rec.tuition || '').replace(/\D/g, '')) || 0;
    if (!totalTuition) return <span className="text-slate-400 text-xs">—</span>;

    const intakeFee = Number(String(rec.classIntakeFee || '').replace(/\D/g, '')) || 0;
    const monthlyCommissionsSum = Array.isArray(rec.monthlyCommissions)
      ? rec.monthlyCommissions.reduce((sum, item) => sum + (Number(String(item.amount || '').replace(/\D/g, '')) || 0), 0)
      : 0;
    const computedNet = totalTuition - intakeFee - monthlyCommissionsSum;
    const hasDeductions = intakeFee > 0 || monthlyCommissionsSum > 0;

    return (
      <div className="flex flex-col items-end">
        <span className="font-mono text-xs font-semibold text-slate-800">
          {totalTuition.toLocaleString('vi-VN')} đ
        </span>
        {hasDeductions && (
          <span 
            className="font-mono text-[10px] font-semibold text-emerald-700" 
            title={`Học phí: ${totalTuition.toLocaleString('vi-VN')}đ | Phí nhận lớp: -${intakeFee.toLocaleString('vi-VN')}đ | Hoa hồng: -${monthlyCommissionsSum.toLocaleString('vi-VN')}đ`}
          >
            Thực: {computedNet.toLocaleString('vi-VN')} đ
          </span>
        )}
      </div>
    );
  })()}
</td>
```

---

## 7. Đồng Bộ Dữ Liệu & Lưu Trữ Vĩnh Viễn (Persistence Schema)

### 7.1 Mở Rộng Schema `CRMRecord`

Tại `CRMAdmissionsModule.tsx` (Dòng 673):
```ts
export type CRMRecord = {
  // ... các trường hiện có ...
  tuition?: string;
  classIntakeFee?: string | number;               // Phí nhận lớp (VNĐ)
  monthlyCommissions?: MonthlyCommissionItem[];  // Danh sách phí chênh lệch hàng tháng
  // ...
};
```

### 7.2 Lưu Trữ Trong `handleSaveForm` (Dòng 3376–3520)

Cập nhật payload lưu trữ:
```ts
const updated: CRMRecord = {
  ...(editingRecord || {}),
  // ...
  tuition: formTuition,
  classIntakeFee: formClassIntakeFee,
  monthlyCommissions: formMonthlyCommissions.filter(item => item.amount || item.note),
  // ...
};
```
Payload này tự động được lưu đồng thời vào cả 2 collection Firestore: `customer_profiles` và `crm_records` qua `setDoc(..., { merge: true })` (Dòng 3518–3519).

### 7.3 Hỗ Trợ Đầy Đủ Trong Sync & Listeners

- Trong `mergeCRMRecord` (Dòng 2790–2830):
  ```ts
  classIntakeFee: incoming.classIntakeFee !== undefined ? incoming.classIntakeFee : existing.classIntakeFee,
  monthlyCommissions: (incoming.monthlyCommissions && incoming.monthlyCommissions.length > 0) ? incoming.monthlyCommissions : existing.monthlyCommissions,
  ```
- Trong mapping snapshot `latestCrmDocs` và `latestProfileDocs` (Dòng 2896–3006):
  ```ts
  classIntakeFee: data.classIntakeFee,
  monthlyCommissions: data.monthlyCommissions || undefined,
  ```

---

## 8. Kế Hoạch Triển Khai Cho Worker (Implementation Roadmap)

| Bước | Mục tiêu | Phạm vi thay đổi trong `CRMAdmissionsModule.tsx` |
|---|---|---|
| **W1** | Khai báo Type & Helper Component | Thêm `MonthlyCommissionItem`, mở rộng `CRMRecord`, thêm component `SaaSCurrencyInput`. |
| **W2** | Khai báo State & Reset / Populate | Thêm `formClassIntakeFee`, `formMonthlyCommissions`. Cập nhật `handleOpenCreateForm` (default Tháng 1) và `handleOpenEditForm`. |
| **W3** | Tái Cấu Trúc Section 2 (Form Body) | Đưa Học phí + Phí nhận lớp thành hàng 2 cột; Chèn khối danh sách động Tháng 1..N; Chèn Cashflow Summary Banner. |
| **W4** | Đồng Bộ Firestore & Local State | Thêm 2 trường mới vào `handleSaveForm`, `mergeCRMRecord`, `latestCrmDocs`, `latestProfileDocs`. |
| **W5** | Nâng Cấp Bảng Master Table | Hiển thị dòng phụ `Thực: X đ` tại cột Học phí. |
| **W6** | Kiểm Thử & Build | Chạy `cd De_Vuong_Webapp; npm run build` bảo đảm exit code 0. |

---

*Báo cáo được hoàn thành và đối chiếu đầy đủ với yêu cầu tại `ORIGINAL_REQUEST.md`, kế hoạch `orchestrator_4/plan.md`, và quy chuẩn thiết kế `AGENTS.md`.*
