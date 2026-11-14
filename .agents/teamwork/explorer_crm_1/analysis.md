# Phân Tích Kiến Trúc Dữ Liệu & Cơ Chế Lưu Trữ (Data Architecture & Persistence)
## Mở Rộng "Phí Nhận Lớp" & "Phí Chênh Lệch Hàng Tháng" Trong CRM Admissions

- **Dự án**: DE VUONG REBORN / De_Vuong_Webapp
- **Tác giả**: Explorer 1 (`teamwork_explorer`)
- **Ngày khảo sát**: 2026-11-14
- **Đối tượng khảo sát**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`, `De_Vuong_Webapp/src/domain/revenue.ts`, `De_Vuong_Webapp/src/services/revenueService.ts`
- **Mục tiêu**: Thiết kế chuẩn cấu trúc dữ liệu, vòng đời state và cơ chế lưu trữ Firestore vĩnh viễn cho 2 trường tài chính mới theo đúng `ORIGINAL_REQUEST.md` và `AGENTS.md`.

---

## 1. Tổng Quan Kiến Trúc CRM Admissions

Trong ứng dụng `De_Vuong_Webapp`, module Quản lý Tuyển sinh Master CRM (`CRMAdmissionsModule.tsx`) đóng vai trò là trung tâm quản lý toàn bộ vòng đời khách hàng và học viên (cả B2C 1-1 / E-learning lẫn B2B Doanh nghiệp). 

### 1.1. Các Tệp Liên Quan Trực Tiếp
1. **`De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`**:
   - Chứa định nghĩa kiểu dữ liệu chính: `export type CRMRecord` (dòng 656 - 710).
   - Chứa toàn bộ logic state, listeners thời gian thực, merge deduplication, form handling và table rendering.
2. **`De_Vuong_Webapp/src/domain/revenue.ts`**:
   - Chứa `CustomerProfileInput` (dòng 3 - 31), `CustomerProfile` (dòng 62 - 67), `TrainingPackageItem` (dòng 33 - 50).
   - Được `revenueService` và `CRMAdmissionsModule` sử dụng khi đồng bộ hồ sơ khách hàng sang doanh thu / hợp đồng.
3. **`De_Vuong_Webapp/src/services/revenueService.ts`**:
   - Cung cấp `upsertCustomer`, `updateCustomer`, `listCustomers` thao tác với Firestore collection `customer_profiles`.
4. **`De_Vuong_Webapp/src/services/quotationService.ts`**:
   - Cung cấp hàm tiện ích `removeUndefinedFields` (dòng 156 - 169) được `CRMAdmissionsModule.tsx` dùng để làm sạch payload trước khi ghi Firestore.

---

## 2. Kiểm Tra Định Nghĩa Kiểu Dữ Liệu Hiện Tại (`CRMRecord`)

Trong `CRMAdmissionsModule.tsx` (dòng 656 - 710), `CRMRecord` hiện có cấu trúc:

```typescript
export type CRMRecord = {
  id: string | number;
  code?: string;
  reconciliationCode?: string; // Mã đối chiếu chứng từ
  name: string;
  kind: CustomerKind;
  contact?: string;
  phone?: string;
  email?: string;
  source: string;
  need: string;
  roadmap: string;
  department?: string;
  programName?: string;
  courseId?: string;
  courseCode?: string;
  selectedTopics?: string[];
  tuition?: string;            // <-- Học phí dự kiến (đang lưu dạng string)
  classId?: string;
  classCode?: string;
  className?: string;
  status: CRMStatus;
  followUp?: string;
  note: string;
  partnerId?: string;
  partnerName?: string;
  shortName?: string;
  studentId?: string;
  paidAmount?: number | string;
  paymentStatus?: string;
  receiptCode?: string;
  linkedQuotationId?: string;
  linkedQuotationCode?: string;
  dealTitle?: string;
  taxCode?: string;
  representativeName?: string;
  representativeRole?: string;
  pic?: string;
  intermediary?: string;
  intermediaryFeePercent?: number;
  learningFormat?: string;
  trainingLocation?: string;
  startDate?: string;
  expectedStartDate?: string;
  preferredSchedule?: string;
  weeklySchedule?: DayScheduleItem[];
  expectedLearnerCount?: number;
  hasInvoiceDemand?: boolean;
  hasPitTaxSupport?: boolean;
  trainingPackages?: TrainingPackageItem[];
  createdDate?: string;
  createdAtMs?: number;
  createdAt?: any;
  updatedAt?: any;
};
```

### Đánh giá các trường tài chính hiện hữu:
1. `tuition?: string`:
   - Lưu trữ dạng chuỗi (ví dụ: `"5000000"`).
   - Khi tính toán, được chuyển đổi qua regex loại bỏ ký tự không phải số: `Number(String(rec.tuition || '').replace(/\D/g, '')) || 0`.
   - Khi hiển thị trên form, dùng `(parseInt(formTuition.replace(/\D/g, ''), 10) || 0).toLocaleString('vi-VN')`.
2. `paidAmount?: number | string`:
   - Số tiền đã thanh toán, đối soát cùng dữ liệu giao dịch thực thu từ Sổ cái Ledger (`allLedgerTransactions`).
3. `intermediaryFeePercent?: number`:
   - Tỷ lệ % hoa hồng môi giới đối với hợp đồng B2B.

---

## 3. Vòng Đời Dữ Liệu & Luồng Đọc / Ghi Firestore

### 3.1. Nạp Dữ Liệu Khởi Tạo (Mount State - Lines 1315 - 1335)
Khi component mount, `records` được nạp từ LocalStorage để render tức thì tránh giật màn hình:
```typescript
const [records, setRecords] = useState<CRMRecord[]>(() => {
  try {
    const deleted: string[] = JSON.parse(localStorage.getItem('katc_deleted_crm_ids') || '[]');
    const localCustom: CRMRecord[] = JSON.parse(localStorage.getItem('katc_custom_crm_records') || '[]');
    const localOverridesMap: Record<string, CRMRecord> = JSON.parse(localStorage.getItem('katc_crm_overrides') || '{}');
    const overridesList = Object.values(localOverridesMap);
    const combined = [...defaultSeedCRMRecords, ...overridesList, ...localCustom].filter(r => !isRecordDeleted(r, deleted));
    const uniqueMap = new Map<string, CRMRecord>();
    combined.forEach(r => uniqueMap.set(String(r.id), r));
    return Array.from(uniqueMap.values());
  } catch (e) {
    return defaultSeedCRMRecords;
  }
});
```

### 3.2. Lắng Nghe Realtime Firestore (Lines 2893 - 3012)
Hệ thống sử dụng cơ chế lắng nghe song song **2 collections**:
1. `crm_records`: Chứa các bản ghi đăng ký tư vấn tuyển sinh CRM.
2. `customer_profiles`: Chứa hồ sơ khách hàng hợp nhất (Customer Data Platform).

```typescript
unsubCrm = onSnapshot(collection(db, 'crm_records'), (snapshot) => {
  if (!snapshot.empty) {
    latestCrmDocs = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        // ...mapping fields...
      } as CRMRecord;
    });
  }
  syncRecords(latestCrmDocs, latestProfileDocs);
});

