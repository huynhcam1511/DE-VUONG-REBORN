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

1. **Menu Hành động (Toolkit 3 chấm) & Triệt tiêu Click nhầm trên Bảng Master & Detail**:
   - **Tuyệt đối KHÔNG gắn sự kiện mở chi tiết (onClick, thẻ button, thẻ a/underline) lên toàn bộ dòng (`<tr>`) hay bất kỳ ô dữ liệu (`<td>`) nào của bảng (kể cả ô Tên/Tiêu đề bản ghi)**: Tránh tuyệt đối tình trạng click nhầm khi chọn văn bản hoặc xem dữ liệu. Toàn bộ các ô dữ liệu trên bảng Master là **READ-ONLY plain text**.
   - **Cơ chế thao tác DUY NHẤT**: Mọi hành động xem chi tiết, chỉnh sửa, đổi tên, nhân bản, xóa **BẮT BUỘC chỉ được thực hiện thông qua Action Menu 3 chấm (`MoreVertical`)** ở cột ngoài cùng bên phải (áp dụng cho cả bảng Master lẫn bảng danh sách chi tiết Detail View). Tuyệt đối không phơi bày các nút icon trần trụi (`Pencil`, `Trash2`) ở cuối dòng.
   - **Thẻ `<th>` của cột Action Menu BẮT BUỘC để trống, TUYỆT ĐỐI KHÔNG có chữ 'Thao tác' hay 'Hành động'**: Thẻ `<th>` ngoài cùng bên phải của Action Menu luôn để rỗng (`<th className="w-16 px-4 py-3.5 text-right font-medium border-b border-slate-200"></th>`), tránh làm thô ráp và chật chội hàng tiêu đề bảng.
   - Luôn luôn tạo một cột ngoài cùng bên phải dành cho Action Menu, sử dụng icon 3 chấm dọc (`MoreVertical`).
   - Dropdown menu tối thiểu phải bao gồm các hành động phù hợp: **Chỉnh sửa / Chi tiết** (BookOpen/Edit2/Pencil), **Nhân bản** (Copy), và **Xóa** (Trash2).

2. **Cố định tiêu đề bảng (Freeze Panes)**:
   - Các bảng dữ liệu dài bắt buộc phải có tính năng Freeze Pane (chỉ cuộn phần thân bảng, giữ nguyên thanh tiêu đề).
   - Thẻ `<th>` phải sử dụng các class Tailwind: `sticky top-0 z-20 bg-white`.
   - Vùng chứa module (như thẻ bọc ngoài cùng trong `AdminDashboard`) phải được set `h-full min-h-0 overflow-hidden` để thanh cuộn (scrollbar) nằm gọn bên trong bảng thay vì tràn ra ngoài window.

3. **Chuẩn cột Mã định danh ID (Business Record IDs), Ngày tháng & Quy tắc Bám mã (Code-Anchoring)**:
   - **Phân biệt Mã định danh ID nghiệp vụ vs Mã quy ước rườm rà**:
     - Các bảng dữ liệu thương mại & quản trị (CRM Nhu cầu tuyển sinh, Báo giá, Hợp đồng, Giao dịch tài chính, Hồ sơ Doanh nghiệp, Hồ sơ Học viên, Chuyên đề `TPC-XXXXXXXX`, Học liệu `MAT-XXXXXXXX`) **bắt buộc** có cột **Mã ID** (Ví dụ: `Mã hồ sơ`, `Mã BG`, `Mã HĐ`, `Mã DN`, `Mã HV`, `Mã CĐ`, `Mã HL`) hiển thị đầu tiên với phông mono tinh gọn (`font-mono text-xs font-semibold text-slate-700`) dạng chữ thường liền mạch, **tuyệt đối KHÔNG bọc vào pill/badge viền xám** (`bg-*` hay `border-*`) gây rườm rà.
     - **Mã ID trên Header màn hình Chi tiết (Detail View Header)**: Khi mở xem/chỉnh sửa chi tiết bản ghi, Mã ID nghiệp vụ **bắt buộc** hiển thị ngay trên thanh Header cố định của Detail View (cạnh nút "Quay lại danh sách") với định dạng phông mono tinh gọn (`font-mono text-xs font-semibold text-slate-700`), **tuyệt đối KHÔNG bọc trong pill/badge viền xám hay nền màu**.
     - **Quy tắc Bám mã định danh duy nhất (Strict ID / Code-Anchoring)**: Mọi thao tác liên kết dữ liệu giữa các module (ví dụ: Chuyên đề đào tạo $\leftrightarrow$ Thư viện học liệu, Lớp học $\leftrightarrow$ Chuyên đề) **BẮT BUỘC dựa theo Mã ID duy nhất (`materialId`, `materialCode`, `topic.id`)**. Tuyệt đối KHÔNG dùng khớp chuỗi mờ/tìm kiếm từ khóa nới lỏng (`includes()`), tránh tình trạng các từ khóa dùng chung (như "PivotTable", "Word", "Excel") làm lây lan hoặc nhảy nhầm file giữa các chuyên đề khác nhau.
     - Ngược lại, đối với học liệu LMS (Bài tập, Lý thuyết), **không tự tiện bịa mã quy ước rườm rà** (như `LT-EX-01`, `BT-01`) chiếm chỗ trên bảng.
   - Không nhồi nhét nội dung mô tả (description) dài dòng vào trong ô dữ liệu khiến chiều cao dòng bị phình to.

