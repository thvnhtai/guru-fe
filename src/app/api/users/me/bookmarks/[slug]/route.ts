import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import type { Bookmark } from "@/types/bookmark";
import { Prisma } from "@prisma/client";

/**
 * DELETE /api/users/me/bookmarks/[slug]
 * Remove a bookmark by problem slug
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireAuth();
    const { slug } = await params;

    const result = await prisma.bookmark.deleteMany({
      where: { userId, problemSlug: slug },
    });

    if (result.count === 0) {
      return apiError("Bookmark not found", 404);
    }

    return apiResponse({ message: "Bookmark removed", slug });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error deleting bookmark:", error);
    return apiError("Failed to delete bookmark", 500);
  }
}

/**
 * PUT /api/users/me/bookmarks/[slug]
 * Update bookmark (solved status, notes)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireAuth();
    const { slug } = await params;
    const body = await request.json();

    const result = await prisma.bookmark.updateMany({
      where: { userId, problemSlug: slug },
      data: {
        ...(body.isSolved !== undefined && { isSolved: body.isSolved }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });

    if (result.count === 0) {
      return apiError("Bookmark not found", 404);
    }

    // Fetch and return the updated bookmark
    const bookmark = await prisma.bookmark.findFirst({
      where: { userId, problemSlug: slug },
    });

    if (!bookmark) {
      return apiError("Bookmark not found", 404);
    }

    let topics: string[] = [];
    if (bookmark.topics) {
      try {
        topics = JSON.parse(bookmark.topics);
      } catch {
        topics = [];
      }
    }

    const response: Bookmark = {
      id: bookmark.id,
      problemSlug: bookmark.problemSlug,
      title: bookmark.title,
      difficulty: bookmark.difficulty as "Easy" | "Medium" | "Hard",
      topics,
      bookmarkedAt: bookmark.bookmarkedAt.toISOString(),
      isSolved: bookmark.isSolved,
    };

    return apiResponse(response);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error updating bookmark:", error);
    return apiError("Failed to update bookmark", 500);
  }
}
