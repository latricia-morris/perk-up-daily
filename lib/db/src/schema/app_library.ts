import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const appLibraryTable = pgTable("app_library", {
  id: serial("id").primaryKey(),
  contentType: text("content_type").notNull(), // 'quote', 'scripture', 'affirmation', 'power_up', 'micro_story', 'blessing', 'neural_training'
  title: text("title"),
  content: text("content").notNull(),
  author: text("author"),
  category: text("category"),
  tags: text("tags").array(),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata"), // flexible Base44-style fields (is_christian, etc.)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppLibrarySchema = createInsertSchema(appLibraryTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppLibrary = z.infer<typeof insertAppLibrarySchema>;
export type AppLibrary = typeof appLibraryTable.$inferSelect;
