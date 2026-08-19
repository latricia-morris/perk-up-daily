import { Router } from "express";
import { db, appLibraryTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: Router = Router();

// GET /api/library
router.get("/library", async (req, res): Promise<void> => {
  const { content_type, status, limit } = req.query;

  const conditions = [];
  if (content_type && typeof content_type === "string") {
    conditions.push(eq(appLibraryTable.contentType, content_type));
  }
  if (status && typeof status === "string") {
    conditions.push(eq(appLibraryTable.status, status));
  }

  const rows = await db
    .select()
    .from(appLibraryTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(appLibraryTable.sortOrder), asc(appLibraryTable.createdAt))
    .limit(limit && !isNaN(Number(limit)) ? Number(limit) : 500);

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// POST /api/library (admin only)
router.post("/library", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { contentType, content, title, author, category, status, sortOrder, imageUrl, metadata } = req.body;

  if (!contentType || !content) {
    res.status(400).json({ error: "contentType and content are required" });
    return;
  }

  const [item] = await db
    .insert(appLibraryTable)
    .values({ contentType, content, title: title || null, author: author || null, category: category || null, status: status || "active", sortOrder: sortOrder ?? 0, imageUrl: imageUrl || null, metadata: metadata || null })
    .returning();

  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

// POST /api/library/bulk (admin only)
router.post("/library/bulk", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "items array required" });
    return;
  }

  const rows = await db
    .insert(appLibraryTable)
    .values(items.map((it: { contentType: string; content: string; title?: string; author?: string; category?: string; status?: string; sortOrder?: number; imageUrl?: string; metadata?: Record<string, unknown> }) => ({
      contentType: it.contentType,
      content: it.content,
      title: it.title || null,
      author: it.author || null,
      category: it.category || null,
      status: it.status || "active",
      sortOrder: it.sortOrder ?? 0,
      imageUrl: it.imageUrl || null,
      metadata: it.metadata || null,
    })))
    .returning();

  res.status(201).json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

// PATCH /api/library/:id (admin only)
router.patch("/library/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const allowed = ["title", "content", "author", "category", "status", "sortOrder", "imageUrl", "metadata"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }

  const [item] = await db.update(appLibraryTable).set(updates).where(eq(appLibraryTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }

  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

// DELETE /api/library/:id (admin only)
router.delete("/library/:id", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [deleted] = await db.delete(appLibraryTable).where(eq(appLibraryTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Not found" }); return; }

  res.sendStatus(204);
});

export default router;
