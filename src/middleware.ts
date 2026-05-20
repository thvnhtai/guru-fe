import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect room routes
  if (pathname.startsWith("/room/")) {
    // Check for existing session (either auth token or anonymous session)
    const authToken = request.cookies.get("auth-token");
    const userSession = request.cookies.get("user-session");

    // If user has neither, generate anonymous session
    if (!authToken && !userSession) {
      const response = NextResponse.next();

      // Generate anonymous session ID
      const sessionId = crypto.getRandomValues(new Uint8Array(16))
        .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");

      response.cookies.set("user-session", sessionId, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    }

    // If user already has a session, allow them to proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/room/:path*"],
};