unsubProfiles = onSnapshot(collection(db, 'customer_profiles'), (snapshot) => {
  if (!snapshot.empty) {
    latestProfileDocs = snapshot.docs.map((d, idx) => {
      const data = d.data();
      return {
        id: d.id || `crm_profile_${idx}`,
        // ...explicit mapping fields...
      } as CRMRecord;
    });
  }
  syncRecords(latestCrmDocs, latestProfileDocs);
});
```

> **ĐIỂM LƯU Ý QUAN TRỌNG VỀ TÍNH NHẤT QUÁN**:
> Trong listener `customer_profiles` (dòng 2954 - 3005), code mapping **liệt kê tường minh từng thuộc tính** mà KHÔNG dùng spread `...data` ở đầu! 
> Do đó, khi bổ sung trường mới (`classIntakeFee`, `monthlyCommissions`), **bắt buộc** phải bổ sung mapping vào cả `customer_profiles` (dòng 2952) lẫn `crm_records` (dòng 2894). Nếu không, dữ liệu đọc từ `customer_profiles` sẽ bị rơi rụng.

### 3.3. Thuật Toán Gộp Dữ Liệu (`mergeCRMRecord` - Lines 2761 - 2831)
Khi gộp 2 bản ghi có cùng ID hoặc cùng mã LEA:
```typescript
const mergeCRMRecord = (existing: CRMRecord, incoming: CRMRecord): CRMRecord => {
  return {
    ...existing,
    ...incoming,
    // các trường ghi đè tường minh...
  };
};
```
Để an toàn, cần đảm bảo:
```typescript
classIntakeFee: incoming.classIntakeFee !== undefined ? incoming.classIntakeFee : existing.classIntakeFee,
monthlyCommissions: (incoming.monthlyCommissions && incoming.monthlyCommissions.length > 0)
  ? incoming.monthlyCommissions
  : existing.monthlyCommissions,
