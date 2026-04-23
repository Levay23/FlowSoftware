import { pgTable, serial, timestamp, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const trainingDocumentsTable = pgTable("training_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  content: text("content").notNull(),
  fileType: text("file_type").notNull().default("txt"),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTrainingDocumentSchema = createInsertSchema(trainingDocumentsTable).omit({ id: true, createdAt: true });
export type InsertTrainingDocument = z.infer<typeof insertTrainingDocumentSchema>;
export type TrainingDocument = typeof trainingDocumentsTable.$inferSelect;
