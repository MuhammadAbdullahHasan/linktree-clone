import { apiAdmin, ownProfile } from "@/lib/admin";
import { error, json, publicUrl, unauthorized } from "../_http";

/** The admin's own profile. Editing it happens in the dashboard with a normal sign-in, not a /session link. */
export async function GET(request: Request) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  const p = await ownProfile(admin.adminId);
  if (!p) return error("No profile yet", 404);
  return json({
    ...p,
    avatarUrl: p.avatarUrl && new URL(p.avatarUrl, request.url).href,
    publicUrl: p.username ? publicUrl(request, p.username) : null,
  });
}