```

### 3.4. Cơ Chế Lưu Trữ Vĩnh Viễn (`handleSaveForm` - Lines 3335 - 3556)
Khi người dùng bấm "Lưu cập nhật" hoặc "Tạo hồ sơ nhu cầu":
1. Tạo object `updated: CRMRecord`.
2. Cập nhật React state: `setRecords(prev => ...)`
3. Cập nhật LocalStorage: `persistCustomRecords(next)` ghi vào `katc_custom_crm_records` và `katc_crm_overrides`.
4. Làm sạch dữ liệu với `removeUndefinedFields(docPayload)` (dòng 3512) để triệt tiêu mọi giá trị `undefined` trước khi gửi lên Firebase.
5. Ghi đồng thời vào cả 2 Firestore collections bằng `setDoc` với `{ merge: true }`:
   ```typescript
   await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
   await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
   ```
6. Tùy chọn 2-way sync: nếu là Doanh nghiệp, đồng bộ về `partners` và `quotations`.

---

## 4. Thiết Kế Mở Rộng Schema (Schema Extension Design)

Theo yêu cầu trong `ORIGINAL_REQUEST.md`:
- **R1**: Bổ sung trường "Phí nhận lớp" (nhập VNĐ, định dạng phân cách hàng nghìn) và danh sách "Phí chênh lệch hàng tháng" (mặc định Tháng 1, gồm số tiền & ghi chú đối soát, nút + thêm tháng, nút xóa tháng).
- **R2**: Tự động tính "Tổng hoa hồng hàng tháng" và "Dòng tiền thực nhận" = Học phí - Phí nhận lớp - Tổng hoa hồng.

### 4.1. Kiểu Dữ Liệu Cho Danh Sách Tháng (`MonthlyCommissionItem`)

Khai báo export trong `CRMAdmissionsModule.tsx`:
```typescript
export interface MonthlyCommissionItem {
  month: number;       // Thứ tự tháng: 1, 2, 3...
  amount: number;      // Số tiền hoa hồng VNĐ
  note: string;        // Ghi chú đối soát hoa hồng của tháng
}
```

### 4.2. Mở Rộng Kiểu `CRMRecord`
Bổ sung 2 trường mới vào `CRMRecord`:
```typescript
export type CRMRecord = {
  // ... các trường hiện có ...
  classIntakeFee?: number;                           // Phí nhận lớp (VNĐ, mặc định 0)
  monthlyCommissions?: MonthlyCommissionItem[];      // Danh sách phí chênh lệch / hoa hồng hàng tháng
  totalCommission?: number;                          // (Tùy chọn) Tổng hoa hồng đã tính
  netCashflow?: number;                              // (Tùy chọn) Dòng tiền thực nhận
  // ...
};
```

Đồng bộ sang `CustomerProfileInput` trong `De_Vuong_Webapp/src/domain/revenue.ts`:
```typescript
export interface CustomerProfileInput {
  // ... các trường hiện hữu ...
  classIntakeFee?: number;
  monthlyCommissions?: MonthlyCommissionItem[];
}
```

### 4.3. Giá Trị Khởi Tạo Mặc Định (Default Values)
- **Phí nhận lớp (`classIntakeFee`)**: `0`
- **Danh sách phí chênh lệch hàng tháng (`monthlyCommissions`)**:
  Mặc định có sẵn dòng Tháng 1:
  ```typescript
  export const INITIAL_MONTHLY_COMMISSIONS: MonthlyCommissionItem[] = [
    { month: 1, amount: 0, note: '' }
  ];
  ```

### 4.4. Các Hàm Tiện Ích Tính Toán (Pure Calculation Helpers)
Tạo các hàm helper thuần túy (pure functions) để sử dụng xuyên suốt form và bảng:

```typescript
/**
 * Tính tổng hoa hồng hàng tháng từ mảng phí chênh lệch
 */
