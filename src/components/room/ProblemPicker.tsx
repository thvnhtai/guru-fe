"use client";

import { useState, useEffect, useRef } from "react";
import { fetchProblems } from "@/lib/api/leetcode";
import type { ProblemSummary, Difficulty } from "@/types/problem";

interface Props {
  onSelect: (slug: string) => void;
  onClose: () => void;
}

const DIFFICULTIES: Array<Difficulty | ""> = ["", "Easy", "Medium", "Hard"];

export function ProblemPicker({ onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProblems({ limit: 50, skip: 0, difficulty: difficulty || undefined })
      .then((data) => {
        if (!cancelled) setProblems(data.problemsetQuestionList);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load problems.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [difficulty]);

  const filtered = search.trim()
    ? problems.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.questionFrontendId.includes(search)
      )
    : problems;

  const difficultyColor = (d: Difficulty) =>
    d === "Easy" ? "text-green-600" : d === "Medium" ? "text-yellow-600" : "text-red-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-sm text-black">Load a problem</span>
          <button
            onClick={onClose}
            className="text-[#333333] hover:text-black text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 py-2 border-b border-gray-100">
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm rounded-lg border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty | "")}
            className="text-sm rounded-lg border border-gray-200 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d || "All"}
              </option>
            ))}
          </select>
        </div>

        {/* Problem list */}
        <div className="overflow-y-auto flex-1">
          {loading && (
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <p className="p-4 text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="p-4 text-sm text-[#333333]">No problems found.</p>
          )}

          {!loading &&
            !error &&
            filtered.map((p) => (
              <button
                key={p.titleSlug}
                onClick={() => {
                  onSelect(p.titleSlug);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="text-xs text-[#333333] w-8 shrink-0">
                  {p.questionFrontendId}.
                </span>
                <span className="flex-1 text-sm text-black truncate">{p.title}</span>
                <span className={`text-xs font-medium shrink-0 ${difficultyColor(p.difficulty)}`}>
                  {p.difficulty}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
