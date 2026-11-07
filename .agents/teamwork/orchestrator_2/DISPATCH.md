## 2026-11-02T09:32:41Z

You are the Project Orchestrator for the following mission.

Your working directory is:
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\orchestrator_2`

Canonical application directory:
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
(All code changes, tests, builds must run inside `De_Vuong_Webapp/`. Never touch `archives/`).

Read the authoritative user request in:
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically the latest section ## 2026-11-02T09:30:40Z).

User Request Summary & Requirements:
Xây dựng và hoàn thiện cơ chế Đồng bộ liên kết gốc định danh Học viên (LRN / SĐT duy nhất) với các đợt Tuyển sinh (LEA đa đợt) và tự động tính toán bù trừ công nợ, tiến độ thực thu trên Popup VietQR/Phiếu thu và Sổ cái kế toán toàn diện.

- R1. Neo gốc định danh Học viên (LRN / SĐT) trong Tuyển sinh & Popup Thu tiền (`LeadPaymentModal`).
- R2. Tự động liên kết Học phí dự kiến và Bám gốc Công nợ thực tế (`previouslyPaidAmount`, `Tổng học phí - Đã thu`, VietQR amount).
- R3. Đồng bộ hiển thị và Nhận diện trên Sổ cái Kế toán (`AdminLedgerModule`): hiển thị đúng Họ tên thật và mã `LRN`, triệt tiêu hoàn toàn nhãn placeholder chung chung như `Học viên E-learning` hay `---`.
- Strict compliance with `AGENTS.md`.
- Acceptance criteria:
  - Mở Modal Thu tiền cho hồ sơ có học phí dự kiến 6.000đ và đã chuyển khoản trước 3.000đ: Ô 1 hiển thị 6.000đ, thanh tiến độ báo Đã thu 3.000đ / Còn nợ 3.000đ, Ô 2 tự động gợi ý 3.000đ.
  - Mã VietQR sinh ra khớp chính xác với số tiền ở Ô 2.
  - Header Modal hiển thị đầy đủ mã LEA, mã LRN và Tên học viên.
  - Giao dịch chuyển khoản qua mã LEA trên Sổ cái hiển thị rõ Họ tên học viên và mã LRN.
  - Build production (`npm run build`) thành công 100%.
