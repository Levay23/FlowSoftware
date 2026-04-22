import { Router, type IRouter } from "express";
import { db, conversationsTable, conversationMessagesTable, contactsTable, chatbotConfigsTable, trainingDocumentsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";
import { sendWhatsAppText } from "../services/whatsappProvider";

const router: IRouter = Router();

router.get("/conversations", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const conversations = await db.select({
    id: conversationsTable.id,
    contactId: conversationsTable.contactId,
    contactName: contactsTable.name,
    contactPhone: contactsTable.phone,
    lastMessage: conversationsTable.lastMessage,
    lastMessageAt: conversationsTable.lastMessageAt,
    unreadCount: conversationsTable.unreadCount,
  })
    .from(conversationsTable)
    .innerJoin(contactsTable, eq(conversationsTable.contactId, contactsTable.id))
    .where(eq(conversationsTable.userId, userId))
    .orderBy(sql`${conversationsTable.lastMessageAt} DESC NULLS LAST`);

  res.json(conversations.map(c => ({
    ...c,
    lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
  })));
});

router.get("/conversations/:contactId/messages", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.contactId) ? req.params.contactId[0] : req.params.contactId;
  const contactId = parseInt(raw, 10);
  const limit = parseInt((req.query.limit as string) || "50", 10);

  const [conversation] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.userId, userId), eq(conversationsTable.contactId, contactId)))
    .limit(1);

  if (!conversation) {
    res.json([]);
    return;
  }

  await db.update(conversationsTable).set({ unreadCount: 0 }).where(eq(conversationsTable.id, conversation.id));

  const messages = await db.select().from(conversationMessagesTable)
    .where(eq(conversationMessagesTable.conversationId, conversation.id))
    .orderBy(conversationMessagesTable.sentAt)
    .limit(limit);

  res.json(messages);
});

router.post("/conversations/:contactId/messages", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const raw = Array.isArray(req.params.contactId) ? req.params.contactId[0] : req.params.contactId;
  const contactId = parseInt(raw, 10);
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const [contact] = await db.select().from(contactsTable)
    .where(and(eq(contactsTable.id, contactId), eq(contactsTable.userId, userId)))
    .limit(1);

  if (!contact) {
    res.status(404).json({ error: "Contact not found" });
    return;
  }

  let [conversation] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.userId, userId), eq(conversationsTable.contactId, contactId)))
    .limit(1);

  if (!conversation) {
    [conversation] = await db.insert(conversationsTable).values({
      userId,
      contactId,
      lastMessage: content,
      lastMessageAt: new Date(),
      unreadCount: 0,
    }).returning();
  } else {
    await db.update(conversationsTable).set({
      lastMessage: content,
      lastMessageAt: new Date(),
    }).where(eq(conversationsTable.id, conversation.id));
  }

  let sendError: string | null = null;

  try {
    await sendWhatsAppText(userId, contact.phone, content);
  } catch (error) {
    sendError = error instanceof Error ? error.message : "WhatsApp sending failed";
  }

  const [message] = await db.insert(conversationMessagesTable).values({
    conversationId: conversation.id,
    content: sendError ? `${content}\n\nNo enviado por WhatsApp: ${sendError}` : content,
    direction: "outbound",
    isBot: false,
  }).returning();

  const [chatbotConfig] = await db.select().from(chatbotConfigsTable)
    .where(eq(chatbotConfigsTable.userId, userId))
    .limit(1);

  if (chatbotConfig?.isActive) {
    const trainingDocs = await db.select().from(trainingDocumentsTable)
      .where(eq(trainingDocumentsTable.userId, userId));

    const context = trainingDocs.map(d => d.content).join("\n\n");
    const contentLower = content.toLowerCase();
    const hasMatch = context && trainingDocs.some(d => {
      const words = contentLower.split(/\s+/).filter(w => w.length > 3);
      return words.some(w => d.content.toLowerCase().includes(w));
    });

    const botReply = hasMatch
      ? `Basado en nuestra información: ${trainingDocs.find(d => d.content.toLowerCase().includes(contentLower.split(/\s+/).find(w => w.length > 3 && d.content.toLowerCase().includes(w)) || ""))?.content.substring(0, 150) || chatbotConfig.fallbackMessage}`
      : chatbotConfig.fallbackMessage;

    setTimeout(async () => {
      await db.insert(conversationMessagesTable).values({
        conversationId: conversation.id,
        content: botReply,
        direction: "inbound",
        isBot: true,
      });

      await db.update(conversationsTable).set({
        lastMessage: botReply,
        lastMessageAt: new Date(),
        unreadCount: 1,
      }).where(eq(conversationsTable.id, conversation.id));
    }, 1500);
  }

  res.status(201).json(message);
});

export default router;
