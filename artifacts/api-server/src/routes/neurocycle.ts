import { Router } from "express";
import { db, neurocycleCheckInsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: Router = Router();

// GET /api/neurocycle
router.get("/neurocycle", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const rows = await db
    .select()
    .from(neurocycleCheckInsTable)
    .where(eq(neurocycleCheckInsTable.userId, user.id))
    .orderBy(desc(neurocycleCheckInsTable.createdAt));

  res.json(rows.map(r => ({
    ...r,
    completedAt: r.completedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  })));
});

// POST /api/neurocycle
router.post("/neurocycle", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { day, stepData, completedAt } = req.body;

  if (day === undefined) { res.status(400).json({ error: "day is required" }); return; }

  const [row] = await db
    .insert(neurocycleCheckInsTable)
    .values({
      userId: user.id,
      day: Number(day),
      stepData: stepData || null,
      completedAt: completedAt ? new Date(completedAt) : null,
    })
    .returning();

  res.status(201).json({
    ...row,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

// PATCH /api/neurocycle/:id
router.patch("/neurocycle/:id", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const updates: Record<string, unknown> = {};
  if ("day" in req.body) updates.day = Number(req.body.day);
  if ("stepData" in req.body) updates.stepData = req.body.stepData;
  if ("completedAt" in req.body) updates.completedAt = req.body.completedAt ? new Date(req.body.completedAt) : null;

  const [row] = await db
    .update(neurocycleCheckInsTable)
    .set(updates)
    .where(and(eq(neurocycleCheckInsTable.id, id), eq(neurocycleCheckInsTable.userId, user.id)))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  res.json({
    ...row,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

export default router;
