# Admin Portal, PWA, iPhone và iPad — Audit tổng quan & kế hoạch quyết định

Ngày audit: 02/09/2026  
Phạm vi chuẩn: `De_Vuong_Webapp`  
Trạng thái: Báo cáo đánh giá, chưa thực hiện sửa code

## 1. Kết luận điều hành

Hệ thống hiện có phạm vi nghiệp vụ rộng và nhiều chức năng thực tế, nhưng chưa đủ nền tảng để phát triển hàng loạt module mới một cách an toàn. UI có ngôn ngữ thị giác tương đối chung, nhưng component, trạng thái, form, table, modal, permission và workflow chưa được chuẩn hóa xuyên module.

PWA hiện ở mức **có thể cài đặt**, chưa ở mức **hoạt động tin cậy khi mạng yếu/offline**. Student Portal có xử lý mobile và safe-area tốt hơn các vùng khác. Admin Portal có responsive shell cơ bản nhưng nhiều màn hình dữ liệu vẫn mang tư duy desktop, đặc biệt ở iPhone. iPad có thể chạy giao diện desktop/tablet, nhưng manifest đang khóa `portrait-primary`, không phù hợp nhu cầu làm việc landscape.

Khuyến nghị không mở rộng hàng loạt module ngay. Cần hoàn thành một đợt “Foundation & Safety” trước, sau đó chọn một module làm chuẩn, rồi mới nhân rộng.

## 2. Thang ưu tiên

- **P0 — Blocker:** rủi ro bảo mật, sai dữ liệu, sai tiền, cross-user/cross-org access hoặc không thể vận hành an toàn.
- **P1 — Foundation:** không chặn ngay nhưng sẽ khuếch đại chi phí và regression khi thêm nhiều module.
- **P2 — Quality:** cải thiện trải nghiệm, hiệu năng, khả năng bảo trì và độ chuyên nghiệp.
- **P3 — Enhancement:** tiện ích nâng cao, triển khai sau khi nền tảng ổn định.

## 3. Điểm mạnh hiện có

- Có route guard cho Admin và Student Portal.
- Có Firebase Auth, Firestore, Storage và backend Express/Cloud Run rõ vai trò.
- Có staging và emulator workflow, chặn local vô tình dùng Firebase production.
- Có safe-area cho Student Portal và một số bottom-sheet của Workspace.
- Admin shell có sidebar mobile, overlay và header responsive cơ bản.
- Student Portal có bottom navigation dành riêng cho mobile.
- Payment core đã có kiểm thử các tình huống exact amount, duplicate reference, overpayment và timezone.
- Firestore rules có negative tests cơ bản cho hồ sơ học viên.
- `IT_BRAIN.json` đã có contract chuẩn cho module mới.

## 4. Danh sách bottleneck cần quyết định

### A. Bảo mật và phân quyền

#### A1. API AI và chứng từ chưa có ranh giới auth/admin đồng nhất — P0

**Quan sát:** Các route `/api/ai/*` và `/api/documents/*` không thấy gắn `authenticateRequest`/`requireAdminRequest` trực tiếp như nhóm payment intent và submissions.

**Tác động:** Có thể đọc, tạo, duyệt, scan hoặc xóa dữ liệu nhạy cảm ngoài ý định UI. Việc module chứng từ đang tắt không bảo vệ API.

**Quyết định đề xuất:** Bắt buộc audit và thêm auth/admin/domain authorization trước khi bật module chứng từ hoặc dùng AI với dữ liệu thật.

#### A2. Workspace rules rộng hơn UI Admin — P0

**Quan sát:** Một số rules cho `workspace_spaces`, `workspace_folders`, `workspace_lists`, `tasks` cho phép authenticated-wide; `attached_docs` cho phép mọi user đã đăng nhập read/write.

**Tác động:** Học viên có thể truy cập hoặc sửa dữ liệu workspace qua SDK/API dù route UI chỉ dành cho Admin.

**Quyết định đề xuất:** Thiết kế org membership/capability rõ ràng, deny-by-default và bổ sung rules tests cross-org/cross-user.

#### A3. Teacher role chưa thành flow end-to-end — P1

**Quan sát:** `teacher` có capability xem lớp/chấm bài nhưng không có route/home riêng; tests hiện còn ghi nhận teacher chỉ đọc profile bản thân.

**Tác động:** Khó phát triển module giảng viên; dễ xuất hiện quyền nửa vời giữa UI, rules và backend.

