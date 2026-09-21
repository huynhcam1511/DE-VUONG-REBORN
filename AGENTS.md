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

3. **Giao diện bảng gọn gàng & Không sinh cột "Mã phân loại" dư thừa**:
   - Chỉ ưu tiên hiển thị các trường quan trọng (Ví dụ: Chương trình, Môn học, Chuyên đề, Tên).
   - **Tuyệt đối KHÔNG tự sinh và tách riêng cột "Mã / Mã phân loại"**: Không tự tiện bịa ra các mã quy ước rườm rà (như `LT-EX-01`, `BT-01`...) rồi tách riêng thành một cột chiếm chỗ trên bảng. Trong thực tế quản lý đào tạo/LMS, ban đào tạo chỉ quản lý học liệu và bài học theo: Tên tài liệu, Kho (Lý thuyết / Bài tập), Chương trình và Môn học.
   - Không nhồi nhét nội dung mô tả (description) dài dòng vào trong ô dữ liệu khiến chiều cao dòng bị phình to.

4. **Chuẩn thiết kế CSS / Tailwind cho Bảng (Visuals, Hover & Anti-Pill Overload)**:
   - **Đường viền bảng (Borders)**:
     - **Tuyệt đối KHÔNG dùng đường kẻ dọc cột**: Tuyệt đối không đặt `border-r` hay `border-l` lên bất kỳ thẻ `<th>` hay `<td>` nào, tránh biến giao diện thành ô lưới Excel thô ráp.
     - **Chỉ dùng đường phân cách ngang giữa các dòng**: Đường viền ngang siêu mảnh và thanh lịch được quản lý tập trung trên thẻ `<tr>` bằng class `[&>td]:border-b [&>td]:border-slate-100`. Tuyệt đối không tự ý thêm `border-slate-50` hay `border-b` riêng rẽ lên `<td>` làm lấn át hoặc mất đường viền chuẩn.
   - **Thẻ `<tr>`**: Bắt buộc dùng hiệu ứng hover với viền trái màu xanh lá (emerald) và đổi màu nền mượt mà. Class chuẩn: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
   - **Căn chỉnh**: Các thẻ `<td>` luôn sử dụng `align-middle` (hoặc `align-top` nếu có nhiều dòng chữ), padding chuẩn là `px-4 py-3.5`.
   - **Typography & Chống lạm dụng Pill / Màu mè (Anti-Pill Overload)**: 
     - **Tuyệt đối KHÔNG bọc mọi trường vào badge/pill có nền màu (`bg-*`) hay viền (`border-*`) sặc sỡ**: Tránh biến bảng thành "hộp kẹo" lòe loẹt làm mất tính thanh lịch của SaaS cao cấp.
     - **Ưu tiên chữ thường tinh gọn (Plain Text)**:
       - Phân loại, nhóm hồ sơ, kho học liệu, loại hình lớp: hiển thị dạng chữ thường `text-[12px] font-medium text-slate-700` (hoặc `text-slate-600`), đi kèm icon SVG trung tính thanh mảnh (`text-slate-400`).
       - **Danh sách nhiều mục (Multi-item: Khóa học/Lớp đang học, tags)**: Bắt buộc hiển thị dạng văn bản thường cách nhau bằng dấu phẩy (`text-xs font-medium text-slate-700`, ví dụ: `Lớp A, Lớp B`). Tuyệt đối KHÔNG bọc từng phần tử vào khung badge/pill viền xám (`bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500`).
       - **Số lượng (như số câu hỏi đề thi, số học viên)**: Dùng chữ thường tinh gọn (`{count} câu`, `text-xs font-black text-slate-600`) thay vì đóng khung pill.
       - **Tuyệt đối KHÔNG hiển thị nhãn thừa lặp lại**: Không chèn nhãn như `• ĐÃ XÁC THỰC` lặp đi lặp lại ở mọi dòng họ tên khi bảng đã có tab phân loại đối tượng chính thức.
     - **Tên tài liệu / Tiêu đề chính**: Dùng `text-[13px] font-medium text-slate-900 group-hover:text-emerald-700` để đổi màu chữ khi hover vào dòng.
     - **Tệp đính kèm**: Dùng icon SVG thanh mảnh màu trung tính (`text-slate-400` hoặc màu nhẹ theo định dạng), đi kèm tên file hoặc kích thước chữ mờ `text-[11px] text-slate-400`. Tuyệt đối không đóng khung pill có viền màu cho từng loại file.
     - **Phiên bản**: Dùng font-mono chữ thường thanh lịch (`font-mono text-xs font-semibold text-slate-700`), không bọc trong bubble xám `rounded-full bg-slate-100`.
     - **Phạm vi dùng Trạng thái vận hành**: Chỉ hiển thị dạng chấm tròn tinh tế (`•`) kèm chữ thanh lịch (`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700`, chấm tròn `w-1.5 h-1.5 rounded-full bg-emerald-500`) thay vì pill to đùng đóng khung viền.
   - **Nút 3 chấm (MoreVertical)**: Màu nhạt và đậm lên khi hover. Class chuẩn: `p-1.5 text-slate-400 transition-all hover:text-slate-600 hover:bg-slate-100 rounded-full`.

