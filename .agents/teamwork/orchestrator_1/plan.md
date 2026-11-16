# Master Orchestration Plan: Workspace Google Tasks Benchmark & Full-Bleed Standardization

## Mission
Chuẩn hóa toàn diện Workspace Module theo AGENTS.md và benchmark Google Tasks (Ảnh 5) trên WorkspaceLayout, CalendarView, BoardView, GanttView, đảm bảo build thành công và triển khai lên Firebase hosting.

## Execution Strategy
The execution encompasses 5 cohesive milestones:
- **Milestone 1 (R1)**: WorkspaceLayout Full-Bleed Canvas & Toolbar `AdminFilterDropdown` Integration (`WorkspaceLayout.tsx`, `TaskView.tsx`)
- **Milestone 2 (R2)**: CalendarView AllTasks Loading for Default Workspace, Full Week Grid & All-Day Header Rendering, Full-Bleed Container (`CalendarView.tsx`)
- **Milestone 3 (R3)**: BoardView Google Tasks Benchmark Redesign (Flat list rows, 18px hollow circular checkbox, text-[13px] title, smart due date chip `(🕒 Hôm nay, 12:00)`, flat `+ Thêm việc cần làm`, internal column scrolling, collapsible `Đã hoàn thành`) (`BoardView.tsx`)
- **Milestone 4 (R4)**: GanttView Full-Bleed Canvas & 1:1 Row/Header Synchronization (`GanttView.tsx`)
- **Milestone 5 (R5)**: Verification Gate (Reviewers, Challengers, Forensic Auditor) & Live Deployment to Firebase hosting (`firebase deploy --only hosting:huynhkiencam`)

## Iteration Loop
1. Dispatch Worker with all 3 Explorer handoff reports, concrete diffs, and the mandatory integrity warning.
2. Worker implements changes across `WorkspaceLayout.tsx`, `CalendarView.tsx`, `BoardView.tsx`, `GanttView.tsx`, and `TaskView.tsx`, verifies with `npm run build`.
3. Verification Gate:
   - 2 Reviewers independently review code quality, AGENTS.md compliance, and UI standards.
   - 2 Challengers empirically stress test layouts, responsive views, edge cases, and scroll behaviors.
   - 1 Forensic Auditor (`teamwork_auditor`) audits integrity (CLEAN required).
4. Evaluate gate in `GATE_STATUS.md`.
5. Upon PASS, deploy to Firebase hosting via `firebase deploy --only hosting:huynhkiencam`.
6. Final reporting to parent.
