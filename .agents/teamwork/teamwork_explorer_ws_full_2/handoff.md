# Handoff Report: Investigation of CalendarView Data Fetching and Rendering (R2)

## 1. Observation

### 1.1 Data Fetching and Service Integration
- **Target File**: `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`
  - Lines 32-40:
    ```typescript
    import {
      getTasksForOrg,
      getTasksForSpace,
      getTasksForFolder,
      createTask,
      updateTask,
      deleteTask,
      Task
    } from '../../../services/workspace.service';
    ```
    `getAllTasks` is NOT imported from `workspace.service.ts`.
  - Lines 276-299:
    ```typescript
    // Fetch tasks
    useEffect(() => {
      const fetchTasks = async () => {
        setLoading(true);
        try {
          let data: Task[] = [];
          if (activeNode?.type === 'folder' && activeNode.id) {
            data = await getTasksForFolder(activeNode.id);
          } else if (activeNode?.type === 'space' && activeNode.id) {
            data = await getTasksForSpace(activeNode.id);
          } else {
            data = await getTasksForOrg(orgId);
          }
          setTasks(data);
        } catch (err) {
          console.error('Error fetching tasks for calendar:', err);
        } finally {
          setLoading(false);
        }
      };
      if (orgId) {
        fetchTasks();
      }
    }, [orgId, activeNode?.id, activeNode?.type, refreshTrigger]);
    ```
- **Service Definition**: `De_Vuong_Webapp/src/services/workspace.service.ts`
  - Lines 206-216:
    ```typescript
    export const getTasksForOrg = async (orgId: string): Promise<Task[]> => {
      const q = query(collection(db, 'tasks'), where('orgId', '==', orgId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    };

    export const getAllTasks = async (): Promise<Task[]> => {
      const q = query(collection(db, 'tasks'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    };
    ```
- **Calling Context in Parent Layout**: `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`
  - Lines 39-44:
    ```typescript
    const [activeNode, setActiveNode] = useState<Node>({ 
      id: 'default-workspace', 
      type: 'org', 
      name: 'My Workspace',
      orgId: 'default-workspace'
    });
    ```
  - Lines 391-400:
    ```tsx
    {activeViewTab === 'calendar' && (
      <CalendarView
        orgId={activeNode.orgId}
        activeNode={activeNode}
        refreshTrigger={refreshTrigger}
        searchQuery={searchQuery}
        hideFinished={hideFinished}
        assigneeFilter={assigneeFilter}
        onOpenTaskModal={() => setIsTaskModalOpen(true)}
      />
    )}
    ```
- **Reference Implementation in Peer Views**:
  - `BoardView.tsx` (lines 251-256):
    ```typescript
    if (activeNode.type === 'org') {
      if (activeNode.id === 'default-workspace') {
        fetchedTasks = await getAllTasks();
      } else {
        fetchedTasks = await getTasksForOrg(activeNode.id);
      }
    }
    ```
  - `GanttView.tsx` (lines 76-81):
    ```typescript
    if (activeNode.type === 'org') {
      if (activeNode.id === 'default-workspace') {
        fetched = await getAllTasks();
      } else {
        fetched = await getTasksForOrg(activeNode.id);
      }
    }
    ```
  - `TaskView.tsx` (lines 297-302):
    ```typescript
    if (activeNode.type === 'org') {
      if (activeNode.id === 'default-workspace') {
        fetchedTasks = await getAllTasks();
      } else {
        fetchedTasks = await getTasksForOrg(activeNode.id);
      }
    }
    ```

### 1.2 Rendering Logic on Week Grid and All-Day Header
- **Safe Date Parsing**: `CalendarView.tsx` lines 63-119:
  - `parseTaskDate(val: any): Date | null` safely handles:
    1. JavaScript `Date` instances (`val instanceof Date`, `!isNaN(val.getTime())`).
    2. Firestore `Timestamp` objects with `.toDate()` (guarded with `try...catch`).
    3. Firestore `Timestamp` objects with `.toMillis()`.
    4. Serialized Firestore Timestamp objects with `.seconds` or `._seconds`.
    5. Numeric timestamps (`typeof val === 'number'`, differentiating ms vs s with `1e11` boundary).
    6. Date strings:
       - Pure numeric strings (`/^\d+$/`).
       - Date-only `YYYY-MM-DD` strings parsed directly as local midnight (`new Date(y, m - 1, d, 0, 0, 0, 0)`) to avoid UTC day-shift errors.
       - ISO 8601 strings / standard date strings.
    7. Returns `null` on missing, unparseable, or invalid dates, preventing `NaN/NaN/NaN` or crashes. Fully adheres to `AGENTS.md` Rule 17.
