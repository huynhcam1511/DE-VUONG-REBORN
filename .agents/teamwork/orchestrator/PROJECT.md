# Project: Workspace Module Comprehensive Upgrade & Board View Polish

## Architecture
- **Canonical Root**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- **Module Under Upgrade**: Workspace (`src/components/workspace/`)
  - `views/BoardView.tsx`: Kanban board view with columns, Google Tasks styling, due date chips, and subtasks.
  - `views/CalendarView.tsx`: Schedule/calendar view for workspace tasks.
  - `views/GanttView.tsx`: Split-view Gantt chart with timeline zoom (Day/Week/Month).
  - `WorkspaceLayout.tsx`: Main workspace shell managing tabs (`list`, `board`, `calendar`, `gantt`), active node, filters, and modals.
  - `WorkspaceModals.tsx`: Task creation and edit dialogs.
  - `services/workspace.service.ts`: Core Task interface, subtasks, and Firestore persistence.
- **Hosting & Build Pipeline**:
  - Vite + React + TypeScript in `De_Vuong_Webapp`
  - Firebase Hosting site target `huynhkiencam` mapped to `anti-gravity-katc-academy`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Board Column SaaS Styling | Columns styled with `rounded-xl`, `p-2.5`, `bg-slate-50/70`, width ~290px-300px | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Board Task Card Refinement | 16px round checkbox, `text-xs font-semibold` title, due date & assignee merged on 1 row | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Calendar Week Timeline Grid | Vertical hour axis 08:00 - 22:00, 7 columns T2 -> CN, task blocks placed by startDate -> dueDate | M2 | ORIGINAL_REQUEST §R2 |
| 4 | Calendar Current Time Indicator | Emerald horizontal line with pulsing dot on Today column reflecting real-time position | M2 | ORIGINAL_REQUEST §R2 |
| 5 | Calendar All-Day Header | Dedicated section at top of calendar for all-day or dateless/timeless tasks | M2 | ORIGINAL_REQUEST §R2 |
| 6 | Calendar View Toggle | Smooth switcher between Week View Timeline and Month View | M2 | ORIGINAL_REQUEST §R2 |
| 7 | Default DateTime Today | New task creation defaults startDate and dueDate to Today with current/standard time | M2 | ORIGINAL_REQUEST §R2 |
| 8 | Gantt Split-View Component | New `GanttView.tsx` with pinned left task table and right horizontal timeline | M3 | ORIGINAL_REQUEST §R3 |
| 9 | Gantt Timeline Progress Bars | Progress bars spanning startDate -> dueDate with progress percent and status styling | M3 | ORIGINAL_REQUEST §R3 |
| 10 | Gantt Zoom Controls | Zoom toggle between Day, Week, and Month scales with 2-tier date header | M3 | ORIGINAL_REQUEST §R3 |
| 11 | Gantt WorkspaceLayout Integration | Wire tab 'gantt' in `WorkspaceLayout.tsx` to render `GanttView` with active node and filters | M3 | ORIGINAL_REQUEST §R3 |
| 12 | TypeScript & Vite Build | Execute `npm run build` in `De_Vuong_Webapp` with 0 errors and exit code 0 | M4 | ORIGINAL_REQUEST §R4 |
| 13 | Firebase Hosting Deployment | Execute `firebase deploy --only hosting:huynhkiencam` and confirm deployment complete | M4 | ORIGINAL_REQUEST §R4 |
| 14 | Column Header Google Tasks Polish | Bỏ uppercase font-bold, dùng text-sm font-semibold text-slate-800, số lượng cùng hàng không lệch | M5 | DISPATCH 2026-11-17 & plan |
| 15 | DueDate Chip Google Tasks Flat | Bỏ nền màu, dùng viền mảnh trong suốt (border-rose-200/80 hoặc border-slate-200/80), chỉ text-rose-600/slate-600 | M5 | DISPATCH 2026-11-17 & plan |
| 16 | Task Title Clear Natural Text | Chữ thường tự nhiên, text-[13.5px] font-normal text-slate-800 rõ nét không mờ | M5 | DISPATCH 2026-11-17 & plan |
| 17 | Subtasks Indented Tree Render | Render subtasks thụt lề dưới task cha (ml-4 pl-2 space-y-1.5 border-l border-slate-100, checkbox tròn nhỏ 14px, text-[12px] text-slate-700) | M5 | DISPATCH 2026-11-17 & plan |
| 18 | M5 Build, Git Commit & Production Deploy | npm run build test, commit Git cả repo con và root, deploy production Firebase Hosting | M5 | DISPATCH 2026-11-17 & plan |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Board View SaaS Polish | `BoardView.tsx` styling, card refinement, test verification | none | DONE |
| 2 | M2: Calendar View Week Timeline & Defaults | `CalendarView.tsx`, `WorkspaceModals.tsx` | none | DONE |
| 3 | M3: Gantt View Creation & Integration | `GanttView.tsx`, `WorkspaceLayout.tsx` | none | DONE |
| 4 | M4: Build Verification & Firebase Deployment | `npm run build`, `firebase deploy --only hosting:huynhkiencam` | M1, M2, M3 | DONE |
| 5 | M5: Board View Google Tasks Polish & Deployment | `BoardView.tsx` (header, dueDate chip, task title, subtasks), build, git commit root & submodule, deploy Firebase Hosting | none | DONE |

## Interface Contracts & Data Structure
### Subtask Interface (`workspace.service.ts` / `BoardView.tsx`)
```typescript
export interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Timestamp;
  assignees?: string[];
}
```

## Code Layout
- `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx` (Owned exclusively by M5 Worker)
