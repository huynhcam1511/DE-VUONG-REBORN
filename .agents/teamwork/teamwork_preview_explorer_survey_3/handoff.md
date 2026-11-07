# Báo cáo Điều tra Chuyên sâu: Vòng đời Thương mại (Commercial Lifecycle), Phiếu thu (COL) & Đối soát Sổ cái Đa module

- **Tác vụ**: Điều tra Explorer 3 (Commercial Lifecycle & Collection Orders)
- **Mã hồ sơ khảo sát**: `teamwork_preview_explorer_survey_3`
- **Mục tiêu**: Làm rõ cơ chế vận hành Phiếu thu (`COL-`), thanh tiến trình `CommercialLifecycleBar`, luồng nhận dạng SePay Webhook, cơ chế cộng dồn nhiều lần thanh toán (`paidAmount` e.g. 3.000đ + 2.000đ = 5.000đ) và các bất cập định danh `LEA`/`LRN`/`COL`.

---

## 1. Observation (Quan sát trực tiếp)

### 1.1. Vị trí & Vai trò của các Component Phiếu thu & Vòng đời Thương mại
Codebase phân bổ các thành phần nghiệp vụ liên quan tại các vị trí sau:

1. **`CommercialLifecycleBar.tsx`** (`src/components/admin/CommercialLifecycleBar.tsx`):
   - Quản lý thanh tiến trình thương mại tuyến tính chuẩn ERP (5 bước: Nhu cầu Tuyển sinh `LEA` $\to$ Báo giá `QUO` $\to$ Hợp đồng `CTR` $\to$ Thu tiền & Dòng tiền `COL`/`FIN` $\to$ Lớp học `CLS`).
   - Có 2 chế độ hiển thị:
     - **B2C (3 cột Canvas)** (dòng 352-665): `1. Nhu cầu & Ca học` $\to$ `2. Thu tiền học phí (COL)` $\to$ `3. Lớp học & LMS`.
     - **B2B (5 thẻ Grid chuẩn ERP)** (dòng 668-1005): Khảo sát TNA $\to$ Báo giá $\to$ Hợp đồng $\to$ Thu tiền học phí $\to$ Lớp học.
   - Thẻ Thu tiền học phí (dòng 426-470 cho B2C, dòng 903-945 cho B2B) đã có sẵn logic rẽ nhánh UI theo `actualPaid` vs `targetAmount`:
     ```tsx
     const actualPaid = activeCollectionOrder.paidAmount !== undefined 
       ? activeCollectionOrder.paidAmount 
       : (paidAmount || 0);
     const targetAmount = effectiveTuition > 0 ? effectiveTuition : activeCollectionOrder.amount;
     const remainingDebt = Math.max(0, targetAmount - actualPaid);

     // TH1: Đã đóng đủ 100% -> Hiện "Đã nộp đủ 100%"
     if (actualPaid >= targetAmount && targetAmount > 0) { ... }

     // TH2: Đã đóng 1 phần (cọc) -> Hiện "Đã thu Xđ / Yđ · Còn nợ: Zđ"
     if (actualPaid > 0 && remainingDebt > 0) { ... }

     // TH3: Chưa đóng -> Hiện "Chờ đóng phí (VietQR)"
     ```
   - Nơi sử dụng:
     - `src/components/admin/CRMAdmissionsModule.tsx` (dòng 4124)
     - `src/components/admin/DealsPipelineModule.tsx` (dòng 725)
     - `src/components/admin/DocumentManagementModule.tsx` (dòng 1222)
     - `src/components/admin/QuotationBuilderModule.tsx` (dòng 2308)