**Quyết định cần chọn:**

1. Tạm loại teacher khỏi scope và khóa capability chưa dùng; hoặc
2. Thiết kế Teacher Portal đầy đủ: assigned classes, grading, rules, API và tests.

### B. PWA, iPhone và iPad

#### B1. Service worker chỉ tạo offline fallback hình thức — P1

**Quan sát:** Cache chỉ gồm `/`, manifest và SVG icon. Khi offline, navigation trả về `/`, nhưng bundle JS/CSS/font không được đảm bảo có trong cache.

**Tác động:** App có thể mở màn hình trắng hoặc shell không hoạt động sau khi mất mạng/xóa cache. Không có offline page, cache strategy theo loại tài nguyên hoặc cleanup có kiểm soát theo build hash.

**Quyết định đề xuất:** Dùng Vite PWA/Workbox hoặc service worker có manifest build; cache app shell hashed assets, network-first cho API, cache-first/stale-while-revalidate cho static assets và offline fallback rõ ràng.

#### B2. Không có update lifecycle UX — P1

**Quan sát:** Service worker gọi `skipWaiting()` và `clients.claim()` nhưng UI không báo có bản mới, không xử lý refresh đang có form dở.

**Tác động:** Có thể thay bundle giữa phiên hoặc người dùng tiếp tục trên phiên bản cũ mà không biết; nguy cơ mất form/input khi reload thủ công.

**Quyết định đề xuất:** Có banner “Đã có phiên bản mới”, cho người dùng chủ động refresh; trì hoãn update khi có mutation/form dirty.

#### B3. Manifest khóa `portrait-primary` — P1

**Quan sát:** `orientation: portrait-primary`.

**Tác động:** iPad thường được dùng landscape với bàn phím; khóa portrait làm giảm mạnh khả năng vận hành Admin/Workspace. Board, calendar và bảng tài chính cần chiều ngang.

**Quyết định đề xuất:** Bỏ khóa orientation hoặc dùng `any`. Chỉ cân nhắc portrait cho một surface cụ thể, không áp toàn PWA.

#### B4. Chưa có offline/reconnect model — P1

**Quan sát:** Không thấy listener `online/offline`, offline banner, queued mutation, background sync hoặc retry queue. `handleFirestoreError` log rồi nuốt lỗi.

**Tác động:** Người dùng tưởng đã lưu trong khi write thất bại; đặc biệt nguy hiểm với điểm, bài nộp, thanh toán và công việc.

**Quyết định đề xuất:**

- Hiển thị network/reconnect state toàn app.
- Mutation phải trả lỗi về UI, không chỉ `console.error`.
- Chỉ queue offline cho task/note không nhạy cảm.
- Không queue hoặc optimistic-update payment, role, approval và document delete.

#### B5. iPhone Admin vẫn phụ thuộc bảng rộng — P1

**Quan sát:** Nhiều table có `min-w-[800px]`, `1000px`, `1180px`, `1200px`; Workspace TaskView từ `720px` đến `980px`.

**Tác động:** Trên iPhone, thao tác search/filter/action column khó, phải cuộn ngang nhiều; dễ mất ngữ cảnh hàng.

**Quyết định cần chọn:**

1. Admin trên iPhone chỉ hỗ trợ quick actions/read-only; hoặc
2. Hỗ trợ đầy đủ bằng card/list mobile riêng cho từng module.

Khuyến nghị: chọn phương án 1 cho finance/class configuration phức tạp và phương án 2 cho dashboard, support, learner lookup, attendance và task quick update.

#### B6. iPad breakpoint chưa được thiết kế như một lớp riêng — P1

**Quan sát:** Phần lớn layout chỉ tách mobile/desktop qua `md` hoặc `lg`; chưa có contract cho iPad portrait 768–834px và landscape 1024–1194px.

**Tác động:** iPad portrait có thể nhận desktop table nhưng thiếu chiều ngang; landscape có sidebar và content cạnh tranh không gian.

**Quyết định đề xuất:** Thêm tablet policy:

- iPad portrait: sidebar overlay/compact, table responsive columns, detail bằng drawer full-width hợp lý.
- iPad landscape: sidebar compact, 2-pane cho list/detail, board/calendar được phép landscape.
- Touch target tối thiểu 44×44px cho action chính.

#### B7. Chưa có install/onboarding riêng cho iOS — P2

