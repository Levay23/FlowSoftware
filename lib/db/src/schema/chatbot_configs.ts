import { pgTable, serial, timestamp, boolean, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const chatbotConfigsTable = pgTable("chatbot_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  isActive: boolean("is_active").notNull().default(false),
  systemPrompt: text("system_prompt").notNull().default("Eres un asistente de ventas amigable y profesional. Responde preguntas sobre nuestros productos y servicios."),
  welcomeMessage: text("welcome_message").notNull().default("¡Hola! Bienvenido. ¿En qué puedo ayudarte hoy?"),
  fallbackMessage: text("fallback_message").notNull().default("Lo siento, no entendí tu mensaje. Por favor contacta a nuestro equipo."),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertChatbotConfigSchema = createInsertSchema(chatbotConfigsTable).omit({ id: true });
export type InsertChatbotConfig = z.infer<typeof insertChatbotConfigSchema>;
export type ChatbotConfig = typeof chatbotConfigsTable.$inferSelect;
