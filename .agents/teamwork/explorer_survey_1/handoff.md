# Báo Cáo Khảo Sát Kỹ Thuật (Handoff Report) — Explorer 1

**Dự án**: Student Identity & Multi-Stage Admissions Debt Sync  
**Phân hệ trọng tâm**: Requirement R1 — Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh & Popup Thu tiền  
**Thư mục làm việc**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_1`  
**Ngày hoàn thành**: 2026-11-02T09:47:00Z  

---

## 1. Observation (Các quan sát trực tiếp từ Codebase)

### 1.1. Cấu trúc dữ liệu và Khởi tạo Hồ sơ Tuyển sinh (`CRMAdmissionsModule.tsx`)
- **Kiểu dữ liệu `CRMRecord`** (`CRMAdmissionsModule.tsx:656-710`):
  ```typescript
  export type CRMRecord = {
    id: string | number;
    code?: string;
    reconciliationCode?: string;
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
    tuition?: string;
    classId?: string;
    classCode?: string;
    className?: string;
    status: CRMStatus;
    followUp?: string;
    note: string;
    partnerId?: string;
    partnerName?: string;
    shortName?: string;
    studentId?: string; // <-- Trường lưu ID học viên
    paidAmount?: number | string;
    paymentStatus?: string;
    receiptCode?: string;
    ...
  };
  ```
- **Lưu trữ dữ liệu vào Firestore** (`CRMAdmissionsModule.tsx:3313-3320`):
  Hồ sơ tuyển sinh được ghi đồng thời (double-write) vào 2 collection của Firestore:
  ```typescript
  const docPayload = removeUndefinedFields({
    ...updated,
    fullName: updated.name,
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'customer_profiles', String(updated.id)), docPayload, { merge: true });
  await setDoc(doc(db, 'crm_records', String(updated.id)), docPayload, { merge: true });
  ```
  Và đồng bộ vào LocalStorage: `katc_custom_crm_records` và `katc_crm_overrides` (`lines 1327-1344`).
- **Lắng nghe thời gian thực** (`CRMAdmissionsModule.tsx:2733-2850`):
  Component sử dụng `onSnapshot(collection(db, 'crm_records'))` và `onSnapshot(collection(db, 'customer_profiles'))`, sau đó hợp nhất qua `mergeCRMRecord` (`lines 2660-2691`).

### 1.2. Cơ chế chọn "Học viên cũ" và khớp SĐT/Email hiện tại
- **Dropdown chọn Học viên cũ** (`CRMAdmissionsModule.tsx:4612-4625`):
  Khi `formKind === 'Cá nhân'`, form hiển thị component `AdminSaaSSelect`:
  ```tsx
  <AdminSaaSSelect
    placeholder="-- Tự nhập / Học viên mới --"
    searchPlaceholder="Gõ tên, SĐT, email để tìm Học viên..."
    options={studentOptions}
    value={formStudentId}
    onChange={handleSelectStudent}
  />
  ```
- **Nguồn dữ liệu `studentOptions`** (`CRMAdmissionsModule.tsx:2076-2087`):
  ```typescript
  const studentOptions = useMemo(() => [
    { value: '', label: '-- Tự nhập / Học viên mới --' },
    ...students.map(st => {
      const lrnCode = ensureValidBusinessCode(st.student_code_internal || (st as any).studentCode || st.uid, 'LRN');
      return {
        value: st.uid, // <-- Quan sát: value gán là st.uid (chứ không phải lrnCode)
        label: st.fullName || st.email,
        subLabel: [lrnCode, st.phone, st.email].filter(Boolean).join(' · '),
        searchKey: `${lrnCode} ${st.fullName || ''} ${st.phone || ''} ${st.email || ''}`
      };
    })
  ], [students]);
  ```
- **Hàm `handleSelectStudent`** (`CRMAdmissionsModule.tsx:1480-1490`):
  ```typescript
  const handleSelectStudent = (sId: string) => {
    setFormStudentId(sId); // <-- Gán st.uid vào formStudentId
    if (!sId) return;
    const found = students.find(s => s.uid === sId);
    if (found) {
      setFormName(found.fullName || found.email || '');
      if (found.phone) setFormPhone(found.phone);
      if (found.email) setFormEmail(found.email);
      if ((found as any).address && !formTrainingLocation) setFormTrainingLocation((found as any).address);
    }
  };
  ```
- **Khuyết điểm khi nhập SĐT / Email tự do**:
  - Khi người dùng tự nhập số điện thoại (`formPhone`) hoặc email (`formEmail`) của học viên đã có trong hệ thống `users`, **hoàn toàn không có cơ chế `useEffect` hay `onBlur` nào tự động truy vấn `students` để gán `formStudentId`**.
  - Khi bấm Lưu (`handleSaveForm`, line 3241):
    ```typescript
    studentId: formKind === 'Cá nhân' ? formStudentId || undefined : undefined,
    ```
    Nếu người dùng không bấm chọn thủ công trong dropdown `AdminSaaSSelect`, `formStudentId` vẫn là chuỗi rỗng (`''`), dẫn đến `studentId` trên bản ghi lưu thành `undefined`!
- **Khuyết điểm khi mở sửa hồ sơ (`handleOpenEditForm`)** (`CRMAdmissionsModule.tsx:3061`):
  ```typescript
  setFormStudentId(rec.studentId || '');
  ```
  Nếu bản ghi cũ chưa có `studentId`, hàm này để rỗng `formStudentId`, không tự động tra cứu lại SĐT / Email của học viên cũ trong danh sách `students` (trong khi `rec.partnerId` của Doanh nghiệp lại có thuật toán tra cứu thông minh ở lines 3040-3058).

### 1.3. Định dạng mã Học viên lưu trên `studentId`
- Trong `UserProfile` (`userService.ts:10-47`):
  - `uid: string`: ID tài liệu Firestore (thường có dạng `student_174...` hoặc Firebase Auth UID dài).
  - `student_code_internal: string`: Mã nghiệp vụ chuẩn 12 ký tự (e.g. `LRN-62517882` hoặc `LRN-20510493`).
  - `studentCode?: string`: Mã định danh hiển thị.
- Trong `CRMAdmissionsModule.tsx`:
  - Tại `handleSelectStudent`: lưu `formStudentId = st.uid` (ví dụ `student_1741234567890`).
  - Tại `onPaymentRecorded` (lines 5696, 5710, 6819, 6833):
    ```typescript
    if (matchedStudent) {
      targetStudentId = matchedStudent.uid;
    } else {
      const newStu = await userService.createUserProfile(`student_${Date.now()}`, { ... });
      targetStudentId = newStu.uid;
    }
    ...
    updatePayload.studentId = targetStudentId;
    ```
    Toàn bộ các nơi đều lưu `st.uid` vào trường `studentId` của `CRMRecord`, **thay vì lưu mã nghiệp vụ chuẩn `LRN-xxxxxxx`** (`student_code_internal`).
  - Hệ quả trên Sổ cái `AdminLedgerModule.tsx:139-141`:
    ```typescript
    if (matchedCrm.studentId || matchedCrm.studentCode || matchedCrm.learnerCode) {
      matchedStudentCode = matchedCrm.studentId || matchedCrm.studentCode || matchedCrm.learnerCode;
    }
    ```
    Vì `matchedCrm.studentId` đang lưu chuỗi `student_174...`, Ledger nhận giá trị này thay vì mã `LRN-xxxxxxx`!

### 1.4. Truyền dữ liệu từ `CRMAdmissionsModule` sang `LeadPaymentModal`
- **Hàm mở modal `handleOpenLeadPayment`** (`CRMAdmissionsModule.tsx:1357-1394`):
  ```typescript
  const handleOpenLeadPayment = (rec?: CRMRecord | null) => {
    const target = rec || editingRecord;
    const effectiveTuition = parseInt(String(formTuition || target?.tuition || '').replace(/\D/g, ''), 10) || 0;
    
    // Tìm mã lệnh thu đang mở gần nhất nếu có
    const targetLeadId = String(target?.id || '');
    const targetCode = ensureValidBusinessCode(target?.code || target?.id || '', 'LEA');
    const targetCodeClean = targetCode.replace('-', '');
    const targetStudentId = target?.studentId || (target === editingRecord ? formStudentId : undefined);

    const existingCol = allLedgerTransactions.find(tx => {
      if (!tx.refCode?.startsWith('COL')) return false;
      const desc = tx.description || '';
      const sId = String(tx.studentId || '');
      return (
        sId === targetLeadId ||
        (targetStudentId && sId === String(targetStudentId)) ||
        desc.includes(targetCode) ||
        desc.includes(targetCodeClean)
      );
    });

    setPaymentModalColCode(existingCol?.refCode);
    setPaymentModalLead({
      id: target?.id || 'new',
      code: target?.code || '',
      name: (target === editingRecord && formName) ? formName : (target?.name || ''),
      partnerName: (target === editingRecord && formPartnerName) ? formPartnerName : (target?.partnerName || ''),
      phone: (target === editingRecord && formPhone) ? formPhone : (target?.phone || target?.contact || ''),
      email: (target === editingRecord && formEmail) ? formEmail : (target?.email || ''),
      tuition: effectiveTuition,
      paidAmount: Number(target?.paidAmount || 0),
      studentId: target?.studentId || (target === editingRecord ? formStudentId : undefined),
      programName: formProgramName || (target as any)?.programName || target?.roadmap || (target as any)?.interestCourse || target?.need || '',
      targetAudience: (formKind || target?.kind) === 'Doanh nghiệp' ? 'Khách hàng Doanh nghiệp' : 'Học viên cá nhân',
    });
    setIsLeadPaymentModalOpen(true);
  };
  ```
- **Component `LeadPaymentModal` nhận Props** (`LeadPaymentModal.tsx:11-30, 46-53`):
  ```typescript
  export interface LeadPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingCollectionCode?: string;
    lead?: {
      id: string | number;
      code?: string;
      name?: string;
      partnerName?: string;
      phone?: string;
      email?: string;
      tuition?: number;
      paidAmount?: number;
      note?: string;
      internalNote?: string;
      programName?: string;
      roadmap?: string;
      targetAudience?: string;
      studentId?: string;
    } | null;
    student?: { ... } | null;
    onPaymentRecorded?: (data: { collectionCode: string; amount: number; method: string }) => void;
  }
  ```
- **Xử lý Mã định danh & Header trong `LeadPaymentModal.tsx`** (`lines 70-73, 230-249`):
  ```typescript
  const isStudent = Boolean(student);

  // Resolve target identifier strictly based on type
  const targetCode = isStudent
    ? ensureValidBusinessCode(student!.studentCode || student!.id, 'LRN')
    : ensureValidBusinessCode(String(lead?.code || lead?.id), 'LEA');
  ```
  Và phần Header Modal:
  ```tsx
  <div className="flex items-center gap-2.5">
    <h3 className="text-sm font-bold text-slate-900">
      Tạo mã VietQR & Thu học phí
    </h3>
    <span className="font-mono text-xs font-semibold text-slate-700">{targetCode}</span>
    {currentColCode && (
      <>
        <span className="text-xs text-slate-400">·</span>
        <span className="font-mono text-xs font-semibold text-slate-700">
          {currentColCode}
        </span>
      </>
    )}
    <span className="text-xs text-slate-400">·</span>
    <span className="text-xs font-medium text-slate-600 truncate max-w-xs">{clientName}</span>
  </div>
  ```
  **QUAN SÁT THEN CHỐT**:
  - Khi mở từ CRM Tuyển sinh (`lead` được truyền vào, `student = null`):
    - `targetCode` chỉ là `ensureValidBusinessCode(lead.code || lead.id, 'LEA')` (ví dụ `LEA-64817788`).
    - **Header hoàn toàn bỏ qua `lead.studentId`**, chỉ hiển thị `LEA-64817788 · COL-xxxxxxxx · Nguyễn Thị Anh Thi`.
    - **Mã `LRN` hoàn toàn biến mất trên giao diện Header của Popup VietQR/Phiếu thu**!
    - Điều này vi phạm trực tiếp yêu cầu R1:
      > *"Modal tạo mã VietQR & Thu học phí (`LeadPaymentModal`) phải hiển thị rõ mã `LRN` song song với mã hồ sơ `LEA` (ví dụ `LEA-64817788 · LRN-62517882 · Nguyễn Thị Anh Thi`), không được để trống hoặc hiển thị placeholder vô danh."*

### 1.5. Hiển thị trên Thanh Tiến trình Thương mại (`CommercialLifecycleBar.tsx`)
- Trong `CRMAdmissionsModule.tsx:4296-4302`:
  ```tsx
  studentId={editingRecord.studentId || formStudentId}
  studentCode={(() => {
    const sId = editingRecord.studentId || formStudentId;
    if (!sId) return undefined;
    const st = students.find(s => s.uid === sId);
    return st?.studentCode || undefined;
  })()}
  ```
- **Lỗi dây chuyền**:
  - Nếu `sId` là `LRN-62517882` (đã chuẩn hóa), `students.find(s => s.uid === sId)` bị `undefined` vì `s.uid` là `student_174...`.
  - Nếu `st` được tìm thấy nhưng chỉ có `student_code_internal` mà không có thuộc tính `studentCode`, kết quả vẫn là `undefined`.
  - Hậu quả: `CommercialLifecycleBar.tsx:607-610` hiển thị chuỗi chú thích: *(Mã LRN sẽ tự động cấp khi Xếp lớp)* mặc dù đây là học viên cũ đã có mã `LRN-62517882`.

---

## 2. Logic Chain (Chuỗi lập luận nguyên nhân - kết quả)

```
[BƯỚC 1: Dropdown & Form Nhập liệu CRM]
- studentOptions gán value = st.uid (chứ không gán mã LRN) (Quan sát 1.2)
- handleSelectStudent gán formStudentId = st.uid (Quan sát 1.2)
- Khi nhập SĐT / Email khớp với học viên trong users: không có trigger tự động nhận diện (Quan sát 1.2)
       │
       ▼
