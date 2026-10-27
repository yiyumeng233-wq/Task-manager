import Link from "next/link";
import { NewTaskForm } from "@/components/NewTaskForm";
import { TopBar } from "@/components/TopBar";
import { requireAdmin } from "@/lib/auth";
import { TASK_STATUSES } from "@/lib/types";
import { STATUS_META } from "@/lib/workflow";

export default async function NewTaskPage() {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen">
      <TopBar session={session} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 transition hover:text-slate-800"
        >
          ← Back to tasks
        </Link>

        <h1 className="mt-3 text-[24px] font-semibold tracking-tight text-slate-900">New task</h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Every task starts in <span className="font-medium text-amber-600">Pending</span> and needs
          an administrator to approve it.
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <NewTaskForm />

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                What happens next
              </p>
              <ol className="mt-3 space-y-3">
                {TASK_STATUSES.slice(0, 3).map((status, index) => (
                  <li key={status} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10.5px] font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium text-slate-700">
                        {STATUS_META[status].label}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">
                        {STATUS_META[status].hint}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Who can do this
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                Only an <span className="font-medium text-slate-700">Administrator</span> can create
                tasks. The check runs twice: the page hides the entry point, and the server action
                rejects the request even if it is crafted by hand.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
