# BRIEFING — 2026-11-17T15:35:00Z

## Mission
Investigate "C:\Users\zit\Downloads\cách tôi nhập.xlsx" to extract exact business rules, formulas, and accounting workflows for Quỹ Phí Dư, intake fees, commission, VAT, and map to webapp data model.

## 🔒 My Identity
- Archetype: explorer
- Roles: teamwork_explorer (Excel & Domain Spec Explorer)
- Working directory: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_survey_3\
- Original parent: e1dcf4d0-0a1d-44d3-a061-ad2467493128
- Milestone: Excel & Domain Spec Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze Excel spreadsheet at C:\Users\zit\Downloads\cách tôi nhập.xlsx
- Follow Canonical Repository Policy and Admin Module UI Standards

## Current Parent
- Conversation ID: e1dcf4d0-0a1d-44d3-a061-ad2467493128
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `ORIGINAL_REQUEST.md`
  - `C:\Users\zit\Downloads\cách tôi nhập.xlsx` (Sheet1, A1:AF473, 473 rows, 32 columns)
  - `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
  - `De_Vuong_Webapp/src/components/admin/AdminLedgerModule.tsx`
  - `De_Vuong_Webapp/src/domain/revenue.ts`
  - `De_Vuong_Webapp/src/types/admin.ts`
  - `De_Vuong_Webapp/tests/biz-rev-01.test.ts`
- **Key findings**:
  - 122 rows with `Phí dư` in Excel spreadsheet.
  - Formula: `Phí nhận lớp ban đầu = Lương * Tỉ lệ phí nhận lớp` (20-25%).
  - Formula: `Phí chênh lệch hàng tháng = Phải thu học viên - Lương`.
  - Formula: `Corporate VAT Invoice = Base * 1.10 (10% VAT surcharge)`, intermediary fee = `Invoice * 8%` (e.g. KC006 rows 274, 339), user retains 2% net.
  - Non-Start: Ghi có = Fee, Phí dư = +Fee (credits Quỹ Phí Dư).
  - Offset intake: Ghi nợ = Fee, Phí dư = -Offset (deducts Quỹ Phí Dư).
  - HOANPHI: Rows 145, 219, 266 Ghi có = Amount, Phí dư = -Amount (resets running balance to 0). Total credits 31.35M, debits 30.06M, current available fund = 1.29M.
  - Webapp mapping: `Transaction.surplus` already exists in `admin.ts` but was hardcoded to 0; `CRMAdmissionsModule.tsx` has `classIntakeFee` and `monthlyCommissions` but needs payment source selector ("Tiền mặt / MoMo" vs "Cấn trừ từ Quỹ phí dư") and Non-Start auto-crediting.
- **Unexplored areas**: none (all required items thoroughly analyzed and verified).

## Key Decisions Made
- Reconciled exact mathematical formulas from actual spreadsheet data.
- Structured complete specification and mapping for implementation team.

## Artifact Index
- DISPATCH.md — Incoming task dispatch
- progress.md — Liveness heartbeat
- BRIEFING.md — Working memory
- handoff.md — Final investigation report
