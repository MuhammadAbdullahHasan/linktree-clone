import { apiAdmin, isManagedBy, mintHandoff } from "@/lib/admin";
import { error, json, unauthorized } from "../../../_http";

/** A one-time link, valid for 2 minutes, that opens this profile's dashboard in a browser. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  const { id } = await params;
  if (!(await isManagedBy(admin.adminId, id))) return error("No such profile", 404);
  const { token, expiresAt } = await mintHandoff(admin.adminId, id);
  const url = new URL("/api/admin/handoff", request.url);
  url.searchParams.set("token", token);
  return json({ url: url.href, expiresAt: expiresAt.toISOString() }, 201);
}
