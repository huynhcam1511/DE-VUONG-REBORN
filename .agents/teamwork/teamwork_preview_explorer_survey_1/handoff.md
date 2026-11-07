# Báo cáo Điều tra: Sổ cái (Ledger) & Webhook SePay (Explorer 1)

## 1. Observation (Quan sát trực tiếp)

### 1.1. Vị trí Sổ cái & Webhook SePay trong Codebase
- **Giao diện Sổ cái (Frontend Ledger UI)**:
  - File: `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx` (2391 dòng).
  - Tải và lắng nghe dữ liệu từ Firestore collection `ledger_transactions` (dòng 367–380) sắp xếp theo `date desc`.
  - Tải dữ liệu từ collection `crm_records` (dòng 356–363) vào `allCrmRecords`.
  - Nhận prop `students: UserProfile[]` từ `AdminDashboard.tsx` (dòng 5715, 6186–6210).
  - Hàm phân tích và định dạng thông tin thông minh: `parseLedgerSmartInfo` (dòng 95–207).
  - Bảng Sổ cái được render tại tab `ledger` (dòng 1301–1400).
- **Module Đối soát SePay (Frontend SePay IPN)**:
  - File: `De_Vuong_Webapp/src/components/admin/SepayReconciliationModule.tsx` (2627 dòng). Lắng nghe `system_status/sepay`, `customer_profiles`, và quản lý lệnh thu `COL-`.
- **Hệ thống Webhook SePay (Backend SePay Webhook)**:
  - File: `De_Vuong_Webapp/server.ts`
  - Endpoint đăng ký: `app.post("/api/sepay/webhook", sepayHandler)` và `app.post("/api/sepay/webhook/", sepayHandler)` (dòng 3238–3239).
  - Hàm xử lý `sepayHandler` (dòng 2773–3236).
  - Tạo định danh sự kiện ngân hàng duy nhất: `bankEventId = createBankEventId(sepayId, bankRef)` (dòng 2796).
  - Ghi bản ghi vào collection `bank_events` và `ledger_transactions` với ID `COL-${bankEventId}` hoặc `BANK-${bankEventId}` (dòng 2830, 2891, 2974, 3066).

### 1.2. Hiện tượng Tên Học viên hiển thị không đồng nhất ('Học viên E-learning' vs Tên thật)
- **Quan sát tại `server.ts` (dòng 3019–3045)**:
  Khi giao dịch chuyển khoản chứa tiền tố `LEA` (đơn hàng tuyển sinh E-learning), webhook cố gắng tìm thông tin khách hàng:
  ```ts
  // dòng 3025-3040 server.ts
  const profilesSnap = await db.collection('customer_profiles')
    .where('code', 'in', [fullLeaCode, `LEA${cleanLeaDigits}`])
    .limit(1)
    .get();
  // dòng 3045 server.ts
  const payerName = profileData?.fullName || profileData?.partnerName || profileData?.name || 'Học viên E-learning';
  ```
  Nhưng các hồ sơ tuyển sinh mới trong hệ thống CRM hiện tại được lưu ở collection `crm_records` (hoặc `orders`), không nằm trong `customer_profiles`. Khi đó `profileData` là `null`, dẫn đến `payerName` bị gán mặc định là `'Học viên E-learning'`. Sau đó, `server.ts` ghi vào `ledger_transactions` trường `studentName: 'Học viên E-learning'` (dòng 3073).
- **Quan sát tại `AdminLedgerModule.tsx` (dòng 113–133)**:
  Hàm `parseLedgerSmartInfo` chỉ thực hiện tra cứu CRM làm giàu tên học viên khi:
  ```ts
  // dòng 117 AdminLedgerModule.tsx
  if (!studentDisplay || studentDisplay === '---' || studentDisplay === 'N/A' || studentDisplay === '-' || studentDisplay === 'Ẩn danh' || studentDisplay.trim() === '') {
  ```
  Do `'Học viên E-learning'` không nằm trong danh sách điều kiện kiểm tra rỗng/placeholder này, khối tra cứu `allCrmRecords` (dòng 119–133) bị bỏ qua hoàn toàn đối với các bản ghi SePay. Ngược lại, những bản ghi được tạo thủ công hoặc qua các luồng khác có sẵn tên thật thì hiển thị tên thật. Hậu quả là trên cùng một mã hồ sơ `LEA-91690914`, dòng thì hiển thị "Nguyễn Thị Anh Thi", dòng lại hiển thị "Học viên E-learning".