5. **Thanh công cụ của Module (Module Header / Toolbar)**:
   - **Bố cục 1 hàng tinh gọn (Single-Row Layout)**: Toàn bộ công cụ của module (Ô tìm kiếm có nút `x` xóa nhanh, Dropdown bộ lọc `AdminFilterDropdown`, Toggle chuyển chế độ xem, Nút hành động chính như "+ THÊM MỚI", "Biểu mẫu chuẩn") phải nằm gọn gàng trên **cùng một hàng duy nhất** bên trong thẻ `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">` của module.
   - **Tuyệt đối KHÔNG chèn tiêu đề `<h1>` hoặc đoạn văn bản mô tả (`<p>`)**: Tuyệt đối không đưa các thẻ `<h1>` tên module to đùng hoặc đoạn `<p>` chú thích dài dòng vào header module hay topbar toàn cục (`.admin-topbar`), tránh làm phình chiều cao và gây rối mắt. Ưu tiên tối đa diện tích cho thanh công cụ và bảng dữ liệu.
   - **Phân định rõ ràng với Topbar toàn cục**: Không dùng Portal để đẩy các bộ lọc, nút bấm chuyên biệt của module lên thanh Topbar chung của hệ thống (`.admin-topbar`). Thanh Topbar chung chỉ phục vụ tác vụ toàn cục (Ghim sidebar, Tìm kiếm nhanh toàn hệ thống). Header module tự quản lý thanh công cụ cố định (sticky) của riêng nó.
   - **Cố định suốt quá trình sử dụng**: Header thanh công cụ phải luôn luôn **CỐ ĐỊNH** khi cuộn bảng. Khi vào màn chi tiết (detail), header chi tiết (nút Back, Lưu, Tên item) phải nằm bên dưới khu vực Body.

