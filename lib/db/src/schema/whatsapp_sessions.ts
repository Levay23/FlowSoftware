import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const whatsappSessionsTable = pgTable("whatsapp_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  status: text("status").notNull().default("disconnected"),
  phone: text("phone"),
  connectedAt: timestamp("connected_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWhatsappSessionSchema = createInsertSchema(whatsappSessionsTable).omit({ id: true });
export type InsertWhatsappSession = z.infer<typeof insertWhatsappSessionSchema>;
export type WhatsappSession = typeof whatsappSessionsTable.$inferSelect;