**Quan sát:** Có meta Apple và apple-touch-icon nhưng không có hướng dẫn “Add to Home Screen”, phát hiện standalone mode hoặc install education.

**Tác động:** Người dùng Safari iPhone/iPad khó biết cách cài PWA; trải nghiệm cài đặt không đo được.

**Quyết định đề xuất:** Thêm hướng dẫn cài đặt có điều kiện cho iOS Safari, không làm phiền người dùng đã cài hoặc đã bỏ qua.

#### B8. Upload file/ảnh trên iOS cần test riêng — P1

**Quan sát:** Có nhiều flow upload bài tập, hình ảnh, chứng từ và crop/background removal; chưa có device test suite. Một số xử lý ảnh chạy client có thể tốn RAM.

**Tác động:** Safari iOS dễ reload tab khi xử lý ảnh lớn; HEIC, camera picker, tên file Unicode và giới hạn memory có thể gây lỗi.

**Quyết định đề xuất:** Test HEIC/JPEG/PDF, camera/photo library/files, file lớn, mạng gián đoạn; ưu tiên resize/compress sớm và chuyển tác vụ nặng về server nếu cần.

#### B9. External Google Fonts không có chiến lược offline/performance — P2

**Quan sát:** `index.html` tải nhiều family/weight từ Google Fonts.

**Tác động:** First load chậm, FOIT/FOUT và offline không đồng nhất; số font tải lớn hơn nhu cầu.

**Quyết định đề xuất:** Giảm family/weight, self-host font cốt lõi, preload có chọn lọc và dùng fallback ổn định.

### C. UI consistency

#### C1. Chưa có bộ Admin primitives được dùng bắt buộc — P1

**Quan sát:** Có `AdminFormPrimitives`, nhưng mỗi module vẫn tự tạo input, table, modal, badge và action style.

**Tác động:** Thêm module càng nhiều càng lệch spacing, validation, loading và accessibility.

**Quyết định đề xuất:** Xây `AdminPageHeader`, `AdminToolbar`, `AdminTable`, `AdminFormField`, `AdminDrawer`, `AdminConfirmDialog`, states và toast; chọn một module làm reference.

#### C2. Native `alert/confirm` được dùng rộng — P1

**Quan sát:** Có khoảng 106 vị trí `alert/confirm/prompt` trong source runtime hiện hành, gồm payment, class, finance, workspace và student portal.

**Tác động:** Không thống nhất UI, khó hiển thị loading/details, accessibility hạn chế, trải nghiệm PWA/iOS kém và dễ confirm nhầm.

**Quyết định đề xuất:** Thay dần bằng shared toast + confirm dialog; destructive action phải nêu đối tượng/hậu quả và có trạng thái submitting.

#### C3. Admin header search chưa phải search thật theo module — P1

**Quan sát:** Header có input “Tìm kiếm nhanh...” nhưng không thấy binding chung với module; nhiều module lại có search riêng.

**Tác động:** UI gây kỳ vọng sai, trùng controls và không có keyboard/search semantics thống nhất.

**Quyết định đề xuất:** Module manifest đăng ký search provider/action; nếu chưa hỗ trợ thì không hiển thị input giả.

#### C4. Typography và microcopy pha Việt–Anh — P2

**Quan sát:** `Connected/Disconnected`, `Student portal`, `Quiz Bank`, `Filter`, `Assignee`, `Finish`, `Gantt View is under construction` xuất hiện xen kẽ.

**Tác động:** Portal thiếu cảm giác sản phẩm thống nhất; trạng thái nghiệp vụ khó hiểu với người dùng không kỹ thuật.

**Quyết định đề xuất:** Tạo glossary và status mapping Việt hóa, giữ thuật ngữ kỹ thuật chỉ ở nơi cần thiết.

#### C5. Accessibility chưa có quality gate thực tế — P1

**Quan sát:** Một số icon button đã có aria-label, nhưng modal/focus trap, native dialogs, touch target nhỏ và color-only state chưa được test hệ thống.

**Tác động:** Keyboard, VoiceOver và người dùng touch gặp khó; có thể không đạt chuẩn tối thiểu.

**Quyết định đề xuất:** Thêm axe/smoke test, focus management cho modal/drawer và kiểm tra VoiceOver trên Safari iOS.

### D. Function và logic

#### D1. Component quá lớn — P1

**Bằng chứng:**