### 1.3. Hiện tượng Sinh Mã Học viên Giả từ đuôi mã LEA (`LRN-91690914`)
- **Quan sát tại `AdminLedgerModule.tsx` (dòng 1347–1351)**:
  Cột "Đối tượng / Học viên" hiển thị mã LRN bên dưới tên học viên bằng đoạn mã:
  ```tsx
  {(smart.lrnCode || tx.internalId || tx.studentId) && (
    <span className="font-mono text-[11px] text-slate-400">
      {ensureValidBusinessCode(smart.lrnCode || tx.internalId || tx.studentId || '', 'LRN')}
    </span>
  )}
  ```
- **Quan sát tại `server.ts` (dòng 3072)**:
  Bản ghi giao dịch do SePay tạo ra lưu `studentId: fullLeaCode` (ví dụ: `LEA-91690914`).
- **Quan sát tại `src/utils/codeGenerator.ts` (dòng 104–112)**:
  Hàm `ensureValidBusinessCode(strVal, prefix)` có logic:
  ```ts
  const prefixMatch = strVal.match(/^([A-Z]{3})-(\d{8})$/i);
  if (prefixMatch) {
    const existingPrefix = prefixMatch[1].toUpperCase();
    const digits = prefixMatch[2];
    if (existingPrefix === prefix) {
      return strVal.toUpperCase();
    }
    return `${prefix}-${digits}`;
  }
  ```
  Khi `smart.lrnCode` và `tx.internalId` không có giá trị, biểu thức lấy `tx.studentId` (chính là `'LEA-91690914'`) và truyền vào `ensureValidBusinessCode('LEA-91690914', 'LRN')`.
  Do `existingPrefix = 'LEA'` khác `prefix = 'LRN'`, hàm giữ nguyên 8 chữ số `91690914` và gắn tiền tố `LRN-`, tạo ra mã giả: `LRN-91690914`.
  Trong khi đó, hồ sơ thực tế của học viên trong CRM (`crm_records`) hoặc danh sách tài khoản học viên (`users` / `sync_class_results.mjs`) có mã học viên chuẩn là `LRN-20510493` (Học viên Nguyễn Thị Anh Thi).

### 1.4. Cột 'Diễn giải' Bị Phình Chiều Cao & Lặp Dữ liệu
- **Quan sát tại `AdminLedgerModule.tsx` (dòng 1369–1378)**:
  ```tsx
  <td className="px-4 py-3.5 text-xs text-slate-600">
    <div className="flex flex-col">
      <span className="text-[12px] font-medium text-slate-800 line-clamp-1" title={smart.cleanDesc}>{smart.cleanDesc}</span>
      {tx.originalContent && tx.originalContent !== smart.cleanDesc && (
        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[320px] mt-0.5" title={tx.originalContent}>
          {tx.originalContent}
        </span>
      )}
    </div>
  </td>
  ```
  Dòng thứ 2 phơi bày trực tiếp chuỗi `tx.originalContent` (chuỗi thô từ SePay ngân hàng) ngay bên dưới dòng diễn giải, khiến dòng bảng có chiều cao 2 tầng (~55–60px), làm hàng bảng không đồng đều, vi phạm chuẩn AGENTS.md (Quy tắc 3 & 4).
- **Quan sát tại `parseLedgerSmartInfo` (dòng 181–198)**:
  ```ts
  const isSepayRaw = cleanDesc.startsWith('[SePay-?]') || cleanDesc.startsWith('[SePay-TT]') || cleanDesc.startsWith('[SePay-CP]') || cleanDesc.startsWith('[SePay ?]') || cleanDesc.startsWith('Thu hoc phi don hang E-learning') || cleanDesc.startsWith('Thu học phí đơn hàng E-learning');
  ```
  Biến `isSepayRaw` chỉ kiểm tra `[SePay-?]`, `[SePay-TT]`, `[SePay-CP]`, hoàn toàn bỏ sót các định dạng được sinh ra từ `server.ts`:
  - `[SePay-COL] Thu học phí đơn LEA-91690914 - Nguyễn Thị Anh Thi` (dòng 3075)
  - `[SePay-HP] ...` (dòng 2978)
  - `[SePay-REFUND] ...` (dòng 2893)
  Do đó, chuỗi `[SePay-COL] Thu học phí đơn LEA-91690914 - Nguyễn Thị Anh Thi` không được cắt gọt, làm lặp lại cả mã LEA lẫn tên học viên vốn đã có cột hiển thị riêng.

