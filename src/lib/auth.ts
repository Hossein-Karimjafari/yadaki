import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";

const SESSION_COOKIE = "yadaki_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET missing/short in .env");
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, role: UserRole) {
  const token = await new SignJWT({ uid: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getSession = cache(
  async (): Promise<{ userId: string; role: UserRole } | null> => {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    try {
      const { payload } = await jwtVerify(token, secretKey());
      if (!payload.uid || !payload.role) return null;
      return { userId: payload.uid as string, role: payload.role as UserRole };
    } catch {
      return null;
    }
  }
);

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status === "BLOCKED") return null;
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}
