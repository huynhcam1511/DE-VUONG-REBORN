# Investigation Handoff Report: R3, R4, and R5 Workspace Redesign & Build/Deploy

**Author**: `teamwork_explorer`  
**Date**: 2026-11-16  
**Target Milestone**: Workspace Module Redesign (R3, R4, R5)  
**Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_explorer_ws_full_3`  
**Canonical App Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp`

---

## 1. Observation

### 1.1 R3 — BoardView (`De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`)

Direct source inspections revealed the following implementation details:

1. **Card Box Borders, Shadows, and Pill Overload**:
   - `TaskCard` container (lines 785-796):
     ```tsx
     className="bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group relative"
     ```
     The cards are rendered as boxed containers with borders and shadows (`shadow-2xs`, `hover:shadow-xs`).
   - Priority indicator (lines 837-845):
     ```tsx
     <span 
       className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 shrink-0" 
       title="Quan trọng"
     >
       <Flag className="w-2.5 h-2.5 text-red-500 fill-red-500" />
       <span className="hidden sm:inline">Gấp</span>
     </span>
     ```
     A bordered pill badge is used, violating AGENTS.md Rule 4 (Anti-Pill Overload).
   - Due date indicator (lines 846-851):
     ```tsx
     <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-1.5 py-0.5 border shrink-0 ${isOverdue ? 'text-red-600 border-red-200 bg-red-50/70' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
       <Clock className="w-2.5 h-2.5 shrink-0" />
       <span>{new Date(task.dueDate.seconds * 1000).toLocaleDateString('vi-VN')}</span>
     </div>
     ```
     Rendered as a square `rounded-md` box with static locale date string rather than Google Tasks smart chip.