4. **Chuẩn thiết kế CSS / Tailwind cho Bảng (Visuals, Hover & Anti-Pill Overload)**:
   - **Đường viền bảng (Borders)**:
     - **Tuyệt đối KHÔNG dùng đường kẻ dọc cột**: Tuyệt đối không đặt `border-r` hay `border-l` lên bất kỳ thẻ `<th>` hay `<td>` nào, tránh biến giao diện thành ô lưới Excel thô ráp.
     - **Chỉ dùng đường phân cách ngang giữa các dòng**: Đường viền ngang siêu mảnh và thanh lịch được quản lý tập trung trên thẻ `<tr>` bằng class `[&>td]:border-b [&>td]:border-slate-100`. Tuyệt đối không tự ý thêm `border-slate-50` hay `border-b` riêng rẽ lên `<td>` làm lấn át hoặc mất đường viền chuẩn.
   - **Thẻ `<tr>`**: Bắt buộc dùng hiệu ứng hover với viền trái màu xanh lá (emerald) và đổi màu nền mượt mà. Class chuẩn: `group align-middle hover:bg-slate-50 hover:shadow-[inset_4px_0_0_0_#10b981] [&>td]:border-b [&>td]:border-slate-100 transition-colors`.
   - **Căn chỉnh**: Các thẻ `<td>` luôn sử dụng `align-middle` (hoặc `align-top` nếu có nhiều dòng chữ), padding chuẩn là `px-4 py-3.5`.
   - **Quy chuẩn Phông chữ & Phân cấp Thị giác (Typography & Font Hierarchy Scale - Bad vs Good)**:
       - **Headline / Title chính**: `text-2xl` (`24px` / `font-bold`) - dành cho tiêu đề chính, Hero title, Modal Header. Tuyệt đối KHÔNG dùng `26px` đứng sát Subheadline `11px` bé xíu gây gắt gỏng thị giác.
       - **Subheadline / Section Title**: `text-base` (`16px` / `font-semibold`) - dành cho tiêu đề phân đoạn, subtitle.
       - **Body Text**: `text-sm` (`14px` / `font-normal` / `font-medium`) - dành cho văn bản đọc chính, description, input values. Tuyệt đối KHÔNG dùng text `11-12px` làm body text gây đau mắt.
       - **Button Text**: `text-sm` - `text-base` (`14px - 16px` / `font-semibold`) - chữ nút bấm cân bằng hoàn hảo với Body (`14px`), không làm nút phình to `18px` thô kỉnh hoặc tụt xuống `11px`.
       - **Table Data / Meta Info**: `text-xs` (`12px` / `font-medium`) - ô bảng dữ liệu tinh gọn, timestamp, badge chỉ số nhẹ.
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
   - **Bảng Master-Detail (Ví dụ: Kho lộ trình học, Ngân hàng câu hỏi, Báo giá, Hợp đồng)**:
     - Dữ liệu trên bảng thuần túy để tra cứu và xem (Read-only).
     - **Tuyệt đối KHÔNG biến tên mục / tiêu đề thành link bấm được (`button`, `a`, `hover:underline`)**. Tiêu đề hiển thị dạng văn bản chuẩn `text-[13px] font-medium text-slate-900 group-hover:text-emerald-700`.
     - **Bắt buộc** dùng Menu 3 chấm (Toolkit) ở cuối dòng để chứa các nút "Chi tiết / Chỉnh sửa" (mở ra màn hình/modal chi tiết), "Đổi tên", "Nhân bản", "Xóa".
   - **Bảng Vận hành / Nhập liệu trực tiếp (Ví dụ: Chương trình đào tạo)**: Các ô trong bảng chứa trực tiếp ô nhập liệu (`input`, `select`) để thao tác nhanh như Excel. Ở dạng bảng này, **KHÔNG dùng Menu 3 chấm**, mà đưa trực tiếp các nút thao tác nhanh (như dấu `+` để thêm dòng con, hoặc icon `Trash` để xóa) phơi bày ra ngay cột ngoài cùng bên phải để tiện click luôn.

8. **Thanh điều khiển màn hình Chi tiết (Detail View Layout)**:
   - Khi người dùng xem hoặc chỉnh sửa chi tiết một mục (mô hình Master-Detail), thanh điều khiển chi tiết (Nút Quay lại `< ChevronLeft/ArrowLeft`, **Mã định danh ID phông mono không bọc pill**, Tên item, Nút Lưu, Trạng thái lưu) phải nằm ở ngay đầu khu vực nội dung (Body) bên dưới, có đường viền phân cách `border-b border-slate-200 pb-4`.
   - **Mã định danh ID trên Header**: Mã ID bắt buộc hiển thị cạnh nút Quay lại danh sách dưới dạng phông mono tinh gọn (`font-mono text-xs font-semibold text-slate-700`), **tuyệt đối KHÔNG bọc trong pill / badge**.
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

14. **Chuẩn thiết kế Layout Bảng dữ liệu Tệp liền vào Header (Full-Bleed Table Layout Standard)**:
    - **Tuyệt đối KHÔNG bọc Bảng dữ liệu (`<table>`) vào khung thẻ nổi bo góc có khoảng đệm padding (`p-5`, `rounded-xl border shadow-sm`) trên nền xám (`bg-slate-50`)**: Tránh làm rời rạc giao diện, làm thu hẹp diện tích hiển thị cột và biến bảng thành "hộp card trôi nổi".
    - **Layout Tệp liền Chuẩn mực (Edge-to-Edge Full Bleed Layout)**:
      - Khung ngoài cùng của Module sử dụng class: `flex h-full min-h-0 w-full flex-col bg-white overflow-hidden`.
      - Thanh Toolbar Header cố định ghim ở trên: `<header className="sticky top-0 z-30 flex-shrink-0 border-b border-slate-200 bg-white px-5 py-3">`.
      - **Bố cục 1 Hàng Tối Ưu cho Subtabs (Single-Row Subtab Action Bar)**: Khi module có hệ thống Subtabs, các nút bấm hành động (Search, Filter, View toggle, Nút `+ Thêm mới`) **BẮT BUỘC** nằm ở phía bên phải (align right) trên **CÙNG MỘT HÀNG** với các nút chuyển Subtab (`sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 min-h-[48px]`).
      - Vùng chứa Bảng cuộn dữ liệu nằm ngay bên dưới Header **không có margin/padding**: `<div className="flex-1 min-h-0 overflow-auto">`.
15. **Chuẩn thiết kế Thanh Topbar & Căn chỉnh Chuẩn mực Trục dọc (Topbar Single-Row & Baseline Alignment Standard)**:
    - **Nút Menu Sidebar Topbar phải thẳng cột 100% với các icon Menu dưới Sidebar**:
      - Nút toggle ghim sidebar (`Menu`) trên thanh Topbar bắt buộc phải có lề trái `ml-2` (hoặc `pl-5`) sao cho tâm icon nằm ở đúng vị trí `40px` tính từ mép trái màn hình, khớp hoàn hảo 100% theo chiều dọc với các icon menu của Sidebar bên dưới (`sm:w-20`).
    - **Căn chỉnh Tiêu đề & Mã ID trên cùng 1 hàng (Single-Row Text Baseline Alignment)**:
      - Khi hiển thị Tiêu đề chính cùng Mã ID nghiệp vụ (`EXM-...`, `CLS-...`, `MAT-...`) trên cùng 1 hàng ngang của Topbar, **tuyệt đối KHÔNG dùng thẻ `<h1>` block mặc định lồng ghép tự do với thẻ `<span>` inline** (tránh làm lệch đường cơ sở baseline dọc giữa chữ to và chữ nhỏ).
      - **Cấu trúc chuẩn mực**: Bọc tất cả trong một container `<div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">`. Tiêu đề sử dụng thẻ `<span className="font-bold text-slate-900 truncate leading-normal">` hoặc bọc trong `<span className="font-bold text-slate-900 truncate">`, đi kèm các mã ID `font-mono text-xs font-semibold text-slate-700` để bảo đảm 100% toàn bộ ký tự nằm khớp chính xác trên cùng một đường cơ sở ngang (horizontal baseline).

