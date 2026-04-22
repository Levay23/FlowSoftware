import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env["ADMIN_EMAIL"] || "admin@whatsbot.app";
  const adminPassword = process.env["ADMIN_PASSWORD"] || "Admin2024!";
  const adminName = process.env["ADMIN_NAME"] || "Administrador";

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .limit(1);

  if (existing) {
    logger.info("Admin user already exists, skipping seed");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db.insert(usersTable).values({
    email: adminEmail,
    passwordHash,
    name: adminName,
    role: "admin",
  });

  logger.info(
    { email: adminEmail },
    "Admin user created. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars to customize credentials.",
  );
}
