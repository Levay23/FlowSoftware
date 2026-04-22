import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticateToken, cleanupExpiredDemoUsers, createToken, DEMO_SESSION_MS, type AuthRequest } from "../middlewares/auth";
import { cleanupWhatsAppUserSession, getWhatsAppProviderStatus } from "../services/whatsappProvider";

const router: IRouter = Router();

function serializeUser(user: typeof usersTable.$inferSelect) {
  const isDemo = user.role === "demo";
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    isDemo,
    demoExpiresAt: isDemo ? new Date(user.createdAt.getTime() + DEMO_SESSION_MS).toISOString() : null,
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  res.status(403).json({ error: "Real accounts are created by the administrator after subscription purchase" });
});

router.post("/auth/demo", async (_req, res): Promise<void> => {
  await cleanupExpiredDemoUsers();

  const email = `demo-${randomUUID()}@whatsbot.demo`;
  const passwordHash = await bcrypt.hash(randomUUID(), 12);

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name: "Demo temporal",
    role: "demo",
  }).returning();

  setTimeout(async () => {
    try {
      await cleanupWhatsAppUserSession(user.id);
      await db.delete(usersTable).where(eq(usersTable.id, user.id));
    } catch {
    }
  }, DEMO_SESSION_MS);

  const token = createToken(user.id, user.role, "30m");

  res.status(201).json({
    token,
    user: serializeUser(user),
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = createToken(user.id, user.role);

  if (user.role !== "demo") {
    getWhatsAppProviderStatus(user.id, 1000).catch(() => undefined);
  }

  res.json({
    token,
    user: serializeUser(user),
  });
});

router.get("/auth/me", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(serializeUser(user));
});

router.post("/auth/change-password", authenticateToken, async (req: AuthRequest, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current and new password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, req.userId!));

  res.json({ success: true, message: "Password changed successfully" });
});

export default router;
