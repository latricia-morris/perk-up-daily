import { Router } from "express";
import { db, neuralTrainingTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router: Router = Router();

// GET /api/neural-training
router.get("/neural-training", async (req, res): Promise<void> => {
  const { exercise_type, status } = req.query;

  const conditions = [];
  if (exercise_type && typeof exercise_type === "string") {
    conditions.push(eq(neuralTrainingTable.exerciseType, exercise_type));
  }
  if (status && typeof status === "string") {
    conditions.push(eq(neuralTrainingTable.status, status));
  }

  const rows = await db
    .select()
    .from(neuralTrainingTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(neuralTrainingTable.sortOrder));

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

export default router;
