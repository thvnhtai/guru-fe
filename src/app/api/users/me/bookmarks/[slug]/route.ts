import { requireAuth, apiError, apiResponse } from "@/lib/utils/auth";

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

    // TODO: Replace with Prisma delete
    // await prisma.bookmark.deleteMany({
    //   where: { userId, problemSlug: slug },
    // });

    return apiResponse({ message: "Bookmark removed", slug });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
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

    // TODO: Replace with Prisma update
    // const bookmark = await prisma.bookmark.updateMany({
    //   where: { userId, problemSlug: slug },
    //   data: { isSolved: body.isSolved, notes: body.notes },
    // });

    return apiResponse({
      message: "Bookmark updated",
      slug,
      isSolved: body.isSolved,
      notes: body.notes,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Unauthorized", 401);
    }
    return apiError("Failed to update bookmark", 500);
  }
}
