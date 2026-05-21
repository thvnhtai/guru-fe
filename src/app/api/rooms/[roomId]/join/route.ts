import { requireAuth, apiError, apiResponse, canAccessRoom } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    // Get room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });

    if (!room) {
      return apiError("Room not found", 404);
    }

    // Check access level
    const isCreator = userId === room.creatorId;
    const isAlreadyParticipant = room.participants.some((p) => p.userId === userId);
    const canAccess = canAccessRoom(
      room.accessLevel as "PUBLIC" | "INVITE" | "PRIVATE",
      isCreator,
      isAlreadyParticipant
    );

    if (!canAccess) {
      return apiError("Access denied to this room", 403);
    }

    // Add user to participants if not already there (upsert)
    const participant = await prisma.roomParticipant.upsert({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
      update: {
        joinedAt: new Date(),
      },
      create: {
        roomId,
        userId,
        role: isCreator ? "creator" : "participant",
        joinedAt: new Date(),
      },
    });

    return apiResponse({
      message: "Successfully joined room",
      roomId,
      userId,
      joinedAt: participant.joinedAt.toISOString(),
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
    console.error("Error joining room:", error);
    return apiError("Failed to join room", 500);
  }
}