2. **`LeadPaymentModal.tsx`** (`src/components/admin/LeadPaymentModal.tsx`):
   - Quản lý Modal tạo mã VietQR Napas 247 và In Phiếu thu (mẫu `PT-KATC`).
   - Cú pháp nội dung chuyển khoản mặc định (dòng 85-87):
     ```ts
     const defaultMemo = isStudent
       ? `${targetCode.replace('-', '')} HOC PHI ${clientName.toUpperCase()}`
       : `HOCPHI ${targetCode.replace('-', '')}`;
     ```
     $\to$ Chú ý: Cú pháp gửi khách chứa mã hồ sơ `HOCPHI LEAXXXXXXXX`, **không** chứa mã `COL-XXXXXXXX`.
   - Khi bấm sao chép tin nhắn Zalo gửi khách (dòng 216-222), hệ thống gọi `saveCollectionOrderRecord()` (dòng 157-180), ghi một bản ghi vào Firestore `ledger_transactions` với:
     ```ts
     type: 'expected_revenue',
     refCode: colCode, // COL-XXXXXXXX
     amount: numericAmount,
     credit: numericAmount,
     studentId: targetId,
     description: `[LỆNH THU] ${clientName} - ${targetCode} (${currentMemo})...`
     ```

3. **`SepayReconciliationModule.tsx`** (`src/components/admin/SepayReconciliationModule.tsx`) & **`AdminDashboard.tsx`** (`src/components/AdminDashboard.tsx`):
   - Quản lý tab Lệnh thu / Phiếu thu (`collectionOrders`):
     ```ts
     // SepayReconciliationModule.tsx: dòng 286-290
     const collectionOrders = useMemo(() => {
       return transactions.filter(
         (t) => t.type === 'expected_revenue' && t.refCode?.startsWith('COL')
       );
     }, [transactions]);
     ```
   - Hàm tính số tiền đã thu SePay cho một lệnh thu (dòng 293-306):
     ```ts
     const getCollectedAmountForOrder = useCallback(
       (tx: Transaction) => {
         return sepayTransactions
           .filter((stx) => {
             const content = `${stx.originalContent || ''} ${stx.transaction_content || ''} ${stx.description || ''}`;
             return Boolean(
               (tx.paymentIntentId && stx.paymentIntentId === tx.paymentIntentId) ||
               (tx.refCode && content.includes(tx.refCode))
             );
           })
           .reduce((acc, stx) => acc + (stx.credit || 0), 0);
       },
       [sepayTransactions]
     );
     ```

---

