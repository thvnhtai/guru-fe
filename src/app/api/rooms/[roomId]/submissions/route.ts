import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";

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

    // TODO: Replace with Prisma create
    // const submission = await prisma.submission.create({
    //   data: {
    //     roomId,
    //     userId,
    //     code: body.code,
    //     language: body.language,
    //     status: body.status,
    //     testResults: body.testResults,
    //   },
    // });

    const submission = {
      id: `sub-${Date.now()}`,
      roomId,
      userId,
      code: body.code,
      language: body.language,
      status: body.status,
      totalTests: body.totalTests || 0,
      passedTests: body.passedTests || 0,
      testResults: body.testResults,
      timestamp: new Date().toISOString(),
    };

    return apiResponse(submission, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
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

    // TODO: Replace with Prisma query
    // const submissions = await prisma.submission.findMany({
    //   where: { roomId },
    //   orderBy: { timestamp: "desc" },
    // });

    const submissions = [
      {
        id: "sub-1",
        roomId,
        userId: "user-1",
        code: "print('hello')",
        language: "python",
        status: "success",
        totalTests: 5,
        passedTests: 5,
        timestamp: new Date().toISOString(),
      },
    ];

    return apiResponse({ submissions, total: submissions.length });
  } catch (error) {
    return apiError("Failed to fetch submissions", 500);
  }
}
