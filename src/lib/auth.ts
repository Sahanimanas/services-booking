import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { Role } from "@prisma/client";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-fallback-secret-change-me"
);
const COOKIE = "hf_session";

export type SessionPayload = {
  uid: string;
  role: Role;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, SECRET);
    return { uid: String(payload.uid), role: payload.role as Role };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.uid } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

// Edge-compatible verification used in middleware.
export async function verifyTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { uid: String(payload.uid), role: payload.role as Role };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
