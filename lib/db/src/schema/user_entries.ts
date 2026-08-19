import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userEntriesTable = pgTable("user_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entryType: text("entry_type").notNull(), // 'reflection', 'quote', 'scripture', 'affirmation', 'power_up', 'accomplishment', 'milestone', 'micro_story', 'blessing', 'vision_goal', 'note', 'identity_upgrade'
  title: text("title"),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserEntrySchema = createInsertSchema(userEntriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserEntry = z.infer<typeof insertUserEntrySchema>;
export type UserEntry = typeof userEntriesTable.$inferSelect;
