import type { TaskStatus } from "./types";
import { TASK_STATUSES } from "./types";

/**
 * Transition table: the single source of truth for allowed status changes.
 * Form buttons, server validation, and tests all read this table; change rules here.
 *
 *   Pending  → Approve  → To Do  → Done
 *      ↓         ↓         ↓
 *      └─────────┴─────────┴──→ Cancelled
 *
 * Done and Cancelled are terminal states with no outgoing transitions.
 */
export const TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  Pending: ["Approve", "Cancelled"],
  Approve: ["To Do", "Cancelled"],
  "To Do": ["Done", "Cancelled"],
  Done: [],
  Cancelled: [],
};

export function nextStatuses(current: TaskStatus): readonly TaskStatus[] {
  return TRANSITIONS[current] ?? [];
}

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return nextStatuses(from).includes(to);
}

export function isTerminal(status: TaskStatus): boolean {
  return nextStatuses(status).length === 0;
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value);
}

type StatusMeta = {
  label: string;
  hint: string;
  badge: string;
  dot: string;
};

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  Pending: {
    label: "Pending",
    hint: "Newly created, waiting for an administrator to review.",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  Approve: {
    label: "Approve",
    hint: "Approved, waiting to be scheduled.",
    badge: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  "To Do": {
    label: "To Do",
    hint: "Scheduled and being worked on.",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  Done: {
    label: "Done",
    hint: "Finished. Final state.",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    label: "Cancelled",
    hint: "Dropped. Final state.",
    badge: "bg-slate-100 text-slate-500 ring-slate-200",
    dot: "bg-slate-400",
  },
};
