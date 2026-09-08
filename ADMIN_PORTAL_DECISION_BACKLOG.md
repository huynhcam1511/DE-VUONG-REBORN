# Admin Portal — Decision Backlog

Nguồn nền: `ADMIN_PORTAL_AUDIT_AND_ROADMAP.md`  
Cách dùng: Chọn ID và trả lời **Duyệt / Từ chối / Hoãn / Sửa đề xuất**. Chưa có mục nào được tự động triển khai. Mỗi mục có thể là UI nhìn thấy hoặc logic hệ thống vô hình như permission, workflow, state transition, webhook và retry.

## P0 — Cần quyết định trước khi mở rộng

| ID | Module | Element / flow | Nên chỉnh | Quyết định |
|---|---|---|---|---|
| A01 | Documents & AI | API analyze/draft/approve/delete | Thêm authentication, admin capability, audit và kiểm tra ownership trước khi bật module | Chờ quyết định |
| A02 | Workspace | Firestore rules của tasks/folders/attached docs | Bỏ quyền `authenticated-wide`; giới hạn theo organization membership/capability | Chờ quyết định |
| A03 | Shared Data | `handleFirestoreError` | Không nuốt lỗi; trả typed error để UI biết lưu thất bại | Chờ quyết định |

## P1 — Nền tảng để phát triển hàng loạt module

| ID | Module | Element / flow | Nên chỉnh | Quyết định |
|---|---|---|---|---|
| A04 | PWA | Manifest orientation | Bỏ `portrait-primary`, hỗ trợ iPad landscape | Chờ quyết định |
| A05 | PWA | Service worker cache | Cache bundle build, offline fallback và strategy cho static/API | Chờ quyết định |
| A06 | PWA | Có phiên bản mới | Thêm update banner; bảo vệ form đang sửa trước khi reload | Chờ quyết định |
| A07 | Shared UI | Mất mạng / kết nối lại | Thêm global offline/reconnecting banner và retry rõ ràng | Chờ quyết định |
| A08 | Admin Core | Menu + render module trong AdminDashboard | Chuyển sang module registry/manifest để thêm module không phải sửa file trung tâm | Chờ quyết định |
| A09 | Shared UI | Form/table/modal/toast | Tạo và bắt buộc dùng Admin shared primitives | Chờ quyết định |
| A10 | Shared UI | 106 `alert/confirm` runtime | Thay bằng toast và confirm dialog thống nhất | Chờ quyết định |
| A11 | Testing | `npm test` | Gom payment, class helpers, rules và smoke tests vào pipeline chuẩn | Chờ quyết định |
| A12 | Workspace | Hai workspace service | Chọn một data model canonical; đổi tên hoặc archive mô hình còn lại | Chờ quyết định |

## Theo trải nghiệm thiết bị

| ID | Module | Element / flow | Nên chỉnh | Quyết định |
|---|---|---|---|---|
| A13 | Admin Mobile | iPhone view | Chọn phạm vi: full feature hoặc quick-action/read-focused | Chờ quyết định |
| A14 | Admin Tablet | iPad portrait | Sidebar compact/overlay, responsive columns, detail drawer | Chờ quyết định |
| A15 | Admin Tablet | iPad landscape | Tối ưu 2-pane list/detail, board và calendar | Chờ quyết định |
| A16 | Upload | iPhone/iPad file picker | Test HEIC/JPEG/PDF, camera/library/files, file lớn và mạng gián đoạn | Chờ quyết định |
| A17 | PWA iOS | Cài lên Home Screen | Thêm hướng dẫn cài đặt có điều kiện cho Safari iOS | Chờ quyết định |

## Theo module nghiệp vụ

| ID | Module | Element / flow | Nên chỉnh | Quyết định |
|---|---|---|---|---|
| A18 | Support | Toàn module | Chọn làm module chuẩn đầu tiên, đạt score >=95/100 | Chờ quyết định |
| A19 | Student Management | List/detail/actions | Chuẩn hóa sau Support; responsive và permission tests | Chờ quyết định |
| A20 | Teacher Portal | Route và assigned classes | Chọn triển khai end-to-end hoặc khóa capability tạm thời | Chờ quyết định |
| A21 | Finance | Ledger transaction actions | Tách manual ledger khỏi SePay; dùng reversal thay vì xóa giao dịch liên kết | Chờ quyết định |
| A22 | SePay | Intent -> webhook -> reconciliation | Cố định domain boundary, idempotency và exception review | Chờ quyết định |
| A23 | Class Detail | Class/session/student-session sync | Xác định canonical session identity và invariant tests | Chờ quyết định |
| A24 | Student Portal | Payment access | Chuyển entitlement về server/rules; client flag chỉ rollout UI | Chờ quyết định |
| A25 | Settings | Menu item placeholder | Ẩn production hoặc gắn lifecycle Beta rõ ràng | Chờ quyết định |
| A26 | Workspace | Dashboard/Members/Gantt placeholder | Ẩn hoặc gắn Beta cho đến khi có chức năng thật | Chờ quyết định |

## Format phản hồi nhanh

Ví dụ:

```text
Duyệt: A01, A02, A04, A08, A18
Hoãn: A20, A25, A26
Sửa A13: iPhone chỉ quick actions
Sửa A15: iPad landscape là thiết bị vận hành chính
```