## 16. Phân định kiến trúc cốt lõi phân hệ Đào tạo (Training Architecture Standards)

Bắt buộc tuân thủ ranh giới nghiệp vụ chuẩn mực của 5 modules trên Sidebar Menu Đào tạo, tuyệt đối không được nhầm lẫn:

1. **Chương trình đào tạo (`tab=education-map`) - Master Taxonomy**:
   - **Nơi khai báo danh mục gốc**: Cấu trúc 3 cấp gồm **Lĩnh vực -> Chương trình đào tạo -> Chuyên đề**.
   - Mỗi chuyên đề khai báo: Tên chuyên đề, Nội dung tóm tắt, Học liệu liên kết và Ghi chú phân loại (B2B/B2C).
   - Mục đích: Nơi khai báo để sau này thêm được các môn/ngành mới, phục vụ tra cứu tổng quan, đóng gói B2B (Doanh nghiệp mua cả Chương trình) và bán lẻ B2C (Học viên học theo Chuyên đề lẻ).

2. **Thư viện học liệu (`tab=library`) - Material Repository**:
   - Quản lý học liệu dạng file hoặc link: `theory` (Lý thuyết, Slide) và `exercise` (Bài tập, Case study).
   - Quản lý mã ID `MAT-XXXXXXXX` và phiên bản tự động (`V1.0`, `V1.1`).

3. **Ngân hàng Câu hỏi (`tab=exam-bank`) - Question Pool (`isBank: true`)**:
   - Kho câu hỏi trắc nghiệm & tình huống đơn lẻ theo từng Chuyên đề đào tạo (`QST-XXXXXXXX`).
   - Phân loại độ khó (Dễ / Trung bình / Khó), ngữ cảnh (Lý thuyết / Tình huống), dạng câu hỏi (Single, Multi, Đúng/Sai), AI Question Import.

4. **Bài thi / Bài kiểm tra (`tab=quizzes`) - Exam Assembly (`isBank: false`)**:
   - Lắp ráp các Bộ Đề thi trắc nghiệm hoàn chỉnh (`EXM-XXXXXXXX`) từ Ngân hàng câu hỏi.
   - Cài đặt thời gian làm bài (phút), ngày/giờ thi, điểm đạt (pass score), gán cho các lớp học.

5. **Chuyên đề đào tạo (`tab=courses`) - Course Curriculum Repository**:
   - **Kho học liệu giáo trình thực tế bám theo Chương trình đào tạo**: Tại đây, từng Chuyên đề sẽ được soạn thảo Giáo trình chi tiết (các buổi học mẫu `sessions`, nội dung, đính kèm file Lý thuyết và Bài tập từ Thư viện học liệu theo ID `MAT-XXXXXXXX`).
   - **Tự động Resolve Versioning**: Lấy file phiên bản active mới nhất theo ID.

6. **Lớp học & Lịch học (`tab=classes`, `tab=schedule`) - Class Delivery & Operations**:
   - **Nơi vận hành giảng dạy thực tế của giảng viên cho từng lớp**. Quản lý lịch học theo buổi (Buổi 1, Buổi 2...), điểm danh attendance, lưu video ghi hình buổi học, giao bài tập, tổ chức thi Quiz.
   - **LỚP HỌC CHỈ KẾ THỪA NỘI DUNG, TUYỆT ĐỐI KHÔNG PHẢI NƠI SOẠN ĐỀ HOẶC TẠO HỌC LIỆU MỚI!**
   - **Cơ chế Kế thừa Tự động & Tách bạch Hoàn toàn (Decoupled Operations)**:
     - **Tab Chuyên đề đào tạo LÀM CẢ HAI (Lý thuyết & Bài tập)**: Ở Tầng 2 Chuyên đề đã có sẵn cả cột Lý thuyết và cột Bài tập đi liền với nhau. Khi Lớp học tick chọn Chuyên đề, cả Lý thuyết và Bài tập tự động hiển thị song hành theo từng chuyên đề! Tuyệt đối không cần tách thêm tab "Bài tập" riêng lẻ gây trùng lặp.
     - **Thời khóa biểu**: Thuần túy là lịch học, ngày giờ, Zoom, điểm danh. Tuyệt đối không nhồi nhét bài tập hay đề thi vào đây.
     - **Bài kiểm tra & Đề thi**: Ở Tầng 2 đã tạo sẵn các bộ đề (`EXM-XXXXXXXX`), tại Lớp học chỉ cần **chọn/gõ Mã Đề thi `EXM-XXXXXXXX`** để kích hoạt đợt thi cho lớp.
     - **Bảng điểm**: Thuần túy là nơi tổng hợp điểm số toàn khóa (Chuyên cần, Bài tập, Đề thi, GPA).
   - **Cấu trúc Chuẩn mực 5 Tabs của Màn hình Chi tiết Lớp học (Class Detail)**:
     1. **Chuyên đề đào tạo**: Khung nội dung theo Chương trình & Chuyên đề (Hiển thị song hành file Lý thuyết & Bài tập của từng chuyên đề).
     2. **Thời khóa biểu**: Timeline các buổi học thực tế (ngày giờ, Zoom, GV, điểm danh).
     3. **Học viên**: Danh sách học viên lớp (`LRN-XXXXXXXX`).
     4. **Bài kiểm tra & Đề thi**: Quản lý các đề thi gắn vào lớp theo mã `EXM-XXXXXXXX` & kết quả làm bài.
     5. **Bảng điểm**: Bảng điểm tổng hợp các đầu điểm của học viên (CC, BT, Thi, GPA).
## 17. Xử lý ngày tháng an toàn với Firestore (Safe Firestore Date Parsing)

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

## 18. Nút xóa nhanh trên Ô tìm kiếm Toolbar (Search Clear 'x' Button)

