import { randomUUID } from "crypto";

const CUID_RE = /^c[a-z0-9]{24}$/;

export function newCartToken(): string {
  return randomUUID().replace(/-/g, "");
}

export function isCartToken(token: string): boolean {
  return /^[a-f0-9]{32}$/.test(token) || CUID_RE.test(token);
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimitAction(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= max;
}
