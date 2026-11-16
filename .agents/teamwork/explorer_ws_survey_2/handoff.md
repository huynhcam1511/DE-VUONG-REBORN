# Comprehensive Survey Report: Requirement R2 (Calendar View Week Timeline & Defaults)

## 1. Observation

### 1.1 Existing Workspace Calendar Implementation
- **File**: `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` (124 lines).
- **Current State**:
  - Implements only a rudimentary Month View using `startOfMonth`, `endOfMonth`, and `eachDayOfInterval`.
  - Lines 71-77: Renders 7 column headers (`weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']`).
  - Lines 80-119: 5-row static monthly grid. Filtering only matches `dueDate` via `isSameDay(new Date(t.dueDate.seconds * 1000), day)`.
  - **Missing Elements**:
    - No Week View Timeline.
    - No vertical hour axis (08:00 - 22:00).
    - No Current Time Indicator line.
    - No All-Day header section for tasks without specific time.
    - No toggle between Week and Month view.
    - No task detail modal (`TaskDetailPanel`) on task click.
    - No interactive slot-click to add task at a specific time.

### 1.2 Reference Implementation in ScheduleModule
- **Files**:
  - `De_Vuong_Webapp/src/components/Calendar/ModernCalendar.tsx` (252 lines)
  - `De_Vuong_Webapp/src/components/Calendar/views/WeekView.tsx` (408 lines)
  - `De_Vuong_Webapp/src/components/Calendar/views/MonthView.tsx` (103 lines)
- **Observed Mechanisms**:
  - **View Switcher**: `ModernCalendar.tsx` lines 172-205 uses a sliding pill switcher with `framer-motion` / `motion/react` (`layoutId="calendar-view-pill"`).
  - **Current Time Indicator**: `WeekView.tsx` lines 29-86:
    - Live timer updating every 10s.
    - Left axis pill badge: `bg-emerald-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.35)] border border-emerald-400` with an animated pulsing dot.
    - Dashed line across all days: `border-b border-dashed border-emerald-300/70`.
    - Highlight on Today column: `border-b-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]` with a pinging round dot on the left and marker on the right.
  - **Overlapping Task Layout**: `WeekView.tsx` lines 324-340 detects overlapping sessions and divides column width (`width = 100 / colCount; left = colIdx * width`).
  - **Limitations of `ModernCalendar` for Workspace**:
    - `ModernCalendar` is strictly designed for `StudentSession[]` (education classes), with fields `studentId`, `classId`, `startTime`, `endTime`, `order`.
    - Uses `START_HOUR = 8` to `END_HOUR = 24` (whereas Requirement R2 explicitly specifies 08:00 - 22:00).
    - Lacks an All-Day header row.
    - Does not integrate with workspace `Task` models or `TaskDetailPanel`.

### 1.3 Task Creation & DateTime Default Logic
- **File**: `De_Vuong_Webapp/src/components/workspace/WorkspaceModals.tsx` (`CreateTaskModal`).
  - Lines 763-766:
    ```tsx
    const [startDateStr, setStartDateStr] = useState('');
    const [startTimeStr, setStartTimeStr] = useState('');
    const [dueDateStr, setDueDateStr] = useState('');
    const [dueTimeStr, setDueTimeStr] = useState('');
    ```
  - Lines 836-839: Form reset on submit:
    ```tsx
    setStartDateStr('');
    setStartTimeStr('');
    setDueDateStr('');
    setDueTimeStr('');
    ```
  - **Observation**: When creating a task, all date and time inputs currently default to empty strings (`''`). Users must manually open the picker and choose date/time.
- **File**: `De_Vuong_Webapp/src/components/ui/GoogleStyleDateTimeInput.tsx`:
  - Supports Google-style popover calendar with Vietnamese locale, 15-minute time slots (`TIME_SLOTS`), and optional `allowAllDay` / `isAllDay` support.

### 1.4 Task Data Model in Workspace
- **File**: `De_Vuong_Webapp/src/services/workspace.service.ts`:
  - `Task` model has:
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
  - `createTask` and `updateTask` convert ISO strings or Date instances to Firestore `Timestamp`.

---

## 2. Logic Chain

