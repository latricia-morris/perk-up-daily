import { Router } from "express";
import { db, reflectionPromptsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

// GET /api/prompts
router.get("/prompts", async (req, res): Promise<void> => {
  const { status } = req.query;
  const rows = await db
    .select()
    .from(reflectionPromptsTable)
    .where(status && typeof status === "string" ? eq(reflectionPromptsTable.status, status) : undefined)
    .orderBy(desc(reflectionPromptsTable.createdAt));

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// POST /api/prompts
router.post("/prompts", async (req, res): Promise<void> => {
  const { prompt, category, status } = req.body;
  if (!prompt) { res.status(400).json({ error: "prompt is required" }); return; }

  const [row] = await db.insert(reflectionPromptsTable).values({ prompt, category: category || null, status: status || "active" }).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
});

// PATCH /api/prompts/:id
router.patch("/prompts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates: Record<string, unknown> = {};
  for (const key of ["prompt", "category", "status"]) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const [row] = await db.update(reflectionPromptsTable).set(updates).where(eq(reflectionPromptsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
});

// DELETE /api/prompts/:id
router.delete("/prompts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(reflectionPromptsTable).where(eq(reflectionPromptsTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
