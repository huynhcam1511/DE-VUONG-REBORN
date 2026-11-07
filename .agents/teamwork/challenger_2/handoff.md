# Empirical Challenge Report — Challenger 2 (Milestone M1)

**Dự án**: Student Identity & Multi-Stage Admissions Debt Sync  
**Phân hệ**: Milestone M1 (Identity Resolution & Ledger Display in `AdminLedgerModule.tsx` & `parseLedgerSmartInfo`)  
**Người thực hiện**: Challenger 2 (Empirical Challenger)  
**Thời gian**: 2026-11-02T10:15:30Z  
**Thư mục làm việc**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\challenger_2`  
**Thư mục mã nguồn chuẩn**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`  
**Quyết định thẩm định (Verdict)**: **APPROVE**

---

## 1. Observation

1. **Kiểm tra trực tiếp hàm `parseLedgerSmartInfo` trong `AdminLedgerModule.tsx` (dòng 95–276)**:
   - Trích xuất mã LEA và LRN tại dòng 98–105:
     ```ts
     const candidateLeaStr = `${content} ${tx.studentId || ''} ${tx.refCode || ''}`;
     const leaMatch = candidateLeaStr.match(/\bLEA[\s-]?(\d{6,10})\b/i);
     const normalizedLeaCode = leaMatch ? `LEA-${leaMatch[1]}` : null;
     const lrnMatch = candidateLeaStr.match(/\bLRN[\s-]?(\d{6,10})\b/i);
     const normalizedLrnCode = lrnMatch ? `LRN-${lrnMatch[1]}` : null;
     ```
   - Khớp nối CRM lead tại dòng 128–148 theo `normalizedLeaCode` hoặc SĐT.
   - Cơ chế bắc cầu (Multi-hop) Hop 2a tại dòng 150–176:
     ```ts
     if (crmStudentId && (s.uid === crmStudentId || s.student_code_internal === crmStudentId || (s as any).studentCode === crmStudentId)) return true;
     ```
     Tự động khôi phục `matchedStudentCode = foundFromCrm.student_code_internal` và thay thế tên hiển thị `studentDisplay = resolveStudentName(foundFromCrm.fullName, foundFromCrm.email)`.
   - Triệt tiêu mã giả LRN (Guard against pseudo-LRN) tại dòng 204–206 và dòng 274:
     ```ts
     if (matchedStudentCode && (matchedStudentCode.startsWith('LEA') || matchedStudentCode.startsWith('COL'))) {
       matchedStudentCode = null;
     }
     ```
     Không cho phép mã `LEA` hay `COL` biến thành mã `LRN`.
   - Cắt gọt chuỗi diễn giải SePay tại dòng 250–267:
     ```ts
     if (isSepayFormat) {
       if (normalizedLeaCode) {
         cleanDesc = 'Thu học phí E-learning';
       }
     ...
     ```

2. **Kiểm tra trực tiếp cơ chế Tìm kiếm & Lọc trên Sổ cái trong `AdminLedgerModule.tsx` (dòng 742–762)**:
   ```ts
   const filteredTransactions = useMemo(() => {
     const term = searchTerm.trim().toLowerCase();
     return transactions.filter((tx) => {
       const smart = parseLedgerSmartInfo(tx, students, allCrmRecords);
       const matchSearch = !term ||
         (tx.studentName && tx.studentName.toLowerCase().includes(term)) ||
         (smart.studentDisplay && smart.studentDisplay.toLowerCase().includes(term)) ||
         (tx.refCode && tx.refCode.toLowerCase().includes(term)) ||
         (tx.description && tx.description.toLowerCase().includes(term)) ||
         (tx.originalContent && tx.originalContent.toLowerCase().includes(term)) ||
         (smart.leaCode && smart.leaCode.toLowerCase().includes(term)) ||
         (smart.lrnCode && smart.lrnCode.toLowerCase().includes(term)) ||
         (tx.studentId && String(tx.studentId).toLowerCase().includes(term));
   ```
   Tìm kiếm hỗ trợ đối chiếu đồng thời với cả `smart.studentDisplay`, `smart.lrnCode`, `smart.leaCode`, bất kể trong cơ sở dữ liệu `tx.studentName` có đang lưu chuỗi `'Học viên E-learning'` hay không.

