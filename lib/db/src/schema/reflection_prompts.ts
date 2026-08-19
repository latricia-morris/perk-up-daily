import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reflectionPromptsTable = pgTable("reflection_prompts", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  category: text("category"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReflectionPromptSchema = createInsertSchema(reflectionPromptsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReflectionPrompt = z.infer<typeof insertReflectionPromptSchema>;
export type ReflectionPrompt = typeof reflectionPromptsTable.$inferSelect;