6. **Chuẩn thiết kế Bộ lọc & Sắp xếp (Filters & Sorting Standard)**:
   - **Tuyệt đối KHÔNG đặt icon phễu lọc Excel (`<Filter>`) hay Popup Portal trên tiêu đề cột `<th>`**:
     - Tiêu đề cột `<th>` **CHỈ** dành riêng cho tên cột và sắp xếp trực tiếp (Sort: `handleSort`, `ArrowUpDown`, `ArrowUp`, `ArrowDown`).
     - Tuyệt đối không nhét nút bấm mở popup lọc, dropdown tìm kiếm hay render Portal trôi nổi vào trong `<th>`.
     - **Tất cả các bộ lọc** (Trạng thái, Loại hình, Lớp học, Lộ trình mẫu, Doanh nghiệp...) **BẮT BUỘC** phải nằm trên thanh công cụ Toolbar bằng component chuẩn `AdminFilterDropdown`.
   - **Tối đa 2-3 bộ lọc chính trên Toolbar**: Để giữ bố cục 1 hàng tinh gọn, toolbar chỉ đặt tối đa 2-3 dropdown bộ lọc quan trọng nhất. Thứ tự chuẩn: `[Ô tìm kiếm có 'x']` -> `[Các dropdown bộ lọc AdminFilterDropdown (2-3)]` -> `[Sub-tabs / Chuyển chế độ xem]` -> `[Nút hành động dữ liệu (Tải báo cáo, Thêm mới)]`.
   - **Hiệu ứng trực quan khi Bộ lọc đang kích hoạt (Filter Active State)**:
     - Khi dropdown ở giá trị mặc định (`'all'` hoặc rỗng): Dùng viền nhẹ `border-slate-200 bg-white text-slate-700 font-medium`.
     - Khi người dùng chọn một giá trị lọc cụ thể (`!== 'all'`): Bắt buộc đổi sang nền và viền nhấn để người dùng nhận diện ngay dữ liệu đang bị lọc: `border-emerald-300 bg-emerald-50/50 text-emerald-800 font-semibold`.
   - **Xóa lọc tích hợp trực tiếp (Tuyệt đối KHÔNG tạo nút "Xóa lọc" riêng lẻ)**:
     - **Tuyệt đối KHÔNG tạo thêm nút "Xóa lọc" (`RotateCcw`) đứng riêng lẻ trên thanh Toolbar**: Tránh làm thừa thãi, chiếm diện tích và rối mắt thanh công cụ.
     - Việc xóa lọc được tích hợp trực tiếp: (1) Ô tìm kiếm có nút `x` xóa chữ khi có input, (2) Nút `AdminFilterDropdown` khi kích hoạt tự động hiện icon `x` ở mép phải để xóa lọc tức thì chỉ với 1 click (theo đúng Quy tắc 12).
   - **Tính năng Sắp xếp (Sorting in Table vs Toolbar)**:
     - **Ở dạng Bảng (Table View)**: Tuyệt đối KHÔNG đặt dropdown sắp xếp trên thanh Toolbar làm chật chội và trùng lặp. Bắt buộc tích hợp sắp xếp trực tiếp trên tiêu đề cột `<th>` (`cursor-pointer hover:bg-slate-50`, icon `ArrowUpDown` / `ArrowUp` / `ArrowDown`). Hỗ trợ sắp xếp xoay vòng 3 trạng thái: Mặc định -> Tăng dần (Asc) -> Giảm dần (Desc) -> Mặc định.
     - **Ở dạng Lưới / Thẻ / Thư mục (Grid/Card/Folder View)**: Do không có dòng tiêu đề cột bảng, mới được phép đặt 1 dropdown sắp xếp gọn gàng trên thanh Toolbar.

7. **Phân loại 2 kiểu Bảng dữ liệu (UX Patterns)**:
   - **Bảng Master-Detail (Ví dụ: Kho lộ trình học)**: Dữ liệu trên bảng chỉ để xem (Read-only). **Bắt buộc** dùng Menu 3 chấm (Toolkit) ở cuối dòng để chứa các nút "Chỉnh sửa" (mở ra màn hình/modal chi tiết), "Đổi tên", "Nhân bản", "Xóa".
   - **Bảng Vận hành / Nhập liệu trực tiếp (Ví dụ: Chương trình đào tạo)**: Các ô trong bảng chứa trực tiếp ô nhập liệu (`input`, `select`) để thao tác nhanh như Excel. Ở dạng bảng này, **KHÔNG dùng Menu 3 chấm**, mà đưa trực tiếp các nút thao tác nhanh (như dấu `+` để thêm dòng con, hoặc icon `Trash` để xóa) phơi bày ra ngay cột ngoài cùng bên phải để tiện click luôn.

