import { pgTable, serial, timestamp, boolean, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { contactsTable } from "./contacts";

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  contactId: integer("contact_id").notNull().references(() => contactsTable.id, { onDelete: "cascade" }),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  unreadCount: integer("unread_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const conversationMessagesTable = pgTable("conversation_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  direction: text("direction").notNull().default("outbound"),
  isBot: boolean("is_bot").notNull().default(false),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationMessageSchema = createInsertSchema(conversationMessagesTable).omit({ id: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertConversationMessage = z.infer<typeof insertConversationMessageSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
export type ConversationMessage = typeof conversationMessagesTable.$inferSelect;
