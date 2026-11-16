## 2026-11-16T15:10:19Z
Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md` (mandatory).
Read `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\AGENTS.md` (mandatory, especially Rules 4, 12, 14, 17).
Your identity is teamwork_worker.
Your working directory is `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_worker_ws_gtasks`.

Read the 3 Explorer handoff reports:
- `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_explorer_ws_full_1\handoff.md` (R1)
- `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_explorer_ws_full_2\handoff.md` (R2)
- `c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\teamwork_explorer_ws_full_3\handoff.md` (R3, R4, R5)

Write ownership: You exclusively own:
- `De_Vuong_Webapp/src/components/workspace/WorkspaceLayout.tsx`
- `De_Vuong_Webapp/src/components/workspace/views/TaskView.tsx`
- `De_Vuong_Webapp/src/components/workspace/views/CalendarView.tsx`
- `De_Vuong_Webapp/src/components/workspace/views/BoardView.tsx`
- `De_Vuong_Webapp/src/components/workspace/views/GanttView.tsx`

Your implementation mission:
1. R1: Full-Bleed Canvas & Toolbar AdminFilterDropdown:
   - In `WorkspaceLayout.tsx`:
     * Change `main` class to `min-h-0 flex-1 overflow-hidden bg-white w-full flex flex-col`. Remove all padding `p-2.5 sm:p-4 xl:p-6`.
     * Remove the old modal filter dialog (and `isFilterPanelOpen` state / overlay) and its trigger button.
     * Mount 3 `AdminFilterDropdown` components directly on the toolbar for Trạng thái, Mức độ ưu tiên, and Hạn chót using multi-select and fixed labels per AGENTS.md Rule 12.
     * Wire up state to pass down to child views.
   - In `TaskView.tsx`:
     * Update `matchesAdvancedFilters` to support array filters from `AdminFilterDropdown`.
     * Update outer container to `h-full min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6` for internal scrolling.

2. R2: CalendarView AllTasks & Full-Bleed Rendering:
   - In `CalendarView.tsx`:
     * Import `getAllTasks` from `../../../services/workspace.service`.
     * In `fetchTasks`: when `activeNode?.id === 'default-workspace' || orgId === 'default-workspace'`, call `getAllTasks()` so all 112 system tasks are loaded.
     * Scope task creation to active space/folder (`taskData.spaceId`, `taskData.folderId`).
     * Change outer container from `h-[calc(100vh-140px)] rounded-xl border` to `w-full h-full min-h-0 flex flex-col bg-white overflow-hidden` (full-bleed).
     * Ensure week grid and All-Day header render properly.

3. R3: BoardView Google Tasks Benchmark Redesign:
   - In `BoardView.tsx`:
     * Redesign task cards to flat row list: remove `shadow-2xs`, `border border-slate-200/80`, and box pill badges per AGENTS.md Rule 4.
     * Checkbox: 18px hollow circular checkbox (`w-[18px] h-[18px] border-[1.5px] border-slate-400 hover:border-emerald-600 rounded-full`). Clicking toggles completion between planned and finish.
     * Title: Plain text `text-[13px] font-medium leading-snug`.
     * Due date: Smart chip `(🕒 Hôm nay, 12:00)` with soft colors (soft red for overdue, soft amber for today, soft slate for upcoming).
     * Flat button: `+ Thêm việc cần làm` flat text button at top of all columns (remove `hideCreateButton`).
     * Column scrolling: Change column to `h-full max-h-full flex flex-col min-w-[300px] w-[300px]` with internal task scrolling `flex-1 min-h-0 overflow-y-auto no-scrollbar` so columns stretch to available height without overflowing the viewport.
     * Collapsible completed section: Add `isCompletedOpen` toggle, count badge, and `ChevronRight`/`ChevronDown` toggle.

4. R4: GanttView Full-Bleed & 1:1 Row Sync:
   - In `GanttView.tsx`:
     * Remove `rounded-xl border border-slate-200 shadow-xs` on outer container for full-bleed edge-to-edge canvas.
     * Explicit `h-[60px]` on pinned header cell matching 28px + 32px timeline header.
     * Add `h-full` to left column cells inside `h-11 min-h-[44px] max-h-[44px]` rows to lock 1:1 row height synchronization with the timeline pane.

5. Verification:
   - Run `npm run build` inside `De_Vuong_Webapp` and verify it succeeds with exit code 0.