8. **Thanh điều khiển màn hình Chi tiết (Detail View Layout)**:
   - Khi người dùng xem hoặc chỉnh sửa chi tiết một mục (mô hình Master-Detail), thanh điều khiển chi tiết (Nút Quay lại `< ChevronLeft/ArrowLeft`, Ô nhập tên, Nút Lưu, Trạng thái lưu) phải nằm ở ngay đầu khu vực nội dung (Body) bên dưới, có đường viền phân cách `border-b border-slate-200 pb-4`.
   - Tuyệt đối không đẩy các nút của màn hình chi tiết lên thanh Topbar chung của hệ thống.

9. **Danh sách Module mẫu chuẩn (Benchmarks & Standardized Modules)**:
   - **Module mẫu chuẩn (Design Benchmark)**: `DocumentManagementModule.tsx` (`tab=documents` - Chứng từ & Hợp đồng).
   - **Các Module đã chuẩn hóa đồng bộ**:
     - `DocumentManagementModule.tsx` (`tab=documents`)
     - `CourseTemplatesModule.tsx` (`tab=courses`)
     - `EducationMapModule.tsx` (`tab=education-map` - Chương trình đào tạo)
     - `QuizManagementModule.tsx` (`tab=quizzes`)
     - `AdminDashboard.tsx` (`tab=classes` - Quản lý Lớp học)
     - `AdminDashboard.tsx` (`tab=learners` - Quản lý Học viên)
     - `CRMAdmissionsModule.tsx` (`tab=leads` - Tuyển sinh & Quản lý Nhu cầu học B2C)
     - `PartnerManagementModule.tsx` (`tab=partners` - Hồ sơ Doanh nghiệp B2B)
     - `UserManagementModule.tsx` (`tab=users` - Quản trị Tài khoản & Phân quyền IAM)
   - **Quy tắc bắt buộc cho các module tiếp theo**: Bất kỳ module quản trị nào khác (như `tab=blogs`, `tab=schedule`, v.v.) khi chỉnh sửa hoặc mở rộng đều bắt buộc phải tuân thủ 100% chuẩn giao diện này, tuyệt đối không tự ý thêm `<h1>`, `<p>` mô tả dài dòng, hay portal lên `#top-bar-actions`.

10. **Ẩn hoàn toàn thanh cuộn ở Sidebar (Hidden Scrollbar)**:
    - Danh sách menu ở Sidebar (`<nav>`) bắt buộc phải ẩn hoàn toàn thanh cuộn dọc (dùng utility `.no-scrollbar` cùng các class: `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`).
    - Tuyệt đối không để lộ thanh cuộn xám của trình duyệt chèn vào khoảng trống giữa sidebar và khung nội dung chính, giúp menu trông gọn gàng, liền mạch mà vẫn cuộn mượt mà khi màn hình thấp.

11. **Chuẩn thiết kế Dropdown / Select (Khoảng cách mũi tên & Tránh cấn viền)**:
    - **Bản chất kỹ thuật của Native Select**: Thẻ `<select>` mặc định của trình duyệt (Chrome/Edge trên Windows) luôn ghim cứng icon mũi tên mặc định ở sát mép phải (~4-6px). Thuộc tính `pr-8` hay `padding-right` chỉ ngăn chữ không đè lên mũi tên, chứ **hoàn toàn không thể dịch chuyển vị trí mũi tên mặc định của trình duyệt vào trong**.
    - **Giải pháp chuẩn hóa bắt buộc (Custom Chevron Pattern)**:
      - Bọc thẻ `<select>` bên trong một container `relative inline-flex items-center`.
      - Thẻ `<select>` bắt buộc dùng class `appearance-none pl-3 pr-8 ...` để **triệt tiêu hoàn toàn mũi tên mặc định thô kệch và dính viền của trình duyệt**.
      - Đặt icon SVG Lucide `<ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />` ở sau `<select>`.
      - **Hiệu quả**: Mũi tên luôn có khoảng thở an toàn chuẩn mực cách lề phải 10px (`right-2.5`), đồng bộ 100% hình thức sắc nét và thanh lịch trên mọi trình duyệt/hệ điều hành.
      - **Phạm vi áp dụng**: Chỉ áp dụng cho các ô nhập liệu dạng Form (Modal, Bảng nhập liệu trực tiếp). Đối với các bộ lọc trên Toolbar, bắt buộc áp dụng Quy tắc 12 bên dưới.

