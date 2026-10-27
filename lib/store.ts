import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "./password";
import type { Task, TaskStatus, User } from "./types";

/**
 * Storage layer: this is the only application module that accesses the filesystem.
 * A SQLite/Postgres migration can keep callers behind this interface, with async changes as needed.
 */

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "db.json");

type Database = {
  users: User[];
  tasks: Task[];
};

/** Generate a seed timestamp at a specified time n days ago. */
function at(daysAgo: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seed(): Database {
  return {
    users: [
      {
        id: "u_admin",
        name: "Yuheng Yang",
        email: "admin@example.com",
        passwordHash: hashPassword("admin123"),
        role: "Administrator",
      },
      {
        id: "u_viewer",
        name: "Yuheng Yang",
        email: "viewer@example.com",
        passwordHash: hashPassword("viewer123"),
        role: "Viewer",
      },
    ],
    tasks: [
      {
        id: "T-001",
        title: "Set up the project skeleton",
        description:
          "App Router + TypeScript + Tailwind. Agree on the folder layout first so every later change lands in the same place.",
        assignee: "Yuheng Yang",
        status: "Done",
        createdBy: "Yuheng Yang",
        createdAt: at(9, 9, 12),
        updatedAt: at(7, 16, 40),
        history: [
          { at: at(9, 9, 12), from: null, to: "Pending", by: "Yuheng Yang", note: "Created" },
          {
            at: at(8, 11, 30),
            from: "Pending",
            to: "Approve",
            by: "Yuheng Yang",
            note: "Layout looks sensible, approved",
          },
          {
            at: at(7, 15, 10),
            from: "Approve",
            to: "To Do",
            by: "Task Reviewer",
            note: "Into this sprint",
          },
          {
            at: at(7, 16, 40),
            from: "To Do",
            to: "Done",
            by: "Yuheng Yang",
            note: "Done and self-reviewed",
          },
        ],
      },
      {
        id: "T-002",
        title: "Session-based login",
        description:
          "Keep the session in an httpOnly cookie signed with HMAC, hash passwords with scrypt. Login survives a refresh and dies on sign out.",
        assignee: "Yuheng Yang",
        status: "To Do",
        createdBy: "Yuheng Yang",
        createdAt: at(6, 10, 5),
        updatedAt: at(2, 14, 20),
        history: [
          { at: at(6, 10, 5), from: null, to: "Pending", by: "Yuheng Yang", note: "Created" },
          {
            at: at(5, 9, 50),
            from: "Pending",
            to: "Approve",
            by: "Yuheng Yang",
            note: "High priority, blocking the rest",
          },
          {
            at: at(2, 14, 20),
            from: "Approve",
            to: "To Do",
            by: "Task Reviewer",
            note: "Picked up",
          },
        ],
      },
      {
        id: "T-003",
        title: "Role-based permission check",
        description:
          "Administrators create tasks, review status and delete them. Viewers only read. The check has to run on the server — hiding a button is not a boundary.",
        assignee: "Yuheng Yang",
        status: "Approve",
        createdBy: "Task Reviewer",
        createdAt: at(4, 15, 20),
        updatedAt: at(3, 10, 15),
        history: [
          { at: at(4, 15, 20), from: null, to: "Pending", by: "Task Reviewer", note: "Created" },
          { at: at(3, 10, 15), from: "Pending", to: "Approve", by: "Yuheng Yang", note: "Approved" },
        ],
      },
      {
        id: "T-004",
        title: "Status transition guard",
        description:
          "Keep Pending → Approve → To Do → Done in one table shared by the UI and the server. Illegal moves get rejected server-side, not just greyed out.",
        assignee: "Yuheng Yang",
        status: "Pending",
        createdBy: "Yuheng Yang",
        createdAt: at(3, 14, 2),
        updatedAt: at(3, 14, 2),
        history: [
          { at: at(3, 14, 2), from: null, to: "Pending", by: "Yuheng Yang", note: "Created" },
        ],
      },
      {
        id: "T-005",
        title: "Replace JSON store with SQLite",
        description:
          "A JSON file is fine for one person. Concurrent writes need transactions — move to Prisma + SQLite and keep the function signatures unchanged.",
        assignee: "Yuheng Yang",
        status: "Pending",
        createdBy: "Task Reviewer",
        createdAt: at(2, 17, 35),
        updatedAt: at(2, 17, 35),
        history: [
          { at: at(2, 17, 35), from: null, to: "Pending", by: "Task Reviewer", note: "Created" },
        ],
      },
      {
        id: "T-006",
        title: "Add audit log export",
        description:
          "Export the status history of every task to CSV, so we can tell who changed what and when after the fact.",
        assignee: "Unassigned",
        status: "Cancelled",
        createdBy: "Task Reviewer",
        createdAt: at(8, 10, 48),
        updatedAt: at(6, 9, 30),
        history: [
          { at: at(8, 10, 48), from: null, to: "Pending", by: "Task Reviewer", note: "Created" },
          {
            at: at(6, 9, 30),
            from: "Pending",
            to: "Cancelled",
            by: "Yuheng Yang",
            note: "Out of scope for now",
          },
        ],
      },
    ],
  };
}

function readDb(): Database {
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
  } catch {
    // Initialize seed data when reading or parsing the database fails.
    const db = seed();
    writeDb(db);
    return db;
  }
}

function writeDb(db: Database) {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  // Write a temporary file, then rename it to avoid leaving partially written JSON.
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  renameSync(tmp, DB_PATH);
}

function nextTaskId(tasks: Task[]) {
  const max = tasks.reduce((acc, t) => {
    const n = Number(t.id.replace(/\D/g, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `T-${String(max + 1).padStart(3, "0")}`;
}

export function listTasks(): Task[] {
  return readDb().tasks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getTask(id: string): Task | null {
  return readDb().tasks.find((t) => t.id === id) ?? null;
}

export function findUserByEmail(email: string): User | null {
  const target = email.trim().toLowerCase();
  return readDb().users.find((u) => u.email.toLowerCase() === target) ?? null;
}

export function createTask(input: {
  title: string;
  description: string;
  assignee: string;
  createdBy: string;
}): Task {
  const db = readDb();
  const now = new Date().toISOString();

  const task: Task = {
    id: nextTaskId(db.tasks),
    title: input.title,
    description: input.description,
    assignee: input.assignee || "Unassigned",
    status: "Pending",
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, from: null, to: "Pending", by: input.createdBy, note: "Created" }],
  };

  db.tasks.push(task);
  writeDb(db);
  return task;
}

export function transitionTask(id: string, to: TaskStatus, by: string, note = ""): Task | null {
  const db = readDb();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) return null;

  const now = new Date().toISOString();
  task.history.push({ at: now, from: task.status, to, by, note });
  task.status = to;
  task.updatedAt = now;

  writeDb(db);
  return task;
}

export function deleteTask(id: string): boolean {
  const db = readDb();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((t) => t.id !== id);
  if (db.tasks.length === before) return false;
  writeDb(db);
  return true;
}
