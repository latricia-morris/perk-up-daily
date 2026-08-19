import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bugReportsTable = pgTable("bug_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title"),
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // flexible Base44-style fields (report_type, etc.)
  status: text("status").notNull().default("open"), // 'open', 'in_progress', 'resolved', 'closed'
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBugReportSchema = createInsertSchema(bugReportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBugReport = z.infer<typeof insertBugReportSchema>;
export type BugReport = typeof bugReportsTable.$inferSelect;
