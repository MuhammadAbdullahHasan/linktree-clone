import { apiAdmin, createManaged, listManaged } from "@/lib/admin";
import { body, error, json, publicUrl, unauthorized } from "../_http";

export async function GET(request: Request) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  const list = await listManaged(admin.adminId);
  return json(list.map((p) => ({
    ...p,
    avatarUrl: p.avatarUrl && new URL(p.avatarUrl, request.url).href,
    publicUrl: publicUrl(request, p.username),
  })));
}

export async function POST(request: Request) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  const input = await body(request);
  if (!input) return error("Send JSON: { username, displayName }", 400);
  const res = await createManaged(admin.adminId, input);
  if (!res.ok) return error(res.error, res.status);
  return json({ id: res.data.id, username: res.data.username, publicUrl: publicUrl(request, res.data.username) }, 201);
}
