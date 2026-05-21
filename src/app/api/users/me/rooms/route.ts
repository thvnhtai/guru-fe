import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import type { Room } from "@/types/room";

/**
 * GET /api/users/me/rooms
 * Get user's rooms (created and joined)
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const rooms = await prisma.room.findMany({
      where: {
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
      },
      include: { participants: true },
      orderBy: { createdAt: "desc" },
    });

    const response: Room[] = rooms.map((r) => ({
      id: r.id,
      name: r.title || "Untitled Room",
      createdAt: r.createdAt.toISOString(),
      problemSlug: r.problemSlug || null,
      language: r.language as any,
      participants: r.participants.map((p) => ({
        sessionId: p.id,
        name: p.userId,
        color: "#000000",
        joinedAt: p.joinedAt.toISOString(),
        isOnline: false,
      })),
    }));

    return apiResponse({ rooms: response, total: response.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error fetching rooms:", error);
    return apiError("Failed to fetch rooms", 500);
  }
}
