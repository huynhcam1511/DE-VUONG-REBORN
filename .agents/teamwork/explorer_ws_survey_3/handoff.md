# Survey Report: Workspace Gantt View (R3) & Build & Deployment (R4)

## 1. Observation

### 1.1 Workspace Layout & Tab Architecture
- **File**: `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`
  - **Line 45**: `const [activeViewTab, setActiveViewTab] = useState<'list' | 'board' | 'calendar' | 'gantt'>('list');`
  - **Lines 263-268**: Tab buttons definition:
    ```tsx
    {[
      { id: 'list', label: 'List', icon: AlignLeft, color: 'text-slate-500' },
      { id: 'board', label: 'Board', icon: Layout, color: 'text-blue-600' },
      { id: 'calendar', label: 'Calendar', icon: CalendarIcon, color: 'text-orange-500' },
      { id: 'gantt', label: 'Gantt', icon: KanbanSquare, color: 'text-red-500' },
    ].map(tab => ...)}
    ```
  - **Lines 387-391**: View rendering branch:
    ```tsx
    {activeViewTab === 'list' && <TaskView activeNode={activeNode} refreshTrigger={refreshTrigger} onOpenTaskModal={() => setIsTaskModalOpen(true)} searchQuery={searchQuery} hideFinished={hideFinished} assigneeFilter={assigneeFilter} filters={taskFilters} />}
    {activeViewTab === 'board' && <BoardView activeNode={activeNode} refreshTrigger={refreshTrigger} searchQuery={searchQuery} hideFinished={hideFinished} assigneeFilter={assigneeFilter} />}
    {activeViewTab === 'calendar' && <CalendarView orgId={activeNode.orgId} />}
    {activeViewTab === 'gantt' && <div className="text-center text-slate-500 mt-20">Gantt View is under construction...</div>}
    ```
  - **Line 390**: The tab `'gantt'` is already defined in state and rendered in the view selector tabs, but currently displays only placeholder text `<div className="text-center text-slate-500 mt-20">Gantt View is under construction...</div>`.
  - Props passed to sibling views (`TaskView`, `BoardView`):
    - `activeNode`: `{ id: string, type: 'org' | 'space' | 'folder', name: string, orgId: string }`
    - `refreshTrigger`: `number`
    - `searchQuery`: `string`
    - `hideFinished`: `boolean`
    - `assigneeFilter`: `string | null`
    - `onOpenTaskModal`: `() => void` (in `TaskView`)

### 1.2 Task Data Model & Service Layer
- **File**: `De_Vuong_Webapp/src/services/workspace.service.ts`
  - **Lines 64-83**: `Task` interface definition:
    ```typescript
    export interface Task {
      id: string;
      orgId: string;
      spaceId?: string;
      folderId?: string;
      title: string;
      description?: string;
      assignees: string[]; // UIDs
      subtasks?: Subtask[]; // Deprecated
      parentTaskId?: string; // For hierarchical tasks
      links?: string[]; // Attached URLs
      resultLinks?: string[]; // Result/deliverable URLs
      startDate?: Timestamp;
      dueDate?: Timestamp;
      status: 'planned' | 'in_progress' | 'needs_review' | 'finish' | 'cancel';
      priority: 'low' | 'medium' | 'high';
      order?: number;
      createdAt: Timestamp;
      updatedAt: Timestamp;
    }
    ```
  - Query functions available:
    - `getTasksForOrg(orgId: string): Promise<Task[]>`
    - `getTasksForSpace(spaceId: string): Promise<Task[]>`
    - `getTasksForFolder(folderId: string): Promise<Task[]>`
    - `getAllTasks(): Promise<Task[]>`
    - `updateTask(taskId: string, updates: Partial<Task>): Promise<void>`
    - `deleteTask(taskId: string): Promise<void>`
    - `createTask(data: any): Promise<string>`
- **File**: `De_Vuong_Webapp/src/components/workspace/workspaceAssignees.ts`
  - Assignee resolution and filter matching utilities: `matchesAssigneeFilter`, `resolveAssignee`, `resolveTaskAssigneesList`.
- **File**: `De_Vuong_Webapp/src/components/workspace/views/TaskDetailPanel.tsx`
  - Reusable detail panel component for task viewing and editing, accepting props: `task: Task`, `onClose: () => void`, `onUpdate: (taskId: string, updates: Partial<Task>) => void`, `onDelete?: (taskId: string) => void`.

