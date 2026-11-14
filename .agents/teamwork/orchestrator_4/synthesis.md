# Synthesis: CRM Admissions Fee & Monthly Commission Extension

## 1. Consensus & Architectural Decisions
All 3 Explorers (Data Architecture, UI & Interaction, AGENTS.md Compliance) achieved 100% consensus on the implementation strategy:

- **Target File**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Schema**:
  - `MonthlyCommissionItem`: `{ id?: string; month: number; amount: number | string; note: string; }`
  - `CRMRecord`: Add `classIntakeFee?: number` and `monthlyCommissions?: MonthlyCommissionItem[]`
- **Default State**:
  - Always default to Month 1: `[{ month: 1, amount: 0, note: '' }]`
- **Dynamic Month List Actions**:
  - Add Month: appends `Tháng N+1`
  - Remove Month: removes item and re-indexes remaining months sequentially. If 1 item left, clears inputs rather than leaving array empty.
- **Financial Calculations**:
  - Total Monthly Commission = $\sum \text{amount}$
  - Net Cashflow = Tuition - ClassIntakeFee - TotalMonthlyCommission
  - Live reactive updates on every keystroke.
  - Financial Summary Card Banner in Form View + clean secondary text in Master Table Tuition column.
- **Persistence Across Firestore & LocalState**:
  - Dual Firestore sync: `crm_records` and `customer_profiles` via `setDoc(..., { merge: true })` with `removeUndefinedFields`.
  - Must explicitly map both new fields in `latestCrmDocs` and `latestProfileDocs` listeners, `mergeCRMRecord`, `handleSaveForm`, and `handleDuplicateRecord`.
- **Pre-existing Typo Fixes in CRMAdmissionsModule.tsx**:
  - Add missing `updateDoc` import from `firebase/firestore`.
  - Fix typo `formExpectedStartDate` -> `formStartDate`.
- **AGENTS.md Compliance**:
  - Strict adherence to Rules 1, 2, 3, 4, 11, 13, 14.
  - Plain text typography, no candy badge / pill overload, standard action menu.

## 2. Worker Work Package & File Ownership
- **Exclusive Write Ownership**: `De_Vuong_Webapp/src/components/admin/CRMAdmissionsModule.tsx`
- **Build Target**: `De_Vuong_Webapp/` (`npm run build` & `npm test`)
