## 2026-11-17T15:25:21Z

The user wants to implement the complete accounting & financial workflow based on their actual Excel file ("C:\Users\zit\Downloads\cách tôi nhập.xlsx") and their CRM/Financial dashboard in De_Vuong_Webapp/.

Here is the full context and agreed specifications from the interview:
1. Business Context:
- Editable app root: `De_Vuong_Webapp/` (Follow AGENTS.md strictly: read-only table cells, 3-dots action menu, single-row toolbars, sticky headers, font hierarchy, no pills overload, full-bleed table layout, apiRequests/Firestore persistence).
- Core entities:
  - Initial brokerage intake fee ("Phí nhận lớp ban đầu", e.g., 500k, 440k, 660k): Can be paid via Cash/Bank/MoMo or deducted from an Escrow/Deposit Credit Fund ("Quỹ Phí Dư").
  - Monthly commission fee ("Phí chênh lệch hàng tháng", e.g., 200k, 300k/month): Deducted from tuition when paying the center for ongoing multi-month classes (e.g. LG4729, SG2509).
  - Corporate VAT invoice intermediary fee ("Phí VAT / hợp thức hóa hóa đơn doanh nghiệp"): For B2B classes requiring invoices, tuition is increased by 10% (e.g., 100M -> 110M), and the intermediary center charges 8% (or customizable rate) of total invoice (110M * 8% = 8.8M), user keeps remaining 2%.
  - "Quỹ Phí Dư" (Deposit Credit Fund / Escrow reserve):
    - When a class fails to start ('Non-Start'), initial intake fee deposit is credited to the user's fund at the center (+Phí dư).
    - When taking a new class, user can offset against this fund (-Phí dư) instead of paying cash.
    - When user withdraws cash from the center (represented as 'HOANPHI' in excel), fund balance is cleared (-Phí dư) and actual bank cash increases.

2. Scope of implementation:
- CRM Admissions / Lead Management (`De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`):
  - In class financial & commission section: Option to select Intake Fee payment source: "Tiền mặt / MoMo" vs "Cấn trừ từ Quỹ phí dư" (display real-time available fund balance).
  - Automatic fund crediting when lead/class outcome is set to "Không thành công / Non-Start".
  - Corporate VAT invoice calculation (10% surcharge, 8% intermediary fee, net calculation).
- General Ledger & Cashflow / Finance module (`tab=cashflow` / `tab=general-ledger` or financial journal):
  - Add "Phí dư" column with clear visual indicators (+ for fund credits, - for offsets/withdrawals).
  - Add summary card for Current Available "Quỹ Phí DVR" / "Quỹ Phí Dư" balance.
  - Add quick action: "Tạo lệnh Rút quỹ (HOANPHI)" to withdraw fund back to bank account.
- Persistence with Firebase / backend state.
