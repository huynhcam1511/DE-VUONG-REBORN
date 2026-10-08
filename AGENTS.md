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
      - **Chuẩn Typography cho Tiêu đề Bảng (`<th>`)**: Đồng bộ 100% tất cả các bảng dùng class `<tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-500">` và `<th className="sticky top-0 z-20 bg-white px-4 py-3 border-b border-slate-200">`, dán liền ngay dưới đường phân cách của Header, tạo trải nghiệm giao diện SaaS liền mạch, sắc nét và chuyên nghiệp (tương tự `LibraryModule.tsx` & `ClassDetail.tsx`).

## 15. Phân định kiến trúc cốt lõi phân hệ Đào tạo (Training Architecture Standards)

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

## 17. Quy ước Biệt đội IT Team 10 Subagents (@IT team) & Mã Tag Danh định

Khi người dùng nhắc đến **`@IT team`** (hoặc `IT team:`), hệ thống Antigravity bắt buộc huy động và điều phối **Biệt đội 10 Subagents chuyên trách** dưới sự chỉ huy của Main Orchestrator. Người dùng cũng có thể tag trực tiếp từng cá nhân bằng mã danh định:

| Mã Tag Subagent | Vị trí chuyên trách | Chuyên môn & Trách nhiệm bắt buộc |
| :--- | :--- | :--- |
| **`@it_architect`** | **Lead Solution Architect** | Gác cổng [SYSTEM_BLUEPRINT_V1.0.md](file:///c:/Users/ADMIN-PC/Documents/ANTIGRAVITY/DE%20VUONG%20REBORN/De_Vuong_Webapp/docs/SYSTEM_BLUEPRINT_V1.0.md) & 16 quy tắc trong `AGENTS.md`. Thẩm định kiến trúc, không cho phép code lệch chuẩn. |
| **`@it_ba`** | **Senior Business Analyst** | Bóc tách luồng nghiệp vụ kinh doanh & đào tạo (Lead $\to$ Deal $\to$ Báo giá $\to$ Hợp đồng $\to$ Đào tạo), đảm bảo dữ liệu liên thông không bị gãy. |
| **`@it_frontend_ui`** | **Frontend UI Lead** | Dựng giao diện SaaS cao cấp, Freeze Panes header, Toolbar 1 dòng, triệt tiêu Pill Overload, không tự sinh cột mã thừa. |
| **`@it_frontend_ux`** | **Frontend UX & Interaction** | Xử lý kéo thả Kanban, modal, popover, phím tắt, dropdown, tránh layout shift và click nhầm. |
| **`@it_backend_data`** | **Backend Data Architect** | Thiết kế Firestore Schema, Collections, Composite Indexes, đảm bảo toàn vẹn dữ liệu. |
| **`@it_backend_logic`** | **Backend Logic & Rules** | State Machine, Firestore Transactions, Cloud Functions, an toàn `parseFirestoreDate` (Quy tắc 15), lưu DB vĩnh viễn (Quy tắc 13). |
| **`@it_integration`** | **Integration Specialist** | Tích hợp SePay Webhook, Firebase Storage, nhúng bộ tính giá Pricing Simulator, xuất PDF/Excel. |
| **`@it_security`** | **Security & IAM Officer** | Kiểm tra phân quyền RBAC (`authorization.ts`, `firestore.rules`), bảo vệ thông tin cá nhân PII. |
| **`@it_qa`** | **QA & Test Engineer** | Kiểm thử kiểu TypeScript `npm run lint` (`tsc --noEmit`), bắt lỗi logic, kiểm tra dữ liệu biên. |
| **`@it_devops`** | **DevOps & Release Engineer** | Chạy `npm run build`, kiểm soát dung lượng bundle, deploy Firebase Hosting (`https://anti-gravity-katc-academy.web.app`). |

## 18. Chuẩn Topbar hệ thống & Avatar Profile Dropdown (System Topbar & User Menu Standard)

- **Tên & Email đầy đủ**: Hiển thị tên người dùng và email đầy đủ (`whitespace-nowrap`), không dùng `max-w` hay `truncate` làm cắt cụt email trên Topbar.
- **Tuyệt đối KHÔNG bọc viền Pill xám hay viền hộp nổi quanh nút Profile/Cổng**: Nút Profile và Cổng làm việc trên Topbar sử dụng dạng tương tác tinh gọn (`bg-transparent hover:bg-slate-100 rounded-xl`), tuyệt đối không bọc khung viền xám hay ô Pill trắng nổi gây rối mắt.
- **Chuyển đổi Cổng làm việc**: Cung cấp nút chọn nhanh 3 cổng: **Cổng Quản trị (Admin)** (`/admin/dashboard`), **Cổng Giảng viên** (`/teacher-pending`), **Cổng Học viên (Student)** (`/portal`).
- **Popover Profile gọn gàng (Chống lặp Header)**: Khi nhấp vào Avatar, Popover Menu xổ xuống tuyệt đối không lặp lại khối Header (Avatar circle + Tên + Email) khi nút trên Topbar đã phơi bày thông tin này. Popover chỉ chứa lối tắt Chuyển nhanh Cổng và nút **Đăng xuất**.
- **Không chèn thanh Search toàn cục vô nghĩa lên Topbar chung**: Thanh Topbar chung chỉ dành cho các tác vụ điều hướng hệ thống (Ghim sidebar, Chuyển cổng, Profile), không nhét ô `Tìm kiếm nhanh...` dư thừa.

## 19. Chuẩn hóa Menu 3 chấm (Action Toolkit) & Thuật ngữ đối tượng (Action Popovers & Terminology)

- **Tuyệt đối KHÔNG chèn Emoji màu sắc (🔵, 📄, 💼, 📁) hoặc dấu `+` rườm rà vào nhãn Action**: Tên các thao tác trong Menu 3 chấm phải là văn bản thường thanh lịch (ví dụ: *Chỉnh sửa*, *Đổi tên*, *Nhân bản*, *Tạo Nhu cầu CRM*, *Tạo Báo giá Mới*, *Tạo Thương vụ (Deal)*, *Lập Hợp đồng / Chứng từ*, *Xóa vĩnh viễn*), đi kèm SVG icon đơn sắc trung tính (`text-slate-400`).
- **Giao diện Popover 3 chấm bo tròn đều góc**: Popover card phải bo tròn góc mềm mại (`rounded-2xl border border-slate-200/90 shadow-xl p-1.5`). Các dòng bấm bên trong được bo tròn đều `rounded-xl px-2.5 py-2 hover:bg-slate-100/80`, triệt tiêu góc vuông sắc cạnh khi di chuột vào dòng.
- **Đồng bộ 100% Thuật ngữ trong Module**: Các tiêu chí phân loại phải dùng chung một tên gọi duy nhất (ví dụ: `Phân loại đối tác` phải đồng bộ 100% ở Nút Filter Dropdown trên Toolbar, Tiêu đề Cột Bảng và Nhãn ô Form Chi tiết, tuyệt đối không gọi lúc thì *Nhóm đối tác*, lúc thì *Phân loại*, lúc thì *Phân loại đối tác*).

## 20. Chuẩn Cột Ngày tháng (CreatedAt/UpdatedAt) & Trạng thái Hủy (Soft Cancel) vs Xóa vĩnh viễn (Hard Delete)

- **Cột Ngày tạo / Ngày cập nhật (`createdAt` / `updatedAt`)**:
  - Tất cả các bảng quản trị dữ liệu **bắt buộc** phải có cột hiển thị thời gian (`Ngày tạo` hoặc `Ngày cập nhật`) định dạng chuẩn `DD/MM/YYYY` (ví dụ: `27/09/2026`).
  - Xử lý ngày tháng bắt buộc tuân thủ **Quy tắc 15** (`parseFirestoreDate`) để tránh lỗi crash `Invalid Date` trên Firestore objects.
- **Phân định Trạng thái "Đã hủy" (Soft Cancel) & "Xóa vĩnh viễn" (Hard Delete)**:
  - **Trạng thái "Đã hủy"**: Bắt buộc bổ sung tùy chọn **`Đã hủy`** vào danh mục Trạng thái của các module vận hành (CRM, Deal, Báo giá, Hợp đồng). Thao tác này giúp chuyển trạng thái hồ sơ/giao dịch sang nhóm đã hủy (`bg-rose-50 text-rose-700`) để lưu trữ vết lịch sử phục vụ báo cáo và kiểm toán.
  - **Duy trì nút "Xóa vĩnh viễn"**: Menu 3 chấm (Toolkit) vẫn **bắt buộc duy trì hành động "Xóa vĩnh viễn"** (`destructive: true`) kèm modal xác nhận (`AdminConfirm`) để người quản trị xóa cứng dữ liệu thừa/lỗi khỏi Firestore DB khi cần.

## 21. Chuẩn trạng thái Tải dữ liệu Mượt mà (Standardized Skeleton Loading Rows)

- **Ngăn chặn Layout Shift (Chống nhảy khung)**: Mỗi khi chuyển giữa các module tab hoặc nạp bất đồng bộ dữ liệu từ Cloud Firestore/Backend API, tất cả các Bảng quản trị (`table`) bắt buộc phải hiển thị **Trạng thái Skeleton Loading** trong khoảng thời gian chờ (`isLoading === true`).
- **Cấu trúc Dòng Skeleton chuẩn**: Hiển thị từ 5 dòng `<tr>` có hiệu ứng `animate-pulse`, trong đó các ô `<td>` chứa thẻ `<div>` mờ (`h-4 rounded bg-slate-100/80`) mô phỏng độ dài tương ứng của từng cột.
- **Khởi tạo State an toàn**: Khi nạp trang ban đầu (F5), state khởi tạo của Bảng phải sử dụng helper khởi tạo đồng bộ (đã lọc các ID bị xóa trong `localStorage`) để triệt tiêu hoàn toàn hiện tượng chớp nạp lại dữ liệu mẫu (`DEFAULT_SEED`).

## 22. Ưu tiên Full Page View cho các luồng công việc & Nhập liệu (Full Page View Standard - Zero Popup Policy)

- **Tuyệt đối KHÔNG sử dụng Modal Popup nổi** cho các luồng nghiệp vụ chính, các biểu mẫu nhập liệu dài, hoặc các tính năng xử lý dữ liệu lớn (như Import file Excel B2B, Soạn thảo Báo giá, Quản lý Chi tiết Học viên/Doanh nghiệp).
- **Thiết kế chuẩn mực Full Page View (Giữ nguyên Sidebar & Topbar toàn cục)**:
  - Màn hình Full Page View hiển thị tràn khung làm việc chính của module (`h-full min-h-0 w-full flex flex-col bg-slate-50 overflow-hidden`).
  - **Tuyệt đối KHÔNG dùng `fixed inset-0` hay `absolute inset-0 z-50` đè lên làm che mất Sidebar menu và Topbar chung của hệ thống**. Sidebar và Topbar chung phải luôn hiển thị cố định và sẵn sàng tương tác.
  - Thanh điều khiển cố định của Module (Sticky Header): Nút Quay lại danh sách (`<` ChevronLeft / ArrowLeft), Tiêu đề module / Mã ID nghiệp vụ phông mono (`LRN-XXXXXXXX` / `ENT-XXXXXXXX` / `B2B-IMPORT`), và các Nút Hành Động chính (Lưu, Xác nhận Import, Tải mẫu).
  - Trải nghiệm liền mạch, chuyên nghiệp như ứng dụng Desktop/SaaS cao cấp, loại bỏ hoàn toàn các khung Popup/Modal chèn ngang màn hình.
- **Ngoại lệ duy nhất**: Chỉ các Menu Toolkit 3 chấm (Action Dropdown Popover) và Hộp thoại xác nhận thao tác nguy hiểm ngắn (`AdminConfirmModal` - Xóa vĩnh viễn) mới được phép hiển thị dạng Popover/Modal nhỏ.

