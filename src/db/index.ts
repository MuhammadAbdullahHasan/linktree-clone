import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { databaseConfig } from "./config";
import * as schema from "./schema";

const client = createClient(databaseConfig());

export const db = drizzle(client, { schema });
export * from "./schema";
