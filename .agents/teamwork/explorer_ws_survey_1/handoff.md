# Handoff Report: Requirement R1 (Board View Polish) Survey

**Agent**: `explorer_ws_survey_1`  
**Working Directory**: `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_ws_survey_1`  
**Date**: 2026-11-16  
**Scope**: Workspace Module Board View Polish (`De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`)

---

## 1. Observation

### 1.1 Context and Repository Policies
- **Canonical Workspace**: Per `AGENTS.md`, `De_Vuong_Webapp/` is the only editable application. `archives/` is read-only. All commands must be executed within `De_Vuong_Webapp/`.
- **Integrity Rule**: Per `De_Vuong_Webapp/tests/wrk-data-01.test.ts` (lines 48-56), `BoardView.tsx` must strictly adhere to the single `Task` contract and must **not** contain references to `workspace_lists` or `listId`.
- **Existing Test Status**: Running `npm run test:workspace` inside `De_Vuong_Webapp/` currently passes all 8 test suites cleanly (including `wrk-data-01.test.ts` and `mobileSwipe.test.ts`).

### 1.2 Kanban Column Container (`DroppableColumn`) Observations
File: `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`
- **Line 85 (Column Container)**:
  ```tsx
  <div ref={isOverlay ? undefined : setNodeRef} style={style} className={`bg-white rounded-[24px] p-4 flex flex-col max-h-[calc(100vh-180px)] h-fit min-w-[340px] w-[340px] shrink-0 border-2 relative group/col transition-all duration-200 ${isTaskOver ? 'border-slate-200' : 'border-transparent'}`}>
  ```
  *Observed Defects vs R1 Criteria*:
  - Background is hardcoded `bg-white` instead of `bg-slate-50/70`.
  - Border radius is `rounded-[24px]` (bulky 24px) instead of `rounded-xl` (12px).
  - Padding is `p-4` (16px) instead of `p-2.5` (10px).
  - Width is `min-w-[340px] w-[340px]` instead of ~290px-300px (e.g. `min-w-[290px] w-[290px]` or `min-w-[300px] w-[300px]`).

- **Lines 92-103 (Column Header)**:
  ```tsx
  <div 
    {...attributes} 
    {...listeners}
    className="flex items-center justify-between mb-3 shrink-0 px-2 pt-2 pb-1 cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors -mx-2 -mt-2 rounded-t-[24px]"
  >
    <h3 className="text-[14px] text-[#3c4043] font-medium ml-2">
      {col.name}
    </h3>
    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
      <svg width="18" height="18" ... />
    </button>
  </div>
  ```
  *Observed Defects*:
  - Hardcodes negative margins and rounded top `-mx-2 -mt-2 rounded-t-[24px]`.
  - Column title uses `text-[14px] text-[#3c4043] font-medium` without a task count badge.

- **Lines 166-172 (Inline Task Creation Button)**:
  ```tsx
  <button 
    onClick={() => setCreatingInCol(col.id)}
    className="flex items-center gap-2 text-[var(--color-primary)] font-medium text-[14px] px-2 py-2 mb-3 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors w-full text-left"
  >
  ```
  *Observed Defects*:
  - Button uses coarse padding `px-2 py-2 mb-3` and font `text-[14px]`.

- **Line 175 (Column Tasks Scroll Container)**:
  ```tsx
  <div className="overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
  ```
  *Observed Defects*:
  - Uses `space-y-0.5` which was designed for flat rows, leaving inadequate vertical breathing room between distinct Kanban cards on a slate column background.

### 1.3 Task Card (`TaskCard`) Observations
File: `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`
- **Line 779 (Task Card Outer Container)**:
  ```tsx
  className="bg-transparent px-2 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer group rounded-lg relative"
  ```
  *Observed Defects*:
  - Card is rendered as transparent row `bg-transparent` with `hover:bg-slate-100`. On a `bg-slate-50/70` Kanban column, modern SaaS boards require an elevated white card (`bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all`).

