"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, getSession, startSession } from "./auth";
import { verifyPassword } from "./password";
import {
  createTask,
  deleteTask,
  findUserByEmail,
  getTask,
  transitionTask,
} from "./store";
import { canTransition, isTaskStatus } from "./workflow";

export type FormState = { error: string } | { error: null };

/* ---------------------------------- 认证 ---------------------------------- */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = findUserByEmail(email);

  // 用户不存在和密码错误给同一句提示，避免泄露「这个邮箱注册过」
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await startSession({ uid: user.id, name: user.name, role: user.role });
  redirect("/tasks");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}

/* ---------------------------------- 任务 ---------------------------------- */

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  // 权限判定必须在服务端：前端藏按钮只是体验，不是安全边界
  if (session.role !== "Administrator") {
    return { error: "Only an Administrator can create tasks." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const assignee = String(formData.get("assignee") ?? "").trim();

  if (title.length < 4) {
    return { error: "Title needs at least 4 characters." };
  }
  if (description.length < 10) {
    return { error: "Description needs at least 10 characters." };
  }

  const task = createTask({ title, description, assignee, createdBy: session.name });
  revalidatePath("/tasks");
  redirect(`/tasks/${task.id}`);
}

/**
 * 状态流转。这里是整套逻辑的收口：
 * 先验身份 → 再验权限 → 再验这条流转合不合法 → 最后才落库。
 * 有任何一步不过，直接回错误，不修改数据。
 */
export async function transitionAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const to = String(formData.get("to") ?? "");

  if (session.role !== "Administrator") {
    redirect(`/tasks/${id}?error=forbidden`);
  }
  if (!isTaskStatus(to)) {
    redirect(`/tasks/${id}?error=unknown-status`);
  }

  const task = getTask(id);
  if (!task) redirect("/tasks?error=not-found");

  if (!canTransition(task.status, to)) {
    redirect(`/tasks/${id}?error=illegal-transition`);
  }

  transitionTask(id, to, session.name);
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${id}`);
  redirect(`/tasks/${id}?ok=1`);
}

export async function deleteTaskAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "Administrator") redirect("/tasks?error=forbidden");

  const id = String(formData.get("id") ?? "");
  deleteTask(id);
  revalidatePath("/tasks");
  redirect("/tasks?ok=deleted");
}
