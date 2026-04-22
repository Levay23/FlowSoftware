import { Router, type IRouter } from "express";
import { db, chatbotConfigsTable, trainingDocumentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";
import { generateGroqReply } from "../services/groqClient";

const router: IRouter = Router();

router.get("/chatbot/config", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  let [config] = await db.select().from(chatbotConfigsTable).where(eq(chatbotConfigsTable.userId, userId)).limit(1);

  if (!config) {
    [config] = await db.insert(chatbotConfigsTable).values({
      userId,
      isActive: false,
      systemPrompt: "Eres un asistente de ventas amigable y profesional. Responde preguntas sobre nuestros productos y servicios.",
      welcomeMessage: "¡Hola! Bienvenido. ¿En qué puedo ayudarte hoy?",
      fallbackMessage: "Lo siento, no entendí tu mensaje. Por favor contacta a nuestro equipo.",
    }).returning();
  }

  res.json({
    id: config.id,
    isActive: config.isActive,
    systemPrompt: config.systemPrompt,
    welcomeMessage: config.welcomeMessage,
    fallbackMessage: config.fallbackMessage,
    updatedAt: config.updatedAt,
  });
});

router.put("/chatbot/config", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { isActive, systemPrompt, welcomeMessage, fallbackMessage } = req.body;

  const updateData: Record<string, unknown> = {};
  if (isActive !== undefined) updateData.isActive = isActive;
  if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
  if (welcomeMessage !== undefined) updateData.welcomeMessage = welcomeMessage;
  if (fallbackMessage !== undefined) updateData.fallbackMessage = fallbackMessage;

  let [existing] = await db.select().from(chatbotConfigsTable).where(eq(chatbotConfigsTable.userId, userId)).limit(1);

  if (!existing) {
    [existing] = await db.insert(chatbotConfigsTable).values({
      userId,
      ...updateData,
    } as typeof chatbotConfigsTable.$inferInsert).returning();
  } else {
    [existing] = await db.update(chatbotConfigsTable)
      .set(updateData)
      .where(eq(chatbotConfigsTable.userId, userId))
      .returning();
  }

  res.json({
    id: existing.id,
    isActive: existing.isActive,
    systemPrompt: existing.systemPrompt,
    welcomeMessage: existing.welcomeMessage,
    fallbackMessage: existing.fallbackMessage,
    updatedAt: existing.updatedAt,
  });
});

router.post("/chatbot/test-reply", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  let [config] = await db.select().from(chatbotConfigsTable).where(eq(chatbotConfigsTable.userId, userId)).limit(1);

  if (!config) {
    [config] = await db.insert(chatbotConfigsTable).values({
      userId,
    }).returning();
  }

  const trainingDocuments = await db.select().from(trainingDocumentsTable)
    .where(eq(trainingDocumentsTable.userId, userId));

  try {
    const reply = await generateGroqReply({
      config,
      trainingDocuments,
      customerMessage: message.trim(),
      customerName: "Cliente de prueba",
    });

    res.json({ reply });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : "Could not generate reply" });
  }
});

export default router;
