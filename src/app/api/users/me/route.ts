import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@/types/auth";
import { Prisma } from "@prisma/client";

/**
 * GET /api/users/me
 * Return authenticated user profile
 */
export async function GET() {
  try {
    const userId = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    const response: User = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    return apiResponse(response);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error fetching user:", error);
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

    if (!body.displayName || typeof body.displayName !== "string") {
      return apiError("displayName is required and must be a string", 400);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { displayName: body.displayName },
    });

    const response: User = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    return apiResponse(response);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return apiError("User not found", 404);
    }
    console.error("Error updating user:", error);
    return apiError("Failed to update profile", 500);
  }
}
