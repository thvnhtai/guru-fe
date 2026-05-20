import { requireAuth, apiError, apiResponse, canAccessRoom } from "@/lib/utils/auth";

/**
 * GET /api/rooms/[roomId]
 * Get room details and participant list
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    // Auth is optional - anonymous can view public rooms
    const userId = _request.headers.get("X-User-ID");

    const { roomId } = await params;

    // TODO: Replace with Prisma query
    // const room = await prisma.room.findUnique({
    //   where: { id: roomId },
    //   include: { participants: { include: { user: true } } },
    // });

    // Mock room
    const room = {
      id: roomId,
      title: "Interview Prep",
      problemSlug: "merge-sorted-array",
      language: "python",
      accessLevel: "PUBLIC",
      creatorId: "creator-123",
      participants: [
        { userId: "user-1", role: "creator", joinedAt: new Date().toISOString() },
        { userId: "user-2", role: "participant", joinedAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Check access permissions
    const isCreator = userId === room.creatorId;
    const isParticipant = room.participants.some((p) => p.userId === userId);
    const canAccess = canAccessRoom(
      room.accessLevel as "PUBLIC" | "INVITE" | "PRIVATE",
      isCreator,
      isParticipant
    );

    if (!canAccess) {
      return apiError("Access denied to this room", 403);
    }

    return apiResponse(room);
  } catch (error) {
    return apiError("Failed to fetch room", 500);
  }
}

/**
 * PUT /api/rooms/[roomId]
 * Update room metadata (creator only)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { roomId } = await params;
    const body = await request.json();

    // TODO: Replace with Prisma update
    // Verify user is creator before allowing update

    return apiResponse({
      id: roomId,
      message: "Room updated",
      ...body,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to update room", 500);
  }
}

/**
 * DELETE /api/rooms/[roomId]
 * Delete room (creator only)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { roomId } = await params;

    // TODO: Verify user is creator, then delete

    return apiResponse({ message: "Room deleted", roomId });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to delete room", 500);
  }
}