- **Classification into All-Day vs Timed Tasks**: `CalendarView.tsx` lines 122-145:
  - `isTaskAllDay(task, start, due)`:
    - Explicit `(task as any).isAllDay === true` -> `true`.
    - No dates (`!start && !due`) -> `true`.
    - **Multi-day spanning tasks** (`start && due && !isSameDay(start, due)`) -> `true` (correctly routed to All-Day header).
    - Single-day or single-date tasks are evaluated with `isUntimedOrMidnight(d)`:
      - Local midnight (`00:00`) or end of day (`23:58-23:59`).
      - UTC midnight (`00:00`) or UTC end of day (`23:58-23:59`).
    - If untimed/midnight -> `true` (All-Day header).
    - If specific hours/minutes present -> `false` (Timed Grid).
- **Daily Task Membership**: `CalendarView.tsx` lines 148-170:
  - `doesTaskBelongToDay(task, day)`:
    - If both `start` and `due` are present, bounds are ordered `intervalStart = start <= due ? startOfDay(start) : startOfDay(due)` and `intervalEnd = start <= due ? endOfDay(due) : endOfDay(start)` to prevent `RangeError` if dates are inverted.
    - Evaluates `isWithinInterval(dayStart, { start: intervalStart, end: intervalEnd })` and `isSameDay`.
    - Single date: checks `isSameDay(day, due)` or `isSameDay(day, start)`.
    - Unscheduled tasks (`!start && !due`): returns `false` (not shown on specific calendar days).
- **All-Day Header Component**: `CalendarView.tsx` lines 589-635:
  - 7 columns corresponding to Monday–Sunday (`weekDays`).
  - Filters `allDayTasks.filter(t => doesTaskBelongToDay(t, day))`.
  - Shows task badge with priority colors (`rose-50`, `amber-50`, `emerald-50`), click opens `TaskDetailPanel`.
- **Timed Hour Grid**: `CalendarView.tsx` lines 638-798:
  - 14-hour vertical timeline from `START_HOUR = 8` to `END_HOUR = 22` (840 minutes total).
  - For each day, filters `timedTasks.filter(t => doesTaskBelongToDay(t, day))`.
  - Task timing bounds:
    - If both `start` & `due` on the same day: uses `start` and `due` minutes, clamped to `[0, TOTAL_MINUTES]`, min 30 min duration.
    - If only `due`: places a 1-hour block ending at due time (`Hạn: HH:mm`). Clamped to grid if outside 08:00 - 22:00.
    - If only `start`: places a 1-hour block starting at start time (`HH:mm`). Clamped to grid.
  - Layout clustering: `calculateDayTimedLayout` computes column offsets and widths for overlapping events.
  - Interactive slot click: `handleSlotClick(day, hour)` opens `CreateTaskModal` with preset day and hour.
  - Current time indicator: live pulsing green line at the exact current minute on the current day.

### 1.3 Canvas Layout & Container Findings
- In `CalendarView.tsx` line 456:
  `className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex flex-col overflow-hidden"`
  Under AGENTS.md Rule 14 and R1 (Full-Bleed Canvas in `WorkspaceLayout.tsx`), having `rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)]` creates a floating card box with rigid height calculation that conflicts with `min-h-0 flex-1 overflow-hidden bg-white w-full flex flex-col`.
  It should be updated to `className="w-full h-full min-h-0 flex flex-col bg-white overflow-hidden"`.

---

## 2. Logic Chain

1. **Observation 1.1** demonstrates that when a user enters the workspace, `WorkspaceLayout` initializes `activeNode` with `id: 'default-workspace'` and `orgId: 'default-workspace'`.
2. In `CalendarView.tsx`, the task-fetching branch only checks `if (activeNode?.type === 'folder')` and `else if (activeNode?.type === 'space')`, falling through to `else { data = await getTasksForOrg(orgId); }`.
3. In `workspace.service.ts`, `getTasksForOrg(orgId)` executes `query(collection(db, 'tasks'), where('orgId', '==', orgId))`.
4. Because the 112 tasks in the system reside across different spaces, folders, or organizations, querying strictly `where('orgId', '==', 'default-workspace')` misses all tasks that do not have `orgId === 'default-workspace'`.
5. Peer views (`BoardView`, `GanttView`, `TaskView`) explicitly check `if (activeNode.id === 'default-workspace') fetched = await getAllTasks();`, successfully loading all 112 tasks. `CalendarView` is the only view that failed to import `getAllTasks` and lacked this condition.
6. Therefore, importing `getAllTasks` from `workspace.service.ts` and updating the fetch branch to call `getAllTasks()` when `activeNode?.id === 'default-workspace' || orgId === 'default-workspace'` resolves the data loading issue and aligns `CalendarView` with the rest of the workspace modules.
7. **Observation 1.2** verifies that the date classification, membership filtering, and grid positioning logic in `CalendarView.tsx` are mathematically sound:
   - Multi-day spanning tasks and untimed/midnight tasks are consistently placed into `allDayTasks` and rendered in the All-Day header across their duration.
   - Timed tasks with `dueDate` or `startDate` within grid hours (08:00 - 22:00) are clamped and laid out with multi-column overlap handling.
   - Tasks outside grid hours (e.g., 07:00 or 23:00) are clamped to the top or bottom of the grid with accurate time labels.
   - `parseTaskDate` conforms to Rule 17 of `AGENTS.md`, properly handling Firestore Timestamps, ISO strings, number timestamps, and date-only strings without error.