### 1.2. Quan sát cơ chế SePay Webhook xử lý đơn hàng `LEA[...]` trong `server.ts`
Trong `server.ts` (dòng 3012-3135):
```ts
3013: const leaMatch = content.match(/\bLEA[-]?([0-9]{6,10})\b/i);
3014: if (amount_in > 0 && leaMatch) {
3015:   const fullLeaCode = `LEA-${leaMatch[1]}`;
3016:   const cleanLeaDigits = leaMatch[1];
...
3025:   const profilesSnap = await db.collection('customer_profiles')
3026:     .where('code', 'in', [fullLeaCode, `LEA${cleanLeaDigits}`])
3027:     .limit(1)
3028:     .get();
...
3043:   const colRandomDigits = Math.floor(10000000 + Math.random() * 90000000);
3044:   const colCode = `COL-${colRandomDigits}`;
3045:   const payerName = profileData?.fullName || profileData?.partnerName || profileData?.name || 'Học viên E-learning';
...
3066:   tx.create(db.collection('ledger_transactions').doc(`COL-${bankEventId}`), {
3067:     id: colCode,
3068:     refCode: colCode,
3069:     date,
3070:     sepayId,
3071:     bankRef,
3072:     studentId: fullLeaCode,
3073:     studentName: payerName,
3074:     phoneNumber: payerPhone,
3075:     description: `[SePay-COL] Thu học phí đơn ${fullLeaCode} - ${payerName}`,
3076:     credit: amount_in,
3077:     debit: 0,
3078:     amount: amount_in,
3079:     surplus: 0,
3080:     type: 'tuition_fee',
3081:     activeStatus: 'active',
3082:     paymentMethod: 'sepay_vietqr',
3083:     originalContent: content,
3084:     autoClassified: true,
3085:     needsReview: false,
3086:     createdAt: admin.firestore.FieldValue.serverTimestamp(),
3087:   });
...
3094:     paidAmount: amount_in,
...
3105:   tx.set(crmRecordRef, {
3106:     paymentStatus: 'completed',
3107:     status: 'enrolled',
3108:     paidAmount: amount_in,
3109:     receiptCode: colCode,
3110:   }, { merge: true });
```
**Các điểm bất thường quan sát được trong `server.ts`**:
1. Dòng 3094 và 3107: `paidAmount` được gán trực tiếp bằng `amount_in` (`paidAmount: amount_in`), thay vì cộng dồn với số tiền đã đóng trước đó (`currentPaid + amount_in`).
2. Dòng 3105: `paymentStatus: 'completed'` và `status: 'enrolled'` được gán cứng ngay lập tức khi có bất kỳ `amount_in > 0` nào, bất kể số tiền này mới chỉ là tiền cọc (ví dụ cọc 3.000đ trên tổng học phí 5.000đ).
3. Dòng 3044: Mỗi lần webhook nhận được tiền, hệ thống lại tự động sinh một mã ngẫu nhiên mới `colCode = COL-${colRandomDigits}`, ghi đè trường `receiptCode` trong `crm_records` và `customer_profiles`, làm mất tính liên kết với lệnh thu gốc.
4. Dòng 3025-3040: Chỉ tìm kiếm trong collection `customer_profiles`. Nếu hồ sơ được lưu trong `crm_records` (nơi CRM Tuyển sinh lưu trữ), `profileData` trả về `null` $\to$ Dòng 3045 lập tức fallback tên người nộp thành `'Học viên E-learning'`.
5. Dòng 3066: Bản ghi `ledger_transactions` được tạo với `doc('COL-${bankEventId}')`, `refCode: colCode` và `type: 'tuition_fee'`, nhưng **không có trường `bankEventId: bankEventId`** trong object dữ liệu.

---

### 1.3. Quan sát cơ chế tính `activeCollectionOrder` trong `CRMAdmissionsModule.tsx`
Trong `CRMAdmissionsModule.tsx` (dòng 1445-1549):
```ts
1457: const matched = allLedgerTransactions.filter(tx => {
1458:   if (!tx.refCode?.startsWith('COL')) return false;
...
1472: });
...
1507: matched.sort((a, b) => new Date(b.date || (b as any).createdAt || 0).getTime() - new Date(a.date || (a as any).createdAt || 0).getTime());
1508: const latest = matched[0];
...
1515: const collectedAmount = allLedgerTransactions
1516:   .filter((stx) => {
1517:     if (stx.type === 'expected_revenue' || stx.refCode?.startsWith('COL')) return false;
1518:     if ((stx.credit || 0) <= 0) return false;
1519:     const content = `${(stx as any).originalContent || ''} ${(stx as any).transaction_content || ''} ${stx.description || ''} ${stx.refCode || ''} ${(stx as any).studentId || ''}`.toUpperCase();
1520:     const matchesPaymentIntent = Boolean((latest as any).paymentIntentId && (stx as any).paymentIntentId === (latest as any).paymentIntentId);
1521:     const matchesColRef = Boolean(latest.refCode && content.includes(latest.refCode.toUpperCase()));
1522:     const matchesLea = Boolean(targetLeaDigits.length >= 6 && (content.includes(targetLeaUpper) || content.includes('LEA' + targetLeaDigits) || content.includes('LEA-' + targetLeaDigits)));
1523:     return matchesPaymentIntent || matchesColRef || matchesLea;
1524:   })
1525:   .reduce((acc, stx) => acc + (stx.credit || 0), 0);
...
1530: const directCollected = (latest.type !== 'expected_revenue' && (latest.credit || 0) > 0)
1531:   ? (latest.credit || 0)
1532:   : 0;
...
1534: const finalCollectedAmount = Math.max(
1535:   collectedAmount,
1536:   directCollected,
1537:   Number(editingRecord.paidAmount || 0)
1538: );
```
**Các điểm bất thường quan sát được trong `CRMAdmissionsModule.tsx`**:
1. Dòng 1517: `if (stx.type === 'expected_revenue' || stx.refCode?.startsWith('COL')) return false;`
   - Điều kiện `stx.refCode?.startsWith('COL')` loại bỏ toàn bộ các giao dịch thực thu được tạo bởi `server.ts` (vì `server.ts` dòng 3068 gán `refCode: colCode` bắt đầu bằng `'COL'`).
   - Do đó, `collectedAmount` tính ra bằng 0!
