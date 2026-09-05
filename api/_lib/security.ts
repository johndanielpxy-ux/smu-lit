import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function secretsMatch(received: string, expected: string) {
  return timingSafeEqual(digest(received), digest(expected));
}
