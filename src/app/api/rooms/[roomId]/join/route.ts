import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";

/**
 * POST /api/rooms/[roomId]/join
 * Join a room (validates access level)
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { roomId } = await params;

    // TODO: Replace with Prisma operations
    // 1. Get room
    // 2. Check access level
    // 3. Add user to participants if not already there

    return apiResponse({
      message: "Successfully joined room",
      roomId,
      userId,
      joinedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to join room", 500);
  }
}
