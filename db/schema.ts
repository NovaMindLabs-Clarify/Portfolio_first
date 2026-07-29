import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const repairTypeEnum = pgEnum("repair_type", [
  "cosmetic",
  "capital",
  "designer",
]);
export const urgencyEnum = pgEnum("urgency", [
  "normal",
  "accelerated",
  "urgent",
]);
export const layoutChangeEnum = pgEnum("layout_change", [
  "none",
  "partitions",
  "wetZones",
]);
export const materialsClassEnum = pgEnum("materials_class", [
  "economy",
  "standard",
  "premium",
]);
export const crmSyncStatusEnum = pgEnum("crm_sync_status", [
  "pending",
  "synced",
  "failed",
]);

export const estimateSubmissions = pgTable("estimate_submissions", {
  id: serial("id").primaryKey(),

  // Расчёт (см. lib/schemas/estimate.ts)
  area: integer("area").notNull(),
  repairType: repairTypeEnum("repair_type").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  urgency: urgencyEnum("urgency").notNull(),
  layoutChange: layoutChangeEnum("layout_change").notNull(),
  materialsClass: materialsClassEnum("materials_class").notNull(),
  estimateLow: integer("estimate_low").notNull(),
  estimateHigh: integer("estimate_high").notNull(),

  // Контакт
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),

  // amoCRM — фолбэк на "failed" + attempts, ретрай запускается отдельным
  // джобом опрашивающим строки с failed/attempts < лимита (не входит в этот шаг).
  crmSyncStatus: crmSyncStatusEnum("crm_sync_status")
    .notNull()
    .default("pending"),
  crmSyncAttempts: integer("crm_sync_attempts").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EstimateSubmission = typeof estimateSubmissions.$inferSelect;
export type NewEstimateSubmission = typeof estimateSubmissions.$inferInsert;

// ---------------------------------------------------------------------------
// Better Auth (magic-link) — схема ровно по core-таблицам установленной версии
// (@better-auth/core/src/db/get-tables.ts), руками, без CLI-генератора.
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Личный кабинет (Шаг 8): объект, этапы, фотоотчёты, смета и её история,
// сообщения с прорабом.
// ---------------------------------------------------------------------------

export const stageStatusEnum = pgEnum("stage_status", [
  "planned",
  "in_progress",
  "done",
]);

export const messageAuthorRoleEnum = pgEnum("message_author_role", [
  "client",
  "foreman",
]);

export const objects = pgTable("objects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  address: text("address"),
  area: integer("area").notNull(),
  // Демо-объект открыт всем без авторизации на /demo, в режиме read-only.
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const stages = pgTable("stages", {
  id: serial("id").primaryKey(),
  objectId: integer("object_id")
    .notNull()
    .references(() => objects.id, { onDelete: "cascade" }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: stageStatusEnum("status").notNull().default("planned"),
  plannedDays: integer("planned_days").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  objectId: integer("object_id")
    .notNull()
    .references(() => objects.id, { onDelete: "cascade" }),
  stageId: integer("stage_id").references(() => stages.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  caption: text("caption"),
  takenAt: timestamp("taken_at", { withTimezone: true }).notNull(),
});

export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  objectId: integer("object_id")
    .notNull()
    .references(() => objects.id, { onDelete: "cascade" })
    .unique(),
  amount: integer("amount").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const estimateChanges = pgTable("estimate_changes", {
  id: serial("id").primaryKey(),
  estimateId: integer("estimate_id")
    .notNull()
    .references(() => estimates.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  approvedBy: text("approved_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  objectId: integer("object_id")
    .notNull()
    .references(() => objects.id, { onDelete: "cascade" }),
  authorRole: messageAuthorRoleEnum("author_role").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const checklistItems = pgTable(
  "checklist_items",
  {
    id: serial("id").primaryKey(),
    objectId: integer("object_id")
      .notNull()
      .references(() => objects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    checked: boolean("checked").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [unique().on(table.objectId, table.sortOrder)],
);

export type ObjectRow = typeof objects.$inferSelect;
export type Stage = typeof stages.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Estimate = typeof estimates.$inferSelect;
export type EstimateChange = typeof estimateChanges.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