[BƯỚC 2: Lưu trữ Hồ sơ Tuyển sinh]
- handleSaveForm lưu studentId = formStudentId || undefined (Quan sát 1.2, 1.3)
- Kết quả: Hoặc studentId = undefined (nếu gõ tay SĐT/Email), hoặc studentId = "student_174..." (uid nội bộ)
- KHÔNG HỀ lưu mã "LRN-xxxxxxx" vào record tuyển sinh.
       │
       ▼
[BƯỚC 3: Mở Popup Thu tiền LeadPaymentModal]
- handleOpenLeadPayment truyền paymentModalLead.studentId (chứa undefined hoặc "student_174...") (Quan sát 1.4)
- LeadPaymentModal tính targetCode = LEA-xxxxxxx và HOÀN TOÀN KHÔNG trích xuất mã LRN vào Header (Quan sát 1.4)
- Header Popup chỉ hiện: LEA-64817788 · COL-xxxxxxxx · Nguyễn Thị Anh Thi (Mất hoàn toàn LRN)
       │
       ▼
[BƯỚC 4: Ghi nhận Lệnh thu & Đồng bộ Sổ cái Kế toán]
- LeadPaymentModal.saveCollectionOrderRecord lưu targetId = lead.studentId vào ledger_transactions (Quan sát 1.3, 1.4)
- Do targetId là "student_174..." hoặc "LEA-...", Sổ cái AdminLedgerModule không thể đọc ra mã LRN chuẩn
- Cột Đối tượng / Học viên trên Sổ cái hoặc hiện mã rác "student_174..." hoặc rơi vào fallback "Học viên E-learning".
```

---

## 3. Caveats (Khu vực mở rộng & Giả định)

1. **Khách hàng Doanh nghiệp B2B vs Cá nhân B2C**:
   - Khảo sát này tập trung vào luồng Cá nhân (B2C), nơi mã định danh học viên là `LRN-xxxxxxx`.
   - Với Doanh nghiệp B2B (`formKind === 'Doanh nghiệp'`), mã định danh tổ chức là `ENT-xxxxxxx` (`partnerId` / `partnerCode`). Luồng B2B đã có sẵn cơ chế khớp mã Doanh nghiệp tại lines 3040-3058.
2. **Khách hàng mới hoàn toàn (chưa có trong `users`)**:
   - Khi tạo một Lead cá nhân mới hoàn toàn (chưa có SĐT/Email trong hệ thống `users`), mã LRN có thể chưa tồn tại cho đến khi phát sinh giao dịch hoặc được xếp lớp.
   - Khi đó, cơ chế `onPaymentRecorded` hoặc lưu form có thể tự động sinh tài khoản học viên qua `userService.createUserProfile`, gán ngay mã `LRN-xxxxxxx` (`student_code_internal`) vào trường `studentId` của hồ sơ Tuyển sinh.
3. **Mã sinh ngẫu nhiên vs Băm cố định**:
   - Cần tuân thủ tuyệt đối quy tắc của `ORIGINAL_REQUEST.md`: **Tuyệt đối không lấy số đuôi của mã LEA để ghép thành mã LRN giả** (`LRN-91690914`). Mã LRN phải là mã thực tế của học viên từ `student_code_internal`.

---

## 4. Conclusion (Kết luận & Đề xuất giải pháp chi tiết)

Để đáp ứng 100% Yêu cầu R1 và các Tiêu chí nghiệm thu (Acceptance Criteria), các thay đổi sau là bắt buộc:

### Đề xuất 1: Chuẩn hóa neo giữ `studentId = LRN-xxxxxxx` trong `CRMAdmissionsModule.tsx`

1. **Tạo hàm trợ giúp nhận diện Học viên chuẩn (`resolveStudentIdentity`)**:
   ```typescript
   // Tra cứu học viên theo SĐT, Email hoặc Mã LRN / UID
   export const resolveStudentIdentity = (
     identifier: { idOrLrn?: string; phone?: string; email?: string; name?: string },
     studentsList: UserProfile[]
   ): { student: UserProfile; lrnCode: string } | null => {
     if (!studentsList || studentsList.length === 0) return null;
     const cleanPhone = (identifier.phone || '').replace(/\D/g, '');
     const cleanEmail = (identifier.email || '').trim().toLowerCase();
     const cleanName = (identifier.name || '').trim().toLowerCase();
     const cleanId = (identifier.idOrLrn || '').trim();

     const found = studentsList.find(s => {
       const sPhone = (s.phone || '').replace(/\D/g, '');
       const sEmail = (s.email || '').trim().toLowerCase();
       const sLrn = (s.student_code_internal || (s as any).studentCode || '').trim();
       if (cleanId && (s.uid === cleanId || sLrn === cleanId)) return true;
       if (cleanPhone && sPhone && sPhone === cleanPhone) return true;
       if (cleanEmail && sEmail && sEmail === cleanEmail) return true;
       if (!cleanPhone && !cleanEmail && cleanName && (s.fullName || '').trim().toLowerCase() === cleanName) return true;
       return false;
     });

     if (!found) return null;
     const lrnCode = ensureValidBusinessCode(found.student_code_internal || (found as any).studentCode || found.uid, 'LRN');
     return { student: found, lrnCode };
   };
   ```

2. **Cập nhật `studentOptions` và `handleSelectStudent`** (`CRMAdmissionsModule.tsx:2076, 1480`):
   - Trong `studentOptions`: gán `value: lrnCode` (hoặc `st.student_code_internal || ensureValidBusinessCode(st.uid, 'LRN')`).
   - Trong `handleSelectStudent(selectedVal)`:
     ```typescript
     const res = resolveStudentIdentity({ idOrLrn: selectedVal }, students);
     if (res) {
       setFormStudentId(res.lrnCode); // Lưu chuẩn mã LRN-xxxxxxx
       setFormName(res.student.fullName || res.student.email || '');
       if (res.student.phone) setFormPhone(res.student.phone);
       if (res.student.email) setFormEmail(res.student.email);
     } else {
       setFormStudentId(selectedVal);
     }
     ```

3. **Tự động nhận diện khi nhập SĐT / Email** (`CRMAdmissionsModule.tsx`):
   - Thêm `useEffect` tự động nhận diện học viên cũ khi người dùng nhập SĐT hoặc Email:
     ```typescript
     useEffect(() => {
       if (formKind === 'Cá nhân' && (!formStudentId || !formStudentId.startsWith('LRN-'))) {
         const cleanP = formPhone.trim().replace(/\D/g, '');
         const cleanE = formEmail.trim().toLowerCase();
         if ((cleanP.length >= 9) || (cleanE.includes('@') && cleanE.includes('.'))) {
           const res = resolveStudentIdentity({ phone: cleanP, email: cleanE }, students);
           if (res) {
             setFormStudentId(res.lrnCode);
             if (!formName.trim() && res.student.fullName) {
               setFormName(res.student.fullName);
             }
           }
         }
       }
     }, [formPhone, formEmail, formKind, formStudentId, students]);
     ```

4. **Bảo đảm lưu `studentId = LRN-xxxxxxx` khi Lưu Form** (`handleSaveForm`, line 3241):
   - Trước khi tạo payload `updated`:
     ```typescript
     let finalStudentId = formStudentId;
     if (formKind === 'Cá nhân' && (!finalStudentId || !finalStudentId.startsWith('LRN-'))) {
       const res = resolveStudentIdentity({ phone: formPhone, email: formEmail, name: formName }, students);
       if (res) {
         finalStudentId = res.lrnCode;
       }
     }
     // Trong payload updated:
     studentId: formKind === 'Cá nhân' ? (finalStudentId || undefined) : undefined,
     ```

5. **Tự động khôi phục mã LRN khi mở sửa hồ sơ** (`handleOpenEditForm`, line 3061):
   ```typescript
   let initStudentId = rec.studentId || '';
   if (!initStudentId || !initStudentId.startsWith('LRN-')) {
     const res = resolveStudentIdentity({ idOrLrn: initStudentId, phone: rec.phone || rec.contact, email: rec.email, name: rec.name }, students);
     if (res) {
       initStudentId = res.lrnCode;
     }
   }
   setFormStudentId(initStudentId);
   ```

6. **Chuẩn hóa truyền sang `handleOpenLeadPayment`**:
   - Đảm bảo `paymentModalLead.studentId` luôn là mã `LRN-xxxxxxx`:
     ```typescript
     const targetStudentId = target?.studentId || (target === editingRecord ? formStudentId : undefined);
     const res = resolveStudentIdentity({ idOrLrn: targetStudentId, phone: target?.phone || target?.contact, email: target?.email, name: target?.name }, students);
     const effectiveLrn = res ? res.lrnCode : (targetStudentId && targetStudentId.startsWith('LRN-') ? targetStudentId : undefined);
     
     setPaymentModalLead({
       ...
       code: ensureValidBusinessCode(target?.code || target?.id || '', 'LEA'),
       studentId: effectiveLrn,
     });
     ```

7. **Cập nhật `onPaymentRecorded` (`lines 5685-5725, 6808-6848`)**:
   - Khi tự động cấp mã LRN mới:
     ```typescript
     let targetStudentId = paymentModalLead.studentId;
     if (!targetStudentId || !targetStudentId.startsWith('LRN-')) {
       const res = resolveStudentIdentity({ phone: paymentModalLead.phone, email: paymentModalLead.email, name: paymentModalLead.name }, students);
       if (res) {
         targetStudentId = res.lrnCode;
       } else {
         const newStu = await userService.createUserProfile(`student_${Date.now()}`, { ... });
         targetStudentId = newStu.student_code_internal || ensureValidBusinessCode(newStu.uid, 'LRN');
       }
     }
     // Lưu mã LRN-xxxxxxx vào updatePayload.studentId
     updatePayload.studentId = targetStudentId;
     ```

---

### Đề xuất 2: Cập nhật `LeadPaymentModal.tsx` hiển thị song song `LEA` & `LRN`

1. **Trích xuất mã LRN và mã LEA** (`LeadPaymentModal.tsx:70-76`):
   ```typescript
   const isStudent = Boolean(student);

   const leadCode = lead ? ensureValidBusinessCode(String(lead.code || lead.id), 'LEA') : undefined;
   const lrnCode = isStudent
     ? ensureValidBusinessCode(student!.studentCode || student!.id, 'LRN')
     : (lead?.studentId ? (lead.studentId.startsWith('LRN-') ? lead.studentId : ensureValidBusinessCode(lead.studentId, 'LRN')) : undefined);

   const targetCode = isStudent ? lrnCode! : leadCode!;
   ```

2. **Cập nhật Header Modal** (`LeadPaymentModal.tsx:232-248`):
   ```tsx
   <div className="flex items-center gap-2.5">
     <h3 className="text-sm font-bold text-slate-900">
       Tạo mã VietQR & Thu học phí
     </h3>
     {leadCode && (
       <span className="font-mono text-xs font-semibold text-slate-700">{leadCode}</span>
     )}
     {leadCode && lrnCode && (
       <span className="text-xs text-slate-400">·</span>
     )}
     {lrnCode && (
       <span className="font-mono text-xs font-semibold text-emerald-700">{lrnCode}</span>
     )}
     {currentColCode && (
       <>
         <span className="text-xs text-slate-400">·</span>
         <span className="font-mono text-xs font-semibold text-slate-700">
           {currentColCode}
         </span>
       </>
     )}
     <span className="text-xs text-slate-400">·</span>
     <span className="text-xs font-medium text-slate-600 truncate max-w-xs">{clientName}</span>
   </div>
   ```
   **Kết quả trực quan**: `LEA-64817788 · LRN-62517882 · COL-84920194 · Nguyễn Thị Anh Thi`.

3. **Cập nhật Khung tóm tắt Khách hàng** (`LeadPaymentModal.tsx:304-307`):
   ```tsx
   <div className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 flex items-center justify-between text-xs font-medium text-slate-800">
     <span className="font-semibold text-slate-900">{clientName}</span>
     <div className="flex items-center gap-1.5 font-mono text-slate-500">
       {leadCode && <span>{leadCode}</span>}
       {leadCode && lrnCode && <span>·</span>}
       {lrnCode && <span className="text-emerald-700 font-semibold">{lrnCode}</span>}
     </div>
   </div>
   ```

4. **Cập nhật Bản in Phiếu thu PT-KATC** (`LeadPaymentModal.tsx:597-599`):
   ```tsx
   <p className="font-mono text-[11px] text-slate-500">
     {leadCode && `Mã Hồ sơ: ${leadCode}`}
     {leadCode && lrnCode && ' · '}
     {lrnCode && `Mã Học viên: ${lrnCode}`}
   </p>
   ```

5. **Lưu `studentId = lrnCode` vào Sổ cái khi sao chép / tạo lệnh thu** (`LeadPaymentModal.tsx:160-165`):
   ```typescript
   const colCode = currentColCode || existingCollectionCode || generateBusinessCode('COL');
   const targetId = isStudent ? (student!.studentCode || student!.id) : (lrnCode || lead?.studentId || String(lead?.id || ''));
   
   await addDoc(collection(db, 'ledger_transactions'), cleanObject({
     date: new Date().toISOString(),
     studentId: targetId, // <-- Đảm bảo ghi mã LRN-xxxxxxx
     studentName: clientName,
     refCode: colCode,
     ...
   }));
   ```

---

## 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

1. **Kiểm tra Unit Test hiện tại của Webapp**:
   - Lệnh: `npm test`
   - Vị trí: `De_Vuong_Webapp/`
   - Kết quả hiện tại: 19/19 tests passed (1.5s).
2. **Kiểm tra Biên dịch Vite Build**:
   - Lệnh: `npm run build`
   - Vị trí: `De_Vuong_Webapp/`
   - Kết quả hiện tại: Built in 10.44s thành công 100% (exit code 0).
3. **Kịch bản Kiểm chứng Nghiệp vụ (Scenario Verification)**:
   - **Bước 1**: Mở form Thêm mới hoặc Sửa hồ sơ Tuyển sinh cá nhân (`tab=leads`).
   - **Bước 2**: Nhập SĐT hoặc Email của một học viên cũ đã có trong hệ thống (ví dụ `Nguyễn Thị Anh Thi`, `0916909144`, `LRN-20510493` hoặc `LRN-62517882`).
   - **Bước 3**: Kiểm tra xem trường `formStudentId` có tự động neo giữ mã `LRN-20510493` và hiển thị thẻ "Chi tiết học viên: LRN-20510493 · ✓ Kế thừa từ Hồ sơ Học viên" hay không.
   - **Bước 4**: Bấm nút "Thu tiền & Xuất VietQR" (`handleOpenLeadPayment`).
   - **Bước 5**: Xác nhận trên Header của `LeadPaymentModal`: hiển thị đầy đủ và sắc nét cả mã LEA và mã LRN song song: `LEA-xxxxxxxx · LRN-xxxxxxxx · Nguyễn Thị Anh Thi`.
   - **Bước 6**: Kiểm tra `CommercialLifecycleBar`: bước 3 hiển thị `✓ Học viên cũ` kèm `Mã HV: LRN-xxxxxxxx`, không còn dòng chữ tạm bợ `(Mã LRN sẽ tự động cấp khi Xếp lớp)`.
   - **Bước 7**: Điều kiện Hủy bỏ (Invalidation Condition): Nếu Header của `LeadPaymentModal` vẫn chỉ có mã LEA mà không có mã LRN, hoặc mã LRN bị gán chuỗi rác `student_174...` hoặc số đuôi của LEA, kiểm chứng thất bại.
