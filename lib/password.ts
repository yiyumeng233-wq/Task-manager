import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * 存的是 "salt:hash"，不存明文。
 * scrypt 是 Node 自带的密钥派生函数，比 md5/sha256 直接散列慢得多，
 * 暴力破解成本高，而且不需要引入 bcrypt 这类需要编译的依赖。
 */
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;

  // 固定时间比较，避免根据响应时间猜出密码
  return timingSafeEqual(candidate, expected);
}
