import { requireAuth, apiError, apiResponse, canAccessRoom } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });

    if (!room) {
      return apiError("Room not found", 404);
    }

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

    return apiResponse({
      id: room.id,
      title: room.title,
      problemSlug: room.problemSlug,
      language: room.language,
      accessLevel: room.accessLevel,
      creatorId: room.creatorId,
      participants: room.participants.map((p) => ({
        userId: p.userId,
        role: p.role,
        joinedAt: p.joinedAt.toISOString(),
      })),
      createdAt: room.createdAt.toISOString(),
      isActive: room.isActive,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
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

    // Verify user is creator
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return apiError("Room not found", 404);
    }

    if (room.creatorId !== userId) {
      return apiError("Only room creator can update", 403);
    }

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.accessLevel && { accessLevel: body.accessLevel }),
      },
    });

    return apiResponse({
      id: updated.id,
      title: updated.title,
      accessLevel: updated.accessLevel,
      message: "Room updated",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Room not found", 404);
    }
    console.error("Error updating room:", error);
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

    // Verify user is creator
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return apiError("Room not found", 404);
    }

    if (room.creatorId !== userId) {
      return apiError("Only room creator can delete", 403);
    }

    await prisma.room.delete({
      where: { id: roomId },
    });

    return apiResponse({ message: "Room deleted", roomId });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("Room not found", 404);
    }
    console.error("Error deleting room:", error);
    return apiError("Failed to delete room", 500);
  }
}
