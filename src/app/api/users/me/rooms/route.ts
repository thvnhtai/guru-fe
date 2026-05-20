import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";

/**
 * GET /api/users/me/rooms
 * Get user's rooms (created and joined)
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    // TODO: Replace with Prisma query
    // const rooms = await prisma.room.findMany({
    //   where: {
    //     OR: [
    //       { creatorId: userId },
    //       { participants: { some: { userId } } },
    //     ],
    //   },
    //   include: { participants: true },
    // });

    // Mock rooms
    const rooms = [
      {
        id: "room-123",
        creatorId: userId,
        title: "LeetCode Mock Interview",
        problemSlug: "two-sum",
        language: "python",
        accessLevel: "PUBLIC",
        isActive: true,
        isArchived: false,
        createdAt: new Date().toISOString(),
        participants: 2,
        lastActivity: new Date().toISOString(),
      },
    ];

    return apiResponse({ rooms, total: rooms.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to fetch rooms", 500);
  }
}
