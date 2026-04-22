import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pino from "pino";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";
import { db, whatsappSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { extractMessageText, handleIncomingWhatsAppMessage } from "./whatsappAutomation";

type SessionStatus = "disconnected" | "connecting" | "connected";

export type WhatsAppContact = {
  id: string;
  name: string;
  phone: string;
};

type WhatsAppSession = {
  socket: WASocket;
  status: SessionStatus;
  qrCode: string | null;
  phone: string | null;
  connectedAt: Date | null;
  waiters: Array<() => void>;
  stopped: boolean;
  contacts: Map<string, WhatsAppContact>;
};

const sessions = new Map<number, WhatsAppSession>();
const logger = pino({ level: "silent" });
const authRoot = path.resolve(process.cwd(), ".whatsapp-auth");

function notify(session: WhatsAppSession) {
  const waiters = session.waiters.splice(0);
  waiters.forEach((resolve) => resolve());
}

function authDir(userId: number) {
  return path.join(authRoot, `user-${userId}`);
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, "");

  if (!cleaned) {
    throw new Error("Contact phone number is invalid");
  }

  return cleaned;
}

function phoneToJid(phone: string): string {
  if (phone.includes("@s.whatsapp.net") || phone.includes("@g.us")) {
    return phone;
  }

  return `${normalizePhone(phone)}@s.whatsapp.net`;
}

function extractPhone(socket: WASocket): string | null {
  const id = socket.user?.id;

  if (!id) {
    return null;
  }

  return id.split(":")[0]?.replace(/[^\d]/g, "") || null;
}

async function persistSession(userId: number, status: SessionStatus, phone: string | null, connectedAt: Date | null) {
  const [existing] = await db.select().from(whatsappSessionsTable).where(eq(whatsappSessionsTable.userId, userId)).limit(1);

  if (!existing) {
    await db.insert(whatsappSessionsTable).values({
      userId,
      status,
      phone,
      connectedAt,
    });
    return;
  }

  await db.update(whatsappSessionsTable).set({
    status,
    phone,
    connectedAt,
  }).where(eq(whatsappSessionsTable.userId, userId));
}

async function getPersistedSession(userId: number) {
  const [session] = await db.select().from(whatsappSessionsTable).where(eq(whatsappSessionsTable.userId, userId)).limit(1);
  return session ?? null;
}

function serializeProviderStatus(session: WhatsAppSession, hasPreviousSession: boolean) {
  return {
    provider: "whatsapp-web",
    configured: true,
    status: session.status,
    phone: session.phone,
    connectedAt: session.connectedAt,
    qrCode: session.qrCode,
    hasPreviousSession,
  };
}

async function killSession(userId: number): Promise<void> {
  const existing = sessions.get(userId);
  if (existing) {
    existing.stopped = true;
    try { existing.socket.end(undefined); } catch { /* ignore */ }
    sessions.delete(userId);
  }
  await rm(authDir(userId), { recursive: true, force: true });
}

async function startSession(userId: number, force = false): Promise<WhatsAppSession> {
  const existing = sessions.get(userId);

  if (force) {
    await killSession(userId);
  } else if (existing && existing.status !== "disconnected") {
    return existing;
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir(userId));
  const { version } = await fetchLatestBaileysVersion();
  const socket = makeWASocket({
    auth: state,
    browser: ["WhatsBot SaaS", "Chrome", "1.0"],
    logger,
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false,
    version,
  });

  const session: WhatsAppSession = {
    socket,
    status: "connecting",
    qrCode: null,
    phone: null,
    connectedAt: null,
    waiters: [],
    stopped: false,
    contacts: new Map(),
  };

  sessions.set(userId, session);
  await persistSession(userId, "connecting", null, null);

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("contacts.set", ({ contacts }) => {
    for (const c of contacts) {
      if (!c.id || c.id.endsWith("@g.us") || c.id.endsWith("@broadcast")) continue;
      const phone = c.id.split("@")[0] ?? "";
      const name = c.name ?? c.notify ?? c.verifiedName ?? phone;
      session.contacts.set(c.id, { id: c.id, name, phone });
    }
  });

  socket.ev.on("contacts.upsert", (contacts) => {
    for (const c of contacts) {
      if (!c.id || c.id.endsWith("@g.us") || c.id.endsWith("@broadcast")) continue;
      const phone = c.id.split("@")[0] ?? "";
      const name = c.name ?? c.notify ?? c.verifiedName ?? phone;
      session.contacts.set(c.id, { id: c.id, name, phone });
    }
  });

  socket.ev.on("contacts.update", (updates) => {
    for (const upd of updates) {
      if (!upd.id || upd.id.endsWith("@g.us")) continue;
      const existing = session.contacts.get(upd.id);
      if (existing) {
        const phone = upd.id.split("@")[0] ?? "";
        const name = (upd as { name?: string; notify?: string; verifiedName?: string }).name
          ?? (upd as { name?: string; notify?: string; verifiedName?: string }).notify
          ?? (upd as { name?: string; notify?: string; verifiedName?: string }).verifiedName
          ?? existing.name;
        session.contacts.set(upd.id, { id: upd.id, name, phone });
      }
    }
  });

  socket.ev.on("connection.update", async (update) => {
    if (update.qr) {
      session.status = "connecting";
      session.qrCode = await QRCode.toDataURL(update.qr, { margin: 1, width: 256 });
      await persistSession(userId, "connecting", null, null);
      notify(session);
    }

    if (update.connection === "open") {
      session.status = "connected";
      session.qrCode = null;
      session.phone = extractPhone(socket);
      session.connectedAt = new Date();
      await persistSession(userId, "connected", session.phone, session.connectedAt);
      notify(session);
    }

    if (update.connection === "close") {
      if (session.stopped) {
        notify(session);
        return;
      }

      const statusCode = (update.lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;

      session.status = "disconnected";
      session.qrCode = null;

      if (loggedOut) {
        session.phone = null;
        session.connectedAt = null;
        sessions.delete(userId);
        await rm(authDir(userId), { recursive: true, force: true });
        await persistSession(userId, "disconnected", null, null);
        notify(session);
        return;
      }

      await persistSession(userId, "disconnected", session.phone, null);
      notify(session);

      if (existsSync(authDir(userId))) {
        setTimeout(() => {
          sessions.delete(userId);
          startSession(userId).catch(() => undefined);
        }, 3000);
      }
    }
  });

  socket.ev.on("messages.upsert", async ({ messages }) => {
    for (const item of messages) {
      if (!item.message || item.key.fromMe || !item.key.remoteJid) {
        continue;
      }

      const text = extractMessageText(item.message);

      if (!text?.trim()) {
        continue;
      }

      handleIncomingWhatsAppMessage({
        userId,
        remoteJid: item.key.remoteJid,
        pushName: item.pushName,
        text: text.trim(),
        socket,
      }).catch(() => undefined);
    }
  });

  return session;
}

async function waitForConnectResult(session: WhatsAppSession, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (session.status === "connected" || session.qrCode) {
      return;
    }

    await new Promise<void>((resolve) => {
      session.waiters.push(resolve);
      setTimeout(resolve, 1000);
    });
  }
}