2. Dòng 1530: `directCollected` chỉ lấy duy nhất `latest.credit` (bản ghi mới nhất). Nếu khách đóng 2 lần (lần 1: 3.000đ, lần 2: 2.000đ):
   - `latest` là giao dịch lần 2 $\to$ `directCollected = 2000`.
   - `collectedAmount` = 0 (bị dòng 1517 chặn).
   - `editingRecord.paidAmount` = 2000 (bị `server.ts` dòng 3108 ghi đè số tiền lần 2).
   - `Math.max(0, 2000, 2000) = 2000`. Số tiền 3.000đ đóng ở lần 1 hoàn toàn bị biến mất!

---

### 1.4. Quan sát cơ chế sinh mã LRN giả và tên học viên trong `AdminLedgerModule.tsx`
Trong `AdminLedgerModule.tsx`:
1. Dòng 117-133:
   ```ts
   if (!studentDisplay || studentDisplay === '---' || studentDisplay === 'N/A' || studentDisplay === '-' || studentDisplay === 'Ẩn danh' || studentDisplay.trim() === '') {
     if (allCrmRecords && allCrmRecords.length > 0) {
       const matchedCrm = allCrmRecords.find((r: any) => { ... });
       if (matchedCrm) {
         studentDisplay = matchedCrm.name || matchedCrm.fullName;
         ...
       }
     }
   }
   ```
   - Khi `tx.studentName` đã có giá trị `'Học viên E-learning'` (do `server.ts` ghi), biến `studentDisplay` không rỗng và không nằm trong danh sách `'---' | 'N/A' | '-'` $\to$ Khối `if` bị bỏ qua hoàn toàn, không bao giờ tra cứu tên thật trong `allCrmRecords`.
2. Dòng 1347-1351:
   ```tsx
   {(smart.lrnCode || tx.internalId || tx.studentId) && (
     <span className="font-mono text-[11px] text-slate-400">
       {ensureValidBusinessCode(smart.lrnCode || tx.internalId || tx.studentId || '', 'LRN')}
     </span>
   )}
   ```
   - Khi `smart.lrnCode` là `null`, nó rơi vào `tx.studentId` (`'LEA-91690914'`).
   - Hàm `ensureValidBusinessCode(..., 'LRN')` trong `codeGenerator.ts` dòng 104-112:
     ```ts
     const prefixMatch = strVal.match(/^([A-Z]{3})-(\d{8})$/i);
     if (prefixMatch) {
       const existingPrefix = prefixMatch[1].toUpperCase();
       const digits = prefixMatch[2];
       if (existingPrefix === prefix) return strVal.toUpperCase();
       return `${prefix}-${digits}`; // <--- Biến LEA-91690914 thành LRN-91690914!
     }
     ```
     $\to$ Đây chính là nguồn gốc phát sinh mã học viên giả `LRN-91690914` từ số đuôi của mã `LEA`.