### 1.3 Date & UI Libraries Available
- **File**: `De_Vuong_Webapp/package.json`
  - `"date-fns": "^4.1.0"`: Provides date manipulation functions (`format`, `addDays`, `subDays`, `addWeeks`, `subWeeks`, `addMonths`, `subMonths`, `startOfDay`, `endOfDay`, `startOfWeek`, `endOfWeek`, `startOfMonth`, `endOfMonth`, `differenceInCalendarDays`, `eachDayOfInterval`, `isSameDay`, `isToday`, `isWithinInterval`) and Vietnamese locale `vi` (`import { vi } from 'date-fns/locale'`).
  - `"lucide-react": "^0.546.0"`: Comprehensive icons (`Calendar`, `ChevronLeft`, `ChevronRight`, `Plus`, `Search`, `CheckCircle2`, `Clock`, `Flag`, `AlertCircle`, `Check`, `ZoomIn`, `Layers`, `Filter`, etc.).

### 1.4 Build & Test Verification
- Ran `cd De_Vuong_Webapp; npm run build`:
  - Result: `✓ built in 16.74s`, exit code `0`.
  - Output artifacts created in `De_Vuong_Webapp/dist/` (`dist/index.html`, `dist/assets/index-*.css`, `dist/assets/index-*.js`, etc.).
- Ran `cd De_Vuong_Webapp; npm run test:workspace`:
  - Result: 8/8 tests pass (`wrk-data-01.test.ts`, `mobileSwipe.test.ts`), exit code `0`.

### 1.5 Firebase Hosting Configuration
- **File**: `De_Vuong_Webapp/firebase.json`
  - **Lines 6-48**:
    ```json
    "hosting": [
      {
        "site": "huynhkiencam",
        "public": "dist",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "/api/**",
            "run": {
              "serviceId": "de-vuong-backend",
              "region": "asia-southeast1"
            }
          },
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      },
      ...
    ]
    ```
- **File**: `De_Vuong_Webapp/.firebaserc`
  - **Lines 2-6**: Active project: `"default": "anti-gravity-katc-academy"`, `"production": "anti-gravity-katc-academy"`
  - **Lines 21-28**:
    ```json
    "hosting": {
      "huynhkiencam": [
        "huynhkiencam"
      ],
      "anti-gravity-katc-academy": [
        "anti-gravity-katc-academy"
      ]
    }
    ```
- Ran `cd De_Vuong_Webapp; npx firebase target`:
  - Confirmed active target mapping:
    ```
    Resource targets for anti-gravity-katc-academy:
    [ storage ]
    default (anti-gravity-katc-academy)
    [ hosting ]
    huynhkiencam (huynhkiencam)
    anti-gravity-katc-academy (anti-gravity-katc-academy)
    ```
- Deployment command `firebase deploy --only hosting:huynhkiencam` is fully configured and ready.

---

## 2. Logic Chain

### 2.1 Wiring Tab 'gantt' in `WorkspaceLayout.tsx`
1. `WorkspaceLayout.tsx` already has the `'gantt'` tab defined in the tab state and toolbar tab array (Observation 1.1).
2. Currently, line 390 renders a placeholder `<div>`.
3. Therefore, wiring only requires:
   - Creating `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`.
   - Importing `GanttView` in `WorkspaceLayout.tsx`:
     ```tsx
     import { GanttView } from './views/GanttView';
     ```
   - Replacing line 390 with:
     ```tsx
     {activeViewTab === 'gantt' && (
       <GanttView
         activeNode={activeNode}
         refreshTrigger={refreshTrigger}
         searchQuery={searchQuery}
         hideFinished={hideFinished}
         assigneeFilter={assigneeFilter}
         onOpenTaskModal={() => setIsTaskModalOpen(true)}
       />
     )}
     ```

### 2.2 Split-View Architecture Pattern for `GanttView.tsx`
1. Traditional dual-pane split views often suffer from desynchronized vertical scrolling if the left table and right timeline are placed in separate scroll containers.
2. The optimal modern pattern is the **Sticky-Column Split-View**:
   - A single horizontal + vertical scroll container (`overflow-auto flex-1`).
   - The left pane (Task List / Grid, width ~340px) uses CSS `sticky left-0 z-20 bg-white` on each row.
   - The right pane (Timeline Canvas) extends horizontally (`min-w-[calculatedWidth]`).
   - The header row also uses `sticky top-0 z-30` with the top-left table header corner having `sticky left-0 top-0 z-40 bg-slate-50`.
3. **Benefits**:
   - 100% synchronized vertical scrolling with zero JavaScript scroll-sync lag.
   - Natural horizontal panning across dates while task names and checkboxes stay pinned on the left.
   - Seamless responsive behavior and frictionless click interactions.

