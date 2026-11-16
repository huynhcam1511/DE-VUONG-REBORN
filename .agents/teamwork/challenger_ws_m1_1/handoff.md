# Milestone 1 Empirical Verification Report: Board View SaaS Polish

**Challenger**: `challenger_ws_m1_1`  
**Role**: `teamwork_challenger` (critic, specialist)  
**Date**: 2026-11-16  
**Target File**: `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`  
**Target Milestone**: M1 (ORIGINAL_REQUEST §R1)  
**Verdict**: **APPROVE**  

---

## 1. Observation

Direct empirical observations from `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`:

1. **Column Container Classes (`DroppableColumn`)**:
   - Line 88:
     ```tsx
     className={`bg-slate-50/70 rounded-xl p-2.5 flex flex-col max-h-[calc(100vh-180px)] h-fit min-w-[290px] w-[290px] shrink-0 border relative group/col transition-all duration-200 ${isTaskOver ? 'border-emerald-500/50 bg-emerald-50/30' : 'border-slate-200/60'}`}
     ```
   - Matches specification: `rounded-xl`, `p-2.5`, `bg-slate-50/70`, width `min-w-[290px] w-[290px]` (290px-300px target range).
   - Column header typography (lines 102-106): `text-xs font-semibold text-slate-700` with pill count badge `px-1.5 py-0.5 rounded-full bg-slate-200/70 text-[10px] font-bold text-slate-600`.
   - Task list container (line 184): `overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar flex-1 min-h-[60px]`.

2. **Task Card Elements (`TaskCard`)**:
   - Card container (line 790):
     ```tsx
     className="bg-white rounded-lg p-2.5 shadow-2xs border border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group relative"
     ```
   - 16px round checkbox (lines 799-809):
     ```tsx
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
     ```
     `w-4 h-4 rounded-full` corresponds strictly to 16px diameter. Inline creation placeholder (line 128) and inline editing placeholder (line 735) also use `w-4 h-4 rounded-full`.
   - Title styling & interaction (lines 813-818):
     ```tsx
     <h4 
       className={`text-xs font-semibold text-slate-800 line-clamp-2 leading-snug select-text cursor-text ${(task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done') ? 'line-through text-slate-400' : ''}`}
       onPointerDown={(e) => e.stopPropagation()}
     >
       {task.title}
     </h4>
     ```
     Uses `text-xs font-semibold text-slate-800 line-clamp-2`. Selection is protected via `onPointerDown={(e) => e.stopPropagation()}` to prevent dragging on text highlight.
   - Merged single-row due date & assignee avatars (lines 834-866):
     ```tsx
     {(task.dueDate || (task.assignees && task.assignees.length > 0) || task.priority === 'high') && (
       <div className="mt-2 flex items-center justify-between gap-1.5 pt-0.5">
         <div className="flex items-center gap-1.5 min-w-0">
           {task.priority === 'high' && (
             <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 shrink-0" title="Quan trọng">
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
             <div key={assignee.id} className={`w-5 h-5 rounded-full ring-1.5 ring-white flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${assignee.color}`} title={assignee.name}>
               {assignee.initials}
             </div>
           ))}
         </div>
       </div>
     )}
     ```
   - Absence of coarse `mt-3` margin: A pattern search for `mt-3` across `BoardView.tsx` yielded 0 occurrences. Margin between title and metadata row was tightened to `mt-2 pt-0.5`.

3. **Automated Test Results**:
   - `npm run test:workspace` executed: 8 tests passed, 0 failures.
   - Dedicated empirical test `node --import tsx --test tests/challenger_ws_m1_1_empirical.test.ts` executed: 5 tests passed, 0 failures.
   - Combined test suite (workspaceAssignees, wrk-data-01, mobileSwipe, empirical harness): 22 tests passed, 0 failures.

4. **Production Build Result**:
   - `npm run build` executed: Vite v6.4.1 built in 11.50s, exit code 0, 0 TypeScript or JSX compilation errors.

---

## 2. Logic Chain

1. **Requirement R1 Direct Mapping**:
   - ORIGINAL_REQUEST §R1 specified:
     - Columns: `rounded-xl`, `p-2.5`, `bg-slate-50/70`, width ~290px-300px. Verified in `DroppableColumn` class attributes at line 88 (`bg-slate-50/70 rounded-xl p-2.5 ... min-w-[290px] w-[290px]`).
     - Task card: 16px round checkbox (`w-4 h-4 rounded-full`), `text-xs font-semibold` title, single-row due date & assignee, and removal of coarse `mt-3` margin. Verified at lines 799-809, 814, 835, and regex assertions in empirical test suite.
2. **Stress-Testing Event Handlers & DnD Integrity**:
   - Card click vs inner buttons: `if ((e.target as HTMLElement).closest('button')) return;` on line 793 ensures clicking checkbox or quick-edit pencil does not trigger card detail panel.
   - Checkbox click: `e.stopPropagation()` on line 802 ensures bubbling is halted.
   - Title pointer event: `onPointerDown={(e) => e.stopPropagation()}` on line 815 ensures dragging is not inadvertently initiated when highlighting text.
   - Drag handles: Droppable and Draggable references (`setNodeRef`, `attributes`, `listeners`, `style`) remain connected to `@dnd-kit/core` and `@dnd-kit/sortable`.
3. **Data Contract Conformance**:
   - Verified that no legacy `List` model dependencies were reintroduced. Single `Task` schema contract remains clean.
   - Status toggling accommodates both canonical statuses (`planned`, `finish`, `cancel`) and legacy status (`done`).

---

## 3. Adversarial Review & Challenge Summary

**Overall risk assessment**: **LOW**

### Challenge 1 (Dismissed / Robust)
- **Assumption challenged**: Card narrowing from 340px to 290px might cause truncation or overflow of due date badge and multiple assignee avatars.
- **Attack scenario**: A task having priority "Gấp", due date "31/12/2026", and 3+ assignees might cause horizontal wrap or clipping.
- **Stress-Test Result**: At line 835, the container uses `flex items-center justify-between gap-1.5`. Inside, the priority flag text hides the label on smaller screens (`<span className="hidden sm:inline">Gấp</span>`), the due date has `shrink-0`, and the assignee avatars overlap with `-space-x-1 shrink-0 overflow-hidden` using `w-5 h-5` round avatars. No line wrap occurs, and content stays on a single clean row.
- **Verdict**: PASS.

### Challenge 2 (Dismissed / Robust)
- **Assumption challenged**: Replacing the full-width row with an elevated card background might break drag-over drop indicator lines.
- **Attack scenario**: Dragging a task over another task or column might obscure drop line positions.
- **Stress-Test Result**: Line 704 specifies `borderTop: isTaskOver && !isDragging ? '2px solid #10b981' : undefined`, which applies an emerald highlight directly to the card being hovered over. Column drop targets also highlight with `border-emerald-500/50 bg-emerald-50/30`.
- **Verdict**: PASS.

---

## 4. Caveats

- **No Caveats**: All changes are strictly scoped to `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`. No extraneous files were altered.

---

## 5. Conclusion

**Verdict: APPROVE**

Milestone 1 satisfies all criteria outlined in ORIGINAL_REQUEST §R1 and the acceptance criteria. Automated tests and production builds pass with zero defects. The changes are production ready.

---

## 6. Verification Method

To independently reproduce the empirical verification:

```powershell
cd De_Vuong_Webapp

# 1. Run workspace regression tests
npm run test:workspace

# 2. Run challenger's AST and empirical test suite
node --import tsx --test tests/challenger_ws_m1_1_empirical.test.ts

# 3. Verify clean production build
npm run build
```