### 2.1 Component Architecture Decision
Rather than attempting to force `ModernCalendar.tsx` (which is tightly coupled with `StudentSession[]` in educational modules) into workspace, `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` should be upgraded into a complete, high-performance Workspace Calendar component that adopts the visual design and timeline algorithms of `ModernCalendar`/`WeekView` while tailored specifically to workspace tasks.

### 2.2 Week View Timeline (08:00 - 22:00)
1. **Hour Axis Math**:
   - `START_HOUR = 8`
   - `END_HOUR = 22`
   - `TOTAL_HOURS = END_HOUR - START_HOUR = 14` hours (840 minutes).
   - Hour markers: `[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]`.
   - Vertical position function:
     ```typescript
     const getPosition = (date: Date): number => {
       const totalMinutes = (date.getHours() - START_HOUR) * 60 + date.getMinutes();
       const clamped = Math.max(0, Math.min(TOTAL_HOURS * 60, totalMinutes));
       return (clamped / (TOTAL_HOURS * 60)) * 100;
     };
     ```
2. **Current Time Indicator**:
   - Runs on a 10s interval timer (`new Date()`).
   - Only renders if the current week contains Today (`isSameDay(day, now)`).
   - If current time is between 08:00 and 22:00:
     - Left axis badge: `bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-400` with pulsing dot.
     - Full-width dashed line (`border-emerald-300/70`).
     - Solid emerald line on Today's column (`border-emerald-500`) with glowing ping dot on the left.

### 2.3 Task Categorization: All-Day vs. Timed Grid Blocks
1. **All-Day Header Tasks**:
   - A task belongs in the All-Day header if:
     - It has an explicit `isAllDay` flag (`(task as any).isAllDay === true`), OR
     - It has date(s) but no non-zero time of day (e.g. `00:00:00` or `23:59:59` from date-only pickers), OR
     - Its `startDate` and `dueDate` span across multiple days.
   - All-Day tasks appear in a dedicated top row directly beneath the day headers, with a fixed left label `"Cả ngày"`.
2. **Hour Grid Tasks**:
   - A task has a specific time between 08:00 and 22:00 on a given day.
   - Position & Duration:
     - If both `startDate` and `dueDate` are on the same day:
       `top = getPosition(startDate)`
       `height = Math.max(getPosition(dueDate) - top, 3.5)` (minimum ~30px height).
     - If only `dueDate` is present with specific hour:
       `top = Math.max(0, getPosition(dueDate) - (60 / 840) * 100)` (e.g. 1 hour prior to deadline, or starting at dueDate with 1h duration).
     - If only `startDate` is present:
       `top = getPosition(startDate)`, duration = 60 minutes.
   - **Overlapping Layout**: Multiple tasks in the same hour slot are positioned side-by-side using the multi-column placement algorithm.
   - **Visual Styling**:
     - Priority High: `bg-rose-50 text-rose-700 border-rose-200`
     - Priority Medium: `bg-amber-50 text-amber-700 border-amber-200`
     - Priority Low: `bg-emerald-50 text-emerald-700 border-emerald-200`
     - Completed (`finish` / `cancel`): `bg-slate-100 text-slate-500 line-through border-slate-200`

### 2.4 Smooth Toggle Between Week View and Month View
- Header toolbar features a sliding pill button group (`Tuần` | `Tháng`) using `motion.div` (`layoutId="calendar-view-pill"`).
- View body wrapped in `<AnimatePresence mode="wait">` with smooth fade/slide transitions (`opacity: 0, y: 6` -> `opacity: 1, y: 0`).
- Navigation buttons (`<`, `Hôm nay`, `>`) intelligently advance by 1 week in Week view and 1 month in Month view.

