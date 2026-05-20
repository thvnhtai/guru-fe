import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import type { User } from "@/types/auth";

/**
 * GET /api/users/me
 * Return authenticated user profile
 * In production: Query user from Prisma database
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    // TODO: Replace with Prisma query
    // const user = await prisma.user.findUnique({ where: { id: userId } });

    // Mock user response
    const user: User = {
      id: userId,
      email: `user-${userId}@example.com`,
      displayName: "User Name",
      createdAt: new Date().toISOString(),
    };

    return apiResponse(user);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to fetch user", 500);
  }
}

/**
 * PUT /api/users/me
 * Update user profile
 */
export async function PUT(request: Request) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    // TODO: Replace with Prisma update
    // const user = await prisma.user.update({
    //   where: { id: userId },
    //   data: { displayName: body.displayName },
    // });

    return apiResponse({
      id: userId,
      displayName: body.displayName,
      message: "Profile updated",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to update profile", 500);
  }
}