export const calculateTotalCommission = (items?: MonthlyCommissionItem[] | null): number => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
};

/**
 * Tính Dòng tiền thực nhận theo công thức: Học phí - Phí nhận lớp - Tổng hoa hồng
 */
export const calculateNetCashflow = (
  tuition: string | number | undefined,
  intakeFee: string | number | undefined,
  monthlyCommissions?: MonthlyCommissionItem[] | null
): number => {
  const rawTuition = typeof tuition === 'number' 
    ? tuition 
    : (Number(String(tuition || '').replace(/\D/g, '')) || 0);
  const rawIntakeFee = typeof intakeFee === 'number'
    ? intakeFee
    : (Number(String(intakeFee || '').replace(/\D/g, '')) || 0);
  const totalCommission = calculateTotalCommission(monthlyCommissions);
  return rawTuition - rawIntakeFee - totalCommission;
};
```

---

## 5. Thiết Kế State Quản Lý Trong Form & Detail View

### 5.1. Khởi Tạo State Form
Trong component `CRMAdmissionsModule`:
```typescript
// State cho Phí nhận lớp
const [formClassIntakeFee, setFormClassIntakeFee] = useState<string>('0');

// State cho Danh sách Phí chênh lệch hàng tháng
const [formMonthlyCommissions, setFormMonthlyCommissions] = useState<MonthlyCommissionItem[]>([
  { month: 1, amount: 0, note: '' }
]);
```

### 5.2. Mở Form Thêm Mới (`handleOpenAddForm` - Dòng 3120)
Khi tạo hồ sơ mới, reset về mặc định:
```typescript
setFormClassIntakeFee('0');
setFormMonthlyCommissions([
  { month: 1, amount: 0, note: '' }
]);
```

### 5.3. Mở Form Chỉnh Sửa (`handleOpenEditForm` - Dòng 3175)
Khi mở chỉnh sửa bản ghi hiện có:
```typescript
// Nạp phí nhận lớp (fallback '0')
setFormClassIntakeFee(rec.classIntakeFee !== undefined ? String(rec.classIntakeFee) : '0');

// Nạp danh sách hoa hồng tháng (fallback mảng có Tháng 1 nếu trống)
if (rec.monthlyCommissions && Array.isArray(rec.monthlyCommissions) && rec.monthlyCommissions.length > 0) {
  setFormMonthlyCommissions(rec.monthlyCommissions.map(m => ({
    month: Number(m.month) || 1,
    amount: Number(m.amount) || 0,
    note: String(m.note || ''),
  })));
} else {
  setFormMonthlyCommissions([
    { month: 1, amount: 0, note: '' }
  ]);
}
```

### 5.4. Các Thao Tác Thêm / Sửa / Xóa Dòng Tháng
```typescript
// Thêm tháng tiếp theo: Tháng N+1
const handleAddMonthlyCommissionRow = () => {
  setFormMonthlyCommissions((prev) => {
    const nextMonth = prev.length + 1;
    return [
      ...prev,
      { month: nextMonth, amount: 0, note: '' }
    ];
  });
};

// Cập nhật dòng tháng
const handleUpdateMonthlyCommissionRow = (index: number, updates: Partial<MonthlyCommissionItem>) => {
  setFormMonthlyCommissions((prev) => {
    const next = [...prev];
    if (next[index]) {
      next[index] = { ...next[index], ...updates };
    }
    return next;
  });
};

// Xóa dòng tháng (và tự động sắp xếp lại thứ tự tháng 1, 2, 3...)
const handleRemoveMonthlyCommissionRow = (index: number) => {
  setFormMonthlyCommissions((prev) => {
    // Nếu chỉ có 1 dòng duy nhất, reset giá trị về 0 thay vì để mảng rỗng
    if (prev.length <= 1) {
      return [{ month: 1, amount: 0, note: '' }];
    }
    const filtered = prev.filter((_, idx) => idx !== index);
    // Chuẩn hóa lại số thứ tự tháng liền mạch: Tháng 1, Tháng 2, Tháng 3...
    return filtered.map((item, idx) => ({
      ...item,
      month: idx + 1
    }));
  });
};
```

### 5.5. Tính Toán Tức Thì (Reactive Derived Values)
Nhờ React `useMemo`, các chỉ số tổng cập nhật tức thời mà không cần click lưu:
```typescript
const formTotalCommission = useMemo(() => {
  return calculateTotalCommission(formMonthlyCommissions);
}, [formMonthlyCommissions]);

