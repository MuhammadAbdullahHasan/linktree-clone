import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Locally this is a file in ./data; on Vercel it points at a Turso database.
const client = createClient({
  url: process.env.DATABASE_URL ?? "file:data/linkfolio.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export * from "./schema";
