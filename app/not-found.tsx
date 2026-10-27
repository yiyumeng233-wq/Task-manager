import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-[12px] uppercase tracking-widest text-slate-400">404</p>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-slate-900">
          This task does not exist
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          It may have been deleted, or the link is wrong.
        </p>
        <Link
          href="/tasks"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-slate-800"
        >
          Back to tasks
        </Link>
      </div>
    </div>
  );
}
