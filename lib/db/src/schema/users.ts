import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  profilePicture: text("profile_picture"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isPremium: boolean("is_premium").notNull().default(false),
  premiumUntil: timestamp("premium_until", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripeCheckoutPriceId: text("stripe_checkout_price_id"),
  stripeCheckoutIdempotencyKey: text("stripe_checkout_idempotency_key"),
  stripeCheckoutCreatedAt: timestamp("stripe_checkout_created_at", { withTimezone: true }),
  birthday: text("birthday"),
  dailyCheckInEnabled: boolean("daily_check_in_enabled").notNull().default(true),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  metadata: jsonb("metadata"), // flexible Base44-style profile fields (christian_content, selected_categories, notification times, etc.)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
