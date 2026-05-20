"use client";

import { useState, useEffect, useCallback } from "react";
import { ProblemCard } from "@/components/problem/ProblemCard";
import { ProblemFilters, type FilterState } from "@/components/problem/ProblemFilters";
import { fetchProblems } from "@/lib/api/leetcode";
import type { ProblemSummary } from "@/types/problem";

const PAGE_SIZE = 25;

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: null,
    search: "",
  });

  const load = useCallback(
    async (newSkip: number, currentFilters: FilterState) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchProblems({
          limit: PAGE_SIZE,
          skip: newSkip,
          difficulty: currentFilters.difficulty ?? undefined,
        });
        setProblems(result.problemsetQuestionList);
        setTotalQuestions(result.totalQuestions);
        setSkip(newSkip);
      } catch {
        setError("Failed to load problems. Make sure the LeetCode API is running.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void load(0, filters);
  }, [filters, load]);

  const filtered = filters.search
    ? problems.filter((p) =>
        p.title.toLowerCase().includes(filters.search.toLowerCase())
      )
    : problems;

  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE);
  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-black">Problems</h1>
        <span className="text-sm text-[#333333]">{totalQuestions} problems</span>
      </div>

      <ProblemFilters
        filters={filters}
        onChange={(f) => {
          setFilters(f);
        }}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-center text-[#333333] py-8">No problems found.</p>
          ) : (
            filtered.map((p) => <ProblemCard key={p.titleSlug} problem={p} />)
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => void load(skip - PAGE_SIZE, filters)}
            disabled={skip === 0}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-[#333333]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => void load(skip + PAGE_SIZE, filters)}
            disabled={skip + PAGE_SIZE >= totalQuestions}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
