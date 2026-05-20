"use client";

import Link from "next/link";
import { useUserStore } from "@/stores/userStore";

export function BookmarksWidget() {
  const { bookmarks } = useUserStore();

  if (bookmarks.length === 0) {
    return null;
  }

  const recentBookmarks = bookmarks.slice(0, 5);
  const solvedCount = bookmarks.filter((b) => b.isSolved).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">📌 Bookmarks</h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
          {bookmarks.length}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {recentBookmarks.map((bookmark) => (
          <Link
            key={bookmark.problemSlug}
            href={`/problems/${bookmark.problemSlug}`}
            className="block text-sm text-gray-600 hover:text-blue-600 truncate hover:underline"
            title={bookmark.title}
          >
            {bookmark.isSolved && <span className="text-green-600">✓ </span>}
            {bookmark.title}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{solvedCount} solved</span>
        {bookmarks.length > 5 && <span>+{bookmarks.length - 5} more</span>}
      </div>

      <Link
        href="/bookmarks"
        className="block text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1.5 hover:bg-blue-50 rounded transition-colors"
      >
        View all bookmarks
      </Link>
    </div>
  );
}
