/**
 * Bookmark types for saving favorite problems
 */

export interface Bookmark {
  id: string; // Problem slug
  problemSlug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  bookmarkedAt: string; // ISO timestamp
  notes?: string; // User notes about the problem
  isSolved?: boolean; // Whether user has solved this problem
}

export interface BookmarkCollection {
  bookmarks: Bookmark[];
  totalBookmarks: number;
}

export type BookmarkSortBy = "date" | "difficulty" | "title";
export type BookmarkFilter = "all" | "solved" | "unsolved" | "easy" | "medium" | "hard";
