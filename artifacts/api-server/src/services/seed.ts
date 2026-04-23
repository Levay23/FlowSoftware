import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env["ADMIN_EMAIL"] || "admin@flowsoftware.app";
  const adminPassword = process.env["ADMIN_PASSWORD"] || "Admin2024!";
  const adminName = process.env["ADMIN_NAME"] || "Administrador";

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, adminEmail))
    .limit(1);

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  if (existing) {
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.email, adminEmail));
    logger.info({ email: adminEmail }, "Default admin user password updated");
    return;
  }

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