### 1.5. Vấn đề Tích hợp & Cộng dồn Thanh toán vào Phiếu thu (COL)
- **Quan sát tại `CRMAdmissionsModule.tsx` (dòng 1515–1527)**:
  ```ts
  const collectedAmount = allLedgerTransactions
    .filter((stx) => {
      if (stx.type === 'expected_revenue' || stx.refCode?.startsWith('COL')) return false;
      if ((stx.credit || 0) <= 0) return false;
      ...
    })
    .reduce((acc, stx) => acc + (stx.credit || 0), 0);
  ```
  Khi webhook SePay nhận tiền học phí E-learning, bản ghi sinh ra trong `ledger_transactions` có `refCode: colCode` (bắt đầu bằng `COL-`) và `type: 'tuition_fee'` với `credit: amount_in` (dòng 3066–3080 `server.ts`).
  Tuy nhiên, bộ lọc trên dòng 1517 lại loại bỏ toàn bộ bản ghi có `stx.refCode?.startsWith('COL')`. Do đó, `collectedAmount` tính ra = 0! Sau đó code chỉ lấy `directCollected = latest.credit` (chỉ 1 giao dịch đơn lẻ gần nhất) mà không cộng dồn tổng tiền các lần chuyển.
- **Quan sát tại `server.ts` (dòng 3094, 3107)**:
  Khi ghi nhận vào `crm_records` và `customer_profiles`, webhook ghi đè `paidAmount: amount_in` thay vì cộng dồn số tiền đã thanh toán trước đó (`(existingPaidAmount || 0) + amount_in`).

---

## 2. Logic Chain (Chuỗi lập luận từ quan sát đến kết luận)

1. **Từ Quan sát 1.2 & 1.1**:
   - Khi giao dịch SePay về học phí đơn hàng E-learning bắn tới webhook, `server.ts:3025` chỉ tra cứu `customer_profiles`.
   - Do hồ sơ lưu ở `crm_records`, `profileData` không tìm thấy $\to$ `payerName` mặc định thành `'Học viên E-learning'` và được lưu thẳng vào `ledger_transactions.studentName`.
   - Khi `AdminLedgerModule.tsx` tải dữ liệu, hàm `parseLedgerSmartInfo` chỉ tra cứu CRM nếu tên là rỗng/placeholder (`'---'`, `'N/A'`, `'-'`). Chuỗi `'Học viên E-learning'` không thuộc danh sách này, nên việc tra cứu CRM bị bỏ qua $\to$ Dòng này giữ nguyên `'Học viên E-learning'`, trong khi các dòng giao dịch khác có tên thật $\to$ **Dẫn đến tên học viên không nhất quán trên cùng một mã LEA**.

2. **Từ Quan sát 1.3**:
   - Do `parseLedgerSmartInfo` bỏ qua tra cứu CRM khi đã có `tx.studentName`, `matchedStudentCode` bị gán `null`.
   - Tại dòng 1349 của `AdminLedgerModule.tsx`, biểu thức fallback lấy `tx.studentId` (giá trị là `'LEA-91690914'`) và truyền vào `ensureValidBusinessCode('LEA-91690914', 'LRN')`.
   - Hàm `ensureValidBusinessCode` phát hiện tiền tố 3 chữ cái là `'LEA'` và chuyển đổi trực tiếp thành `'LRN'` với cùng 8 chữ số $\to$ tạo ra mã giả `LRN-91690914`.
   - Trong khi đó, mã LRN chuẩn của học viên này (`LRN-20510493`) đã có sẵn trong `crm_records` và danh sách người dùng `users`.
   - **Kết luận**: Tuyệt đối không được truyền mã có tiền tố `LEA-` vào `ensureValidBusinessCode(..., 'LRN')`. Cần tra cứu trực tiếp mã LRN từ CRM hoặc `students` props theo mã LEA.