- `ClassDetail.tsx`: khoảng 5.235 dòng.
- `AdminDashboard.tsx`: khoảng 5.135 dòng.
- `StudentPortal.tsx`: khoảng 3.590 dòng.
- `StudentDetail.tsx`: khoảng 3.215 dòng.

**Tác động:** State phụ thuộc chéo, render lại lớn, khó test, khó phân quyền theo action và dễ regression khi nhiều người phát triển song song.

**Quyết định đề xuất:** Không đại refactor một lần. Tách theo vertical slice mỗi khi sửa: page shell → feature section → hook/controller → domain service → tests.

#### D2. Firestore truy cập trực tiếp từ component — P1

**Quan sát:** Ít nhất 10 component import Firestore trực tiếp, song song với service layer.

**Tác động:** Validation, error mapping, pagination, permission expectation và data transformation bị phân tán.

**Quyết định đề xuất:** Mỗi collection/entity có một service owner. Module chỉ gọi query/command theo nghiệp vụ.

#### D3. Hai mô hình Workspace service — P1

**Quan sát:** `workspaceService.ts` quản lý `workspace_tasks/habits/bookmarks`; `workspace.service.ts` quản lý organizations/spaces/folders/tasks/attached_docs.

**Tác động:** Tên gần giống nhưng data model khác, dễ import nhầm và mở rộng trùng.

**Quyết định cần chọn:** Chọn một mô hình canonical; mô hình còn lại đổi tên rõ là legacy/personal workspace hoặc migrate/archive.

#### D4. Error handler nuốt lỗi — P0/P1 tùy flow

**Quan sát:** `handleFirestoreError` chỉ log và không throw/return structured error.

**Tác động:** Caller có thể tiếp tục như đã thành công; UI thiếu feedback, đặc biệt khi offline.

**Quyết định đề xuất:** Trả `Result` chuẩn hoặc throw typed domain error; UI bắt buộc xử lý failure. Với payment/grade/role/document là P0.

#### D5. `any`, console và kiểu dữ liệu lỏng còn nhiều — P2 nhưng khuếch đại P1

**Quan sát:** Khoảng 239 lần `any` và 168 console calls trong source runtime hiện hành sau khi loại backup/history/scratch.

**Tác động:** Mất lợi ích TypeScript, khó refactor schema/workflow và log production dễ chứa thông tin không cần thiết.

**Quyết định đề xuất:** Không chạy chiến dịch xóa cơ học. Đặt rule “không thêm any mới”, chuẩn hóa domain type/error trước ở module đang sửa.

#### D6. Các chức năng placeholder/incomplete nằm trong navigation — P1

**Quan sát:** Settings “đang phát triển”; Workspace Dashboard/Members là placeholder; Gantt under construction; documents code tồn tại nhưng flag tắt.

**Tác động:** Navigation hứa nhiều hơn sản phẩm cung cấp; khó xác định module active/beta.

**Quyết định đề xuất:** Module manifest có lifecycle; chỉ hiện cho eligible beta users hoặc ẩn khỏi navigation production.

### E. Workflow

#### E1. Finance và SePay có ranh giới khái niệm nhưng chưa thành domain boundary rõ — P1

**Quan sát:** AdminDashboard và AdminLedgerModule đều xử lý transaction/goal; ledger/payment logic xuất hiện ở nhiều nơi.

**Tác động:** Dễ xóa/sửa nhầm giao dịch ngân hàng, ghi nhận trùng hoặc khác cách tính dashboard.

**Quyết định đề xuất:**

- SePay: payment intent, bank event, reconciliation, exception review.
- Finance ledger: sổ bất biến/điều chỉnh, manual income/expense, reporting.
- Không xóa bank-linked transaction; dùng reversal/adjustment.

#### E2. Class–session–student session đồng bộ phức tạp — P1

**Quan sát:** Có nhiều helper để preserve attendance/score sau reorder; logic nằm trong file lớp lớn.

**Tác động:** Thay lịch/lộ trình có thể làm lệch attendance, bài tập hoặc điểm giữa class session và student session.

**Quyết định đề xuất:** Định nghĩa canonical session identity, transition/migration rules và invariant tests trước khi mở rộng lịch/lộ trình.

#### E3. Document AI chưa có human-review production contract đầy đủ — P0 khi bật

**Quan sát:** Flow draft/approve/rescan có ý tưởng, nhưng UI disabled và API auth cần audit.