3. Dòng 1370-1377 (Cột Diễn giải):
   ```tsx
   <div className="flex flex-col">
     <span className="text-[12px] font-medium text-slate-800 line-clamp-1" title={smart.cleanDesc}>{smart.cleanDesc}</span>
     {tx.originalContent && tx.originalContent !== smart.cleanDesc && (
       <span className="text-[10px] font-mono text-slate-400 truncate max-w-[320px] mt-0.5" title={tx.originalContent}>
         {tx.originalContent}
       </span>
     )}
   </div>
   ```
   - Hiển thị dòng thứ 2 trực tiếp trên bảng bằng `tx.originalContent`, làm phình to chiều cao dòng và vi phạm quy chuẩn 1 dòng đều tăm tắp của `AGENTS.md`.

---

## 2. Logic Chain (Chuỗi suy luận logic từ quan sát tới nguyên nhân gốc rễ)

```
[Khách chuyển khoản đợt 1: 3.000đ]
  │
  ▼
SePay Webhook gửi về server.ts
  ├─> Tìm trong customer_profiles (không tìm crm_records) ──> Không có tên ──> Gán 'Học viên E-learning' (Obs 1.2)
  ├─> Sinh ngẫu nhiên COL-11111111 (Obs 1.2)
  ├─> Tạo ledger_transactions doc COL-... với refCode: COL-11111111, credit: 3000, studentId: LEA-91690914
  └─> Ghi vào crm_records: paidAmount = 3000, paymentStatus = 'completed' (dù chưa đủ 100%) (Obs 1.2)
  │
  ▼
[Khách chuyển khoản đợt 2: 2.000đ]
  │
  ▼
SePay Webhook gửi về server.ts
  ├─> Sinh ngẫu nhiên COL-22222222 (Obs 1.2)
  ├─> Tạo ledger_transactions doc COL-... với refCode: COL-22222222, credit: 2000
  └─> Ghi vào crm_records: GHI ĐÈ paidAmount = 2000! (Mất 3.000đ đợt 1) (Obs 1.2)
  │
  ▼
[Giao diện CRMAdmissionsModule mở Lead]
  │
  ├─> activeCollectionOrder tính toán:
  │     ├─> collectedAmount: Loại bỏ stx.refCode?.startsWith('COL') ──> = 0 (Obs 1.3)
  │     ├─> directCollected: Chỉ lấy latest.credit ──> = 2000 (Obs 1.3)
  │     ├─> editingRecord.paidAmount ──> = 2000 (do bị ghi đè)
  │     └─> finalCollectedAmount = Math.max(0, 2000, 2000) = 2000 (Obs 1.3)
  │
  ▼
[Giao diện CommercialLifecycleBar hiển thị]
  │
  ├─> actualPaid = 2.000đ, targetAmount = 5.000đ
  ├─> remainingDebt = 3.000đ
  └─> Rơi vào TH2: "Đã thu 2.000đ / 5.000đ · Còn nợ: 3.000đ" (Obs 1.1)
        ==> 100% SAI LỆCH! Đáng lẽ phải là 5.000đ / 5.000đ, nợ 0đ, "Đã nộp đủ 100%".

[Giao diện AdminLedgerModule hiển thị]
  │
  ├─> tx.studentName = 'Học viên E-learning' ──> Không rỗng ──> Không tra cứu crm_records ──> Giữ nguyên 'Học viên E-learning' (Obs 1.4)
  ├─> smart.lrnCode = null ──> Fallback tx.studentId ('LEA-91690914') ──> ensureValidBusinessCode(..., 'LRN') ──> Sinh mã giả LRN-91690914 (Obs 1.4)
  └─> Diễn giải render 2 dòng: text chính + originalContent ──> Phình to dòng bảng (Obs 1.4)
```

---

## 3. Caveats (Các khu vực chưa khảo sát, giả định & giải pháp thay thế)

