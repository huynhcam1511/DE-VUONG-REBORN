Chuẩn hóa toàn diện Workspace Module theo AGENTS.md và benchmark Google Tasks (Ảnh 5) trên WorkspaceLayout, CalendarView, BoardView, GanttView, đảm bảo build thành công và triển khai lên Firebase hosting.

Working directory: De_Vuong_Webapp
Integrity mode: development

## Requirements

### R1. Chuẩn hóa WorkspaceLayout (AGENTS.md Quy tắc 12 & 14)
Trong `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`:
- Thiết kế Full-Bleed Canvas: Đổi thẻ `main` thành `min-h-0 flex-1 overflow-hidden bg-white w-full flex flex-col`, loại bỏ toàn bộ padding thừa `p-2.5 sm:p-4 xl:p-6` để các view tệp liền tràn viền với Header.
- Chuẩn bộ lọc Toolbar: Dẹp bỏ hoàn toàn modal Filter cũ có select native chèn màn hình. Tích hợp component `AdminFilterDropdown` chuẩn Linear/Notion lên Toolbar với các tiêu chí: Trạng thái, Mức độ ưu tiên, Hạn chót.

### R2. Sửa lỗi hiển thị dữ liệu CalendarView
Trong `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`:
- Khi `activeNode.id === 'default-workspace'` hoặc `orgId === 'default-workspace'`, gọi `getAllTasks()` thay vì chỉ `getTasksForOrg('default-workspace')` để tải đầy đủ toàn bộ 112 task trên hệ thống.
- Hiển thị đầy đủ task lên lưới tuần và All-Day header.

### R3. Tái thiết kế BoardView chuẩn Google Tasks (Ảnh 5 & AGENTS.md Quy tắc 4)
Trong `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`:
- Tái thiết kế phẳng tuyệt đối: Dẹp bỏ lạm dụng pill card, loại bỏ border hộp thô và shadow của card.
- Thẻ task dạng dòng danh sách phẳng: Checkbox tròn rỗng 18px tinh tế, tiêu đề plain text `text-[13px]` dễ đọc, chip hạn chót bo tròn thanh lịch kiểu Google Tasks `(🕒 Hôm nay, 12:00)` với màu đỏ/xanh nhẹ nhàng.
- Nút '+ Thêm việc cần làm' dạng text phẳng ở đầu cột, hỗ trợ cuộn nội bộ từng cột, và nhóm 'Đã hoàn thành' dạng thu gọn ở cuối cột.

### R4. Chuẩn hóa GanttView tràn viền và đồng bộ dòng
Trong `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`:
- Thiết kế tệp viền Full-bleed tràn viền.
- Đồng bộ chiều cao dòng 1:1 chuẩn mực giữa pane danh sách task bên trái và pane timeline bên phải.

### R5. Kiểm tra Build và Deploy
- Chạy `npm run build` trong `De_Vuong_Webapp` đảm bảo 0 lỗi build/TypeScript/linter.
- Chạy `firebase deploy --only hosting:huynhkiencam` để triển khai thành công lên production.

## Acceptance Criteria

### WorkspaceLayout & Toolbar
- [ ] Thẻ `main` trong `WorkspaceLayout.tsx` sử dụng class `min-h-0 flex-1 overflow-hidden bg-white w-full flex flex-col` và không còn padding thừa `p-2.5 sm:p-4 xl:p-6`.
- [ ] Modal filter cũ bị loại bỏ; `AdminFilterDropdown` xuất hiện trên Toolbar cho Trạng thái, Mức độ ưu tiên và Hạn chót theo đúng AGENTS.md Quy tắc 12.

### CalendarView
- [ ] Với workspace mặc định (`default-workspace`), hàm `getAllTasks()` được gọi và nạp đầy đủ các task hệ thống.
- [ ] Task hiển thị chính xác trên lưới tuần (week grid) và All-Day header.

### BoardView
- [ ] Card công việc không có border hộp nổi, shadow, hoặc pill bao quanh.
- [ ] Mỗi task hiển thị dưới dạng hàng danh sách phẳng với checkbox tròn rỗng 18px, tiêu đề plain text `text-[13px]`, và chip hạn chót bo tròn thanh lịch.
- [ ] Đầu cột có nút '+ Thêm việc cần làm' dạng text phẳng, mỗi cột cuộn nội bộ mượt mà không tràn viewport, và các task hoàn thành nằm trong nhóm 'Đã hoàn thành' có thể thu gọn/mở rộng ở cuối.

### GanttView
- [ ] Giao diện Gantt hiển thị tệp liền full-bleed tràn viền.
- [ ] Chiều cao dòng ở pane bên trái khớp 1:1 với dòng ở pane timeline bên phải.

### Build & Deploy
- [ ] `npm run build` trong thư mục `De_Vuong_Webapp` hoàn thành với exit code 0 và không có lỗi.
- [ ] `firebase deploy --only hosting:huynhkiencam` hoàn thành triển khai production thành công.