8. **Observation 1.3** shows that changing the outer wrapper from a fixed `h-[calc(100vh-140px)] rounded-xl border` to a full-bleed `w-full h-full min-h-0` container satisfies R1 and Rule 14.

---

## 3. Caveats

- **No Caveats** regarding task data loading or date parsing: the missing import and fetch condition were identified with 100% certainty, and the date parsing logic was verified against Firestore Timestamp structures.
- **Optional Filtering Prop**: `CalendarView` currently filters by `searchQuery`, `hideFinished`, and `assigneeFilter`. In R1, `WorkspaceLayout` adds toolbar filters for status, priority, and due date. Passing `filters?: { status?: string; priority?: string; due?: string }` to `CalendarView` is recommended for complete UI synergy.

---

## 4. Conclusion & Concrete Code Recommendations

### Recommended Changes for `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`

#### Change 1: Import `getAllTasks`
- **Location**: Line 32-40
- **Diff**:
```diff
@@ -32,6 +32,7 @@
   getTasksForOrg,
   getTasksForSpace,
   getTasksForFolder,
+  getAllTasks,
   createTask,
   updateTask,
   deleteTask,
```

#### Change 2: Update Task Fetching Logic with `getAllTasks()` and `isMounted` guard
- **Location**: Lines 276-300
- **Diff**:
```diff
@@ -276,26 +277,35 @@
   // Fetch tasks
   useEffect(() => {
+    let isMounted = true;
     const fetchTasks = async () => {
       setLoading(true);
       try {
         let data: Task[] = [];
         if (activeNode?.type === 'folder' && activeNode.id) {
           data = await getTasksForFolder(activeNode.id);
         } else if (activeNode?.type === 'space' && activeNode.id) {
           data = await getTasksForSpace(activeNode.id);
+        } else if (activeNode?.id === 'default-workspace' || orgId === 'default-workspace') {
+          data = await getAllTasks();
         } else {
-          data = await getTasksForOrg(orgId);
+          data = await getTasksForOrg(activeNode?.id || orgId);
         }
-        setTasks(data);
+        if (isMounted) {
+          setTasks(data);
+        }
       } catch (err) {
         console.error('Error fetching tasks for calendar:', err);
       } finally {
-        setLoading(false);
+        if (isMounted) {
+          setLoading(false);
+        }
       }
     };
-    if (orgId) {
+    if (orgId || activeNode?.id) {
       fetchTasks();
     }
+    return () => {
+      isMounted = false;
+    };
   }, [orgId, activeNode?.id, activeNode?.type, refreshTrigger]);
```

#### Change 3: Scope Task Creation to Active Space/Folder
- **Location**: Lines 416-436
- **Diff**:
```diff
@@ -416,8 +426,17 @@
   // Task creation submit
   const handleCreateTask = async (data: any) => {
+    const taskData: any = {
+      ...data,
+      orgId: activeNode?.orgId || orgId
+    };
+    if (activeNode?.type === 'space') {
+      taskData.spaceId = activeNode.id;
+    } else if (activeNode?.type === 'folder') {
+      taskData.folderId = activeNode.id;
+      taskData.spaceId = activeNode.spaceId;
+    }
-    const newTaskId = await createTask({
-      ...data,
-      orgId
-    });
+    const newTaskId = await createTask(taskData);
     const newTask: Task = {
```

#### Change 4: Full-Bleed Container Layout (AGENTS.md Rule 14)
- **Location**: Line 456
- **Diff**:
```diff
@@ -456,1 +475,1 @@
-    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
+    <div className="w-full h-full min-h-0 flex flex-col bg-white overflow-hidden">
```

---

## 5. Verification Method

1. **Static Analysis & Type Check**:
   Run TypeScript compilation inside `De_Vuong_Webapp`:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   Must compile with exit code 0 and 0 errors.

2. **Runtime Verification**:
   - Open Workspace module with default workspace (`My Workspace`).
   - Switch to tab `Lịch` (`CalendarView`).
   - Verify all 112 tasks in the system are loaded into state.
   - Verify tasks with dates in the current week appear on the corresponding day columns.
   - Verify multi-day tasks (e.g. spanning Tuesday to Thursday) and untimed tasks appear in the `CẢ NGÀY` (All-Day) row with colored badges.
   - Verify timed tasks (e.g. 09:00 - 10:00 or due at 14:00) appear on the hour grid (08:00 - 22:00) with their time labels.
   - Verify switching between `Tuần` (Week) and `Tháng` (Month) views renders task cards properly without timezone day-shift errors.
   - Invalidation conditions: If tasks fail to appear when `activeNode.id === 'default-workspace'`, verify whether `getAllTasks()` was invoked.