1. **Dữ liệu lịch sử đã lưu**: Có các bản ghi cũ trong Firestore `ledger_transactions` đã bị lưu sẵn `studentName: 'Học viên E-learning'` và `refCode: 'COL-XXXXXXXX'`. Do đó, logic hiển thị trên UI (`parseLedgerSmartInfo` và `activeCollectionOrder`) **bắt buộc** phải có cơ chế đối soát động (dynamic reconciliation) dựa trên mã `LEA` để sửa sai ngay trên giao diện mà không phụ thuộc vào việc chạy script sửa DB.
2. **Kịch bản B2B Doanh nghiệp**: Đối với Doanh nghiệp B2B thanh toán qua Hợp đồng/Báo giá có mã `CTR-XXXXXXXX` hoặc `QUO-XXXXXXXX`, cơ chế cộng dồn trong `CommercialLifecycleBar` cần áp dụng tương tự theo `dealCode` / `contractCode` / `quoteCode`.
3. **Không phá vỡ payment intents của học viên cũ**: Các học viên đóng qua mã chuyển khoản `HP[A-Z0-9]+` (payment intent trong `server.ts` dòng 2920) vẫn hoạt động độc lập và ổn định, không bị ảnh hưởng bởi luồng `LEA[...]`.

---

## 4. Conclusion & Proposed Architecture (Kết luận & Đề xuất giải pháp kiến trúc)

### 4.1. Giải pháp cho `server.ts` (Webhook SePay & Lưu trữ vĩnh viễn)
1. **Tìm kiếm hồ sơ đa nguồn**: Kiểm tra cả `crm_records` lẫn `customer_profiles` khi nhận webhook `LEA`:
   ```ts
   let crmSnap = await db.collection('crm_records').doc(fullLeaCode).get();
   if (!crmSnap.exists) {
     const qSnap = await db.collection('crm_records').where('code', 'in', [fullLeaCode, `LEA${cleanLeaDigits}`]).limit(1).get();
     if (!qSnap.empty) crmSnap = qSnap.docs[0];
   }
   // Lấy profileData từ crmSnap hoặc customer_profiles
   const profileData = crmSnap.exists ? crmSnap.data() : (profilesSnap.empty ? null : profilesSnap.docs[0].data());
   const payerName = profileData?.name || profileData?.fullName || profileData?.partnerName || 'Học viên E-learning';
   const payerPhone = profileData?.phone || profileData?.contact || '';
   const tuition = Number(profileData?.tuition || 0);
   ```
2. **Cộng dồn `paidAmount` chính xác**:
   ```ts
   const currentPaid = Number(profileData?.paidAmount || 0);
   const newPaid = currentPaid + amount_in;
   const isFullyPaid = tuition > 0 ? (newPaid >= tuition) : true;
   const paymentStatus = isFullyPaid ? 'completed' : 'partial';
   const orderStatus = isFullyPaid ? 'paid' : 'partial';
   ```
3. **Bổ sung trường nhận diện vào `ledger_transactions`**:
   - Thêm `bankEventId: bankEventId`.
   - Thêm `orderCode: fullLeaCode`.
   - Giữ mã `refCode: profileData?.receiptCode || colCode`.

---

### 4.2. Giải pháp cho `CRMAdmissionsModule.tsx` (`activeCollectionOrder` & `CommercialLifecycleBar`)
1. **Sửa logic tính `collectedAmount` trong `activeCollectionOrder`**:
   Bỏ điều kiện loại trừ `stx.refCode?.startsWith('COL')`. Chỉ loại trừ `stx.type === 'expected_revenue'`:
   ```ts
   const targetLeaUpper = targetCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
   const targetLeaDigits = targetLeaUpper.replace(/^LEA/, '');

   // Gom TẤT CẢ các bút toán thực thu (credit > 0) khớp với hồ sơ LEA này
   const matchingPayments = allLedgerTransactions.filter((stx) => {
     if (stx.type === 'expected_revenue') return false;
     if ((stx.credit || 0) <= 0) return false;
     const content = `${(stx as any).originalContent || ''} ${(stx as any).transaction_content || ''} ${stx.description || ''} ${stx.refCode || ''} ${(stx as any).studentId || ''}`.toUpperCase();
     
     const matchesPaymentIntent = Boolean((latest as any)?.paymentIntentId && (stx as any).paymentIntentId === (latest as any).paymentIntentId);
     const matchesColRef = Boolean(latest?.refCode && content.includes(latest.refCode.toUpperCase()));
     const matchesLea = Boolean(targetLeaDigits.length >= 6 && (content.includes(targetLeaUpper) || content.includes('LEA' + targetLeaDigits) || content.includes('LEA-' + targetLeaDigits) || String(stx.studentId).includes(targetLeaDigits)));

     return matchesPaymentIntent || matchesColRef || matchesLea;
   });

   const totalCollected = matchingPayments.reduce((acc, stx) => acc + (stx.credit || 0), 0);
   const finalCollectedAmount = Math.max(totalCollected, Number(editingRecord.paidAmount || 0));
   ```
