import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { TopBar } from "@/components/TopBar";
import { deleteTaskAction } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { formatDateTime, relativeTime } from "@/lib/format";
import { listTasks } from "@/lib/store";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; ok?: string; error?: string }>;

const FLASH: Record<string, { tone: "ok" | "error"; text: string }> = {
  deleted: { tone: "ok", text: "Task deleted." },
  forbidden: { tone: "error", text: "Your role does not allow that action." },
  "not-found": { tone: "error", text: "That task no longer exists." },
};

function isStatus(value: string | undefined): value is TaskStatus {
  return !!value && (TASK_STATUSES as readonly string[]).includes(value);
}
//每次用户访问http://localhost:3000/tasks的时候，我们的服务器会启动这个脚本，函数是TasksPage
export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  //定义一些变量，读取一些数据

  //调用了requireSession()函数，拿到了用户的session信息，把这个信息存储在名字叫session的变量中。
  const session = await requireSession();
  // const session = {
  //   "name":"Admin",
  //   "role":"Admin"
  // }
  const { status: rawStatus, ok, error } = await searchParams;

  const isAdmin = session.role === "Administrator";
  const all = listTasks();
  const active = isStatus(rawStatus) ? rawStatus : "all";
  const tasks = active === "all" ? all : all.filter((t) => t.status === active);

  const counts = TASK_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = all.filter((t) => t.status === s).length;
    return acc;
  }, {});

  const flash = FLASH[error ?? ok ?? ""];

  const filters: { key: "all" | TaskStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: all.length },
    ...TASK_STATUSES.map((s) => ({ key: s, label: STATUS_META[s].label, count: counts[s] ?? 0 })),
  ];
  // 返回
  return (
    <div className="min-h-screen">
      <TopBar session={session} />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900">Tasks</h1>
            <p className="mt-1 text-[13px] text-slate-500">
              {isAdmin
                ? "You can create tasks, move them through the workflow and delete them."
                : "Read-only view. Ask an administrator to change a task status."}
            </p>
          </div>

          {isAdmin && (
            <Link
              href="/tasks/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-slate-800"
            >
              <span className="text-[15px] leading-none">+</span> New task
            </Link>
          )}
        </div>

        {flash && (
          <p
            className={`mt-5 rounded-lg px-3.5 py-2.5 text-[12.5px] ring-1 ring-inset ${
              flash.tone === "ok"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : "bg-rose-50 text-rose-600 ring-rose-100"
            }`}
          >
            {flash.text}
          </p>
        )}

        <nav className="mt-6 flex flex-wrap gap-1.5">
          {filters.map((f) => {
            const isActive = f.key === active;
            return (
              <Link
                key={f.key}
                href={f.key === "all" ? "/tasks" : `/tasks?status=${encodeURIComponent(f.key)}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
                <span
                  className={`rounded px-1.5 text-[10.5px] font-semibold ${
                    isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {f.count}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10.5px] uppercase tracking-wider text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Task</th>
                <th className="px-4 py-2.5 font-semibold">Assignee</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold">Updated</th>
                <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-50 last:border-0 transition hover:bg-slate-50/60"
                >
                  <td className="max-w-[420px] px-5 py-3.5">
                    <Link href={`/tasks/${task.id}`} className="group block">
                      <p className="text-[13.5px] font-medium text-slate-800 group-hover:text-slate-950">
                        {task.title}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400">{task.id}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-slate-600">{task.assignee}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[12.5px] text-slate-600">{relativeTime(task.updatedAt)}</p>
                    <p className="text-[11px] text-slate-400">{formatDateTime(task.updatedAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        View
                      </Link>
                      {isAdmin && (
                        <form action={deleteTaskAction}>
                          <input type="hidden" name="id" value={task.id} />
                          <SubmitButton
                            variant="danger"
                            className="px-2! py-1! text-[12px]!"
                            pendingLabel="…"
                            confirmText={`Delete ${task.id}? This cannot be undone.`}
                          >
                            Delete
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tasks.length === 0 && (
            <div className="px-5 py-16 text-center">
              <p className="text-[13px] font-medium text-slate-600">No tasks here</p>
              <p className="mt-1 text-[12px] text-slate-400">
                {active === "all" ? "Create the first one to get started." : `Nothing in ${active}.`}
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-[11.5px] text-slate-400">
          Showing {tasks.length} of {all.length} tasks · signed in as {session.name} ({session.role})
        </p>
      </main>
    </div>
  );
}