12. **Chuẩn thiết kế Custom Filter Dropdown trên Toolbar (Notion/Linear Popover Style)**:
    - **Tuyệt đối KHÔNG dùng Native `<select>` cho bộ lọc trên Toolbar**: Native `<select>` của trình duyệt mở ra popup vuông thô, không bo góc, lộ thanh cuộn xám và làm giật độ rộng (layout shift) khi chọn text dài. Bắt buộc sử dụng component chuẩn `AdminFilterDropdown`.
    - **Tên nút bộ lọc luôn CỐ ĐỊNH (Fixed Width / Fixed Label)**: Nút filter luôn hiển thị tên tiêu chí (Ví dụ: `Nguồn khách`, `Trạng thái`, `Hình thức`, `Lớp học`, `Doanh nghiệp`). Tuyệt đối không thay thế nhãn nút bằng giá trị được chọn $\to$ giúp các nút filter vừa khít và độ rộng luôn đứng yên 100%.
    - **Bỏ icon mũi tên (`ChevronDown`) & Tích hợp nút `x` xóa nhanh**:
      - Khi chưa kích hoạt: Nút hiển thị nhãn thanh lịch, viền `border-slate-200 bg-white text-slate-700 hover:bg-slate-50`, không có icon mũi tên thừa thãi.
      - Khi đã kích hoạt (chọn $\ge 1$ mục): Nút tự động chuyển sang nền xanh `border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold shadow-xs` và hiển thị icon `x` (`X` size 12) ở mép phải. Khi click vào `x` (`e.stopPropagation()`), filter được xóa ngay về mặc định mà không mở popover.
    - **Menu Popover dạng Card bo tròn (Rounded Card Popover)**:
      - Khung menu nổi: Thẻ `<div>` tuyệt đối bo tròn góc mềm mại `rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 min-w-[200px] z-50`.
      - Danh sách cuộn ẩn scrollbar: `max-h-60 overflow-y-auto` kết hợp `.no-scrollbar` (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`).
      - Hỗ trợ chọn nhiều (Multi-Select) với ô checkbox bo tròn, hover đổi màu nhẹ nhàng.
      - Tự động đóng khi click ra ngoài (Click Outside).

13. **Lưu dữ liệu qua API (Không chỉ sửa giao diện Local State)**:
    - Khi làm các tính năng thay đổi dữ liệu (Thêm, Sửa, Xóa, Đổi trạng thái, Nhân bản...), **bắt buộc** phải gọi API backend (ví dụ: `apiRequests`) hoặc Firebase (ví dụ: `setDoc`, `updateDoc`) để lưu dữ liệu vĩnh viễn vào cơ sở dữ liệu (Firestore).
    - **Tuyệt đối KHÔNG** chỉ cập nhật state trên giao diện (React `useState`, `setDocuments`...) rồi để đó, vì dữ liệu sẽ bị mất khi người dùng tải lại trang (F5).
    - Luôn kiểm tra xem module/page có cần API call chưa và bổ sung nếu thiếu.

## 14. Phân định kiến trúc cốt lõi phân hệ Đào tạo (Training Architecture Standards)

Bắt buộc tuân thủ ranh giới nghiệp vụ giữa 3 module trong phân hệ Đào tạo, tuyệt đối không được nhầm lẫn:

1. **Sơ đồ đào tạo (`tab=education-map`) - Master Taxonomy**:
   - **Nơi khai báo danh mục gốc**: Cấu trúc 3 cấp gồm **Lĩnh vực -> Chương trình đào tạo -> Chuyên đề**.
   - Mỗi chuyên đề khai báo: Tên chuyên đề, Nội dung đào tạo tóm tắt (viết trọn vẹn 1 dòng theo chuyên đề, không chia nhỏ Chương 01, 02), Học liệu liên kết (ví dụ) và Ghi chú phân loại (B2B/B2C).
   - Mục đích: Nơi khai báo để sau này thêm được các môn/ngành mới, phục vụ tra cứu tổng quan, đóng gói B2B (Doanh nghiệp mua cả Chương trình) và bán lẻ B2C (Học viên học theo Chuyên đề lẻ).

2. **Giáo trình đào tạo (`tab=courses`) - Course Curriculum Repository**:
   - **Kho học liệu giáo trình thực tế bám theo Sơ đồ đào tạo**: Tại đây, từng Chuyên đề sẽ được **đính thêm cả giáo trình thực tế vào** (gồm các Module/Chủ đề bài học, Nội dung chi tiết, file/link Giáo trình lý thuyết và Bài tập thực tế).
   - **TUYỆT ĐỐI KHÔNG CÓ**: Soạn từng buổi học (Buổi 1, Buổi 2...), đính kèm slide bài giảng, video ghi hình, bài tập và bài kiểm tra (Quiz) để giảng viên đứng lớp giảng dạy.

3. **Lớp học & Lịch học (`tab=classes`, `tab=schedule`) - Class Delivery & Operations**:
   - **Nơi vận hành giảng dạy thực tế của giảng viên cho từng lớp**: Quản lý lịch học theo buổi (Buổi 1, Buổi 2...), điểm danh attendance, lưu video ghi hình buổi học, giao bài tập, tổ chức thi Quiz và theo dõi tiến độ điểm số của học viên.

## 15. Xử lý ngày tháng an toàn với Firestore (Safe Firestore Date Parsing)

Trong Firestore, các trường thời gian (`createdAt`, `updatedAt`, `lastLogin`, v.v.) thường được lưu dưới dạng đối tượng Firestore `Timestamp` (`{ seconds, nanoseconds }` hoặc có hàm `.toDate()`), chuỗi ISO hoặc JavaScript `Date`.

- **Tuyệt đối KHÔNG** gọi trực tiếp `new Date(item.updatedAt).toLocaleDateString()` hay `format(new Date(item.updatedAt))`. Nếu đối tượng là Firestore Timestamp object, `new Date(obj)` sẽ sinh ra `Invalid Date` dẫn tới hiển thị lỗi `NaN/NaN/NaN` hoặc gây crash giao diện.
- **Quy chuẩn bắt buộc**: Luôn sử dụng hàm parser an toàn (như `parseFirestoreDate(val)`):
  ```typescript
  export const parseFirestoreDate = (dateVal: any): Date | null => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
    if (typeof dateVal?.toDate === 'function') {
      const d = dateVal.toDate();
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof dateVal?.seconds === 'number') {
      const d = new Date(dateVal.seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
    const parsed = new Date(dateVal);
    return isNaN(parsed.getTime()) ? null : parsed;
  };
  ```

## 16. Nút xóa nhanh trên Ô tìm kiếm Toolbar (Search Clear 'x' Button)

- Mọi ô nhập tìm kiếm trên thanh Toolbar cố định của module quản trị bắt buộc phải có nút xóa `x` (`<X size={12} />`) ở góc phải khi ô tìm kiếm có nội dung (`searchQuery !== ''`).
- Khi click vào nút `x` (`onClick={() => setSearchQuery('')}`), ô tìm kiếm lập tức được xóa trắng về rỗng.
- Ô input phải có padding phải `pr-7` để văn bản không bị đè lên icon `x`.