2. Trả về `activeCollectionOrder`:
   ```ts
   return {
     id: latest?.id || `COL-${targetLeaDigits}`,
     refCode: latest?.refCode || editingRecord.receiptCode || `COL-${targetLeaDigits}`,
     amount: effectiveTuition > 0 ? effectiveTuition : (latest?.amount || totalCollected),
     paidAmount: finalCollectedAmount,
     date: latest?.date,
     status: finalCollectedAmount >= effectiveTuition && effectiveTuition > 0 ? 'completed' : 'partial',
     description: latest?.description,
   };
   ```
   $\to$ Khi đó `CommercialLifecycleBar` nhận được `actualPaid = 5.000đ`, `targetAmount = 5.000đ` $\to$ Chuyển trạng thái **"5.000đ • Đã nộp đủ 100%"**, còn nợ 0đ.

---

### 4.3. Giải pháp cho `SepayReconciliationModule.tsx` & `AdminDashboard.tsx`
Cập nhật hàm `getCollectedAmountForOrder` để nhận diện các giao dịch SePay có nội dung chứa mã `LEA`:
```ts
const getCollectedAmountForOrder = useCallback(
  (tx: Transaction) => {
    // Trích xuất mã LEA từ studentId hoặc description của lệnh thu
    const rawOrder = `${tx.studentId || ''} ${tx.description || ''} ${tx.refCode || ''}`.toUpperCase();
    const leaMatch = rawOrder.match(/\bLEA[-]?([0-9]{6,10})\b/i);
    const leaDigits = leaMatch ? leaMatch[1] : null;

    return sepayTransactions
      .filter((stx) => {
        const content = `${stx.originalContent || ''} ${stx.transaction_content || ''} ${stx.description || ''} ${stx.studentId || ''}`.toUpperCase();
        const matchesPaymentIntent = Boolean(tx.paymentIntentId && stx.paymentIntentId === tx.paymentIntentId);
        const matchesColRef = Boolean(tx.refCode && content.includes(tx.refCode.toUpperCase()));
        const matchesLea = Boolean(leaDigits && (content.includes(`LEA${leaDigits}`) || content.includes(`LEA-${leaDigits}`)));
        return matchesPaymentIntent || matchesColRef || matchesLea;
      })
      .reduce((acc, stx) => acc + (stx.credit || 0), 0);
  },
  [sepayTransactions]
);
```

---

### 4.4. Giải pháp cho `AdminLedgerModule.tsx` (R1 & R2)
1. **Đồng nhất Họ tên học viên từ CRM (R1)**:
   Trong `parseLedgerSmartInfo`:
   - Nếu `studentDisplay === 'Học viên E-learning'` hoặc rỗng, và có `normalizedLeaCode`:
     - Tra cứu `matchedCrm` trong `allCrmRecords`.
     - Nếu có `matchedCrm.name || matchedCrm.fullName`: gán lại `studentDisplay = matchedCrm.name || matchedCrm.fullName` (`Nguyễn Thị Anh Thi`).
     - Tìm kiếm trong `allStudents` dựa trên `matchedCrm.studentId`:
       ```ts
       if (matchedCrm.studentId && allStudents) {
         const st = allStudents.find(s => s.uid === matchedCrm.studentId || s.student_code_internal === matchedCrm.studentId || s.studentCode === matchedCrm.studentId);
         if (st) matchedStudentCode = st.student_code_internal || st.studentCode || null;
       }
       if (!matchedStudentCode && matchedCrm.studentCode) {
         matchedStudentCode = matchedCrm.studentCode;
       }
       ```
     - Nếu không tìm thấy học viên trong LMS: giữ `matchedStudentCode = null`, **tuyệt đối không dùng `ensureValidBusinessCode` băm từ `LEA`**.