3. **Kiểm tra trực tiếp hiển thị bảng trên giao diện `AdminLedgerModule.tsx` (dòng 1445–1460)**:
   ```tsx
   <span className="text-[13px] font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
     {smart.studentDisplay}
   </span>
   {(() => {
     const rawCode = smart.lrnCode || (tx.internalId && !tx.internalId.startsWith('LEA') && !tx.internalId.startsWith('COL') ? tx.internalId : '') || (tx.studentId && !tx.studentId.startsWith('LEA') && !tx.studentId.startsWith('COL') ? tx.studentId : '');
     if (!rawCode || rawCode.startsWith('LEA') || rawCode.startsWith('COL')) return null;
     return (
       <span className="font-mono text-[11px] text-slate-400">
         {rawCode.startsWith('LRN-') ? rawCode : ensureValidBusinessCode(rawCode, 'LRN')}
       </span>
     );
   })()}
   ```
   Dòng bảng hiển thị chuẩn `smart.studentDisplay` và `smart.lrnCode`, loại bỏ hoàn toàn các mã bắt đầu bằng `LEA` hoặc `COL` khỏi nhãn LRN.

4. **Kiểm tra truyền dữ liệu từ `AdminDashboard.tsx` (dòng 5717, 6189, 6198, 6207, 6216)**:
   `<AdminLedgerModule students={students} crmLeads={crmLeads} ... />` được truyền đầy đủ `crmLeads` trên tất cả các tab `finance`, `ledger`, `receivables`, `cashflow`, `misa`.

5. **Kết quả chạy kiểm thử thực nghiệm chuyên sâu (`node --import tsx --test tests/empiricalChallengerM1.test.ts`)**:
   - `✔ FOCUS 1: Multi-hop resolution with standard CRM record (direct LRN studentId) (1.1515ms)`
   - `✔ FOCUS 1 (Stress): Multi-hop resolution with raw Firestore UID in CRM record (0.4434ms)`
   - `✔ FOCUS 1 (Stress): Multi-hop resolution when CRM record has empty name but links to student (0.1298ms)`
   - `✔ FOCUS 1 (Stress): Description with variations (no hyphens, lowercase, etc.) (0.2865ms)`
   - `✔ FOCUS 1 (Stress): Guard against pseudo-LRN when NO CRM record or student exists (0.1248ms)`
   - `✔ FOCUS 2: Search for "Anh Thi" or "LRN-62517882" finds the transaction (0.5286ms)`
   - `✔ FOCUS 3: Table row rendering displays authentic student identity and suppresses pseudo-LRN (0.1871ms)`
   - **Tổng cộng**: 7/7 passed 100%.

6. **Kết quả chạy toàn bộ kiểm thử hệ thống (`npm test`)**:
   - `22 passed / 0 failed / 0 skipped` (bao gồm các kiểm thử tuyển sinh, đối soát ngân hàng, chấm điểm và thanh toán).

7. **Kết quả biên dịch sản phẩm (`npm run build`)**:
   - Exit code 0, hoàn tất trong 9.33s mà không có bất kỳ lỗi cú pháp hay TypeScript nào.

---

## 2. Logic Chain

1. **Chứng minh Yêu cầu 1: Multi-Hop Resolution trong `parseLedgerSmartInfo`**:
   - Dựa trên quan sát 1 & 5: Cho giao dịch có `description: "[SePay-COL] Thu học phí đơn LEA-64817788"`, `studentId: "LEA-64817788"`, và `studentName: "Học viên E-learning"` trong DB:
     - Regex trích xuất chính xác `normalizedLeaCode = 'LEA-64817788'`.
     - `allCrmRecords` tìm thấy hồ sơ tuyển sinh `LEA-64817788`.
     - Nếu CRM record lưu mã `studentId: 'LRN-62517882'`, `smart.lrnCode` nhận giá trị `'LRN-62517882'`.
     - Nếu CRM record lưu raw Firestore UID `student_1740000001`, Hop 2a tra cứu sang `allStudents` và khôi phục thành công mã `'LRN-62517882'`.
     - `smart.studentDisplay` nhận giá trị `'Nguyễn Thị Anh Thi'`.
     - Chuỗi `'Học viên E-learning'` hoàn toàn không còn xuất hiện trong `studentDisplay` hay giao diện hiển thị.
     - Mã giả `LRN-64817788` hoàn toàn không được sinh ra; khi không tìm thấy học viên, `lrnCode` trả về `null` thay vì ghép số đuôi của LEA.

