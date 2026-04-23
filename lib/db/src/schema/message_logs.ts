import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const messageLogsTable = pgTable("message_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageLogSchema = createInsertSchema(messageLogsTable).omit({ id: true, createdAt: true });
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;
export type MessageLog = typeof messageLogsTable.$inferSelect;
