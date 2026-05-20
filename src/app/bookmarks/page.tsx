"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useUserStore } from "@/stores/userStore";
import type { BookmarkSortBy, BookmarkFilter, Bookmark } from "@/types/bookmark";

const difficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "text-green-600";
    case "Medium":
      return "text-yellow-600";
    case "Hard":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const difficultyBg = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-50";
    case "Medium":
      return "bg-yellow-50";
    case "Hard":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

export default function BookmarksPage() {
  const { bookmarks } = useUserStore();
  const [sortBy, setSortBy] = useState<BookmarkSortBy>("date");
  const [filter, setFilter] = useState<BookmarkFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookmarks = useMemo(() => {
    let filtered: Bookmark[] = bookmarks;

    // Apply filter
    if (filter === "easy") {
      filtered = filtered.filter((b) => b.difficulty === "Easy");
    } else if (filter === "medium") {
      filtered = filtered.filter((b) => b.difficulty === "Medium");
    } else if (filter === "hard") {
      filtered = filtered.filter((b) => b.difficulty === "Hard");
    } else if (filter === "solved") {
      filtered = filtered.filter((b) => b.isSolved);
    } else if (filter === "unsolved") {
      filtered = filtered.filter((b) => !b.isSolved);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.problemSlug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sort
    if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.bookmarkedAt).getTime() -
          new Date(a.bookmarkedAt).getTime()
      );
    } else if (sortBy === "difficulty") {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      filtered.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [bookmarks, sortBy, filter, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="text-lg font-bold text-gray-900">
              Guru
            </Link>
            <span className="text-sm text-gray-600">Bookmarks</span>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap gap-2">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as BookmarkFilter)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-colors"
              >
                <option value="all">All</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BookmarkSortBy)}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition-colors"
              >
                <option value="date">Recently Bookmarked</option>
                <option value="difficulty">By Difficulty</option>
                <option value="title">By Title</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No bookmarks found</p>
            <Link
              href="/problems"
              className="text-sm text-blue-600 hover:underline"
            >
              Browse problems to add bookmarks
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.problemSlug}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/problems/${bookmark.problemSlug}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                    >
                      {bookmark.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Bookmarked{" "}
                      {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${difficultyBg(
                        bookmark.difficulty
                      )} ${difficultyColor(bookmark.difficulty)}`}
                    >
                      {bookmark.difficulty}
                    </span>

                    {bookmark.isSolved && (
                      <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 font-medium">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                </div>

                {bookmark.topics && bookmark.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bookmark.topics.slice(0, 3).map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                    {bookmark.topics.length > 3 && (
                      <span className="text-xs px-2 py-0.5 text-gray-600">
                        +{bookmark.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
