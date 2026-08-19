import { Router } from "express";
import { db, bugReportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: Router = Router();

// GET /api/bugs
router.get("/bugs", async (req, res): Promise<void> => {
  const { status, limit } = req.query;
  const rows = await db
    .select()
    .from(bugReportsTable)
    .where(status && typeof status === "string" ? eq(bugReportsTable.status, status) : undefined)
    .orderBy(desc(bugReportsTable.createdAt))
    .limit(limit && !isNaN(Number(limit)) ? Number(limit) : 200);

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// POST /api/bugs
router.post("/bugs", async (req, res): Promise<void> => {
  const { description, title, metadata } = req.body;
  if (!description) { res.status(400).json({ error: "description is required" }); return; }

  // Optional: attach user if token present
  let userId: number | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { getUserFromToken } = await import("../lib/auth");
      const user = await getUserFromToken(authHeader.slice(7));
      if (user) userId = user.id;
    } catch { /* no-op */ }
  }

  const [row] = await db.insert(bugReportsTable).values({ description, title: title || null, metadata: metadata || null, userId, status: "open" }).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
});

// PATCH /api/bugs/:id
router.patch("/bugs/:id", async (req, res): Promise<void> => {
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

// DELETE /api/bugs/:id
router.delete("/bugs/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(bugReportsTable).where(eq(bugReportsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