export async function connectWhatsApp(userId: number, force = false) {
  const session = await startSession(userId, force);
  await waitForConnectResult(session);

  return {
    qrCode: session.qrCode,
    status: session.status,
    provider: "whatsapp-web",
    phone: session.phone,
    connectedAt: session.connectedAt,
    hasPreviousSession: !force,
  };
}

export async function forceReconnectWhatsApp(userId: number) {
  await persistSession(userId, "disconnected", null, null);
  return connectWhatsApp(userId, true);
}

export async function getWhatsAppProviderStatus(userId?: number, waitMs = 5000) {
  if (userId) {
    const persisted = await getPersistedSession(userId);
    const hasLocalAuth = existsSync(authDir(userId));
    const hasPreviousSession = Boolean(persisted || hasLocalAuth);
    const session = sessions.get(userId);

    if (session && !session.stopped) {
      return serializeProviderStatus(session, hasPreviousSession);
    }

    if (hasLocalAuth) {
      const restored = await startSession(userId);
      await waitForConnectResult(restored, waitMs);
      return serializeProviderStatus(restored, true);
    }

    if (persisted && persisted.status !== "disconnected") {
      await persistSession(userId, "disconnected", null, null);
    }

    return {
      provider: "whatsapp-web",
      configured: true,
      status: "disconnected" as SessionStatus,
      phone: null,
      connectedAt: null,
      qrCode: null,
      hasPreviousSession,
    };
  }

  return {
    provider: "whatsapp-web",
    configured: true,
    status: "disconnected" as SessionStatus,
    phone: null,
    connectedAt: null,
    qrCode: null,
    hasPreviousSession: false,
  };
}

export function isWhatsAppProviderConfigured(): boolean {
  return true;
}

export async function disconnectWhatsApp(userId: number) {
  const session = sessions.get(userId);

  if (session) {
    session.stopped = true;
    try {
      await session.socket.logout();
    } catch {
      session.socket.end(undefined);
    }
  }

  sessions.delete(userId);
  await rm(authDir(userId), { recursive: true, force: true });
  await db.delete(whatsappSessionsTable).where(eq(whatsappSessionsTable.userId, userId));
}

export async function cleanupWhatsAppUserSession(userId: number) {
  const session = sessions.get(userId);

  if (session) {
    session.stopped = true;
    try {
      session.socket.end(undefined);
    } catch {
    }
  }

  sessions.delete(userId);
  await rm(authDir(userId), { recursive: true, force: true });
  await db.delete(whatsappSessionsTable).where(eq(whatsappSessionsTable.userId, userId));
}

export function getWhatsAppContacts(userId: number): WhatsAppContact[] {
  const session = sessions.get(userId);
  if (!session || session.status !== "connected") return [];
  return Array.from(session.contacts.values())
    .filter(c => c.phone && c.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function sendWhatsAppText(userId: number, to: string, body: string) {
  const session = sessions.get(userId) ?? await startSession(userId);

  if (session.status !== "connected") {
    throw new Error("WhatsApp is not connected. Scan the QR code before sending messages.");
  }

  return session.socket.sendMessage(phoneToJid(to), { text: body });
}