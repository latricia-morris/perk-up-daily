import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db, sessionsTable, usersTable } from "@workspace/db";
import { eq, gt } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function createSession(userId: number): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessionsTable).values({ userId, token, expiresAt });
  return token;
}

export async function getUserFromToken(token: string) {
  const now = new Date();
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .limit(1);

  if (!session || session.expiresAt < now) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  // @ts-ignore
  req.user = user;
  next();
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

export function formatUser(user: { id: number; email: string; firstName: string | null; lastName: string | null; fullName: string | null; profilePicture: string | null; phone: string | null; isAdmin: boolean; isPremium: boolean; birthday: string | null; onboardingCompleted: boolean; metadata?: unknown; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    profilePicture: user.profilePicture,
    phone: user.phone,
    isAdmin: user.isAdmin,
    isPremium: user.isPremium,
    birthday: user.birthday,
    onboardingCompleted: user.onboardingCompleted,
    metadata: (user.metadata as Record<string, unknown> | null) ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