### 2.3 Zoom Scale System (Day, Week, Month)
1. **Day View (`scale === 'day'`)**:
   - Column unit: 1 Calendar Day, width `colWidth = 48px`.
   - Header:
     - Top row: Month grouping (`format(monthDate, 'MMMM yyyy', { locale: vi })`).
     - Bottom row: Day date and weekday (`16 T2`, `17 T3`, etc.), with Today highlighted in emerald.
   - Bar left offset: `differenceInCalendarDays(task.start, timelineStart) * 48`.
   - Bar width: `Math.max(48, task.durationDays * 48)`.
2. **Week View (`scale === 'week'`)**:
   - Column unit: 1 Week (Monday to Sunday), width `colWidth = 112px` (16px/day).
   - Header:
     - Top row: Month & Year.
     - Bottom row: Week identifier & date range (`T46 (10/11 - 16/11)`).
   - Bar left offset: `(differenceInCalendarDays(task.start, timelineStart) / 7) * 112`.
   - Bar width: `Math.max(28, (task.durationDays / 7) * 112)`.
3. **Month View (`scale === 'month'`)**:
   - Column unit: 1 Calendar Month, width `colWidth = 140px` (~4.6px/day).
   - Header:
     - Top row: Year.
     - Bottom row: Month name (`Thg 1`, `Thg 2`, etc.).
   - Bar left offset: `(differenceInCalendarDays(task.start, timelineStart) / totalDaysInRange) * totalTimelineWidth`.
   - Bar width: `Math.max(24, (task.durationDays / totalDaysInRange) * totalTimelineWidth)`.

### 2.4 Progress Bar & State Calculations
1. **Date extraction**:
   - Convert Firestore `Timestamp` to JS `Date`:
     `const start = task.startDate ? new Date(task.startDate.seconds * 1000) : null;`
     `const due = task.dueDate ? new Date(task.dueDate.seconds * 1000) : null;`
2. **Progress percent**:
   - If `task.status === 'finish'` or `'done'`: `100%`.
   - Else if `task.subtasks && task.subtasks.length > 0`:
     `Math.round((finishedSubtasks / task.subtasks.length) * 100)`.
   - Else if `task.status === 'in_progress'`: `50%`.
   - Else if `task.status === 'needs_review'`: `80%`.
   - Else (`planned`, etc.): `0%`.
3. **Bar Rendering**:
   - Outer container: `absolute h-6 rounded-md border flex items-center overflow-hidden cursor-pointer shadow-xs transition-all hover:brightness-95`.
   - Inner progress bar: `absolute left-0 top-0 bottom-0 bg-current opacity-25 rounded-l-md` with `style={{ width: `${progress}%` }}`.
   - Text label inside or adjacent to the bar: Title truncated + `${progress}%`.
4. **Color coding**:
   - **Completed**: `bg-emerald-100 border-emerald-300 text-emerald-800` (emerald fill).
   - **Overdue** (`dueDate < today && status !== 'finish'`): `bg-rose-100 border-rose-300 text-rose-800` (rose fill).
   - **In Progress**: `bg-blue-100 border-blue-300 text-blue-800` (blue fill).
   - **Planned**: `bg-slate-100 border-slate-300 text-slate-700`.

### 2.5 Edge Case Handling
1. **Task has both `startDate` and `dueDate`**:
   - If `startDate > dueDate`: normalize `dueDate = startDate` (1-day duration).
2. **Task has only `dueDate` (no `startDate`)**:
   - Default `startDate = dueDate` (1-day milestone task) with target icon.
3. **Task has only `startDate` (no `dueDate`)**:
   - Default `dueDate = startDate` (1-day duration).
4. **Task has neither `startDate` nor `dueDate`**:
   - Position a subtle dashed marker on Today (or `createdAt`), styled with amber border (`border-dashed border-amber-400 bg-amber-50 text-amber-800`) and a badge `Chưa đặt ngày`.
   - Table column shows `(Chưa đặt hạn)`.
5. **Today line indicator**:
   - A vertical line in emerald (`w-0.5 bg-emerald-500 z-10 pointer-events-none`) spanning the full height of all rows at the exact horizontal pixel of Today.
6. **Task Detail Integration**:
   - Clicking any task row or timeline bar sets `selectedTask(task)`.
   - Renders `<TaskDetailPanel task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />`.

### 2.6 Build and Deployment Pipeline
1. `npm run build` executes `vite build`.
2. As verified in Observation 1.4, Vite compiles in ~16.7s and produces `dist/`.
3. Target `huynhkiencam` is mapped in `.firebaserc` and `firebase.json` (Observation 1.5).
4. Running `firebase deploy --only hosting:huynhkiencam` deploys `dist/` directly to the `huynhkiencam` site.

---

## 3. Caveats

