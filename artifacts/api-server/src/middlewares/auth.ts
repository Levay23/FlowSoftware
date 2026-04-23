import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { and, eq, lte } from "drizzle-orm";
import { cleanupWhatsAppUserSession } from "../services/whatsappProvider";

const JWT_SECRET = process.env.SESSION_SECRET || "whatsapp-saas-secret-key";
const DEMO_SESSION_MS = 30 * 60 * 1000;

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);

    if (!user) {
      res.status(403).json({ error: "Invalid or expired token" });
      return;
    }

    if (user.role === "demo" && Date.now() - user.createdAt.getTime() >= DEMO_SESSION_MS) {
      await cleanupWhatsAppUserSession(user.id);
      await db.delete(usersTable).where(eq(usersTable.id, user.id));
      res.status(403).json({ error: "Demo session expired" });
      return;
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== "admin" && req.userRole !== "moderator") {
    res.status(403).json({ error: "Se requiere acceso de administrador o moderador" });
    return;
  }

  next();
}

export function createToken(userId: number, role: string, expiresIn = "7d"): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: expiresIn as any });
}

export async function cleanupExpiredDemoUsers(): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_SESSION_MS);
  const expired = await db.select({ id: usersTable.id }).from(usersTable)
    .where(and(eq(usersTable.role, "demo"), lte(usersTable.createdAt, cutoff)))
    .limit(100);

  for (const user of expired) {
    await cleanupWhatsAppUserSession(user.id);
  }

  if (expired.length === 0) {
    return 0;
  }

  const deleted = await db.delete(usersTable)
    .where(and(eq(usersTable.role, "demo"), lte(usersTable.createdAt, cutoff)))
    .returning({ id: usersTable.id });

  return deleted.length;
}

export function startDemoCleanupJob(): NodeJS.Timeout {
  return setInterval(() => {
    cleanupExpiredDemoUsers().catch(() => {});
  }, 60 * 1000);
}

export { DEMO_SESSION_MS };
