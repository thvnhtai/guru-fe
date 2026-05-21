"use client";

import Link from "next/link";
import { useBookmark } from "@/lib/hooks/useBookmark";
import type { ProblemSummary } from "@/types/problem";

const DIFFICULTY_STYLES = {
  Easy: "text-green-500",
  Medium: "text-yellow-500",
  Hard: "text-red-500",
} as const;

interface Props {
  problem: ProblemSummary;
}

export function ProblemCard({ problem }: Props) {
  const { bookmarked, toggleBookmarkAsync, isLoading } = useBookmark(
    problem.titleSlug,
    problem.title,
    problem.difficulty,
    problem.topicTags.map((tag) => tag.name)
  );

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleBookmarkAsync();
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // Error is handled in the store; could show toast here
    }
  };

  return (
    <Link
      href={`/problems/${problem.titleSlug}`}
      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm text-[#333333] w-10 shrink-0">
          {problem.questionFrontendId}
        </span>
        <span className="font-medium text-black truncate">
          {problem.title}
        </span>
        {problem.isPaidOnly && (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded shrink-0">
            Premium
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-4">
        <div className="hidden sm:flex flex-wrap gap-1 max-w-48">
          {problem.topicTags.slice(0, 2).map((tag) => (
            <span
              key={tag.slug}
              className="text-xs bg-gray-100 text-[#333333] px-2 py-0.5 rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <span
          className={`text-sm font-medium w-16 text-right ${DIFFICULTY_STYLES[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
        <span className="text-xs text-[#333333] w-12 text-right hidden md:block">
          {problem.acRate.toFixed(1)}%
        </span>
        <button
          onClick={handleBookmarkClick}
          disabled={isLoading}
          className={`p-1.5 rounded transition-colors shrink-0 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
          title={bookmarked ? "Remove bookmark" : "Bookmark problem"}
        >
          <span className={`text-lg inline-block ${isLoading ? "animate-pulse" : ""}`}>
            {bookmarked ? "⭐" : "☆"}
          </span>
        </button>
      </div>
    </Link>
  );
}
