import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { asc, eq } from "drizzle-orm";
import { authenticateToken, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { createFirebaseUser } from "../services/firebase";

const router: IRouter = Router();

function serializeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.get("/admin/users", authenticateToken, requireAdmin, async (_req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(asc(usersTable.createdAt));
  res.json(users.map(serializeUser));
});

router.post("/admin/users", authenticateToken, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { email, name, password, role = "user" } = req.body as { email?: string; name?: string; password?: string; role?: string };

  if (!email || !name) {
    res.status(400).json({ error: "Email and name are required" });
    return;
  }

  if (!["user", "admin"].includes(role)) {
    res.status(400).json({ error: "Role must be user or admin" });
    return;
  }

  if (password && password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const temporaryPassword = password || `Cliente-${randomUUID().slice(0, 8)}!`;
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    role,
  }).returning();

  // Add to Firebase Auth
  await createFirebaseUser(email, temporaryPassword, name);

  res.status(201).json({
    user: serializeUser(user),
    temporaryPassword,
  });
});

export default router;