import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./types";

/**
 * 会话方案：把 uid/name/role 放进一个签名过的串，塞进 httpOnly cookie。
 *
 * 为什么不用 JWT 库：这里只需要「服务端能验证内容没被改过」，
 * 一个 HMAC-SHA256 就够了，少一个依赖，也少一堆算法选择的坑。
 * 为什么不存 localStorage：那样 JavaScript 能读到 token，一个 XSS 就被偷走；
 * httpOnly 的 cookie 前端脚本拿不到，同时浏览器每次请求自动带上。
 */

export const SESSION_COOKIE = "tm_session";

const SECRET = process.env.SESSION_SECRET ?? "task-manager-dev-secret-please-change";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 小时

export type Session = {
  uid: string;
  name: string;
  role: Role;
  exp: number;
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createToken(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): Session | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (!session.uid || !session.role) return null;
    if (session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

/** 页面里用：没登录直接跳登录页 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** 页面里用：不是管理员就回列表，别让通过 URL 直接摸到管理页 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "Administrator") redirect("/tasks");
  return session;
}

/** 只能在一个 Server Action 或 Route Handler 里调用 */
export async function startSession(session: Omit<Session, "exp">) {
  const store = await cookies();
  const full: Session = { ...session, exp: Date.now() + MAX_AGE_SECONDS * 1000 };

  store.set(SESSION_COOKIE, createToken(full), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