### 2.5 Default DateTime Logic (Today / Current Date & Time)
- In `WorkspaceModals.tsx` (`CreateTaskModal`):
  - When `isOpen` becomes true, initialize state with current date and time:
    ```typescript
    useEffect(() => {
      if (isOpen) {
        const now = initialDate || new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const nowTimeStr = initialStartTime || format(now, 'HH:mm');
        const dueTimeStr = initialDueTime || format(addHours(now, 1), 'HH:mm');
        
        setStartDateStr(todayStr);
        setStartTimeStr(nowTimeStr);
        setDueDateStr(initialDueDate ? format(initialDueDate, 'yyyy-MM-dd') : todayStr);
        setDueTimeStr(dueTimeStr);
      }
    }, [isOpen, initialDate, initialStartTime, initialDueDate, initialDueTime]);
    ```
  - When creating a task directly from CalendarView (e.g., clicking on Wednesday at 10:00), pass `initialDate` (Wednesday) and `initialStartTime` (`10:00`).
  - When creating from global "+ Thêm Task" or topbar button, it defaults to Today at the current time (`new Date()`).
  - This satisfies both R2 specification and Acceptance Criteria.

### 2.6 TaskDetailPanel Integration
- In `CalendarView.tsx`, maintain state `selectedTask: Task | null`.
- Clicking any task (whether in All-Day header, Grid block, or Month cell) sets `setSelectedTask(task)`.
- Renders `TaskDetailPanel` overlay with `onUpdate={handleUpdateTask}` and `onDelete={handleDeleteTask}`, allowing seamless task inspection, editing, and deletion without leaving Calendar.

---

## 3. Caveats

1. **Legacy Date Formats in Firestore**:
   Some existing workspace tasks in Firestore have `dueDate` stored as a Timestamp with time `23:59:59` (standard for end-of-day deadline), while others have `00:00:00` or no time. The helper `isAllDayOrUntimed(startDate, dueDate)` must treat timestamps with seconds `23:59:59` or `00:00:00` as untimed/all-day tasks so they correctly display in the All-Day header instead of jamming the 22:00 or 08:00 grid lines.
2. **Scroll Position on Mount**:
   The week view timeline should auto-scroll on mount to the current time (or 08:30) so users don't have to scroll down manually to see the active working hours.
3. **Workspace Filtering**:
   `CalendarView` should accept `activeNode`, `searchQuery`, `hideFinished`, and `assigneeFilter` from `WorkspaceLayout` so that topbar filters immediately reflect on the calendar.

---

## 4. Conclusion & Required Code Modifications

To satisfy all Acceptance Criteria for Requirement R2, the following modifications are required:

1. **`De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`**:
   - Rewrite with full Week View Timeline (08:00 - 22:00 vertical axis, 7 columns T2 -> CN).
   - Implement emerald Current Time Indicator with live pulse.
   - Implement All-Day header section at the top of the grid.
   - Implement Month View grid with day numbers and task chips.
   - Implement animated pill switcher between Tuần (Week) and Tháng (Month).
   - Integrate `TaskDetailPanel` for task viewing/editing.
   - Implement click-to-create task on grid slots and header "+ Thêm việc" button.
2. **`De_Vuong_Webapp/src/components/workspace/WorkspaceModals.tsx`**:
   - In `CreateTaskModal`, add `initialDate?: Date; initialStartTime?: string; initialDueDate?: Date; initialDueTime?: string;` props.
   - Update state initialization and `useEffect` on `isOpen` to default date/time to Today (current date and time).
3. **`De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`**:
   - Forward `activeNode`, `refreshTrigger`, `searchQuery`, `hideFinished`, `assigneeFilter` to `CalendarView`.

---

## 5. Verification Method

1. **Build Verification**:
   Execute `npm run build` inside `De_Vuong_Webapp` to confirm:
   - TypeScript compilation succeeds without errors.
   - Vite bundle completes with exit code 0.
2. **Interactive UI Verification**:
   - Open Workspace -> switch to `Calendar` tab.
   - Verify default view is Week View with 7 columns (Thứ 2 to Chủ nhật) and vertical axis from 08:00 to 22:00.
   - Verify emerald Current Time Indicator displays at the correct hour/minute on Today's column.
   - Verify tasks marked all-day or without hours appear in the top All-Day header section.
   - Verify tasks with specific hours appear at their respective positions on the 08:00 - 22:00 grid.
   - Click "Tháng" to toggle to Month View; verify smooth transition and accurate task distribution.
   - Click "+ Thêm việc" or click an empty grid slot; verify modal opens with date and time prefilled to Today / current time.
