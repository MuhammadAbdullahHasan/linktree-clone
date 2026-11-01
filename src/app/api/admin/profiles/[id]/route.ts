import { apiAdmin, deleteManaged } from "@/lib/admin";
import { error, unauthorized } from "../../_http";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiAdmin(request);
  if (!admin) return unauthorized();
  const { id } = await params;
  if (!(await deleteManaged(admin.adminId, id))) return error("No such profile", 404);
  return new Response(null, { status: 204 });
}
