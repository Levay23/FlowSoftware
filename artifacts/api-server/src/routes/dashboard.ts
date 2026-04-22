import { Router, type IRouter } from "express";
import { db, contactsTable, messageLogsTable, chatbotConfigsTable, whatsappSessionsTable, conversationsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const [contactCount] = await db.select({ count: count() }).from(contactsTable).where(eq(contactsTable.userId, userId));
  const [sentCount] = await db.select({ count: count() }).from(messageLogsTable)
    .where(eq(messageLogsTable.userId, userId));
  const [failedCount] = await db.select({ count: count() }).from(messageLogsTable)
    .where(sql`${messageLogsTable.userId} = ${userId} AND ${messageLogsTable.status} = 'failed'`);
  const [conversationCount] = await db.select({ count: count() }).from(conversationsTable)
    .where(eq(conversationsTable.userId, userId));

  const [whatsappSession] = await db.select().from(whatsappSessionsTable).where(eq(whatsappSessionsTable.userId, userId)).limit(1);
  const [chatbotConfig] = await db.select().from(chatbotConfigsTable).where(eq(chatbotConfigsTable.userId, userId)).limit(1);

  const recentLogs = await db.select().from(messageLogsTable)
    .where(eq(messageLogsTable.userId, userId))
    .orderBy(sql`${messageLogsTable.createdAt} DESC`)
    .limit(5);

  const recentActivity = recentLogs.map((log, idx) => ({
    id: idx + 1,
    type: log.status === "sent" ? "message_sent" : log.status === "failed" ? "message_failed" : "message_pending",
    description: `Mensaje ${log.status === "sent" ? "enviado" : log.status === "failed" ? "fallido" : "pendiente"} a ${log.contactName}`,
    timestamp: log.createdAt,
  }));

  res.json({
    whatsappStatus: whatsappSession?.status ?? "disconnected",
    totalContacts: contactCount.count,
    messagesSent: sentCount.count,
    messagesFailed: failedCount.count,
    botStatus: chatbotConfig?.isActive ? "active" : "inactive",
    totalConversations: conversationCount.count,
    recentActivity,
  });
});

export default router;
