import { NextRequest, NextResponse } from "next/server";
import type { RoomMeta, RoomAccessResponse } from "@/types/room";

/**
 * POST /api/rooms
 * Create a new room with metadata
 *
 * This is a mock implementation. In production, this would:
 * - Validate authentication
 * - Store room metadata in database
 * - Associate with user account if authenticated
 */
export async function POST(request: NextRequest) {
  try {
    const { roomId, accessLevel = "PUBLIC", problemSlug, title } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: "roomId required" }, { status: 400 });
    }

    // Get auth info from headers/cookies
    const authHeader = request.headers.get("authorization");
    const userId = authHeader ? authHeader.split(" ")[1] : null;

    // Create room metadata
    const roomMeta: RoomMeta = {
      id: roomId,
      creatorId: userId || null, // null for anonymous rooms
      createdAt: new Date().toISOString(),
      accessLevel,
      title,
      participantIds: userId ? [userId] : [],
    };

    // Store in session storage (mock - in production this goes to database)
    // For now, we'll just return the metadata
    return NextResponse.json(roomMeta, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rooms
 * Validate room access and return metadata
 * Supports: ?roomId=X for normal access or ?roomId=X&token=Y for observer access
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get("roomId");
    const observerToken = searchParams.get("token");

    if (!roomId) {
      return NextResponse.json(
        { error: "roomId required" },
        { status: 400 }
      );
    }

    // Get user session info
    const userSession = request.cookies.get("user-session")?.value;
    const authHeader = request.headers.get("authorization");
    const userId = authHeader ? authHeader.split(" ")[1] : null;

    // Get room access level from request
    const accessLevel = searchParams.get("accessLevel") || "PUBLIC";

    // If observer token provided, validate it (mock: always valid for now)
    // In production, this would check token expiry, room association, etc.
    if (observerToken) {
      const roomMeta: RoomMeta = {
        id: roomId,
        creatorId: null,
        createdAt: new Date().toISOString(),
        accessLevel: accessLevel as "PUBLIC" | "INVITE" | "PRIVATE",
        participantIds: userSession ? [userSession] : [],
      };

      const response: RoomAccessResponse = {
        granted: true,
        meta: roomMeta,
      };
      return NextResponse.json(response);
    }

    // Mock: For now, allow all access to PUBLIC rooms, require auth for PRIVATE
    // In production, this would query database and enforce access rules
    if (accessLevel === "PRIVATE" && !userId) {
      const response: RoomAccessResponse = {
        granted: false,
        reason: "Authentication required for private rooms",
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Create mock room metadata
    const roomMeta: RoomMeta = {
      id: roomId,
      creatorId: null, // Would come from database
      createdAt: new Date().toISOString(),
      accessLevel: accessLevel as "PUBLIC" | "INVITE" | "PRIVATE",
      participantIds: userSession ? [userSession] : [],
    };

    const response: RoomAccessResponse = {
      granted: true,
      meta: roomMeta,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to get room" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rooms/[roomId]/access
 * Update room access level (creator only)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get("roomId");
    const { accessLevel } = await request.json();

    if (!roomId || !accessLevel) {
      return NextResponse.json(
        { error: "roomId and accessLevel required" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    const userId = authHeader ? authHeader.split(" ")[1] : null;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // In production, verify user is room creator before allowing update
    // For now, just return success

    const roomMeta: RoomMeta = {
      id: roomId,
      creatorId: userId,
      createdAt: new Date().toISOString(),
      accessLevel,
      participantIds: [userId],
    };

    return NextResponse.json(roomMeta);
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