2. **Triệt tiêu sinh mã giả `LRN-91690914`**:
   Ở dòng 1347-1351 của `AdminLedgerModule.tsx`:
   ```tsx
   {smart.lrnCode && (
     <span className="font-mono text-[11px] text-slate-400">
       {smart.lrnCode}
     </span>
   )}
   ```
   Chỉ hiển thị khi `smart.lrnCode` thực sự tồn tại. Bỏ hoàn toàn fallback `tx.studentId` (vì `tx.studentId` chứa mã `LEA-91690914`).
3. **Cắt gọt Diễn giải & Ẩn nội dung gốc vào tooltip (R2)**:
   Ở dòng 1370-1377 của `AdminLedgerModule.tsx`:
   - Chỉ render duy nhất 1 thẻ `<span>` với class `text-[12px] font-medium text-slate-800 line-clamp-1 truncate`.
   - Di chuyển `tx.originalContent` vào thuộc tính `title`:
     ```tsx
     <td className="px-4 py-3.5 text-xs text-slate-600">
       <span 
         className="text-[12px] font-medium text-slate-800 line-clamp-1 truncate max-w-[360px]" 
         title={`${smart.cleanDesc}${tx.originalContent ? `\n[Nội dung gốc SePay]: ${tx.originalContent}` : ''}`}
       >
         {smart.cleanDesc}
       </span>
     </td>
     ```
   - Loại bỏ hoàn toàn thẻ `<span>` thứ hai để chiều cao dòng bảng luôn đều tăm tắp theo `AGENTS.md`.

---

## 5. Verification Method (Phương pháp xác minh độc lập)

1. **Kiểm tra cú pháp & Typecheck**:
   ```powershell
   npm run lint
   ```
2. **Kiểm tra Unit Test xử lý thanh toán**:
   ```powershell
   node --import tsx --test tests/paymentCore.test.ts
   ```
3. **Xác minh trực quan trên Giao diện (Manual / UI Spot-check)**:
   - **Sổ cái (`tab=finance`)**:
     - Cột `Đối tượng / Học viên`: Dòng giao dịch chuyển khoản `HOCPHI LEA91690914` phải hiển thị đúng tên `Nguyễn Thị Anh Thi`, mã học viên `LRN-20510493` (hoặc để trống nếu chưa xếp lớp), tuyệt đối không xuất hiện `LRN-91690914`.
     - Cột `Diễn giải`: Hiển thị gọn gàng trên 1 dòng duy nhất, hover chuột vào thấy tooltip chứa nội dung gốc SePay, không còn lặp lại mã LEA hay tên học viên.
   - **CRM Tuyển sinh (`tab=leads`)**:
     - Mở chi tiết hồ sơ `LEA-91690914` có 2 giao dịch chuyển khoản (3.000đ + 2.000đ):
     - Thanh `CommercialLifecycleBar` tại Bước 2 (Thu tiền học phí) phải hiển thị: `5.000đ • Đã nộp đủ 100%`, huy hiệu `✓ Đã thu tiền`, còn nợ `0đ`.
   - **Đối soát SePay (`tab=sepay`)**:
     - Bảng `Lệnh thu / Phiếu thu`: Lệnh thu tương ứng với hồ sơ trên hiển thị Cần thu `5.000 đ`, Đã thu SePay `5.000 đ`, Tình trạng `• Đã nộp đủ`.
