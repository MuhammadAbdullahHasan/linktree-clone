/**
 * Locally this is a file in ./data. When deployed it points at Turso, using either our own
 * DATABASE_* variables or the TURSO_* ones that Vercel's Turso integration sets.
 */
export function databaseConfig() {
  return {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:data/linkfolio.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  };
}
