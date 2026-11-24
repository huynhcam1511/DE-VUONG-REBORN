# Progress Log

Last visited: 2026-11-17T15:36:00Z

- [x] Initialized DISPATCH.md and BRIEFING.md
- [x] Read ORIGINAL_REQUEST.md
- [x] Inspect Excel file "C:\Users\zit\Downloads\cách tôi nhập.xlsx" structure and content (473 rows, 32 columns, Sheet1)
- [x] Reverse-engineer exact formulas and rules:
  - Initial Brokerage Intake Fee: Lương * Tỉ lệ phí nhận lớp (20-25%)
  - Monthly Commission: Phải thu học viên - Lương (e.g. 200k, 300k/month)
  - Corporate VAT Invoices: Base + 10% VAT surcharge -> Intermediary fee 8% of total invoice -> User retains 2% net
  - Quỹ Phí Dư Credit on Non-Start: Ghi có = Fee, Phí dư = +Fee (122 Phí Dư rows analyzed)
  - Quỹ Phí Dư Offset on New Class: Ghi nợ = Fee, Phí dư = -Offset (up to available balance)
  - HOANPHI Withdrawal: Rows 145, 219, 266 with Ghi có = Amount, Phí dư = -Amount (running balance cleared to 0)
- [x] Check webapp data model in De_Vuong_Webapp/ (CRMAdmissionsModule.tsx, AdminLedgerModule.tsx, domain/revenue.ts, types/admin.ts)
- [x] Synthesize findings into handoff.md
- [x] Update BRIEFING.md
- [x] Send completion message
