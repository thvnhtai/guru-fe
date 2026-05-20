/**
 * Generates a URL-safe room ID (e.g. "abc-def-ghi")
 */
export function generateRoomId(): string {
  const segments = Array.from({ length: 3 }, () =>
    Math.random().toString(36).slice(2, 5)
  );
  return segments.join("-");
}

export function buildRoomUrl(roomId: string): string {
  if (typeof window === "undefined") return `/room/${roomId}`;
  return `${window.location.origin}/room/${roomId}`;
}

/**
 * Generates a cryptographically random observer token
 * Tokens are used to provide time-limited or one-time access to observe a room
 */
export function generateObserverToken(): string {
  if (typeof window === "undefined") {
    // Server-side fallback using crypto module
    return require("crypto").randomUUID?.() || Math.random().toString(36).slice(2);
  }
  // Client-side: use Web Crypto API
  return crypto.randomUUID?.() ||
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
}

/**
 * Generates an observer link for a room with an access token
 * Observer mode allows users to watch but not edit the code
 */
export function generateObserverLink(roomId: string, token: string): string {
  const baseUrl = buildRoomUrl(roomId);
  return `${baseUrl}?observer=${encodeURIComponent(token)}`;
}
