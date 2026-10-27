import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Store "salt:hash", never the plaintext password.
 * Node provides scrypt as a key derivation function that is slower than plain MD5/SHA-256 hashing.
 * It increases brute-force cost without a dependency that requires native compilation.
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

  // Compare in constant time to reduce password timing leaks.
  return timingSafeEqual(candidate, expected);
}
