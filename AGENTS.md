# Canonical Repository Policy

## Editable application

`De_Vuong_Webapp/` is the only canonical, editable web application in this workspace.

All implementation, debugging, builds, tests, dependency changes, Firebase work, and deployment commands must run inside `De_Vuong_Webapp/`.

## Archived snapshots

`archives/` is recovery material and is read-only.

- Never edit files under `archives/`.
- Never run builds, tests, installs, Git operations, or deployment commands from `archives/`.
- Never copy or merge an archived tree wholesale into the canonical application.
- Read an archived file only when the user explicitly requests historical comparison or recovery.
- Any recovery must be applied selectively to `De_Vuong_Webapp/` and reviewed as a normal code change.

If duplicate application files are found, always prefer the path under `De_Vuong_Webapp/` unless the user explicitly says otherwise.
## Admin Module UI Standards

Khi xây dựng hoặc chỉnh sửa các module quản trị (Admin Modules) dạng danh sách/bảng, bắt buộc phải tuân thủ các nguyên tắc thiết kế sau:

1. **Menu Hành động (Toolkit 3 chấm)**:
   - **Tuyệt đối KHÔNG** gắn sự kiện mở chi tiết (onClick) lên toàn bộ dòng (`<tr>`) của bảng, tránh tình trạng click nhầm.
   - Luôn luôn tạo một cột ngoài cùng bên phải dành cho Action Menu, sử dụng icon 3 chấm dọc (`MoreVertical`).
   - Dropdown menu tối thiểu phải bao gồm 4 hành động: **Chỉnh sửa** (BookOpen/Edit2), **Đổi tên** (Pencil - cho phép đổi tên nhanh qua prompt/inline mà không cần mở chi tiết), **Nhân bản** (Copy), và **Xóa** (Trash2).

2. **Cố định tiêu đề bảng (Freeze Panes)**:
   - Các bảng dữ liệu dài bắt buộc phải có tính năng Freeze Pane (chỉ cuộn phần thân bảng, giữ nguyên thanh tiêu đề).
   - Thẻ `<th>` phải sử dụng các class Tailwind: `sticky top-0 z-20 bg-white`.
   - Vùng chứa module (như thẻ bọc ngoài cùng trong `AdminDashboard`) phải được set `h-full min-h-0 overflow-hidden` để thanh cuộn (scrollbar) nằm gọn bên trong bảng thay vì tràn ra ngoài window.

3. **Giao diện bảng gọn gàng**:
   - Chỉ ưu tiên hiển thị các trường quan trọng (Ví dụ: Chương trình, Môn học, Chuyên đề, Tên).
   - Không nhồi nhét nội dung mô tả (description) dài dòng vào trong ô dữ liệu khiến chiều cao dòng bị phình to.

4. **Chuẩn thiết kế CSS / Tailwind cho Bảng (Visuals & Hover)**:
   - **Thẻ `<tr>`**: Bắt buộc dùng hiệu ứng hover với viền trái màu xanh lá (emerald) và đổi màu nền mượt mà. Class chuẩn: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
   - **Căn chỉnh**: Các thẻ `<td>` luôn sử dụng `align-middle` (hoặc `align-top` nếu có nhiều dòng chữ), padding chuẩn là `px-4 py-3`.
   - **Typography**: 
     - Dữ liệu phụ (như phân loại, trạng thái, ngày tháng): Dùng `text-[12px] font-bold text-slate-600` (hoặc `font-medium text-slate-500`).
     - Dữ liệu chính (như Tên giáo trình, Tiêu đề): Dùng `text-[13px] font-medium text-slate-900 group-hover:text-emerald-700` để đổi màu chữ khi hover vào dòng.
   - **Nút 3 chấm (MoreVertical)**: Màu nhạt và đậm lên khi hover. Class chuẩn: `p-1.5 text-slate-400 transition-all hover:text-slate-600 hover:bg-slate-100 rounded-full`.

5. **Thanh công cụ (Search & Filter - Top Bar)**:
   - Các module luôn phải có thanh top bar gồm: một ô tìm kiếm (Search bar) bọc trong thẻ relative với icon kính lúp, và một dropdown lọc (Filter) bên cạnh để phân loại dữ liệu (ví dụ: trạng thái, danh mục), cùng với nút bấm "+ SOẠN/THÊM MỚI".
   - **Đặc biệt lưu ý**: Top Bar phải luôn luôn **CỐ ĐỊNH** trong suốt quá trình người dùng sử dụng (ngay cả khi chui vào xem/sửa chi tiết một item). Tuyệt đối không dùng Portal để ghi đè hoặc làm mất thanh Search/Filter khi đang ở màn chi tiết. Header của màn chi tiết (như nút Back, Tên, Trạng thái) phải nằm bên dưới khu vực Body.

6. **Tính năng Sắp xếp (Sorting ở Header)**:
   - Các cột chứa dữ liệu quan trọng bắt buộc phải có tính năng sắp xếp (Sort). 
   - Thẻ `<th>` của các cột này phải là thẻ click được (`cursor-pointer hover:bg-slate-50`), có kèm icon `ArrowUpDown` để thể hiện trạng thái sắp xếp (Tăng dần/Giảm dần).

7. **Phân loại 2 kiểu Bảng dữ liệu (UX Patterns)**:
   - **Bảng Master-Detail (Ví dụ: Kho lộ trình học)**: Dữ liệu trên bảng chỉ để xem (Read-only). **Bắt buộc** dùng Menu 3 chấm (Toolkit) ở cuối dòng để chứa các nút "Chỉnh sửa" (mở ra màn hình/modal chi tiết), "Đổi tên", "Nhân bản", "Xóa".
   - **Bảng Vận hành / Nhập liệu trực tiếp (Ví dụ: Sơ đồ đào tạo)**: Các ô trong bảng chứa trực tiếp ô nhập liệu (`input`, `select`) để thao tác nhanh như Excel. Ở dạng bảng này, **KHÔNG dùng Menu 3 chấm**, mà đưa trực tiếp các nút thao tác nhanh (như dấu `+` để thêm dòng con, hoặc icon `Trash` để xóa) phơi bày ra ngay cột ngoài cùng bên phải để tiện click luôn.
