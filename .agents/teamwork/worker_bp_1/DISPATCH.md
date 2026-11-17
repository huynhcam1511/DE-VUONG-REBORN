## 2026-11-17T02:21:31Z
You are worker_bp_1 (teamwork_worker).
Your working directory is: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\worker_bp_1\

Read these files before starting:
1. ORIGINAL_REQUEST.md: c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\ORIGINAL_REQUEST.md
2. Approved Polish Plan: C:\Users\zit\.gemini\antigravity\brain\84d01a92-09d9-4389-8e0e-1485fedb54eb\board_view_google_tasks_polish_plan.md
3. Explorer 1 Handoff (Header Polish): c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_bp_1\handoff.md
4. Explorer 2 Handoff (DueDate Chip & Title): c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_bp_2\handoff.md
5. Explorer 3 Handoff (Subtasks Render & Toggle): c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\.agents\teamwork\explorer_bp_3\handoff.md

Write Ownership:
You exclusively own and may edit:
`c:\Users\zit\Documents\Antigravity\DE VUONG REBORN\De_Vuong_Webapp\src\components\workspace\views\BoardView.tsx`
(Never edit files under `archives/`, which is read-only).

Tasks to implement in `BoardView.tsx`:
1. Sửa Header cột Workspace:
   - Bỏ `uppercase font-bold tracking-wide text-xs`.
   - Dùng `text-sm font-semibold text-slate-800 truncate`.
   - Task count: `text-xs font-medium text-slate-400 shrink-0` cùng hàng không lệch.
   - Thêm `shrink-0` và `onClick={(e) => e.stopPropagation()}` cho nút action MoreHorizontal.
2. Sửa chip dueDate:
   - Bỏ nền màu (`bg-rose-50 / bg-slate-50`).
   - Dùng viền mảnh trong suốt (`border-rose-200/80` hoặc `border-slate-200/80`), `bg-transparent`.
   - Chỉ dùng text color `text-rose-600 / text-slate-600`.
   - Helper `formatDueDate` an toàn và `isOverdue` logic tính `const isCompleted = task.status === 'finish' || task.status === 'cancel' || (task.status as any) === 'done'` để task đã hoàn thành không bị hiển thị đỏ.
3. Sửa tiêu đề task:
   - Chữ thường tự nhiên, `text-[13.5px] font-normal text-slate-800 leading-5` rõ nét, không mờ.
   - Helper `formatTaskTitle` để chuẩn hóa câu chữ khi dữ liệu gốc bị gõ all-caps.
4. Render subtasks thụt lề dưới task cha:
   - Thụt lề `mt-2 ml-4 pl-2 space-y-1.5 border-l border-slate-100`.
   - Checkbox tròn nhỏ 14px (`w-3.5 h-3.5 rounded-full border mt-0.5 flex shrink-0 items-center justify-center transition-colors`).
   - Checkbox state: completed -> `bg-emerald-600 border-emerald-600 text-white` với `<Check size={8} strokeWidth={3} />`; incomplete -> `border-slate-400 bg-transparent hover:border-emerald-600`.
   - Subtask title: `text-[12px] block leading-snug text-slate-700` (`line-through text-slate-400` khi completed).
   - Sub-description: `text-[10px] text-slate-400 block line-clamp-1` nếu có `sub.description`.
   - Interaction: `toggleSubtask(task.id, sub.id)` cách ly click (`e.stopPropagation()`, `onPointerDown={(e) => e.stopPropagation()}`), cập nhật Firestore qua `onUpdate` và đồng bộ `selectedTask`.
5. Build test & Verification:
   - Chạy `npm run build` trong `De_Vuong_Webapp/`. Phải đảm bảo exit code 0 và 0 TypeScript error.
6. Git commit:
   - Commit Git cả repo con (`De_Vuong_Webapp`) và repo root (`DE VUONG REBORN`).
7. Deploy production:
   - Chạy `npx firebase deploy --only hosting:huynhkiencam` và xác nhận kết quả deploy thành công.
