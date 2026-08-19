import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { formatUser } from "../lib/auth";

const router: Router = Router();

// GET /api/users (admin)
router.get("/users", async (req, res): Promise<void> => {
  const { limit } = req.query;
  const rows = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(limit && !isNaN(Number(limit)) ? Number(limit) : 500);

  res.json(rows.map(formatUser));
});

// PATCH /api/users/:id (admin)
router.patch("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const allowed = ["firstName", "lastName", "fullName", "isPremium", "isAdmin", "onboardingCompleted", "phone", "birthday"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  if ("metadata" in req.body && req.body.metadata && typeof req.body.metadata === "object") {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    updates.metadata = { ...((existing.metadata as Record<string, unknown> | null) ?? {}), ...req.body.metadata };
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatUser(user));
});

export default router;
