import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/rooms/[roomId]/submissions
 * Record a submission (with user context)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const userId = await requireAuth();
    const { roomId } = await params;
    const body = await request.json();

    if (!body.code || !body.language) {
      return apiError("code and language are required", 400);
    }

    const submission = await prisma.submission.create({
      data: {
        roomId,
        userId,
        code: body.code,
        language: body.language,
        status: body.status || "pending",
        testResults: body.testResults || [],
        totalTests: body.totalTests || 0,
        passedTests: body.passedTests || 0,
        executionTime: body.executionTime,
        memory: body.memory,
        timestamp: new Date(),
      },
    });

    return apiResponse(
      {
        id: submission.id,
        roomId: submission.roomId,
        userId: submission.userId,
        code: submission.code,
        language: submission.language,
        status: submission.status,
        totalTests: submission.totalTests,
        passedTests: submission.passedTests,
        testResults: submission.testResults,
        timestamp: submission.timestamp.toISOString(),
      },
      201
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error recording submission:", error);
    return apiError("Failed to record submission", 500);
  }
}

/**
 * GET /api/rooms/[roomId]/submissions
 * Get room submission history
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const submissions = await prisma.submission.findMany({
      where: { roomId },
      orderBy: { timestamp: "desc" },
    });

    const response = submissions.map((s) => ({
      id: s.id,
      roomId: s.roomId,
      userId: s.userId,
      code: s.code,
      language: s.language,
      status: s.status,
      totalTests: s.totalTests,
      passedTests: s.passedTests,
      testResults: s.testResults,
      timestamp: s.timestamp.toISOString(),
    }));

    return apiResponse({ submissions: response, total: response.length });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return apiError("Failed to fetch submissions", 500);
  }
}
