# Handoff Report — Implementation Worker (Milestone M1)

**Dự án**: Student Identity & Multi-Stage Admissions Debt Sync  
**Phân hệ**: Milestone M1 (CRM Admissions, LeadPaymentModal, AdminLedgerModule, AdminDashboard, server.ts)  
**Tác giả**: Implementation Worker M1  
**Ngày hoàn thành**: 2026-11-02T10:09:00Z  
**Thư mục làm việc**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_m1`  
**Thư mục ứng dụng chuẩn**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`  

---

## 1. Observation

1. **Khuyết điểm neo mã học viên LRN & Header Popup Thu tiền (R1)**:
   - Trong `CRMAdmissionsModule.tsx`: Trước đây `studentOptions` gán `value: st.uid` (chuỗi Firestore UID nội bộ dạng `student_174...`), khiến `handleSelectStudent` và `handleSaveForm` chỉ lưu UID hoặc để `undefined` nếu người dùng nhập tay số điện thoại/email.
   - Trong `LeadPaymentModal.tsx`: Header (dòng 232–248) chỉ hiển thị `{targetCode}` giải quyết cho `lead` bằng `ensureValidBusinessCode(lead.code || lead.id, 'LEA')`, hoàn toàn bỏ qua mã học viên `LRN-xxxxxxxx`.
   - Trong `onPaymentRecorded`: Cả 2 nơi (màn hình chi tiết và danh sách) đều gán `updatePayload.studentId = targetStudentId` bằng `matchedStudent.uid` hoặc `newStu.uid`, dẫn đến việc lưu Firestore raw UID vào trường `studentId` của hồ sơ CRM.

2. **Khuyết điểm liên kết Học phí dự kiến & Tính toán công nợ thực thu (R2)**:
   - Trong `CRMAdmissionsModule.tsx:1359`: `handleOpenLeadPayment` dùng `parseInt(String(formTuition || target?.tuition || ''))` kiểm tra `formTuition` trước, khiến học phí của bản ghi đang sửa bị rò rỉ sang các bản ghi khác khi mở từ bảng danh sách.
   - Tại dòng 1388: `paidAmount: Number(target?.paidAmount || 0)` chỉ truyền `target.paidAmount` (thường là 0 trên Firestore `crm_records`), không truy vấn danh sách giao dịch thực tế `allLedgerTransactions`.
   - Trong `LeadPaymentModal.tsx`: Không nhận `allLedgerTransactions`, dẫn đến `previouslyPaidAmount` nhận giá trị 0, thanh tiến độ nhiều đợt bị ẩn, Ô 2 đề xuất toàn bộ học phí thay vì số dư nợ còn lại, và VietQR sinh sai số tiền.

3. **Khuyết điểm đồng bộ định danh trên Sổ cái kế toán & Webhook (R3)**:
   - Trong `AdminDashboard.tsx`: Không truyền `crmLeads` vào `<AdminLedgerModule />` ở các tab `finance`, `ledger`, `receivables`, `cashflow`, `misa`.
   - Trong `AdminLedgerModule.tsx`: `allCrmRecords` chỉ lắng nghe Firestore `crm_records` (bị trống lúc ban đầu và thiếu các bản ghi từ `customer_profiles` và `localStorage`).
   - Trong `parseLedgerSmartInfo`: Dòng 167 gán cứng `studentDisplay = 'Học viên E-learning'` khi có mã LEA; không có cơ chế bắc cầu từ CRM lead sang danh sách `allStudents` để lấy họ tên thật và mã `student_code_internal` (`LRN-xxxxxxxx`).
   - Cột Học viên dòng 1365 và tab Student Report dòng 1561 dùng `ensureValidBusinessCode(rawCode, 'LRN')` lên mã `LEA-...` hoặc `COL-...`, dẫn đến việc hoán đổi tiền tố thành mã giả `LRN-64817788`.
   - Trong `server.ts:3025`: Webhook SePay chỉ truy vấn `customer_profiles`, bỏ qua `crm_records` và `users`, khiến giao dịch ghi vào `ledger_transactions` bị gán mặc định tên `'Học viên E-learning'`.

