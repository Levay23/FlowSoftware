import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const client = createClient({
  url: process.env.DATABASE_URL.startsWith('file:') 
    ? process.env.DATABASE_URL 
    : `file:${process.env.DATABASE_URL}`,
});

export const db = drizzle(client, { schema });

export * from "./schema";
