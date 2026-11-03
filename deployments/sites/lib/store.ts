import { env } from "cloudflare:workers";
import { seed } from "../db/seed";
import type { Task, TaskStatus, User } from "./types";
import { canTransition } from "./workflow";

type TaskRow = { id: number; record: string; version: number };

function database(): D1Database {
  if (!env.DB) throw new Error("Persistent DB binding is unavailable.");
  return env.DB;
}

// Migrations own the schema. One transactional batch initializes only public fixtures.
async function ready(): Promise<D1Database> {
  const db = database();
  const initialized = await db.prepare("SELECT value FROM app_metadata WHERE key = 'seed-v1'").first();
  if (initialized) {
    const currentCredentials = await db.prepare("SELECT value FROM app_metadata WHERE key = 'demo-password-v2'").first();
    if (!currentCredentials) {
      // Upgrade only public demo credentials; retain all task data and history.
      await db.batch([
        ...seed.users.map(user => db.prepare("UPDATE demo_users SET password_hash = ? WHERE id = ? AND email = ?").bind(user.passwordHash, user.id, user.email)),
        db.prepare("INSERT OR IGNORE INTO app_metadata (key,value) VALUES ('demo-password-v2','complete')"),
      ]);
    }
    return db;
  }
  const unseeded = " WHERE NOT EXISTS (SELECT 1 FROM app_metadata WHERE key = 'seed-v1')";
  const statements = seed.users.map(user => db.prepare("INSERT OR IGNORE INTO demo_users (id,name,email,password_hash,role) SELECT ?,?,?,?,?" + unseeded).bind(user.id,user.name,user.email,user.passwordHash,user.role));
  for (const task of seed.tasks) statements.push(db.prepare("INSERT OR IGNORE INTO task_records (id,record,version) SELECT ?,?,0" + unseeded).bind(Number(task.id.slice(2)), JSON.stringify(task)));
  statements.push(db.prepare("INSERT OR IGNORE INTO app_metadata (key,value) VALUES ('demo-password-v2','complete')"));
  statements.push(db.prepare("INSERT OR IGNORE INTO app_metadata (key,value) VALUES ('seed-v1','complete')"));
  await db.batch(statements);
  return db;
}

function taskFromRow(row: TaskRow): Task {
  return { ...JSON.parse(row.record) as Task, id: `T-${String(row.id).padStart(3,"0")}` };
}

function numericId(id: string): number | null {
  return /^T-\d+$/.test(id) && Number.isSafeInteger(Number(id.slice(2))) ? Number(id.slice(2)) : null;
}

export async function listTasks(): Promise<Task[]> {
  const db = await ready();
  const { results } = await db.prepare("SELECT id,record,version FROM task_records").all<TaskRow>();
  return results.map(taskFromRow).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getTask(id: string): Promise<Task | null> {
  const key = numericId(id);
  if (key === null) return null;
  const db = await ready();
  const row = await db.prepare("SELECT id,record,version FROM task_records WHERE id = ?").bind(key).first<TaskRow>();
  return row ? taskFromRow(row) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await ready();
  return db.prepare('SELECT id,name,email,password_hash AS passwordHash,role FROM demo_users WHERE email = ?').bind(email.trim().toLowerCase()).first<User>();
}

export async function createTask(input: { title: string; description: string; assignee: string; createdBy: string }): Promise<Task> {
  const db = await ready();
  const now = new Date().toISOString();
  const task: Task = { ...input, id:"", assignee: input.assignee || "Unassigned", status:"Pending", createdAt:now, updatedAt:now, history:[{at:now,from:null,to:"Pending",by:input.createdBy,note:"Created"}] };
  const row = await db.prepare("INSERT INTO task_records (record,version) VALUES (?,0) RETURNING id,record,version").bind(JSON.stringify(task)).first<TaskRow>();
  if (!row) throw new Error("Task could not be created.");
  return taskFromRow(row);
}

// Compare-and-swap protects status/history from simultaneous writes.
export async function transitionTask(id: string, to: TaskStatus, by: string, note = ""): Promise<Task | null> {
  const key = numericId(id);
  if (key === null) return null;
  const db = await ready();
  const row = await db.prepare("SELECT id,record,version FROM task_records WHERE id = ?").bind(key).first<TaskRow>();
  if (!row) return null;
  const task = taskFromRow(row);
  if (!canTransition(task.status,to)) return null;
  const now = new Date().toISOString();
  task.history.push({at:now,from:task.status,to,by,note});
  task.status = to;
  task.updatedAt = now;
  const result = await db.prepare("UPDATE task_records SET record = ?,version = version + 1 WHERE id = ? AND version = ?").bind(JSON.stringify(task),key,row.version).run();
  return result.meta.changes === 1 ? task : null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const key = numericId(id);
  if (key === null) return false;
  const db = await ready();
  const result = await db.prepare("DELETE FROM task_records WHERE id = ?").bind(key).run();
  return result.meta.changes === 1;
}