3. **Từ Quan sát 1.4**:
   - `AdminLedgerModule.tsx:1369–1378` render 2 dòng văn bản trong cùng một ô `<td>`: dòng 1 là diễn giải, dòng 2 là chuỗi gốc `tx.originalContent`.
   - Chiều cao dòng bảng do đó bị kéo giãn không đều (dòng có SePay cao gấp rưỡi dòng thường), vi phạm trực tiếp Quy tắc 3 & 4 trong `AGENTS.md`.
   - Đồng thời, `parseLedgerSmartInfo` không lọc tiền tố `[SePay-COL]` và `[SePay-HP]`, khiến chuỗi diễn giải bị thừa mã LEA và tên học viên.
   - **Kết luận**: Cần chuẩn hóa diễn giải thành 1 dòng duy nhất (plain text `truncate`), cắt bỏ lặp mã LEA/tên học viên, và đưa chuỗi thô SePay vào thuộc tính `title` (tooltip) của phần tử.

4. **Từ Quan sát 1.5**:
   - Dòng 1517 `CRMAdmissionsModule.tsx` loại bỏ nhầm các giao dịch thực thu mang mã `COL-`.
   - Kết hợp với việc `server.ts:3107` ghi đè thay vì cộng dồn `paidAmount`, dẫn đến khi học viên chuyển khoản nhiều lần (ví dụ: 3.000đ + 2.000đ = 5.000đ), hệ thống chỉ ghi nhận 2.000đ hoặc 3.000đ mà không đạt 5.000đ (100%).

---

## 3. Caveats (Khu vực chưa khảo sát, Giả định & Lưu ý)

- **Giao dịch Lịch sử đã lưu trong Firestore**: Các bản ghi cũ trong collection `ledger_transactions` có thể đã được lưu cứng với `studentName: 'Học viên E-learning'` và `description: '[SePay-COL] Thu học phí đơn LEA-...'`. Giải pháp trên tầng giao diện (`parseLedgerSmartInfo`) sẽ tự động làm giàu và hiển thị chuẩn tức thì mà không bắt buộc phải chạy script migration cơ sở dữ liệu, nhưng đối với dữ liệu mới thì `server.ts` cũng cần được cập nhật.
- **Quyền hạn của Explorer**: Báo cáo này là kết quả điều tra ở chế độ Read-Only, không trực tiếp sửa đổi mã nguồn ứng dụng. Các đề xuất sửa đổi cụ thể được chuẩn bị chi tiết bên dưới để bàn giao cho các agent triển khai.

---

## 4. Conclusion (Kết luận & Đề xuất giải pháp chi tiết)

### Đề xuất 1: Sửa đổi `parseLedgerSmartInfo` và Render Bảng tại `AdminLedgerModule.tsx`
1. **Mở rộng nhận diện LEA**: Trích xuất mã LEA không chỉ từ `content` mà còn từ `tx.studentId` hoặc `tx.refCode` nếu bắt đầu bằng `LEA-`.
2. **Luôn tra cứu CRM khi có mã LEA**: Dù `tx.studentName` đã có giá trị hay mang giá trị `'Học viên E-learning'`, hàm luôn tìm bản ghi khớp mã LEA trong `allCrmRecords` để lấy Họ tên chính thức từ CRM (`matchedCrm.name || matchedCrm.fullName`) và mã học viên chuẩn (`matchedCrm.studentCode || matchedCrm.studentId || matchedCrm.learnerCode`).
3. **Triệt tiêu sinh mã LRN giả**:
   - Nếu `matchedStudentCode` hoặc `tx.internalId` có dạng `LRN-XXXXXXXX`, sử dụng trực tiếp.
   - Nếu `tx.studentId` bắt đầu bằng `LEA-`, **TUYỆT ĐỐI KHÔNG** truyền vào `ensureValidBusinessCode(tx.studentId, 'LRN')`. Chỉ hiển thị mã LRN khi thực sự có mã chuẩn từ hồ sơ (hoặc để trống nếu chưa cấp LRN).
