import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  authUserId: text("auth_user_id").unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const userWorkspaces = pgTable("user_workspaces", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  savedServices: text("saved_services").notNull().default("[]"),
  comparisonSelections: text("comparison_selections").notNull().default("[]"),
  researchedServices: text("researched_services").notNull().default("[]"),
  readAlerts: text("read_alerts").notNull().default("[]"),
  mutedServices: text("muted_services").notNull().default("[]"),
  theme: text("theme", { enum: ["light", "dark"] }).notNull().default("light"),
  savedLayout: text("saved_layout", { enum: ["grid", "list"] }).notNull().default("grid"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const userSavedServices = pgTable("user_saved_services", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull(),
  serviceSnapshot: text("service_snapshot").notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.userId, table.serviceId] })]);