1. **Pre-existing TypeScript Lint Errors**:
   - Running `npm run lint` (`tsc --noEmit`) revealed existing type discrepancies in administrative modules (`ClassDetail.tsx`, `CRMAdmissionsModule.tsx`, `AdminLedgerModule.tsx`).
   - However, `npm run build` (`vite build`) compiles cleanly without failure because Vite transpiles modules independently.
   - The implementer must ensure `GanttView.tsx` has zero TypeScript errors so it introduces no regressions.
2. **Subtask Hierarchy in Tasks**:
   - The project uses `Task` with optional `subtasks` array or `parentTaskId`. GanttView can group tasks or display parent tasks and their subtasks with indented rows. For initial release, displaying main tasks with progress computed from subtasks provides the cleanest, most performant UX.
3. **Timezone consistency**:
   - Timestamps in Firestore are UTC seconds. When computing calendar day differences, ensure all dates are normalized via `startOfDay` to prevent timezone offsets from shifting bars by a fraction of a day.

---

## 4. Conclusion & Actionable Blueprint

### Recommended Implementation Structure

#### 1. Create `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`:
```typescript
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay,
  differenceInCalendarDays, eachDayOfInterval, isSameDay, isToday
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Plus, Search, Calendar, 
  CheckCircle2, Clock, AlertCircle, Check, Flag
} from 'lucide-react';
import { 
  Task, getTasksForOrg, getTasksForSpace, getTasksForFolder, 
  getAllTasks, updateTask, deleteTask 
} from '../../../services/workspace.service';
import { matchesAssigneeFilter, resolveAssignee } from '../workspaceAssignees';
import { TaskDetailPanel } from './TaskDetailPanel';

interface Node {
  id: string;
  type: 'org' | 'space' | 'folder';
  name: string;
  orgId: string;
}

interface GanttViewProps {
  activeNode: Node;
  refreshTrigger?: number;
  searchQuery?: string;
  hideFinished?: boolean;
  assigneeFilter?: string | null;
  onOpenTaskModal?: () => void;
}

export type GanttScale = 'day' | 'week' | 'month';
```

#### Key Capabilities of `GanttView.tsx`:
- **Sticky Column Split-View**: Left table pane (width 340px) sticky-pinned; right timeline horizontally scrollable.
- **Unified Vertical Scrolling**: Left and right cells reside in the same row element, ensuring zero vertical desync.
- **Zoom Switcher**: Segmented toggle for `Ngày`, `Tuần`, `Tháng`.
- **Horizontal Pan & Today Scroll**: Jump-to-today button automatically centers the timeline viewport on Today.
- **Progress Calculation**: Dynamic fill bar calculated from task status and subtask completion ratio.
- **Task Interaction**: Quick toggle finish button; click-to-open `TaskDetailPanel` for editing dates, description, assignees, and subtasks.

#### 2. Wire into `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`:
- Import: `import { GanttView } from './views/GanttView';`
- Replace line 390 with:
  ```tsx
  {activeViewTab === 'gantt' && (
    <GanttView 
      activeNode={activeNode} 
      refreshTrigger={refreshTrigger} 
      searchQuery={searchQuery} 
      hideFinished={hideFinished} 
      assigneeFilter={assigneeFilter}
      onOpenTaskModal={() => setIsTaskModalOpen(true)}
    />
  )}
  ```

#### 3. Execution of Build & Deployment (R4):
- Step 1: `cd De_Vuong_Webapp && npm run build` (confirm exit code 0).
- Step 2: `cd De_Vuong_Webapp && firebase deploy --only hosting:huynhkiencam` (confirm deployment successful to hosting site `huynhkiencam`).

---

## 5. Verification Method

1. **Gantt Component Verification**:
   - Verify file existence: `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`.
   - Inspect `WorkspaceLayout.tsx`: Confirm `activeViewTab === 'gantt'` renders `<GanttView ... />`.
2. **Interactive UI Verification**:
   - Switch tabs to "Gantt" in Workspace.
   - Verify Left Pane displays task list with checkboxes, titles, and dates.
   - Verify Right Pane displays timeline grid with bars spanning `startDate -> dueDate`.
   - Toggle between `Ngày`, `Tuần`, and `Tháng` zoom modes and verify timeline scale re-renders smoothly.
   - Click "Hôm nay" and verify timeline scrolls to the current date indicator.
   - Click a task bar to verify `TaskDetailPanel` opens for editing.
3. **Build & Deploy Verification**:
   - Command: `cd De_Vuong_Webapp; npm run build`
     - Must return exit code `0` and generate output in `dist/`.
   - Command: `cd De_Vuong_Webapp; firebase deploy --only hosting:huynhkiencam`
     - Must return `Deploy complete!` and output hosting URL.
