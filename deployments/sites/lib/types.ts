export type Role = "Administrator" | "Viewer";

export const TASK_STATUSES = [
  "Pending",
  "Approve",
  "To Do",
  "Done",
  "Cancelled",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskEvent = {
  at: string;
  from: TaskStatus | null;
  to: TaskStatus;
  by: string;
  note: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: TaskEvent[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
};

export type PublicUser = Pick<User, "id" | "name" | "email" | "role">;
