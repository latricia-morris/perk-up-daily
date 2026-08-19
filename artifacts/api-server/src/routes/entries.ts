import { Router } from "express";
import { db, userEntriesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: Router = Router();

// GET /api/entries
router.get("/entries", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { entry_type, limit } = req.query;

  let query = db
    .select()
    .from(userEntriesTable)
    .where(eq(userEntriesTable.userId, user.id))
    .$dynamic();

  if (entry_type && typeof entry_type === "string") {
    query = db
      .select()
      .from(userEntriesTable)
      .where(and(eq(userEntriesTable.userId, user.id), eq(userEntriesTable.entryType, entry_type)))
      .$dynamic();
  }

  const rows = await db
    .select()
    .from(userEntriesTable)
    .where(
      entry_type && typeof entry_type === "string"
        ? and(eq(userEntriesTable.userId, user.id), eq(userEntriesTable.entryType, entry_type))
        : eq(userEntriesTable.userId, user.id)
    )
    .orderBy(desc(userEntriesTable.createdAt))
    .limit(limit && !isNaN(Number(limit)) ? Number(limit) : 500);

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// POST /api/entries
router.post("/entries", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { entryType, title, content, metadata } = req.body;

  if (!entryType) {
    res.status(400).json({ error: "entryType is required" });
    return;
  }

  const [entry] = await db
    .insert(userEntriesTable)
    .values({ userId: user.id, entryType, title: title || null, content: content || null, metadata: metadata || null })
    .returning();

  res.status(201).json({ ...entry, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() });
});

// PATCH /api/entries/:id
router.patch("/entries/:id", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, content, metadata } = req.body;
  const updates: Record<string, unknown> = {};
  if ("title" in req.body) updates.title = title;
  if ("content" in req.body) updates.content = content;
  if ("metadata" in req.body) updates.metadata = metadata;

  const [entry] = await db
    .update(userEntriesTable)
    .set(updates)
    .where(and(eq(userEntriesTable.id, id), eq(userEntriesTable.userId, user.id)))
    .returning();

  if (!entry) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({ ...entry, createdAt: entry.createdAt.toISOString(), updatedAt: entry.updatedAt.toISOString() });
});

// DELETE /api/entries/:id
router.delete("/entries/:id", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [deleted] = await db
    .delete(userEntriesTable)
    .where(and(eq(userEntriesTable.id, id), eq(userEntriesTable.userId, user.id)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
