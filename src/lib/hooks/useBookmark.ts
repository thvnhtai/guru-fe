import { useCallback } from "react";
import { useUserStore } from "@/stores/userStore";
import type { Bookmark } from "@/types/bookmark";
import type { Difficulty } from "@/types/problem";

/**
 * Hook to manage problem bookmarks
 */
export function useBookmark(problemSlug: string, problemTitle: string, difficulty: Difficulty, topics: string[]) {
  const { addBookmark, removeBookmark, bookmarks } = useUserStore();

  const bookmarked = bookmarks.some((b) => b.problemSlug === problemSlug);

  const toggleBookmark = useCallback(() => {
    if (bookmarked) {
      removeBookmark(problemSlug);
    } else {
      const bookmark: Bookmark = {
        id: problemSlug,
        problemSlug,
        title: problemTitle,
        difficulty,
        topics,
        bookmarkedAt: new Date().toISOString(),
        isSolved: false,
      };
      addBookmark(bookmark);
    }
  }, [bookmarked, problemSlug, problemTitle, difficulty, topics, addBookmark, removeBookmark]);

  return { bookmarked, toggleBookmark };
}
