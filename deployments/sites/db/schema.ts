import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const demoUsers = sqliteTable("demo_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["Administrator", "Viewer"] }).notNull(),
});

export const taskRecords = sqliteTable("task_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  record: text("record").notNull(),
  version: integer("version").notNull().default(0),
});

export const appMetadata = sqliteTable("app_metadata", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
