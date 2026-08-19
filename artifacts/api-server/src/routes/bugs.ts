import { Router } from "express";
import { db, bugReportsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: Router = Router();

// GET /api/bugs — admins see all; regular users see only their own reports
router.get("/bugs", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { status, limit } = req.query;

  const conditions = [];
  if (!user.isAdmin) conditions.push(eq(bugReportsTable.userId, user.id));
  if (status && typeof status === "string") conditions.push(eq(bugReportsTable.status, status));

  const rows = await db
    .select()
    .from(bugReportsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bugReportsTable.createdAt))
    .limit(limit && !isNaN(Number(limit)) ? Number(limit) : 200);

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// POST /api/bugs — any authenticated user can file a report
router.post("/bugs", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { description, title, metadata } = req.body;
  if (!description) { res.status(400).json({ error: "description is required" }); return; }

  const [row] = await db.insert(bugReportsTable).values({ description, title: title || null, metadata: metadata || null, userId: user.id, status: "open" }).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
});

// PATCH /api/bugs/:id (admin only)
router.patch("/bugs/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates: Record<string, unknown> = {};
  for (const key of ["status", "adminNotes", "title", "metadata"]) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const [row] = await db.update(bugReportsTable).set(updates).where(eq(bugReportsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
});

// DELETE /api/bugs/:id (admin only)
router.delete("/bugs/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(bugReportsTable).where(eq(bugReportsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
