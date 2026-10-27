import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "./types";

/**
 * Store uid, name, and role in a signed payload inside an httpOnly cookie.
 *
 * The server only needs to verify that the payload has not been modified.
 * HMAC-SHA256 provides that check without a JWT dependency or algorithm configuration.
 * Using localStorage would expose the token to page scripts and XSS.
 * Page scripts cannot read an httpOnly cookie; the browser sends it with requests.
 */

export const SESSION_COOKIE = "tm_session";

const SECRET = process.env.SESSION_SECRET ?? "task-manager-dev-secret-please-change";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

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

/** Page guard: redirect unauthenticated visitors to the login page. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Page guard: redirect non-administrators to the list, including direct URL visits. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "Administrator") redirect("/tasks");
  return session;
}

/** Call only from a Server Action or Route Handler. */
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
