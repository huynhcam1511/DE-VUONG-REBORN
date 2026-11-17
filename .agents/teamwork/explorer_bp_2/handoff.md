# Handoff Report: Task Title & DueDate Chip Formatting in BoardView.tsx

## 1. Observation

Direct observations from `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`:

- **Component Location**: All relevant task rendering occurs inside `TaskCard` (declared at line 696). `TaskCard` is rendered for both active and completed tasks within `DroppableColumn` (lines 187, 202) and `DragOverlay` (line 650).
- **Current `isOverdue` Logic (Line 736)**:
  ```tsx
  const isOverdue = task.dueDate && new Date(task.dueDate.seconds * 1000) < new Date();
  ```
  *Issue observed*:
  1. It assumes `task.dueDate` always has a `.seconds` property. If `dueDate` is a Date object or ISO string, it evaluates to `NaN` and fails silently.
  2. It does not check if the task is already completed (`task.status === 'finish' || task.status === 'cancel' || task.status === 'done'`). If a task finished past its deadline, it erroneously continues to show the overdue styling.
- **Current Task Title Styling & Rendering (Lines 824-829)**:
  ```tsx
  <h4 
    className={`text-[13px] font-normal text-slate-800 line-clamp-2 leading-5 select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
    onPointerDown={(e) => e.stopPropagation()}
  >
    {task.title}
  </h4>
  ```
  *Issue observed*:
  1. Font size is `text-[13px]`, slightly smaller than the Google Tasks benchmark of `text-[13.5px]`.
  2. `{task.title}` renders raw text directly. In existing data, multiple tasks were typed in ALL CAPS (`PHÚC GỢI Ý LÀM APP...`, `KHAI GIẢNG KHÓA ĐÀO TẠO...`), appearing shouting, rigid, and hard to read.
- **Current DueDate Chip Styling & Rendering (Lines 857-862)**:
  ```tsx
  {task.dueDate && (
    <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 border shrink-0 ${isOverdue ? 'text-rose-600 border-rose-200 bg-rose-50/70' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
      <Clock className="w-2.5 h-2.5 shrink-0" />
      <span>{new Date(task.dueDate.seconds * 1000).toLocaleDateString('vi-VN')}</span>
    </div>
  )}
  ```
  *Issue observed*:
  1. The chip uses solid/tinted backgrounds `bg-rose-50/70` and `bg-slate-50`, violating the Google Tasks flat design and the project's Anti-Pill Overload rule.
  2. The borders `border-rose-200` and `border-slate-200` are fully opaque instead of subtle transparent borders (`border-rose-200/80` and `border-slate-200/80`).
  3. `new Date(task.dueDate.seconds * 1000)` has no fallback parsing for non-Timestamp representations.

## 2. Logic Chain

1. **Step 1 (DueDate Chip Flattening)**:
   - From `ORIGINAL_REQUEST.md` (Item 2) and `board_view_google_tasks_polish_plan.md` (Component 2), the chip must remove any solid/tinted background (`bg-rose-50/70` / `bg-slate-50`) in favor of `bg-transparent`.
   - The border must be subtle (`border-rose-200/80` for overdue, `border-slate-200/80` for normal).
   - Text color must carry the visual semantics: `text-rose-600` for overdue and `text-slate-600` for normal.
   - A helper `formatDueDate` provides safe date parsing across Firebase `Timestamp` (seconds or `.toDate()`), native `Date`, or ISO string, outputting `d.toLocaleDateString('vi-VN')` (e.g. `10/10/2026`).

2. **Step 2 (Overdue State Accuracy)**:
   - Overdue indication should strictly flag actionable unfinished tasks.
   - Defining `const isCompleted = task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done'` ensures completed tasks in the "Đã hoàn thành" section are not marked with red overdue text/borders.
   - `isOverdue` is calculated as `!isCompleted && dueTime !== null && dueTime < Date.now()`.

3. **Step 3 (Task Title Sizing & Natural Case Normalization)**:
   - From `ORIGINAL_REQUEST.md` (Item 3) and `board_view_google_tasks_polish_plan.md` (Component 3), the title needs to be natural sentence case, crisp, and sized at `text-[13.5px] font-normal text-slate-800 leading-5`.
   - When raw data has ALL CAPS text like `"PHÚC GỢI Ý LÀM APP GIAO HÀNG TẬN NƠI"`, a lightweight normalizer `formatTaskTitle` detects full uppercase strings with spaces (or length > 5) and converts them to sentence case (`"Phúc gợi ý làm app giao hàng tận nơi"`). Short acronyms (e.g. `"CRM"`, `"ERP"`) remain intact.
   - Line-clamp remains at `line-clamp-2` with `select-text cursor-text` to permit text selection.

## 3. Caveats

- **Inline Edit Input**: Line 753 currently has `text-[14px] font-medium` during inline editing. This does not affect normal reading display; worker can optionally align it to `text-[13.5px] font-normal` if desired.
- **Priority Badge**: Line 850 has a small red badge for `task.priority === 'high'` (`"Gấp"`). The plan does not require removing it, but it sits adjacent to the due date chip in the metadata row.
- **Subtasks (Component 4)**: Will be rendered in `TaskCard` between description (line 843) and metadata (line 845). The title and due date changes proposed here will not conflict with subtasks.

## 4. Conclusion & Concrete Code Proposal

The Worker should apply the following changes to `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`:

### A. Add Helpers above `TaskCard` (around line 695):
```tsx
const formatDueDate = (dueDate: any): string => {
  if (!dueDate) return '';
  let d: Date | null = null;
  if (dueDate instanceof Date) {
    d = dueDate;
  } else if (typeof dueDate?.toDate === 'function') {
    try { d = dueDate.toDate(); } catch {}
  } else if (typeof dueDate?.seconds === 'number') {
    d = new Date(dueDate.seconds * 1000);
  } else if (typeof dueDate?._seconds === 'number') {
    d = new Date(dueDate._seconds * 1000);
  } else if (typeof dueDate === 'string' || typeof dueDate === 'number') {
    const parsed = new Date(dueDate);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d || isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

const formatTaskTitle = (title: string): string => {
  if (!title) return '';
  const isAllUpper = title === title.toUpperCase() && title !== title.toLowerCase();
  if (isAllUpper && (title.includes(' ') || title.length > 5)) {
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }
  return title;
};

const getDueDateTime = (dueDate: any): number | null => {
  if (!dueDate) return null;
  if (dueDate instanceof Date) return dueDate.getTime();
  if (typeof dueDate?.toDate === 'function') {
    try { return dueDate.toDate().getTime(); } catch {}
  }
  if (typeof dueDate?.seconds === 'number') return dueDate.seconds * 1000;
  if (typeof dueDate?._seconds === 'number') return dueDate._seconds * 1000;
  if (typeof dueDate === 'string' || typeof dueDate === 'number') {
    const t = new Date(dueDate).getTime();
    return isNaN(t) ? null : t;
  }
  return null;
};
```

### B. In `TaskCard` (Line 736):
**Before:**
```tsx
  const isOverdue = task.dueDate && new Date(task.dueDate.seconds * 1000) < new Date();
```
**After:**
```tsx
  const isCompleted = task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done';
  const dueTime = getDueDateTime(task.dueDate);
  const isOverdue = !isCompleted && dueTime !== null && dueTime < Date.now();
```

### C. In `TaskCard` (Lines 824-829):
**Before:**
```tsx
            <h4 
              className={`text-[13px] font-normal text-slate-800 line-clamp-2 leading-5 select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {task.title}
            </h4>
```
**After:**
```tsx
            <h4 
              className={`text-[13.5px] font-normal text-slate-800 line-clamp-2 leading-5 select-text cursor-text ${isCompleted ? 'line-through text-slate-400' : ''}`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {formatTaskTitle(task.title)}
            </h4>
```

### D. In `TaskCard` (Lines 857-863):
**Before:**
```tsx
                {task.dueDate && (
                  <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 border shrink-0 ${isOverdue ? 'text-rose-600 border-rose-200 bg-rose-50/70' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span>{new Date(task.dueDate.seconds * 1000).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
```
**After:**
```tsx
                {task.dueDate && (
                  <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 border shrink-0 ${
                    isOverdue 
                      ? 'text-rose-600 border-rose-200/80 bg-transparent' 
                      : 'text-slate-600 border-slate-200/80 bg-transparent'
                  }`}>
                    <Clock className="w-2.5 h-2.5 shrink-0" />
                    <span>{formatDueDate(task.dueDate)}</span>
                  </div>
                )}
```

## 5. Verification Method

1. **Static Analysis & Build Verification**:
   Run in `De_Vuong_Webapp/`:
   ```bash
   npm run build
   ```
   Ensure 0 TypeScript errors and successful Vite build output.
2. **Visual Inspection**:
   - Verify due date chip has no colored background (`bg-transparent`), only subtle border (`border-rose-200/80` or `border-slate-200/80`), crisp text color (`text-rose-600` or `text-slate-600`).
   - Verify completed tasks in "Đã hoàn thành" section do not retain red overdue styling.
   - Verify task titles are rendered in `text-[13.5px] font-normal text-slate-800` and all-caps titles are rendered in natural sentence case.
3. **Invalidation Conditions**:
   - If `npm run build` fails on type errors or syntax.
   - If any `bg-rose-50` or `bg-slate-50` remains on the due date chip.