---

## 2. Logic Chain

1. **Chuỗi lập luận R1 (Neo gốc định danh LRN)**:
   - Xây dựng helper `resolveStudentIdentity` tại `CRMAdmissionsModule.tsx`: Tra cứu linh hoạt theo LRN, phone, email, name trong `students`. Luôn trả về `lrnCode = ensureValidBusinessCode(st.student_code_internal || st.studentCode || st.uid, 'LRN')`.
   - Chuẩn hóa `studentOptions` gán `value: lrnCode`, `handleSelectStudent` gán `formStudentId = res.lrnCode`.
   - Thêm `useEffect` tự động nhận diện học viên cũ khi người dùng nhập số điện thoại ($\ge 9$ số) hoặc email hợp lệ.
   - Trong `handleOpenEditForm` và `handleSaveForm`: Tự động tra cứu và khôi phục mã LRN chuẩn lưu vào `studentId`.
   - Trong `onPaymentRecorded`: Gán `targetStudentId` bằng `res.lrnCode` hoặc `newStu.student_code_internal`, lưu mã `LRN-xxxxxxxx` vĩnh viễn vào Firestore.
   - Trong `LeadPaymentModal.tsx`: Trích xuất đồng thời `targetLeaCode` và `targetLrnCode`. Header, khung tóm tắt và bản in PT-KATC hiển thị song song: `LEA-64817788 · LRN-62517882 · [COL-xxxxxxxx] · Nguyễn Thị Anh Thi`.

2. **Chuỗi lập luận R2 (Tính toán công nợ thực tế & VietQR)**:
   - Trong `CRMAdmissionsModule.tsx:handleOpenLeadPayment`: Kiểm tra `isEditing = target === editingRecord`. Nếu mở từ bảng danh sách, ưu tiên `rec.tuition`, triệt tiêu hoàn toàn rò rỉ state `formTuition`.
   - Truyền `allLedgerTransactions={allLedgerTransactions}` vào cả 2 instance của `<LeadPaymentModal>`.
   - Trong `LeadPaymentModal.tsx`: Xây dựng hàm `calculateLedgerPaid`: Quét `allLedgerTransactions` khớp theo mã LEA, mã LRN, SĐT hoặc mã COL, kèm bộ lọc chống nhiễm chéo (nếu giao dịch có mã LEA khác thì bỏ qua).
   - `previouslyPaidAmount = Math.max(lead.paidAmount, ledgerPaid)`.
   - Ô 1 kế thừa `lead.tuition` (ví dụ 6.000đ).
   - Ô 2 tự động đề xuất số nợ còn lại: `Math.max(0, leadTuition - previouslyPaidAmount)` (ví dụ 3.000đ khi đã thanh toán 3.000đ).
   - Ô 3 cập nhật số dư nợ theo thời gian thực: `Math.max(0, currentRemainingDebt - numericAmount)` (hiện 0đ).
   - VietQR tự động sinh theo số tiền của Ô 2 (3.000đ).