const formNetCashflow = useMemo(() => {
  return calculateNetCashflow(formTuition, formClassIntakeFee, formMonthlyCommissions);
}, [formTuition, formClassIntakeFee, formMonthlyCommissions]);
```

---

## 6. Đảm Bảo Tương Thích Ngược & An Toàn Firestore (Zero Regressions)

### 6.1. Xử Lý Các Bản Ghi Cũ Chưa Có Dữ Liệu
Các document cũ trong Firestore (`crm_records` và `customer_profiles`) không có thuộc tính `classIntakeFee` hay `monthlyCommissions`.
- **Khi đọc từ Firestore**:
  ```typescript
  classIntakeFee: Number(data.classIntakeFee || 0),
  monthlyCommissions: Array.isArray(data.monthlyCommissions)
    ? data.monthlyCommissions.map((m: any, idx: number) => ({
        month: Number(m.month) || (idx + 1),
        amount: Number(m.amount) || 0,
        note: String(m.note || ''),
      }))
    : undefined,
  ```
  Nếu `data.monthlyCommissions` chưa tồn tại trong Firestore, nó giữ là `undefined` trong object model hoặc được khởi tạo khi mở form. Điều này đảm bảo không làm bẩn dữ liệu các tài liệu cũ chưa được người dùng chỉnh sửa.

### 6.2. An Toàn Khi Ghi Dữ Liệu
Khi bấm "Lưu cập nhật":
```typescript
const rawIntakeFee = Number(String(formClassIntakeFee || '').replace(/\D/g, '')) || 0;
const sanitizedCommissions = formMonthlyCommissions.map((m, idx) => ({
  month: Number(m.month) || (idx + 1),
  amount: Number(String(m.amount || '').replace(/\D/g, '')) || 0,
  note: String(m.note || '').trim()
}));

