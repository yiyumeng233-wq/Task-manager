import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitButton } from "@/components/SubmitButton";
import { TopBar } from "@/components/TopBar";
import { deleteTaskAction, transitionAction } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { formatDateTime, initials, relativeTime } from "@/lib/format";
import { getTask } from "@/lib/store";
import { STATUS_META, isTerminal, nextStatuses } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ ok?: string; error?: string }>;

const ERRORS: Record<string, string> = {
  forbidden: "Your role does not allow changing a task status.",
  "illegal-transition": "That move is not allowed from the current status.",
  "unknown-status": "Unknown target status.",
};

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const session = await requireSession();
  const { id } = await params;
  const { ok, error } = await searchParams;

  const task = getTask(id);
  if (!task) notFound();

  const isAdmin = session.role === "Administrator";
  const allowed = nextStatuses(task.status);
  const meta = STATUS_META[task.status];

  return (
    <div className="min-h-screen">
      <TopBar session={session} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1 text-[12.5px] text-slate-500 transition hover:text-slate-800"
        >
          ← Back to tasks
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-slate-400">{task.id}</span>
              <StatusBadge status={task.status} />
            </div>
            <h1 className="mt-2 max-w-2xl text-[24px] font-semibold leading-snug tracking-tight text-slate-900">
              {task.title}
            </h1>
          </div>

          {isAdmin && (
            <form action={deleteTaskAction}>
              <input type="hidden" name="id" value={task.id} />
              <SubmitButton
                variant="danger"
                pendingLabel="Deleting…"
                confirmText={`Delete ${task.id}? This cannot be undone.`}
              >
                Delete task
              </SubmitButton>
            </form>
          )}
        </div>

        {ok && (
          <p className="mt-5 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-700 ring-1 ring-inset ring-emerald-100">
            Status updated.
          </p>
        )}
        {error && ERRORS[error] && (
          <p className="mt-5 rounded-lg bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-600 ring-1 ring-inset ring-rose-100">
            {ERRORS[error]}
          </p>
        )}

        <div className="mt-7 grid gap-5 lg:grid-cols-[1.65fr_1fr]">
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700">
                {task.description || "No description provided."}
              </p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Activity
              </h2>
              <ol className="mt-4 space-y-0">
                {[...task.history].reverse().map((event, index) => (
                  <li key={`${event.at}-${index}`} className="relative flex gap-3.5 pb-5 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          index === 0 ? STATUS_META[event.to].dot : "bg-slate-300"
                        }`}
                      />
                      {index < task.history.length - 1 && (
                        <span className="absolute top-4 h-full w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] text-slate-700">
                        {event.from ? (
                          <>
                            <span className="font-medium">{event.from}</span>
                            <span className="mx-1.5 text-slate-400">→</span>
                            <span className="font-medium">{event.to}</span>
                          </>
                        ) : (
                          <>Created as <span className="font-medium">{event.to}</span></>
                        )}
                        <span className="ml-2 text-slate-400">by {event.by}</span>
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-400">
                        {formatDateTime(event.at)}
                        {event.note ? ` · ${event.note}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Workflow
                </p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{meta.hint}</p>

              <div className="mt-4">
                {isTerminal(task.status) ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[12px] text-slate-500">
                    Final state — nothing to move.
                  </p>
                ) : !isAdmin ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-[12px] text-slate-500">
                    Viewers cannot change status. Available moves:{" "}
                    <span className="font-medium text-slate-700">{allowed.join(", ")}</span>
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400">Move to</p>
                    {allowed.map((to) => (
                      <form key={to} action={transitionAction}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="to" value={to} />
                        <SubmitButton
                          variant={to === "Cancelled" ? "danger" : "secondary"}
                          className="w-full justify-between!"
                          pendingLabel="Updating…"
                        >
                          <span className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[to].dot}`} />
                            {to}
                          </span>
                          <span aria-hidden className="text-slate-300">
                            →
                          </span>
                        </SubmitButton>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Details
              </p>
              <dl className="mt-3 space-y-3 text-[12.5px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">Assignee</dt>
                  <dd className="flex items-center gap-1.5 font-medium text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9.5px] font-semibold text-slate-500">
                      {initials(task.assignee)}
                    </span>
                    {task.assignee}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">Created by</dt>
                  <dd className="font-medium text-slate-700">{task.createdBy}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">Created</dt>
                  <dd className="text-slate-600">{formatDateTime(task.createdAt)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-400">Updated</dt>
                  <dd className="text-slate-600">{relativeTime(task.updatedAt)}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
