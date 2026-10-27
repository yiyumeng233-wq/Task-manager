"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const VARIANTS = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400 border border-transparent",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400",
  danger:
    "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:text-rose-300",
} as const;

type Props = {
  children: ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  /** 传了就弹一次确认，用浏览器原生 confirm，够用且不引组件库 */
  confirmText?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Working…",
  variant = "primary",
  className = "",
  confirmText,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (confirmText && !window.confirm(confirmText)) event.preventDefault();
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
