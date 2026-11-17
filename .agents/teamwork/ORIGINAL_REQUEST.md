# Original User Request

## Parameters
[skip-interview]
How this run was launched; not part of the task.

## Initial Request — 2026-11-17T01:59:18Z

Yêu cầu và kế hoạch đã được chốt và duyệt chi tiết trong artifact board_view_google_tasks_polish_plan.md. Hãy tiến hành thực thi ngay lập tức:
1. Sửa Header cột Workspace: bỏ uppercase font-bold, dùng text-sm font-semibold text-slate-800, số lượng cùng hàng không lệch.
2. Sửa chip dueDate: bỏ nền màu (bg-rose-50 / bg-slate-50), dùng viền mảnh trong suốt (border-rose-200/80 hoặc border-slate-200/80), chỉ dùng text color text-rose-600 / text-slate-600.
3. Sửa tiêu đề task: chữ thường tự nhiên, text-[13.5px] font-normal text-slate-800 rõ nét, không mờ.
4. Render subtasks thụt lề dưới task cha (ml-4 pl-2 space-y-1.5 border-l border-slate-100, checkbox tròn nhỏ 14px, text-[12px] text-slate-700).
5. Build test (npm run build trong De_Vuong_Webapp), commit Git cả repo con và root, deploy production Firebase Hosting.