**Tác động:** OCR sai có thể trở thành dữ liệu chính thức hoặc lộ hợp đồng.

**Quyết định đề xuất:** Draft-only, confidence theo field, admin approval, audit, retention/delete policy và PII-safe logs.

#### E4. Payment access ở Student Portal phụ thuộc client feature flag — P1

**Quan sát:** `VITE_ENFORCE_PAYMENT_ACCESS` điều khiển access logic phía portal.

**Tác động:** Client flag không thể là nguồn bảo mật/nghiệp vụ; cấu hình sai môi trường gây mở/khóa nhầm nội dung.

**Quyết định đề xuất:** Server/Firestore quyết định entitlement; client flag chỉ phục vụ rollout UI.

### F. Module architecture và khả năng mở rộng

#### F1. AdminDashboard là module registry thủ công — P1

**Quan sát:** Menu, active tab, render condition, search/header description và shell behavior nằm trong một component.

**Tác động:** Mỗi module mới buộc sửa file trung tâm, tăng merge conflict và coupling.

**Quyết định đề xuất:** Module registry/manifest theo chuẩn trong `IT_BRAIN.json`; shell render module từ registry.

#### F2. Module chưa có lifecycle/owner/quality score thực tế — P1

**Tác động:** Không phân biệt prototype, beta, active và disabled; khó biết module nào sẵn sàng production.

**Quyết định đề xuất:** Chấm scorecard toàn bộ module hiện có, gắn owner và trạng thái. Module dưới 85/100 không được gọi là active production nếu còn blocker.

#### F3. Backup, history và script sửa chữa nằm gần runtime — P2

**Tác động:** Search, audit và AI coding dễ đọc nhầm source cũ; repository nặng và khó review.

**Quyết định đề xuất:** Archive ngoài runtime tree, thêm convention rõ; không xóa trước khi xác minh khả năng phục hồi.

## 5. Khoảng trống kiểm thử

Hiện có bốn file test: payment core, local payment flow, Firestore rules và class detail helpers. Tuy nhiên script `npm test` mặc định chỉ chạy `paymentCore.test.ts`; class helper tests không nằm trong script mặc định.

Các vùng chưa thấy coverage tương xứng:

- PWA install/update/offline/reconnect.
- iPhone/iPad viewport và orientation.
- Admin module render/loading/empty/error.
- Auth redirect và role capability end-to-end.
- Workspace permission cross-org.
- Student Portal submissions/quiz/payment entitlement UI.
- Finance ledger invariants và reversal.
- Document API auth/draft/approval.
- Accessibility và keyboard/focus.

## 6. Kế hoạch tổng quan đề xuất

### Giai đoạn 0 — Quyết định sản phẩm (2–3 buổi)

Chủ dự án quyết định:

1. Admin trên iPhone: full feature hay quick-action/read-only?
2. iPad landscape có phải bề mặt vận hành chính? Khuyến nghị: có.
3. Teacher Portal: triển khai hay tạm loại scope?
4. Workspace nào là canonical?
5. Module documents có đưa vào roadmap gần không?
6. Offline cần đến mức nào: read-only cache hay queued edits?

**Đầu ra:** Device support matrix, role matrix, module lifecycle list.

### Giai đoạn 1 — Foundation & Safety (P0/P1)

- Khóa API AI/documents.
- Siết Workspace/attached_docs rules và tests.
- Chuẩn hóa typed error; ngừng nuốt Firestore error.
- Module registry/manifest.
- Shared Admin states, toast và confirm dialog.
- Network/offline/update banner.
- Bỏ orientation lock.
- Đưa toàn bộ test hiện có vào script CI thống nhất.

**Điều kiện qua gate:** Không còn P0; rules/API negative tests đạt; build/typecheck/test command chuẩn.

### Giai đoạn 2 — PWA & Device Baseline

- Workbox/build asset precache và offline fallback.
- Update lifecycle có bảo vệ form dirty.
- iPhone/iPad responsive policy.
- Device test matrix Safari iOS/iPadOS.
- Upload HEIC/PDF/image/network interruption tests.
- Giảm/self-host font.

**Thiết bị/viewport tối thiểu:**

- iPhone SE: 375×667.
- iPhone 14/15: 390×844.
- iPhone Pro Max: 430×932.
- iPad portrait: 768×1024 và 820×1180.
- iPad landscape: 1024×768 và 1180×820.
- Desktop: 1366×768 và 1440×900.

### Giai đoạn 3 — Reference Admin Module

