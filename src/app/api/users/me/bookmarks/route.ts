import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";
import type { Bookmark } from "@/types/bookmark";
import { Prisma } from "@prisma/client";

/**
 * GET /api/users/me/bookmarks
 * List user bookmarks with optional filters
 * Query params: difficulty, solved, search
 */
export async function GET(request: Request) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);

    const difficulty = searchParams.get("difficulty");
    const solved = searchParams.get("solved") === "true";
    const search = searchParams.get("search");

    const dbBookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        ...(difficulty && { difficulty }),
        ...(solved && { isSolved: true }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { problemSlug: { contains: search } },
          ],
        }),
      },
      orderBy: { bookmarkedAt: "desc" },
    });

    const bookmarks: Bookmark[] = dbBookmarks.map((b) => {
      let topics: string[] = [];
      if (b.topics) {
        try {
          topics = JSON.parse(b.topics);
        } catch {
          topics = [];
        }
      }
      return {
        id: b.id,
        problemSlug: b.problemSlug,
        title: b.title,
        difficulty: b.difficulty as "Easy" | "Medium" | "Hard",
        topics,
        bookmarkedAt: b.bookmarkedAt.toISOString(),
        isSolved: b.isSolved,
      };
    });

    return apiResponse({ bookmarks, total: bookmarks.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    console.error("Error fetching bookmarks:", error);
    return apiError("Failed to fetch bookmarks", 500);
  }
}

/**
 * POST /api/users/me/bookmarks
 * Add a new bookmark
 */
export async function POST(request: Request) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    // Validate input
    if (!body.problemSlug || !body.title || !body.difficulty) {
      return apiError("Missing required fields", 400);
    }

    const dbBookmark = await prisma.bookmark.create({
      data: {
        userId,
        problemSlug: body.problemSlug,
        title: body.title,
        difficulty: body.difficulty,
        topics: body.topics ? JSON.stringify(body.topics) : null,
        bookmarkedAt: new Date(),
        isSolved: body.isSolved || false,
      },
    });

    let topics: string[] = [];
    if (dbBookmark.topics) {
      try {
        topics = JSON.parse(dbBookmark.topics);
      } catch {
        topics = [];
      }
    }

    const bookmark: Bookmark = {
      id: dbBookmark.id,
      problemSlug: dbBookmark.problemSlug,
      title: dbBookmark.title,
      difficulty: dbBookmark.difficulty as "Easy" | "Medium" | "Hard",
      topics,
      bookmarkedAt: dbBookmark.bookmarkedAt.toISOString(),
      isSolved: dbBookmark.isSolved,
    };

    return apiResponse(bookmark, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Bookmark already exists for this problem", 409);
    }
    console.error("Error creating bookmark:", error);
    return apiError("Failed to create bookmark", 500);
  }
}
