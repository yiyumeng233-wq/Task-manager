"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createTaskAction, type FormState } from "@/lib/actions";

const INITIAL: FormState = { error: null };

const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5";

export function NewTaskForm() {
  const [state, formAction, pending] = useActionState(createTaskAction, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-[12px] font-medium text-slate-600">
              Title
            </label>
            <input
              id="title"
              name="title"
              placeholder="What needs to be done?"
              className={FIELD}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-[12px] font-medium text-slate-600"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="Context, acceptance criteria, links…"
              className={`${FIELD} resize-y leading-relaxed`}
            />
          </div>

          <div>
            <label
              htmlFor="assignee"
              className="mb-1.5 block text-[12px] font-medium text-slate-600"
            >
              Assignee <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="assignee"
              name="assignee"
              placeholder="Who will pick this up?"
              className={FIELD}
              autoComplete="off"
            />
          </div>
        </div>

        {state.error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-600 ring-1 ring-inset ring-rose-100">
            {state.error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-400"
          >
            {pending ? "Creating…" : "Create task"}
          </button>
          <Link
            href="/tasks"
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
