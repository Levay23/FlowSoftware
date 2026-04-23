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
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

router.get("/ping", (req: AuthRequest, res): void => {
  res.send(`pong at ${new Date().toISOString()}`);
});

router.get("/users", authenticateToken, requireAdmin, async (_req: AuthRequest, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(asc(usersTable.createdAt));
  res.json(users.map(serializeUser));
});

router.post("/users", authenticateToken, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as { name?: string; email?: string; password?: string; role?: string };
    
    if (!name || !email) {
      res.status(400).json({ error: "Nombre y email son obligatorios" });
      return;
    }

    const tempPassword = password || `Flow-${randomUUID().slice(0, 8)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // If moderator, force status to pending_approval
    const status = req.userRole === "moderator" ? "pending_approval" : "active";

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      role: role || "user",
      status
    }).returning();

    // Sync with Firebase Auth
    try {
      await createFirebaseUser(email, tempPassword, name);
    } catch (fbError) {
      console.warn("Firebase Sync Warning:", fbError);
    }

    res.status(201).json({
      user: serializeUser(user),
      temporaryPassword: tempPassword
    });
  } catch (error: any) {
    console.error("Admin Create User Error:", error);
    if (error.code === "23505") {
      res.status(400).json({ error: "El correo electrónico ya está registrado" });
    } else {
      res.status(500).json({ error: "Error al crear la cuenta" });
    }
  }
});

router.route("/users/:id")
  .all(authenticateToken, requireAdmin)
  .put(async (req: AuthRequest, res): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const { name, email, role, status, password } = req.body;

      const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      if (!existing) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      // Moderator restrictions
      if (req.userRole === "moderator") {
        // Moderator can only update their own name/email? 
        // Actually, let's allow updating name/email of others but NOT role/status
        if (role || status) {
          res.status(403).json({ error: "Los moderadores no tienen permiso para cambiar roles o estados" });
          return;
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const [updated] = await db.update(usersTable)
        .set(updateData)
        .where(eq(usersTable.id, id))
        .returning();

      res.json(serializeUser(updated));
    } catch (error) {
      console.error("Admin Update User Error:", error);
      res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  })
  .delete(async (req: AuthRequest, res): Promise<void> => {
    if (req.userRole === "moderator") {
      res.status(403).json({ error: "Los moderadores no pueden eliminar cuentas" });
      return;
    }

    const targetId = req.params.id;
    try {
      const id = parseInt(targetId as string);
      if (isNaN(id)) {
        res.status(400).json({ error: "ID de usuario inválido" });
        return;
      }

      const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
      
      if (!existing) {
        res.status(404).json({ error: "Usuario no encontrado" });
        return;
      }

      if (existing.email === "admin@flowsoftware.app") {
        res.status(403).json({ error: "No se puede eliminar el administrador principal" });
        return;
      }

      await db.delete(usersTable).where(eq(usersTable.id, id));
      res.json({ success: true, message: "Usuario eliminado correctamente" });
    } catch (error) {
      console.error("Admin Delete User Error:", error);
      res.status(500).json({ error: "Error interno al eliminar el usuario" });
    }
  });

export default router;