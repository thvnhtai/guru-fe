import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";
import type { Bookmark } from "@/types/bookmark";

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

    // TODO: Replace with Prisma query
    // let bookmarks = await prisma.bookmark.findMany({
    //   where: { userId },
    // });

    // Mock bookmarks
    let bookmarks: Bookmark[] = [
      {
        id: "1",
        problemSlug: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        topics: ["array", "hash-table"],
        bookmarkedAt: new Date().toISOString(),
        isSolved: true,
      },
      {
        id: "2",
        problemSlug: "binary-tree-level-order-traversal",
        title: "Binary Tree Level Order Traversal",
        difficulty: "Medium",
        topics: ["tree", "bfs"],
        bookmarkedAt: new Date().toISOString(),
        isSolved: false,
      },
    ];

    // Apply filters
    if (difficulty) {
      bookmarks = bookmarks.filter((b) => b.difficulty === difficulty);
    }
    if (solved !== undefined) {
      bookmarks = bookmarks.filter((b) => b.isSolved === solved);
    }
    if (search) {
      bookmarks = bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.problemSlug.toLowerCase().includes(search.toLowerCase())
      );
    }

    return apiResponse({ bookmarks, total: bookmarks.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
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

    // TODO: Replace with Prisma create
    // const bookmark = await prisma.bookmark.create({
    //   data: {
    //     userId,
    //     problemSlug: body.problemSlug,
    //     title: body.title,
    //     difficulty: body.difficulty,
    //     topics: body.topics || [],
    //     bookmarkedAt: new Date(),
    //   },
    // });

    const bookmark: Bookmark = {
      id: Math.random().toString(),
      problemSlug: body.problemSlug,
      title: body.title,
      difficulty: body.difficulty,
      topics: body.topics || [],
      bookmarkedAt: new Date().toISOString(),
      isSolved: false,
    };

    return apiResponse(bookmark, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to create bookmark", 500);
  }
}
