import { defineConfig } from "drizzle-kit";
import { databaseConfig } from "./src/db/config";

const { url, authToken } = databaseConfig();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: url.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: { url, authToken },
});
