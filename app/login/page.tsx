import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";

const POINTS = [
  { title: "One board", body: "Every task, every status, no spreadsheet hunting." },
  { title: "Two roles", body: "Admins move work forward, viewers stay in the loop." },
  { title: "Full history", body: "Each status change is logged with who and when." },
];

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/tasks");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[14px] font-bold text-white ring-1 ring-inset ring-white/15">
            T
          </div>
          <span className="text-[13px] font-semibold tracking-wide text-white/80">Task Manager</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[32px] font-semibold leading-tight tracking-tight text-white">
            All the work,
            <br />
            in one place.
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-400">
            A small internal board built to answer one question: where is this task right now?
          </p>

          <dl className="mt-10 space-y-5">
            {POINTS.map((point) => (
              <div key={point.title} className="flex gap-3.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <div>
                  <dt className="text-[13px] font-medium text-white">{point.title}</dt>
                  <dd className="mt-0.5 text-[12.5px] leading-relaxed text-slate-400">
                    {point.body}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-[11px] text-slate-600">
          Next.js App Router · Server Actions · JSON store
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[360px]">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
