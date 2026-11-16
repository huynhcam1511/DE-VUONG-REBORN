# Project: Comprehensive Workspace Module Standardization & Google Tasks Benchmark

## Architecture
- **Application Root**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`
- **Key Modules**:
  - `src/components/workspace/WorkspaceLayout.tsx` (R1: Full-Bleed Canvas, AdminFilterDropdown Toolbar)
  - `src/components/workspace/views/CalendarView.tsx` (R2: getAllTasks for default-workspace, full week grid & All-Day header rendering, full-bleed)
  - `src/components/workspace/views/BoardView.tsx` (R3: Google Tasks benchmark redesign, flat list rows, 18px checkbox, text-[13px] title, smart due chip, + Thêm việc cần làm, internal scrolling, collapsible Đã hoàn thành)
  - `src/components/workspace/views/GanttView.tsx` (R4: Full-bleed canvas, 60px header sync, 1:1 row height sync at 44px)
  - `src/components/workspace/views/TaskView.tsx` (Compatibility: multi-select filter support and internal scrolling)
  - `firebase.json` & `.firebaserc` (R5: Hosting target `huynhkiencam` on `anti-gravity-katc-academy`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Full-Bleed Canvas | Set `main` to `min-h-0 flex-1 overflow-hidden bg-white w-full flex flex-col`, eliminate all `p-2.5 sm:p-4 xl:p-6` | M1 | R1 (Survey 1) |
| 2 | Toolbar AdminFilterDropdown | Replace old modal & native select with 3 `AdminFilterDropdown` (Status, Priority, Due Date) | M1 | R1 (Survey 1) |
| 3 | CalendarView AllTasks Loading | Call `getAllTasks()` when in default-workspace to load all 112 tasks in system | M2 | R2 (Survey 2) |
| 4 | CalendarView Week & All-Day Rendering | Render multi-day & untimed in All-Day header, timed in hour grid, full-bleed container | M2 | R2 (Survey 2) |
| 5 | BoardView Flat Card Redesign | Remove box borders, shadows, and pill overload per AGENTS.md Rule 4 & Google Tasks benchmark | M3 | R3 (Survey 3) |
| 6 | BoardView 18px Circular Checkbox & Plain Title | 18px hollow circular checkbox toggle and plain text `text-[13px] font-medium` title | M3 | R3 (Survey 3) |
| 7 | BoardView Smart Due Date Chip | Rounded-full chip `(🕒 Hôm nay, 12:00)` with soft color styling for today, overdue, upcoming | M3 | R3 (Survey 3) |
| 8 | BoardView Flat Add Button & Column Scroll | Flat text `+ Thêm việc cần làm` at column top, internal column scrolling without window overflow | M3 | R3 (Survey 3) |
| 9 | BoardView Collapsible Completed Section | Group completed tasks under collapsible section with count badge and chevron toggle | M3 | R3 (Survey 3) |
| 10 | GanttView Full-Bleed Canvas | Remove `rounded-xl border shadow-xs` for seamless edge-to-edge canvas | M4 | R4 (Survey 3) |
| 11 | GanttView 1:1 Row & Header Sync | Explicit 60px header height, `h-full` left cells inside 44px rows for strict 1:1 sync | M4 | R4 (Survey 3) |
| 12 | Production Build & Deployment | Run `npm run build` (exit 0) and `firebase deploy --only hosting:huynhkiencam` | M5 | R5 (Survey 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Milestone 1: WorkspaceLayout & Toolbar Standardization | R1 in WorkspaceLayout.tsx & TaskView.tsx | Survey | PLANNED |
| 2 | Milestone 2: CalendarView AllTasks & Full-Bleed Rendering | R2 in CalendarView.tsx | Survey | PLANNED |
| 3 | Milestone 3: BoardView Google Tasks Benchmark Redesign | R3 in BoardView.tsx | Survey | PLANNED |
| 4 | Milestone 4: GanttView Full-Bleed & 1:1 Row Sync | R4 in GanttView.tsx | Survey | PLANNED |
| 5 | Milestone 5: Verification Gate & Production Deploy | R5 Independent reviews, stress testing, audit, build & deploy | M1-M4 | PLANNED |

## Code Layout
- `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx` — Owned by Worker (M1)
- `De_Vuong_Webapp/src/components/workspace/views/TaskView.tsx` — Owned by Worker (M1 compatibility)
- `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` — Owned by Worker (M2)
- `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx` — Owned by Worker (M3)
- `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx` — Owned by Worker (M4)
- `De_Vuong_Webapp/dist/` — Build artifacts for M5
