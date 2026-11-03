"use client";

import { useActionState, useState } from "react";
import { loginAction, type FormState } from "@/lib/actions";

const INITIAL: FormState = { error: null };

const DEMO_ACCOUNTS = [
  { label: "Administrator", email: "admin@example.com", password: "admin123", tone: "indigo" },
  { label: "Viewer", email: "viewer@example.com", password: "viewer123", tone: "slate" },
] as const;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1.5 text-[13px] text-slate-500">
          Use your account to access the task board.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[12px] font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[12px] font-medium text-slate-600"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-600 ring-1 ring-inset ring-rose-100">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-400"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white/60 p-3.5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Demo accounts
        </p>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-50"
            >
              <span className="text-[12px] font-medium text-slate-700">{account.label}</span>
              <span className="font-mono text-[11px] text-slate-400">
                {account.email} / {account.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