Chọn **Support** hoặc **Student Management** làm module mẫu; không chọn Finance/ClassDetail đầu tiên vì rủi ro cao.

- Chuyển sang manifest/registry.
- Dùng AdminPageHeader/Toolbar/Table/Form/States.
- Tách service owner và typed errors.
- Thêm permission, workflow và responsive tests.
- Chấm đạt tối thiểu 95/100.

**Đầu ra:** Blueprint có thể copy cấu trúc, không copy logic.

### Giai đoạn 4 — Chuẩn hóa module theo rủi ro

Thứ tự đề xuất:

1. Support.
2. Student Management.
3. Blog/Course Template/Quiz Bank.
4. Workspace sau khi chốt data model và permission.
5. Class/Student Detail.
6. Finance/SePay.
7. Documents/AI sau khi đạt security gate.

Mỗi module chỉ refactor vùng bị chạm, có compatibility layer và regression test.

### Giai đoạn 5 — Mở rộng hàng loạt

Chỉ bắt đầu khi:

- Registry và shared primitives ổn định.
- Có module reference >=95/100.
- CI chạy typecheck, unit, rules, integration và smoke.
- PWA/device baseline đạt.
- Không còn authenticated-wide data access ngoài chủ ý.
- Có template intake cho module mới.

## 7. Các gói quyết định để chủ dự án chọn

### Gói A — An toàn tối thiểu

Phạm vi: P0 security, error propagation, bỏ orientation lock, gom test command.  
Phù hợp khi: cần tiếp tục vận hành nhanh nhưng chưa mở rộng mạnh.  
Rủi ro còn lại: UI/module coupling và mobile debt vẫn cao.

### Gói B — Nền tảng mở rộng (khuyến nghị)

Phạm vi: Giai đoạn 0–3, gồm security, registry, shared UI states, PWA baseline, iPhone/iPad matrix và một reference module.  
Phù hợp khi: chuẩn bị phát triển nhiều module trong các tháng tới.  
Kết quả: Có khuôn chuẩn, quality gate và thiết bị mục tiêu rõ.

### Gói C — Chuẩn hóa toàn portal

Phạm vi: Giai đoạn 0–5, chuẩn hóa dần toàn bộ module hiện hữu trước khi mở rộng lớn.  
Phù hợp khi: ưu tiên chất lượng sản phẩm dài hạn và có ngân sách regression/UAT.  
Rủi ro: thời gian dài hơn; cần chia release nhỏ, không làm big-bang rewrite.

## 8. Danh sách quyết định chờ chủ dự án

| ID | Quyết định | Khuyến nghị |
|---|---|---|
| D1 | Admin trên iPhone hỗ trợ đầy đủ hay quick actions? | Quick actions + read-focused cho flow phức tạp |
| D2 | Cho phép iPad landscape? | Có, bỏ `portrait-primary` |
| D3 | Mức offline | Read cache + explicit retry; chỉ queue task/note an toàn |
| D4 | Teacher Portal | Chốt roadmap hoặc khóa capability tạm thời |
| D5 | Workspace canonical | `organizations/spaces/folders/tasks`; đánh dấu mô hình còn lại rõ vai trò |
| D6 | Documents/AI | Chưa bật trước khi auth, audit và human-review đạt gate |
| D7 | Module mẫu | Support trước, Student Management sau |
| D8 | Gói triển khai | Gói B — Nền tảng mở rộng |

## 9. Bằng chứng mã nguồn chính

- PWA: `public/manifest.webmanifest`, `public/sw.js`, `index.html`, `src/main.tsx`.
- UI/device: `src/index.css`, `src/components/AdminDashboard.tsx`, `src/components/portal/StudentPortal.tsx`, `src/components/workspace`.
- Permission: `src/authorization.ts`, `src/AuthContext.tsx`, `firestore.rules`, `storage.rules`, `server.ts`.
- Data/service: `src/services`, `src/types/admin.ts`.
- Tests: `tests`, `package.json`.

## 10. Giới hạn của audit này

Đây là audit tĩnh trên source/config và cấu trúc test. Chưa chạy UAT trực tiếp trên thiết bị iPhone/iPad thật, chưa đo Lighthouse/Web Vitals và chưa kiểm tra production data/index/log. Các kết luận về UI vật lý cần được xác nhận bằng device pass trong Giai đoạn 2 trước khi đóng trạng thái hoàn thành.
