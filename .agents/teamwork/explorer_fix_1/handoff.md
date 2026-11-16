# Handoff Report — R1: Calendar View Task Rendering & Safe Date Parsing Investigation

**Agent**: `explorer_fix_1` (Teamwork Explorer)  
**Coordination Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_fix_1`  
**Target Module**: `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`  
**Related Files**: `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`, `AGENTS.md` (Rule 17)  
**Date**: 2026-11-16  

---

## 1. Observation

Direct examination of `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` and related workspace layout components revealed the following concrete observations:

### Observation 1.1: Incomplete Date Parsing in `parseTaskDate` (Lines 63–81)
`CalendarView.tsx` defines an internal helper `parseTaskDate`:
```typescript
// Helper to parse Firestore Timestamp / string / Date safely
function parseTaskDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate();
    } catch {
      return null;
    }
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
```
**Defects identified**:
1. Does NOT handle serialized Firestore Timestamps with `_seconds` property (`{ _seconds: number, _nanoseconds?: number }`), which are commonly generated when data is serialized/deserialized or passed from Firebase Admin / REST APIs. It falls through to line 80 and returns `null`.
2. Does NOT handle numeric timestamps (`typeof val === 'number'`, e.g., epoch milliseconds `1763424000000` or epoch seconds `1763424000`), returning `null`.
3. Does NOT handle objects with `.toMillis()` methods.
4. Does NOT validate `val.seconds` against `NaN`: `return new Date(val.seconds * 1000)` can return an `Invalid Date` instance if `val.seconds` is not a finite number.
5. In string parsing (`typeof val === 'string'`), pure date strings formatted as `YYYY-MM-DD` (e.g. `"2026-11-20"`) passed to `new Date("2026-11-20")` are parsed by JavaScript as UTC midnight (`2026-11-20T00:00:00.000Z`). In negative UTC offsets (e.g., UTC-5), this shifts the date backwards to `2026-11-19 19:00`, placing the task on the wrong day.

### Observation 1.2: All-Day and Untimed Task Classification Failure in `isTaskAllDay` (Lines 84–104)
```typescript
// Check if a task is all-day or untimed
function isTaskAllDay(task: Task, start: Date | null, due: Date | null): boolean {
  if ((task as any).isAllDay) return true;
  if (!start && !due) return true;

  // Multi-day spanning tasks belong in All-Day header
  if (start && due && !isSameDay(start, due)) {
    return true;
  }

  const isMidnightOrEOD = (d: Date) =>
    (d.getHours() === 0 && d.getMinutes() === 0) ||
    (d.getHours() === 23 && d.getMinutes() === 59);

  if (start && due) {
    return isMidnightOrEOD(start) && isMidnightOrEOD(due);
  }
  if (start) return isMidnightOrEOD(start);
  if (due) return isMidnightOrEOD(due);

  return false;
}
```
**Defects identified**:
1. `isMidnightOrEOD` only inspects local time (`d.getHours() === 0` or `23`). In Vietnam (`UTC+7`), any timestamp stored at UTC midnight (`00:00:00.000Z`) has local `d.getHours() === 7` and `d.getMinutes() === 0`. Because 7 is neither 0 nor 23, `isMidnightOrEOD` returns `false`.
2. A task with only a `dueDate` stored as UTC midnight or date-only is misclassified as a **timed task** at 07:00 AM instead of an all-day task on its due date.
3. Furthermore, EOD tasks with `23:59:59` or `23:58` fail if seconds/minutes differ slightly.

### Observation 1.3: Uncaught `RangeError` Crash in `doesTaskBelongToDay` (Lines 107–125)
```typescript
// Check if a task falls within a specific day
function doesTaskBelongToDay(task: Task, day: Date): boolean {
  const start = parseTaskDate(task.startDate);
  const due = parseTaskDate(task.dueDate);

  if (start && due) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return (
      isWithinInterval(dayStart, { start: startOfDay(start), end: endOfDay(due) }) ||
      isWithinInterval(dayEnd, { start: startOfDay(start), end: endOfDay(due) }) ||
      isSameDay(day, start) ||
      isSameDay(day, due)
    );
  }
  if (due) return isSameDay(day, due);
  if (start) return isSameDay(day, start);

  return false;
}
```
**Defects identified**:
In `date-fns`, `isWithinInterval(date, { start, end })` throws a fatal `RangeError: The start of an interval cannot be after its end` if `start > end`. If any task in Firestore has a `startDate` later than `dueDate` (due to inverted inputs or data corruption), evaluating `doesTaskBelongToDay` throws an unhandled `RangeError`, crashing the entire React render tree with a blank screen.

### Observation 1.4: Off-Screen Clipping of Late Timed Tasks in Week Grid (Lines 632–664)
```typescript
                  const rawDayTimed = timedTasks
                    .filter((t) => doesTaskBelongToDay(t, day))
                    .map((t) => {
                      const start = parseTaskDate(t.startDate);
                      const due = parseTaskDate(t.dueDate);
                      let startM = 0;
                      let endM = 60;
                      let timeLabel = '';

                      if (start && due && isSameDay(start, day)) {
                        startM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        endM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        if (endM <= startM) endM = startM + 45;
                        timeLabel = `${format(start, 'HH:mm')} - ${format(due, 'HH:mm')}`;
                      } else if (due && isSameDay(due, day)) {
                        const dueM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        startM = Math.max(0, dueM - 60);
                        endM = Math.min(TOTAL_MINUTES, startM + 60);
                        timeLabel = `Hạn: ${format(due, 'HH:mm')}`;
                      } else if (start && isSameDay(start, day)) {
                        startM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        endM = Math.min(TOTAL_MINUTES, startM + 60);
                        timeLabel = `${format(start, 'HH:mm')}`;
                      }

                      return {
                        task: t,
                        startM: Math.max(0, startM),
                        endM: Math.min(TOTAL_MINUTES, Math.max(startM + 30, endM)),
                        timeLabel
                      };
                    });