2. **Chứng minh Yêu cầu 2: Cơ chế Tìm kiếm & Lọc trong `AdminLedgerModule`**:
   - Dựa trên quan sát 2 & 5:
     - Khi người dùng nhập `"Anh Thi"`, `"anh thi"`, hoặc `"ANH THI"`, điều kiện `smart.studentDisplay.toLowerCase().includes(term)` thỏa mãn, tìm thấy đúng bút toán giao dịch.
     - Khi người dùng nhập `"LRN-62517882"` hoặc `"62517882"`, điều kiện `smart.lrnCode.toLowerCase().includes(term)` thỏa mãn, tìm thấy đúng bút toán giao dịch.
     - Khi người dùng nhập `"LEA-64817788"`, điều kiện `smart.leaCode.toLowerCase().includes(term)` thỏa mãn.
     - Khi người dùng nhập tên người khác (ví dụ `"Trần Văn Nam"`), bút toán được lọc bỏ chính xác, không phát sinh kết quả sai.
     - Lọc kết hợp với Năm/Tháng hoạt động đồng bộ và chính xác.

3. **Chứng minh Yêu cầu 3: Giao diện & Hiển thị**:
   - Dựa trên quan sát 1 & 3:
     - Cột Diễn giải rút gọn thành `"Thu học phí E-learning"`, hoàn toàn triệt tiêu việc lặp lại mã `LEA` hay tên học sinh đã nằm ở các cột bên cạnh.
     - Dòng bảng hiển thị họ tên thật `"Nguyễn Thị Anh Thi"` và mã mono `"LRN-62517882"` ngay dưới họ tên.
     - Không có pill rườm rà hay khung viền màu sặc sỡ, tuân thủ đúng AGENTS.md.

---

## 3. Caveats

- **No Caveats**: Tất cả các trường hợp biên (tên CRM bị trống, CRM chỉ lưu raw UID, không có mã LRN chuẩn, các biến thể cú pháp của mã LEA như có dấu cách hoặc viết hoa/thường) đều đã được kiểm tra thực nghiệm và xử lý triệt để.

---

## 4. Conclusion

- **Verdict: APPROVE**
- Toàn bộ các tiêu chí thẩm định của Milestone M1 về Identity Resolution & Ledger Display đều đạt chất lượng cao:
  1. Giao dịch SePay `LEA-64817788` giải quyết chính xác học viên `Nguyễn Thị Anh Thi` và mã `LRN-62517882`.
  2. Chuỗi `Học viên E-learning` và mã giả `LRN-64817788` hoàn toàn bị triệt tiêu.
  3. Tìm kiếm theo `"Anh Thi"` và `"LRN-62517882"` hoạt động hoàn hảo.
  4. Dự án build production và vượt qua 100% các bài kiểm thử tự động.

---

## 5. Verification Method

Để tái hiện độc lập toàn bộ các kết quả trên, chạy các lệnh sau tại thư mục `De_Vuong_Webapp/`:

1. **Chạy bộ kiểm tra thực nghiệm của Challenger**:
   ```powershell
   node --import tsx --test tests/empiricalChallengerM1.test.ts
   ```
   *Kỳ vọng*: 7/7 tests pass.

2. **Chạy toàn bộ unit tests dự án**:
   ```powershell
   npm test
   ```
   *Kỳ vọng*: 22/22 tests pass.

3. **Kiểm tra biên dịch sản phẩm (Production Build)**:
   ```powershell
   npm run build
   ```
   *Kỳ vọng*: Exit code 0, không có lỗi TypeScript hay cú pháp.
