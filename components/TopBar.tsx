import { logoutAction } from "@/lib/actions";
import type { Session } from "@/lib/auth";
import { initials } from "@/lib/format";

export function TopBar({ session }: { session: Session }) {
  const isAdmin = session.role === "Administrator";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[13px] font-bold text-white">
            T
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-slate-900">Task Manager</p>
            <p className="text-[11px] text-slate-400">Internal task tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
              {initials(session.name)}
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-medium text-slate-800">{session.name}</p>
              <p className="text-[11px] text-slate-400">{session.role}</p>
            </div>
          </div>

          <span
            className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              isAdmin ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            {isAdmin ? "Admin" : "Viewer"}
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