```
**Defects identified**:
1. When a task has only a `dueDate` at `23:00` (11 PM) on the active day, `dueM = (23 - 8) * 60 = 900`. `startM = Math.max(0, 900 - 60) = 840`. `TOTAL_MINUTES = 14 * 60 = 840`. Line 660 calculates `startM = 840` and `endM = Math.min(840, Math.max(870, 840)) = 840`.
2. In `calculateDayTimedLayout` (line 189), `top = (p.startM / TOTAL_MINUTES) * 100 = (840 / 840) * 100 = 100%`.
3. An element positioned at `top: 100%` within a fixed-height container of `728px` is pushed below the grid lines and becomes invisible.
4. For tasks due at or before 08:00 AM (e.g. 07:00 AM), `dueM = -60`, causing `startM = 0` and `endM = 60` (shown at 08:00–09:00 with label `Hạn: 07:00`).

### Observation 1.5: Missing Props Wiring in `WorkspaceLayout.tsx` (Line 390)
In `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`, line 390:
```tsx
{activeViewTab === 'calendar' && <CalendarView orgId={activeNode.orgId} />}
```
`CalendarView` accepts `activeNode`, `refreshTrigger`, `searchQuery`, `hideFinished`, `assigneeFilter`, and `onOpenTaskModal`. However, `WorkspaceLayout.tsx` only passes `orgId={activeNode.orgId}`:
- Scope changes (selecting a specific space or folder in the sidebar) do not affect `CalendarView`.
- Creating or editing tasks in other views or modals does not trigger a reload in `CalendarView` because `refreshTrigger` is omitted.
- Topbar search (`searchQuery`), finished tasks filter (`hideFinished`), and assignee filter (`assigneeFilter`) are completely ignored.

---

## 2. Logic Chain

1. **Date Parsing → Visibility Link**:
   - In Firestore, tasks created across different revisions, admin scripts, or CSV imports may store dates as Firestore `Timestamp` objects, serialized JSON objects (`{ _seconds, _nanoseconds }`), numeric epoch values (ms or seconds), or ISO strings.
   - When `parseTaskDate` fails to parse `{ _seconds }` or numeric epoch timestamps, it returns `null`.
   - In `doesTaskBelongToDay`, if `parseTaskDate(task.dueDate)` and `parseTaskDate(task.startDate)` return `null`, the function immediately returns `false` (Observation 1.1).
   - Therefore, valid tasks in the active week are silently dropped and never rendered in either the All-Day header or the time grid.

2. **Timezone Offset → All-Day Misclassification Link**:
   - When a task has only a date (e.g. November 20) with no specific time, it is conventionally stored as UTC midnight (`2026-11-20T00:00:00.000Z`) or a `YYYY-MM-DD` string.
   - In Vietnam (`UTC+7`), `new Date("2026-11-20T00:00:00.000Z").getHours()` equals `7`.
   - `isMidnightOrEOD` checks only `d.getHours() === 0` and `d.getHours() === 23`, both of which are false for 7 AM (Observation 1.2).
   - As a consequence, `isTaskAllDay` returns `false`, erroneously routing the task to `timedTasks` rather than `allDayTasks`.
   - On the time grid, the task is rendered as a timed box at 08:00 AM labeled `Hạn: 07:00`, instead of being placed cleanly in the `CẢ NGÀY` (All-day header) on November 20.

3. **Inverted Date Anomaly → Total Crash Link**:
   - If any task in the active workspace has `startDate > dueDate`, `doesTaskBelongToDay` calls `isWithinInterval` with `start > end`.
   - `date-fns` throws an unhandled `RangeError` (Observation 1.3), which unmounts the entire `CalendarView` component and renders a blank screen for the user.
   - Normalizing interval bounds (`intervalStart = Math.min(start, due)` and `intervalEnd = Math.max(start, due)`) completely neutralizes this crash risk.

4. **Grid Math → Off-Screen Clipping Link**:
   - The timeline grid spans 08:00 to 22:00 (14 hours = 840 minutes).
   - Any task with a `dueDate` between 22:00 and 23:59 calculates `startM >= 840`, resulting in `top = 100%` (Observation 1.4).
   - Clamping `endM` to `TOTAL_MINUTES` and `startM` to `TOTAL_MINUTES - 60` ensures evening tasks remain visible in the final grid slot (21:00–22:00) with their exact due time displayed in the label (e.g., `Hạn: 23:00`).

5. **Sub-tree Prop Forwarding Link**:
   - While `CalendarView` has built-in support for `activeNode`, `refreshTrigger`, `searchQuery`, `hideFinished`, and `assigneeFilter`, `WorkspaceLayout.tsx` neglects to pass these props (Observation 1.5).
   - Connecting these props ensures full synchronization between the workspace topbar and the calendar display.

---

## 3. Caveats

1. **No Backend Schema Changes**: The workspace tasks collection in Firestore contains heterogenous records from earlier implementations. The client-side parser must be fully backward-compatible without assuming data migrations.
2. **Read-Only Explorer Scope**: In accordance with the Teamwork Explorer archetype and mission constraints, no edits were directly applied to `De_Vuong_Webapp/` source files. All changes are documented as ready-to-apply code solutions below.
3. **Locale Setting**: The application uses the `vi` locale from `date-fns/locale`. Date formatting like `EEEEEE, dd/MM/yyyy` and `MMMM yyyy` aligns with Vietnamese SaaS standards.

---

## 4. Conclusion & Concrete Code Recommendations

To satisfy Requirement R1 fully, the implementer agent should apply the following modifications:

### Fix 1: Replace `parseTaskDate` in `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx` (Lines 63–81)

**Target Content**:
```typescript
// Helper to parse Firestore Timestamp / string / Date safely
function parseTaskDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val.toDate === 'function') {
    try {
      return val.toDate();
    } catch {
      return null;
    }
  }
  if (typeof val.seconds === 'number') {
    return new Date(val.seconds * 1000);
  }
  if (typeof val === 'string') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
