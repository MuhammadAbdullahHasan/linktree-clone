import { NextResponse } from "next/server";

// Shared by the Control Room API routes. Nothing here is cached, and errors are { error }.

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "cache-control": "no-store" } });
}

export function error(message: string, status: number) {
  return json({ error: message }, status);
}

export const unauthorized = () => error("Missing or invalid token", 401);

export async function body(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

export const publicUrl = (request: Request, username: string) => `${new URL(request.url).origin}/${username}`;
