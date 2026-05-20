import { cookies } from "next/headers";
import type { User } from "@/types/auth";

/**
 * Extract and verify JWT token from cookies
 * Decodes the token without validation (for development)
 * In production, should validate signature against backend public key
 */
export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Decode JWT payload (basic decoding without verification)
 * In production, always verify the signature!
 */
function decodeJWT<T>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract userId from JWT token in cookies
 * Used by all protected API routes
 */
export async function extractUserIdFromToken(): Promise<string | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;

  const payload = decodeJWT<{ sub?: string; id?: string }>(token);
  return payload?.sub || payload?.id || null;
}

/**
 * Middleware helper for protected endpoints
 * Returns userId if authenticated, throws 401 if not
 */
export async function requireAuth(): Promise<string> {
  const userId = await extractUserIdFromToken();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Response helpers
 */
export function apiResponse<T>(data: T, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function apiError(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Permission checker for room access
 */
export function canAccessRoom(
  roomAccessLevel: "PUBLIC" | "INVITE" | "PRIVATE",
  isCreator: boolean,
  isParticipant: boolean
): boolean {
  if (isCreator) return true;
  if (roomAccessLevel === "PRIVATE") return false;
  if (roomAccessLevel === "INVITE") return isParticipant;
  return true; // PUBLIC
}
