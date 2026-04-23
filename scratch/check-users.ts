import { db, usersTable } from "./lib/db/src/index.ts";
import { asc } from "drizzle-orm";

async function checkUsers() {
  const users = await db.select().from(usersTable).orderBy(asc(usersTable.createdAt));
  console.log("Current Users:", JSON.stringify(users, null, 2));
}

checkUsers().catch(console.error);
