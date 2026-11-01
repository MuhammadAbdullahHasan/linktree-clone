"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createManaged, currentAdminId, deleteManaged, isManagedBy } from "@/lib/admin";
import { setActingAs } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

async function requireAdmin() {
  const adminId = await currentAdminId();
  if (!adminId) throw new Error("Not allowed");
  return adminId;
}

export async function createProfile(input: { username: string; displayName: string }): Promise<ActionResult<string>> {
  const res = await createManaged(await requireAdmin(), input);
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/dashboard/profiles");
  return { ok: true, data: res.data.id };
}

export async function deleteProfile(id: string): Promise<ActionResult> {
  if (!(await deleteManaged(await requireAdmin(), id))) return { ok: false, error: "That profile is already gone" };
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: null };
}

/** Switches the dashboard to a managed profile, or back to the admin's own one (null). */
export async function switchProfile(id: string | null) {
  const adminId = await requireAdmin();
  if (id && !(await isManagedBy(adminId, id))) throw new Error("Not allowed");
  await setActingAs(id);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
