/** Verify a public demo account using the Worker-compatible Web Crypto API. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, roundsText, salt, expectedHex] = stored.split(":");
  const rounds = Number(roundsText);
  if (algorithm !== "pbkdf2" || rounds !== 100000 || !salt || !/^[a-f0-9]{64}$/.test(expectedHex ?? "")) return false;
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: rounds }, material, 256);
  const actual = new Uint8Array(bits);
  const expected = Uint8Array.from(expectedHex.match(/../g)!, value => parseInt(value, 16));
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
  return difference === 0;
}
