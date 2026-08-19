import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const neurocycleCheckInsTable = pgTable("neurocycle_check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  day: integer("day").notNull().default(1),
  stepData: jsonb("step_data"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertNeurocycleCheckInSchema = createInsertSchema(neurocycleCheckInsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNeurocycleCheckIn = z.infer<typeof insertNeurocycleCheckInSchema>;
export type NeurocycleCheckIn = typeof neurocycleCheckInsTable.$inferSelect;
