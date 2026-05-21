import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users/me/stats
 * Return user statistics aggregated from submissions
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const stats = await prisma.sessionStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      // Return empty stats if no stats record exists yet
      return apiResponse({
        userId,
        problemsSolved: 0,
        languagesPracticed: [],
        totalCollaborationTime: 0,
        lastActivityAt: new Date().toISOString(),
      });
    }

    return apiResponse({
      userId: stats.userId,
      problemsSolved: stats.problemsSolved,
      languagesPracticed: Array.isArray(stats.languagesPracticed) ? stats.languagesPracticed : [],
      totalCollaborationTime: stats.totalCollaborationTime,
      lastActivityAt: stats.lastActivityAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error fetching stats:", error);
    return apiError("Failed to fetch stats", 500);
  }
}
