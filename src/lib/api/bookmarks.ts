import type { Bookmark } from "@/types/bookmark";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Fetch user's bookmarks with optional filters
 */
export async function getBookmarks(
  difficulty?: string,
  solved?: boolean,
  search?: string
): Promise<Bookmark[]> {
  try {
    const params = new URLSearchParams();
    if (difficulty) params.append("difficulty", difficulty);
    if (solved !== undefined) params.append("solved", String(solved));
    if (search) params.append("search", search);

    const response = await fetch(
      `/api/users/me/bookmarks?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bookmarks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bookmarks || [];
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
}

/**
 * Create a new bookmark
 */
export async function createBookmark(
  bookmark: Omit<Bookmark, "id">
): Promise<Bookmark> {
  try {
    const response = await fetch("/api/users/me/bookmarks", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookmark),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bookmark: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating bookmark:", error);
    throw error;
  }
}

/**
 * Delete a bookmark by problem slug
 */
export async function deleteBookmark(problemSlug: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/users/me/bookmarks/${encodeURIComponent(problemSlug)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete bookmark: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    throw error;
  }
}

/**
 * Update a bookmark (solved status, notes)
 */
export async function updateBookmark(
  problemSlug: string,
  updates: { isSolved?: boolean; notes?: string }
): Promise<Bookmark> {
  try {
    const response = await fetch(
      `/api/users/me/bookmarks/${encodeURIComponent(problemSlug)}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update bookmark: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating bookmark:", error);
    throw error;
  }
}