- Mọi ô nhập tìm kiếm trên thanh Toolbar cố định của module quản trị bắt buộc phải có nút xóa `x` (`<X size={12} />`) ở góc phải khi ô tìm kiếm có nội dung (`searchQuery !== ''`).
- Khi click vào nút `x` (`onClick={() => setSearchQuery('')}`), ô tìm kiếm lập tức được xóa trắng về rỗng.
- Ô input phải có padding phải `pr-7` để văn bản không bị đè lên icon `x`.

## 19. Quy ước Biệt đội IT Team 10 Subagents (@IT team) & Mã Tag Danh định

Khi người dùng nhắc đến **`@IT team`** (hoặc `IT team:`), hệ thống Antigravity bắt buộc huy động và điều phối **Biệt đội 10 Subagents chuyên trách** dưới sự chỉ huy của Main Orchestrator. Người dùng cũng có thể tag trực tiếp từng cá nhân bằng mã danh định:

| Mã Tag Subagent | Vị trí chuyên trách | Chuyên môn & Trách nhiệm bắt buộc |
| :--- | :--- | :--- |
| **`@it_architect`** | **Lead Solution Architect** | Gác cổng [SYSTEM_BLUEPRINT_V1.0.md](file:///c:/Users/ADMIN-PC/Documents/ANTIGRAVITY/DE%20VUONG%20REBORN/De_Vuong_Webapp/docs/SYSTEM_BLUEPRINT_V1.0.md) & các quy tắc trong `AGENTS.md`. Thẩm định kiến trúc, không cho phép code lệch chuẩn. |
| **`@it_ba`** | **Senior Business Analyst** | Bóc tách luồng nghiệp vụ kinh doanh & đào tạo (Lead $\to$ Deal $\to$ Báo giá $\to$ Hợp đồng $\to$ Đào tạo), đảm bảo dữ liệu liên thông không bị gãy. |
| **`@it_frontend_ui`** | **Frontend UI Lead** | Dựng giao diện SaaS cao cấp, Freeze Panes header, Toolbar 1 dòng, triệt tiêu Pill Overload, không tự sinh cột mã thừa. |
| **`@it_frontend_ux`** | **Frontend UX & Interaction** | Xử lý kéo thả Kanban, modal, popover, phím tắt, dropdown, tránh layout shift và click nhầm. |
| **`@it_backend_data`** | **Backend Data Architect** | Thiết kế Firestore Schema, Collections, Composite Indexes, đảm bảo toàn vẹn dữ liệu. |
| **`@it_backend_logic`** | **Backend Logic & Rules** | State Machine, Firestore Transactions, Cloud Functions, an toàn `parseFirestoreDate` (Quy tắc 17), lưu DB vĩnh viễn (Quy tắc 13). |
| **`@it_integration`** | **Integration Specialist** | Tích hợp SePay Webhook, Firebase Storage, nhúng bộ tính giá Pricing Simulator, xuất PDF/Excel. |
| **`@it_security`** | **Security & IAM Officer** | Kiểm tra phân quyền RBAC (`authorization.ts`, `firestore.rules`), bảo vệ thông tin cá nhân PII. |
| **`@it_qa`** | **QA & Test Engineer** | Kiểm thử kiểu TypeScript `npm run lint` (`tsc --noEmit`), bắt lỗi logic, kiểm tra dữ liệu biên. |
| **`@it_devops`** | **DevOps & Release Engineer** | Chạy `npm run build`, kiểm soát dung lượng bundle, deploy Firebase Hosting (`https://anti-gravity-katc-academy.web.app`). |

## 20. Chuẩn Topbar hệ thống & Avatar Profile Dropdown (System Topbar & User Menu Standard)

- **Tên & Email đầy đủ**: Hiển thị tên người dùng và email đầy đủ (`whitespace-nowrap`), không dùng `max-w` hay `truncate` làm cắt cụt email trên Topbar.
- **Tuyệt đối KHÔNG bọc viền Pill xám hay viền hộp nổi quanh nút Profile/Cổng**: Nút Profile và Cổng làm việc trên Topbar sử dụng dạng tương tác tinh gọn (`bg-transparent hover:bg-slate-100 rounded-xl`), tuyệt đối không bọc khung viền xám hay ô Pill trắng nổi gây rối mắt.
- **Chuyển đổi Cổng làm việc**: Cung cấp nút chọn nhanh 3 cổng: **Cổng Quản trị (Admin)** (`/admin/dashboard`), **Cổng Giảng viên** (`/teacher-pending`), **Cổng Học viên (Student)** (`/portal`).
- **Popover Profile gọn gàng (Chống lặp Header)**: Khi nhấp vào Avatar, Popover Menu xổ xuống tuyệt đối không lặp lại khối Header (Avatar circle + Tên + Email) khi nút trên Topbar đã phơi bày thông tin này. Popover chỉ chứa lối tắt Chuyển nhanh Cổng và nút **Đăng xuất**.
- **Không chèn thanh Search toàn cục vô nghĩa lên Topbar chung**: Thanh Topbar chung chỉ dành cho các tác vụ điều hướng hệ thống (Ghim sidebar, Chuyển cổng, Profile), không nhét ô `Tìm kiếm nhanh...` dư thừa.

## 21. Chuẩn hóa Menu 3 chấm (Action Toolkit) & Thuật ngữ đối tượng (Action Popovers & Terminology)

- **Tuyệt đối KHÔNG chèn Emoji màu sắc (🔵, 📄, 💼, 📁) hoặc dấu `+` rườm rà vào nhãn Action**: Tên các thao tác trong Menu 3 chấm phải là văn bản thường thanh lịch (ví dụ: *Chỉnh sửa*, *Đổi tên*, *Nhân bản*, *Tạo Nhu cầu CRM*, *Tạo Báo giá Mới*, *Tạo Thương vụ (Deal)*, *Lập Hợp đồng / Chứng từ*, *Xóa vĩnh viễn*), đi kèm SVG icon đơn sắc trung tính (`text-slate-400`).
- **Giao diện Popover 3 chấm bo tròn đều góc**: Popover card phải bo tròn góc mềm mại (`rounded-2xl border border-slate-200/90 shadow-xl p-1.5`). Các dòng bấm bên trong được bo tròn đều `rounded-xl px-2.5 py-2 hover:bg-slate-100/80`, triệt tiêu góc vuông sắc cạnh khi di chuột vào dòng.
- **Đồng bộ 100% Thuật ngữ trong Module**: Các tiêu chí phân loại phải dùng chung một tên gọi duy nhất (ví dụ: `Phân loại đối tác` phải đồng bộ 100% ở Nút Filter Dropdown trên Toolbar, Tiêu đề Cột Bảng và Nhãn ô Form Chi tiết, tuyệt đối không gọi lúc thì *Nhóm đối tác*, lúc thì *Phân loại*, lúc thì *Phân loại đối tác*).

## 22. Chuẩn Cột Ngày tháng (CreatedAt/UpdatedAt) & Trạng thái Hủy (Soft Cancel) vs Xóa vĩnh viễn (Hard Delete)

- **Cột Ngày tạo / Ngày cập nhật (`createdAt` / `updatedAt`)**:
  - Tất cả các bảng quản trị dữ liệu **bắt buộc** phải có cột hiển thị thời gian (`Ngày tạo` hoặc `Ngày cập nhật`) định dạng chuẩn `DD/MM/YYYY` (ví dụ: `27/09/2026`).
  - Xử lý ngày tháng bắt buộc tuân thủ **Quy tắc 17** (`parseFirestoreDate`) để tránh lỗi crash `Invalid Date` trên Firestore objects.
- **Phân định Trạng thái "Đã hủy" (Soft Cancel) & "Xóa vĩnh viễn" (Hard Delete)**:
  - **Trạng thái "Đã hủy"**: Bắt buộc bổ sung tùy chọn **`Đã hủy`** vào danh mục Trạng thái của các module vận hành (CRM, Deal, Báo giá, Hợp đồng). Thao tác này giúp chuyển trạng thái hồ sơ/giao dịch sang nhóm đã hủy (`bg-rose-50 text-rose-700`) để lưu trữ vết lịch sử phục vụ báo cáo và kiểm toán.
  - **Duy trì nút "Xóa vĩnh viễn"**: Menu 3 chấm (Toolkit) vẫn **bắt buộc duy trì hành động "Xóa vĩnh viễn"** (`destructive: true`) kèm modal xác nhận (`AdminConfirm`) để người quản trị xóa cứng dữ liệu thừa/lỗi khỏi Firestore DB khi cần.

## 23. Chuẩn trạng thái Tải dữ liệu Mượt mà (Standardized Skeleton Loading Rows)

- **Ngăn chặn Layout Shift (Chống nhảy khung)**: Mỗi khi chuyển giữa các module tab hoặc nạp bất đồng bộ dữ liệu từ Cloud Firestore/Backend API, tất cả các Bảng quản trị (`table`) bắt buộc phải hiển thị **Trạng thái Skeleton Loading** trong khoảng thời gian chờ (`isLoading === true`).
- **Cấu trúc Dòng Skeleton chuẩn**: Hiển thị từ 5 dòng `<tr>` có hiệu ứng `animate-pulse`, trong đó các ô `<td>` chứa thẻ `<div>` mờ (`h-4 rounded bg-slate-100/80`) mô phỏng độ dài tương ứng của từng cột.
- **Khởi tạo State an toàn**: Khi nạp trang ban đầu (F5), state khởi tạo của Bảng phải sử dụng helper khởi tạo đồng bộ (đã lọc các ID bị xóa trong `localStorage`) để triệt tiêu hoàn toàn hiện tượng chớp nạp lại dữ liệu mẫu (`DEFAULT_SEED`).

## 24. Ưu tiên Full Page View cho các luồng công việc & Nhập liệu (Full Page View Standard - Zero Popup Policy)

- **Tuyệt đối KHÔNG sử dụng Modal Popup nổi** cho các luồng nghiệp vụ chính, các biểu mẫu nhập liệu dài, hoặc các tính năng xử lý dữ liệu lớn (như Import file Excel B2B, Soạn thảo Báo giá, Quản lý Chi tiết Học viên/Doanh nghiệp).
- **Thiết kế chuẩn mực Full Page View (Giữ nguyên Sidebar & Topbar toàn cục)**:
  - Màn hình Full Page View hiển thị tràn khung làm việc chính của module (`h-full min-h-0 w-full flex flex-col bg-slate-50 overflow-hidden`).
  - **Tuyệt đối KHÔNG dùng `fixed inset-0` hay `absolute inset-0 z-50` đè lên làm che mất Sidebar menu và Topbar chung của hệ thống**. Sidebar và Topbar chung phải luôn hiển thị cố định và sẵn sàng tương tác.
  - Thanh điều khiển cố định của Module (Sticky Header): Nút Quay lại danh sách (`<` ChevronLeft / ArrowLeft), Tiêu đề module / Mã ID nghiệp vụ phông mono (`LRN-XXXXXXXX` / `ENT-XXXXXXXX` / `B2B-IMPORT`), và các Nút Hành Động chính (Lưu, Xác nhận Import, Tải mẫu).
  - Trải nghiệm liền mạch, chuyên nghiệp như ứng dụng Desktop/SaaS cao cấp, loại bỏ hoàn toàn các khung Popup/Modal chèn ngang màn hình.
- **Ngoại lệ duy nhất**: Chỉ các Menu Toolkit 3 chấm (Action Dropdown Popover) và Hộp thoại xác nhận thao tác nguy hiểm ngắn (`AdminConfirmModal` - Xóa vĩnh viễn) mới được phép hiển thị dạng Popover/Modal nhỏ.

## 25. Tiêu chuẩn Dữ liệu Vận hành Thực tế & An toàn Mã định danh (Zero Hardcoded Seed Data & Code Immutability)

- **Triệt tiêu hoàn toàn Hardcoded Seed Data đối với dữ liệu thực tế (Zero Mock Fallback)**:
  - **Tuyệt đối KHÔNG** tạo các mảng dữ liệu mẫu chứa tên người, tên công ty, chức danh, sếp hoặc số điện thoại giả định (như `INITIAL_SEED_PARTNERS`, `DEFAULT_CRM_RECORDS`...) nằm lẫn trong file nghiệp vụ (`services/`).
  - Khi collection trên Cloud Firestore hoặc Local trống/đang nạp: Hệ thống **CHỈ** được phép hiển thị **Trạng thái Trống (Empty State)** (`"Chưa có dữ liệu, vui lòng bấm + THÊM MỚI"`), tuyệt đối không tự ý "tạo hộ" dữ liệu mẫu thế chỗ.
- **Cấm tuyệt đối tính năng "Tự động ghi đè lên Database" (`auto-seed on empty`)**:
  - Code frontend chỉ đọc (Read) và ghi (Write) khi người dùng chủ động bấm Lưu hoặc Thêm mới trên giao diện.
  - Tuyệt đối không viết vòng lặp `for (...) await setDoc(...)` chạy tự động ngầm khi thấy database rỗng, tránh nguy cơ ghi đè âm thầm làm ô nhiễm hoặc mất dữ liệu chuẩn của người dùng.
- **Tính Bất Biến của Mã Định Danh Nghiệp Vụ (Code / ID Immutability)**:
  - Mã định danh nghiệp vụ (`ENT-XXXXXXXX`, `LRN-XXXXXXXX`, `EMP-XXXXXXXX`, `BG-XXXXXXXX`, `HD-XXXXXXXX`) là **khóa ngoại liên thông toàn hệ thống** (Doanh nghiệp $\rightarrow$ CRM Leads $\rightarrow$ Báo giá $\rightarrow$ Hợp đồng $\rightarrow$ Thu chi).
  - Một khi bản ghi đã được tạo và cấp mã, **mã đó là bất biến vĩnh viễn**, tuyệt đối không tự ý thay đổi, tái tạo ngẫu nhiên khi F5/reload trang, hoặc sử dụng mã mẫu giả định (như `p-1`, `p-districtk`).
  - Mọi thao tác lưu/cập nhật bắt buộc phải bám chặt theo Mã ID duy nhất này để ngăn chặn triệt để tình trạng ghi đè chéo hoặc làm gãy liên kết dữ liệu giữa các phân hệ.

## 26. Quy trình Đảm bảo Chất lượng Code & Khép vòng Task (IDE Pipeline: Build -> Audit/Test -> Self-Review -> Fix -> Close)

Cấm tuyệt đối thói quen "vừa sửa xong 1 dòng hoặc chạy lệnh build xong là vội vàng báo thành công/xong task" cho người dùng khi chưa tự kiểm thử và tự rà soát toàn bộ vòng đời thực thi. Mọi task chỉnh sửa code BẮT BUỘC phải trải qua đủ 5 bước khép kín trước khi được phép báo cáo hoàn tất:

1. **Bước 1: Implement (Sửa code đúng bản chất)**:
   - Sửa dứt điểm nguyên nhân gốc rễ, không chắp vá tạm bợ hay chỉ chữa cháy cục bộ đúng 1 điểm phát sinh lỗi.
   - Luôn tuân thủ nguyên tắc React Rules of Hooks: Tuyệt đối không đặt `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` sau bất kỳ lệnh `return` hay điều kiện rẽ nhánh nào.

2. **Bước 2: Static Analysis & Full Null-Safety Audit (Rà soát tĩnh an toàn dữ liệu)**:
   - Rà soát toàn bộ file liên quan đến các đối tượng bất đồng bộ (`nullable state` như `data`, `profile`, `examBank`, `sub`... khi chưa fetch xong từ DB/mạng).
   - Bắt buộc kiểm tra chuỗi truy cập an toàn (`?.`), mảng (`Array.isArray()`), và giá trị fallback mặc định (`|| ''`, `|| []`) ở MỌI vị trí trong file, không để sót bất kỳ nhánh nào gây lỗi `null is not an object` hoặc `cannot read property of undefined`.

3. **Bước 3: IDE Build Verification (Kiểm thử Build thực tế)**:
   - Chạy lệnh build chuẩn (`npm run build`) và bắt buộc kiểm tra `exit code === 0` cùng output build sạch lỗi TypeScript / cú pháp.
   - Nếu build cảnh báo lỗi hoặc warning nghiêm trọng, bắt buộc fix ngay trước khi bước sang giai đoạn tiếp theo.

4. **Bước 4: Edge-Case & Cross-Platform Review (Tự đánh giá ca biên & thiết bị)**:
   - Tự đặt mình vào vai người dùng trên các môi trường khác nhau: Máy tính (Chrome/Edge/Firefox), Điện thoại (Safari iOS, Chrome Android), tình trạng mạng chậm (độ trễ Firestore vài trăm ms khi vừa mount trang).
   - Kiểm tra các ca biên: User mới chưa có data, ca thi có mật khẩu vs không mật khẩu, thời điểm chuyển giao khung giờ.

5. **Bước 5: Deploy & Close (Triển khai & Bàn giao)**:
   - Triển khai lên Production / Hosting và commit git đồng bộ cả repository submodule lẫn root.
   - **Chỉ khi và chỉ khi** đã qua đủ 4 bước kiểm thử ở trên và kiểm tra hosting finalize thành công mới được phép thông báo cho người dùng kiểm tra kết quả. Báo cáo phải nêu rõ: Đã fix nguyên nhân gì, đã audit những ca biên nào và kết quả xác thực ra sao.

## 27. Phương Pháp Ma Trận Tìm & Rà Soát Lỗi Toàn Diện: Trục Ngang Đa Dạng x Trục Dọc Tuyến Tính (2-Axis Bug Audit Standard)

Khi nhận báo cáo lỗi hoặc chuẩn bị bàn giao bất kỳ tính năng nào, tuyệt đối không được điều tra hời hợt chỉ ở điểm người dùng bấm. Bắt buộc phải triển khai phương pháp rà soát ma trận 2 trục:

### 1. Trục Ngang (Horizontal Axis) - Đa dạng Từ khóa & Phân hệ Liên đới:
- **Tầng 1 - Từ khóa trực tiếp (Direct keywords)**: Tìm chính xác cụm từ trong thông báo lỗi, tên nút, mã định danh (`EXM-XXXXXXXX`, `Mật khẩu bài kiểm tra`, `evaluating 'title'`, `Minified React error`).
- **Tầng 2 - Từ khóa liên đới ngữ nghĩa (Associated & Semantic keywords)**: Tìm các hàm, biến, helper liên quan mật thiết sinh ra hoặc xử lý dữ liệu đó (`examPassword`, `passcode`, `verifyExamPassword`, `generateHourlyPasscode`, `examSeed`, `assessments`).
- **Tầng 3 - Các module nghiệp vụ liên quan (Cross-module dependencies)**: Dữ liệu được sinh ra ở đâu và tiêu thụ ở đâu? (Ví dụ: Ca thi được cấu hình ở `ClassDetail.tsx` / `ExamBankModule.tsx` $\to$ lưu vào Firestore `classes.assessments` $\to$ đọc ra và kiểm tra tại `ExamTakingPage.tsx` $\to$ ghi nhận điểm vào `quiz_attempts` & sổ điểm lớp `StudentDetail.tsx`). Tất cả các đầu mút này đều phải khớp 100% về cấu trúc dữ liệu và logic.

### 2. Trục Dọc (Vertical Axis) - Tuyến tính Luồng Trải nghiệm Người Dùng (Linear End-to-End UX Journey):
Rà soát từng bước theo đúng hành trình thực tế của người dùng từ đầu đến cuối, không bỏ qua bất kỳ bước trung gian nào:
- **Phía Admin / Giảng viên (Creator Journey)**:
  1. Tạo đề / chọn ngân hàng câu hỏi $\to$ 2. Cài đặt ca thi (thời lượng, số lần làm, ngày giờ mở/đóng, mật khẩu cố định hoặc `AUTO`) $\to$ 3. Bấm Lưu $\to$ 4. Xem lại mã hiển thị trên bảng lớp (icon ổ khóa, nút copy mã) $\to$ 5. Bàn giao mã cho học viên.
- **Phía Học viên (Consumer Journey)**:
  1. Mở link bài thi (URL param: `class`, `exam`) $\to$ 2. Màn hình chờ nạp dữ liệu (kiểm tra null-safety khi mạng trễ) $\to$ 3. Màn hình Chào/Xác thực (kiểm tra quyền vào lớp, điều kiện mở ca) $\to$ 4. Ô nhập mật khẩu (kiểm tra khớp với mã phía Admin đã tạo) $\to$ 5. Bấm "Bắt đầu làm bài" (chuyển step: kiểm tra không crash React hooks, bật toàn màn hình) $\to$ 6. Làm bài (chọn đáp án, đánh dấu câu, đếm ngược đồng hồ, auto-save draft localStorage) $\to$ 7. Nộp bài (ghi điểm vào Firestore, cập nhật trạng thái) $\to$ 8. Xem kết quả / Bảng điểm.

**Nguyên tắc cốt tử**: Khi sửa một mắt xích, BẮT BUỘC phải đi dọc toàn bộ luồng tuyến tính này để đảm bảo mắt xích trước không tạo dữ liệu lệch cho mắt xích sau, và mắt xích sau không bị sập vì dữ liệu chưa kịp tới.

## 28. Chuẩn Mực Kiểm Thử Phần Mềm Chuyên Nghiệp (Professional QA/QC Lifecycle Standard)

Mọi tính năng mới hoặc bản vá lỗi (bug fix) trong toàn bộ dự án bắt buộc phải áp dụng quy trình kiểm thử chất lượng 4 giai đoạn chuẩn quốc tế (chuẩn CO-WELL Tech Academy & ISTQB):

```
Requirement (Tìm điểm thiếu/mơ hồ/rủi ro) ➔ Test Scenario (WHAT - Kịch bản tổng thể) ➔ Test Case (HOW - Tiền điều kiện/Các bước/Data/Kết quả) ➔ QA Execution & Triage (Phân loại Severity & Priority) ➔ Dev Fix ➔ Regression Testing (Kiểm thử hồi quy)
```

### 1. Phân Tích Yêu Cầu (Requirement Analysis) - Không Chỉ Đọc Để Biết Làm:
- Trước khi bắt tay vào code, bắt buộc phải mổ xẻ Requirement để tìm ra 3 yếu tố cốt tử:
  - **Điểm thiếu (Missing points)**: Tính năng này còn thiếu nhánh xử lý nào? (Ví dụ: Ca thi có mật khẩu nhưng nếu học viên bấm F5 tải lại trang thì trạng thái thế nào? Có nhớ bài làm dở không?).
  - **Điểm mơ hồ (Unclear points)**: Các trường hợp biên chưa được định nghĩa rõ ràng (Ví dụ: Mật khẩu `AUTO` đổi theo giờ thì người thi lúc 13:59 nộp bài lúc 14:05 có bị trượt mã không?).
  - **Rủi ro tiềm ẩn (Hidden Risks)**: Tình trạng gián đoạn mạng, Firestore trễ nạp data `null`, khác biệt hành vi giữa trình duyệt Desktop và Safari trên iPhone/iPad.

### 2. Thiết Kế Kịch Bản Kiểm Thử (Test Scenario - WHAT):
- Liệt kê đầy đủ các trường hợp tổng quan cần kiểm thử, bao gồm cả luồng chuẩn (Happy Path) và luồng dị thường/ngoại lệ (Unhappy / Edge Cases):
  - ✅ **Luồng chuẩn**: Nhập đúng dữ liệu, quyền hợp lệ, hoàn tất suôn sẻ.
  - ❌ **Luồng sai dữ liệu**: Sai mật khẩu, trùng mã ID, định dạng không hợp lệ.
  - ⚠️ **Luồng vi phạm/bảo mật**: Rời màn hình bài thi, đổi tab, truy cập lớp khi chưa ghi danh.
  - 🛑 **Luồng rỗng/thiếu dữ liệu**: Chưa nạp xong thông tin, collection rỗng, bỏ trống ô bắt buộc.

### 3. Thiết Kế Ca Kiểm Thử Chi Tiết (Test Case - HOW):
- Mỗi ca kiểm thử phải đảm bảo nguyên tắc: *"Một người khác hoặc AI khác đọc vào là có thể tái hiện chính xác 100%"*:
  - **Pre-condition (Tiền điều kiện)**: Trạng thái hệ thống trước khi test (Đã đăng nhập bằng tài khoản học viên lớp `CLS-00912697`, ca thi đang mở).
  - **Test Steps (Các bước bấm)**: Bấm vào link $\to$ Nhập mã $\to$ Bấm Bắt đầu $\to$ Chọn đáp án câu 1 $\to$ Bấm Nộp bài.
  - **Test Data (Dữ liệu thử)**: Mã đề `EXM-57384793`, passcode `415656`.
  - **Expected Result (Kết quả kỳ vọng)**: Không bị văng màn hình đỏ, câu trả lời được lưu, kết quả hiển thị chính xác.

### 4. Phân Loại Khiếm Khuyết (Defect Triage: Severity vs Priority):
- Khi phát hiện bug, phải phân loại rõ ràng theo 2 chiều:
  - **Severity (Mức độ nghiêm trọng kỹ thuật)**:
    - *Blocker / Critical*: Sập toàn trang, trắng màn hình, văng lỗi React `#310` hoặc `null is not an object` làm gián đoạn toàn bộ bài thi.
    - *Major*: Mất dữ liệu câu trả lời, không lưu được điểm vào Firestore.
    - *Minor / Trivial*: Lệch giao diện CSS, sai chính tả, khoảng cách padding chưa đều.
  - **Priority (Mức độ ưu tiên kinh doanh)**:
    - *P1 (Khẩn cấp)*: Lỗi đang xảy ra ngay trong giờ thi của học viên $\to$ Bắt buộc fix và deploy production ngay lập tức.
    - *P2 (Cao)*: Lỗi ảnh hưởng luồng chính của lớp học tiếp theo.
    - *P3 (Bình thường)*: Cải tiến trải nghiệm và thẩm mỹ.

### 5. Kiểm Thử Hồi Quy Bắt Buộc (Mandatory Regression Testing):
- **Cấm tuyệt đối**: Fix lỗi ở module này làm vỡ hoặc phát sinh lỗi mới ở module khác (Side-effect bugs).
- **Hành động bắt buộc**: Sau khi sửa xong 1 lỗi (ví dụ: sửa mã passcode trong ca thi), bắt buộc phải thực hiện kiểm thử hồi quy (Regression Test) quét lại toàn bộ các module liên quan: Quản lý lớp học (`ClassDetail`), Điểm danh (`Attendance`), Sổ điểm (`Gradebook`), và Trang chủ (`Landing Page`) trước khi đóng task.

## 25. Phân định Nghiệp vụ Tuyển sinh & Bán hàng (Sales & CRM Architecture)

1. **Phân định 4 Luồng Kinh doanh chuẩn mực**:
   - **Đào tạo Doanh nghiệp (B2B)**: Lớp đào tạo In-house cho tổ chức/doanh nghiệp. Luồng: Khảo sát Nhu cầu (TNA) $\rightarrow$ Báo giá B2B $\rightarrow$ Hợp đồng đào tạo $\rightarrow$ Lớp học.
   - **Học viên 1-1 (Trực tiếp)**: Học viên đăng ký học trực tiếp 1-1 (qua Web hoặc Cẩm tự tạo). Cần tư vấn, xếp lịch giáo viên và mở lớp kèm.
   - **Tự mua Web (Video)**: Khách mua gói khóa học tự học qua Video bài giảng trên Landing Page. Tự thanh toán qua VietQR và học tự động trên Student Portal.
   - **Dịch vụ Webapp**: Dự án công nghệ, phần mềm, tool tự động hóa cho doanh nghiệp/cá nhân. Cần Khảo sát yêu cầu $\rightarrow$ Báo giá Webapp $\rightarrow$ Hợp đồng dịch vụ.
2. **Quy tắc Gắn nhãn Phân loại trên Bảng Tuyển sinh (`tab=leads`)**:
   - Cột **Phân loại** hiển thị dạng Plain Text tinh gọn (`text-[12px] font-medium text-slate-700`):
     - `Doanh nghiệp`
     - `Học viên 1-1` / `Tư vấn 1-1 trực tiếp`
     - `Tự mua Web (Video)`
     - `Dịch vụ Webapp`
   - Tuyệt đối không để nhãn mờ ảo chung chung làm lẫn lộn giữa đơn mua video tự động và học viên kèm 1-1 trực tiếp.
3. **Thống nhất Mã định danh ID Nghiệp vụ**:
   - Toàn bộ hồ sơ tuyển sinh (kể cả từ Landing Page mua khóa học) dùng mã duy nhất **`LEA-XXXXXXXX`**, tuyệt đối không tự bịa mã `ORD-` gây phân mảnh dữ liệu.

## 26. Chuẩn Thiết Kế Form Công Khai Phẳng Toàn Diện (Full-Bleed Document Form Standard)

Áp dụng cho các màn hình làm biểu mẫu công khai trực tiếp của học viên / đối tác (như Đánh giá chất lượng đào tạo `PublicQualitySurveyPage.tsx`, Khảo sát TNA, v.v.):

1. **Triết lý Thiết kế Clean Document (Phong cách Tài liệu / Google Forms cao cấp)**:
   - **Tuyệt đối KHÔNG lộng card hộp lồng nhau (`bg-slate-50`, `border rounded-2xl shadow`)**: Triệt tiêu cảm giác nặng nề, bí bách của các "hộp kẹo" lồi lõm xếp chồng lên nhau.
   - **Nền trắng thuần khiết (`bg-white`)**: Khung trang phẳng, thoáng đãng, sang trọng như một tài liệu khảo sát chuyên nghiệp.
   - **Full-Width Mở Rộng Linh Hoạt**: Sử dụng chiều rộng thoải mái `w-full px-4 sm:px-8 md:px-12 lg:px-20` (tràn viền 100%, loại bỏ `max-w-*` gây co cụm ở giữa màn hình lớn), padding chuẩn `py-8 sm:py-12`.

2. **Bố cục 2 Cột Đối Xứng Ngang (Horizontal 2-Column Row Layout)**:
   - **Cột Trái (Nội dung câu hỏi - Chiếm 7 phần)**: Trình bày dạng văn bản thuần `text-xs sm:text-sm text-slate-800 leading-relaxed font-normal`. Số thứ tự bôi đậm nhẹ nhàng (`1., 2., 3.`).
   - **Cột Phải (Thang đo / Lựa chọn - Chiếm 5 phần)**: Căn sát lề phải, thẳng hàng tuyệt đối giữa các dòng.
   - **Đường viền phân cách ngang siêu mảnh**: Quản lý ngăn cách giữa các dòng câu hỏi bằng `divide-y divide-slate-100` kết hợp `py-4 hover:bg-slate-50/50 transition-colors`.

3. **Cơ chế Lựa chọn Chấm Tròn Radio Single Choice (Minimalist Radio Dots)**:
   - Không nhét nút sao to tướng hay đóng khung nút vuông thô cứng.
   - Sử dụng các chấm tròn SVG radio thanh mảnh (`w-5 h-5 rounded-full border`):
     - Khi chưa chọn: `border-slate-300 bg-white group-hover:border-slate-400`.
     - Khi chọn: `border-emerald-600 bg-emerald-600` với tâm tròn màu trắng `w-2 h-2 rounded-full bg-white`.
     - Số điểm mono tinh gọn phía dưới (`text-[11px] font-mono text-slate-400`, khi active chuyển sang `text-emerald-700 font-bold`).

4. **Cơ chế Ẩn Danh Mặc Định & Bảo Mật Danh Tính (Default Anonymous)**:
   - Các khảo sát đánh giá chất lượng (CSI/NPS) **mặc định bật chế độ ẩn danh 100%** để học viên hoàn toàn an tâm và đưa ra nhận xét khách quan nhất.
   - Banner giải thích ẩn danh xanh ngọc nhẹ nhàng (`bg-emerald-50/60 border border-emerald-100 text-emerald-900`) kèm tùy chọn tick box nếu học viên chủ động muốn công khai danh tính.