2. **Checkbox Size & Interaction**:
   - `TaskCard` checkbox button (lines 799-809):
     ```tsx
     <button 
       className={`w-4 h-4 rounded-full border flex shrink-0 items-center justify-center transition-colors ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white hover:border-emerald-600'}`}
     ```
     The checkbox is 16px (`w-4 h-4`) with a faint `border-slate-300` border, rather than the 18px (`w-[18px] h-[18px]`) hollow circular checkbox benchmarked from Google Tasks.

3. **Title Typography**:
   - `TaskCard` title (lines 813-818):
     ```tsx
     <h4 
       className={`text-xs font-semibold text-slate-800 line-clamp-2 leading-snug select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
       onPointerDown={(e) => e.stopPropagation()}
     >
       {task.title}
     </h4>
     ```
     Uses `text-xs font-semibold` (12px bold) instead of plain text `text-[13px] font-medium` (13px easily readable).

4. **Column Layout and Viewport Overflow**:
   - Column container (line 88):
     ```tsx
     className={`bg-slate-50/70 rounded-xl p-2.5 flex flex-col max-h-[calc(100vh-190px)] overflow-y-auto no-scrollbar h-fit min-w-[290px] w-[290px] shrink-0 border relative group/col transition-all duration-200 ${isTaskOver ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-slate-200/60'}`}
     ```
   - Inner task list (line 184):
     ```tsx
     <div className="overflow-y-auto space-y-1.5 pr-0.5 no-scrollbar flex-1 min-h-[60px]">
     ```
     Both outer column AND inner container have `overflow-y-auto`, and outer has `h-fit` and hardcoded `max-h-[calc(100vh-190px)]`. When `WorkspaceLayout` switches `main` to `h-full min-h-0 overflow-hidden`, columns do not fill available height and can exhibit double scrolling.

5. **Inline Task Creation Button**:
   - Line 174-182:
     ```tsx
     <button 
       onClick={() => setCreatingInCol(col.id)}
       className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 px-2 py-1.5 mb-2 rounded-lg hover:bg-emerald-50 transition-colors w-full text-left"
     >
       <Plus size={14} />
       Thêm việc cần làm
     </button>
     ```
   - Line 634:
     ```tsx
     hideCreateButton={activeNode.type !== 'folder'}
     ```
     The button was hidden when viewing organizations or spaces, blocking task creation despite backend support existing in `handleCreateInlineTask` (lines 315-336).

6. **Completed Tasks Section**:
   - Lines 190-203:
     ```tsx
     {colTasks.filter((t: any) => (t.status === 'finish' || t.status === 'cancel' || t.status === 'done')).length > 0 && (
       <div className="pt-2 pb-1 px-1">
         <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
           <span>Đã hoàn thành</span>
           <span className="w-4 h-4 rounded-full bg-slate-200/80 flex items-center justify-center text-[10px] text-slate-600 font-bold">
             {colTasks.filter((t: any) => (t.status === 'finish' || t.status === 'cancel' || t.status === 'done')).length}
           </span>
         </div>
       </div>
     )}
     {colTasks.filter((t: any) => (t.status === 'finish' || t.status === 'cancel' || t.status === 'done')).map((task: any) => (
       <TaskCard key={task.id} task={task} onClick={() => onTaskClick && onTaskClick(task)} onUpdate={col.onUpdateTask} />
     ))}
     ```
     Completed tasks are rendered statically with no collapse toggle (`isCompletedOpen`), no chevron toggle button (`ChevronDown` / `ChevronRight`), and no state management.

---

### 1.2 R4 — GanttView (`De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`)

Direct source inspections revealed:

1. **Non-Full-Bleed Container**:
   - Lines 525-527:
     ```tsx
     <div className="flex w-full h-full relative overflow-hidden">
       {/* Main Gantt Canvas */}
       <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
     ```
     `rounded-xl border border-slate-200 shadow-xs` wraps the entire Gantt inside an isolated card box, violating AGENTS.md Rule 14.

2. **Row Height & Header Synchronization**:
   - Pinned Header vs Timeline Header (lines 640-677):
     Timeline Header has 2 tiers:
     - Top Tier (line 664): `h-7` (28px).
     - Bottom Tier (line 677): `h-8` (32px).
     Total height = 28px + 32px = 60px.
     Top-Left Pinned Header (line 642):
     ```tsx
     <div className="sticky left-0 top-0 z-40 bg-slate-50 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3.5 py-2 flex flex-col justify-between shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
     ```
     Lacks an explicit `h-[60px]`, risking sub-pixel or flex height mismatches between the pinned column and timeline header.
   - Task Rows (lines 791-796):
     ```tsx
     <div key={task.id} className="group flex h-11 border-b border-slate-100 hover:bg-slate-50/60 transition-colors relative">
       {/* Left Cell: Task Summary (Sticky) */}
       <div className="sticky left-0 z-20 bg-white group-hover:bg-slate-50/90 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3 flex items-center gap-2 shrink-0 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
     ```
     Left Cell on line 796 does not have `h-full`.
   - Quick Add Rows (lines 958-959, 1001-1002):
     Left Cells also lack `h-full`.
   - Timeline Task Bar (line 918):
     `top-2` (8px) + `h-7` (28px) = 36px inside `h-11` (44px) row, providing balanced 8px margins.

---

### 1.3 R5 — Build & Deploy

Direct verification commands and configuration files:

1. **Build Verification**:
   - Command: `cd De_Vuong_Webapp; npm run build`
   - Result: Exit code 0, completed in 17.35 seconds, produced `dist/` with assets.
2. **Deploy Configuration**:
   - `firebase.json` defines site `huynhkiencam` pointing to `dist` with SPA rewrite `** -> /index.html`.
   - `.firebaserc` associates hosting target `huynhkiencam` under project `anti-gravity-katc-academy`.
   - Command: `firebase deploy --only hosting:huynhkiencam`.

---

## 2. Logic Chain

1. **AGENTS.md Rule 4 & Google Tasks Benchmark for BoardView**:
   - Observation: BoardView cards have borders, shadows, and multiple bordered badge pills.
   - Deduction: Replacing card borders and shadows with a flat row list layout (`bg-white hover:bg-slate-50/80 rounded-lg p-2.5 transition-colors border border-transparent hover:border-slate-200/60`) aligns directly with Google Tasks and AGENTS.md Rule 4.
   - Circular checkbox: Enlarging to 18px (`w-[18px] h-[18px]`) with `border-[1.5px] border-slate-400 hover:border-emerald-600` establishes the signature Google Tasks visual signature and provides a clear touch target.
   - Title: Setting `text-[13px] font-medium leading-snug` creates a clean readable plain-text title.
   - Due date chip: Transforming date display into a rounded-full chip `(🕒 Hôm nay, 12:00)` with soft color states (`text-red-700 bg-red-50/90` for overdue, `text-amber-800 bg-amber-50/90` for today, `text-slate-600 bg-slate-100/70` for future) matches Google Tasks.

2. **Column Scrolling & Viewport Containment**:
   - Observation: Dual scrollbars on column container and task list container with `h-fit` and `max-h-[calc(100vh-190px)]`.
   - Deduction: Making the column container `h-full max-h-full flex flex-col` and placing `flex-1 min-h-0 overflow-y-auto no-scrollbar` exclusively on the task list container ensures columns stretch to fill the full-bleed canvas, headers remain fixed, and task lists scroll internally without spilling over the viewport.

3. **Collapsible 'Đã hoàn thành' Section**:
   - Observation: Completed tasks are rendered statically below active tasks without collapse/expand capability.
   - Deduction: Adding local state `const [isCompletedOpen, setIsCompletedOpen] = useState(false);` in `DroppableColumn`, filtering tasks into `activeTasks` and `completedTasks`, and rendering a toggle button with `ChevronRight` / `ChevronDown` and count badge achieves the required Google Tasks collapsible completed section.

4. **GanttView Full-Bleed & Row Synchronization**:
   - Observation: Outer container has `rounded-xl border border-slate-200 shadow-xs`.
   - Deduction: Removing `rounded-xl border border-slate-200 shadow-xs` makes GanttView fill the full-bleed canvas edge-to-edge.
   - Observation: Left header cell lacks explicit `h-[60px]`, and left row cells lack `h-full`.
   - Deduction: Setting explicit `h-[60px]` on the pinned header cell (matching 28px + 32px timeline header) and `h-full` on the left cells inside `h-11` (44px) row wrappers guarantees strict 1:1 row alignment between the left pane and the right timeline pane.

---

## 3. Caveats

1. **DnD Sorting with Collapsible Section**: When `isCompletedOpen` is false, completed tasks are unmounted from the DOM. `SortableContext` should include `activeTasks` IDs (or all visible IDs) so that dragging active tasks is not affected by hidden completed tasks.
2. **Global TypeScript Status**: While `npm run build` succeeds cleanly with exit code 0, `tsc --noEmit` fails on unrelated legacy modules (`ClassDetail.tsx`, `CRMAdmissionsModule.tsx`). All edits to `BoardView.tsx` and `GanttView.tsx` must remain 100% type-safe so they never introduce TypeScript diagnostics.
3. **Task Status Values**: In `workspace.service.ts`, completed status can be represented as `'finish'`, `'cancel'`, `'done'`, or `completed: true`. The filter logic must consistently handle all completed variants: `(t.status === 'finish' || t.status === 'cancel' || t.status === 'done' || (t as any).completed === true)`.

---

## 4. Conclusion & Actionable Code Proposals

### 4.1 Concrete Changes for `BoardView.tsx`

#### A. Add Missing Icons (Line 4)
```diff
- import { Clock, Check, Flag, Plus, MoreHorizontal } from 'lucide-react';
+ import { Clock, Check, Flag, Plus, MoreHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
```

#### B. Helper Function for Google Tasks Due Date Chip
Add near top of `BoardView.tsx`:
```tsx
const formatGoogleTasksDueDate = (dueDate: any): { text: string; isOverdue: boolean; isToday: boolean } => {
  if (!dueDate) return { text: '', isOverdue: false, isToday: false };
  const dateObj = new Date(dueDate.seconds ? dueDate.seconds * 1000 : dueDate);
  const now = new Date();
  
  const isTodayDate = dateObj.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  const isPast = dateObj < now && !isTodayDate;
  
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const hasTime = hours !== 0 || minutes !== 0;
  const timeStr = hasTime 
    ? `, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}` 
    : '';

  let text = '';
  if (isTodayDate) {
    text = `Hôm nay${timeStr}`;
  } else if (isTomorrow) {
    text = `Ngày mai${timeStr}`;
  } else {
    text = `${dateObj.getDate()} thg ${dateObj.getMonth() + 1}${timeStr}`;
  }

  return { text, isOverdue: isPast, isToday: isTodayDate };
};
```

#### C. Redesign `DroppableColumn` (Lines 46-208)
```tsx
const DroppableColumn = ({ col, tasks, creatingInCol, setCreatingInCol, handleCreateInlineTask, newTaskTitle, setNewTaskTitle, newTaskDesc, setNewTaskDesc, isSubmitting, isOverlay, columns, onTaskClick }: any) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver, active, over } = useSortable({ 
    id: `col-${col.id}`,
    data: { type: 'Column', col }
  });

  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  const colTasks = tasks.filter(col.filter).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const activeTasks = colTasks.filter((t: any) => !(t.status === 'finish' || t.status === 'cancel' || t.status === 'done' || t.completed === true));
  const completedTasks = colTasks.filter((t: any) => (t.status === 'finish' || t.status === 'cancel' || t.status === 'done' || t.completed === true));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const isTaskOver = isOver && active?.data.current?.type === 'Task';
  const isColumnOver = isOver && active?.data.current?.type === 'Column' && active.id !== `col-${col.id}`;
  
  let showLeftLine = false;
  let showRightLine = false;
  
  if (isColumnOver && columns && over) {
    let currentOverId = over.id.toString().replace('col-', '');
    const isOverTask = tasks.find((t: any) => t.id === currentOverId);
    if (isOverTask) {
      const parentCol = columns.find((c: any) => c.filter(isOverTask));
      if (parentCol) currentOverId = parentCol.id;
    }

    const activeIndex = columns.findIndex((c: any) => c.id === active.id.toString().replace('col-', ''));
    const overIndex = columns.findIndex((c: any) => c.id === currentOverId);
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      if (activeIndex < overIndex) {
        showRightLine = true;
      } else {
        showLeftLine = true;
      }
    }
  }

  return (
    <div 
      ref={isOverlay ? undefined : setNodeRef} 
      style={style} 
      className={`bg-slate-50/80 rounded-xl p-2 flex flex-col h-full max-h-full min-w-[300px] w-[300px] shrink-0 border relative group/col transition-all duration-200 ${isTaskOver ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-slate-200/70'}`}
    >
      {showLeftLine && !isOverlay && (
        <div className="absolute -left-[9px] top-0 bottom-0 w-[4px] bg-blue-500 rounded-full z-50"></div>
      )}
      {showRightLine && !isOverlay && (
        <div className="absolute -right-[9px] top-0 bottom-0 w-[4px] bg-blue-500 rounded-full z-50"></div>
      )}
      
      {/* Column Header */}
      <div 
        {...attributes} 
        {...listeners}
        className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between mb-1.5 shrink-0 px-2 py-1.5 cursor-grab active:cursor-grabbing hover:bg-slate-100/70 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-xs font-bold text-slate-700 truncate tracking-tight">
            {col.name}
          </h3>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200/80 text-[10px] font-bold text-slate-600">
            {colTasks.length}
          </span>
        </div>
        <button 
          type="button" 
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors"
          aria-label="Tùy chọn cột"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      {/* Flat '+ Thêm việc cần làm' Button / Inline Creator */}
      {creatingInCol === col.id ? (
        <div 
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-2.5 mb-2 relative z-10 flex flex-col gap-2 shrink-0"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as globalThis.Node)) {
              setTimeout(() => {
                handleCreateInlineTask(col.id);
              }, 50);
            }
          }}
          tabIndex={-1}
        >
          <div className="flex items-start gap-2">
            <div className="pt-1 shrink-0">
              <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-300 bg-white" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Tiêu đề"
                className="w-full font-medium text-[13px] text-slate-800 focus:outline-none placeholder:text-slate-400 bg-transparent"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateInlineTask(col.id);
                  if (e.key === 'Escape') {
                    setCreatingInCol(null);
                    setNewTaskTitle('');
                    setNewTaskDesc('');
                  }
                }}
                disabled={isSubmitting}
              />
              
              <div className="flex items-center gap-2 text-slate-400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                <input
                  type="text"
                  placeholder="Chi tiết"
                  className="w-full text-[12px] focus:outline-none placeholder:text-slate-400 bg-transparent text-slate-600"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateInlineTask(col.id);
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button 
          type="button"
          onClick={() => setCreatingInCol(col.id)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70 px-2.5 py-1.5 mb-1.5 rounded-lg transition-colors w-full text-left shrink-0"
        >
          <Plus size={15} />
          <span>Thêm việc cần làm</span>
        </button>
      )}

      {/* Internal Scrollable Task Container */}
      <div className="overflow-y-auto space-y-1 pr-0.5 no-scrollbar flex-1 min-h-[60px]">
        <SortableContext items={colTasks.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {activeTasks.map((task: any) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick && onTaskClick(task)} 
              onUpdate={col.onUpdateTask} 
            />
          ))}
          
          {/* Collapsible Completed Section */}
          {completedTasks.length > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => setIsCompletedOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-lg transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  {isCompletedOpen ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                  <span>Đã hoàn thành</span>
                </div>
                <span className="w-4 h-4 rounded-full bg-slate-200/80 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                  {completedTasks.length}
                </span>
              </button>
              
              {isCompletedOpen && (
                <div className="space-y-1 mt-1">
                  {completedTasks.map((task: any) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onClick={() => onTaskClick && onTaskClick(task)} 
                      onUpdate={col.onUpdateTask} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
```

#### D. Redesign `TaskCard` (Lines 784-871)
```tsx
const TaskCard = ({ task, isOverlay, onClick, onUpdate }: { task: Task, isOverlay?: boolean, onClick?: () => void, onUpdate?: (id: string, updates: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    over,
    active,
  } = useSortable({ id: isOverlay ? `overlay-${task.id}` : task.id, data: { type: 'Task', task } });

  const isOver = over?.id === task.id;
  const isTaskOver = isOver && active?.data?.current?.type === 'Task';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    borderTop: isTaskOver && !isDragging ? '2px solid #10b981' : undefined,
  };

  const isCompleted = task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done' || (task as any).completed === true;
  const dueDateInfo = formatGoogleTasksDueDate(task.dueDate);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes} 
      {...listeners}
      className={`bg-white rounded-lg p-2.5 transition-all cursor-pointer group relative border border-slate-200/40 hover:border-slate-300 hover:bg-slate-50/60 ${
        isCompleted ? 'opacity-70 bg-slate-50/50' : ''
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (onClick) onClick();
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* 18px Hollow Circular Checkbox */}
        <div className="pt-0.5 shrink-0">
          <button 
            type="button"
            aria-label={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
            className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex shrink-0 items-center justify-center transition-all ${
              isCompleted 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'border-slate-400 bg-white hover:border-emerald-600 hover:bg-emerald-50/30'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (onUpdate) {
                onUpdate(task.id, { 
                  status: isCompleted ? 'planned' : 'finish' 
                });
              }
            }}
          >
            {isCompleted && <Check size={11} strokeWidth={3} />}
          </button>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-1.5">
            <h4 
              className={`text-[13px] font-medium leading-snug select-text cursor-text line-clamp-2 transition-colors ${
                isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-800 group-hover:text-slate-900'
              }`}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {task.title}
            </h4>
          </div>
          
          {task.description && (
            <p className="text-[12px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">
              {task.description}
            </p>
          )}

          {/* Meta Information: Due Date Chip, Priority, Assignees */}
          {(task.dueDate || (task.assignees && task.assignees.length > 0) || task.priority === 'high') && (
            <div className="mt-2 flex items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {task.priority === 'high' && (
                  <span 
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-600 shrink-0" 
                    title="Ưu tiên cao"
                  >
                    <Flag className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                    <span className="hidden sm:inline">Gấp</span>
                  </span>
                )}
                {task.dueDate && (
                  <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 border shrink-0 transition-colors ${
                    isCompleted
                      ? 'text-slate-400 bg-slate-100/50 border-slate-200/50 line-through'
                      : dueDateInfo.isOverdue
                      ? 'text-red-700 bg-red-50/90 border-red-200'
                      : dueDateInfo.isToday
                      ? 'text-amber-800 bg-amber-50/90 border-amber-200'
                      : 'text-slate-600 bg-slate-100/70 border-slate-200/70'
                  }`}>
                    <Clock className="w-2.5 h-2.5 shrink-0 opacity-70" />
                    <span>{dueDateInfo.text}</span>
                  </div>
                )}
              </div>

              {/* Minimalist Assignee Stack */}
              <div className="flex items-center -space-x-1 shrink-0 overflow-hidden">
                {resolveTaskAssigneesList(task.assignees, auth.currentUser?.uid).map((assignee) => (
                  <div 
                    key={assignee.id} 
                    className={`w-5 h-5 rounded-full ring-1.5 ring-white flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${assignee.color}`} 
                    title={assignee.name}
                  >
                    {assignee.initials}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

#### E. Enable Create Button for All Columns (Line 634)
```diff
- hideCreateButton={activeNode.type !== 'folder'}
```
Remove `hideCreateButton` prop so that the flat `+ Thêm việc cần làm` button is accessible across all columns.

---

### 4.2 Concrete Changes for `GanttView.tsx`

#### A. Full-Bleed Outer Container (Lines 525-528)
```diff
- <div className="flex w-full h-full relative overflow-hidden">
-   {/* Main Gantt Canvas */}
-   <div className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
+ <div className="flex w-full h-full relative overflow-hidden flex-col bg-white">
+   {/* Main Gantt Canvas (Full-Bleed) */}
+   <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden h-full">
```

#### B. Header Height Synchronization (Line 642)
```diff
- <div className="sticky left-0 top-0 z-40 bg-slate-50 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3.5 py-2 flex flex-col justify-between shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
+ <div className="sticky left-0 top-0 z-40 bg-slate-50 w-[340px] min-w-[340px] max-w-[340px] h-[60px] border-r border-slate-200 px-3.5 py-2 flex flex-col justify-between shrink-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
```

#### C. Row Height 1:1 Synchronization (Lines 791, 796, 959, 1002)
1. Task Rows (Line 791, 796):
```diff
- <div key={task.id} className="group flex h-11 border-b border-slate-100 hover:bg-slate-50/60 transition-colors relative">
-   <div className="sticky left-0 z-20 bg-white group-hover:bg-slate-50/90 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3 flex items-center gap-2 shrink-0 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
+ <div key={task.id} className="group flex h-11 min-h-[44px] max-h-[44px] border-b border-slate-100 hover:bg-slate-50/60 transition-colors relative">
+   <div className="sticky left-0 z-20 bg-white group-hover:bg-slate-50/90 w-[340px] min-w-[340px] max-w-[340px] h-full border-r border-slate-200 px-3 flex items-center gap-2 shrink-0 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)]">
```

2. Inline Quick Add Rows (Lines 959, 1002):
```diff
- <div className="sticky left-0 z-20 bg-blue-50/90 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3 flex items-center gap-2 shrink-0">
+ <div className="sticky left-0 z-20 bg-blue-50/90 w-[340px] min-w-[340px] max-w-[340px] h-full border-r border-slate-200 px-3 flex items-center gap-2 shrink-0">
```
```diff
- <div className="sticky left-0 z-20 bg-white hover:bg-slate-50 w-[340px] min-w-[340px] max-w-[340px] border-r border-slate-200 px-3 flex items-center shrink-0">
+ <div className="sticky left-0 z-20 bg-white hover:bg-slate-50 w-[340px] min-w-[340px] max-w-[340px] h-full border-r border-slate-200 px-3 flex items-center shrink-0">
```

---

## 5. Verification Method

To independently verify the implementation:

1. **Static Build Verification**:
   ```powershell
   cd De_Vuong_Webapp
   npm run build
   ```
   **Expected**: Exit code 0, Vite build completes with production assets in `dist/`.

2. **Visual & Interactive Verification of BoardView (R3)**:
   - Navigate to `/admin?tab=workspace` and click on tab **Bảng (Board)**.
   - Confirm tasks render in flat rows without box shadows or heavy pill borders.
   - Click the 18px circular checkbox on any task: verify it transitions to green with a checkmark and title strikes through.
   - Verify due dates display in rounded-full chips: today is soft amber, overdue is soft red, upcoming is soft slate.
   - Verify "+ Thêm việc cần làm" appears at the top of each column.
   - Scroll inside a column with many tasks: confirm the task list scrolls smoothly without overflowing the viewport.
   - Verify completed tasks are grouped under "Đã hoàn thành" with count and chevron toggle (`ChevronRight` / `ChevronDown`).

3. **Visual & Interactive Verification of GanttView (R4)**:
   - Navigate to tab **Gantt**.
   - Confirm canvas is full-bleed with no rounded corners or outer padding borders (`rounded-xl border shadow-xs` removed).
   - Verify left pinned pane and right timeline pane align 1:1 row for row at 44px (`h-11`), and headers match at 60px.
   - Switch zoom scales (`Ngày`, `Tuần`, `Tháng`): verify row heights remain synchronized and the today line aligns accurately.

4. **Production Deployment Verification (R5)**:
   ```powershell
   cd De_Vuong_Webapp
   firebase deploy --only hosting:huynhkiencam
   ```
   **Expected**: Firebase CLI deploys `dist` to `https://huynhkiencam.web.app` successfully.