- **Lines 790-798 (Task Checkbox)**:
  ```tsx
  <button 
    className={`mt-0.5 w-[18px] h-[18px] rounded-full border flex shrink-0 items-center justify-center transition-colors hover:border-slate-700 ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-[#dadce0]'}`}
    onClick={(e) => {
      e.stopPropagation();
      if (onUpdate) onUpdate(task.id, { status: (task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'planned' : 'finish' });
    }}
  >
  {(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? (
      <Check size={12} strokeWidth={3} />
    ) : null}
  </button>
  ```
  *Observed Defects*:
  - Checkbox dimensions are 18px (`w-[18px] h-[18px]`) with Google Tasks border `#dadce0`. Acceptance Criteria requires a round 16px checkbox (`w-4 h-4 rounded-full`, since 4 * 4px = 16px) with `<Check size={10} strokeWidth={3} />`.

- **Lines 803-808 (Task Title Typography)**:
  ```tsx
  <h4 
    className={`font-semibold text-slate-800 text-[13px] line-clamp-2 leading-snug select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
    onPointerDown={(e) => e.stopPropagation()}
  >
    {task.title}
  </h4>
  ```
  *Observed Defects*:
  - Title font size is `text-[13px]` instead of `text-xs font-semibold` (12px).

- **Lines 820-844 (Coarse `mt-3` and Redundant Row)**:
  ```tsx
  <div className="mt-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      {task.priority === 'high' && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500" title="Quan trọng" aria-label="Quan trọng">
          <svg className="h-3.5 w-3.5 fill-red-500" ... />
        </div>
      )}
    </div>
    <div className="flex items-center gap-1.5">
      <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors" title="Đánh dấu sao">
        <svg width="18" height="18" ... />
      </button>
      <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors ml-0.5" title="Các chế độ cho việc cần làm">
        <svg width="18" height="18" ... />
      </button>
    </div>
  </div>
  ```
  *Observed Defects*:
  - Line 820 introduces a coarse `mt-3` margin.
  - Dedicates a full vertical row to redundant icons (star, 3-dots, and a large 28px `h-7 w-7` priority badge) which inflates task card height and wastes space.

- **Lines 850-863 (Due Date and Assignee Row)**:
  ```tsx
  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
    {task.dueDate && (
      <div className={`flex items-center text-[11px] font-semibold border rounded-full px-2 py-0.5 ${isOverdue ? 'text-[#d93025] border-[#d93025] bg-transparent' : 'text-slate-600 border-slate-300 bg-transparent'}`}>
        <Clock className="w-3 h-3 mr-1" />
        {new Date(task.dueDate.seconds * 1000).toLocaleDateString('vi-VN')}
      </div>
    )}
    
    {resolveTaskAssigneesList(task.assignees, auth.currentUser?.uid).map((assignee) => (
      <div key={assignee.id} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold text-white ${assignee.color}`} title={assignee.name}>
        {assignee.initials}
      </div>
    ))}
  </div>
  ```
  *Observed Defects*:
  - Due date and assignee are rendered on a separate secondary row (`mt-1.5`), split below the `mt-3` icon row.
  - Acceptance criteria requires: "ngày hạn chót và assignee gộp gọn gàng trên 1 hàng, dẹp bỏ các margin mt-3 thô kệch."

- **Lines 119 and 724 (Inline creation & editing checkbox placeholders)**:
  - Both use `w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-400` which must be standardized to `w-4 h-4 rounded-full border border-slate-300` (16px) for consistency.

---

## 2. Logic Chain

1. **Premise 1 (Column Acceptance Criteria)**:
   - Acceptance Criteria explicitly requires:
     *"Các cột Kanban trong `BoardView.tsx` có class `rounded-xl`, padding `p-2.5`, nền `bg-slate-50/70`, và độ rộng cột trong khoảng 290px-300px."*
   - Current line 85 uses `bg-white rounded-[24px] p-4 ... min-w-[340px] w-[340px]`.
   - Modifying line 85 to:
     `bg-slate-50/70 rounded-xl p-2.5 flex flex-col max-h-[calc(100vh-180px)] h-fit min-w-[290px] w-[290px] shrink-0 border border-slate-200/60 relative group/col transition-all duration-200`
     directly satisfies all four criteria points simultaneously.

2. **Premise 2 (Task Card Acceptance Criteria)**:
   - Acceptance Criteria explicitly requires:
     *"Task card hiển thị checkbox tròn 16px, tiêu đề font chữ `text-xs font-semibold`, ngày hạn chót và assignee cùng nằm trên 1 hàng gọn gàng, không có margin `mt-3` thô."*
   - Modifying `TaskCard` checkbox from `w-[18px] h-[18px]` to `w-4 h-4 rounded-full` (16px) with `Check size={10}` satisfies the round 16px checkbox requirement.
   - Modifying `TaskCard` title from `text-[13px]` to `text-xs font-semibold` satisfies the typography requirement.
   - Removing line 820 (`<div className="mt-3 flex items-center justify-between">`) and merging `dueDate`, optional `priority` flag, and `resolveTaskAssigneesList(task.assignees)` into a single bottom row (`<div className="mt-2 flex items-center justify-between gap-1.5 pt-0.5">`) completely removes the coarse `mt-3` and places due date and assignee together on a single line.

3. **Premise 3 (Card vs Column Surface Hierarchy)**:
   - When the column becomes `bg-slate-50/70`, tasks rendered as `bg-transparent` become visually muddy and lack container boundaries.
   - Upgrading `TaskCard` outer container from `bg-transparent` to `bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all` elevates each task as an authentic SaaS Kanban card, seamlessly matching the existing inline task form styling (`bg-white rounded-lg shadow-sm border border-slate-200 p-2.5`).

4. **Premise 4 (Integrity and Testing)**:
   - Preserving `@dnd-kit` attributes, listeners, and handlers preserves all drag-and-drop operations for columns and cards.
   - No data models or props are altered, ensuring full compliance with `tests/wrk-data-01.test.ts`.

---

## 3. Caveats

1. **Dark Theme Integration**:
   - `De_Vuong_Webapp/src/index.css` overrides `.workspace-dark .bg-slate-50` with `#0f172a !important` and `.workspace-dark .bg-white` with `#111827 !important`. When using `bg-slate-50/70`, Tailwind produces `background-color: rgb(248 250 252 / 0.7)`. If tested in dark mode, implementers should verify that `src/index.css` or dark theme rules correctly target `.workspace-dark .bg-slate-50\/70`.
2. **Horizontal Overflow Container**:
   - In `WorkspaceLayout.tsx`, `main` has `p-2.5 sm:p-4 xl:p-6`. In `BoardView.tsx`, the scroll container has `overflow-x-auto pb-4 custom-scrollbar`. At 290px width, 4 to 5 columns fit comfortably on standard laptop screens (1440px) without cramped wrapping.
3. **No Database Schema or Service Changes**:
   - R1 is strictly a front-end UI presentation refactoring in `BoardView.tsx`. No changes are required in `workspace.service.ts` or Firebase rules.

---

## 4. Conclusion & Concrete Implementation Recommendations

The survey confirms the exact lines of code that need adjustment in `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`.

### 4.1 Recommended Code Modifications

#### A. Update Icons Import (Line 4)
```tsx
// Before:
import { Clock, Check } from 'lucide-react';

// After:
import { Clock, Check, Flag, Plus, MoreHorizontal, Pencil } from 'lucide-react';
```

#### B. Refactor `DroppableColumn` (Lines 85-195)
1. **Column Container (Line 85)**:
   ```tsx
   <div 
     ref={isOverlay ? undefined : setNodeRef} 
     style={style} 
     className={`bg-slate-50/70 rounded-xl p-2.5 flex flex-col max-h-[calc(100vh-180px)] h-fit min-w-[290px] w-[290px] shrink-0 border border-slate-200/60 relative group/col transition-all duration-200 ${isTaskOver ? 'border-emerald-500/50 bg-emerald-50/30' : ''}`}
   >
   ```

2. **Column Header (Lines 92-103)**:
   ```tsx
   <div 
     {...attributes} 
     {...listeners}
     className="flex items-center justify-between mb-2 shrink-0 px-1 pt-0.5 pb-1 cursor-grab active:cursor-grabbing hover:bg-slate-100/60 transition-colors rounded-lg"
   >
     <div className="flex items-center gap-2 min-w-0">
       <h3 className="text-xs font-semibold text-slate-700 truncate">
         {col.name}
       </h3>
       <span className="px-1.5 py-0.5 rounded-full bg-slate-200/70 text-[10px] font-bold text-slate-600">
         {colTasks.length}
       </span>
     </div>
     <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/60 transition-colors">
       <MoreHorizontal size={14} />
     </button>
   </div>
   ```

3. **Inline Creation Form Checkbox Placeholder (Line 119)**:
   ```tsx
   <div className="w-4 h-4 rounded-full border border-slate-300 bg-white"></div>
   ```

4. **"Thêm việc cần làm" Button (Lines 166-172)**:
   ```tsx
   <button 
     onClick={() => setCreatingInCol(col.id)}
     className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 px-2 py-1.5 mb-2 rounded-lg hover:bg-emerald-50 transition-colors w-full text-left"
   >
     <Plus size={14} />
     Thêm việc cần làm
   </button>
   ```

5. **Column Task List Container (Line 175)**:
   ```tsx
   <div className="overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar flex-1 min-h-[60px]">
   ```

6. **"Đã hoàn thành" Header Divider (Lines 182-187)**:
   ```tsx
   <div className="pt-2 pb-1 px-1">
     <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
       <span>Đã hoàn thành</span>
       <span className="w-4 h-4 rounded-full bg-slate-200/80 flex items-center justify-center text-[10px] text-slate-600 font-bold">
         {colTasks.filter((t: any) => (t.status === 'finish' || t.status === 'cancel' || t.status === 'done')).length}
       </span>
     </div>
   </div>
   ```

#### C. Refactor `TaskCard` (Lines 774-867)
1. **Task Card Outer Container (Line 779)**:
   ```tsx
   <div 
     ref={setNodeRef}
     style={style}
     {...attributes} 
     {...listeners}
     className="bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group relative"
     onClick={(e) => {
       if ((e.target as HTMLElement).closest('button')) return;
       if (onClick) onClick();
     }}
   >
   ```

2. **16px Round Checkbox (Lines 788-800)**:
   ```tsx
   <div className="pt-0.5 shrink-0">
     <button 
       className={`w-4 h-4 rounded-full border flex shrink-0 items-center justify-center transition-colors ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white hover:border-emerald-600'}`}
       onClick={(e) => {
         e.stopPropagation();
         if (onUpdate) onUpdate(task.id, { status: (task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'planned' : 'finish' });
       }}
     >
       {(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? (
         <Check size={10} strokeWidth={3} />
       ) : null}
     </button>
   </div>
   ```

3. **Title Typography (Lines 803-808)**:
   ```tsx
   <h4 
     className={`text-xs font-semibold text-slate-800 line-clamp-2 leading-snug select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
     onPointerDown={(e) => e.stopPropagation()}
   >
     {task.title}
   </h4>
   ```

4. **Eliminate `mt-3` & Clean Single Row for Due Date & Assignee (Replacing Lines 820-863)**:
   ```tsx
   {task.description && (
     <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 leading-normal">{task.description}</p>
   )}

   {(task.dueDate || (task.assignees && task.assignees.length > 0) || task.priority === 'high') && (
     <div className="mt-2 flex items-center justify-between gap-1.5 pt-0.5">
       <div className="flex items-center gap-1.5 min-w-0">
         {task.priority === 'high' && (
           <span 
             className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 shrink-0" 
             title="Quan trọng"
           >
             <Flag className="w-2.5 h-2.5 text-red-500 fill-red-500" />
             <span className="hidden sm:inline">Gấp</span>
           </span>
         )}
         {task.dueDate && (
           <div className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-md px-1.5 py-0.5 border shrink-0 ${isOverdue ? 'text-red-600 border-red-200 bg-red-50/70' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
             <Clock className="w-2.5 h-2.5 shrink-0" />
             <span>{new Date(task.dueDate.seconds * 1000).toLocaleDateString('vi-VN')}</span>
           </div>
         )}
       </div>

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
   ```

---

## 5. Verification Method

To independently verify the implementation:

1. **Automated Unit & Contract Test**:
   Execute from workspace root:
   ```powershell
   cd De_Vuong_Webapp; npm run test:workspace
   ```
   *Expected result*: All 8 tests pass with 0 failures, verifying no forbidden list models or schema drifts were introduced.

2. **TypeScript & Build Verification**:
   Execute from workspace root:
   ```powershell
   cd De_Vuong_Webapp; npm run build
   ```
   *Expected result*: Clean build with Vite, exit code 0, no syntax or type errors.

3. **Visual Acceptance Criteria Checklist**:
   - [ ] Column container has `bg-slate-50/70`, `rounded-xl`, `p-2.5`, and width ~290px (`w-[290px] min-w-[290px]`).
   - [ ] Checkbox button has `w-4 h-4 rounded-full` (16px) with check icon `size={10}`.
   - [ ] Task title uses `text-xs font-semibold`.
   - [ ] No `mt-3` margin exists on task card.
   - [ ] Due date badge and assignee avatars are aligned on a single row at the bottom of the card.
   - [ ] Dragging columns and dragging tasks between columns function smoothly without visual jitter.
