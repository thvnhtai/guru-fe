import { useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import type { Bookmark } from "@/types/bookmark";
import type { Difficulty } from "@/types/problem";

/**
 * Hook to manage problem bookmarks
 */
export function useBookmark(problemSlug: string, problemTitle: string, difficulty: Difficulty, topics: string[]) {
  const { addBookmarkAsync, removeBookmarkAsync, bookmarks, isLoadingBookmarks } = useUserStore();

  const bookmarked = bookmarks.some((b) => b.problemSlug === problemSlug);

  const toggleBookmarkAsync = useCallback(async () => {
    if (bookmarked) {
      await removeBookmarkAsync(problemSlug);
    } else {
      const bookmark: Omit<Bookmark, "id"> = {
        problemSlug,
        title: problemTitle,
        difficulty,
        topics,
        bookmarkedAt: new Date().toISOString(),
        isSolved: false,
      };
      await addBookmarkAsync(bookmark);
    }
  }, [bookmarked, problemSlug, problemTitle, difficulty, topics, addBookmarkAsync, removeBookmarkAsync]);

  return { bookmarked, toggleBookmarkAsync, isLoading: isLoadingBookmarks };
}
