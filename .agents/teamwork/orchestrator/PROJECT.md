# Project: Workspace Module Comprehensive Upgrade & Deployment

## Architecture
- **Canonical Root**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp/`
- **Module Under Upgrade**: Workspace (`src/components/workspace/`)
  - `views/BoardView.tsx`: Kanban board view with columns and drag-and-drop task cards.
  - `views/CalendarView.tsx`: Schedule/calendar view for workspace tasks.
  - `views/GanttView.tsx`: New split-view Gantt chart with timeline zoom (Day/Week/Month).
  - `WorkspaceLayout.tsx`: Main workspace shell managing tabs (`list`, `board`, `calendar`, `gantt`), active node, filters, and modals.
  - `WorkspaceModals.tsx`: Task creation and edit dialogs.
  - `services/workspace.service.ts`: Core Task interface and Firestore persistence.
- **Hosting & Build Pipeline**:
  - Vite + React + TypeScript in `De_Vuong_Webapp`
  - Firebase Hosting site target `huynhkiencam` mapped to `anti-gravity-katc-academy`

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Board Column SaaS Styling | Columns styled with `rounded-xl`, `p-2.5`, `bg-slate-50/70`, width ~290px-300px | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Board Task Card Refinement | 16px round checkbox, `text-xs font-semibold` title, due date & assignee merged on 1 row, remove coarse `mt-3` | M1 | ORIGINAL_REQUEST §R1 |
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

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Board View SaaS Polish | `BoardView.tsx` styling, card refinement, test verification | none | DONE |
| 2 | M2: Calendar View Week Timeline & Defaults | `CalendarView.tsx`, `WorkspaceModals.tsx` | none | DONE |
| 3 | M3: Gantt View Creation & Integration | `GanttView.tsx`, `WorkspaceLayout.tsx` | none | DONE |
| 4 | M4: Build Verification & Firebase Deployment | `npm run build`, `firebase deploy --only hosting:huynhkiencam` | M1, M2, M3 | DONE |

## Interface Contracts
### `GanttView.tsx` ↔ `WorkspaceLayout.tsx`
```typescript
interface GanttViewProps {
  activeNode: { id: string; type: 'org' | 'space' | 'folder'; name: string; orgId: string };
  refreshTrigger?: number;
  searchQuery?: string;
  hideFinished?: boolean;
  assigneeFilter?: string | null;
  onOpenTaskModal?: () => void;
}
```

### `Task` Contract (`workspace.service.ts`)
```typescript
export interface Task {
  id: string;
  orgId: string;
  spaceId?: string;
  folderId?: string;
  title: string;
  description?: string;
  assignees: string[];
  startDate?: Timestamp;
  dueDate?: Timestamp;
  status: 'planned' | 'in_progress' | 'needs_review' | 'finish' | 'cancel';
  priority: 'low' | 'medium' | 'high';
  order?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Code Layout
- `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx` (Owned exclusively by M1 Worker)
- `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` (Owned exclusively by M2 Worker)
- `De_Vuong_Webapp/src/components/workspace/WorkspaceModals.tsx` (Owned exclusively by M2 Worker)
- `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx` (Owned exclusively by M3 Worker)
- `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx` (Owned exclusively by M3 Worker)
