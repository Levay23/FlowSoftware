import type { WASocket } from "@whiskeysockets/baileys";
import { and, eq } from "drizzle-orm";
import {
  chatbotConfigsTable,
  contactsTable,
  conversationMessagesTable,
  conversationsTable,
  db,
  trainingDocumentsTable,
} from "@workspace/db";
import { generateGroqReply } from "./groqClient";

function jidToPhone(jid: string) {
  return jid.split("@")[0]?.split(":")[0]?.replace(/[^\d]/g, "") || jid;
}

async function getOrCreateContact(userId: number, phone: string, name: string) {
  const [existing] = await db.select().from(contactsTable)
    .where(and(eq(contactsTable.userId, userId), eq(contactsTable.phone, phone)))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [contact] = await db.insert(contactsTable).values({
    userId,
    name,
    phone,
    tags: ["whatsapp"],
    notes: "Creado automaticamente desde mensaje entrante de WhatsApp",
  }).returning();

  return contact;
}

async function getOrCreateConversation(userId: number, contactId: number, lastMessage: string) {
  const [existing] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.userId, userId), eq(conversationsTable.contactId, contactId)))
    .limit(1);

  if (existing) {
    await db.update(conversationsTable).set({
      lastMessage,
      lastMessageAt: new Date(),
      unreadCount: existing.unreadCount + 1,
    }).where(eq(conversationsTable.id, existing.id));

    return existing;
  }

  const [conversation] = await db.insert(conversationsTable).values({
    userId,
    contactId,
    lastMessage,
    lastMessageAt: new Date(),
    unreadCount: 1,
  }).returning();

  return conversation;
}

export function extractMessageText(message: Record<string, unknown> | undefined): string | null {
  if (!message) {
    return null;
  }

  const conversation = message.conversation;
  if (typeof conversation === "string") {
    return conversation;
  }

  const extended = message.extendedTextMessage as { text?: string } | undefined;
  if (typeof extended?.text === "string") {
    return extended.text;
  }

  const image = message.imageMessage as { caption?: string } | undefined;
  if (typeof image?.caption === "string") {
    return image.caption;
  }

  const video = message.videoMessage as { caption?: string } | undefined;
  if (typeof video?.caption === "string") {
    return video.caption;
  }

  return null;
}

export async function handleIncomingWhatsAppMessage(params: {
  userId: number;
  remoteJid: string;
  pushName?: string;
  text: string;
  socket: WASocket;
}) {
  if (params.remoteJid.includes("@g.us") || params.remoteJid === "status@broadcast") {
    return;
  }

  const phone = jidToPhone(params.remoteJid);
  const contact = await getOrCreateContact(params.userId, phone, params.pushName || phone);
  const conversation = await getOrCreateConversation(params.userId, contact.id, params.text);

  await db.insert(conversationMessagesTable).values({
    conversationId: conversation.id,
    content: params.text,
    direction: "inbound",
    isBot: false,
  });

  const [config] = await db.select().from(chatbotConfigsTable)
    .where(eq(chatbotConfigsTable.userId, params.userId))
    .limit(1);

  if (!config?.isActive) {
    return;
  }

  const trainingDocuments = await db.select().from(trainingDocumentsTable)
    .where(eq(trainingDocumentsTable.userId, params.userId));

  let reply: string;

  try {
    reply = await generateGroqReply({
      config,
      trainingDocuments,
      customerMessage: params.text,
      customerName: contact.name,
    });
  } catch {
    reply = config.fallbackMessage;
  }

  await params.socket.sendMessage(params.remoteJid, { text: reply });

  await db.insert(conversationMessagesTable).values({
    conversationId: conversation.id,
    content: reply,
    direction: "outbound",
    isBot: true,
  });

  await db.update(conversationsTable).set({
    lastMessage: reply,
    lastMessageAt: new Date(),
    unreadCount: 0,
  }).where(eq(conversationsTable.id, conversation.id));
}