```

**Replacement Content** (Adhering to AGENTS.md Rule 17):
```typescript
// Helper to parse Firestore Timestamp, string, milliseconds, seconds, Date safely (AGENTS.md Rule 17)
export function parseTaskDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val?.toDate === 'function') {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (typeof val?.toMillis === 'function') {
    try {
      const d = new Date(val.toMillis());
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  const seconds =
    typeof val?.seconds === 'number'
      ? val.seconds
      : typeof val?._seconds === 'number'
      ? val._seconds
      : null;
  if (seconds !== null) {
    const d = new Date(seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'number') {
    const ms = val < 1e11 ? val * 1000 : val;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    // Pure numeric string (e.g. "1763424000000" or "1763424000")
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      const ms = num < 1e11 ? num * 1000 : num;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    // Date-only string 'YYYY-MM-DD': parse as local midnight to avoid timezone day shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      const parsed = new Date(y, m - 1, d, 0, 0, 0, 0);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
```

---

### Fix 2: Upgrade `isTaskAllDay` in `CalendarView.tsx` (Lines 84–104)

**Target Content**:
```typescript
// Check if a task is all-day or untimed
function isTaskAllDay(task: Task, start: Date | null, due: Date | null): boolean {
  if ((task as any).isAllDay) return true;
  if (!start && !due) return true;

  // Multi-day spanning tasks belong in All-Day header
  if (start && due && !isSameDay(start, due)) {
    return true;
  }

  const isMidnightOrEOD = (d: Date) =>
    (d.getHours() === 0 && d.getMinutes() === 0) ||
    (d.getHours() === 23 && d.getMinutes() === 59);

  if (start && due) {
    return isMidnightOrEOD(start) && isMidnightOrEOD(due);
  }
  if (start) return isMidnightOrEOD(start);
  if (due) return isMidnightOrEOD(due);

  return false;
}
```

**Replacement Content**:
```typescript
// Check if a task is all-day or untimed (supports local midnight, UTC midnight, and multi-day spans)
function isTaskAllDay(task: Task, start: Date | null, due: Date | null): boolean {
  if ((task as any).isAllDay) return true;
  if (!start && !due) return true;

  // Multi-day spanning tasks belong in All-Day header
  if (start && due && !isSameDay(start, due)) {
    return true;
  }

  // Detect midnight or end-of-day in either local time or UTC
  const isUntimedOrMidnight = (d: Date) =>
    (d.getHours() === 0 && d.getMinutes() === 0) ||
    (d.getHours() === 23 && (d.getMinutes() === 59 || d.getMinutes() === 58)) ||
    (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) ||
    (d.getUTCHours() === 23 && (d.getUTCMinutes() === 59 || d.getUTCMinutes() === 58));

  if (start && due) {
    return isUntimedOrMidnight(start) && isUntimedOrMidnight(due);
  }
  if (start) return isUntimedOrMidnight(start);
  if (due) return isUntimedOrMidnight(due);

  return false;
}
```

---

### Fix 3: Harden `doesTaskBelongToDay` in `CalendarView.tsx` (Lines 107–125)

**Target Content**:
```typescript
// Check if a task falls within a specific day
function doesTaskBelongToDay(task: Task, day: Date): boolean {
  const start = parseTaskDate(task.startDate);
  const due = parseTaskDate(task.dueDate);

  if (start && due) {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    return (
      isWithinInterval(dayStart, { start: startOfDay(start), end: endOfDay(due) }) ||
      isWithinInterval(dayEnd, { start: startOfDay(start), end: endOfDay(due) }) ||
      isSameDay(day, start) ||
      isSameDay(day, due)
    );
  }
  if (due) return isSameDay(day, due);
  if (start) return isSameDay(day, start);

  return false;
}
```

**Replacement Content**:
```typescript
// Check if a task falls within a specific day (safely handles multi-day, single-date, and inverted intervals)
function doesTaskBelongToDay(task: Task, day: Date): boolean {
  const start = parseTaskDate(task.startDate);
  const due = parseTaskDate(task.dueDate);

  if (start && due) {
    // Prevent RangeError if start > due by ordering interval bounds
    const intervalStart = start <= due ? startOfDay(start) : startOfDay(due);
    const intervalEnd = start <= due ? endOfDay(due) : endOfDay(start);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    return (
      isWithinInterval(dayStart, { start: intervalStart, end: intervalEnd }) ||
      isWithinInterval(dayEnd, { start: intervalStart, end: intervalEnd }) ||
      isSameDay(day, start) ||
      isSameDay(day, due)
    );
  }
  if (due) return isSameDay(day, due);
  if (start) return isSameDay(day, start);

  return false;
}
```

---

### Fix 4: Correct Timed Task Grid Clamping & Layout in `CalendarView.tsx` (Lines 632–665)

**Target Content**:
```typescript
                  // Extract and layout timed tasks for this day
                  const rawDayTimed = timedTasks
                    .filter((t) => doesTaskBelongToDay(t, day))
                    .map((t) => {
                      const start = parseTaskDate(t.startDate);
                      const due = parseTaskDate(t.dueDate);
                      let startM = 0;
                      let endM = 60;
                      let timeLabel = '';

                      if (start && due && isSameDay(start, day)) {
                        startM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        endM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        if (endM <= startM) endM = startM + 45;
                        timeLabel = `${format(start, 'HH:mm')} - ${format(due, 'HH:mm')}`;
                      } else if (due && isSameDay(due, day)) {
                        const dueM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        startM = Math.max(0, dueM - 60);
                        endM = Math.min(TOTAL_MINUTES, startM + 60);
                        timeLabel = `Hạn: ${format(due, 'HH:mm')}`;
                      } else if (start && isSameDay(start, day)) {
                        startM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        endM = Math.min(TOTAL_MINUTES, startM + 60);
                        timeLabel = `${format(start, 'HH:mm')}`;
                      }

                      return {
                        task: t,
                        startM: Math.max(0, startM),
                        endM: Math.min(TOTAL_MINUTES, Math.max(startM + 30, endM)),
                        timeLabel
                      };
                    });
```

**Replacement Content**:
```typescript
                  // Extract and layout timed tasks for this day with robust grid bounds clamping
                  const rawDayTimed = timedTasks
                    .filter((t) => doesTaskBelongToDay(t, day))
                    .map((t) => {
                      const start = parseTaskDate(t.startDate);
                      const due = parseTaskDate(t.dueDate);
                      let startM = 0;
                      let endM = 60;
                      let timeLabel = '';

                      if (start && due && isSameDay(start, day)) {
                        const startRawM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        const dueRawM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        startM = Math.max(0, Math.min(TOTAL_MINUTES - 30, startRawM));
                        endM = Math.min(TOTAL_MINUTES, Math.max(startM + 30, dueRawM));
                        timeLabel = `${format(start, 'HH:mm')} - ${format(due, 'HH:mm')}`;
                      } else if (due && isSameDay(due, day)) {
                        const dueM = (due.getHours() - START_HOUR) * 60 + due.getMinutes();
                        if (dueM <= 0) {
                          startM = 0;
                          endM = Math.min(60, TOTAL_MINUTES);
                        } else if (dueM >= TOTAL_MINUTES) {
                          endM = TOTAL_MINUTES;
                          startM = Math.max(0, TOTAL_MINUTES - 60);
                        } else {
                          startM = Math.max(0, dueM - 60);
                          endM = Math.min(TOTAL_MINUTES, dueM);
                          if (endM - startM < 30) {
                            startM = Math.max(0, endM - 30);
                          }
                        }
                        timeLabel = `Hạn: ${format(due, 'HH:mm')}`;
                      } else if (start && isSameDay(start, day)) {
                        const startRawM = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                        if (startRawM >= TOTAL_MINUTES) {
                          endM = TOTAL_MINUTES;
                          startM = Math.max(0, TOTAL_MINUTES - 60);
                        } else if (startRawM <= 0) {
                          startM = 0;
                          endM = Math.min(60, TOTAL_MINUTES);
                        } else {
                          startM = startRawM;
                          endM = Math.min(TOTAL_MINUTES, startM + 60);
                        }
                        timeLabel = `${format(start, 'HH:mm')}`;
                      }

                      return {
                        task: t,
                        startM: Math.max(0, startM),
                        endM: Math.min(TOTAL_MINUTES, Math.max(startM + 30, endM)),
                        timeLabel
                      };
                    });
```

---

### Fix 5: Wire Full Props in `WorkspaceLayout.tsx` (Line 390)

**Target Content**:
```tsx
{activeViewTab === 'calendar' && <CalendarView orgId={activeNode.orgId} />}
```

**Replacement Content**:
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

---

## 5. Verification Method

1. **Static Analysis & Type Checking**:
   Run in `De_Vuong_Webapp`:
   ```powershell
   npm run build
   ```
   Ensure build exits with code `0` and no type errors in `CalendarView.tsx` or `WorkspaceLayout.tsx`.

2. **Test Cases for Date Parsing**:
   Verify with unit / runtime tests that `parseTaskDate`:
   - Returns valid `Date` for Firestore `Timestamp.now()`.
   - Returns valid `Date` for `{ _seconds: 1763715600, _nanoseconds: 0 }`.
   - Returns valid `Date` for numeric epoch `1763715600000`.
   - Returns valid `Date` for string `"2026-11-20"` at local midnight without 1-day shifting.
   - Returns `null` safely for `undefined`, `null`, `""`, and invalid strings without throwing.

3. **Calendar UI Verification**:
   - Navigate to Workspace → Calendar View.
   - For the active week (e.g., 16 – 22 November 2026):
     - Multi-day tasks appear spanning their date range in the "CẢ NGÀY" (All-day header).
     - Tasks with only `dueDate` and no specific hour appear on their due date in the "CẢ NGÀY" header.
     - Tasks with specific hour due dates appear in the time grid at their designated slot with label `Hạn: HH:mm`.
     - Tasks with inverted dates (`startDate > dueDate`) do not crash the component.
     - Late evening tasks (due at 22:30 or 23:00) render visibly within the 21:00–22:00 slot rather than clipping at `top: 100%`.

4. **Invalidation Conditions**:
   - Any crash when rendering a task whose `startDate > dueDate`.
   - Any task in the active week whose `dueDate` is stored as `{ _seconds, _nanoseconds }` failing to appear.
   - Any untimed task appearing as a timed box at 07:00 AM.