const updated: CRMRecord = {
  // ...
  classIntakeFee: rawIntakeFee,
  monthlyCommissions: sanitizedCommissions,
  // ...
};
```
Nhờ hàm `removeUndefinedFields` và lệnh `setDoc(..., { merge: true })`, Firestore sẽ:
- Cập nhật thêm 2 trường mới vào document cũ.
- Giữ nguyên 100% các trường khác trên document mà không bị xóa hay đè nhầm.

### 6.3. Tương Thích Nhân Bản Bản Ghi (`handleDuplicateRecord` - Dòng 3920)
Cần bổ sung truyền `classIntakeFee` và `monthlyCommissions` sang bản sao nhân bản để không làm mất thông tin tài chính đã thiết lập:
```typescript
const duplicated: CRMRecord = {
  ...rec,
  id: newId,
  name: `${rec.name} (Bản sao)`,
  classIntakeFee: rec.classIntakeFee,
  monthlyCommissions: rec.monthlyCommissions ? JSON.parse(JSON.stringify(rec.monthlyCommissions)) : undefined,
};
```

---

## 7. Bố Cục Giao Diện Đề Xuất (Theo Chuẩn AGENTS.md)

### 7.1. Trong Form Chỉnh Sửa / Chi Tiết (Fullpage Form Body - Dòng 5070+)
Khu vực Kế hoạch & Thông tin tư vấn (Section 2) hiện có ô **Học phí dự kiến (VNĐ)**.
Bố trí một tiểu mục tài chính chuyên biệt **"Chính sách tài chính & Phí hoa hồng"**:
1. **Hàng nhập liệu chính**:
   - `Học phí dự kiến (VNĐ)`: Đã có sẵn.
   - `Phí nhận lớp (VNĐ)`: Đặt ngay cạnh Học phí dự kiến, nhập số tiền tự động format phân cách hàng nghìn (`1.000.000 ₫`).
2. **Khung danh sách Phí chênh lệch hàng tháng (Hoa hồng định kỳ)**:
   - Header bảng tinh gọn: `Tháng`, `Số tiền hoa hồng (VNĐ)`, `Ghi chú đối soát`, `Thao tác`.
   - Mỗi dòng tháng:
     - Nhãn: `Tháng 1`, `Tháng 2`... (phông mono `font-mono text-xs font-semibold text-slate-700`).
     - Ô nhập số tiền: Phông mono, format VNĐ, icon `₫`.
     - Ô nhập ghi chú: text input tinh gọn `text-xs`.
     - Nút xóa: Icon `Trash2` xám nhạt, đổi màu đỏ khi hover.
   - Nút `+ Thêm tháng tiếp theo`: Button viền emerald nhẹ nhàng `border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold`.
3. **Thanh Tóm Tắt Dòng Tiền (Net Cashflow Summary Banner)**:
   Nằm ở đáy khối tài chính, thiết kế phẳng, thanh lịch:
   - `Học phí`: `{tuition} đ`
   - `- Phí nhận lớp`: `{classIntakeFee} đ`
   - `- Tổng hoa hồng`: `{formTotalCommission} đ`
   - `= Dòng tiền thực nhận`: `{formNetCashflow} đ` (nổi bật với phông mono `text-emerald-700 font-bold`).

### 7.2. Trong Bảng Dữ Liệu Tuyển Sinh Master CRM (Cột "Học phí")
Tại cột "Học phí" của Master Table (Dòng 6786 - 6797):
Hiển thị cả Học phí gốc và dòng tiền Thực nhận tinh gọn bên dưới mà không làm phình dòng:
```tsx
<td className="px-3 py-2 align-middle text-right whitespace-nowrap">
  {(() => {
    const totalTuition = Number(String(rec.tuition || '').replace(/\D/g, '')) || 0;
    if (!totalTuition) return <span className="text-slate-400 text-xs">—</span>;
    const netCash = calculateNetCashflow(rec.tuition, rec.classIntakeFee, rec.monthlyCommissions);
    const hasDeductions = (Number(rec.classIntakeFee) || 0) > 0 || (rec.monthlyCommissions && rec.monthlyCommissions.length > 0);
    
    return (
      <div className="flex flex-col items-end">
        <span className="font-mono text-xs font-semibold text-slate-800">
          {totalTuition.toLocaleString('vi-VN')} đ
        </span>
        {hasDeductions && (
          <span className="font-mono text-[10px] font-medium text-emerald-700" title="Dòng tiền thực nhận (Học phí - Phí nhận lớp - Tổng hoa hồng)">
            TN: {netCash.toLocaleString('vi-VN')} đ
          </span>
        )}
      </div>
    );
  })()}
</td>
```
Điều này đáp ứng hoàn hảo:
- Dễ dàng tra cứu trực tiếp từ màn hình Master mà không cần mở từng bản ghi.
- Tuân thủ quy tắc AGENTS.md: không bọc pill lòe loẹt, phông mono chuẩn kích thước `12px` và `10px`, căn phải chuẩn số liệu kế toán.

---

## 8. Kết Luận & Khuyến Nghị Cho Worker Triển Khai

1. **Về Type**: Cập nhật `CRMRecord` trong `CRMAdmissionsModule.tsx` và `CustomerProfileInput` trong `domain/revenue.ts`.
2. **Về Helper**: Viết `calculateTotalCommission` và `calculateNetCashflow` bên ngoài component để có thể export và viết test độc lập.
3. **Về Form Input**:
   - Sử dụng định dạng `formatVND` hoặc `toLocaleString('vi-VN')` khi hiển thị value.
   - Khi `onChange`, áp dụng `e.target.value.replace(/\D/g, '')`.
4. **Về Firestore Sync**:
   - Nhớ bổ sung mapping trong cả 2 snapshot listeners: `crm_records` (dòng 2894) và `customer_profiles` (dòng 2952).
   - Nhớ bổ sung trong `mergeCRMRecord` (dòng 2761).
   - Nhớ bổ sung trong `handleSaveForm` (dòng 3376) và `handleDuplicateRecord` (dòng 3920).
5. **Về Kiểm Thử Build**:
   - Đảm bảo `npm run build` trong `De_Vuong_Webapp` trả về exit code 0 sau khi hoàn tất.
