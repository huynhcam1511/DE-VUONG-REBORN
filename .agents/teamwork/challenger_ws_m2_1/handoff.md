# Milestone 2 Empirical Verification Report: Calendar Week Timeline & Default DateTime

**Verdict**: **APPROVE**

---

## 1. Observation

Direct observations from source inspection and command executions:

### A. Source Code Inspection
- **`De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`**:
  - **7 Columns Mon->Sun (T2->CN)**:
    - Line 60: `const WEEK_DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];`
    - Line 301: `const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);`
    - Line 302: `const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);`
    - Lines 524-535: Header renders `WEEK_DAY_LABELS[idx]` and `format(day, 'd')`.
  - **Vertical Hour Axis 08:00 - 22:00 (14 hours)**:
    - Lines 54-59:
      ```typescript
      const START_HOUR = 8;
      const END_HOUR = 22;
      const TOTAL_HOURS = END_HOUR - START_HOUR; // 14 hours
      const TOTAL_MINUTES = TOTAL_HOURS * 60; // 840 minutes
      const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR); // [8, 9, ..., 21]
      const HOUR_MARKERS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR); // [8, 9, ..., 22]
      ```
    - Lines 597-624: Scrollable container with fixed height `728px` (14 slots × `52px`), with labels from `08:00` to `22:00`.
  - **Emerald Current Time Indicator**:
    - Lines 394-398:
      ```typescript
      const nowMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      const isTimeInGrid = nowMinutes >= 0 && nowMinutes <= TOTAL_MINUTES;
      const currentIndicatorTop = (Math.max(0, Math.min(TOTAL_MINUTES, nowMinutes)) / TOTAL_MINUTES) * 100;
      const todayIndex = weekDays.findIndex((d) => isSameDay(d, now));
      const isCurrentWeek = todayIndex !== -1;
      ```
    - Lines 735-773: Indicator badge in `bg-emerald-600` with white pulsing dot (`animate-pulse`), dashed emerald guideline across the week (`border-emerald-300/80`), solid emerald bar (`border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]`) with pulsing dot (`animate-ping`, `bg-emerald-600`) on Today's column.
  - **Task Block Positioning (`startDate` -> `dueDate`)**:
    - Lines 137-205: `calculateDayTimedLayout` implements bin-packing column allocation for concurrent overlapping tasks.
    - Lines 631-663: `rawDayTimed` converts start and due timestamps into minute offsets from 08:00, with minimum duration clamping (30/45 min) and label formatting (`HH:mm - HH:mm`).
  - **All-Day Header Section**:
    - Lines 84-104: `isTaskAllDay` checks for multi-day spans, untimed tasks (`!start && !due`), midnight/23:59 tasks, and `task.isAllDay`.
    - Lines 544-590: Dedicated sticky header section labeled `Cả ngày` rendering all-day cards with priority colors.
  - **Week/Month View Mode Switcher**:
    - Lines 218: `const [viewMode, setViewMode] = useState<'week' | 'month'>('week');`
    - Lines 466-489: Pill toggle switcher with `Tuần` and `Tháng` buttons.
    - Lines 504-859: Dynamic rendering of Week timeline or Month calendar grid.

- **`De_Vuong_Webapp/src/components/workspace/WorkspaceModals.tsx`**:
  - Lines 780-783 & 790-796: `CreateTaskModal` defaults `startDateStr` and `dueDateStr` to Today (`format(now, 'yyyy-MM-dd')`), `startTimeStr` to `'09:00'`, and `dueTimeStr` to `'10:00'`.
  - Lines 866-876: Form submission resets fields back to Today's date and default times.

### B. Command Executions
1. `npm run test:workspace` in `De_Vuong_Webapp`:
   - Command: `node --import tsx --test tests/wrk-data-01.test.ts tests/mobileSwipe.test.ts`
   - Result: 8 tests passed, 0 failures, duration 138.1ms.
2. `npm run build` in `De_Vuong_Webapp`:
   - Command: `vite build`
   - Result: Exit code 0, 3787 modules transformed, built in 17.46s.
3. Automated Empirical Verification Suite `tests/calendar-m2-verification.test.ts`:
   - Command: `node --import tsx --test tests/calendar-m2-verification.test.ts`
   - Result: 19 tests passed across 7 suites, 0 failures, duration 1436.4ms.

---

## 2. Logic Chain

1. **Week Grid Correctness (Observation 1A)**:
   - Week starts strictly on Monday via `weekStartsOn: 1`.
   - Days array is of fixed size 7 (`addDays(weekStart, 0..6)`).
   - Labels map directly to Vietnamese weekday acronyms (`T2` through `CN`).
   - Verified across multiple calendar dates (year-end, leap year, month boundaries).

2. **Hour Grid Geometry (Observation 1A & Command 3)**:
   - Time span is 14 hours (`8:00` to `22:00` inclusive), totaling 840 minutes.
   - Slot height of 52px across 14 intervals matches 728px total grid height.
   - Indicator position calculation `(nowMinutes / 840) * 100` correctly places 08:00 at 0%, 15:00 at 50%, and 22:00 at 100%.

3. **Current Time Indicator Robustness (Observation 1A & Command 3)**:
   - Time outside 08:00 - 22:00 is guarded by `isTimeInGrid`.
   - Indicator only renders when current view includes today (`isCurrentWeek`).
   - High visual contrast and emerald styling match user requirements.

4. **Task Placement & Collision Resolution (Observation 1A & Command 3)**:
   - Single-day tasks occupy appropriate vertical slots.
   - Tasks without a defined end time or with `start === due` get a 30-45 minute display block.
   - Under heavy concurrency (e.g. 10 overlapping tasks), horizontal columns split evenly (`100 / totalCols`) and width is bounded within `[left, left + width] <= 100%`.
   - Multi-day and untimed tasks are routed to the All-Day header section.

5. **Modal Default Values (Observation 1A & Command 3)**:
   - `CreateTaskModal` in `WorkspaceModals.tsx` initial state and `isOpen` effect both populate date fields with Today's date (`yyyy-MM-dd`), meeting the acceptance criterion.

6. **Production Readiness (Command 1 & 2)**:
   - Workspace unit tests pass cleanly.
   - TypeScript compilation and Vite production bundling succeed with exit code 0.

---

## 3. Caveats

- In `tsc --noEmit`, pre-existing type errors exist in legacy admin modules (`AdminLedgerModule.tsx`, `ClassDetail.tsx`, `CRMAdmissionsModule.tsx`, `StudentPortal.tsx`), but `CalendarView.tsx`, `WorkspaceModals.tsx`, and all files under `src/components/workspace/` have 0 TypeScript errors.
- Real-time Firestore synchronization of the calendar relies on standard Firebase listeners already verified in workspace service layer tests.

---

## 4. Conclusion

All acceptance criteria for Milestone 2 have been empirically verified and stress-tested. The implementations of `CalendarView.tsx` and `WorkspaceModals.tsx` satisfy all functional, algorithmic, and visual specifications.

**Verdict**: **APPROVE**

---

## 5. Verification Method

To independently re-verify:

```bash
# 1. Run empirical verification test suite
cd De_Vuong_Webapp
node --import tsx --test tests/calendar-m2-verification.test.ts

# 2. Run standard workspace tests
npm run test:workspace

# 3. Verify production build
npm run build
```
