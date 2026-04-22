import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const chatbotConfigsTable = sqliteTable("chatbot_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  systemPrompt: text("system_prompt").notNull().default("Eres un asistente de ventas amigable y profesional. Responde preguntas sobre nuestros productos y servicios."),
  welcomeMessage: text("welcome_message").notNull().default("¡Hola! Bienvenido. ¿En qué puedo ayudarte hoy?"),
  fallbackMessage: text("fallback_message").notNull().default("Lo siento, no entendí tu mensaje. Por favor contacta a nuestro equipo."),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChatbotConfigSchema = createInsertSchema(chatbotConfigsTable).omit({ id: true });
export type InsertChatbotConfig = z.infer<typeof insertChatbotConfigSchema>;
export type ChatbotConfig = typeof chatbotConfigsTable.$inferSelect;
