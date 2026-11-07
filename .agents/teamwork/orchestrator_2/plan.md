# Execution Plan: Student Identity & Multi-Stage Admissions Debt Sync

## 1. Objectives
- R1: Anchor student identity root (`LRN` / unique phone) in CRM Leads and `LeadPaymentModal`.
- R2: Automatically link expected tuition and compute remaining debt (`previouslyPaidAmount`, `Tổng học phí - Đã thu`, VietQR amount).
- R3: Synchronize display and recognition in `AdminLedgerModule` (real student name & `LRN` code, remove generic placeholders like `Học viên E-learning` or `---`).
- Verify production build & strict compliance with `AGENTS.md`.

## 2. Phases & Workflow
- **Phase 0: Survey & Scope Mapping**
  - Dispatch 3 Explorers in parallel:
    - Explorer 1: Investigate CRM Admissions (`CRMAdmissionsModule.tsx`, lead model, user linking, LRN lookup/saving).
    - Explorer 2: Investigate `LeadPaymentModal.tsx` & VietQR generator (tuition fields, debt calculation, previouslyPaidAmount query against ledger).
    - Explorer 3: Investigate `AdminLedgerModule.tsx` & SePay transaction processing / sync logic (matching by LEA/LRN/phone, student name display).
- **Phase 1: Architecture & Decomposition (PROJECT.md)**
  - Synthesize Explorer reports into `PROJECT.md` with Feature Inventory and Interface Contracts.
  - Finalize Milestone breakdown.
- **Phase 2: Implementation (Worker)**
  - Implement R1, R2, R3 changes cleanly in `De_Vuong_Webapp/`.
  - Ensure zero mock/facade code, genuine business logic.
- **Phase 3: Review, Challenge & Forensic Audit**
  - 2 Reviewers independently examine correctness, completeness, and AGENTS.md compliance.
  - 2 Challengers test test cases & stress scenarios (calculations, edge cases, formatting).
  - 1 Forensic Auditor checks for integrity violations.
- **Phase 4: Build Verification & Final Handoff**
  - Verify `npm run build` succeeds cleanly.
  - Report back to parent.
