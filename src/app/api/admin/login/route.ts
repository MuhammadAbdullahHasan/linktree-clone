import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { apiAdmin, createApiToken, isAdminEmail, revokeApiToken } from "@/lib/admin";
import { clearFailedAttempts, getDummyHash, isRateLimited, recordFailedAttempt, verifyPassword } from "@/lib/auth";
import { body, clientIp, error, json, unauthorized } from "../_http";

/** Swaps the admin's email and password for a long-lived API token. Same rate limits as the login page. */
export async function POST(request: Request) {
  const input = await body(request);
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  const label = typeof input?.label === "string" ? input.label : null;
  if (!email || !password || password.length > 200) return error("Send email and password", 400);

  const keys = [`email:${email}`, `ip:${clientIp(request)}`];
  if (await isRateLimited(keys)) return error("Too many attempts. Wait 15 minutes and try again.", 429);

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash, managedBy: users.managedBy })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
  if (!user || !valid) {
    await recordFailedAttempt(keys);
    return error("Email or password is incorrect", 401);
  }
  await clearFailedAttempts(keys[0]);
  if (user.managedBy || !isAdminEmail(email)) return error("This account can't manage profiles", 403);

  return json({ token: await createApiToken(user.id, label) }, 201);
}

/** Revokes the token used to make this request. */
export async function DELETE(request: Request) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  await revokeApiToken(admin.tokenId);
  return new Response(null, { status: 204 });
}