4. **Chuẩn hóa cột Diễn giải về 1 dòng duy nhất**:
   - Tinh chỉnh `cleanDesc`: Cắt bỏ toàn bộ tiền tố `[SePay-COL]`, `[SePay-HP]`, `[SePay-?]`, loại bỏ mã LEA và tên học viên bị lặp. Gán mặc định `Thu học phí E-learning` cho các giao dịch đơn hàng tuyển sinh.
   - Hiển thị gọn gàng 1 dòng:
     ```tsx
     <td className="px-4 py-3.5 text-xs text-slate-600">
       <span
         className="text-[12px] font-medium text-slate-800 truncate block max-w-full"
         title={tx.originalContent ? `${smart.cleanDesc} • Nội dung SePay: ${tx.originalContent}` : smart.cleanDesc}
       >
         {smart.cleanDesc}
       </span>
     </td>
     ```

### Đề xuất 2: Cập nhật Webhook SePay tại `server.ts`
1. Tại nhánh LEA (dòng 3019–3048): Bổ sung tra cứu vào collection `crm_records` (bằng `fullLeaCode` hoặc query `code == fullLeaCode`) bên cạnh `customer_profiles` để lấy đúng tên học viên (`payerName`) ngay từ thời điểm nhận webhook.
2. Tái sử dụng `receiptCode` (mã COL đã có của hồ sơ) nếu hồ sơ đã có phiếu thu, tránh sinh mã COL ngẫu nhiên mới mỗi lần chuyển tiền.
3. Cộng dồn số tiền thanh toán: `paidAmount = (existingData.paidAmount || 0) + amount_in`. So sánh với học phí để chuyển trạng thái `paid` / `completed` khi đủ 100%, hoặc `partial` khi thanh toán từng đợt.

### Đề xuất 3: Cập nhật Tính toán Thu tiền tại `CRMAdmissionsModule.tsx`
1. Tại dòng 1517: Sửa điều kiện lọc `allLedgerTransactions` thành:
   ```ts
   if (stx.type === 'expected_revenue') return false;
   if ((stx.credit || 0) <= 0) return false;
   ```
   (Không loại trừ `stx.refCode?.startsWith('COL')` khi giao dịch đó là thực thu có `credit > 0`).
2. Cộng dồn tất cả các giao dịch ngân hàng / SePay khớp mã LEA hoặc COL để tính ra chính xác tổng tiền thực thu (ví dụ: 3.000đ + 2.000đ = 5.000đ), phản ánh 100% lên thanh `CommercialLifecycleBar`.

---

## 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

1. **Kiểm tra Mã LRN & Tên Học viên trên Sổ cái**:
   - Đường dẫn kiểm tra: Mở Webapp, truy cập Sổ cái (`tab=finance`).
   - Kiểm tra các bút toán có mã hồ sơ `LEA-91690914`:
     - Cột "Đối tượng / Học viên" phải hiển thị đồng nhất tên **Nguyễn Thị Anh Thi** trên mọi bút toán.
     - Dòng mã bên dưới tên phải hiển thị mã học viên chuẩn **LRN-20510493** (lấy từ CRM), hoàn toàn không còn xuất hiện mã giả **LRN-91690914**.
2. **Kiểm tra Cột Diễn giải & Chiều cao dòng bảng**:
   - Kiểm tra trực quan bảng Sổ cái: Cột "Diễn giải" hiển thị 1 dòng duy nhất, không có dòng thứ 2 bên dưới.
   - Toàn bộ các hàng trong bảng có chiều cao đều tăm tắp (khoảng 44px–46px theo padding `px-4 py-3.5`).
   - Rê chuột vào diễn giải: Xuất hiện tooltip chứa chuỗi nội dung gốc SePay ngân hàng (`tx.originalContent`).
   - Diễn giải không bị lặp lại mã `LEA-91690914` hay tên `Nguyễn Thị Anh Thi`.
3. **Kiểm tra Cộng dồn Phiếu thu (COL) & Thanh tiến trình thương mại**:
   - Mở màn hình CRM Tuyển sinh (`tab=leads`), chọn hồ sơ `LEA-91690914`.
   - Xem thanh `CommercialLifecycleBar`: Bước 4 (Dòng tiền) phải hiển thị tổng cộng dồn của tất cả các lần chuyển khoản (3.000đ + 2.000đ = 5.000đ / 5.000đ, nợ 0đ, trạng thái "Đã nộp đủ 100%").
4. **Kiểm tra Suite Test hiện có**:
   - Chạy lệnh test thanh toán tài chính:
     ```bash
     npm test -- tests/fin-pay-01.test.ts
     ```
   - Chạy kiểm tra quy chuẩn build TypeScript:
     ```bash
     npm run build
     ```
