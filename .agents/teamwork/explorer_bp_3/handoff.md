# Handoff Report: Board View Google Tasks Polish — Subtasks Rendering & Toggle Functionality

## 1. Observation
- **Current State in `BoardView.tsx`**:
  - `TaskCard` (lines 696–882) receives props `{ task, isOverlay, onClick, onUpdate }`, where `onUpdate` is passed down from `col.onUpdateTask` (linked to `handleUpdateTask` at lines 378–385 and line 440).
  - Currently, `TaskCard` does **not** render subtasks. It only renders the parent task's round checkbox (`w-[18px] h-[18px]`), title (`h4`), description (`p`), and the metadata row (priority, due date, assignees).
  - `Check` icon from `lucide-react` is already imported at line 4 (`import { Clock, Check, Flag, Plus, MoreHorizontal } from 'lucide-react';`).
- **Data Model in `workspace.service.ts`**:
  - `Subtask` interface (lines 50–62):
    ```typescript
    export interface Subtask {
      id: string;
      title: string;
      completed: boolean;
      status?: 'planned' | 'in_progress' | 'needs_review' | 'finish' | 'cancel';
      priority?: 'low' | 'medium' | 'high';
      dueDate?: Timestamp;
      assignees?: string[];
      links?: string[];
      resultLinks?: string[];
      description?: string;
      order?: number;
    }
    ```
  - `Task` interface (lines 64–83) includes `subtasks?: Subtask[];`.
  - `updateTask(taskId, updates)` (lines 246–263) handles updating partial fields on `doc(db, 'tasks', taskId)` using `cleanObject` and setting `updatedAt: Timestamp.now()`.
- **Existing Subtask Toggle Implementations in Sister Components**:
  - In `TaskDetailPanel.tsx` (lines 78–83) and `TaskInlineDetails.tsx` (lines 65–70):
    ```typescript
    const handleToggleSubtask = (subtaskId: string) => {
      const updatedSubtasks = (task.subtasks || []).map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      onUpdate(task.id, { subtasks: updatedSubtasks });
    };
    ```
  - Completion status check in `TaskDetailPanel.tsx` (line 256) and `GanttView.tsx` (line 450):
    `st.completed || st.status === 'finish' || (st.status as any) === 'done'`.
- **Build Status**:
  - Verified baseline `npm --prefix De_Vuong_Webapp run build` succeeds cleanly (exit code 0).

---

## 2. Logic Chain
1. **Placement in `TaskCard`**:
   - `TaskCard`'s body is structured as:
     - Left: 18px checkbox container (`<div className="shrink-0 flex items-center h-5">`).
     - Right: `<div className="flex-1 min-w-0">` containing title (`h4`), description (`p`), and metadata chips (`dueDate`, `assignees`, `priority`).
   - Placing the subtask tree directly inside `<div className="flex-1 min-w-0">` right after `task.description` (before the bottom metadata row) ensures natural top-down information hierarchy matching Google Tasks (Ảnh 5).
2. **Indentation and Visual Line (Google Tasks Polish)**:
   - Container class: `mt-2 ml-4 pl-2 space-y-1.5 border-l border-slate-100`
   - Indentation `ml-4 pl-2` with `border-l border-slate-100` produces the exact clean vertical guide line seen in Google Tasks without cluttering the card.
3. **14px Checkbox & Typography Requirements**:
   - Subtask checkbox: `w-3.5 h-3.5 rounded-full border mt-0.5 flex shrink-0 items-center justify-center transition-colors` (in Tailwind, `w-3.5 h-3.5` = 14px).
   - Checkbox states:
     - Completed: `bg-emerald-600 border-emerald-600 text-white` with `<Check size={8} strokeWidth={3} />`
     - Incomplete: `border-slate-400 bg-transparent hover:border-emerald-600`
   - Title: `text-[12px] block leading-snug text-slate-700`, with `line-through text-slate-400` when completed.
   - Sub-description: `{sub.description && <span className="text-[10px] text-slate-400 block line-clamp-1">{sub.description}</span>}`.
4. **Interaction & Propagation Isolation**:
   - Subtask checkbox button must have:
     - `onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, sub.id); }}`: isolates click event so toggling a subtask does not open the task's detail panel (`onClick()` on the outer card).
     - `onPointerDown={(e) => e.stopPropagation()}`: prevents `@dnd-kit`'s `PointerSensor` from initiating a card drag when the user clicks the checkbox.
