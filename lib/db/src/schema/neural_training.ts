import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const neuralTrainingTable = pgTable("neural_training", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  exerciseType: text("exercise_type").notNull(), // 'mindset', 'focus', 'resilience', 'clarity'
  content: text("content"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  durationMinutes: integer("duration_minutes"),
  status: text("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNeuralTrainingSchema = createInsertSchema(neuralTrainingTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNeuralTraining = z.infer<typeof insertNeuralTrainingSchema>;
export type NeuralTraining = typeof neuralTrainingTable.$inferSelect;
