import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  hashPassword,
  verifyPassword,
  createSession,
  requireAuth,
  deleteSession,
  formatUser,
} from "../lib/auth";

const router: Router = Router();

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  res.json(formatUser(user));
});

// POST /api/auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = await createSession(user.id);
  res.json({ token, user: formatUser(user) });
});

// POST /api/auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
      fullName: firstName && lastName ? `${firstName} ${lastName}` : firstName || null,
    })
    .returning();

  const token = await createSession(user.id);
  res.status(201).json({ token, user: formatUser(user) });
});

// POST /api/auth/logout
router.post("/auth/logout", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await deleteSession(token);
  }
  res.json({ success: true });
});

// PATCH /api/auth/update-me
router.patch("/auth/update-me", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  // NOTE: privilege fields (isAdmin, isPremium) are intentionally NOT self-serviceable.
  const allowed = ["firstName", "lastName", "fullName", "profilePicture", "phone", "birthday", "onboardingCompleted", "dailyCheckInEnabled", "notificationsEnabled"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in req.body) {
      updates[key] = req.body[key];
    }
  }

  // Merge flexible metadata fields (Base44-style profile fields).
  // Strip privilege-adjacent keys so users cannot self-escalate via metadata.
  if ("metadata" in req.body && req.body.metadata && typeof req.body.metadata === "object") {
    const PRIVILEGED_META_KEYS = ["role", "subscription_status", "is_admin", "is_premium", "isAdmin", "isPremium"];
    const incoming = { ...req.body.metadata };
    for (const key of PRIVILEGED_META_KEYS) delete incoming[key];
    const existing = (user.metadata as Record<string, unknown> | null) ?? {};
    updates.metadata = { ...existing, ...incoming };
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(formatUser(updated));
});

// POST /api/auth/forgot-password — email delivery not configured on this deployment.
// Return 501 so the UI can inform the user honestly rather than pretending an email was sent.
router.post("/auth/forgot-password", async (_req, res): Promise<void> => {
  res.status(501).json({ error: "Password reset is not available yet. Please contact support to regain access." });
});

// POST /api/auth/reset-password
router.post("/auth/reset-password", async (_req, res): Promise<void> => {
  res.status(501).json({ error: "Password reset is not available yet. Please contact support to regain access." });
});

export default router;