5. **State Synchronization (`toggleSubtask`)**:
   - Inside `TaskCard`:
     ```typescript
     const toggleSubtask = (taskId: string, subtaskId: string) => {
       if (!onUpdate || !task.subtasks) return;
       const updatedSubtasks = task.subtasks.map(sub => {
         if (sub.id !== subtaskId) return sub;
         const isCompleted = Boolean(sub.completed || sub.status === 'finish' || (sub.status as any) === 'done');
         return {
           ...sub,
           completed: !isCompleted,
           status: !isCompleted ? ('finish' as const) : ('planned' as const)
         };
       });
       onUpdate(taskId, { subtasks: updatedSubtasks });
     };
     ```
   - Updating both `completed: !isCompleted` and `status: !isCompleted ? 'finish' : 'planned'` ensures 100% interoperability with `TaskDetailPanel`, `TaskInlineDetails`, `TaskView`, and `GanttView`.
   - In `BoardView.tsx`, updating `handleUpdateTask` (line 379) to also sync `selectedTask`:
     ```typescript
     setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, ...updates } as Task : prev);
     ```
     keeps the side panel and the board in instant reactive sync if both are visible.

---

## 3. Caveats
- `DragOverlay`: In `DragOverlay` (`activeTask ? <TaskCard task={activeTask} isOverlay /> : null`), `onUpdate` is undefined. The `if (!onUpdate) return;` guard prevents errors if subtasks are rendered in the overlay card.
- Drag-and-drop of subtasks themselves is neither supported nor requested on the board view; subtasks are nested read/toggle items under the parent draggable task card.
- If a subtask has no `id`, using `key={sub.id || idx}` prevents React key warnings.

---

## 4. Conclusion & Recommended Code Structure for Worker

### Exact Code Changes in `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`:

#### Step A: Inside `handleUpdateTask` in `BoardView` (around line 378):
Ensure `selectedTask` is kept in sync:
```typescript
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } as Task : t));
    setSelectedTask(prev => prev && prev.id === taskId ? { ...prev, ...updates } as Task : prev);
    try {
      await updateTask(taskId, updates);
    } catch (e) {
      console.error('Failed to update task:', e);
    }
  };
```

#### Step B: Inside `TaskCard` (around line 736):
Define `toggleSubtask`:
```typescript
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!onUpdate || !task.subtasks) return;
    const updatedSubtasks = task.subtasks.map(sub => {
      if (sub.id !== subtaskId) return sub;
      const isCompleted = Boolean(sub.completed || sub.status === 'finish' || (sub.status as any) === 'done');
      return {
        ...sub,
        completed: !isCompleted,
        status: !isCompleted ? ('finish' as const) : ('planned' as const)
      };
    });
    onUpdate(taskId, { subtasks: updatedSubtasks });
  };
```

#### Step C: Inside `TaskCard` JSX (between lines 843 and 845):
Insert the subtasks block immediately following `{task.description && ...}`:
```tsx
          {task.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">{task.description}</p>
          )}

          {/* Subtasks rendering (Google Tasks style) */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2 ml-4 pl-2 space-y-1.5 border-l border-slate-100">
              {task.subtasks.map((sub, idx) => {
                const isSubCompleted = Boolean(sub.completed || sub.status === 'finish' || (sub.status as any) === 'done');
                return (
                  <div key={sub.id || idx} className="flex items-start gap-2 py-0.5 group/sub">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSubtask(task.id, sub.id); }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex shrink-0 items-center justify-center transition-colors ${
                        isSubCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400 bg-transparent hover:border-emerald-600'
                      }`}
                    >
                      {isSubCompleted && <Check size={8} strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className={`text-[12px] block leading-snug text-slate-700 ${isSubCompleted ? 'line-through text-slate-400' : ''}`}>
                        {sub.title}
                      </span>
                      {sub.description && (
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{sub.description}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(task.dueDate || (task.assignees && task.assignees.length > 0) || task.priority === 'high') && (
...
```

---

## 5. Verification Method
1. **Compilation Check**:
   Run `npm --prefix De_Vuong_Webapp run build`. It must compile with 0 TypeScript/Vite errors.
2. **Interactive UI Verification**:
   - Open Board View (`tab=board` or active workspace view).
   - Find or create a task with subtasks (via TaskDetailPanel or mock).
   - Verify subtasks appear indented under the task card with a subtle left border line (`border-slate-100`).
   - Click the 14px circular checkbox of a subtask:
     - The subtask should toggle between incomplete (transparent with slate-400 border) and completed (emerald background with 8px Check icon).
     - The title strikes through (`line-through text-slate-400`).
     - Clicking the subtask checkbox does **not** open the TaskDetailPanel.
     - Clicking anywhere else on the card opens the TaskDetailPanel.
     - Changes persist to Firestore via `updateTask(taskId, { subtasks: ... })`.