3. **Chuỗi lập luận R3 (Đồng bộ Sổ cái & Webhook)**:
   - Trong `AdminDashboard.tsx`: Truyền `crmLeads={crmLeads}` sang `AdminLedgerModule` trên tất cả các tab.
   - Trong `AdminLedgerModule.tsx`: Khởi tạo `allCrmRecords` ngay từ props `crmLeads` và `localStorage` (`katc_custom_crm_records` & `katc_crm_overrides`), kết hợp lắng nghe snapshot.
   - Trong `parseLedgerSmartInfo`: Multi-hop resolution:
     - Hop 1: Khớp bút toán với hồ sơ CRM theo mã LEA hoặc SĐT.
     - Hop 2: Bắc cầu từ hồ sơ CRM sang `allStudents` theo `studentId`, phone, email hoặc tên để lấy họ tên chuẩn và `student_code_internal` (`LRN-xxxxxxxx`).
     - Hop 3: Tra cứu trực tiếp từ `allStudents` nếu chưa có mã LRN.
     - Hop 4: Triệt tiêu vĩnh viễn chuỗi `'Học viên E-learning'` và `'---'`.
     - Hop 5: Chặn biến đổi mã giả: Nếu mã bắt đầu bằng `LEA` hoặc `COL`, không bao giờ biến thành `LRN`.
     - Hop 6: Cắt gọt chuỗi diễn giải `[LỆNH THU]` và `[SePay-COL]` thành 1 dòng tinh gọn theo AGENTS.md.
   - Trong `server.ts`: Webhook SePay tra cứu cả `customer_profiles` và `crm_records`, bắc cầu sang `users` để ghi nhận họ tên thật và mã `LRN-xxxxxxxx` vào `ledger_transactions`.

---

## 3. Caveats

- **No Caveats**: Toàn bộ luồng dữ liệu, định danh học viên, tính toán công nợ và sổ cái kế toán đã được liên kết chặt chẽ và nhất quán.
- Đối với các bút toán lịch sử trước đây đã lỡ ghi chuỗi `'Học viên E-learning'`, hàm `parseLedgerSmartInfo` tự động phát hiện và ghi đè hiển thị bằng họ tên thật và mã LRN thật của học viên ngay tại thời điểm render.

---

## 4. Conclusion

Milestone M1 đã hoàn thành xuất sắc 100% các yêu cầu:
1. **R1**: Neo giữ định danh LRN chuẩn trong tuyển sinh và hiển thị song song `LEA-xxxxxxxx · LRN-xxxxxxxx` trên Header của `LeadPaymentModal`.
2. **R2**: Kế thừa học phí dự kiến, tính toán bù trừ công nợ thực tế từ `allLedgerTransactions`, đề xuất đúng số tiền còn nợ tại Ô 2 và đồng bộ mã VietQR.
3. **R3**: Đồng bộ hiển thị đối tượng học viên và mã LRN thật trên Sổ cái kế toán, triệt tiêu mã giả và nhãn placeholder chung chung, rút gọn diễn giải giao dịch chuẩn AGENTS.md.

---

## 5. Verification Method

### 5.1. Lệnh kiểm tra tự động

1. **Chạy bộ kiểm thử tự động (Unit Tests)**:
   ```powershell
   npm test
   ```
   **Kết quả**: 22/22 tests passed (trong đó có 3 tests mới chuyên biệt trong `tests/admissionsDebtSync.test.ts` kiểm tra trọn vẹn R1, R2, R3).

2. **Chạy biên dịch Production Build**:
   ```powershell
   npm run build
   ```
   **Kết quả**: Exit code 0, hoàn tất sau 9.16s, không có lỗi cú pháp hay TypeScript.

### 5.2. Các tệp đã chỉnh sửa cần thẩm định
- `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- `De_Vuong_Webapp/src/components/admin/LeadPaymentModal.tsx`
- `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
- `De_Vuong_Webapp/src/components/AdminDashboard.tsx`
- `De_Vuong_Webapp/server.ts`
- `De_Vuong_Webapp/package.json`
- `De_Vuong_Webapp/tests/admissionsDebtSync.test.ts`

### 5.3. Điều kiện hủy bỏ (Invalidation Conditions)
- Nếu mở Modal Thu tiền cho hồ sơ có học phí 6.000đ và đã thu 3.000đ mà Ô 2 đề xuất 6.000đ thay vì 3.000đ.
- Nếu Header của Modal Thu tiền không hiển thị mã `LRN` song song với mã `LEA`.
- Nếu trên Sổ cái xuất hiện chuỗi `Học viên E-learning` hoặc mã giả `LRN-64817788`.
