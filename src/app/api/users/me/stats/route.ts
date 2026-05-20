import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";

/**
 * GET /api/users/me/stats
 * Return user statistics aggregated from submissions
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    // TODO: Replace with Prisma aggregation
    // const stats = await prisma.sessionStats.findUnique({
    //   where: { userId },
    // });

    // Mock stats response
    const stats = {
      userId,
      problemsSolved: 42,
      languagesPracticed: ["python", "javascript", "java"],
      totalCollaborationTime: 3600, // seconds
      lastActivityAt: new Date().toISOString(),
      totalRooms: 15,
      successfulSubmissions: 89,
    };

    return apiResponse(stats);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to fetch stats", 500);
  }
}
